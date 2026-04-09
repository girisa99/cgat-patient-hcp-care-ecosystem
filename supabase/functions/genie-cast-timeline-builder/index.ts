/**
 * GENIE CAST TIMELINE BUILDER
 *
 * Lightweight edge function that:
 * 1. Receives scene chapters, transitions, bookends, quality
 * 2. Builds rendering timeline SERVER-SIDE
 * 3. Validates no data: URIs (defense in depth)
 * 4. Logs payload size before forwarding
 * 5. Submits timeline to RunPod FFmpeg worker for rendering
 * 6. Creates/updates cast_generation_jobs row
 * 7. Returns { success, taskId, castJobId }
 *
 * Architecture rationale:
 * - Industry standard: Runway, Descript, CapCut render server-side
 * - Global reach: low-powered devices in 16 regions get consistent results
 * - Security: API keys stay server-side
 * - Edge distribution: Deno Deploy (34+ global regions)
 * - RunPod async /run returns immediately; client polls genie-cast-status
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function errorResponse(status: number, message: string) {
  return new Response(JSON.stringify({ success: false, message }), {
    status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// ─── Timeline Builder ────────────────────────────────────────────────────────
// Generic: works for any Cast project type (video, podcast, educational, UGC).
// Timeline format consumed by RunPod FFmpeg worker (cast-ffmpeg-renderer).

interface TtsEntry { url: string; start: number; duration: number; voice: string }
interface Chapter {
  chapterId: string;
  product?: string;
  title?: string;
  duration: number;
  allTtsUrls: TtsEntry[];
  visualUrls?: string[];
  visualUrl?: string;
  musicUrl?: string;
  musicLoop?: boolean;
  sfxUrls?: string[];
  backgroundUrl?: string;
  backgroundColor?: string;
}
interface Transition {
  from: string;
  to: string;
  style: string;
  duration: number;
  bridgeAudioUrl?: string;
  bridgeDuration?: number;
}
interface Bookends {
  opening: { duration: number; title?: string };
  closing: { duration: number; title?: string };
}

/** Map CastResolution pixel dimensions to FFmpeg resolution presets */
function mapResolution(userRes?: string, quality?: string): string {
  if (userRes) {
    const pixelMap: Record<string, string> = {
      '3840x2160': '4k',
      '1920x1080': 'full-hd',
      '1280x720': 'hd',
      '1080x1920': 'full-hd', // portrait — FFmpeg handles via aspect ratio
      '1080x1080': 'full-hd', // square — FFmpeg handles via aspect ratio
    };
    if (pixelMap[userRes]) return pixelMap[userRes];
  }
  // Fallback: derive from quality
  return quality === 'cinematic' ? '4k' : quality === 'production' ? 'full-hd' : 'hd';
}

