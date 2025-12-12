-- Create Document Processing category
INSERT INTO workflow_node_categories (id, name, display_name, description, icon, color, order_index, is_active)
VALUES 
  (gen_random_uuid(), 'document_processing', 'Document Processing', 'OCR, DocAI, metadata extraction, form recognition, and document analysis nodes', 'file-text', '#059669', 32, true)
ON CONFLICT (name) DO NOTHING;

-- Create Enhanced Agentic AI category
INSERT INTO workflow_node_categories (id, name, display_name, description, icon, color, order_index, is_active)
VALUES 
  (gen_random_uuid(), 'enhanced_agentic', 'Enhanced Agentic AI', 'Advanced reasoning, planning, learning, and orchestration capabilities', 'brain', '#7C3AED', 33, true)
ON CONFLICT (name) DO NOTHING;

-- Insert Document Processing nodes using subquery to get category_id
INSERT INTO workflow_node_types (id, type_key, display_name, description, category_id, icon, color, default_config, is_active, order_index)
SELECT gen_random_uuid(), 'ocr_document', 'OCR Document', 'Extract text from images and scanned documents using optical character recognition', id, 'scan', '#059669', '{"ocrEngine": "tesseract", "language": "en", "outputFormat": "text"}', true, 1 FROM workflow_node_categories WHERE name = 'document_processing'
ON CONFLICT (type_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, is_active = true;

INSERT INTO workflow_node_types (id, type_key, display_name, description, category_id, icon, color, default_config, is_active, order_index)
SELECT gen_random_uuid(), 'doc_ai', 'Document AI', 'Intelligent document analysis using Google Document AI or similar services', id, 'file-search', '#059669', '{"provider": "google", "extractEntities": true, "classifyDocument": true}', true, 2 FROM workflow_node_categories WHERE name = 'document_processing'
ON CONFLICT (type_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, is_active = true;

INSERT INTO workflow_node_types (id, type_key, display_name, description, category_id, icon, color, default_config, is_active, order_index)
SELECT gen_random_uuid(), 'metadata_extraction', 'Metadata Extraction', 'Extract metadata from documents including author, dates, file info', id, 'file-code', '#059669', '{"extractAll": true, "includeHidden": false}', true, 3 FROM workflow_node_categories WHERE name = 'document_processing'
ON CONFLICT (type_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, is_active = true;

INSERT INTO workflow_node_types (id, type_key, display_name, description, category_id, icon, color, default_config, is_active, order_index)
SELECT gen_random_uuid(), 'form_recognition', 'Form Recognition', 'Recognize and extract data from structured forms', id, 'clipboard-list', '#059669', '{"formType": "auto", "validateFields": true}', true, 4 FROM workflow_node_categories WHERE name = 'document_processing'
ON CONFLICT (type_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, is_active = true;

INSERT INTO workflow_node_types (id, type_key, display_name, description, category_id, icon, color, default_config, is_active, order_index)
SELECT gen_random_uuid(), 'image_analysis', 'Image Analysis', 'Analyze images for objects, text, faces, and visual content', id, 'image', '#059669', '{"detectObjects": true, "extractText": true, "analyzeContent": true}', true, 5 FROM workflow_node_categories WHERE name = 'document_processing'
ON CONFLICT (type_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, is_active = true;

INSERT INTO workflow_node_types (id, type_key, display_name, description, category_id, icon, color, default_config, is_active, order_index)
SELECT gen_random_uuid(), 'document_validation', 'Document Validation', 'Validate document authenticity and completeness', id, 'shield-check', '#059669', '{"checkSignatures": true, "validateFormat": true}', true, 6 FROM workflow_node_categories WHERE name = 'document_processing'
ON CONFLICT (type_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, is_active = true;

INSERT INTO workflow_node_types (id, type_key, display_name, description, category_id, icon, color, default_config, is_active, order_index)
SELECT gen_random_uuid(), 'data_extraction', 'Data Extraction', 'Extract structured data from unstructured documents', id, 'database', '#059669', '{"outputFormat": "json", "useAI": true}', true, 7 FROM workflow_node_categories WHERE name = 'document_processing'
ON CONFLICT (type_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, is_active = true;

INSERT INTO workflow_node_types (id, type_key, display_name, description, category_id, icon, color, default_config, is_active, order_index)
SELECT gen_random_uuid(), 'document_comparison', 'Document Comparison', 'Compare two documents for differences and similarities', id, 'git-compare', '#059669', '{"highlightDiffs": true, "semanticComparison": false}', true, 8 FROM workflow_node_categories WHERE name = 'document_processing'
ON CONFLICT (type_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, is_active = true;

INSERT INTO workflow_node_types (id, type_key, display_name, description, category_id, icon, color, default_config, is_active, order_index)
SELECT gen_random_uuid(), 'document_archive', 'Document Archive', 'Archive documents with metadata and versioning', id, 'archive', '#059669', '{"compression": true, "versioning": true}', true, 9 FROM workflow_node_categories WHERE name = 'document_processing'
ON CONFLICT (type_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, is_active = true;

INSERT INTO workflow_node_types (id, type_key, display_name, description, category_id, icon, color, default_config, is_active, order_index)
SELECT gen_random_uuid(), 'document_to_database', 'Document to Database', 'Parse and push document data to database tables', id, 'database', '#059669', '{"autoMapping": true, "validateSchema": true}', true, 10 FROM workflow_node_categories WHERE name = 'document_processing'
ON CONFLICT (type_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, is_active = true;

-- Insert Enhanced Agentic AI nodes using subquery to get category_id
INSERT INTO workflow_node_types (id, type_key, display_name, description, category_id, icon, color, default_config, is_active, order_index)
SELECT gen_random_uuid(), 'plan_execute', 'Plan & Execute', 'Plan-execute-reflect cycle for complex task completion', id, 'map', '#7C3AED', '{"maxIterations": 5, "reflectionEnabled": true}', true, 1 FROM workflow_node_categories WHERE name = 'enhanced_agentic'
ON CONFLICT (type_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, is_active = true;

INSERT INTO workflow_node_types (id, type_key, display_name, description, category_id, icon, color, default_config, is_active, order_index)
SELECT gen_random_uuid(), 'reasoning_chain', 'Reasoning Chain', 'Chain of thought reasoning with step-by-step logic', id, 'link', '#7C3AED', '{"chainDepth": 3, "explainSteps": true}', true, 2 FROM workflow_node_categories WHERE name = 'enhanced_agentic'
ON CONFLICT (type_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, is_active = true;

INSERT INTO workflow_node_types (id, type_key, display_name, description, category_id, icon, color, default_config, is_active, order_index)
SELECT gen_random_uuid(), 'memory_context', 'Memory & Context', 'Manage contextual memory across conversations', id, 'brain', '#7C3AED', '{"memoryType": "episodic", "retentionDays": 30}', true, 3 FROM workflow_node_categories WHERE name = 'enhanced_agentic'
ON CONFLICT (type_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, is_active = true;

INSERT INTO workflow_node_types (id, type_key, display_name, description, category_id, icon, color, default_config, is_active, order_index)
SELECT gen_random_uuid(), 'critique_refinement', 'Critique & Refinement', 'Self-critique and iterative improvement', id, 'edit', '#7C3AED', '{"maxRefinements": 3, "qualityThreshold": 0.8}', true, 4 FROM workflow_node_categories WHERE name = 'enhanced_agentic'
ON CONFLICT (type_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, is_active = true;

INSERT INTO workflow_node_types (id, type_key, display_name, description, category_id, icon, color, default_config, is_active, order_index)
SELECT gen_random_uuid(), 'multi_perspective', 'Multi-Perspective', 'Analyze from multiple viewpoints and personas', id, 'users', '#7C3AED', '{"perspectives": 3, "synthesize": true}', true, 5 FROM workflow_node_categories WHERE name = 'enhanced_agentic'
ON CONFLICT (type_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, is_active = true;

INSERT INTO workflow_node_types (id, type_key, display_name, description, category_id, icon, color, default_config, is_active, order_index)
SELECT gen_random_uuid(), 'knowledge_integration', 'Knowledge Integration', 'Integrate knowledge from multiple sources', id, 'database', '#7C3AED', '{"sources": [], "conflictResolution": "newest"}', true, 6 FROM workflow_node_categories WHERE name = 'enhanced_agentic'
ON CONFLICT (type_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, is_active = true;

INSERT INTO workflow_node_types (id, type_key, display_name, description, category_id, icon, color, default_config, is_active, order_index)
SELECT gen_random_uuid(), 'hypothesis_testing', 'Hypothesis Testing', 'Generate and test hypotheses systematically', id, 'flask', '#7C3AED', '{"generateCount": 3, "testAll": true}', true, 7 FROM workflow_node_categories WHERE name = 'enhanced_agentic'
ON CONFLICT (type_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, is_active = true;

INSERT INTO workflow_node_types (id, type_key, display_name, description, category_id, icon, color, default_config, is_active, order_index)
SELECT gen_random_uuid(), 'skill_composition', 'Skill Composition', 'Compose complex behaviors from simpler skills', id, 'layers', '#7C3AED', '{"skillLibrary": [], "composition": "sequential"}', true, 8 FROM workflow_node_categories WHERE name = 'enhanced_agentic'
ON CONFLICT (type_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, is_active = true;

INSERT INTO workflow_node_types (id, type_key, display_name, description, category_id, icon, color, default_config, is_active, order_index)
SELECT gen_random_uuid(), 'adaptive_learning', 'Adaptive Learning', 'Learn and adapt from execution feedback', id, 'trending-up', '#7C3AED', '{"learningRate": 0.1, "feedbackLoop": true}', true, 9 FROM workflow_node_categories WHERE name = 'enhanced_agentic'
ON CONFLICT (type_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, is_active = true;

INSERT INTO workflow_node_types (id, type_key, display_name, description, category_id, icon, color, default_config, is_active, order_index)
SELECT gen_random_uuid(), 'workflow_orchestrator', 'Workflow Orchestrator', 'Orchestrate complex multi-step workflows', id, 'git-branch', '#7C3AED', '{"parallelExecution": true, "errorRecovery": true}', true, 10 FROM workflow_node_categories WHERE name = 'enhanced_agentic'
ON CONFLICT (type_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, is_active = true;