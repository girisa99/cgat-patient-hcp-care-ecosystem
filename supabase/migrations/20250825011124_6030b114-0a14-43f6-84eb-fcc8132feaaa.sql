-- Seed Data for Workflow Node Categories and Types
-- Insert node categories first
INSERT INTO workflow_node_categories (name, display_name, description, icon, color, order_index) VALUES
  ('agents', 'Agents', 'AI agents and intelligent assistants with various capabilities and specializations', 'bot', '#3b82f6', 1),
  ('cache', 'Cache & Memory', 'Caching systems and memory storage solutions for improved performance', 'database', '#10b981', 2),
  ('genai_llm', 'GenAI & LLM', 'Large language models and generative AI systems', 'brain', '#8b5cf6', 3),
  ('small_language_models', 'Small Language Models', 'Compact and efficient language models for specific tasks', 'zap', '#f59e0b', 4),
  ('vision_models', 'Vision Language Models', 'Models that combine visual and textual understanding', 'eye', '#ef4444', 5),
  ('mcp', 'MCP (Model Context Protocol)', 'Model Context Protocol for structured AI interactions', 'link', '#06b6d4', 6),
  ('vector_stores', 'Vector Stores', 'Vector databases and similarity search systems', 'grid-3x3', '#84cc16', 7),
  ('tools', 'Tools & Utilities', 'External tools and utility integrations', 'wrench', '#f97316', 8),
  ('document_loaders', 'Document Loaders', 'Data ingestion and document processing tools', 'file-text', '#64748b', 9),
  ('prompts', 'Prompts & Templates', 'Prompt engineering and template management', 'message-square', '#ec4899', 10),
  ('parsers', 'Parsers & Processors', 'Data parsing and output processing utilities', 'filter', '#6366f1', 11),
  ('chains', 'Chains & Workflows', 'Pre-built workflow chains and processing pipelines', 'workflow', '#059669', 12),
  ('utilities', 'Utilities', 'General utility functions and helper tools', 'settings', '#78716c', 13),
  ('flows', 'Agent Flows', 'Complex multi-agent workflows and orchestration', 'git-branch', '#dc2626', 14)
ON CONFLICT (name) DO NOTHING;

-- Insert node types for each category
-- AGENTS CATEGORY
INSERT INTO workflow_node_types (category_id, type_key, display_name, description, detailed_explanation, icon, capabilities, requirements, order_index) 
SELECT 
  c.id,
  'react_agent_llm',
  'ReAct Agent for LLM',
  'Agent that uses ReACt logic for LLM reasoning',
  'The ReAct (Reasoning + Acting) agent combines reasoning and acting capabilities in language models. It uses a structured approach where the model reasons about what to do, takes action based on that reasoning, and observes the results. This creates a loop of thought-action-observation that enables more reliable and explainable AI behavior. Optimized specifically for Large Language Models with enhanced reasoning capabilities.',
  'brain',
  '["reasoning", "action_planning", "observation", "llm_optimization", "step_by_step_thinking"]',
  '{"model_type": "llm", "min_context_length": 4000, "supports_function_calling": true}',
  1
FROM workflow_node_categories c WHERE c.name = 'agents';

INSERT INTO workflow_node_types (category_id, type_key, display_name, description, detailed_explanation, icon, capabilities, requirements, order_index)
SELECT 
  c.id,
  'tool_agent',
  'Tool Agent',
  'Agent that uses function calling to pick tools and arguments',
  'Tool Agent specializes in function calling and tool selection. It intelligently analyzes user requests, determines which tools are needed, and automatically selects the appropriate arguments for each tool call. This agent excels at orchestrating multiple tools in sequence and parallel, making it ideal for complex workflows that require integration with external APIs, databases, and services.',
  'tool',
  '["function_calling", "tool_selection", "argument_mapping", "multi_tool_orchestration", "parallel_execution"]',
  '{"supports_function_calling": true, "tool_registry_access": true}',
  2
FROM workflow_node_categories c WHERE c.name = 'agents';

INSERT INTO workflow_node_types (category_id, type_key, display_name, description, detailed_explanation, icon, capabilities, requirements, order_index)
SELECT 
  c.id,
  'xml_agent',
  'XML Agent',
  'Agent designed for LLMs good at reasoning/writing XML',
  'XML Agent is specifically designed for Large Language Models that excel at structured XML generation and reasoning. This agent leverages the natural ability of certain LLMs to understand and generate well-formed XML documents, making it perfect for tasks involving structured data output, configuration generation, and complex document templates. It ensures proper XML syntax and can handle nested structures with precision.',
  'code',
  '["xml_generation", "structured_output", "syntax_validation", "nested_structures", "template_processing"]',
  '{"model_type": "llm", "xml_capable": true, "structured_output": true}',
  3
