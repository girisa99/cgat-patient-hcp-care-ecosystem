-- Add missing role API access configurations for all healthcare roles

-- Insert API access configurations for missing roles
INSERT INTO public.role_api_access (role, api_service_id, access_level, endpoints_allowed, sandbox_access, production_access, agent_integration_enabled, postman_collection_access, testing_permissions) VALUES

-- Healthcare Provider (main clinical role)
('healthcareProvider', 'internal_api_suite', 'write', ARRAY['/api/v1/patients/*', '/api/v1/treatments/*', '/api/v1/assessments/*', '/api/v1/clinical/*'], true, true, true, true, ARRAY['clinical_testing', 'patient_data_testing']),
('healthcareProvider', 'external_clinical_apis', 'write', ARRAY['/api/v1/clinical-integrations/*', '/api/v1/ehr/*'], true, false, true, true, ARRAY['integration_testing']),

-- Nurse (patient care and documentation)
('nurse', 'internal_api_suite', 'write', ARRAY['/api/v1/patients/*', '/api/v1/care-plans/*', '/api/v1/documentation/*'], true, false, true, true, ARRAY['nursing_documentation_testing']),
('nurse', 'external_clinical_apis', 'read', ARRAY['/api/v1/patient-monitoring/*'], true, false, true, false, ARRAY['monitoring_testing']),

-- Case Manager (coordination and workflow)
('caseManager', 'internal_api_suite', 'write', ARRAY['/api/v1/cases/*', '/api/v1/workflows/*', '/api/v1/coordination/*'], true, false, true, true, ARRAY['case_management_testing']),
('caseManager', 'external_workflow_apis', 'write', ARRAY['/api/v1/external-referrals/*', '/api/v1/care-coordination/*'], true, false, true, true, ARRAY['coordination_testing']),

-- Finance Team (billing and financial operations)
('financeTeam', 'internal_api_suite', 'read', ARRAY['/api/v1/billing/*', '/api/v1/financial/*', '/api/v1/insurance/*'], true, true, true, true, ARRAY['financial_testing', 'billing_testing']),
('financeTeam', 'external_billing_apis', 'write', ARRAY['/api/v1/insurance-verification/*', '/api/v1/claims/*'], true, true, true, true, ARRAY['claims_testing']),

-- Contract Team (agreements and legal)
('contractTeam', 'internal_api_suite', 'read', ARRAY['/api/v1/contracts/*', '/api/v1/legal/*', '/api/v1/compliance/*'], true, false, false, true, ARRAY['contract_testing']),
('contractTeam', 'external_legal_apis', 'read', ARRAY['/api/v1/contract-management/*'], true, false, false, false, ARRAY['legal_testing']),

-- Workflow Manager (process optimization)
('workflowManager', 'internal_api_suite', 'admin', ARRAY['/api/v1/workflows/*', '/api/v1/processes/*', '/api/v1/optimization/*'], true, true, true, true, ARRAY['workflow_testing', 'process_testing']),
('workflowManager', 'external_workflow_apis', 'admin', ARRAY['/api/v1/workflow-integrations/*'], true, false, true, true, ARRAY['integration_testing'])

ON CONFLICT (role, api_service_id) DO UPDATE SET
  access_level = EXCLUDED.access_level,
  endpoints_allowed = EXCLUDED.endpoints_allowed,
  sandbox_access = EXCLUDED.sandbox_access,
  production_access = EXCLUDED.production_access,
  agent_integration_enabled = EXCLUDED.agent_integration_enabled,
  postman_collection_access = EXCLUDED.postman_collection_access,
  testing_permissions = EXCLUDED.testing_permissions,
  updated_at = now();

-- Add field mappings with role-specific visibility for healthcare roles
INSERT INTO public.api_field_mappings (table_name, api_field, database_column, data_type, is_required, role_visibility, transformation_rule) VALUES

-- Healthcare Provider specific mappings
('treatment_assessments', 'clinical_notes', 'clinical_notes', 'text', false, ARRAY['superAdmin', 'healthcareProvider', 'nurse']::user_role[], NULL),
('treatment_assessments', 'diagnosis_codes', 'diagnosis_codes', 'text[]', false, ARRAY['superAdmin', 'healthcareProvider']::user_role[], 'array_to_comma_separated'),
('treatment_assessments', 'treatment_plan', 'treatment_plan', 'text', false, ARRAY['superAdmin', 'healthcareProvider', 'caseManager']::user_role[], NULL),

-- Finance Team specific mappings
('insurance_coverages', 'deductible_amount', 'deductible_amount', 'numeric', false, ARRAY['superAdmin', 'financeTeam', 'onboardingTeam']::user_role[], 'currency_format'),
('insurance_coverages', 'copay_amount', 'copay_amount', 'numeric', false, ARRAY['superAdmin', 'financeTeam', 'onboardingTeam']::user_role[], 'currency_format'),
('insurance_coverages', 'max_benefit', 'max_benefit', 'numeric', false, ARRAY['superAdmin', 'financeTeam']::user_role[], 'currency_format'),

-- Case Manager specific mappings
('enrollment_instances', 'care_coordinator', 'care_coordinator', 'text', false, ARRAY['superAdmin', 'caseManager', 'healthcareProvider']::user_role[], NULL),
('enrollment_instances', 'referral_source', 'referral_source', 'text', false, ARRAY['superAdmin', 'caseManager', 'onboardingTeam']::user_role[], NULL),

-- Contract Team specific mappings
('treatment_center_onboarding', 'license_expiry', 'license_expiry', 'date', false, ARRAY['superAdmin', 'contractTeam', 'onboardingTeam']::user_role[], 'date_format'),
('treatment_center_onboarding', 'accreditation_status', 'accreditation_status', 'text', false, ARRAY['superAdmin', 'contractTeam', 'onboardingTeam']::user_role[], NULL),

-- Workflow Manager mappings (process optimization data)
('enrollment_instances', 'workflow_stage', 'workflow_stage', 'text', false, ARRAY['superAdmin', 'workflowManager', 'caseManager']::user_role[], NULL),
('treatment_assessments', 'completion_time', 'completion_time', 'interval', false, ARRAY['superAdmin', 'workflowManager']::user_role[], 'duration_format')

ON CONFLICT (table_name, api_field, database_column) DO UPDATE SET
  role_visibility = EXCLUDED.role_visibility,
  transformation_rule = EXCLUDED.transformation_rule,
  updated_at = now();