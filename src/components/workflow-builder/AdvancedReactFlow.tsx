import React, { useCallback, useState, useRef, useEffect, useMemo } from 'react';
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
  ReactFlowProvider,
  ReactFlowInstance,
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
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Icons
import { 
  Play, Pause, RotateCcw, Save, Download, Upload, Eye, Plus, Trash2, 
  Settings, Zap, Bot, Users, AlertTriangle, Database, GitBranch,
  Layout, Grid, Layers, Move, RotateCw, Maximize2, Copy, Edit,
  Target, Link, Workflow, Activity, MousePointer, Hand
} from 'lucide-react';

import { useMasterToast } from '@/hooks/useMasterToast';
import { useAgentSession } from '@/hooks/useAgentSession';
import { useWorkflowManager } from '@/hooks/useWorkflowManager';
import { useWorkflowAgents } from '@/hooks/useWorkflowAgents';
import { useAIModelManager } from '@/hooks/useAIModelManager';
import { useInfrastructureManager } from '@/hooks/useInfrastructureManager';
import { useAccessManager } from '@/hooks/useAccessManager';
import { useTestingManager } from '@/hooks/useTestingManager';
import { NodeUpdateHandler } from './NodeUpdateHandler';
import { NodePalette } from './NodePalette';
import { InlineNodeConfig } from './InlineNodeConfig';
import { ProcessFlowTracker } from './ProcessFlowTracker';
import { AIIntelligenceNode } from './nodes/AIIntelligenceNode';
import { AgentNode } from './nodes/AgentNode';
import { DataSourceNode } from './nodes/DataSourceNode';

// Custom Node Types with Advanced Features
const CustomNode = ({ id, data, selected }: { id: string; data: any; selected: boolean }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { getNodes, setNodes, getEdges, setEdges } = useReactFlow();
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

  const handleDelete = () => {
    const edges = getEdges();
    setEdges(edges.filter((e) => e.source !== id && e.target !== id));
    setNodes((nds) => nds.filter((n) => n.id !== id));
  };

  const setAsStart = () => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id
          ? { ...n, data: { ...n.data, isStartNode: true } }
          : { ...n, data: { ...n.data, isStartNode: false } }
      )
    );
  };
  
  return (
    <>
      <NodeResizer 
        minWidth={100} 
        minHeight={50} 
        isVisible={selected}
        lineClassName="border-blue-400"
        handleClassName="w-3 h-3 bg-white border-2 border-blue-400"
      />
      <NodeToolbar isVisible={selected} position={Position.Top}>
        <Button size="sm" variant="outline" onClick={() => setIsEditing(!isEditing)}>
          <Edit className="h-3 w-3" />
        </Button>
        <Button size="sm" variant="outline" onClick={handleCopy}>
          <Copy className="h-3 w-3" />
        </Button>
        <Button size="sm" variant="destructive" onClick={handleDelete}>
          <Trash2 className="h-3 w-3" />
        </Button>
        <Button size="sm" variant="outline" onClick={setAsStart} title="Mark as Start">
          <Target className="h-3 w-3" />
        </Button>
      </NodeToolbar>
      
      <div className="px-4 py-3 shadow-lg rounded-lg bg-white border-2 border-gray-200 min-w-[150px]">
        <Handle 
          type="target" 
          position={Position.Left} 
          className="w-3 h-3 !bg-blue-500 border-2 border-white"
          isConnectable={data.connectionLimit ? data.connections < data.connectionLimit : true}
        />
        <Handle 
          type="target" 
          position={Position.Top} 
          className="w-3 h-3 !bg-green-500 border-2 border-white"
          id="top"
        />
        
<div className="flex items-center gap-2 mb-2">
          {data.icon && <data.icon className="h-4 w-4 text-primary" />}
          <div className="font-bold text-sm">{data.label}</div>
          {data.isStartNode && (
            <Badge variant="secondary" className="text-[10px]">Start</Badge>
          )}
          {data.status && (
            <Badge variant={data.status === 'active' ? 'default' : 'secondary'} className="text-xs">
              {data.status}
            </Badge>
          )}
        </div>
        
        {isEditing ? (
          <input 
            className="text-xs border rounded px-1 py-0.5 w-full"
            defaultValue={data.description}
            onBlur={() => setIsEditing(false)}
            autoFocus
          />
        ) : (
          <div className="text-xs text-gray-600 whitespace-normal break-words leading-snug">
            {data.description}
          </div>
        )}
        
        {data.progress && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div 
                className="bg-blue-600 h-1 rounded-full transition-all duration-300" 
                style={{ width: `${data.progress}%` }}
              />
            </div>
          </div>
        )}
        
        <Handle 
          type="source" 
          position={Position.Right} 
          className="w-3 h-3 !bg-red-500 border-2 border-white"
        />
        <Handle 
          type="source" 
          position={Position.Bottom} 
          className="w-3 h-3 !bg-yellow-500 border-2 border-white"
          id="bottom"
        />
      </div>
    </>
  );
};

