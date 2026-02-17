-- Step 1: Seed existing MCP agents into the agents table
INSERT INTO agents (id, name, description, agent_type, status, use_case, purpose, configuration)
VALUES 
  ('a1b2c3d4-1111-4444-aaaa-111111111111', 'NPI Verification Agent', 'Smart MCP Stepwise Agent for NPI verification and provider credentialing', 'mcp-stepwise', 'active', 'npi_verification', 'Verify healthcare provider NPI numbers and credentials', '{"type": "SmartMCPStepwiseAgent", "module": "npi", "features": ["npi_lookup", "credentialing", "license_verification"]}'::jsonb),
  ('a1b2c3d4-2222-4444-aaaa-222222222222', 'Patient Enrollment Agent', 'Smart MCP Stepwise Agent for patient enrollment workflow', 'mcp-stepwise', 'active', 'patient_intake', 'Guide patients through enrollment process', '{"type": "SmartMCPStepwiseAgent", "module": "patient", "features": ["demographics", "insurance", "consent", "medical_history"]}'::jsonb),
  ('a1b2c3d4-3333-4444-aaaa-333333333333', 'Conversational Enrollment Agent', 'Enhanced floating conversational agent for natural enrollment interactions', 'conversational', 'active', 'patient_intake', 'Natural conversation-based enrollment', '{"type": "EnhancedFloatingConversationalAgent", "features": ["free_form_chat", "context_aware", "multi_turn"]}'::jsonb),
  ('a1b2c3d4-4444-4444-aaaa-444444444444', 'Structured Enrollment Agent', 'Enhanced structured enrollment agent with form integration', 'structured', 'active', 'patient_intake', 'Structured form-based enrollment with AI assistance', '{"type": "EnhancedStructuredEnrollmentAgent", "features": ["form_sync", "validation", "auto_complete"]}'::jsonb),
  ('a1b2c3d4-5555-4444-aaaa-555555555555', 'Treatment Center Onboarding Agent', 'MCP agent for treatment center onboarding workflow', 'mcp-stepwise', 'active', 'treatment_center_onboarding', 'Onboard treatment centers to the network', '{"type": "SmartMCPStepwiseAgent", "module": "treatment_center", "features": ["facility_info", "license_verification", "credentialing"]}'::jsonb),
  ('a1b2c3d4-6666-4444-aaaa-666666666666', 'Manufacturing Onboarding Agent', 'MCP agent for manufacturing partner onboarding', 'mcp-stepwise', 'active', 'manufacturing_onboarding', 'Onboard manufacturing partners', '{"type": "SmartMCPStepwiseAgent", "module": "manufacturer", "features": ["compliance", "quality_certification", "supply_chain"]}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  agent_type = EXCLUDED.agent_type,
  status = EXCLUDED.status,
  configuration = EXCLUDED.configuration;

-- Step 2: Seed conversation engines with valid engine_type values (llm, sml, mcp, hybrid)
INSERT INTO conversation_engines (id, name, engine_type, provider, model_identifier, is_active, configuration)
VALUES
  ('e1e2e3e4-1111-4444-eeee-111111111111', 'NPI Registry Engine', 'mcp', 'universal_ai', 'gemini-2.5-flash', true, '{"prompt_template": "npi_verification", "tools": ["npi_lookup", "license_check"]}'::jsonb),
  ('e1e2e3e4-2222-4444-eeee-222222222222', 'Credentialing Engine', 'mcp', 'universal_ai', 'gemini-2.5-flash', true, '{"prompt_template": "credentialing", "tools": ["credential_verify", "background_check"]}'::jsonb),
  ('e1e2e3e4-3333-4444-eeee-333333333333', 'Enrollment Conversation Engine', 'hybrid', 'universal_ai', 'gemini-2.5-flash', true, '{"prompt_template": "enrollment_guidance", "tools": ["form_assist", "validation"]}'::jsonb),
  ('e1e2e3e4-4444-4444-eeee-444444444444', 'Order Status Engine', 'llm', 'universal_ai', 'gemini-2.5-flash', true, '{"prompt_template": "order_tracking", "tools": ["order_lookup", "shipping_status"]}'::jsonb),
  ('e1e2e3e4-5555-4444-eeee-555555555555', 'Treatment Center Onboarding Engine', 'hybrid', 'universal_ai', 'gemini-2.5-flash', true, '{"prompt_template": "facility_onboarding", "tools": ["facility_verify", "contract_generate"]}'::jsonb),
  ('e1e2e3e4-6666-4444-eeee-666666666666', 'Manufacturing Onboarding Engine', 'hybrid', 'universal_ai', 'gemini-2.5-flash', true, '{"prompt_template": "manufacturer_onboarding", "tools": ["compliance_check", "quality_certification"]}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  engine_type = EXCLUDED.engine_type,
  is_active = EXCLUDED.is_active,
  configuration = EXCLUDED.configuration;

-- Step 3: Link agents to conversation engines
INSERT INTO agent_conversation_engines (id, agent_id, conversation_engine_id, role, is_active, priority)
VALUES
  (gen_random_uuid(), 'a1b2c3d4-1111-4444-aaaa-111111111111', 'e1e2e3e4-1111-4444-eeee-111111111111', 'primary', true, 1),
  (gen_random_uuid(), 'a1b2c3d4-1111-4444-aaaa-111111111111', 'e1e2e3e4-2222-4444-eeee-222222222222', 'specialized', true, 2),
  (gen_random_uuid(), 'a1b2c3d4-2222-4444-aaaa-222222222222', 'e1e2e3e4-3333-4444-eeee-333333333333', 'primary', true, 1),
  (gen_random_uuid(), 'a1b2c3d4-3333-4444-aaaa-333333333333', 'e1e2e3e4-3333-4444-eeee-333333333333', 'primary', true, 1),
  (gen_random_uuid(), 'a1b2c3d4-4444-4444-aaaa-444444444444', 'e1e2e3e4-3333-4444-eeee-333333333333', 'primary', true, 1),
  (gen_random_uuid(), 'a1b2c3d4-5555-4444-aaaa-555555555555', 'e1e2e3e4-5555-4444-eeee-555555555555', 'primary', true, 1),
  (gen_random_uuid(), 'a1b2c3d4-6666-4444-aaaa-666666666666', 'e1e2e3e4-6666-4444-eeee-666666666666', 'primary', true, 1)
ON CONFLICT DO NOTHING;