-- Simple seed data for existing Genie implementations (without deployment options for now)

-- Insert Patient Onboarding Conversational AI Genie
INSERT INTO public.genie_brand_configs (
  brand_name,
  business_name,
  product_name,
  business_unit,
  contact_person,
  contact_email,
  domain_name,
  deployment_status,
  subscription_type,
  deployment_config,
  system_prompt,
  welcome_message,
  is_active,
  daily_limit,
  hourly_limit
) VALUES (
  'Patient Onboarding AI Agent',
  'Healthcare Platform',
  'Conversational Enrollment Assistant',
  'Patient Services',
  'Onboarding Team',
  'onboarding@healthcare.com',
  'internal',
  'deployed',
  'enterprise',
  '{"type": "internal", "route": "/patient-onboarding", "methods": ["mcp", "conversational", "structured"]}'::jsonb,
  'You are a helpful AI assistant guiding patients through the enrollment process.',
  'Welcome! I am here to help you complete your patient enrollment. Let us get started!',
  true,
  1000,
  100
);

-- Insert Healthcare Provider Genie Popup
INSERT INTO public.genie_brand_configs (
  brand_name,
  business_name,
  product_name,
  business_unit,
  contact_person,
  contact_email,
  domain_name,
  deployment_status,
  subscription_type,
  deployment_config,
  system_prompt,
  welcome_message,
  is_active,
  daily_limit,
  hourly_limit
) VALUES (
  'Healthcare Provider Genie',
  'Healthcare Platform',
  'Provider Portal Assistant',
  'Provider Services',
  'Provider Support Team',
  'providers@healthcare.com',
  'internal',
  'deployed',
  'enterprise',
  '{"type": "embedded", "component": "EnrollmentGenie", "position": "bottom-right", "roles": ["healthcareProvider", "onboardingTeam", "superAdmin"]}'::jsonb,
  'You are an AI assistant helping healthcare providers with patient enrollment.',
  'Hello! I can help you with patient enrollment. How can I assist you today?',
  true,
  2000,
  200
);