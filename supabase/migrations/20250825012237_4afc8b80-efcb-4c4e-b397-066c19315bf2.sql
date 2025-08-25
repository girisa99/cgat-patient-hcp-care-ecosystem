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
  ('flows', 'Agent Flows', 'Complex multi-agent workflows and orchestration', 'git-branch', '#dc2626', 14);

-- Add unique constraint for category names
ALTER TABLE workflow_node_categories ADD CONSTRAINT unique_category_name UNIQUE (name);