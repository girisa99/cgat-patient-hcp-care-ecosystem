import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Steps, Step } from '@/components/ui/steps';
import { EnhancedAgentCanvas } from './EnhancedAgentCanvas';
import { EnhancedKnowledgeBase } from '@/components/rag/EnhancedKnowledgeBase';
import { AgentTemplates } from './AgentTemplates';
import { AgentDeployment } from './AgentDeployment';
import { RAGComplianceWorkflow } from '@/components/rag/RAGComplianceWorkflow';
import { AIModelSelector } from './AIModelSelector';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { CircleCheckBig, AlertTriangle, Bot, Settings, Users, CheckCircle } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  logo_url?: string;
  tagline: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  configuration: any;
}

interface WizardState {
  step: number;
  startOption: 'template' | 'scratch' | null;
  templateId: string | null;
  name: string;
  description: string;
  brand: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoFile: File | null;
  logoUrl: string;
  knowledgeBaseIds: string[];
  connectorIds: string[];
  agentType: 'single' | 'multiple';
  isFirstTime: boolean;
  deploymentConfig: {
    parallel: boolean;
    compliance: boolean;
    monitoring: boolean;
    autoScaling: boolean;
  };
}

export const AgentCreationWizard = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<WizardState>({
    step: 0,
    startOption: null,
    templateId: null,
    name: '',
    description: '',
    brand: '',
    tagline: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    accentColor: '#06b6d4',
    logoFile: null,
    logoUrl: '',
    knowledgeBaseIds: [],
    connectorIds: [],
    agentType: 'single',
    isFirstTime: localStorage.getItem('agent_creation_tutorial') !== 'completed',
    deploymentConfig: {
      parallel: false,
      compliance: true,
      monitoring: true,
      autoScaling: false
    }
  });

  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showAIModelSelector, setShowAIModelSelector] = useState(false);
  const [selectedAIModels, setSelectedAIModels] = useState<string[]>([]);
  
  // Fetch templates on component mount
  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('agent_templates')
          .select('*')
          .order('name');
        
        if (error) throw error;
        setTemplates(data || []);
      } catch (error) {
        console.error('Error fetching templates:', error);
        toast({
          title: 'Error',
          description: 'Failed to load agent templates',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  // Step change handler
  const handleStepChange = (newStep: number) => {
    // Only allow moving forward if current step is complete
    if (newStep > state.step) {
      if (!isStepComplete(state.step)) {
        toast({
          title: 'Incomplete Step',
          description: 'Please complete the current step before proceeding',
          variant: 'default'
        });
        return;
      }
    }
    setState({ ...state, step: newStep });
  };

  // Check if current step is complete
  const isStepComplete = (step: number) => {
    switch (step) {
      case 0: // Start preference
        return state.startOption !== null;
      case 1: // Template/Agent type selection
        return state.startOption === 'template' ? state.templateId !== null : (state.name !== '' && state.agentType !== null);
      case 2: // Canvas customization
        return state.name !== '' && state.tagline !== '';
      case 3: // Connectors & templates (if needed)
        return true; // Optional
      case 4: // Knowledge Base
        return true; // Optional
      case 5: // RAG & Compliance
        return true; // Optional
      case 6: // Deployment
        return true; // Configuration is always valid
      default:
        return false;
    }
  };

  // Template selection handler
  const handleSelectTemplate = (templateId: string) => {
    const selectedTemplate = templates.find(t => t.id === templateId);
    if (selectedTemplate) {
      setState({
        ...state,
        templateId,
        name: selectedTemplate.name,
        description: selectedTemplate.description || '',
        tagline: selectedTemplate.tagline || '',
        primaryColor: selectedTemplate.primary_color,
        secondaryColor: selectedTemplate.secondary_color,
        accentColor: selectedTemplate.accent_color,
        logoUrl: selectedTemplate.logo_url || '',
      });
    }
  };

  // Connector selection handler
  const handleConnectorChange = (ids: string[]) => {
    setState({ ...state, connectorIds: ids });
  };

  // Start option handler
  const handleStartOption = (option: 'template' | 'scratch') => {
    setState({ ...state, startOption: option });
  };

  // Mark tutorial as completed
  const completeTutorial = () => {
    localStorage.setItem('agent_creation_tutorial', 'completed');
    setState({ ...state, isFirstTime: false });
  };

  // Custom fields update handler
  const updateField = (field: keyof WizardState, value: any) => {
    setState({ ...state, [field]: value });
  };

  // Knowledge base update handler
  const handleKnowledgeBaseChange = (ids: string[]) => {
    setState({ ...state, knowledgeBaseIds: ids });
  };

  // Deployment config update handler
  const handleDeploymentConfigChange = (config: Partial<WizardState['deploymentConfig']>) => {
    setState({ 
      ...state, 
      deploymentConfig: { ...state.deploymentConfig, ...config } 
    });
  };

  // Create agent handler
  const handleCreateAgent = async () => {
    setIsSaving(true);
    try {
      // 1. Upload logo if exists
      let logoUrl = state.logoUrl;
      if (state.logoFile) {
        const fileExt = state.logoFile.name.split('.').pop();
        const filePath = `agent-logos/${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('agents')
          .upload(filePath, state.logoFile);
        
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage.from('agents').getPublicUrl(filePath);
        logoUrl = data.publicUrl;
      }

      // 2. Create the agent
      const { data: agent, error: agentError } = await supabase
        .from('agents')
        .insert({
          name: state.name,
          description: state.description,
          brand: state.brand || state.name,
          purpose: state.description,
          agent_type: 'ai',
          template_id: state.templateId,
          configuration: {
            logoUrl,
            tagline: state.tagline,
            primaryColor: state.primaryColor,
            secondaryColor: state.secondaryColor,
            accentColor: state.accentColor,
            aiModels: selectedAIModels,
          },
          deployment_config: state.deploymentConfig,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select('id')
        .single();
      
      if (agentError) throw agentError;
      
      // 3. Link knowledge bases if any
      if (state.knowledgeBaseIds.length > 0) {
        const knowledgeBaseLinks = state.knowledgeBaseIds.map(kbId => ({
          agent_id: agent.id,
          knowledge_base_id: kbId,
          is_primary: state.knowledgeBaseIds.indexOf(kbId) === 0
        }));
        
        const { error: kbError } = await supabase
          .from('agent_knowledge_bases')
          .insert(knowledgeBaseLinks);
        
        if (kbError) {
          console.error('Error linking knowledge bases:', kbError);
          // Continue with the process even if linking fails
        }
      }
      
      setIsComplete(true);
      
      toast({
        title: 'Success',
        description: 'Agent created successfully!',
      });
      
      // Wait a moment before redirecting
      setTimeout(() => {
        navigate('/agents');
      }, 2000);
      
    } catch (error) {
      console.error('Error creating agent:', error);
      toast({
        title: 'Error',
        description: 'Failed to create agent',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 space-y-6">
        <div className="bg-green-100 dark:bg-green-900/20 rounded-full p-3">
          <CircleCheckBig className="h-16 w-16 text-green-600 dark:text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-center">Agent Created Successfully!</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Your agent has been created and is being prepared for deployment.
          You will be redirected to the agents dashboard.
        </p>
        <Button onClick={() => navigate('/agents')}>
          Go to Agents Dashboard
        </Button>
      </div>
    );
  }

  // Step content mapping
  const stepContent = [
    // Step 1: Start Preference
    <div className="space-y-6" key="step-1">
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-bold">How would you like to start?</h3>
        <p className="text-muted-foreground">Choose your preferred approach to creating your agent</p>
        
        {state.isFirstTime && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">👋 First time creating an agent?</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              We'll guide you through the process with helpful tips and sample configurations. 
              You can choose to create a single agent or set up multiple agents at once.
            </p>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card 
          className={`cursor-pointer transition-all ${state.startOption === 'template' ? 'ring-2 ring-primary' : 'hover:shadow-lg'}`}
          onClick={() => handleStartOption('template')}
        >
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-xl font-semibold">Use a Template</h4>
              <p className="text-muted-foreground">
                Start with pre-configured templates for common use cases like healthcare compliance, 
                customer support, or data processing.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="secondary" className="text-xs">Quick Setup</Badge>
                <Badge variant="secondary" className="text-xs">Pre-configured</Badge>
                <Badge variant="secondary" className="text-xs">Best Practices</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer transition-all ${state.startOption === 'scratch' ? 'ring-2 ring-primary' : 'hover:shadow-lg'}`}
          onClick={() => handleStartOption('scratch')}
        >
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                <Settings className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold">Start from Scratch</h4>
              <p className="text-muted-foreground">
                Build your agent from the ground up with complete customization control. 
                Perfect for unique requirements and specific workflows.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="secondary" className="text-xs">Full Control</Badge>
                <Badge variant="secondary" className="text-xs">Custom Build</Badge>
                <Badge variant="secondary" className="text-xs">Flexible</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>,
    
    // Step 2: Template Selection or Agent Type
    <div className="space-y-6" key="step-2">
      {state.startOption === 'template' ? (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium">Select a Template</h3>
              <p className="text-muted-foreground">Choose from our pre-configured agent templates</p>
            </div>
            {state.isFirstTime && (
              <Button variant="outline" size="sm" onClick={completeTutorial}>
                Skip Tutorial
              </Button>
            )}
          </div>
          <AgentTemplates 
            onSelectTemplate={handleSelectTemplate}
            selectedTemplateId={state.templateId}
          />
        </div>
      ) : (
        <div>
          <div className="mb-6">
            <h3 className="text-lg font-medium">Agent Configuration</h3>
            <p className="text-muted-foreground">Configure your custom agent setup</p>
          </div>
          
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Agent Type</Label>
              <p className="text-sm text-muted-foreground mb-3">Choose whether to create a single agent or multiple coordinated agents</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card 
                  className={`cursor-pointer transition-all ${state.agentType === 'single' ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
                  onClick={() => updateField('agentType', 'single')}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Bot className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Single Agent</h4>
                        <p className="text-sm text-muted-foreground">One focused agent for specific tasks</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card 
                  className={`cursor-pointer transition-all ${state.agentType === 'multiple' ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
                  onClick={() => updateField('agentType', 'multiple')}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Multiple Agents</h4>
                        <p className="text-sm text-muted-foreground">Coordinated team of specialized agents</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="agentName">Agent Name</Label>
                <Input 
                  id="agentName"
                  value={state.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Enter agent name"
                />
              </div>
              <div>
                <Label htmlFor="agentDescription">Description</Label>
                <Input 
                  id="agentDescription"
                  value={state.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Brief description of agent purpose"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>,
    
    // Step 3: Canvas Customization
    <div className="space-y-6" key="step-3">
      <div>
        <h3 className="text-lg font-medium">Customize Your Agent</h3>
        <p className="text-muted-foreground">Brand and customize your agent appearance</p>
        {state.isFirstTime && (
          <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg mt-2">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              💡 <strong>Tip:</strong> Your agent's branding will be used across all interactions. 
              Choose colors and messaging that align with your organization's brand.
            </p>
          </div>
        )}
      </div>
      <EnhancedAgentCanvas 
        initialName={state.name}
        initialTagline={state.tagline}
        initialPrimaryColor={state.primaryColor}
        initialSecondaryColor={state.secondaryColor}
        initialAccentColor={state.accentColor}
        initialLogo={state.logoUrl}
        onNameChange={(name) => updateField('name', name)}
        onTaglineChange={(tagline) => updateField('tagline', tagline)}
        onPrimaryColorChange={(color) => updateField('primaryColor', color)}
        onSecondaryColorChange={(color) => updateField('secondaryColor', color)}
        onAccentColorChange={(color) => updateField('accentColor', color)}
        onLogoChange={(file, url) => {
          updateField('logoFile', file);
          updateField('logoUrl', url);
        }}
      />
    </div>,
    
    // Step 4: Connectors & AI Models
    <div className="space-y-6" key="step-4">
      <div>
        <h3 className="text-lg font-medium">System Connectors & AI Models</h3>
        <p className="text-muted-foreground">Connect external systems and select AI models for your agent</p>
        {state.isFirstTime && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mt-2">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              🔗 <strong>Connectors:</strong> Integrate with external APIs, databases, and services. 
              You can always add more connectors later.
            </p>
          </div>
        )}
      </div>
      
      <Tabs defaultValue="connectors" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="connectors">System Connectors</TabsTrigger>
          <TabsTrigger value="ai-models">AI Models</TabsTrigger>
        </TabsList>
        
        <TabsContent value="connectors" className="space-y-4">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select system connectors to integrate with your agent
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {['OpenAI GPT-4', 'Salesforce CRM', 'PostgreSQL', 'Email SMTP', 'Slack', 'GitHub'].map((connector) => (
                <Card key={connector} className="p-4">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id={connector}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleConnectorChange([...state.connectorIds, connector]);
                        } else {
                          handleConnectorChange(state.connectorIds.filter(id => id !== connector));
                        }
                      }}
                    />
                    <Label htmlFor={connector} className="text-sm font-medium">{connector}</Label>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="ai-models" className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Select AI Models</h3>
            <p className="text-muted-foreground">Choose the AI models that will power your agent</p>
          </div>
          <div className="text-center py-8">
            <Button onClick={() => setShowAIModelSelector(true)}>
              Configure AI Models
            </Button>
          </div>
          <AIModelSelector 
            isOpen={showAIModelSelector}
            onClose={() => setShowAIModelSelector(false)}
            onSelect={(model, config) => {
              setSelectedAIModels([...selectedAIModels, model.id]);
              toast({
                title: "AI Model Added",
                description: `${model.name} has been configured for your agent.`,
              });
            }}
            selectedModels={selectedAIModels}
          />
        </TabsContent>
      </Tabs>
    </div>,

    // Step 5: Knowledge Base
    <div className="space-y-6" key="step-5">
      <div>
        <h3 className="text-lg font-medium">Knowledge Base</h3>
        <p className="text-muted-foreground">Add knowledge documents to your agent</p>
        {state.isFirstTime && (
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg mt-2">
            <p className="text-sm text-green-800 dark:text-green-200">
              📚 <strong>Knowledge Base:</strong> Upload documents, FAQs, or data sources that your agent can reference. 
              This helps provide accurate, context-aware responses.
            </p>
          </div>
        )}
      </div>
      <EnhancedKnowledgeBase 
        onKnowledgeBaseChange={handleKnowledgeBaseChange}
        selectedIds={state.knowledgeBaseIds}
      />
    </div>,
    
    // Step 6: RAG & Compliance
    <div className="space-y-6" key="step-6">
      <div>
        <h3 className="text-lg font-medium">RAG Configuration & Compliance</h3>
        <p className="text-muted-foreground">Set up retrieval and compliance workflows</p>
        {state.isFirstTime && (
          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg mt-2">
            <p className="text-sm text-purple-800 dark:text-purple-200">
              ⚖️ <strong>RAG & Compliance:</strong> Configure how your agent retrieves information and ensure 
              compliance with healthcare regulations and data privacy requirements.
            </p>
          </div>
        )}
      </div>
      <RAGComplianceWorkflow 
        knowledgeBaseIds={state.knowledgeBaseIds}
        complianceEnabled={state.deploymentConfig.compliance}
        onComplianceChange={(value) => handleDeploymentConfigChange({ compliance: value })}
      />
    </div>,
    
    // Step 7: Deployment
    <div className="space-y-6" key="step-7">
      <div>
        <h3 className="text-lg font-medium">Deployment Configuration</h3>
        <p className="text-muted-foreground">Configure your agent deployment settings</p>
        {state.isFirstTime && (
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg mt-2">
            <p className="text-sm text-indigo-800 dark:text-indigo-200">
              🚀 <strong>Almost there!</strong> Review your configuration and deploy your agent. 
              You can modify settings anytime after deployment.
            </p>
          </div>
        )}
      </div>
      
      {/* Configuration Summary */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">Configuration Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Start Option:</strong> {state.startOption === 'template' ? 'Template-based' : 'Custom Build'}
            </div>
            <div>
              <strong>Agent Type:</strong> {state.agentType === 'single' ? 'Single Agent' : 'Multiple Agents'}
            </div>
            <div>
              <strong>Name:</strong> {state.name || 'Not set'}
            </div>
            <div>
              <strong>Knowledge Bases:</strong> {state.knowledgeBaseIds.length} selected
            </div>
            <div>
              <strong>Connectors:</strong> {state.connectorIds.length} selected
            </div>
            <div>
              <strong>Compliance:</strong> {state.deploymentConfig.compliance ? 'Enabled' : 'Disabled'}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <AgentDeployment 
        agents={[]}
        onDeploy={() => {}}
      />
      
      <div className="pt-6 border-t">
        <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-500">
          <AlertTriangle className="h-5 w-5" />
          <p className="text-sm">Please review your agent configuration before creating.</p>
        </div>
        
        {state.isFirstTime && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h4 className="font-medium text-green-900 dark:text-green-100">Congratulations!</h4>
            </div>
            <p className="text-sm text-green-800 dark:text-green-200">
              You've completed the agent creation tutorial. Your first agent is ready to deploy!
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={completeTutorial}
            >
              Mark Tutorial Complete
            </Button>
          </div>
        )}
        
        <Button 
          className="mt-4" 
          size="lg" 
          onClick={handleCreateAgent} 
          disabled={isSaving}
        >
          {isSaving ? 'Creating Agent...' : 'Create Agent'}
        </Button>
      </div>
    </div>,
  ];

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="pt-6">
          <Steps 
            currentStep={state.step} 
            onStepClick={handleStepChange}
          >
            <Step title="Start" description="Choose approach" />
            <Step title="Setup" description="Template or custom" />
            <Step title="Canvas" description="Customize appearance" />
            <Step title="Connectors" description="System integrations" />
            <Step title="Knowledge" description="Add knowledge base" />
            <Step title="RAG" description="Configure RAG & compliance" />
            <Step title="Deploy" description="Review & deploy" />
          </Steps>
        </CardContent>
      </Card>

      <div className="min-h-[400px] py-4">
        {stepContent[state.step]}
      </div>

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => handleStepChange(state.step - 1)} 
          disabled={state.step === 0}
        >
          Previous
        </Button>
        {state.step < stepContent.length - 1 ? (
          <Button 
            onClick={() => handleStepChange(state.step + 1)} 
            disabled={!isStepComplete(state.step)}
          >
            Next
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default AgentCreationWizard;