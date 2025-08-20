import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bot, 
  Settings, 
  Workflow, 
  ArrowRight,
  Database,
  Zap,
  ArrowLeft,
  Lightbulb,
  MessageCircle
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

        {/* Center Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <div className="h-14 border-b bg-card flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              {/* Breadcrumb Navigation */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {selectedMode === 'visual' && (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => setVisualWorkflowSubTab('use-case')}>
                      Use Case
                    </Button>
                    <ArrowRight className="w-4 h-4" />
                    <Button variant="ghost" size="sm" onClick={() => setVisualWorkflowSubTab('journey')}>
                      Journey
                    </Button>
                    <ArrowRight className="w-4 h-4" />
                    <Button variant="ghost" size="sm" onClick={() => setVisualWorkflowSubTab('wizard')}>
                      Setup
                    </Button>
                    <ArrowRight className="w-4 h-4" />
                    <Button variant="ghost" size="sm" onClick={() => setVisualWorkflowSubTab('canvas')}>
                      Canvas
                    </Button>
                  </>
                )}
                {selectedMode === 'manual' && (
                  <span className="font-medium">Manual Configuration - {agentBuilderTab}</span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowPromptAssistant(!showPromptAssistant)}>
                <Lightbulb className="w-4 h-4 mr-1" />
                AI Assistant
              </Button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-hidden">
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
            
            {selectedMode === 'visual' && visualWorkflowSubTab !== 'canvas' && (
              <div className="p-6">
                {visualWorkflowSubTab === 'use-case' && (
                  <div className="max-w-2xl">
                    <h2 className="text-2xl font-bold mb-4">Select Your Use Case</h2>
                    <p className="text-muted-foreground mb-6">Choose or define what your agent should accomplish</p>
                    <UseCaseSelector
                      selectedUseCase={selectedUseCase}
                      onUseCaseChange={handleUseCaseSelect}
                      selectedCategories={[]}
                      selectedTopics={[]}
                    />
                  </div>
                )}
                
                {visualWorkflowSubTab === 'journey' && (
                  <div className="max-w-4xl">
                    <h2 className="text-2xl font-bold mb-4">Design Customer Journey</h2>
                    <p className="text-muted-foreground mb-6">Map out the stages and touchpoints</p>
                    <JourneyEditor />
                  </div>
                )}
                
                {visualWorkflowSubTab === 'wizard' && (
                  <div className="max-w-3xl">
                    <h2 className="text-2xl font-bold mb-4">Configure Your Agent</h2>
                    <p className="text-muted-foreground mb-6">Set up the agent's behavior and capabilities</p>
                    <StreamlinedAgentWizard />
                  </div>
                )}
              </div>
            )}
            
            {selectedMode === 'manual' && (
              <div className="h-full">
                {agentBuilderTab === 'agent-config' && (
                  <div className="p-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="w-5 h-5" />
                          Agent Configuration
                        </CardTitle>
                        <CardDescription>Basic agent settings and behavior</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-medium mb-4">Basic Agent Settings</h4>
                            <div className="grid gap-4">
                              <div className="grid gap-2">
                                <Label htmlFor="agent-name">Agent Name</Label>
                                <Input id="agent-name" placeholder="Enter your agent's name" />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="agent-description">Description</Label>
                                <Textarea id="agent-description" placeholder="Describe what your agent does..." rows={3} />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="response-time">Response Time (seconds)</Label>
                                <Input id="response-time" type="number" placeholder="5" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                {agentBuilderTab === 'models-templates' && (
                  <div className="p-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bot className="w-5 h-5" />
                          Models & Templates
                        </CardTitle>
                        <CardDescription>AI models and configuration templates</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ModelManagementDashboard />
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                {agentBuilderTab === 'connectors-api' && (
                  <div className="p-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Database className="w-5 h-5" />
                          Connectors & APIs
                        </CardTitle>
                        <CardDescription>External system integrations</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <EnhancedConnectorSystem 
                          agentId={currentSessionId || ''}
                          actions={actions.map(action => ({
                            id: action.id,
                            name: action.name,
                            type: action.type,
                            category: action.category,
                            description: action.description
                          }))}
                          onAssignmentsChange={() => {}}
                        />
                        <AgenticAPIEcosystem />
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                {agentBuilderTab === 'actions-tasks' && (
                  <div className="p-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Zap className="w-5 h-5" />
                          Actions & Tasks
                        </CardTitle>
                        <CardDescription>Define automated actions and task workflows</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ActionsTab
                          sessionId={currentSessionId || ''}
                          actions={actions}
                          onActionsChange={setActions}
                        />
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Properties & Configuration */}
        {showPromptAssistant && (
          <div className="w-80 border-l bg-card flex flex-col">
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