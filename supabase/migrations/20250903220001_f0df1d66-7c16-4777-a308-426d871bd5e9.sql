-- Add Business Tools category and normalize node keys for proper configuration display

-- Insert Business Tools category if it doesn't exist
INSERT INTO workflow_node_categories (name, display_name, description, icon, color)
VALUES (
  'business-tools',
  'Business Tools',
  'Healthcare business validation and compliance tools',
  'shield-check',
  '#10b981'
) ON CONFLICT (name) DO NOTHING;

-- Get the Business Tools category ID
DO $$
DECLARE
    business_tools_cat_id UUID;
BEGIN
    SELECT id INTO business_tools_cat_id FROM workflow_node_categories WHERE name = 'business-tools';
    
    -- Add/update business tools nodes with normalized keys
    INSERT INTO workflow_node_types (
        type_key, display_name, description, category_id, icon, 
        input_schema, output_schema, configuration_schema, created_by
    ) VALUES
    -- NPI Validator (primary key)
    ('npi_validator', 'NPI Validator', 'Validate National Provider Identifiers', business_tools_cat_id, 'user-check',
     '{"npi_number": {"type": "string", "required": true, "description": "10-digit NPI number"}}',
     '{"is_valid": {"type": "boolean"}, "provider_info": {"type": "object"}}',
     '{"api_key": {"type": "string", "required": true}, "timeout": {"type": "number", "default": 10000}}',
     (SELECT auth.uid())
    ),
    -- ICD Codes Lookup (primary key)
    ('icd_codes_lookup', 'ICD Codes Lookup', 'Lookup ICD-10/11 diagnostic codes', business_tools_cat_id, 'file-text',
     '{"code_or_description": {"type": "string", "required": true}, "icd_version": {"type": "string", "default": "ICD-10"}}',
     '{"matches": {"type": "array"}, "code_info": {"type": "object"}}',
     '{"icd_version": {"type": "string", "default": "ICD-10"}, "max_results": {"type": "number", "default": 10}}',
     (SELECT auth.uid())
    ),
    -- CMS Data Integration
    ('cms_data_integration', 'CMS Data Integration', 'Integrate with Centers for Medicare & Medicaid Services data', business_tools_cat_id, 'building',
     '{"provider_id": {"type": "string"}, "query_type": {"type": "string"}}',
     '{"cms_data": {"type": "object"}, "provider_details": {"type": "object"}}',
     '{"cms_api_key": {"type": "string", "required": true}, "environment": {"type": "string", "default": "production"}}',
     (SELECT auth.uid())
    ),
    -- FDA Integration
    ('fda_integration', 'FDA Integration', 'Access FDA drug and device databases', business_tools_cat_id, 'shield',
     '{"search_term": {"type": "string"}, "database": {"type": "string", "default": "drug"}}',
     '{"fda_results": {"type": "array"}, "total_count": {"type": "number"}}',
     '{"api_key": {"type": "string"}, "rate_limit": {"type": "number", "default": 1000}}',
     (SELECT auth.uid())
    )
    ON CONFLICT (type_key) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        description = EXCLUDED.description,
        category_id = EXCLUDED.category_id,
        input_schema = EXCLUDED.input_schema,
        output_schema = EXCLUDED.output_schema,
        configuration_schema = EXCLUDED.configuration_schema,
        updated_at = now();

    -- Add aliases for backward compatibility
    INSERT INTO workflow_node_types (
        type_key, display_name, description, category_id, icon, 
        input_schema, output_schema, configuration_schema, created_by
    ) VALUES
    -- Aliases that point to the same configurations
    ('npi_validation', 'NPI Validation (Alias)', 'Alias for NPI Validator', business_tools_cat_id, 'user-check',
     '{"npi_number": {"type": "string", "required": true}}',
     '{"is_valid": {"type": "boolean"}}',
     '{"api_key": {"type": "string", "required": true}}',
     (SELECT auth.uid())
    ),
    ('icd_10_codes', 'ICD-10 Codes (Alias)', 'Alias for ICD Codes Lookup', business_tools_cat_id, 'file-text',
     '{"code_or_description": {"type": "string", "required": true}}',
     '{"matches": {"type": "array"}}',
     '{"icd_version": {"type": "string", "default": "ICD-10"}}',
     (SELECT auth.uid())
    ),
    ('hipaa_compliance_checker', 'HIPAA Compliance Checker', 'Check HIPAA compliance for healthcare data', business_tools_cat_id, 'shield-check',
     '{"data_fields": {"type": "array"}, "operation_type": {"type": "string"}}',
     '{"compliance_status": {"type": "boolean"}, "violations": {"type": "array"}}',
     '{"strict_mode": {"type": "boolean", "default": true}}',
     (SELECT auth.uid())
    )
    ON CONFLICT (type_key) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        description = EXCLUDED.description,
        category_id = EXCLUDED.category_id,
        updated_at = now();
END $$;