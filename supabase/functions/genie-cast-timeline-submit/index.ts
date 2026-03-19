/**
 * GENIE CAST TIMELINE SUBMIT
 *
 * Receives a pre-built timeline (castTimelineEngine format) and forwards it
 * to the RunPod Serverless FFmpeg worker for GPU-accelerated rendering.
 *
 * The client builds the timeline locally (browser has unlimited memory),
 * filters out data: URIs to keep payload small (~100KB), and sends it here.
 *
 * RunPod async /run returns immediately with a job ID.
 * Client polls genie-cast-status to check completion.
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
    const body = await req.json();
    const { action, timeline, castProjectId = null, language = 'en', quality = 'production', partNumber = null } = body;

    // ── Fast path: stitch_parts action (concat pre-rendered parts, no timeline needed) ──
    if (action === 'stitch_parts') {
      const { videoUrls } = body;
      if (!videoUrls || !Array.isArray(videoUrls) || videoUrls.length < 2) {
        return new Response(JSON.stringify({ success: false, message: 'stitch_parts requires videoUrls array with >= 2 URLs' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`🔗 stitch_parts: ${videoUrls.length} parts for project ${castProjectId}`);

      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Track stitch job in DB
      let castJobId: string | null = null;
      if (castProjectId) {
        try {
          const { data: job, error: insertError } = await supabase
            .from('cast_generation_jobs')
            .insert({
              project_id: castProjectId,
              job_type: 'assembly',
              language: 'en',
              quality: 'production',
              provider: 'runpod-ffmpeg',
              status: 'processing',
              started_at: new Date().toISOString(),
              input_config: {
                mode: 'stitch_parts',
                partCount: videoUrls.length,
              },
            })
            .select('id')
            .single();
          if (insertError) console.error('❌ stitch job INSERT failed:', insertError.message);
          if (job) castJobId = job.id;
        } catch (dbErr) {
          console.error('❌ stitch job INSERT threw:', dbErr);
        }
      }

      // Forward to RunPod
      const RUNPOD_ENDPOINT_ID = Deno.env.get('RUNPOD_CAST_ENDPOINT_ID');
      const RUNPOD_API_KEY = Deno.env.get('RUNPOD_API_KEY');

      if (!RUNPOD_ENDPOINT_ID || !RUNPOD_API_KEY) {
        return new Response(JSON.stringify({ success: false, message: 'RunPod not configured' }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

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
              action: 'stitch_parts',
              videoUrls,
              castProjectId: castProjectId || 'unknown',
              castJobId: castJobId || null,
              supabaseUrl,
              supabaseServiceKey: supabaseKey,
              transitionDuration: body.transitionDuration ?? 0.75,
              enableLoudnorm: body.enableLoudnorm ?? true,
            },
          }),
        });
      } catch (fetchErr) {
        clearTimeout(runTimeout);
        const isTimeout = fetchErr instanceof DOMException && fetchErr.name === 'AbortError';
        const errMsg = isTimeout ? 'RunPod API timed out after 15s' : String(fetchErr);
        if (castJobId) {
          await supabase.from('cast_generation_jobs').update({
            status: 'failed', error_message: errMsg, completed_at: new Date().toISOString(),
          }).eq('id', castJobId);
        }
        return new Response(JSON.stringify({ success: false, message: errMsg }), {
          status: 504, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } finally {
        clearTimeout(runTimeout);
      }

      const responseText = await response.text();
      console.log(`🚀 RunPod stitch status: ${response.status}, body: ${responseText.substring(0, 500)}`);

      if (!response.ok) {
        if (castJobId) {
          await supabase.from('cast_generation_jobs').update({
            status: 'failed', error_message: `RunPod ${response.status}: ${responseText.substring(0, 200)}`,
            completed_at: new Date().toISOString(),
          }).eq('id', castJobId);
        }
        return new Response(JSON.stringify({ success: false, message: `RunPod error: ${response.status}` }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const runpodData = JSON.parse(responseText);
      const runpodJobId = runpodData.id;

      // Save RunPod job ID for polling
      if (castJobId) {
        await supabase.from('cast_generation_jobs').update({
          status: 'rendering', provider_job_id: runpodJobId || null,
        }).eq('id', castJobId);
      }
      if (castProjectId) {
        await supabase.from('cast_projects').update({ status: 'generating' }).eq('id', castProjectId);
      }

      return new Response(JSON.stringify({
        success: true,
        castJobId,
        taskId: runpodJobId || undefined,
        message: 'stitch_parts submitted to RunPod. Poll genie-cast-status for completion.',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Standard timeline path ──
    if (!timeline || !timeline.scenes || timeline.scenes.length === 0) {
      return new Response(JSON.stringify({ success: false, message: 'Missing or empty timeline' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const totalDuration = timeline.scenes.reduce((sum: number, s: any) => sum + (s.duration || 0), 0);
    console.log(`🎬 Timeline submit: ${timeline.scenes.length} scenes, ${totalDuration}s`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Track assembly job in DB
    let castJobId: string | null = null;
    if (castProjectId) {
      try {
        const { data: job, error: insertError } = await supabase
          .from('cast_generation_jobs')
          .insert({
            project_id: castProjectId,
            job_type: 'assembly',
            language,
            quality,
            provider: 'runpod-ffmpeg',
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
        if (insertError) {
          console.error('❌ cast_generation_jobs INSERT failed:', insertError.message);
        }
        if (job) castJobId = job.id;
      } catch (dbErr) {
        console.error('❌ cast_generation_jobs INSERT threw:', dbErr);
      }
    }

    // Forward to RunPod Serverless (async /run — returns immediately)
    const RUNPOD_ENDPOINT_ID = Deno.env.get('RUNPOD_CAST_ENDPOINT_ID');
    const RUNPOD_API_KEY = Deno.env.get('RUNPOD_API_KEY');

    if (!RUNPOD_ENDPOINT_ID || !RUNPOD_API_KEY) {
      return new Response(JSON.stringify({
        success: false,
        message: 'RUNPOD_CAST_ENDPOINT_ID or RUNPOD_API_KEY not configured',
      }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 15-second timeout on RunPod /run call — prevents edge function from hanging
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
            ...(partNumber != null ? { partNumber } : {}),
          },
        }),
      });
    } catch (fetchErr) {
      clearTimeout(runTimeout);
      const isTimeout = fetchErr instanceof DOMException && fetchErr.name === 'AbortError';
      const errMsg = isTimeout ? 'RunPod API timed out after 15s' : String(fetchErr);
      console.error(`❌ RunPod fetch failed: ${errMsg}`);
      if (castJobId) {
        await supabase.from('cast_generation_jobs').update({
          status: 'failed',
          error_message: errMsg,
          completed_at: new Date().toISOString(),
        }).eq('id', castJobId);
      }
      return new Response(JSON.stringify({ success: false, message: errMsg }), {
        status: 504, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } finally {
      clearTimeout(runTimeout);
    }

    const responseText = await response.text();
    console.log(`🚀 RunPod status: ${response.status}, body: ${responseText.substring(0, 500)}`);

    if (!response.ok) {
      console.error(`RunPod API error: ${response.status} - ${responseText}`);
      if (castJobId) {
        await supabase.from('cast_generation_jobs').update({
          status: 'failed',
          error_message: `RunPod ${response.status}: ${responseText.substring(0, 200)}`,
          completed_at: new Date().toISOString(),
        }).eq('id', castJobId);
      }
      return new Response(JSON.stringify({ success: false, message: `RunPod error: ${response.status}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = JSON.parse(responseText);
    // RunPod /run returns { id: "job-id", status: "IN_QUEUE" }
    const runpodJobId = data.id;

    // Save RunPod job ID for polling — CRITICAL for genie-cast-status to work
    if (castJobId || castProjectId) {
      const jobUpdate = {
        status: 'rendering',
        provider_job_id: runpodJobId || null,
        output_duration_seconds: totalDuration || null,
      };

      if (castJobId) {
        for (let attempt = 1; attempt <= 2; attempt++) {
          const { error: updateError } = await supabase.from('cast_generation_jobs')
            .update(jobUpdate).eq('id', castJobId);
          if (!updateError) {
            console.log(`✅ cast_generation_jobs updated: provider_job_id=${runpodJobId} (attempt ${attempt})`);
            break;
          }
          console.error(`❌ cast_generation_jobs UPDATE failed (attempt ${attempt}):`, updateError.message);
          if (attempt < 2) await new Promise(r => setTimeout(r, 500));
        }
      }

      if (castProjectId) {
        const { error: projError } = await supabase.from('cast_projects').update({
          status: 'generating',
          ...(totalDuration > 0 ? { total_duration_seconds: totalDuration } : {}),
        }).eq('id', castProjectId);
        if (projError) console.error('❌ cast_projects UPDATE failed:', projError.message);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      totalDuration,
      generationStatus: 'pending',
      castJobId,
      taskId: runpodJobId || undefined,
      message: 'Timeline submitted to RunPod FFmpeg worker. Poll genie-cast-status for completion.',
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
