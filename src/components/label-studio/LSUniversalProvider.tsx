/**
 * Label Studio Universal Provider
 * Provides LS context and training capabilities across the entire Genie Suite ecosystem
 * Works seamlessly on both desktop and mobile
 */

import React, { createContext, useContext, useState, useCallback, useRef, useMemo } from 'react';
import { useLabelStudio, LSProject } from '@/hooks/useLabelStudio';
import { toast } from 'sonner';

// Training data types for different features
export type LSTrainingType = 
  // Script & Content
  | 'script_quality' 
  | 'script_enhancement'
  | 'content_generation'
  // Video & Visual
  | 'video_trimming' 
  | 'scene_detection'
  | 'background_segmentation'
  | 'avatar_quality'
  // Audio & Voice
  | 'audio_quality' 
  | 'voice_emotion'
  | 'tts_quality'
  | 'voice_cloning'
  | 'transcription_accuracy'
  // Editing & Production
  | 'clip_ranking' 
  | 'auto_edit'
  | 'transition_quality'
  | 'music_sync'
  // Content Intelligence
  | 'content_tagging'
  | 'competitive_analysis'
  | 'thumbnail_quality'
  // AI Assistance
  | 'genie_response_quality'
  | 'suggestion_relevance'
  // Cast Pipeline
  | 'cast_format_selection'
  | 'cast_style_selection'
  | 'cast_generation'
  | 'cast_scene_edit'
  | 'cast_review_approval'
  | 'cast_publish'
  | 'cast_pipeline_performance';

export interface LSTrainingData {
  id: string;
  type: LSTrainingType;
  source: 'spark' | 'script' | 'tts' | 'vibe' | 'mobile' | 'production' | 'ask_genie' | 'arch' | 'cast';
  platform: 'desktop' | 'mobile' | 'tablet';
  data: Record<string, any>;
  metadata?: Record<string, any>;
  labels?: Record<string, any>;
  capturedAt: Date;
}

export interface LSProjectMapping {
  type: LSTrainingType;
  projectId?: number;
  projectName: string;
  autoCapture: boolean;
  minConfidence?: number;
}

interface LSUniversalContextValue {
  // State
  isEnabled: boolean;
  isCapturing: boolean;
  capturedData: LSTrainingData[];
  projects: LSProject[];
  projectMappings: LSProjectMapping[];
  
  // Actions
  enableLS: () => void;
  disableLS: () => void;
  captureData: (data: Omit<LSTrainingData, 'id' | 'capturedAt'>) => void;
  uploadToProject: (dataId: string, projectId: number) => Promise<void>;
  bulkUpload: (dataIds: string[], projectId: number) => Promise<void>;
  clearCaptured: () => void;
  
  // Project Management
  loadProjects: () => Promise<void>;
  setProjectMapping: (type: LSTrainingType, projectId: number) => void;
  
  // Quick Actions
  captureScript: (content: string, metadata?: Record<string, any>) => void;
  captureAudio: (audioUrl: string, transcription?: string, metadata?: Record<string, any>) => void;
  captureVideo: (frames: string[], metadata?: Record<string, any>) => void;
  captureClip: (clipData: any, rating?: number, metadata?: Record<string, any>) => void;
  captureAIResponse: (prompt: string, response: string, rating?: number) => void;
}

const LSUniversalContext = createContext<LSUniversalContextValue | null>(null);

export const useLSUniversal = () => {
  const ctx = useContext(LSUniversalContext);
  if (!ctx) {
    throw new Error('useLSUniversal must be used within LSUniversalProvider');
  }
  return ctx;
};

// Optional hook that returns null if not in provider
export const useLSUniversalOptional = () => {
  return useContext(LSUniversalContext);
};

interface LSUniversalProviderProps {
  children: React.ReactNode;
  autoEnable?: boolean;
}

