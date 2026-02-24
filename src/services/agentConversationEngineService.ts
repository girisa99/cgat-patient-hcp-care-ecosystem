/**
 * AGENT CONVERSATION ENGINE SERVICE
 * Links agents to conversation engines (LLM, SML, MCP)
 * Provides real-time agent status and engine mappings
 * Connects NPI Registry, Credentialing, Enrollment agents to their engines
 */
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

// Conversation Engine Types
export interface ConversationEngine {
  id: string;
  name: string;
  engine_type: 'llm' | 'sml' | 'mcp' | 'hybrid';
  provider: string;
  model_identifier: string;
  configuration: {
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    confidence_threshold?: number;
    [key: string]: any;
  };
  capabilities: {
    intent_understanding?: boolean;
    entity_extraction?: boolean;
    context_management?: boolean;
    function_calling?: boolean;
    [key: string]: any;
  };
  performance_profile: {
    avg_response_time_ms?: number;
    accuracy_score?: number;
    cost_per_token?: number;
    [key: string]: any;
  };
  is_active: boolean;
  created_at: string;
}

// Agent-Engine Link
export interface AgentEngineLink {
  id: string;
  agent_id: string;
  conversation_engine_id: string;
  role: 'primary' | 'fallback' | 'specialized' | 'comparative';
  priority: number;
  conditions: {
    trigger_conditions?: string[];
    context_requirements?: string[];
    confidence_threshold?: number;
    [key: string]: any;
  };
  is_active: boolean;
  created_at: string;
}

// Agent with linked engines (real-time status)
export interface AgentWithEngines {
  id: string;
  name: string;
  description: string | null;
  use_case: string | null;
  agent_type: string | null;
  status: string;
  model_provider: string | null;
  model_name: string | null;
  enabled_features: string[] | null;
  linked_engines: {
    engine: ConversationEngine;
    role: AgentEngineLink['role'];
    priority: number;
    is_active: boolean;
  }[];
  real_time_status: {
    is_running: boolean;
    active_conversations: number;
    last_activity: string | null;
  };
}

// Pre-configured engine templates for different agent types
export const ENGINE_TEMPLATES = {
  npi_verification: {
    name: 'NPI Verification Engine',
    engine_type: 'mcp' as const,
    provider: 'healthcare-mcp',
    model_identifier: 'npi-verification-v1',
    configuration: {
      confidence_threshold: 0.95,
      validation_mode: 'strict',
      cache_duration_hours: 24,
    },
    capabilities: {
      npi_lookup: true,
      provider_verification: true,
      taxonomy_validation: true,
      real_time_updates: true,
    },
    performance_profile: {
      avg_response_time_ms: 500,
      accuracy_score: 0.99,
    },
  },
  credentialing: {
    name: 'Credentialing Engine',
    engine_type: 'hybrid' as const,
    provider: 'healthcare-mcp',
    model_identifier: 'credentialing-v1',
    configuration: {
      verification_levels: ['basic', 'standard', 'comprehensive'],
      default_level: 'standard',
    },
    capabilities: {
      license_verification: true,
      board_certification: true,
      dea_verification: true,
      malpractice_check: true,
      sanctions_check: true,
    },
    performance_profile: {
      avg_response_time_ms: 2000,
      accuracy_score: 0.98,
    },
  },
  enrollment_conversation: {
    name: 'Enrollment Conversation Engine',
    engine_type: 'llm' as const,
    provider: 'gemini',
    model_identifier: 'gemini-2.5-flash',
    configuration: {
      temperature: 0.7,
      max_tokens: 2000,
      system_context: 'enrollment_specialist',
    },
    capabilities: {
      intent_understanding: true,
      entity_extraction: true,
      context_management: true,
      form_guidance: true,
      validation_assistance: true,
    },
    performance_profile: {
      avg_response_time_ms: 800,
      cost_per_token: 0.00001,
    },
  },
  order_status: {
    name: 'Order Status Engine',
    engine_type: 'sml' as const,
    provider: 'openai',
    model_identifier: 'gpt-4o-mini',
    configuration: {
      temperature: 0.3,
      max_tokens: 500,
      response_format: 'concise',
    },
    capabilities: {
      order_lookup: true,
      status_tracking: true,
      eta_estimation: true,
      issue_detection: true,
    },
    performance_profile: {
      avg_response_time_ms: 300,
      cost_per_token: 0.000001,
    },
  },
  treatment_onboarding: {
    name: 'Treatment Center Onboarding Engine',
    engine_type: 'hybrid' as const,
    provider: 'gemini',
    model_identifier: 'gemini-2.5-pro',
    configuration: {
      temperature: 0.5,
      max_tokens: 3000,
      document_processing: true,
    },
    capabilities: {
      document_analysis: true,
      compliance_checking: true,
      credential_verification: true,
      form_completion: true,
    },
    performance_profile: {
      avg_response_time_ms: 1500,
      accuracy_score: 0.97,
    },
  },
  manufacturing_onboarding: {
    name: 'Manufacturing Onboarding Engine',
    engine_type: 'hybrid' as const,
    provider: 'claude',
    model_identifier: 'claude-3-5-haiku-20241022',
    configuration: {
      temperature: 0.4,
      max_tokens: 2500,
      technical_mode: true,
    },
    capabilities: {
      compliance_verification: true,
      quality_assessment: true,
      certification_validation: true,
      process_documentation: true,
    },
    performance_profile: {
      avg_response_time_ms: 1200,
      accuracy_score: 0.96,
    },
  },
};

