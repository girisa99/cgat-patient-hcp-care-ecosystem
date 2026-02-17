-- =====================================================
-- MULTI-AGENT NODE TYPES MIGRATION
-- Adds A2A Protocol, Multi-Agent Orchestration, and Agentic AI nodes
-- =====================================================

-- First, create the Multi-Agent category
INSERT INTO workflow_node_categories (name, display_name, description, icon, color, order_index, is_active)
VALUES (
  'multi-agent',
  'Multi-Agent',
  'A2A Protocol, Multi-Agent Orchestration, and Agentic AI nodes for advanced agent architectures',
  'Users',
  '#6366F1',
  32,
  true
)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color;

-- Insert all 10 Multi-Agent node types
DO $$
DECLARE
  multi_agent_category_id UUID;
BEGIN
  -- Get the category ID
  SELECT id INTO multi_agent_category_id FROM workflow_node_categories WHERE name = 'multi-agent';

  -- A2A Protocol Nodes
  INSERT INTO workflow_node_types (category_id, type_key, display_name, description, detailed_explanation, icon, color, is_draggable, is_configurable, default_config, capabilities, is_active)
  VALUES
    (multi_agent_category_id, 'a2a_agent', 'A2A Agent', 
     'Google A2A Protocol compliant agent with agent card and task lifecycle',
     'Implements Google A2A Protocol for standardized agent-to-agent communication. Supports agent card discovery, task lifecycle management (submitted→working→completed), SSE streaming, and multi-part messages.',
     'Network', '#6366F1', true, true,
     '{"agent_card": {"name": "", "description": "", "capabilities": []}, "supported_tasks": ["text_generation", "data_retrieval", "action_execution"], "streaming_enabled": true}'::jsonb,
     '["agent_card", "task_lifecycle", "sse_streaming", "message_parts"]'::jsonb, true
    ),
    (multi_agent_category_id, 'task_handoff', 'Task Handoff',
     'Transfer task context between A2A agents',
     'Enables seamless task handoff between agents with full context preservation. Supports priority routing, state preservation, and configurable timeout settings.',
     'ArrowRightLeft', '#8B5CF6', true, true,
     '{"handoff_type": "full_context", "preserve_history": true, "timeout_ms": 30000}'::jsonb,
     '["context_transfer", "state_preservation", "priority_routing"]'::jsonb, true
    ),
    (multi_agent_category_id, 'communication_hub', 'Communication Hub',
     'Central message routing for agent-to-agent communication',
     'Acts as a central hub for routing messages between multiple agents. Supports broadcast, subscription patterns, and message persistence.',
     'Radio', '#EC4899', true, true,
     '{"routing_strategy": "round_robin", "message_persistence": true}'::jsonb,
     '["message_routing", "broadcast", "subscription"]'::jsonb, true
    ),
    -- Multi-Agent Orchestration Nodes
    (multi_agent_category_id, 'agent_team', 'Agent Team',
     'Coordinated team of specialized agents working together',
     'Orchestrates a team of specialized agents with configurable patterns (hierarchical, peer-to-peer, swarm). Supports shared memory and role-based task assignment.',
     'Users', '#10B981', true, true,
     '{"orchestration_pattern": "hierarchical", "team_size": 3, "shared_memory": true}'::jsonb,
     '["team_coordination", "role_assignment", "shared_context"]'::jsonb, true
    ),
    (multi_agent_category_id, 'swarm_decision', 'Swarm Decision',
     'Collective decision making using swarm intelligence',
     'Implements swarm intelligence for collective decision-making. Supports weighted voting, consensus building, and emergent behavior patterns with configurable thresholds.',
     'Brain', '#F59E0B', true, true,
     '{"decision_method": "weighted_voting", "confidence_threshold": 0.7, "min_participants": 3}'::jsonb,
     '["voting", "consensus", "weighted_average", "emergent_behavior"]'::jsonb, true
    ),
    (multi_agent_category_id, 'tool_sharing', 'Tool Sharing',
     'Share tools and capabilities between agents',
     'Enables dynamic sharing of tools and capabilities across agents. Supports tool registry, capability discovery, and permission-based access control.',
     'Share2', '#06B6D4', true, true,
     '{"sharing_scope": "team", "permission_level": "read_execute"}'::jsonb,
     '["tool_registry", "capability_discovery", "access_control"]'::jsonb, true
    ),
    -- Agentic AI Nodes
    (multi_agent_category_id, 'react_loop', 'ReAct Loop',
     'Reasoning and acting loop for autonomous goal achievement',
     'Implements the ReAct (Reasoning + Acting) pattern for autonomous agents. Cycles through Think→Act→Observe→Reflect until goal is achieved or max iterations reached.',
     'RefreshCw', '#EF4444', true, true,
     '{"max_iterations": 10, "reflection_enabled": true, "planning_depth": 3}'::jsonb,
     '["reasoning", "action_selection", "observation", "reflection"]'::jsonb, true
    ),
    (multi_agent_category_id, 'tool_chain', 'Tool Chain',
     'Sequential tool execution with output chaining',
     'Chains multiple tools together with automatic output piping. Supports error recovery with retry logic and backoff strategies.',
     'Link', '#14B8A6', true, true,
     '{"chain_type": "sequential", "error_handling": "retry_with_backoff", "max_retries": 3}'::jsonb,
     '["sequential_execution", "output_piping", "error_recovery"]'::jsonb, true
    ),
    (multi_agent_category_id, 'self_reflection', 'Self Reflection',
     'Agent self-evaluation and strategy adjustment',
     'Enables agents to evaluate their own performance and adjust strategies. Supports continuous learning and adaptive behavior improvement.',
     'Eye', '#A855F7', true, true,
     '{"reflection_frequency": "after_each_action", "learning_rate": 0.1}'::jsonb,
     '["performance_analysis", "strategy_adjustment", "learning"]'::jsonb, true
    ),
    (multi_agent_category_id, 'goal_decomposition', 'Goal Decomposition',
     'Break complex goals into achievable sub-tasks',
     'Decomposes complex goals into manageable sub-tasks with dependency analysis. Supports recursive decomposition and priority assignment.',
     'GitBranch', '#F97316', true, true,
     '{"decomposition_strategy": "recursive", "max_depth": 5}'::jsonb,
     '["task_breakdown", "dependency_analysis", "priority_assignment"]'::jsonb, true
    )
  ON CONFLICT (type_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    detailed_explanation = EXCLUDED.detailed_explanation,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    default_config = EXCLUDED.default_config,
    capabilities = EXCLUDED.capabilities,
    is_active = EXCLUDED.is_active;
END $$;