export const LSUniversalProvider: React.FC<LSUniversalProviderProps> = ({
  children,
  autoEnable = false,
}) => {
  const [isEnabled, setIsEnabled] = useState(autoEnable);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedData, setCapturedData] = useState<LSTrainingData[]>([]);
  const [projects, setProjects] = useState<LSProject[]>([]);
  const [projectMappings, setProjectMappings] = useState<LSProjectMapping[]>([]);
  
  const { listProjects, bulkImportTasks, loading } = useLabelStudio();
  const dataIdCounter = useRef(0);

  // Detect platform
  const platform = useMemo(() => {
    if (typeof window === 'undefined') return 'desktop';
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }, []);

  const enableLS = useCallback(() => {
    setIsEnabled(true);
    toast.success('Label Studio training enabled', {
      description: 'Training data will be captured for AI improvement'
    });
  }, []);

  const disableLS = useCallback(() => {
    setIsEnabled(false);
    toast.info('Label Studio training disabled');
  }, []);

  const captureData = useCallback((data: Omit<LSTrainingData, 'id' | 'capturedAt'>) => {
    if (!isEnabled) return;
    
    const newData: LSTrainingData = {
      ...data,
      id: `ls-${Date.now()}-${dataIdCounter.current++}`,
      capturedAt: new Date(),
      platform: data.platform || platform,
      metadata: {
        ...data.metadata,
        timestamp: new Date(),
      },
    };
    
    setCapturedData(prev => [...prev, newData]);
    setIsCapturing(true);
    setTimeout(() => setIsCapturing(false), 500);
  }, [isEnabled, platform]);

  const loadProjects = useCallback(async () => {
    try {
      const projectList = await listProjects();
      setProjects(projectList);
    } catch (error) {
      console.error('Failed to load LS projects:', error);
    }
  }, [listProjects]);

  const setProjectMapping = useCallback((type: LSTrainingType, projectId: number) => {
    setProjectMappings(prev => {
      const existing = prev.find(m => m.type === type);
      if (existing) {
        return prev.map(m => m.type === type ? { ...m, projectId } : m);
      }
      return [...prev, { type, projectId, projectName: '', autoCapture: true }];
    });
  }, []);

  const uploadToProject = useCallback(async (dataId: string, projectId: number) => {
    const data = capturedData.find(d => d.id === dataId);
    if (!data) return;
    
    try {
      await bulkImportTasks(projectId, [{
        data: {
          ...data.data,
          type: data.type,
          source: data.source,
          platform: data.platform,
          metadata: data.metadata,
        }
      }]);
      
      setCapturedData(prev => prev.filter(d => d.id !== dataId));
      toast.success('Training data uploaded to Label Studio');
    } catch (error) {
      toast.error('Failed to upload training data');
    }
  }, [capturedData, bulkImportTasks]);

  const bulkUpload = useCallback(async (dataIds: string[], projectId: number) => {
    const dataToUpload = capturedData.filter(d => dataIds.includes(d.id));
    if (dataToUpload.length === 0) return;
    
    try {
      await bulkImportTasks(projectId, dataToUpload.map(d => ({
        data: {
          ...d.data,
          type: d.type,
          source: d.source,
          platform: d.platform,
          metadata: d.metadata,
        }
      })));
      
      setCapturedData(prev => prev.filter(d => !dataIds.includes(d.id)));
      toast.success(`${dataToUpload.length} items uploaded to Label Studio`);
    } catch (error) {
      toast.error('Failed to upload training data');
    }
  }, [capturedData, bulkImportTasks]);

  const clearCaptured = useCallback(() => {
    setCapturedData([]);
  }, []);

  // Quick capture helpers
  const captureScript = useCallback((content: string, metadata?: Record<string, any>) => {
    captureData({
      type: 'script_quality',
      source: 'script',
      platform,
      data: { content, wordCount: content.split(/\s+/).length },
      metadata,
    });
  }, [captureData, platform]);

  const captureAudio = useCallback((audioUrl: string, transcription?: string, metadata?: Record<string, any>) => {
    captureData({
      type: 'audio_quality',
      source: 'vibe',
      platform,
      data: { audioUrl, transcription },
      metadata,
    });
  }, [captureData, platform]);

  const captureVideo = useCallback((frames: string[], metadata?: Record<string, any>) => {
    captureData({
      type: 'scene_detection',
      source: 'vibe',
      platform,
      data: { frames, frameCount: frames.length },
      metadata,
    });
  }, [captureData, platform]);

  const captureClip = useCallback((clipData: any, rating?: number, metadata?: Record<string, any>) => {
    captureData({
      type: 'clip_ranking',
      source: 'vibe',
      platform,
      data: { clip: clipData, rating },
      labels: rating !== undefined ? { quality_rating: rating } : undefined,
      metadata,
    });
  }, [captureData, platform]);

  const captureAIResponse = useCallback((prompt: string, response: string, rating?: number) => {
    captureData({
      type: 'genie_response_quality',
      source: 'ask_genie',
      platform,
      data: { prompt, response },
      labels: rating !== undefined ? { helpfulness: rating } : undefined,
    });
  }, [captureData, platform]);

  const value: LSUniversalContextValue = useMemo(() => ({
    isEnabled,
    isCapturing,
    capturedData,
    projects,
    projectMappings,
    enableLS,
    disableLS,
    captureData,
    uploadToProject,
    bulkUpload,
    clearCaptured,
    loadProjects,
    setProjectMapping,
    captureScript,
    captureAudio,
    captureVideo,
    captureClip,
    captureAIResponse,
  }), [
    isEnabled,
    isCapturing,
    capturedData,
    projects,
    projectMappings,
    enableLS,
    disableLS,
    captureData,
    uploadToProject,
    bulkUpload,
    clearCaptured,
    loadProjects,
    setProjectMapping,
    captureScript,
    captureAudio,
    captureVideo,
    captureClip,
    captureAIResponse,
  ]);

  return (
    <LSUniversalContext.Provider value={value}>
      {children}
    </LSUniversalContext.Provider>
  );
};

export default LSUniversalProvider;
