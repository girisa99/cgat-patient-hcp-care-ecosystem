import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  FileText, 
  Shield, 
  CreditCard, 
  Building2, 
  Stethoscope,
  ClipboardList,
  FileSignature,
  Database,
  CheckCircle
} from 'lucide-react';

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  tables: string[];
  fields: string[];
  icon: React.ReactNode;
  hipaaRequired: boolean;
  consentRequired: boolean;
  signatureRequired: boolean;
}

interface HealthcareWorkflowMapperProps {
  userRole: 'enrollment' | 'onboarding' | 'clinical' | 'admin';
  onWorkflowMapped?: (workflow: WorkflowStep[]) => void;
}

const HEALTHCARE_WORKFLOWS = {
  enrollment: [
    {
      id: 'patient-demographics',
      name: 'Patient Demographics',
      description: 'Basic patient information, contact details, emergency contacts',
      tables: ['profiles', 'enrollment_demographics'],
      fields: ['first_name', 'last_name', 'email', 'phone', 'address', 'emergency_contact'],
      icon: <Users className="h-4 w-4" />,
      hipaaRequired: true,
      consentRequired: true,
      signatureRequired: false
    },
    {
      id: 'clinical-information',
      name: 'Clinical Information',
      description: 'Medical history, current medications, allergies, vital signs',
      tables: ['enrollment_clinical_info'],
      fields: ['medical_history', 'current_medications', 'allergies', 'vital_signs', 'chief_complaint'],
      icon: <Stethoscope className="h-4 w-4" />,
      hipaaRequired: true,
      consentRequired: true,
      signatureRequired: false
    },
    {
      id: 'insurance-information',
      name: 'Insurance Information',
      description: 'Primary and secondary insurance details, coverage verification',
      tables: ['enrollment_insurance_info'],
      fields: ['primary_insurance_name', 'policy_number', 'group_number', 'subscriber_name'],
      icon: <CreditCard className="h-4 w-4" />,
      hipaaRequired: true,
      consentRequired: false,
      signatureRequired: false
    },
    {
      id: 'provider-information',
      name: 'Provider Information',
      description: 'Healthcare provider details, NPI verification, referral information',
      tables: ['providers', 'npi_verification'],
      fields: ['provider_name', 'npi_number', 'specialty', 'referral_source'],
      icon: <Building2 className="h-4 w-4" />,
      hipaaRequired: false,
      consentRequired: false,
      signatureRequired: false
    },
    {
      id: 'consent-signatures',
      name: 'Consent & Signatures',
      description: 'HIPAA authorization, treatment consent, financial responsibility',
      tables: ['enrollment_consents', 'digital_signatures'],
      fields: ['hipaa_consent', 'treatment_consent', 'financial_consent', 'signature_data'],
      icon: <FileSignature className="h-4 w-4" />,
      hipaaRequired: true,
      consentRequired: true,
      signatureRequired: true
    }
  ],
  onboarding: [
    {
      id: 'company-information',
      name: 'Company Information',
      description: 'Business details, legal structure, tax identification',
      tables: ['treatment_center_onboarding'],
      fields: ['legal_name', 'federal_tax_id', 'business_type', 'dea_number', 'hin_number'],
      icon: <Building2 className="h-4 w-4" />,
      hipaaRequired: false,
      consentRequired: false,
      signatureRequired: false
    },
    {
      id: 'licensing-compliance',
      name: 'Licensing & Compliance',
      description: 'DEA registration, state licenses, 340B program enrollment',
      tables: ['onboarding_340b_programs', 'licenses'],
      fields: ['dea_number', 'state_license', '340b_eligibility', 'compliance_documentation'],
      icon: <Shield className="h-4 w-4" />,
      hipaaRequired: false,
      consentRequired: false,
      signatureRequired: true
    },
    {
      id: 'gpo-memberships',
      name: 'GPO Memberships',
      description: 'Group purchasing organization details and contract information',
      tables: ['onboarding_gpo_memberships'],
      fields: ['gpo_name', 'membership_number', 'contract_terms', 'rebate_information'],
      icon: <ClipboardList className="h-4 w-4" />,
      hipaaRequired: false,
      consentRequired: false,
      signatureRequired: false
    },
    {
      id: 'platform-users',
      name: 'Platform Users',
      description: 'User account setup and role assignments for the treatment center',
      tables: ['onboarding_platform_users'],
      fields: ['user_email', 'user_role', 'access_level', 'permissions'],
      icon: <Users className="h-4 w-4" />,
      hipaaRequired: false,
      consentRequired: false,
      signatureRequired: false
    },
    {
      id: 'payment-terms',
      name: 'Payment Terms',
      description: 'Financial arrangements, payment methods, credit terms',
      tables: ['onboarding_payment_terms'],
      fields: ['payment_method', 'credit_terms', 'bank_information', 'billing_preferences'],
      icon: <CreditCard className="h-4 w-4" />,
      hipaaRequired: false,
      consentRequired: true,
      signatureRequired: true
    }
  ],
  clinical: [
    {
      id: 'clinical-trials',
      name: 'Clinical Trials Management',
      description: 'Trial enrollment, patient matching, regulatory compliance',
      tables: ['clinical_trials', 'trial_participants'],
      fields: ['nct_number', 'trial_status', 'enrollment_criteria', 'patient_population'],
      icon: <FileText className="h-4 w-4" />,
      hipaaRequired: true,
      consentRequired: true,
      signatureRequired: true
    },
    {
      id: 'treatment-protocols',
      name: 'Treatment Protocols',
      description: 'Treatment plans, medication management, monitoring schedules',
      tables: ['treatment_protocols', 'medication_orders'],
      fields: ['protocol_name', 'treatment_duration', 'medication_schedule', 'monitoring_plan'],
      icon: <Stethoscope className="h-4 w-4" />,
      hipaaRequired: true,
      consentRequired: true,
      signatureRequired: false
    }
  ],
  admin: [
    {
      id: 'system-configuration',
      name: 'System Configuration',
      description: 'Database setup, user roles, security policies',
      tables: ['user_roles', 'permissions', 'audit_logs'],
      fields: ['role_name', 'permission_set', 'security_policy', 'audit_trail'],
      icon: <Database className="h-4 w-4" />,
      hipaaRequired: true,
      consentRequired: false,
      signatureRequired: false
    }
  ]
};

