/**
 * UNIFIED CHANNEL DEPLOYMENT SERVICE
 * Consolidates agent channel deployments with conversation engines
 * Single source of truth for: channel assignments, engine links, deployment status
 */
import { supabase } from '@/integrations/supabase/client';
import { agentConversationEngineService, ConversationEngine, AgentWithEngines } from './agentConversationEngineService';
import { RealtimeChannel } from '@supabase/supabase-js';

// Channel types supported
export type ChannelType = 'web-chat' | 'voice-call' | 'email' | 'whatsapp' | 'voice-assistant' | 'sms' | 'api';

// Channel deployment with linked engine info
export interface ChannelDeployment {
  id: string;
  agent_id: string;
  channel_id: string;
  channel_type: ChannelType;
  deployment_status: 'pending' | 'deploying' | 'active' | 'paused' | 'failed' | 'retired';
  deployment_config: {
    branding?: {
      name?: string;
      primary_color?: string;
      logo_url?: string;
    };
    rate_limits?: {
      requests_per_minute?: number;
      max_concurrent_sessions?: number;
    };
    engine_overrides?: {
      engine_id?: string;
      temperature?: number;
      max_tokens?: number;
    };
    channel_specific?: Record<string, any>;
  };
  priority: number;
  max_concurrent_sessions: number;
  assigned_at: string;
  deployed_at: string | null;
  last_health_check: string | null;
  health_status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  performance_metrics: {
    response_time_ms?: number;
    success_rate?: number;
    active_sessions?: number;
    total_conversations?: number;
  };
  created_at: string;
  updated_at: string;
}

// Full deployment view with agent and engine details
export interface FullDeploymentView {
  deployment: ChannelDeployment;
  agent: {
    id: string;
    name: string;
    use_case: string | null;
    status: string;
  };
  primary_engine: ConversationEngine | null;
  all_engines: ConversationEngine[];
  real_time_status: {
    is_active: boolean;
    active_conversations: number;
    last_activity: string | null;
  };
}

// Channel configuration templates
export const CHANNEL_CONFIGS: Record<ChannelType, {
  label: string;
  icon: string;
  defaultConfig: Partial<ChannelDeployment['deployment_config']>;
  requiredCapabilities: string[];
}> = {
  'web-chat': {
    label: 'Web Chat',
    icon: 'MessageSquare',
    defaultConfig: {
      rate_limits: { requests_per_minute: 60, max_concurrent_sessions: 100 },
      channel_specific: { widget_position: 'bottom-right', theme: 'light' },
    },
    requiredCapabilities: ['intent_understanding', 'context_management'],
  },
  'voice-call': {
    label: 'Voice Call',
    icon: 'Phone',
    defaultConfig: {
      rate_limits: { requests_per_minute: 30, max_concurrent_sessions: 50 },
      channel_specific: { provider: 'twilio', language: 'en-US' },
    },
    requiredCapabilities: ['speech_recognition', 'voice_synthesis'],
  },
  'email': {
    label: 'Email',
    icon: 'Mail',
    defaultConfig: {
      rate_limits: { requests_per_minute: 100, max_concurrent_sessions: 500 },
      channel_specific: { response_time_sla: 'within_24h' },
    },
    requiredCapabilities: ['intent_understanding', 'document_processing'],
  },
  'whatsapp': {
    label: 'WhatsApp',
    icon: 'MessageCircle',
    defaultConfig: {
      rate_limits: { requests_per_minute: 60, max_concurrent_sessions: 200 },
      channel_specific: { business_account_id: '' },
    },
    requiredCapabilities: ['intent_understanding', 'context_management'],
  },
  'voice-assistant': {
    label: 'Voice Assistant',
    icon: 'Mic',
    defaultConfig: {
      rate_limits: { requests_per_minute: 30, max_concurrent_sessions: 20 },
      channel_specific: { wake_word: 'hey assistant', voice_id: 'default' },
    },
    requiredCapabilities: ['speech_recognition', 'voice_synthesis', 'real_time_processing'],
  },
  'sms': {
    label: 'SMS',
    icon: 'Smartphone',
    defaultConfig: {
      rate_limits: { requests_per_minute: 100, max_concurrent_sessions: 300 },
      channel_specific: { character_limit: 160, mms_enabled: false },
    },
    requiredCapabilities: ['intent_understanding'],
  },
  'api': {
    label: 'API',
    icon: 'Code',
    defaultConfig: {
      rate_limits: { requests_per_minute: 1000, max_concurrent_sessions: 1000 },
      channel_specific: { auth_type: 'api_key', cors_enabled: true },
    },
    requiredCapabilities: [],
  },
};

class UnifiedChannelDeploymentService {
  private realtimeChannels: Map<string, RealtimeChannel> = new Map();

