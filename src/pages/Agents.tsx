import React, { useState, useEffect } from 'react';
import { SaveAsTemplateModal } from '@/components/workflow-builder/SaveAsTemplateModal';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
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
  Save as SaveIcon,
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
import { PromptBasedAgentGenerator } from '@/components/agent-builder/PromptBasedAgentGenerator';
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
import { useMasterToast } from '@/hooks/useMasterToast';
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
import { TemplateGallery } from '@/components/unified-workflow/TemplateGallery';
import { EnvironmentChannelManager } from '@/components/unified-workflow/EnvironmentChannelManager';
import { DynamicNodeConfiguration } from '@/components/unified-workflow/DynamicNodeConfiguration';
import { useAIServiceHealth } from '@/hooks/useAIServiceHealth';

// Import new Agent Ecosystem components
import { AgentEcosystemDashboard, AgentOrchestrationEngine } from '@/components/agent-ecosystem';

// Import Observability components
import { ObservabilityDashboard } from '@/components/observability/ObservabilityDashboard';
import { AnimatedFlowVisualizer } from '@/components/observability/AnimatedFlowVisualizer';

// Import Security & Governance components  
import { AgentSecurityDashboard } from '@/components/agent-security/AgentSecurityDashboard';
import { AgentGovernanceDashboard } from '@/components/agent-governance/AgentGovernanceDashboard';

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
  const [visualWorkflowSubTab, setVisualWorkflowSubTab] = useState<'use-case' | 'journey' | 'builder' | 'ai-prompt'>('use-case');
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
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [showSaveAsTemplate, setShowSaveAsTemplate] = useState(false);
  const [showDeploymentManager, setShowDeploymentManager] = useState(false);
  const [showNodeCategories, setShowNodeCategories] = useState(true);
  const [showLibrariesPanel, setShowLibrariesPanel] = useState(false);

  console.log('[Agents] state init', {
    selectedMode,
    showModeSelector,
    showQuestionnaire
  });

  const { status: aiHealth, checkHealth } = useAIServiceHealth();
  const isAIHealthy = aiHealth.overallHealthy;

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);


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
    } else if (mode === 'visual') {
      setVisualWorkflowSubTab('use-case');
      // Auto-show template gallery and asset panel for visual mode
      setShowTemplateGallery(true);
    } else if (mode === 'ecosystem') {
      // Switch to ecosystem mode
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
    setVisualWorkflowSubTab('builder');
    toast.success('Journey stages defined! Now use the builder.');
  };

  const handleWizardComplete = (data: any) => {
    setWizardData(data);
    setVisualWorkflowSubTab('builder');
    toast.success('Setup complete! Now use the visual builder.');
  };

  const handleAIAssistOpen = (mode: 'build' | 'generate' | 'test' | 'deploy' | 'configure', nodeId?: string) => {
    setAIAssistMode(mode);
    setSelectedNodeData(nodeId ? { id: nodeId } : null);
    setShowAIAssist(true);
  };

  // Avoid duplicate success toasts when canvas updates propagate
  const aiSuccessToastShown = React.useRef(false);

  // Receive full workflow objects from AI Assistant only
  const handleAIGeneratedWorkflow = (workflow: any) => {
    console.log('[Agents] AI generated workflow:', workflow);
    setWorkflowNodes(workflow.nodes || []);
    setWorkflowEdges(workflow.edges || []);
    if (!aiSuccessToastShown.current) {
      toast.success('Workflow generated successfully!');
      aiSuccessToastShown.current = true;
    }
  };
  // Receive node/edge updates from the canvas (no toasts here)
  const handleWorkflowUpdate = (nodes: any[], edges: any[]) => {
    setWorkflowNodes(nodes || []);
    setWorkflowEdges(edges || []);
  };
  const handleNodeGenerated = (node: any) => {
    console.log('[Agents] handleNodeGenerated called with:', node);
    if (node.nodes) {
      setWorkflowNodes(prev => [...prev, ...node.nodes]);
    } else {
      setWorkflowNodes(prev => [...prev, node]);
    }
    // Only show success if not already shown by the component
    if (node && !node._successShown) {
      toast.success('Node generated successfully!');
    }
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
            <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => setShowTemplateGallery(true)}>
              <Database className="w-3 h-3 mr-1" />
              Templates
            </Button>
            <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => setShowLibrariesPanel(!showLibrariesPanel)}>
              <Network className="w-3 h-3 mr-1" />
              Libraries
            </Button>
            <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => setShowSaveAsTemplate(true)} disabled={workflowNodes.length === 0}>
              <SaveIcon className="w-3 h-3 mr-1" />
              Save as Template
            </Button>
            <Button size="sm" className="h-7 px-2 text-xs bg-primary hover:bg-primary/90" onClick={() => setShowDeploymentManager(true)}>
              <Play className="w-3 h-3 mr-1" />
              Deploy
            </Button>
            <Button size="sm" className="h-7 px-2 text-xs bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg" onClick={() => setShowUnifiedAssist(!showUnifiedAssist)} disabled={!isAIHealthy} title={!isAIHealthy ? 'AI services are unavailable. Check health status.' : undefined}>
              <Sparkles className="w-3 h-3 mr-1" />
              🚀 Unified AI Assist
            </Button>
            <Badge variant={isAIHealthy ? 'secondary' : 'destructive'} className="ml-2 text-xs">
              AI: {isAIHealthy ? 'Healthy' : 'Offline'}
            </Badge>
          </div>
        </div>

        {/* Main Content with Tabs */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Visual Mode Tabs */}
          <div className="border-b bg-card px-4 py-2">
            <div className="flex items-center gap-1">
              <Button 
                variant={visualWorkflowSubTab === 'use-case' ? 'default' : 'ghost'} 
                size="sm" 
                className="h-8 px-3 text-xs"
                onClick={() => setVisualWorkflowSubTab('use-case')}
              >
                <Target className="w-3 h-3 mr-1" />
                Use Case
              </Button>
              <Button 
                variant={visualWorkflowSubTab === 'journey' ? 'default' : 'ghost'} 
                size="sm" 
                className="h-8 px-3 text-xs"
                onClick={() => setVisualWorkflowSubTab('journey')}
              >
                <ArrowRight className="w-3 h-3 mr-1" />
                Journey
              </Button>
              <Button 
                variant={visualWorkflowSubTab === 'builder' ? 'default' : 'ghost'} 
                size="sm" 
                className="h-8 px-3 text-xs"
                onClick={() => setVisualWorkflowSubTab('builder')}
              >
                <Brain className="w-3 h-3 mr-1" />
                Builder
              </Button>
              <Button 
                variant={visualWorkflowSubTab === 'ai-prompt' ? 'default' : 'ghost'} 
                size="sm" 
                className="h-8 px-3 text-xs"
                onClick={() => setVisualWorkflowSubTab('ai-prompt')}
              >
                <Sparkles className="w-3 h-3 mr-1" />
                AI Prompt
              </Button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {/* Use Case Tab */}
            {visualWorkflowSubTab === 'use-case' && (
              <div className="h-full p-6">
                <UseCaseSelector 
                  selectedUseCase={selectedUseCase}
                  onUseCaseChange={handleUseCaseSelect}
                  selectedCategories={[]}
                  selectedTopics={[]}
                />
              </div>
            )}

            {/* Journey Tab */}
            {visualWorkflowSubTab === 'journey' && (
              <div className="h-full p-6">
                {selectedUseCase ? (
                  <JourneyEditor
                    useCase={selectedUseCase}
                    onApplied={handleJourneyComplete}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Please select a use case first</p>
                  </div>
                )}
              </div>
            )}

            {/* AI Prompt Tab */}
            {visualWorkflowSubTab === 'ai-prompt' && (
              <div className="h-full p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          AI Agent Builder
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <PromptBasedAgentGenerator 
                          onGenerate={(agent) => {
                            setWorkflowNodes(agent.nodes || []);
                            setWorkflowEdges(agent.edges || []);
                            // Remove duplicate success message - PromptBasedAgentGenerator already shows it
                            setVisualWorkflowSubTab('builder');
                          }}
                        />
                      </CardContent>
                    </Card>
                  </div>
                  <div className="space-y-4">
                    <Card className="flex-1">
                      <CardHeader>
                        <CardTitle>Generated Workflow Preview</CardTitle>
                      </CardHeader>
                      <CardContent className="h-64 overflow-auto">
                        {workflowNodes.length > 0 ? (
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                              {workflowNodes.length} nodes, {workflowEdges.length} connections
                            </p>
                            <div className="grid grid-cols-1 gap-2">
                              {workflowNodes.slice(0, 5).map((node, idx) => (
                                <div key={idx} className="p-2 border rounded text-xs">
                                  <div className="font-medium">{node.data?.label || `Node ${idx + 1}`}</div>
                                  <div className="text-muted-foreground">{node.type}</div>
                                </div>
                              ))}
                              {workflowNodes.length > 5 && (
                                <div className="text-xs text-muted-foreground">
                                  ... and {workflowNodes.length - 5} more nodes
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <div className="flex gap-2 mt-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowTemplateGallery(true)}
                                className="gap-2"
                              >
                                <Sparkles className="h-4 w-4" />
                                Templates
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowSaveAsTemplate(true)}
                                disabled={workflowNodes.length === 0}
                                className="gap-2"
                              >
                                <SaveIcon className="h-4 w-4" />
                                Save as Template
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* Builder Tab */}
            {visualWorkflowSubTab === 'builder' && (
              <div className="flex-1 flex overflow-hidden bg-gray-50/50">
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
            )}
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
                  disabled={true}
                  onClick={() => {
                    // Remove placeholder functionality
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

        {/* Template Gallery */}
        <TemplateGallery
          isOpen={showTemplateGallery}
          onClose={() => setShowTemplateGallery(false)}
          onTemplateSelect={(template) => {
            console.log('[Agents] Template selected:', template);
            // Apply template to workflow canvas
            if (template.configuration && template.configuration.nodes) {
              setWorkflowNodes(template.configuration.nodes);
              setWorkflowEdges(template.configuration.edges || []);
            }
            setShowTemplateGallery(false);
            toast.success(`Template "${template.name}" loaded successfully`);
          }}
        />

        {/* Save as Template Modal */}
        <SaveAsTemplateModal
          isOpen={showSaveAsTemplate}
          onClose={() => setShowSaveAsTemplate(false)}
          nodes={workflowNodes}
          edges={workflowEdges}
          onSave={(templateId) => {
            console.log('Template saved with ID:', templateId);
            toast.success('Template saved! It will appear in the template gallery.');
          }}
        />

        {/* Deployment Manager */}
        <EnvironmentChannelManager
          isOpen={showDeploymentManager}
          onClose={() => setShowDeploymentManager(false)}
          onDeploy={(config) => {
            console.log('[Agents] Deployment config:', config);
            // Remove duplicate success message - EnvironmentChannelManager should handle it
            setShowDeploymentManager(false);
          }}
        />

        {/* Libraries Panel */}
        {showLibrariesPanel && (
          <div className="fixed top-14 right-4 w-80 h-[calc(100vh-80px)] border bg-card rounded-lg shadow-lg flex flex-col z-30">
            <div className="p-3 border-b flex items-center justify-between">
              <h3 className="font-semibold text-sm">Libraries & Actions</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowLibrariesPanel(false)}
                className="h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto">
              <LibrariesAndActions />
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
          <UnifiedWorkflowExperience 
            onWorkflowUpdate={handleWorkflowUpdate}
            onNodeAdd={handleNodeGenerated}
            onNodeTest={(nodeId, result) => {
              console.log('Node test result:', { nodeId, result });
              // Remove duplicate success notification
            }}
            onNodeConfigSave={(nodes, edges) => {
              // Persist updated configuration to the current session
              handleFlowSave({ nodes, edges });
            }}
            isAIHealthy={isAIHealthy}
          />
          
          {/* AI Assistant Integration */}
          <AIAssistIntegration
            isOpen={showAIAssist}
            onClose={() => setShowAIAssist(false)}
            onWorkflowGenerated={handleAIGeneratedWorkflow}
            onNodeGenerated={handleNodeGenerated}
            initialMode={aiAssistMode}
            selectedNodeId={selectedNodeData?.id}
            isAIHealthy={isAIHealthy}
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

  // Security & Compliance mode
  if (selectedMode === 'security') {
    return (
      <AppLayout>
        <AgentSecurityDashboard />
      </AppLayout>
    );
  }

  // AI Governance mode
  if (selectedMode === 'governance') {
    return (
      <AppLayout>
        <AgentGovernanceDashboard />
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