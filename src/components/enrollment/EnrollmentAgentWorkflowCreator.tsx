import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Bot, Workflow, Users, Settings, Play, Save, 
  Eye, ArrowRight, CheckCircle, Clock, Stethoscope,
  ShieldCheck, FileText, Database, MessageSquare,
  Phone, Mail, Monitor, Smartphone, Globe
} from 'lucide-react';
import { useGlobalAgentGenerator } from '@/hooks/useGlobalAgentGenerator';
import { useWorkflowManager } from '@/hooks/useWorkflowManager';
import { useWorkflowNodes } from '@/hooks/useWorkflowNodes';
import { useMasterToast } from '@/hooks/useMasterToast';
import { supabase } from '@/integrations/supabase/client';
import { defaultChannels } from '@/components/deployment/DeploymentChannels';

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
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [showWorkflowPreview, setShowWorkflowPreview] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showNPIPrompt, setShowNPIPrompt] = useState(false);
  
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
      requiredNodes: ['consent_management', 'patient_demographics', 'provider_info', 'treatment_center', 'insurance_verification', 'clinical_assessment', 'npi_validation'],
      workflow: {
        nodes: [
          {
            id: 'start',
            type: 'start_node',
            position: { x: 100, y: 50 },
            data: { 
              label: 'Start Enrollment',
              description: 'Initiate patient enrollment process'
            }
          },
          {
            id: 'consent_management',
            type: 'consent_management',
            position: { x: 300, y: 50 },
            data: { 
              label: 'Consent Management',
              description: 'Collect HIPAA consent and enrollment agreements',
              fields: ['hipaa_consent', 'enrollment_agreement', 'privacy_notice', 'digital_signature'],
              mcpConnected: true
            }
          },
          {
            id: 'patient_info',
            type: 'patient_demographics',
            position: { x: 500, y: 50 },
            data: { 
              label: 'Patient Information',
              description: 'Collect comprehensive patient demographics and contact info',
              fields: ['first_name', 'last_name', 'date_of_birth', 'gender', 'address', 'phone', 'email', 'emergency_contact'],
              mcpConnected: true
            }
          },
          {
            id: 'provider_info',
            type: 'provider_collector',
            position: { x: 700, y: 50 },
            data: { 
              label: 'Provider Information',
              description: 'Collect referring provider and primary care physician details',
              fields: ['referring_provider', 'primary_care_physician', 'provider_contact', 'referral_reason'],
              mcpConnected: true,
              npiTrigger: true
            }
          },
          {
            id: 'npi_verification_prompt',
            type: 'conditional_prompt',
            position: { x: 750, y: 150 },
            data: { 
              label: 'NPI Verification Prompt',
              description: 'Prompt user to launch NPI verification if not initially deployed',
              condition: 'provider_info_complete && !npi_agent_deployed',
              promptMessage: 'Would you like to verify provider credentials with NPI verification?'
            }
          },
          {
            id: 'treatment_center',
            type: 'treatment_center_collector',
            position: { x: 300, y: 200 },
            data: { 
              label: 'Treatment Center & Providers',
              description: 'Select treatment facility and assigned care team',
              fields: ['facility_name', 'facility_address', 'care_team', 'attending_physician', 'care_coordinator'],
              mcpConnected: true
            }
          },
          {
            id: 'insurance_verification',
            type: 'insurance_verification',
            position: { x: 500, y: 200 },
            data: { 
              label: 'Insurance Verification',
              description: 'Verify insurance coverage and benefits',
              fields: ['primary_insurance', 'secondary_insurance', 'member_id', 'group_number', 'authorization_required'],
              mcpConnected: true
            }
          },
          {
            id: 'clinical_assessment',
            type: 'clinical_assessment',
            position: { x: 700, y: 200 },
            data: { 
              label: 'Treatment & Clinical Assessment',
              description: 'Comprehensive clinical evaluation and treatment planning',
              fields: ['medical_history', 'current_medications', 'allergies', 'treatment_goals', 'assessment_scores', 'risk_factors'],
              mcpConnected: true
            }
          },
          {
            id: 'submit_enrollment',
            type: 'workflow_completion',
            position: { x: 500, y: 350 },
            data: { 
              label: 'Submit Enrollment',
              description: 'Finalize enrollment and generate all required documentation',
              fields: ['enrollment_summary', 'patient_packet', 'provider_notifications'],
              mcpConnected: true
            }
          }
        ],
        edges: [
          { id: 'e1', source: 'start', target: 'consent_management' },
          { id: 'e2', source: 'consent_management', target: 'patient_info' },
          { id: 'e3', source: 'patient_info', target: 'provider_info' },
          { id: 'e4', source: 'provider_info', target: 'npi_verification_prompt' },
          { id: 'e5', source: 'provider_info', target: 'treatment_center' },
          { id: 'e6', source: 'treatment_center', target: 'insurance_verification' },
          { id: 'e7', source: 'insurance_verification', target: 'clinical_assessment' },
          { id: 'e8', source: 'clinical_assessment', target: 'submit_enrollment' },
          { id: 'e9', source: 'npi_verification_prompt', target: 'treatment_center', type: 'conditional' }
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
        template_id: null
      };

      await createWorkflow(workflowData);

      // Save as reusable template
        const user = (await supabase.auth.getUser()).data.user;
        const { data: templateData, error: templateError } = await supabase
          .from('agent_templates')
          .insert({
            name: selectedTemplate.name,
            description: selectedTemplate.description,
            template_type: 'workflow',
            is_default: false,
            created_by: user?.id,
            configuration: {
              workflow: selectedTemplate.workflow,
              category: selectedTemplate.category,
              complexity: selectedTemplate.complexity,
              estimated_time: selectedTemplate.estimatedTime,
              required_nodes: selectedTemplate.requiredNodes
            }
          })
          .select()
          .single();

      // Create agent deployment records for selected channels
      if (selectedChannels.length > 0) {
        const deploymentPromises = selectedChannels.map(async (channelId) => {
          const channel = defaultChannels.find(c => c.id === channelId);
          return supabase
            .from('agent_channel_deployments')
            .insert({
              agent_id: templateData.id,
              channel_id: channelId,
              channel_type: channel?.type || 'unknown',
              deployment_status: 'active',
              configuration: {
                template_id: selectedTemplate.id,
                workflow_nodes: selectedTemplate.workflow.nodes.length,
                mcp_enabled: true,
                auto_responses: true
              },
              created_by: user?.id
            });
        });

        await Promise.all(deploymentPromises);
      }

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
      
      showSuccess(`${selectedTemplate.name} deployed successfully to ${selectedChannels.length} channel(s)!`);
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
              <Button onClick={() => setCurrentStep('deploy')} className="flex-1">
                <ArrowRight className="w-4 h-4 mr-2" />
                Continue to Deploy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderChannelDeployment = () => {
    const channelIcons = {
      webchat: MessageSquare,
      voice: Phone,
      email: Mail,
      sms: Smartphone,
      web: Globe,
      mobile: Monitor
    };

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Deploy Your {selectedTemplate?.name}</h2>
          <p className="text-muted-foreground mt-2">
            Select communication channels to deploy your agent
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Available Deployment Channels</CardTitle>
            <p className="text-sm text-muted-foreground">
              Choose one or more channels where your agent will be accessible to users
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {defaultChannels.map((channel) => {
                const IconComponent = channelIcons[channel.type] || MessageSquare;
                const isSelected = selectedChannels.includes(channel.id);
                
                return (
                  <div
                    key={channel.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => {
                      setSelectedChannels(prev => 
                        isSelected 
                          ? prev.filter(id => id !== channel.id)
                          : [...prev, channel.id]
                      );
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary/10' : 'bg-muted'}`}>
                        <IconComponent className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{channel.name}</h3>
                          {isSelected && <CheckCircle className="w-4 h-4 text-primary" />}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {channel.description}
                        </p>
                        {channel.type === 'webchat' && (
                          <div className="mt-2">
                            <Badge variant="secondary" className="text-xs">
                              Pre-configured with MCP database connections
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedChannels.length > 0 && (
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">Agent Configuration Summary</h4>
                <div className="space-y-2 text-sm">
                  <p>• <strong>Template:</strong> {selectedTemplate?.name}</p>
                  <p>• <strong>Nodes:</strong> {selectedTemplate?.workflow.nodes.length} workflow steps</p>
                  <p>• <strong>MCP Connections:</strong> Pre-configured database and API integrations</p>
                  <p>• <strong>Channels:</strong> {selectedChannels.length} selected</p>
                  <p>• <strong>NPI Integration:</strong> {selectedTemplate?.id === 'patient-enrollment-agent' ? 'Conditional prompt during provider info' : 'Not applicable'}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <Button 
                onClick={() => setCurrentStep('configure')} 
                variant="outline" 
                className="flex-1"
              >
                <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                Back to Configure
              </Button>
              <Button 
                onClick={handleCreateAgent} 
                disabled={isCreating || selectedChannels.length === 0} 
                className="flex-1"
              >
                {isCreating ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Deploy Agent ({selectedChannels.length} channels)
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {selectedTemplate?.id === 'patient-enrollment-agent' && (
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-900">NPI Verification Integration</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    During the Provider Information step, users will be prompted to launch NPI verification 
                    if the NPI Verification Agent wasn't initially deployed. This ensures provider 
                    credentials can be verified on-demand during enrollment.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {renderStepIndicator()}
      
      {currentStep === 'select' && renderTemplateSelection()}
      {currentStep === 'configure' && renderWorkflowConfiguration()}
      {currentStep === 'deploy' && renderChannelDeployment()}

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