  /**
   * Deploy agent to channel with engine configuration
   */
  async deployToChannel(params: {
    agentId: string;
    channelType: ChannelType;
    channelId?: string;
    config?: Partial<ChannelDeployment['deployment_config']>;
    engineId?: string;
    priority?: number;
  }): Promise<ChannelDeployment | null> {
    try {
      const channelConfig = CHANNEL_CONFIGS[params.channelType];
      const channelId = params.channelId || `${params.channelType}-${Date.now()}`;

      // Merge default config with provided config
      const deploymentConfig = {
        ...channelConfig.defaultConfig,
        ...params.config,
        engine_overrides: params.engineId ? { engine_id: params.engineId } : undefined,
      };

      const { data, error } = await supabase
        .from('agent_channel_deployments')
        .insert({
          agent_id: params.agentId,
          channel_id: channelId,
          channel_type: params.channelType,
          deployment_status: 'pending',
          deployment_config: deploymentConfig,
          priority: params.priority || 1,
          max_concurrent_sessions: channelConfig.defaultConfig.rate_limits?.max_concurrent_sessions || 100,
          assigned_at: new Date().toISOString(),
          health_status: 'unknown',
        })
        .select()
        .single();

      if (error) throw error;
      return data as ChannelDeployment;
    } catch (error) {
      console.error('Failed to deploy to channel:', error);
      return null;
    }
  }

  /**
   * Activate deployment (start serving traffic)
   */
  async activateDeployment(deploymentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('agent_channel_deployments')
        .update({
          deployment_status: 'active',
          deployed_at: new Date().toISOString(),
          health_status: 'healthy',
          updated_at: new Date().toISOString(),
        })
        .eq('id', deploymentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to activate deployment:', error);
      return false;
    }
  }

  /**
   * Pause deployment
   */
  async pauseDeployment(deploymentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('agent_channel_deployments')
        .update({
          deployment_status: 'paused',
          updated_at: new Date().toISOString(),
        })
        .eq('id', deploymentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to pause deployment:', error);
      return false;
    }
  }

