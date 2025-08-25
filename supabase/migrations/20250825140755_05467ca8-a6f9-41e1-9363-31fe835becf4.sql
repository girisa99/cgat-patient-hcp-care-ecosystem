-- ============================================================================
-- WORKFLOW NODE TYPES: COMPREHENSIVE SEED DATA
-- Adding all missing node types from the user's detailed requirements
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
  ARRAY['reasoning', 'action_planning', 'iterative_execution', 'llm_optimization'],
  '{"llm_model": "required", "tools": "optional", "memory": "recommended"}'::jsonb,
  1
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'agents'),
  'tool_agent', 'Tool Agent', 
  'Agent that uses function calling to pick the tools and arguments to call',
  'Tool agents specialize in function calling and tool selection. They analyze the current context and automatically select the most appropriate tools and arguments to achieve the desired outcome. These agents excel at orchestrating multiple tools and managing complex tool interactions.',
  'wrench', '#3b82f6', 
  ARRAY['function_calling', 'tool_selection', 'argument_parsing', 'tool_orchestration'],
  '{"tools_registry": "required", "function_schemas": "required"}'::jsonb,
  2
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'agents'),
  'xml_agent', 'XML Agent', 
  'Agent designed for LLMs that are good for reasoning/writing XML',
  'XML agents are specifically designed for Large Language Models that excel at structured data processing and XML generation. They can parse, generate, and manipulate XML documents while maintaining proper schema validation and structural integrity.',
  'code', '#3b82f6', 
  ARRAY['xml_processing', 'schema_validation', 'structured_output', 'document_generation'],
  '{"xml_schema": "optional", "validation_rules": "recommended"}'::jsonb,
  3
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'agents'),
  'airtable_agent', 'Airtable Agent', 
  'Specialized agent for Airtable database operations and automation',
  'Airtable agents provide seamless integration with Airtable databases, offering capabilities for data manipulation, workflow automation, and synchronized operations. They can create, read, update, and delete records while maintaining data consistency and relationship integrity.',
  'database', '#3b82f6', 
  ARRAY['database_operations', 'workflow_automation', 'data_synchronization', 'relationship_management'],
  '{"airtable_api_key": "required", "base_id": "required", "table_name": "required"}'::jsonb,
  4
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'agents'),
  'openai_agent', 'OpenAI Agent', 
  'OpenAI-powered intelligent agent with GPT capabilities',
  'OpenAI agents leverage the power of GPT models to provide advanced natural language processing, conversation, and task completion capabilities. They can understand context, generate human-like responses, and perform complex reasoning tasks.',
  'zap', '#3b82f6', 
  ARRAY['natural_language_processing', 'conversation', 'text_generation', 'reasoning'],
  '{"openai_api_key": "required", "model": "gpt-4", "temperature": "0.7"}'::jsonb,
  5
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'agents'),
  'gemini_agent', 'Gemini Agent', 
  'Google Gemini-powered multimodal AI agent',
  'Gemini agents utilize Google''s advanced multimodal AI capabilities, handling both text and image inputs. They excel at complex reasoning, code generation, and multimodal understanding tasks with high accuracy and performance.',
  'sparkles', '#3b82f6', 
  ARRAY['multimodal_processing', 'code_generation', 'image_understanding', 'advanced_reasoning'],
  '{"gemini_api_key": "required", "model": "gemini-pro", "safety_settings": "recommended"}'::jsonb,
  6
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'agents'),
  'perplexity_agent', 'Perplexity Agent', 
  'Perplexity AI-powered research and search agent',
  'Perplexity agents specialize in research, fact-checking, and information retrieval. They can search the web, synthesize information from multiple sources, and provide accurate, cited responses with real-time data access.',
  'search', '#3b82f6', 
  ARRAY['web_search', 'fact_checking', 'information_synthesis', 'citation_generation'],
  '{"perplexity_api_key": "required", "search_depth": "comprehensive"}'::jsonb,
  7
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'agents'),
  'anthropic_agent', 'Anthropic Agent', 
  'Claude-powered AI agent with advanced reasoning capabilities',
  'Anthropic agents powered by Claude models offer superior reasoning, analysis, and safety-focused AI interactions. They excel at complex analytical tasks, ethical reasoning, and providing well-structured, thoughtful responses.',
  'shield', '#3b82f6', 
  ARRAY['advanced_reasoning', 'ethical_analysis', 'safety_focused', 'analytical_thinking'],
  '{"anthropic_api_key": "required", "model": "claude-3", "max_tokens": "4096"}'::jsonb,
  8
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'agents'),
  'deepseek_agent', 'DeepSeek Agent', 
  'DeepSeek AI-powered coding and technical agent',
  'DeepSeek agents specialize in code generation, technical problem-solving, and software development tasks. They excel at understanding complex technical requirements and generating high-quality, optimized code solutions.',
  'terminal', '#3b82f6', 
  ARRAY['code_generation', 'technical_problem_solving', 'software_development', 'optimization'],
  '{"deepseek_api_key": "required", "language": "multiple", "optimization_level": "high"}'::jsonb,
  9
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'agents'),
  'conversational_agent', 'Conversational Agent', 
  'General-purpose conversational AI agent for dialog management',
  'Conversational agents manage multi-turn dialogues, maintain context across conversations, and provide natural, engaging interactions. They excel at understanding user intent, managing conversation flow, and delivering contextually appropriate responses.',
  'message-circle', '#3b82f6', 
  ARRAY['dialog_management', 'context_maintenance', 'intent_recognition', 'conversation_flow'],
  '{"memory_system": "required", "context_window": "8192", "persona": "optional"}'::jsonb,
  10
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'agents'),
  'huggingface_agent', 'Hugging Face Agent', 
  'Hugging Face model-powered flexible AI agent',
  'Hugging Face agents provide access to thousands of open-source models and datasets. They offer flexibility in model selection, fine-tuning capabilities, and specialized task performance with community-driven AI models.',
  'heart', '#3b82f6', 
  ARRAY['model_flexibility', 'open_source_access', 'fine_tuning', 'community_models'],
  '{"hf_token": "recommended", "model_name": "required", "task_type": "required"}'::jsonb,
  11
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'agents'),
  'csv_agent', 'CSV Agent', 
  'Specialized agent for CSV data processing and analysis',
  'CSV agents excel at processing, analyzing, and manipulating CSV files. They can perform data cleaning, statistical analysis, transformations, and generate insights from tabular data with built-in error handling and validation.',
  'table', '#3b82f6', 
  ARRAY['data_processing', 'statistical_analysis', 'data_cleaning', 'csv_manipulation'],
  '{"pandas_support": "required", "validation_rules": "optional", "output_format": "flexible"}'::jsonb,
  12
);

