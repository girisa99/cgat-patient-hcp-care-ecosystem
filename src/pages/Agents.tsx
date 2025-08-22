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
import { NodePalette } from '@/components/workflow-builder/NodePalette';
import { WorkflowAssetPanel } from '@/components/workflow-builder/WorkflowAssetPanel';
import { LibrariesAndActions } from '@/components/workflow-builder/LibrariesAndActions';
import { ResizablePanel } from '@/components/workflow-builder/ResizablePanel';
import { AIAssistant } from '@/components/workflow-builder/AIAssistant';
import { ContextualAccessOverlay } from '@/components/workflow-builder/ContextualAccessOverlay';
import { ExpandedWorkflowAssetPanel } from '@/components/workflow-builder/ExpandedWorkflowAssetPanel';
import { useAgentSession } from '@/hooks/useAgentSession';
import { supabase } from '@/integrations/supabase/client';
import { Node } from '@xyflow/react';

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
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showAssistant, setShowAssistant] = useState(false);
  const [leftPanelTab, setLeftPanelTab] = useState<'palette' | 'access'>('palette');
  const [rightPanelTab, setRightPanelTab] = useState<'config' | 'libraries' | 'assistant'>('config');
  const [showContextualAccess, setShowContextualAccess] = useState(false);
  const [isInlineConfigOpen, setInlineConfigOpen] = useState(false);
  const [accessNodePosition, setAccessNodePosition] = useState({ x: 0, y: 0 });

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

  // Avoid opening the right panel when inline node config is requested and track inline state
  useEffect(() => {
    const openHandler = () => {};
    const inlineOpen = () => setInlineConfigOpen(true);
    const inlineClose = () => setInlineConfigOpen(false);
    window.addEventListener('open-node-config', openHandler as EventListener);
    window.addEventListener('inline-config-opened', inlineOpen as EventListener);
    window.addEventListener('inline-config-closed', inlineClose as EventListener);
    return () => {
      window.removeEventListener('open-node-config', openHandler as EventListener);
      window.removeEventListener('inline-config-opened', inlineOpen as EventListener);
      window.removeEventListener('inline-config-closed', inlineClose as EventListener);
    };
  }, []);

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

        {/* Main Content - Enhanced Four Panel Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Expanded Workflow Asset Panel */}
          <ExpandedWorkflowAssetPanel 
            isCollapsed={false}
            onToggle={() => {}}
          />

          {/* Center Canvas Area */}
          <div className="flex-1 flex flex-col bg-gray-50/50 min-h-0">
            <div className="p-4 border-b bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-medium text-sm">Advanced Workflow Builder</h2>
                  <p className="text-xs text-muted-foreground">
                    Drag nodes from palette, configure with AI assistance, connect to data sources and APIs
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">Auto-Code</Badge>
                  <Badge variant="secondary" className="text-xs">AI-Powered</Badge>
                  <Badge variant="outline" className="text-xs">Connected</Badge>
                </div>
              </div>
            </div>
            {/* ReactFlow Builder */}
            <div className="flex-1 min-h-0 relative">
              <AdvancedReactFlowWrapper 
                fitParent={true}
                workflowType="visual"
                sessionId={currentSession?.id}
                initialNodes={[]}
                initialEdges={[]}
                onNodeSelect={(node) => {
                  setSelectedNode(node);
                  setRightPanelTab('config');
                  
                  // Show contextual access overlay for selected node
                  if (node) {
                    setTimeout(() => {
                      const nodeElement = document.querySelector(`[data-id="${node.id}"]`);
                      if (nodeElement) {
                        const rect = nodeElement.getBoundingClientRect();
                        const containerRect = nodeElement.closest('.react-flow')?.getBoundingClientRect();
                        if (containerRect) {
                          setAccessNodePosition({
                            x: rect.left - containerRect.left + rect.width,
                            y: rect.top - containerRect.top
                          });
                          setShowContextualAccess(true);
                        }
                      }
                    }, 100);
                  } else {
                    setShowContextualAccess(false);
                  }
                }}
                onSave={handleFlowSave}
              />
              
              {/* Contextual Access Overlay */}
              {showContextualAccess && selectedNode && (
                <ContextualAccessOverlay
                  node={selectedNode}
                  position={accessNodePosition}
                  onClose={() => setShowContextualAccess(false)}
                />
              )}
            </div>
          </div>

          {/* Right Panel - Resizable Configuration, Libraries & AI Assistant */}
          {!isInlineConfigOpen && (
            <ResizablePanel 
              initialWidth={380}
              minWidth={320}
              maxWidth={800}
              className="border-l bg-background flex flex-col"
            >
              <div className="border-b">
                <div className="flex">
                  <Button
                    variant={rightPanelTab === 'config' ? 'default' : 'ghost'}
                    size="sm"
                    className="flex-1 rounded-none text-xs"
                    onClick={() => setRightPanelTab('config')}
                  >
                    <Settings className="w-3 h-3 mr-1" />
                    Config
                  </Button>
                  <Button
                    variant={rightPanelTab === 'libraries' ? 'default' : 'ghost'}
                    size="sm"
                    className="flex-1 rounded-none text-xs"
                    onClick={() => setRightPanelTab('libraries')}
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    Actions
                  </Button>
                  <Button
                    variant={rightPanelTab === 'assistant' ? 'default' : 'ghost'}
                    size="sm"
                    className="flex-1 rounded-none text-xs"
                    onClick={() => setRightPanelTab('assistant')}
                  >
                    <Bot className="w-3 h-3 mr-1" />
                    AI
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-auto min-h-0">
                {rightPanelTab === 'config' && selectedNode && (
                  <NodeConfigurationPanel
                    node={selectedNode}
                    onUpdate={(nodeId, updates) => {
                      console.log('Node configuration updated:', nodeId, updates);
                    }}
                    onDelete={(nodeId) => {
                      console.log('Node deleted:', nodeId);
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
                )}
                {rightPanelTab === 'libraries' && <LibrariesAndActions />}
                {rightPanelTab === 'config' && !selectedNode && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a node to configure its properties</p>
                  </div>
                )}
                {rightPanelTab === 'assistant' && (
                  <AIAssistant
                    selectedNode={selectedNode}
                    onWorkflowGenerate={(suggestion) => {
                      console.log('Generating workflow:', suggestion);
                    }}
                    onNodeConnect={() => {
                      console.log('Auto-connecting nodes');
                    }}
                    onBackendGenerate={() => {
                      console.log('Generating backend');
                    }}
                    onOptimizeFlow={() => {
                      console.log('Optimizing flow');
                    }}
                  />
                )}
              </div>
            </ResizablePanel>
          )}
        </div>

        {/* AI Assistant Panel (fixed positioning) */}
        {showPromptAssistant && (
          <div className="fixed top-4 right-4 w-96 max-h-[80vh] border bg-card rounded-lg shadow-lg flex flex-col z-50">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-sm">AI Workflow Assistant</h3>
              <Button 
                type="button"
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
                
                <div className="space-y-2 mt-4">
                  <p className="text-xs font-medium">Smart Actions</p>
                  <Button size="sm" variant="outline" className="w-full text-xs justify-start">
                    <Lightbulb className="w-3 h-3 mr-1" />
                    Suggest Workflow
                  </Button>
                  <Button size="sm" variant="outline" className="w-full text-xs justify-start">
                    <ArrowRight className="w-3 h-3 mr-1" />
                    Auto-Connect Nodes
                  </Button>
                  <Button size="sm" variant="outline" className="w-full text-xs justify-start">
                    <Database className="w-3 h-3 mr-1" />
                    Generate Backend
                  </Button>
                  <Button size="sm" variant="outline" className="w-full text-xs justify-start">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Optimize Flow
                  </Button>
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