// Group/Subflow Node
const GroupNode = ({ id, data, selected }: { id: string; data: any; selected: boolean }) => {
  return (
    <>
      <NodeResizer minWidth={200} minHeight={150} isVisible={selected} />
      <div className="w-full h-full bg-gray-100 border-2 border-gray-300 rounded-lg">
        <div className="p-2 bg-gray-200 border-b border-gray-300 rounded-t-lg">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            <span className="font-medium text-sm">{data.label || 'Group'}</span>
          </div>
        </div>
        <div className="p-2 h-full">
          <div className="text-xs text-gray-500">{data.description}</div>
        </div>
      </div>
    </>
  );
};

// Custom Animated Edge
const AnimatedEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  selected
}: any) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{
          ...style,
          strokeWidth: selected ? 3 : 2,
          stroke: data?.color || style.stroke || '#b1b1b7',
          strokeDasharray: data?.animated ? '5,5' : 'none',
          animation: data?.animated ? 'dashdraw 0.5s linear infinite' : 'none'
        }} 
      />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 12,
              pointerEvents: 'all',
            }}
            className="bg-white px-2 py-1 rounded shadow border text-xs"
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

// Smart Connection Line
const ConnectionLine = ({ fromX, fromY, toX, toY, connectionLineStyle }: any) => {
  const [edgePath] = getBezierPath({
    sourceX: fromX,
    sourceY: fromY,
    sourcePosition: Position.Right,
    targetX: toX,
    targetY: toY,
    targetPosition: Position.Left,
  });

  return (
    <g>
      <path
        fill="none"
        stroke="#222"
        strokeWidth={2}
        className="animated"
        d={edgePath}
        strokeDasharray="5,5"
        style={{
          animation: 'dashdraw 0.5s linear infinite'
        }}
      />
      <circle cx={toX} cy={toY} fill="#ff0073" r={3} stroke="#222" strokeWidth={2} />
    </g>
  );
};

// Layout Algorithms
const getLayoutedElements = (nodes: Node[], edges: Edge[], algorithm: 'dagre' | 'elk' = 'dagre') => {
  if (algorithm === 'dagre') {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: 'TB', align: 'UL', ranksep: 100, nodesep: 100 });

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: 150, height: 100 });
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
          x: nodeWithPosition.x - 75,
          y: nodeWithPosition.y - 50,
        },
      };
    });

    return { nodes: layoutedNodes, edges };
  }
  
  // ELK.js layout would go here for more complex layouts
  return { nodes, edges };
};

// Cycle Detection
const hasCycle = (nodes: Node[], edges: Edge[], newEdge: Edge): boolean => {
  const graph = new Map<string, string[]>();
  
  // Build adjacency list
  [...edges, newEdge].forEach(edge => {
    if (!graph.has(edge.source)) graph.set(edge.source, []);
    graph.get(edge.source)!.push(edge.target);
  });
  
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  
  const dfs = (node: string): boolean => {
    if (recursionStack.has(node)) return true;
    if (visited.has(node)) return false;
    
    visited.add(node);
    recursionStack.add(node);
    
    const neighbors = graph.get(node) || [];
    for (const neighbor of neighbors) {
      if (dfs(neighbor)) return true;
    }
    
    recursionStack.delete(node);
    return false;
  };
  
  for (const node of nodes) {
    if (!visited.has(node.id) && dfs(node.id)) {
      return true;
    }
  }
  
  return false;
};