class AgentConversationEngineService {
  private realtimeChannels: Map<string, RealtimeChannel> = new Map();
  private statusCache: Map<string, AgentWithEngines['real_time_status']> = new Map();

  /**
   * Create a conversation engine
   */
  async createEngine(engine: Omit<ConversationEngine, 'id' | 'created_at' | 'is_active'>): Promise<ConversationEngine | null> {
    try {
      const { data, error } = await supabase
        .from('conversation_engines')
        .insert({
          name: engine.name,
          engine_type: engine.engine_type,
          provider: engine.provider,
          model_identifier: engine.model_identifier,
          configuration: engine.configuration,
          capabilities: engine.capabilities,
          performance_profile: engine.performance_profile,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data as ConversationEngine;
    } catch (error) {
      console.error('Failed to create engine:', error);
      return null;
    }
  }

  /**
   * Create engine from template
   */
  async createEngineFromTemplate(templateKey: keyof typeof ENGINE_TEMPLATES): Promise<ConversationEngine | null> {
    const template = ENGINE_TEMPLATES[templateKey];
    return this.createEngine(template);
  }

  /**
   * Get all conversation engines
   */
  async getAllEngines(): Promise<ConversationEngine[]> {
    try {
      const { data, error } = await supabase
        .from('conversation_engines')
        .select('*')
        .order('name');

      if (error) throw error;
      return (data || []) as ConversationEngine[];
    } catch (error) {
      console.error('Failed to fetch engines:', error);
      return [];
    }
  }

  /**
   * Link agent to conversation engine
   */
  async linkAgentToEngine(params: {
    agentId: string;
    engineId: string;
    role: AgentEngineLink['role'];
    priority?: number;
    conditions?: AgentEngineLink['conditions'];
  }): Promise<AgentEngineLink | null> {
    try {
      const { data, error } = await supabase
        .from('agent_conversation_engines')
        .insert({
          agent_id: params.agentId,
          conversation_engine_id: params.engineId,
          role: params.role,
          priority: params.priority || 1,
          conditions: params.conditions || {},
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data as AgentEngineLink;
    } catch (error) {
      console.error('Failed to link agent to engine:', error);
      return null;
    }
  }

  /**
   * Get agent with all linked engines
   */
  async getAgentWithEngines(agentId: string): Promise<AgentWithEngines | null> {
    try {
      // Fetch agent
      const { data: agent, error: agentError } = await supabase
        .from('agents')
        .select('*')
        .eq('id', agentId)
        .single();

      if (agentError) throw agentError;

      // Fetch linked engines
      const { data: links, error: linksError } = await supabase
        .from('agent_conversation_engines')
        .select(`
          id, role, priority, is_active, conditions,
          conversation_engines (*)
        `)
        .eq('agent_id', agentId)
        .order('priority');

      if (linksError) throw linksError;

      // Get real-time status
      const realTimeStatus = await this.getAgentRealTimeStatus(agentId);

      const linkedEngines = (links || []).map(link => ({
        engine: (link as any).conversation_engines as ConversationEngine,
        role: link.role as AgentEngineLink['role'],
        priority: link.priority || 1,
        is_active: link.is_active || false,
      }));

      return {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        use_case: agent.use_case,
        agent_type: agent.agent_type,
        status: agent.status || 'draft',
        model_provider: agent.model_provider,
        model_name: agent.model_name,
        enabled_features: agent.enabled_features,
        linked_engines: linkedEngines,
        real_time_status: realTimeStatus,
      };
    } catch (error) {
      console.error('Failed to get agent with engines:', error);
      return null;
    }
  }

  /**
   * Get all agents with their engines
   */
  async getAllAgentsWithEngines(): Promise<AgentWithEngines[]> {
    try {
      const { data: agents, error } = await supabase
        .from('agents')
        .select('id')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const results: AgentWithEngines[] = [];
      for (const agent of agents || []) {
        const agentWithEngines = await this.getAgentWithEngines(agent.id);
        if (agentWithEngines) {
          results.push(agentWithEngines);
        }
      }

      return results;
    } catch (error) {
      console.error('Failed to get all agents with engines:', error);
      return [];
    }
  }

  /**
   * Get real-time agent status
   */
  async getAgentRealTimeStatus(agentId: string): Promise<AgentWithEngines['real_time_status']> {
    // Check cache first
    const cached = this.statusCache.get(agentId);
    if (cached) return cached;

    try {
      // Get active conversations count
      const { count, error } = await supabase
        .from('agent_conversations')
        .select('*', { count: 'exact', head: true })
        .eq('agent_id', agentId)
        .eq('status', 'active');

      // Get last activity
      const { data: lastConversation } = await supabase
        .from('agent_conversations')
        .select('updated_at')
        .eq('agent_id', agentId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      const status = {
        is_running: (count || 0) > 0,
        active_conversations: count || 0,
        last_activity: lastConversation?.updated_at || null,
      };

      this.statusCache.set(agentId, status);
      return status;
    } catch (error) {
      return {
        is_running: false,
        active_conversations: 0,
        last_activity: null,
      };
    }
  }

  /**
   * Subscribe to real-time agent status updates
   */
  subscribeToAgentStatus(agentId: string, callback: (status: AgentWithEngines['real_time_status']) => void): () => void {
    const channel = supabase
      .channel(`agent-status-${agentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_conversations',
          filter: `agent_id=eq.${agentId}`,
        },
        async () => {
          // Clear cache and refetch
          this.statusCache.delete(agentId);
          const status = await this.getAgentRealTimeStatus(agentId);
          callback(status);
        }
      )
      .subscribe();

    this.realtimeChannels.set(agentId, channel);

    return () => {
      supabase.removeChannel(channel);
      this.realtimeChannels.delete(agentId);
    };
  }

  /**
   * Initialize default engines for a use case
   */
  async initializeEnginesForUseCase(agentId: string, useCaseId: string): Promise<boolean> {
    try {
      const engineMappings: Record<string, (keyof typeof ENGINE_TEMPLATES)[]> = {
        patient_intake: ['enrollment_conversation', 'npi_verification'],
        enrollment: ['enrollment_conversation', 'npi_verification', 'credentialing'],
        order_status: ['order_status'],
        treatment_center_onboarding: ['treatment_onboarding', 'npi_verification', 'credentialing'],
        manufacturing_onboarding: ['manufacturing_onboarding', 'credentialing'],
      };

      const templateKeys = engineMappings[useCaseId] || ['enrollment_conversation'];

      for (let i = 0; i < templateKeys.length; i++) {
        const templateKey = templateKeys[i];
        
        // Check if engine already exists
        const existingEngines = await this.getAllEngines();
        let engine = existingEngines.find(e => e.name === ENGINE_TEMPLATES[templateKey].name);
        
        if (!engine) {
          engine = await this.createEngineFromTemplate(templateKey);
        }

        if (engine) {
          // Determine role based on position
          const role: AgentEngineLink['role'] = i === 0 ? 'primary' : 'specialized';
          
          await this.linkAgentToEngine({
            agentId,
            engineId: engine.id,
            role,
            priority: i + 1,
          });
        }
      }

      return true;
    } catch (error) {
      console.error('Failed to initialize engines for use case:', error);
      return false;
    }
  }

  /**
   * Create NPI Registry Agent with engines
   */
  async createNPIRegistryAgent(params: {
    name?: string;
    description?: string;
  }): Promise<{ agentId: string; engines: ConversationEngine[] } | null> {
    try {
      // Create the agent
      const { data: agent, error: agentError } = await supabase
        .from('agents')
        .insert({
          name: params.name || 'NPI Registry Agent',
          description: params.description || 'Agent for NPI verification and credentialing',
          use_case: 'npi_registry',
          agent_type: 'verification',
          status: 'active',
          enabled_features: ['npi_verification', 'credentialing_workflow', 'real_time_validation'],
          model_provider: 'gemini',
          model_name: 'gemini-2.5-flash',
        })
        .select()
        .single();

      if (agentError) throw agentError;

      // Create and link NPI verification engine
      const npiEngine = await this.createEngineFromTemplate('npi_verification');
      if (npiEngine) {
        await this.linkAgentToEngine({
          agentId: agent.id,
          engineId: npiEngine.id,
          role: 'primary',
          priority: 1,
        });
      }

      // Create and link credentialing engine
      const credEngine = await this.createEngineFromTemplate('credentialing');
      if (credEngine) {
        await this.linkAgentToEngine({
          agentId: agent.id,
          engineId: credEngine.id,
          role: 'specialized',
          priority: 2,
        });
      }

      return {
        agentId: agent.id,
        engines: [npiEngine, credEngine].filter(Boolean) as ConversationEngine[],
      };
    } catch (error) {
      console.error('Failed to create NPI Registry Agent:', error);
      return null;
    }
  }

  /**
   * Create Stepwise Enrollment Agent with engines
   */
  async createStepwiseEnrollmentAgent(params: {
    name?: string;
    description?: string;
    screenMode?: 'single' | 'split' | 'form-specific';
  }): Promise<{ agentId: string; engines: ConversationEngine[] } | null> {
    try {
      // Create the agent
      const { data: agent, error: agentError } = await supabase
        .from('agents')
        .insert({
          name: params.name || 'Stepwise Enrollment Agent',
          description: params.description || 'Conversational agent for stepwise patient enrollment',
          use_case: 'enrollment',
          agent_type: 'conversational',
          status: 'active',
          enabled_features: [
            'enrollment_conversation',
            'npi_verification',
            'insurance_verification',
            'consent_management',
            'smart_field_routing',
            `screen_mode_${params.screenMode || 'form-specific'}`,
          ],
          model_provider: 'gemini',
          model_name: 'gemini-2.5-flash',
        })
        .select()
        .single();

      if (agentError) throw agentError;

      // Initialize engines for enrollment use case
      await this.initializeEnginesForUseCase(agent.id, 'enrollment');

      // Get all linked engines
      const agentWithEngines = await this.getAgentWithEngines(agent.id);

      return {
        agentId: agent.id,
        engines: agentWithEngines?.linked_engines.map(le => le.engine) || [],
      };
    } catch (error) {
      console.error('Failed to create Stepwise Enrollment Agent:', error);
      return null;
    }
  }

  /**
   * Cleanup subscriptions
   */
  cleanup() {
    this.realtimeChannels.forEach(channel => {
      supabase.removeChannel(channel);
    });
    this.realtimeChannels.clear();
    this.statusCache.clear();
  }
}

export const agentConversationEngineService = new AgentConversationEngineService();
