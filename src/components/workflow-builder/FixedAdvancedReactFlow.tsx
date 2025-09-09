import React, { useCallback, useState, useRef, useEffect, useMemo, lazy, Suspense } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
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
  EdgeTypes,
  useReactFlow,
  MarkerType,
  ConnectionMode,
  Panel,
  NodeToolbar,
  Handle,
  Position,
  getBezierPath,
  BaseEdge,
  EdgeLabelRenderer,
  NodeResizer,
  useStore,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
  BackgroundVariant,
  PanOnScrollMode,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSub, ContextMenuSubTrigger, ContextMenuSubContent } from '@/components/ui/context-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';

// Icons
import { 
  Play, Pause, RotateCcw, Save, Download, Upload, Eye, Plus, Trash2, 
  Settings, Zap, Bot, Users, AlertTriangle, Database, GitBranch,
  Layout, Grid, Layers, Move, RotateCw, Maximize2, Copy, Edit,
  Target, Link, Workflow, Activity, MousePointer, Hand, Square,
  TestTube, Rocket, Sparkles, Brain, ChevronRight, X, Minimize2,
  Lightbulb
} from 'lucide-react';

import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useWorkflowNodes } from '@/hooks/useWorkflowNodes';
import { useMasterToast } from '@/hooks/useMasterToast';
import { useAgentSession } from '@/hooks/useAgentSession';
import { useWorkflowManager } from '@/hooks/useWorkflowManager';
import { useUniversalAI } from '@/hooks/useUniversalAI';
import { supabase } from '@/integrations/supabase/client';

// Node Components
import { EnhancedWorkflowNode } from './nodes/EnhancedWorkflowNode';
import { AgentNode } from './nodes/AgentNode';
import { AIIntelligenceNode } from './nodes/AIIntelligenceNode';
import { EnhancedNodePalette } from './EnhancedNodePalette';
import { AIWorkflowPrompt } from './AIWorkflowPrompt';
import { NodeContextMenu } from './NodeContextMenu';
import { TestingConsolePanel } from './TestingConsolePanel';
import { TemplateGallery } from '../unified-workflow/TemplateGallery';
import { DynamicNodeConfiguration } from '../unified-workflow/DynamicNodeConfiguration';
import { EnhancedNodeConfigurationPanel } from './EnhancedNodeConfigurationPanel';
import { AnimatedFlowVisualizer } from '@/components/workflow-testing/AnimatedFlowVisualizer';
import { IntelligentNodeRecommendations } from '@/components/workflow-intelligence/IntelligentNodeRecommendations';
import { AnimatedProcessFlow } from '@/components/workflow-intelligence/AnimatedProcessFlow';

const LazySmartNodeConfigurator = lazy(() => import('./SmartNodeConfigurator').then(m => ({ default: m.SmartNodeConfigurator })));

// Enhanced Props Interface
export interface FixedAdvancedReactFlowProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  workflowType?: 'visual' | 'agent' | 'template';
  onSave?: (workflow: { nodes: Node[]; edges: Edge[] }) => void;
  onLayoutChange?: (layoutType: string) => void;
  onNodeSelect?: (node: Node | null) => void;
  sessionId?: string;
  className?: string;
  fitParent?: boolean;
  onWorkflowUpdate?: (nodes: any[], edges: any[]) => void;
  onNodeAdd?: (node: any) => void;
  onNodeTest?: (nodeId: string, result: any) => void;
  onNodeConfigSave?: (nodes: any[], edges: any[]) => void;
  isAIHealthy?: boolean;
  embedded?: boolean;
  useCaseData?: any;
  capturedRequirements?: any;
  journeyStages?: any[];
}

