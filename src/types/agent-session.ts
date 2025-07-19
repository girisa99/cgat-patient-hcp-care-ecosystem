export interface AgentSession {
  id: string;
  name: string;
  description?: string;
  template_id?: string;
  template_type?: 'ai_generated' | 'custom' | 'system';
  current_step: 'basic_info' | 'canvas' | 'actions' | 'connectors' | 'knowledge' | 'rag' | 'deploy';
  status: 'draft' | 'in_progress' | 'ready_to_deploy' | 'deployed';
  created_at: string;
  updated_at: string;
  user_id: string;
  
  // Session data for each step
  basic_info?: {
    name?: string;
    description?: string;
    purpose?: string;
    use_case?: string;
    brand?: string;
    agent_type?: string;
    categories?: string[];
    topics?: string[];
    business_units?: string[];
  };
  
  canvas?: {
    workflow_steps?: any[];
    connections?: any[];
    layout?: any;
  };
  
  actions?: {
    assigned_actions?: any[];
    custom_actions?: any[];
    configurations?: any;
  };
  
  connectors?: {
    assigned_connectors?: any[];
    configurations?: any;
    api_integrations?: any[];
  };
  
  knowledge?: {
    knowledge_bases?: any[];
    documents?: any[];
    urls?: string[];
    auto_generated_content?: any[];
  };
  
  rag?: {
    recommendations?: any[];
    configurations?: any;
    embeddings_config?: any;
  };
  
  deployment?: {
    config?: any;
    environment?: string;
    scaling_config?: any;
  };
}

export interface AgentSessionUpdate {
  current_step?: AgentSession['current_step'];
  status?: AgentSession['status'];
  basic_info?: AgentSession['basic_info'];
  canvas?: AgentSession['canvas'];
  actions?: AgentSession['actions'];
  connectors?: AgentSession['connectors'];
  knowledge?: AgentSession['knowledge'];
  rag?: AgentSession['rag'];
  deployment?: AgentSession['deployment'];
}