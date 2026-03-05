/**
 * GENIE CAST TIMELINE BUILDER
 *
 * Lightweight edge function (~250 lines) that:
 * 1. Receives scene chapters, transitions, bookends, quality
 * 2. Builds JSON2Video timeline SERVER-SIDE
 * 3. Validates no data: URIs (defense in depth)
 * 4. Logs payload size before forwarding
 * 5. Forwards completed timeline to JSON2Video API
 * 6. Creates/updates cast_generation_jobs row
 * 7. Returns { success, taskId, castJobId }
 *
 * Architecture rationale:
 * - Industry standard: Runway, Descript, CapCut render server-side
 * - Global reach: low-powered devices in 16 regions get consistent results
 * - Security: API keys stay server-side
 * - Edge distribution: Deno Deploy (34+ global regions)
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
// Ported from buildJson2VideoTimeline in EP04Production.tsx.
// Generic: works for any Cast project type (video, podcast, educational, UGC).

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

function buildTimeline(
  chapters: Chapter[],
  transitions: Transition[],
  bookends: Bookends | null,
  quality: string,
  projectTitle?: string,
) {
  const resolution = quality === 'cinematic' ? '4k' : quality === 'production' ? 'full-hd' : 'hd';
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
      language = 'en', projectTitle,
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
    const timeline = buildTimeline(chapters, transitions, bookends, quality, projectTitle);
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
            provider: 'json2video',
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

    // ── Forward to JSON2Video ──
    const apiKey = Deno.env.get('JSON2VIDEO_API_KEY');
    if (!apiKey) {
      return errorResponse(500, 'JSON2VIDEO_API_KEY not configured');
    }

    const response = await fetch('https://api.json2video.com/v2/movies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: payloadStr,
    });

    const responseText = await response.text();
    console.log(`[Timeline Builder] JSON2Video ${response.status}: ${responseText.substring(0, 500)}`);

    if (!response.ok) {
      console.error(`JSON2Video API error: ${response.status} - ${responseText}`);
      if (castJobId) {
        await supabase.from('cast_generation_jobs').update({
          status: 'failed',
          error_message: `JSON2Video ${response.status}: ${responseText.substring(0, 200)}`,
          completed_at: new Date().toISOString(),
        }).eq('id', castJobId);
      }
      return errorResponse(502, `JSON2Video error: ${response.status}`);
    }

    const data = JSON.parse(responseText);
    const j2vProjectId = data.project || data.id || data.movie_id;

    // ── Update job + project status ──
    if (castJobId && castProjectId) {
      try {
        const isPending = !!j2vProjectId;
        await supabase.from('cast_generation_jobs').update({
          status: isPending ? 'rendering' : 'completed',
          output_url: data.url || data.movie_url || data.movie?.url || null,
          output_thumbnail_url: data.poster || data.thumbnail || data.movie?.poster || null,
          output_duration_seconds: totalDuration || null,
          provider_job_id: j2vProjectId || null,
          completed_at: !isPending ? new Date().toISOString() : null,
        }).eq('id', castJobId);

        await supabase.from('cast_projects').update({
          status: isPending ? 'generating' : 'review',
          ...(totalDuration > 0 ? { total_duration_seconds: totalDuration } : {}),
          ...(data.url || data.movie_url ? { final_video_url: data.url || data.movie_url } : {}),
        }).eq('id', castProjectId);
      } catch (_) { /* best-effort */ }
    }

    return new Response(JSON.stringify({
      success: true,
      videoUrl: data.url || data.movie_url || data.movie?.url || undefined,
      thumbnailUrl: data.poster || data.thumbnail || data.movie?.poster || undefined,
      totalDuration,
      generationStatus: j2vProjectId ? 'pending' : 'completed',
      castJobId,
      taskId: j2vProjectId || undefined,
      message: j2vProjectId
        ? 'Timeline built and submitted. Poll genie-cast-status for completion.'
        : 'Video assembly completed.',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('genie-cast-timeline-builder error:', err);
    return errorResponse(500, String(err));
  }
});
