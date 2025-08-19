import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Steps, Step } from '@/components/ui/steps';

import { AgentTemplates } from './AgentTemplates';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { CircleCheckBig, Bot, Settings, Users, Sparkles, Trash2, ChevronUp, ChevronDown, Plus } from 'lucide-react';
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
  selectedAIProvider: 'openai' | 'anthropic' | 'perplexity';
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
    selectedAIModel: 'gpt-4.1-2025-04-14',
    selectedAIProvider: 'openai' as const,
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
      case 0:
        return state.startOption !== null;
      case 1:
        return state.startOption === 'template' ? state.templateId !== null : (state.name !== '' && state.agentType !== null);
      case 2:
        return true; // Configuration complete
      default:
        return false;
    }
  };

  // Template selection handler
  const handleSelectTemplate = async (tpl: { id: string; name: string }) => {
    let selectedTemplate = templates.find(t => t.id === tpl.id);

    if (!selectedTemplate) {
      const targetName = (tpl.name || '').toLowerCase();
      selectedTemplate = templates.find(t => (t.name || '').toLowerCase() === targetName);
    }

    if (selectedTemplate) {
      // If DB template lacks embedded JSON stages, fetch normalized stages
      let stages = Array.isArray(selectedTemplate.journey_stages) ? selectedTemplate.journey_stages : [];
      if (stages.length === 0) {
        const { data, error } = await supabase
          .from('agent_template_journey_stages')
          .select('*')
          .eq('template_id', selectedTemplate.id)
          .order('order_index');
        if (!error && Array.isArray(data)) {
          stages = data as any[];
        }
      }

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
        journeyStages: stages || [],
        startOption: 'template',
        step: 1, // Stay on step 1 to show configuration
      }));
    } else {
      setState((prev) => ({
        ...prev,
        templateId: tpl.id,
        name: prev.name || tpl.name,
        startOption: 'template',
        step: 1, // Stay on step 1 to show configuration
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
    await persistJourneyToTemplate(stages);
    setShowJourneyEditor(false);
    toast({ title: 'Journey updated', description: 'Journey stages saved to template' });
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
    
    await generateSuggestions(enhancedUseCase, state.selectedAIProvider);
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
      console.log('🔄 Auto-generating AI journey for selected use case:', state.selectedUseCaseId);
      generateAIJourneySteps();
    }
    // We intentionally don't include generateAIJourneySteps in deps to avoid duplicate runs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.selectedUseCaseId]);

// Force close dialog when component loads
useEffect(() => {
  setShowJourneyEditor(false);
  console.log('🔄 StreamlinedAgentWizard initialized, step:', state.step);
}, []);

// Keep current step when stages change to avoid unexpected jumps
useEffect(() => {
  // No auto-navigation; user controls progression
}, [state.journeyStages.length]);
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

// Persist journey stages to the selected (or new) template
async function persistJourneyToTemplate(stages: any[]) {
  try {
    let tplId = state.templateId;

    // Create a new template if starting from scratch or no template selected
    if (!tplId || state.startOption === 'scratch') {
      const { data: newTpl, error: tplErr } = await supabase
        .from('agent_templates')
        .insert({
          name: state.name || 'New Agent Template',
          description: state.description || state.name || 'Generated template',
          tagline: state.tagline || null,
          primary_color: state.primaryColor,
          secondary_color: state.secondaryColor,
          accent_color: state.accentColor,
          journey_stages: [], // we store normalized stages below and JSON snapshot too
          is_default: false,
          created_by: (await supabase.auth.getUser()).data.user?.id || null
        })
        .select('id')
        .maybeSingle();
      if (tplErr || !newTpl) throw (tplErr ?? new Error('Template creation failed'));
      tplId = newTpl.id as string;
      setState(prev => ({ ...prev, templateId: tplId }));
    }

    // Clear existing stages and insert new ordered list (normalized table)
    await supabase.from('agent_template_journey_stages').delete().eq('template_id', tplId);

    if (Array.isArray(stages) && stages.length > 0) {
      const payload = stages.map((s, idx) => ({
        template_id: tplId,
        order_index: idx,
        title: s.title,
        description: s.description,
        type: s.type || 'action',
        owner_role: s.owner_role || 'System',
        entry_criteria: s.entry_criteria || [],
        tasks_checklist: s.tasks_checklist || [],
        expected_duration_minutes: s.expected_duration_minutes || 30,
        outputs_success_criteria: s.outputs_success_criteria || [],
        risks: s.risks || [],
        dependencies: s.dependencies || [],
        validation_checkpoints: s.validation_checkpoints || []
      }));
      const { error: insErr } = await supabase.from('agent_template_journey_stages').insert(payload);
      if (insErr) throw insErr;
    }

    // Also persist a JSON snapshot on the template for quick preview
    const { error: updErr } = await supabase
      .from('agent_templates')
      .update({ journey_stages: stages })
      .eq('id', tplId);
    if (updErr) throw updErr;

    toast({ title: 'Journey saved', description: `Saved ${stages.length} stage(s) to template` });
    return tplId;
  } catch (e: any) {
    console.error('Error persisting journey:', e);
    toast({ title: 'Error saving journey', description: e.message || String(e), variant: 'destructive' });
    return null;
  }
}

const applySelectedSteps = async () => {
  const selectedSteps = state.aiGeneratedSteps.filter(step => 
    state.selectedStepIds.includes(step.id)
  );
  
  // Convert AI steps to journey stages format
  const journeyStages = selectedSteps.map((step, index) => ({
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
  await persistJourneyToTemplate(journeyStages);
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
    console.log('🚀 Complete Foundation Setup clicked!', {
      step: state.step,
      isStepComplete: isStepComplete(state.step),
      state: state
    });
    
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
      templateId: state.templateId || (await persistJourneyToTemplate(state.journeyStages)),
      journeyStages: state.journeyStages
    },
    user_id: (await supabase.auth.getUser()).data.user?.id
  })
  .select('id')
  .maybeSingle();
      
      if (agentError || !agent) throw (agentError ?? new Error('Agent session not created'));
      
      // Navigate to main canvas in Agent Builder
      try { localStorage.setItem('agentBuilder_next', JSON.stringify({ mode: 'visual', tab: 'canvas-designer', subTab: 'canvas' })); } catch {}
      toast({ title: 'Setup Complete!', description: 'Opening Canvas to continue branding.' });
      navigate('/agents');
      return;
      
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
        state.templateId ? (
          // Show template configuration after selection
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-medium">Configure Selected Template</h3>
              <p className="text-muted-foreground">Customize your {state.name} agent with categories and settings</p>
            </div>
            
            {/* Template Summary */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Bot className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{state.name}</h4>
                    <p className="text-sm text-muted-foreground">{state.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category Mapping for Template */}
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
              
              {/* Category Mapping for Template */}
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
        ) : (
          // Show template selection
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
        )
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
    
  ];

  const stepTitles = [
    "Choose Approach", 
    "Configure & Categorize"
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
              onClick={() => {
                console.log('🔄 Button clicked - Current state:', {
                  step: state.step,
                  isComplete: isStepComplete(state.step),
                  isSaving,
                  templateId: state.templateId,
                  startOption: state.startOption,
                  name: state.name,
                  agentType: state.agentType
                });
                handleCompleteSetup();
              }}
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
