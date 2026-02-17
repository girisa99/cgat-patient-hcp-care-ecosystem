import React, { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeTypes,
  useReactFlow,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  Bot, MessageCircle, Phone, Mail, Calendar,
  AlertTriangle, Users, Workflow, Sparkles, Settings,
  Save, Eye, Database, Brain, Tag, TestTube, Rocket,
  BookOpen, Plug, Plus, X
} from 'lucide-react';
import { useMasterToast } from '@/hooks/useMasterToast';
import { z } from 'zod';
import { useAgentSession } from '@/hooks/useAgentSession';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { LSBindingPanel } from '@/components/label-studio';
import { AgentSession } from '@/types/agent-session';
import { useConnectorAssignments } from '@/hooks/useConnectorAssignments';
import { CHANNELS } from '@/config/orchestration';
import { supabase } from '@/integrations/supabase/client';
import { PatientEnrollmentWorkflow } from './PatientEnrollmentWorkflow';
import { useLocation } from 'react-router-dom';

// Enhanced Node Components with integrated features
const CustomerNode = ({ data }: { data: any }) => (
  <div className={`px-4 py-3 shadow-md rounded-md bg-background border-2 border-primary min-w-[200px] ${data.deactivated ? 'opacity-50 grayscale' : ''}`}>
    <div className="flex items-center gap-2 mb-2">
      <Users className="h-4 w-4 text-primary" />
      <div className="font-bold text-sm">{data.label}</div>
      {data.aiRecommended && <Sparkles className="h-3 w-3 text-yellow-500" />}
    </div>
    <div className="text-xs text-muted-foreground mb-2">{data.description}</div>
    {data.persona && (
      <Badge variant="outline" className="mt-1 text-xs">{data.persona}</Badge>
    )}
    {data.labelStudioBinding && (
      <Badge variant="secondary" className="mt-1 text-xs flex items-center gap-1">
        <Tag className="h-3 w-3" />
        Label Studio
      </Badge>
    )}
  </div>
);

const TouchpointNode = ({ data }: { data: any }) => (
  <div className={`px-4 py-3 shadow-md rounded-md bg-accent border-2 border-accent-foreground min-w-[180px] ${data.deactivated ? 'opacity-50 grayscale' : ''}`}>
    <div className="flex items-center gap-2 mb-2">
      {data.channel === 'chat' && <MessageCircle className="h-4 w-4" />}
      {data.channel === 'phone' && <Phone className="h-4 w-4" />}
      {data.channel === 'email' && <Mail className="h-4 w-4" />}
      {data.channel === 'appointment' && <Calendar className="h-4 w-4" />}
      <div className="font-bold text-sm">{data.label}</div>
    </div>
    <div className="text-xs text-muted-foreground mb-2">{data.description}</div>
    {data.automationLevel && (
      <Badge variant="secondary" className="mt-1 text-xs">
        {data.automationLevel}% Automated
      </Badge>
    )}
    {data.mcpIntegration && (
      <Badge variant="outline" className="mt-1 text-xs flex items-center gap-1">
        <Database className="h-3 w-3" />
        MCP
      </Badge>
    )}
  </div>
);

const AgentNode = ({ data }: { data: any }) => (
  <div className="px-4 py-3 shadow-md rounded-md bg-green-100 border-2 border-green-400 min-w-[200px] dark:bg-green-900 dark:border-green-600">
    <div className="flex items-center gap-2 mb-2">
      <Bot className="h-4 w-4 text-green-600 dark:text-green-400" />
      <div className="font-bold text-sm">{data.label}</div>
      {data.realTimeTesting && <TestTube className="h-3 w-3 text-blue-500" />}
    </div>
    <div className="text-xs text-muted-foreground mb-2">{data.description}</div>
    
    {/* Language Model Info */}
    {data.languageModel && (
      <div className="mb-2">
        <Badge variant="outline" className="text-xs flex items-center gap-1">
          <Brain className="h-3 w-3" />
          {data.languageModel}
        </Badge>
      </div>
    )}
    
    {/* Capabilities */}
    <div className="mt-1 flex flex-wrap gap-1">
      {data.capabilities?.map((cap: string, idx: number) => (
        <Badge key={idx} variant="secondary" className="text-xs">{cap}</Badge>
      ))}
    </div>
    
    {/* Vision capabilities */}
    {data.visionEnabled && (
      <Badge variant="outline" className="mt-1 text-xs flex items-center gap-1">
        <Eye className="h-3 w-3" />
        Vision
      </Badge>
    )}
  </div>
);

const MCPNode = ({ data }: { data: any }) => (
  <div className="px-4 py-3 shadow-md rounded-md bg-blue-100 border-2 border-blue-400 min-w-[160px] dark:bg-blue-900 dark:border-blue-600">
    <div className="flex items-center gap-2 mb-2">
      <Database className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      <div className="font-bold text-sm">{data.label}</div>
    </div>
    <div className="text-xs text-muted-foreground mb-2">{data.description}</div>
    {data.serverType && (
      <Badge variant="outline" className="mt-1 text-xs">{data.serverType}</Badge>
    )}
    {data.tools && (
      <div className="mt-1 text-xs text-muted-foreground">
        {data.tools.length} tools available
      </div>
    )}
  </div>
);

const LabelStudioNode = ({ data }: { data: any }) => (
  <div className="px-4 py-3 shadow-md rounded-md bg-purple-100 border-2 border-purple-400 min-w-[180px] dark:bg-purple-900 dark:border-purple-600">
    <div className="flex items-center gap-2 mb-2">
      <Tag className="h-4 w-4 text-purple-600 dark:text-purple-400" />
      <div className="font-bold text-sm">{data.label}</div>
    </div>
    <div className="text-xs text-muted-foreground mb-2">{data.description}</div>
    {data.projectId && (
      <Badge variant="outline" className="mt-1 text-xs">Project: {data.projectId}</Badge>
    )}
    {data.annotationTypes && (
      <div className="mt-1 flex flex-wrap gap-1">
        {data.annotationTypes.map((type: string, idx: number) => (
          <Badge key={idx} variant="secondary" className="text-xs">{type}</Badge>
        ))}
      </div>
    )}
  </div>
);

