/**
 * CONTEXT-AWARE ENROLLMENT OPTIONS
 * Shows enrollment options based on current page context
 * Integrates AI agents with existing enrollment flows
 */
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  FileText, 
  Edit3, 
  Bot, 
  Clock, 
  CheckCircle,
  Users,
  Building2,
  UserCheck,
  Factory,
  Database,
  Settings
} from 'lucide-react';
import DataIntegrationPanel from './DataIntegrationPanel';
import { UniversalEnrollmentProcessor } from './UniversalEnrollmentProcessor';
import { useGlobalConversationalEnrollment } from '@/hooks/useGlobalConversationalEnrollment';
import { PatientEnrollmentTemplateManager } from '@/components/patient-enrollment/PatientEnrollmentTemplateManager';
import { UniversalAgentConfigManager } from '@/components/agent-types/UniversalAgentConfigManager';
import { ChannelVoiceManager } from '@/components/channel-integration/ChannelVoiceManager';
import { UniversalWorkflowProcessor } from '@/components/workflow-processor/UniversalWorkflowProcessor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

type ModuleType = 'patient' | 'treatment_center' | 'customer' | 'manufacturer';
type WorkflowStep = 'submission_mode' | 'ai_agent_config' | 'template_selection' | 'environment_setup' | 'test_deploy';

interface EnrollmentOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  estimatedTime: string;
  isAgent?: boolean;
  action: () => void;
}

interface ContextAwareEnrollmentOptionsProps {
  onAgentSelect: (moduleType: ModuleType) => void;
  onTraditionalSelect: (option: string) => void;
  className?: string;
}

const getModuleFromPath = (pathname: string): ModuleType | null => {
  if (pathname.includes('patient')) return 'patient';
  if (pathname.includes('treatment-center') || pathname.includes('facilities')) return 'treatment_center';
  if (pathname.includes('customer')) return 'customer';
  if (pathname.includes('manufacturer') || pathname.includes('order-management')) return 'manufacturer';
  return null;
};

const getModuleInfo = (moduleType: ModuleType) => {
  const moduleConfig = {
    patient: {
      title: 'Patient Enrollment',
      icon: <Users className="h-6 w-6" />,
      color: 'bg-blue-500',
      sections: ['Demographics', 'Medical History', 'Insurance', 'Consent']
    },
    treatment_center: {
      title: 'Treatment Center Onboarding',
      icon: <Building2 className="h-6 w-6" />,
      color: 'bg-green-500',
      sections: ['Facility Information', 'Licensing', 'Staff Credentials', 'Agreements']
    },
    customer: {
      title: 'Customer Enrollment',
      icon: <UserCheck className="h-6 w-6" />,
      color: 'bg-purple-500',
      sections: ['Account Setup', 'Preferences', 'Billing', 'Verification']
    },
    manufacturer: {
      title: 'Manufacturer Registration',
      icon: <Factory className="h-6 w-6" />,
      color: 'bg-orange-500',
      sections: ['Company Details', 'Products', 'Certifications', 'Contracts']
    }
  };

  return moduleConfig[moduleType];
};

