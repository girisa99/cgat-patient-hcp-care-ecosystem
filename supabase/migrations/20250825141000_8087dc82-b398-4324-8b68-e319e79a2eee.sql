-- ============================================================================
-- WORKFLOW NODE TYPES: COMPREHENSIVE SEED DATA (CORRECTED)
-- Adding all missing node types with proper JSONB formatting
-- ============================================================================

-- ============================================================================
-- AGENTS CATEGORY (currently empty - 0 nodes)
-- ============================================================================
INSERT INTO workflow_node_types (
  category_id, type_key, display_name, description, detailed_explanation,
  icon, color, capabilities, requirements, order_index
) VALUES 
(
  (SELECT id FROM workflow_node_categories WHERE name = 'agents'),
  'react_agent_llm', 'ReAct Agent for LLM', 
  'Agent that uses the ReACT logic to decide what action to take, optimized for LLMs',
  'ReAct (Reasoning and Acting) agents combine reasoning traces and task-specific actions in an interleaved manner. This agent uses ReACT logic to decide what action to take next, specifically optimized for Large Language Models. It can reason about problems, plan actions, and execute them iteratively.',
  'brain', '#3b82f6', 
  to_jsonb(ARRAY['reasoning', 'action_planning', 'iterative_execution', 'llm_optimization']),
  '{"llm_model": "required", "tools": "optional", "memory": "recommended"}'::jsonb,
  1
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'agents'),
  'tool_agent', 'Tool Agent', 
  'Agent that uses function calling to pick the tools and arguments to call',
  'Tool agents specialize in function calling and tool selection. They analyze the current context and automatically select the most appropriate tools and arguments to achieve the desired outcome. These agents excel at orchestrating multiple tools and managing complex tool interactions.',
  'wrench', '#3b82f6', 
  to_jsonb(ARRAY['function_calling', 'tool_selection', 'argument_parsing', 'tool_orchestration']),
  '{"tools_registry": "required", "function_schemas": "required"}'::jsonb,
  2
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'agents'),
  'xml_agent', 'XML Agent', 
  'Agent designed for LLMs that are good for reasoning/writing XML',
  'XML agents are specifically designed for Large Language Models that excel at structured data processing and XML generation. They can parse, generate, and manipulate XML documents while maintaining proper schema validation and structural integrity.',
  'code', '#3b82f6', 
  to_jsonb(ARRAY['xml_processing', 'schema_validation', 'structured_output', 'document_generation']),
  '{"xml_schema": "optional", "validation_rules": "recommended"}'::jsonb,
  3
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'agents'),
  'airtable_agent', 'Airtable Agent', 
  'Specialized agent for Airtable database operations and automation',
  'Airtable agents provide seamless integration with Airtable databases, offering capabilities for data manipulation, workflow automation, and synchronized operations. They can create, read, update, and delete records while maintaining data consistency and relationship integrity.',
  'database', '#3b82f6', 
  to_jsonb(ARRAY['database_operations', 'workflow_automation', 'data_synchronization', 'relationship_management']),
  '{"airtable_api_key": "required", "base_id": "required", "table_name": "required"}'::jsonb,
  4
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'agents'),
  'openai_agent', 'OpenAI Agent', 
  'OpenAI-powered intelligent agent with GPT capabilities',
  'OpenAI agents leverage the power of GPT models to provide advanced natural language processing, conversation, and task completion capabilities. They can understand context, generate human-like responses, and perform complex reasoning tasks.',
  'zap', '#3b82f6', 
  to_jsonb(ARRAY['natural_language_processing', 'conversation', 'text_generation', 'reasoning']),
  '{"openai_api_key": "required", "model": "gpt-4", "temperature": "0.7"}'::jsonb,
  5
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'agents'),
  'gemini_agent', 'Gemini Agent', 
  'Google Gemini-powered multimodal AI agent',
  'Gemini agents utilize Google''s advanced multimodal AI capabilities, handling both text and image inputs. They excel at complex reasoning, code generation, and multimodal understanding tasks with high accuracy and performance.',
  'sparkles', '#3b82f6', 
  to_jsonb(ARRAY['multimodal_processing', 'code_generation', 'image_understanding', 'advanced_reasoning']),
  '{"gemini_api_key": "required", "model": "gemini-pro", "safety_settings": "recommended"}'::jsonb,
  6
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'agents'),
  'perplexity_agent', 'Perplexity Agent', 
  'Perplexity AI-powered research and search agent',
  'Perplexity agents specialize in research, fact-checking, and information retrieval. They can search the web, synthesize information from multiple sources, and provide accurate, cited responses with real-time data access.',
  'search', '#3b82f6', 
  to_jsonb(ARRAY['web_search', 'fact_checking', 'information_synthesis', 'citation_generation']),
  '{"perplexity_api_key": "required", "search_depth": "comprehensive"}'::jsonb,
  7
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'agents'),
  'anthropic_agent', 'Anthropic Agent', 
  'Claude-powered AI agent with advanced reasoning capabilities',
  'Anthropic agents powered by Claude models offer superior reasoning, analysis, and safety-focused AI interactions. They excel at complex analytical tasks, ethical reasoning, and providing well-structured, thoughtful responses.',
  'shield', '#3b82f6', 
  to_jsonb(ARRAY['advanced_reasoning', 'ethical_analysis', 'safety_focused', 'analytical_thinking']),
  '{"anthropic_api_key": "required", "model": "claude-3", "max_tokens": "4096"}'::jsonb,
  8
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'agents'),
  'deepseek_agent', 'DeepSeek Agent', 
  'DeepSeek AI-powered coding and technical agent',
  'DeepSeek agents specialize in code generation, technical problem-solving, and software development tasks. They excel at understanding complex technical requirements and generating high-quality, optimized code solutions.',
  'terminal', '#3b82f6', 
  to_jsonb(ARRAY['code_generation', 'technical_problem_solving', 'software_development', 'optimization']),
  '{"deepseek_api_key": "required", "language": "multiple", "optimization_level": "high"}'::jsonb,
  9
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'agents'),
  'conversational_agent', 'Conversational Agent', 
  'General-purpose conversational AI agent for dialog management',
  'Conversational agents manage multi-turn dialogues, maintain context across conversations, and provide natural, engaging interactions. They excel at understanding user intent, managing conversation flow, and delivering contextually appropriate responses.',
  'message-circle', '#3b82f6', 
  to_jsonb(ARRAY['dialog_management', 'context_maintenance', 'intent_recognition', 'conversation_flow']),
  '{"memory_system": "required", "context_window": "8192", "persona": "optional"}'::jsonb,
  10
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'agents'),
  'huggingface_agent', 'Hugging Face Agent', 
  'Hugging Face model-powered flexible AI agent',
  'Hugging Face agents provide access to thousands of open-source models and datasets. They offer flexibility in model selection, fine-tuning capabilities, and specialized task performance with community-driven AI models.',
  'heart', '#3b82f6', 
  to_jsonb(ARRAY['model_flexibility', 'open_source_access', 'fine_tuning', 'community_models']),
  '{"hf_token": "recommended", "model_name": "required", "task_type": "required"}'::jsonb,
  11
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'agents'),
  'csv_agent', 'CSV Agent', 
  'Specialized agent for CSV data processing and analysis',
  'CSV agents excel at processing, analyzing, and manipulating CSV files. They can perform data cleaning, statistical analysis, transformations, and generate insights from tabular data with built-in error handling and validation.',
  'table', '#3b82f6', 
  to_jsonb(ARRAY['data_processing', 'statistical_analysis', 'data_cleaning', 'csv_manipulation']),
  '{"pandas_support": "required", "validation_rules": "optional", "output_format": "flexible"}'::jsonb,
  12
);