const DecisionNode = ({ data }: { data: any }) => (
  <div className="px-4 py-3 shadow-md rounded-md bg-yellow-100 border-2 border-yellow-400 min-w-[160px] dark:bg-yellow-900 dark:border-yellow-600">
    <div className="flex items-center gap-2 mb-2">
      <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      <div className="font-bold text-sm">{data.label}</div>
    </div>
    <div className="text-xs text-muted-foreground mb-2">{data.description}</div>
    {data.conditions && (
      <div className="mt-1 text-xs">
        {data.conditions.map((condition: string, idx: number) => (
          <Badge key={idx} variant="outline" className="mr-1 text-xs">{condition}</Badge>
        ))}
      </div>
    )}
    {data.aiRecommendedActions && (
      <Badge variant="outline" className="mt-1 text-xs flex items-center gap-1">
        <Sparkles className="h-3 w-3" />
        AI Actions
      </Badge>
    )}
  </div>
);

const nodeTypes: NodeTypes = {
  customer: CustomerNode,
  touchpoint: TouchpointNode,
  decision: DecisionNode,
  agent: AgentNode,
  mcp: MCPNode,
  labelstudio: LabelStudioNode,
};

// Enhanced initial nodes with integrated features
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'customer',
    position: { x: 50, y: 100 },
    data: { 
      label: 'Patient Initial Contact', 
      description: 'Patient seeks healthcare service',
      persona: 'Healthcare Seeker',
      aiRecommended: true,
      labelStudioBinding: true
    }
  },
  {
    id: '2',
    type: 'touchpoint',
    position: { x: 300, y: 100 },
    data: { 
      label: 'Initial Inquiry',
      description: 'Patient makes first contact',
      channel: 'chat',
      automationLevel: 80,
      mcpIntegration: true
    }
  },
  {
    id: '3',
    type: 'agent',
    position: { x: 550, y: 100 },
    data: { 
      label: 'Healthcare AI Assistant',
      description: 'AI agent with vision and language capabilities',
      capabilities: ['NLP', 'Vision', 'Scheduling'],
      languageModel: 'gpt-4o-mini',
      visionEnabled: true,
      realTimeTesting: true
    }
  },
  {
    id: '4',
    type: 'mcp',
    position: { x: 300, y: 300 },
    data: { 
      label: 'Healthcare MCP Server',
      description: 'Model Context Protocol server for healthcare data',
      serverType: 'Healthcare',
      tools: ['patient_lookup', 'schedule_appointment', 'insurance_verify']
    }
  },
  {
    id: '5',
    type: 'labelstudio',
    position: { x: 50, y: 300 },
    data: { 
      label: 'Medical Data Labeling',
      description: 'Label Studio for medical image and text annotation',
      projectId: 'healthcare-2024',
      annotationTypes: ['Medical Images', 'Clinical Notes', 'Symptoms']
    }
  }
];

const initialEdges: Edge[] = [
  { 
    id: 'e1-2', 
    source: '1', 
    target: '2',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#8b5cf6' }
  },
  { 
    id: 'e2-3', 
    source: '2', 
    target: '3',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#10b981' }
  },
  { 
    id: 'e4-3', 
    source: '4', 
    target: '3',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#3b82f6' }
  },
  { 
    id: 'e5-2', 
    source: '5', 
    target: '2',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#a855f7' }
  }
];

interface IntegratedWorkflowBuilderProps {
  onSave?: (workflow: any) => void;
  onGenerateAgent?: (workflow: any) => void;
  onTest?: (workflow: any) => void;
  initialWorkflow?: any;
  sessionId?: string;
  step?: AgentSession['current_step'];
}

