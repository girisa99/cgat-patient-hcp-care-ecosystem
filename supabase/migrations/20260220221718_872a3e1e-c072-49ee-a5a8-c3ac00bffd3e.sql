ALTER TABLE product_knowledge_registry
  ADD COLUMN IF NOT EXISTS website_url text,
  ADD COLUMN IF NOT EXISTS knowledge_docs jsonb DEFAULT '[]';