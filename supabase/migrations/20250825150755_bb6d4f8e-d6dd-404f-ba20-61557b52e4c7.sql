-- Fix prior failure by using JSONB for capabilities/requirements

-- Reassign categories based on keywords
UPDATE workflow_node_types 
SET category_id = '2fce6ee4-f59d-43fc-adc4-08c71b4b1937'
WHERE LOWER(display_name) ~ 'openai|anthropic|claude|gpt|mistral|cohere|gemini|groq|bedrock|azure|deepseek'
   OR LOWER(type_key) ~ 'openai|anthropic|claude|gpt|mistral|cohere|gemini|groq|bedrock|azure|deepseek'
   OR LOWER(description) ~ 'large language model|llm|gpt|claude|gemini';

UPDATE workflow_node_types 
SET category_id = '3a1f75f6-7442-4746-a793-71ddfdcae9a3'
WHERE LOWER(display_name) ~ 'ollama|llama|phi|qwen|nano|tiny|local'
   OR LOWER(type_key) ~ 'ollama|llama|phi|qwen|nano|tiny|local'
   OR LOWER(description) ~ 'small language model|slm|local model|ollama';

UPDATE workflow_node_types 
SET category_id = 'c5cb3566-d459-4622-b0a9-1ad9e423cee4'
WHERE LOWER(display_name) ~ 'vision|gpt-4o|gpt-4v|image|multimodal|vlm'
   OR LOWER(type_key) ~ 'vision|gpt-4o|gpt-4v|image|multimodal|vlm'
   OR LOWER(description) ~ 'vision|image|multimodal|visual';

UPDATE workflow_node_types 
SET category_id = '980891c3-06bb-4e16-96e0-b74de1d9cb86'
WHERE LOWER(display_name) ~ 'mcp|model context protocol'
   OR LOWER(type_key) ~ 'mcp|model_context_protocol'
   OR LOWER(description) ~ 'mcp|model context protocol';

UPDATE workflow_node_types 
SET category_id = 'f5006388-41cc-46fe-ae88-8fa1ba586a23'
WHERE LOWER(display_name) ~ 'cache|memory|buffer|history|scratchpad|redis|memcached'
   OR LOWER(type_key) ~ 'cache|memory|buffer|history|scratchpad|redis|memcached'
   OR LOWER(description) ~ 'cache|memory|buffer|history|scratchpad';

-- Insert SLM nodes (JSONB columns)
INSERT INTO workflow_node_types (
  category_id, type_key, display_name, description, detailed_explanation,
  icon, color, is_draggable, is_configurable, 
  default_config, input_schema, output_schema, capabilities, requirements, order_index, is_active
) VALUES 
(
  '3a1f75f6-7442-4746-a793-71ddfdcae9a3',
  'ollama_llama3',
  'Ollama Llama 3',
  'Local Llama 3 model via Ollama for privacy-focused applications',
  'Run Meta''s Llama 3 model locally using Ollama. Perfect for privacy-sensitive applications where data cannot leave your infrastructure.',
  'zap',
  '#ea580c',
  true,
  true,
  '{"model": "llama3", "temperature": 0.7, "max_tokens": 2048}'::jsonb,
  '{"prompt": {"type": "string", "required": true}}'::jsonb,
  '{"response": {"type": "string"}, "tokens_used": {"type": "number"}}'::jsonb,
  '["local_inference", "privacy_focused", "customizable", "fast_inference"]'::jsonb,
  '{"ollama_server": "required", "model_downloaded": "required"}'::jsonb,
  1,
  true
),
(
  '3a1f75f6-7442-4746-a793-71ddfdcae9a3',
  'phi3_mini',
  'Microsoft Phi-3 Mini',
  'Compact 3.8B parameter model optimized for efficiency',
  'Microsoft''s Phi-3 Mini is a highly efficient small language model with 3.8B parameters, designed for edge computing and resource-constrained environments.',
  'zap',
  '#ea580c',
  true,
  true,
  '{"model": "phi3:mini", "temperature": 0.7, "max_tokens": 1024}'::jsonb,
  '{"prompt": {"type": "string", "required": true}}'::jsonb,
  '{"response": {"type": "string"}, "tokens_used": {"type": "number"}}'::jsonb,
  '["edge_computing", "efficient", "lightweight", "reasoning"]'::jsonb,
  '{"model_server": "required", "minimum_ram": "4GB"}'::jsonb,
  2,
  true
)
ON CONFLICT (type_key) DO NOTHING;

