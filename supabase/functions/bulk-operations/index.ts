import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BulkOperationRequest {
  action: 'create_job' | 'process_batch' | 'get_status' | 'cancel_job' | 'get_jobs' | 'retry_failed';
  job_id?: string;
  operation_type?: 'video_generation' | 'audio_processing' | 'image_resize' | 'document_convert' | 'data_export' | 'content_publish';
  items?: Array<Record<string, unknown>>;
  options?: Record<string, unknown>;
  batch_size?: number;
}

interface BulkJob {
  id: string;
  operation_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'paused';
  total_items: number;
  processed_items: number;
  failed_items: number;
  items: Array<Record<string, unknown>>;
  results: Array<Record<string, unknown>>;
  errors: Array<{ item_index: number; error: string }>;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  options: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, job_id, operation_type, items, options, batch_size = 10 } = await req.json() as BulkOperationRequest;

    console.log(`📦 Bulk Operations: ${action}`, { job_id, operation_type, itemCount: items?.length });

    switch (action) {
      case 'create_job': {
        if (!operation_type || !items || items.length === 0) {
          throw new Error('operation_type and items are required');
        }

        const jobId = crypto.randomUUID();
        const job: BulkJob = {
          id: jobId,
          operation_type,
          status: 'pending',
          total_items: items.length,
          processed_items: 0,
          failed_items: 0,
          items,
          results: [],
          errors: [],
          created_at: new Date().toISOString(),
          options: options || {}
        };

        const { error } = await supabase
          .from('bulk_jobs')
          .insert(job);

        if (error) throw error;

        // Start processing in background
        processJobAsync(supabase, jobId, items, operation_type, options || {}, batch_size);

        return new Response(JSON.stringify({
          success: true,
          job_id: jobId,
          status: 'pending',
          total_items: items.length,
          estimated_time_seconds: estimateProcessingTime(operation_type, items.length),
          message: 'Bulk job created and processing started'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'get_status': {
        if (!job_id) throw new Error('job_id is required');

        const { data, error } = await supabase
          .from('bulk_jobs')
          .select('*')
          .eq('id', job_id)
          .single();

        if (error) throw error;

        const progress = data.total_items > 0 
          ? Math.round((data.processed_items / data.total_items) * 100) 
          : 0;

        return new Response(JSON.stringify({
          success: true,
          job: {
            ...data,
            progress_percent: progress,
            is_complete: data.status === 'completed' || data.status === 'failed',
            can_retry: data.failed_items > 0
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'get_jobs': {
        const { data, error } = await supabase
          .from('bulk_jobs')
          .select('id, operation_type, status, total_items, processed_items, failed_items, created_at, started_at, completed_at')
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;

        return new Response(JSON.stringify({
          success: true,
          jobs: data || [],
          count: data?.length || 0
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'cancel_job': {
        if (!job_id) throw new Error('job_id is required');

        const { data, error } = await supabase
          .from('bulk_jobs')
          .update({ 
            status: 'cancelled',
            completed_at: new Date().toISOString()
          })
          .eq('id', job_id)
          .in('status', ['pending', 'processing'])
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({
          success: true,
          job_id,
          status: 'cancelled',
          processed_before_cancel: data?.processed_items || 0
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'retry_failed': {
        if (!job_id) throw new Error('job_id is required');

        const { data: job, error: fetchError } = await supabase
          .from('bulk_jobs')
          .select('*')
          .eq('id', job_id)
          .single();

        if (fetchError) throw fetchError;

        if (job.failed_items === 0) {
          return new Response(JSON.stringify({
            success: false,
            error: 'No failed items to retry'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Get failed item indices
        const failedIndices = job.errors.map((e: any) => e.item_index);
        const failedItems = failedIndices.map((i: number) => job.items[i]);

        // Create new retry job
        const retryJobId = crypto.randomUUID();
        await supabase.from('bulk_jobs').insert({
          id: retryJobId,
          operation_type: job.operation_type,
          status: 'pending',
          total_items: failedItems.length,
          processed_items: 0,
          failed_items: 0,
          items: failedItems,
          results: [],
          errors: [],
          created_at: new Date().toISOString(),
          options: { ...job.options, parent_job_id: job_id, is_retry: true }
        });

        // Start processing
        processJobAsync(supabase, retryJobId, failedItems, job.operation_type, job.options, batch_size);

        return new Response(JSON.stringify({
          success: true,
          retry_job_id: retryJobId,
          items_to_retry: failedItems.length
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('❌ Bulk Operations error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function processJobAsync(
  supabase: any,
  jobId: string,
  items: Array<Record<string, unknown>>,
  operationType: string,
  options: Record<string, unknown>,
  batchSize: number
): Promise<void> {
  try {
    // Update status to processing
    await supabase.from('bulk_jobs').update({
      status: 'processing',
      started_at: new Date().toISOString()
    }).eq('id', jobId);

    const results: Array<Record<string, unknown>> = [];
    const errors: Array<{ item_index: number; error: string }> = [];
    let processedCount = 0;

    // Process in batches
    for (let i = 0; i < items.length; i += batchSize) {
      // Check if job was cancelled
      const { data: jobStatus } = await supabase
        .from('bulk_jobs')
        .select('status')
        .eq('id', jobId)
        .single();

      if (jobStatus?.status === 'cancelled') {
        console.log(`Job ${jobId} was cancelled`);
        break;
      }

      const batch = items.slice(i, i + batchSize);
      
      for (let j = 0; j < batch.length; j++) {
        const itemIndex = i + j;
        try {
          const result = await processItem(operationType, batch[j], options);
          results.push({ index: itemIndex, ...result });
          processedCount++;
        } catch (error) {
          errors.push({
            item_index: itemIndex,
            error: error instanceof Error ? error.message : 'Processing failed'
          });
        }
      }

      // Update progress
      await supabase.from('bulk_jobs').update({
        processed_items: processedCount,
        failed_items: errors.length,
        results,
        errors
      }).eq('id', jobId);
    }

    // Mark as completed
    await supabase.from('bulk_jobs').update({
      status: errors.length === items.length ? 'failed' : 'completed',
      completed_at: new Date().toISOString(),
      processed_items: processedCount,
      failed_items: errors.length,
      results,
      errors
    }).eq('id', jobId);

    console.log(`✅ Bulk job ${jobId} completed: ${processedCount}/${items.length} items processed`);

  } catch (error) {
    console.error(`❌ Bulk job ${jobId} failed:`, error);
    await supabase.from('bulk_jobs').update({
      status: 'failed',
      completed_at: new Date().toISOString()
    }).eq('id', jobId);
  }
}

async function processItem(
  operationType: string,
  item: Record<string, unknown>,
  options: Record<string, unknown>
): Promise<Record<string, unknown>> {
  // Simulate processing based on operation type
  const processingTime = getProcessingTime(operationType);
  await new Promise(resolve => setTimeout(resolve, processingTime));

  switch (operationType) {
    case 'video_generation':
      return {
        status: 'generated',
        video_url: `https://storage.example.com/videos/${crypto.randomUUID()}.mp4`,
        duration_seconds: Math.floor(Math.random() * 120) + 30,
        resolution: '1920x1080'
      };

    case 'audio_processing':
      return {
        status: 'processed',
        audio_url: `https://storage.example.com/audio/${crypto.randomUUID()}.mp3`,
        duration_seconds: Math.floor(Math.random() * 300) + 60,
        format: 'mp3'
      };

    case 'image_resize':
      return {
        status: 'resized',
        image_url: `https://storage.example.com/images/${crypto.randomUUID()}.webp`,
        dimensions: options.target_dimensions || '800x600'
      };

    case 'document_convert':
      return {
        status: 'converted',
        document_url: `https://storage.example.com/docs/${crypto.randomUUID()}.pdf`,
        format: options.target_format || 'pdf'
      };

    case 'data_export':
      return {
        status: 'exported',
        export_url: `https://storage.example.com/exports/${crypto.randomUUID()}.csv`,
        row_count: Math.floor(Math.random() * 10000) + 100
      };

    case 'content_publish':
      return {
        status: 'published',
        published_url: item.target_url || `https://example.com/content/${crypto.randomUUID()}`,
        published_at: new Date().toISOString()
      };

    default:
      return { status: 'processed', item };
  }
}

function getProcessingTime(operationType: string): number {
  const times: Record<string, number> = {
    video_generation: 500,
    audio_processing: 300,
    image_resize: 100,
    document_convert: 200,
    data_export: 150,
    content_publish: 100
  };
  return times[operationType] || 100;
}

function estimateProcessingTime(operationType: string, itemCount: number): number {
  const timePerItem = getProcessingTime(operationType) / 1000;
  return Math.ceil(timePerItem * itemCount * 1.2); // Add 20% buffer
}
