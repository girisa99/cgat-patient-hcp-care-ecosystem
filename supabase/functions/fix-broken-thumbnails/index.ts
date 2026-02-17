/**
 * Fix Broken Thumbnails
 * 
 * Scans video_blueprints for:
 * 1. Missing thumbnails (thumbnail_url IS NULL)
 * 2. Expired external URLs (blob.core.windows.net, etc.)
 * 
 * Queues them for regeneration via thumbnail_generation_queue
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Patterns that indicate expired/external URLs
const EXPIRED_URL_PATTERNS = [
  'blob.core.windows.net',  // Azure/OpenAI temporary URLs
  'oaidalleapiprodscus',    // OpenAI DALL-E temporary URLs
  'replicate.delivery',     // Replicate temporary URLs
  'r2.cloudflarestorage',   // Cloudflare R2 temporary URLs
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action = 'scan', limit = 50 } = await req.json().catch(() => ({}));

    console.log(`🔍 Scanning for broken thumbnails (action: ${action})`);

    // Get all blueprints
    const { data: blueprints, error: fetchError } = await supabase
      .from('video_blueprints')
      .select('id, name, thumbnail_url, category')
      .order('created_at', { ascending: true });

    if (fetchError) throw fetchError;

    const results = {
      total: blueprints?.length || 0,
      missing: 0,
      expired: 0,
      valid: 0,
      queued: 0,
      cleared: 0,
      expiredIds: [] as string[],
      missingIds: [] as string[],
    };

    // Categorize thumbnails
    for (const bp of blueprints || []) {
      if (!bp.thumbnail_url) {
        results.missing++;
        results.missingIds.push(bp.id);
      } else if (EXPIRED_URL_PATTERNS.some(pattern => bp.thumbnail_url?.includes(pattern))) {
        results.expired++;
        results.expiredIds.push(bp.id);
      } else if (bp.thumbnail_url.includes('supabase.co')) {
        results.valid++;
      } else {
        // Other URLs - might be valid, might not
        results.valid++;
      }
    }

    console.log(`📊 Scan results: ${results.missing} missing, ${results.expired} expired, ${results.valid} valid`);

    if (action === 'fix') {
      // Clear expired URLs so they show gradient fallback
      if (results.expiredIds.length > 0) {
        const { error: clearError } = await supabase
          .from('video_blueprints')
          .update({ thumbnail_url: null })
          .in('id', results.expiredIds);

        if (clearError) {
          console.error('Failed to clear expired URLs:', clearError);
        } else {
          results.cleared = results.expiredIds.length;
          console.log(`🧹 Cleared ${results.cleared} expired thumbnail URLs`);
        }
      }

      // Queue all missing + cleared for regeneration
      const idsToQueue = [...results.missingIds, ...results.expiredIds].slice(0, limit);
      
      if (idsToQueue.length > 0) {
        // Check which ones are already queued
        const { data: existingQueue } = await supabase
          .from('thumbnail_generation_queue')
          .select('blueprint_id')
          .in('blueprint_id', idsToQueue)
          .in('status', ['pending', 'processing']);

        const existingIds = new Set(existingQueue?.map(q => q.blueprint_id) || []);
        const newIds = idsToQueue.filter(id => !existingIds.has(id));

        if (newIds.length > 0) {
          const queueItems = newIds.map(id => ({
            blueprint_id: id,
            region: 'global',
            status: 'pending',
            attempts: 0,
          }));

          const { error: queueError } = await supabase
            .from('thumbnail_generation_queue')
            .insert(queueItems);

          if (queueError) {
            console.error('Failed to queue thumbnails:', queueError);
          } else {
            results.queued = newIds.length;
            console.log(`📋 Queued ${results.queued} thumbnails for regeneration`);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        ...results,
        message: action === 'fix' 
          ? `Fixed: ${results.cleared} cleared, ${results.queued} queued for regeneration`
          : `Scan: ${results.missing} missing, ${results.expired} expired, ${results.valid} valid`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Fix thumbnails error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
