/**
 * Presentation Session Hook - Manages session state in Supabase
 * Stores presentation drafts, configuration, and slides data
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PresentationSessionConfig {
  inputSource: string;
  collateralType: string;
  outputFormat: string;
  length: string;
  imageSource: string;
  imageStyles: string[];
  imageModel: string;
  selectedTones: string[];
  selectedEnhancements: string[];
  selectedLanguages: string[];
  primaryLanguage: string;
  targetAudience: string;
  voiceProvider: string;
  includeInfographics: boolean;
  includeJourneyMaps: boolean;
  includeVoiceover: boolean;
  selectedAIModel: string;
}

export interface PresentationSession {
  id: string;
  userId: string;
  name: string;
  description?: string;
  inputContent: string;
  configuration: PresentationSessionConfig;
  slidesData: any[];
  status: 'draft' | 'generating' | 'completed' | 'published';
  currentStep: number;
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_CONFIG: PresentationSessionConfig = {
  inputSource: 'prompt',
  collateralType: 'presentation',
  outputFormat: 'pptx',
  length: 'standard',
  imageSource: 'ai-generated',
  imageStyles: ['ai-realistic'],
  imageModel: 'auto',
  selectedTones: ['balanced'],
  selectedEnhancements: [],
  selectedLanguages: ['en'],
  primaryLanguage: 'en',
  targetAudience: '',
  voiceProvider: 'openai',
  includeInfographics: true,
  includeJourneyMaps: false,
  includeVoiceover: false,
  selectedAIModel: 'auto',
};

export function usePresentationSession(sessionId?: string) {
  const [session, setSession] = useState<PresentationSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load session from Supabase
  const loadSession = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('presentations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        const loadedSession: PresentationSession = {
          id: data.id,
          userId: data.user_id || '',
          name: data.name,
          description: data.description || '',
          inputContent: (data.configuration as any)?.inputContent || '',
          configuration: {
            ...DEFAULT_CONFIG,
            ...((data.configuration as unknown as PresentationSessionConfig) || {}),
          },
          slidesData: (data.slides_data as any[]) || [],
          status: (data.status as PresentationSession['status']) || 'draft',
          currentStep: (data.configuration as any)?.currentStep || 0,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
        setSession(loadedSession);
        return loadedSession;
      }
    } catch (error: any) {
      console.error('Error loading session:', error);
      toast.error('Failed to load presentation session');
    } finally {
      setIsLoading(false);
    }
    return null;
  }, []);

  // Create new session
  const createSession = useCallback(async (name: string = 'Untitled Presentation') => {
    setIsLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      if (!userId) {
        toast.error('Please sign in to create a presentation');
        setIsLoading(false);
        return null;
      }

      const slug = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

      const { data, error } = await supabase
        .from('presentations')
        .insert({
          name,
          slug,
          user_id: userId,
          status: 'draft',
          configuration: {
            ...DEFAULT_CONFIG,
            inputContent: '',
            currentStep: 0,
          },
          slides_data: [],
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newSession: PresentationSession = {
          id: data.id,
          userId: data.user_id || '',
          name: data.name,
          description: data.description || '',
          inputContent: '',
          configuration: DEFAULT_CONFIG,
          slidesData: [],
          status: 'draft',
          currentStep: 0,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
        setSession(newSession);
        toast.success('New presentation session created');
        return newSession;
      }
    } catch (error: any) {
      console.error('Error creating session:', error);
      toast.error('Failed to create presentation session');
    } finally {
      setIsLoading(false);
    }
    return null;
  }, []);

  // Save session to Supabase
  const saveSession = useCallback(async (updates: Partial<PresentationSession>) => {
    if (!session?.id) return;

    setIsSaving(true);
    try {
      const configToSave = {
        ...session.configuration,
        ...(updates.configuration || {}),
        inputContent: updates.inputContent ?? session.inputContent,
        currentStep: updates.currentStep ?? session.currentStep,
      };

      const { error } = await supabase
        .from('presentations')
        .update({
          name: updates.name ?? session.name,
          description: updates.description ?? session.description,
          configuration: configToSave as any,
          slides_data: updates.slidesData ?? session.slidesData,
          status: updates.status ?? session.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.id);

      if (error) throw error;

      setSession(prev => prev ? { ...prev, ...updates } : null);
      setLastSaved(new Date());
    } catch (error: any) {
      console.error('Error saving session:', error);
      toast.error('Failed to save presentation');
    } finally {
      setIsSaving(false);
    }
  }, [session]);

  // Update configuration
  const updateConfig = useCallback((configUpdates: Partial<PresentationSessionConfig>) => {
    if (!session) return;

    const newConfig = { ...session.configuration, ...configUpdates };
    setSession(prev => prev ? { ...prev, configuration: newConfig } : null);
  }, [session]);

  // Update input content
  const updateInputContent = useCallback((content: string) => {
    if (!session) return;
    setSession(prev => prev ? { ...prev, inputContent: content } : null);
  }, [session]);

  // Update current step
  const updateCurrentStep = useCallback((step: number) => {
    if (!session) return;
    setSession(prev => prev ? { ...prev, currentStep: step } : null);
  }, [session]);

  // Update slides
  const updateSlides = useCallback((slides: any[]) => {
    if (!session) return;
    setSession(prev => prev ? { ...prev, slidesData: slides } : null);
  }, [session]);

  // Auto-save with debounce
  const autoSave = useCallback(async () => {
    if (session?.id) {
      await saveSession({});
    }
  }, [session, saveSession]);

  // Load existing session on mount
  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId);
    }
  }, [sessionId, loadSession]);

  // List user's presentations
  const listSessions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('presentations')
        .select('id, name, status, created_at, updated_at, presentation_type')
        .order('updated_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error listing sessions:', error);
      return [];
    }
  }, []);

  return {
    session,
    isLoading,
    isSaving,
    lastSaved,
    createSession,
    loadSession,
    saveSession,
    updateConfig,
    updateInputContent,
    updateCurrentStep,
    updateSlides,
    autoSave,
    listSessions,
    defaultConfig: DEFAULT_CONFIG,
  };
}
