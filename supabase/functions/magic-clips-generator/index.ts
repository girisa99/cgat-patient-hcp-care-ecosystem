/**
 * MAGIC CLIPS GENERATOR — RunPod FFmpeg Edition
 *
 * Extracts clips from source video via RunPod FFmpeg worker (stream copy = fast, lossless).
 * Supports individual clip and batch extraction.
 *
 * Flow: Frontend → magic-clips-generator → RunPod (extract_clips) → Supabase Storage URLs
 *
 * Platforms: YouTube Shorts, TikTok, Instagram Reels, LinkedIn, Twitter/X, Facebook
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Platform specifications for reference / future platform_resize
const PLATFORM_SPECS: Record<string, {
  name: string;
  maxDuration: number;
  aspectRatio: string;
  width: number;
  height: number;
}> = {
  'youtube_shorts': { name: 'YouTube Shorts', maxDuration: 60, aspectRatio: '9:16', width: 1080, height: 1920 },
  'tiktok':         { name: 'TikTok',         maxDuration: 60, aspectRatio: '9:16', width: 1080, height: 1920 },
  'instagram_reels':{ name: 'Instagram Reels', maxDuration: 90, aspectRatio: '9:16', width: 1080, height: 1920 },
  'instagram':      { name: 'Instagram',       maxDuration: 90, aspectRatio: '9:16', width: 1080, height: 1920 },
  'linkedin':       { name: 'LinkedIn',        maxDuration: 30, aspectRatio: '16:9', width: 1920, height: 1080 },
  'twitter':        { name: 'Twitter/X',       maxDuration: 140,aspectRatio: '16:9', width: 1920, height: 1080 },
  'facebook':       { name: 'Facebook',        maxDuration: 120,aspectRatio: '16:9', width: 1920, height: 1080 },
};

interface MagicClipsRequest {
  sourceVideoUrl: string;
  castProjectId?: string;
  /** Array of clips to extract with start/end seconds */
  clips?: Array<{ id: string; start: number; end: number; label?: string }>;
  /** Legacy: platform list (used if no clips array provided) */
  platforms?: string[];
  mode?: 'auto' | 'highlights' | 'manual' | 'batch';
  highlightTimestamps?: { start: number; end: number }[];
  addCaptions?: boolean;
  language?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: MagicClipsRequest = await req.json();
    const {
      sourceVideoUrl,
      castProjectId,
      clips,
      platforms = [],
      mode = 'auto',
      highlightTimestamps,
    } = body;

    if (!sourceVideoUrl) {
      throw new Error('sourceVideoUrl is required');
    }

    const runpodEndpointId = Deno.env.get('RUNPOD_CAST_ENDPOINT_ID');
    const runpodApiKey = Deno.env.get('RUNPOD_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!runpodEndpointId || !runpodApiKey) {
      throw new Error('RunPod not configured — set RUNPOD_CAST_ENDPOINT_ID and RUNPOD_API_KEY');
    }

    // ── Build clips array for extraction ──────────────────────────────────
    let extractClips: Array<{ id: string; start: number; end: number; label: string }> = [];

    if (clips && clips.length > 0) {
      // Batch / individual mode — clips provided with start/end seconds
      extractClips = clips.map(c => ({
        id: c.id,
        start: c.start,
        end: c.end,
        label: c.label || c.id,
      }));
    } else if (highlightTimestamps && highlightTimestamps.length > 0) {
      // Highlights mode — timestamps provided
      extractClips = highlightTimestamps.map((h, i) => ({
        id: `clip_${i + 1}`,
        start: h.start,
        end: h.end,
        label: `Highlight ${i + 1}`,
      }));
    } else {
      // Auto/manual mode — extract one clip from the beginning
      const maxDur = platforms.length > 0
        ? Math.min(...platforms.map(p => PLATFORM_SPECS[p]?.maxDuration || 30))
        : 30;
      extractClips = [{ id: 'clip_auto', start: 0, end: maxDur, label: 'Auto clip' }];
    }

    console.log(`✨ Magic Clips: Extracting ${extractClips.length} clips via RunPod FFmpeg`);
    console.log(`   Source: ${sourceVideoUrl.substring(0, 80)}…`);

    // ── Submit extract_clips job to RunPod ─────────────────────────────────
    const projectTag = castProjectId || `magic_${Date.now()}`;

    const runpodPayload = {
      input: {
        action: 'extract_clips',
        sourceVideoUrl,
        clips: extractClips,
        castProjectId: projectTag,
        supabaseUrl,
        supabaseServiceKey,
      },
    };

    const submitResponse = await fetch(
      `https://api.runpod.ai/v2/${runpodEndpointId}/run`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${runpodApiKey}`,
        },
        body: JSON.stringify(runpodPayload),
        signal: AbortSignal.timeout(15_000),
      },
    );

    if (!submitResponse.ok) {
      const errText = await submitResponse.text();
      throw new Error(`RunPod submit failed (${submitResponse.status}): ${errText}`);
    }

    const submitData = await submitResponse.json();
    const jobId = submitData.id;

    if (!jobId) {
      throw new Error('RunPod returned no job ID');
    }

    console.log(`📋 RunPod job submitted: ${jobId}`);

    // ── Poll for completion ────────────────────────────────────────────────
    // Stream copy is fast (~1-2 seconds per clip), but account for cold start + upload
    const maxAttempts = 60; // 120 seconds max (60 × 2s)
    const pollIntervalMs = 2000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));

      try {
        const statusResponse = await fetch(
          `https://api.runpod.ai/v2/${runpodEndpointId}/status/${jobId}`,
          {
            headers: { 'Authorization': `Bearer ${runpodApiKey}` },
            signal: AbortSignal.timeout(10_000),
          },
        );

        if (!statusResponse.ok) continue;

        const statusData = await statusResponse.json();
        const status = statusData.status;

        if (attempt % 5 === 0) {
          console.log(`   Poll ${attempt + 1}/${maxAttempts}: ${status}`);
        }

        if (status === 'COMPLETED') {
          const output = statusData.output;

          if (output?.error) {
            throw new Error(`RunPod worker error: ${output.error}`);
          }

          // Map RunPod output to response format
          const resultClips = (output?.clips || []).map((c: any) => ({
            platformId: c.id,
            platformName: c.label || c.id,
            clipUrl: c.clipUrl || '',
            thumbnailUrl: c.thumbnailUrl || '',
            duration: c.duration || 0,
            aspectRatio: '16:9', // Source aspect ratio; resize happens at publish time
            status: c.clipUrl ? 'completed' as const : 'failed' as const,
            fileSizeMB: c.fileSizeMB || 0,
          }));

          const completedCount = resultClips.filter((c: any) => c.status === 'completed').length;
          console.log(`✅ Magic Clips complete: ${completedCount}/${resultClips.length}`);

          // Track credit consumption
          if (completedCount > 0) {
            await trackCredits(supabaseUrl, supabaseServiceKey, resultClips);
          }

          return new Response(
            JSON.stringify({
              success: completedCount > 0,
              clips: resultClips,
              totalClips: resultClips.length,
              completedClips: completedCount,
              jobId,
              message: `${completedCount}/${resultClips.length} clips extracted via RunPod FFmpeg`,
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
          );
        }

        if (status === 'FAILED' || status === 'CANCELLED' || status === 'TIMED_OUT') {
          throw new Error(`RunPod job ${status}: ${statusData.error || statusData.output?.error || 'No details'}`);
        }

        // IN_QUEUE or IN_PROGRESS — keep polling
      } catch (pollErr) {
        // Network blip during poll — continue unless it's a thrown Error from above
        if (pollErr instanceof Error && pollErr.message.startsWith('RunPod')) {
          throw pollErr;
        }
        console.warn(`   Poll ${attempt + 1} network error:`, pollErr);
      }
    }

    // ── Timeout ────────────────────────────────────────────────────────────
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Clip extraction timed out — the RunPod job may still be processing',
        jobId,
        clips: [],
        totalClips: extractClips.length,
        completedClips: 0,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );

  } catch (error) {
    console.error('Magic Clips error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Magic Clips generation failed',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// Credit tracking
// ──────────────────────────────────────────────────────────────────────────────

async function trackCredits(
  supabaseUrl: string,
  supabaseServiceKey: string,
  clips: Array<{ status: string; duration: number; platformId: string }>,
): Promise<void> {
  try {
    const completed = clips.filter(c => c.status === 'completed');
    if (completed.length === 0) return;

    const totalDuration = completed.reduce((sum, c) => sum + (c.duration || 0), 0);
    const creditsUsed = Math.ceil(totalDuration / 15); // 1 credit per 15s of output

    const sb = createClient(supabaseUrl, supabaseServiceKey);
    const { error } = await sb.from('ai_credit_transactions').insert({
      transaction_type: 'debit',
      credits_amount: -creditsUsed,
      feature_used: 'magic_clips',
      description: `Magic Clips for ${completed.length} clip(s)`,
      feature_metadata: {
        clips_count: completed.length,
        total_duration: totalDuration,
        clips: completed.map(c => c.platformId),
        provider: 'runpod_ffmpeg',
        pipeline: 'magic-clips-generator',
      },
      created_at: new Date().toISOString(),
    });

    if (error) console.error('Credit tracking failed:', error.message);
    else console.log(`💳 Tracked ${creditsUsed} credits for ${completed.length} magic clips`);
  } catch (err) {
    console.error('Credit tracking error:', err);
  }
}
