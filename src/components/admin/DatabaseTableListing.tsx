import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Database, Users, Building2, Shield, FileText, Settings } from 'lucide-react';
import { ROLE_TABLE_MAPPINGS, getTablesByCategory } from '@/utils/tableRoleMapping';

export const DatabaseTableListing: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<string>('all');

  const tableCategories = getTablesByCategory();

  // Patient Onboarding Tables (from actual database)
  const patientOnboardingTables = [
    'enrollment_patient_info',
    'enrollment_clinical_info', 
    'enrollment_insurance_info',
    'enrollment_consent',
    'enrollment_documents',
    'patient_enrollments',
    'enrollment_treatment_plan',
    'enrollment_collaborations',
    'enrollment_instances',
    'treatment_assessments'
  ];

  // Treatment Center Onboarding Tables
  const treatmentCenterTables = [
    'treatment_center_onboarding',
    'provider_profiles',
    'npi_verification_results',
    'clinical_trials',
    'service_providers',
    'service_provider_capabilities',
    'provider_test_configs',
    'enrollment_provider_info'
  ];

  // Healthcare Provider Role Tables
  const healthcareProviderTables = [
    ...patientOnboardingTables,
    'provider_profiles',
    'enrollment_provider_info', 
    'clinical_trials',
    'treatment_assessments',
    'insurance_coverages'
  ];

  // Customer Onboarding Role Tables
  const customerOnboardingTables = [
    'treatment_center_onboarding',
    'service_providers',
    'service_provider_capabilities',
    'enrollment_templates',
    'saml_providers',
    'sso_providers',
    'voice_providers'
  ];

  // Super Admin Tables (all tables)
  const superAdminTables = [
    // Core System
    'profiles',
    'roles', 
    'user_roles',
    'user_permissions',
    'permissions',
    'role_permissions',
    'modules',
    'facilities',
    'audit_logs',
    'active_issues',
    
    // Patient & Enrollment
    ...patientOnboardingTables,
    
    // Treatment Center & Provider
    ...treatmentCenterTables,
    
    // Services & Integration
    ...customerOnboardingTables,
    
    // Agent System
    'agents',
    'agent_sessions',
    'agent_conversations',
    'agent_templates',
    'agent_workflows',
    
    // API & Integration
    'api_keys',
    'api_endpoints',
    'api_documentation',
    'ai_model_integrations',
    'ai_model_configs'
  ];

  const roleTableMap = {
    patientCaregiver: {
      name: 'Patient/Caregiver',
      icon: <Users className="h-5 w-5" />,
      tables: patientOnboardingTables,
      description: 'Tables accessible during patient enrollment and care management'
    },
    healthcareProvider: {
      name: 'Healthcare Provider',
      icon: <Building2 className="h-5 w-5" />,
      tables: healthcareProviderTables,
      description: 'Tables for clinical workflows, patient management, and provider operations'
    },
    onboardingTeam: {
      name: 'Customer Onboarding Team',
      icon: <FileText className="h-5 w-5" />,
      tables: customerOnboardingTables,
      description: 'Tables for facility onboarding, service configuration, and integration setup'
    },
    superAdmin: {
      name: 'Super Administrator',
      icon: <Shield className="h-5 w-5" />,
      tables: superAdminTables,
      description: 'Full system access to all tables and administrative functions'
    }
  };

  const getTableDescription = (tableName: string): string => {
    const descriptions: Record<string, string> = {
      // Patient Onboarding
      'enrollment_patient_info': 'Core patient demographic and contact information',
      'enrollment_clinical_info': 'Clinical data including medical history and medications',
      'enrollment_insurance_info': 'Insurance coverage and billing information',
      'enrollment_consent': 'Patient consent forms and HIPAA authorizations',
      'enrollment_documents': 'Document management for enrollment process',
      'patient_enrollments': 'Patient enrollment tracking and status management',
      'enrollment_treatment_plan': 'Treatment plans and care coordination',
      'enrollment_collaborations': 'Care team collaboration and communication',
      'enrollment_instances': 'Enrollment session instances and workflow tracking',
      'treatment_assessments': 'Clinical assessments and treatment evaluations',
      
      // Treatment Center & Provider
      'treatment_center_onboarding': 'Treatment center facility onboarding process',
      'provider_profiles': 'Healthcare provider profiles and credentials',
      'npi_verification_results': 'NPI number verification and validation results',
      'clinical_trials': 'Clinical trial management and tracking',
      'service_providers': 'External service provider configurations',
      'service_provider_capabilities': 'Service provider capabilities and offerings',
      'provider_test_configs': 'Provider testing and configuration settings',
      'enrollment_provider_info': 'Provider information within enrollment context',
      
      // Integration & Services
      'enrollment_templates': 'Enrollment form templates and configurations',
      'saml_providers': 'SAML authentication provider configurations',
      'sso_providers': 'Single sign-on provider configurations',
      'voice_providers': 'Voice communication provider settings',
      'insurance_coverages': 'Insurance coverage options and details',
      
      // System Core
      'profiles': 'User profiles and basic information',
      'roles': 'System roles and permissions',
      'user_roles': 'User role assignments',
      'facilities': 'Healthcare facilities and treatment centers',
      'modules': 'System modules and features',
      'audit_logs': 'System audit and activity logs',
      'active_issues': 'System issues and alerts monitoring'
    };
    
    return descriptions[tableName] || 'Database table for healthcare operations';
  };

  const getTableCount = (role: string): number => {
    return roleTableMap[role as keyof typeof roleTableMap]?.tables.length || 0;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6" />
            Healthcare Database Tables by Role
          </CardTitle>
          <CardDescription>
            Comprehensive mapping of database tables accessible by each user role and onboarding process
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patient">Patient Onboarding</TabsTrigger>
          <TabsTrigger value="treatment">Treatment Center</TabsTrigger>
          <TabsTrigger value="provider">Healthcare Provider</TabsTrigger>
          <TabsTrigger value="admin">Super Admin</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(roleTableMap).map(([key, role]) => (
              <Card key={key}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {role.icon}
                    {role.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary mb-2">
                    {role.tables.length}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {role.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="patient" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Patient Onboarding Tables ({patientOnboardingTables.length})
              </CardTitle>
              <CardDescription>
                Tables used for patient enrollment, clinical intake, and care management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Table Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patientOnboardingTables.map((table) => (
                    <TableRow key={table}>
                      <TableCell className="font-mono text-sm">{table}</TableCell>
                      <TableCell>{getTableDescription(table)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">Patient Data</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="treatment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Treatment Center Onboarding Tables ({treatmentCenterTables.length})
              </CardTitle>
              <CardDescription>
                Tables for facility onboarding, provider credentialing, and service setup
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Table Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {treatmentCenterTables.map((table) => (
                    <TableRow key={table}>
                      <TableCell className="font-mono text-sm">{table}</TableCell>
                      <TableCell>{getTableDescription(table)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">Facility</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="provider" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Healthcare Provider Role Tables ({healthcareProviderTables.length})
              </CardTitle>
              <CardDescription>
                Tables accessible to healthcare providers for patient care and clinical workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Table Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Access Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {healthcareProviderTables.map((table) => (
                    <TableRow key={table}>
                      <TableCell className="font-mono text-sm">{table}</TableCell>
                      <TableCell>{getTableDescription(table)}</TableCell>
                      <TableCell>
                        <Badge variant="default">Read/Write</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Super Admin Tables ({superAdminTables.length})
              </CardTitle>
              <CardDescription>
                Complete system access - all tables and administrative functions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { title: 'Core System', tables: ['profiles', 'roles', 'user_roles', 'facilities', 'modules'] },
                  { title: 'Patient Management', tables: patientOnboardingTables.slice(0, 5) },
                  { title: 'Provider & Clinical', tables: ['provider_profiles', 'clinical_trials', 'treatment_assessments'] },
                  { title: 'Integration & Services', tables: ['service_providers', 'api_keys', 'ai_model_integrations'] },
                  { title: 'Monitoring & Audit', tables: ['audit_logs', 'active_issues', 'agent_conversations'] },
                  { title: 'Agent & Workflow', tables: ['agents', 'agent_sessions', 'agent_templates'] }
                ].map((category) => (
                  <Card key={category.title}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">{category.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        {category.tables.map((table) => (
                          <div key={table} className="text-xs font-mono bg-muted p-1 rounded">
                            {table}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DatabaseTableListing;