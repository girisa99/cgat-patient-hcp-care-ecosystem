import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Settings, 
  Workflow, 
  ArrowRight,
  Database,
  Zap,
  ArrowLeft,
  Lightbulb,
  MessageCircle,
  Plus,
  Play,
  Save,
  Sparkles
} from 'lucide-react';

// Import existing components
import { ModeSelector, type AgentMode } from '@/components/agent-builder/ModeSelector';
import { PromptAssistant } from '@/components/agent-builder/PromptAssistant';
import { AgentBuilderProvider, useAgentBuilder } from '@/components/agent-builder/AgentBuilderProvider';
import { IntelligentQuestionnaire } from '@/components/agent-builder/IntelligentQuestionnaire';
import { UseCaseSelector } from '@/components/agentic/UseCaseSelector';
import { JourneyEditor } from '@/components/agentic/JourneyEditor';
import { StreamlinedAgentWizard } from '@/components/agentic/StreamlinedAgentWizard';
import { ReactFlowWrapper as CustomerJourneyBuilder } from '@/components/workflow-builder/ReactFlowWrapper';
import { ModelManagementDashboard } from '@/components/ModelManagement/ModelManagementDashboard';
import { EnhancedConnectorSystem } from '@/components/agentic/enhanced-connector/EnhancedConnectorSystem';
import { ActionsTab } from '@/components/agentic/tabs/ActionsTab';
import AgenticAPIEcosystem from '@/components/agent-deployment/AgenticAPIEcosystem';
import AppLayout from '@/components/layout/AppLayout';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { toast } from 'sonner';
import { EnhancedJourneyDesigner } from '@/components/journey/EnhancedJourneyDesigner';
import { AIModelSelector } from '@/components/agentic/AIModelSelector';

