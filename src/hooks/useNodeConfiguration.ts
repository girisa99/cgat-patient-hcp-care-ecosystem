import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface NodeConfig {
  id?: string;
  node_id: string;
  workflow_id?: string;
  agent_session_id?: string;
  node_type: string;
  configuration: any;
  version?: number;
  change_summary?: string;
  is_active?: boolean;
}

export interface ToolExecution {
  id?: string;
  node_config_id: string;
  tool_name: string;
  tool_type: string;
  execution_context?: any;
  input_data?: any;
  output_data?: any;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'timeout';
  error_details?: any;
  duration_ms?: number;
}

export interface VectorConfig {
  id?: string;
  node_config_id: string;
  vector_store_type: string;
  embedding_model: string;
  knowledge_name: string;
  description?: string;
  configuration: any;
  document_sources?: any[];
  return_source_documents?: boolean;
}

export interface KnowledgeBaseConfig {
  id?: string;
  node_config_id: string;
  knowledge_type: 'document_store' | 'vector_embedding' | 'api_source';
  source_table?: string;
  source_column?: string;
  configuration: any;
  metadata?: any;
  is_enabled?: boolean;
}

export const useNodeConfiguration = (nodeId?: string, sessionId?: string, workflowId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query node configuration
  const { data: nodeConfig, isLoading, error } = useQuery({
    queryKey: ['node-config', nodeId, sessionId, workflowId],
    queryFn: async () => {
      if (!nodeId) return null;

      const { data, error } = await supabase
        .from('nodes_config')
        .select('*')
        .eq('node_id', nodeId)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!nodeId,
  });

  // Query tool executions for this node
  const { data: toolExecutions } = useQuery({
    queryKey: ['tool-executions', nodeConfig?.id],
    queryFn: async () => {
      if (!nodeConfig?.id) return [];

      const { data, error } = await supabase
        .from('tool_executions')
        .select('*')
        .eq('node_config_id', nodeConfig.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!nodeConfig?.id,
  });

  // Save/update node configuration
  const saveConfigMutation = useMutation({
    mutationFn: async (config: Partial<NodeConfig>) => {
      if (nodeConfig?.id) {
        // Update existing
        const { data, error } = await supabase
          .from('nodes_config')
          .update({
            configuration: config.configuration,
            change_summary: config.change_summary,
            version: (nodeConfig.version || 0) + 1,
          })
          .eq('id', nodeConfig.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('nodes_config')
          .insert({
            node_id: nodeId!,
            workflow_id: workflowId,
            agent_session_id: sessionId,
            node_type: config.node_type!,
            configuration: config.configuration || {},
            created_by: (await supabase.auth.getUser()).data.user?.id,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['node-config', nodeId, sessionId, workflowId] });
      toast({
        title: "Configuration Saved",
        description: "Node configuration has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to save configuration',
        variant: "destructive",
      });
    },
  });

  // Execute tool
  const executeToolMutation = useMutation({
    mutationFn: async ({ toolName, toolType, inputData, executionContext }: {
      toolName: string;
      toolType: string;
      inputData?: any;
      executionContext?: any;
    }) => {
      if (!nodeConfig?.id) throw new Error('Node configuration not found');

      // Start tool execution log
      const { data: execution, error: logError } = await supabase
        .from('tool_executions')
        .insert({
          node_config_id: nodeConfig.id,
          tool_name: toolName,
          tool_type: toolType,
          input_data: inputData || {},
          execution_context: executionContext || {},
          status: 'running',
          triggered_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (logError) throw logError;

      try {
        const startTime = Date.now();

        // Execute tool via AI universal processor
        const { data: result, error: execError } = await supabase.functions.invoke('ai-universal-processor', {
          body: {
            action: 'execute_tool',
            tool_name: toolName,
            tool_type: toolType,
            input_data: inputData,
            execution_context: executionContext,
            node_configuration: nodeConfig.configuration,
          },
        });

        const duration = Date.now() - startTime;

        if (execError) throw execError;

        // Update execution log with success
        await supabase
          .from('tool_executions')
          .update({
            status: 'completed',
            output_data: result,
            duration_ms: duration,
            completed_at: new Date().toISOString(),
          })
          .eq('id', execution.id);

        return { execution, result };
      } catch (error) {
        // Update execution log with failure
        await supabase
          .from('tool_executions')
          .update({
            status: 'failed',
            error_details: error instanceof Error ? { message: error.message } : { error },
            completed_at: new Date().toISOString(),
          })
          .eq('id', execution.id);

        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tool-executions', nodeConfig?.id] });
      toast({
        title: "Tool Executed",
        description: "Tool has been executed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Execution Failed",
        description: error instanceof Error ? error.message : 'Tool execution failed',
        variant: "destructive",
      });
    },
  });

  // Save vector configuration
  const saveVectorConfigMutation = useMutation({
    mutationFn: async (config: Partial<VectorConfig>) => {
      if (!nodeConfig?.id) throw new Error('Node configuration not found');

      const { data, error } = await supabase
        .from('vector_configs')
        .upsert({
          node_config_id: nodeConfig.id,
          vector_store_type: config.vector_store_type!,
          embedding_model: config.embedding_model!,
          knowledge_name: config.knowledge_name!,
          description: config.description,
          configuration: config.configuration || {},
          document_sources: config.document_sources || [],
          return_source_documents: config.return_source_documents ?? true,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Vector Config Saved",
        description: "Vector store configuration has been saved.",
      });
    },
  });

  // Save knowledge base configuration
  const saveKnowledgeConfigMutation = useMutation({
    mutationFn: async (config: Partial<KnowledgeBaseConfig>) => {
      if (!nodeConfig?.id) throw new Error('Node configuration not found');

      const { data, error } = await supabase
        .from('knowledge_base_configs')
        .upsert({
          node_config_id: nodeConfig.id,
          knowledge_type: config.knowledge_type!,
          source_table: config.source_table,
          source_column: config.source_column,
          configuration: config.configuration || {},
          metadata: config.metadata || {},
          is_enabled: config.is_enabled ?? true,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Knowledge Config Saved",
        description: "Knowledge base configuration has been saved.",
      });
    },
  });

  return {
    nodeConfig,
    toolExecutions,
    isLoading,
    error,
    saveConfiguration: saveConfigMutation.mutate,
    executeTool: executeToolMutation.mutate,
    saveVectorConfig: saveVectorConfigMutation.mutate,
    saveKnowledgeConfig: saveKnowledgeConfigMutation.mutate,
    isSaving: saveConfigMutation.isPending,
    isExecuting: executeToolMutation.isPending,
  };
};