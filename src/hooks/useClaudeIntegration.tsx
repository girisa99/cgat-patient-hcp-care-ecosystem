import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ClaudeMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ClaudeResponse {
  success: boolean;
  content: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
  error?: string;
}

export const useClaudeIntegration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatWithClaude = async (
    messages: ClaudeMessage[],
    model: string = 'claude-sonnet-4-20250514'
  ): Promise<ClaudeResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('chat-with-claude', {
        body: {
          messages,
          model,
          max_tokens: 4000
        }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Claude API request failed');
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Claude integration error:', errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const generateWorkflowWithClaude = async (prompt: string): Promise<any> => {
    const messages: ClaudeMessage[] = [
      {
        role: 'system',
        content: `You are a workflow generation AI. Generate a complete workflow structure based on the user's prompt. Return a JSON object with 'nodes' and 'edges' arrays. Each node should have: id, type (usually 'enhanced'), position {x, y}, and data {label, type_key, category, configuration}.`
      },
      {
        role: 'user',
        content: `Generate a workflow for: ${prompt}\n\nPlease return only valid JSON with nodes and edges arrays.`
      }
    ];

    const response = await chatWithClaude(messages);
    
    if (!response || !response.success) {
      throw new Error(response?.error || 'Failed to generate workflow with Claude');
    }

    try {
      // Try to parse JSON from the response
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: create a simple workflow structure
        return {
          nodes: [
            {
              id: 'start-node',
              type: 'enhanced',
              position: { x: 100, y: 100 },
              data: {
                label: 'Start',
                type_key: 'workflow_start',
                category: 'workflow',
                configuration: {}
              }
            },
            {
              id: 'end-node',
              type: 'enhanced',
              position: { x: 400, y: 100 },
              data: {
                label: 'End',
                type_key: 'workflow_end',
                category: 'workflow',
                configuration: {}
              }
            }
          ],
          edges: [
            {
              id: 'start-to-end',
              source: 'start-node',
              target: 'end-node',
              type: 'smoothstep',
              animated: true
            }
          ]
        };
      }
    } catch (parseError) {
      console.error('Failed to parse Claude response as JSON:', parseError);
      throw new Error('Claude generated invalid JSON response');
    }
  };

  return {
    chatWithClaude,
    generateWorkflowWithClaude,
    isLoading,
    error
  };
};