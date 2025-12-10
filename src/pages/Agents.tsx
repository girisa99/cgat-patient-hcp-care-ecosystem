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
import { Link, useLocation } from 'react-router-dom';

// Import existing components
import { ModeSelector, type AgentMode } from '@/components/agent-builder/ModeSelector';
import { PromptAssistant } from '@/components/agent-builder/PromptAssistant';
import { AgentBuilderProvider, useAgentBuilder } from '@/components/agent-builder/AgentBuilderProvider';
import { IntelligentQuestionnaire } from '@/components/agent-builder/IntelligentQuestionnaire';
import { PromptBasedAgentGenerator } from '@/components/agent-builder/PromptBasedAgentGenerator';
import { UseCaseSelector } from '@/components/agentic/UseCaseSelector';
import { JourneyEditor } from '@/components/agentic/JourneyEditor';
import { StreamlinedAgentWizard } from '@/components/agentic/StreamlinedAgentWizard';
import { FixedAdvancedReactFlow } from '@/components/workflow-builder/FixedAdvancedReactFlow';
import { ModelManagementDashboard } from '@/components/ModelManagement/ModelManagementDashboard';
import { EnhancedConnectorSystem } from '@/components/agentic/enhanced-connector/EnhancedConnectorSystem';
import { ActionsTab } from '@/components/agentic/tabs/ActionsTab';
import AgenticAPIEcosystem from '@/components/agent-deployment/AgenticAPIEcosystem';
import AppLayout from '@/components/layout/AppLayout';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { useMasterToast } from '@/hooks/useMasterToast';
import { useWorkflowNodes } from '@/hooks/useWorkflowNodes';
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
import { EnhancedDeploymentManager } from '@/components/deployment/EnhancedDeploymentManager';
import { DynamicNodeConfiguration } from '@/components/unified-workflow/DynamicNodeConfiguration';
import { useTemplateIntegration } from '@/components/workflow-builder/TemplateIntegrationManager';
import { useAIServiceHealth } from '@/hooks/useAIServiceHealth';
import { ConsolidationVerification } from '@/components/verification/ConsolidationVerification';
import ComprehensiveFunctionalityAudit from '@/components/assessment/ComprehensiveFunctionalityAudit';
import { ComprehensiveWorkflowAudit } from '@/components/assessment/ComprehensiveWorkflowAudit';
import ConsolidatedFunctionalityAudit from '@/components/assessment/ConsolidatedFunctionalityAudit';

// Import new Agent Ecosystem components
import { AgentEcosystemDashboard, AgentOrchestrationEngine } from '@/components/agent-ecosystem';
import { ConsolidatedAgentDashboard } from '@/components/agent-management';

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

// Advanced features imports
import AdvancedCollaboration from '@/components/collaboration/AdvancedCollaboration';
import AdvancedAnalytics from '@/components/analytics/AdvancedAnalytics';
import EnterpriseFeatures from '@/components/enterprise/EnterpriseFeatures';
import { GapAnalysisReport } from '@/components/assessment/GapAnalysisReport';
import { SystemImplementationStatus } from '@/components/assessment/SystemImplementationStatus';
import { ComprehensiveAgentAssessment } from '@/components/assessment/ComprehensiveAgentAssessment';
import { ComprehensivePerformanceAnalyzer } from '@/components/performance/ComprehensivePerformanceAnalyzer';
import { QueryPerformanceOptimizer } from '@/components/performance/QueryPerformanceOptimizer';