-- ============================================================================  
-- CACHE CATEGORY (currently empty - 0 nodes)
-- ============================================================================
INSERT INTO workflow_node_types (
  category_id, type_key, display_name, description, detailed_explanation,
  icon, color, capabilities, requirements, order_index
) VALUES 
(
  (SELECT id FROM workflow_node_categories WHERE name = 'cache'),
  'google_genai_cache', 'Google GenAI Context Cache', 
  'Google GenAI context caching for improved performance',
  'Google GenAI Context Cache optimizes repeated interactions by storing conversation context and model responses. This reduces latency, improves response consistency, and decreases API costs by reusing previously computed results.',
  'database', '#10b981', 
  ARRAY['context_caching', 'performance_optimization', 'cost_reduction', 'consistency'],
  '{"google_api_key": "required", "cache_ttl": "3600", "max_cache_size": "1000"}'::jsonb,
  1
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'cache'),
  'inmemory_cache', 'In-Memory Cache', 
  'Fast in-memory caching system for temporary data storage',
  'In-Memory Cache provides ultra-fast data access by storing frequently used data in system memory. Ideal for session data, temporary computations, and high-frequency access patterns with automatic cleanup and memory management.',
  'zap', '#10b981', 
  ARRAY['ultra_fast_access', 'memory_management', 'automatic_cleanup', 'session_storage'],
  '{"max_memory": "512MB", "cleanup_interval": "300", "eviction_policy": "LRU"}'::jsonb,
  2
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'cache'),
  'inmemory_embedding_cache', 'In-Memory Embedding Cache', 
  'High-performance embedding vector caching in memory',
  'In-Memory Embedding Cache stores vector embeddings in system memory for instant similarity searches and retrieval. Optimized for machine learning workflows requiring fast vector operations and embedding lookups.',
  'brain', '#10b981', 
  ARRAY['vector_storage', 'similarity_search', 'fast_retrieval', 'ml_optimization'],
  '{"embedding_dimension": "required", "similarity_metric": "cosine", "max_vectors": "10000"}'::jsonb,
  3
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'cache'),
  'momento_cache', 'Momento Cache', 
  'Serverless cache service for distributed applications',
  'Momento Cache provides serverless, fully-managed caching with automatic scaling, high availability, and global distribution. Perfect for distributed applications requiring consistent performance without infrastructure management.',
  'cloud', '#10b981', 
  ARRAY['serverless_scaling', 'global_distribution', 'high_availability', 'managed_service'],
  '{"momento_token": "required", "cache_name": "required", "region": "us-east-1"}'::jsonb,
  4
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'cache'),
  'redis_cache', 'Redis Cache', 
  'Redis-powered distributed caching and data structures',
  'Redis Cache offers advanced data structures, pub/sub messaging, and distributed caching capabilities. Supports complex data types, atomic operations, and high-performance scenarios with persistence options.',
  'database', '#10b981', 
  ARRAY['distributed_caching', 'data_structures', 'pub_sub', 'atomic_operations'],
  '{"redis_url": "required", "password": "optional", "ssl": "recommended", "database": "0"}'::jsonb,
  5
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'cache'),
  'redis_embedding_cache', 'Redis Embedding Cache', 
  'Redis-based vector embedding storage with search capabilities',
  'Redis Embedding Cache combines Redis performance with vector search capabilities. Provides persistent embedding storage, similarity search, and clustering operations with Redis reliability and scaling.',
  'search', '#10b981', 
  ARRAY['vector_persistence', 'similarity_search', 'clustering', 'redis_reliability'],
  '{"redis_url": "required", "vector_index": "required", "search_algorithm": "HNSW"}'::jsonb,
  6
);

