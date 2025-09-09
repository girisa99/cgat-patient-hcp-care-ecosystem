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

// Layout algorithms
import dagre from 'dagre';
import ELK from 'elkjs/lib/elk.bundled.js';

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

// Icons
import { 
  Play, Pause, RotateCcw, Save, Download, Upload, Eye, Plus, Trash2, 
  Settings, Zap, Bot, Users, AlertTriangle, Database, GitBranch,
  Layout, Grid, Layers, Move, RotateCw, Maximize2, Copy, Edit,
  Target, Link, Workflow, Activity, MousePointer, Hand, Square
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

// Node Components
import { EnhancedWorkflowNode } from './nodes/EnhancedWorkflowNode';
import { AgentNode } from './nodes/AgentNode';
import { AIIntelligenceNode } from './nodes/AIIntelligenceNode';
import { EnhancedNodePalette } from './EnhancedNodePalette';
import { NodeContextMenu } from './NodeContextMenu';
import { TestingConsolePanel } from './TestingConsolePanel';
import { AIAssistIntegration } from '../unified-workflow/AIAssistIntegration';
import { TemplateGallery } from '../unified-workflow/TemplateGallery';
import { DynamicNodeConfiguration } from '../unified-workflow/DynamicNodeConfiguration';

const LazySmartNodeConfigurator = lazy(() => import('./SmartNodeConfigurator').then(m => ({ default: m.SmartNodeConfigurator })));

// Enhanced Props Interface
export interface ConsolidatedAdvancedReactFlowProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  workflowType?: 'visual' | 'agent' | 'template';
  onSave?: (workflow: { nodes: Node[]; edges: Edge[] }) => void;
  onLayoutChange?: (layoutType: string) => void;
  onNodeSelect?: (node: Node | null) => void;
  sessionId?: string;
  className?: string;
  fitParent?: boolean;
  // Unified experience props
  onWorkflowUpdate?: (nodes: any[], edges: any[]) => void;
  onNodeAdd?: (node: any) => void;
  onNodeTest?: (nodeId: string, result: any) => void;
  onNodeConfigSave?: (nodes: any[], edges: any[]) => void;
  isAIHealthy?: boolean;
  embedded?: boolean;
  // Legacy props for backward compatibility
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

// Connection Line Component
const ConnectionLine = ({ fromX, fromY, toX, toY }: any) => (
  <g>
    <path
      fill="none"
      stroke="#222"
      strokeWidth={1.5}
      className="animated"
      d={`M${fromX},${fromY} C ${fromX} ${toY} ${fromX} ${toY} ${toX},${toY}`}
    />
    <circle cx={toX} cy={toY} fill="#fff" r={3} stroke="#222" strokeWidth={1.5} />
  </g>
);

const ConsolidatedAdvancedReactFlowContent: React.FC<ConsolidatedAdvancedReactFlowProps> = ({
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

  // Unified Experience State
  const [selectedMode, setSelectedMode] = useState<'prompt' | 'visual' | 'template'>('visual');
  const [activeStep, setActiveStep] = useState<'scenario' | 'design' | 'configure' | 'test' | 'deploy'>('design');
  const [showAIAssist, setShowAIAssist] = useState(false);
  const [aiAssistMode, setAIAssistMode] = useState<'build' | 'generate' | 'test' | 'deploy' | 'configure'>('build');
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [showDynamicConfig, setShowDynamicConfig] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [connectorIntelligence, setConnectorIntelligence] = useState(true);
  const [processFlowVisualizer, setProcessFlowVisualizer] = useState(true);

  // UI State
  const [canvasOnly, setCanvasOnly] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [showTestConsole, setShowTestConsole] = useState(false);
  const [showExecutionEngine, setShowExecutionEngine] = useState(false);
  const [showInsights, setShowInsights] = useState(false);

  // Configuration State
  const [showConfigurator, setShowConfigurator] = useState(false);
  const [configNodeInfo, setConfigNodeInfo] = useState<{ nodeId: string; nodeType: string; category: string; initialConfig?: any } | null>(null);
  const [chatModalOpen, setChatModalOpen] = useState(false);

  // Layout and Interaction State
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [connectionMode, setConnectionMode] = useState(ConnectionMode.Loose);
  const [dragMode, setDragMode] = useState<'select' | 'pan'>('select');
  const [backgroundVariant, setBackgroundVariant] = useState<BackgroundVariant>(BackgroundVariant.Dots);
  const [panOnScrollMode, setPanOnScrollMode] = useState(PanOnScrollMode.Free);
  const [nodesDraggable, setNodesDraggable] = useState(true);
  const [connectOnClick, setConnectOnClick] = useState(false);

  // References and Hooks
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { showSuccess, showError } = useMasterToast();
  const { categories, nodeTypesByCategory } = useWorkflowNodes();

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

  // Enhanced edge context menu with delete/swap
  const handleEdgeContextMenu = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.preventDefault();
    if (event.shiftKey) {
      // Shift + right-click swaps direction
      setEdges((eds) =>
        eds.map((e) => (e.id === edge.id ? { ...e, source: edge.target, target: edge.source } : e))
      );
      showSuccess('Connector direction swapped');
    } else {
      // Default right-click deletes connector
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
      showSuccess('Connector deleted');
    }
    setSelectedNode(null);
    setContextEdge(edge);
  }, [setEdges, showSuccess]);

  const handleNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    setContextEdge(null);
    setSelectedNode(node);
  }, []);

  // Enhanced connector intelligence - detects compatible node types
  const getConnectorIntelligence = useCallback((sourceNodeType: string, targetNodeType: string) => {
    const compatibilityMatrix: Record<string, string[]> = {
      'agent': ['action', 'condition', 'multi-agent', 'end'],
      'multi-agent': ['condition', 'action', 'agent', 'end'], 
      'action': ['condition', 'agent', 'end'],
      'condition': ['agent', 'action', 'multi-agent'],
      'start': ['agent', 'multi-agent', 'action'],
      'api': ['agent', 'action', 'condition'],
      'database': ['agent', 'action']
    };
    
    const sourceCompatible = compatibilityMatrix[sourceNodeType] || [];
    return sourceCompatible.includes(targetNodeType);
  }, []);

  const handlePaneContextMenu = useCallback((event: React.MouseEvent) => {
    // Allow ContextMenuTrigger to handle default context menu
  }, []);

  const handleNodeSelect = useCallback((node: Node | null) => {
    setSelectedNode(node);
    onNodeSelect?.(node);
  }, [onNodeSelect]);

  // Drag and Drop Support
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
    if (!reactFlowBounds) return;

    const type = event.dataTransfer.getData('application/reactflow');
    const nodeData = event.dataTransfer.getData('application/nodedata');

    if (typeof type === 'undefined' || !type) return;

    const position = screenToFlowPosition({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });

    let parsedNodeData;
    try {
      parsedNodeData = nodeData ? JSON.parse(nodeData) : {};
    } catch {
      parsedNodeData = {};
    }

    const newNode = {
      id: `${type}-${Date.now()}`,
      type: type === 'enhanced' ? 'enhanced' : type,
      position,
      data: {
        label: parsedNodeData.label || `${type} node`,
        type_key: parsedNodeData.type_key || type,
        category: parsedNodeData.category || 'general',
        ...parsedNodeData,
      },
    } as Node;

    setNodes((nds) => nds.concat(newNode));
    setSelectedNode(newNode as any);
    
    // Auto-open configurator for complex nodes
    if (type === 'enhanced' || type === 'multi-agent') {
      setConfigNodeInfo({
        nodeId: newNode.id,
        nodeType: String(parsedNodeData.type_key || type),
        category: String(parsedNodeData.category || 'general'),
      });
    }

    onNodeAdd?.(newNode);
  }, [setNodes, screenToFlowPosition, onNodeAdd]);

  // Node Management Functions
  const handleConfigureNode = useCallback((nodeId: string, action: string) => {
    // Updated to match interface - action represents the configuration type
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

  const handleOpenChat = useCallback((nodeId: string, mode?: 'build' | 'generate' | 'test' | 'deploy' | 'configure') => {
    setSelectedNode(getNodes().find((n) => n.id === nodeId) || null);
    setAIAssistMode(mode || 'configure');
    setChatModalOpen(true);
  }, [getNodes]);

  // AI Assistant Functions
  const handleAIAssistOpen = useCallback((mode: 'build' | 'generate' | 'test' | 'deploy' | 'configure') => {
    setAIAssistMode(mode);
    setShowAIAssist(true);
  }, []);

  // Template Functions
  const handleTemplateLoad = useCallback((template: any) => {
    if (template.nodes) setNodes(template.nodes);
    if (template.edges) setEdges(template.edges);
    setShowTemplateGallery(false);
    showSuccess('Template loaded');
  }, [setNodes, setEdges, showSuccess]);

  // Layout Functions
  const applyDagreLayout = useCallback(() => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: 'TB' });

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: 172, height: 36 });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - 86,
          y: nodeWithPosition.y - 18,
        },
      };
    });

    setNodes(layoutedNodes);
    showSuccess('Dagre layout applied');
  }, [nodes, edges, setNodes, showSuccess]);

  // Wrap base node types with context menu
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
      'multi-agent': wrap(baseNodeTypes['multi-agent']),
    } as NodeTypes;
  }, [handleConfigureNode, handleDeleteNode, handleDuplicateNode, handleOpenChat, baseNodeTypes]);

  // Derived state
  const selectedNodes = useMemo(() => nodes.filter(n => n.selected), [nodes]);
  const validationIssues: any[] = useMemo(() => [], [nodes, edges]);

  // Sync changes with parent
  useEffect(() => {
    onWorkflowUpdate?.(nodes, edges);
  }, [nodes, edges, onWorkflowUpdate]);

  // Save function
  const handleSave = useCallback(() => {
    const workflow = { nodes, edges };
    onSave?.(workflow);
    onNodeConfigSave?.(nodes, edges);
    showSuccess('Workflow saved');
  }, [nodes, edges, onSave, onNodeConfigSave, showSuccess]);

  return (
    <div className="flex h-full w-full bg-background min-h-0" data-config-open={showConfigurator ? 'true' : 'false'}>
      {/* Enhanced Node Palette Sidebar */}
      {!canvasOnly && !embedded && (
        <div className="w-72 min-w-64 h-full border-r bg-background flex flex-col min-h-0 overflow-y-auto pointer-events-auto z-10">
          <EnhancedNodePalette 
            heightClass="min-h-full"
            onNodeSelect={(nodeType) => {
              // This will be handled by drag and drop
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
                  onEdgesChange={handleEdgesChange}
                  onConnect={onConnect}
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
                  zoomOnScroll={true}
                  zoomOnDoubleClick={false}
                  zoomOnPinch={true}
                  panOnScroll={true}
                  panOnScrollMode={panOnScrollMode}
                  panOnDrag={dragMode === 'pan'}
                  preventScrolling={true}
                  nodesDraggable={nodesDraggable}
                  connectOnClick={connectOnClick}
                  nodesConnectable={true}
                  minZoom={0.05}
                  maxZoom={4}
                  defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                  selectionOnDrag={dragMode === 'select'}
                  multiSelectionKeyCode="Shift"
                  deleteKeyCode={["Delete", "Backspace"]}
                  translateExtent={[[-5000, -5000], [5000, 5000]]}
                  nodeExtent={[[-4000, -4000], [4000, 4000]]}
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
                          case 'multi-agent': return '#a855f7';
                          case 'decision': return '#f59e0b';
                          case 'customer': return '#10b981';
                          default: return '#6b7280';
                        }
                      }}
                    />
                  )}

                  {/* Enhanced Step Navigation */}
                  <Panel position="top-left">
                    <div className="bg-white/95 backdrop-blur border rounded-lg p-3 shadow-lg">
                      <div className="flex items-center gap-2">
                        <Button
                          variant={activeStep === 'scenario' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setActiveStep('scenario')}
                        >
                          Scenario
                        </Button>
                        <Button
                          variant={activeStep === 'design' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setActiveStep('design')}
                        >
                          Design
                        </Button>
                        <Button
                          variant={activeStep === 'configure' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setActiveStep('configure')}
                        >
                          Configure
                        </Button>
                        <Button
                          variant={activeStep === 'test' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setActiveStep('test')}
                        >
                          Test
                        </Button>
                        <Button
                          variant={activeStep === 'deploy' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setActiveStep('deploy')}
                        >
                          Deploy
                        </Button>
                      </div>
                    </div>
                  </Panel>

                  {/* AI Assist Toolbar - Right Side */}
                  <Panel position="top-right" className="mt-16">
                    <div className="flex flex-col gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const prompt = window.prompt('Describe the workflow to generate:');
                          if (prompt) {
                            showSuccess('AI generation started...');
                            const inferredAgents = extractMultiAgentPatterns(prompt);
                            if (inferredAgents.length > 1) {
                              const multiAgentNode = {
                                id: `multi-agent-${Date.now()}`,
                                type: 'multi-agent',
                                position: { x: Math.random() * 400, y: Math.random() * 300 },
                                data: { 
                                  label: 'AI Generated Team',
                                  agents: inferredAgents.map(name => ({ name })),
                                  description: prompt
                                }
                              };
                              setNodes(nds => [...nds, multiAgentNode]);
                              showSuccess(`Generated multi-agent team with ${inferredAgents.length} agents`);
                            }
                          }
                        }}
                        title="AI Generate"
                      >
                        <Bot className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleAIAssistOpen('test')}
                        title="AI Test"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant={isTestMode ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setIsTestMode(!isTestMode)}
                        title="Test Mode"
                      >
                        <Zap className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowTemplateGallery(true)}
                        title="Templates"
                      >
                        <Layout className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setShowConfigurator(true);
                          setConfigNodeInfo({
                            nodeId: selectedNode?.id || 'config',
                            nodeType: 'enhanced',
                            category: 'configuration'
                          });
                        }}
                        title="Configure"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleSave}
                        title="Save"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    </div>
                  </Panel>

                  {/* Enhanced Canvas Controls */}
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
                            document.documentElement.requestFullscreen();
                            setCanvasOnly(true);
                          }
                        }}
                      >
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={canvasOnly ? 'default' : 'outline'}
                        onClick={() => setCanvasOnly(!canvasOnly)}
                      >
                        Canvas Only
                      </Button>
                    </div>
                  </Panel>

                  {/* Enhanced Status Panel */}
                  <Panel position="bottom-right" className="bg-white/90 backdrop-blur-md p-3 rounded-lg shadow border">
                    <div className="space-y-1 text-xs">
                      <div className="font-medium">Status</div>
                      <div>Nodes: {nodes.length}</div>
                      <div>Edges: {edges.length}</div>
                      <div>Teams: {nodes.filter(n => n.type === 'multi-agent').length}</div>
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
            
            {/* Enhanced Context Menu with Full CRUD */}
            <ContextMenuContent>
              <ContextMenuItem onClick={() => fitView()}>Fit View</ContextMenuItem>
              <ContextMenuItem onClick={applyDagreLayout}>Auto Layout</ContextMenuItem>
              <Separator />
              <ContextMenuItem onClick={() => setShowTemplateGallery(true)}>Load Template</ContextMenuItem>
              <ContextMenuItem onClick={handleSave}>Save Workflow</ContextMenuItem>
              <Separator />
              <ContextMenuItem onClick={() => handleAIAssistOpen('generate')}>AI Generate</ContextMenuItem>
              <ContextMenuItem onClick={() => setIsTestMode(!isTestMode)}>
                {isTestMode ? 'Exit Test Mode' : 'Enter Test Mode'}
              </ContextMenuItem>
              <Separator />
              <ContextMenuItem onClick={() => setConnectorIntelligence(!connectorIntelligence)}>
                Toggle Connector Intelligence
              </ContextMenuItem>
              <ContextMenuItem onClick={() => setProcessFlowVisualizer(!processFlowVisualizer)}>
                Toggle Flow Animations
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </div>
      </div>

      {/* AI Assistant Integration */}
      {showAIAssist && (
        <AIAssistIntegration
          isOpen={showAIAssist}
          onClose={() => setShowAIAssist(false)}
          initialPrompt=""
          selectedNodeId={selectedNode?.id}
          onWorkflowGenerated={(workflow) => {
            if (workflow.nodes) setNodes(workflow.nodes);
            if (workflow.edges) setEdges(workflow.edges);
            showSuccess('Workflow generated by AI');
          }}
          onNodeGenerated={(node) => {
            setNodes(nds => [...nds, node]);
            onNodeAdd?.(node);
          }}
        />
      )}

      {/* Template Gallery */}
      {showTemplateGallery && (
        <TemplateGallery
          isOpen={showTemplateGallery}
          onClose={() => setShowTemplateGallery(false)}
          onTemplateSelect={handleTemplateLoad}
        />
      )}

      {/* Dynamic Configuration Panel */}
      {showDynamicConfig && configNodeInfo && (
        <DynamicNodeConfiguration
          nodeType={configNodeInfo.nodeType}
          configuration={selectedNode?.data || {}}
          onChange={(config) => {
            setNodes((nds) => nds.map((n) =>
              n.id === configNodeInfo.nodeId ? { ...n, data: { ...n.data, ...config } } : n
            ));
          }}
          onSave={() => {
            onNodeConfigSave?.(nodes, edges);
            setShowDynamicConfig(false);
            showSuccess('Node configured');
          }}
          onCancel={() => setShowDynamicConfig(false)}
        />
      )}

      {/* Test Mode Overlay with Enhanced Features */}
      {isTestMode && (
        <div className="absolute inset-0 pointer-events-none z-20">
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
            <Alert className="bg-yellow-50 border-yellow-200">
              <Activity className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center gap-4">
                  <span>Test Mode Active - Click nodes to test execution</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-xs">
                      Intelligence: ON
                    </Badge>
                    <Badge variant="default" className="text-xs">
                      Animations: ON
                    </Badge>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setIsTestMode(false)}
                  >
                    Exit Test Mode
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}

      {/* Testing Console */}
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

      {/* Smart Configurator */}
      {showConfigurator && configNodeInfo && (
        <div className="fixed top-20 right-4 w-96 max-h-[calc(100vh-120px)] border bg-background rounded-lg shadow-lg z-40">
          <div className="p-3 border-b flex items-center justify-between">
            <h3 className="font-semibold text-sm">
              Configure Node
            </h3>
            <Button size="sm" variant="ghost" onClick={() => {
              setShowConfigurator(false);
              setConfigNodeInfo(null);
            }}>
              ✕
            </Button>
          </div>
          <div className="h-full max-h-[calc(100vh-200px)] overflow-y-auto">
            <Suspense fallback={<div className="p-4 text-sm">Loading configurator...</div>}>
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
                  onNodeConfigSave?.(nodes, edges);
                }}
                onClose={() => {
                  setShowConfigurator(false);
                  setConfigNodeInfo(null);
                }}
              />
            </Suspense>
          </div>
        </div>
      )}

      {/* Styling */}
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
export const ConsolidatedAdvancedReactFlow: React.FC<ConsolidatedAdvancedReactFlowProps> = (props) => {
  return (
    <ReactFlowProvider>
      <ConsolidatedAdvancedReactFlowContent {...props} />
    </ReactFlowProvider>
  );
};

// Export for backward compatibility  
export const AdvancedReactFlow = ConsolidatedAdvancedReactFlow;
export const AdvancedReactFlowWrapper = ConsolidatedAdvancedReactFlow;
export default ConsolidatedAdvancedReactFlow;