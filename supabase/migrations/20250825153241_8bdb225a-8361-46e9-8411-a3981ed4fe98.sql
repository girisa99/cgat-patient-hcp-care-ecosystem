-- Create Healthcare & Compliance category for business layer tools
INSERT INTO workflow_node_categories (
  id, name, display_name, description, icon, color, order_index, is_active
) VALUES (
  gen_random_uuid(),
  'healthcare_compliance',
  'Healthcare & Compliance',
  'Healthcare data validation, compliance checking, and clinical information systems',
  'shield',
  '#dc2626',
  100,
  true
) ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color;

-- Get the category ID for healthcare compliance
DO $$
DECLARE
  healthcare_category_id UUID;
BEGIN
  SELECT id INTO healthcare_category_id
  FROM workflow_node_categories
  WHERE name = 'healthcare_compliance';

  -- NPI Validation Node
  INSERT INTO workflow_node_types (
    id, category_id, type_key, display_name, description, detailed_explanation,
    icon, color, is_draggable, is_configurable, 
    default_config, input_schema, output_schema, capabilities, requirements,
    order_index, is_active
  ) VALUES (
    gen_random_uuid(),
    healthcare_category_id,
    'npi_validator',
    'NPI Validator',
    'Validate National Provider Identifier (NPI) numbers',
    'NPI Validator verifies healthcare provider identities using the National Plan and Provider Enumeration System (NPPES). It validates NPI format, checks active status, retrieves provider information, and ensures compliance with CMS requirements.',
    'user-check',
    '#dc2626',
    true,
    true,
    '{"validation_mode": "full", "include_taxonomy": true, "cache_results": true}',
    '{"npi_number": {"type": "string", "pattern": "^[0-9]{10}$", "required": true}}',
    '{"is_valid": {"type": "boolean"}, "provider_info": {"type": "object"}, "taxonomy": {"type": "array"}}',
    ARRAY['npi_validation', 'provider_lookup', 'taxonomy_codes', 'nppes_integration'],
    '{"api_access": true, "npi_format": "10_digits"}',
    1,
    true
  );

  -- CMS Data Integration Node
  INSERT INTO workflow_node_types (
    id, category_id, type_key, display_name, description, detailed_explanation,
    icon, color, is_draggable, is_configurable,
    default_config, input_schema, output_schema, capabilities, requirements,
    order_index, is_active
  ) VALUES (
    gen_random_uuid(),
    healthcare_category_id,
    'cms_data_integration',
    'CMS Data Integration',
    'Access CMS datasets and Medicare/Medicaid information',
    'CMS Data Integration connects to Centers for Medicare & Medicaid Services APIs and datasets. It provides access to provider databases, payment information, quality measures, and compliance data for healthcare analytics and reporting.',
    'database',
    '#dc2626',
    true,
    true,
    '{"dataset_type": "provider", "include_quality_measures": true, "rate_limit": 1000}',
    '{"query_params": {"type": "object"}, "dataset": {"type": "string", "required": true}}',
    '{"data": {"type": "array"}, "metadata": {"type": "object"}, "compliance_status": {"type": "string"}}',
    ARRAY['cms_api', 'medicare_data', 'medicaid_data', 'quality_measures', 'provider_data'],
    '{"cms_api_key": true, "dataset_access": "approved"}',
    2,
    true
  );

  -- FDA.org Integration Node
  INSERT INTO workflow_node_types (
    id, category_id, type_key, display_name, description, detailed_explanation,
    icon, color, is_draggable, is_configurable,
    default_config, input_schema, output_schema, capabilities, requirements,
    order_index, is_active
  ) VALUES (
    gen_random_uuid(),
    healthcare_category_id,
    'fda_integration',
    'FDA Integration',
    'Access FDA databases for drug information, device approvals, and safety data',
    'FDA Integration provides access to Food and Drug Administration databases including drug approvals, medical device clearances, adverse event reporting, and safety communications. Essential for pharmaceutical and medical device compliance.',
    'pill',
    '#dc2626',
    true,
    true,
    '{"database": "orange_book", "include_safety_data": true, "auto_update": false}',
    '{"search_criteria": {"type": "object"}, "database_type": {"type": "string", "required": true}}',
    '{"results": {"type": "array"}, "safety_alerts": {"type": "array"}, "approval_status": {"type": "string"}}',
    ARRAY['drug_database', 'device_clearance', 'adverse_events', 'safety_communications', 'orange_book'],
    '{"fda_api_access": true, "database_subscription": "required"}',
    3,
    true
  );

  -- ICD Codes Lookup Node
  INSERT INTO workflow_node_types (
    id, category_id, type_key, display_name, description, detailed_explanation,
    icon, color, is_draggable, is_configurable,
    default_config, input_schema, output_schema, capabilities, requirements,
    order_index, is_active
  ) VALUES (
    gen_random_uuid(),
    healthcare_category_id,
    'icd_codes_lookup',
    'ICD Codes Lookup',
    'International Classification of Diseases (ICD) code validation and lookup',
    'ICD Codes Lookup provides comprehensive access to ICD-10 and ICD-11 diagnosis and procedure codes. It validates codes, provides descriptions, maps between versions, and ensures clinical coding accuracy for billing and medical records.',
    'stethoscope',
    '#dc2626',
    true,
    true,
    '{"icd_version": "10", "include_descriptions": true, "validate_format": true}',
    '{"code": {"type": "string", "required": true}, "version": {"type": "string"}}',
    '{"is_valid": {"type": "boolean"}, "description": {"type": "string"}, "category": {"type": "string"}, "billable": {"type": "boolean"}}',
    ARRAY['icd10_lookup', 'icd11_support', 'code_validation', 'clinical_coding', 'billing_codes'],
    '{"icd_database": true, "version_support": "10_and_11"}',
    4,
    true
  );

  -- HIPAA Compliance Checker Node
  INSERT INTO workflow_node_types (
    id, category_id, type_key, display_name, description, detailed_explanation,
    icon, color, is_draggable, is_configurable,
    default_config, input_schema, output_schema, capabilities, requirements,
    order_index, is_active
  ) VALUES (
    gen_random_uuid(),
    healthcare_category_id,
    'hipaa_compliance_checker',
    'HIPAA Compliance Checker',
    'Validate data handling for HIPAA compliance requirements',
    'HIPAA Compliance Checker ensures Protected Health Information (PHI) is handled according to HIPAA regulations. It scans data flows, validates encryption, checks access controls, and generates compliance reports.',
    'shield-check',
    '#dc2626',
    true,
    true,
    '{"scan_depth": "full", "generate_report": true, "alert_violations": true}',
    '{"data_flow": {"type": "object"}, "phi_elements": {"type": "array"}}',
    '{"compliance_score": {"type": "number"}, "violations": {"type": "array"}, "recommendations": {"type": "array"}}',
    ARRAY['hipaa_validation', 'phi_protection', 'access_control', 'encryption_check', 'audit_trail'],
    '{"compliance_framework": "hipaa", "security_level": "high"}',
    5,
    true
  );

  -- Clinical Decision Support Node
  INSERT INTO workflow_node_types (
    id, category_id, type_key, display_name, description, detailed_explanation,
    icon, color, is_draggable, is_configurable,
    default_config, input_schema, output_schema, capabilities, requirements,
    order_index, is_active
  ) VALUES (
    gen_random_uuid(),
    healthcare_category_id,
    'clinical_decision_support',
    'Clinical Decision Support',
    'Evidence-based clinical decision support and recommendations',
    'Clinical Decision Support provides evidence-based recommendations, drug interaction checks, clinical guidelines, and diagnostic assistance. It integrates with medical knowledge bases to support healthcare decision-making.',
    'brain',
    '#dc2626',
    true,
    true,
    '{"knowledge_base": "UpToDate", "interaction_check": true, "guideline_version": "latest"}',
    '{"patient_data": {"type": "object"}, "clinical_context": {"type": "string"}}',
    '{"recommendations": {"type": "array"}, "risk_factors": {"type": "array"}, "interactions": {"type": "array"}}',
    ARRAY['clinical_guidelines', 'drug_interactions', 'diagnostic_support', 'evidence_based', 'medical_knowledge'],
    '{"medical_knowledge_base": true, "clinical_expertise": "required"}',
    6,
    true
  );

END $$;