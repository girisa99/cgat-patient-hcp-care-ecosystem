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
  const { createSession, updateSession, manualSave } = useAgentSession();
  const { toast } = useToast();
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<string>('');

  const saveProgress = useCallback(async () => {
    if (!enabled || !sessionId) return;

    const currentDataString = JSON.stringify({ data, currentStep });
    
    // Don't save if nothing has changed
    if (currentDataString === lastSavedRef.current) return;

    // Use global session save manager to prevent concurrent saves
    try {
      const result = await sessionSaveManager.saveSession(sessionId, async () => {
        console.log('🔄 Manual saving agent session data:', { sessionId, currentStep, dataKeys: Object.keys(data) });
        
        const saveData: AgentSessionUpdate = {
          ...data,
          current_step: currentStep
        };

        if (sessionId) {
          return await manualSave.mutateAsync({ sessionId, updates: saveData });
        } else {
          // NO AUTO-CREATION - require explicit session creation
          console.log('⚠️ No session ID provided - skipping save. User must create session first.');
          throw new Error('Session must be created explicitly before saving');
        }
      });

      lastSavedRef.current = currentDataString;
      console.log('✅ Manual save completed successfully');
      return result;
    } catch (error) {
      console.error('❌ Manual save failed:', error);
      
      // Only show toast for non-constraint violation errors to avoid spam
      const errorMessage = error?.message || '';
      if (!errorMessage.includes('duplicate key value violates unique constraint') && 
          !errorMessage.includes('already being saved')) {
        toast({
          title: "Save Failed",
          description: "Your progress couldn't be saved. Please try again.",
          variant: "destructive",
        });
      } else {
        console.log('🔄 Skipping save error toast - likely concurrent save or constraint violation');
      }
    }
  }, [data, currentStep, sessionId, enabled, manualSave, toast]);

  // Auto-save with debouncing (now uses manualSave)
  useEffect(() => {
    if (!enabled) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for save (3 seconds after last change)
    saveTimeoutRef.current = setTimeout(() => {
      saveProgress();
    }, 3000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [saveProgress]);

  // Manual save function
  const manualSaveFunction = useCallback(async () => {
    const result = await saveProgress();
    toast({
      title: "Progress Saved",
      description: "Your agent progress has been saved successfully.",
    });
    return result;
  }, [saveProgress, toast]);

  return {
    manualSave: manualSaveFunction,
    isSaving: createSession.isPending || updateSession.isPending || manualSave.isPending || (sessionId ? sessionSaveManager.isSessionBeingSaved(sessionId) : false),
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