const AgentsInner = () => {
  // Core state - simplified
  const [selectedMode, setSelectedMode] = useState<AgentMode | null>(() => {
    try {
      return (localStorage.getItem('agentBuilder_selectedMode') as AgentMode) || 'unified';
    } catch {
      return 'unified';
    }
  });
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [hasCompletedQuestionnaire, setHasCompletedQuestionnaire] = useState(false);
  const [visualWorkflowSubTab, setVisualWorkflowSubTab] = useState<'builder' | 'ai-prompt'>('ai-prompt');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [rightPanelTab, setRightPanelTab] = useState<'config' | 'libraries' | 'assistant'>('config');
  const [workflowNodes, setWorkflowNodes] = useState<any[]>([]);
  const [workflowEdges, setWorkflowEdges] = useState<any[]>([]);
  const [showUnifiedAssist, setShowUnifiedAssist] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [showSaveAsTemplate, setShowSaveAsTemplate] = useState(false);
  const [showDeploymentManager, setShowDeploymentManager] = useState(false);

  const location = useLocation();

  console.log('[Agents] state init', {
    selectedMode,
    showModeSelector,
    showQuestionnaire
  });

  const { status: aiHealth, checkHealth, checking } = useAIServiceHealth();
  const isAIHealthy = aiHealth.overallHealthy;
  const aiCheckComplete = Boolean(aiHealth.lastChecked);
  const disableAssist = aiCheckComplete ? !isAIHealthy : false;
  const assistTitle = checking ? 'Checking AI services health...' : (!isAIHealthy && aiCheckComplete ? 'AI services are unavailable. Check health status.' : undefined);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  // Honor deep-links like /agents?from=enrollment&module=patient&open=builder
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const open = params.get('open');
    const from = params.get('from');
    const moduleParam = params.get('module');

    if (open === 'builder') {
      setVisualWorkflowSubTab('builder');
      setShowModeSelector(false);
      if (!selectedMode) {
        setSelectedMode('visual' as AgentMode);
      }
      
      // Auto-load patient enrollment workflow if coming from enrollment
      if (from === 'enrollment' && moduleParam === 'patient') {
        // This will be handled by the workflow builder component
        toast.success('Loading Patient Enrollment Workflow...');
      } else {
        toast.success('AI Agent Builder is ready');
      }
    }

    if (from === 'enrollment') {
      if (moduleParam) {
        toast.info(`Enrollment context: ${moduleParam}`);
      } else {
        toast.info('Enrollment context detected');
      }
    }
  }, [location.search]);
  // Pick up any pending workflow generated outside /agents
  useEffect(() => {
    try {
      const pending = localStorage.getItem('pendingWorkflow');
      if (pending) {
        const agent = JSON.parse(pending);
        localStorage.removeItem('pendingWorkflow');
        const nodesSource: any[] = (agent?.nodes || agent?.workflow?.nodes || agent?.data?.nodes || agent?.result?.nodes || []);
        const edgesSource: any[] = (agent?.edges || agent?.workflow?.edges || agent?.data?.edges || agent?.result?.edges || []);
        if (Array.isArray(nodesSource) && nodesSource.length) {
          const rawNodes = nodesSource.map((n: any, idx: number) => ({
            id: String(n.id || `node-${idx}-${Date.now()}`),
            type: 'enhanced',
            position: n.position || { x: 100 + (idx % 3) * 280, y: 120 + Math.floor(idx / 3) * 160 },
            data: {
              ...(n.data || {}),
              label: n.data?.label || n.label || n.name || n.display_name || `Node ${idx + 1}`,
              type_key: n.data?.type_key || (typeof n.type === 'string' ? n.type : 'node'),
              configuration: { ...(n.data?.configuration || n.configuration || {}) },
              isWorkflowNode: true,
            }
          }));
          let rawEdges = Array.isArray(edgesSource) ? edgesSource : [];
          if (!rawEdges.length && rawNodes.length > 1) {
            rawEdges = rawNodes.slice(0, -1).map((n: any, i: number) => ({
              id: `e-${n.id}-${rawNodes[i + 1].id}`,
              source: n.id,
              target: rawNodes[i + 1].id,
              type: 'smoothstep',
              animated: true,
            }));
          }
          setWorkflowNodes(rawNodes);
          setWorkflowEdges(rawEdges);
          setVisualWorkflowSubTab('builder');
          toast.success(`Loaded ${rawNodes.length} nodes to canvas`);
        }
      }
    } catch (e) {
      console.warn('Pending workflow load failed:', e);
    }
  }, []);

  // Global listener for generated workflows dispatched from anywhere
  useEffect(() => {
    const handler = (e: any) => {
      try {
        const agent = e?.detail;
        if (!agent) return;
        const nodesSource: any[] = (agent?.nodes || agent?.workflow?.nodes || agent?.data?.nodes || agent?.result?.nodes || []);
        const edgesSource: any[] = (agent?.edges || agent?.workflow?.edges || agent?.data?.edges || agent?.result?.edges || []);
        if (Array.isArray(nodesSource) && nodesSource.length) {
          const rawNodes = nodesSource.map((n: any, idx: number) => ({
            id: String(n.id || `node-${idx}-${Date.now()}`),
            type: 'enhanced',
            position: n.position || { x: 100 + (idx % 3) * 280, y: 120 + Math.floor(idx / 3) * 160 },
            data: {
              ...(n.data || {}),
              label: n.data?.label || n.label || n.name || n.display_name || `Node ${idx + 1}`,
              type_key: n.data?.type_key || (typeof n.type === 'string' ? n.type : 'node'),
              configuration: { ...(n.data?.configuration || n.configuration || {}) },
              isWorkflowNode: true,
            }
          }));
          let rawEdges = Array.isArray(edgesSource) ? edgesSource : [];
          if (!rawEdges.length && rawNodes.length > 1) {
            rawEdges = rawNodes.slice(0, -1).map((n: any, i: number) => ({
              id: `e-${n.id}-${rawNodes[i + 1].id}`,
              source: n.id,
              target: rawNodes[i + 1].id,
              type: 'smoothstep',
              animated: true,
            }));
          }
          setWorkflowNodes(rawNodes);
          setWorkflowEdges(rawEdges);
          setVisualWorkflowSubTab('builder');
          toast.success(`Loaded ${rawNodes.length} nodes to canvas`);
        }
      } catch (err) {
        console.warn('workflow-generated handler failed:', err);
      }
    };
    window.addEventListener('workflow-generated', handler as any);
    return () => window.removeEventListener('workflow-generated', handler as any);
  }, []);

  const { userSessions, currentSessionId, currentSession, actions, setActions } = useAgentBuilder();
  const { createSession, updateSession } = useAgentSession();
  const { userRoles, user } = useMasterAuth();
  const { nodeTypes, categories, isLoading: nodesLoading } = useWorkflowNodes();

  // Use Template Integration to map templates to real nodes/edges and ensure connectors
  const templateManager = useTemplateIntegration({
    onWorkflowUpdate: (nodes, edges) => {
      // Normalize node type for AdvancedReactFlow: render with enhanced node component
      const normalizedNodes = (nodes || []).map((n: any) => ({ ...n, type: 'enhanced' }));
      setWorkflowNodes(normalizedNodes);
      setWorkflowEdges(edges || []);
      toast.success(`Template applied: ${normalizedNodes.length} nodes, ${(edges || []).length} connectors`);
    },
    onTemplateLoaded: () => {
      setShowTemplateGallery(false);
      setVisualWorkflowSubTab('builder');
    }
  });

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
    
    if (mode === 'visual') {
      setVisualWorkflowSubTab('ai-prompt');
      setShowTemplateGallery(true);
    }
    
    const modeText = mode === 'unified' ? 'AI-Assisted Builder' : 
                     mode === 'visual' ? 'Visual Canvas' : 
                     mode === 'observability' ? 'Observability' : 'Builder';
    toast.success(`Switched to ${modeText} mode`);
  };

  // Allow toolbar mode switcher to control this page
  useEffect(() => {
    const handler = (e: any) => {
      const mode = e?.detail as AgentMode;
      if (!mode) return;
      setSelectedMode(mode);
      try { localStorage.setItem('agentBuilder_selectedMode', mode as any); } catch {}
      const modeText = mode === 'unified' ? 'AI-Assisted Builder' : 
                       mode === 'visual' ? 'Visual Canvas' : 
                       mode === 'observability' ? 'Observability' : 'Builder';
      toast.success(`Switched to ${modeText} mode`);
    };
    window.addEventListener('switch-agent-mode', handler as any);
    return () => window.removeEventListener('switch-agent-mode', handler as any);
  }, []);

  // Avoid duplicate success toasts when canvas updates propagate
  const aiSuccessToastShown = React.useRef(false);

  // Receive full workflow objects from AI Assistant only
  const handleAIGeneratedWorkflow = (workflow: any) => {
    console.log('[Agents] AI generated workflow:', workflow);

    // Normalize nodes → ensure ids, map to DB node types, and enforce enhanced renderer
    const ensureId = (n: any, idx: number) => ({ ...n, id: String(n.id || `node-${idx}-${Date.now()}`) });
    let rawNodes: any[] = Array.isArray(workflow?.nodes) ? workflow.nodes : [];
    rawNodes = rawNodes.map(ensureId).map((n: any, idx: number) => {
      const label = n.data?.label || n.label || n.name || n.display_name || `Node ${idx + 1}`;
      const key = (n.data?.type_key || n.type || '').toString().toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
      const match = nodeTypes.find(nt =>
        (nt.type_key || '').toLowerCase() === key ||
        (nt.display_name || '').toLowerCase() === (label || '').toLowerCase()
      );

      return {
        id: n.id,
        type: 'enhanced',
        position: n.position || { x: 100 + (idx % 3) * 280, y: 120 + Math.floor(idx / 3) * 160 },
        data: {
          ...(n.data || {}),
          label,
          type_key: match?.type_key || key || 'node',
          category: match?.category || n.data?.category,
          configuration: {
            ...(match?.default_config || {}),
            ...(n.data?.configuration || {}),
          },
          default_config: match?.default_config || {},
          isWorkflowNode: true,
          nodeTypeInfo: match // Include full database node type info
        }
      } as any;
    });

    // Build edges: use provided or sequential fallback
    let rawEdges: any[] = Array.isArray(workflow?.edges) ? workflow.edges : [];
    if (!rawEdges.length && rawNodes.length > 1) {
      rawEdges = rawNodes.slice(0, -1).map((n: any, i: number) => ({
        id: `e-${n.id}-${rawNodes[i + 1].id}`,
        source: n.id,
        target: rawNodes[i + 1].id,
        type: 'smoothstep',
        animated: true
      }));
    }

    setWorkflowNodes(rawNodes);
    setWorkflowEdges(rawEdges);
    setShowUnifiedAssist(true);

    if (!aiSuccessToastShown.current) {
      toast.success(`Workflow ready: ${rawNodes.length} nodes, ${rawEdges.length} connectors`);
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


  // Clean Visual Workflow Builder Layout
  const renderFlowiseLayout = () => {
    return (
      <div className="h-screen flex flex-col bg-background">
        {/* Single Clean Header */}
        <div className="h-12 border-b bg-card flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowModeSelector(true)}
              className="flex items-center gap-1 text-xs h-8 px-2"
            >
              <ArrowLeft className="h-3 w-3" />
              Back
            </Button>
            <div className="h-4 w-px bg-border" />
            <h1 className="text-sm font-semibold">Workflow Builder</h1>
            <Badge variant={isAIHealthy ? 'secondary' : 'destructive'} className="text-xs">
              AI {isAIHealthy ? '●' : '○'}
            </Badge>
          </div>
          
          {/* Essential Actions Only */}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 px-3 text-xs" 
              onClick={() => setShowTemplateGallery(true)}
            >
              <Database className="w-3 h-3 mr-1.5" />
              Templates
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 px-3 text-xs" 
              onClick={() => setShowSaveAsTemplate(true)} 
              disabled={workflowNodes.length === 0}
            >
              <SaveIcon className="w-3 h-3 mr-1.5" />
              Save
            </Button>
            <Button 
              size="sm" 
              className="h-8 px-3 text-xs bg-primary hover:bg-primary/90" 
              onClick={() => setShowDeploymentManager(true)}
              disabled={workflowNodes.length === 0}
            >
              <Play className="w-3 h-3 mr-1.5" />
              Deploy
            </Button>
            <div className="h-4 w-px bg-border" />
            <Button 
              size="sm" 
              className="h-8 px-3 text-xs bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white" 
              onClick={() => setShowUnifiedAssist(!showUnifiedAssist)} 
              disabled={disableAssist} 
              title={assistTitle}
            >
              <Sparkles className="w-3 h-3 mr-1.5" />
              AI Assist
            </Button>
          </div>
        </div>

        {/* Simple 2-Tab Navigation */}
        <div className="border-b bg-muted/30 px-4">
          <div className="flex items-center gap-1 py-1">
            <Button 
              variant={visualWorkflowSubTab === 'ai-prompt' ? 'default' : 'ghost'} 
              size="sm" 
              className="h-8 px-4 text-xs rounded-full"
              onClick={() => setVisualWorkflowSubTab('ai-prompt')}
            >
              <Sparkles className="w-3 h-3 mr-1.5" />
              1. Generate
            </Button>
            <ArrowRight className="w-3 h-3 text-muted-foreground" />
            <Button 
              variant={visualWorkflowSubTab === 'builder' ? 'default' : 'ghost'} 
              size="sm" 
              className="h-8 px-4 text-xs rounded-full"
              onClick={() => setVisualWorkflowSubTab('builder')}
            >
              <Brain className="w-3 h-3 mr-1.5" />
              2. Build
            </Button>
            {workflowNodes.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {workflowNodes.length} nodes
              </Badge>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {/* Generate Tab - AI Prompt */}
          {visualWorkflowSubTab === 'ai-prompt' && (
            <div className="h-full p-6 overflow-auto">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold mb-2">Generate Your Workflow</h2>
                  <p className="text-sm text-muted-foreground">
                    Describe what you want to build and AI will create the workflow for you
                  </p>
                </div>
                
                <Card>
                  <CardContent className="pt-6">
                    <PromptBasedAgentGenerator 
                      onGenerate={(agent) => {
                        const nodesSource: any[] = (agent?.nodes || agent?.workflow?.nodes || agent?.data?.nodes || agent?.result?.nodes || []);
                        const edgesSource: any[] = (agent?.edges || agent?.workflow?.edges || agent?.data?.edges || agent?.result?.edges || []);

                        if (!Array.isArray(nodesSource) || nodesSource.length === 0) {
                          toast.error('No nodes generated. Try a different prompt.');
                          return;
                        }

                        const rawNodes = nodesSource.map((n: any, idx: number) => ({
                          id: String(n.id || `node-${idx}-${Date.now()}`),
                          type: 'enhanced',
                          position: n.position || { x: 100 + (idx % 3) * 280, y: 120 + Math.floor(idx / 3) * 160 },
                          data: {
                            ...(n.data || {}),
                            label: n.data?.label || n.label || n.name || n.display_name || `Node ${idx + 1}`,
                            type_key: n.data?.type_key || (typeof n.type === 'string' ? n.type : 'node'),
                            configuration: { ...(n.data?.configuration || n.configuration || {}) },
                            isWorkflowNode: true,
                          }
                        }));

                        let rawEdges = Array.isArray(edgesSource) ? edgesSource : [];
                        if (!rawEdges.length && rawNodes.length > 1) {
                          rawEdges = rawNodes.slice(0, -1).map((n: any, i: number) => ({
                            id: `e-${n.id}-${rawNodes[i + 1].id}`,
                            source: n.id,
                            target: rawNodes[i + 1].id,
                            type: 'smoothstep',
                            animated: true,
                          }));
                        }
                        
                        setWorkflowNodes(rawNodes);
                        setWorkflowEdges(rawEdges);
                        setVisualWorkflowSubTab('builder');
                        toast.success(`Generated ${rawNodes.length} nodes`);
                      }}
                    />
                  </CardContent>
                </Card>

                {/* Quick Start Options */}
                <div className="mt-6 flex items-center justify-center gap-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowTemplateGallery(true)}
                    className="gap-2"
                  >
                    <Database className="h-4 w-4" />
                    Start from Template
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setVisualWorkflowSubTab('builder')}
                    className="gap-2"
                  >
                    <Brain className="h-4 w-4" />
                    Build from Scratch
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Builder Tab - Canvas */}
          {visualWorkflowSubTab === 'builder' && (
            <div className="h-full flex overflow-hidden">
              <ErrorBoundary fallbackComponent={({ error, retry }) => (
                <div className="flex-1 flex items-center justify-center p-4">
                  <div className="text-center space-y-3">
                    <div className="text-sm font-medium">Canvas failed to load</div>
                    <div className="text-xs text-muted-foreground max-w-md">{error?.message}</div>
                    <Button size="sm" variant="outline" onClick={retry}>Retry</Button>
                  </div>
                </div>
              )}>
                <SidebarProvider className="w-full h-full min-h-0">
                  <div className="min-h-0 h-full flex w-full">
                    <FixedAdvancedReactFlow
                      key={`rf-${workflowNodes.length}-${workflowEdges.length}`}
                      initialNodes={workflowNodes}
                      initialEdges={workflowEdges}
                      workflowType="visual"
                      sessionId={currentSession?.id}
                      fitParent={true}
                      onNodeSelect={(node) => {
                        setSelectedNode(node);
                        setRightPanelTab('config');
                      }}
                      onSave={handleFlowSave}
                      onWorkflowUpdate={handleWorkflowUpdate}
                      onNodeAdd={handleNodeGenerated}
                      onNodeConfigSave={(nodes, edges) => {
                        handleFlowSave({ nodes, edges });
                      }}
                      isAIHealthy={isAIHealthy}
                    />
                  </div>
                </SidebarProvider>
              </ErrorBoundary>
            </div>
          )}
        </div>

        {/* Template Gallery Modal */}
        <TemplateGallery
          isOpen={showTemplateGallery}
          onClose={() => setShowTemplateGallery(false)}
          onTemplateSelect={(template) => {
            templateManager.handleTemplateLoad(template);
          }}
        />

        {/* Save as Template Modal */}
        <SaveAsTemplateModal
          isOpen={showSaveAsTemplate}
          onClose={() => setShowSaveAsTemplate(false)}
          nodes={workflowNodes}
          edges={workflowEdges}
          onSave={(templateId) => {
            toast.success('Template saved!');
          }}
        />

        {/* Deployment Manager Modal */}
        {showDeploymentManager && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card rounded-lg border shadow-lg">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-semibold">Deploy Workflow</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowDeploymentManager(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <EnhancedDeploymentManager
                onDeploy={(config) => {
                  setShowDeploymentManager(false);
                  toast.success('Workflow deployed!');
                }}
              />
            </div>
          </div>
        )}

        {/* AI Assist Slide-over Panel */}
        {showUnifiedAssist && (
          <aside className="fixed inset-y-0 right-0 z-50 w-[min(480px,100vw)] border-l bg-card shadow-xl flex flex-col animate-slide-in-right">
            <div className="p-3 border-b flex items-center justify-between">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Assistant
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowUnifiedAssist(false)} className="h-7 w-7 p-0">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-3">
              <UnifiedAgentAssist
                workflowNodes={workflowNodes}
                workflowEdges={workflowEdges}
                selectedNode={selectedNode}
                onAgentGenerated={(finalAgent: any) => {
                  const nodesSource: any[] = (finalAgent?.nodes || finalAgent?.workflow?.nodes || finalAgent?.data?.nodes || finalAgent?.result?.nodes || []);
                  const edgesSource: any[] = (finalAgent?.edges || finalAgent?.workflow?.edges || finalAgent?.data?.edges || finalAgent?.result?.edges || []);

                  if (!Array.isArray(nodesSource) || nodesSource.length === 0) {
                    toast.error('No nodes generated');
                    return;
                  }

                  const toEnhanced = (nodes: any[]) => (nodes || []).map((n, idx) => {
                    if (n.type === 'enhanced') return n;
                    const label = n.data?.label || n.label || n.name || 'Node';
                    return {
                      id: String(n.id || `node-${Date.now()}-${idx}`),
                      type: 'enhanced',
                      position: n.position || { x: 100 + (idx % 3) * 280, y: 120 + Math.floor(idx / 3) * 160 },
                      data: {
                        ...(n.data || {}),
                        label,
                        type_key: n.data?.type_key || 'node',
                        configuration: { ...(n.data?.configuration || {}) },
                        isWorkflowNode: true
                      }
                    } as any;
                  });

                  const enhancedNodes = toEnhanced(nodesSource);
                  let finalEdges = Array.isArray(edgesSource) ? edgesSource : [];
                  if (!finalEdges.length && enhancedNodes.length > 1) {
                    finalEdges = enhancedNodes.slice(0, -1).map((n: any, i: number) => ({
                      id: `e-${n.id}-${enhancedNodes[i + 1].id}`,
                      source: n.id,
                      target: enhancedNodes[i + 1].id,
                      type: 'smoothstep',
                      animated: true,
                    }));
                  }
                  
                  setWorkflowNodes(enhancedNodes);
                  setWorkflowEdges(finalEdges);
                  setVisualWorkflowSubTab('builder');
                  setShowUnifiedAssist(false);
                  toast.success(`Applied ${enhancedNodes.length} nodes`);
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

  // Always allow switching back to mode selector
  if (showModeSelector) {
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
            layout={userRoles.includes('onboardingTeam') ? 'horizontal-scroll' : 'grid'}
            userRole={userRoles[0]}
          />
        </div>
      </AppLayout>
    );
  }

  // Main content based on selected mode
  // Unified mode with consolidated component
  if (selectedMode === 'unified') {
    return (
      <AppLayout>
        <div className="h-[80vh] flex flex-col">
          <div className="p-2 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold">Unified Workflow Builder</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowModeSelector(true)}
              className="flex items-center gap-1 text-xs"
            >
              <ArrowLeft className="h-3 w-3" />
              Switch Mode
            </Button>
          </div>
          <FixedAdvancedReactFlow
            initialNodes={workflowNodes}
            initialEdges={workflowEdges}
            workflowType="visual"
            sessionId={currentSession?.id}
            onWorkflowUpdate={handleWorkflowUpdate}
            onNodeAdd={handleNodeGenerated}
            onNodeTest={(nodeId, result) => {
              console.log('Node test result:', { nodeId, result });
            }}
            onNodeConfigSave={(nodes, edges) => {
              handleFlowSave({ nodes, edges });
            }}
            isAIHealthy={isAIHealthy}
            embedded={false}
            onSave={handleFlowSave}
            onNodeSelect={(node) => {
              setSelectedNode(node);
              setRightPanelTab('config');
            }}
          />
        </div>
      </AppLayout>
    );
  }

  // AI Observability mode
  if (selectedMode === 'observability') {
    return (
      <AppLayout>
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">AI Observability Dashboard</h1>
            <Button 
              variant="outline" 
              onClick={() => setShowModeSelector(true)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Mode Selection
            </Button>
          </div>
          <ObservabilityDashboard />
        </div>
      </AppLayout>
    );
  }

  // Main render - Visual Canvas (default)
  return renderFlowiseLayout();
};

const Agents: React.FC = () => (
  <AgentBuilderProvider>
    <AgentsInner />
  </AgentBuilderProvider>
);

export default Agents;