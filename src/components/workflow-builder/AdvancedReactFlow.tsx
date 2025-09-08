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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Layout algorithms
import dagre from 'dagre';
import ELK from 'elkjs/lib/elk.bundled.js';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TestingConsolePanel } from './TestingConsolePanel';
import { CodeEditorPanel } from './CodeEditorPanel';
import { Badge } from '@/components/ui/badge';
import { UnifiedTestingInterface } from '@/components/testing/UnifiedTestingInterface';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSub, ContextMenuSubTrigger, ContextMenuSubContent } from '@/components/ui/context-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Icons
import { 
  Play, Pause, RotateCcw, Save, Download, Upload, Eye, Plus, Trash2, 
  Settings, Zap, Bot, Users, AlertTriangle, Database, GitBranch,
  Layout, Grid, Layers, Move, RotateCw, Maximize2, Copy, Edit,
  Target, Link, Workflow, Activity, MousePointer, Hand
} from 'lucide-react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useWorkflowNodes } from '@/hooks/useWorkflowNodes';

import { useMasterToast } from '@/hooks/useMasterToast';
import { useAgentSession } from '@/hooks/useAgentSession';
import { useWorkflowManager } from '@/hooks/useWorkflowManager';
import { useWorkflowAgents } from '@/hooks/useWorkflowAgents';
import { useAIModelManager } from '@/hooks/useAIModelManager';
import { useInfrastructureManager } from '@/hooks/useInfrastructureManager';
import { useAccessManager } from '@/hooks/useAccessManager';
import { useTestingManager } from '@/hooks/useTestingManager';
import { NodeUpdateHandler } from './NodeUpdateHandler';
import { InlineNodeConfig } from './InlineNodeConfig';
import { ProcessFlowTracker } from './ProcessFlowTracker';
import { AIIntelligenceNode } from './nodes/AIIntelligenceNode';
import { AgentNode } from './nodes/AgentNode';
import { EnhancedNodePalette } from './EnhancedNodePalette';
import { ToolCreator } from './ToolCreator';
import { RealTimeExecutionEngine } from './RealTimeExecutionEngine';
import { SessionPersistenceManager } from './SessionPersistenceManager';
import { EnhancedWorkflowNode } from './nodes/EnhancedWorkflowNode';
import { DynamicNodeConfigurator } from './nodes/DynamicNodeConfigurator';
import { NodeChatInterface } from './NodeChatInterface';
import { NodeContextMenu } from './NodeContextMenu';
import { performComprehensiveConsolidation } from '@/utils/consolidation';