-- Insert VLM nodes
INSERT INTO workflow_node_types (
  category_id, type_key, display_name, description, detailed_explanation,
  icon, color, is_draggable, is_configurable,
  default_config, input_schema, output_schema, capabilities, requirements, order_index, is_active
) VALUES
(
  'c5cb3566-d459-4622-b0a9-1ad9e423cee4',
  'gpt4_vision',
  'GPT-4 Vision',
  'OpenAI GPT-4 with vision capabilities for image analysis',
  'Advanced multimodal AI that can understand and analyze images, diagrams, charts, and visual content alongside text.',
  'eye',
  '#16a34a',
  true,
  true,
  '{"model": "gpt-4-vision-preview", "max_tokens": 1024, "detail": "auto"}'::jsonb,
  '{"messages": {"type": "array", "required": true}, "images": {"type": "array"}}'::jsonb,
  '{"response": {"type": "string"}, "tokens_used": {"type": "number"}}'::jsonb,
  '["image_analysis", "visual_reasoning", "multimodal", "chart_reading"]'::jsonb,
  '{"openai_api_key": "required", "vision_enabled": "required"}'::jsonb,
  1,
  true
),
(
  'c5cb3566-d459-4622-b0a9-1ad9e423cee4',
  'gemini_pro_vision',
  'Gemini Pro Vision',
  'Google Gemini Pro with multimodal vision capabilities',
  'Google''s advanced multimodal AI model capable of understanding text, images, videos, and code simultaneously.',
  'eye',
  '#16a34a',
  true,
  true,
  '{"model": "gemini-pro-vision", "temperature": 0.4}'::jsonb,
  '{"text": {"type": "string"}, "images": {"type": "array"}}'::jsonb,
  '{"response": {"type": "string"}, "confidence": {"type": "number"}}'::jsonb,
  '["multimodal", "video_analysis", "document_understanding", "code_vision"]'::jsonb,
  '{"google_api_key": "required", "project_id": "required"}'::jsonb,
  2,
  true
)
ON CONFLICT (type_key) DO NOTHING;

-- Insert Cache & Memory nodes
INSERT INTO workflow_node_types (
  category_id, type_key, display_name, description, detailed_explanation,
  icon, color, is_draggable, is_configurable,
  default_config, input_schema, output_schema, capabilities, requirements, order_index, is_active
) VALUES
(
  'f5006388-41cc-46fe-ae88-8fa1ba586a23',
  'redis_cache',
  'Redis Cache',
  'High-performance in-memory cache using Redis',
  'Redis-based caching solution for storing frequently accessed data, session information, and temporary results with high performance.',
  'grid-3x3',
  '#64748b',
  true,
  true,
  '{"host": "localhost", "port": 6379, "ttl": 3600}'::jsonb,
  '{"key": {"type": "string", "required": true}, "value": {"type": "any"}}'::jsonb,
  '{"success": {"type": "boolean"}, "cached_value": {"type": "any"}}'::jsonb,
  '["high_performance", "distributed", "persistence", "pub_sub"]'::jsonb,
  '{"redis_server": "required", "connection_string": "required"}'::jsonb,
  1,
  true
),
(
  'f5006388-41cc-46fe-ae88-8fa1ba586a23',
  'conversation_memory',
  'Conversation Memory',
  'Maintains conversation context and history',
  'Stores and manages conversation history, context, and user preferences to provide coherent multi-turn interactions.',
  'grid-3x3',
  '#64748b',
  true,
  true,
  '{"max_history": 50, "summarize_after": 20, "context_window": 4000}'::jsonb,
  '{"conversation_id": {"type": "string"}, "message": {"type": "string"}}'::jsonb,
  '{"context": {"type": "array"}, "summary": {"type": "string"}}'::jsonb,
  '["context_management", "history_tracking", "summarization", "personalization"]'::jsonb,
  '{"storage_backend": "required"}'::jsonb,
  2,
  true
)
ON CONFLICT (type_key) DO NOTHING;

