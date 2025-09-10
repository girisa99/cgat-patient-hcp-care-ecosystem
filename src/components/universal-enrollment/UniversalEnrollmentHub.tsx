/**
 * UNIVERSAL ENROLLMENT HUB
 * Central hub for all module enrollment types with data import capabilities
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building2, 
  UserPlus, 
  Factory, 
  Users, 
  FileSpreadsheet, 
  Database, 
  Upload,
  FolderOpen,
  Settings,
  BarChart3
} from 'lucide-react';
import { ModuleEnrollmentForm } from './ModuleEnrollmentForm';
import { EnrollmentDataImport } from './EnrollmentDataImport';
import { EnrollmentTemplateManager } from './EnrollmentTemplateManager';
import { useUniversalEnrollment } from '@/hooks/useUniversalEnrollment';

type ModuleType = 'patient' | 'treatment_center' | 'customer' | 'manufacturer';

interface ModuleConfig {
  type: ModuleType;
  name: string;
  icon: React.ReactNode;
  description: string;
  storageFolder: string;
  documentTypes: string[];
}

const MODULE_CONFIGS: Record<ModuleType, ModuleConfig> = {
  patient: {
    type: 'patient',
    name: 'Patient Enrollment',
    icon: <UserPlus className="h-5 w-5" />,
    description: 'Patient onboarding and medical enrollment',
    storageFolder: 'patient-enrollment',
    documentTypes: ['enrollment_form', 'medical_records', 'insurance_cards', 'consent_forms']
  },
  treatment_center: {
    type: 'treatment_center',
    name: 'Treatment Center Onboarding',
    icon: <Building2 className="h-5 w-5" />,
    description: 'Healthcare facility credentialing and setup',
    storageFolder: 'treatment-center-onboarding',
    documentTypes: ['license_documents', 'accreditation_certificates', 'staff_credentials', 'facility_contracts']
  },
  customer: {
    type: 'customer',
    name: 'Customer Onboarding',
    icon: <Users className="h-5 w-5" />,
    description: 'Business customer account setup',
    storageFolder: 'customer-onboarding',
    documentTypes: ['business_license', 'tax_documents', 'contracts', 'compliance_certificates']
  },
  manufacturer: {
    type: 'manufacturer',
    name: 'Manufacturer Onboarding',
    icon: <Factory className="h-5 w-5" />,
    description: 'Supplier and manufacturer registration',
    storageFolder: 'manufacturer-onboarding',
    documentTypes: ['fda_approvals', 'iso_certificates', 'quality_documents', 'product_catalogs']
  }
};

export const UniversalEnrollmentHub: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<ModuleType>('patient');
  const [currentView, setCurrentView] = useState<'dashboard' | 'new_enrollment' | 'import_data' | 'templates' | 'analytics'>('dashboard');
  const [selectedInstance, setSelectedInstance] = useState<string | null>(null);

  const {
    templates,
    instances,
    loading,
    error,
    fetchTemplates,
    fetchInstances,
    createInstance,
    updateInstance,
    deleteInstance
  } = useUniversalEnrollment();

  useEffect(() => {
    fetchTemplates(selectedModule);
    fetchInstances(selectedModule);
  }, [selectedModule]);

  const moduleConfig = MODULE_CONFIGS[selectedModule];
  const moduleInstances = instances.filter(instance => instance.module_type === selectedModule);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'review_needed': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 20) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Module Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <Badge variant="secondary">{moduleInstances.length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{moduleInstances.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Badge className="bg-blue-100 text-blue-800">
              {moduleInstances.filter(i => i.status === 'in_progress').length}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {moduleInstances.filter(i => i.status === 'in_progress').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Badge className="bg-green-100 text-green-800">
              {moduleInstances.filter(i => i.status === 'completed').length}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {moduleInstances.filter(i => i.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Review Needed</CardTitle>
            <Badge className="bg-yellow-100 text-yellow-800">
              {moduleInstances.filter(i => i.status === 'review_needed').length}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {moduleInstances.filter(i => i.status === 'review_needed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Enrollments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent {moduleConfig.name} Enrollments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {moduleInstances.slice(0, 10).map((instance) => (
              <div key={instance.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  {moduleConfig.icon}
                  <div>
                    <h4 className="font-medium">
                      {instance.enrollment_data?.name || 
                       instance.enrollment_data?.companyName || 
                       instance.enrollment_data?.facilityName || 
                       instance.enrollment_data?.manufacturerName ||
                       `${selectedModule} ${instance.id.slice(0, 8)}`}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Method: {instance.submission_method} | Created: {new Date(instance.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getProgressColor(instance.progress)}`}
                        style={{ width: `${instance.progress}%` }}
                      />
                    </div>
                    <span className="text-sm">{instance.progress}%</span>
                  </div>
                  <Badge className={getStatusColor(instance.status)}>
                    {instance.status.replace('_', ' ')}
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedInstance(instance.id);
                      setCurrentView('new_enrollment');
                    }}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            ))}
            {moduleInstances.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No {moduleConfig.name.toLowerCase()} enrollments found.
                <br />
                <Button 
                  className="mt-4" 
                  onClick={() => setCurrentView('new_enrollment')}
                >
                  Create First Enrollment
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Document Storage Organization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Document Storage Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Storage Organization for {moduleConfig.name}</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>📁 /{moduleConfig.storageFolder}/</div>
                <div className="ml-4">📁 online/ - Forms submitted online</div>
                <div className="ml-4">📁 fax/ - Documents received via fax</div>
                <div className="ml-4">📁 pdf/ - PDF submissions</div>
                <div className="ml-4">📁 api/ - Documents from API integrations</div>
                <div className="ml-4">📁 csv-imports/ - Bulk import documents</div>
                <div className="ml-4">📁 signatures/ - Signature files</div>
                <div className="ml-4">📁 final/ - Completed enrollment packages</div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {moduleConfig.documentTypes.map((docType) => (
                <div key={docType} className="p-3 border rounded-lg text-center">
                  <FileSpreadsheet className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="text-sm font-medium">{docType.replace('_', ' ')}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with Module Selection */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Universal Enrollment System</h1>
          <p className="text-muted-foreground">
            Comprehensive enrollment management across all modules with advanced data import
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedModule} onValueChange={(value: ModuleType) => setSelectedModule(value)}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(MODULE_CONFIGS).map((config) => (
                <SelectItem key={config.type} value={config.type}>
                  <div className="flex items-center gap-2">
                    {config.icon}
                    {config.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Module Info Card */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              {moduleConfig.icon}
            </div>
            <div>
              <h3 className="font-semibold">{moduleConfig.name}</h3>
              <p className="text-sm text-muted-foreground">{moduleConfig.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <Tabs value={currentView} onValueChange={(value: any) => setCurrentView(value)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="new_enrollment">New Enrollment</TabsTrigger>
          <TabsTrigger value="import_data">Import Data</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          {renderDashboard()}
        </TabsContent>

        <TabsContent value="new_enrollment">
          <ModuleEnrollmentForm
            moduleType={selectedModule}
            instanceId={selectedInstance}
            onComplete={() => {
              setCurrentView('dashboard');
              setSelectedInstance(null);
              fetchInstances(selectedModule);
            }}
            onCancel={() => {
              setCurrentView('dashboard');
              setSelectedInstance(null);
            }}
          />
        </TabsContent>

        <TabsContent value="import_data">
          <EnrollmentDataImport
            moduleType={selectedModule}
            onImportComplete={() => {
              fetchInstances(selectedModule);
            }}
          />
        </TabsContent>

        <TabsContent value="templates">
          <EnrollmentTemplateManager
            moduleType={selectedModule}
            templates={templates}
            onTemplateChange={() => fetchTemplates(selectedModule)}
            onTemplateCreate={createTemplate}
            onTemplateUpdate={updateTemplate}
            onTemplateDelete={deleteTemplate}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {moduleConfig.name} Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Analytics dashboard for {moduleConfig.name.toLowerCase()} coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};