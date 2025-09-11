import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Bot, Workflow, Users, Settings, Play, Save, 
  Eye, ArrowRight, CheckCircle, Clock, Stethoscope,
  ShieldCheck, FileText, Database, MessageSquare
} from 'lucide-react';
import { useGlobalAgentGenerator } from '@/hooks/useGlobalAgentGenerator';
import { useWorkflowManager } from '@/hooks/useWorkflowManager';
import { useWorkflowNodes } from '@/hooks/useWorkflowNodes';
import { useMasterToast } from '@/hooks/useMasterToast';
import { supabase } from '@/integrations/supabase/client';

interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  workflow: {
    nodes: any[];
    edges: any[];
  };
  estimatedTime: string;
  complexity: 'Low' | 'Medium' | 'High';
  requiredNodes: string[];
}

interface EnrollmentAgentWorkflowCreatorProps {
  onAgentCreated: (agent: any) => void;
  onClose: () => void;
}

export const EnrollmentAgentWorkflowCreator: React.FC<EnrollmentAgentWorkflowCreatorProps> = ({
  onAgentCreated,
  onClose
}) => {
  const [currentStep, setCurrentStep] = useState<'select' | 'configure' | 'preview' | 'deploy'>('select');
  const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | null>(null);
  const [showWorkflowPreview, setShowWorkflowPreview] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const { addGeneratedAgent } = useGlobalAgentGenerator();
  const { createWorkflow } = useWorkflowManager();
  const { nodeTypes, nodeTypesByCategory } = useWorkflowNodes();
  const { showSuccess, showError } = useMasterToast();

  // Pre-defined agent templates for enrollment workflows
  const enrollmentAgentTemplates: AgentTemplate[] = [
    {
      id: 'patient-enrollment-agent',
      name: 'Patient Enrollment Agent',
      description: 'Comprehensive patient enrollment with demographics, medical history, insurance verification, and consent management',
      category: 'Healthcare',
      icon: Users,
      estimatedTime: '3-5 minutes',
      complexity: 'Medium',
      requiredNodes: ['patient_demographics', 'medical_history', 'insurance_verification', 'consent_management', 'npi_validation'],
      workflow: {
        nodes: [
          {
            id: 'start',
            type: 'start_node',
            position: { x: 100, y: 100 },
            data: { 
              label: 'Start Enrollment',
              description: 'Initiate patient enrollment process'
            }
          },
          {
            id: 'demographics',
            type: 'patient_demographics',
            position: { x: 300, y: 100 },
            data: { 
              label: 'Patient Demographics',
              description: 'Collect patient basic information',
              fields: ['first_name', 'last_name', 'date_of_birth', 'gender', 'address', 'phone', 'email']
            }
          },
          {
            id: 'medical_history',
            type: 'medical_history_collector',
            position: { x: 500, y: 100 },
            data: { 
              label: 'Medical History',
              description: 'Gather comprehensive medical history',
              fields: ['current_medications', 'allergies', 'medical_conditions', 'previous_treatments']
            }
          },
          {
            id: 'insurance',
            type: 'insurance_verification',
            position: { x: 700, y: 100 },
            data: { 
              label: 'Insurance Verification',
              description: 'Verify insurance coverage and benefits',
              fields: ['primary_insurance', 'secondary_insurance', 'member_id', 'group_number']
            }
          },
          {
            id: 'provider_verification',
            type: 'npi_validator',
            position: { x: 300, y: 300 },
            data: { 
              label: 'Provider NPI Verification',
              description: 'Validate provider credentials and licenses',
              fields: ['npi_number', 'state_license', 'dea_number', 'specialties']
            }
          },
          {
            id: 'consent',
            type: 'consent_management',
            position: { x: 500, y: 300 },
            data: { 
              label: 'Consent & Signatures',
              description: 'Manage consent forms and digital signatures',
              fields: ['hipaa_consent', 'treatment_consent', 'financial_agreement', 'signature']
            }
          },
          {
            id: 'completion',
            type: 'workflow_completion',
            position: { x: 700, y: 300 },
            data: { 
              label: 'Enrollment Complete',
              description: 'Finalize enrollment and generate documentation'
            }
          }
        ],
        edges: [
          { id: 'e1', source: 'start', target: 'demographics' },
          { id: 'e2', source: 'demographics', target: 'medical_history' },
          { id: 'e3', source: 'medical_history', target: 'insurance' },
          { id: 'e4', source: 'demographics', target: 'provider_verification' },
          { id: 'e5', source: 'provider_verification', target: 'consent' },
          { id: 'e6', source: 'insurance', target: 'completion' },
          { id: 'e7', source: 'consent', target: 'completion' }
        ]
      }
    },
    {
      id: 'npi-verification-agent',
      name: 'NPI Verification Agent',
      description: 'Specialized agent for comprehensive provider credential verification including NPI, state licenses, and specialties',
      category: 'Compliance',
      icon: ShieldCheck,
      estimatedTime: '1-2 minutes',
      complexity: 'Low',
      requiredNodes: ['npi_validator', 'license_checker', 'specialty_verifier'],
      workflow: {
        nodes: [
          {
            id: 'start',
            type: 'start_node',
            position: { x: 100, y: 100 },
            data: { 
              label: 'Start NPI Verification',
              description: 'Initiate provider credential verification'
            }
          },
          {
            id: 'npi_lookup',
            type: 'npi_validator',
            position: { x: 300, y: 100 },
            data: { 
              label: 'NPI Registry Lookup',
              description: 'Validate NPI against NPPES registry',
              fields: ['npi_number', 'provider_name', 'provider_type']
            }
          },
          {
            id: 'license_verification',
            type: 'license_checker',
            position: { x: 500, y: 100 },
            data: { 
              label: 'State License Verification',
              description: 'Verify active state medical licenses',
              fields: ['state_license_number', 'license_state', 'expiration_date']
            }
          },
          {
            id: 'specialty_check',
            type: 'specialty_verifier',
            position: { x: 700, y: 100 },
            data: { 
              label: 'Specialty Verification',
              description: 'Confirm provider specialties and certifications',
              fields: ['primary_specialty', 'board_certifications', 'taxonomy_codes']
            }
          },
          {
            id: 'compliance_report',
            type: 'report_generator',
            position: { x: 500, y: 300 },
            data: { 
              label: 'Compliance Report',
              description: 'Generate verification status report',
              outputs: ['verification_status', 'compliance_score', 'recommendations']
            }
          }
        ],
        edges: [
          { id: 'e1', source: 'start', target: 'npi_lookup' },
          { id: 'e2', source: 'npi_lookup', target: 'license_verification' },
          { id: 'e3', source: 'license_verification', target: 'specialty_check' },
          { id: 'e4', source: 'specialty_check', target: 'compliance_report' }
        ]
      }
    }
  ];

  const handleTemplateSelect = (template: AgentTemplate) => {
    setSelectedTemplate(template);
    setCurrentStep('configure');
  };

  const handlePreviewWorkflow = () => {
    setShowWorkflowPreview(true);
  };

  const handleCreateAgent = async () => {
    if (!selectedTemplate) return;
    
    setIsCreating(true);
    try {
      // Create workflow in database
      const workflowData = {
        name: selectedTemplate.name,
        description: selectedTemplate.description,
        workflow_data: {
          nodes: selectedTemplate.workflow.nodes,
          edges: selectedTemplate.workflow.edges,
          metadata: {
            template_id: selectedTemplate.id,
            category: selectedTemplate.category,
            complexity: selectedTemplate.complexity,
            estimated_time: selectedTemplate.estimatedTime
          }
        },
        status: 'active',
        template_id: selectedTemplate.id
      };

      await createWorkflow(workflowData);

      // Save as reusable template
      const { data: templateData, error: templateError } = await supabase
        .from('agent_templates')
        .insert({
          name: selectedTemplate.name,
          description: selectedTemplate.description,
          template_type: 'workflow',
          category: selectedTemplate.category.toLowerCase(),
          workflow_data: selectedTemplate.workflow,
          is_default: false,
          complexity: selectedTemplate.complexity.toLowerCase(),
          estimated_setup_time: selectedTemplate.estimatedTime,
          required_nodes: selectedTemplate.requiredNodes,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (templateError) throw templateError;

      // Add to global agent registry
      const generatedAgent = {
        id: `enrollment-${Date.now()}`,
        name: selectedTemplate.name,
        nodes: selectedTemplate.workflow.nodes,
        edges: selectedTemplate.workflow.edges,
        prompt: `You are a ${selectedTemplate.name} specialized in healthcare enrollment processes. Guide users through the enrollment workflow with empathy and accuracy.`,
        provider: 'internal',
        generatedAt: new Date().toISOString()
      };

      addGeneratedAgent(generatedAgent);
      
      showSuccess(`${selectedTemplate.name} created successfully and saved as reusable template!`);
      onAgentCreated(generatedAgent);
      
    } catch (error: any) {
      showError(`Failed to create agent: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-6">
      {[
        { step: 'select', label: 'Select Template', icon: Bot },
        { step: 'configure', label: 'Configure Workflow', icon: Settings },
        { step: 'preview', label: 'Preview & Deploy', icon: Eye },
      ].map(({ step, label, icon: Icon }, index) => (
        <div key={step} className="flex items-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            currentStep === step ? 'bg-primary text-primary-foreground' :
            ['select', 'configure'].indexOf(currentStep) > ['select', 'configure'].indexOf(step) ? 'bg-green-500 text-white' :
            'bg-muted text-muted-foreground'
          }`}>
            <Icon className="w-5 h-5" />
          </div>
          <span className="ml-2 text-sm font-medium">{label}</span>
          {index < 2 && <ArrowRight className="w-4 h-4 mx-4 text-muted-foreground" />}
        </div>
      ))}
    </div>
  );

  const renderTemplateSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Choose Your Enrollment Agent</h2>
        <p className="text-muted-foreground mt-2">
          Select a pre-configured agent template optimized for healthcare enrollment workflows
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {enrollmentAgentTemplates.map((template) => {
          const IconComponent = template.icon;
          
          return (
            <Card 
              key={template.id} 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleTemplateSelect(template)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-8 w-8 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{template.category}</Badge>
                        <Badge variant={
                          template.complexity === 'Low' ? 'default' :
                          template.complexity === 'Medium' ? 'secondary' : 'destructive'
                        }>
                          {template.complexity}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{template.description}</p>
                
                <div>
                  <h4 className="font-medium text-sm mb-2">Workflow Components</h4>
                  <div className="flex flex-wrap gap-1">
                    {template.requiredNodes.slice(0, 3).map((node, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {node.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    ))}
                    {template.requiredNodes.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.requiredNodes.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {template.estimatedTime}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Workflow className="w-4 h-4" />
                    {template.workflow.nodes.length} nodes
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedTemplate && (
        <div className="flex justify-center">
          <Button onClick={() => setCurrentStep('configure')} className="gap-2">
            <Settings className="w-4 h-4" />
            Configure Workflow
          </Button>
        </div>
      )}
    </div>
  );

  const renderWorkflowConfiguration = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Configure Your {selectedTemplate?.name}</h2>
        <p className="text-muted-foreground mt-2">
          Review and customize the workflow before deployment
        </p>
      </div>

      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <selectedTemplate.icon className="w-6 h-6" />
              {selectedTemplate.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Workflow Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {selectedTemplate.workflow.nodes.map((node) => (
                  <div key={node.id} className="p-3 bg-muted rounded-lg">
                    <div className="font-medium text-sm">{node.data.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {node.data.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3">Required Node Types</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {selectedTemplate.requiredNodes.map((nodeType) => {
                  const isAvailable = nodeTypes.some(nt => nt.type_key === nodeType);
                  return (
                    <div key={nodeType} className="flex items-center gap-2 p-2 bg-muted rounded">
                      {isAvailable ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-yellow-600" />
                      )}
                      <span className="text-sm">
                        {nodeType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handlePreviewWorkflow} variant="outline" className="flex-1">
                <Eye className="w-4 h-4 mr-2" />
                Preview Workflow
              </Button>
              <Button onClick={handleCreateAgent} disabled={isCreating} className="flex-1">
                {isCreating ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Deploy Agent
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {renderStepIndicator()}
      
      {currentStep === 'select' && renderTemplateSelection()}
      {currentStep === 'configure' && renderWorkflowConfiguration()}

      {/* Workflow Preview Dialog */}
      <Dialog open={showWorkflowPreview} onOpenChange={setShowWorkflowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Workflow Preview: {selectedTemplate?.name}</DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                This workflow will be executed when the agent processes enrollment requests.
              </div>
              
              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Workflow Steps</h4>
                <div className="space-y-2">
                  {selectedTemplate.workflow.nodes.map((node, index) => (
                    <div key={node.id} className="flex items-center gap-3 p-2 bg-background rounded">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{node.data.label}</div>
                        <div className="text-xs text-muted-foreground">{node.data.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowWorkflowPreview(false)}>
                  Close Preview
                </Button>
                <Button onClick={() => {
                  setShowWorkflowPreview(false);
                  handleCreateAgent();
                }}>
                  Deploy This Workflow
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};