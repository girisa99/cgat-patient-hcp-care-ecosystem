/**
 * useCompositionSync - Database-first sync for composition projects
 * Handles bidirectional sync between client state and Supabase
 */

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types matching the database schema
export interface CompositionChapter {
  id: string;
  project_id?: string;
  chapter_order: number;
  title: string;
  status: 'draft' | 'generating' | 'complete' | 'error';
  duration: number;
  visual_types: string[];
  script_content?: string;
  script_source: 'auto' | 'manual';
  ai_suggested_prompt?: string;
  custom_prompt?: string;
  script_confidence_score?: number;
  voice_source: 'tts' | 'upload' | 'clone';
  audio_by_language?: Record<string, {
    languageCode: string;
    languageName: string;
    audioUrl?: string;
    duration?: number;
    provider?: string;
    confidenceScore?: number;
    status: 'pending' | 'generating' | 'complete' | 'error';
  }>;
  audio_confidence_score?: number;
  video_url?: string;
  preview_url?: string;
  video_provider?: string;
  video_confidence_score?: number;
  music_source: 'ai' | 'upload' | 'none';
  music_url?: string;
  music_provider?: string;
  feedback?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CompositionProject {
  id: string;
  user_id?: string;
  name: string;
  status: 'draft' | 'generating' | 'review' | 'approved' | 'published';
  primary_language: string;
  additional_languages: string[];
  template_ids: string[];
  output_mode: 'combined' | 'individual';
  total_duration?: number;
  overall_confidence_score?: number;
  created_at?: string;
  updated_at?: string;
  // Client-side only
  chapters?: CompositionChapter[];
}

// Local storage keys for offline support
const PROJECTS_CACHE_KEY = 'composition_projects_cache';
const SYNC_QUEUE_KEY = 'composition_sync_queue';

export const useCompositionSync = () => {
  const queryClient = useQueryClient();
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch all projects from database
  const { 
    data: projects, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['composition-projects'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Return cached data if not authenticated
        const cached = localStorage.getItem(PROJECTS_CACHE_KEY);
        return cached ? JSON.parse(cached) : [];
      }

      const { data, error } = await supabase
        .from('composition_projects')
        .select(`
          *,
          composition_chapters (*)
        `)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('[CompositionSync] Fetch error:', error);
        throw error;
      }

      // Cache for offline access
      localStorage.setItem(PROJECTS_CACHE_KEY, JSON.stringify(data || []));
      
      return (data || []) as CompositionProject[];
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });

  // Save project to database
  const saveProject = useMutation({
    mutationFn: async (project: Omit<CompositionProject, 'id' | 'user_id' | 'created_at' | 'updated_at'> & { id?: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Please sign in to save projects');
      }

      const projectData = {
        name: project.name,
        status: project.status || 'draft',
        primary_language: project.primary_language,
        additional_languages: project.additional_languages || [],
        template_ids: project.template_ids || [],
        output_mode: project.output_mode || 'combined',
        total_duration: project.total_duration,
        overall_confidence_score: project.overall_confidence_score,
        user_id: session.user.id,
      };

      let savedProject: any;

      if (project.id) {
        // Update existing
        const { data, error } = await supabase
          .from('composition_projects')
          .update(projectData)
          .eq('id', project.id)
          .select()
          .single();
        
        if (error) throw error;
        savedProject = data;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('composition_projects')
          .insert(projectData)
          .select()
          .single();
        
        if (error) throw error;
        savedProject = data;
      }

      // Save chapters if provided
      if (project.chapters && project.chapters.length > 0) {
        await saveChapters(savedProject.id, project.chapters);
      }

      return savedProject;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['composition-projects'] });
      toast.success(`Project "${data.name}" saved to database`);
    },
    onError: (error) => {
      console.error('[CompositionSync] Save error:', error);
      toast.error('Failed to save project: ' + (error as Error).message);
    },
  });

  // Save chapters for a project
  const saveChapters = async (projectId: string, chapters: CompositionChapter[]) => {
    // Delete existing chapters first (upsert approach)
    await supabase
      .from('composition_chapters')
      .delete()
      .eq('project_id', projectId);

    // Insert all chapters
    const chaptersData = chapters.map((ch, index) => ({
      project_id: projectId,
      chapter_order: index,
      title: ch.title,
      status: ch.status || 'draft',
      duration: ch.duration,
      visual_types: ch.visual_types || [],
      script_content: ch.script_content,
      script_source: ch.script_source || 'auto',
      ai_suggested_prompt: ch.ai_suggested_prompt,
      custom_prompt: ch.custom_prompt,
      script_confidence_score: ch.script_confidence_score,
      voice_source: ch.voice_source || 'tts',
      audio_by_language: ch.audio_by_language,
      audio_confidence_score: ch.audio_confidence_score,
      video_url: ch.video_url,
      preview_url: ch.preview_url,
      video_provider: ch.video_provider,
      video_confidence_score: ch.video_confidence_score,
      music_source: ch.music_source || 'none',
      music_url: ch.music_url,
      music_provider: ch.music_provider,
      feedback: ch.feedback,
    }));

    const { error } = await supabase
      .from('composition_chapters')
      .insert(chaptersData);

    if (error) {
      console.error('[CompositionSync] Chapters save error:', error);
      throw error;
    }
  };

  // Delete project
  const deleteProject = useMutation({
    mutationFn: async (projectId: string) => {
      // Chapters are deleted via CASCADE or we delete them first
      await supabase
        .from('composition_chapters')
        .delete()
        .eq('project_id', projectId);

      const { error } = await supabase
        .from('composition_projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['composition-projects'] });
      toast.success('Project deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete project: ' + (error as Error).message);
    },
  });

  // Sync local projects to database (for migration)
  const syncLocalToDatabase = useCallback(async () => {
    setIsSyncing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to sync projects');
        return;
      }

      // Get local projects from various storage keys
      const localProjects: any[] = [];
      
      // Check main storage key
      const mainStorage = localStorage.getItem('studio_projects_history');
      if (mainStorage) {
        try {
          const parsed = JSON.parse(mainStorage);
          if (Array.isArray(parsed)) {
            localProjects.push(...parsed);
          }
        } catch (e) {
          console.warn('[CompositionSync] Failed to parse main storage');
        }
      }

      // Check legacy keys
      const legacyKeys = ['composition_studio_projects', 'simple_studio_draft', 'studio_draft'];
      for (const key of legacyKeys) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) {
              localProjects.push(...parsed);
            } else if (parsed && typeof parsed === 'object' && (parsed.projectName || parsed.name)) {
              localProjects.push(parsed);
            }
          } catch (e) {
            console.warn(`[CompositionSync] Failed to parse ${key}`);
          }
        }
      }

      if (localProjects.length === 0) {
        toast.info('No local projects to sync');
        return;
      }

      let synced = 0;
      for (const localProject of localProjects) {
        try {
          // Convert to database format
          const dbProject = {
            name: localProject.projectName || localProject.name || 'Imported Project',
            status: 'draft' as const,
            primary_language: localProject.primaryLanguage || 'en',
            additional_languages: localProject.additionalLanguages || [],
            template_ids: localProject.selectedTemplates || [],
            output_mode: (localProject.outputMode || 'combined') as 'combined' | 'individual',
            total_duration: localProject.chapters?.reduce((sum: number, c: any) => sum + (c.duration || 0), 0),
            chapters: localProject.chapters?.map((ch: any, idx: number) => ({
              chapter_order: idx,
              title: ch.title || `Chapter ${idx + 1}`,
              status: ch.status || 'draft',
              duration: ch.duration || 30,
              visual_types: ch.visualTypes || ['video'],
              script_content: ch.script || ch.generatedContent?.script,
              script_source: ch.scriptSource || 'auto',
              ai_suggested_prompt: ch.aiSuggestedPrompt,
              custom_prompt: ch.customPrompt,
              voice_source: ch.voiceSource || 'tts',
              video_url: ch.generatedContent?.videoUrl,
              preview_url: ch.generatedContent?.previewUrl,
              music_source: ch.musicSource || 'none',
              music_url: ch.generatedContent?.musicUrl,
            })) || [],
          };

          await saveProject.mutateAsync(dbProject);
          synced++;
        } catch (e) {
          console.error('[CompositionSync] Failed to sync project:', localProject.projectName, e);
        }
      }

      toast.success(`Synced ${synced} of ${localProjects.length} projects to database`);
    } catch (error) {
      console.error('[CompositionSync] Sync error:', error);
      toast.error('Sync failed: ' + (error as Error).message);
    } finally {
      setIsSyncing(false);
    }
  }, [saveProject]);

  // Get a single project by ID
  const getProject = useCallback((id: string): CompositionProject | undefined => {
    return projects?.find(p => p.id === id);
  }, [projects]);

  // Search projects by name
  const searchProjects = useCallback((query: string): CompositionProject[] => {
    if (!query.trim() || !projects) return projects || [];
    const lower = query.toLowerCase();
    return projects.filter(p => p.name.toLowerCase().includes(lower));
  }, [projects]);

  return {
    // Data
    projects: projects || [],
    isLoading,
    error,
    
    // Mutations
    saveProject: saveProject.mutate,
    saveProjectAsync: saveProject.mutateAsync,
    deleteProject: deleteProject.mutate,
    
    // Utilities
    refetch,
    syncLocalToDatabase,
    getProject,
    searchProjects,
    
    // Status
    isSaving: saveProject.isPending,
    isDeleting: deleteProject.isPending,
    isSyncing,
  };
};

export default useCompositionSync;
