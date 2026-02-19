import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Workflow, 
  Edit, 
  Eye, 
  Download, 
  Settings,
  Database,
  Mail,
  MessageSquare,
  FileText,
  Bot,
  Brain,
  Send
} from 'lucide-react';
import { WorkflowVisualization } from '@/components/templates/WorkflowVisualization';
import { EditableWorkflowTemplate } from '@/components/templates/EditableWorkflowTemplate';
import { toast } from 'sonner';

interface EnrollmentTemplate {
  id: string;
  name: string;
  description: string;
  agent_type: 'conversational' | 'structured' | 'traditional_form' | 'fax' | 'pdf';
  workflow_nodes: any[];
  workflow_edges: any[];
  output_config: {
    database: boolean;
    excel: boolean;
    api: boolean;
    email: boolean;
    sms: boolean;
  };
  audit_enabled: boolean;
  llm_config?: {
    provider: string;
    model: string;
    conversation_style: string;
  };
  label_studio_enabled: boolean;
  created_at: string;
  last_modified: string;
}

const SAMPLE_TEMPLATES: EnrollmentTemplate[] = [
  {
    id: 'conv-001',
    name: 'Conversational AI Enrollment',
    description: 'Natural conversation-based enrollment with real-time data extraction and audit trails',
    agent_type: 'conversational',
    workflow_nodes: [
      { id: 'start', type: 'conversation', data: { label: 'Welcome & Introduction' } },
      { id: 'personal', type: 'data_capture', data: { label: 'Personal Information' } },
      { id: 'medical', type: 'data_capture', data: { label: 'Medical History' } },
      { id: 'insurance', type: 'data_capture', data: { label: 'Insurance Details' } },
      { id: 'consent', type: 'consent', data: { label: 'Consent & Agreements' } },
      { id: 'submit', type: 'output', data: { label: 'Submit & Store' } }
    ],
    workflow_edges: [
      { id: 'e1', source: 'start', target: 'personal' },
      { id: 'e2', source: 'personal', target: 'medical' },
      { id: 'e3', source: 'medical', target: 'insurance' },
      { id: 'e4', source: 'insurance', target: 'consent' },
      { id: 'e5', source: 'consent', target: 'submit' }
    ],
    output_config: {
      database: true,
      excel: true,
      api: true,
      email: true,
      sms: false
    },
    audit_enabled: true,
    llm_config: {
      provider: 'openai',
      model: 'gpt-4o',
      conversation_style: 'empathetic'
    },
    label_studio_enabled: true,
    created_at: '2024-01-15',
    last_modified: '2024-01-20'
  },
  {
    id: 'struct-001',
    name: 'Structured AI Enrollment',
    description: 'Step-by-step guided enrollment with AI assistance and validation',
    agent_type: 'structured',
    workflow_nodes: [
      { id: 'intro', type: 'intro', data: { label: 'Introduction Screen' } },
      { id: 'step1', type: 'form_section', data: { label: 'Demographics' } },
      { id: 'step2', type: 'form_section', data: { label: 'Contact Information' } },
      { id: 'step3', type: 'form_section', data: { label: 'Medical History' } },
      { id: 'validate', type: 'validation', data: { label: 'AI Validation' } },
      { id: 'review', type: 'review', data: { label: 'Review & Submit' } }
    ],
    workflow_edges: [
      { id: 'e1', source: 'intro', target: 'step1' },
      { id: 'e2', source: 'step1', target: 'step2' },
      { id: 'e3', source: 'step2', target: 'step3' },
      { id: 'e4', source: 'step3', target: 'validate' },
      { id: 'e5', source: 'validate', target: 'review' }
    ],
    output_config: {
      database: true,
      excel: false,
      api: true,
      email: true,
      sms: true
    },
    audit_enabled: true,
    label_studio_enabled: false,
    created_at: '2024-01-10',
    last_modified: '2024-01-18'
  },
  {
    id: 'form-001',
    name: 'Traditional Form Enrollment',
    description: 'Classic web form with basic validation and submission',
    agent_type: 'traditional_form',
    workflow_nodes: [
      { id: 'form', type: 'web_form', data: { label: 'Enrollment Form' } },
      { id: 'validate', type: 'validation', data: { label: 'Form Validation' } },
      { id: 'submit', type: 'submission', data: { label: 'Submit Form' } }
    ],
    workflow_edges: [
      { id: 'e1', source: 'form', target: 'validate' },
      { id: 'e2', source: 'validate', target: 'submit' }
    ],
    output_config: {
      database: true,
      excel: true,
      api: false,
      email: true,
      sms: false
    },
    audit_enabled: false,
    label_studio_enabled: false,
    created_at: '2024-01-05',
    last_modified: '2024-01-12'
  },
  {
    id: 'fax-001',
    name: 'Fax Processing Enrollment',
    description: 'Automated fax processing with OCR and data extraction',
    agent_type: 'fax',
    workflow_nodes: [
      { id: 'receive', type: 'fax_receive', data: { label: 'Receive Fax' } },
      { id: 'ocr', type: 'ocr_process', data: { label: 'OCR Processing' } },
      { id: 'extract', type: 'data_extraction', data: { label: 'Data Extraction' } },
      { id: 'validate', type: 'human_validation', data: { label: 'Human Validation' } },
      { id: 'store', type: 'storage', data: { label: 'Store Data' } }
    ],
    workflow_edges: [
      { id: 'e1', source: 'receive', target: 'ocr' },
      { id: 'e2', source: 'ocr', target: 'extract' },
      { id: 'e3', source: 'extract', target: 'validate' },
      { id: 'e4', source: 'validate', target: 'store' }
    ],
    output_config: {
      database: true,
      excel: true,
      api: true,
      email: true,
      sms: false
    },
    audit_enabled: true,
    label_studio_enabled: true,
    created_at: '2024-01-08',
    last_modified: '2024-01-16'
  },
  {
    id: 'pdf-001',
    name: 'PDF Processing Enrollment',
    description: 'PDF form processing with intelligent field extraction',
    agent_type: 'pdf',
    workflow_nodes: [
      { id: 'upload', type: 'pdf_upload', data: { label: 'PDF Upload' } },
      { id: 'parse', type: 'pdf_parsing', data: { label: 'PDF Parsing' } },
      { id: 'extract', type: 'field_extraction', data: { label: 'Field Extraction' } },
      { id: 'verify', type: 'verification', data: { label: 'Data Verification' } },
      { id: 'process', type: 'processing', data: { label: 'Process Enrollment' } }
    ],
    workflow_edges: [
      { id: 'e1', source: 'upload', target: 'parse' },
      { id: 'e2', source: 'parse', target: 'extract' },
      { id: 'e3', source: 'extract', target: 'verify' },
      { id: 'e4', source: 'verify', target: 'process' }
    ],
    output_config: {
      database: true,
      excel: false,
      api: true,
      email: true,
      sms: false
    },
    audit_enabled: true,
    label_studio_enabled: true,
    created_at: '2024-01-12',
    last_modified: '2024-01-19'
  }
];