-- Insert MCP nodes
INSERT INTO workflow_node_types (
  category_id, type_key, display_name, description, detailed_explanation,
  icon, color, is_draggable, is_configurable,
  default_config, input_schema, output_schema, capabilities, requirements, order_index, is_active
) VALUES
(
  '980891c3-06bb-4e16-96e0-b74de1d9cb86',
  'mcp_server',
  'MCP Server',
  'Model Context Protocol server for tool integration',
  'MCP server that provides standardized tool integration capabilities, allowing AI models to access external tools and services.',
  'git-branch',
  '#0ea5e9',
  true,
  true,
  '{"server_url": "", "protocol_version": "1.0", "auth_method": "bearer"}'::jsonb,
  '{"tools": {"type": "array"}, "context": {"type": "object"}}'::jsonb,
  '{"tool_results": {"type": "array"}, "context_updates": {"type": "object"}}'::jsonb,
  '["tool_integration", "standardized_protocol", "extensible", "secure"]'::jsonb,
  '{"mcp_server_url": "required", "authentication": "required"}'::jsonb,
  1,
  true
),
(
  '980891c3-06bb-4e16-96e0-b74de1d9cb86',
  'mcp_client',
  'MCP Client',
  'Model Context Protocol client for consuming MCP services',
  'Client implementation for connecting to MCP servers and utilizing their tool and context capabilities.',
  'git-branch',
  '#0ea5e9',
  true,
  true,
  '{"server_endpoints": [], "timeout": 30, "retry_attempts": 3}'::jsonb,
  '{"server_id": {"type": "string"}, "request": {"type": "object"}}'::jsonb,
  '{"response": {"type": "object"}, "server_info": {"type": "object"}}'::jsonb,
  '["protocol_client", "multi_server", "fault_tolerant", "async"]'::jsonb,
  '{"mcp_servers": "required"}'::jsonb,
  2,
  true
)
ON CONFLICT (type_key) DO NOTHING;

-- Insert Labeling Studio connector into Utilities if not present
INSERT INTO workflow_node_types (
  category_id, type_key, display_name, description, detailed_explanation,
  icon, color, is_draggable, is_configurable,
  default_config, input_schema, output_schema, capabilities, requirements, order_index, is_active
)
SELECT 
  (SELECT id FROM workflow_node_categories WHERE name = 'utilities' LIMIT 1),
  'labeling_studio_connector',
  'Label Studio Connector',
  'Integration with Label Studio for data annotation',
  'Connects to Label Studio for managing data annotation projects, importing/exporting labeled data, and coordinating annotation workflows.',
  'edit',
  '#8b5cf6',
  true,
  true,
  '{"url": "", "api_token": "", "project_id": null}'::jsonb,
  '{"data": {"type": "array"}, "annotation_task": {"type": "object"}}'::jsonb,
  '{"annotations": {"type": "array"}, "project_stats": {"type": "object"}}'::jsonb,
  '["data_annotation", "project_management", "export_import", "collaboration"]'::jsonb,
  '{"label_studio_url": "required", "api_token": "required"}'::jsonb,
  99,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM workflow_node_types WHERE type_key = 'labeling_studio_connector'
);