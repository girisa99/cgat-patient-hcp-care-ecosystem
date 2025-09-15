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
    description: 'Clinical data including medical history and current medications',
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
    table_name: 'provider_profiles',
    category: 'provider',
    relevance_score: 1.0,
    description: 'Healthcare provider profiles and credentials',
    key_fields: ['first_name', 'last_name', 'npi_number', 'specialty', 'organization_name']
  },
  {
    table_name: 'clinical_trials',
    category: 'clinical',
    relevance_score: 0.9,
    description: 'Clinical trial management and tracking',
    key_fields: ['nct_number', 'title', 'trial_status', 'enrollment_target', 'primary_indication']
  },
  {
    table_name: 'patient_enrollments',
    category: 'patient',
    relevance_score: 0.9,
    description: 'Patient enrollment tracking and status management',
    key_fields: ['patient_id', 'enrollment_date', 'status', 'program_type']
  },
  {
    table_name: 'npi_verification_results',
    category: 'provider',
    relevance_score: 0.8,
    description: 'NPI number verification and validation results',
    key_fields: ['npi_number', 'verification_status', 'provider_name', 'verification_date']
  },
  {
    table_name: 'enrollment_provider_info',
    category: 'provider',
    relevance_score: 0.8,
    description: 'Provider information within enrollment context',
    key_fields: ['provider_name', 'npi_number', 'specialty', 'referral_source']
  },
  {
    table_name: 'enrollment_treatment_plan',
    category: 'treatment',
    relevance_score: 0.8,
    description: 'Treatment plans and care coordination',
    key_fields: ['treatment_type', 'start_date', 'duration', 'care_team']
  },
  {
    table_name: 'enrollment_consent',
    category: 'compliance',
    relevance_score: 0.7,
    description: 'Patient consent forms and HIPAA authorizations',
    key_fields: ['consent_type', 'signed_date', 'consent_status', 'digital_signature']
  },
  {
    table_name: 'enrollment_documents',
    category: 'compliance',
    relevance_score: 0.7,
    description: 'Document management for enrollment process',
    key_fields: ['document_type', 'file_path', 'upload_date', 'verification_status']
  },
  {
    table_name: 'service_providers',
    category: 'provider',
    relevance_score: 0.6,
    description: 'External service provider configurations',
    key_fields: ['provider_name', 'service_type', 'api_endpoint', 'configuration']
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