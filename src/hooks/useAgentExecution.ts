/**
 * useAgentExecution Hook
 * In-place agent execution without navigation
 * Executes agents and returns real findings attached to documents
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SubAgentSuggestion {
  id: string;
  name: string;
  description: string;
  icon: string;
  useCase: string;
  triggerCondition: string;
  architectureType: 'a2a' | 'agentic' | 'multi-agent' | 'single';
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
}

export interface DocumentContext {
  documentType: string;
  extractedFields: Record<string, any>;
  rawText?: string;
  imageBase64?: string;
  fileName?: string;
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
            fileName: documentData.fileName
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
        alerts: data?.findings?.alerts || []
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

    const executionResults: AgentExecutionResult[] = [];

    try {
      for (let i = 0; i < agents.length; i++) {
        const agent = agents[i];
        setCurrentAgent(agent.name);
        setExecutionProgress(((i) / agents.length) * 100);

        toast.info(`Running ${agent.name}...`, {
          id: `agent-${agent.id}`,
          duration: 10000
        });

        const result = await executeAgent(agent, documentData);
        executionResults.push(result);
        setResults(prev => [...prev, result]);

        // Update toast based on result
        if (result.status === 'completed') {
          toast.success(`${agent.name} completed`, {
            id: `agent-${agent.id}`,
            description: result.alerts && result.alerts.length > 0 
              ? `${result.alerts.length} alert(s) found`
              : 'No issues found'
          });
        } else {
          toast.error(`${agent.name} failed`, {
            id: `agent-${agent.id}`,
            description: result.alerts?.[0]?.message || 'Execution error'
          });
        }

        setExecutionProgress(((i + 1) / agents.length) * 100);
      }

      return executionResults;
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
