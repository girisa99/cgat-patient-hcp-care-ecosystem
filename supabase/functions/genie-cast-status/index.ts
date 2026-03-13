/**
 * GENIE CAST STATUS CHECKER
 *
 * Checks the status of pending RunPod rendering jobs and updates the database
 * when videos complete. Called by client-side polling.
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const RUNPOD_API_KEY = Deno.env.get('RUNPOD_API_KEY');
    const RUNPOD_ENDPOINT_ID = Deno.env.get('RUNPOD_CAST_ENDPOINT_ID');

    if (!RUNPOD_API_KEY || !RUNPOD_ENDPOINT_ID) {
      throw new Error('RUNPOD_API_KEY or RUNPOD_CAST_ENDPOINT_ID not configured');
    }

    const { videoId, projectId, castJobId } = await req.json();

    // ── Cast generation job status check ──────────────────────────────
    if (castJobId) {
      const { data: job, error: jobError } = await supabase
        .from('cast_generation_jobs')
        .select('*')
        .eq('id', castJobId)
        .single();

      if (jobError || !job) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Cast generation job not found',
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        });
      }

      // Already in a terminal state
      if (['completed', 'failed', 'cancelled'].includes(job.status)) {
        return new Response(JSON.stringify({
          success: true,
          job: {
            id: job.id,
            status: job.status,
            outputUrl: job.output_url,
            thumbnailUrl: job.output_thumbnail_url,
            durationSeconds: job.output_duration_seconds,
            progressPercent: job.status === 'completed' ? 100 : (job.progress_percent || 0),
            errorMessage: job.error_message,
          },
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Poll the RunPod provider if we have a provider_job_id
      if (job.provider_job_id) {
        const providerStatus = await checkRunPodStatus(job.provider_job_id, RUNPOD_ENDPOINT_ID, RUNPOD_API_KEY);

        if (providerStatus.completed) {
          await supabase.from('cast_generation_jobs').update({
            status: 'completed',
            output_url: providerStatus.videoUrl,
            output_thumbnail_url: providerStatus.thumbnailUrl,
            output_duration_seconds: providerStatus.duration || null,
            progress_percent: 100,
            completed_at: new Date().toISOString(),
          }).eq('id', castJobId);

          // Update parent cast project
          if (job.project_id) {
            await supabase.from('cast_projects').update({
              status: 'review',
              final_video_url: providerStatus.videoUrl || null,
              thumbnail_url: providerStatus.thumbnailUrl || null,
              total_duration_seconds: providerStatus.duration || null,
            }).eq('id', job.project_id);
          }

          return new Response(JSON.stringify({
            success: true,
            job: {
              id: castJobId,
              status: 'completed',
              outputUrl: providerStatus.videoUrl,
              thumbnailUrl: providerStatus.thumbnailUrl,
              durationSeconds: providerStatus.duration,
              progressPercent: 100,
            },
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else if (providerStatus.failed) {
          await supabase.from('cast_generation_jobs').update({
            status: 'failed',
            error_message: providerStatus.error,
            completed_at: new Date().toISOString(),
          }).eq('id', castJobId);

          return new Response(JSON.stringify({
            success: false,
            job: { id: castJobId, status: 'failed', errorMessage: providerStatus.error },
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Still processing — read progress from DB (worker updates it directly)
        // Re-fetch latest progress from DB since worker may have updated it
        const { data: freshJob } = await supabase
          .from('cast_generation_jobs')
          .select('progress_percent, output_metadata')
          .eq('id', castJobId)
          .single();

        const currentProgress = freshJob?.progress_percent || job.progress_percent || 0;
        const statusText = freshJob?.output_metadata?.status_text || '';

        return new Response(JSON.stringify({
          success: true,
          job: {
            id: castJobId,
            status: 'processing',
            progressPercent: currentProgress,
            statusText,
          },
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // No provider_job_id — return current DB status
      return new Response(JSON.stringify({
        success: true,
        job: { id: job.id, status: job.status, progressPercent: job.progress_percent || 0 },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If specific video ID provided, check just that one (landing page videos)
    if (videoId) {
      const { data: video, error } = await supabase
        .from('landing_page_videos')
        .select('*')
        .eq('id', videoId)
        .single();

      if (error || !video) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Video not found'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        });
      }

      if (video.generation_status === 'completed' || !video.render_project_id) {
        return new Response(JSON.stringify({
          success: true,
          video: {
            id: video.id,
            status: video.generation_status,
            videoUrl: video.video_url,
            thumbnailUrl: video.thumbnail_url,
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Poll RunPod for status
      const status = await checkRunPodStatus(video.render_project_id, RUNPOD_ENDPOINT_ID, RUNPOD_API_KEY);

      if (status.completed) {
        await supabase
          .from('landing_page_videos')
          .update({
            generation_status: 'completed',
            video_url: status.videoUrl,
            thumbnail_url: status.thumbnailUrl,
            duration_seconds: status.duration || video.duration_seconds,
            updated_at: new Date().toISOString(),
          })
          .eq('id', video.id);

        return new Response(JSON.stringify({
          success: true,
          video: {
            id: video.id,
            status: 'completed',
            videoUrl: status.videoUrl,
            thumbnailUrl: status.thumbnailUrl,
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else if (status.failed) {
        await supabase
          .from('landing_page_videos')
          .update({
            generation_status: 'failed',
            generation_error: status.error,
            updated_at: new Date().toISOString(),
          })
          .eq('id', video.id);

        return new Response(JSON.stringify({
          success: false,
          video: {
            id: video.id,
            status: 'failed',
            error: status.error,
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({
        success: true,
        video: {
          id: video.id,
          status: 'processing',
          progress: status.progress || 0,
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If RunPod job ID provided directly (for checking new jobs via taskId fallback)
    if (projectId) {
      const status = await checkRunPodStatus(projectId, RUNPOD_ENDPOINT_ID, RUNPOD_API_KEY);
      return new Response(JSON.stringify({
        success: true,
        status: status.completed ? 'completed' : (status.failed ? 'failed' : 'processing'),
        videoUrl: status.videoUrl,
        thumbnailUrl: status.thumbnailUrl,
        progress: status.progress,
        error: status.error,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check all pending videos (batch mode)
    const { data: pendingVideos, error: fetchError } = await supabase
      .from('landing_page_videos')
      .select('*')
      .in('generation_status', ['pending', 'processing'])
      .not('render_project_id', 'is', null);

    if (fetchError) {
      throw fetchError;
    }

    const results = [];

    for (const video of pendingVideos || []) {
      try {
        const status = await checkRunPodStatus(video.render_project_id, RUNPOD_ENDPOINT_ID, RUNPOD_API_KEY);

        if (status.completed) {
          await supabase
            .from('landing_page_videos')
            .update({
              generation_status: 'completed',
              video_url: status.videoUrl,
              thumbnail_url: status.thumbnailUrl,
              duration_seconds: status.duration || video.duration_seconds,
              updated_at: new Date().toISOString(),
            })
            .eq('id', video.id);

          results.push({
            id: video.id,
            language: video.language_code,
            status: 'completed',
            videoUrl: status.videoUrl,
          });
        } else if (status.failed) {
          await supabase
            .from('landing_page_videos')
            .update({
              generation_status: 'failed',
              generation_error: status.error,
              updated_at: new Date().toISOString(),
            })
            .eq('id', video.id);

          results.push({
            id: video.id,
            language: video.language_code,
            status: 'failed',
            error: status.error,
          });
        } else {
          results.push({
            id: video.id,
            language: video.language_code,
            status: 'processing',
            progress: status.progress,
          });
        }
      } catch (err) {
        console.error(`Error checking video ${video.id}:`, err);
        results.push({
          id: video.id,
          language: video.language_code,
          status: 'error',
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      checked: results.length,
      results,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Status check error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

async function checkRunPodStatus(jobId: string, endpointId: string, apiKey: string): Promise<{
  completed: boolean;
  failed: boolean;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  progress?: number;
  error?: string;
}> {
  try {
    const response = await fetch(`https://api.runpod.ai/v2/${endpointId}/status/${jobId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });

    if (!response.ok) {
      console.error(`RunPod status API error: ${response.status}`);
      return { completed: false, failed: true, error: `API error: ${response.status}` };
    }

    const data = await response.json();
    console.log(`🚀 RunPod status for ${jobId}: ${data.status}, output keys: ${data.output ? Object.keys(data.output).join(',') : 'none'}`);

    // RunPod statuses: IN_QUEUE, IN_PROGRESS, COMPLETED, FAILED, CANCELLED, TIMED_OUT
    if (data.status === 'COMPLETED') {
      return {
        completed: true,
        failed: false,
        videoUrl: data.output?.videoUrl,
        thumbnailUrl: data.output?.thumbnailUrl,
        duration: data.output?.duration,
      };
    }

    if (['FAILED', 'CANCELLED', 'TIMED_OUT'].includes(data.status)) {
      return {
        completed: false,
        failed: true,
        error: data.output?.error || data.error || data.status,
      };
    }

    // IN_QUEUE or IN_PROGRESS
    return {
      completed: false,
      failed: false,
      progress: data.output?.progress || 0,
    };

  } catch (error) {
    console.error('Error checking RunPod status:', error);
    return {
      completed: false,
      failed: true,
      error: error instanceof Error ? error.message : 'Failed to check status',
    };
  }
}
