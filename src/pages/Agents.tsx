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
  Sparkles,
  ArrowUp,
  ArrowDown,
  X
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

  // FlowiseAI Layout - Matching screenshot structure
  const renderFlowiseLayout = () => {
    return (
      <div className="h-screen flex flex-col bg-background">
        {/* Top Header with Breadcrumb Navigation */}
        <div className="h-14 border-b bg-card flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">Agent Builder</h1>
              <Badge variant="secondary" className="text-xs">FlowiseAI Style</Badge>
            </div>
            
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Button variant="ghost" size="sm" className="h-8 px-3">Use Case</Button>
              <ArrowRight className="w-4 h-4" />
              <Button variant="ghost" size="sm" className="h-8 px-3">Journey</Button>
              <ArrowRight className="w-4 h-4" />
              <Button variant="ghost" size="sm" className="h-8 px-3">Setup</Button>
              <ArrowRight className="w-4 h-4" />
              <Button variant="default" size="sm" className="h-8 px-3">Canvas</Button>
            </div>
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
              <Bot className="w-4 h-4 mr-1" />
              AI Assistant
            </Button>
          </div>
        </div>

        {/* Main Content - Three Panel Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Journey Designer & Node Library */}
          <div className="w-80 border-r bg-card flex flex-col">
            <div className="p-4 border-b">
              <h3 className="font-medium text-sm">Journey Designer</h3>
              <p className="text-xs text-muted-foreground mt-1">Drag steps to build your workflow</p>
            </div>
            
            {/* Visual Canvas Section */}
            <div className="p-4 border-b">
              <h4 className="font-medium text-sm mb-3">Visual Canvas</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-accent">
                  <Bot className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">Agent Nodes</span>
                </div>
                <div className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-accent">
                  <MessageCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Chat Nodes</span>
                </div>
                <div className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-accent">
                  <Database className="w-4 h-4 text-purple-500" />
                  <span className="text-sm">Data Nodes</span>
                </div>
              </div>
            </div>

            {/* Enhanced Journey Designer */}
            <div className="flex-1 overflow-auto p-4">
              <h4 className="font-medium text-sm mb-3">Enhanced Journey Designer</h4>
              <p className="text-xs text-muted-foreground mb-4">
                Design, reorder, and enhance your journey steps with AI assistance
              </p>
              
              {/* Add Components Section */}
              <div className="space-y-3">
                <h5 className="font-medium text-xs text-muted-foreground uppercase tracking-wider">Add Components</h5>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-accent">
                    <Bot className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">Customer Touchpoint</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-accent">
                    <Zap className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">Interaction Point</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-accent">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span className="text-sm">AI Agent</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-accent">
                    <ArrowRight className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">Decision Point</span>
                  </div>
                </div>
              </div>

              {/* Quick Templates */}
              <div className="mt-6 space-y-3">
                <h5 className="font-medium text-xs text-muted-foreground uppercase tracking-wider">Quick Templates</h5>
                
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                    Patient Onboarding
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                    Appointment Scheduling  
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                    Insurance Verification
                  </Button>
                </div>
              </div>

              {/* Advanced ReactFlow Builder */}
              <div className="mt-6">
                <h5 className="font-medium text-xs text-muted-foreground uppercase tracking-wider mb-3">Advanced ReactFlow Builder</h5>
                <div className="bg-secondary/20 rounded p-3">
                  <div className="flex gap-2 mb-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs">Layout</Button>
                    <Button variant="ghost" size="sm" className="flex-1 text-xs">Nodes</Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <p className="mb-2">Validation Issues:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Isolated nodes found: Process, Response</li>
                      <li>• No start node defined</li>
                      <li>• No end node defined</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button className="w-full mt-4" onClick={() => {
                toast.success('AI suggestions generated!');
              }}>
                <Lightbulb className="w-4 h-4 mr-2" />
                Add Final Step
              </Button>
            </div>
          </div>

          {/* Center Canvas Area */}
          <div className="flex-1 flex flex-col bg-gray-50/50">
            <div className="p-4 border-b bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-medium text-sm">Patient Onboarding</h2>
                  <p className="text-xs text-muted-foreground">Visual workflow canvas - Pre-configured with your requirements and journey stages</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">2 connectors</Badge>
                  <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
                    AI Workflow Assistant
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex-1 relative">
              <CustomerJourneyBuilder
                useCaseData={{
                  name: 'Patient Onboarding',
                  description: 'Visual workflow canvas',
                  detailedUseCase: 'Healthcare workflow for patient onboarding',
                  targetUsers: 'Healthcare users',
                  expectedOutcomes: 'Automated patient onboarding workflow'
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
            </div>
          </div>

          {/* Right Panel - Node Configuration */}
          <div className="w-80 border-l bg-card flex flex-col">
            <div className="p-4 border-b">
              <h3 className="font-medium text-sm">Node Configuration</h3>
              <p className="text-xs text-muted-foreground mt-1">Configure selected node settings</p>
            </div>
            
            <div className="flex-1 overflow-auto p-4">
              {/* Node Configuration Tabs */}
              <div className="border-b mb-4">
                <div className="flex gap-1">
                  <Button variant="default" size="sm" className="h-8 px-3 text-xs">Basic</Button>
                  <Button variant="ghost" size="sm" className="h-8 px-3 text-xs">Variables</Button>
                  <Button variant="ghost" size="sm" className="h-8 px-3 text-xs">APIs</Button>
                  <Button variant="ghost" size="sm" className="h-8 px-3 text-xs">Storage</Button>
                </div>
              </div>

              {/* Configuration Form */}
              <div className="space-y-4">
                <div>
                  <Label className="text-xs">Type</Label>
                  <Input className="mt-1 h-8" defaultValue="" />
                </div>
                
                <div>
                  <Label className="text-xs">Label</Label>
                  <Input className="mt-1 h-8" defaultValue="Patient Onboarding" />
                </div>
                
                <div>
                  <Label className="text-xs">Description</Label>
                  <Textarea className="mt-1 min-h-[60px] text-xs" defaultValue="Visual workflow canvas" />
                </div>

                <div>
                  <Label className="text-xs">Connector</Label>
                  <select className="w-full mt-1 h-8 px-2 border rounded text-xs">
                    <option>Select connector</option>
                    <option>Supabase</option>
                    <option>OpenAI</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4" defaultChecked />
                  <Label className="text-xs">Active</Label>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium text-xs mb-3">Settings</h4>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 text-xs h-7">
                      Simulate
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-xs h-7">
                      Save
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-xs h-7">
                      Load
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Assistant Panel (fixed positioning to not block interface) */}
        {showPromptAssistant && (
          <div className="fixed top-4 right-4 w-96 max-h-[80vh] border bg-card rounded-lg shadow-lg flex flex-col z-50">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">AI Workflow Assistant</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowPromptAssistant(false)}
                className="h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Conversation</Label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Hi! I'm your AI assistant. I'll help guide you through building your workflow. What would you like to create?
                  </p>
                  <Textarea 
                    placeholder="Describe your agent: e.g. Create a customer support agent that handles inquiries and escalates complex issues..."
                    className="min-h-[100px]"
                  />
                </div>
                <Button 
                  className="w-full"
                  onClick={() => {
                    toast.success('Workflow generated!');
                    setShowPromptAssistant(false);
                  }}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Workflow
                </Button>
                <div className="text-xs text-muted-foreground bg-secondary/20 p-3 rounded">
                  <p className="font-medium mb-1">Smart Suggestions</p>
                  <ul className="space-y-1">
                    <li>• Add Decision Points</li>
                    <li>• Add AI Agent</li>
                  </ul>
                </div>
              </div>
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