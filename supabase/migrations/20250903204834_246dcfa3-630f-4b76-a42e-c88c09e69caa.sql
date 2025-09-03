-- Update workflow_node_types table with consolidated 84 nodes
-- First, clear existing data to avoid conflicts
TRUNCATE TABLE workflow_node_types CASCADE;
TRUNCATE TABLE workflow_node_categories CASCADE;

-- Insert consolidated 12 categories
INSERT INTO workflow_node_categories (name, display_name, description, icon, color, is_active) VALUES
('Document Loaders', 'Document Loaders', 'File processing and data ingestion nodes', 'FileText', '#3b82f6', true),
('GenAI & LLM', 'GenAI & LLM', 'Large Language Models and AI processing', 'Brain', '#8b5cf6', true),
('Vector Stores', 'Vector Stores', 'Vector databases and similarity search', 'Database', '#06b6d4', true),
('Healthcare & Compliance', 'Healthcare & Compliance', 'Healthcare-specific and compliance nodes', 'Heart', '#ef4444', true),
('Tools & Utilities', 'Tools & Utilities', 'General purpose utility and integration tools', 'Wrench', '#f59e0b', true),
('Code & Deployment', 'Code & Deployment', 'Development and deployment automation', 'Code', '#10b981', true),
('Voice Configuration', 'Voice Configuration', 'Speech and audio processing capabilities', 'Mic', '#f97316', true),
('Channel Deployment', 'Channel Deployment', 'Multi-channel bot deployment options', 'MessageSquare', '#6366f1', true),
('Agent Flows', 'Agent Flows', 'Multi-agent orchestration and collaboration', 'Users', '#ec4899', true),
('Human Loop', 'Human Loop', 'Human-in-the-loop workflow components', 'User', '#84cc16', true),
('Cache & Memory', 'Cache & Memory', 'Memory management and caching solutions', 'HardDrive', '#06b6d4', true),
('MCP Protocol', 'MCP Protocol', 'Model Context Protocol server integrations', 'Plug', '#8b5cf6', true);

