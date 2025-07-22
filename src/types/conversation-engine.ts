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
    max_sequence_length?: number;
    [key: string]: any;
  };
  capabilities: {
    intent_understanding?: boolean;
    entity_extraction?: boolean;
    context_management?: boolean;
    function_calling?: boolean;
    reasoning?: boolean;
    fast_inference?: boolean;
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
  updated_at: string;
  created_by?: string;
  [key: string]: any;
}

export interface AgentConversationEngine {
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

export interface MultiModelConversation {
  id: string;
  session_id: string;
  user_id: string;
  conversation_mode: 'single' | 'multi-model' | 'comparative';
  active_models: ModelConfiguration[];
  conversation_history: ConversationMessage[];
  model_responses: Record<string, any>;
  user_preferences: {
    preferred_models?: string[];
    response_format?: 'single' | 'split' | 'comparison';
    show_confidence_scores?: boolean;
    [key: string]: any;
  };
  context_data: {
    intent?: string;
    entities?: Record<string, any>;
    conversation_context?: string;
    [key: string]: any;
  };
  status: 'active' | 'paused' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface ModelConfiguration {
  engine_id: string;
  engine_name: string;
  role: 'primary' | 'secondary' | 'comparative' | 'fallback' | 'specialized';
  weight?: number;
  custom_config?: Record<string, any>;
  [key: string]: any;
}

export interface ConversationMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  model_source?: string;
  confidence_score?: number;
  intent_classification?: {
    intent: string;
    confidence: number;
    entities: Record<string, any>;
  };
  metadata?: Record<string, any>;
  [key: string]: any;
}

export interface ConversationMessageRouting {
  id: string;
  conversation_id: string;
  message_id: string;
  intent_classification: {
    intent: string;
    confidence: number;
    entities: Record<string, any>;
  };
  entity_extraction: Record<string, any>;
  routing_decision: {
    selected_engines: string[];
    routing_reason: string;
    confidence_threshold: number;
  };
  selected_models: string[];
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}