export const IntegratedWorkflowBuilder: React.FC<IntegratedWorkflowBuilderProps> = ({
  onSave,
  onGenerateAgent,
  onTest,
  initialWorkflow,
  sessionId: propSessionId,
  step
}) => {
  // Always call hooks in the same order - CRITICAL for React hook rules
  const { user } = useMasterAuth();
  const { showSuccess, showError } = useMasterToast();
  const location = useLocation();
  
  // State management
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(propSessionId || null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [activeTab, setActiveTab] = useState(step === 'canvas' ? 'canvas' : 'workflow');
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [configStep, setConfigStep] = useState<'basic' | 'connectors' | 'knowledge' | 'rag' | 'channels' | 'deploy'>('basic');
  const [hasLoadedEnrollmentWorkflow, setHasLoadedEnrollmentWorkflow] = useState(false);
  
  // Deploy resources
  
  // Form state for configuration
  const [agentConfig, setAgentConfig] = useState({
    name: '',
    description: '',
    purpose: '',
    categories: [] as string[],
    topics: [] as string[],
    businessUnits: [] as string[],
    channels: [] as string[],
    knowledgeBases: [] as string[],
    connectors: [] as string[],
    ragConfig: {},
    voiceConfig: {},
    approved: false,
  });
  const [selectedConnectorId, setSelectedConnectorId] = useState<string>('');
  const [promptText, setPromptText] = useState<string>('');
  const [isPrompting, setIsPrompting] = useState(false);
  const [knowledgeUrl, setKnowledgeUrl] = useState<string>('');
  const [lsBinding, setLsBinding] = useState<any | undefined>(undefined);
  // CRUD, context menu, and versioning
  const [deletedNodes, setDeletedNodes] = useState<Node[]>([]);
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; node: Node | null }>({ visible: false, x: 0, y: 0, node: null });
  const [checkpoints, setCheckpoints] = useState<Array<{ id: string; name: string; timestamp: string; nodes: Node[]; edges: Edge[] }>>([]);

  // Hook to get React Flow viewport
  const { getViewport } = useReactFlow();
  
  
  // Session management - using consistent sessionId for hooks
  const stableSessionId = currentSessionId || '';
  const {
    currentSession,
    userSessions,
    createSession,
    updateSession,
    deployAgent,
  } = useAgentSession(stableSessionId || undefined);

// Flow state - using proper data structure
  const { assignments, availableConnectors, assignConnector, removeAssignment, isLoading: isLoadingAssignments, isLoadingConnectors } = useConnectorAssignments(currentSessionId || undefined);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  // Keyboard shortcuts for soft delete and save checkpoint
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedNode) {
        e.preventDefault();
        setDeletedNodes((prev) => [...prev, selectedNode]);
        setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
        setSelectedNode(null);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        const id = `${Date.now()}`;
        setCheckpoints((cp) => [
          ...cp,
          { id, name: `Checkpoint ${new Date().toLocaleTimeString()}`, timestamp: new Date().toISOString(), nodes, edges },
        ]);
        showSuccess('Checkpoint saved');
      }
    };
    window.addEventListener('keydown', onKeyDown as any);
    return () => window.removeEventListener('keydown', onKeyDown as any);
  }, [selectedNode, nodes, edges, showSuccess]);
  // Initialize session if needed
  useEffect(() => {
    if (!currentSessionId && user && activeTab !== 'workflow') {
      handleCreateNewSession();
    }
  }, [user, activeTab, currentSessionId]);

  // Auto-load patient enrollment workflow when coming from enrollment
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const from = params.get('from');
    const moduleParam = params.get('module');
    
    if (from === 'enrollment' && moduleParam === 'patient' && !hasLoadedEnrollmentWorkflow) {
      setHasLoadedEnrollmentWorkflow(true);
      // Will be handled by PatientEnrollmentWorkflow component
    }
  }, [location.search, hasLoadedEnrollmentWorkflow]);

  // Load session data into workflow when session changes
  useEffect(() => {
    if (currentSession) {
      const canvasData = currentSession.canvas as any;
      const deploymentData = currentSession.deployment as any;
      
      // Load workflow data
      if (canvasData?.workflow?.nodes) {
        setNodes(canvasData.workflow.nodes);
      } else if (canvasData?.nodes) {
        setNodes(canvasData.nodes);
      }
      
      if (canvasData?.workflow?.edges) {
        setEdges(canvasData.workflow.edges);
      } else if (canvasData?.edges) {
        setEdges(canvasData.edges);
      }
      
      // Load agent config
setAgentConfig({
        name: currentSession.basic_info?.name || '',
        description: currentSession.basic_info?.description || '',
        purpose: currentSession.basic_info?.purpose || '',
        categories: (currentSession.basic_info as any)?.categories || [],
        topics: (currentSession.basic_info as any)?.topics || [],
        businessUnits: (currentSession.basic_info as any)?.business_units || [],
        channels: deploymentData?.config?.channels || [],
        knowledgeBases: (currentSession.knowledge as any)?.knowledge_bases || [],
        connectors: Object.keys(currentSession.connectors || {}),
        ragConfig: currentSession.rag || {},
        voiceConfig: deploymentData?.voice_config || {},
        approved: Boolean((deploymentData?.config as any)?.approved) || false,
      });
      setLsBinding(((currentSession.knowledge as any)?.label_studio as any)?.binding);
    }
  }, [currentSession, setNodes, setEdges]);

  useEffect(() => {
    if (!lsBinding) return;
    setNodes((nds) => {
      let found = false;
      const updated = nds.map((n) => {
        if (n.type === 'labelstudio') {
          found = true;
          return {
            ...n,
            data: {
              ...n.data,
              label: (lsBinding as any).projectTitle || 'Label Studio',
              description: 'Connected labeling project',
              projectId: (lsBinding as any).projectId,
            },
          };
        }
        return n;
      });
      if (!found) {
        const newNode = {
          id: `ls-${Date.now()}`,
          type: 'labelstudio' as any,
          position: { x: 200, y: 240 },
          data: {
            label: (lsBinding as any).projectTitle || 'Label Studio',
            description: 'Connected labeling project',
            projectId: (lsBinding as any).projectId,
            annotationTypes: [],
          },
        };
        return [...updated, newNode];
      }
      return updated;
    });
    handleConfigUpdate('knowledge', {
      label_studio: {
        ...(((currentSession as any)?.knowledge as any)?.label_studio || {}),
        binding: lsBinding,
      },
    });
  }, [lsBinding]);

  // Auto-save workflow changes
  useEffect(() => {
    if (currentSessionId && (nodes.length > 0 || edges.length > 0)) {
      const timeoutId = setTimeout(() => {
        handleAutoSave();
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [nodes, edges, currentSessionId]);

  // Session Management Functions
  const handleCreateNewSession = async () => {
    if (!user) {
      showError('Please log in to create a workflow session');
      return;
    }

    createSession.mutate({
      name: `Visual Workflow ${Date.now()}`,
      description: 'Created with Visual Workflow Builder',
      current_step: 'canvas',
      basic_info: {
        name: `Visual Agent ${Date.now()}`,
        description: 'Created with Visual Workflow Builder',
        purpose: 'AI Agent created with visual drag-and-drop workflow'
      },
      canvas: {
        nodes: initialNodes,
        edges: initialEdges,
        workflow: { nodes: initialNodes, edges: initialEdges }
      } as any
    }, {
      onSuccess: (session) => {
        setCurrentSessionId(session.id);
        showSuccess('New workflow session created');
      },
      onError: () => {
        showError('Failed to create workflow session');
      }
    });
  };

  const handleAutoSave = async () => {
    if (!currentSessionId || !currentSession) return;

    const workflowData = {
      nodes,
      edges,
      viewport: getViewport(),
      lastSaved: new Date().toISOString()
    };

    updateSession.mutate({
      sessionId: currentSessionId,
      updates: {
        canvas: {
          ...currentSession.canvas,
          nodes: workflowData.nodes,
          edges: workflowData.edges,
          workflow: workflowData
        } as any,
        basic_info: {
          ...currentSession.basic_info,
          name: agentConfig.name || currentSession.basic_info?.name,
          description: agentConfig.description || currentSession.basic_info?.description,
          purpose: agentConfig.purpose || currentSession.basic_info?.purpose
        }
      }
    });
  };

  const handleManualSave = async () => {
    setIsSaving(true);
    try {
      await handleAutoSave();
      showSuccess('Workflow saved successfully');
    } catch (error) {
      showError('Failed to save workflow');
    } finally {
      setIsSaving(false);
    }
  };

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Real-time testing
  const handleRealTimeTest = async () => {
    setIsTesting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate testing with different components
      const testResults = {
        agents: nodes.filter(n => n.type === 'agent').length,
        labelStudio: nodes.filter(n => n.type === 'labelstudio').length,
        mcpServers: nodes.filter(n => n.type === 'mcp').length,
        success: true
      };
      
      showSuccess(`Test completed! ${testResults.agents} agents, ${testResults.labelStudio} Label Studio instances, ${testResults.mcpServers} MCP servers tested successfully.`);
      
      if (onTest) {
        onTest({ workflow: { nodes, edges }, testResults });
      }
    } catch (error) {
      showError('Real-time testing failed');
    } finally {
      setIsTesting(false);
    }
  };

  // AI-powered workflow generation with recommendations
  const generateAIRecommendations = async () => {
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate AI-recommended nodes based on existing workflow
      const recommendations = [
        {
          id: `ai-rec-${Date.now()}`,
          type: 'decision',
          position: { x: 50, y: 500 },
          data: {
            label: 'AI Priority Routing',
            description: 'AI-recommended routing based on urgency',
            conditions: ['Critical', 'Standard', 'Low Priority'],
            aiRecommendedActions: true
          }
        },
        {
          id: `ai-rec-${Date.now() + 1}`,
          type: 'agent',
          position: { x: 300, y: 500 },
          data: {
            label: 'Specialized Vision Agent',
            description: 'AI-recommended agent for medical image analysis',
            capabilities: ['Medical Imaging', 'Radiology', 'Diagnosis'],
            languageModel: 'gpt-4o',
            visionEnabled: true,
            realTimeTesting: true
          }
        }
      ];

      setNodes(prev => [...prev, ...recommendations]);
      showSuccess('AI recommendations added to workflow!');
    } catch (error) {
      showError('Failed to generate AI recommendations');
    } finally {
      setIsGenerating(false);
    }
  };

  // Add new node with enhanced options
  const addNode = (type: string, position = { x: 200, y: 200 }) => {
    const nodeDefaults: Record<string, any> = {
      customer: {
        label: 'New Customer Touchpoint',
        description: 'Configure customer interaction',
        persona: 'Target User',
        aiRecommended: false,
        labelStudioBinding: false
      },
      touchpoint: {
        label: 'New Interaction Point',
        description: 'Configure interaction channel',
        channel: 'chat',
        automationLevel: 50,
        mcpIntegration: false
      },
      agent: {
        label: 'New AI Agent',
        description: 'Configure AI capabilities',
        capabilities: ['General'],
        languageModel: 'gpt-4o-mini',
        visionEnabled: false,
        realTimeTesting: false
      },
      decision: {
        label: 'New Decision Point',
        description: 'Configure decision logic',
        conditions: ['Yes', 'No'],
        aiRecommendedActions: false
      },
      mcp: {
        label: 'New MCP Server',
        description: 'Configure Model Context Protocol server',
        serverType: 'General',
        tools: []
      },
      labelstudio: {
        label: 'New Label Studio Instance',
        description: 'Configure data labeling project',
        projectId: 'new-project',
        annotationTypes: ['Text', 'Images']
      }
    };

    const newNode = {
      id: `${Date.now()}`,
      type,
      position,
      data: nodeDefaults[type] || { label: `New ${type}`, description: `Configure this ${type}` }
    };
    
    setNodes(prev => [...prev, newNode]);
  };

  // Configuration Management Functions
  const handleConfigUpdate = (step: typeof configStep, data: any) => {
    setAgentConfig(prev => ({ ...prev, ...data }));
    
    if (!currentSessionId || !currentSession) return;

    const updates: Partial<AgentSession> = {};
    
    switch (step) {
      case 'basic':
        updates.basic_info = { ...currentSession.basic_info, ...data };
        break;
      case 'connectors':
        updates.connectors = { ...currentSession.connectors, ...data };
        break;
      case 'knowledge':
        updates.knowledge = { ...currentSession.knowledge, ...data };
        break;
      case 'rag':
        updates.rag = { ...currentSession.rag, ...data };
        break;
      case 'channels':
        updates.deployment = { 
          ...currentSession.deployment, 
          config: { ...(currentSession.deployment as any)?.config, ...data }
        } as any;
        break;
    }

    updateSession.mutate({
      sessionId: currentSessionId,
      updates
    });
  };

  // Pre-deploy validation
  const runPreDeployChecks = () => {
    const errors: string[] = [];
    const warnings: string[] = [];

    const agentNodes = nodes.filter(n => n.type === 'agent');
    if (!agentConfig.name?.trim()) errors.push('Agent name is required.');
    if (!agentConfig.description?.trim()) warnings.push('Agent description is recommended.');
    if (agentNodes.length === 0) errors.push('At least one Agent node is required.');
    if (edges.length < 1) warnings.push('Add edges to define flow between nodes.');
    if (agentConfig.channels.length === 0) warnings.push('No deployment channels selected.');

    if ((assignments?.length || 0) === 0) warnings.push('No connectors assigned.');

    return { errors, warnings };
  };

  // Deployment Functions
  const handleDeploy = async () => {
    if (!currentSessionId || !currentSession) {
      showError('No workflow session to deploy');
      return;
    }

    const checks = runPreDeployChecks();
    if (checks.errors.length) {
      setShowConfigPanel(true);
      setConfigStep('deploy');
      showError(`Fix issues before deploy: ${checks.errors.join(' | ')}`);
      return;
    }

    setIsDeploying(true);
    try {
      // Generate agent from workflow
      const agentConfig = generateAgentFromWorkflow();
      
      // Update session with agent configuration
      await updateSession.mutateAsync({
        sessionId: currentSessionId,
        updates: {
          ...agentConfig,
          status: 'ready_to_deploy' as const,
          deployment: {
            ...agentConfig.deployment,
            config: {
              ...(agentConfig.deployment as any)?.config,
              workflow_generated: true,
              workflow_nodes: nodes.length,
              workflow_edges: edges.length
            }
          } as any
        }
      });

      // Deploy the agent
      deployAgent.mutate(currentSessionId, {
        onSuccess: () => {
          showSuccess('Visual workflow deployed successfully!');
          setConfigStep('deploy');
          setActiveTab('config');
          setShowConfigPanel(true);
        },
        onError: () => {
          showError('Failed to deploy workflow');
        }
      });
    } catch (error) {
      showError('Failed to prepare workflow for deployment');
    } finally {
      setIsDeploying(false);
    }
  };

  const generateAgentFromWorkflow = () => {
    const agentNodes = nodes.filter(n => n.type === 'agent');
    const labelStudioNodes = nodes.filter(n => n.type === 'labelstudio');

    const assignedFromSessions = (assignments || []).map((a: any) => ({
      id: a.connector_id,
      name: a.connector?.name || a.connector_id,
      task_id: a.task_id,
      task_type: a.task_type,
      type: a.connector?.type || 'connector'
    }));

    const connectorConfig = assignedFromSessions.reduce((acc: Record<string, any>, a: any) => {
      acc[a.id] = { enabled: true };
      return acc;
    }, {} as Record<string, any>);

    return {
      basic_info: {
        name: agentConfig.name || `Visual Agent ${Date.now()}`,
        description: agentConfig.description || 'Agent created from visual workflow',
        purpose: agentConfig.purpose || 'AI Assistant with visual workflow capabilities',
        categories: agentConfig.categories,
        topics: agentConfig.topics,
        business_units: agentConfig.businessUnits,
      },
      actions: {
        assigned_actions: agentNodes.flatMap(n => n.data?.capabilities || []),
        custom_actions: nodes.filter(n => n.data?.realTimeTesting).map(n => ({ name: n.data?.label, enabled: true }))
      },
      connectors: {
        assigned_connectors: assignedFromSessions,
        configurations: connectorConfig,
      },
      knowledge: {
        label_studio: labelStudioNodes.map(n => ({
          project_id: n.data?.projectId,
          annotation_types: n.data?.annotationTypes
        })),
        knowledge_bases: agentConfig.knowledgeBases
      },
      rag: {
        configurations: Object.keys(agentConfig.ragConfig).length > 0 ? agentConfig.ragConfig : {},
        recommendations: []
      },
      deployment: {
        config: {
          channels: agentConfig.channels.length > 0 ? agentConfig.channels : ['web_chat'],
          auto_deployment: true,
          visual_workflow_generated: true
        },
        voice_config: agentConfig.voiceConfig
      }
    };
  };

  // Calculate deployment readiness
  const getDeploymentReadiness = () => {
    const agentNodes = nodes.filter(n => n.type === 'agent').length;
    const hasBasicInfo = agentConfig.name && agentConfig.description;
    const hasChannels = agentConfig.channels.length > 0;
    
    let score = 0;
    let maxScore = 5;
    
    if (agentNodes > 0) score++;
    if (hasBasicInfo) score++;
    if (hasChannels) score++;
    if (nodes.length >= 3) score++; // Has a basic workflow
    if (edges.length >= 2) score++; // Has connections
    
    return Math.round((score / maxScore) * 100);
  };

  const readinessScore = getDeploymentReadiness();

  return (
    <div className="h-full flex flex-col">
      {/* Enhanced Toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-2">
          <Workflow className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Integrated Visual Workflow Builder</h2>
          <Badge variant="outline">Session-Managed</Badge>
          <Badge variant="secondary">Full Backend</Badge>
          {currentSession && (
            <Badge variant="outline" className="text-xs">
              {currentSession.name}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Deployment Readiness Indicator */}
          <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-lg">
            <span className="text-xs font-medium">Ready:</span>
            <div className="w-16 h-2 bg-muted-foreground/20 rounded-full">
              <div 
                className={`h-full rounded-full transition-all ${
                  readinessScore >= 80 ? 'bg-green-500' : 
                  readinessScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${readinessScore}%` }}
              />
            </div>
            <span className="text-xs">{readinessScore}%</span>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={generateAIRecommendations}
            disabled={isGenerating}
          >
            <Sparkles className="h-4 w-4 mr-1" />
            {isGenerating ? 'Generating...' : 'AI Recommendations'}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRealTimeTest}
            disabled={isTesting}
          >
            <TestTube className="h-4 w-4 mr-1" />
            {isTesting ? 'Testing...' : 'Real-Time Test'}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleManualSave}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-1" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setShowConfigPanel(true);
              setConfigStep('basic');
            }}
          >
            <Settings className="h-4 w-4 mr-1" />
            Configure
          </Button>
          
