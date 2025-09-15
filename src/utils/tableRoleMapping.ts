/**
 * TABLE ROLE MAPPING - Healthcare Provider Application
 * Comprehensive mapping of database tables by role and onboarding process
 */

export interface TableAccessConfig {
  tableName: string;
  primaryKey: string;
  description: string;
  fields: string[];
  permissions: ('read' | 'write' | 'update' | 'delete')[];
}

export interface RoleTableMapping {
  roleName: string;
  tables: TableAccessConfig[];
  workflows: string[];
}

// ============= PATIENT ONBOARDING TABLES =============
// Based on actual database schema from Supabase
export const PATIENT_ONBOARDING_TABLES: TableAccessConfig[] = [
  {
    tableName: 'enrollment_patient_info',
    primaryKey: 'id',
    description: 'Core patient demographic and contact information',
    fields: [
      'id', 'user_id', 'first_name', 'last_name', 'email', 'phone', 
      'date_of_birth', 'ssn_hash', 'address', 'emergency_contact',
      'preferred_language', 'gender', 'created_at', 'updated_at'
    ],
    permissions: ['read', 'write', 'update']
  },
  {
    tableName: 'enrollment_clinical_info',
    primaryKey: 'id',
    description: 'Clinical data including medical history and current medications',
    fields: [
      'id', 'patient_id', 'medical_history', 'current_medications', 
      'allergies', 'vital_signs', 'primary_diagnosis', 'secondary_diagnosis',
      'treatment_history', 'physician_notes', 'created_at', 'updated_at'
    ],
    permissions: ['read', 'write', 'update']
  },
  {
    tableName: 'enrollment_insurance_info',
    primaryKey: 'id',
    description: 'Insurance coverage and billing information',
    fields: [
      'id', 'patient_id', 'primary_insurance_name', 'policy_number', 
      'group_number', 'subscriber_name', 'subscriber_id', 'relationship_to_patient',
      'secondary_insurance', 'copay_amount', 'deductible', 'created_at', 'updated_at'
    ],
    permissions: ['read', 'write', 'update']
  },
  {
    tableName: 'enrollment_consent',
    primaryKey: 'id',
    description: 'Patient consent forms and HIPAA authorizations',
    fields: [
      'id', 'patient_id', 'consent_type', 'signed_date', 'consent_status',
      'digital_signature', 'witness_signature', 'consent_document_url',
      'hipaa_authorization', 'treatment_consent', 'created_at', 'updated_at'
    ],
    permissions: ['read', 'write']
  },
  {
    tableName: 'enrollment_documents',
    primaryKey: 'id',
    description: 'Document management for enrollment process',
    fields: [
      'id', 'patient_id', 'document_type', 'file_path', 'file_name',
      'upload_date', 'verification_status', 'document_category',
      'storage_location', 'access_permissions', 'created_at', 'updated_at'
    ],
    permissions: ['read', 'write', 'update']
  },
  {
    tableName: 'patient_enrollments',
    primaryKey: 'id',
    description: 'Patient enrollment tracking and status management',
    fields: [
      'id', 'patient_id', 'enrollment_date', 'status', 'program_type',
      'assigned_provider', 'treatment_plan_id', 'enrollment_source',
      'completion_percentage', 'next_steps', 'created_at', 'updated_at'
    ],
    permissions: ['read', 'write', 'update']
  },
  {
    tableName: 'enrollment_treatment_plan',
    primaryKey: 'id',
    description: 'Treatment plans and care coordination',
    fields: [
      'id', 'patient_id', 'provider_id', 'treatment_type', 'start_date',
      'duration', 'care_team', 'treatment_goals', 'interventions',
      'monitoring_schedule', 'medication_protocol', 'created_at', 'updated_at'
    ],
    permissions: ['read', 'write', 'update']
  },
  {
    tableName: 'enrollment_collaborations',
    primaryKey: 'id',
    description: 'Care team collaboration and communication',
    fields: [
      'id', 'enrollment_id', 'collaborator_type', 'collaborator_id',
      'role', 'permissions', 'communication_preferences', 'created_at', 'updated_at'
    ],
    permissions: ['read', 'write', 'update']
  },
  {
    tableName: 'enrollment_instances',
    primaryKey: 'id',
    description: 'Enrollment session instances and workflow tracking',
    fields: [
      'id', 'template_id', 'session_id', 'status', 'completion_data',
      'workflow_state', 'user_responses', 'created_at', 'updated_at'
    ],
    permissions: ['read', 'write', 'update']
  },
  {
    tableName: 'treatment_assessments',
    primaryKey: 'id',
    description: 'Clinical assessments and treatment evaluations',
    fields: [
      'id', 'patient_id', 'assessment_type', 'assessment_date', 'scores',
      'recommendations', 'assessor_id', 'follow_up_required', 'created_at', 'updated_at'
    ],
    permissions: ['read', 'write', 'update']
  },
  {
    tableName: 'insurance_coverages',
    primaryKey: 'id',
    description: 'Insurance coverage options and details',
    fields: [
      'id', 'coverage_type', 'provider_name', 'policy_details', 'coverage_limits',
      'copay_structure', 'deductible_info', 'network_providers', 'created_at', 'updated_at'
    ],
    permissions: ['read', 'write', 'update']
  }
];