interface PatientEnrollmentTemplateManagerProps {
  onTemplateSelect?: (template: EnrollmentTemplate) => void;
}

export const PatientEnrollmentTemplateManager: React.FC<PatientEnrollmentTemplateManagerProps> = ({
  onTemplateSelect
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<EnrollmentTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<EnrollmentTemplate | null>(null);
  const [viewMode, setViewMode] = useState<'compact' | 'full'>('compact');
  const [selectedAgentType, setSelectedAgentType] = useState<string>('all');

  const getAgentTypeIcon = (type: string) => {
    switch (type) {
      case 'conversational': return <Bot className="h-4 w-4" />;
      case 'structured': return <Brain className="h-4 w-4" />;
      case 'traditional_form': return <FileText className="h-4 w-4" />;
      case 'fax': return <Send className="h-4 w-4" />;
      case 'pdf': return <FileText className="h-4 w-4" />;
      default: return <Workflow className="h-4 w-4" />;
    }
  };

  const getAgentTypeColor = (type: string) => {
    switch (type) {
      case 'conversational': return 'bg-blue-100 text-blue-800';
      case 'structured': return 'bg-purple-100 text-purple-800';
      case 'traditional_form': return 'bg-green-100 text-green-800';
      case 'fax': return 'bg-orange-100 text-orange-800';
      case 'pdf': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTemplates = selectedAgentType === 'all' 
    ? SAMPLE_TEMPLATES 
    : SAMPLE_TEMPLATES.filter(t => t.agent_type === selectedAgentType);

  const handleTemplateSelect = (template: EnrollmentTemplate) => {
    setSelectedTemplate(template);
    if (onTemplateSelect) {
      onTemplateSelect(template);
    }
    toast.success(`Selected template: ${template.name}`);
  };

  const handleEdit = (template: EnrollmentTemplate) => {
    setEditingTemplate(template);
  };

  const handleDownload = (template: EnrollmentTemplate) => {
    const data = JSON.stringify(template, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name.replace(/\s+/g, '_').toLowerCase()}_template.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Template downloaded');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Enrollment Templates</h2>
          <p className="text-muted-foreground">
            Choose from pre-configured enrollment workflows for different agent types
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedAgentType}
            onChange={(e) => setSelectedAgentType(e.target.value)}
            className="px-3 py-2 border border-input bg-background rounded-md"
          >
            <option value="all">All Agent Types</option>
            <option value="conversational">Conversational AI</option>
            <option value="structured">Structured AI</option>
            <option value="traditional_form">Traditional Forms</option>
            <option value="fax">Fax Processing</option>
            <option value="pdf">PDF Processing</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'compact' ? 'full' : 'compact')}
          >
            {viewMode === 'compact' ? 'Full View' : 'Compact View'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className={selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getAgentTypeIcon(template.agent_type)}
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                  </div>
                  <Badge className={`${getAgentTypeColor(template.agent_type)} flex items-center gap-1`}>
                    {template.agent_type.replace('_', ' ')}
                  </Badge>
                  {template.audit_enabled && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Database className="h-3 w-3" />
                      Audit
                    </Badge>
                  )}
                  {template.label_studio_enabled && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      Label Studio
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(template)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(template)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    Use Template
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{template.description}</p>
              
              {viewMode === 'full' && (
                <Tabs defaultValue="workflow" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="workflow">Workflow</TabsTrigger>
                    <TabsTrigger value="output">Output Config</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="workflow" className="mt-4">
                    <div className="h-64">
                      <WorkflowVisualization
                        template={{
                          id: template.id,
                          name: template.name,
                          description: template.description,
                          category: template.agent_type,
                          nodes: template.workflow_nodes,
                          edges: template.workflow_edges,
                          outputOptions: {
                            database: template.output_config.database,
                            excel: template.output_config.excel,
                            api: template.output_config.api,
                            email: template.output_config.email,
                            sms: template.output_config.sms
                          },
                          isEditable: true,
                          isActive: true
                        }}
                        showControls={false}
                        compact={true}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="output" className="mt-4">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {Object.entries(template.output_config).map(([key, enabled]) => (
                        <div key={key} className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className="text-sm capitalize">{key}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="settings" className="mt-4">
                    <div className="space-y-3">
                      {template.llm_config && (
                        <div>
                          <h4 className="font-medium">LLM Configuration</h4>
                          <div className="text-sm text-muted-foreground">
                            Provider: {template.llm_config.provider} | 
                            Model: {template.llm_config.model} |
                            Style: {template.llm_config.conversation_style}
                          </div>
                        </div>
                      )}
                      <div className="flex gap-4 text-sm">
                        <span>Nodes: {template.workflow_nodes.length}</span>
                        <span>Connections: {template.workflow_edges.length}</span>
                        <span>Modified: {template.last_modified}</span>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
              
              {viewMode === 'compact' && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex gap-4">
                    <span>{template.workflow_nodes.length} nodes</span>
                    <span>{template.workflow_edges.length} connections</span>
                  </div>
                  <span>Modified: {template.last_modified}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Template Modal */}
      {editingTemplate && (
        <EditableWorkflowTemplate
          template={{
            id: editingTemplate.id,
            name: editingTemplate.name,
            description: editingTemplate.description,
            category: editingTemplate.agent_type,
            nodes: editingTemplate.workflow_nodes,
            edges: editingTemplate.workflow_edges,
            outputOptions: {
              database: editingTemplate.output_config.database,
              excel: editingTemplate.output_config.excel,
              api: editingTemplate.output_config.api,
              email: editingTemplate.output_config.email,
              sms: editingTemplate.output_config.sms
            },
            isEditable: true,
            isActive: true
          }}
          isOpen={!!editingTemplate}
          onClose={() => setEditingTemplate(null)}
          onSave={(updatedTemplate) => {
            console.log('Template updated:', updatedTemplate);
            toast.success('Template updated successfully');
            setEditingTemplate(null);
          }}
        />
      )}
    </div>
  );
};