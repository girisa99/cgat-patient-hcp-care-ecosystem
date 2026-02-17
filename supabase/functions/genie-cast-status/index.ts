/**
 * GENIE CAST STATUS CHECKER
 * 
 * Checks the status of pending JSON2Video jobs and updates the database
 * when videos complete. Called by client-side polling to handle videos
 * that took longer than the edge function timeout.
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
    
    const json2videoApiKey = Deno.env.get('JSON2VIDEO_API_KEY');
    
    if (!json2videoApiKey) {
      throw new Error('JSON2VIDEO_API_KEY not configured');
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

      // Poll the external provider if we have a provider_job_id
      if (job.provider_job_id && json2videoApiKey) {
        const providerStatus = await checkJson2VideoStatus(job.provider_job_id, json2videoApiKey);

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

        // Still processing — update progress
        if (providerStatus.progress) {
          await supabase.from('cast_generation_jobs').update({
            progress_percent: providerStatus.progress,
          }).eq('id', castJobId);
        }

        return new Response(JSON.stringify({
          success: true,
          job: {
            id: castJobId,
            status: 'processing',
            progressPercent: providerStatus.progress || job.progress_percent || 0,
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

    // If specific video ID provided, check just that one
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

      // If already completed or no project ID, return current status
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

      // Poll JSON2Video for status
      const status = await checkJson2VideoStatus(video.render_project_id, json2videoApiKey);
      
      if (status.completed) {
        // Update database with completed video
        const { error: updateError } = await supabase
          .from('landing_page_videos')
          .update({
            generation_status: 'completed',
            video_url: status.videoUrl,
            thumbnail_url: status.thumbnailUrl,
            duration_seconds: status.duration || video.duration_seconds,
            updated_at: new Date().toISOString(),
          })
          .eq('id', video.id);
        
        if (updateError) {
          console.error('Failed to update video:', updateError);
        }
        
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
        // Update with error
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
      
      // Still processing
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
    
    // If project ID provided directly (for checking new jobs)
    if (projectId) {
      const status = await checkJson2VideoStatus(projectId, json2videoApiKey);
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
    
    // Check all pending videos
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
        const status = await checkJson2VideoStatus(video.render_project_id, json2videoApiKey);
        
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

async function checkJson2VideoStatus(projectId: string, apiKey: string): Promise<{
  completed: boolean;
  failed: boolean;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  progress?: number;
  error?: string;
}> {
  try {
    const response = await fetch(`https://api.json2video.com/v2/movies?project=${projectId}`, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
      },
    });
    
    if (!response.ok) {
      console.error(`JSON2Video API error: ${response.status}`);
      return { completed: false, failed: true, error: `API error: ${response.status}` };
    }
    
    const data = await response.json();
    console.log(`📹 JSON2Video status for ${projectId}:`, JSON.stringify(data).substring(0, 200));
    
    // Handle array response (list of movies for project)
    const movie = Array.isArray(data) ? data[0] : data;
    
    if (!movie) {
      return { completed: false, failed: false, progress: 0 };
    }
    
    const status = movie.status?.toLowerCase() || movie.render_status?.toLowerCase();
    
    if (status === 'done' || status === 'completed' || status === 'finished') {
      return {
        completed: true,
        failed: false,
        videoUrl: movie.url || movie.movie_url || movie.output_url,
        thumbnailUrl: movie.thumbnail || movie.poster,
        duration: movie.duration,
      };
    }
    
    if (status === 'failed' || status === 'error') {
      return {
        completed: false,
        failed: true,
        error: movie.error || movie.message || 'Render failed',
      };
    }
    
    // Still processing
    return {
      completed: false,
      failed: false,
      progress: movie.progress || movie.percent || 0,
    };
    
  } catch (error) {
    console.error('Error checking JSON2Video status:', error);
    return {
      completed: false,
      failed: true,
      error: error instanceof Error ? error.message : 'Failed to check status',
    };
  }
}