// ============= TREATMENT CENTER ONBOARDING TABLES =============
// Based on actual database schema from Supabase
export const TREATMENT_CENTER_ONBOARDING_TABLES: TableAccessConfig[] = [
  {
    tableName: 'treatment_center_onboarding',
    primaryKey: 'id',
    description: 'Treatment center facility information and onboarding status',
    fields: [
      'id', 'user_id', 'facility_name', 'facility_type', 'license_number',
      'dea_number', 'npi_number', 'federal_tax_id', 'address', 'phone',
      'email', 'administrator_name', 'medical_director', 'accreditation',
      'services_offered', 'bed_capacity', 'status', 'created_at', 'updated_at'
    ],
    permissions: ['read', 'write', 'update']
  },
  {
    tableName: 'provider_profiles',
    primaryKey: 'id',
    description: 'Healthcare provider profiles and credentials',
    fields: [
      'id', 'user_id', 'first_name', 'last_name', 'npi_number', 'specialty',
      'license_number', 'license_state', 'dea_number', 'organization_name',
      'credentials', 'board_certifications', 'malpractice_insurance',
      'background_check_status', 'created_at', 'updated_at'
    ],
    permissions: ['read', 'write', 'update']
  },
  {
    tableName: 'npi_verification_results',
    primaryKey: 'id',
    description: 'NPI number verification and validation results (from NPPES)',
    fields: [
      'id', 'provider_id', 'npi_number', 'verification_status', 'provider_name',
      'verification_date', 'nppes_data', 'taxonomy_codes', 'practice_locations',
      'enumeration_date', 'last_updated_date', 'created_at', 'updated_at'
    ],
    permissions: ['read', 'write', 'update']
  },
  {
    tableName: 'clinical_trials',
    primaryKey: 'id',
    description: 'Clinical trial management and tracking',
    fields: [
      'id', 'nct_number', 'title', 'trial_status', 'enrollment_target',
      'primary_indication', 'study_phase', 'sponsor', 'principal_investigator',
      'trial_sites', 'inclusion_criteria', 'exclusion_criteria',
      'start_date', 'completion_date', 'created_at', 'updated_at'
    ],
    permissions: ['read', 'write', 'update']
  },
  {
    tableName: 'service_providers',
    primaryKey: 'id',
    description: 'External service provider configurations',
    fields: [
      'id', 'provider_name', 'service_type', 'api_endpoint', 'configuration',
      'credentials', 'contact_info', 'service_level', 'integration_status',
      'billing_info', 'contract_details', 'created_at', 'updated_at'
    ],
    permissions: ['read', 'write', 'update']
  },
  {
    tableName: 'service_provider_capabilities',
    primaryKey: 'id',
    description: 'Service provider capabilities and offerings',
    fields: [
      'id', 'provider_id', 'service_type', 'capability_description',
      'service_level', 'geographic_coverage', 'capacity_limits',
      'integration_capabilities', 'compliance_certifications',
      'pricing_model', 'created_at', 'updated_at'
    ],
    permissions: ['read', 'write', 'update']
  },
  {
    tableName: 'provider_test_configs',
    primaryKey: 'id',
    description: 'Provider testing and configuration settings',
    fields: [
      'id', 'provider_id', 'test_environment', 'config_parameters',
      'test_results', 'validation_status', 'environment_type',
      'connection_settings', 'created_at', 'updated_at'
    ],
    permissions: ['read', 'write', 'update']
  }
];

