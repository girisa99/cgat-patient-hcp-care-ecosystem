/**
 * MULTI-AGENT NODE REGISTRY
 * Registers A2A, Multi-Agent, and Agentic AI nodes with the workflow system
 * Integrates with node library, context menu, and AI Assist
 */

export interface MultiAgentNodeDefinition {
  id: string;
  type_key: string;
  display_name: string;
  description: string;
  category: string;
  subcategory?: string;
  icon_name: string;
  color: string;
  capabilities: string[];
  agent_architecture: 'single' | 'multi-agent' | 'a2a' | 'agentic' | 'swarm';
  configuration_schema: Record<string, any>;
}

// Multi-Agent Node Definitions
export const MULTI_AGENT_NODES: MultiAgentNodeDefinition[] = [
  // A2A Protocol Nodes
  {
    id: 'a2a_agent',
    type_key: 'a2a_agent',
    display_name: 'A2A Agent',
    description: 'Google A2A Protocol compliant agent with agent card and task lifecycle',
    category: 'Multi-Agent',
    subcategory: 'A2A Protocol',
    icon_name: 'network',
    color: '#6366F1',
    capabilities: ['agent_card', 'task_lifecycle', 'sse_streaming', 'message_parts'],
    agent_architecture: 'a2a',
    configuration_schema: {
      agent_card: { name: '', description: '', capabilities: [] },
      supported_tasks: ['text_generation', 'data_retrieval', 'action_execution'],
      streaming_enabled: true
    }
  },
  {
    id: 'task_handoff',
    type_key: 'task_handoff',
    display_name: 'Task Handoff',
    description: 'Transfer task context between A2A agents',
    category: 'Multi-Agent',
    subcategory: 'A2A Protocol',
    icon_name: 'arrow-right-left',
    color: '#8B5CF6',
    capabilities: ['context_transfer', 'state_preservation', 'priority_routing'],
    agent_architecture: 'a2a',
    configuration_schema: {
      handoff_type: 'full_context',
      preserve_history: true,
      timeout_ms: 30000
    }
  },
  {
    id: 'communication_hub',
    type_key: 'communication_hub',
    display_name: 'Communication Hub',
    description: 'Central message routing for agent-to-agent communication',
    category: 'Multi-Agent',
    subcategory: 'A2A Protocol',
    icon_name: 'radio',
    color: '#EC4899',
    capabilities: ['message_routing', 'broadcast', 'subscription'],
    agent_architecture: 'a2a',
    configuration_schema: {
      routing_strategy: 'round_robin',
      message_persistence: true
    }
  },

  // Multi-Agent Orchestration Nodes
  {
    id: 'agent_team',
    type_key: 'agent_team',
    display_name: 'Agent Team',
    description: 'Coordinated team of specialized agents working together',
    category: 'Multi-Agent',
    subcategory: 'Orchestration',
    icon_name: 'users',
    color: '#10B981',
    capabilities: ['team_coordination', 'role_assignment', 'shared_context'],
    agent_architecture: 'multi-agent',
    configuration_schema: {
      orchestration_pattern: 'hierarchical',
      team_size: 3,
      shared_memory: true
    }
  },
  {
    id: 'swarm_decision',
    type_key: 'swarm_decision',
    display_name: 'Swarm Decision',
    description: 'Collective decision making using swarm intelligence',
    category: 'Multi-Agent',
    subcategory: 'Orchestration',
    icon_name: 'brain',
    color: '#F59E0B',
    capabilities: ['voting', 'consensus', 'weighted_average', 'emergent_behavior'],
    agent_architecture: 'swarm',
    configuration_schema: {
      decision_method: 'weighted_voting',
      confidence_threshold: 0.7,
      min_participants: 3
    }
  },
  {
    id: 'tool_sharing',
    type_key: 'tool_sharing',
    display_name: 'Tool Sharing',
    description: 'Share tools and capabilities between agents',
    category: 'Multi-Agent',
    subcategory: 'Orchestration',
    icon_name: 'share-2',
    color: '#06B6D4',
    capabilities: ['tool_registry', 'capability_discovery', 'access_control'],
    agent_architecture: 'multi-agent',
    configuration_schema: {
      sharing_scope: 'team',
      permission_level: 'read_execute'
    }
  },

  // Agentic AI Nodes
  {
    id: 'react_loop',
    type_key: 'react_loop',
    display_name: 'ReAct Loop',
    description: 'Reasoning and acting loop for autonomous goal achievement',
    category: 'Multi-Agent',
    subcategory: 'Agentic AI',
    icon_name: 'refresh-cw',
    color: '#EF4444',
    capabilities: ['reasoning', 'action_selection', 'observation', 'reflection'],
    agent_architecture: 'agentic',
    configuration_schema: {
      max_iterations: 10,
      reflection_enabled: true,
      planning_depth: 3
    }
  },
  {
    id: 'tool_chain',
    type_key: 'tool_chain',
    display_name: 'Tool Chain',
    description: 'Sequential tool execution with output chaining',
    category: 'Multi-Agent',
    subcategory: 'Agentic AI',
    icon_name: 'link',
    color: '#14B8A6',
    capabilities: ['sequential_execution', 'output_piping', 'error_recovery'],
    agent_architecture: 'agentic',
    configuration_schema: {
      chain_type: 'sequential',
      error_handling: 'retry_with_backoff',
      max_retries: 3
    }
  },
  {
    id: 'self_reflection',
    type_key: 'self_reflection',
    display_name: 'Self Reflection',
    description: 'Agent self-evaluation and strategy adjustment',
    category: 'Multi-Agent',
    subcategory: 'Agentic AI',
    icon_name: 'eye',
    color: '#A855F7',
    capabilities: ['performance_analysis', 'strategy_adjustment', 'learning'],
    agent_architecture: 'agentic',
    configuration_schema: {
      reflection_frequency: 'after_each_action',
      learning_rate: 0.1
    }
  },
  {
    id: 'goal_decomposition',
    type_key: 'goal_decomposition',
    display_name: 'Goal Decomposition',
    description: 'Break complex goals into achievable sub-tasks',
    category: 'Multi-Agent',
    subcategory: 'Agentic AI',
    icon_name: 'git-branch',
    color: '#F97316',
    capabilities: ['task_breakdown', 'dependency_analysis', 'priority_assignment'],
    agent_architecture: 'agentic',
    configuration_schema: {
      decomposition_strategy: 'recursive',
      max_depth: 5
    }
  }
];