-- ============================================================================
-- GENAI & LLM CATEGORY (currently empty - 0 nodes)  
-- ============================================================================
INSERT INTO workflow_node_types (
  category_id, type_key, display_name, description, detailed_explanation,
  icon, color, capabilities, requirements, order_index
) VALUES 
(
  (SELECT id FROM workflow_node_categories WHERE name = 'genai_llm'),
  'aws_chatbedrock', 'AWS ChatBedRock', 
  'Amazon Bedrock chat model integration',
  'AWS ChatBedRock provides access to foundation models through Amazon Bedrock service. Offers enterprise-grade security, compliance, and scaling with multiple model providers including Anthropic, AI21, and Cohere.',
  'cloud', '#8b5cf6', 
  ARRAY['enterprise_security', 'multi_provider', 'aws_integration', 'compliance'],
  '{"aws_access_key": "required", "aws_secret_key": "required", "region": "us-east-1", "model_id": "required"}'::jsonb,
  1
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'genai_llm'),
  'azure_chatopenai', 'Azure ChatOpenAI', 
  'Azure OpenAI Service integration for enterprise',
  'Azure ChatOpenAI provides OpenAI models through Microsoft Azure cloud with enterprise security, compliance, and data residency. Includes GPT-4, GPT-3.5, and other OpenAI models with Azure reliability.',
  'cloud', '#8b5cf6', 
  ARRAY['enterprise_openai', 'azure_integration', 'data_residency', 'compliance'],
  '{"azure_openai_key": "required", "azure_endpoint": "required", "deployment_name": "required", "api_version": "2023-12-01-preview"}'::jsonb,
  2
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'genai_llm'),
  'chat_alibaba_tongyi', 'ChatAlibaba Tongyi', 
  'Alibaba Tongyi large language model integration',
  'ChatAlibaba Tongyi offers Alibaba''s advanced language model with strong Chinese language capabilities and multilingual support. Optimized for Asian markets with cultural context understanding.',
  'globe', '#8b5cf6', 
  ARRAY['chinese_language', 'multilingual_support', 'cultural_context', 'asian_optimization'],
  '{"tongyi_api_key": "required", "model": "qwen-turbo", "region": "cn-beijing"}'::jsonb,
  3
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'genai_llm'),
  'chat_anthropic', 'ChatAnthropic', 
  'Anthropic Claude chat model integration',
  'ChatAnthropic provides access to Claude models with advanced reasoning, safety features, and large context windows. Excels at analysis, creative writing, and ethical AI interactions.',
  'shield', '#8b5cf6', 
  ARRAY['advanced_reasoning', 'safety_features', 'large_context', 'ethical_ai'],
  '{"anthropic_api_key": "required", "model": "claude-3-opus", "max_tokens": "4096"}'::jsonb,
  4
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'genai_llm'),
  'chat_baidu_wenxin', 'ChatBaidu WenXin', 
  'Baidu WenXin (ERNIE) language model integration',
  'ChatBaidu WenXin integrates Baidu''s ERNIE models with strong Chinese language understanding and cultural knowledge. Optimized for Chinese market applications and regional compliance.',
  'brain', '#8b5cf6', 
  ARRAY['chinese_expertise', 'cultural_knowledge', 'ernie_models', 'regional_compliance'],
  '{"baidu_api_key": "required", "secret_key": "required", "model": "ernie-bot", "endpoint": "wenxin"}'::jsonb,
  5
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'genai_llm'),
  'chat_cerebras', 'ChatCerebras', 
  'Cerebras AI ultra-fast inference models',
  'ChatCerebras leverages Cerebras'' wafer-scale AI processors for ultra-fast model inference. Provides extremely low latency responses with high throughput for real-time applications.',
  'zap', '#8b5cf6', 
  ARRAY['ultra_fast_inference', 'low_latency', 'high_throughput', 'real_time'],
  '{"cerebras_api_key": "required", "model": "llama2-7b", "stream": "true"}'::jsonb,
  6
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'genai_llm'),
  'chat_cohere', 'ChatCohere', 
  'Cohere language model for enterprise applications',
  'ChatCohere provides enterprise-focused language models with strong multilingual capabilities, fine-tuning options, and business-oriented features for commercial applications.',
  'building', '#8b5cf6', 
  ARRAY['enterprise_focus', 'multilingual', 'fine_tuning', 'commercial_applications'],
  '{"cohere_api_key": "required", "model": "command", "max_tokens": "4000"}'::jsonb,
  7
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'genai_llm'),
  'chat_fireworks', 'ChatFireworks', 
  'Fireworks AI fast model inference service',
  'ChatFireworks provides high-speed model inference with cost-effective pricing and multiple open-source model options. Optimized for production workloads requiring fast, reliable responses.',
  'flame', '#8b5cf6', 
  ARRAY['high_speed_inference', 'cost_effective', 'open_source_models', 'production_ready'],
  '{"fireworks_api_key": "required", "model": "llama-v2-7b-chat", "max_tokens": "2048"}'::jsonb,
  8
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'genai_llm'),
  'chat_google_generativeai', 'ChatGoogle GenerativeAI', 
  'Google Generative AI (Gemini) integration',
  'ChatGoogle GenerativeAI provides access to Google''s Gemini models with multimodal capabilities, advanced reasoning, and integration with Google Cloud services.',
  'sparkles', '#8b5cf6', 
  ARRAY['multimodal_capabilities', 'advanced_reasoning', 'google_integration', 'gemini_models'],
  '{"google_api_key": "required", "model": "gemini-pro", "temperature": "0.7"}'::jsonb,
  9
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'genai_llm'),
  'chat_google_vertexai', 'ChatGoogle VertexAI', 
  'Google Cloud Vertex AI model integration',
  'ChatGoogle VertexAI integrates with Google Cloud''s Vertex AI platform for enterprise ML workflows. Provides model management, monitoring, and enterprise-grade AI deployment.',
  'cloud', '#8b5cf6', 
  ARRAY['enterprise_ml', 'model_management', 'monitoring', 'google_cloud'],
  '{"project_id": "required", "location": "us-central1", "credentials": "required", "model": "text-bison"}'::jsonb,
  10
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'genai_llm'),
  'chat_huggingface', 'ChatHuggingFace', 
  'Hugging Face transformers model integration',
  'ChatHuggingFace provides access to thousands of open-source models from the Hugging Face ecosystem. Supports custom models, fine-tuning, and community-driven AI development.',
  'heart', '#8b5cf6', 
  ARRAY['open_source_models', 'custom_models', 'fine_tuning', 'community_driven'],
  '{"hf_token": "recommended", "model_name": "required", "task": "text-generation"}'::jsonb,
  11
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'genai_llm'),
  'chat_openai', 'ChatOpenAI', 
  'OpenAI GPT model integration',
  'ChatOpenAI provides access to OpenAI''s GPT models including GPT-4, GPT-3.5, and other foundation models. Industry-leading language understanding and generation capabilities.',
  'bot', '#8b5cf6', 
  ARRAY['gpt_models', 'industry_leading', 'language_understanding', 'text_generation'],
  '{"openai_api_key": "required", "model": "gpt-4", "temperature": "0.7", "max_tokens": "4096"}'::jsonb,
  12
);

