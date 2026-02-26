/**
 * A2A Coordinator Service Hook
 * Calls the ai-a2a-coordinator edge function for orchestration.
 * Also exposes the Agentic Content Orchestrator agent card for A2A discovery
 * and provides a direct invoke path via the REST wrapper.
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AGENTIC_ORCHESTRATOR_AGENT_CARD, handleOrchestrateRequest } from '@/services/publishing/agenticA2ARegistration';
import type { OrchestrateRequest, OrchestrateResponse } from '@/services/publishing/agenticA2ARegistration';
import type { AgentCard } from '@/hooks/useA2AProtocol';

export type GlobalTierLevel = 1 | 2 | 3;

export interface GenerationContext {
  workflowContext?: {
    industryCategory?: string;
    segment?: string;
    contentCategory?: string;
    selectedContentTypes?: string[];
    modelSelections?: Record<string, any>;
  };
  templateContext?: {
    selectedTemplateId?: string;
    selectedThemeId?: string;
    brandConfig?: any;
    selectedFrameworkIds?: string[];
    visualFeatures?: Array<{ id: string; subOptions?: string[] }>;
  };
  agentContext?: {
    architectureType?: 'agentic' | 'single';
    selectedAgentIds?: string[];
    agentModelConfigs?: any[];
  };
  outputConfig?: {
    outputType?: string;
    outputTypes?: string[];
    slideCount?: number;
    includeVoiceover?: boolean;
    includeMusic?: boolean;
    resolution?: string;
  };
  voiceConfig?: {
    provider?: string;
    voiceId?: string;
  };
  globalTier?: GlobalTierLevel;
}

export interface OrchestrationPlan {
  sessionId: string;
  tasks: Array<{
    agentId: string;
    taskType: string;
    priority: number;
    dependencies: string[];
    provider: string;
    config: Record<string, any>;
  }>;
  estimatedDuration: number;
  tierValidation: {
    valid: boolean;
    requiredTier: GlobalTierLevel;
    userTier: GlobalTierLevel;
  };
}

export interface A2AValidationResult {
  success: boolean;
  a2aRequired: boolean;
  tierValidation: {
    valid: boolean;
    requiredTier: GlobalTierLevel;
    userTier: GlobalTierLevel;
  };
  requiredAgents: string[];
  orchestrationMode: 'parallel' | 'sequential' | 'hybrid';
  providers: Record<string, string>;
}

export function useA2ACoordinatorService() {
  const [isValidating, setIsValidating] = useState(false);
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [orchestrationPlan, setOrchestrationPlan] = useState<OrchestrationPlan | null>(null);

  /**
   * Check A2A coordinator status
   */
  const checkStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-a2a-coordinator', {
        body: { action: 'status' },
      });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('[A2A] Status check failed:', err);
      return null;
    }
  }, []);

  /**
   * Validate generation context before orchestration
   */
  const validateContext = useCallback(async (
    context: GenerationContext,
    userTier: GlobalTierLevel
  ): Promise<A2AValidationResult | null> => {
    setIsValidating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-a2a-coordinator', {
        body: {
          action: 'validate',
          generationContext: context,
          userTier,
        },
      });

      if (error) throw error;
      return data as A2AValidationResult;
    } catch (err) {
      console.error('[A2A] Validation failed:', err);
      toast.error('Failed to validate generation context');
      return null;
    } finally {
      setIsValidating(false);
    }
  }, []);

  /**
   * Get routing plan for features
   */
  const getRoutingPlan = useCallback(async (
    context: GenerationContext,
    userTier: GlobalTierLevel
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-a2a-coordinator', {
        body: {
          action: 'route',
          generationContext: context,
          userTier,
        },
      });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('[A2A] Routing failed:', err);
      return null;
    }
  }, []);

  /**
   * Execute full orchestration - creates execution plan
   */
  const orchestrate = useCallback(async (
    context: GenerationContext,
    userTier: GlobalTierLevel,
    sessionId?: string
  ): Promise<OrchestrationPlan | null> => {
    setIsOrchestrating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-a2a-coordinator', {
        body: {
          action: 'orchestrate',
          generationContext: context,
          userTier,
          sessionId,
        },
      });

      if (error) throw error;

      if (data?.success && data.plan) {
        setOrchestrationPlan(data.plan);
        console.log('[A2A] Orchestration plan created:', data.plan.tasks.length, 'tasks');
        return data.plan;
      }

      if (!data?.success && data?.tierValidation) {
        toast.error(`Tier upgrade required: ${data.tierValidation.requiredTier}`);
      }

      return null;
    } catch (err) {
      console.error('[A2A] Orchestration failed:', err);
      toast.error('Failed to create orchestration plan');
      return null;
    } finally {
      setIsOrchestrating(false);
    }
  }, []);

  /**
   * Get the Agentic Content Orchestrator agent card for A2A discovery.
   * Returns the static card describing the 8-agent pipeline's capabilities,
   * skills, and endpoints — per Google A2A spec.
   */
  const getAgenticOrchestratorCard = useCallback((): AgentCard => {
    return AGENTIC_ORCHESTRATOR_AGENT_CARD;
  }, []);

  /**
   * Invoke the Agentic Content Orchestrator directly via REST wrapper.
   * Stateless — each call is independent. Supports actions:
   * 'orchestrate-batch', 'execute-production', 'transcreate'.
   */
  const invokeAgenticOrchestrator = useCallback(async (
    request: OrchestrateRequest,
  ): Promise<OrchestrateResponse> => {
    try {
      const response = await handleOrchestrateRequest(request);
      if (!response.success) {
        toast.error(`Orchestrator: ${response.error}`);
      }
      return response;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Orchestrator invoke failed: ${msg}`);
      return { success: false, error: msg };
    }
  }, []);

  return {
    // State
    isValidating,
    isOrchestrating,
    orchestrationPlan,

    // Actions
    checkStatus,
    validateContext,
    getRoutingPlan,
    orchestrate,

    // Agentic Content Orchestrator (A2A)
    agenticOrchestratorCard: AGENTIC_ORCHESTRATOR_AGENT_CARD,
    getAgenticOrchestratorCard,
    invokeAgenticOrchestrator,
  };
}
