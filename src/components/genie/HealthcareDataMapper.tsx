import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  ArrowRight, 
  Database, 
  MapPin, 
  CheckCircle,
  AlertTriangle,
  Shield
} from 'lucide-react';

interface DataMappingRule {
  id: string;
  sourceSystem: string;
  sourceField: string;
  targetTable: string;
  targetField: string;
  transformation?: string;
  required: boolean;
  hipaaProtected: boolean;
}

// Your existing healthcare tables with common field mappings
const HEALTHCARE_TABLES_CONFIG = {
  'enrollment_patient_info': {
    fields: ['first_name', 'last_name', 'email', 'phone', 'date_of_birth', 'address'],
    description: 'Core patient demographic information'
  },
  'enrollment_clinical_info': {
    fields: ['medical_history', 'current_medications', 'allergies', 'vital_signs', 'chief_complaint'],
    description: 'Clinical and medical data'
  },
  'enrollment_insurance_info': {
    fields: ['primary_insurance_name', 'policy_number', 'group_number', 'subscriber_name'],
    description: 'Insurance coverage and billing information'
  },
  'provider_profiles': {
    fields: ['first_name', 'last_name', 'npi_number', 'specialty', 'organization_name'],
    description: 'Healthcare provider information'
  },
  'clinical_trials': {
    fields: ['nct_number', 'title', 'trial_status', 'enrollment_target', 'primary_indication'],
    description: 'Clinical trial management data'
  },
  'patient_enrollments': {
    fields: ['patient_id', 'enrollment_date', 'status', 'program_type'],
    description: 'Patient enrollment tracking'
  },
  'npi_verification_results': {
    fields: ['npi_number', 'verification_status', 'provider_name', 'verification_date'],
    description: 'NPI validation and verification data'
  }
};

interface HealthcareDataMapperProps {
  onMappingConfigured?: (mappings: DataMappingRule[]) => void;
}

export const HealthcareDataMapper: React.FC<HealthcareDataMapperProps> = ({
  onMappingConfigured
}) => {
  const [mappingRules, setMappingRules] = useState<DataMappingRule[]>([
    // Pre-configured mappings for common systems
    {
      id: 'cerner-patient-1',
      sourceSystem: 'Cerner FHIR',
      sourceField: 'Patient.name.given[0]',
      targetTable: 'enrollment_patient_info',
      targetField: 'first_name',
      required: true,
      hipaaProtected: true
    },
    {
      id: 'cerner-patient-2',
      sourceSystem: 'Cerner FHIR',
      sourceField: 'Patient.name.family',
      targetTable: 'enrollment_patient_info',
      targetField: 'last_name',
      required: true,
      hipaaProtected: true
    },
    {
      id: 'athena-provider-1',
      sourceSystem: 'athenahealth API',
      sourceField: 'providers.npi',
      targetTable: 'npi_verification_results',
      targetField: 'npi_number',
      required: true,
      hipaaProtected: false
    },
    {
      id: 'change-insurance-1',
      sourceSystem: 'Change Healthcare',
      sourceField: 'eligibility.memberId',
      targetTable: 'enrollment_insurance_info',
      targetField: 'policy_number',
      required: true,
      hipaaProtected: true
    },
    {
      id: 'salesforce-account-1',
      sourceSystem: 'Salesforce Health Cloud',
      sourceField: 'Account.Name',
      targetTable: 'provider_profiles',
      targetField: 'organization_name',
      required: true,
      hipaaProtected: false
    }
  ]);

  const addMappingRule = () => {
    const newRule: DataMappingRule = {
      id: `custom-${Date.now()}`,
      sourceSystem: '',
      sourceField: '',
      targetTable: '',
      targetField: '',
      required: false,
      hipaaProtected: false
    };
    setMappingRules([...mappingRules, newRule]);
  };

  const updateMappingRule = (id: string, updates: Partial<DataMappingRule>) => {
    setMappingRules(rules => 
      rules.map(rule => 
        rule.id === id ? { ...rule, ...updates } : rule
      )
    );
  };

  const deleteMappingRule = (id: string) => {
    setMappingRules(rules => rules.filter(rule => rule.id !== id));
  };

  const validateMapping = (rule: DataMappingRule) => {
    const issues = [];
    if (!rule.sourceField) issues.push('Missing source field');
    if (!rule.targetTable) issues.push('Missing target table');
    if (!rule.targetField) issues.push('Missing target field');
    if (rule.hipaaProtected && !rule.sourceField.includes('encrypt')) {
      issues.push('HIPAA protected field may need encryption');
    }
    return issues;
  };

  const getFieldsForTable = (tableName: string) => {
    return HEALTHCARE_TABLES_CONFIG[tableName as keyof typeof HEALTHCARE_TABLES_CONFIG]?.fields || [];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Healthcare Data Mapping Configuration
          </CardTitle>
          <CardDescription>
            Map external system fields to your healthcare database schema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {mappingRules.length} mapping rules configured
              </div>
              <Button onClick={addMappingRule} variant="outline">
                Add Custom Mapping
              </Button>
            </div>

            <div className="space-y-4">
              {mappingRules.map((rule) => {
                const validationIssues = validateMapping(rule);
                return (
                  <Card key={rule.id} className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{rule.sourceSystem}</Badge>
                          {rule.hipaaProtected && (
                            <Badge variant="destructive" className="text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              HIPAA
                            </Badge>
                          )}
                          {validationIssues.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {validationIssues.length} issues
                            </Badge>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteMappingRule(rule.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Source System</label>
                          <Input
                            value={rule.sourceSystem}
                            onChange={(e) => updateMappingRule(rule.id, { sourceSystem: e.target.value })}
                            placeholder="e.g., Cerner FHIR"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Source Field</label>
                          <Input
                            value={rule.sourceField}
                            onChange={(e) => updateMappingRule(rule.id, { sourceField: e.target.value })}
                            placeholder="e.g., Patient.name.given[0]"
                          />
                        </div>

                        <div className="flex justify-center">
                          <ArrowRight className="h-5 w-5 text-muted-foreground" />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Target Table</label>
                          <Select 
                            value={rule.targetTable} 
                            onValueChange={(value) => updateMappingRule(rule.id, { targetTable: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select table" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.keys(HEALTHCARE_TABLES_CONFIG).map(table => (
                                <SelectItem key={table} value={table}>
                                  {table}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Target Field</label>
                          <Select 
                            value={rule.targetField} 
                            onValueChange={(value) => updateMappingRule(rule.id, { targetField: value })}
                            disabled={!rule.targetTable}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select field" />
                            </SelectTrigger>
                            <SelectContent>
                              {getFieldsForTable(rule.targetTable).map(field => (
                                <SelectItem key={field} value={field}>
                                  {field}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {validationIssues.length > 0 && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="text-sm text-yellow-800">
                            <strong>Validation Issues:</strong>
                            <ul className="list-disc list-inside mt-1">
                              {validationIssues.map((issue, index) => (
                                <li key={index}>{issue}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex justify-end">
              <Button onClick={() => onMappingConfigured?.(mappingRules)}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Apply Data Mappings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Available Healthcare Tables
          </CardTitle>
          <CardDescription>
            Your database schema for healthcare provider and enrollment data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {Object.entries(HEALTHCARE_TABLES_CONFIG).map(([table, config]) => (
              <div key={table} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{table}</div>
                  <Badge variant="outline">
                    {config.fields.length} fields
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  {config.description}
                </div>
                <div className="text-sm text-muted-foreground">
                  Fields: {config.fields.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthcareDataMapper;