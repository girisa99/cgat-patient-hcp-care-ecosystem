import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface JourneyStage {
  id: string;
  title: string;
  description?: string;
  type: 'information_gathering' | 'decision_point' | 'action_required' | 'completion';
  conditions?: {
    required_fields?: string[];
    validation_rules?: Record<string, any>;
  };
  actions?: {
    on_enter?: string[];
    on_exit?: string[];
  };
  metadata?: Record<string, any>;
}

export interface JourneyContext {
  stages: JourneyStage[];
  current_stage: number;
  current_stage_id: string;
  progress: Record<string, any>;
  initialized_at?: string;
}

export interface StageTransition {
  id: string;
  conversation_id: string;
  from_stage_id: string | null;
  to_stage_id: string;
  transition_reason: string;
  transition_data: Record<string, any>;
  triggered_by: string;
  created_at: string;
}

export const useJourneyExecution = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize journey for a conversation
  const initializeJourney = useCallback(async (
    conversationId: string, 
    agentId: string
  ): Promise<JourneyContext | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: initError } = await supabase.rpc(
        'initialize_conversation_journey',
        {
          p_conversation_id: conversationId,
          p_agent_id: agentId
        }
      );

      if (initError) throw initError;

      toast({
        title: "Journey Initialized",
        description: "Conversation journey stages have been set up",
      });

      return data as unknown as JourneyContext;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize journey';
      setError(errorMessage);
      console.error('Journey initialization error:', err);
      
      toast({
        title: "Journey Initialization Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Progress to next stage
  const progressStage = useCallback(async (
    conversationId: string,
    nextStageId?: string,
    reason = 'natural_progression',
    transitionData = {}
  ) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: progressError } = await supabase.rpc(
        'progress_journey_stage',
        {
          p_conversation_id: conversationId,
          p_next_stage_id: nextStageId || null,
          p_reason: reason,
          p_transition_data: transitionData
        }
      );

      if (progressError) throw progressError;

      const result = data as any;

      if (result.status === 'journey_completed') {
        toast({
          title: "Journey Completed",
          description: "All journey stages have been completed",
        });
      } else {
        toast({
          title: "Stage Progressed",
          description: `Advanced to next stage: ${result.to_stage}`,
        });
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to progress journey stage';
      setError(errorMessage);
      console.error('Journey progression error:', err);
      
      toast({
        title: "Journey Progress Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get journey context for a conversation
  const getJourneyContext = useCallback(async (
    conversationId: string
  ): Promise<JourneyContext | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('agent_conversations')
        .select('journey_context, current_journey_stage_id, journey_started_at, journey_completed_at')
        .eq('id', conversationId)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!data) return null;

      return data.journey_context as unknown as JourneyContext;
    } catch (err) {
      console.error('Error fetching journey context:', err);
      return null;
    }
  }, []);

  // Get stage transitions for a conversation
  const getStageTransitions = useCallback(async (
    conversationId: string
  ): Promise<StageTransition[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('journey_stage_transitions')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;
      return (data || []) as StageTransition[];
    } catch (err) {
      console.error('Error fetching stage transitions:', err);
      return [];
    }
  }, []);

  // Get current stage information
  const getCurrentStage = useCallback((
    journeyContext: JourneyContext | null
  ): JourneyStage | null => {
    if (!journeyContext || !journeyContext.stages || journeyContext.stages.length === 0) {
      return null;
    }

    const currentIndex = journeyContext.current_stage || 0;
    return journeyContext.stages[currentIndex] || null;
  }, []);

  // Check if journey is complete
  const isJourneyComplete = useCallback((
    journeyContext: JourneyContext | null
  ): boolean => {
    if (!journeyContext || !journeyContext.stages) return false;
    
    const currentIndex = journeyContext.current_stage || 0;
    return currentIndex >= journeyContext.stages.length;
  }, []);

  // Get journey progress percentage
  const getProgressPercentage = useCallback((
    journeyContext: JourneyContext | null
  ): number => {
    if (!journeyContext || !journeyContext.stages || journeyContext.stages.length === 0) {
      return 0;
    }

    const currentIndex = journeyContext.current_stage || 0;
    return Math.round((currentIndex / journeyContext.stages.length) * 100);
  }, []);

  // Validate stage completion conditions
  const validateStageConditions = useCallback((
    stage: JourneyStage,
    conversationData: any[]
  ): { valid: boolean; missingFields: string[]; errors: string[] } => {
    const result = {
      valid: true,
      missingFields: [] as string[],
      errors: [] as string[]
    };

    if (!stage.conditions) return result;

    // Check required fields
    if (stage.conditions.required_fields) {
      for (const field of stage.conditions.required_fields) {
        const hasField = conversationData.some(msg => 
          msg.metadata && msg.metadata[field]
        );
        
        if (!hasField) {
          result.valid = false;
          result.missingFields.push(field);
        }
      }
    }

    // Add more validation rules as needed
    if (stage.conditions.validation_rules) {
      // Implement custom validation logic here
    }

    return result;
  }, []);

  return {
    loading,
    error,
    initializeJourney,
    progressStage,
    getJourneyContext,
    getStageTransitions,
    getCurrentStage,
    isJourneyComplete,
    getProgressPercentage,
    validateStageConditions,
  };
};

export default useJourneyExecution;