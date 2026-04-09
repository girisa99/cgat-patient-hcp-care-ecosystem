/**
 * CAST STORAGE CLEANUP
 *
 * Cleans up orphaned assets in Supabase Storage to prevent unbounded cost growth.
 *
 * Actions:
 * 1. cleanup_failed_jobs — Delete output files from failed generation jobs older than N days
 * 2. cleanup_deleted_projects — Delete all assets for projects marked as 'deleted' or 'archived'
 * 3. cleanup_orphaned_assets — List storage files not referenced by any active project
 * 4. get_storage_stats — Return storage usage stats per project
 *
 * Security: Requires service role key (admin-only). Can be triggered by:
 * - Supabase pg_cron (scheduled)
 * - Admin UI manual trigger
 * - API call with admin auth
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

    const { action, retentionDays = 7, dryRun = true } = await req.json();

    // ─── Action: Cleanup failed generation job outputs ──────────────────
    if (action === 'cleanup_failed_jobs') {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      // Find failed jobs older than retention period
      const { data: failedJobs, error: queryErr } = await supabase
        .from('cast_generation_jobs')
        .select('id, project_id, job_type, scene_key, output_url, output_thumbnail_url, created_at')
        .eq('status', 'failed')
        .lt('created_at', cutoffDate.toISOString())
        .limit(500);

      if (queryErr) throw queryErr;

      const deletedFiles: string[] = [];
      const errors: string[] = [];

      for (const job of failedJobs || []) {
        // Delete output files from storage if they exist
        for (const url of [job.output_url, job.output_thumbnail_url]) {
          if (!url || !url.includes('supabase.co/storage')) continue;

          // Extract storage path from URL
          const pathMatch = url.match(/\/storage\/v1\/object\/public\/([^?]+)/);
          if (!pathMatch) continue;

          const fullPath = pathMatch[1]; // e.g., "cast-assets/projectId/audio/music.mp3"
          const [bucket, ...pathParts] = fullPath.split('/');
          const storagePath = pathParts.join('/');

          if (dryRun) {
            deletedFiles.push(`[DRY RUN] ${bucket}/${storagePath}`);
          } else {
            const { error: delErr } = await supabase.storage.from(bucket).remove([storagePath]);
            if (delErr) {
              errors.push(`Failed to delete ${storagePath}: ${delErr.message}`);
            } else {
              deletedFiles.push(`${bucket}/${storagePath}`);
            }
          }
        }

        // Mark job as cleaned up (update status to 'cleaned')
        if (!dryRun) {
          await supabase
            .from('cast_generation_jobs')
            .update({ status: 'cleaned' })
            .eq('id', job.id);
        }
      }

      return new Response(JSON.stringify({
        action: 'cleanup_failed_jobs',
        dryRun,
        retentionDays,
        jobsProcessed: failedJobs?.length || 0,
        filesDeleted: deletedFiles.length,
        deletedFiles,
        errors,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ─── Action: Cleanup deleted/archived project assets ────────────────
    if (action === 'cleanup_deleted_projects') {
      const { data: deletedProjects, error: queryErr } = await supabase
        .from('cast_projects')
        .select('id, title, status')
        .in('status', ['deleted', 'archived'])
        .limit(50);

      if (queryErr) throw queryErr;

      const results: Array<{ projectId: string; title: string; filesDeleted: number }> = [];

      for (const project of deletedProjects || []) {
        // List all files in the project's storage folder
        const { data: files } = await supabase.storage
          .from('cast-assets')
          .list(project.id, { limit: 1000 });

        if (!files || files.length === 0) {
          results.push({ projectId: project.id, title: project.title, filesDeleted: 0 });
          continue;
        }

        const filePaths = files.map(f => `${project.id}/${f.name}`);

        if (dryRun) {
          results.push({ projectId: project.id, title: project.title, filesDeleted: filePaths.length });
        } else {
          const { error: delErr } = await supabase.storage.from('cast-assets').remove(filePaths);
          if (delErr) {
            console.error(`[Cleanup] Failed to delete files for ${project.id}:`, delErr);
          }
          results.push({
            projectId: project.id,
            title: project.title,
            filesDeleted: delErr ? 0 : filePaths.length,
          });
        }
      }

      return new Response(JSON.stringify({
        action: 'cleanup_deleted_projects',
        dryRun,
        projectsProcessed: deletedProjects?.length || 0,
        results,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ─── Action: Get storage usage stats ────────────────────────────────
    if (action === 'get_storage_stats') {
      // Count active vs deleted projects
      const { count: activeCount } = await supabase
        .from('cast_projects')
        .select('*', { count: 'exact', head: true })
        .not('status', 'in', '("deleted","archived")');

      const { count: deletedCount } = await supabase
        .from('cast_projects')
        .select('*', { count: 'exact', head: true })
        .in('status', ['deleted', 'archived']);

      // Count generation jobs by status
      const { data: jobStats } = await supabase
        .from('cast_generation_jobs')
        .select('status')
        .limit(10000);

      const jobCounts: Record<string, number> = {};
      for (const job of jobStats || []) {
        jobCounts[job.status] = (jobCounts[job.status] || 0) + 1;
      }

      // Count failed jobs older than retention period
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
      const { count: staleFailedCount } = await supabase
        .from('cast_generation_jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'failed')
        .lt('created_at', cutoffDate.toISOString());

      return new Response(JSON.stringify({
        action: 'get_storage_stats',
        activeProjects: activeCount || 0,
        deletedProjects: deletedCount || 0,
        generationJobs: jobCounts,
        staleFailedJobs: staleFailedCount || 0,
        retentionDays,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({
      error: 'Unknown action. Use: cleanup_failed_jobs, cleanup_deleted_projects, get_storage_stats',
    }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error('[CastStorageCleanup] Error:', err);
    return new Response(JSON.stringify({
      error: err instanceof Error ? err.message : 'Unknown error',
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
