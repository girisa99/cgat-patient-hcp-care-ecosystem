import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Cloud, 
  Shield, 
  Activity, 
  Building2, 
  Users, 
  FileText,
  Zap,
  CheckCircle,
  ArrowUpDown
} from 'lucide-react';
import { useMasterToast } from '@/hooks/useMasterToast';

interface ExternalSystem {
  id: string;
  name: string;
  type: 'emr' | 'crm' | 'clinical' | 'business';
  category: 'healthcare' | 'business';
  apiType: 'rest' | 'fhir' | 'soap' | 'hl7';
  dataFormats: string[];
  targetTables: string[];
  complianceLevel: 'hipaa' | 'sox' | 'standard';
  status: 'connected' | 'disconnected' | 'pending';
  description: string;
}

const EXTERNAL_SYSTEMS: ExternalSystem[] = [
  // EMR Systems
  {
    id: 'cerner',
    name: 'Cerner PowerChart',
    type: 'emr',
    category: 'healthcare',
    apiType: 'fhir',
    dataFormats: ['FHIR R4', 'HL7 v2.x'],
    targetTables: ['enrollment_patient_info', 'enrollment_clinical_info'],
    complianceLevel: 'hipaa',
    status: 'disconnected',
    description: 'Patient demographics, clinical data, and medical records'
  },
  {
    id: 'athenahealth',
    name: 'athenahealth EHR',
    type: 'emr',
    category: 'healthcare',
    apiType: 'rest',
    dataFormats: ['JSON', 'XML'],
    targetTables: ['provider_profiles', 'npi_verification_results'],
    complianceLevel: 'hipaa',
    status: 'disconnected',
    description: 'Provider information, NPI verification, and clinical workflows'
  },
  {
    id: 'change-healthcare',
    name: 'Change Healthcare',
    type: 'emr',
    category: 'healthcare',
    apiType: 'rest',
    dataFormats: ['JSON', 'X12 EDI'],
    targetTables: ['enrollment_insurance_info'],
    complianceLevel: 'hipaa',
    status: 'disconnected',
    description: 'Insurance eligibility, claims processing, and coverage verification'
  },

  // Business Systems
  {
    id: 'salesforce',
    name: 'Salesforce Health Cloud',
    type: 'crm',
    category: 'business',
    apiType: 'rest',
    dataFormats: ['JSON', 'SOAP'],
    targetTables: ['provider_profiles', 'patient_enrollments'],
    complianceLevel: 'hipaa',
    status: 'disconnected',
    description: 'Healthcare accounts, patient relationships, and care coordination'
  },
  {
    id: 'veeva-vault',
    name: 'Veeva Vault',
    type: 'clinical',
    category: 'healthcare',
    apiType: 'rest',
    dataFormats: ['JSON', 'CSV'],
    targetTables: ['clinical_trials', 'enrollment_documents'],
    complianceLevel: 'hipaa',
    status: 'disconnected',
    description: 'Clinical trial management, regulatory documents, and compliance'
  },
  {
    id: 'oracle-clinical',
    name: 'Oracle Clinical One',
    type: 'clinical',
    category: 'healthcare',
    apiType: 'rest',
    dataFormats: ['JSON', 'ODM-XML'],
    targetTables: ['clinical_trials', 'enrollment_treatment_plan'],
    complianceLevel: 'hipaa',
    status: 'disconnected',
    description: 'Clinical trial data management and patient randomization'
  },
  {
    id: 'sap-healthcare',
    name: 'SAP for Healthcare',
    type: 'business',
    category: 'business',
    apiType: 'rest',
    dataFormats: ['JSON', 'OData'],
    targetTables: ['patient_enrollments', 'enrollment_insurance_info'],
    complianceLevel: 'sox',
    status: 'disconnected',
    description: 'Financial management, billing, and enterprise resource planning'
  }
];