// Category definitions for node library
export const MULTI_AGENT_CATEGORIES = [
  {
    id: 'multi-agent',
    name: 'Multi-Agent',
    description: 'A2A, orchestration, and agentic AI nodes',
    icon_name: 'users',
    subcategories: ['A2A Protocol', 'Orchestration', 'Agentic AI']
  }
];

// Get nodes by architecture type
export const getNodesByArchitecture = (architecture: string): MultiAgentNodeDefinition[] => {
  return MULTI_AGENT_NODES.filter(node => node.agent_architecture === architecture);
};

// Get nodes by subcategory
export const getNodesBySubcategory = (subcategory: string): MultiAgentNodeDefinition[] => {
  return MULTI_AGENT_NODES.filter(node => node.subcategory === subcategory);
};

// Determine agent architecture from workflow nodes
export const determineAgentArchitecture = (nodes: any[]): 'single' | 'multi-agent' | 'a2a' | 'agentic' | 'swarm' => {
  const nodeTypes = nodes.map(n => n.data?.type_key || n.type);
  
  // Check for swarm nodes
  if (nodeTypes.some(t => t === 'swarm_decision')) {
    return 'swarm';
  }
  
  // Check for A2A nodes
  if (nodeTypes.some(t => ['a2a_agent', 'task_handoff', 'communication_hub'].includes(t))) {
    return 'a2a';
  }
  
  // Check for agentic nodes
  if (nodeTypes.some(t => ['react_loop', 'tool_chain', 'self_reflection', 'goal_decomposition'].includes(t))) {
    return 'agentic';
  }
  
  // Check for multi-agent nodes
  if (nodeTypes.some(t => ['agent_team', 'tool_sharing'].includes(t))) {
    return 'multi-agent';
  }
  
  return 'single';
};

// Get architecture display info
export const getArchitectureInfo = (architecture: string): { label: string; color: string; description: string } => {
  const info: Record<string, { label: string; color: string; description: string }> = {
    'single': {
      label: 'Single Agent',
      color: 'hsl(var(--muted-foreground))',
      description: 'Traditional single agent workflow'
    },
    'multi-agent': {
      label: 'Multi-Agent',
      color: '#10B981',
      description: 'Coordinated team of specialized agents'
    },
    'a2a': {
      label: 'A2A Protocol',
      color: '#6366F1',
      description: 'Google A2A compliant agent communication'
    },
    'agentic': {
      label: 'Agentic AI',
      color: '#EF4444',
      description: 'Autonomous reasoning and acting agent'
    },
    'swarm': {
      label: 'Swarm Intelligence',
      color: '#F59E0B',
      description: 'Collective decision-making swarm'
    }
  };
  
  return info[architecture] || info['single'];
};
