/**
 * Hook for managing projects (parent of shows/productions)
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Project, ProjectWithShows, ProjectStatus } from '@/types/projects';

export function useProjects() {
  const [projects, setProjects] = useState<ProjectWithShows[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      // Fetch projects with show count
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          *,
          shows (id)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      const transformedProjects: ProjectWithShows[] = (projectsData || []).map((project: any) => ({
        ...project,
        show_count: project.shows?.length || 0,
        shows: undefined, // Don't include full show objects in list view
      }));

      setProjects(transformedProjects);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = async (data: {
    name: string;
    description?: string;
    status?: ProjectStatus;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: newProject, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: data.name,
          description: data.description || null,
          status: data.status || 'active',
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Project created');
      await fetchProjects();
      return newProject as Project;
    } catch (err: any) {
      console.error('Error creating project:', err);
      toast.error('Failed to create project');
      throw err;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast.success('Project updated');
      await fetchProjects();
    } catch (err: any) {
      console.error('Error updating project:', err);
      toast.error('Failed to update project');
      throw err;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Project deleted');
      await fetchProjects();
    } catch (err: any) {
      console.error('Error deleting project:', err);
      toast.error('Failed to delete project');
      throw err;
    }
  };

  const getProjectWithShows = async (projectId: string): Promise<ProjectWithShows | null> => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          shows (
            *,
            show_participants (*),
            show_assets (*)
          )
        `)
        .eq('id', projectId)
        .single();

      if (error) throw error;

      return {
        ...data,
        shows: data.shows?.map((show: any) => ({
          ...show,
          participants: show.show_participants || [],
          assets: show.show_assets || [],
        })) || [],
      } as ProjectWithShows;
    } catch (err: any) {
      console.error('Error fetching project:', err);
      return null;
    }
  };

  return {
    projects,
    isLoading,
    error,
    refresh: fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    getProjectWithShows,
  };
}