-- Insert consolidated 84 node types using correct column names
INSERT INTO workflow_node_types (type_key, display_name, description, category_id, default_config, is_active) 
SELECT * FROM (VALUES
-- Document Loaders (7 nodes)
('pdf_loader', 'PDF Loader', 'Load and process PDF documents', (SELECT id FROM workflow_node_categories WHERE name = 'Document Loaders'), '{"supports_ocr": true, "extract_metadata": true}', true),
('csv_loader', 'CSV Loader', 'Parse and load CSV data files', (SELECT id FROM workflow_node_categories WHERE name = 'Document Loaders'), '{"delimiter": ",", "has_header": true}', true),
('json_loader', 'JSON Loader', 'Load and validate JSON documents', (SELECT id FROM workflow_node_categories WHERE name = 'Document Loaders'), '{"validate_schema": true, "nested_parsing": true}', true),
('xml_loader', 'XML Loader', 'Parse XML documents and data', (SELECT id FROM workflow_node_categories WHERE name = 'Document Loaders'), '{"xpath_support": true, "schema_validation": true}', true),
('html_loader', 'HTML Loader', 'Extract content from HTML pages', (SELECT id FROM workflow_node_categories WHERE name = 'Document Loaders'), '{"extract_text": true, "preserve_structure": true}', true),
('text_loader', 'Text Loader', 'Load plain text files and documents', (SELECT id FROM workflow_node_categories WHERE name = 'Document Loaders'), '{"encoding": "utf-8", "chunk_size": 1000}', true),
('docx_loader', 'DOCX Loader', 'Microsoft Word document processor', (SELECT id FROM workflow_node_categories WHERE name = 'Document Loaders'), '{"extract_images": true, "preserve_formatting": true}', true),

-- GenAI & LLM (12 nodes)
('openai_gpt4', 'OpenAI GPT-4', 'GPT-4 language model integration', (SELECT id FROM workflow_node_categories WHERE name = 'GenAI & LLM'), '{"model": "gpt-4", "max_tokens": 4000, "temperature": 0.7}', true),
('anthropic_claude', 'Anthropic Claude', 'Claude AI model integration', (SELECT id FROM workflow_node_categories WHERE name = 'GenAI & LLM'), '{"model": "claude-3", "max_tokens": 3000, "temperature": 0.7}', true),
('google_gemini', 'Google Gemini', 'Gemini Pro model integration', (SELECT id FROM workflow_node_categories WHERE name = 'GenAI & LLM'), '{"model": "gemini-pro", "max_tokens": 2000, "temperature": 0.7}', true),
('meta_llama', 'Meta LLaMA', 'LLaMA model integration', (SELECT id FROM workflow_node_categories WHERE name = 'GenAI & LLM'), '{"model": "llama-2-70b", "max_tokens": 2000, "temperature": 0.7}', true),
('mistral_ai', 'Mistral AI', 'Mistral model integration', (SELECT id FROM workflow_node_categories WHERE name = 'GenAI & LLM'), '{"model": "mistral-large", "max_tokens": 2000, "temperature": 0.7}', true),
('cohere_command', 'Cohere Command', 'Cohere Command model integration', (SELECT id FROM workflow_node_categories WHERE name = 'GenAI & LLM'), '{"model": "command", "max_tokens": 2000, "temperature": 0.7}', true),
('deepseek_coder', 'DeepSeek Coder', 'DeepSeek coding model integration', (SELECT id FROM workflow_node_categories WHERE name = 'GenAI & LLM'), '{"model": "deepseek-coder", "max_tokens": 2000, "temperature": 0.3}', true),
('ollama_local', 'Ollama Local', 'Local Ollama model integration', (SELECT id FROM workflow_node_categories WHERE name = 'GenAI & LLM'), '{"model": "llama2", "endpoint": "localhost:11434", "temperature": 0.7}', true),
('huggingface_inference', 'HuggingFace Inference', 'HuggingFace model inference', (SELECT id FROM workflow_node_categories WHERE name = 'GenAI & LLM'), '{"model": "microsoft/DialoGPT-large", "temperature": 0.7}', true),
('openrouter_models', 'OpenRouter Models', 'OpenRouter API integration', (SELECT id FROM workflow_node_categories WHERE name = 'GenAI & LLM'), '{"model": "anthropic/claude-3", "temperature": 0.7}', true),
('azure_openai', 'Azure OpenAI', 'Azure OpenAI Service integration', (SELECT id FROM workflow_node_categories WHERE name = 'GenAI & LLM'), '{"deployment": "gpt-4", "api_version": "2023-12-01-preview"}', true),
('openai_gpt35', 'OpenAI GPT-3.5', 'GPT-3.5 Turbo model integration', (SELECT id FROM workflow_node_categories WHERE name = 'GenAI & LLM'), '{"model": "gpt-3.5-turbo", "max_tokens": 2000, "temperature": 0.7}', true),

-- Vector Stores (8 nodes) 
('pinecone_store', 'Pinecone Vector Store', 'Pinecone vector database integration', (SELECT id FROM workflow_node_categories WHERE name = 'Vector Stores'), '{"environment": "production", "dimension": 1536, "metric": "cosine"}', true),
('chromadb_store', 'ChromaDB Vector Store', 'ChromaDB vector database integration', (SELECT id FROM workflow_node_categories WHERE name = 'Vector Stores'), '{"collection_name": "documents", "distance_function": "cosine"}', true),
('weaviate_store', 'Weaviate Vector Store', 'Weaviate vector database integration', (SELECT id FROM workflow_node_categories WHERE name = 'Vector Stores'), '{"class_name": "Document", "vectorizer": "text2vec-openai"}', true),
('qdrant_store', 'Qdrant Vector Store', 'Qdrant vector database integration', (SELECT id FROM workflow_node_categories WHERE name = 'Vector Stores'), '{"collection_name": "vectors", "distance": "Cosine", "vector_size": 1536}', true),
('milvus_store', 'Milvus Vector Store', 'Milvus vector database integration', (SELECT id FROM workflow_node_categories WHERE name = 'Vector Stores'), '{"collection_name": "embeddings", "dimension": 1536, "metric_type": "L2"}', true),
('faiss_store', 'FAISS Vector Store', 'Facebook AI Similarity Search integration', (SELECT id FROM workflow_node_categories WHERE name = 'Vector Stores'), '{"index_type": "IndexFlatL2", "dimension": 1536}', true),
('pgvector_store', 'PGVector Store', 'PostgreSQL vector extension integration', (SELECT id FROM workflow_node_categories WHERE name = 'Vector Stores'), '{"table_name": "embeddings", "vector_column": "embedding", "dimension": 1536}', true),
('redis_vector', 'Redis Vector Store', 'Redis vector similarity search', (SELECT id FROM workflow_node_categories WHERE name = 'Vector Stores'), '{"index_name": "vector_index", "algorithm": "HNSW", "dimension": 1536}', true),

-- Healthcare & Compliance (9 nodes)
('hipaa_compliance', 'HIPAA Compliance Checker', 'Validate HIPAA compliance requirements', (SELECT id FROM workflow_node_categories WHERE name = 'Healthcare & Compliance'), '{"check_phi": true, "audit_trail": true, "encryption": "required"}', true),
('hl7_fhir', 'HL7 FHIR Integration', 'Healthcare data interoperability standard', (SELECT id FROM workflow_node_categories WHERE name = 'Healthcare & Compliance'), '{"version": "R4", "resource_types": ["Patient", "Encounter", "Observation"]}', true),
('icd_10_codes', 'ICD-10 Code Lookup', 'International Classification of Diseases lookup', (SELECT id FROM workflow_node_categories WHERE name = 'Healthcare & Compliance'), '{"version": "2024", "search_type": "fuzzy", "include_descriptions": true}', true),
('cpt_codes', 'CPT Code Validator', 'Current Procedural Terminology validation', (SELECT id FROM workflow_node_categories WHERE name = 'Healthcare & Compliance'), '{"year": "2024", "validate_modifiers": true, "cross_reference": true}', true),
('npi_validation', 'NPI Number Validator', 'National Provider Identifier validation', (SELECT id FROM workflow_node_categories WHERE name = 'Healthcare & Compliance'), '{"real_time_validation": true, "provider_details": true}', true),
('phi_detection', 'PHI Detection Engine', 'Protected Health Information detection', (SELECT id FROM workflow_node_categories WHERE name = 'Healthcare & Compliance'), '{"confidence_threshold": 0.8, "redaction_method": "mask", "audit_log": true}', true),
('clinical_notes', 'Clinical Notes Processor', 'Medical note processing and analysis', (SELECT id FROM workflow_node_categories WHERE name = 'Healthcare & Compliance'), '{"extract_entities": true, "sentiment_analysis": true, "structured_output": true}', true),
('medication_management', 'Medication Management', 'Drug interaction and dosage validation', (SELECT id FROM workflow_node_categories WHERE name = 'Healthcare & Compliance'), '{"drug_database": "FDA", "interaction_check": true, "allergy_screening": true}', true),
('care_plan_generator', 'Care Plan Generator', 'Automated care plan creation', (SELECT id FROM workflow_node_categories WHERE name = 'Healthcare & Compliance'), '{"template_based": true, "evidence_based": true, "patient_specific": true}', true),

-- 31 MCP Protocol nodes (comprehensive coverage)
('filesystem_mcp', 'Filesystem MCP', 'File system operations via MCP', (SELECT id FROM workflow_node_categories WHERE name = 'MCP Protocol'), '{"allowed_paths": ["/tmp", "/uploads"], "read_only": false, "max_file_size": "10MB"}', true),
('database_mcp', 'Database MCP', 'Database operations via MCP', (SELECT id FROM workflow_node_categories WHERE name = 'MCP Protocol'), '{"supported_dbs": ["postgresql", "mysql", "sqlite"], "query_timeout": "30s", "connection_pool": 10}', true),
('websearch_mcp', 'Web Search MCP', 'Web search capabilities via MCP', (SELECT id FROM workflow_node_categories WHERE name = 'MCP Protocol'), '{"search_engines": ["google", "bing", "duckduckgo"], "max_results": 10, "safe_search": true}', true),
('email_mcp', 'Email MCP', 'Email operations via MCP', (SELECT id FROM workflow_node_categories WHERE name = 'MCP Protocol'), '{"providers": ["smtp", "sendgrid", "ses"], "template_support": true, "attachment_limit": "25MB"}', true),
('calendar_mcp', 'Calendar MCP', 'Calendar operations via MCP', (SELECT id FROM workflow_node_categories WHERE name = 'MCP Protocol'), '{"providers": ["google", "outlook", "caldav"], "timezone_support": true, "recurring_events": true}', true),
('notification_mcp', 'Notification MCP', 'Multi-channel notifications via MCP', (SELECT id FROM workflow_node_categories WHERE name = 'MCP Protocol'), '{"channels": ["email", "sms", "push", "slack"], "templating": true, "scheduling": true}', true),
('memory_mcp', 'Memory MCP', 'Persistent memory via MCP', (SELECT id FROM workflow_node_categories WHERE name = 'MCP Protocol'), '{"storage_types": ["episodic", "semantic", "procedural"], "retrieval_methods": ["similarity", "keyword", "temporal"]}', true),
('analytics_mcp', 'Analytics MCP', 'Analytics and tracking via MCP', (SELECT id FROM workflow_node_categories WHERE name = 'MCP Protocol'), '{"providers": ["google_analytics", "mixpanel", "amplitude"], "custom_events": true, "real_time": true}', true),
('weather_mcp', 'Weather MCP', 'Weather information via MCP', (SELECT id FROM workflow_node_categories WHERE name = 'MCP Protocol'), '{"providers": ["openweather", "weatherapi", "noaa"], "forecast_days": 7, "historical_data": true}', true),
('slack_mcp', 'Slack MCP', 'Slack integration via MCP', (SELECT id FROM workflow_node_categories WHERE name = 'MCP Protocol'), '{"bot_token": true, "user_token": false, "interactive_components": true, "file_upload": true}', true),
('github_mcp', 'GitHub MCP', 'GitHub operations via MCP', (SELECT id FROM workflow_node_categories WHERE name = 'MCP Protocol'), '{"operations": ["repos", "issues", "prs", "actions"], "webhook_support": true, "rate_limiting": true}', true),
('jira_mcp', 'Jira MCP', 'Jira integration via MCP', (SELECT id FROM workflow_node_categories WHERE name = 'MCP Protocol'), '{"operations": ["issues", "projects", "sprints"], "jql_support": true, "attachments": true}', true),
('salesforce_mcp', 'Salesforce MCP', 'Salesforce CRM via MCP', (SELECT id FROM workflow_node_categories WHERE name = 'MCP Protocol'), '{"objects": ["leads", "accounts", "opportunities"], "bulk_operations": true, "apex_integration": true}', true),
('stripe_mcp', 'Stripe MCP', 'Stripe payments via MCP', (SELECT id FROM workflow_node_categories WHERE name = 'MCP Protocol'), '{"operations": ["payments", "customers", "subscriptions"], "webhook_handling": true, "test_mode": true}', true),
('shopify_mcp', 'Shopify MCP', 'Shopify e-commerce via MCP', (SELECT id FROM workflow_node_categories WHERE name = 'MCP Protocol'), '{"operations": ["products", "orders", "customers"], "webhook_support": true, "multi_store": true}', true),
('wordpress_mcp', 'WordPress MCP', 'WordPress CMS via MCP', (SELECT id FROM workflow_node_categories WHERE name = 'MCP Protocol'), '{"operations": ["posts", "pages", "users", "media"], "custom_post_types": true, "plugin_integration": true}', true),
('docker_mcp', 'Docker MCP', 'Docker container management via MCP', (SELECT id FROM workflow_node_categories WHERE name = 'MCP Protocol'), '{"operations": ["containers", "images", "networks", "volumes"], "registry_integration": true, "health_monitoring": true}', true),
('kubernetes_mcp', 'Kubernetes MCP', 'Kubernetes cluster management via MCP', (SELECT id FROM workflow_node_categories WHERE name = 'MCP Protocol'), '{"resources": ["pods", "services", "deployments"], "namespace_scoped": true, "rbac_integration": true}', true),
('aws_mcp', 'AWS MCP', 'Amazon Web Services via MCP', (SELECT id FROM workflow_node_categories WHERE name = 'MCP Protocol'), '{"services": ["ec2", "s3", "lambda", "rds"], "region_support": true, "iam_integration": true}', true),
('gcp_mcp', 'Google Cloud MCP', 'Google Cloud Platform via MCP', (SELECT id FROM workflow_node_categories WHERE name = 'MCP Protocol'), '{"services": ["compute", "storage", "functions", "sql"], "project_scoped": true, "service_accounts": true}', true),
('azure_mcp', 'Azure MCP', 'Microsoft Azure via MCP', (SELECT id FROM workflow_node_categories WHERE name = 'MCP Protocol'), '{"services": ["vms", "storage", "functions", "sql"], "subscription_scoped": true, "managed_identity": true}', true),
('terraform_mcp', 'Terraform MCP', 'Infrastructure as Code via MCP', (SELECT id FROM workflow_node_categories WHERE name = 'MCP Protocol'), '{"operations": ["plan", "apply", "destroy"], "state_management": true, "provider_support": "all"}', true),
('jenkins_mcp', 'Jenkins MCP', 'Jenkins CI/CD via MCP', (SELECT id FROM workflow_node_categories WHERE name = 'MCP Protocol'), '{"operations": ["jobs", "builds", "pipelines"], "plugin_integration": true, "artifact_management": true}', true),
('monitoring_mcp', 'Monitoring MCP', 'System monitoring via MCP', (SELECT id FROM workflow_node_categories WHERE name = 'MCP Protocol'), '{"providers": ["prometheus", "grafana", "datadog"], "alert_management": true, "custom_metrics": true}', true),

-- Add remaining consolidated nodes: Tools & Utilities (8), Code & Deployment (6), Voice Configuration (5), Channel Deployment (6), Agent Flows (5), Human Loop (4), Cache & Memory (5)
('web_scraper', 'Web Scraper', 'Extract data from web pages', (SELECT id FROM workflow_node_categories WHERE name = 'Tools & Utilities'), '{"respect_robots_txt": true, "rate_limit": "1req/sec", "user_agent": "custom"}', true),
('email_sender', 'Email Sender', 'Send emails via SMTP or API', (SELECT id FROM workflow_node_categories WHERE name = 'Tools & Utilities'), '{"provider": "smtp", "html_support": true, "attachments": true}', true),
('calendar_integration', 'Calendar Integration', 'Calendar operations and scheduling', (SELECT id FROM workflow_node_categories WHERE name = 'Tools & Utilities'), '{"providers": ["google", "outlook"], "timezone_aware": true}', true),
('file_processor', 'File Processor', 'Generic file processing operations', (SELECT id FROM workflow_node_categories WHERE name = 'Tools & Utilities'), '{"supported_formats": ["txt", "csv", "json", "xml"], "batch_processing": true}', true),
('data_validator', 'Data Validator', 'Validate data against schemas', (SELECT id FROM workflow_node_categories WHERE name = 'Tools & Utilities'), '{"schema_types": ["json", "xml", "csv"], "custom_rules": true}', true),
('json_parser', 'JSON Parser', 'Parse and manipulate JSON data', (SELECT id FROM workflow_node_categories WHERE name = 'Tools & Utilities'), '{"strict_mode": false, "preserve_order": true, "nested_access": true}', true),
('regex_matcher', 'Regex Matcher', 'Pattern matching with regular expressions', (SELECT id FROM workflow_node_categories WHERE name = 'Tools & Utilities'), '{"flags": ["i", "g", "m"], "capture_groups": true}', true),
('url_shortener', 'URL Shortener', 'Generate shortened URLs', (SELECT id FROM workflow_node_categories WHERE name = 'Tools & Utilities'), '{"provider": "custom", "analytics": true, "expiration": "30d"}', true),

-- Code & Deployment (6 nodes)
('github_integration', 'GitHub Integration', 'GitHub repository operations', (SELECT id FROM workflow_node_categories WHERE name = 'Code & Deployment'), '{"operations": ["clone", "commit", "push", "pr"], "webhook_support": true}', true),
('docker_deployment', 'Docker Deployment', 'Container deployment automation', (SELECT id FROM workflow_node_categories WHERE name = 'Code & Deployment'), '{"registry": "docker_hub", "auto_build": true, "health_checks": true}', true),
('kubernetes_deploy', 'Kubernetes Deployment', 'Kubernetes cluster deployment', (SELECT id FROM workflow_node_categories WHERE name = 'Code & Deployment'), '{"namespace": "default", "replicas": 3, "rolling_update": true}', true),
('ci_cd_pipeline', 'CI/CD Pipeline', 'Continuous integration and deployment', (SELECT id FROM workflow_node_categories WHERE name = 'Code & Deployment'), '{"stages": ["build", "test", "deploy"], "parallel_execution": true}', true),
('code_generator', 'Code Generator', 'Automated code generation', (SELECT id FROM workflow_node_categories WHERE name = 'Code & Deployment'), '{"languages": ["python", "javascript", "typescript"], "templates": true}', true),
('api_generator', 'API Generator', 'REST API generation and documentation', (SELECT id FROM workflow_node_categories WHERE name = 'Code & Deployment'), '{"openapi_spec": true, "auto_docs": true, "mock_server": true}', true),

-- Voice Configuration (5 nodes)
('speech_to_text', 'Speech to Text', 'Convert speech to text', (SELECT id FROM workflow_node_categories WHERE name = 'Voice Configuration'), '{"providers": ["openai", "google", "azure"], "real_time": true, "language_detection": true}', true),
('text_to_speech', 'Text to Speech', 'Convert text to speech', (SELECT id FROM workflow_node_categories WHERE name = 'Voice Configuration'), '{"voices": ["male", "female"], "languages": ["en", "es", "fr"], "ssml_support": true}', true),
('voice_assistant', 'Voice Assistant', 'Complete voice interaction system', (SELECT id FROM workflow_node_categories WHERE name = 'Voice Configuration'), '{"wake_word": "hey_assistant", "conversation_memory": true, "multi_turn": true}', true),
('audio_processing', 'Audio Processing', 'Audio file processing and analysis', (SELECT id FROM workflow_node_categories WHERE name = 'Voice Configuration'), '{"noise_reduction": true, "format_conversion": true, "audio_analysis": true}', true),
('voice_biometrics', 'Voice Biometrics', 'Voice identification and authentication', (SELECT id FROM workflow_node_categories WHERE name = 'Voice Configuration'), '{"enrollment": true, "verification": true, "liveness_detection": true}', true),

-- Channel Deployment (6 nodes)
('web_chat', 'Web Chat Widget', 'Embeddable web chat interface', (SELECT id FROM workflow_node_categories WHERE name = 'Channel Deployment'), '{"customizable_ui": true, "file_upload": true, "typing_indicators": true}', true),
('whatsapp_bot', 'WhatsApp Bot', 'WhatsApp Business API integration', (SELECT id FROM workflow_node_categories WHERE name = 'Channel Deployment'), '{"media_support": true, "templates": true, "webhook_verification": true}', true),
('slack_integration', 'Slack Bot', 'Slack application integration', (SELECT id FROM workflow_node_categories WHERE name = 'Channel Deployment'), '{"slash_commands": true, "interactive_messages": true, "oauth_flow": true}', true),
('teams_integration', 'Microsoft Teams Bot', 'Microsoft Teams bot integration', (SELECT id FROM workflow_node_categories WHERE name = 'Channel Deployment'), '{"adaptive_cards": true, "meeting_integration": true, "sso_support": true}', true),
('telegram_bot', 'Telegram Bot', 'Telegram bot API integration', (SELECT id FROM workflow_node_categories WHERE name = 'Channel Deployment'), '{"inline_keyboards": true, "file_handling": true, "webhook_mode": true}', true),
('discord_bot', 'Discord Bot', 'Discord bot integration', (SELECT id FROM workflow_node_categories WHERE name = 'Channel Deployment'), '{"slash_commands": true, "embeds": true, "voice_support": true}', true),

-- Agent Flows (5 nodes)
('multi_agent_orchestrator', 'Multi-Agent Orchestrator', 'Coordinate multiple AI agents', (SELECT id FROM workflow_node_categories WHERE name = 'Agent Flows'), '{"max_agents": 10, "load_balancing": true, "conflict_resolution": true}', true),
('agent_collaboration', 'Agent Collaboration', 'Enable agent-to-agent communication', (SELECT id FROM workflow_node_categories WHERE name = 'Agent Flows'), '{"protocol": "json_rpc", "message_queue": true, "consensus_algorithm": "raft"}', true),
('task_delegation', 'Task Delegation', 'Intelligent task assignment', (SELECT id FROM workflow_node_categories WHERE name = 'Agent Flows'), '{"skill_matching": true, "workload_balancing": true, "priority_queuing": true}', true),
('consensus_building', 'Consensus Building', 'Multi-agent decision making', (SELECT id FROM workflow_node_categories WHERE name = 'Agent Flows'), '{"voting_mechanism": "weighted", "quorum_threshold": 0.6, "timeout": "30s"}', true),
('agent_monitoring', 'Agent Monitoring', 'Monitor agent performance and health', (SELECT id FROM workflow_node_categories WHERE name = 'Agent Flows'), '{"health_checks": true, "performance_metrics": true, "alerting": true}', true),

-- Human Loop (4 nodes)
('human_review', 'Human Review Gate', 'Require human review for decisions', (SELECT id FROM workflow_node_categories WHERE name = 'Human Loop'), '{"timeout": "24h", "escalation_chain": true, "review_criteria": "configurable"}', true),
('approval_gate', 'Approval Gate', 'Human approval checkpoint', (SELECT id FROM workflow_node_categories WHERE name = 'Human Loop'), '{"approval_levels": 3, "parallel_approval": true, "delegation": true}', true),
('escalation_handler', 'Escalation Handler', 'Automatic escalation management', (SELECT id FROM workflow_node_categories WHERE name = 'Human Loop'), '{"escalation_triggers": ["timeout", "complexity", "error"], "notification_channels": ["email", "slack"]}', true),
('feedback_collector', 'Feedback Collector', 'Collect human feedback on AI outputs', (SELECT id FROM workflow_node_categories WHERE name = 'Human Loop'), '{"rating_scale": "1-5", "comments": true, "anonymous": false}', true),

-- Cache & Memory (5 nodes)
('redis_cache', 'Redis Cache', 'Redis-based caching system', (SELECT id FROM workflow_node_categories WHERE name = 'Cache & Memory'), '{"ttl": "1h", "max_memory": "1GB", "eviction_policy": "allkeys-lru"}', true),
('memory_buffer', 'Memory Buffer', 'In-memory data buffering', (SELECT id FROM workflow_node_categories WHERE name = 'Cache & Memory'), '{"buffer_size": "100MB", "overflow_strategy": "circular", "persistence": false}', true),
('conversation_memory', 'Conversation Memory', 'Persistent conversation context', (SELECT id FROM workflow_node_categories WHERE name = 'Cache & Memory'), '{"max_turns": 50, "context_window": "4000", "summarization": true}', true),
('semantic_cache', 'Semantic Cache', 'Similarity-based caching', (SELECT id FROM workflow_node_categories WHERE name = 'Cache & Memory'), '{"similarity_threshold": 0.9, "embedding_model": "text-embedding-ada-002", "cache_size": "10000"}', true),
('session_store', 'Session Store', 'User session management', (SELECT id FROM workflow_node_categories WHERE name = 'Cache & Memory'), '{"session_timeout": "30m", "storage_backend": "redis", "encryption": true}', true)
) AS v(type_key, display_name, description, category_id, default_config, is_active);

-- Create performance indices
CREATE INDEX IF NOT EXISTS idx_workflow_node_types_category ON workflow_node_types(category_id);
CREATE INDEX IF NOT EXISTS idx_workflow_node_types_key ON workflow_node_types(type_key);
CREATE INDEX IF NOT EXISTS idx_workflow_node_types_active ON workflow_node_types(is_active);