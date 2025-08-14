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
import { CategoryMapping } from './CategoryMapping';
import { AgentActionsManager, type AgentAction } from './AgentActionsManager';
import ModePicker from '@/components/agent-builder/ModePicker';
import LSBindingPanel, { type LSBinding } from '@/components/label-studio/LSBindingPanel';
import { useLabelStudio } from '@/hooks/useLabelStudio';
import { Switch } from '@/components/ui/switch';
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
  brand: string;
  tagline: string;
  purpose: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoFile: File | null;
  logoUrl: string;
  knowledgeBaseIds: string[];
  connectorIds: string[];
  agentType: 'single' | 'multiple';
  isFirstTime: boolean;
  // Category mapping fields
  selectedCategories: string[];
  selectedBusinessUnits: string[];
  selectedTopics: string[];
  // Agent actions
  agentActions: AgentAction[];
  // Label Studio binding
  labelStudio?: LSBinding;
  // Whether to use Label Studio in this build
  useLabelStudio: boolean;
  // Journey stages loaded from selected template (DB)
  journeyStages: any[];
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
    purpose: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    accentColor: '#06b6d4',
    logoFile: null,
    logoUrl: '',
    knowledgeBaseIds: [],
    connectorIds: [],
    agentType: 'single',
    isFirstTime: localStorage.getItem('agent_creation_tutorial') !== 'completed',
    // Category mapping fields
    selectedCategories: [],
    selectedBusinessUnits: [],
    selectedTopics: [],
    // Agent actions
    agentActions: [],
    // Label Studio default binding
    labelStudio: {
      appliesTo: { prompts: true, visual: false, templates: false }
    },
    useLabelStudio: false,
    journeyStages: [],
    deploymentConfig: {
      parallel: false,
      compliance: true,
      monitoring: true,
      autoScaling: false
    }
  });

  const [showJourneyEditor, setShowJourneyEditor] = useState(false);

  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showAIModelSelector, setShowAIModelSelector] = useState(false);
  const [selectedAIModels, setSelectedAIModels] = useState<string[]>([]);
  const { listProjectTasks, listTaskAnnotations, loading: lsLoading } = useLabelStudio();
  
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
          journey_stages: Array.isArray((t as any).journey_stages) ? (t as any).journey_stages : []
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

  // Pre-bind Label Studio from last agent if present
  useEffect(() => {
    (async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        const userId = auth.user?.id;
        if (!userId) return;
        if (state.labelStudio?.projectId) return; // already set by user
        const { data, error } = await supabase
          .from('agents')
          .select('configuration, created_at, created_by')
          .eq('created_by', userId)
          .order('created_at', { ascending: false })
          .limit(1);
        if (!error && data && data.length) {
          const lastBinding = (data[0] as any)?.configuration?.labelStudioBinding;
          if (lastBinding?.projectId) {
            setState(prev => ({ ...prev, labelStudio: lastBinding, useLabelStudio: true }));
          }
        }
      } catch {}
    })();
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
      case 1: // Template/Agent type selection with category mapping
        const hasBasicInfo = state.startOption === 'template' ? state.templateId !== null : (state.name !== '' && state.agentType !== null);
        // Category mapping is optional - don't require it for step completion
        return hasBasicInfo;
      case 2: // Journey overview (read-only)
        return true;
      case 3: // Canvas customization
        return state.name !== '' && state.tagline !== '';
      case 4: // Agent Actions & Tasks
        return true; // Optional - can proceed without actions
      case 5: // Connectors & AI Models
        return true; // Optional
      case 6: // Knowledge Base
        return true; // Optional
      case 7: // RAG & Compliance
        return true; // Optional
      case 8: // Deployment
        return true; // Configuration is always valid
      default:
        return false;
    }
  };

  // Template selection handler
  const handleSelectTemplate = (tpl: { id: string; name: string }) => {
    // Try to find by exact ID (UUID from DB)
    let selectedTemplate = templates.find(t => t.id === tpl.id);

    // If not found (e.g., static template id), try fallback by name match
    if (!selectedTemplate) {
      const targetName = (tpl.name || '').toLowerCase();
      selectedTemplate = templates.find(t => (t.name || '').toLowerCase() === targetName);
      if (selectedTemplate) {
        console.log('Matched template by name:', tpl.name, '→', selectedTemplate.id);
      }
    }

    if (selectedTemplate) {
      setState((prev) => ({
        ...prev,
        templateId: selectedTemplate!.id,
        name: selectedTemplate!.name,
        description: selectedTemplate!.description || '',
        purpose: selectedTemplate!.description || '',
        tagline: (selectedTemplate as any).tagline || prev.tagline || '',
        primaryColor: (selectedTemplate as any).primary_color,
        secondaryColor: (selectedTemplate as any).secondary_color,
        accentColor: (selectedTemplate as any).accent_color,
        logoUrl: (selectedTemplate as any).logo_url || prev.logoUrl || '',
        journeyStages: (selectedTemplate as any).journey_stages || [],
        // Ensure wizard recognizes template path and advance to Journey overview
        startOption: 'template',
        step: Math.max(prev.step, 2),
      }));
    } else {
      // Fallback: advance to Canvas even if template isn't in DB (e.g., static list selection)
      setState((prev) => ({
        ...prev,
        templateId: tpl.id,
        name: prev.name || tpl.name,
        startOption: 'template',
        step: Math.max(prev.step, 2),
      }));
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

  // Label Studio seeding helpers
  const hasLS = !!state.labelStudio?.projectId;
  const lsProjectId = state.labelStudio?.projectId as number | undefined;

  const applyLSForPrompts = async () => {
    if (!hasLS || !lsProjectId || !state.labelStudio?.appliesTo?.prompts) return;
    try {
      const tasks: any[] = await listProjectTasks(lsProjectId, 1, 10);
      const newActions: AgentAction[] = (tasks || []).map((t) => {
        const data = t?.data || {};
        const baseName: string = (data.title || data.name || data.text || `Task ${t.id}`).toString();
        const trimmed = baseName.length > 40 ? baseName.slice(0, 40) + '…' : baseName;
        return {
          id: `ls-${t.id}`,
          name: trimmed,
          description: 'Imported from Label Studio task',
          category: 'analysis',
          type: 'on_demand',
          parameters: { lsTaskId: t.id, lsProjectId },
          isEnabled: true,
          priority: 'medium',
          tasks: []
        } as AgentAction;
      });
      // Avoid duplicates by id
      const existingIds = new Set((state.agentActions || []).map(a => a.id));
      const merged = [...state.agentActions, ...newActions.filter(a => !existingIds.has(a.id))];
      updateField('agentActions', merged);
      toast({ title: 'Prompts seeded', description: `Added ${merged.length - state.agentActions.length} actions from Label Studio` });
    } catch (e) {
      console.error(e);
      toast({ title: 'Seeding failed', description: 'Could not import tasks from Label Studio', variant: 'destructive' });
    }
  };

  const applyLSForTemplates = async () => {
    if (!hasLS || !lsProjectId || !state.labelStudio?.appliesTo?.templates) return;
    try {
      const tasks: any[] = await listProjectTasks(lsProjectId, 1, 5);
      const labels = new Set<string>();
      for (const t of tasks || []) {
        try {
          const ann = await listTaskAnnotations(t.id);
          (ann || []).forEach((a: any) => {
            (a.result || []).forEach((r: any) => {
              const lbls: string[] = r?.value?.labels || [];
              lbls.forEach((l) => labels.add(l));
            });
          });
        } catch {}
      }
      const categories = Array.from(labels).slice(0, 10);
      if (categories.length) {
        const mergedCategories = Array.from(new Set([...(state.selectedCategories || []), ...categories]));
        updateField('selectedCategories', mergedCategories);
        toast({ title: 'Templates seeded', description: `Mapped ${categories.length} labels to categories` });
      } else {
        toast({ title: 'No labels found', description: 'No annotation labels detected to map to templates' });
      }
    } catch (e) {
      console.error(e);
      toast({ title: 'Seeding failed', description: 'Could not import annotations from Label Studio', variant: 'destructive' });
    }
  };

  const applyLSForVisual = async () => {
    if (!hasLS || !lsProjectId || !state.labelStudio?.appliesTo?.visual) return;
    try {
      const projectTitle = state.labelStudio?.projectTitle || `Project ${lsProjectId}`;
      // Seed name/tagline if empty
      const newName = state.name || projectTitle;
      const newTag = state.tagline || `Trained on ${projectTitle}`;
      setState((prev) => ({ ...prev, name: newName, tagline: newTag }));
      toast({ title: 'Visual seeded', description: 'Canvas branding updated from Label Studio' });
    } catch (e) {
      console.error(e);
    }
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
            labelStudioBinding: state.labelStudio ? ({ ...state.labelStudio } as any) : undefined,
          },
          deployment_config: state.deploymentConfig,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select('id')
        .maybeSingle();
      
      if (agentError || !agent) throw (agentError ?? new Error('Agent not created'));
      
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
            onCustomizeFurther={() => setState(prev => ({ ...prev, startOption: 'template', step: 2 }))}
            dbTemplates={templates}
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
                    onChange={(e) => {
                      updateField('description', e.target.value);
                      updateField('purpose', e.target.value);
                    }}
                    placeholder="Brief description of agent purpose"
                  />
                </div>
            </div>

            {/* Category Mapping Section */}
            <div className="mt-8 space-y-3">
              <CategoryMapping
                selectedCategories={state.selectedCategories}
                selectedBusinessUnits={state.selectedBusinessUnits}
                selectedTopics={state.selectedTopics}
                onCategoriesChange={(categories) => updateField('selectedCategories', categories)}
                onBusinessUnitsChange={(units) => updateField('selectedBusinessUnits', units)}
                onTopicsChange={(topics) => updateField('selectedTopics', topics)}
              />
              {state.useLabelStudio && hasLS && state.labelStudio?.appliesTo?.templates && (
                <div className="flex justify-end">
                  <Button size="sm" variant="outline" onClick={applyLSForTemplates} disabled={lsLoading}>
                    {lsLoading ? 'Applying…' : 'Apply from Label Studio'}
                  </Button>
                </div>
              )}
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
          <p className="text-muted-foreground">Review the stages for this template. Navigation is sequential.</p>
        </div>
        {state.templateId && (
          <Button variant="outline" onClick={() => setShowJourneyEditor(true)}>
            Edit Stages
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
                description={stage.description || (Array.isArray(stage.steps) ? `${stage.steps.length} step(s)` : ' ') }
              />
            ))}
          </Steps>
        </div>

      ) : (
        <div className="p-3 rounded bg-muted text-sm text-muted-foreground">
          No journey stages defined for this template yet. You can proceed and configure stages later.
        </div>
      )}
    </div>,
    
    // Step 4: Canvas Customization  
    <div className="space-y-6" key="step-4">
      <div className="flex items-center justify-between">
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
        {state.useLabelStudio && hasLS && state.labelStudio?.appliesTo?.visual && (
          <Button size="sm" variant="outline" onClick={applyLSForVisual} disabled={lsLoading}>
            {lsLoading ? 'Applying…' : 'Apply from Label Studio'}
          </Button>
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

    // Step 4: Agent Actions & Tasks
    <div className="space-y-6" key="step-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Agent Actions & Tasks</h3>
        {state.useLabelStudio && hasLS && state.labelStudio?.appliesTo?.prompts && (
          <Button size="sm" variant="outline" onClick={applyLSForPrompts} disabled={lsLoading}>
            {lsLoading ? 'Applying…' : 'Import from Label Studio'}
          </Button>
        )}
      </div>
      <AgentActionsManager
        onActionsChange={(actions) => updateField('agentActions', actions)}
        initialActions={state.agentActions || []}
        agentType={state.agentType}
        agentPurpose={state.purpose}
      />
    </div>,

    // Step 5: System Connectors & AI Models
    <div className="space-y-6" key="step-6">
      <div>
        <h3 className="text-lg font-medium">System Connectors & AI Models</h3>
        <p className="text-muted-foreground">Connect external systems and configure AI models for your agent</p>
        {state.isFirstTime && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mt-2">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              🔗 <strong>Connectors:</strong> Integrate with external APIs, databases, and services including your own internal APIs.
              <br />
              🤖 <strong>AI Models:</strong> Configure the AI models that will power your agent.
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
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">System Connectors</h4>
                <p className="text-sm text-muted-foreground">
                  Select connectors including internal APIs and external services
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                {state.connectorIds.filter(id => !id.startsWith('category-')).length} selected
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Internal APIs */}
              <div className="col-span-full">
                <h5 className="text-sm font-medium text-primary mb-2">Internal APIs</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    'Healthcare Admin API', 'User Management API', 'Facility API', 
                    'Patient API', 'Clinical Data API', 'Compliance API'
                  ].map((connector) => (
                    <Card key={connector} className="p-3">
                      <div className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id={connector}
                          checked={state.connectorIds.includes(connector)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleConnectorChange([...state.connectorIds, connector]);
                            } else {
                              handleConnectorChange(state.connectorIds.filter(id => id !== connector));
                            }
                          }}
                        />
                        <Label htmlFor={connector} className="text-xs font-medium">{connector}</Label>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
              
              {/* External APIs */}
              <div className="col-span-full">
                <h5 className="text-sm font-medium text-blue-600 mb-2">External APIs</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    'OpenAI GPT-4', 'Salesforce CRM', 'PostgreSQL', 'Email SMTP', 
                    'Slack', 'GitHub', 'Veeva CRM', 'OpenFDA API', 'NPI Registry',
                    'Twilio SMS', 'Benefit Verification', 'Prior Auth API'
                  ].map((connector) => (
                    <Card key={connector} className="p-3">
                      <div className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id={connector}
                          checked={state.connectorIds.includes(connector)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleConnectorChange([...state.connectorIds, connector]);
                            } else {
                              handleConnectorChange(state.connectorIds.filter(id => id !== connector));
                            }
                          }}
                        />
                        <Label htmlFor={connector} className="text-xs font-medium">{connector}</Label>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Label Studio */}
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-sm font-medium">Label Studio</h5>
                <p className="text-xs text-muted-foreground">Optional dataset binding; manual apply only.</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={state.useLabelStudio} onCheckedChange={(v) => updateField('useLabelStudio', v)} />
                <span className="text-sm">{state.useLabelStudio ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
            {state.useLabelStudio && (
              <LSBindingPanel
                value={state.labelStudio}
                onBind={(binding) => {
                  updateField('labelStudio', binding);
                  toast({
                    title: binding.projectId ? 'Label Studio Linked' : 'Label Studio Detached',
                    description: binding.projectId
                      ? `Project ${binding.projectTitle || binding.projectId} attached to ${[
                          binding.appliesTo.prompts ? 'prompts' : null,
                          binding.appliesTo.visual ? 'visual' : null,
                          binding.appliesTo.templates ? 'templates' : null,
                        ]
                          .filter(Boolean)
                          .join(', ')}`
                      : 'Dataset disconnected from this agent.',
                  });
                }}
              />
            )}

            
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Internal APIs:</strong> Your application's internal APIs are automatically detected and available for selection. 
                These include all endpoints from your Healthcare Admin API, User Management, and other internal services.
              </p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="ai-models" className="space-y-4">
          <div>
            <h4 className="font-medium">Select AI Models</h4>
            <p className="text-sm text-muted-foreground">Choose the AI models that will power your agent</p>
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

    // Step 6: Knowledge Base
    <div className="space-y-6" key="step-6">
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
    
    // Step 7: RAG & Compliance
    <div className="space-y-6" key="step-8">
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
    
    // Step 8: Deployment
    <div className="space-y-6" key="step-9">
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
              <strong>Categories:</strong> {state.selectedCategories.length} selected
            </div>
            <div>
              <strong>Business Units:</strong> {state.selectedBusinessUnits.length} selected
            </div>
            <div>
              <strong>Topics:</strong> {state.selectedTopics.length} selected
            </div>
            <div>
              <strong>Agent Actions:</strong> {state.agentActions.length} configured
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
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Monitoring & Scaling</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Enable Monitoring</div>
              <div className="text-sm text-muted-foreground">Collect health metrics and performance</div>
            </div>
            <Switch
              checked={state.deploymentConfig.monitoring}
              onCheckedChange={(v) => handleDeploymentConfigChange({ monitoring: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Auto Scaling</div>
              <div className="text-sm text-muted-foreground">Scale instances automatically based on load</div>
            </div>
            <Switch
              checked={state.deploymentConfig.autoScaling}
              onCheckedChange={(v) => handleDeploymentConfigChange({ autoScaling: v })}
            />
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
        <CardContent className="pt-4">
          <ModePicker />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <Steps 
            currentStep={state.step} 
            onStepClick={handleStepChange}
          >
            <Step title="Start" description="Choose approach" />
            <Step title="Setup" description="Template or custom" />
            <Step title="Journey" description="Stages overview" />
            <Step title="Canvas" description="Customize appearance" />
            <Step title="Actions" description="Configure tasks" />
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