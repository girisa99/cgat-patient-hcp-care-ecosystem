/**
 * useCastProjects — Full CRUD hook for Cast production projects
 *
 * Manages cast_projects and related data (messaging, scripts, jobs).
 * Follows the same pattern as useShows.ts.
 * Bridges useGenieCastSession (localStorage) ↔ database persistence.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type {
  CastProject,
  CastProjectWithRelations,
  CastProjectStatus,
  CreateCastProjectInput,
  UpdateCastProjectInput,
  CastProjectJobStats,
} from '@/types/castProjects';
import type { GenieCastSessionState } from '@/hooks/useGenieCastSession';

// Tables/RPCs not yet in generated Supabase types — use untyped client
const untypedSupabase = supabase as any;

export function useCastProjects() {
  const [projects, setProjects] = useState<CastProjectWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ──────────────────────────────────────────────────────────────────────
  // FETCH
  // ──────────────────────────────────────────────────────────────────────

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProjects([]);
        setIsLoading(false);
        return;
      }

      const { data, error: fetchError } = await untypedSupabase
        .from('cast_projects')
        .select(`
          *,
          cast_generation_jobs (*),
          cast_project_variants (*),
          cast_accessibility_config (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const transformed: CastProjectWithRelations[] = (data || []).map((p: any) => ({
        ...p,
        messaging: [],
        scene_scripts: [],
        generation_jobs: p.cast_generation_jobs || [],
        variants: p.cast_project_variants || [],
        accessibility: p.cast_accessibility_config || null,
        show_links: [],
      }));

      setProjects(transformed);
    } catch (err: any) {
      console.error('[useCastProjects] Error fetching projects:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // ──────────────────────────────────────────────────────────────────────
  // CREATE
  // ──────────────────────────────────────────────────────────────────────

  const createProject = async (input: CreateCastProjectInput): Promise<CastProject | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error: rpcError } = await untypedSupabase.rpc('create_cast_project', {
        p_title: input.title,
        p_user_id: user.id,
        p_blueprint_id: input.blueprint_id ?? null,
        p_style_intent: input.style_intent ?? 'corporate',
        p_intent_value: input.intent_value ?? null,
        p_product_context: input.product_context ?? null,
        p_team_id: input.team_id ?? null,
        p_target_regions: input.target_regions ?? ['global'],
        p_selected_dialects: input.selected_dialects ?? ['en-US'],
      });

      if (rpcError) throw rpcError;

      // Fetch the newly created project
      const projectId = data as string;
      const { data: newProject, error: fetchErr } = await untypedSupabase
        .from('cast_projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (fetchErr) throw fetchErr;

      toast.success('Cast project created');
      await fetchProjects();
      return newProject as unknown as CastProject;
    } catch (err: any) {
      console.error('[useCastProjects] Error creating project:', err);
      toast.error('Failed to create cast project');
      throw err;
    }
  };

  // ──────────────────────────────────────────────────────────────────────
  // UPDATE
  // ──────────────────────────────────────────────────────────────────────

  const updateProject = async (id: string, updates: UpdateCastProjectInput) => {
    try {
      const { error: updateError } = await untypedSupabase
        .from('cast_projects')
        .update(updates as any)
        .eq('id', id);

      if (updateError) throw updateError;

      toast.success('Project updated');
      await fetchProjects();
    } catch (err: any) {
      console.error('[useCastProjects] Error updating project:', err);
      toast.error('Failed to update project');
      throw err;
    }
  };

  // ──────────────────────────────────────────────────────────────────────
  // DELETE
  // ──────────────────────────────────────────────────────────────────────

  const deleteProject = async (id: string) => {
    try {
      const { error: deleteError } = await untypedSupabase
        .from('cast_projects')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      toast.success('Project deleted');
      await fetchProjects();
    } catch (err: any) {
      console.error('[useCastProjects] Error deleting project:', err);
      toast.error('Failed to delete project');
      throw err;
    }
  };

  // ──────────────────────────────────────────────────────────────────────
  // ADVANCE STAGE
  // ──────────────────────────────────────────────────────────────────────

  const advanceStage = async (
    id: string,
    newStage: string,
    newStatus?: CastProjectStatus,
  ) => {
    try {
      const { error: rpcError } = await untypedSupabase.rpc('advance_cast_project_stage', {
        p_project_id: id,
        p_new_stage: newStage,
        p_new_status: newStatus ?? null,
      });

      if (rpcError) throw rpcError;

      const displayName = newStage.replace(/_/g, ' ');
      toast.success(`Advanced to ${displayName}`);
      await fetchProjects();
    } catch (err: any) {
      console.error('[useCastProjects] Error advancing stage:', err);
      toast.error('Failed to advance stage');
      throw err;
    }
  };

  // ──────────────────────────────────────────────────────────────────────
  // JOB STATS
  // ──────────────────────────────────────────────────────────────────────

  const getProjectJobStats = async (projectId: string): Promise<CastProjectJobStats | null> => {
    try {
      const { data, error: rpcError } = await untypedSupabase.rpc('get_cast_project_job_stats', {
        p_project_id: projectId,
      });

      if (rpcError) throw rpcError;
      return data as unknown as CastProjectJobStats;
    } catch (err: any) {
      console.error('[useCastProjects] Error fetching job stats:', err);
      return null;
    }
  };

  // ──────────────────────────────────────────────────────────────────────
  // SESSION SYNC: localStorage → DB
  // ──────────────────────────────────────────────────────────────────────

  const syncFromSession = async (
    session: GenieCastSessionState,
    existingProjectId?: string,
  ): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const projectData: UpdateCastProjectInput = {
        blueprint_id: session.selectedTemplate?.id ?? undefined,
        style_intent: session.selectedTemplate?.styleIntent ?? 'corporate',
        selected_styles: session.selectedStyles,
        target_regions: session.targetRegions,
        selected_dialects: session.selectedDialects,
        intent_value: session.selectedIntent ?? undefined,
        product_context: session.selectedProductId ?? undefined,
        current_stage: session.currentStage,
        completed_stages: session.completedStages,
      };

      if (existingProjectId) {
        // Update existing project
        await updateProject(existingProjectId, projectData);
        return existingProjectId;
      } else {
        // Create new project from session
        const title = session.selectedTemplate?.name
          ? `Cast: ${session.selectedTemplate.name}`
          : `Cast Project ${new Date().toLocaleDateString()}`;

        const project = await createProject({
          title,
          blueprint_id: session.selectedTemplate?.id,
          style_intent: session.selectedTemplate?.styleIntent ?? 'corporate',
          intent_value: session.selectedIntent ?? undefined,
          product_context: session.selectedProductId ?? undefined,
          target_regions: session.targetRegions,
          selected_dialects: session.selectedDialects,
        });

        if (project) {
          // Sync remaining fields that createProject RPC doesn't cover
          await untypedSupabase
            .from('cast_projects')
            .update({
              selected_styles: session.selectedStyles,
              current_stage: session.currentStage,
              completed_stages: session.completedStages,
            } as any)
            .eq('id', project.id);
        }

        return project?.id ?? null;
      }
    } catch (err: any) {
      console.error('[useCastProjects] Error syncing from session:', err);
      toast.error('Failed to save project');
      return null;
    }
  };

  // ──────────────────────────────────────────────────────────────────────
  // SESSION RESTORE: DB → session state shape
  // ──────────────────────────────────────────────────────────────────────

  const restoreToSession = async (
    projectId: string,
  ): Promise<(Partial<GenieCastSessionState> & { _categoryId?: string | null; _formatId?: string | null; _subFormatId?: string | null }) | null> => {
    try {
      const { data: project, error: fetchErr } = await untypedSupabase
        .from('cast_projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (fetchErr || !project) throw fetchErr || new Error('Project not found');

      const p = project as unknown as CastProject;

      return {
        selectedProductId: p.product_context ?? null,
        selectedIntent: p.intent_value || p.content_type || 'video',
        selectedStyles: p.selected_styles || [],
        selectedTemplate: p.blueprint_id
          ? {
              id: p.blueprint_id,
              name: p.title,
              category: '',
              sceneCount: 0,
              estimatedDuration: p.total_duration_seconds ?? 0,
              styleIntent: p.style_intent as any,
              targetRegions: p.target_regions,
            }
          : null,
        targetRegions: (p.target_regions || ['global']) as any,
        selectedDialects: p.selected_dialects || ['en-US'],
        currentStage: p.current_stage as any,
        completedStages: (p.completed_stages || []) as any,
        // Pass category/format/sub-format IDs for UI restoration
        _categoryId: (p as any).category_id ?? null,
        _formatId: (p as any).format_id ?? null,
        _subFormatId: (p as any).sub_format_id ?? null,
      };
    } catch (err: any) {
      console.error('[useCastProjects] Error restoring session:', err);
      return null;
    }
  };

  // ──────────────────────────────────────────────────────────────────────
  // HELPERS
  // ──────────────────────────────────────────────────────────────────────

  const getProjectsByStatus = useCallback(
    (status: CastProjectStatus) => projects.filter((p) => p.status === status),
    [projects],
  );

  const getActiveProjects = useCallback(
    () =>
      projects.filter(
        (p) => !['archived', 'published'].includes(p.status),
      ),
    [projects],
  );

  return {
    projects,
    isLoading,
    error,
    refresh: fetchProjects,

    // CRUD
    createProject,
    updateProject,
    deleteProject,

    // Lifecycle
    advanceStage,
    getProjectJobStats,

    // Session sync
    syncFromSession,
    restoreToSession,

    // Helpers
    getProjectsByStatus,
    getActiveProjects,
  };
}