const AgentsInner = () => {
  // State management
  const [selectedMode, setSelectedMode] = useState<AgentMode | null>(null);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [hasCompletedQuestionnaire, setHasCompletedQuestionnaire] = useState(false);
  const [visualWorkflowSubTab, setVisualWorkflowSubTab] = useState('use-case');
  const [selectedUseCase, setSelectedUseCase] = useState('');
  const [journeyStages, setJourneyStages] = useState<any[]>([]);
  const [wizardData, setWizardData] = useState<any>({});
  const [agentBuilderTab, setAgentBuilderTab] = useState('agent-config');
  const [showPromptAssistant, setShowPromptAssistant] = useState(false);

  const { userSessions, currentSessionId, currentSession, actions, setActions } = useAgentBuilder();

  // Initialize questionnaire for new users
  useEffect(() => {
    const completed = localStorage.getItem('agentBuilder_questionnaireCompleted') === 'true';
    setHasCompletedQuestionnaire(completed);
    
    if (!completed && (userSessions?.length ?? 0) === 0) {
      setShowQuestionnaire(true);
      setShowModeSelector(false);
    } else {
      setShowQuestionnaire(false);
      setShowModeSelector(true);
    }
  }, [userSessions]);

  // Event handlers
  const handleQuestionnaireComplete = (data: any) => {
    setHasCompletedQuestionnaire(true);
    setShowQuestionnaire(false);
    setShowModeSelector(true);
    localStorage.setItem('agentBuilder_questionnaireCompleted', 'true');
    toast.success('Great! Now choose your building approach.');
  };

  const handleModeSelect = (mode: AgentMode) => {
    setSelectedMode(mode);
    setShowModeSelector(false);
    
    if (mode === 'visual') {
      setVisualWorkflowSubTab('use-case');
    } else {
      setAgentBuilderTab('agent-config');
    }
    
    toast.success(`Switched to ${mode === 'visual' ? 'Visual Workflow' : 'Manual Configuration'} mode`);
  };

  const handleUseCaseSelect = (useCase: string) => {
    setSelectedUseCase(useCase);
    setVisualWorkflowSubTab('journey');
    toast.success('Use case selected! Now define your journey stages.');
    setShowPromptAssistant(true);
  };

  const handleJourneyComplete = (stages: any[]) => {
    setJourneyStages(stages);
    setVisualWorkflowSubTab('wizard');
    toast.success('Journey stages defined! Complete your agent setup.');
  };

  const handleWizardComplete = (data: any) => {
    setWizardData(data);
    setVisualWorkflowSubTab('canvas');
    toast.success('Setup complete! Customize your agent\'s appearance.');
  };

  const handlePromptGenerate = (prompt: string, generatedConfig: any) => {
    if (selectedMode === 'visual') {
      setWizardData(prev => ({
        ...prev,
        generatedWorkflow: generatedConfig,
        prompt: prompt
      }));
      setVisualWorkflowSubTab('journey');
      toast.success('Workflow generated! Proceed to Journey to review and refine.');
    } else {
      setWizardData(prev => ({
        ...prev,
        generatedConfig: generatedConfig,
        prompt: prompt
      }));
      toast.success('Configuration generated! Review the settings.');
    }
  };

  // FlowiseAI Layout
  const renderFlowiseLayout = () => {
    return (
      <div className="h-screen flex bg-background">
        {/* Left Panel - Node Library & Tools */}
        <div className="w-80 border-r bg-card flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-lg">Agent Builder</h2>
            <p className="text-sm text-muted-foreground">FlowiseAI Style</p>
          </div>
          
          {/* Mode Selector as Tabs */}
          <div className="p-4 border-b">
            <div className="flex gap-2">
              <Button 
                variant={selectedMode === 'visual' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleModeSelect('visual' as any)}
              >
                <Workflow className="w-4 h-4 mr-1" />
                Visual
              </Button>
              <Button 
                variant={selectedMode === 'manual' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleModeSelect('manual' as any)}
              >
                <Settings className="w-4 h-4 mr-1" />
                Manual
              </Button>
            </div>
          </div>

          {/* Content based on mode and step */}
          <div className="flex-1 overflow-auto p-4">
            {selectedMode === 'visual' && (
              <div className="space-y-4">
                {visualWorkflowSubTab === 'use-case' && (
                  <div>
                    <h3 className="font-medium mb-3">Use Case Selection</h3>
                    <UseCaseSelector
                      selectedUseCase={selectedUseCase}
                      onUseCaseChange={handleUseCaseSelect}
                      selectedCategories={[]}
                      selectedTopics={[]}
                    />
                  </div>
                )}
                
                {visualWorkflowSubTab === 'journey' && (
                  <div>
                    <h3 className="font-medium mb-3">Journey Design</h3>
                    <JourneyEditor />
                  </div>
                )}
                
                {visualWorkflowSubTab === 'wizard' && (
                  <div>
                    <h3 className="font-medium mb-3">Agent Setup</h3>
                    <StreamlinedAgentWizard />
                  </div>
                )}
                
                {visualWorkflowSubTab === 'canvas' && (
                  <div>
                    <h3 className="font-medium mb-3">Visual Canvas</h3>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Bot className="w-4 h-4 mr-2" />
                        Agent Nodes
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Chat Nodes
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Database className="w-4 h-4 mr-2" />
                        Data Nodes
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {selectedMode === 'manual' && (
              <div className="space-y-4">
                <h3 className="font-medium mb-3">Manual Configuration</h3>
                <div className="space-y-2">
                  <Button 
                    variant={agentBuilderTab === 'agent-config' ? 'default' : 'outline'} 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => setAgentBuilderTab('agent-config')}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Agent Config
                  </Button>
                  <Button 
                    variant={agentBuilderTab === 'models-templates' ? 'default' : 'outline'} 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => setAgentBuilderTab('models-templates')}
                  >
                    <Bot className="w-4 h-4 mr-2" />
                    Models
                  </Button>
                  <Button 
                    variant={agentBuilderTab === 'connectors-api' ? 'default' : 'outline'} 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => setAgentBuilderTab('connectors-api')}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Connectors
                  </Button>
                  <Button 
                    variant={agentBuilderTab === 'actions-tasks' ? 'default' : 'outline'} 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => setAgentBuilderTab('actions-tasks')}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Actions
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Canvas Area - FlowiseAI Style */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar with Actions */}
          <div className="h-14 border-b bg-card flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold text-foreground">
                {selectedMode === 'visual' ? 'Visual Workflow Builder' : 'Manual Agent Configuration'}
              </h1>
              <Badge variant="secondary" className="text-xs">
                {selectedMode === 'visual' ? visualWorkflowSubTab : agentBuilderTab}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                <Play className="w-4 h-4 mr-1" />
                Deploy
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowPromptAssistant(!showPromptAssistant)}>
                <Lightbulb className="w-4 h-4 mr-1" />
                AI Assistant
              </Button>
            </div>
          </div>

          {/* Main Content Area - FlowiseAI Canvas Style */}
          <div className="flex-1 flex overflow-hidden bg-background">
            {/* Left Panel - Journey Steps & Nodes */}
            <div className="w-80 border-r bg-card overflow-hidden flex flex-col">
              <div className="p-4 border-b">
                <h3 className="font-medium text-sm text-foreground">Journey Designer</h3>
                <p className="text-xs text-muted-foreground mt-1">Drag steps to build your workflow</p>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <EnhancedJourneyDesigner
                  useCase={selectedUseCase || "Design an intelligent agent workflow with AI-powered journey steps"}
                  steps={[]}
                  onStepsChange={(steps) => {
                    console.log('Journey steps updated:', steps);
                    setJourneyStages(steps);
                  }}
                />
              </div>
            </div>

            {/* Center Canvas */}
            <div className="flex-1 flex flex-col">
              <div className="flex-1 bg-gray-50/50 relative">
                {selectedMode === 'visual' && visualWorkflowSubTab === 'canvas' && (
                  <CustomerJourneyBuilder
                    useCaseData={{
                      name: selectedUseCase,
                      description: 'Visual workflow canvas',
                      detailedUseCase: wizardData?.prompt,
                      targetUsers: 'Healthcare users',
                      expectedOutcomes: 'Automated agent workflow'
                    }}
                    capturedRequirements={{
                      connectors: ['Supabase', 'OpenAI'],
                      actions: ['Process', 'Respond'],
                      steps: ['Intake', 'Process', 'Response'],
                      integrations: ['Healthcare APIs']
                    }}
                    journeyStages={journeyStages}
                    sessionId={currentSessionId}
                    onSave={(workflow) => console.log('Workflow saved:', workflow)}
                    onGenerateAgent={(workflow) => console.log('Agent generated:', workflow)}
                  />
                )}
                
                {/* FlowiseAI-style canvas placeholder */}
                {(!selectedMode || selectedMode !== 'visual' || visualWorkflowSubTab !== 'canvas') && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                        <Workflow className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">FlowiseAI-Style Canvas</h3>
                      <p className="text-muted-foreground text-sm max-w-xs">
                        Drag journey steps from the left panel to build your intelligent agent workflow
                      </p>
                      <Button className="mt-4" onClick={() => {
                        if (selectedMode === 'visual') {
                          setVisualWorkflowSubTab('canvas');
                        }
                      }}>
                        <Plus className="w-4 h-4 mr-2" />
                        Start Building
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - AI Models & Configuration */}
            <div className="w-80 border-l bg-card overflow-hidden flex flex-col">
              <div className="p-4 border-b">
                <h3 className="font-medium text-sm text-foreground">AI Models & Config</h3>
                <p className="text-xs text-muted-foreground mt-1">Configure AI models and settings</p>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">AI Models</h4>
                    <Button size="sm" onClick={() => setShowPromptAssistant(true)}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Model
                    </Button>
                  </div>
                  
                  {/* Basic AI Model Display */}
                  <div className="space-y-3">
                    <Card className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Bot className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">GPT-4 Turbo</p>
                          <p className="text-xs text-muted-foreground">OpenAI Language Model</p>
                        </div>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                    </Card>
                    
                    <Card className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-secondary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">Claude 3.5 Sonnet</p>
                          <p className="text-xs text-muted-foreground">Anthropic Reasoning Model</p>  
                        </div>
                        <Badge variant="outline">Available</Badge>
                      </div>
                    </Card>
                  </div>
                  
                  {/* Model Configuration */}
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">Configuration</h4>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="temperature" className="text-xs">Temperature</Label>
                        <Input id="temperature" type="number" min="0" max="1" step="0.1" defaultValue="0.7" className="h-8" />
                      </div>
                      <div>
                        <Label htmlFor="maxTokens" className="text-xs">Max Tokens</Label>
                        <Input id="maxTokens" type="number" defaultValue="2048" className="h-8" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Assistant Panel (optional overlay) */}
        {showPromptAssistant && (
          <div className="absolute top-0 right-0 w-80 h-full border-l bg-card flex flex-col z-50">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">AI Assistant</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowPromptAssistant(false)}
              >
                ×
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <PromptAssistant
                mode={selectedMode as any}
                onGenerate={handlePromptGenerate}
                isVisible={true}
                onToggle={() => setShowPromptAssistant(!showPromptAssistant)}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  // Show questionnaire if needed
  if (showQuestionnaire) {
    return (
      <AppLayout>
        <div className="p-6">
          <IntelligentQuestionnaire 
            onComplete={handleQuestionnaireComplete} 
          />
        </div>
      </AppLayout>
    );
  }

  // Show mode selector if no mode selected
  if (showModeSelector || !selectedMode) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Choose Your Building Approach</h1>
              <p className="text-muted-foreground">Select how you'd like to build your agent</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => handleModeSelect('visual' as any)} title="Skip straight to Visual Workflow">
                Quick Start (Visual)
              </Button>
            </div>
          </div>

          <ModeSelector 
            selectedMode={selectedMode}
            onModeSelect={(mode) => handleModeSelect(mode as any)}
          />
        </div>
      </AppLayout>
    );
  }

  // Main render - FlowiseAI Layout
  return renderFlowiseLayout();
};

const Agents: React.FC = () => (
  <AgentBuilderProvider>
    <AgentsInner />
  </AgentBuilderProvider>
);

export default Agents;