// Your existing healthcare tables
const HEALTHCARE_TABLES = [
  'clinical_trials',
  'enrollment_clinical_info',
  'enrollment_collaborations', 
  'enrollment_consent',
  'enrollment_documents',
  'enrollment_instances',
  'enrollment_insurance_info',
  'enrollment_patient_info',
  'enrollment_provider_info',
  'enrollment_templates',
  'enrollment_treatment_plan',
  'npi_verification_results',
  'patient_enrollments',
  'provider_profiles',
  'service_providers'
];

interface ExternalSystemsIntegratorProps {
  onIntegrationConfigured?: (systems: ExternalSystem[]) => void;
}

export const ExternalSystemsIntegrator: React.FC<ExternalSystemsIntegratorProps> = ({
  onIntegrationConfigured
}) => {
  const [systems, setSystems] = useState<ExternalSystem[]>(EXTERNAL_SYSTEMS);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const { showSuccess, showError } = useMasterToast();

  const handleSystemConnection = async (system: ExternalSystem) => {
    setIsConnecting(system.id);
    try {
      // Simulate connection process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const updatedSystems = systems.map(s => 
        s.id === system.id 
          ? { ...s, status: 'connected' as const }
          : s
      );
      
      setSystems(updatedSystems);
      onIntegrationConfigured?.(updatedSystems);
      showSuccess(`Successfully connected to ${system.name}`);
    } catch (error) {
      showError(`Failed to connect to ${system.name}`);
    } finally {
      setIsConnecting(null);
    }
  };

  const getSystemIcon = (type: string) => {
    switch (type) {
      case 'emr': return <Activity className="h-4 w-4" />;
      case 'crm': return <Users className="h-4 w-4" />;
      case 'clinical': return <FileText className="h-4 w-4" />;
      case 'business': return <Building2 className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500/20 text-green-700 border-green-300';
      case 'pending': return 'bg-yellow-500/20 text-yellow-700 border-yellow-300';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-300';
    }
  };

  const getComplianceIcon = (level: string) => {
    switch (level) {
      case 'hipaa': return <Shield className="h-4 w-4 text-blue-600" />;
      case 'sox': return <Shield className="h-4 w-4 text-orange-600" />;
      default: return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            External Systems Integration
          </CardTitle>
          <CardDescription>
            Connect to EMR, CRM, and business systems for seamless data exchange with your {HEALTHCARE_TABLES.length} healthcare tables
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {systems.map((system) => (
              <Card key={system.id} className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getSystemIcon(system.type)}
                      <div>
                        <CardTitle className="text-base">{system.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {system.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getComplianceIcon(system.complianceLevel)}
                      <Badge className={getStatusColor(system.status)}>
                        {system.status}
                      </Badge>
                      <Button
                        size="sm"
                        variant={system.status === 'connected' ? 'outline' : 'default'}
                        onClick={() => handleSystemConnection(system)}
                        disabled={!!isConnecting}
                      >
                        {isConnecting === system.id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : system.status === 'connected' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Zap className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="text-sm">
                      <div className="font-medium text-muted-foreground mb-2">Target Healthcare Tables:</div>
                      <div className="flex flex-wrap gap-2">
                        {system.targetTables.map(table => (
                          <Badge key={table} variant="outline" className="text-xs">
                            <ArrowUpDown className="h-3 w-3 mr-1" />
                            {table}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>API: {system.apiType.toUpperCase()}</span>
                      <span>Formats: {system.dataFormats.join(', ')}</span>
                      <span>Compliance: {system.complianceLevel.toUpperCase()}</span>
                    </div>

                    {system.status === 'connected' && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="text-sm text-green-800">
                          ✓ Data synchronization active • Syncing to {system.targetTables.length} tables
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Your Healthcare Database Schema ({HEALTHCARE_TABLES.length} Tables)
          </CardTitle>
          <CardDescription>
            Existing tables ready for external system integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {HEALTHCARE_TABLES.map(table => (
              <Badge key={table} variant="secondary" className="text-xs p-2 justify-center">
                {table}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExternalSystemsIntegrator;