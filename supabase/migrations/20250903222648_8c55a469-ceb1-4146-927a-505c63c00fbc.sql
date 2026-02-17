-- Add missing critical healthcare/business nodes from real sources

-- NPI (National Provider Identifier) Validator
INSERT INTO workflow_builder_nodes (type, category, label, description, configuration, is_active)
VALUES (
  'npi_validator',
  'healthcare_systems',
  'NPI Validator',
  'Validate National Provider Identifier (NPI) numbers using the official NPPES registry. Verify healthcare provider credentials and practice information.',
  '{
    "inputs": [
      {"name": "npi_number", "type": "string", "required": true, "description": "10-digit NPI number to validate"},
      {"name": "verify_active", "type": "boolean", "required": false, "description": "Check if NPI is currently active"}
    ],
    "outputs": {
      "is_valid": "boolean",
      "provider_info": "object",
      "practice_address": "object",
      "specialty": "string",
      "status": "string"
    },
    "api_endpoint": "https://npiregistry.cms.hhs.gov/api/",
    "settings": {
      "cache_duration": 3600,
      "rate_limit": 100
    }
  }',
  true
),

-- FDA Drug Database Integration
(
  'fda_drug_lookup',
  'healthcare_systems', 
  'FDA Drug Database',
  'Access FDA Orange Book and NDC database for drug information, approvals, and generic equivalents. Verify drug codes and get regulatory status.',
  '{
    "inputs": [
      {"name": "ndc_code", "type": "string", "required": false, "description": "National Drug Code"},
      {"name": "drug_name", "type": "string", "required": false, "description": "Brand or generic drug name"},
      {"name": "active_ingredient", "type": "string", "required": false, "description": "Active pharmaceutical ingredient"}
    ],
    "outputs": {
      "drug_info": "object",
      "ndc_codes": "array",
      "approval_date": "string",
      "generic_available": "boolean",
      "regulatory_status": "string"
    },
    "api_endpoint": "https://api.fda.gov/drug/",
    "settings": {
      "api_key_required": true,
      "cache_duration": 86400
    }
  }',
  true
),

-- ICD-10 Code Lookup
(
  'icd10_lookup',
  'healthcare_systems',
  'ICD-10 Code Lookup', 
  'Look up ICD-10-CM diagnosis codes and descriptions. Validate medical coding and get billable status information.',
  '{
    "inputs": [
      {"name": "icd_code", "type": "string", "required": false, "description": "ICD-10 code (e.g., A00.0)"},
      {"name": "description", "type": "string", "required": false, "description": "Search by condition description"},
      {"name": "category", "type": "string", "required": false, "description": "ICD category filter"}
    ],
    "outputs": {
      "code": "string",
      "description": "string",
      "billable": "boolean",
      "valid": "boolean",
      "category": "string",
      "subcategory": "string"
    },
    "api_endpoint": "https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search",
    "settings": {
      "cache_duration": 86400,
      "max_results": 50
    }
  }',
  true
),

-- CMS Data Integration
(
  'cms_provider_lookup',
  'healthcare_systems',
  'CMS Provider Data',
  'Access CMS Provider of Services (POS) data and Medicare provider enrollment information. Verify facility certifications and Medicare participation.',
  '{
    "inputs": [
      {"name": "provider_id", "type": "string", "required": false, "description": "CMS Certification Number (CCN)"},
      {"name": "facility_name", "type": "string", "required": false, "description": "Healthcare facility name"},
      {"name": "state", "type": "string", "required": false, "description": "State abbreviation"},
      {"name": "provider_type", "type": "string", "required": false, "description": "Type of healthcare provider"}
    ],
    "outputs": {
      "provider_info": "object",
      "certification_number": "string", 
      "medicare_certified": "boolean",
      "facility_type": "string",
      "address": "object",
      "phone": "string"
    },
    "api_endpoint": "https://data.cms.gov/provider-data/",
    "settings": {
      "cache_duration": 3600,
      "verify_certification": true
    }
  }',
  true
);