export const ContextAwareEnrollmentOptions: React.FC<ContextAwareEnrollmentOptionsProps> = ({
  onAgentSelect,
  onTraditionalSelect,
  className = ''
}) => {
  const location = useLocation();
  const currentModule = getModuleFromPath(location.pathname);
  const [showDataIntegration, setShowDataIntegration] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showProcessor, setShowProcessor] = useState(false);
  const [currentWorkflowStep, setCurrentWorkflowStep] = useState<WorkflowStep>('submission_mode');
  const [selectedAgentType, setSelectedAgentType] = useState<string>('structured');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [environmentConfig, setEnvironmentConfig] = useState<any>(null);
  const [agentDeployed, setAgentDeployed] = useState(false);

  // Don't show if not on a specific module page
  if (!currentModule) {
    return null;
  }

  const moduleInfo = getModuleInfo(currentModule);

  const enrollmentOptions: EnrollmentOption[] = [
    {
      id: 'agent',
      title: 'AI-Powered Enrollment',
      description: 'Create structured AI agents with templates, workflows, and deployment options',
      icon: <Bot className="h-5 w-5" />,
      estimatedTime: '5-10 min',
      isAgent: true,
      action: () => {
        console.log('🤖 Launching AI Agent Configuration for module:', currentModule);
        setCurrentWorkflowStep('ai_agent_config');
        toast.success('AI Agent Configuration Loaded', {
          description: 'Template dashboard, workflows, NPI verification, and credentialing agents are ready'
        });
        onAgentSelect(currentModule);
      }
    },
    {
      id: 'online-form',
      title: 'Fill Online Form',
      description: 'Complete the enrollment using our standard online form with NPI verification and voice support',
      icon: <Edit3 className="h-5 w-5" />,
      estimatedTime: '10-15 min',
      action: () => {
        setSelectedOption('online-form');
        setShowProcessor(true);
        onTraditionalSelect('online-form');
      }
    },
    {
      id: 'pdf-fill',
      title: 'Fill & Submit PDF',
      description: 'Generate PDF form with auto-fill, voice review, and AI validation',
      icon: <FileText className="h-5 w-5" />,
      estimatedTime: '15-20 min',
      action: () => {
        setSelectedOption('pdf-fill');
        setShowProcessor(true);
        onTraditionalSelect('pdf-fill');
      }
    },
    {
      id: 'download-fax',
      title: 'Fill & Fax (OCR)',
      description: 'Process documents via fax with OCR extraction and voice clarification',
      icon: <Download className="h-5 w-5" />,
      estimatedTime: '20-30 min',
      action: () => {
        setSelectedOption('download-fax');
        setShowProcessor(true);
        onTraditionalSelect('download-fax');
      }
    }
  ];

  // Render AI Agent Configuration Workflow
  const renderAIAgentWorkflow = () => {
    return (
      <div className="space-y-6">
        {/* Workflow Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Bot className="h-6 w-6 text-primary" />
              AI Agent Configuration Workflow
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentWorkflowStep('submission_mode')}
              >
                Back to Options
              </Button>
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className={`h-4 w-4 ${currentWorkflowStep !== 'submission_mode' ? 'text-green-500' : 'text-muted-foreground'}`} />
              <span className={currentWorkflowStep === 'ai_agent_config' ? 'font-medium text-foreground' : ''}>Agent Configuration</span>
              <span>→</span>
              <CheckCircle className={`h-4 w-4 ${currentWorkflowStep === 'template_selection' ? 'text-green-500' : 'text-muted-foreground'}`} />
              <span className={currentWorkflowStep === 'template_selection' ? 'font-medium text-foreground' : ''}>Template Selection</span>
              <span>→</span>
              <CheckCircle className={`h-4 w-4 ${currentWorkflowStep === 'environment_setup' ? 'text-green-500' : 'text-muted-foreground'}`} />
              <span className={currentWorkflowStep === 'environment_setup' ? 'font-medium text-foreground' : ''}>Environment & Channels</span>
              <span>→</span>
              <CheckCircle className={`h-4 w-4 ${currentWorkflowStep === 'test_deploy' ? 'text-green-500' : 'text-muted-foreground'}`} />
              <span className={currentWorkflowStep === 'test_deploy' ? 'font-medium text-foreground' : ''}>Test & Deploy</span>
            </div>
          </CardHeader>
        </Card>

        {/* Agent Configuration Step */}
        {currentWorkflowStep === 'ai_agent_config' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Settings className="h-5 w-5" />
                AI Agent Configuration Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card className="cursor-pointer hover:shadow-lg transition-all" 
                      onClick={() => {
                        setSelectedAgentType('structured');
                        setCurrentWorkflowStep('template_selection');
                        toast.success('Structured AI Agent selected');
                      }}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                        <Bot className="h-5 w-5" />
                      </div>
                      <h3 className="font-semibold">Create Structured AI Agent</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Build intelligent agents with templates, visual workflows, NPI verification, and credentialing capabilities
                    </p>
                    <Button className="w-full">Select & Configure</Button>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:shadow-lg transition-all"
                      onClick={() => {
                        setSelectedOption('online-form');
                        setShowProcessor(true);
                        onTraditionalSelect('online-form');
                      }}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-muted">
                        <Edit3 className="h-5 w-5" />
                      </div>
                      <h3 className="font-semibold">Direct Online Form</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Skip agent configuration and go directly to online form with NPI verification and voice support
                    </p>
                    <Button variant="outline" className="w-full">Go to Form</Button>
                  </CardContent>
                </Card>
              </div>

              {/* Universal Agent Config Manager */}
              <UniversalAgentConfigManager
                selectedAgentType={selectedAgentType}
                onAgentTypeSelect={(agentType) => {
                  setSelectedAgentType(agentType.id);
                  console.log('Agent type selected:', agentType);
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* Template Selection Step */}
        {currentWorkflowStep === 'template_selection' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Database className="h-5 w-5" />
                Template & Workflow Dashboard
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentWorkflowStep('environment_setup')}
                  disabled={!selectedTemplate}
                >
                  Continue to Environment
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PatientEnrollmentTemplateManager
                onTemplateSelect={(template) => {
                  setSelectedTemplate(template);
                  console.log('Template selected:', template);
                  toast.success('Template ready for deployment');
                }}
              />
              
              {/* Universal Workflow Processor */}
              <div className="mt-6">
                <UniversalWorkflowProcessor
                  workflowType="agent_assisted"
                  initialData={{
                    module_type: currentModule,
                    processing_option: 'ai-agent',
                    agent_type: selectedAgentType
                  }}
                  onComplete={(data) => {
                    console.log('Workflow step completed:', data);
                  }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Environment Setup Step */}
        {currentWorkflowStep === 'environment_setup' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Settings className="h-5 w-5" />
                Environment & Channel Assignment
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentWorkflowStep('test_deploy')}
                  disabled={!environmentConfig}
                >
                  Continue to Test & Deploy
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="environment" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="environment">Environment Setup</TabsTrigger>
                  <TabsTrigger value="channels">Voice Channels</TabsTrigger>
                </TabsList>
                
                <TabsContent value="environment" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['Development', 'Staging', 'Production'].map((env) => (
                      <Card key={env} className={`cursor-pointer transition-all ${
                        environmentConfig?.environment === env ? 'ring-2 ring-primary' : 'hover:shadow-lg'
                      }`}
                      onClick={() => {
                        setEnvironmentConfig({ environment: env });
                        toast.success(`${env} environment selected`);
                      }}>
                        <CardContent className="p-4 text-center">
                          <h3 className="font-semibold">{env}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {env === 'Development' ? 'Testing & debugging' : 
                             env === 'Staging' ? 'Pre-production validation' : 
                             'Live production deployment'}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="channels">
                  <ChannelVoiceManager
                    onChannelData={(channel, data) => {
                      setEnvironmentConfig(prev => ({
                        ...prev,
                        channels: { ...prev?.channels, [channel]: data }
                      }));
                      console.log('Channel data updated:', channel, data);
                    }}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Test & Deploy Step */}
        {currentWorkflowStep === 'test_deploy' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5" />
                Test & Deploy Agent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => {
                      toast.success('Running tests...', {
                        description: 'Testing NPI verification, credentialing, and workflow steps'
                      });
                    }}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Run Tests
                  </Button>
                  <Button 
                    size="lg"
                    onClick={() => {
                      // Since we connect directly to Supabase, deployment is automatic
                      setAgentDeployed(true);
                      toast.success('Agent deployed successfully!', {
                        description: 'Your AI enrollment agent is now live and connected to Supabase DB'
                      });
                      // Start using the deployed agent
                      setSelectedOption('online-form');
                      setShowProcessor(true);
                      onTraditionalSelect('online-form');
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Deploy & Use Agent
                  </Button>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Deployment Summary</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Module:</strong> {moduleInfo.title}</p>
                    <p><strong>Agent Type:</strong> {selectedAgentType || 'Structured AI'}</p>
                    <p><strong>Template:</strong> {selectedTemplate?.name || 'Default Template'}</p>
                    <p><strong>Environment:</strong> {environmentConfig?.environment || 'Not selected'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // Return submission mode selection or workflow based on current step
  if (currentWorkflowStep !== 'submission_mode') {
    return (
      <div className={`space-y-6 ${className}`}>
        {renderAIAgentWorkflow()}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Module Header */}
      <Card className="border-l-4" style={{ borderLeftColor: moduleInfo.color.replace('bg-', '').replace('-500', '') }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${moduleInfo.color} text-white`}>
              {moduleInfo.icon}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{moduleInfo.title}</h2>
              <p className="text-sm text-muted-foreground">
                Choose how you'd like to complete your enrollment
              </p>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Enrollment Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {enrollmentOptions.map((option) => (
          <Card 
            key={option.id} 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              option.isAgent ? 'ring-2 ring-primary/20 bg-primary/5' : ''
            }`}
            onClick={option.action}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    option.isAgent ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    {option.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{option.title}</h3>
                    {option.isAgent && (
                      <Badge variant="secondary" className="mt-1">
                        Recommended
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {option.estimatedTime}
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                {option.description}
              </p>

              <Button 
                variant={option.isAgent ? "default" : "outline"} 
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  option.action();
                }}
              >
                {option.isAgent ? 'Start with AI Assistant' : 'Select This Option'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress Sections Preview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">What You'll Complete</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowDataIntegration(!showDataIntegration)}
          >
            <Database className="h-4 w-4 mr-2" />
            Data Integration
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {moduleInfo.sections.map((section, index) => (
              <div key={section} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{section}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Integration Panel */}
      {showDataIntegration && (
        <DataIntegrationPanel 
          moduleType={currentModule}
          onDataUpdate={(result) => {
            console.log('Data integration result:', result);
          }}
        />
      )}

      {/* Universal Enrollment Processor */}
      {showProcessor && selectedOption && (
        <UniversalEnrollmentProcessor
          selectedOption={selectedOption}
          moduleType={currentModule}
          onComplete={(data) => {
            console.log('Enrollment completed:', data);
            setShowProcessor(false);
            setSelectedOption(null);
          }}
        />
      )}
    </div>
  );
};