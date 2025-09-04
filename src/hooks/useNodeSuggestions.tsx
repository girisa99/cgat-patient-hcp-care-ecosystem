import { useState, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';

interface NodeSuggestionConfig {
  id: string;
  type: string;
  label: string;
  description: string;
  category: string;
  priority: string;
  config: any;
  dependencies?: string[];
}

interface NodeAnalytics {
  nodeType: string;
  usageCount: number;
  successRate: number;
  averageExecutionTime: number;
  commonConnections: string[];
  userRating: number;
}

export const useNodeSuggestions = () => {
  const { showSuccess, showError } = useMasterToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Fetch node analytics from backend
  const { data: nodeAnalytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['node-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('node_analytics')
        .select('*')
        .order('usage_count', { ascending: false })
        .limit(20);

      if (error) throw error;

      return (data || []).map(item => ({
        nodeType: item.node_type,
        usageCount: item.usage_count,
        successRate: item.success_count > 0 ? item.success_count / (item.success_count + item.failure_count) : 0,
        averageExecutionTime: item.average_execution_time_ms / 1000, // Convert to seconds
        commonConnections: item.common_connections || [],
        userRating: item.user_rating || 0,
        performanceMetrics: item.performance_metrics || {}
      })) as NodeAnalytics[];
    },
  });

  // Save node configuration (updated for consolidated structure)
  const saveNodeConfig = useMutation({
    mutationFn: async (config: NodeSuggestionConfig) => {
      // Save to workflow_node_instances instead of node_configurations
      const { data, error } = await supabase
        .from('workflow_node_instances')
        .upsert({
          workflow_id: config.config?.workflowId,
          node_id: config.id,
          node_type_key: config.type,
          instance_name: config.label,
          configuration: {
            variables: config.config?.variables || [],
            apis: config.config?.apis || [],
            dataStorage: config.config?.dataStorage || {},
            connectors: config.config?.connectors || [],
            aiModel: config.config?.aiModel || {}
          },
          metadata: {
            category: config.category,
            priority: config.priority,
            dependencies: config.dependencies || []
          }
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      showSuccess('Node configuration saved successfully');
    },
    onError: (error) => {
      showError('Failed to save node configuration: ' + error.message);
    }
  });

  // Analyze workflow and generate suggestions
  const analyzeWorkflowForSuggestions = useCallback(async (
    currentNodes: any[], 
    workflowContext: any
  ) => {
    setIsAnalyzing(true);
    
    try {
      // Call edge function for AI-powered analysis
      const { data, error } = await supabase.functions.invoke('analyze-workflow-suggestions', {
        body: {
          nodes: currentNodes,
          context: workflowContext,
          analytics: nodeAnalytics
        }
      });

      if (error) throw error;
      
      return data.suggestions as NodeSuggestionConfig[];
    } catch (error) {
      console.error('Workflow analysis failed:', error);
      showError('Failed to analyze workflow for suggestions');
      return [];
    } finally {
      setIsAnalyzing(false);
    }
  }, [nodeAnalytics, showError]);

  // Track node usage for analytics
  const trackNodeUsage = useMutation({
    mutationFn: async (nodeData: {
      nodeType: string;
      nodeId: string;
      action: 'created' | 'configured' | 'executed' | 'removed' | 'modified';
      workflowId?: string;
      executionTime?: number;
      success?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('node_usage_events')
        .insert({
          node_type: nodeData.nodeType,
          node_id: nodeData.nodeId,
          workflow_id: nodeData.workflowId || null,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          action: nodeData.action,
          execution_time_ms: nodeData.executionTime,
          success: nodeData.success,
          metadata: { timestamp: new Date().toISOString() }
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  });

  // Get node-specific configuration templates
  const getNodeConfigTemplate = useCallback(async (nodeType: string) => {
    const { data, error } = await supabase
      .from('node_config_templates')
      .select('*')
      .eq('node_type', nodeType)
      .eq('is_active', true)
      .order('usage_count', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    
    if (data) {
      return data.default_config;
    }
    
    // Fallback to built-in template
    return getDefaultConfigTemplate(nodeType);
  }, []);

  // Default configuration templates for different node types
  const getDefaultConfigTemplate = (nodeType: string) => {
    const templates: Record<string, any> = {
      decision: {
        conditions: [
          { field: '', operator: 'equals', value: '', logicalOperator: 'AND' }
        ],
        defaultPath: 'continue',
        evaluationType: 'rule-based',
        timeout: 30
      },
      agent: {
        model: 'gpt-4o-mini',
        temperature: 0.7,
        maxTokens: 1000,
        systemPrompt: 'You are a helpful AI assistant.',
        capabilities: ['conversation', 'reasoning'],
        fallbackResponses: ['I need more information to help you.'],
        conversationMemory: true
      },
      escalation: {
        triggers: [
          { condition: 'timeout', value: 300, action: 'escalate' },
          { condition: 'sentiment', value: 'negative', action: 'human_handoff' }
        ],
        escalationLevels: [
          { level: 1, assignTo: 'supervisor', timeout: 600 },
          { level: 2, assignTo: 'manager', timeout: 1800 }
        ],
        notificationChannels: ['email', 'slack']
      },
      followup: {
        delay: 24,
        delayUnit: 'hours',
        actionType: 'reminder',
        template: 'Follow-up reminder: {{task_description}}',
        conditions: [
          { field: 'status', operator: 'not_equals', value: 'completed' }
        ],
        maxAttempts: 3
      },
      assignment: {
        assignmentType: 'role-based',
        roles: ['support_agent', 'supervisor'],
        loadBalancing: 'round-robin',
        workloadLimits: { max_active_tasks: 10 },
        autoAssignment: true
      },
      validation: {
        validationRules: [
          { field: 'email', type: 'email', required: true },
          { field: 'phone', type: 'phone', required: false }
        ],
        errorHandling: 'stop',
        customValidation: null,
        sanitization: true
      },
      notification: {
        channels: ['email'],
        template: 'default',
        recipients: [],
        conditions: [],
        priority: 'normal',
        deliveryOptions: { retry: 3, backoff: 'exponential' }
      },
      api: {
        endpoint: '',
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        authentication: 'none',
        responseMapping: {},
        timeout: 30,
        retryPolicy: { attempts: 3, backoff: 'linear' }
      },
      trigger: {
        triggerType: 'event',
        eventSource: 'webhook',
        conditions: [],
        debounce: 0,
        rateLimit: { requests: 100, window: 60 },
        authentication: true
      },
      custom: {
        runtime: 'javascript',
        code: '// Your custom code here\nreturn { success: true };',
        parameters: {},
        timeout: 30,
        dependencies: [],
        environment: 'sandbox'
      }
    };

    return templates[nodeType] || {};
  };

  // Validate node configuration
  const validateNodeConfig = useCallback((nodeType: string, config: any) => {
    const errors: string[] = [];
    
    switch (nodeType) {
      case 'agent':
        if (!config.model) errors.push('AI model is required');
        if (!config.systemPrompt) errors.push('System prompt is required');
        if (config.temperature < 0 || config.temperature > 2) {
          errors.push('Temperature must be between 0 and 2');
        }
        break;
      
      case 'api':
        if (!config.endpoint) errors.push('API endpoint is required');
        if (!['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(config.method)) {
          errors.push('Invalid HTTP method');
        }
        break;
      
      case 'decision':
        if (!config.conditions || config.conditions.length === 0) {
          errors.push('At least one condition is required');
        }
        break;
      
      // Add more validation rules as needed
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  return {
    nodeAnalytics,
    analyticsLoading,
    isAnalyzing,
    analyzeWorkflowForSuggestions,
    saveNodeConfig: saveNodeConfig.mutate,
    isSavingConfig: saveNodeConfig.isPending,
    trackNodeUsage: trackNodeUsage.mutate,
    getNodeConfigTemplate,
    validateNodeConfig,
    getDefaultConfigTemplate
  };
};