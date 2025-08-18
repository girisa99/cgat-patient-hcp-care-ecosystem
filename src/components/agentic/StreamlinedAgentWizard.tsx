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
import { CircleCheckBig, Bot, Settings, Users, Sparkles, Eye, Brain, Tags, Move, Trash2, ChevronUp, ChevronDown, Plus } from 'lucide-react';
import { CategoryMapping } from './CategoryMapping';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import JourneyEditor from '@/components/agentic/JourneyEditor';
import { useJourneyAISuggestions } from '@/hooks/useJourneyAISuggestions';
import { JourneyStep } from '@/components/journey/EnhancedJourneyDesigner';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUseCases, UseCase } from '@/hooks/useUseCases';

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
  // AI-powered journey generation
  useCase: string;
  selectedUseCaseId: string;
  selectedAIModel: string;
  aiGeneratedSteps: JourneyStep[];
  selectedStepIds: string[];
  showAddUseCaseDialog: boolean;
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
    journeyStages: [],
    useCase: '',
    selectedUseCaseId: '',
    selectedAIModel: 'llm',
    aiGeneratedSteps: [],
    selectedStepIds: [],
    showAddUseCaseDialog: false
  });

  const [showJourneyEditor, setShowJourneyEditor] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [newUseCaseData, setNewUseCaseData] = useState({
    name: '',
    description: '',
    category: 'general',
    complexity: 'moderate' as 'simple' | 'moderate' | 'complex',
    industry: ''
  });
  
  // AI-powered journey generation
  const { suggestions: aiSuggestions, isLoading: isGeneratingAI, generateSuggestions } = useJourneyAISuggestions();
  
  // Use cases management
  const { useCases, isLoading: isLoadingUseCases, isAdding: isAddingUseCase, addUseCase, getUseCaseById } = useUseCases();

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

  // AI-powered journey generation handlers
  const generateAIJourneySteps = async () => {
    let fullUseCase = state.useCase;
    if (!fullUseCase.trim()) {
      fullUseCase = `${state.name} - ${state.description}`;
    }
    
    // Add context from categories, business units, and topics
    const context = [];
    if (state.selectedCategories.length > 0) {
      context.push(`Categories: ${state.selectedCategories.join(', ')}`);
    }
    if (state.selectedBusinessUnits.length > 0) {
      context.push(`Business Units: ${state.selectedBusinessUnits.join(', ')}`);
    }
    if (state.selectedTopics.length > 0) {
      context.push(`Topics: ${state.selectedTopics.join(', ')}`);
    }
    if (state.agentType) {
      context.push(`Agent Type: ${state.agentType}`);
    }
    
    const enhancedUseCase = context.length > 0 
      ? `${fullUseCase} | Context: ${context.join(' | ')}`
      : fullUseCase;
    
    await generateSuggestions(enhancedUseCase, state.selectedAIModel);
  };

  useEffect(() => {
    if (aiSuggestions.length > 0) {
      setState(prev => ({
        ...prev,
        aiGeneratedSteps: aiSuggestions,
        selectedStepIds: aiSuggestions.map(step => step.id) // Select all by default
      }));
    }
  }, [aiSuggestions]);

  // Auto-generate when a use case is selected from dropdown
  useEffect(() => {
    if (state.selectedUseCaseId) {
      generateAIJourneySteps();
    }
    // We intentionally don't include generateAIJourneySteps in deps to avoid duplicate runs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.selectedUseCaseId]);

  const handleStepSelection = (stepId: string, isSelected: boolean) => {
    setState(prev => ({
      ...prev,
      selectedStepIds: isSelected 
        ? [...prev.selectedStepIds, stepId]
        : prev.selectedStepIds.filter(id => id !== stepId)
    }));
  };

  const moveStep = (stepId: string, direction: 'up' | 'down') => {
    setState(prev => {
      const steps = [...prev.aiGeneratedSteps];
      const currentIndex = steps.findIndex(step => step.id === stepId);
      if (currentIndex === -1) return prev;

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= steps.length) return prev;

      [steps[currentIndex], steps[newIndex]] = [steps[newIndex], steps[currentIndex]];
      
      return { ...prev, aiGeneratedSteps: steps };
    });
  };

  const removeStep = (stepId: string) => {
    setState(prev => ({
      ...prev,
      aiGeneratedSteps: prev.aiGeneratedSteps.filter(step => step.id !== stepId),
      selectedStepIds: prev.selectedStepIds.filter(id => id !== stepId)
    }));
  };

  const addCustomStep = () => {
    const newStep: JourneyStep = {
      id: `custom-${Date.now()}`,
      title: 'Custom Step',
      description: 'Add your custom step description here',
      type: 'action',
      connectors: [],
      actions: [],
      requirements: [],
      stakeholders: [],
      businessValue: '',
      riskLevel: 'low',
      automationLevel: 'manual',
      estimatedDuration: 30,
      dependencies: []
    };
    
    setState(prev => ({
      ...prev,
      aiGeneratedSteps: [...prev.aiGeneratedSteps, newStep],
      selectedStepIds: [...prev.selectedStepIds, newStep.id]
    }));
  };

  const applySelectedSteps = () => {
    const selectedSteps = state.aiGeneratedSteps.filter(step => 
      state.selectedStepIds.includes(step.id)
    );
    
    // Convert AI steps to journey stages format
    const journeyStages = selectedSteps.map((step, index) => ({
      id: step.id,
      title: step.title,
      description: step.description,
      type: step.type,
      order_index: index,
      owner_role: step.stakeholders?.[0] || 'System',
      entry_criteria: step.requirements || [],
      tasks_checklist: step.actions || [],
      expected_duration_minutes: step.estimatedDuration || 30,
      outputs_success_criteria: [step.businessValue],
      risks: step.riskLevel ? [{ level: step.riskLevel, description: 'Risk assessment needed' }] : [],
      dependencies: step.dependencies || [],
      validation_checkpoints: ['Quality check', 'Approval required']
    }));

    setState(prev => ({ ...prev, journeyStages }));
    toast({ 
      title: 'Journey Applied!', 
      description: `${selectedSteps.length} AI-generated steps added to your journey` 
    });
  };

  // Add new use case handler
  const handleAddNewUseCase = async () => {
    try {
      if (!newUseCaseData.name.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Use case name is required',
          variant: 'destructive'
        });
        return;
      }

      const newUseCase = await addUseCase(newUseCaseData);
      
      // Select the newly created use case
      updateField('selectedUseCaseId', newUseCase.id);
      updateField('useCase', newUseCase.description || newUseCase.name);
      
      // Close dialog and reset form
      updateField('showAddUseCaseDialog', false);
      setNewUseCaseData({
        name: '',
        description: '',
        category: 'general',
        complexity: 'moderate',
        industry: ''
      });
      
    } catch (error) {
      console.error('Error adding new use case:', error);
    }
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
    
    // Step 3: AI-Powered Journey Generation
    <div className="space-y-6" key="step-3">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">AI-Powered Journey Generation</h3>
          <p className="text-muted-foreground">Generate detailed journey steps using advanced AI models tailored to your use case</p>
        </div>

         {/* Use Case Selection Section */}
         <div className="space-y-4">
           <div className="flex items-center justify-between">
             <Label className="text-base font-medium">Use Case Selection</Label>
             <Button 
               variant="outline" 
               size="sm"
               onClick={() => updateField('showAddUseCaseDialog', true)}
               disabled={isAddingUseCase}
             >
               <Plus className="w-4 h-4 mr-1" />
               Add New Use Case
             </Button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label htmlFor="useCaseDropdown">Choose from existing use cases:</Label>
               <Select
                 value={state.selectedUseCaseId}
                 onValueChange={(value) => {
                   updateField('selectedUseCaseId', value);
                   const selectedUseCase = getUseCaseById(value);
                   if (selectedUseCase) {
                     updateField('useCase', selectedUseCase.description || selectedUseCase.name);
                   }
                 }}
                 disabled={isLoadingUseCases}
               >
                 <SelectTrigger id="useCaseDropdown" className="bg-background">
                   <SelectValue placeholder={isLoadingUseCases ? "Loading use cases..." : "Select a use case"} />
                 </SelectTrigger>
                 <SelectContent className="bg-background border shadow-lg z-50">
                   {useCases.map((useCase) => (
                     <SelectItem key={useCase.id} value={useCase.id} className="hover:bg-accent">
                       <div className="flex flex-col">
                         <span className="font-medium">{useCase.name}</span>
                         <span className="text-xs text-muted-foreground">
                           {useCase.category} • {useCase.complexity} • {useCase.industry || 'General'}
                         </span>
                       </div>
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
           </div>

           <div className="text-center text-muted-foreground">
             <span className="text-sm">OR</span>
           </div>
         </div>

         {/* Manual Use Case Input */}
         <div className="space-y-3">
           <Label htmlFor="useCase">Detailed Use Case Description</Label>
           <Textarea
             id="useCase"
             placeholder="Describe your use case in detail. Be specific about processes, stakeholders, requirements, and goals..."
             value={state.useCase}
             onChange={(e) => {
               updateField('useCase', e.target.value);
               // Clear selected use case if user starts typing manually
               if (state.selectedUseCaseId) {
                 updateField('selectedUseCaseId', '');
               }
             }}
             className="min-h-[100px]"
           />
          <p className="text-xs text-muted-foreground">
            The more detailed your use case, the better AI can generate relevant journey steps
          </p>
        </div>

        {/* AI Model Selection */}
        <div className="space-y-3">
          <Label>Select AI Model Type</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: 'llm', name: 'LLM', icon: <Sparkles className="w-4 h-4" />, desc: 'Large Language Models' },
              { id: 'sml', name: 'SML', icon: <Brain className="w-4 h-4" />, desc: 'Small Language Models' },
              { id: 'vision', name: 'VLM', icon: <Eye className="w-4 h-4" />, desc: 'Vision Language Models' },
              { id: 'mcp', name: 'MCP', icon: <Bot className="w-4 h-4" />, desc: 'Multi-Context Processing' }
            ].map((model) => (
              <Card
                key={model.id}
                className={`cursor-pointer transition-all ${state.selectedAIModel === model.id ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
                onClick={() => updateField('selectedAIModel', model.id)}
              >
                <CardContent className="pt-3 pb-3">
                  <div className="text-center space-y-2">
                    <div className="mx-auto w-8 h-8 flex items-center justify-center">
                      {model.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{model.name}</h4>
                      <p className="text-xs text-muted-foreground">{model.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-center">
          <Button
            onClick={generateAIJourneySteps}
            disabled={(!state.useCase.trim() && !state.name.trim()) || isGeneratingAI}
            size="lg"
            className="px-8"
          >
            {isGeneratingAI ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Generating Journey Steps...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Journey Steps with AI
              </>
            )}
          </Button>
        </div>

        {/* AI Generated Steps Preview */}
        {state.aiGeneratedSteps.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">AI-Generated Journey Steps</h4>
                <p className="text-sm text-muted-foreground">
                  {state.selectedStepIds.length} of {state.aiGeneratedSteps.length} steps selected
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={addCustomStep}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Custom Step
                </Button>
                <Button 
                  onClick={applySelectedSteps}
                  disabled={state.selectedStepIds.length === 0}
                  size="sm"
                >
                  Apply Selected Steps ({state.selectedStepIds.length})
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[600px] w-full border rounded-lg">
              <div className="p-4 space-y-3">
                {state.aiGeneratedSteps.map((step, index) => (
                  <Card key={step.id} className="border-l-4 border-l-primary/20">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center gap-2 pt-1">
                          <Checkbox
                            checked={state.selectedStepIds.includes(step.id)}
                            onCheckedChange={(checked) => handleStepSelection(step.id, !!checked)}
                          />
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {step.type}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {step.estimatedDuration || 30}min
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {step.automationLevel}
                            </Badge>
                          </div>
                          
                          <h5 className="font-medium">{step.title}</h5>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                          
                          {step.businessValue && (
                            <div className="text-xs text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 p-2 rounded">
                              <strong>Business Value:</strong> {step.businessValue}
                            </div>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            {step.connectors && step.connectors.length > 0 && (
                              <div>
                                <strong>Connectors:</strong>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {step.connectors.slice(0, 3).map((connector, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">{connector}</Badge>
                                  ))}
                                  {step.connectors.length > 3 && (
                                    <Badge variant="outline" className="text-xs">+{step.connectors.length - 3} more</Badge>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {step.actions && step.actions.length > 0 && (
                              <div>
                                <strong>Actions:</strong>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {step.actions.slice(0, 3).map((action, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">{action}</Badge>
                                  ))}
                                  {step.actions.length > 3 && (
                                    <Badge variant="secondary" className="text-xs">+{step.actions.length - 3} more</Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {step.stakeholders && step.stakeholders.length > 0 && (
                            <div className="text-xs">
                              <strong>Stakeholders:</strong> {step.stakeholders.join(', ')}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveStep(step.id, 'up')}
                            disabled={index === 0}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveStep(step.id, 'down')}
                            disabled={index === state.aiGeneratedSteps.length - 1}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStep(step.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Applied Journey Stages */}
        {state.journeyStages.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Applied Journey Stages</h4>
              <Button variant="outline" size="sm" onClick={() => setShowJourneyEditor(true)}>
                Fine-tune Stages
              </Button>
            </div>
            <div className="w-full overflow-x-auto">
              <Steps className="min-w-max px-2">
                {state.journeyStages.map((stage: any, idx: number) => (
                  <Step
                    key={stage.id || idx}
                    title={`${idx + 1}. ${stage.title || stage.name || 'Stage'}`}
                    description={stage.description || `Step ${idx + 1}`}
                  />
                ))}
              </Steps>
            </div>
          </div>
        )}
      </div>
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
    "AI Journey Generation", 
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

      {/* Add New Use Case Dialog */}
      <Dialog open={state.showAddUseCaseDialog} onOpenChange={(open) => updateField('showAddUseCaseDialog', open)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Use Case</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newUseCaseName">Use Case Name *</Label>
                <Input 
                  id="newUseCaseName"
                  value={newUseCaseData.name}
                  onChange={(e) => setNewUseCaseData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter use case name"
                />
              </div>
              <div>
                <Label htmlFor="newUseCaseCategory">Category</Label>
                <Select 
                  value={newUseCaseData.category}
                  onValueChange={(value) => setNewUseCaseData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="customer_service">Customer Service</SelectItem>
                    <SelectItem value="document_processing">Document Processing</SelectItem>
                    <SelectItem value="automation">Automation</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newUseCaseComplexity">Complexity</Label>
                <Select 
                  value={newUseCaseData.complexity}
                  onValueChange={(value: 'simple' | 'moderate' | 'complex') => 
                    setNewUseCaseData(prev => ({ ...prev, complexity: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select complexity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">Simple</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="complex">Complex</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="newUseCaseIndustry">Industry</Label>
                <Input 
                  id="newUseCaseIndustry"
                  value={newUseCaseData.industry}
                  onChange={(e) => setNewUseCaseData(prev => ({ ...prev, industry: e.target.value }))}
                  placeholder="e.g., Healthcare, Finance, etc."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="newUseCaseDescription">Description</Label>
              <Textarea 
                id="newUseCaseDescription"
                value={newUseCaseData.description}
                onChange={(e) => setNewUseCaseData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description of the use case..."
                className="min-h-[100px]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => updateField('showAddUseCaseDialog', false)}
                disabled={isAddingUseCase}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddNewUseCase}
                disabled={!newUseCaseData.name.trim() || isAddingUseCase}
              >
                {isAddingUseCase ? 'Adding...' : 'Add Use Case'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StreamlinedAgentWizard;
