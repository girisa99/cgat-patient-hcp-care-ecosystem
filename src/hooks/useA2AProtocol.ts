/**
 * Google A2A Protocol Implementation Hook
 * Implements Agent-to-Agent communication following Google's A2A specification
 * https://google.github.io/A2A/
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';

// A2A Protocol Types
export interface AgentCard {
  id: string;
  name: string;
  description: string;
  version: string;
  capabilities: AgentCapability[];
  skills: AgentSkill[];
  endpoints: AgentEndpoint[];
  authentication: AuthenticationConfig;
  metadata: Record<string, any>;
}

export interface AgentCapability {
  id: string;
  name: string;
  description: string;
  inputSchema?: Record<string, any>;
  outputSchema?: Record<string, any>;
}

export interface AgentSkill {
  id: string;
  name: string;
  description: string;
  tags: string[];
  examples: string[];
}

export interface AgentEndpoint {
  type: 'http' | 'websocket' | 'sse';
  url: string;
  methods?: string[];
}

export interface AuthenticationConfig {
  type: 'none' | 'api_key' | 'oauth2' | 'jwt';
  config?: Record<string, any>;
}

// Task Management Types
export type TaskStatus = 
  | 'submitted' 
  | 'working' 
  | 'input-required' 
  | 'completed' 
  | 'failed' 
  | 'canceled';

export interface A2ATask {
  id: string;
  sessionId?: string;
  status: TaskStatus;
  message: TaskMessage;
  artifacts: TaskArtifact[];
  history: TaskMessage[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface TaskMessage {
  role: 'user' | 'agent';
  parts: MessagePart[];
  timestamp: string;
}

export interface MessagePart {
  type: 'text' | 'file' | 'data';
  content: string | Record<string, any>;
  mimeType?: string;
}

export interface TaskArtifact {
  id: string;
  name: string;
  mimeType: string;
  data: string | Record<string, any>;
  metadata?: Record<string, any>;
}

// Push Notification Types
export interface PushNotificationConfig {
  url: string;
  events: string[];
  authentication?: AuthenticationConfig;
}

export const useA2AProtocol = (agentId?: string) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useMasterToast();
  const [activeTasks, setActiveTasks] = useState<Map<string, A2ATask>>(new Map());
  const [sseConnections, setSseConnections] = useState<Map<string, EventSource>>(new Map());

  // Fetch agent card (discovery)
  const { data: agentCard, isLoading: cardLoading } = useQuery({
    queryKey: ['agent-card', agentId],
    queryFn: async () => {
      if (!agentId) return null;

      const { data: agent } = await supabase
        .from('agents')
        .select('*')
        .eq('id', agentId)
        .single();

      if (!agent) return null;

      // Build agent card from agent data
      const card: AgentCard = {
        id: agent.id,
        name: agent.name,
        description: agent.description || '',
        version: '1.0.0',
        capabilities: buildCapabilities(agent),
        skills: buildSkills(agent),
        endpoints: buildEndpoints(agent),
        authentication: { type: 'api_key' },
        metadata: {
          useCase: agent.use_case,
          agentType: agent.agent_type,
          provider: agent.model_provider
        }
      };

      return card;
    },
    enabled: !!agentId
  });

  // Discover remote agents
  const discoverAgentsMutation = useMutation({
    mutationFn: async (discoveryUrl?: string) => {
      // Fetch all available agents as "discoverable"
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .in('status', ['deployed', 'active']);

      if (error) throw error;

      return data.map(agent => ({
        id: agent.id,
        name: agent.name,
        description: agent.description,
        version: '1.0.0',
        capabilities: buildCapabilities(agent),
        skills: buildSkills(agent),
        endpoints: buildEndpoints(agent),
        authentication: { type: 'api_key' as const },
        metadata: { useCase: agent.use_case }
      }));
    },
    onSuccess: (agents) => {
      showSuccess('Discovery Complete', `Found ${agents.length} agents`);
    },
    onError: (error: any) => {
      showError('Discovery Failed', error.message);
    }
  });

  // Send task to agent (tasks/send)
  const sendTaskMutation = useMutation({
    mutationFn: async ({
      targetAgentId,
      message,
      sessionId
    }: {
      targetAgentId: string;
      message: TaskMessage;
      sessionId?: string;
    }) => {
      const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const task: A2ATask = {
        id: taskId,
        sessionId,
        status: 'submitted',
        message,
        artifacts: [],
        history: [message],
        metadata: {
          sourceAgentId: agentId,
          targetAgentId,
          submittedAt: new Date().toISOString()
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Store task in communications table
      const { error } = await supabase
        .from('agent_communications')
        .insert([{
          from_agent_id: agentId || targetAgentId,
          to_agent_id: targetAgentId,
          message_type: 'request',
          message_payload: {
            taskId,
            message,
            protocol: 'a2a',
            version: '1.0'
          } as any,
          conversation_id: sessionId,
          status: 'sent',
          metadata: { a2aTask: task } as any
        }]);

      if (error) throw error;

      // Update local state
      setActiveTasks(prev => new Map(prev).set(taskId, task));

      // Simulate task processing
      setTimeout(() => {
        updateTaskStatus(taskId, 'working');
      }, 500);

      setTimeout(() => {
        updateTaskStatus(taskId, 'completed', [{
          id: `artifact_${Date.now()}`,
          name: 'response',
          mimeType: 'application/json',
          data: { result: 'Task completed successfully' }
        }]);
      }, 3000);

      return task;
    },
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ['agent-communications'] });
      showSuccess('Task Sent', `Task ${task.id} submitted`);
    },
    onError: (error: any) => {
      showError('Task Failed', error.message);
    }
  });

  // Get task status (tasks/get)
  const getTask = useCallback((taskId: string): A2ATask | undefined => {
    return activeTasks.get(taskId);
  }, [activeTasks]);

  // Cancel task (tasks/cancel)
  const cancelTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const task = activeTasks.get(taskId);
      if (!task) throw new Error('Task not found');

      if (['completed', 'failed', 'canceled'].includes(task.status)) {
        throw new Error('Cannot cancel task in terminal state');
      }

      updateTaskStatus(taskId, 'canceled');
      return task;
    },
    onSuccess: (task) => {
      showSuccess('Task Canceled', `Task ${task.id} has been canceled`);
    },
    onError: (error: any) => {
      showError('Cancel Failed', error.message);
    }
  });

  // Subscribe to task updates (SSE streaming)
  const subscribeToTask = useCallback((taskId: string, onUpdate: (task: A2ATask) => void) => {
    // Set up real-time subscription via Supabase
    const channel = supabase
      .channel(`task-${taskId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_communications',
          filter: `message_payload->>taskId=eq.${taskId}`
        },
        (payload) => {
          const updatedTask = (payload.new as any)?.metadata?.a2aTask;
          if (updatedTask) {
            onUpdate(updatedTask);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Set up push notifications
  const configurePushNotificationsMutation = useMutation({
    mutationFn: async (config: PushNotificationConfig) => {
      // Store push notification config for the agent
      const { error } = await supabase
        .from('agents')
        .update({
          configuration: {
            pushNotifications: config
          } as any
        })
        .eq('id', agentId);

      if (error) throw error;
      return config;
    },
    onSuccess: () => {
      showSuccess('Push Configured', 'Push notifications enabled');
    },
    onError: (error: any) => {
      showError('Configuration Failed', error.message);
    }
  });

  // Helper to update task status
  const updateTaskStatus = useCallback((
    taskId: string, 
    status: TaskStatus, 
    artifacts?: TaskArtifact[]
  ) => {
    setActiveTasks(prev => {
      const task = prev.get(taskId);
      if (!task) return prev;

      const updatedTask: A2ATask = {
        ...task,
        status,
        artifacts: artifacts || task.artifacts,
        updatedAt: new Date().toISOString()
      };

      const newMap = new Map(prev);
      newMap.set(taskId, updatedTask);
      return newMap;
    });

    // Dispatch custom event for external listeners
    window.dispatchEvent(new CustomEvent('a2a-task-update', {
      detail: { taskId, status, artifacts }
    }));
  }, []);

  // Send task with streaming response (tasks/sendSubscribe)
  const sendTaskWithStreamingMutation = useMutation({
    mutationFn: async ({
      targetAgentId,
      message,
      onChunk
    }: {
      targetAgentId: string;
      message: TaskMessage;
      onChunk?: (chunk: MessagePart) => void;
    }) => {
      const task = await sendTaskMutation.mutateAsync({ targetAgentId, message });
      
      // Set up subscription for streaming updates
      const unsubscribe = subscribeToTask(task.id, (updatedTask) => {
        if (onChunk && updatedTask.history.length > task.history.length) {
          const latestMessage = updatedTask.history[updatedTask.history.length - 1];
          latestMessage.parts.forEach(part => onChunk(part));
        }
      });

      // Return cleanup function with task
      return { task, unsubscribe };
    }
  });

  return {
    // Agent Card (Discovery)
    agentCard,
    isLoadingCard: cardLoading,
    discoverAgents: discoverAgentsMutation.mutate,
    isDiscovering: discoverAgentsMutation.isPending,
    discoveredAgents: discoverAgentsMutation.data,

    // Task Management
    activeTasks: Array.from(activeTasks.values()),
    sendTask: sendTaskMutation.mutate,
    sendTaskWithStreaming: sendTaskWithStreamingMutation.mutate,
    getTask,
    cancelTask: cancelTaskMutation.mutate,
    subscribeToTask,
    isSendingTask: sendTaskMutation.isPending,

    // Push Notifications
    configurePushNotifications: configurePushNotificationsMutation.mutate,
    isConfiguringPush: configurePushNotificationsMutation.isPending
  };
};

// Helper functions to build agent card components
function buildCapabilities(agent: any): AgentCapability[] {
  const baseCapabilities: AgentCapability[] = [
    {
      id: 'chat',
      name: 'Conversational Chat',
      description: 'Natural language conversation',
      inputSchema: { type: 'object', properties: { message: { type: 'string' } } },
      outputSchema: { type: 'object', properties: { response: { type: 'string' } } }
    }
  ];

  const features = agent.enabled_features || [];
  
  if (features.includes('rag')) {
    baseCapabilities.push({
      id: 'knowledge-retrieval',
      name: 'Knowledge Retrieval',
      description: 'RAG-based knowledge lookup',
      inputSchema: { type: 'object', properties: { query: { type: 'string' } } },
      outputSchema: { type: 'object', properties: { results: { type: 'array' } } }
    });
  }

  if (features.includes('mcp')) {
    baseCapabilities.push({
      id: 'tool-execution',
      name: 'Tool Execution',
      description: 'Execute MCP tools',
      inputSchema: { type: 'object', properties: { tool: { type: 'string' }, params: { type: 'object' } } },
      outputSchema: { type: 'object', properties: { result: { type: 'any' } } }
    });
  }

  return baseCapabilities;
}

function buildSkills(agent: any): AgentSkill[] {
  const useCase = agent.use_case || 'general';
  
  const skillMap: Record<string, AgentSkill[]> = {
    'patient-onboarding': [
      { id: 'intake', name: 'Patient Intake', description: 'Collect patient information', tags: ['healthcare', 'forms'], examples: ['Collect patient demographics'] },
      { id: 'insurance', name: 'Insurance Verification', description: 'Verify insurance coverage', tags: ['healthcare', 'verification'], examples: ['Check insurance eligibility'] }
    ],
    'order-status': [
      { id: 'tracking', name: 'Order Tracking', description: 'Track order status', tags: ['logistics', 'status'], examples: ['Where is my order?'] }
    ],
    'npi-registry': [
      { id: 'npi-lookup', name: 'NPI Lookup', description: 'Look up NPI numbers', tags: ['healthcare', 'verification'], examples: ['Find NPI for Dr. Smith'] }
    ],
    'general': [
      { id: 'qa', name: 'Question Answering', description: 'Answer questions', tags: ['general'], examples: ['What is...?'] }
    ]
  };

  return skillMap[useCase] || skillMap['general'];
}

function buildEndpoints(agent: any): AgentEndpoint[] {
  return [
    {
      type: 'http',
      url: `/api/agents/${agent.id}`,
      methods: ['POST', 'GET']
    },
    {
      type: 'websocket',
      url: `/ws/agents/${agent.id}`
    },
    {
      type: 'sse',
      url: `/api/agents/${agent.id}/stream`
    }
  ];
}
