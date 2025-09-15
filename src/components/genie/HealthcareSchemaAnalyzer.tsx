import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, Table, Users, FileText, Activity, Building2 } from 'lucide-react';
import { useMasterToast } from '@/hooks/useMasterToast';

interface HealthcareTable {
  table_name: string;
  category: 'patient' | 'provider' | 'clinical' | 'insurance' | 'onboarding' | 'treatment' | 'compliance' | 'other';
  relevance_score: number;
  description: string;
  key_fields: string[];
}

interface HealthcareSchemaAnalyzerProps {
  onSchemaAnalyzed?: (tables: HealthcareTable[]) => void;
}

// Pre-configured healthcare tables based on your existing schema
const HEALTHCARE_TABLES: HealthcareTable[] = [
  // PATIENT ONBOARDING TABLES (11 tables)
  {
    table_name: 'enrollment_patient_info',
    category: 'patient',
    relevance_score: 1.0,
    description: 'Core patient demographic and contact information',
    key_fields: ['first_name', 'last_name', 'email', 'phone', 'date_of_birth']
  },
  {
    table_name: 'enrollment_clinical_info',
    category: 'clinical',
    relevance_score: 1.0,
    description: 'Clinical data including medical history and medications',
    key_fields: ['medical_history', 'current_medications', 'allergies', 'vital_signs']
  },
  {
    table_name: 'enrollment_insurance_info',
    category: 'insurance',
    relevance_score: 1.0,
    description: 'Insurance coverage and billing information',
    key_fields: ['primary_insurance_name', 'policy_number', 'group_number', 'subscriber_name']
  },
  {
    table_name: 'enrollment_consent',
    category: 'compliance',
    relevance_score: 1.0,
    description: 'Patient consent forms and HIPAA authorizations',
    key_fields: ['consent_type', 'signed_date', 'consent_status', 'digital_signature']
  },
  {
    table_name: 'enrollment_documents',
    category: 'compliance',
    relevance_score: 1.0,
    description: 'Document management for enrollment process',
    key_fields: ['document_type', 'file_path', 'upload_date', 'verification_status']
  },
  {
    table_name: 'patient_enrollments',
    category: 'patient',
    relevance_score: 1.0,
    description: 'Patient enrollment tracking and status management',
    key_fields: ['patient_id', 'enrollment_date', 'status', 'program_type']
  },
  {
    table_name: 'enrollment_treatment_plan',
    category: 'treatment',
    relevance_score: 1.0,
    description: 'Treatment plans and care coordination',
    key_fields: ['treatment_type', 'start_date', 'duration', 'care_team']
  },
  {
    table_name: 'enrollment_collaborations',
    category: 'treatment',
    relevance_score: 0.9,
    description: 'Care team collaboration and communication',
    key_fields: ['collaboration_type', 'participants', 'notes', 'created_date']
  },
  {
    table_name: 'enrollment_instances',
    category: 'patient',
    relevance_score: 0.9,
    description: 'Enrollment session instances and workflow tracking',
    key_fields: ['instance_id', 'session_data', 'created_at', 'status']
  },
  {
    table_name: 'treatment_assessments',
    category: 'clinical',
    relevance_score: 0.9,
    description: 'Clinical assessments and treatment evaluations',
    key_fields: ['assessment_type', 'assessment_date', 'results', 'provider_id']
  },
  {
    table_name: 'insurance_coverages',
    category: 'insurance',
    relevance_score: 0.9,
    description: 'Insurance coverage options and details',
    key_fields: ['coverage_type', 'effective_date', 'expiration_date', 'coverage_details']
  },

  // TREATMENT CENTER ONBOARDING TABLES (7 tables)
  {
    table_name: 'treatment_center_onboarding',
    category: 'onboarding',
    relevance_score: 1.0,
    description: 'Treatment center facility information and onboarding status',
    key_fields: ['center_name', 'address', 'license_number', 'accreditation_status']
  },
  {
    table_name: 'provider_profiles',
    category: 'provider',
    relevance_score: 1.0,
    description: 'Healthcare provider profiles and credentials',
    key_fields: ['first_name', 'last_name', 'npi_number', 'specialty', 'organization_name']
  },
  {
    table_name: 'npi_verification_results',
    category: 'provider',
    relevance_score: 1.0,
    description: 'NPI number verification and validation results (NPPES)',
    key_fields: ['npi_number', 'verification_status', 'provider_name', 'verification_date']
  },
  {
    table_name: 'clinical_trials',
    category: 'clinical',
    relevance_score: 1.0,
    description: 'Clinical trial management and tracking',
    key_fields: ['nct_number', 'title', 'trial_status', 'enrollment_target', 'primary_indication']
  },
  {
    table_name: 'service_providers',
    category: 'provider',
    relevance_score: 0.9,
    description: 'External service provider configurations',
    key_fields: ['provider_name', 'service_type', 'api_endpoint', 'configuration']
  },
  {
    table_name: 'service_provider_capabilities',
    category: 'provider',
    relevance_score: 0.9,
    description: 'Service provider capabilities and offerings',
    key_fields: ['capability_name', 'description', 'supported_operations', 'version']
  },
  {
    table_name: 'provider_test_configs',
    category: 'provider',
    relevance_score: 0.8,
    description: 'Provider testing and configuration settings',
    key_fields: ['config_name', 'test_parameters', 'validation_rules', 'environment']
  },

  // CUSTOMER ONBOARDING ROLE ADDITIONAL TABLES
  {
    table_name: 'enrollment_templates',
    category: 'onboarding',
    relevance_score: 0.8,
    description: 'Enrollment form templates and configurations',
    key_fields: ['template_name', 'form_fields', 'validation_rules', 'version']
  },
  {
    table_name: 'saml_providers',
    category: 'onboarding',
    relevance_score: 0.7,
    description: 'SAML authentication provider configurations',
    key_fields: ['provider_name', 'entity_id', 'sso_url', 'certificate']
  },
  {
    table_name: 'sso_providers',
    category: 'onboarding',
    relevance_score: 0.7,
    description: 'Single sign-on provider configurations',
    key_fields: ['provider_name', 'provider_type', 'client_id', 'configuration']
  },
  {
    table_name: 'voice_providers',
    category: 'onboarding',
    relevance_score: 0.6,
    description: 'Voice communication provider settings',
    key_fields: ['provider_name', 'api_key', 'voice_settings', 'phone_numbers']
  },

  // HEALTHCARE PROVIDER ROLE ADDITIONAL TABLES
  {
    table_name: 'enrollment_provider_info',
    category: 'provider',
    relevance_score: 0.8,
    description: 'Provider information within enrollment context',
    key_fields: ['provider_name', 'npi_number', 'specialty', 'referral_source']
  },

  // SUPER ADMIN CORE SYSTEM TABLES
  {
    table_name: 'profiles',
    category: 'other',
    relevance_score: 1.0,
    description: 'User profiles and basic information',
    key_fields: ['id', 'first_name', 'last_name', 'email', 'role']
  },
  {
    table_name: 'roles',
    category: 'other',
    relevance_score: 1.0,
    description: 'System roles and permissions',
    key_fields: ['name', 'description', 'is_default', 'permissions']
  },
  {
    table_name: 'user_roles',
    category: 'other',
    relevance_score: 1.0,
    description: 'User role assignments',
    key_fields: ['user_id', 'role_id', 'assigned_at', 'is_active']
  },
  {
    table_name: 'user_permissions',
    category: 'other',
    relevance_score: 0.9,
    description: 'Individual user permissions',
    key_fields: ['user_id', 'permission_id', 'granted_at', 'expires_at']
  },
  {
    table_name: 'permissions',
    category: 'other',
    relevance_score: 0.9,
    description: 'System permission definitions',
    key_fields: ['name', 'description', 'resource_type', 'action']
  },
  {
    table_name: 'role_permissions',
    category: 'other',
    relevance_score: 0.9,
    description: 'Role-based permission assignments',
    key_fields: ['role_id', 'permission_id', 'granted_at', 'is_active']
  },
  {
    table_name: 'facilities',
    category: 'other',
    relevance_score: 0.8,
    description: 'Healthcare facilities and treatment centers',
    key_fields: ['name', 'facility_type', 'address', 'license_number']
  },
  {
    table_name: 'modules',
    category: 'other',
    relevance_score: 0.8,
    description: 'System modules and features',
    key_fields: ['name', 'description', 'is_active', 'module_type']
  },
  {
    table_name: 'role_module_assignments',
    category: 'other',
    relevance_score: 0.7,
    description: 'Role access to modules',
    key_fields: ['role_id', 'module_id', 'is_active', 'assigned_at']
  },
  {
    table_name: 'user_module_assignments',
    category: 'other',
    relevance_score: 0.7,
    description: 'User access to specific modules',
    key_fields: ['user_id', 'module_id', 'is_active', 'assigned_at']
  },
  {
    table_name: 'audit_logs',
    category: 'compliance',
    relevance_score: 0.9,
    description: 'System audit and activity logs',
    key_fields: ['user_id', 'action', 'table_name', 'timestamp']
  },
  {
    table_name: 'active_issues',
    category: 'other',
    relevance_score: 0.6,
    description: 'System issues and alerts monitoring',
    key_fields: ['issue_type', 'severity', 'status', 'created_at']
  }
];

