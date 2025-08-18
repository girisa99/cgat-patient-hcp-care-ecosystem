import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Steps, Step } from '@/components/ui/steps';
import { EnhancedAgentCanvas } from './EnhancedAgentCanvas';
import { AgentTemplates } from './AgentTemplates';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { CircleCheckBig, Bot, Settings, Users } from 'lucide-react';
import { CategoryMapping } from './CategoryMapping';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import JourneyEditor from '@/components/agentic/JourneyEditor';

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
  journey_stages?: any[];
}

interface WizardState {
  step: number;
  startOption: 'template' | 'scratch' | null;
  templateId: string | null;
  name: string;
  description: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoFile: File | null;
  logoUrl: string;
  agentType: 'single' | 'multiple';
  // Category mapping fields - core functionality we keep
  selectedCategories: string[];
  selectedBusinessUnits: string[];
  selectedTopics: string[];
  // Journey stages from template
  journeyStages: any[];
}

export const StreamlinedAgentWizard = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<WizardState>({
    step: 0,
    startOption: null,
    templateId: null,
    name: '',
    description: '',
    tagline: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    accentColor: '#06b6d4',
    logoFile: null,
    logoUrl: '',
    agentType: 'single',
    selectedCategories: [],
    selectedBusinessUnits: [],
    selectedTopics: [],
    journeyStages: []
  });

  const [showJourneyEditor, setShowJourneyEditor] = useState(false);
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
        const normalized = (data || []).map((t: any) => ({
          ...t,
          journey_stages: Array.isArray(t.journey_stages) ? t.journey_stages : []
        }));
        setTemplates(normalized as Template[]);
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
      case 1: // Template/Agent type selection with category mapping
        const hasBasicInfo = state.startOption === 'template' 
          ? state.templateId !== null 
          : (state.name !== '' && state.agentType !== null);
        return hasBasicInfo;
      case 2: // Journey overview (read-only)
        return true;
      case 3: // Canvas customization - final step
        return state.name !== '' && state.tagline !== '';
      default:
        return false;
    }
  };

  // Template selection handler
  const handleSelectTemplate = (tpl: { id: string; name: string }) => {
    let selectedTemplate = templates.find(t => t.id === tpl.id);

    if (!selectedTemplate) {
      const targetName = (tpl.name || '').toLowerCase();
      selectedTemplate = templates.find(t => (t.name || '').toLowerCase() === targetName);
    }

    if (selectedTemplate) {
      setState((prev) => ({
        ...prev,
        templateId: selectedTemplate!.id,
        name: selectedTemplate!.name,
        description: selectedTemplate!.description || '',
        tagline: selectedTemplate!.tagline || prev.tagline || '',
        primaryColor: selectedTemplate!.primary_color,
        secondaryColor: selectedTemplate!.secondary_color,
        accentColor: selectedTemplate!.accent_color,
        logoUrl: selectedTemplate!.logo_url || prev.logoUrl || '',
        journeyStages: selectedTemplate!.journey_stages || [],
        startOption: 'template',
        step: Math.max(prev.step, 2),
      }));
    } else {
      setState((prev) => ({
        ...prev,
        templateId: tpl.id,
        name: prev.name || tpl.name,
        startOption: 'template',
        step: Math.max(prev.step, 2),
      }));
    }
  };

  // Start option handler
  const handleStartOption = (option: 'template' | 'scratch') => {
    setState({ ...state, startOption: option });
  };

  // Custom fields update handler
  const updateField = (field: keyof WizardState, value: any) => {
    setState({ ...state, [field]: value });
  };

  // Journey editor apply handler
  const handleJourneyApplied = async (stages: any[]) => {
    setState(prev => ({ ...prev, journeyStages: stages }));
    setShowJourneyEditor(false);
    toast({ title: 'Journey updated', description: 'Journey stages have been customized' });
  };

  // Complete wizard - this will now redirect to parent tabs for actions, connectors, etc.
  const handleCompleteSetup = async () => {
    setIsSaving(true);
    try {
      // Save the basic agent configuration
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

      // Create agent session for further configuration in parent tabs
      const { data: agent, error: agentError } = await supabase
        .from('agent_sessions')
        .insert({
          name: state.name,
          description: state.description || state.name,
          current_step: 'models-templates', // Next step in parent tabs
          canvas: {
            logoUrl,
            tagline: state.tagline,
            primaryColor: state.primaryColor,
            secondaryColor: state.secondaryColor,
            accentColor: state.accentColor,
            name: state.name
          },
          basic_info: {
            agentType: state.agentType,
            categories: state.selectedCategories,
            businessUnits: state.selectedBusinessUnits,
            topics: state.selectedTopics,
            templateId: state.templateId,
            journeyStages: state.journeyStages
          },
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select('id')
        .maybeSingle();
      
      if (agentError || !agent) throw (agentError ?? new Error('Agent session not created'));
      
      setIsComplete(true);
      
      toast({
        title: 'Setup Complete!',
        description: 'Agent foundation configured. Continue with models & actions in the next tabs.',
      });
      
    } catch (error) {
      console.error('Error saving agent setup:', error);
      toast({
        title: 'Error',
        description: 'Failed to save agent setup',
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
        <h2 className="text-2xl font-bold text-center">Foundation Setup Complete!</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Your agent's core configuration is ready. Continue setting up models, actions, 
          connectors, and knowledge base in the dedicated tabs above.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Configure Models & Actions
          </Button>
          <Button onClick={() => navigate('/agents')}>
            View All Agents
          </Button>
        </div>
      </div>
    );
  }

  // Streamlined step content - only 4 steps
  const stepContent = [
    // Step 1: Start Preference
    <div className="space-y-6" key="step-1">
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-bold">How would you like to start?</h3>
        <p className="text-muted-foreground">Choose your preferred approach to creating your agent</p>
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
                Start with pre-configured templates for common use cases.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="secondary" className="text-xs">Quick Setup</Badge>
                <Badge variant="secondary" className="text-xs">Pre-configured</Badge>
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
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="secondary" className="text-xs">Full Control</Badge>
                <Badge variant="secondary" className="text-xs">Custom Build</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>,
    
    // Step 2: Template Selection or Agent Configuration with Categories
    <div className="space-y-6" key="step-2">
      {state.startOption === 'template' ? (
        <div>
          <div className="mb-6">
            <h3 className="text-lg font-medium">Select a Template</h3>
            <p className="text-muted-foreground">Choose from our pre-configured agent templates</p>
          </div>
          <AgentTemplates 
            onSelectTemplate={handleSelectTemplate}
            selectedTemplateId={state.templateId}
            onCustomizeFurther={() => setState(prev => ({ ...prev, step: 2 }))}
            dbTemplates={templates}
          />
        </div>
      ) : (
        <div>
          <div className="mb-6">
            <h3 className="text-lg font-medium">Agent Configuration</h3>
            <p className="text-muted-foreground">Configure your custom agent with categories, business units, and topics</p>
          </div>
          
          <div className="space-y-6">
            {/* Agent Type Selection */}
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
            
            {/* Basic Info */}
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

            {/* Category Mapping - Core functionality we keep */}
            <div className="mt-8 space-y-3">
              <CategoryMapping
                selectedCategories={state.selectedCategories}
                selectedBusinessUnits={state.selectedBusinessUnits}
                selectedTopics={state.selectedTopics}
                onCategoriesChange={(categories) => updateField('selectedCategories', categories)}
                onBusinessUnitsChange={(units) => updateField('selectedBusinessUnits', units)}
                onTopicsChange={(topics) => updateField('selectedTopics', topics)}
              />
            </div>
          </div>
        </div>
      )}
    </div>,
    
    // Step 3: Journey Overview
    <div className="space-y-6" key="step-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Journey Overview</h3>
          <p className="text-muted-foreground">Review the stages for your agent. You can customize these stages.</p>
        </div>
        {(state.templateId || state.journeyStages.length > 0) && (
          <Button variant="outline" onClick={() => setShowJourneyEditor(true)}>
            Edit Journey Stages
          </Button>
        )}
      </div>
      {state.journeyStages && state.journeyStages.length > 0 ? (
        <div className="w-full overflow-x-auto">
          <Steps className="min-w-max px-2">
            {state.journeyStages.map((stage: any, idx: number) => (
              <Step
                key={stage.id || idx}
                title={`${idx + 1}. ${stage.title || stage.name || 'Stage'}`}
                description={stage.description || (Array.isArray(stage.steps) ? `${stage.steps.length} step(s)` : ' ')}
              />
            ))}
          </Steps>
        </div>
      ) : (
        <div className="p-3 rounded bg-muted text-sm text-muted-foreground">
          No journey stages defined yet. You can add stages or proceed to customize your agent's appearance.
        </div>
      )}
    </div>,
    
    // Step 4: Canvas Customization (Final Step)
    <div className="space-y-6" key="step-4">
      <div>
        <h3 className="text-lg font-medium">Customize Your Agent</h3>
        <p className="text-muted-foreground">Brand and customize your agent's visual appearance</p>
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
    </div>
  ];

  const stepTitles = [
    "Choose Approach", 
    "Configure & Categorize", 
    "Review Journey", 
    "Brand & Customize"
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Agent Setup Wizard</h1>
        <p className="text-muted-foreground">
          Configure your agent's foundation. Complete setup with models, actions, and connectors in the dedicated tabs above.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="w-full overflow-x-auto">
        <Steps className="min-w-max px-2">
          {stepTitles.map((title, index) => (
            <Step
              key={index}
              title={title}
              description={index === state.step ? "Current step" : index < state.step ? "Completed" : "Pending"}
              onClick={() => handleStepChange(index)}
              className={index <= state.step ? "cursor-pointer" : ""}
            />
          ))}
        </Steps>
      </div>

      {/* Step Content */}
      <div className="min-h-[500px]">
        {stepContent[state.step]}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={() => handleStepChange(state.step - 1)}
          disabled={state.step === 0}
        >
          Previous
        </Button>
        <div className="flex gap-2">
          {state.step < stepContent.length - 1 ? (
            <Button
              onClick={() => handleStepChange(state.step + 1)}
              disabled={!isStepComplete(state.step)}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleCompleteSetup}
              disabled={!isStepComplete(state.step) || isSaving}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSaving ? 'Saving...' : 'Complete Foundation Setup'}
            </Button>
          )}
        </div>
      </div>

      {/* Journey Editor Dialog */}
      <Dialog open={showJourneyEditor} onOpenChange={setShowJourneyEditor}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customize Journey Stages</DialogTitle>
          </DialogHeader>
          <JourneyEditor 
            templateId={state.templateId || 'custom'}
            onApplied={handleJourneyApplied}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StreamlinedAgentWizard;
