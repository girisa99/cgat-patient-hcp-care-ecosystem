/**
 * USE GENERATED CONTENT HOOK
 * 
 * Manages generated content state with persistence to Supabase.
 * Provides real-time updates and sync between Studio, Preview, and Schedule.
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface GeneratedContentItem {
  id: string;
  projectId: string;
  projectName: string;
  templateId?: string;
  chapterId: string;
  chapterTitle: string;
  chapterIndex: number;
  language: string;
  visualType: 'avatar' | '3d' | 'video' | 'animation' | 'static' | 'screen_recording';
  status: 'pending' | 'generating' | 'complete' | 'error';
  progress: number;
  previewUrl?: string;
  thumbnailUrl?: string;
  scriptContent?: string;
  sceneDescription?: string;
  duration: number;
  error?: string;
  metadata?: {
    provider: string;
    model: string;
    processingTime: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface GeneratedProject {
  id: string;
  name: string;
  description?: string;
  templateId?: string;
  status: 'draft' | 'generating' | 'ready' | 'scheduled' | 'published' | 'failed';
  languages: string[];
  destinations: string[];
  placement?: string;
  totalChapters: number;
  completedChapters: number;
  totalDuration: number;
  scheduledAt?: Date;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  items: GeneratedContentItem[];
}

interface UseGeneratedContentReturn {
  projects: GeneratedProject[];
  isLoading: boolean;
  addOrUpdateItem: (item: Omit<GeneratedContentItem, 'id' | 'createdAt' | 'updatedAt'>) => GeneratedContentItem;
  updateItemStatus: (itemId: string, status: GeneratedContentItem['status'], previewUrl?: string, error?: string) => void;
  createProject: (project: Omit<GeneratedProject, 'id' | 'createdAt' | 'updatedAt' | 'items'>) => GeneratedProject;
  updateProjectStatus: (projectId: string, status: GeneratedProject['status']) => void;
  getProjectItems: (projectId: string) => GeneratedContentItem[];
  getItemsByLanguage: (projectId: string, language: string) => GeneratedContentItem[];
  clearProject: (projectId: string) => void;
  refreshFromDB: () => Promise<void>;
  persistToLocalStorage: () => void;
}

const STORAGE_KEY = 'genie_generated_content';

export function useGeneratedContent(): UseGeneratedContentReturn {
  const [projects, setProjects] = useState<GeneratedProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const restored = parsed.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
          scheduledAt: p.scheduledAt ? new Date(p.scheduledAt) : undefined,
          publishedAt: p.publishedAt ? new Date(p.publishedAt) : undefined,
          items: p.items.map((i: any) => ({
            ...i,
            createdAt: new Date(i.createdAt),
            updatedAt: new Date(i.updatedAt),
          })),
        }));
        setProjects(restored);
      } catch (e) {
        console.error('[GeneratedContent] Failed to parse stored content:', e);
      }
    }
    setIsLoading(false);
  }, []);

  // Persist to localStorage
  const persistToLocalStorage = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  // Auto-persist on changes
  useEffect(() => {
    if (!isLoading && projects.length > 0) {
      persistToLocalStorage();
    }
  }, [projects, isLoading, persistToLocalStorage]);

  // Create a new project
  const createProject = useCallback((
    projectData: Omit<GeneratedProject, 'id' | 'createdAt' | 'updatedAt' | 'items'>
  ): GeneratedProject => {
    const newProject: GeneratedProject = {
      ...projectData,
      id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setProjects(prev => {
      // Check if project already exists, update if so
      const existingIndex = prev.findIndex(p => p.name === projectData.name);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], ...projectData, updatedAt: new Date() };
        return updated;
      }
      return [...prev, newProject];
    });
    
    return newProject;
  }, []);

  // Add or update a content item
  const addOrUpdateItem = useCallback((
    itemData: Omit<GeneratedContentItem, 'id' | 'createdAt' | 'updatedAt'>
  ): GeneratedContentItem => {
    const itemId = `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newItem: GeneratedContentItem = {
      ...itemData,
      id: itemId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setProjects(prev => {
      const projectIndex = prev.findIndex(p => p.id === itemData.projectId);
      if (projectIndex < 0) {
        // Create project if it doesn't exist
        const newProject: GeneratedProject = {
          id: itemData.projectId,
          name: itemData.projectName,
          templateId: itemData.templateId,
          status: 'generating',
          languages: [itemData.language],
          destinations: ['landing_page'],
          totalChapters: 1,
          completedChapters: 0,
          totalDuration: itemData.duration,
          items: [newItem],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        return [...prev, newProject];
      }
      
      // Update existing project
      const updated = [...prev];
      const project = { ...updated[projectIndex] };
      
      // Check if item already exists (same chapter + language)
      const existingItemIndex = project.items.findIndex(
        i => i.chapterId === itemData.chapterId && i.language === itemData.language
      );
      
      if (existingItemIndex >= 0) {
        project.items[existingItemIndex] = {
          ...project.items[existingItemIndex],
          ...itemData,
          id: project.items[existingItemIndex].id,
          updatedAt: new Date(),
        };
      } else {
        project.items.push(newItem);
        if (!project.languages.includes(itemData.language)) {
          project.languages.push(itemData.language);
        }
      }
      
      // Update project stats
      project.completedChapters = project.items.filter(i => i.status === 'complete').length;
      project.updatedAt = new Date();
      
      updated[projectIndex] = project;
      return updated;
    });
    
    return newItem;
  }, []);

  // Update item status
  const updateItemStatus = useCallback((
    itemId: string,
    status: GeneratedContentItem['status'],
    previewUrl?: string,
    error?: string
  ) => {
    setProjects(prev => {
      return prev.map(project => {
        const itemIndex = project.items.findIndex(i => i.id === itemId);
        if (itemIndex < 0) return project;
        
        const items = [...project.items];
        items[itemIndex] = {
          ...items[itemIndex],
          status,
          previewUrl: previewUrl || items[itemIndex].previewUrl,
          error,
          updatedAt: new Date(),
        };
        
        const completedChapters = items.filter(i => i.status === 'complete').length;
        const projectStatus = items.every(i => i.status === 'complete') ? 'ready' 
          : items.some(i => i.status === 'error') ? 'failed'
          : items.some(i => i.status === 'generating') ? 'generating'
          : 'draft';
        
        return {
          ...project,
          items,
          completedChapters,
          status: projectStatus,
          updatedAt: new Date(),
        };
      });
    });
  }, []);

  // Update project status
  const updateProjectStatus = useCallback((projectId: string, status: GeneratedProject['status']) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, status, updatedAt: new Date() } : p
    ));
  }, []);

  // Get items for a project
  const getProjectItems = useCallback((projectId: string): GeneratedContentItem[] => {
    const project = projects.find(p => p.id === projectId);
    return project?.items || [];
  }, [projects]);

  // Get items by language
  const getItemsByLanguage = useCallback((projectId: string, language: string): GeneratedContentItem[] => {
    const project = projects.find(p => p.id === projectId);
    return project?.items.filter(i => i.language === language) || [];
  }, [projects]);

  // Clear a project
  const clearProject = useCallback((projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
  }, []);

  // Refresh from database
  const refreshFromDB = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: Implement actual DB fetch when generated_content table exists
      // For now, just use local state
      console.log('[GeneratedContent] Refreshing from storage...');
    } catch (error) {
      console.error('[GeneratedContent] Failed to refresh:', error);
      toast.error('Failed to refresh generated content');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    projects,
    isLoading,
    addOrUpdateItem,
    updateItemStatus,
    createProject,
    updateProjectStatus,
    getProjectItems,
    getItemsByLanguage,
    clearProject,
    refreshFromDB,
    persistToLocalStorage,
  };
}

export default useGeneratedContent;