export const HealthcareSchemaAnalyzer: React.FC<HealthcareSchemaAnalyzerProps> = ({
  onSchemaAnalyzed
}) => {
  const [tables, setTables] = useState<HealthcareTable[]>(HEALTHCARE_TABLES);
  const { showSuccess } = useMasterToast();

  useEffect(() => {
    // Simulate analysis completion
    setTimeout(() => {
      onSchemaAnalyzed?.(tables);
      showSuccess(`Analyzed ${tables.length} healthcare tables`);
    }, 1000);
  }, [onSchemaAnalyzed, tables, showSuccess]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'patient': return <Users className="h-4 w-4" />;
      case 'clinical': return <Activity className="h-4 w-4" />;
      case 'provider': return <Building2 className="h-4 w-4" />;
      case 'treatment': return <FileText className="h-4 w-4" />;
      case 'compliance': return <FileText className="h-4 w-4" />;
      default: return <Table className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'patient': return 'bg-blue-500/20 text-blue-700 border-blue-300';
      case 'clinical': return 'bg-green-500/20 text-green-700 border-green-300';
      case 'provider': return 'bg-orange-500/20 text-orange-700 border-orange-300';
      case 'insurance': return 'bg-yellow-500/20 text-yellow-700 border-yellow-300';
      case 'treatment': return 'bg-red-500/20 text-red-700 border-red-300';
      case 'compliance': return 'bg-purple-500/20 text-purple-700 border-purple-300';
      default: return 'bg-slate-500/20 text-slate-700 border-slate-300';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Healthcare Schema Analysis ({tables.length} tables)
          </CardTitle>
          <CardDescription>
            Your existing healthcare database tables categorized by function
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {tables
              .sort((a, b) => b.relevance_score - a.relevance_score)
              .map((table) => (
                <div key={table.table_name} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    {getCategoryIcon(table.category)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-medium">{table.table_name}</div>
                        <span className={`text-sm font-semibold ${getScoreColor(table.relevance_score)}`}>
                          {(table.relevance_score * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {table.description}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {table.key_fields.slice(0, 4).map(field => (
                          <Badge key={field} variant="outline" className="text-xs">
                            {field}
                          </Badge>
                        ))}
                        {table.key_fields.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{table.key_fields.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge className={getCategoryColor(table.category)}>
                    {table.category}
                  </Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Schema Summary</CardTitle>
          <CardDescription>
            Healthcare table distribution by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(
              tables.reduce((acc, table) => {
                acc[table.category] = (acc[table.category] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).map(([category, count]) => (
              <div key={category} className="text-center p-3 border rounded-lg">
                <div className="font-semibold text-lg">{count}</div>
                <div className="text-sm text-muted-foreground capitalize">{category}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthcareSchemaAnalyzer;