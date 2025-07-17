import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Steps, Step } from '@/components/ui/steps';
import { EnhancedAgentCanvas } from './EnhancedAgentCanvas';
import { EnhancedKnowledgeBase } from '@/components/rag/EnhancedKnowledgeBase';
import { AgentTemplates } from './AgentTemplates';
import { AgentDeployment } from './AgentDeployment';
import { RAGComplianceWorkflow } from '@/components/rag/RAGComplianceWorkflow';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { CircleCheckBig, AlertTriangle } from 'lucide-react';

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
      case 0: // Template selection
        return state.templateId !== null || (state.name !== '' && state.description !== '');
      case 1: // Customization
        return state.name !== '' && state.tagline !== '';
      case 2: // Knowledge Base
        return true; // Knowledge base is optional
      case 3: // RAG & Compliance
        return true; // Optional
      case 4: // Deployment
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
          .from('assets')
          .upload(filePath, state.logoFile);
        
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage.from('assets').getPublicUrl(filePath);
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
    // Step 1: Template Selection
    <div className="space-y-6" key="step-1">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Select a Template</h3>
          <p className="text-muted-foreground">Choose a template or start from scratch</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6">
        <AgentTemplates 
          onSelectTemplate={handleSelectTemplate}
          selectedTemplateId={state.templateId}
        />
      </div>
    </div>,
    
    // Step 2: Canvas Customization
    <div className="space-y-6" key="step-2">
      <div>
        <h3 className="text-lg font-medium">Customize Your Agent</h3>
        <p className="text-muted-foreground">Brand and customize your agent</p>
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
    
    // Step 3: Knowledge Base
    <div className="space-y-6" key="step-3">
      <div>
        <h3 className="text-lg font-medium">Knowledge Base</h3>
        <p className="text-muted-foreground">Add knowledge documents to your agent</p>
      </div>
      <EnhancedKnowledgeBase 
        onKnowledgeBaseChange={handleKnowledgeBaseChange}
        selectedIds={state.knowledgeBaseIds}
      />
    </div>,
    
    // Step 4: RAG & Compliance
    <div className="space-y-6" key="step-4">
      <div>
        <h3 className="text-lg font-medium">RAG Configuration & Compliance</h3>
        <p className="text-muted-foreground">Set up retrieval and compliance workflows</p>
      </div>
      <RAGComplianceWorkflow 
        knowledgeBaseIds={state.knowledgeBaseIds}
        complianceEnabled={state.deploymentConfig.compliance}
        onComplianceChange={(value) => handleDeploymentConfigChange({ compliance: value })}
      />
    </div>,
    
    // Step 5: Deployment
    <div className="space-y-6" key="step-5">
      <div>
        <h3 className="text-lg font-medium">Deployment Configuration</h3>
        <p className="text-muted-foreground">Configure your agent deployment settings</p>
      </div>
        <AgentDeployment 
          agents={[]}
          onDeploy={() => {}}
        />
      
      <div className="pt-6 border-t">
        <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-500">
          <AlertTriangle className="h-5 w-5" />
          <p className="text-sm">Please review your agent configuration before creating.</p>
        </div>
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
            <Step title="Template" description="Select a template" />
            <Step title="Canvas" description="Customize your agent" />
            <Step title="Knowledge" description="Add knowledge" />
            <Step title="RAG" description="Configure RAG & compliance" />
            <Step title="Deploy" description="Deployment settings" />
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