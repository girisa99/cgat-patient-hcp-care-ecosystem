-- Insert Public Genie AI Experimentation Hub configuration
INSERT INTO genie_brand_configs (
  brand_name,
  business_name,
  product_name,
  business_unit,
  contact_person,
  contact_email,
  domain_name,
  deployment_status,
  subscription_type,
  is_active,
  daily_limit,
  hourly_limit,
  deployment_config
) VALUES (
  'Public Genie AI Experimentation Hub',
  'Genie AI Research & Development',
  'Public Genie Interface',
  'Public Research',
  'System Administrator',
  'admin@genieaiexperimentationhub.tech',
  'genieaiexperimentationhub.tech',
  'deployed',
  'production',
  true,
  5000,
  500,
  jsonb_build_object(
    'type', 'public',
    'features', jsonb_build_array(
      'multi_modal_ai',
      'split_screen_comparison',
      'context_aware_suggestions',
      'rag_enabled',
      'knowledge_base_80_plus',
      'mcp_tools',
      'privacy_first',
      'rate_limiting',
      'session_management',
      'transcript_emails',
      'human_escalation'
    ),
    'ai_models', jsonb_build_array('gpt-4', 'claude-3', 'gemini'),
    'components', jsonb_build_object(
      'frontend', 'src/components/public-genie/PublicGenieInterface.tsx',
      'floating_assistant', 'src/components/FloatingGenie.tsx',
      'admin_dashboard', 'src/components/admin/GenieConversationDashboard.tsx'
    ),
    'edge_functions', jsonb_build_array(
      'ai-universal-processor',
      'conversation-rate-limiter'
    ),
    'database_tables', jsonb_build_array(
      'genie_conversations',
      'genie_rate_limits'
    ),
    'routes', jsonb_build_object(
      'main_site', jsonb_build_array('/', '/about', '/journey', '/technology'),
      'admin', '/admin',
      'floating_genie', 'all_pages'
    ),
    'knowledge_contexts', 80,
    'deployment_date', now()::text
  )
);