function buildTimeline(
  chapters: Chapter[],
  transitions: Transition[],
  bookends: Bookends | null,
  quality: string,
  projectTitle?: string,
  userResolution?: string,
) {
  const resolution = mapResolution(userResolution, quality);
  const scenes: Array<Record<string, unknown>> = [];

  // ── Opening bookend ──
  if (bookends) {
    scenes.push({
      comment: 'Opening Bookend',
      duration: bookends.opening.duration,
      'background-color': '#0f0a1a',
      elements: [{
        type: 'text',
        text: bookends.opening.title || projectTitle || 'Untitled Project',
        duration: bookends.opening.duration,
        settings: {
          'font-family': 'Inter', 'font-size': '64px', 'font-color': '#f5d77a',
          'text-shadow': '2px 2px 8px rgba(0,0,0,0.7)',
        },
        position: 'center', start: 0,
      }],
    });
  }

  // ── Scene segments with layered audio ──
  chapters.forEach((chapter, chapterIndex) => {
    const allTts = chapter.allTtsUrls || [];
    const chapterVisuals: string[] = chapter.visualUrls || (chapter.visualUrl ? [chapter.visualUrl] : []);
    const sceneDuration: number = chapter.duration || 30;
    const elements: Array<Record<string, unknown>> = [];
    const bgColor = chapter.backgroundColor || '#1e293b';

    // Visual layer: distribute visuals across scene duration
    if (chapterVisuals.length > 0) {
      if (allTts.length > 0 && chapterVisuals.length >= allTts.length) {
        // One visual per TTS line — aligned to TTS timing
        allTts.forEach((tts, idx) => {
          const src = chapterVisuals[idx % chapterVisuals.length];
          const isVideo = src.match(/\.(mp4|webm|mov)(\?|$)/i);
          elements.push({
            type: isVideo ? 'video' : 'image', src,
            start: tts.start, duration: tts.duration,
          });
        });
      } else if (chapterVisuals.length > 1) {
        // Multiple visuals, distribute evenly
        const durPerVisual = Math.max(1, Math.floor(sceneDuration / chapterVisuals.length));
        chapterVisuals.forEach((url, idx) => {
          const isVideo = url.match(/\.(mp4|webm|mov)(\?|$)/i);
          elements.push({
            type: isVideo ? 'video' : 'image', src: url,
            start: idx * durPerVisual,
            duration: Math.min(durPerVisual, sceneDuration - idx * durPerVisual),
          });
        });
      } else {
        // Single visual — holds for full scene duration
        const isVideo = chapterVisuals[0].match(/\.(mp4|webm|mov)(\?|$)/i);
        elements.push({
          type: isVideo ? 'video' : 'image', src: chapterVisuals[0],
          start: 0, duration: sceneDuration,
        });
      }
    }

    // Background image (if set, renders behind other visuals)
    if (chapter.backgroundUrl) {
      elements.unshift({
        type: 'image', src: chapter.backgroundUrl,
        start: 0, duration: sceneDuration,
      });
    }

    // TTS layer: sequential dialogue lines with start offsets
    allTts.forEach(tts => {
      if (tts.url && tts.url.startsWith('http')) {
        elements.push({ type: 'audio', src: tts.url, start: tts.start, duration: tts.duration, volume: 1.0 });
      }
    });

    // Music layer: loop at original speed, volume ducked
    if (chapter.musicUrl && chapter.musicUrl.startsWith('http')) {
      elements.push({
        type: 'audio', src: chapter.musicUrl,
        start: 0, duration: sceneDuration,
        volume: 0.3, loop: !!chapter.musicLoop,
      });
    }

    // SFX layer
    const sfxUrls = chapter.sfxUrls || [];
    sfxUrls.forEach((sfxUrl, sfxIdx) => {
      if (sfxUrl && sfxUrl.startsWith('http')) {
        const sfxStart = sfxIdx > 0 ? Math.floor(sceneDuration * sfxIdx / sfxUrls.length) : 0;
        elements.push({
          type: 'audio', src: sfxUrl,
          start: sfxStart, duration: Math.min(5, sceneDuration - sfxStart),
          volume: 0.6,
        });
      }
    });

    // Scene title overlay (first 5s)
    const sceneLabel = chapter.title || chapter.product || chapter.chapterId;
    elements.push({
      type: 'text', text: sceneLabel,
      start: 0, duration: Math.min(5, sceneDuration),
      settings: {
        'font-family': 'Inter', 'font-size': '42px', 'font-color': '#ffffff',
        'text-shadow': '2px 2px 4px rgba(0,0,0,0.5)',
      },
      position: 'bottom-left',
    });

    scenes.push({
      comment: `${sceneLabel} (${allTts.length} TTS, ${sceneDuration}s)`,
      duration: sceneDuration,
      'background-color': bgColor,
      elements,
    });

    // Transition segment after this scene (except last)
    if (transitions.length > chapterIndex) {
      const t = transitions[chapterIndex];
      const transElements: Array<Record<string, unknown>> = [];

      transElements.push({
        type: 'text', text: `~ ${t.style.replace(/-/g, ' ')} ~`,
        start: 0, duration: t.duration,
        settings: {
          'font-family': 'Inter', 'font-size': '36px', 'font-color': '#c4b5fd',
          'text-shadow': '2px 2px 6px rgba(0,0,0,0.6)',
        },
        position: 'center',
      });

      if (t.bridgeAudioUrl && t.bridgeAudioUrl.startsWith('http')) {
        transElements.push({
          type: 'audio', src: t.bridgeAudioUrl,
          start: 1, duration: t.bridgeDuration || (t.duration - 1),
          volume: 1.0,
        });
      }

      scenes.push({
        comment: `Transition: ${t.from} → ${t.to} (${t.style})`,
        duration: t.duration,
        'background-color': '#0f0a1a',
        elements: transElements,
      });
    }
  });

  // ── Closing bookend ──
  if (bookends) {
    scenes.push({
      comment: 'Closing Bookend',
      duration: bookends.closing.duration,
      'background-color': '#0f0a1a',
      elements: [{
        type: 'text',
        text: bookends.closing.title || 'The End',
        duration: bookends.closing.duration,
        settings: {
          'font-family': 'Inter', 'font-size': '56px', 'font-color': '#f5d77a',
          'text-shadow': '2px 2px 8px rgba(0,0,0,0.7)',
        },
        position: 'center', start: 0,
      }],
    });
  }

  return { resolution, quality: quality === 'cinematic' ? 'high' : 'medium', scenes };
}