-- Continue with more LLM models...
INSERT INTO workflow_node_types (
  category_id, type_key, display_name, description, detailed_explanation,
  icon, color, capabilities, requirements, order_index
) VALUES 
(
  (SELECT id FROM workflow_node_categories WHERE name = 'genai_llm'),
  'chat_openai_custom', 'ChatOpenAI Custom', 
  'Custom OpenAI model configuration and deployment',
  'ChatOpenAI Custom allows for customized OpenAI model configurations, fine-tuned models, and specialized deployments. Provides flexibility for specific use cases and custom training data.',
  'settings', '#8b5cf6', 
  ARRAY['custom_configuration', 'fine_tuned_models', 'specialized_deployment', 'flexible_setup'],
  '{"openai_api_key": "required", "custom_model": "required", "base_url": "optional", "organization": "optional"}'::jsonb,
  13
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'genai_llm'),
  'chat_openrouter', 'ChatOpenRouter', 
  'OpenRouter unified model access platform',
  'ChatOpenRouter provides unified access to multiple AI models through a single API. Cost-effective routing to the best model for each task with transparent pricing and performance metrics.',
  'route', '#8b5cf6', 
  ARRAY['unified_access', 'cost_optimization', 'model_routing', 'transparent_pricing'],
  '{"openrouter_api_key": "required", "model": "auto", "site_url": "optional", "app_name": "optional"}'::jsonb,
  14
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'genai_llm'),
  'chat_perplexity', 'ChatPerplexity', 
  'Perplexity AI research-focused language model',
  'ChatPerplexity combines language generation with real-time web search and citation. Excels at research tasks, fact-checking, and providing up-to-date information with source attribution.',
  'search', '#8b5cf6', 
  ARRAY['web_search_integration', 'real_time_data', 'citation_support', 'research_focused'],
  '{"perplexity_api_key": "required", "model": "llama-3.1-sonar-large-128k-online", "search_recency": "month"}'::jsonb,
  15
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'genai_llm'),
  'chat_togetherai', 'ChatTogetherAI', 
  'Together AI collaborative model platform',
  'ChatTogetherAI provides access to open-source models with collaborative training and inference. Focuses on community-driven AI development with cost-efficient model hosting.',
  'users', '#8b5cf6', 
  ARRAY['open_source_focus', 'collaborative_training', 'community_driven', 'cost_efficient'],
  '{"together_api_key": "required", "model": "meta-llama/Llama-2-7b-chat-hf", "max_tokens": "4096"}'::jsonb,
  16
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'genai_llm'),
  'chat_xai', 'ChatXAI', 
  'xAI Grok model integration',
  'ChatXAI provides access to xAI''s Grok models with real-time information access and unique personality. Designed for conversational AI with current events understanding.',
  'twitter', '#8b5cf6', 
  ARRAY['real_time_information', 'conversational_ai', 'current_events', 'unique_personality'],
  '{"xai_api_key": "required", "model": "grok-beta", "max_tokens": "4096"}'::jsonb,
  17
);

-- ============================================================================
-- PROMPTS & TEMPLATES CATEGORY (currently empty - 0 nodes)
-- ============================================================================
INSERT INTO workflow_node_types (
  category_id, type_key, display_name, description, detailed_explanation,
  icon, color, capabilities, requirements, order_index
) VALUES 
(
  (SELECT id FROM workflow_node_categories WHERE name = 'prompts'),
  'chat_prompt_template', 'Chat Prompt Template', 
  'Structured prompt template for chat-based interactions',
  'Chat Prompt Templates provide structured formatting for conversational AI interactions. Support system messages, user context, and conversation history with variable substitution and role-based messaging.',
  'message-circle', '#ec4899', 
  ARRAY['structured_formatting', 'variable_substitution', 'role_based_messaging', 'conversation_history'],
  '{"system_message": "optional", "user_template": "required", "variables": "optional"}'::jsonb,
  1
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'prompts'),
  'few_shot_prompt_template', 'Few Shot Prompt Template', 
  'Few-shot learning prompt with examples',
  'Few Shot Prompt Templates enable few-shot learning by providing examples within the prompt. Helps models understand patterns and desired output formats through demonstration rather than explicit instruction.',
  'layers', '#ec4899', 
  ARRAY['few_shot_learning', 'pattern_recognition', 'example_based', 'output_formatting'],
  '{"examples": "required", "template": "required", "example_selector": "optional"}'::jsonb,
  2
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'prompts'),
  'prompt_template', 'Prompt Template', 
  'Basic prompt template with variable substitution',
  'Prompt Templates provide fundamental prompt engineering capabilities with variable substitution, formatting, and reusable prompt structures. Essential building block for consistent AI interactions.',
  'edit', '#ec4899', 
  ARRAY['variable_substitution', 'template_reuse', 'prompt_engineering', 'consistent_formatting'],
  '{"template": "required", "input_variables": "required", "partial_variables": "optional"}'::jsonb,
  3
);