const LazySmartNodeConfigurator = lazy(() => import('./SmartNodeConfigurator').then(m => ({ default: m.SmartNodeConfigurator })));
const LazyDynamicConfigurator = lazy(() => import('./nodes/DynamicNodeConfigurator').then(m => ({ default: m.DynamicNodeConfigurator })));
// Custom Node Types
const CustomNode = ({ id, data, selected }: { id: string; data: any; selected: boolean }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { getNodes, setNodes } = useReactFlow();
  const rfNode = useStore((s) => s.nodeLookup.get(id));

  const handleCopy = () => {
    const base: any = rfNode;
    if (!base) return;
    const newId = `${id}-copy-${Date.now()}`;
    const offset = {
      x: (base.position?.x || 0) + 40,
      y: (base.position?.y || 0) + 40,
    };
    const newNode: any = {
      id: newId,
      type: 'custom',
      position: offset,
      data: { ...data, label: `${data?.label || 'Node'} (copy)` },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const deleteNode = () => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
  };

  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${
      selected ? 'border-blue-500' : 'border-stone-400'
    }`}>
      {selected && (
        <NodeToolbar isVisible position={Position.Top}>
          <button onClick={handleCopy} className="btn-primary">Copy</button>
          <button onClick={() => setIsEditing(true)} className="btn-secondary">Edit</button>
          <button onClick={deleteNode} className="btn-destructive">Delete</button>
        </NodeToolbar>
      )}
      
      <Handle type="target" position={Position.Top} className="w-16 !bg-teal-500" />
      <div>
        {isEditing ? (
          <input
            defaultValue={data?.label || 'Node'}
            onBlur={(e) => {
              setNodes((nds) =>
                nds.map((n) =>
                  n.id === id ? { ...n, data: { ...n.data, label: e.target.value } } : n
                )
              );
              setIsEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur();
              }
            }}
            autoFocus
          />
        ) : (
          <label>{data?.label || 'Node'}</label>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-16 !bg-teal-500" />
    </div>
  );
};

// Custom Connection Line
const ConnectionLine = ({ fromX, fromY, toX, toY }: any) => {
  const [edgePath] = getBezierPath({
    sourceX: fromX,
    sourceY: fromY,
    targetX: toX,
    targetY: toY,
  });

  return (
    <g>
      <path fill="none" stroke="#222" strokeWidth={1.5} className="animated" d={edgePath} />
      <circle cx={toX} cy={toY} fill="#222" r={3} stroke="#222" strokeWidth={1.5} />
    </g>
  );
};

export interface AdvancedReactFlowWrapperProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  workflowType?: 'visual' | 'conversational' | 'process' | 'decision_tree' | 'flowchart' | 'bpmn';
  onSave?: (workflowData: { nodes: Node[]; edges: Edge[]; metadata?: any }) => void;
  onLayoutChange?: (layout: string) => void;
  onNodeSelect?: (node: Node | null) => void;
  sessionId?: string;
  className?: string;
  fitParent?: boolean;
  
  // Unified builder context props
  useCaseData?: {
    name: string;
    description: string;
    selectedUseCase?: any;
    detailedUseCase?: string;
    targetUsers?: string;
    expectedOutcomes?: string;
  };
  capturedRequirements?: {
    connectors: string[];
    actions: string[];
    steps: string[];
    integrations: string[];
  };
  journeyStages?: any[];
}

const AdvancedReactFlowContent: React.FC<AdvancedReactFlowWrapperProps> = ({
  initialNodes = [],
  initialEdges = [],
  workflowType = 'visual',
  onSave,
  onLayoutChange,
  onNodeSelect,
  sessionId,
  className = '',
  fitParent = false,
  useCaseData,
  capturedRequirements,
  journeyStages,
}) => {
  // Real-time collaboration - temporarily disabled until import is fixed
  // const { collaborators, isConnected, broadcastWorkflowChange, updatePresence } = useRealtimeCollaboration(sessionId || 'default');
  const collaborators: any[] = [];
  const isConnected = false;
  // Core ReactFlow State
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [contextEdge, setContextEdge] = useState<Edge | null>(null);
  const { fitView, getNodes, getEdges, screenToFlowPosition } = useReactFlow();

  // Sync incoming initialNodes/initialEdges when they change (e.g., after agent generation)
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

  // UI State
  const [activeTab, setActiveTab] = useState('layout');
  const [canvasOnly, setCanvasOnly] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Auto-fit view when nodes/edges update so users immediately see results
  useEffect(() => {
    try {
      if ((nodes?.length || 0) > 0) {
        const t = setTimeout(() => {
          fitView({ padding: 0.2, includeHiddenNodes: true });
        }, 60);
        return () => clearTimeout(t);
      }
    } catch {}
  }, [nodes, edges, fitView]);

  const [showTestConsole, setShowTestConsole] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [showExecutionEngine, setShowExecutionEngine] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(true);

  // AI Assist state
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatAssistMode, setChatAssistMode] = useState<'build' | 'generate' | 'test' | 'deploy' | 'configure'>('configure');

  // Configuration State
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>(ConnectionMode.Loose);
  const [backgroundVariant, setBackgroundVariant] = useState<BackgroundVariant>(BackgroundVariant.Dots);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [dragMode, setDragMode] = useState<'pan' | 'select'>('select');
  const [showMinimap, setShowMinimap] = useState(true);
  const [nodesDraggable, setNodesDraggable] = useState(true);
  const [connectOnClick, setConnectOnClick] = useState(false);
  const [panOnScrollMode, setPanOnScrollMode] = useState<PanOnScrollMode>(PanOnScrollMode.Free);
  
// Workflow Design Panel State
const [showLayoutControls, setShowLayoutControls] = useState(false);
const [showNodeControls, setShowNodeControls] = useState(false);
const [showEdgeControls, setShowEdgeControls] = useState(false);

// Unified Configurator state
const [showConfigurator, setShowConfigurator] = useState(false);
const [configNodeInfo, setConfigNodeInfo] = useState<{ nodeId: string; nodeType: string; category: string; initialConfig?: any } | null>(null);

// Panel management - ensure only one panel is open at a time
const openConfigPanel = (nodeInfo: { nodeId: string; nodeType: string; category: string; initialConfig?: any }) => {
  // Close other panels
  setShowInsights(false);
  setChatModalOpen(false);
  // Open config panel
  setConfigNodeInfo(nodeInfo);
  setShowConfigurator(true);
};

const openChatPanel = () => {
  // Close other panels
  setShowInsights(false);
  setShowConfigurator(false);
  setConfigNodeInfo(null);
  // Open chat panel
  setChatModalOpen(true);
};

const openInsightsPanel = () => {
  // Close other panels
  setShowConfigurator(false);
  setConfigNodeInfo(null);
  setChatModalOpen(false);
  // Open insights panel
  setShowInsights(true);
};

  // References
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Hooks
  const { showSuccess, showError } = useMasterToast();
  const { categories, nodeTypesByCategory } = useWorkflowNodes();

  // Workflow Design Controls Event Handler
  useEffect(() => {
    const handleDesignNav = (e: CustomEvent) => {
      const { tab } = e.detail;
      setShowLayoutControls(tab === 'layout');
      setShowNodeControls(tab === 'nodes');
      setShowEdgeControls(tab === 'edges');
    };

    window.addEventListener('workflow-design-nav', handleDesignNav as EventListener);
    return () => window.removeEventListener('workflow-design-nav', handleDesignNav as EventListener);
  }, []);

  // Derived State
  const selectedNodes = useMemo(() => nodes.filter(n => n.selected), [nodes]);
  const validationIssues: any[] = useMemo(() => [], [nodes, edges]);

  // Safe Node and Edge Types
  const baseNodeTypes: NodeTypes = useMemo(() => ({
    custom: CustomNode,
    enhanced: (props) => <EnhancedWorkflowNode {...props} />,
    agent: (props) => <AgentNode {...props} />,
    ai: (props) => <AIIntelligenceNode {...props} />,
  }), []);

  const safeEdgeTypes: EdgeTypes = useMemo(() => ({}), []);

  // Helpers
  const getCleanNodeDisplay = (nodeData: any, typeKey: string) => {
    const raw = nodeData?.display_name || nodeData?.name || nodeData?.title || typeKey || 'Node';
    let clean = String(raw)
      // remove appended UUIDs like _37cb609d-c602-4cfe-a246-d808a857329b
      .replace(/[_-][0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g, '')
      // remove trailing 'node' token and extra separators
      .replace(/\b(node)\b$/i, '')
      .replace(/[_-]+/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
    // remove numeric timestamp suffixes like _1724681234567
    clean = clean.replace(/[_-](\d{10,})$/, '');
    // Title-case first letter
    if (clean.length) clean = clean.charAt(0).toUpperCase() + clean.slice(1);
    return clean;
  };

  const getCategoryName = (category: any): string => {
    if (!category) return 'general';
    if (typeof category === 'string') return category;
    return category.name || category.display_name || 'general';
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'ai-agents': return '#3b82f6';
      case 'integrations': return '#10b981';
      case 'data-processing': return '#8b5cf6';
      case 'communication': return '#f59e0b';
      case 'automation': return '#ef4444';
      case 'analytics': return '#06b6d4';
      default: return '#6b7280';
    }
  };

  const getToolsForCategory = (category: string): string[] => {
    switch (category) {
      case 'ai-agents':
        return ['OpenAI', 'Claude', 'Gemini', 'GPT-4', 'DALL-E'];
      case 'integrations':
        return ['REST API', 'GraphQL', 'Webhook', 'OAuth2', 'JWT'];
      case 'data-processing':
        return ['SQL', 'NoSQL', 'Redis', 'Elasticsearch', 'MongoDB'];
      case 'communication':
        return ['Email', 'SMS', 'Slack', 'Teams', 'WhatsApp'];
      case 'automation':
        return ['Scheduler', 'Trigger', 'Workflow', 'Lambda', 'CRON'];
      case 'analytics':
        return ['Metrics', 'Dashboard', 'Reports', 'Charts', 'KPIs'];
      default:
        return ['General', 'Custom', 'Basic'];
    }
  };

  const getModelsForCategory = (category: string): string[] => {
    switch (category) {
      case 'ai-agents':
        return ['gpt-4o-mini', 'claude-3.5-sonnet', 'gemini-2.0-flash', 'gpt-4o'];
      case 'integrations':
        return ['REST', 'GraphQL', 'SOAP', 'gRPC'];
      case 'data-processing':
        return ['SQL', 'Document', 'Key-Value', 'Graph'];
      case 'communication':
        return ['SMTP', 'HTTP', 'WebSocket', 'Push'];
      case 'automation':
        return ['Event', 'Schedule', 'Trigger', 'Condition'];
      case 'analytics':
        return ['Time Series', 'Aggregation', 'Reporting', 'Real-time'];
      default:
        return ['Standard'];
    }
  };

  // Event Handlers
  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleNodeSelect = useCallback((node: Node | null) => {
    setSelectedNode(node);
    onNodeSelect?.(node);
  }, [onNodeSelect]);

  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
    },
    [onNodesChange]
  );

  const onDrop = useCallback((event: React.DragEvent) => {
    // Allow dropping
    event.preventDefault();
    event.stopPropagation();

    // Try to get enhanced node data first (parse application/reactflow payload)
    let nodeData: any | undefined;
    try {
      const rfPayload = event.dataTransfer.getData('application/reactflow');
      if (rfPayload) nodeData = JSON.parse(rfPayload);
    } catch (err) {
      console.warn('[RF] Could not parse application/reactflow payload');
    }

    // Fallbacks: application/json, then text/plain if it looks like JSON
    if (!nodeData) {
      try {
        const enhancedData = event.dataTransfer.getData('application/json');
        if (enhancedData) nodeData = JSON.parse(enhancedData);
      } catch (error) {
        // ignore
      }
    }
    if (!nodeData) {
      const plain = event.dataTransfer.getData('text/plain');
      if (plain && plain.trim().startsWith('{')) {
        try { nodeData = JSON.parse(plain); } catch {}
      }
    }

    // Determine type with multiple fallbacks
    let type = nodeData?.type || nodeData?.type_key;
    if (!type) {
      const fallback = event.dataTransfer.getData('text/plain');
      if (fallback && !fallback.trim().startsWith('{')) type = fallback;
    }
    if (!type) {
      console.warn('[RF] Drop ignored: no node type in dataTransfer');
      return;
    }

    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    console.log('[RF] onDrop', { type, position, nodeData });

const cleanLabel = getCleanNodeDisplay(nodeData, type);
const categoryName = getCategoryName(nodeData?.category);
const color = nodeData?.color || getCategoryColor(categoryName);
const newNode = {
  id: `${type}_${Date.now()}`,
  type: 'enhanced',
  position,
  data: {
    label: cleanLabel,
    type_key: type,
    display_name: cleanLabel,
    description: nodeData?.description || '',
    icon: nodeData?.icon || 'settings',
    color,
    capabilities: nodeData?.capabilities || [],
    requirements: nodeData?.requirements || {},
    default_config: nodeData?.default_config || {},
    category: nodeData?.category,
    tools: getToolsForCategory(categoryName),
    models: getModelsForCategory(categoryName),
    aiAssistEnabled: true,
    supportedModes: ['build', 'generate', 'test', 'deploy', 'configure'],
    isWorkflowNode: true,
    shouldShowAssetSelector: true, // Show asset selector when dropped
    ...nodeData,
  },
} as Node;

setNodes((nds) => nds.concat(newNode));
setSelectedNode(newNode as any);
// Auto-open unified configurator on drop
setConfigNodeInfo({
  nodeId: newNode.id,
  nodeType: String((newNode.data as any)?.type_key || 'unknown'),
  category: String(((newNode.data as any)?.category && ((newNode.data as any).category.name || (newNode.data as any).category)) || 'general'),
});
// Do not auto-open any modal on drop; provide a gentle hint instead
try {
  showSuccess(`${cleanLabel} added`, 'Right-click the node for AI Assist or Configure options.');
} catch {}

// Optionally mark node as selected so users can see it
setSelectedNode(newNode as any);

  }, [screenToFlowPosition, setNodes, showSuccess]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    // required to allow drop
    event.dataTransfer.dropEffect = 'move';
    // debug
    if ((event as any).debugOnce !== true) {
      // lightweight log (won't spam due to flag)
      (event as any).debugOnce = true;
      console.log('[RF] onDragOver active');
    }
  }, []);

  const handleNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    event.stopPropagation();
    setContextEdge(null);
    setSelectedNode(node);
  }, []);

  const handleEdgeContextMenu = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedNode(null);
    setContextEdge(edge);
  }, []);

  const handlePaneContextMenu = useCallback((event: React.MouseEvent) => {
    // allow ContextMenuTrigger to handle default context menu
  }, []);

  // Open AI Assist chat for a node
  const openAIAssist = useCallback((nodeId: string, mode: 'build' | 'generate' | 'test' | 'deploy' | 'configure' = 'configure') => {
    const node = getNodes().find(n => n.id === nodeId) || null;
    if (node) setSelectedNode(node);
    setChatAssistMode(mode);
    openChatPanel();
  }, [getNodes]);

  const handleConfigurationUpdate = useCallback((nodeId: string, config: any) => {
    setNodes((nds) => nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, configuration: { ...(n.data as any)?.configuration, ...config }, isConfigured: true } } : n));
  }, [setNodes]);

  const handleOpenChat = useCallback((nodeId: string, mode: 'build' | 'generate' | 'test' | 'deploy' | 'configure' = 'configure') => {
    openAIAssist(nodeId, mode);
  }, [openAIAssist]);

  const handleConfigureNode = useCallback((nodeId: string, action: string) => {
    const node = getNodes().find(n => n.id === nodeId);
    if (!node) return;
    setSelectedNode(node);
    openConfigPanel({
      nodeId,
      nodeType: String((node.data as any)?.type_key || node.type || 'default'),
      category: String((((node.data as any)?.category && (((node.data as any).category as any).name)) || (node.data as any)?.category || 'general')),
      initialConfig: {
        tools: (node.data as any)?.tools || [],
        credentials: (node.data as any)?.credentials || [],
        variables: (node.data as any)?.variables || [],
      },
    });
  }, [getNodes]);

  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
  }, [setNodes, setEdges]);

  const handleDuplicateNode = useCallback((nodeId: string) => {
    const node = getNodes().find(n => n.id === nodeId);
    if (!node) return;
    const newId = `${nodeId}-copy-${Date.now()}`;
    const offset = { x: node.position.x + 40, y: node.position.y + 40 };
    const newNode: Node = { ...node, id: newId, position: offset, data: { ...(node.data as any), label: `${(node.data as any)?.label || 'Node'} (copy)` } } as Node;
    setNodes((nds) => nds.concat(newNode));
  }, [getNodes, setNodes]);

  const scanDuplicates = useCallback(async () => {
    try {
      const report = await performComprehensiveConsolidation();
      const duplicatesCount = Object.values((report as any)?.codebaseAnalysis?.duplicates || {}).reduce((sum: number, arr: string[]) => sum + ((arr && arr.length) || 0), 0);
      showSuccess('Duplicate scan complete', `${duplicatesCount} duplicates found. See console for details.`);
      console.log('[Consolidation Report]', report);
    } catch (e) {
      showError('Duplicate scan failed');
      console.error(e);
    }
  }, [showSuccess, showError]);

  const handleFitView = useCallback(() => {
    fitView({ padding: 0.1 });
  }, [fitView]);

  const handleClear = useCallback(() => {
    setNodes([]);
    setEdges([]);
  }, [setNodes, setEdges]);

  const addNode = useCallback((nodeType: string) => {
    const newNode = {
      id: `${nodeType}_${Date.now()}`,
      type: nodeType,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { label: `${nodeType} node` },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  // Click-to-add (mobile/touch friendly) enhanced node creation
  const addEnhancedNode = useCallback((nodeTypeObj: any) => {
    const type = nodeTypeObj?.type_key || nodeTypeObj?.name || 'node';
    // center of canvas
    const rect = reactFlowWrapper.current?.getBoundingClientRect();
    const center = rect
      ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      : { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const position = screenToFlowPosition(center);
    console.log('[RF] click-add', { type, position });
const cleanLabel = getCleanNodeDisplay(nodeTypeObj, type);
const categoryName = getCategoryName(nodeTypeObj?.category);
const color = nodeTypeObj?.color || getCategoryColor(categoryName);
const newNode: Node = {
  id: `${type}_${Date.now()}`,
  type: 'enhanced',
  position,
  data: {
    label: cleanLabel,
    type_key: type,
    display_name: cleanLabel,
    description: nodeTypeObj?.description || '',
    icon: nodeTypeObj?.icon || 'settings',
    color,
    capabilities: nodeTypeObj?.capabilities || [],
    requirements: nodeTypeObj?.requirements || {},
    default_config: nodeTypeObj?.default_config || {},
    category: nodeTypeObj?.category,
    tools: getToolsForCategory(categoryName),
    models: getModelsForCategory(categoryName),
    aiAssistEnabled: true,
    supportedModes: ['build', 'generate', 'test', 'deploy', 'configure'],
    isWorkflowNode: true,
    ...nodeTypeObj,
  },
} as Node;
    setNodes((nds) => nds.concat(newNode));
  }, [screenToFlowPosition, setNodes]);

  const addGroupNode = useCallback(() => {
    const newNode: Node = {
      id: `group_${Date.now()}`,
      type: 'group',
      position: { x: 100, y: 100 },
      data: {},
      style: { width: 200, height: 150, backgroundColor: 'rgba(255, 0, 0, 0.1)' },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const handleCodeChange = useCallback((code: string) => {
    console.log('Code changed:', code);
  }, []);

  // Edge actions from context menu
  const insertNodeBetween = useCallback(() => {
    if (!contextEdge) return;
    const nodesList = getNodes();
    const sourceNode = nodesList.find((n) => n.id === contextEdge.source);
    const targetNode = nodesList.find((n) => n.id === contextEdge.target);
    const pos = sourceNode && targetNode
      ? { x: (sourceNode.position.x + targetNode.position.x) / 2 + 20, y: (sourceNode.position.y + targetNode.position.y) / 2 + 20 }
      : screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

    const newNode: Node = {
      id: `enhanced_${Date.now()}`,
      type: 'enhanced',
      position: pos,
      data: {
        label: 'New Node',
        type_key: 'custom',
        display_name: 'New Node',
        icon: 'settings',
        color: '#6366f1',
        capabilities: [],
        requirements: {},
        default_config: {},
        isWorkflowNode: true,
      },
    } as Node;

    setNodes((nds) => nds.concat(newNode));
    setEdges((eds) => [
      ...eds.filter((e) => e.id !== contextEdge.id),
      {
        id: `${contextEdge.source}-${newNode.id}-${Date.now()}`,
        source: contextEdge.source,
        target: newNode.id,
        type: contextEdge.type,
        markerEnd: { type: MarkerType.ArrowClosed },
      },
      {
        id: `${newNode.id}-${contextEdge.target}-${Date.now()}`,
        source: newNode.id,
        target: contextEdge.target,
        type: contextEdge.type,
        markerEnd: { type: MarkerType.ArrowClosed },
      },
    ]);
    setContextEdge(null);
  }, [contextEdge, getNodes, setNodes, setEdges, screenToFlowPosition]);

  const deleteSelectedEdge = useCallback(() => {
    if (!contextEdge) return;
    setEdges((eds) => eds.filter((e) => e.id !== contextEdge.id));
    setContextEdge(null);
  }, [contextEdge, setEdges]);

  // Effects
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

useEffect(() => {
  const navHandler = (e: any) => {
    const tab = e?.detail?.tab as string;
    if (tab && ['layout','nodes','edges'].includes(tab)) {
      setActiveTab(tab);
    }
  };
  window.addEventListener('workflow-design-nav', navHandler as EventListener);
  return () => window.removeEventListener('workflow-design-nav', navHandler as EventListener);
}, []);

// Listen for global "open-node-config" to open the unified configurator
useEffect(() => {
  const openHandler = (e: any) => {
    const nodeId = e?.detail?.nodeId as string | undefined;
    if (!nodeId) return;
    const node = getNodes().find((n) => n.id === nodeId);
    if (!node) return;

    // Extract clean node name from node data
    const nodeData = node.data as any;
    const nodeName = nodeData?.name || nodeData?.label || nodeData?.title || node.type || 'Node';
    const cleanNodeName = String(nodeName).replace(/[^a-zA-Z0-9\s]/g, '').trim() || 'Node';

    openConfigPanel({
      nodeId: node.id,
      nodeType: cleanNodeName,
      category: String(((nodeData?.category && (((nodeData.category as any).name) || nodeData.category)) || 'general')),
      initialConfig: {
        tools: nodeData?.tools || [],
        credentials: nodeData?.credentials || [],
        variables: nodeData?.variables || [],
      },
    });
    try { window.dispatchEvent(new CustomEvent('inline-config-opened')); } catch {}
  };

  window.addEventListener('open-node-config', openHandler as EventListener);
  return () => window.removeEventListener('open-node-config', openHandler as EventListener);
}, [getNodes]);

// Listen for node testing events
useEffect(() => {
  const testHandler = (e: any) => {
    const { nodeId, nodeType } = e?.detail || {};
    if (!nodeId) return;
    
    // Open the testing console for the specific node
    setShowTestConsole(true);
    setSelectedNode(getNodes().find(n => n.id === nodeId) || null);
    console.log('Opening test interface for node:', nodeId, nodeType);
  };

  window.addEventListener('open-node-test', testHandler as EventListener);
  return () => window.removeEventListener('open-node-test', testHandler as EventListener);
}, [getNodes]);

  // Wrap base node types with right-click context menu
  const safeNodeTypes: NodeTypes = useMemo(() => {
    const wrap = (Original: any) => (props: any) => (
      <NodeContextMenu
        nodeId={props.id}
        nodeType={String(props.data?.type_key || props.type || 'default')}
        onConfigureNode={handleConfigureNode}
        onDeleteNode={handleDeleteNode}
        onDuplicateNode={handleDuplicateNode}
        onOpenChat={handleOpenChat}
      >
        <Original {...props} />
      </NodeContextMenu>
    );
    return {
      custom: wrap(baseNodeTypes.custom),
      enhanced: wrap(baseNodeTypes.enhanced),
      agent: wrap(baseNodeTypes.agent),
      ai: wrap(baseNodeTypes.ai),
    } as NodeTypes;
  }, [handleConfigureNode, handleDeleteNode, handleDuplicateNode, handleOpenChat, baseNodeTypes]);

  return (
    <div className="flex h-full w-full bg-background min-h-0" data-config-open={showConfigurator ? 'true' : 'false'}>
      {/* Unified Sidebar */}
      {!canvasOnly && (
        <div 
          className="w-72 min-w-64 h-full border-r bg-background flex flex-col min-h-0 overflow-y-auto pointer-events-auto z-10"
          onWheelCapture={(e) => e.stopPropagation()}
          onTouchMoveCapture={(e) => e.stopPropagation()}
          onScrollCapture={(e) => e.stopPropagation()}
          style={{ touchAction: 'pan-y' }}
        >
          <EnhancedNodePalette 
            heightClass="min-h-full"
            onNodeSelect={(nodeType) => {
              addEnhancedNode(nodeType);
            }}
            hideSearch={false}
          />
        </div>
      )}

      {/* Main Canvas Area */}
      <div className="flex-1 relative overflow-hidden">
        <div 
          ref={reactFlowWrapper} 
          className="w-full h-full"
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <ErrorBoundary fallbackComponent={({ error, retry }) => (
                <div className="p-4 text-center text-xs">
                  <div className="font-medium">ReactFlow failed to mount</div>
                  <div className="text-muted-foreground break-all max-w-md mx-auto">{error?.message}</div>
                  <Button size="sm" variant="outline" onClick={retry} className="mt-2">Retry</Button>
                </div>
              )}>
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={handleNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onNodeContextMenu={handleNodeContextMenu}
                  onEdgeContextMenu={handleEdgeContextMenu}
                  onPaneContextMenu={handlePaneContextMenu}
                  onNodeClick={(event, node) => {
                    setSelectedNode(node);
                    handleNodeSelect(node);
                  }}
                  onPaneClick={() => {
                    setSelectedNode(null);
                    setContextEdge(null);
                    handleNodeSelect(null);
                  }}
                  nodeTypes={safeNodeTypes}
                  edgeTypes={safeEdgeTypes}
                  connectionLineComponent={ConnectionLine}
                  connectionMode={connectionMode}
                  snapToGrid={snapToGrid}
                  snapGrid={[15, 15]}
                  fitView
                  fitViewOptions={{ padding: 0.1, includeHiddenNodes: true }}
                  attributionPosition="bottom-left"
                  // Enhanced scrolling and zooming
                  zoomOnScroll={true}
                  zoomOnDoubleClick={false}
                  zoomOnPinch={true}
                  panOnScroll={true}
                  panOnScrollMode={panOnScrollMode}
                  panOnDrag={dragMode === 'pan'}
                  preventScrolling={false}
                  nodesDraggable={nodesDraggable}
                  connectOnClick={connectOnClick}
                  nodesConnectable={true}
                
                  minZoom={0.05}
                  maxZoom={4}
                  defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                  selectionOnDrag={dragMode === 'select'}
                  multiSelectionKeyCode="Shift"
                  deleteKeyCode={["Delete", "Backspace"]}
                  // Allow infinite canvas expansion
                  translateExtent={[
                    [-5000, -5000],
                    [5000, 5000],
                  ]}
                  nodeExtent={[
                    [-4000, -4000],
                    [4000, 4000],
                  ]}
                  className="bg-gray-50"
                >
                  <Background variant={backgroundVariant} gap={12} size={1} />
                  <Controls 
                    showZoom={true}
                    showFitView={true}
                    showInteractive={true}
                  />
                  {showMiniMap && (
                    <MiniMap 
                      zoomable 
                      pannable 
                      className="!bg-gray-100 !border-gray-300"
                      nodeColor={(node) => {
                        switch (node.data?.type) {
                          case 'agent': return '#8b5cf6';
                          case 'decision': return '#f59e0b';
                          case 'customer': return '#10b981';
                          default: return '#6b7280';
                        }
                      }}
                    />
                  )}

                  {/* Workflow Design Panel - Enhanced to replace duplicate functionality */}
                  {(showLayoutControls || showNodeControls || showEdgeControls) && (
                    <Panel position="top-left" className="bg-white/95 backdrop-blur-md p-4 rounded-lg shadow-lg border min-w-80 max-w-96">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-sm flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            {showLayoutControls && 'Layout Controls'}
                            {showNodeControls && 'Node Controls'}
                            {showEdgeControls && 'Edge Controls'}
                          </h3>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => {
                              setShowLayoutControls(false);
                              setShowNodeControls(false);
                              setShowEdgeControls(false);
                            }}
                          >
                            ✕
                          </Button>
                        </div>
                        
                        <Separator />
                        
                        {showLayoutControls && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <label className="text-xs font-medium">Background Style</label>
                                <Select value={backgroundVariant} onValueChange={(value: any) => setBackgroundVariant(value)}>
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="dots">Dots</SelectItem>
                                    <SelectItem value="lines">Lines</SelectItem>
                                    <SelectItem value="cross">Cross</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="space-y-2">
                                <label className="text-xs font-medium">Pan Mode</label>
                                <Select value={panOnScrollMode} onValueChange={(value: any) => setPanOnScrollMode(value)}>
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="free">Free</SelectItem>
                                    <SelectItem value="vertical">Vertical</SelectItem>
                                    <SelectItem value="horizontal">Horizontal</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-medium">Snap to Grid</label>
                                <Switch 
                                  checked={snapToGrid} 
                                  onCheckedChange={setSnapToGrid}
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-medium">Show Minimap</label>
                                <Switch 
                                  checked={showMinimap} 
                                  onCheckedChange={setShowMinimap}
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-medium">Node Drag</label>
                                <Switch 
                                  checked={nodesDraggable} 
                                  onCheckedChange={setNodesDraggable}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {showNodeControls && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                              <Button size="sm" onClick={handleFitView} className="text-xs">
                                <Eye className="h-3 w-3 mr-1" />
                                Fit View
                              </Button>
                              <Button size="sm" onClick={addGroupNode} className="text-xs">
                                <Plus className="h-3 w-3 mr-1" />
                                Add Group
                              </Button>
                              <Button size="sm" onClick={() => setNodes([])} variant="outline" className="text-xs">
                                <Trash2 className="h-3 w-3 mr-1" />
                                Clear All
                              </Button>
                              <Button size="sm" onClick={handleFitView} variant="outline" className="text-xs">
                                <Layout className="h-3 w-3 mr-1" />
                                Auto Layout
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {showEdgeControls && (
                          <div className="space-y-4">
                            <div className="space-y-3">
                              <div className="space-y-2">
                                <label className="text-xs font-medium">Connection Mode</label>
                                <Select value={connectionMode} onValueChange={(value: any) => setConnectionMode(value)}>
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="strict">Strict</SelectItem>
                                    <SelectItem value="loose">Loose</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-medium">Connect on Click</label>
                                <Switch 
                                  checked={connectOnClick} 
                                  onCheckedChange={setConnectOnClick}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </Panel>
                  )}

                  {/* Canvas Controls Panel */}
                  <Panel position="top-right" className="bg-white/90 backdrop-blur-md p-2 rounded-lg shadow border">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (document.fullscreenElement) {
                            document.exitFullscreen();
                            setCanvasOnly(false);
                          } else {
                            reactFlowWrapper.current?.requestFullscreen();
                            setCanvasOnly(true);
                          }
                        }}
                      >
                        <Maximize2 className="h-4 w-4 mr-1" />
                        {isFullscreen ? 'Exit' : 'Fullscreen'}
                      </Button>
                      <Button
                        size="sm"
                        variant={canvasOnly && !isFullscreen ? 'default' : 'outline'}
                        onClick={() => setCanvasOnly(!canvasOnly)}
                      >
                        Canvas Only
                      </Button>
                    </div>
                  </Panel>
                  
                  {/* Status Panel - Bottom Right */}
                  <Panel position="bottom-right" className="bg-white/90 backdrop-blur-md p-3 rounded-lg shadow border">
                    <div className="space-y-1 text-xs">
                      <div className="font-medium">Status</div>
                      <div>Nodes: {nodes.length}</div>
                      <div>Edges: {edges.length}</div>
                      <div className="flex items-center gap-1">
                        <Badge variant={validationIssues.length === 0 ? "default" : "destructive"} className="text-xs">
                          {validationIssues.length === 0 ? "Valid" : `${validationIssues.length} Issues`}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant={sessionId ? "default" : "secondary"} className="text-xs">
                          {sessionId ? "Connected" : "Local"}
                        </Badge>
                      </div>
                    </div>
                  </Panel>
                </ReactFlow>
              </ErrorBoundary>
            </ContextMenuTrigger>
            
            {/* Tool Creator Dialog */}
            <ToolCreator />
            
            <ContextMenuContent>
              {contextEdge && (
                <>
                  <ContextMenuItem onClick={insertNodeBetween}>Insert Node Between</ContextMenuItem>
                  <ContextMenuItem onClick={deleteSelectedEdge}>Delete Connection</ContextMenuItem>
                  <Separator />
                </>
              )}

              {selectedNode && (
                <>
                  <ContextMenuItem onClick={() => window.dispatchEvent(new CustomEvent('open-node-config', { detail: { nodeId: selectedNode.id } }))}>
                    Configure Node
                  </ContextMenuItem>
                  <ContextMenuSub>
                    <ContextMenuSubTrigger>AI Assist Modes</ContextMenuSubTrigger>
                    <ContextMenuSubContent>
                      <ContextMenuItem onClick={() => openAIAssist(selectedNode.id, 'build')}>Build</ContextMenuItem>
                      <ContextMenuItem onClick={() => openAIAssist(selectedNode.id, 'generate')}>Generate</ContextMenuItem>
                      <ContextMenuItem onClick={() => openAIAssist(selectedNode.id, 'test')}>Test</ContextMenuItem>
                      <ContextMenuItem onClick={() => openAIAssist(selectedNode.id, 'deploy')}>Deploy</ContextMenuItem>
                      <ContextMenuItem onClick={() => openAIAssist(selectedNode.id, 'configure')}>Configure</ContextMenuItem>
                    </ContextMenuSubContent>
                  </ContextMenuSub>
                  <ContextMenuSub>
                    <ContextMenuSubTrigger>Connector Positions</ContextMenuSubTrigger>
                    <ContextMenuSubContent>
                      <ContextMenuItem onClick={() => window.dispatchEvent(new CustomEvent('update-node', { detail: { nodeId: selectedNode.id, updates: { inputPosition: 'left' } } }))}>Input: Left</ContextMenuItem>
                      <ContextMenuItem onClick={() => window.dispatchEvent(new CustomEvent('update-node', { detail: { nodeId: selectedNode.id, updates: { inputPosition: 'right' } } }))}>Input: Right</ContextMenuItem>
                      <ContextMenuItem onClick={() => window.dispatchEvent(new CustomEvent('update-node', { detail: { nodeId: selectedNode.id, updates: { inputPosition: 'top' } } }))}>Input: Top</ContextMenuItem>
                      <ContextMenuItem onClick={() => window.dispatchEvent(new CustomEvent('update-node', { detail: { nodeId: selectedNode.id, updates: { inputPosition: 'bottom' } } }))}>Input: Bottom</ContextMenuItem>
                      <Separator />
                      <ContextMenuItem onClick={() => window.dispatchEvent(new CustomEvent('update-node', { detail: { nodeId: selectedNode.id, updates: { outputPosition: 'left' } } }))}>Output: Left</ContextMenuItem>
                      <ContextMenuItem onClick={() => window.dispatchEvent(new CustomEvent('update-node', { detail: { nodeId: selectedNode.id, updates: { outputPosition: 'right' } } }))}>Output: Right</ContextMenuItem>
                      <ContextMenuItem onClick={() => window.dispatchEvent(new CustomEvent('update-node', { detail: { nodeId: selectedNode.id, updates: { outputPosition: 'top' } } }))}>Output: Top</ContextMenuItem>
                      <ContextMenuItem onClick={() => window.dispatchEvent(new CustomEvent('update-node', { detail: { nodeId: selectedNode.id, updates: { outputPosition: 'bottom' } } }))}>Output: Bottom</ContextMenuItem>
                    </ContextMenuSubContent>
                  </ContextMenuSub>
                  <ContextMenuItem onClick={() => window.dispatchEvent(new CustomEvent('duplicate-node', { detail: { nodeId: selectedNode.id } }))}>
                    Duplicate Node
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => window.dispatchEvent(new CustomEvent('delete-node', { detail: { nodeId: selectedNode.id } }))}>
                    Delete Node
                  </ContextMenuItem>
                  <Separator />
                </>
              )}

              <ContextMenuSub>
                <ContextMenuSubTrigger>Add Node</ContextMenuSubTrigger>
                <ContextMenuSubContent>
                  {(categories || []).map((cat) => (
                    <ContextMenuSub key={cat.id}>
                      <ContextMenuSubTrigger>{cat.display_name || cat.name}</ContextMenuSubTrigger>
                      <ContextMenuSubContent>
                        {((nodeTypesByCategory && nodeTypesByCategory[cat.name]) || []).map((nt) => (
                          <ContextMenuItem key={nt.id} onClick={() => addEnhancedNode(nt)}>
                            {nt.display_name || nt.type_key}
                          </ContextMenuItem>
                        ))}
                      </ContextMenuSubContent>
                    </ContextMenuSub>
                  ))}
                </ContextMenuSubContent>
              </ContextMenuSub>

              <Separator />
              <ContextMenuItem onClick={scanDuplicates}>Scan for Duplicates</ContextMenuItem>
              <Separator />
              <ContextMenuItem onClick={handleFitView}>Fit View</ContextMenuItem>
              <ContextMenuItem onClick={handleClear}>Clear All</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </div>
      </div>

      {/* Overlay Panels */}
      {showTestConsole && (
        <div className="fixed top-0 right-0 h-full w-[min(480px,100vw)] z-40 border-l bg-background shadow-lg">
          <TestingConsolePanel 
            isVisible={showTestConsole}
            onToggle={() => setShowTestConsole(false)}
            sessionId={sessionId}
            selectedNode={selectedNodes[0]}
            workflowNodes={nodes}
            workflowEdges={edges}
            heightClass="h-full"
          />
        </div>
      )}
      
      {showCodeEditor && (
        <div className="fixed top-0 right-0 w-96 h-full border-l bg-background z-40">
          <CodeEditorPanel 
            isVisible={showCodeEditor}
            onToggle={() => setShowCodeEditor(false)}
            selectedNode={selectedNodes[0]}
            onCodeChange={handleCodeChange}
            sessionId={sessionId}
          />
        </div>
      )}
      
      {showExecutionEngine && (
        <div className="fixed top-20 left-4 w-80 h-[calc(100vh-120px)] border bg-background rounded-lg shadow-lg z-40">
          <RealTimeExecutionEngine 
            nodes={nodes}
            edges={edges}
            sessionId={sessionId}
            isVisible={showExecutionEngine}
          />
        </div>
      )}

      {showInsights && (
        <div className="fixed top-20 right-4 w-80 h-[calc(100vh-120px)] border bg-background rounded-lg shadow-lg z-40">
          <Card className="h-full">
            <CardHeader className="p-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Activity className="h-4 w-4" />
                  Analytics & Insights
                </CardTitle>
                <Button size="sm" variant="ghost" onClick={() => {
                  setShowInsights(false);
                  setShowConfigurator(false);
                  setConfigNodeInfo(null);
                  setChatModalOpen(false);
                }}>
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Workflow Stats</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-muted p-2 rounded">
                      <div className="font-medium">{nodes.length}</div>
                      <div className="text-muted-foreground">Nodes</div>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <div className="font-medium">{edges.length}</div>
                      <div className="text-muted-foreground">Connections</div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Selected Node</h4>
                  {selectedNodes.length > 0 ? (
                    <div className="text-xs space-y-1">
                      <div><strong>ID:</strong> {selectedNodes[0].id}</div>
                      <div><strong>Type:</strong> {selectedNodes[0].type || 'default'}</div>
                      <div><strong>Label:</strong> {String(selectedNodes[0].data?.label || 'No label')}</div>
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground">No node selected</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Node Chat Interface */}
      {selectedNode && (
        <NodeChatInterface
          isOpen={chatModalOpen}
          onClose={() => {
            setChatModalOpen(false);
            setShowConfigurator(false);
            setConfigNodeInfo(null);
            setShowInsights(false);
          }}
          nodeId={selectedNode.id}
          nodeType={String((selectedNode.data as any)?.type_key || selectedNode.type || 'default')}
          currentConfig={(selectedNode.data as any)?.configuration || {}}
          onConfigurationUpdate={handleConfigurationUpdate}
          assistMode={chatAssistMode}
        />
      )}

      {/* Node Update Handler */}
      <NodeUpdateHandler 
        sessionId={sessionId}
        onNodeUpdate={(nodeId, updates) => {
          console.log('Node updated:', nodeId, updates);
        }}
        onNodeDelete={(nodeId) => {
          console.log('Node deleted:', nodeId);
        }}
      />

      {/* Session Persistence Manager */}
      <SessionPersistenceManager 
        sessionId={sessionId}
        onSessionRestore={(sessionData) => {
          const currentNodes = getNodes();
          const currentEdges = getEdges();
          if (sessionData?.canvas?.nodes && currentNodes.length === 0) {
            setNodes(sessionData.canvas.nodes);
          }
          if (sessionData?.canvas?.edges && currentEdges.length === 0) {
            setEdges(sessionData.canvas.edges);
          }
        }}
        onSessionSync={(sessionData) => {
          console.log('Session synced:', sessionData);
        }}
      />

      {/* Global Right Panel Configurator */}
      {configNodeInfo && (
        <div className="fixed top-0 right-0 h-full w-[min(520px,100vw)] z-40 border-l bg-background shadow-lg flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm">Configure Node</h3>
              <p className="text-xs text-muted-foreground">
                {(() => { 
                  const n = getNodes().find(n => n.id === configNodeInfo.nodeId); 
                  const d = (n?.data as any) || {}; 
                  return d.display_name || d.name || d.label || (n?.type ? String(n.type).replace(/_/g, ' ') : '') || 'Node'; 
                })()}
              </p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => {
              setShowConfigurator(false);
              setConfigNodeInfo(null);
              setShowInsights(false);
              setChatModalOpen(false);
            }}>
              ✕
            </Button>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <Suspense fallback={<div className="p-4 text-sm">Loading configurator…</div>}>
              <LazySmartNodeConfigurator
                node={getNodes().find(n => n.id === configNodeInfo.nodeId) || null}
                onNodeUpdate={(nodeId, updates) => {
                  setNodes((nds) => nds.map((n) =>
                    n.id === nodeId ? { 
                      ...n, 
                      data: { 
                        ...n.data, 
                        ...updates,
                        isConfigured: true,
                        configuration: { ...(n.data as any)?.configuration, ...updates },
                        lastConfigured: new Date().toISOString()
                      } 
                    } : n
                  ));
                }}
                onClose={() => {
                  setShowConfigurator(false);
                  setConfigNodeInfo(null);
                  setShowInsights(false);
                  setChatModalOpen(false);
                }}
              />
            </Suspense>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes dashdraw {
          to {
            stroke-dashoffset: -10;
          }
        }
        
        .animated {
          animation: dashdraw 0.5s linear infinite;
        }
        
        .react-flow__edge.selected {
          stroke: #ff0073 !important;
        }
        
        .react-flow__node.selected {
          border-color: #ff0073 !important;
          box-shadow: 0 0 0 2px #ff0073 !important;
        }
        `
      }} />
    </div>
  );
};

// Always provide a ReactFlowProvider to satisfy hooks used above
export const AdvancedReactFlowWrapper: React.FC<AdvancedReactFlowWrapperProps> = (props) => {
  return (
    <ReactFlowProvider>
      <AdvancedReactFlowContent {...props} />
    </ReactFlowProvider>
  );
};

// Export AdvancedReactFlow for backward compatibility  
export const AdvancedReactFlow = AdvancedReactFlowWrapper;