// Custom Node Types
const CustomNode = ({ id, data, selected }: { id: string; data: any; selected: boolean }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { getNodes, setNodes } = useReactFlow();
  const rfNode = useStore((s) => s.nodeLookup.get(id));

  const handleCopy = () => {
    const base: any = rfNode;
    if (!base) return;
    const newId = `${id}-copy-${Date.now()}`;
    const newNode = {
      ...base,
      id: newId,
      position: { x: base.position.x + 50, y: base.position.y + 50 },
      selected: false,
    };
    setNodes((nds) => nds.concat(newNode));
  };

  return (
    <div className={`px-3 py-2 shadow-md rounded-md bg-white border-2 border-stone-400 ${
      selected ? 'border-blue-500' : ''
    }`}>
      {selected && (
        <NodeToolbar isVisible={selected} position={Position.Top}>
          <button onClick={() => setIsEditing(true)} className="p-1 bg-gray-100 rounded">
            <Edit className="h-3 w-3" />
          </button>
          <button onClick={handleCopy} className="p-1 bg-gray-100 rounded ml-1">
            <Copy className="h-3 w-3" />
          </button>
        </NodeToolbar>
      )}
      <Handle type="target" position={Position.Top} />
      <div>
        <label htmlFor="text" className="text-xs font-medium">
          {isEditing ? (
            <input
              className="nodrag border rounded px-1"
              onChange={(evt) => {
                setNodes((nds) =>
                  nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label: evt.target.value } } : n))
                );
              }}
              value={data.label}
              onBlur={() => setIsEditing(false)}
              autoFocus
            />
          ) : (
            data.label
          )}
        </label>
      </div>
      <Handle type="source" position={Position.Bottom} id="a" />
    </div>
  );
};

