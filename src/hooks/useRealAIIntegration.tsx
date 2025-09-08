/**
 * Real AI Integration Hook
 * Integrates with actual AI providers for workflow generation
 */

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AIGenerationConfig {
  provider: 'openai' | 'claude' | 'gemini';
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

interface WorkflowGenerationRequest {
  prompt: string;
  context?: {
    existingNodes?: any[];
    templateId?: string;
    industry?: string;
    category?: string;
  };
  config?: AIGenerationConfig;
}

export const useRealAIIntegration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateWorkflowFromPrompt = async (request: WorkflowGenerationRequest) => {
    setIsGenerating(true);
    
    try {
      console.log('🤖 Generating workflow with real AI integration...');
      
      // Call Supabase edge function for AI generation
      const { data, error } = await supabase.functions.invoke('generate-agent-from-prompt', {
        body: {
          prompt: request.prompt,
          provider: request.config?.provider || 'openai',
          generation_options: {
            include_workflow: true,
            context: request.context,
            model: request.config?.model,
            temperature: request.config?.temperature || 0.7,
            max_tokens: request.config?.maxTokens || 2000
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log('✅ AI workflow generation completed');
      
      toast({
        title: "Workflow Generated",
        description: "AI has successfully generated your workflow from the prompt.",
      });

      return {
        success: true,
        workflow: data,
        nodes: data?.workflow?.nodes || [],
        edges: data?.workflow?.edges || [],
        metadata: data?.metadata || {}
      };

    } catch (error) {
      console.error('❌ AI generation failed:', error);
      
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate workflow",
        variant: "destructive",
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    } finally {
      setIsGenerating(false);
    }
  };

  const enhancePromptWithContext = async (prompt: string, context: any) => {
    try {
      // Get available node types and categories for context
      const { data: nodeTypes } = await supabase
        .from('workflow_node_types')
        .select('type_key, display_name, category_id, description, configuration_schema')
        .eq('is_active', true);

      const { data: categories } = await supabase
        .from('workflow_node_categories')
        .select('name, display_name, description')
        .eq('is_active', true);

      const enhancedPrompt = `
        ${prompt}
        
        CONTEXT:
        - Available Node Types: ${nodeTypes?.map(n => `${n.display_name} (${n.type_key})`).join(', ')}
        - Categories: ${categories?.map(c => c.display_name).join(', ')}
        - Industry: ${context.industry || 'general'}
        - Existing Nodes: ${context.existingNodes?.length || 0} nodes
        
        Please generate a workflow that uses appropriate node types from the available options.
      `;

      return enhancedPrompt;
    } catch (error) {
      console.error('Failed to enhance prompt:', error);
      return prompt;
    }
  };

  const validateGeneratedWorkflow = (workflow: any) => {
    if (!workflow || !workflow.nodes || !Array.isArray(workflow.nodes)) {
      throw new Error('Invalid workflow structure: missing nodes');
    }

    if (!workflow.edges || !Array.isArray(workflow.edges)) {
      throw new Error('Invalid workflow structure: missing edges');
    }

    // Validate node connections
    const nodeIds = new Set(workflow.nodes.map((n: any) => n.id));
    for (const edge of workflow.edges) {
      if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
        throw new Error('Invalid workflow: disconnected nodes detected');
      }
    }

    return true;
  };

  return {
    generateWorkflowFromPrompt,
    enhancePromptWithContext,
    validateGeneratedWorkflow,
    isGenerating
  };
};