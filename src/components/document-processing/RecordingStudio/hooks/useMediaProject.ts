/**
 * Media Project Hook - Track costs and assets for recording studio
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MediaProject {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  status: 'active' | 'completed' | 'archived';
  total_estimated_cost: number;
  tts_cost: number;
  music_generation_cost: number;
  transcription_cost: number;
  storage_cost: number;
  ai_enhancement_cost: number;
  total_recordings: number;
  total_tts_generations: number;
  total_music_generations: number;
  total_transcriptions: number;
  total_script_enhancements: number;
  total_duration_seconds: number;
  total_storage_bytes: number;
  tags: string[] | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface MediaProjectAsset {
  id: string;
  project_id: string;
  user_id: string;
  asset_type: 'recording' | 'script' | 'voiceover' | 'tts' | 'music' | 'transcription' | 'enhancement';
  asset_id: string;
  asset_name: string;
  asset_url: string | null;
  cost: number;
  cost_details: Record<string, unknown>;
  duration_seconds: number | null;
  file_size_bytes: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface CostLog {
  operation_type: 'tts' | 'music_gen' | 'transcription' | 'script_analysis' | 'script_enhancement' | 'storage' | 'recording';
  operation_name: string;
  cost: number;
  provider?: string;
  model?: string;
  duration_seconds?: number;
  characters_processed?: number;
  metadata?: Record<string, unknown>;
}

// Cost estimates per operation (in USD)
export const COST_ESTIMATES = {
  tts: {
    openai: 0.015, // per 1K characters
    elevenlabs: 0.03, // per 1K characters (premium)
  },
  music_gen: {
    elevenlabs: 0.05, // per generation (30s)
  },
  transcription: {
    openai: 0.006, // per minute
  },
  script_analysis: {
    gemini: 0.001, // per 1K tokens
  },
  script_enhancement: {
    gemini: 0.002, // per 1K tokens
  },
  storage: {
    supabase: 0.000001, // per MB per month
  },
};

export function useMediaProject() {
  const [projects, setProjects] = useState<MediaProject[]>([]);
  const [currentProject, setCurrentProject] = useState<MediaProject | null>(null);
  const [assets, setAssets] = useState<MediaProjectAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalSessionCost, setTotalSessionCost] = useState(0);

  // Load projects for current user
  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('media_projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Cast the data to our type
      const typedProjects = (data || []).map(p => ({
        ...p,
        status: p.status as 'active' | 'completed' | 'archived',
        settings: p.settings as Record<string, unknown>,
        tags: p.tags as string[] | null,
      })) as MediaProject[];
      
      setProjects(typedProjects);
      
      // Auto-select first active project
      const activeProject = typedProjects.find(p => p.status === 'active');
      if (activeProject && !currentProject) {
        setCurrentProject(activeProject);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentProject]);

  // Create new project
  const createProject = useCallback(async (name: string, description?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('media_projects')
        .insert({
          user_id: user.id,
          name,
          description: description || null,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;
      
      const newProject = {
        ...data,
        status: data.status as 'active' | 'completed' | 'archived',
        settings: data.settings as Record<string, unknown>,
        tags: data.tags as string[] | null,
      } as MediaProject;
      
      setProjects(prev => [newProject, ...prev]);
      setCurrentProject(newProject);
      toast.success(`Project "${name}" created!`);
      return newProject;
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
      return null;
    }
  }, []);

  // Select project
  const selectProject = useCallback((projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setCurrentProject(project);
      loadProjectAssets(projectId);
    }
  }, [projects]);

  // Load project assets
  const loadProjectAssets = useCallback(async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('media_project_assets')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const typedAssets = (data || []).map(a => ({
        ...a,
        asset_type: a.asset_type as MediaProjectAsset['asset_type'],
        cost_details: a.cost_details as Record<string, unknown>,
        metadata: a.metadata as Record<string, unknown>,
      })) as MediaProjectAsset[];
      
      setAssets(typedAssets);
    } catch (error) {
      console.error('Error loading assets:', error);
    }
  }, []);

  // Add asset to project
  const addAsset = useCallback(async (
    assetType: MediaProjectAsset['asset_type'],
    assetId: string,
    assetName: string,
    options?: {
      assetUrl?: string;
      cost?: number;
      costDetails?: Record<string, unknown>;
      durationSeconds?: number;
      fileSizeBytes?: number;
      metadata?: Record<string, unknown>;
    }
  ) => {
    if (!currentProject) {
      console.warn('No project selected, asset not tracked');
      return null;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Use any to bypass type checking until types are regenerated
      const insertData = {
        project_id: currentProject.id,
        user_id: user.id,
        asset_type: assetType,
        asset_id: assetId,
        asset_name: assetName,
        asset_url: options?.assetUrl || null,
        cost: options?.cost || 0,
        cost_details: options?.costDetails || {},
        duration_seconds: options?.durationSeconds || null,
        file_size_bytes: options?.fileSizeBytes || null,
        metadata: options?.metadata || {},
      };
      
      const { data, error } = await supabase
        .from('media_project_assets' as any)
        .insert(insertData as any)
        .select()
        .single();

      if (error) throw error;
      
      // Cast to our type directly since types aren't regenerated yet
      const typedAsset = {
        id: (data as any).id,
        project_id: (data as any).project_id,
        user_id: (data as any).user_id,
        asset_type: (data as any).asset_type as MediaProjectAsset['asset_type'],
        asset_id: (data as any).asset_id,
        asset_name: (data as any).asset_name,
        asset_url: (data as any).asset_url,
        cost: (data as any).cost,
        cost_details: (data as any).cost_details as Record<string, unknown>,
        duration_seconds: (data as any).duration_seconds,
        file_size_bytes: (data as any).file_size_bytes,
        metadata: (data as any).metadata as Record<string, unknown>,
        created_at: (data as any).created_at,
      } as MediaProjectAsset;
      
      setAssets(prev => [typedAsset, ...prev]);
      
      // Update session cost
      if (options?.cost) {
        setTotalSessionCost(prev => prev + options.cost);
      }

      return typedAsset;
    } catch (error) {
      console.error('Error adding asset:', error);
      return null;
    }
  }, [currentProject]);

  // Log cost
  const logCost = useCallback(async (log: CostLog) => {
    if (!currentProject) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const logInsertData = {
        project_id: currentProject.id,
        user_id: user.id,
        operation_type: log.operation_type,
        operation_name: log.operation_name,
        cost: log.cost,
        provider: log.provider || null,
        model: log.model || null,
        duration_seconds: log.duration_seconds || null,
        characters_processed: log.characters_processed || null,
        metadata: log.metadata || {},
      };
      
      await supabase
        .from('media_project_cost_logs' as any)
        .insert(logInsertData as any);

      // Update project totals
      const updateData: Record<string, unknown> = {};
      
      switch (log.operation_type) {
        case 'tts':
          updateData.tts_cost = (currentProject.tts_cost || 0) + log.cost;
          updateData.total_tts_generations = (currentProject.total_tts_generations || 0) + 1;
          break;
        case 'music_gen':
          updateData.music_generation_cost = (currentProject.music_generation_cost || 0) + log.cost;
          updateData.total_music_generations = (currentProject.total_music_generations || 0) + 1;
          break;
        case 'transcription':
          updateData.transcription_cost = (currentProject.transcription_cost || 0) + log.cost;
          updateData.total_transcriptions = (currentProject.total_transcriptions || 0) + 1;
          break;
        case 'script_enhancement':
        case 'script_analysis':
          updateData.ai_enhancement_cost = (currentProject.ai_enhancement_cost || 0) + log.cost;
          updateData.total_script_enhancements = (currentProject.total_script_enhancements || 0) + 1;
          break;
        case 'recording':
          updateData.total_recordings = (currentProject.total_recordings || 0) + 1;
          if (log.duration_seconds) {
            updateData.total_duration_seconds = (currentProject.total_duration_seconds || 0) + log.duration_seconds;
          }
          break;
      }

      updateData.total_estimated_cost = 
        (currentProject.tts_cost || 0) + 
        (currentProject.music_generation_cost || 0) + 
        (currentProject.transcription_cost || 0) + 
        (currentProject.storage_cost || 0) + 
        (currentProject.ai_enhancement_cost || 0) + 
        log.cost;

      await supabase
        .from('media_projects')
        .update(updateData)
        .eq('id', currentProject.id);

      // Update local state
      setCurrentProject(prev => prev ? { ...prev, ...updateData } as MediaProject : null);
      setTotalSessionCost(prev => prev + log.cost);

    } catch (error) {
      console.error('Error logging cost:', error);
    }
  }, [currentProject]);

  // Calculate cost for TTS
  const calculateTTSCost = useCallback((text: string, provider: 'openai' | 'elevenlabs') => {
    const charCount = text.length;
    const costPer1K = COST_ESTIMATES.tts[provider];
    return (charCount / 1000) * costPer1K;
  }, []);

  // Calculate cost for music generation
  const calculateMusicCost = useCallback((durationSeconds: number) => {
    // ElevenLabs charges per generation (approx 30s)
    const generations = Math.ceil(durationSeconds / 30);
    return generations * COST_ESTIMATES.music_gen.elevenlabs;
  }, []);

  // Calculate cost for transcription
  const calculateTranscriptionCost = useCallback((durationSeconds: number) => {
    const minutes = durationSeconds / 60;
    return minutes * COST_ESTIMATES.transcription.openai;
  }, []);

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return {
    projects,
    currentProject,
    assets,
    isLoading,
    totalSessionCost,
    loadProjects,
    createProject,
    selectProject,
    loadProjectAssets,
    addAsset,
    logCost,
    calculateTTSCost,
    calculateMusicCost,
    calculateTranscriptionCost,
    COST_ESTIMATES,
  };
}
