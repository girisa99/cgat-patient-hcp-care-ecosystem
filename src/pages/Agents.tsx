import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { AdvancedReactFlowWrapper } from '@/components/workflow-builder/AdvancedReactFlow';
import { NodeConfigurationPanel } from '@/components/workflow-builder/NodeConfigurationPanel';
import { useAgentSession } from '@/hooks/useAgentSession';
import { supabase } from '@/integrations/supabase/client';

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
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [showAssistant, setShowAssistant] = useState(false);

  const { userSessions, currentSessionId, currentSession, actions, setActions } = useAgentBuilder();
  const { createSession, updateSession } = useAgentSession();
  const { user } = useMasterAuth();

  const handleFlowSave = async (flowData: any) => {
    try {
      if (!user) {
        toast.error('Please sign in to save your canvas');
        return;
      }

      if (currentSessionId) {
        const { error } = await supabase
          .from('agent_sessions')
          .update({ canvas: flowData })
          .eq('id', currentSessionId)
          .eq('user_id', user.id);
        if (error) throw error;
        toast.success('Workflow saved to your current session');
      } else {
        const { error } = await supabase
          .from('agent_sessions')
          .insert({
            name: 'Genie Flow',
            user_id: user.id,
            canvas: flowData,
            status: 'draft'
          });
        if (error) throw error;
        toast.success('Workflow saved');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save workflow');
    }
  };

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

  // Genie AI Layout - Matching screenshot structure exactly
  const renderFlowiseLayout = () => {
    return (
      <div className="h-screen flex flex-col bg-background">
        {/* Top Header with Breadcrumb Navigation */}
        <div className="h-14 border-b bg-card flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">Visual Workflow Builder</h1>
              <Badge variant="secondary" className="text-xs">USE-CASE</Badge>
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
          {/* Left Panel - Journey Designer */}
          <div className="w-80 border-r bg-card flex flex-col">
            <div className="p-4 border-b">
              <h3 className="font-medium text-sm">Journey Designer</h3>
              <p className="text-xs text-muted-foreground mt-1">Drag steps to build your workflow</p>
            </div>
            
            {/* Journey Design Section */}
            <div className="p-4 border-b">
              <h4 className="font-medium text-sm mb-3">Journey Design</h4>
              <p className="text-xs text-muted-foreground mb-4">
                No template is linked yet. Create a template to manage journey stages.
              </p>
              
              <Button 
                onClick={() => {
                  toast.success('Template created successfully!');
                }}
                className="w-full mb-4"
              >
                Create Template
              </Button>
            </div>

            {/* Journey Stages Form */}
            <div className="flex-1 overflow-auto p-4">
              <h4 className="font-medium text-sm mb-3">Journey Stages</h4>
              <p className="text-xs text-muted-foreground mb-4">
                Define the sequential steps for this template
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">1</span>
                  <span>New Stage</span>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Title</Label>
                      <Input placeholder="New Stage" className="mt-1 h-8" />
                    </div>
                    <div>
                      <Label className="text-xs">Owner Role</Label>
                      <Input placeholder="" className="mt-1 h-8" />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs">Description</Label>
                    <Textarea placeholder="" className="mt-1 min-h-[60px] text-xs" />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Expected Duration (min)</Label>
                      <Input type="number" className="mt-1 h-8" />
                    </div>
                    <div>
                      <Label className="text-xs">Entry Criteria (comma-separated)</Label>
                      <Input placeholder="" className="mt-1 h-8" />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Tasks Checklist (one per line)</Label>
                    <Textarea placeholder="" className="mt-1 min-h-[60px] text-xs" />
                  </div>

                  <div>
                    <Label className="text-xs">Outputs / Success Criteria (one per line)</Label>
                    <Textarea placeholder="" className="mt-1 min-h-[60px] text-xs" />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Risks (comma-separated)</Label>
                      <Input placeholder="" className="mt-1 h-8" />
                    </div>
                    <div>
                      <Label className="text-xs">Dependencies (comma-separated)</Label>
                      <Input placeholder="" className="mt-1 h-8" />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" className="w-8 h-8 p-0">
                        <ArrowUp className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" className="w-8 h-8 p-0">
                        <ArrowDown className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="destructive" className="w-8 h-8 p-0">
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      toast.success('Stage added successfully!');
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Stage
                  </Button>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        toast.success('Journey refreshed!');
                      }}
                    >
                      Refresh
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        toast.success('Journey stages applied to AI models!');
                      }}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center Canvas Area */}
          <div className="flex-1 flex flex-col bg-gray-50/50 min-h-0">
            <div className="p-4 border-b bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-medium text-sm">Patient Onboarding</h2>
                  <p className="text-xs text-muted-foreground">Visual workflow canvas - Pre-configured with your requirements and journey stages</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">Builder</Badge>
                </div>
              </div>
            </div>
            {/* ReactFlow Builder */}
            <div className="flex-1 min-h-0">
              <AdvancedReactFlowWrapper 
                fitParent={true}
                workflowType="visual"
                sessionId={currentSession?.id}
                initialNodes={[]}
                initialEdges={[]}
                onNodeSelect={setSelectedNode}
                onSave={(data) => {
                  console.log('Canvas data saved:', data);
                }}
              />
            </div>
          </div>

          {/* Right Panel - AI Model Selection & Node Configuration */}
          <div className="w-80 border-l bg-background flex flex-col">
            {selectedNode ? (
              <NodeConfigurationPanel
                node={selectedNode}
                onUpdate={(nodeId, updates) => {
                  console.log('Node configuration updated:', nodeId, updates);
                }}
                onDelete={(nodeId) => {
                  console.log('Node deleted from config panel:', nodeId);
                  setSelectedNode(null);
                }}
                onClose={() => setSelectedNode(null)}
                availableConnectors={[
                  'REST API', 'GraphQL', 'WebSocket', 'Database', 
                  'Email', 'SMS', 'Slack', 'Teams', 'Webhook'
                ]}
                aiModels={[
                  'gpt-4o-mini', 'gpt-4o', 'claude-3-sonnet', 
                  'claude-3-haiku', 'gemini-pro', 'llama-3'
                ]}
              />
            ) : (
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">AI Model & Prompts</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="model-select">Select AI Model</Label>
                      <Select defaultValue="gpt-4o-mini">
                        <SelectTrigger id="model-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gpt-4o-mini">GPT-4O Mini</SelectItem>
                          <SelectItem value="gpt-4o">GPT-4O</SelectItem>
                          <SelectItem value="claude-3">Claude 3</SelectItem>
                          <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="system-prompt">System Prompt</Label>
                      <Textarea 
                        id="system-prompt"
                        placeholder="Enter system prompt..."
                        className="min-h-[100px]"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="user-prompt">User Prompt Template</Label>
                      <Textarea 
                        id="user-prompt"
                        placeholder="Enter user prompt template..."
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                </div>
                
                {/* AI Assistant Toggle */}
                <div className="border-t pt-6">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowAssistant(!showAssistant)}
                  >
                    <Bot className="w-4 h-4 mr-2" />
                    {showAssistant ? 'Hide' : 'Show'} AI Assistant
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Assistant Panel (fixed positioning) */}
        {showPromptAssistant && (
          <div className="fixed top-4 right-4 w-96 max-h-[80vh] border bg-card rounded-lg shadow-lg flex flex-col z-50">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-sm">AI Workflow Assistant</h3>
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
                  <Label className="text-xs font-medium">Conversation</Label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Hi! I'm your AI assistant. I'll help guide you through building your workflow. What would you like to create?
                  </p>
                  <Textarea 
                    placeholder="Describe your agent: e.g. Create a customer support agent that handles inquiries and escalates complex issues..."
                    className="min-h-[80px] text-xs"
                  />
                </div>
                <Button 
                  className="w-full h-8"
                  onClick={() => {
                    toast.success('Workflow generated!');
                    setShowPromptAssistant(false);
                  }}
                >
                  <Sparkles className="w-3 h-3 mr-2" />
                  Generate Workflow
                </Button>
                <div className="text-xs text-muted-foreground bg-secondary/20 p-3 rounded">
                  <p className="font-medium mb-1">Smart Suggestions</p>
                  <ul className="space-y-1">
                    <li>• Add Decision Points (medium)</li>
                    <li>• Add AI Agent (medium)</li>
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

  // Main render - Genie AI Layout
  return renderFlowiseLayout();
};

const Agents: React.FC = () => (
  <AgentBuilderProvider>
    <AgentsInner />
  </AgentBuilderProvider>
);

export default Agents;