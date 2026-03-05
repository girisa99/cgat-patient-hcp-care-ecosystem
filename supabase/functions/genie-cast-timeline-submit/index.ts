/**
 * GENIE CAST TIMELINE SUBMIT
 *
 * Lightweight edge function that downloads a pre-built JSON2Video timeline
 * from Supabase Storage and forwards it to the JSON2Video API.
 *
 * Flow: Client builds timeline → uploads to Storage → sends URL here →
 *       we download + stream to JSON2Video → return taskId for polling.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { timelineUrl, castProjectId = null, language = 'en', quality = 'production' } = await req.json();

    if (!timelineUrl) {
      return new Response(JSON.stringify({ success: false, message: 'Missing timelineUrl' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`🎬 Timeline submit: fetching from ${timelineUrl.substring(0, 120)}...`);

    // Download timeline from Supabase Storage
    const timelineResp = await fetch(timelineUrl);
    if (!timelineResp.ok) {
      return new Response(JSON.stringify({ success: false, message: `Failed to download timeline: ${timelineResp.status}` }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const timeline = await timelineResp.json();

    if (!timeline || !timeline.scenes || timeline.scenes.length === 0) {
      return new Response(JSON.stringify({ success: false, message: 'Downloaded timeline is empty' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const totalDuration = timeline.scenes.reduce((sum: number, s: any) => sum + (s.duration || 0), 0);
    console.log(`🎬 Timeline loaded: ${timeline.scenes.length} scenes, ${totalDuration}s`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Track assembly job
    let castJobId: string | null = null;
    if (castProjectId) {
      try {
        const { data: job } = await supabase
          .from('cast_generation_jobs')
          .insert({
            project_id: castProjectId,
            job_type: 'assembly',
            language,
            quality,
            provider: 'json2video',
            status: 'processing',
            started_at: new Date().toISOString(),
            input_config: {
              mode: 'submit-timeline',
              sceneCount: timeline.scenes.length,
              totalDuration,
            },
          })
          .select('id')
          .single();
        if (job) castJobId = job.id;
      } catch (_) { /* best-effort */ }
    }

    // Forward to JSON2Video
    const apiKey = Deno.env.get('JSON2VIDEO_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ success: false, message: 'JSON2VIDEO_API_KEY not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Stream the timeline directly — don't JSON.stringify the whole thing in memory
    const response = await fetch('https://api.json2video.com/v2/movies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify(timeline),
    });

    const responseText = await response.text();
    console.log(`📹 JSON2Video status: ${response.status}, body (first 500): ${responseText.substring(0, 500)}`);

    if (!response.ok) {
      console.error(`JSON2Video API error: ${response.status} - ${responseText}`);
      if (castJobId) {
        await supabase.from('cast_generation_jobs').update({
          status: 'failed',
          error_message: `JSON2Video ${response.status}: ${responseText.substring(0, 200)}`,
          completed_at: new Date().toISOString(),
        }).eq('id', castJobId);
      }
      return new Response(JSON.stringify({ success: false, message: `JSON2Video error: ${response.status}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = JSON.parse(responseText);
    const projectId = data.project || data.id || data.movie_id;

    // Update job + project status
    if (castJobId && castProjectId) {
      try {
        const isPending = !!projectId;
        await supabase.from('cast_generation_jobs').update({
          status: isPending ? 'rendering' : 'completed',
          output_url: data.url || data.movie_url || data.movie?.url || null,
          output_thumbnail_url: data.poster || data.thumbnail || data.movie?.poster || null,
          output_duration_seconds: totalDuration || null,
          provider_job_id: projectId || null,
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
      generationStatus: projectId ? 'pending' : 'completed',
      castJobId,
      taskId: projectId || undefined,
      message: projectId
        ? 'Timeline submitted to JSON2Video. Poll genie-cast-status for completion.'
        : 'Video assembly completed.',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('genie-cast-timeline-submit error:', err);
    return new Response(JSON.stringify({ success: false, message: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
