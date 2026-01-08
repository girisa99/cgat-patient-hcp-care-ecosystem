/**
 * useAgentExecution Hook
 * In-place agent execution without navigation
 * Executes agents and returns real findings attached to documents
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type AgentReadyStatus = 'ready' | 'needs-config' | 'ai-powered';

export interface SubAgentSuggestion {
  id: string;
  name: string;
  description: string;
  icon: string;
  useCase: string;
  triggerCondition: string;
  architectureType: 'a2a' | 'agentic' | 'multi-agent' | 'single';
  readyStatus?: AgentReadyStatus;
  requiredSetup?: string[];
}

export interface AgentExecutionResult {
  agentId: string;
  agentName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  findings: Record<string, any>;
  confidence: number;
  executionTimeMs: number;
  timestamp: string;
  alerts?: Array<{ level: 'info' | 'warning' | 'error'; message: string }>;
  aiPowered?: boolean;
  model?: string;
  provider?: string;
  dataSource?: string;
  summary?: string;
  recommendations?: string[];
}

export interface DocumentContext {
  documentType: string;
  extractedFields: Record<string, any>;
  rawText?: string;
  imageBase64?: string;
  fileName?: string;
  preferredProvider?: 'claude' | 'gemini' | 'openai';
  // Per-agent provider overrides
  agentProviderOverrides?: Record<string, 'auto' | 'claude' | 'gemini' | 'openai'>;
  // Per-agent medication selection for multi-medication prescriptions
  agentMedicationSelection?: Record<string, number | 'all'>;
  // All medications from prescription
  allMedications?: any[];
  // Selected APIs
  selectedAPIs?: string[];
}

interface UseAgentExecutionReturn {
  executeAgents: (agents: SubAgentSuggestion[], documentData: DocumentContext) => Promise<AgentExecutionResult[]>;
  executeAgent: (agent: SubAgentSuggestion, documentData: DocumentContext) => Promise<AgentExecutionResult>;
  isExecuting: boolean;
  executionProgress: number;
  currentAgent: string | null;
  results: AgentExecutionResult[];
  clearResults: () => void;
}

export function useAgentExecution(): UseAgentExecutionReturn {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [currentAgent, setCurrentAgent] = useState<string | null>(null);
  const [results, setResults] = useState<AgentExecutionResult[]>([]);

  const executeAgent = useCallback(async (
    agent: SubAgentSuggestion,
    documentData: DocumentContext
  ): Promise<AgentExecutionResult> => {
    const startTime = Date.now();
    
    try {
      setCurrentAgent(agent.name);
      
      // Determine effective provider for this agent
      const effectiveProvider = documentData.agentProviderOverrides?.[agent.id] || documentData.preferredProvider;
      
      // Get medication selection for this agent (if applicable)
      const medicationSelection = documentData.agentMedicationSelection?.[agent.id];
      const selectedMedication = medicationSelection !== undefined && medicationSelection !== 'all' && documentData.allMedications
        ? documentData.allMedications[medicationSelection]
        : null;
      
      // Build medication context for the agent
      const medicationContext = {
        selection: medicationSelection ?? 'all',
        selectedMedication: selectedMedication,
        allMedications: documentData.allMedications || []
      };
      
      // Call the edge function
      const { data, error } = await supabase.functions.invoke('execute-document-agent', {
        body: {
          agentId: agent.id,
          agentConfig: {
            name: agent.name,
            architectureType: agent.architectureType,
            useCase: agent.useCase,
            description: agent.description
          },
          documentContext: {
            documentType: documentData.documentType,
            extractedFields: documentData.extractedFields,
            rawText: documentData.rawText,
            fileName: documentData.fileName,
            preferredProvider: effectiveProvider === 'auto' ? undefined : effectiveProvider,
            medicationContext: medicationContext,
            selectedAPIs: documentData.selectedAPIs
          }
        }
      });

      if (error) throw error;

      const executionTimeMs = Date.now() - startTime;

      const result: AgentExecutionResult = {
        agentId: agent.id,
        agentName: agent.name,
        status: data?.success ? 'completed' : 'failed',
        findings: data?.findings?.details || {},
        confidence: data?.findings?.confidence || 0.8,
        executionTimeMs,
        timestamp: new Date().toISOString(),
        alerts: data?.findings?.alerts || [],
        aiPowered: data?.findings?.aiPowered || false,
        model: data?.findings?.model,
        provider: data?.findings?.provider,
        dataSource: data?.findings?.dataSource,
        summary: data?.findings?.summary,
        recommendations: data?.findings?.recommendations
      };

      return result;
    } catch (error) {
      console.error(`Agent execution failed for ${agent.name}:`, error);
      
      return {
        agentId: agent.id,
        agentName: agent.name,
        status: 'failed',
        findings: { error: error instanceof Error ? error.message : 'Unknown error' },
        confidence: 0,
        executionTimeMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        alerts: [{ level: 'error', message: `Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}` }]
      };
    }
  }, []);

  const executeAgents = useCallback(async (
    agents: SubAgentSuggestion[],
    documentData: DocumentContext
  ): Promise<AgentExecutionResult[]> => {
    if (agents.length === 0) return [];

    setIsExecuting(true);
    setExecutionProgress(0);
    setResults([]);

    try {
      // Execute ALL agents in parallel for faster execution
      setCurrentAgent(`Running ${agents.length} agent(s) in parallel...`);
      
      toast.info(`Executing ${agents.length} agent(s) in parallel...`, {
        id: 'parallel-execution',
        duration: 15000
      });

      // Create all execution promises
      const executionPromises = agents.map(agent => 
        executeAgent(agent, documentData)
      );

      // Execute all in parallel with Promise.all
      const executionResults = await Promise.all(executionPromises);

      // Update results
      setResults(executionResults);
      setExecutionProgress(100);

      // Show summary toast
      const successCount = executionResults.filter(r => r.status === 'completed').length;
      const failedCount = executionResults.filter(r => r.status === 'failed').length;
      
      if (failedCount === 0) {
        toast.success(`All ${successCount} agent(s) completed`, {
          id: 'parallel-execution',
          description: executionResults.some(r => r.alerts && r.alerts.length > 0)
            ? 'Some alerts found - review results'
            : 'All agents executed successfully'
        });
      } else {
        toast.warning(`${successCount} completed, ${failedCount} failed`, {
          id: 'parallel-execution',
          description: 'Review results for details'
        });
      }

      return executionResults;
    } catch (error) {
      console.error('Parallel agent execution error:', error);
      toast.error('Agent execution failed', {
        id: 'parallel-execution',
        description: error instanceof Error ? error.message : 'Unknown error'
      });
      return [];
    } finally {
      setIsExecuting(false);
      setCurrentAgent(null);
      setExecutionProgress(100);
    }
  }, [executeAgent]);

  const clearResults = useCallback(() => {
    setResults([]);
    setExecutionProgress(0);
  }, []);

  return {
    executeAgents,
    executeAgent,
    isExecuting,
    executionProgress,
    currentAgent,
    results,
    clearResults
  };
}

export default useAgentExecution;