// Validation Rules
const validateWorkflow = (nodes: Node[], edges: Edge[]) => {
  const issues = [];
  
  // Check for isolated nodes
  const connectedNodes = new Set();
  edges.forEach(edge => {
    connectedNodes.add(edge.source);
    connectedNodes.add(edge.target);
  });
  
  const isolatedNodes = nodes.filter(node => !connectedNodes.has(node.id));
  if (isolatedNodes.length > 0) {
    issues.push(`Isolated nodes found: ${isolatedNodes.map(n => n.data?.label || n.id).join(', ')}`);
  }
  
  // Check for start node
  const hasStartNode = nodes.some(node => node.data?.isStartNode);
  if (!hasStartNode && nodes.length > 0) {
    issues.push('No start node defined');
  }
  
  // Check for end node
  const hasEndNode = nodes.some(node => node.data?.isEndNode);
  if (!hasEndNode && nodes.length > 0) {
    issues.push('No end node defined');
  }
  
  return issues;
};

// Node Types Configuration
import { workflowNodeTypes } from './nodes';

const nodeTypes: NodeTypes = {
  custom: CustomNode,
  group: GroupNode,
  ...workflowNodeTypes,
};

// Edge Types Configuration
const edgeTypes: EdgeTypes = {
  animated: AnimatedEdge,
};

interface AdvancedReactFlowProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onSave?: (flowData: any) => void;
  onLoad?: (flowData: any) => void;
  workflowType?: 'visual' | 'manual';
  fitParent?: boolean; // when true, use h-full instead of h-screen
  sessionId?: string; // for backend persistence
  onNodeSelect?: (node: Node | null) => void; // for configuration panel
}

export const AdvancedReactFlow: React.FC<AdvancedReactFlowProps> = ({
  initialNodes = [],
  initialEdges = [],
  onSave,
  onLoad,
  workflowType = 'visual',
  fitParent = false,
  sessionId,
  onNodeSelect,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedLayout, setSelectedLayout] = useState<'dagre' | 'elk' | 'manual'>('manual');
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>(ConnectionMode.Strict);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [backgroundVariant, setBackgroundVariant] = useState<BackgroundVariant>(BackgroundVariant.Dots);
  const [validationIssues, setValidationIssues] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [dragMode, setDragMode] = useState<'select' | 'pan'>('select');
  const [showPalette, setShowPalette] = useState(true);
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { showSuccess, showError } = useMasterToast();
  const reactFlowInstance = useReactFlow();
  const { autoSave } = useAgentSession();
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [inlineConfigNode, setInlineConfigNode] = useState<Node | null>(null);
  const [showProcessTracker, setShowProcessTracker] = useState(false);
  
  // Mock process steps for demo
  const [processSteps, setProcessSteps] = useState([
    { id: '1', name: 'Start', type: 'start' as const, status: 'completed' as const, duration: '0.1s' },
    { id: '2', name: 'Detect User Intention', type: 'agent' as const, status: 'completed' as const, model: 'gpt-4.1', duration: '1.2s', details: 'Analyzed user input for intent classification' },
    { id: '3', name: 'Technical Agent', type: 'agent' as const, status: 'running' as const, model: 'gemini-2.0-flash', details: 'Processing technical query...' },
    { id: '4', name: 'Sales Agent', type: 'agent' as const, status: 'pending' as const, model: 'claude-3-7-sonnet-latest' }
  ]);
  
  // Import all backend managers
  const { workflows, createWorkflow, updateWorkflow, autoSaveWorkflow, isAutoSaving } = useWorkflowManager(sessionId);
  const { agents, createAgent, updateAgent } = useWorkflowAgents();
  const { aiModels, createModelConfig, updateModelConfig } = useAIModelManager();
  const { deployments, voiceProviders, apiIntegrations, createDeployment, createApiIntegration } = useInfrastructureManager();
  const { roles, permissions, userRoles, assignRole, createRole } = useAccessManager();
  const { testRuns, testCases, createTestRun, executeTestRun } = useTestingManager();

  // Apply suggestions from contextual access overlay
  useEffect(() => {
    const handler = (e: any) => {
      const { nodeId, connectors } = e.detail || {};
      if (!nodeId || !Array.isArray(connectors)) return;
      setNodes((nds) => nds.map(n => {
        if (n.id !== nodeId) return n;
        const existing = Array.isArray(n.data?.connectors) ? n.data.connectors : [];
        const merged = Array.from(new Set([...existing, ...connectors]));
        return { ...n, data: { ...n.data, connectors: merged } };
      }));
      showSuccess('Suggestions applied', 'Connectors added to the selected node');
    };
    window.addEventListener('apply-access-suggestions', handler as EventListener);
    return () => window.removeEventListener('apply-access-suggestions', handler as EventListener);
  }, [setNodes, showSuccess]);

  // Handle node configuration events
  useEffect(() => {
    const handler = (e: any) => {
      const { nodeId } = e.detail || {};
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        // Open inline config overlay without triggering right panel
        setSelectedNode(node);
        setInlineConfigNode(node);
        window.dispatchEvent(new CustomEvent('inline-config-opened', { detail: { nodeId } }));
      }
    };
    window.addEventListener('open-node-config', handler as EventListener);
    return () => window.removeEventListener('open-node-config', handler as EventListener);
  }, [nodes, onNodeSelect]);

  // Add suggested nodes from contextual access overlay
  useEffect(() => {
    const handler = (e: any) => {
      const { currentNodeId, nodeType, nodeLabel, nodeDesc } = e.detail || {};
      if (!currentNodeId || !nodeType || !nodeLabel) return;

      const currentNode = nodes.find(n => n.id === currentNodeId);
      if (!currentNode) return;

      const newNodeId = `${nodeType}-${Date.now()}`;
      const newNode = {
        id: newNodeId,
        type: nodeType,
        position: {
          x: currentNode.position.x + 200,
          y: currentNode.position.y + 100
        },
        data: {
          label: nodeLabel,
          description: nodeDesc
        }
      };

      const newEdge = {
        id: `${currentNodeId}-${newNodeId}`,
        source: currentNodeId,
        target: newNodeId,
        type: 'smoothstep'
      };

      setNodes((nds) => [...nds, newNode]);
      setEdges((eds) => [...eds, newEdge]);
      showSuccess('Node added', `${nodeLabel} connected to workflow`);
    };
    window.addEventListener('add-suggested-node', handler as EventListener);
    return () => window.removeEventListener('add-suggested-node', handler as EventListener);
  }, [nodes, setNodes, setEdges, showSuccess]);

  // Auto-layout when algorithm changes
