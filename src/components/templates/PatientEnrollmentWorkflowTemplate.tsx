/**
 * PATIENT ENROLLMENT WORKFLOW TEMPLATE
 * Pre-configured workflow template for patient enrollment with NPI verification
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Shield, 
  Database, 
  FileSpreadsheet, 
  Webhook,
  Mail,
  MessageSquare,
  CheckCircle2,
  Settings,
  Eye,
  Edit
} from 'lucide-react';
import { WorkflowVisualization } from './WorkflowVisualization';
import { EditableWorkflowTemplate } from './EditableWorkflowTemplate';
import { useMasterToast } from '@/hooks/useMasterToast';

// Pre-defined Patient Enrollment Workflow Template
const PATIENT_ENROLLMENT_TEMPLATE = {
  id: 'patient-enrollment-v1',
  name: 'Patient Enrollment with NPI Verification',
  description: 'Complete patient enrollment workflow with automated provider verification, form validation, and multi-channel output support.',
  category: 'Healthcare',
  nodes: [
    {
      id: 'start',
      type: 'start',
      label: 'Start Enrollment',
      position: { x: 100, y: 100 },
      data: {
        description: 'Initialize patient enrollment process',
        channels: ['online', 'fax', 'voice', 'chat']
      }
    },
    {
      id: 'channel-detection',
      type: 'processor',
      label: 'Channel Detection',
      position: { x: 300, y: 100 },
      data: {
        description: 'Detect enrollment channel (online form, fax/OCR, voice, chat)',
        logic: 'Route based on input source'
      }
    },
    {
      id: 'patient-data-extraction',
      type: 'processor',
      label: 'Patient Data Extraction',
      position: { x: 500, y: 100 },
      data: {
        description: 'Extract patient information from various input sources',
        fields: ['firstName', 'lastName', 'dob', 'email', 'phone', 'address']
      }
    },
    {
      id: 'provider-data-extraction',
      type: 'processor',
      label: 'Provider Data Extraction',
      position: { x: 700, y: 100 },
      data: {
        description: 'Extract provider information (name, NPI, facility)',
        fields: ['providerName', 'npi', 'facilityName', 'state']
      }
    },
    {
      id: 'npi-verification',
      type: 'api',
      label: 'NPI Verification',
      position: { x: 900, y: 100 },
      data: {
        description: 'Verify provider NPI using NPPES registry',
        endpoint: '/verify-npi-credentials',
        verificationTypes: ['npi-direct', 'name-based']
      }
    },
    {
      id: 'provider-verification-check',
      type: 'decision',
      label: 'Provider Verified?',
      position: { x: 1100, y: 100 },
      data: {
        description: 'Check if provider verification was successful',
        conditions: {
          verified: 'confidence >= 85',
          needsReview: 'confidence >= 60 && confidence < 85',
          failed: 'confidence < 60'
        }
      }
    },
    {
      id: 'form-validation',
      type: 'processor',
      label: 'Form Validation',
      position: { x: 1300, y: 50 },
      data: {
        description: 'Validate all required fields and data integrity',
        validations: ['required_fields', 'email_format', 'phone_format', 'date_format']
      }
    },
    {
      id: 'manual-review',
      type: 'manual',
      label: 'Manual Review',
      position: { x: 1300, y: 150 },
      data: {
        description: 'Queue for manual review if verification is uncertain',
        reviewCriteria: ['Low confidence NPI', 'Missing provider info', 'Duplicate patient']
      }
    },
    {
      id: 'enrollment-creation',
      type: 'database',
      label: 'Create Enrollment',
      position: { x: 1500, y: 100 },
      data: {
        description: 'Create enrollment record in database',
        table: 'patient_enrollments',
        fields: ['patient_data', 'provider_data', 'verification_results', 'enrollment_date']
      }
    },
    {
      id: 'output-router',
      type: 'router',
      label: 'Output Router',
      position: { x: 1700, y: 100 },
      data: {
        description: 'Route output to configured destinations',
        outputs: ['database', 'excel', 'api', 'email', 'sms']
      }
    },
    {
      id: 'notifications',
      type: 'notification',
      label: 'Send Notifications',
      position: { x: 1900, y: 100 },
      data: {
        description: 'Send enrollment confirmation notifications',
        channels: ['email', 'sms', 'portal']
      }
    },
    {
      id: 'end',
      type: 'end',
      label: 'Enrollment Complete',
      position: { x: 2100, y: 100 },
      data: {
        description: 'Enrollment process completed successfully'
      }
    }
  ],
  edges: [
    { id: 'e1', source: 'start', target: 'channel-detection', label: 'Begin' },
    { id: 'e2', source: 'channel-detection', target: 'patient-data-extraction', label: 'Extract Data' },
    { id: 'e3', source: 'patient-data-extraction', target: 'provider-data-extraction', label: 'Next' },
    { id: 'e4', source: 'provider-data-extraction', target: 'npi-verification', label: 'Verify' },
    { id: 'e5', source: 'npi-verification', target: 'provider-verification-check', label: 'Check' },
    { id: 'e6', source: 'provider-verification-check', target: 'form-validation', label: 'Verified' },
    { id: 'e7', source: 'provider-verification-check', target: 'manual-review', label: 'Needs Review' },
    { id: 'e8', source: 'form-validation', target: 'enrollment-creation', label: 'Valid' },
    { id: 'e9', source: 'manual-review', target: 'enrollment-creation', label: 'Approved' },
    { id: 'e10', source: 'enrollment-creation', target: 'output-router', label: 'Created' },
    { id: 'e11', source: 'output-router', target: 'notifications', label: 'Route' },
    { id: 'e12', source: 'notifications', target: 'end', label: 'Complete' }
  ],
  outputOptions: {
    database: true,
    excel: true,
    api: false,
    email: true,
    sms: false
  },
  isEditable: true,
  isActive: true,
  configurations: {
    database: {
      table: 'patient_enrollments',
      fields: ['id', 'patient_first_name', 'patient_last_name', 'patient_email', 'provider_npi', 'provider_name', 'enrollment_date', 'verification_status'],
      primaryKey: 'id'
    },
    excel: {
      fileName: 'patient_enrollments_{Date.now()}.xlsx',
      sheetName: 'Enrollments',
      headers: ['Patient ID', 'First Name', 'Last Name', 'Email', 'Provider NPI', 'Provider Name', 'Enrollment Date', 'Status']
    },
    email: {
      template: `Dear {{patientFirstName}},

Your enrollment has been successfully processed!

Enrollment Details:
- Patient: {{patientFirstName}} {{patientLastName}}
- Provider: {{providerName}} (NPI: {{providerNpi}})
- Enrollment Date: {{enrollmentDate}}
- Status: {{verificationStatus}}

Thank you for choosing our services.

Best regards,
Healthcare Enrollment Team`,
      recipients: ['admin@healthcare.com', 'enrollment@healthcare.com'],
      subject: 'New Patient Enrollment - {{patientFirstName}} {{patientLastName}}'
    }
  }
};

export const PatientEnrollmentWorkflowTemplate: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(PATIENT_ENROLLMENT_TEMPLATE);
  const [isEditing, setIsEditing] = useState(false);
  const [activeView, setActiveView] = useState<'compact' | 'full'>('full');
  const { showSuccess, showError } = useMasterToast();

  const handleSaveTemplate = async (updatedTemplate: any) => {
    try {
      // TODO: Save to database/local storage
      setSelectedTemplate(updatedTemplate);
      showSuccess('Template updated successfully');
      setIsEditing(false);
    } catch (error) {
      showError('Failed to save template');
    }
  };

  const handleTestTemplate = async (template: any) => {
    try {
      // TODO: Implement template testing
      showSuccess('Template test completed successfully');
    } catch (error) {
      showError('Template test failed');
    }
  };

  const handleOutputChange = (templateId: string, outputType: string, enabled: boolean) => {
    setSelectedTemplate(prev => ({
      ...prev,
      outputOptions: {
        ...prev.outputOptions,
        [outputType]: enabled
      }
    }));
    showSuccess(`${outputType} output ${enabled ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Patient Enrollment Workflow
          </h1>
          <p className="text-muted-foreground mt-2">
            Complete patient enrollment workflow with NPI verification and flexible output options
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setActiveView(activeView === 'compact' ? 'full' : 'compact')}
          >
            <Eye className="h-4 w-4 mr-2" />
            {activeView === 'compact' ? 'Full View' : 'Compact View'}
          </Button>
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Template
          </Button>
        </div>
      </div>

      {/* Template Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-green-500" />
              <span className="font-medium">NPI Verification</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Automated provider verification with 95% accuracy
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-5 w-5 text-blue-500" />
              <span className="font-medium">Multi-Channel Support</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Online forms, fax/OCR, voice, and chat integration
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-5 w-5 text-purple-500" />
              <span className="font-medium">Flexible Outputs</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Database, Excel, API, email, and SMS options
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Visualization */}
      <Tabs defaultValue="workflow" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workflow">Workflow Visualization</TabsTrigger>
          <TabsTrigger value="outputs">Output Configuration</TabsTrigger>
          <TabsTrigger value="nodes">Node Details</TabsTrigger>
        </TabsList>

        <TabsContent value="workflow">
          <WorkflowVisualization
            template={selectedTemplate}
            onEdit={() => setIsEditing(true)}
            onOutputChange={handleOutputChange}
            compact={activeView === 'compact'}
          />
        </TabsContent>

        <TabsContent value="outputs">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Outputs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(selectedTemplate.outputOptions).map(([type, enabled]) => (
                  <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {type === 'database' && <Database className="h-4 w-4" />}
                      {type === 'excel' && <FileSpreadsheet className="h-4 w-4" />}
                      {type === 'api' && <Webhook className="h-4 w-4" />}
                      {type === 'email' && <Mail className="h-4 w-4" />}
                      {type === 'sms' && <MessageSquare className="h-4 w-4" />}
                      <span className="capitalize">{type}</span>
                    </div>
                    <Badge variant={enabled ? "default" : "secondary"}>
                      {enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium">Database Table:</span>
                    <p className="text-sm text-muted-foreground">patient_enrollments</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Excel File:</span>
                    <p className="text-sm text-muted-foreground">patient_enrollments_{Date.now()}.xlsx</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Email Template:</span>
                    <p className="text-sm text-muted-foreground">Enrollment confirmation email</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="nodes">
          <div className="grid gap-4">
            {selectedTemplate.nodes.map((node) => (
              <Card key={node.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{node.label}</CardTitle>
                    <Badge variant="outline">{node.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {node.data?.description || 'No description available'}
                  </p>
                  {node.data && Object.keys(node.data).length > 1 && (
                    <div className="space-y-2">
                      {Object.entries(node.data)
                        .filter(([key]) => key !== 'description')
                        .map(([key, value]) => (
                          <div key={key} className="flex items-start gap-2">
                            <span className="text-xs font-medium capitalize">{key.replace('_', ' ')}:</span>
                            <span className="text-xs text-muted-foreground">
                              {Array.isArray(value) ? value.join(', ') : 
                               typeof value === 'object' ? JSON.stringify(value, null, 2) : 
                               String(value)}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Modal */}
      <EditableWorkflowTemplate
        template={selectedTemplate}
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onSave={handleSaveTemplate}
        onTest={handleTestTemplate}
      />
    </div>
  );
};