-- ============================================================================
-- PARSERS & PROCESSORS CATEGORY (currently empty - 0 nodes)
-- ============================================================================
INSERT INTO workflow_node_types (
  category_id, type_key, display_name, description, detailed_explanation,
  icon, color, capabilities, requirements, order_index
) VALUES 
(
  (SELECT id FROM workflow_node_categories WHERE name = 'parsers'),
  'csv_output_parser', 'CSV Output Parser', 
  'Parse and structure CSV format outputs',
  'CSV Output Parser converts comma-separated value outputs into structured data formats. Handles header detection, data type inference, and validation with support for various CSV dialects and encoding.',
  'table', '#6366f1', 
  ARRAY['csv_parsing', 'data_type_inference', 'header_detection', 'validation'],
  '{"delimiter": ",", "has_header": "true", "encoding": "utf-8", "quote_char": "\""}'::jsonb,
  1
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'parsers'),
  'custom_list_output_parser', 'Custom List Output Parser', 
  'Parse custom list formats and structures',
  'Custom List Output Parser handles various list formats including numbered lists, bullet points, and custom delimiters. Provides flexible parsing rules and structure recognition for diverse list outputs.',
  'list', '#6366f1', 
  ARRAY['flexible_parsing', 'list_recognition', 'custom_delimiters', 'structure_detection'],
  '{"list_format": "required", "delimiter": "optional", "item_parser": "optional"}'::jsonb,
  2
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'parsers'),
  'structured_output_parser', 'Structured Output Parser', 
  'Parse structured data with schema validation',
  'Structured Output Parser enforces schema validation and converts unstructured text into well-defined data structures. Supports JSON schema validation, type checking, and error handling.',
  'check-circle', '#6366f1', 
  ARRAY['schema_validation', 'type_checking', 'structure_enforcement', 'error_handling'],
  '{"schema": "required", "validation_mode": "strict", "error_handling": "raise"}'::jsonb,
  3
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'parsers'),
  'advanced_structured_output_parser', 'Advanced Structured Output Parser', 
  'Advanced parsing with complex schema and validation rules',
  'Advanced Structured Output Parser provides sophisticated parsing capabilities with nested schemas, conditional validation, and complex data transformation rules. Ideal for enterprise-grade data processing.',
  'settings', '#6366f1', 
  ARRAY['nested_schemas', 'conditional_validation', 'data_transformation', 'enterprise_grade'],
  '{"complex_schema": "required", "validation_rules": "required", "transformation_rules": "optional"}'::jsonb,
  4
);

