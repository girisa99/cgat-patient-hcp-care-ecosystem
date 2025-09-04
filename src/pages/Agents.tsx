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
  X,
  Target,
  Brain,
  Network,
  Users
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
import { SidebarProvider } from '@/components/ui/sidebar';
import { NodeConfigurationPanel } from '@/components/workflow-builder/NodeConfigurationPanel';
import { NodePalette } from '@/components/workflow-builder/NodePalette';
import { WorkflowAssetPanel } from '@/components/workflow-builder/WorkflowAssetPanel';
import { LibrariesAndActions } from '@/components/workflow-builder/LibrariesAndActions';
import { ResizablePanel } from '@/components/workflow-builder/ResizablePanel';
import { UnifiedAgentAssist } from '@/components/unified/UnifiedAgentAssist';
import { UnifiedWorkflowExperience } from '@/components/unified-workflow/UnifiedWorkflowExperience';
import { AIAssistIntegration } from '@/components/unified-workflow/AIAssistIntegration';
import { ConfigurableNodePanel } from '@/components/unified-workflow/ConfigurableNodePanel';

// Import new Agent Ecosystem components
import { AgentEcosystemDashboard, AgentOrchestrationEngine } from '@/components/agent-ecosystem';

// Import Observability components
import { ObservabilityDashboard } from '@/components/observability/ObservabilityDashboard';
import { AnimatedFlowVisualizer } from '@/components/observability/AnimatedFlowVisualizer';

import { ExpandedWorkflowAssetPanel } from '@/components/workflow-builder/ExpandedWorkflowAssetPanel';
import { useAgentSession } from '@/hooks/useAgentSession';
import { supabase } from '@/integrations/supabase/client';
import { Node, ReactFlowProvider } from '@xyflow/react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

