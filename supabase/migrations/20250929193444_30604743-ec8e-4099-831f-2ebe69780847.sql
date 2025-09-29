-- Insert domain verification records for the seeded Genie instances
-- First check if they already exist and delete them to avoid duplicates
DELETE FROM genie_domain_verifications 
WHERE brand_config_id IN (
  'c7e78796-8c1a-4f25-98ba-2f5e963d35db',
  '4875b728-8f0a-42ba-8d6c-c71c529db141',
  '946f878e-7fd4-4fd4-929e-e02be87eb861'
);

-- Insert fresh domain verification records
INSERT INTO genie_domain_verifications (
  brand_config_id,
  domain_name,
  verification_status,
  verification_method,
  verification_token,
  verified_at,
  business_justification,
  approval_status
)
VALUES
  -- Public Genie AI Experimentation Hub
  (
    'c7e78796-8c1a-4f25-98ba-2f5e963d35db',
    'genieaiexperimentationhub.tech',
    'verified',
    'dns',
    'genie-verified-' || substr(md5(random()::text), 1, 16),
    NOW(),
    'Public experimentation and research hub for GENIE AI technology',
    'approved'
  ),
  -- Patient Onboarding AI Agent (internal domain)
  (
    '4875b728-8f0a-42ba-8d6c-c71c529db141',
    'internal',
    'verified',
    'internal',
    'internal-verified-onboarding',
    NOW(),
    'Internal healthcare patient onboarding AI agent for authorized personnel',
    'approved'
  ),
  -- Healthcare Provider Genie (internal domain)
  (
    '946f878e-7fd4-4fd4-929e-e02be87eb861',
    'internal',
    'verified',
    'internal',
    'internal-verified-provider',
    NOW(),
    'Internal healthcare provider portal AI assistant for authorized personnel',
    'approved'
  );