FROM workflow_node_categories c WHERE c.name = 'agents';

-- Continue with more agent types...
INSERT INTO workflow_node_types (category_id, type_key, display_name, description, detailed_explanation, icon, capabilities, requirements, order_index)
SELECT 
  c.id,
  agent_data.type_key,
  agent_data.display_name,
  agent_data.description,
  agent_data.detailed_explanation,
  agent_data.icon,
  agent_data.capabilities,
  agent_data.requirements,
  agent_data.order_index
FROM workflow_node_categories c,
(VALUES
  ('airtable_agent', 'Airtable Agent', 'Specialized agent for Airtable database operations', 'Airtable Agent provides comprehensive integration with Airtable databases, enabling automated data manipulation, record creation, updates, and complex queries. It understands Airtable''s unique data types and relationships, making it perfect for CRM automation, project management, and collaborative workflows.', 'database', '["airtable_api", "record_management", "field_mapping", "automation_triggers"]', '{"api_key": "airtable", "workspace_access": true}', 4),
  ('openai_agent', 'OpenAI Agent', 'Direct OpenAI API integration agent', 'OpenAI Agent provides direct integration with OpenAI''s suite of models including GPT-4, DALL-E, and Whisper. It handles API authentication, model selection, parameter optimization, and response processing. Perfect for applications requiring high-quality text generation, image creation, and speech processing.', 'brain', '["text_generation", "image_creation", "speech_to_text", "embeddings"]', '{"api_key": "openai", "model_access": ["gpt-4", "dall-e", "whisper"]}', 5),
  ('gemini_agent', 'Gemini Agent', 'Google Gemini AI model integration', 'Gemini Agent integrates with Google''s Gemini family of multimodal AI models. It excels at understanding and generating content across text, images, and code. The agent can handle complex reasoning tasks, multimodal inputs, and provides fast, accurate responses for a wide range of applications.', 'sparkles', '["multimodal_understanding", "code_generation", "reasoning", "fast_inference"]', '{"api_key": "google", "model_access": ["gemini-pro", "gemini-vision"]}', 6),
  ('perplexity_agent', 'Perplexity Agent', 'Perplexity AI search and reasoning agent', 'Perplexity Agent combines search capabilities with AI reasoning to provide accurate, up-to-date information. It excels at research tasks, fact-checking, and providing cited responses with real-time web search integration. Perfect for applications requiring current information and reliable sources.', 'search', '["web_search", "fact_checking", "citation_generation", "real_time_data"]', '{"api_key": "perplexity", "search_access": true}', 7),
  ('anthropic_agent', 'Anthropic Agent', 'Claude AI model integration', 'Anthropic Agent integrates with Claude, Anthropic''s AI assistant known for safety, helpfulness, and harmlessness. It excels at complex reasoning, creative writing, code analysis, and maintaining consistent, helpful responses across long conversations. Ideal for applications requiring reliable, ethical AI assistance.', 'shield', '["safe_reasoning", "long_context", "code_analysis", "ethical_responses"]', '{"api_key": "anthropic", "model_access": ["claude-3", "claude-instant"]}', 8),
  ('deepseek_agent', 'DeepSeek Agent', 'DeepSeek AI model integration', 'DeepSeek Agent integrates with DeepSeek''s family of AI models, known for strong performance in code generation, mathematical reasoning, and technical problem-solving. It''s particularly effective for software development tasks, algorithm implementation, and complex analytical workflows.', 'code-2', '["code_generation", "mathematical_reasoning", "algorithm_design", "technical_analysis"]', '{"api_key": "deepseek", "model_access": ["deepseek-coder", "deepseek-math"]}', 9),
  ('conversational_agent', 'Conversational Agent', 'General conversational AI agent', 'Conversational Agent is designed for natural, engaging dialogues with users. It maintains context across conversations, adapts to different communication styles, and provides personalized responses. Perfect for customer service, virtual assistants, and interactive applications requiring human-like conversation.', 'message-circle', '["context_retention", "style_adaptation", "personality_modeling", "conversation_flow"]', '{"conversation_memory": true, "personality_config": true}', 10),
  ('huggingface_agent', 'Hugging Face Agent', 'Hugging Face model ecosystem integration', 'Hugging Face Agent provides access to the vast ecosystem of open-source AI models available on Hugging Face Hub. It can dynamically load and use different models for text generation, classification, translation, and more. Ideal for applications requiring diverse AI capabilities and model flexibility.', 'git-branch', '["model_loading", "multi_task_support", "open_source_models", "dynamic_selection"]', '{"huggingface_token": true, "model_repository_access": true}', 11),
  ('csv_agent', 'CSV Agent', 'Specialized agent for CSV data processing', 'CSV Agent excels at parsing, analyzing, and manipulating CSV data. It can perform data cleaning, transformation, statistical analysis, and generate insights from tabular data. Perfect for data analytics workflows, report generation, and automated data processing pipelines.', 'table', '["data_parsing", "statistical_analysis", "data_cleaning", "report_generation"]', '{"pandas_support": true, "data_validation": true}', 12),
  ('react_chat_agent', 'ReAct Agent for Chat Models', 'ReAct logic optimized for chat-based interactions', 'ReAct Chat Agent applies the Reasoning + Acting framework specifically to chat-based interactions. It excels at maintaining conversation flow while performing actions and reasoning about user needs in real-time. Optimized for chat models with conversational memory and context awareness.', 'message-square', '["conversational_reasoning", "chat_context", "real_time_actions", "dialogue_management"]', '{"chat_model": true, "conversation_memory": true}', 13)
) AS agent_data(type_key, display_name, description, detailed_explanation, icon, capabilities, requirements, order_index)
WHERE c.name = 'agents';

-- CACHE CATEGORY
INSERT INTO workflow_node_types (category_id, type_key, display_name, description, detailed_explanation, icon, capabilities, requirements, order_index)
SELECT 
  c.id,
  cache_data.type_key,
  cache_data.display_name,
  cache_data.description,
  cache_data.detailed_explanation,
  cache_data.icon,
  cache_data.capabilities,
  cache_data.requirements,
  cache_data.order_index
FROM workflow_node_categories c,
(VALUES
  ('google_genai_cache', 'Google GenAI Context Cache', 'Google AI context caching system', 'Google GenAI Context Cache optimizes repeated AI interactions by caching context and responses from Google''s AI models. It reduces latency and API costs by intelligently storing and retrieving previously computed contexts, making it ideal for applications with repetitive queries or similar conversation patterns.', 'database', '["context_caching", "response_optimization", "cost_reduction", "latency_improvement"]', '{"google_ai_access": true, "cache_storage": true}', 1),
  ('inmemory_cache', 'In-Memory Cache', 'High-speed in-memory data caching', 'In-Memory Cache provides ultra-fast data storage and retrieval using system RAM. Perfect for frequently accessed data, session storage, and temporary computational results. Offers millisecond access times but data is volatile and lost on system restart.', 'zap', '["fast_access", "session_storage", "temporary_data", "high_throughput"]', '{"memory_allocation": true, "volatile_storage": true}', 2),
  ('inmemory_embedding_cache', 'In-Memory Embedding Cache', 'Cached vector embeddings in memory', 'In-Memory Embedding Cache stores vector embeddings in system memory for lightning-fast similarity searches and vector operations. Ideal for real-time recommendation systems, semantic search, and AI applications requiring rapid vector lookups without database latency.', 'grid-3x3', '["vector_storage", "similarity_search", "fast_retrieval", "embedding_optimization"]', '{"vector_support": true, "memory_allocation": true}', 3),
  ('momento_cache', 'Momento Cache', 'Serverless cache service integration', 'Momento Cache integrates with Momento''s serverless caching service, providing distributed, scalable caching without infrastructure management. Perfect for applications requiring reliable, high-performance caching with automatic scaling and global distribution.', 'cloud', '["serverless_caching", "distributed_storage", "auto_scaling", "global_distribution"]', '{"momento_api_key": true, "serverless_access": true}', 4),
  ('redis_cache', 'Redis Cache', 'Redis-based data caching and storage', 'Redis Cache leverages Redis'' powerful in-memory data structure store for caching, session management, and real-time analytics. Supports advanced data types, pub/sub messaging, and persistence options. Ideal for high-performance applications requiring complex data operations.', 'database', '["key_value_storage", "pub_sub", "data_structures", "persistence_options"]', '{"redis_connection": true, "memory_storage": true}', 5),
  ('redis_embedding_cache', 'Redis Embedding Cache', 'Redis-based vector embedding storage', 'Redis Embedding Cache combines Redis'' performance with vector similarity search capabilities. It stores and indexes vector embeddings for fast semantic search, recommendation engines, and AI-powered matching systems with Redis'' reliability and scaling features.', 'database', '["vector_indexing", "similarity_search", "redis_performance", "scalable_storage"]', '{"redis_vector_support": true, "indexing_capability": true}', 6)
) AS cache_data(type_key, display_name, description, detailed_explanation, icon, capabilities, requirements, order_index)
WHERE c.name = 'cache';