// ============= HEALTHCARE PROVIDER ROLE TABLES =============
export const HEALTHCARE_PROVIDER_TABLES: TableAccessConfig[] = [
  {
    tableName: 'enrollment_provider_info',
    primaryKey: 'id',
    description: 'Provider information within enrollment context',
    fields: [
      'id', 'patient_id', 'provider_name', 'npi_number', 'specialty',
      'practice_name', 'referral_source', 'provider_phone', 'provider_email',
      'relationship_to_patient', 'authorization_code', 'created_at', 'updated_at'
    ],
    permissions: ['read', 'write', 'update']
  },
  {
    tableName: 'enrollment_treatment_plan',
    primaryKey: 'id',
    description: 'Treatment plans and care coordination',
    fields: [
      'id', 'patient_id', 'provider_id', 'treatment_type', 'start_date',
      'duration', 'care_team', 'treatment_goals', 'interventions',
      'monitoring_schedule', 'medication_protocol', 'created_at', 'updated_at'
    ],
    permissions: ['read', 'write', 'update']
  },
  {
    tableName: 'service_providers',
    primaryKey: 'id',
    description: 'External service provider configurations',
    fields: [
      'id', 'provider_name', 'service_type', 'api_endpoint', 'configuration',
      'credentials', 'contact_info', 'service_level', 'integration_status',
      'billing_info', 'contract_details', 'created_at', 'updated_at'
    ],
    permissions: ['read', 'write', 'update']
  }
];

// ============= CUSTOMER ONBOARDING ROLE TABLES =============
// Based on actual database schema from Supabase
export const CUSTOMER_ONBOARDING_TABLES: TableAccessConfig[] = [
  {
    tableName: 'enrollment_templates',
    primaryKey: 'id',
    description: 'Enrollment form templates and configurations',
    fields: [
      'id', 'template_name', 'template_type', 'configuration', 'fields_config',
      'validation_rules', 'workflow_steps', 'is_active', 'version',
      'created_by', 'created_at', 'updated_at'
    ],
    permissions: ['read', 'write', 'update']
  },
  {
    tableName: 'saml_providers',
    primaryKey: 'id',
    description: 'SAML authentication provider configurations',
    fields: [
      'id', 'provider_name', 'entity_id', 'sso_url', 'certificate',
      'attribute_mapping', 'is_active', 'configuration',
      'created_at', 'updated_at'
    ],
    permissions: ['read', 'write', 'update']
  },
  {
    tableName: 'sso_providers',
    primaryKey: 'id',
    description: 'Single sign-on provider configurations',
    fields: [
      'id', 'provider_type', 'provider_name', 'client_id', 'client_secret',
      'configuration', 'domain_restrictions', 'is_active',
      'created_at', 'updated_at'
    ],
    permissions: ['read', 'write', 'update']
  },
  {
    tableName: 'voice_providers',
    primaryKey: 'id',
    description: 'Voice communication provider settings',
    fields: [
      'id', 'provider_name', 'provider_type', 'configuration', 'credentials',
      'service_endpoints', 'rate_limits', 'is_active',
      'created_at', 'updated_at'
    ],
    permissions: ['read', 'write', 'update']
  }
];

// ============= SUPER ADMIN TABLES =============
export const SUPER_ADMIN_TABLES: TableAccessConfig[] = [
  // Core System Tables
  {
    tableName: 'profiles',
    primaryKey: 'id',
    description: 'User profiles and basic information',
    fields: [
      'id', 'email', 'first_name', 'last_name', 'phone', 'facility_id',
      'is_active', 'avatar_url', 'timezone', 'created_at', 'updated_at'
    ],
    permissions: ['read', 'write', 'update', 'delete']
  },
  {
    tableName: 'roles',
    primaryKey: 'id',
    description: 'System roles and permissions',
    fields: [
      'id', 'name', 'description', 'is_default', 'created_at', 'updated_at'
    ],
    permissions: ['read', 'write', 'update', 'delete']
  },
  {
    tableName: 'user_roles',
    primaryKey: 'id',
    description: 'User role assignments',
    fields: [
      'id', 'user_id', 'role_id', 'assigned_at', 'assigned_by', 'is_active'
    ],
    permissions: ['read', 'write', 'update', 'delete']
  },
  {
    tableName: 'modules',
    primaryKey: 'id',
    description: 'System modules and features',
    fields: [
      'id', 'name', 'description', 'is_active', 'module_type', 'configuration',
      'created_at', 'updated_at'
    ],
    permissions: ['read', 'write', 'update', 'delete']
  },
  {
    tableName: 'audit_logs',
    primaryKey: 'id',
    description: 'System audit and activity logs',
    fields: [
      'id', 'user_id', 'action', 'table_name', 'record_id', 'old_values',
      'new_values', 'ip_address', 'user_agent', 'additional_context',
      'created_at'
    ],
    permissions: ['read']
  },
  {
    tableName: 'active_issues',
    primaryKey: 'id',
    description: 'System issues and alerts',
    fields: [
      'id', 'issue_type', 'category', 'issue_severity', 'issue_message',
      'issue_source', 'status', 'first_detected', 'last_seen',
      'created_at', 'updated_at'
    ],
    permissions: ['read', 'write', 'update', 'delete']
  }
];

