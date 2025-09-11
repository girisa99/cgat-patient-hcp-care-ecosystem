/**
 * EDITABLE WORKFLOW TEMPLATE COMPONENT
 * Allows modification of workflow templates with output options
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Save, 
  X, 
  Plus, 
  Settings, 
  Database,
  FileSpreadsheet,
  Webhook,
  Mail,
  MessageSquare,
  Eye,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { EnhancedWorkflowCanvas } from '@/components/workflow-builder/EnhancedWorkflowCanvas';
import { WorkflowVisualization } from './WorkflowVisualization';
import { useMasterToast } from '@/hooks/useMasterToast';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  nodes: any[];
  edges: any[];
  outputOptions: {
    database: boolean;
    excel: boolean;
    api: boolean;
    email: boolean;
    sms: boolean;
  };
  isEditable: boolean;
  isActive: boolean;
  configurations?: {
    database?: {
      table: string;
      fields: string[];
      primaryKey: string;
    };
    excel?: {
      fileName: string;
      sheetName: string;
      headers: string[];
    };
    api?: {
      endpoint: string;
      method: string;
      headers: Record<string, string>;
    };
    email?: {
      template: string;
      recipients: string[];
      subject: string;
    };
    sms?: {
      template: string;
      provider: string;
    };
  };
}

interface EditableWorkflowTemplateProps {
  template: WorkflowTemplate;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTemplate: WorkflowTemplate) => void;
  onTest?: (template: WorkflowTemplate) => void;
}

export const EditableWorkflowTemplate: React.FC<EditableWorkflowTemplateProps> = ({
  template,
  isOpen,
  onClose,
  onSave,
  onTest
}) => {
  const [editedTemplate, setEditedTemplate] = useState<WorkflowTemplate>(template);
  const [activeTab, setActiveTab] = useState('workflow');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { showSuccess, showError } = useMasterToast();

  const updateTemplate = (updates: Partial<WorkflowTemplate>) => {
    setEditedTemplate(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const updateOutputOption = (type: keyof WorkflowTemplate['outputOptions'], enabled: boolean) => {
    setEditedTemplate(prev => ({
      ...prev,
      outputOptions: {
        ...prev.outputOptions,
        [type]: enabled
      }
    }));
    setHasChanges(true);
  };

  const updateConfiguration = (type: string, config: any) => {
    setEditedTemplate(prev => ({
      ...prev,
      configurations: {
        ...prev.configurations,
        [type]: config
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(editedTemplate);
      setHasChanges(false);
      showSuccess('Template saved successfully');
    } catch (error) {
      showError('Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (onTest) {
      try {
        await onTest(editedTemplate);
        showSuccess('Template test completed');
      } catch (error) {
        showError('Template test failed');
      }
    }
  };

  const getOutputIcon = (type: string) => {
    switch (type) {
      case 'database': return <Database className="h-4 w-4" />;
      case 'excel': return <FileSpreadsheet className="h-4 w-4" />;
      case 'api': return <Webhook className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <MessageSquare className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const renderOutputConfiguration = (type: string) => {
    const config = editedTemplate.configurations?.[type as keyof typeof editedTemplate.configurations];

    switch (type) {
      case 'database': {
        const dbConfig = config as { table?: string; fields?: string[]; primaryKey?: string } | undefined;
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="db-table">Table Name</Label>
              <Input
                id="db-table"
                value={dbConfig?.table || ''}
                onChange={(e) => updateConfiguration('database', { 
                  ...dbConfig, 
                  table: e.target.value 
                })}
                placeholder="enrollments"
              />
            </div>
            <div>
              <Label htmlFor="db-fields">Fields (comma-separated)</Label>
              <Input
                id="db-fields"
                value={dbConfig?.fields?.join(', ') || ''}
                onChange={(e) => updateConfiguration('database', { 
                  ...dbConfig, 
                  fields: e.target.value.split(',').map(f => f.trim()) 
                })}
                placeholder="patient_id, first_name, last_name, email"
              />
            </div>
            <div>
              <Label htmlFor="db-primary">Primary Key</Label>
              <Input
                id="db-primary"
                value={dbConfig?.primaryKey || ''}
                onChange={(e) => updateConfiguration('database', { 
                  ...dbConfig, 
                  primaryKey: e.target.value 
                })}
                placeholder="id"
              />
            </div>
          </div>
        );
      }

      case 'excel': {
        const excelConfig = config as { fileName?: string; sheetName?: string; headers?: string[] } | undefined;
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="excel-file">File Name</Label>
              <Input
                id="excel-file"
                value={excelConfig?.fileName || ''}
                onChange={(e) => updateConfiguration('excel', { 
                  ...excelConfig, 
                  fileName: e.target.value 
                })}
                placeholder="patient_enrollment.xlsx"
              />
            </div>
            <div>
              <Label htmlFor="excel-sheet">Sheet Name</Label>
              <Input
                id="excel-sheet"
                value={excelConfig?.sheetName || ''}
                onChange={(e) => updateConfiguration('excel', { 
                  ...excelConfig, 
                  sheetName: e.target.value 
                })}
                placeholder="Enrollments"
              />
            </div>
            <div>
              <Label htmlFor="excel-headers">Headers (comma-separated)</Label>
              <Input
                id="excel-headers"
                value={excelConfig?.headers?.join(', ') || ''}
                onChange={(e) => updateConfiguration('excel', { 
                  ...excelConfig, 
                  headers: e.target.value.split(',').map(h => h.trim()) 
                })}
                placeholder="Patient ID, First Name, Last Name, Email"
              />
            </div>
          </div>
        );
      }

      case 'api': {
        const apiConfig = config as { endpoint?: string; method?: string; headers?: Record<string, string> } | undefined;
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="api-endpoint">Endpoint URL</Label>
              <Input
                id="api-endpoint"
                value={apiConfig?.endpoint || ''}
                onChange={(e) => updateConfiguration('api', { 
                  ...apiConfig, 
                  endpoint: e.target.value 
                })}
                placeholder="https://api.example.com/enrollments"
              />
            </div>
            <div>
              <Label htmlFor="api-method">HTTP Method</Label>
              <Select
                value={apiConfig?.method || 'POST'}
                onValueChange={(value) => updateConfiguration('api', { 
                  ...apiConfig, 
                  method: value 
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="api-headers">Headers (JSON)</Label>
              <Textarea
                id="api-headers"
                value={JSON.stringify(apiConfig?.headers || {}, null, 2)}
                onChange={(e) => {
                  try {
                    const headers = JSON.parse(e.target.value);
                    updateConfiguration('api', { ...apiConfig, headers });
                  } catch (error) {
                    // Invalid JSON, don't update
                  }
                }}
                placeholder='{"Content-Type": "application/json", "Authorization": "Bearer token"}'
                className="h-24 font-mono"
              />
            </div>
          </div>
        );
      }

      case 'email': {
        const emailConfig = config as { subject?: string; recipients?: string[]; template?: string } | undefined;
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="email-subject">Subject Template</Label>
              <Input
                id="email-subject"
                value={emailConfig?.subject || ''}
                onChange={(e) => updateConfiguration('email', { 
                  ...emailConfig, 
                  subject: e.target.value 
                })}
                placeholder="New Patient Enrollment: {{patientName}}"
              />
            </div>
            <div>
              <Label htmlFor="email-recipients">Recipients (comma-separated)</Label>
              <Input
                id="email-recipients"
                value={emailConfig?.recipients?.join(', ') || ''}
                onChange={(e) => updateConfiguration('email', { 
                  ...emailConfig, 
                  recipients: e.target.value.split(',').map(r => r.trim()) 
                })}
                placeholder="admin@clinic.com, nurse@clinic.com"
              />
            </div>
            <div>
              <Label htmlFor="email-template">Email Template</Label>
              <Textarea
                id="email-template"
                value={emailConfig?.template || ''}
                onChange={(e) => updateConfiguration('email', { 
                  ...emailConfig, 
                  template: e.target.value 
                })}
                placeholder="New patient {{patientName}} has been enrolled..."
                className="h-24"
              />
            </div>
          </div>
        );
      }

      case 'sms': {
        const smsConfig = config as { template?: string; provider?: string } | undefined;
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="sms-template">SMS Template</Label>
              <Textarea
                id="sms-template"
                value={smsConfig?.template || ''}
                onChange={(e) => updateConfiguration('sms', { 
                  ...smsConfig, 
                  template: e.target.value 
                })}
                placeholder="Welcome {{patientName}}! Your enrollment is confirmed."
                className="h-20"
              />
            </div>
            <div>
              <Label htmlFor="sms-provider">SMS Provider</Label>
              <Select
                value={smsConfig?.provider || 'twilio'}
                onValueChange={(value) => updateConfiguration('sms', { 
                  ...smsConfig, 
                  provider: value 
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="twilio">Twilio</SelectItem>
                  <SelectItem value="aws-sns">AWS SNS</SelectItem>
                  <SelectItem value="messagebird">MessageBird</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      }

      default:
        return <div>Configuration not available for this output type.</div>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Edit Template: {editedTemplate.name}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {hasChanges && (
                <Badge variant="secondary">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Unsaved Changes
                </Badge>
              )}
              <Badge variant={editedTemplate.isActive ? "default" : "secondary"}>
                {editedTemplate.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="workflow">Workflow</TabsTrigger>
              <TabsTrigger value="outputs">Output Options</TabsTrigger>
              <TabsTrigger value="config">Configuration</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="workflow" className="flex-1 mt-4">
              <div className="h-full space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="template-name">Template Name</Label>
                    <Input
                      id="template-name"
                      value={editedTemplate.name}
                      onChange={(e) => updateTemplate({ name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="template-category">Category</Label>
                    <Input
                      id="template-category"
                      value={editedTemplate.category}
                      onChange={(e) => updateTemplate({ category: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="template-description">Description</Label>
                  <Textarea
                    id="template-description"
                    value={editedTemplate.description}
                    onChange={(e) => updateTemplate({ description: e.target.value })}
                    className="h-20"
                  />
                </div>
                <div className="border rounded-lg flex-1 min-h-96">
                  <EnhancedWorkflowCanvas
                    initialNodes={editedTemplate.nodes}
                    initialEdges={editedTemplate.edges}
                    onNodesChange={(nodes) => updateTemplate({ nodes })}
                    onEdgesChange={(edges) => updateTemplate({ edges })}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="outputs" className="flex-1 mt-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Output Options</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(editedTemplate.outputOptions).map(([type, enabled]) => (
                      <Card key={type}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {getOutputIcon(type)}
                              <div>
                                <h4 className="font-medium capitalize">{type}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {type === 'database' && 'Store data in database table'}
                                  {type === 'excel' && 'Export data to Excel file'}
                                  {type === 'api' && 'Send data via API call'}
                                  {type === 'email' && 'Send email notifications'}
                                  {type === 'sms' && 'Send SMS notifications'}
                                </p>
                              </div>
                            </div>
                            <Switch
                              checked={enabled}
                              onCheckedChange={(checked) => updateOutputOption(type as any, checked)}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="config" className="flex-1 mt-4">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Output Configuration</h3>
                {Object.entries(editedTemplate.outputOptions)
                  .filter(([, enabled]) => enabled)
                  .map(([type]) => (
                    <Card key={type}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          {getOutputIcon(type)}
                          <span className="capitalize">{type} Configuration</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {renderOutputConfiguration(type)}
                      </CardContent>
                    </Card>
                  ))}
                {Object.values(editedTemplate.outputOptions).every(enabled => !enabled) && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      No output options are enabled. Enable at least one output option in the "Output Options" tab.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>

            <TabsContent value="preview" className="flex-1 mt-4">
              <WorkflowVisualization
                template={editedTemplate}
                showControls={false}
                compact={false}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex items-center gap-2">
            <Switch
              checked={editedTemplate.isActive}
              onCheckedChange={(checked) => updateTemplate({ isActive: checked })}
            />
            <Label>Active Template</Label>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleTest}>
              <Eye className="h-4 w-4 mr-2" />
              Test
            </Button>
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
              {isSaving ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};