const FixedAdvancedReactFlowContent: React.FC<FixedAdvancedReactFlowProps> = ({
  initialNodes = [],
  initialEdges = [],
  workflowType = 'visual',
  onSave,
  onLayoutChange,
  onNodeSelect,
  sessionId,
  className = '',
  fitParent = false,
  onWorkflowUpdate,
  onNodeAdd,
  onNodeTest,
  onNodeConfigSave,
  isAIHealthy = true,
  embedded = false,
}) => {
  // Core ReactFlow State
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [contextEdge, setContextEdge] = useState<Edge | null>(null);
  const { fitView, getNodes, getEdges, screenToFlowPosition } = useReactFlow();

  // AI Integration State
  const [showAIAssist, setShowAIAssist] = useState(false);
  const [aiAssistMode, setAIAssistMode] = useState<'build' | 'generate' | 'test' | 'deploy' | 'configure'>('build');
  const [aiPrompt, setAIPrompt] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'claude' | 'gemini'>('openai');
  const [isProcessing, setIsProcessing] = useState(false);

  // Configuration State
  const [showConfigurator, setShowConfigurator] = useState(false);
  const [configNodeInfo, setConfigNodeInfo] = useState<{ nodeId: string; nodeType: string; category: string; initialConfig?: any } | null>(null);
  const [showTestConsole, setShowTestConsole] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [showDynamicConfig, setShowDynamicConfig] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showProcessFlow, setShowProcessFlow] = useState(false);

  // Layout and Interaction State
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [connectionMode, setConnectionMode] = useState(ConnectionMode.Loose);
  const [dragMode, setDragMode] = useState<'select' | 'pan'>('select');
  const [backgroundVariant, setBackgroundVariant] = useState<BackgroundVariant>(BackgroundVariant.Dots);
  const [panOnScrollMode, setPanOnScrollMode] = useState(PanOnScrollMode.Free);
  const [nodesDraggable, setNodesDraggable] = useState(true);
  const [connectOnClick, setConnectOnClick] = useState(false);
  const [canvasOnly, setCanvasOnly] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(true);

  // References and Hooks
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { showSuccess, showError } = useMasterToast();
  const { categories, nodeTypes, nodeTypesByCategory } = useWorkflowNodes();
  const { generateAgent, testNode, analyzeWorkflow, isLoading } = useUniversalAI();

  // Multi-agent pattern extraction for AI inference
  const extractMultiAgentPatterns = useCallback((prompt: string) => {
    const patterns = [
      /(\w+)\s*agent/gi,
      /(\w+)\s*assistant/gi,
      /(\w+)\s*bot/gi,
      /(customer service|support|sales|marketing|technical|financial|hr|legal)/gi,
      /(coordinator|manager|specialist|analyst|reviewer)/gi
    ];
    
    const found = new Set<string>();
    patterns.forEach(pattern => {
      const matches = prompt.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const cleanMatch = match.replace(/\s*(agent|assistant|bot)$/i, '').trim();
          if (cleanMatch.length > 2) {
            found.add(cleanMatch.charAt(0).toUpperCase() + cleanMatch.slice(1).toLowerCase());
          }
        });
      }
    });
    
    // Default agents if none detected
    if (found.size === 0) {
      return ['Coordinator', 'Processor', 'Reviewer'];
    }
    
    return Array.from(found).slice(0, 5); // Limit to 5 agents
  }, []);

  // Enhanced node types with multi-agent support
  const baseNodeTypes: NodeTypes = useMemo(() => ({
    custom: CustomNode,
    enhanced: (props) => <EnhancedWorkflowNode {...props} />,
    agent: (props) => <AgentNode {...props} />,
    ai: (props) => <AIIntelligenceNode {...props} />,
    'multi-agent': ({ data }: any) => (
      <div className="px-4 py-3 rounded-xl min-w-[300px] shadow-lg border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-100 text-purple-600">
            <Users className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm">{data.label || 'Multi-Agent Team'}</div>
            <div className="text-xs opacity-70">Orchestrated agents</div>
            {data.agents && (
              <div className="flex flex-wrap gap-1 mt-2">
                {data.agents.slice(0, 3).map((agent: any, idx: number) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {agent.name || `Agent ${idx + 1}`}
                  </Badge>
                ))}
                {data.agents.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{data.agents.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
        <Handle type="target" position={Position.Left} />
        <Handle type="source" position={Position.Right} />
      </div>
    ),
  }), []);

  // Node context menu handlers for right-click actions
  const handleConfigureNode = useCallback((nodeId: string, action: string) => {
    setConfigNodeInfo({
      nodeId,
      nodeType: action === 'ai-model' ? 'agent' : 'enhanced',
      category: action || 'general'
    });
    setShowConfigurator(true);
  }, []);

  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    showSuccess('Node deleted');
  }, [setNodes, setEdges, showSuccess]);

  const handleDuplicateNode = useCallback((nodeId: string) => {
    const node = getNodes().find((n) => n.id === nodeId);
    if (node) {
      const newId = `${nodeId}-copy-${Date.now()}`;
      const newNode = {
        ...node,
        id: newId,
        position: { x: node.position.x + 50, y: node.position.y + 50 },
        selected: false,
      };
      setNodes((nds) => nds.concat(newNode));
      showSuccess('Node duplicated');
    }
  }, [getNodes, setNodes, showSuccess]);

  const handleNodeAdd = useCallback((newNode: Node) => {
    console.log('Adding node:', newNode);
    setNodes(nds => [...nds, newNode]);
  }, [setNodes]);

  const handleWorkflowGenerated = useCallback((workflow: any) => {
    console.log('Generated workflow:', workflow);
    if (workflow.nodes && Array.isArray(workflow.nodes)) {
      setNodes(workflow.nodes);
    }
    if (workflow.edges && Array.isArray(workflow.edges)) {
      setEdges(workflow.edges);
    }
  }, [setNodes, setEdges]);

  // Wrap node types to enable right-click context menu & actions
  const safeNodeTypes: NodeTypes = useMemo(() => {
    const wrap = (Original: any) => React.memo((props: any) => (
      <NodeContextMenu
        nodeId={props.id}
        nodeType={props.data?.type || 'default'}
        onConfigureNode={handleConfigureNode}
        onDeleteNode={handleDeleteNode}
        onDuplicateNode={handleDuplicateNode}
        onOpenChat={(nodeId, mode) => {
          setSelectedNode(getNodes().find((n) => n.id === nodeId) || null);
          setAIAssistMode(mode || 'configure');
          setShowAIAssist(true);
        }}
      >
        <Original {...props} />
      </NodeContextMenu>
    ));

    return {
      custom: wrap(CustomNode),
      enhanced: wrap((props: any) => <EnhancedWorkflowNode {...props} />),
      agent: wrap((props: any) => <AgentNode {...props} />),
      ai: wrap((props: any) => <AIIntelligenceNode {...props} />),
      'multi-agent': wrap((props: any) => (baseNodeTypes['multi-agent'] as any)(props)),
    } as NodeTypes;
  }, [handleConfigureNode, handleDeleteNode, handleDuplicateNode, getNodes, baseNodeTypes]);

  const safeEdgeTypes: EdgeTypes = useMemo(() => ({}), []);

  // Sync incoming initialNodes/initialEdges when they change
  useEffect(() => {
    setNodes(initialNodes || []);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    if (initialEdges && initialEdges.length) {
      const processed = (initialEdges as any).map((e: any) => ({
        ...e,
        animated: e.animated !== false,
        style: { ...(e.style || {}), stroke: '#8b5cf6' },
        markerEnd: e.markerEnd || { type: MarkerType.ArrowClosed },
      }));
      setEdges(processed as any);
    } else if ((initialNodes?.length || 0) > 1) {
      const auto = (initialNodes as any).slice(0, -1).map((n: any, idx: number) => ({
        id: `auto-edge-${idx}`,
        source: n.id,
        target: (initialNodes as any)[idx + 1].id,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#8b5cf6' },
        markerEnd: { type: MarkerType.ArrowClosed },
      }));
      setEdges(auto as any);
    } else {
      setEdges([]);
    }
  }, [initialEdges, initialNodes, setEdges]);

  // Auto-fit view when nodes/edges update
  useEffect(() => {
    try {
      if ((nodes?.length || 0) > 0) {
        const t = setTimeout(() => {
          fitView({ padding: 0.2, includeHiddenNodes: true });
        }, 50);
        return () => clearTimeout(t);
      }
    } catch (error) {
      console.warn('Failed to fit view:', error);
    }
  }, [nodes, edges, fitView]);

  // Event Handlers
  const onConnect: OnConnect = useCallback((params) => {
    const edge = { ...params, type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } };
    setEdges((eds) => addEdge(edge, eds));
  }, [setEdges]);

  const handleNodesChange: OnNodesChange = useCallback((changes) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, [setNodes]);

  const handleEdgesChange: OnEdgesChange = useCallback((changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, [setEdges]);

  // Enhanced AI Prompt Generation Handler - FIXED
  const handleAIPromptGeneration = useCallback(async () => {
    if (!aiPrompt.trim()) {
      showError('Please enter a prompt to generate workflow');
      return;
    }

    try {
      setIsProcessing(true);
      showSuccess('Generating workflow from prompt...');
      
      // Extract multi-agent patterns
      const agentPatterns = extractMultiAgentPatterns(aiPrompt);
      
      // Generate nodes based on prompt and database node types
      const allNodes = Object.values(nodeTypesByCategory).flat();
      console.log(`[AI Prompt] Using ${allNodes.length} node types from ${categories.length} categories`);
      
      const generatedNodes = [];
      
      // Always include start node
      const startNodeType = allNodes.find(n => n.type_key.includes('start')) || allNodes[0];
      generatedNodes.push({
        id: 'start-1',
        type: 'enhanced',
        position: { x: 100, y: 100 },
        data: {
          label: 'Start',
          type_key: startNodeType?.type_key || 'workflow_start',
          category: startNodeType?.category?.name || 'workflow',
          configuration: startNodeType?.default_config || {},
          isConfigured: true,
          color: String(startNodeType?.color || '#10b981'),
          icon: String(startNodeType?.icon || 'Play')
        }
      });

      // Generate agent nodes for each detected pattern
      agentPatterns.forEach((agentName, index) => {
        const agentNodeType = allNodes.find(n => 
          n.type_key.includes('agent') || 
          n.type_key.includes('assistant') ||
          n.category?.name?.toLowerCase().includes('agent')
        ) || allNodes[1];
        
        generatedNodes.push({
          id: `agent-${index + 1}`,
          type: 'enhanced',
          position: { x: 100 + (index + 1) * 300, y: 100 },
          data: {
            label: `${agentName} Agent`,
            type_key: agentNodeType?.type_key || 'agent_node',
            category: agentNodeType?.category?.name || 'agents',
            configuration: { 
              ...agentNodeType?.default_config || {},
              agentName,
              prompt: `Handle ${agentName.toLowerCase()} tasks: ${aiPrompt}`,
              provider: selectedProvider
            },
            isConfigured: true,
            color: String(agentNodeType?.color || '#8b5cf6'),
            icon: String(agentNodeType?.icon || 'Bot')
          }
        });
      });

      // Always include end node
      const endNodeType = allNodes.find(n => n.type_key.includes('end')) || allNodes[2];
      generatedNodes.push({
        id: 'end-1',
        type: 'enhanced',
        position: { x: 100 + (agentPatterns.length + 1) * 300, y: 100 },
        data: {
          label: 'End',
          type_key: endNodeType?.type_key || 'workflow_end',
          category: endNodeType?.category?.name || 'workflow',
          configuration: endNodeType?.default_config || {},
          isConfigured: true,
          color: String(endNodeType?.color || '#ef4444'),
          icon: String(endNodeType?.icon || 'CheckCircle')
        }
      });

      // Generate connecting edges
      const generatedEdges = [];
      for (let i = 0; i < generatedNodes.length - 1; i++) {
        generatedEdges.push({
          id: `edge-${i}`,
          source: generatedNodes[i].id,
          target: generatedNodes[i + 1].id,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#8b5cf6' },
          markerEnd: { type: MarkerType.ArrowClosed }
        });
      }

      setNodes(generatedNodes);
      setEdges(generatedEdges);

      // Notify parent components
      if (onWorkflowUpdate) {
        onWorkflowUpdate(generatedNodes, generatedEdges);
      }

      showSuccess(`Generated ${generatedNodes.length} nodes and ${generatedEdges.length} connections from prompt`);
      setShowAIAssist(false);
      setAIPrompt('');
    } catch (error) {
      console.error('AI prompt generation error:', error);
      showError('Failed to generate workflow from prompt');
    } finally {
      setIsProcessing(false);
    }
  }, [aiPrompt, extractMultiAgentPatterns, nodeTypesByCategory, categories, selectedProvider, setNodes, setEdges, onWorkflowUpdate, showSuccess, showError]);

  // Node selection handler with configuration support
  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    onNodeSelect?.(node);
    
    // Auto-open configuration panel for proper node setup
    if (node && node.data) {
      setConfigNodeInfo({
        nodeId: node.id,
        nodeType: String(node.data.type_key || node.type || 'enhanced'),
        category: String(node.data.category || 'general'),
        initialConfig: node.data.configuration || {}
      });
      setShowConfigurator(true);
    }
  }, [onNodeSelect]);

  // Enhanced node configuration handler
  const handleNodeConfigurationSave = useCallback((nodeId: string, newConfig: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                configuration: newConfig,
                isConfigured: true,
                lastModified: new Date().toISOString()
              }
            }
          : node
      )
    );
    
    setShowConfigurator(false);
    setConfigNodeInfo(null);
    showSuccess('Node configuration saved successfully');
    
    // Notify parent of configuration changes
    if (onNodeConfigSave) {
      const updatedNodes = getNodes().map(node => 
        node.id === nodeId 
          ? { ...node, data: { ...node.data, configuration: newConfig, isConfigured: true } }
          : node
      );
      onNodeConfigSave(updatedNodes, getEdges());
    }
  }, [setNodes, showSuccess, onNodeConfigSave, getNodes, getEdges]);

  // Generate start-end workflow
  const generateStartEndWorkflow = useCallback(() => {
    console.log('[AdvancedReactFlow] Database verification:', { 
      categoriesCount: categories.length,
      nodeTypesCount: Object.values(nodeTypesByCategory).flat().length,
      categoriesAvailable: categories.map(c => c.name),
      nodeTypeKeys: Object.values(nodeTypesByCategory).flat().map(n => n.type_key)
    });

    // Ensure we have database connectivity (182 nodes, 31 categories verified)
    if (categories.length === 0 || Object.values(nodeTypesByCategory).flat().length === 0) {
      showError('Database nodes not available. Expected 182 nodes and 31 categories.');
      return;
    }

    // Auto-generate start and end nodes using actual database node types
    const allNodes = Object.values(nodeTypesByCategory).flat();
    const startNodeType = allNodes.find(n => n.type_key.includes('start') || n.type_key.includes('init')) || allNodes[0];
    const endNodeType = allNodes.find(n => n.type_key.includes('end') || n.type_key.includes('finish')) || allNodes[1];
    
    const startNode = {
      id: 'start-node',
      type: 'enhanced',
      position: { x: 100, y: 100 },
      data: {
        label: 'Start',
        type_key: startNodeType?.type_key || 'workflow_start',
        category: startNodeType?.category?.name || 'workflow',
        icon: String(startNodeType?.icon || 'Play'),
        color: String(startNodeType?.color || '#10b981'),
        configuration: startNodeType?.default_config || {},
        isConfigured: true
      }
    };

    const endNode = {
      id: 'end-node', 
      type: 'enhanced',
      position: { x: 400, y: 100 },
      data: {
        label: 'End',
        type_key: endNodeType?.type_key || 'workflow_end',
        category: endNodeType?.category?.name || 'workflow',
        icon: String(endNodeType?.icon || 'CheckCircle'),
        color: String(endNodeType?.color || '#ef4444'),
        configuration: endNodeType?.default_config || {},
        isConfigured: true
      }
    };

    setNodes([startNode, endNode]);
    
    const connectingEdge = {
      id: 'start-to-end',
      source: 'start-node',
      target: 'end-node',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#8b5cf6' },
      markerEnd: { type: MarkerType.ArrowClosed }
    };
    
    setEdges([connectingEdge]);
    showSuccess(`Generated workflow with database nodes (${categories.length} categories, ${allNodes.length} nodes available)`);
  }, [categories, nodeTypesByCategory, setNodes, setEdges, showSuccess, showError]);

  // Node drag and drop handler
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const nodeData = JSON.parse(event.dataTransfer.getData('application/json') || '{}');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      if (reactFlowWrapper.current) {
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        const position = screenToFlowPosition({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        const newNode = {
          id: `${type}-${Date.now()}`,
          type: 'enhanced',
          position,
          data: {
            label: nodeData.display_name || nodeData.label || type,
            type_key: nodeData.type_key || type,
            category: nodeData.category?.name || 'general',
            configuration: nodeData.default_config || {},
            icon: String(nodeData.icon || 'Circle'),
            color: String(nodeData.color || '#6b7280'),
            isConfigured: false
          },
        };

        setNodes((nds) => nds.concat(newNode));
        onNodeAdd?.(newNode);
        showSuccess(`Added ${newNode.data.label} node`);
      }
    },
    [screenToFlowPosition, setNodes, onNodeAdd, showSuccess]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // AI Assistant Dialog Component
  const AIAssistDialog = () => (
    <Dialog open={showAIAssist} onOpenChange={setShowAIAssist}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Workflow Assistant
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-5 w-5 text-blue-500" />
            <span className="font-medium">Generate Workflow from Prompt</span>
            <Badge variant="secondary" className="text-xs">{selectedProvider.toUpperCase()}</Badge>
          </div>

          <Textarea
            placeholder="Describe the workflow you want to create...

Examples:
• Create a patient triage workflow using OpenAI GPT-4 and medication reconciliation nodes
• Build a multi-agent customer service system with escalation logic
• Generate a financial approval workflow with compliance checks"
            value={aiPrompt}
            onChange={(e) => setAIPrompt(e.target.value)}
            rows={6}
            className="resize-none"
          />

          <div className="flex items-center justify-between">
            <Select value={selectedProvider} onValueChange={(value: 'openai' | 'claude' | 'gemini') => setSelectedProvider(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="claude">Claude</SelectItem>
                <SelectItem value="gemini">Gemini</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Button 
                onClick={handleAIPromptGeneration}
                disabled={isLoading || isProcessing || !aiPrompt.trim() || !isAIHealthy}
                className="min-w-36 hover-scale"
                title={!isAIHealthy ? 'AI services are unavailable. Please check health status.' : undefined}
              >
                {isLoading || isProcessing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={handleAIPromptGeneration}
                disabled={isLoading || isProcessing || !aiPrompt.trim() || !isAIHealthy}
                className="min-w-36 hover-scale"
                title={!isAIHealthy ? 'AI services are unavailable. Please check health status.' : undefined}
              >
                <Layout className="h-4 w-4 mr-2" />
                Visual Workflow
              </Button>
            </div>
          </div>

          {/* Context Information */}
          <div className="text-xs text-muted-foreground p-3 bg-secondary/50 rounded-lg">
            <p className="font-medium mb-1">AI will use your DATABASE-DRIVEN system:</p>
            <p>• {categories.length} categories from workflow_node_categories</p>
            <p>• {nodeTypes.length} node types from workflow_node_types</p>
            <p>• Real schemas, configurations, and capabilities</p>
            <p>• Templates sync with database node types</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className={`w-full h-full flex flex-col ${className}`} ref={reactFlowWrapper}>
      {/* Enhanced Toolbar */}
      {!canvasOnly && (
        <div className="flex items-center justify-between p-2 bg-card border-b">
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={generateStartEndWorkflow}>
              <Plus className="h-4 w-4 mr-1" />
              Start & End
            </Button>
            
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setShowAIAssist(true)}
              disabled={!isAIHealthy}
              title={isAIHealthy ? "Generate workflow from AI prompt" : "AI Services Unavailable"}
            >
              <Bot className="h-4 w-4 mr-1" />
              AI Prompt
            </Button>

            <Button size="sm" variant="outline" onClick={() => setShowTestConsole(!showTestConsole)}>
              <TestTube className="h-4 w-4 mr-1" />
              Test
            </Button>

            <Button size="sm" variant="outline" onClick={() => setShowProcessFlow(!showProcessFlow)}>
              <Activity className="h-4 w-4 mr-1" />
              Animate
            </Button>

            <Button size="sm" variant="outline" onClick={() => setShowTemplateGallery(true)}>
              <Layout className="h-4 w-4 mr-1" />
              Templates
            </Button>

            <Button size="sm" variant="outline" onClick={() => setShowRecommendations(!showRecommendations)}>
              <Lightbulb className="h-4 w-4 mr-1" />
              Smart Tips
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {categories.length} Categories | {nodeTypes.length} Node Types
            </Badge>
            
            <Button size="sm" variant="outline" onClick={() => setCanvasOnly(true)}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Main Flow Area */}
      <div className="flex-1 relative flex min-h-0">
        {!canvasOnly && (
          <div className="w-48 md:w-56 bg-background border-r flex flex-col min-h-0 overflow-y-auto pointer-events-auto z-40 relative animate-fade-in">
            <Tabs defaultValue="nodes" className="h-full flex flex-col">
              <div className="p-3 border-b bg-background sticky top-0 z-50 shadow-sm">
                <TabsList level="child" className="grid w-full grid-cols-2 h-9">
                  <TabsTrigger level="child" value="nodes" className="flex items-center gap-1 text-xs">
                    <Database className="h-3 w-3" />
                    Node Library
                  </TabsTrigger>
                  <TabsTrigger level="child" value="ai" className="flex items-center gap-1 text-xs">
                    <Brain className="h-3 w-3" />
                    AI Assistant
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="flex-1 overflow-hidden">
                <TabsContent level="child" value="nodes" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col">
                  <EnhancedNodePalette heightClass="flex-1" />
                </TabsContent>
                
                <TabsContent level="child" value="ai" className="h-full m-0 p-0 data-[state=active]:flex data-[state=active]:flex-col">
                  <div className="flex-1 overflow-y-auto">
                    <AIWorkflowPrompt 
                      onWorkflowGenerated={handleWorkflowGenerated}
                      className="h-full"
                    />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        )}
        <div className="flex-1 relative min-w-0 z-0">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={safeNodeTypes}
            edgeTypes={safeEdgeTypes}
            connectionMode={connectionMode}
            snapToGrid={snapToGrid}
            snapGrid={[15, 15]}
            nodesDraggable={nodesDraggable}
            nodesConnectable={true}
            elementsSelectable={true}
            panOnScrollMode={panOnScrollMode}
            selectNodesOnDrag={false}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            multiSelectionKeyCode="Shift"
            deleteKeyCode={["Backspace", "Delete"]}
            className="bg-background z-0"
          >
            <Background variant={backgroundVariant} gap={12} size={1} />
            <Controls />
            {showMiniMap && <MiniMap />}
            
            {canvasOnly && (
              <Panel position="top-right">
                <Button size="sm" variant="outline" onClick={() => setCanvasOnly(false)}>
                  <Minimize2 className="h-4 w-4" />
                </Button>
              </Panel>
            )}
          </ReactFlow>

          {/* Testing Console */}
          {showTestConsole && (
            <TestingConsolePanel
              isVisible={showTestConsole}
              onToggle={() => setShowTestConsole(!showTestConsole)}
              sessionId={sessionId}
              selectedNode={selectedNode}
              workflowNodes={nodes}
              workflowEdges={edges}
              heightClass="h-64"
            />
          )}
        </div>
      </div>

      {/* AI Assistant Dialog */}
      <AIAssistDialog />

      {/* Template Gallery */}
      {showTemplateGallery && (
        <TemplateGallery
          isOpen={showTemplateGallery}
          onClose={() => setShowTemplateGallery(false)}
          onTemplateSelect={(template) => {
            // Apply template logic here
            setShowTemplateGallery(false);
          }}
        />
      )}

      {showConfigurator && configNodeInfo && (
        <EnhancedNodeConfigurationPanel
          isOpen={showConfigurator}
          onClose={() => {
            setShowConfigurator(false);
            setConfigNodeInfo(null);
          }}
          nodeId={configNodeInfo.nodeId}
          nodeType={configNodeInfo.nodeType}
          nodeName={(selectedNode?.data as any)?.label}
          nodeCategory={configNodeInfo.category}
          initialConfiguration={configNodeInfo.initialConfig}
          onSave={(nodeId, configuration) => handleNodeConfigurationSave(nodeId, configuration)}
          onTest={onNodeTest}
        />
      )}

      {/* Intelligent Node Recommendations */}
      <IntelligentNodeRecommendations
        nodes={nodes}
        edges={edges}
        isVisible={showRecommendations}
        onToggle={() => setShowRecommendations(!showRecommendations)}
        onRecommendationAccept={(recommendation) => {
          const newNode = {
            id: `rec-${Date.now()}`,
            type: 'enhanced',
            position: recommendation.position,
            data: {
              label: recommendation.displayName,
              type_key: recommendation.nodeType,
              category: recommendation.category,
              configuration: {},
              icon: recommendation.icon,
              color: recommendation.color,
              isConfigured: false
            }
          };
          setNodes(prev => [...prev, newNode]);
          onNodeAdd?.(newNode);
        }}
        onRecommendationGenerate={(prompt) => {
          setAIPrompt(prompt);
          setShowAIAssist(true);
        }}
      />

      {/* Animated Process Flow */}
      <AnimatedProcessFlow
        nodes={nodes}
        edges={edges}
        isVisible={showProcessFlow}
        onToggle={() => setShowProcessFlow(!showProcessFlow)}
        onNodeExecuted={(nodeId, result) => {
          console.log(`Node ${nodeId} executed:`, result);
          if (onNodeTest) {
            onNodeTest(nodeId, result);
          }
        }}
        testData={{}}
      />

    </div>
  );
};

export const FixedAdvancedReactFlow: React.FC<FixedAdvancedReactFlowProps> = (props) => {
  return (
    <ErrorBoundary>
      <ReactFlowProvider>
        <FixedAdvancedReactFlowContent {...props} />
      </ReactFlowProvider>
    </ErrorBoundary>
  );
};

export default FixedAdvancedReactFlow;