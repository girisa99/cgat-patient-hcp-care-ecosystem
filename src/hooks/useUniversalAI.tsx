import { useState } from 'react';
import { useMasterToast } from './useMasterToast';
import { supabase } from '@/integrations/supabase/client';

interface UseUniversalAIReturn {
  generateAgent: (prompt: string, provider?: 'openai' | 'claude' | 'gemini') => Promise<any>;
  testNode: (nodeId: string, testData?: any) => Promise<any>;
  analyzeWorkflow: (nodes: any[], edges: any[]) => Promise<any>;
  isLoading: boolean;
  error: string | null;
}

export const useUniversalAI = (): UseUniversalAIReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useMasterToast();

  const generateAgent = async (prompt: string, provider: 'openai' | 'claude' | 'gemini' = 'openai') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: functionError } = await supabase.functions.invoke('generate-agent-from-prompt', {
        body: {
          prompt: prompt.trim(),
          provider,
          generateConnections: true,
          includeTemplates: true
        }
      });

      if (functionError) throw functionError;
      
      showSuccess('Agent generated successfully!');
      return data;
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to generate agent';
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const testNode = async (nodeId: string, testData?: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: functionError } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          action: 'test_node',
          nodeId,
          testData,
          provider: 'openai'
        }
      });

      if (functionError) throw functionError;
      
      showSuccess('Node test completed successfully!');
      return data;
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to test node';
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeWorkflow = async (nodes: any[], edges: any[]) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: functionError } = await supabase.functions.invoke('analyze-workflow-suggestions', {
        body: {
          nodes,
          edges,
          provider: 'openai'
        }
      });

      if (functionError) throw functionError;
      
      showSuccess('Workflow analysis completed!');
      return data;
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to analyze workflow';
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateAgent,
    testNode,
    analyzeWorkflow,
    isLoading,
    error
  };
};