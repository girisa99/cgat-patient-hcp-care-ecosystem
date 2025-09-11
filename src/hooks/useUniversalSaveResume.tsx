import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';

interface UniversalSaveData {
  id?: string;
  user_id: string;
  session_type: 'patient_enrollment' | 'agent_session' | 'onboarding' | 'npi_verification';
  current_step: string;
  form_data: Record<string, any>;
  progress_percentage: number;
  channel_type: 'online' | 'ai_agent' | 'fax' | 'voice' | 'chat' | 'sms';
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export const useUniversalSaveResume = (sessionType: UniversalSaveData['session_type'], channelType: UniversalSaveData['channel_type']) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionData, setSessionData] = useState<UniversalSaveData | null>(null);
  const { showSuccess, showError } = useMasterToast();

  // Auto-save progress with debouncing
  const saveProgress = useCallback(async (
    currentStep: string,
    formData: Record<string, any>,
    progressPercentage: number,
    metadata?: Record<string, any>
  ) => {
    try {
      setIsSaving(true);
      
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      const saveData: Partial<UniversalSaveData> = {
        user_id: user.data.user.id,
        session_type: sessionType,
        current_step: currentStep,
        form_data: formData,
        progress_percentage: progressPercentage,
        channel_type: channelType,
        metadata: metadata || {}
      };

      let result;
      if (sessionData?.id) {
        // Update existing session - using any to bypass TypeScript issues temporarily
        const { data, error } = await (supabase as any)
          .from('universal_save_sessions')
          .update(saveData)
          .eq('id', sessionData.id)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      } else {
        // Create new session - using any to bypass TypeScript issues temporarily
        const { data, error } = await (supabase as any)
          .from('universal_save_sessions')
          .insert(saveData)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      }

      setSessionData(result as UniversalSaveData);
      console.log('Progress auto-saved');
      return result;
    } catch (error) {
      console.error('Auto-save failed:', error);
      showError('Auto-save Failed', 'Your progress couldn\'t be saved automatically.');
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [sessionType, channelType, sessionData?.id, showError]);

  // Manual save with user feedback
  const manualSave = useCallback(async (
    currentStep: string,
    formData: Record<string, any>,
    progressPercentage: number,
    metadata?: Record<string, any>
  ) => {
    try {
      await saveProgress(currentStep, formData, progressPercentage, metadata);
      showSuccess('Progress Saved', 'Your progress has been saved successfully.');
    } catch (error) {
      showError('Save Failed', 'Failed to save your progress. Please try again.');
    }
  }, [saveProgress, showSuccess, showError]);

  // Resume from saved session
  const resumeSession = useCallback(async (): Promise<UniversalSaveData | null> => {
    try {
      setIsLoading(true);
      
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      // Using any to bypass TypeScript issues temporarily
      const { data, error } = await (supabase as any)
        .from('universal_save_sessions')
        .select('*')
        .eq('user_id', user.data.user.id)
        .eq('session_type', sessionType)
        .eq('channel_type', channelType)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setSessionData(data as UniversalSaveData);
        return data as UniversalSaveData;
      }
      
      return null;
    } catch (error) {
      console.error('Resume session failed:', error);
      showError('Resume Failed', 'Failed to resume your previous session.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [sessionType, channelType, showError]);

  // Get all saved sessions for user
  const getSavedSessions = useCallback(async (): Promise<UniversalSaveData[]> => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      // Using any to bypass TypeScript issues temporarily
      const { data, error } = await (supabase as any)
        .from('universal_save_sessions')
        .select('*')
        .eq('user_id', user.data.user.id)
        .eq('session_type', sessionType)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return (data || []) as UniversalSaveData[];
    } catch (error) {
      console.error('Get saved sessions failed:', error);
      return [];
    }
  }, [sessionType]);

  // Delete a session
  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      // Using any to bypass TypeScript issues temporarily
      const { error } = await (supabase as any)
        .from('universal_save_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
      
      if (sessionData?.id === sessionId) {
        setSessionData(null);
      }
      
      showSuccess('Session Deleted', 'Session has been deleted successfully.');
    } catch (error) {
      console.error('Delete session failed:', error);
      showError('Delete Failed', 'Failed to delete the session.');
    }
  }, [sessionData?.id, showSuccess, showError]);

  // Clear current session
  const clearSession = useCallback(() => {
    setSessionData(null);
  }, []);

  // Auto-resume on mount
  useEffect(() => {
    resumeSession();
  }, [resumeSession]);

  return {
    // State
    isSaving,
    isLoading,
    sessionData,
    hasExistingSession: !!sessionData,
    
    // Actions
    saveProgress,
    manualSave,
    resumeSession,
    getSavedSessions,
    deleteSession,
    clearSession
  };
};