useEffect(() => {
    if (nodes.length === 0) return;
    if (selectedLayout === 'manual') return;

    const runLayout = async () => {
      if (selectedLayout === 'dagre') {
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, 'dagre');
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      } else if (selectedLayout === 'elk') {
        try {
          const elk = new ELK();
          const graph: any = {
            id: 'root',
            layoutOptions: {
              algorithm: 'layered',
              'elk.direction': 'DOWN',
              'elk.layered.spacing.nodeNodeBetweenLayers': '80',
              'elk.spacing.nodeNode': '60'
            },
            children: nodes.map((n) => ({ id: n.id, width: 150, height: 100 })),
            edges: edges.map((e) => ({ id: e.id, sources: [e.source], targets: [e.target] })),
          };
          const res: any = await elk.layout(graph);
          const layoutedNodes = nodes.map((n) => {
            const l = res.children?.find((c: any) => c.id === n.id);
            return { ...n, position: { x: l?.x || 0, y: l?.y || 0 } };
          });
          setNodes(layoutedNodes);
        } catch (e) {
          // fall back to manual if ELK fails
        }
      }
    };

    runLayout();
  }, [selectedLayout]);

  // Validation
  useEffect(() => {
    const issues = validateWorkflow(nodes, edges);
    setValidationIssues(issues);
  }, [nodes, edges]);

  // Enhanced connection handler with cycle detection and edge semantics
  const onConnect: OnConnect = useCallback((connection) => {
    // Determine edge semantics based on source and target node types
    const sourceNode = nodes.find(n => n.id === connection.source);
    const targetNode = nodes.find(n => n.id === connection.target);
    
    let edgeLabel = 'Connection';
    let edgeColor = '#8b5cf6';
    
    if (sourceNode && targetNode) {
      const sourceType = sourceNode.data?.type;
      const targetType = targetNode.data?.type;
      
      // Define edge semantics based on node types
      if (sourceType === 'customer' && targetType === 'agent') {
        edgeLabel = 'Initiates Conversation';
        edgeColor = '#10b981';
      } else if (sourceType === 'agent' && targetType === 'decision') {
        edgeLabel = 'Process Decision';
        edgeColor = '#f59e0b';
      } else if (sourceType === 'decision' && targetType === 'agent') {
        edgeLabel = 'Route to Agent';
        edgeColor = '#8b5cf6';
      } else if (sourceType === 'agent' && targetType === 'database') {
        edgeLabel = 'Query Data';
        edgeColor = '#3b82f6';
      } else if (sourceType === 'database' && targetType === 'agent') {
        edgeLabel = 'Return Results';
        edgeColor = '#06b6d4';
      } else if (targetType === 'customer') {
        edgeLabel = 'Send Response';
        edgeColor = '#10b981';
      }
    }

    const newEdge: Edge = {
      ...connection,
      id: `edge-${Date.now()}`,
      type: 'animated',
      markerEnd: { type: MarkerType.ArrowClosed },
      data: { 
        label: edgeLabel,
        animated: true,
        color: edgeColor,
        semantics: {
          sourceType: sourceNode?.data?.type,
          targetType: targetNode?.data?.type,
          relationship: edgeLabel
        }
      }
    } as Edge;

    // Check for cycles
    if (hasCycle(nodes, edges, newEdge)) {
      showError('Connection would create a cycle!');
      return;
    }

    setEdges((eds) => {
      const updatedEdges = addEdge(newEdge, eds);
      // Auto-save to backend if sessionId exists  
      if (sessionId && autoSave) {
        try {
          autoSave.mutate({ 
            sessionId, 
            updates: { 
              canvas: { 
                workflow_steps: nodes, 
                connections: updatedEdges,
                layout: {
                  viewport: reactFlowInstance.getViewport(),
                  selectedLayout, 
                  connectionMode, 
                  snapToGrid
                }
              } 
            }
          });
        } catch (error) {
          console.warn('Auto-save failed:', error);
        }
      }
      return updatedEdges;
    });
    showSuccess(`${edgeLabel} created successfully`);
  }, [nodes, edges, showError, showSuccess, sessionId, autoSave, reactFlowInstance, selectedLayout, connectionMode, snapToGrid]);

  // Enhanced node operations with backend persistence
  const addNode = async (type: string, position?: { x: number; y: number }) => {
    const nodeId = `node-${Date.now()}`;
    const newNode: Node = {
      id: nodeId,
      type: 'custom',
      position: position || { x: Math.random() * 500, y: Math.random() * 300 },
      data: {
        label: `New ${type}`,
        description: `This is a ${type} node`,
        type,
        status: 'active',
        progress: Math.floor(Math.random() * 100),
        icon: type === 'agent' ? Bot : 
              type === 'decision' ? AlertTriangle :
              type === 'customer' ? Users :
              type === 'database' ? Database : Settings,
        // Backend metadata
        backendId: null,
        isBackendSynced: false
      }
    };
    
    setNodes(prev => [...prev, newNode]);
    
    // Create backend entity for agent nodes
    if (type === 'agent') {
      try {
        createAgent({
          name: `New ${type}`,
          description: `AI agent created from workflow node`,
          agent_type: 'single',
          use_case: 'workflow-generated',
          status: 'draft',
          configuration: {
            nodeId: nodeId,
            position: newNode.position,
            createdFromWorkflow: true
          }
        });
      } catch (error) {
        console.warn('Failed to create backend agent:', error);
      }
    }
    
    // Auto-save workflow state
    if (sessionId) {
      setTimeout(() => {
        autoSaveWorkflow({
          id: sessionId,
          nodes: [...nodes, newNode],
          edges,
          metadata: { lastNodeAdded: type }
        });
      }, 1000);
    }
    
    showSuccess(`${type} node added successfully`);
  };

  const addGroupNode = () => {
    const newNode: Node = {
      id: `group-${Date.now()}`,
      type: 'group',
      position: { x: 100, y: 100 },
      style: { width: 300, height: 200 },
      data: {
        label: 'New Group',
        description: 'Drag nodes here to group them'
      }
    };
    
    setNodes((nds) => [...nds, newNode]);
    showSuccess('Group node added');
  };

  // Save/Load functionality with backend persistence
  const handleSave = async () => {
    const workflowData = {
      nodes,
      edges,
      viewport: reactFlowInstance.getViewport(),
      metadata: {
        layout: selectedLayout,
        connectionMode,
        snapToGrid,
        backgroundVariant,
        timestamp: new Date().toISOString(),
        nodeCount: nodes.length,
        edgeCount: edges.length
      }
    };
    
    try {
      if (sessionId && workflows?.find(w => w.id === sessionId)) {
        // Update existing workflow
        updateWorkflow({
          id: sessionId,
          workflow_data: workflowData,
          status: 'active'
        });
      } else {
        // Create new workflow
        createWorkflow({
          name: `Workflow ${new Date().toLocaleDateString()}`,
          description: 'Visual workflow created in builder',
          workflow_data: workflowData,
          status: 'draft',
          agent_session_id: sessionId
        });
      }
    } catch (error) {
      showError('Failed to save workflow: ' + error);
      // Fallback to localStorage
      localStorage.setItem('workflow-data', JSON.stringify(workflowData));
      showSuccess('Workflow saved locally as fallback');
    }
    
    if (onSave) {
      onSave(workflowData);
    }
  };

  const handleLoad = () => {
    try {
      const saved = localStorage.getItem('workflow-data');
      if (saved) {
        const flowData = JSON.parse(saved);
        setNodes(flowData.nodes || []);
        setEdges(flowData.edges || []);
        if (flowData.viewport) {
          reactFlowInstance.setViewport(flowData.viewport);
        }
        if (flowData.metadata) {
          setSelectedLayout(flowData.metadata.layout || 'manual');
          setConnectionMode(flowData.metadata.connectionMode || ConnectionMode.Strict);
          setSnapToGrid(flowData.metadata.snapToGrid || false);
          setBackgroundVariant(flowData.metadata.backgroundVariant || BackgroundVariant.Dots);
        }
        showSuccess('Workflow loaded successfully');
      }
    } catch (error) {
      showError('Failed to load workflow');
    }
  };

  // Clear workflow
  const handleClear = () => {
    setNodes([]);
    setEdges([]);
    showSuccess('Workflow cleared');
  };

  // Fit view
  const handleFitView = () => {
    reactFlowInstance.fitView({ padding: 0.2 });
  };

  // Listen for global workflow control events (for consistency with side panels)
  useEffect(() => {
    const onSimulate = () => toggleSimulation();
    const onSaveEvt = () => handleSave();
    const onLoadEvt = () => handleLoad();
    const onFitEvt = () => handleFitView();
    const onDeployEvt = () => showSuccess('Deploy started');

    window.addEventListener('workflow:simulate', onSimulate);
    window.addEventListener('workflow:save', onSaveEvt);
    window.addEventListener('workflow:load', onLoadEvt);
    window.addEventListener('workflow:fitView', onFitEvt);
    window.addEventListener('workflow:deploy', onDeployEvt);

    return () => {
      window.removeEventListener('workflow:simulate', onSimulate);
      window.removeEventListener('workflow:save', onSaveEvt);
      window.removeEventListener('workflow:load', onLoadEvt);
      window.removeEventListener('workflow:fitView', onFitEvt);
      window.removeEventListener('workflow:deploy', onDeployEvt);
    };
  }, [isPlaying, nodes, edges]);

  // Context menu handlers
  const handleNodeContextMenu = (event: React.MouseEvent, node: Node) => {
    event.preventDefault();
  };

  const handlePaneContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  // Drag over handler for node drop
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Drop handler for adding nodes
  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();

    const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
    const type = event.dataTransfer.getData('application/reactflow');

    if (typeof type === 'undefined' || !type || !reactFlowBounds) {
      return;
    }

    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });

    addNode(type, position);
  }, [reactFlowInstance]);

  // Simulation/Animation
  const toggleSimulation = () => {
    setIsPlaying(!isPlaying);
    
    if (!isPlaying) {
      // Start animation
      setEdges(edges => edges.map(edge => ({
        ...edge,
        data: { ...edge.data, animated: true }
      })));
      showSuccess('Simulation started');
    } else {
      // Stop animation
      setEdges(edges => edges.map(edge => ({
        ...edge,
        data: { ...edge.data, animated: false }
      })));
      showSuccess('Simulation stopped');
    }
  };

  return (
    <div className={`w-full ${fitParent ? 'h-full' : 'h-screen'} flex flex-col`}>
      {/* Advanced Toolbar */}
      <div className="border-b bg-background p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">Advanced ReactFlow Builder</h2>
            <Badge variant="outline">{workflowType} mode</Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {isPlaying ? 'Running' : 'Ready'}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Nodes: {nodes.length} | Edges: {edges.length}
            </span>
          </div>
        </div>

        <Tabs defaultValue="layout" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="nodes">Nodes</TabsTrigger>
            <TabsTrigger value="edges">Edges</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="layout" className="space-y-4">
            <div className="flex items-center gap-4">
              <Select value={selectedLayout} onValueChange={(value) => setSelectedLayout(value as any)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Layout" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="dagre">Dagre (Hierarchical)</SelectItem>
                  <SelectItem value="elk">ELK (Advanced)</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={backgroundVariant} onValueChange={(value) => setBackgroundVariant(value as BackgroundVariant)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Background" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={BackgroundVariant.Dots}>Dots</SelectItem>
                  <SelectItem value={BackgroundVariant.Lines}>Lines</SelectItem>
                  <SelectItem value={BackgroundVariant.Cross}>Cross</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                size="sm"
                variant={snapToGrid ? "default" : "outline"}
                onClick={() => setSnapToGrid(!snapToGrid)}
              >
                <Grid className="h-4 w-4 mr-2" />
                Snap to Grid
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="nodes" className="space-y-4">
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => addNode('customer')}>
                <Users className="h-4 w-4 mr-2" />
                Customer
              </Button>
              <Button size="sm" onClick={() => addNode('decision')}>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Decision
              </Button>
              <Button size="sm" onClick={() => addNode('agent')}>
                <Bot className="h-4 w-4 mr-2" />
                Agent
              </Button>
              <Button size="sm" onClick={() => addNode('database')}>
                <Database className="h-4 w-4 mr-2" />
                Database
              </Button>
              <Button size="sm" onClick={addGroupNode}>
                <Layers className="h-4 w-4 mr-2" />
                Group
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="edges" className="space-y-4">
            <div className="flex items-center gap-4">
              <Select value={connectionMode} onValueChange={(value) => setConnectionMode(value as ConnectionMode)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Connection Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ConnectionMode.Strict}>Strict</SelectItem>
                  <SelectItem value={ConnectionMode.Loose}>Loose</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                size="sm"
                variant={dragMode === 'pan' ? "default" : "outline"}
                onClick={() => setDragMode(dragMode === 'select' ? 'pan' : 'select')}
              >
                {dragMode === 'select' ? <MousePointer className="h-4 w-4 mr-2" /> : <Hand className="h-4 w-4 mr-2" />}
                {dragMode === 'select' ? 'Select Mode' : 'Pan Mode'}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                size="sm"
                variant={showMiniMap ? "default" : "outline"}
                onClick={() => setShowMiniMap(!showMiniMap)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Mini Map
              </Button>
              
              <Button size="sm" variant="destructive" onClick={handleClear}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Validation Issues */}
        {validationIssues.length > 0 && (
          <Alert className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Validation Issues:</strong>
              <ul className="list-disc list-inside mt-1">
                {validationIssues.map((issue, idx) => (
                  <li key={idx} className="text-sm">{issue}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Main Flow Area */}
      <div className="flex-1" ref={reactFlowWrapper}>
        {/* Node Update Handler for keyboard shortcuts and backend persistence */}
        <NodeUpdateHandler 
          sessionId={sessionId}
          onNodeUpdate={(nodeId, updates) => {
            console.log('Node updated:', nodeId, updates);
          }}
          onNodeDelete={(nodeId) => {
            console.log('Node deleted:', nodeId);
          }}
        />
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeContextMenu={handleNodeContextMenu}
              onPaneContextMenu={handlePaneContextMenu}
              onNodeClick={(event, node) => {
                setSelectedNode(node);
                onNodeSelect?.(node);
              }}
              onPaneClick={() => {
                setSelectedNode(null);
                onNodeSelect?.(null);
              }}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              connectionLineComponent={ConnectionLine}
              connectionMode={connectionMode}
              snapToGrid={snapToGrid}
              snapGrid={[15, 15]}
              fitView
              attributionPosition="bottom-left"
              zoomOnScroll={true}
              zoomOnDoubleClick={true}
              zoomOnPinch={true}
              panOnScroll={true}
              panOnScrollMode={PanOnScrollMode.Free}
              minZoom={0.1}
              maxZoom={2}
              defaultViewport={{ x: 0, y: 0, zoom: 1 }}
              selectionOnDrag={dragMode === 'select'}
              multiSelectionKeyCode="Shift"
              deleteKeyCode="Delete"
              className="bg-gray-50"
            >
              <Background variant={backgroundVariant} gap={12} size={1} />
              <Controls 
                showZoom={true}
                showFitView={true}
                showInteractive={true}
              />
              
              {/* Fullscreen Toggle */}
              <Panel position="top-center" className="bg-white/90 backdrop-blur-md p-2 rounded-lg shadow border">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (document.fullscreenElement) {
                      document.exitFullscreen();
                    } else {
                      reactFlowWrapper.current?.requestFullscreen();
                    }
                  }}
                >
                  <Maximize2 className="h-4 w-4 mr-2" />
                  Fullscreen
                </Button>
              </Panel>
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

              {/* Docked Node Palette */}
              <Panel position="top-left" className="bg-white/90 backdrop-blur-md p-2 rounded-lg shadow border">
                <div className="flex items-center gap-2 mb-2">
          <Button size="sm" variant="outline" onClick={() => setShowPalette(!showPalette)}>
            <Workflow className="h-4 w-4 mr-1" />
            {showPalette ? 'Hide Nodes' : 'Show Nodes'}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowProcessTracker(!showProcessTracker)}>
            <Activity className="h-4 w-4 mr-1" />
            Process Flow
          </Button>
                </div>
                {showPalette && (
                  <div className="w-72 h-[calc(100vh-220px)] overflow-y-auto">
                    <NodePalette heightClass="h-full" />
                  </div>
                )}
              </Panel>
              
              {/* Enhanced Status Panel */}
              <Panel position="top-right" className="bg-white/90 backdrop-blur-md p-4 rounded-lg shadow-lg border">
                <div className="space-y-2 text-sm">
                  <div className="font-medium text-primary">Workflow Status</div>
                  <div>Nodes: {nodes.length}</div>
                  <div>Edges: {edges.length}</div>
                  <div>Layout: {selectedLayout}</div>
                  <div>Agents: {agents?.length || 0}</div>
                  <div>AI Models: {aiModels?.length || 0}</div>
                  <div className="flex items-center gap-2">
                    Validation: 
                    <Badge variant={validationIssues.length === 0 ? "default" : "destructive"}>
                      {validationIssues.length === 0 ? "Valid" : `${validationIssues.length} Issues`}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    Backend: 
                    <Badge variant={sessionId ? "default" : "secondary"}>
                      {sessionId ? "Connected" : "Local Only"}
                    </Badge>
                  </div>
                  {isAutoSaving && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      Auto-saving...
                    </div>
                  )}
                </div>
              </Panel>
              
              {/* Process Flow Tracker */}
              <ProcessFlowTracker
                isOpen={showProcessTracker}
                onToggle={() => setShowProcessTracker(!showProcessTracker)}
                steps={processSteps}
                onStepClick={(step) => {
                  console.log('Step clicked:', step);
                  // Find and highlight the corresponding node
                  const node = nodes.find(n => 
                    typeof n.data?.label === 'string' && 
                    n.data.label.toLowerCase().includes(step.name.toLowerCase())
                  );
                  if (node) {
                    setSelectedNode(node);
                  }
                }}
              />
              
              {/* Inline Node Configuration */}
              {inlineConfigNode && (
                <div className="absolute inset-0 pointer-events-none z-50">
                  <div className="relative h-full w-full pointer-events-none">
                    <div 
                      className="absolute pointer-events-auto"
                      style={{
                        left: `${(inlineConfigNode.position?.x || 0) + 50}px`,
                        top: `${(inlineConfigNode.position?.y || 0) + 100}px`,
                      }}
                    >
                      <InlineNodeConfig
                        nodeId={inlineConfigNode.id}
                        nodeType={inlineConfigNode.type || 'default'}
                        data={inlineConfigNode.data || {}}
                        onUpdate={(nodeId, updates) => {
                          setNodes((nds) => nds.map(n => n.id === nodeId ? { ...n, ...updates } : n));
                        }}
                        onClose={() => {
                          setInlineConfigNode(null);
                          window.dispatchEvent(new CustomEvent('inline-config-closed', { detail: { nodeId: inlineConfigNode.id } }));
                        }}
                        isVisible={true}
                      />
                    </div>
                  </div>
                </div>
              )}
            </ReactFlow>
          </ContextMenuTrigger>
          
          <ContextMenuContent>
            <ContextMenuItem onClick={() => addNode('customer')}>
              Add Customer Node
            </ContextMenuItem>
            <ContextMenuItem onClick={() => addNode('agent')}>
              Add Agent Node  
            </ContextMenuItem>
            <ContextMenuItem onClick={() => addNode('decision')}>
              Add Decision Node
            </ContextMenuItem>
            <ContextMenuItem onClick={addGroupNode}>
              Add Group
            </ContextMenuItem>
            <Separator />
            <ContextMenuItem onClick={handleFitView}>
              Fit View
            </ContextMenuItem>
            <ContextMenuItem onClick={handleClear}>
              Clear All
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
      
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

// Wrapper with ReactFlowProvider
export const AdvancedReactFlowWrapper: React.FC<AdvancedReactFlowProps> = (props) => {
  return (
    <ReactFlowProvider>
      <AdvancedReactFlow {...props} />
    </ReactFlowProvider>
  );
};