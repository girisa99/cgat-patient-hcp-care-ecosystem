import { useEffect, useRef, useCallback } from 'react';
import { useAgentSession } from './useAgentSession';
import { AgentSession, AgentSessionUpdate } from '@/types/agent-session';
import { useToast } from './use-toast';

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
    if (!enabled || savingRef.current) return;

    const currentDataString = JSON.stringify({ data, currentStep });
    
    // Don't save if nothing has changed
    if (currentDataString === lastSavedRef.current) return;

    // Prevent concurrent saves
    savingRef.current = true;

    try {
      console.log('🔄 Auto-saving agent session data:', { sessionId, currentStep, dataKeys: Object.keys(data) });
      
      const saveData: AgentSessionUpdate = {
        ...data,
        current_step: currentStep
      };

      if (sessionId) {
        await autoSave.mutateAsync({ sessionId, updates: saveData });
      } else if (data.name) {
        // Create new session if none exists
        const newSession = await createSession.mutateAsync(data);
        console.log('✅ New session created:', newSession?.id);
        return newSession;
      }

      lastSavedRef.current = currentDataString;
      console.log('✅ Auto-save completed successfully');
    } catch (error) {
      console.error('❌ Auto-save failed:', error);
      
      // Only show toast for non-constraint violation errors to avoid spam
      const errorMessage = error?.message || '';
      if (!errorMessage.includes('duplicate key value violates unique constraint')) {
        toast({
          title: "Auto-save Failed",
          description: "Your progress couldn't be saved automatically. Please save manually.",
          variant: "destructive",
        });
      } else {
        console.log('🔄 Skipping duplicate constraint error - likely concurrent save attempt');
      }
    } finally {
      savingRef.current = false;
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
    isSaving: createSession.isPending || updateSession.isPending || autoSave.isPending,
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