export const HealthcareWorkflowMapper: React.FC<HealthcareWorkflowMapperProps> = ({
  userRole,
  onWorkflowMapped
}) => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowStep[]>(HEALTHCARE_WORKFLOWS[userRole]);
  const [customWorkflow, setCustomWorkflow] = useState<WorkflowStep[]>([]);

  const handleWorkflowSelection = (workflowType: string) => {
    if (workflowType === 'custom') {
      setSelectedWorkflow(customWorkflow);
    } else {
      setSelectedWorkflow(HEALTHCARE_WORKFLOWS[userRole]);
    }
    onWorkflowMapped?.(selectedWorkflow);
  };

  const getComplianceColor = (step: WorkflowStep) => {
    if (step.hipaaRequired && step.consentRequired && step.signatureRequired) {
      return 'border-red-300 bg-red-50';
    } else if (step.hipaaRequired || step.consentRequired) {
      return 'border-yellow-300 bg-yellow-50';
    }
    return 'border-green-300 bg-green-50';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Healthcare Workflow Mapping
          </CardTitle>
          <CardDescription>
            Role-based workflow configuration for {userRole} operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Select onValueChange={handleWorkflowSelection} defaultValue="default">
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select workflow type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Standard {userRole} workflow</SelectItem>
                  <SelectItem value="custom">Custom workflow</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                onClick={() => onWorkflowMapped?.(selectedWorkflow)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Apply Workflow
              </Button>
            </div>

            <div className="grid gap-4">
              {selectedWorkflow.map((step, index) => (
                <Card key={step.id} className={`border-2 ${getComplianceColor(step)}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                          {index + 1}
                        </div>
                        {step.icon}
                        <div>
                          <CardTitle className="text-lg">{step.name}</CardTitle>
                          <CardDescription>{step.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {step.hipaaRequired && (
                          <Badge variant="destructive" className="text-xs">
                            HIPAA
                          </Badge>
                        )}
                        {step.consentRequired && (
                          <Badge variant="secondary" className="text-xs">
                            Consent
                          </Badge>
                        )}
                        {step.signatureRequired && (
                          <Badge variant="outline" className="text-xs">
                            Signature
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-medium text-muted-foreground mb-2">Database Tables:</div>
                        <div className="flex flex-wrap gap-1">
                          {step.tables.map(table => (
                            <Badge key={table} variant="outline" className="text-xs">
                              {table}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-muted-foreground mb-2">Key Fields:</div>
                        <div className="flex flex-wrap gap-1">
                          {step.fields.slice(0, 4).map(field => (
                            <Badge key={field} variant="secondary" className="text-xs">
                              {field}
                            </Badge>
                          ))}
                          {step.fields.length > 4 && (
                            <Badge variant="secondary" className="text-xs">
                              +{step.fields.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthcareWorkflowMapper;