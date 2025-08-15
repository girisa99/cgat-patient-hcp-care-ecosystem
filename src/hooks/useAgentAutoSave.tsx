import { useEffect, useRef, useCallback } from 'react';
import { useAgentSession } from './useAgentSession';
import { AgentSession, AgentSessionUpdate } from '@/types/agent-session';
import { useToast } from './use-toast';
import { sessionSaveManager } from '@/utils/sessionSaveManager';

interface UseAgentAutoSaveProps {
  data: Partial<AgentSession>;
  currentStep: AgentSession['current_step'];
  sessionId?: string;
  enabled?: boolean;
}

export const useAgentAutoSave = ({ 
  data, 
  currentStep, 
  sessionId, 
  enabled = true 
}: UseAgentAutoSaveProps) => {
  const { createSession, updateSession, autoSave } = useAgentSession();
  const { toast } = useToast();
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<string>('');
  const savingRef = useRef<boolean>(false); // Prevent concurrent saves

  const saveProgress = useCallback(async () => {
    if (!enabled || !sessionId) return;

    const currentDataString = JSON.stringify({ data, currentStep });
    
    // Don't save if nothing has changed
    if (currentDataString === lastSavedRef.current) return;

    // Use global session save manager to prevent concurrent saves
    try {
      const result = await sessionSaveManager.saveSession(sessionId, async () => {
        console.log('🔄 Auto-saving agent session data:', { sessionId, currentStep, dataKeys: Object.keys(data) });
        
        const saveData: AgentSessionUpdate = {
          ...data,
          current_step: currentStep
        };

        if (sessionId) {
          return await autoSave.mutateAsync({ sessionId, updates: saveData });
        } else {
          // NO AUTO-CREATION - require explicit session creation
          console.log('⚠️ No session ID provided - skipping auto-save. User must create session first.');
          throw new Error('Session must be created explicitly before saving');
        }
      });

      lastSavedRef.current = currentDataString;
      console.log('✅ Auto-save completed successfully');
      return result;
    } catch (error) {
      console.error('❌ Auto-save failed:', error);
      
      // Only show toast for non-constraint violation errors to avoid spam
      const errorMessage = error?.message || '';
      if (!errorMessage.includes('duplicate key value violates unique constraint') && 
          !errorMessage.includes('already being saved')) {
        toast({
          title: "Auto-save Failed",
          description: "Your progress couldn't be saved automatically. Please save manually.",
          variant: "destructive",
        });
      } else {
        console.log('🔄 Skipping auto-save error toast - likely concurrent save or constraint violation');
      }
    }
  }, [data, currentStep, sessionId, enabled, autoSave, createSession, toast]);

  // Auto-save with debouncing
  useEffect(() => {
    if (!enabled) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save (2 seconds after last change)
    saveTimeoutRef.current = setTimeout(() => {
      saveProgress();
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [saveProgress]);

  // Manual save function
  const manualSave = useCallback(async () => {
    const result = await saveProgress();
    toast({
      title: "Progress Saved",
      description: "Your agent progress has been saved successfully.",
    });
    return result;
  }, [saveProgress, toast]);

  return {
    manualSave,
    isSaving: createSession.isPending || updateSession.isPending || autoSave.isPending || (sessionId ? sessionSaveManager.isSessionBeingSaved(sessionId) : false),
    saveProgress
  };
};

// Helper functions for step validation
export const isValidAgentStep = (step: string): step is AgentSession['current_step'] => {
  const validSteps: AgentSession['current_step'][] = [
    'basic_info', 'canvas', 'actions', 'connectors', 'knowledge', 'rag', 'deploy'
  ];
  return validSteps.includes(step as AgentSession['current_step']);
};