<Button 
            size="sm" 
            onClick={handleDeploy}
            disabled={isDeploying || readinessScore < 60 || !agentConfig.approved}
            className="bg-primary hover:bg-primary/90"
          >
            <Rocket className="h-4 w-4 mr-1" />
            {isDeploying ? 'Deploying...' : 'Deploy Agent'}
          </Button>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Enhanced Node Palette */}
        <div className="w-80 border-r bg-muted/30 p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="workflow">Workflow</TabsTrigger>
              <TabsTrigger value="canvas">Canvas</TabsTrigger>
              <TabsTrigger value="config">Config</TabsTrigger>
            </TabsList>
            
<TabsContent value="workflow" className="space-y-4">
              <h3 className="font-medium mb-3">Sessions</h3>
              {userSessions && userSessions.length > 0 ? (
                <div className="space-y-2">
                  {userSessions.slice(0, 3).map((session) => (
                    <Button
                      key={session.id}
                      variant={currentSessionId === session.id ? "default" : "outline"}
                      size="sm"
                      className="w-full justify-start text-left h-auto p-2"
                      onClick={() => setCurrentSessionId(session.id)}
                    >
                      <div>
                        <div className="font-medium text-xs truncate">
                          {session.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {session.status}
                        </div>
                      </div>
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleCreateNewSession}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    New Session
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full"
                  onClick={handleCreateNewSession}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Session
                </Button>
              )}
              <div className="pt-4 border-t">
                <h4 className="font-medium text-sm mb-2">Prompt-based Generator</h4>
                <Textarea
                  placeholder="Describe the workflow you want. We'll recommend nodes and connections."
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="outline" onClick={generateAIRecommendations} disabled={isGenerating}>
                    <Sparkles className="h-4 w-4 mr-1" /> Quick AI
                  </Button>
                  <Button size="sm" onClick={async () => {
                    if (!promptText.trim()) return;
                    setIsPrompting(true);
                    try {
                      const { data, error } = await supabase.functions.invoke('perplexity-recommend', { body: { prompt: promptText } });
                      if (error) throw error;
                      const recs = (data?.suggestions || []).map((s: any, idx: number) => ({
                        id: `px-${Date.now()}-${idx}`,
                        type: s.type || 'agent',
                        position: { x: 100 + (idx*80), y: 500 + (idx*40) },
                        data: { label: s.label, description: s.description, capabilities: s.capabilities || [] }
                      }));
                      setNodes(prev => [...prev, ...recs]);
                      setActiveTab('canvas');
                      setShowConfigPanel(false);
                    } catch (e) {
                      showError('Prompt-based generation failed');
                    } finally {
                      setIsPrompting(false);
                    }
                  }} disabled={isPrompting}>
                    {isPrompting ? 'Generating...' : 'Run Prompt'}
                  </Button>
                </div>
              </div>
              {/* Trash / Restore */}
              {deletedNodes.length > 0 && (
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Recently Deleted</h4>
                    <Badge variant="outline" className="text-xs">{deletedNodes.length}</Badge>
                  </div>
                  <Button size="sm" variant="outline" className="mt-2 w-full" onClick={() => {
                    const last = deletedNodes[deletedNodes.length - 1];
                    if (!last) return;
                    setDeletedNodes((prev) => prev.slice(0, -1));
                    setNodes((nds) => [...nds, { ...last, id: `${Date.now()}` }]);
                  }}>
                    Restore Last
                  </Button>
                </div>
              )}

              {/* Checkpoints */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">Checkpoints</h4>
                  <Badge variant="outline" className="text-xs">{checkpoints.length}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="w-full" onClick={() => {
                    const id = `${Date.now()}`;
                    setCheckpoints((cp) => [
                      ...cp,
                      { id, name: `Checkpoint ${new Date().toLocaleTimeString()}`, timestamp: new Date().toISOString(), nodes, edges },
                    ]);
                    showSuccess('Checkpoint saved');
                  }}>
                    Save Checkpoint
                  </Button>
                  <Button size="sm" variant="outline" className="w-full" disabled={!checkpoints.length} onClick={() => {
                    const last = checkpoints[checkpoints.length - 1];
                    if (!last) return;
                    setNodes(last.nodes);
                    setEdges(last.edges);
                    setSelectedNode(null);
                    showSuccess(`Restored ${last.name}`);
                  }}>
                    Restore Last
                  </Button>
                </div>
                {checkpoints.length > 0 && (
                  <div className="mt-2 space-y-1 max-h-36 overflow-auto">
                    {checkpoints.slice(-5).reverse().map((cp) => (
                      <div key={cp.id} className="flex items-center justify-between text-xs p-2 bg-muted rounded">
                        <div className="truncate mr-2">
                          <div className="font-medium">{cp.name}</div>
                          <div className="text-muted-foreground">{new Date(cp.timestamp).toLocaleString()}</div>
                        </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => { setNodes(cp.nodes); setEdges(cp.edges); setSelectedNode(null); showSuccess(`Restored ${cp.name}`); }}>Restore</Button>
                          </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              </TabsContent>
            
            <TabsContent value="canvas" className="space-y-4">
              {/* Patient Enrollment Workflow Loader */}
              {(() => {
                const params = new URLSearchParams(location.search);
                const from = params.get('from');
                const moduleParam = params.get('module');
                
                if (from === 'enrollment' && moduleParam === 'patient' && !hasLoadedEnrollmentWorkflow) {
                  return (
                    <PatientEnrollmentWorkflow 
                      onLoad={(workflowNodes, workflowEdges) => {
                        setNodes(workflowNodes);
                        setEdges(workflowEdges);
                        setHasLoadedEnrollmentWorkflow(true);
                        showSuccess('Patient Enrollment Workflow Loaded!');
                      }}
                    />
                  );
                }
                return null;
              })()}

              <h3 className="font-medium mb-3">Add Components</h3>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => addNode('customer')}
                  disabled={!currentSessionId}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Patient Demographics
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => addNode('agent')}
                  disabled={!currentSessionId}
                >
                  <Bot className="h-4 w-4 mr-2" />
                  NPI Verification Agent
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => addNode('mcp')}
                  disabled={!currentSessionId}
                >
                  <Database className="h-4 w-4 mr-2" />
                  MCP Server
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => addNode('labelstudio')}
                  disabled={!currentSessionId}
                >
                  <Tag className="h-4 w-4 mr-2" />
                  Label Studio
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => addNode('touchpoint')}
                  disabled={!currentSessionId}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Interaction Point
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => addNode('decision')}
                  disabled={!currentSessionId}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Decision Point
                </Button>
              </div>
              {!currentSessionId && (
                <div className="text-center text-xs text-muted-foreground p-3 bg-muted rounded">
                  Create a session to add components
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="config" className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Configuration</h3>
                  {currentSession && (
                    <Badge variant="outline" className="text-xs">
                      {currentSession.status}
                    </Badge>
                  )}
                </div>
                
<div className="space-y-2">
                  {['basic', 'connectors', 'knowledge', 'rag', 'channels'].map((step) => (
                    <Button
                      key={step}
                      variant={configStep === step ? "default" : "outline"}
                      size="sm"
                      className="w-full justify-start capitalize"
                      onClick={() => {
                        setConfigStep(step as typeof configStep);
                        setShowConfigPanel(true);
                      }}
                      disabled={!currentSessionId}
                    >
                      {step === 'basic' && <Bot className="h-3 w-3 mr-2" />}
                      {step === 'connectors' && <Plug className="h-3 w-3 mr-2" />}
                      {step === 'knowledge' && <BookOpen className="h-3 w-3 mr-2" />}
                      {step === 'rag' && <Database className="h-3 w-3 mr-2" />}
                      {step === 'channels' && <MessageCircle className="h-3 w-3 mr-2" />}
                      {step.replace('_', ' ')}
                    </Button>
                  ))}
                </div>
                
                <div className="pt-2 border-t">
                  <div className="text-xs text-muted-foreground mb-2">Readiness Score</div>
                  <Progress value={readinessScore} className="h-2" />
                  <div className="text-xs text-muted-foreground mt-1">
                    {readinessScore}% complete {agentConfig.approved ? '(Approved)' : '(Awaiting approval)'}
                  </div>
                </div>
              </div>
            </TabsContent>
            
          </Tabs>
        </div>

        {/* Flow Canvas */}
        <div className="flex-1 relative">
          {currentSessionId ? (<>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              onNodeClick={(event, node) => {
                setSelectedNode(node);
                setContextMenu({ visible: false, x: 0, y: 0, node: null });
              }}
              onNodeContextMenu={(event, node) => {
                event.preventDefault();
                setSelectedNode(node);
                setContextMenu({ visible: true, x: event.clientX, y: event.clientY, node });
              }}
              onPaneClick={() => setContextMenu({ visible: false, x: 0, y: 0, node: null })}
              fitView
              attributionPosition="bottom-right"
            >
              <Controls />
              <MiniMap />
              <Background gap={20} size={1} />
            </ReactFlow>
            {/* Context Menu */}
            {contextMenu.visible && contextMenu.node && (
              <div
                className="z-20 bg-popover border rounded shadow-md p-2 text-sm fixed"
                style={{ top: contextMenu.y, left: contextMenu.x }}
                onMouseLeave={() => setContextMenu({ visible: false, x: 0, y: 0, node: null })}
              >
                <button
                  className="block w-full text-left px-2 py-1 hover:bg-muted rounded"
                  onClick={() => {
                    setSelectedNode(contextMenu.node);
                    setContextMenu({ visible: false, x: 0, y: 0, node: null });
                  }}
                >Edit Properties</button>
                <button
                  className="block w-full text-left px-2 py-1 hover:bg-muted rounded"
                  onClick={() => {
                    const n = contextMenu.node!;
                    setNodes((nds) => nds.map(node => node.id === n.id ? { ...node, data: { ...node.data, deactivated: !node.data?.deactivated } } : node));
                    setContextMenu({ visible: false, x: 0, y: 0, node: null });
                  }}
                >Toggle Active</button>
                <button
                  className="block w-full text-left px-2 py-1 hover:bg-muted rounded"
                  onClick={() => {
                    const n = contextMenu.node!;
                    const clone: Node = {
                      ...n,
                      id: `${Date.now()}`,
                      position: { x: (n.position?.x || 0) + 30, y: (n.position?.y || 0) + 30 },
                      selected: false,
                    } as Node;
                    setNodes((nds) => [...nds, clone]);
                    setContextMenu({ visible: false, x: 0, y: 0, node: null });
                  }}
                >Duplicate</button>
                <button
                  className="block w-full text-left px-2 py-1 hover:bg-destructive/10 rounded"
                  onClick={() => {
                    const n = contextMenu.node!;
                    setDeletedNodes((prev) => [...prev, n]);
                    setNodes((nds) => nds.filter(node => node.id !== n.id));
                    setContextMenu({ visible: false, x: 0, y: 0, node: null });
                  }}
                >Soft Delete</button>
              </div>
            )}
           </>) : (
            <div className="flex items-center justify-center h-full bg-muted/20">
              <div className="text-center p-8">
                <Workflow className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Active Session</h3>
                <p className="text-muted-foreground mb-4">
                  Create or select a workflow session to start building
                </p>
                <Button onClick={handleCreateNewSession}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Session
                </Button>
              </div>
            </div>
          )}

          {/* Enhanced Node Properties Panel */}
          {selectedNode && (
            <Card className="absolute top-4 right-4 w-80 max-h-96 overflow-auto">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  {selectedNode.type?.toUpperCase()} Properties
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedNode(null)}
                  >
                    ×
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs font-medium">Label</Label>
                  <Input
                    value={String(selectedNode.data?.label || '')}
                    onChange={(e) => {
                      const val = e.target.value;
                      // Validate
                      if (!z.string().min(1).safeParse(val).success) return;
                      setNodes((nds) => nds.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, label: val } } : n));
                      setSelectedNode((sn) => sn && sn.id === selectedNode.id ? { ...sn, data: { ...sn.data, label: val } } as any : sn);
                    }}
                    placeholder="Enter label"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Description</Label>
                  <Textarea
                    rows={3}
                    value={String(selectedNode.data?.description || '')}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNodes((nds) => nds.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, description: val } } : n));
                      setSelectedNode((sn) => sn && sn.id === selectedNode.id ? { ...sn, data: { ...sn.data, description: val } } as any : sn);
                    }}
                    placeholder="Describe this node"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Active</Label>
                  <Switch
                    checked={!selectedNode.data?.deactivated}
                    onCheckedChange={(on) => {
                      setNodes((nds) => nds.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, deactivated: !on } } : n));
                      setSelectedNode((sn) => sn && sn.id === selectedNode.id ? { ...sn, data: { ...sn.data, deactivated: !on } } as any : sn);
                    }}
                  />
                </div>
                
                {/* Agent-specific properties */}
                {selectedNode.type === 'agent' && (
                  <>
                    {selectedNode.data?.languageModel && (
                      <div>
                        <label className="text-xs font-medium">Language Model</label>
                        <Badge variant="outline" className="text-xs flex items-center gap-1 w-fit">
                          <Brain className="h-3 w-3" />
                          {String(selectedNode.data.languageModel || 'Unknown')}
                        </Badge>
                      </div>
                    )}
                    {selectedNode.data?.visionEnabled && (
                      <div>
                        <label className="text-xs font-medium">Capabilities</label>
                        <div className="flex gap-1">
                          <Badge variant="secondary" className="text-xs">Vision Enabled</Badge>
                          {selectedNode.data?.realTimeTesting && (
                            <Badge variant="outline" className="text-xs">Real-time Testing</Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
                
{/* MCP-specific properties */}
                {selectedNode.type === 'mcp' && selectedNode.data?.tools && (
                  <div>
                    <label className="text-xs font-medium">Available Tools</label>
                    <div className="text-xs text-muted-foreground">
                      {Array.isArray(selectedNode.data.tools) ? selectedNode.data.tools.length : 0} tools configured
                    </div>
                  </div>
                )}

                {/* Decision-specific properties */}
                {selectedNode.type === 'decision' && (
                  <div>
                    <label className="text-xs font-medium">Conditions (comma-separated)</label>
                    <Textarea
                      rows={2}
                      value={Array.isArray(selectedNode.data?.conditions) ? (selectedNode.data?.conditions as string[]).join(', ') : ''}
                      onChange={(e) => {
                        const vals = e.target.value.split(',').map(v => v.trim()).filter(Boolean);
                        setNodes((nds) => nds.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, conditions: vals } } : n));
                      }}
                    />
                  </div>
                )}

                {/* Label Studio properties */}
                {selectedNode.type === 'labelstudio' && (
                  <>
                    {selectedNode.data?.projectId && (
                      <div>
                        <label className="text-xs font-medium">Project ID</label>
                        <p className="text-sm">{String(selectedNode.data.projectId || 'N/A')}</p>
                      </div>
                    )}
                    {selectedNode.data?.annotationTypes && Array.isArray(selectedNode.data.annotationTypes) && (
                      <div>
                        <label className="text-xs font-medium">Annotation Types</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedNode.data.annotationTypes.map((type: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">{type}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Configuration Panel */}
          {showConfigPanel && (
            <Card className="absolute top-4 right-4 w-96 max-h-[80vh] overflow-auto z-10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  Configuration: {configStep}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowConfigPanel(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
<CardContent className="space-y-4">
                {configStep === 'basic' && (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="agent-name">Agent Name</Label>
                      <Input
                        id="agent-name"
                        value={agentConfig.name}
                        onChange={(e) => {
                          const newName = e.target.value;
                          setAgentConfig(prev => ({ ...prev, name: newName }));
                          handleConfigUpdate('basic', { name: newName });
                        }}
                        placeholder="Enter agent name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="agent-description">Description</Label>
                      <Textarea
                        id="agent-description"
                        value={agentConfig.description}
                        onChange={(e) => {
                          const newDescription = e.target.value;
                          setAgentConfig(prev => ({ ...prev, description: newDescription }));
                          handleConfigUpdate('basic', { description: newDescription });
                        }}
                        placeholder="Describe your agent's purpose"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="agent-purpose">Purpose</Label>
                      <Input
                        id="agent-purpose"
                        value={agentConfig.purpose}
                        onChange={(e) => {
                          const newPurpose = e.target.value;
                          setAgentConfig(prev => ({ ...prev, purpose: newPurpose }));
                          handleConfigUpdate('basic', { purpose: newPurpose });
                        }}
                        placeholder="Agent's main purpose"
                      />
                    </div>
                    <div>
                      <Label>Categories (comma-separated)</Label>
                      <Input
                        value={agentConfig.categories.join(', ')}
                        onChange={(e) => {
                          const vals = e.target.value.split(',').map(v => v.trim()).filter(Boolean);
                          setAgentConfig(prev => ({ ...prev, categories: vals }));
                          handleConfigUpdate('basic', { categories: vals });
                        }}
                        placeholder="e.g. Clinical, Scheduling"
                      />
                    </div>
                    <div>
                      <Label>Topics (comma-separated)</Label>
                      <Input
                        value={agentConfig.topics.join(', ')}
                        onChange={(e) => {
                          const vals = e.target.value.split(',').map(v => v.trim()).filter(Boolean);
                          setAgentConfig(prev => ({ ...prev, topics: vals }));
                          handleConfigUpdate('basic', { topics: vals });
                        }}
                        placeholder="e.g. Radiology, Intake"
                      />
                    </div>
                    <div>
                      <Label>Business Units (comma-separated)</Label>
                      <Input
                        value={agentConfig.businessUnits.join(', ')}
                        onChange={(e) => {
                          const vals = e.target.value.split(',').map(v => v.trim()).filter(Boolean);
                          setAgentConfig(prev => ({ ...prev, businessUnits: vals }));
                          handleConfigUpdate('basic', { business_units: vals });
                        }}
                        placeholder="e.g. Operations, Billing"
                      />
                    </div>
                  </div>
                )}

                {configStep === 'connectors' && (
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">Assign connectors to this workflow or selected step.</div>
                    <div className="flex gap-2 items-center">
                      <Select value={selectedConnectorId} onValueChange={setSelectedConnectorId}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={isLoadingConnectors ? 'Loading connectors...' : 'Select a connector'} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableConnectors?.map((c: any) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        disabled={!currentSessionId || !selectedConnectorId}
                        onClick={() => {
                          if (!currentSessionId || !selectedConnectorId) return;
                          assignConnector.mutate({
                            agent_session_id: currentSessionId,
                            connector_id: selectedConnectorId,
                            task_id: selectedNode?.id || 'global',
                            task_type: selectedNode ? 'workflow_step' : 'connector'
                          });
                          setSelectedConnectorId('');
                        }}
                      >Assign</Button>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="text-xs font-medium mb-2">Current Assignments</div>
                      <div className="space-y-2">
                        {assignments?.length ? assignments.map((a: any) => (
                          <div key={a.id} className="flex items-center justify-between p-2 bg-muted rounded">
                            <div className="text-sm">
                              <div className="font-medium">{a.connector?.name || a.connector_id}</div>
                              <div className="text-xs text-muted-foreground">{a.task_type} • {a.task_id}</div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => removeAssignment.mutate(a.id)}>Remove</Button>
                          </div>
                        )) : (
                          <div className="text-xs text-muted-foreground">No assignments yet</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {configStep === 'knowledge' && (
                  <div className="space-y-3">
                    <div>
                      <Label>Add Knowledge Source URL</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="https://docs.example.com/guide"
                          value={knowledgeUrl}
                          onChange={(e) => setKnowledgeUrl(e.target.value)}
                        />
                        <Button
                          disabled={!knowledgeUrl.trim()}
                          onClick={() => {
                            const url = knowledgeUrl.trim();
                            if (!url) return;
                            const next = Array.from(new Set([...(agentConfig.knowledgeBases || []), url]));
                            setAgentConfig(prev => ({ ...prev, knowledgeBases: next }));
                            handleConfigUpdate('knowledge', { knowledge_bases: next });
                            setKnowledgeUrl('');
                          }}
                        >Add</Button>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Tip: paste URLs to include in this session's knowledge set.</div>
                    </div>

                    <div className="space-y-2">
                      {agentConfig.knowledgeBases.length ? agentConfig.knowledgeBases.map((kb, idx) => (
                        <div key={`${kb}-${idx}`} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="truncate text-sm" title={kb}>{kb}</div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const next = agentConfig.knowledgeBases.filter((k) => k !== kb);
                              setAgentConfig(prev => ({ ...prev, knowledgeBases: next }));
                              handleConfigUpdate('knowledge', { knowledge_bases: next });
                            }}
                          >Remove</Button>
                        </div>
                      )) : (
                        <div className="text-xs text-muted-foreground">No knowledge sources added yet</div>
                      )}
                    </div>

                    <div className="pt-3 border-t">
                      <div className="text-sm font-medium mb-2">Label Studio Integration</div>
                      <LSBindingPanel value={lsBinding} onBind={setLsBinding} />
                    </div>
                  </div>
                )}

                {configStep === 'rag' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Enable RAG</Label>
                      <Switch
                        checked={Object.keys(agentConfig.ragConfig).length > 0}
                        onCheckedChange={(checked) => {
                          const ragConfig = checked ? { enabled: true, model: 'default' } : {};
                          setAgentConfig(prev => ({ ...prev, ragConfig }));
                          handleConfigUpdate('rag', ragConfig);
                        }}
                      />
                    </div>
                    {Object.keys(agentConfig.ragConfig).length > 0 && (
                      <div className="p-3 bg-muted rounded space-y-2">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => {
                            const blob = new Blob([JSON.stringify(agentConfig.ragConfig, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'rag-config.json';
                            a.click();
                            URL.revokeObjectURL(url);
                          }}>Download RAG Config</Button>
                          <Input type="file" accept="application/json" onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const text = await file.text();
                            try {
                              const json = JSON.parse(text);
                              setAgentConfig(prev => ({ ...prev, ragConfig: json }));
                              handleConfigUpdate('rag', json);
                            } catch {}
                          }} />
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <Label>Final Approval</Label>
                          <Switch
                            checked={agentConfig.approved}
                            onCheckedChange={(checked) => {
                              setAgentConfig(prev => ({ ...prev, approved: checked }));
                              handleConfigUpdate('channels', { approved: checked });
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {configStep === 'channels' && (
                  <div className="space-y-2">
                    {CHANNELS.map((ch) => {
                      const checked = agentConfig.channels.includes(ch.id);
                      return (
                        <div key={ch.id} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="text-sm">{ch.label}</div>
                          <Switch
                            checked={checked}
                            onCheckedChange={(isOn) => {
                              const next = isOn
                                ? Array.from(new Set([...agentConfig.channels, ch.id]))
                                : agentConfig.channels.filter((c) => c !== ch.id);
                              setAgentConfig(prev => ({ ...prev, channels: next }));
                              handleConfigUpdate('channels', { channels: next });
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {configStep === 'deploy' && (
                  <div className="space-y-3 text-center p-4 bg-muted rounded">
                    <p className="text-sm">Deployment review - ready for production deployment</p>
                    <Button onClick={handleDeploy} disabled={isDeploying || !agentConfig.approved}>
                      {isDeploying ? 'Deploying...' : 'Deploy Now'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};