// ============= ROLE TABLE MAPPINGS =============
export const ROLE_TABLE_MAPPINGS: Record<string, RoleTableMapping> = {
  patientCaregiver: {
    roleName: 'Patient/Caregiver',
    tables: PATIENT_ONBOARDING_TABLES,
    workflows: ['patient_enrollment', 'clinical_intake', 'insurance_verification', 'consent_management']
  },
  
  healthcareProvider: {
    roleName: 'Healthcare Provider',
    tables: [
      ...PATIENT_ONBOARDING_TABLES,
      ...HEALTHCARE_PROVIDER_TABLES,
      {
        tableName: 'clinical_trials',
        primaryKey: 'id',
        description: 'Clinical trial management access',
        fields: ['id', 'nct_number', 'title', 'trial_status', 'enrollment_target'],
        permissions: ['read', 'write', 'update']
      }
    ],
    workflows: ['patient_management', 'clinical_documentation', 'treatment_planning', 'provider_credentialing']
  },
  
  onboardingTeam: {
    roleName: 'Customer Onboarding Team',
    tables: [
      ...TREATMENT_CENTER_ONBOARDING_TABLES,
      ...CUSTOMER_ONBOARDING_TABLES,
      {
        tableName: 'profiles',
        primaryKey: 'id',
        description: 'User profile management for onboarding',
        fields: ['id', 'email', 'first_name', 'last_name', 'facility_id'],
        permissions: ['read', 'write', 'update']
      }
    ],
    workflows: ['facility_onboarding', 'service_configuration', 'provider_setup', 'integration_management']
  },
  
  superAdmin: {
    roleName: 'Super Administrator',
    tables: [
      ...SUPER_ADMIN_TABLES,
      ...PATIENT_ONBOARDING_TABLES,
      ...TREATMENT_CENTER_ONBOARDING_TABLES,
      ...HEALTHCARE_PROVIDER_TABLES,
      ...CUSTOMER_ONBOARDING_TABLES
    ],
    workflows: [
      'system_administration', 'user_management', 'role_management', 
      'audit_monitoring', 'system_configuration', 'data_management',
      'compliance_oversight', 'integration_management'
    ]
  }
};

// ============= HELPER FUNCTIONS =============
export const getTablesByRole = (roleName: string): TableAccessConfig[] => {
  return ROLE_TABLE_MAPPINGS[roleName]?.tables || [];
};

export const getWorkflowsByRole = (roleName: string): string[] => {
  return ROLE_TABLE_MAPPINGS[roleName]?.workflows || [];
};

export const getAllTableNames = (): string[] => {
  const allTables = new Set<string>();
  Object.values(ROLE_TABLE_MAPPINGS).forEach(mapping => {
    mapping.tables.forEach(table => allTables.add(table.tableName));
  });
  return Array.from(allTables).sort();
};

export const getTableDescription = (tableName: string): string => {
  for (const mapping of Object.values(ROLE_TABLE_MAPPINGS)) {
    const table = mapping.tables.find(t => t.tableName === tableName);
    if (table) return table.description;
  }
  return 'Table description not found';
};

export const getTablesByCategory = () => {
  return {
    'Patient Onboarding': PATIENT_ONBOARDING_TABLES.map(t => t.tableName),
    'Treatment Center Onboarding': TREATMENT_CENTER_ONBOARDING_TABLES.map(t => t.tableName),
    'Healthcare Provider': HEALTHCARE_PROVIDER_TABLES.map(t => t.tableName),
    'Customer Onboarding': CUSTOMER_ONBOARDING_TABLES.map(t => t.tableName),
    'System Administration': SUPER_ADMIN_TABLES.map(t => t.tableName)
  };
};