const AgentsInner = () => {
  // State management
  const [selectedMode, setSelectedMode] = useState<AgentMode | null>('unified');
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
  const [isInlineConfigOpen, setInlineConfigOpen] = useState(false);
  const [workflowNodes, setWorkflowNodes] = useState<any[]>([]);
  const [workflowEdges, setWorkflowEdges] = useState<any[]>([]);
  const [showUnifiedAssist, setShowUnifiedAssist] = useState(false);
  const [showAIAssist, setShowAIAssist] = useState(false);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [aiAssistMode, setAIAssistMode] = useState<'build' | 'generate' | 'test' | 'deploy' | 'configure'>('build');
  const [selectedNodeData, setSelectedNodeData] = useState<any>(null);
  const [showObservability, setShowObservability] = useState(false);
  const [showAnimatedFlow, setShowAnimatedFlow] = useState(false);

  console.log('[Agents] state init', {
    selectedMode,
    showModeSelector,
    showQuestionnaire
  });


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

  // Initialize questionnaire/mode only once or when not chosen
  useEffect(() => {
    const completed = localStorage.getItem('agentBuilder_questionnaireCompleted') === 'true';
    setHasCompletedQuestionnaire(completed);
    
    // Restore persisted mode once if available
    const storedMode = localStorage.getItem('agentBuilder_selectedMode') as AgentMode | null;
    if (!selectedMode && storedMode) {
      setSelectedMode(storedMode as any);
      setShowModeSelector(false);
      return;
    }

    // Only compute defaults when no mode chosen yet to avoid resets
    if (!selectedMode) {
      if (!completed && (userSessions?.length ?? 0) === 0) {
        setShowQuestionnaire(true);
        setShowModeSelector(false);
      } else {
        setShowQuestionnaire(false);
        setShowModeSelector(true);
      }
    }
  }, [userSessions, selectedMode]);

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
    try { localStorage.setItem('agentBuilder_selectedMode', mode as any); } catch {}
    setShowModeSelector(false);
    
    if (mode === 'unified') {
      // Use unified workflow experience
      toast.success('Switched to Unified Workflow Experience');
    } else if (mode === 'visual') {
      setVisualWorkflowSubTab('use-case');
    } else if (mode === 'ecosystem') {
      toast.success('Switched to Agent Ecosystem Management');
    } else {
      setAgentBuilderTab('agent-config');
    }
    
    const modeText = mode === 'unified' ? 'Unified Workflow' : 
                     mode === 'visual' ? 'Visual Workflow' : 
                     mode === 'ecosystem' ? 'Agent Ecosystem' : 'Manual Configuration';
    toast.success(`Switched to ${modeText} mode`);
  };

  const handleUseCaseSelect = (useCase: string) => {
    setSelectedUseCase(useCase);
    setVisualWorkflowSubTab('journey');
    toast.success('Use case selected! Now define your journey stages.');
    setShowUnifiedAssist(true);
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

  const handleAIAssistOpen = (mode: 'build' | 'generate' | 'test' | 'deploy' | 'configure', nodeId?: string) => {
    setAIAssistMode(mode);
    setSelectedNodeData(nodeId ? { id: nodeId } : null);
    setShowAIAssist(true);
  };

  const handleWorkflowGenerated = (workflow: any) => {
    setWorkflowNodes(workflow.nodes || []);
    setWorkflowEdges(workflow.edges || []);
    toast.success('Workflow generated successfully!');
  };

  const handleNodeGenerated = (node: any) => {
    if (node.nodes) {
      setWorkflowNodes(prev => [...prev, ...node.nodes]);
    } else {
      setWorkflowNodes(prev => [...prev, node]);
    }
    toast.success('Node generated successfully!');
  };

  const handleNodeConfigOpen = (nodeData: any) => {
    setSelectedNodeData(nodeData);
    setShowConfigPanel(true);
  };

  const handleNodeConfigSave = (nodeData: any) => {
    toast.success('Node configuration saved');
    setShowConfigPanel(false);
  };

  // Genie AI Layout - Matching screenshot structure exactly
  const renderFlowiseLayout = () => {
    console.log('[Agents] renderFlowiseLayout start');
    return (
      <div className="h-screen flex flex-col bg-background">
        {/* Compact Top Header */}
        <div className="h-10 border-b bg-card flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold">Visual Workflow Builder</h1>
            <Badge variant="secondary" className="text-xs">ADVANCED</Badge>
          </div>
          
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
              <Save className="w-3 h-3 mr-1" />
              Save
            </Button>
            <Button size="sm" className="h-7 px-2 text-xs bg-primary hover:bg-primary/90">
              <Play className="w-3 h-3 mr-1" />
              Deploy
            </Button>
            <Button size="sm" className="h-7 px-2 text-xs bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg" onClick={() => setShowUnifiedAssist(!showUnifiedAssist)}>
              <Sparkles className="w-3 h-3 mr-1" />
              🚀 Unified AI Assist
            </Button>
          </div>
        </div>

        {/* Main Content - Flowise-Inspired Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Full Canvas Area with Integrated Palette */}
          <div className="flex-1 flex flex-col bg-gray-50/50 min-h-0">
            {/* ReactFlow Builder */}
            <div className="flex-1 min-h-0 relative">
              <ErrorBoundary fallbackComponent={({ error, retry }) => (
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <div className="text-xs text-center space-y-2 max-w-lg">
                    <div className="font-medium">Canvas failed to load</div>
                    <div className="text-muted-foreground break-all mx-auto">{error?.message}</div>
                    {error?.stack && (
                      <pre className="text-left bg-muted/30 p-2 rounded max-h-48 overflow-auto whitespace-pre-wrap">{error.stack}</pre>
                    )}
                    <Button size="sm" variant="outline" onClick={retry}>Retry</Button>
                  </div>
                </div>
              )}>
                <SidebarProvider className="w-full h-full min-h-0">
                  <div className="min-h-0 h-full flex w-full">
                    <AdvancedReactFlowWrapper 
                      fitParent={true}
                      workflowType="visual"
                      sessionId={currentSession?.id}
                      initialNodes={workflowNodes}
                      initialEdges={workflowEdges}
                       onNodeSelect={(node) => {
                         setSelectedNode(node);
                         setRightPanelTab('config');
                         setShowPromptAssistant(false);
                       }}
                      onSave={handleFlowSave}
                    />
                  </div>
                </SidebarProvider>
              </ErrorBoundary>
              
            </div>
          </div>
        </div>

        {/* AI Assistant Panel (fixed positioning) */}
        {false && (
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

        {/* Unified AI Assist (non-blocking right panel) */}
        {showUnifiedAssist && (
          <aside className="fixed inset-y-0 right-0 z-40 w-[min(560px,100vw)] border-l bg-card shadow-xl flex flex-col">
            <div className="flex-1 overflow-auto p-3">
              <UnifiedAgentAssist
                workflowNodes={workflowNodes}
                workflowEdges={workflowEdges}
                selectedNode={selectedNode}
                onAgentGenerated={(finalAgent: any) => {
                  const toEnhanced = (nodes: any[]) => (nodes || []).map((n) => {
                    if (n.type === 'enhanced') return n;
                    const label = n.data?.label || n.label || n.name || 'Node';
                    const lower = String(label).toLowerCase();
                    const category = lower.includes('agent') ? 'ai-agents' : (lower.includes('vector') || lower.includes('api')) ? 'integrations' : 'data-processing';
                    return {
                      id: n.id || `${lower.replace(/\s+/g,'-')}-${Date.now()}`,
                      type: 'enhanced',
                      position: n.position || { x: 100, y: 100 },
                      data: {
                        label,
                        type_key: n.type || 'node',
                        display_name: label,
                        description: n.data?.description || '',
                        icon: n.data?.icon || (category==='ai-agents'?'bot':category==='integrations'?'globe':'database'),
                        category,
                        color: category === 'ai-agents' ? '#3b82f6' : category === 'integrations' ? '#10b981' : '#8b5cf6',
                        capabilities: n.data?.capabilities || [],
                        requirements: n.data?.requirements || {},
                        configuration: n.data?.configuration || {},
                        tools: n.data?.tools || [],
                        models: n.data?.models || [],
                        aiAssistEnabled: true,
                        supportedModes: ['build','generate','test','deploy','configure'],
                        isWorkflowNode: true
                      }
                    } as any;
                  });
                  setWorkflowNodes(toEnhanced(finalAgent.nodes || []));
                  setWorkflowEdges((finalAgent.edges || []).map((e: any, idx: number) => ({ id: e.id || `e-${idx}`, updatable: true, ...e })));
                  toast.success('Applied to canvas');
                }}
                onClose={() => setShowUnifiedAssist(false)}
              />
            </div>
          </aside>
        )}
      </div>
    );
  };

  // Show questionnaire if needed
  if (showQuestionnaire) {
    console.log('[Agents] rendering Questionnaire branch');
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
    console.log('[Agents] rendering ModeSelector branch', { selectedMode, showModeSelector });
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

  // Main content based on selected mode
  if (selectedMode === 'unified') {
    return (
      <AppLayout>
        <div className="h-screen flex flex-col">
          <UnifiedWorkflowExperience />
          
          {/* AI Assistant Integration */}
          <AIAssistIntegration
            isOpen={showAIAssist}
            onClose={() => setShowAIAssist(false)}
            onWorkflowGenerated={handleWorkflowGenerated}
            onNodeGenerated={handleNodeGenerated}
            initialMode={aiAssistMode}
            selectedNodeId={selectedNodeData?.id}
          />

          {/* Configurable Node Panel */}
          <ConfigurableNodePanel
            isOpen={showConfigPanel}
            onClose={() => setShowConfigPanel(false)}
            nodeData={selectedNodeData}
            onSave={handleNodeConfigSave}
            onAIAssist={handleAIAssistOpen}
          />
        </div>
      </AppLayout>
    );
  }

  // Agent Ecosystem Management mode
  if (selectedMode === 'ecosystem') {
    return (
      <AppLayout>
        <AgentEcosystemDashboard />
      </AppLayout>
    );
  }

  // AI Observability mode
  if (selectedMode === 'observability') {
    return (
      <AppLayout>
        <ObservabilityDashboard />
      </AppLayout>
    );
  }

  // Animated Flow Visualizer mode
  if (selectedMode === 'animated-flow') {
    return (
      <AppLayout>
        <AnimatedFlowVisualizer />
      </AppLayout>
    );
  }

  // Main render - Genie AI Layout (Visual/Manual modes)
  return renderFlowiseLayout();
};

const Agents: React.FC = () => (
  <AgentBuilderProvider>
    <AgentsInner />
  </AgentBuilderProvider>
);

export default Agents;