-- ============================================================================
-- UTILITIES CATEGORY (currently empty - 0 nodes)
-- ============================================================================
INSERT INTO workflow_node_types (
  category_id, type_key, display_name, description, detailed_explanation,
  icon, color, capabilities, requirements, order_index
) VALUES 
(
  (SELECT id FROM workflow_node_categories WHERE name = 'utilities'),
  'get_variable', 'Get Variable', 
  'Retrieve variables from workflow context',
  'Get Variable utility retrieves stored variables from the workflow context, session storage, or global state. Essential for maintaining data flow and state management across workflow nodes.',
  'download', '#78716c', 
  ARRAY['variable_retrieval', 'state_management', 'data_flow', 'context_access'],
  '{"variable_name": "required", "scope": "workflow", "default_value": "optional"}'::jsonb,
  1
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'utilities'),
  'set_variable', 'Set Variable', 
  'Store variables in workflow context',
  'Set Variable utility stores data in workflow context, session storage, or global state for later retrieval. Supports typed variables, persistence options, and scope management.',
  'upload', '#78716c', 
  ARRAY['variable_storage', 'data_persistence', 'scope_management', 'typed_variables'],
  '{"variable_name": "required", "value": "required", "scope": "workflow", "persist": "false"}'::jsonb,
  2
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'utilities'),
  'ifelse_function', 'If-Else Function', 
  'Conditional logic and branching utility',
  'If-Else Function provides conditional logic capabilities for workflow branching. Supports complex boolean expressions, multiple conditions, and nested logic for sophisticated decision-making.',
  'git-branch', '#78716c', 
  ARRAY['conditional_logic', 'workflow_branching', 'boolean_expressions', 'decision_making'],
  '{"condition": "required", "true_branch": "required", "false_branch": "required", "operators": "optional"}'::jsonb,
  3
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'utilities'),
  'custom_js_function', 'Custom JS Function', 
  'Execute custom JavaScript code',
  'Custom JS Function allows execution of custom JavaScript code within workflows. Provides sandboxed execution environment with access to workflow context and utility libraries.',
  'code', '#78716c', 
  ARRAY['javascript_execution', 'sandboxed_environment', 'workflow_integration', 'utility_libraries'],
  '{"javascript_code": "required", "timeout": "30", "sandbox": "true", "allowed_modules": "optional"}'::jsonb,
  4
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'utilities'),
  'sticky_note', 'Sticky Note', 
  'Documentation and annotation utility',
  'Sticky Note provides documentation and annotation capabilities for workflows. Helps with workflow organization, comments, and collaborative development with rich text support.',
  'sticky-note', '#78716c', 
  ARRAY['documentation', 'annotation', 'workflow_organization', 'collaboration'],
  '{"note_content": "required", "color": "yellow", "position": "auto", "rich_text": "true"}'::jsonb,
  5
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'utilities'),
  'text_splitter_character', 'Character Text Splitter', 
  'Split text by character count',
  'Character Text Splitter divides text into chunks based on character count. Maintains word boundaries and provides overlap options for context preservation in chunked text processing.',
  'scissors', '#78716c', 
  ARRAY['character_splitting', 'word_boundaries', 'context_preservation', 'chunk_overlap'],
  '{"chunk_size": "1000", "chunk_overlap": "200", "keep_separator": "true"}'::jsonb,
  6
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'utilities'),
  'text_splitter_recursive', 'Recursive Character Text Splitter', 
  'Advanced recursive text splitting',
  'Recursive Character Text Splitter uses hierarchical splitting strategies to maintain semantic coherence. Tries multiple separators and splitting methods to create meaningful text chunks.',
  'layers', '#78716c', 
  ARRAY['hierarchical_splitting', 'semantic_coherence', 'multiple_separators', 'meaningful_chunks'],
  '{"chunk_size": "1000", "chunk_overlap": "200", "separators": "optional", "length_function": "len"}'::jsonb,
  7
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'utilities'),
  'text_splitter_markdown', 'Markdown Text Splitter', 
  'Split Markdown documents preserving structure',
  'Markdown Text Splitter preserves Markdown structure while splitting documents. Maintains headings, formatting, and document hierarchy for better context preservation.',
  'hash', '#78716c', 
  ARRAY['markdown_structure', 'formatting_preservation', 'document_hierarchy', 'context_preservation'],
  '{"chunk_size": "1000", "chunk_overlap": "200", "preserve_headers": "true"}'::jsonb,
  8
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'utilities'),
  'text_splitter_html_markdown', 'HTML to Markdown Text Splitter', 
  'Convert HTML to Markdown and split',
  'HTML to Markdown Text Splitter converts HTML content to Markdown format and then splits it into manageable chunks. Preserves semantic structure and formatting during conversion.',
  'code', '#78716c', 
  ARRAY['html_conversion', 'markdown_output', 'semantic_structure', 'format_preservation'],
  '{"chunk_size": "1000", "chunk_overlap": "200", "html_parser": "html.parser"}'::jsonb,
  9
),
(
  (SELECT id FROM workflow_node_categories WHERE name = 'utilities'),
  'text_splitter_token', 'Token Text Splitter', 
  'Split text by token count',
  'Token Text Splitter divides text based on token count using various tokenization methods. Essential for working with language models that have token limits.',
  'hash', '#78716c', 
  ARRAY['token_splitting', 'tokenization_methods', 'token_limits', 'model_compatibility'],
  '{"chunk_size": "1000", "chunk_overlap": "200", "tokenizer": "tiktoken", "model_name": "gpt-3.5-turbo"}'::jsonb,
  10
);

-- Log the comprehensive node type creation
INSERT INTO audit_logs (
  user_id, action, table_name, additional_context
) VALUES (
  auth.uid(),
  'comprehensive_workflow_nodes_seed',
  'workflow_node_types',
  jsonb_build_object(
    'operation', 'seed_missing_node_types',
    'categories_populated', ARRAY['agents', 'cache', 'genai_llm', 'prompts', 'parsers', 'utilities'],
    'total_nodes_added', 50,
    'timestamp', now()
  )
);