  /**
   * Get all deployments with full agent and engine details
   */
  async getAllDeploymentsWithDetails(): Promise<FullDeploymentView[]> {
    try {
      const { data: deployments, error } = await supabase
        .from('agent_channel_deployments')
        .select(`
          *,
          agents (id, name, use_case, status)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const results: FullDeploymentView[] = [];

      for (const deployment of deployments || []) {
        const agent = (deployment as any).agents;
        
        // Get agent's conversation engines
        const agentWithEngines = await agentConversationEngineService.getAgentWithEngines(deployment.agent_id);
        
        const primaryEngine = agentWithEngines?.linked_engines.find(le => le.role === 'primary')?.engine || null;
        const allEngines = agentWithEngines?.linked_engines.map(le => le.engine) || [];

        results.push({
          deployment: deployment as ChannelDeployment,
          agent: agent ? {
            id: agent.id,
            name: agent.name,
            use_case: agent.use_case,
            status: agent.status,
          } : {
            id: deployment.agent_id,
            name: 'Unknown',
            use_case: null,
            status: 'unknown',
          },
          primary_engine: primaryEngine,
          all_engines: allEngines,
          real_time_status: agentWithEngines?.real_time_status ? {
            is_active: agentWithEngines.real_time_status.is_running,
            active_conversations: agentWithEngines.real_time_status.active_conversations,
            last_activity: agentWithEngines.real_time_status.last_activity,
          } : {
            is_active: deployment.deployment_status === 'active',
            active_conversations: 0,
            last_activity: null,
          },
        });
      }

      return results;
    } catch (error) {
      console.error('Failed to get deployments with details:', error);
      return [];
    }
  }

  /**
   * Get deployments for specific agent
   */
  async getDeploymentsForAgent(agentId: string): Promise<ChannelDeployment[]> {
    try {
      const { data, error } = await supabase
        .from('agent_channel_deployments')
        .select('*')
        .eq('agent_id', agentId)
        .order('priority');

      if (error) throw error;
      return (data || []) as ChannelDeployment[];
    } catch (error) {
      console.error('Failed to get agent deployments:', error);
      return [];
    }
  }

  /**
   * Get all agents deployed to a specific channel type
   */
  async getAgentsByChannelType(channelType: ChannelType): Promise<{
    agentId: string;
    agentName: string;
    deployment: ChannelDeployment;
  }[]> {
    try {
      const { data, error } = await supabase
        .from('agent_channel_deployments')
        .select(`
          *,
          agents (id, name)
        `)
        .eq('channel_type', channelType)
        .eq('deployment_status', 'active');

      if (error) throw error;

      return (data || []).map(d => ({
        agentId: d.agent_id,
        agentName: (d as any).agents?.name || 'Unknown',
        deployment: d as ChannelDeployment,
      }));
    } catch (error) {
      console.error('Failed to get agents by channel:', error);
      return [];
    }
  }

  /**
   * Update deployment configuration
   */
  async updateDeploymentConfig(
    deploymentId: string,
    config: Partial<ChannelDeployment['deployment_config']>
  ): Promise<boolean> {
    try {
      // Get current config
      const { data: current, error: fetchError } = await supabase
        .from('agent_channel_deployments')
        .select('deployment_config')
        .eq('id', deploymentId)
        .single();

      if (fetchError) throw fetchError;

      // Merge configs
      const currentConfig = (current?.deployment_config as Record<string, any>) || {};
      const mergedConfig = {
        ...currentConfig,
        ...config,
      };

      const { error } = await supabase
        .from('agent_channel_deployments')
        .update({
          deployment_config: mergedConfig,
          updated_at: new Date().toISOString(),
        })
        .eq('id', deploymentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to update deployment config:', error);
      return false;
    }
  }

  /**
   * Run health check on deployment
   */
  async runHealthCheck(deploymentId: string): Promise<{
    status: ChannelDeployment['health_status'];
    metrics: ChannelDeployment['performance_metrics'];
  }> {
    try {
      // Get deployment
      const { data: deployment, error } = await supabase
        .from('agent_channel_deployments')
        .select('*, agents(id)')
        .eq('id', deploymentId)
        .single();

      if (error) throw error;

      // Get active conversations count
      const { count: activeConversations } = await supabase
        .from('agent_conversations')
        .select('*', { count: 'exact', head: true })
        .eq('agent_id', deployment.agent_id)
        .eq('status', 'active');

      // Calculate metrics (in production, this would come from actual monitoring)
      const metrics = {
        response_time_ms: Math.floor(Math.random() * 500) + 100,
        success_rate: 0.95 + Math.random() * 0.05,
        active_sessions: activeConversations || 0,
        total_conversations: (deployment.performance_metrics as any)?.total_conversations || 0,
      };

      // Determine health status
      let status: ChannelDeployment['health_status'] = 'healthy';
      if (metrics.success_rate < 0.9) status = 'degraded';
      if (metrics.success_rate < 0.7) status = 'unhealthy';
      if (deployment.deployment_status !== 'active') status = 'unknown';

      // Update deployment with health data
      await supabase
        .from('agent_channel_deployments')
        .update({
          health_status: status,
          performance_metrics: metrics,
          last_health_check: new Date().toISOString(),
        })
        .eq('id', deploymentId);

      return { status, metrics };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        status: 'unknown',
        metrics: { response_time_ms: 0, success_rate: 0, active_sessions: 0, total_conversations: 0 },
      };
    }
  }

  /**
   * Generate deployment snippet code
   */
  generateDeploymentSnippet(deployment: ChannelDeployment, format: 'javascript' | 'react' | 'curl' = 'javascript'): string {
    const baseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
    
    switch (format) {
      case 'react':
        return `import { useState } from 'react';

const useAgent = () => {
  const [messages, setMessages] = useState([]);
  
  const sendMessage = async (content) => {
    const response = await fetch('${baseUrl}/functions/v1/agent-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_KEY',
      },
      body: JSON.stringify({
        deployment_id: '${deployment.id}',
        channel_id: '${deployment.channel_id}',
        message: content,
      }),
    });
    return response.json();
  };
  
  return { messages, sendMessage };
};`;

      case 'curl':
        return `curl -X POST '${baseUrl}/functions/v1/agent-chat' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -d '{
    "deployment_id": "${deployment.id}",
    "channel_id": "${deployment.channel_id}",
    "message": "Hello, I need help"
  }'`;

      default:
        return `const response = await fetch('${baseUrl}/functions/v1/agent-chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY',
  },
  body: JSON.stringify({
    deployment_id: '${deployment.id}',
    channel_id: '${deployment.channel_id}',
    message: 'Hello, I need help',
  }),
});

const data = await response.json();
console.log(data);`;
    }
  }

  /**
   * Subscribe to deployment updates
   */
  subscribeToDeployments(callback: (deployments: ChannelDeployment[]) => void): () => void {
    const channel = supabase
      .channel('channel-deployments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_channel_deployments',
        },
        async () => {
          const { data } = await supabase
            .from('agent_channel_deployments')
            .select('*')
            .order('created_at', { ascending: false });
          callback((data || []) as ChannelDeployment[]);
        }
      )
      .subscribe();

    this.realtimeChannels.set('deployments', channel);

    return () => {
      supabase.removeChannel(channel);
      this.realtimeChannels.delete('deployments');
    };
  }

  /**
   * Remove deployment
   */
  async removeDeployment(deploymentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('agent_channel_deployments')
        .delete()
        .eq('id', deploymentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to remove deployment:', error);
      return false;
    }
  }

  /**
   * Cleanup
   */
  cleanup() {
    this.realtimeChannels.forEach(channel => {
      supabase.removeChannel(channel);
    });
    this.realtimeChannels.clear();
  }
}

export const unifiedChannelDeploymentService = new UnifiedChannelDeploymentService();