// ─── Main Handler ────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const {
      chapters, transitions = [], bookends = null,
      quality = 'production', castProjectId = null,
      language = 'en', projectTitle, resolution: userResolution,
    } = await req.json();

    if (!chapters || !Array.isArray(chapters) || chapters.length === 0) {
      return errorResponse(400, 'Missing or empty chapters array');
    }

    // ── Safety guard 1: Reject data: URIs (defense in depth) ──
    const hasDataUri = chapters.some((ch: Chapter) => {
      const urls = [
        ch.visualUrl, ch.backgroundUrl, ch.musicUrl,
        ...(ch.visualUrls || []),
        ...(ch.sfxUrls || []),
        ...(ch.allTtsUrls || []).map((t: TtsEntry) => t.url),
      ];
      return urls.some(u => typeof u === 'string' && u.startsWith('data:'));
    });
    if (hasDataUri) {
      return errorResponse(400, 'Payload contains data: URIs — filter on client first');
    }

    // ── Build timeline server-side ──
    const timeline = buildTimeline(chapters, transitions, bookends, quality, projectTitle, userResolution);
    const totalDuration = timeline.scenes.reduce((sum, s) => sum + ((s.duration as number) || 0), 0);

    // ── Safety guard 2: Log and check payload size ──
    const payloadStr = JSON.stringify(timeline);
    const payloadKb = Math.round(payloadStr.length / 1024);
    console.log(`[Timeline Builder] ${chapters.length} chapters → ${timeline.scenes.length} timeline scenes, ${payloadKb}kb, ${totalDuration}s`);

    if (payloadKb > 5000) {
      return errorResponse(400, `Payload too large: ${payloadKb}kb (max 5MB). Likely contains embedded images — filter data: URIs.`);
    }

    // ── Supabase client for job tracking ──
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // ── Track assembly job ──
    let castJobId: string | null = null;
    if (castProjectId) {
      try {
        const { data: job } = await supabase
          .from('cast_generation_jobs')
          .insert({
            project_id: castProjectId,
            job_type: 'assembly',
            language, quality,
            provider: 'runpod-ffmpeg',
            status: 'processing',
            started_at: new Date().toISOString(),
            input_config: {
              mode: 'timeline-builder',
              chapterCount: chapters.length,
              sceneCount: timeline.scenes.length,
              totalDuration,
              payloadKb,
            },
          })
          .select('id')
          .single();
        if (job) castJobId = job.id;
      } catch (_) { /* best-effort job tracking */ }
    }

    // ── Submit to RunPod FFmpeg worker (async /run — returns immediately) ──
    const RUNPOD_ENDPOINT_ID = Deno.env.get('RUNPOD_CAST_ENDPOINT_ID');
    const RUNPOD_API_KEY = Deno.env.get('RUNPOD_API_KEY');

    if (!RUNPOD_ENDPOINT_ID || !RUNPOD_API_KEY) {
      return errorResponse(500, 'RUNPOD_CAST_ENDPOINT_ID or RUNPOD_API_KEY not configured');
    }

    // 15s timeout on RunPod /run call — prevents edge function from hanging
    const runController = new AbortController();
    const runTimeout = setTimeout(() => runController.abort(), 15000);

    let response: Response;
    try {
      response = await fetch(`https://api.runpod.ai/v2/${RUNPOD_ENDPOINT_ID}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RUNPOD_API_KEY}`,
        },
        signal: runController.signal,
        body: JSON.stringify({
          input: {
            timeline,
            supabaseUrl,
            supabaseServiceKey: supabaseKey,
            castProjectId: castProjectId || 'unknown',
            castJobId: castJobId || null,
          },
        }),
      });
    } catch (fetchErr: unknown) {
      clearTimeout(runTimeout);
      const isTimeout = fetchErr instanceof DOMException && fetchErr.name === 'AbortError';
      const errMsg = isTimeout ? 'RunPod API timed out after 15s' : String(fetchErr);
      console.error(`[Timeline Builder] RunPod fetch failed: ${errMsg}`);
      if (castJobId) {
        await supabase.from('cast_generation_jobs').update({
          status: 'failed',
          error_message: errMsg,
          completed_at: new Date().toISOString(),
        }).eq('id', castJobId);
      }
      return errorResponse(504, errMsg);
    } finally {
      clearTimeout(runTimeout);
    }

    const responseText = await response.text();
    console.log(`[Timeline Builder] RunPod ${response.status}: ${responseText.substring(0, 500)}`);

    if (!response.ok) {
      console.error(`RunPod API error: ${response.status} - ${responseText}`);
      if (castJobId) {
        await supabase.from('cast_generation_jobs').update({
          status: 'failed',
          error_message: `RunPod ${response.status}: ${responseText.substring(0, 200)}`,
          completed_at: new Date().toISOString(),
        }).eq('id', castJobId);
      }
      return errorResponse(502, `RunPod error: ${response.status}`);
    }

    const data = JSON.parse(responseText);
    // RunPod /run returns { id: "job-id", status: "IN_QUEUE" }
    const runpodJobId = data.id;

    // ── Update job + project status ──
    if (castJobId || castProjectId) {
      try {
        if (castJobId) {
          await supabase.from('cast_generation_jobs').update({
            status: 'rendering',
            provider_job_id: runpodJobId || null,
            output_duration_seconds: totalDuration || null,
          }).eq('id', castJobId);
        }

        if (castProjectId) {
          await supabase.from('cast_projects').update({
            status: 'generating',
            ...(totalDuration > 0 ? { total_duration_seconds: totalDuration } : {}),
          }).eq('id', castProjectId);
        }
      } catch (_) { /* best-effort */ }
    }

    return new Response(JSON.stringify({
      success: true,
      totalDuration,
      generationStatus: 'pending',
      castJobId,
      taskId: runpodJobId || undefined,
      message: 'Timeline built and submitted to RunPod FFmpeg. Poll genie-cast-status for completion.',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('genie-cast-timeline-builder error:', err);
    return errorResponse(500, String(err));
  }
});