-- Continue with more categories...
-- GENAI & LLM CATEGORY
INSERT INTO workflow_node_types (category_id, type_key, display_name, description, detailed_explanation, icon, capabilities, requirements, order_index)
SELECT 
  c.id,
  llm_data.type_key,
  llm_data.display_name,
  llm_data.description,
  llm_data.detailed_explanation,
  llm_data.icon,
  llm_data.capabilities,
  llm_data.requirements,
  llm_data.order_index
FROM workflow_node_categories c,
(VALUES
  ('aws_chatbedrock', 'AWS ChatBedrock', 'Amazon Bedrock chat model integration', 'AWS ChatBedrock provides access to foundation models through Amazon Bedrock, including Claude, Llama, and Titan models. It offers enterprise-grade security, scalability, and cost optimization for AI workloads. Perfect for organizations already using AWS infrastructure.', 'cloud', '["foundation_models", "enterprise_security", "aws_integration", "cost_optimization"]', '{"aws_credentials": true, "bedrock_access": true}', 1),
  ('azure_chatopenai', 'Azure ChatOpenAI', 'Azure OpenAI Service integration', 'Azure ChatOpenAI integrates with Microsoft Azure OpenAI Service, providing enterprise-ready access to GPT models with enhanced security, compliance, and data residency controls. Ideal for organizations requiring OpenAI capabilities with enterprise governance.', 'cloud', '["enterprise_compliance", "data_residency", "security_controls", "gpt_models"]', '{"azure_credentials": true, "openai_access": true}', 2),
  ('chat_alibaba_tongyi', 'ChatAlibaba Tongyi', 'Alibaba Tongyi Qianwen integration', 'ChatAlibaba Tongyi integrates with Alibaba''s Tongyi Qianwen large language model, designed for Chinese and multilingual applications. It excels at understanding Chinese context, culture, and business practices while supporting global use cases.', 'globe', '["chinese_language", "multilingual_support", "cultural_context", "alibaba_ecosystem"]', '{"alibaba_api_key": true, "tongyi_access": true}', 3),
  ('chat_anthropic', 'ChatAnthropic', 'Anthropic Claude chat integration', 'ChatAnthropic provides direct integration with Anthropic''s Claude family of models known for safety, helpfulness, and honesty. Claude excels at complex reasoning, creative tasks, and maintaining helpful, harmless responses across extended conversations.', 'shield', '["safety_focused", "complex_reasoning", "long_context", "helpful_responses"]', '{"anthropic_api_key": true, "claude_access": true}', 4),
  ('chat_baidu_wenxin', 'ChatBaidu Wenxin', 'Baidu Wenxin (ERNIE) integration', 'ChatBaidu Wenxin integrates with Baidu''s ERNIE (Enhanced Representation through kNowledge IntEgration) model. It combines pre-training with knowledge graphs for enhanced understanding of Chinese language and culture, making it ideal for Chinese market applications.', 'brain', '["chinese_expertise", "knowledge_integration", "cultural_understanding", "baidu_ecosystem"]', '{"baidu_api_key": true, "wenxin_access": true}', 5),
  ('chat_cerebras', 'ChatCerebras', 'Cerebras AI model integration', 'ChatCerebras integrates with Cerebras'' ultra-fast AI models powered by specialized hardware. It delivers exceptional inference speed and efficiency, making it perfect for real-time applications requiring immediate AI responses and high-throughput scenarios.', 'zap', '["ultra_fast_inference", "high_throughput", "real_time_responses", "specialized_hardware"]', '{"cerebras_api_key": true, "fast_inference": true}', 6),
  ('chat_cohere', 'ChatCohere', 'Cohere language model integration', 'ChatCohere integrates with Cohere''s language models designed for enterprise applications. It excels at text generation, summarization, classification, and embedding generation with strong multilingual capabilities and enterprise-focused features.', 'layers', '["enterprise_features", "multilingual_support", "text_classification", "embeddings"]', '{"cohere_api_key": true, "enterprise_access": true}', 7),
  ('chat_fireworks', 'ChatFireworks', 'Fireworks AI model integration', 'ChatFireworks integrates with Fireworks AI''s optimized open-source models, providing fast, cost-effective access to popular models like Llama, Mixtral, and CodeLlama. Perfect for applications requiring open-source model flexibility with production performance.', 'flame', '["open_source_models", "cost_effective", "fast_inference", "model_variety"]', '{"fireworks_api_key": true, "open_source_access": true}', 8),
  ('chat_google_generative_ai', 'ChatGoogle GenerativeAI', 'Google Generative AI integration', 'ChatGoogle GenerativeAI integrates with Google''s Generative AI models including Gemini and PaLM. It provides multimodal capabilities, strong reasoning, and seamless integration with Google''s ecosystem of services and tools.', 'sparkles', '["multimodal_capabilities", "google_integration", "strong_reasoning", "ecosystem_connectivity"]', '{"google_api_key": true, "generative_ai_access": true}', 9),
  ('chat_google_vertex_ai', 'ChatGoogle VertexAI', 'Google Vertex AI platform integration', 'ChatGoogle VertexAI integrates with Google Cloud''s Vertex AI platform, providing access to both Google''s models and third-party models in a managed environment. Offers MLOps capabilities, model monitoring, and enterprise-grade infrastructure.', 'cloud', '["managed_platform", "mlops_capabilities", "model_monitoring", "enterprise_infrastructure"]', '{"google_cloud_credentials": true, "vertex_ai_access": true}', 10),
  ('chat_huggingface', 'ChatHuggingface', 'Hugging Face Inference API integration', 'ChatHuggingface integrates with Hugging Face''s Inference API, providing access to thousands of open-source models. It enables easy experimentation with different models and supports custom fine-tuned models hosted on Hugging Face.', 'git-branch', '["open_source_ecosystem", "model_experimentation", "custom_models", "community_driven"]', '{"huggingface_token": true, "inference_api_access": true}', 11),
  ('chat_openai', 'ChatOpenAI', 'OpenAI GPT model integration', 'ChatOpenAI provides direct integration with OpenAI''s GPT family of models including GPT-4, GPT-3.5, and specialized variants. It offers state-of-the-art language understanding, generation capabilities, and function calling for complex applications.', 'brain', '["state_of_the_art", "function_calling", "advanced_reasoning", "versatile_applications"]', '{"openai_api_key": true, "gpt_access": true}', 12),
  ('chat_openai_custom', 'ChatOpenAI Custom', 'Custom OpenAI model configuration', 'ChatOpenAI Custom allows fine-tuned control over OpenAI model parameters, custom prompts, and specialized configurations. Perfect for applications requiring specific model behavior, custom system prompts, or fine-tuned models.', 'settings', '["custom_configuration", "fine_tuned_models", "parameter_control", "specialized_behavior"]', '{"openai_api_key": true, "custom_model_access": true}', 13),
  ('chat_openrouter', 'ChatOpenRouter', 'OpenRouter API integration', 'ChatOpenRouter integrates with OpenRouter''s unified API providing access to multiple AI models through a single interface. It enables model comparison, automatic failover, and cost optimization across different AI providers.', 'route', '["multi_provider_access", "model_comparison", "automatic_failover", "cost_optimization"]', '{"openrouter_api_key": true, "multi_model_access": true}', 14),
  ('chat_perplexity', 'ChatPerplexity', 'Perplexity AI integration', 'ChatPerplexity integrates with Perplexity''s AI models that combine search capabilities with language generation. Perfect for applications requiring up-to-date information, fact-checking, and research-oriented responses with source citations.', 'search', '["search_integration", "fact_checking", "source_citations", "current_information"]', '{"perplexity_api_key": true, "search_access": true}', 15),
  ('chat_together_ai', 'ChatTogetherAI', 'Together AI platform integration', 'ChatTogetherAI integrates with Together AI''s platform for running open-source language models at scale. It provides access to models like Llama, Mistral, and others with optimized inference and competitive pricing for high-volume applications.', 'users', '["open_source_focus", "scalable_inference", "competitive_pricing", "high_volume_support"]', '{"together_api_key": true, "platform_access": true}', 16),
  ('chat_xai', 'ChatXAI', 'X.AI (xAI) integration', 'ChatXAI integrates with X.AI''s language models, designed with a focus on truth-seeking and understanding the universe. It provides access to cutting-edge AI capabilities with emphasis on accuracy, reasoning, and scientific understanding.', 'atom', '["truth_seeking", "scientific_reasoning", "accuracy_focused", "advanced_capabilities"]', '{"xai_api_key": true, "xai_access": true}', 17)
) AS llm_data(type_key, display_name, description, detailed_explanation, icon, capabilities, requirements, order_index)
WHERE c.name = 'genai_llm';