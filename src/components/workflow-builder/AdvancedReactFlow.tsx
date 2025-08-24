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
import { TestingConsolePanel } from './TestingConsolePanel';
import { CodeEditorPanel } from './CodeEditorPanel';
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
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

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
import { NodePalette } from './NodePalette';
import { RealTimeExecutionEngine } from './RealTimeExecutionEngine';
import { SessionPersistenceManager } from './SessionPersistenceManager';
import { UnifiedSidebar } from './UnifiedSidebar';

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

export const AdvancedReactFlowWrapper: React.FC<AdvancedReactFlowWrapperProps> = ({
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
  // Core ReactFlow State
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const { fitView, getNodes, getEdges } = useReactFlow();

  // UI State
  const [activeTab, setActiveTab] = useState('layout');
  const [canvasOnly, setCanvasOnly] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTestConsole, setShowTestConsole] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [showExecutionEngine, setShowExecutionEngine] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(true);

  // Configuration State
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>(ConnectionMode.Loose);
  const [backgroundVariant, setBackgroundVariant] = useState<BackgroundVariant>(BackgroundVariant.Dots);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [dragMode, setDragMode] = useState<'pan' | 'select'>('select');

  // References
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Hooks
  const { showSuccess, showError } = useMasterToast();

  // Derived State
  const selectedNodes = useMemo(() => nodes.filter(n => n.selected), [nodes]);
  const validationIssues: any[] = useMemo(() => [], [nodes, edges]);

  // Safe Node and Edge Types
  const safeNodeTypes: NodeTypes = useMemo(() => ({
    custom: CustomNode,
    agent: (props) => <AgentNode {...props} />,
    ai: (props) => <AIIntelligenceNode {...props} />,
  }), []);

  const safeEdgeTypes: EdgeTypes = useMemo(() => ({}), []);

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
    event.preventDefault();
    
    const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
    if (!reactFlowBounds) return;

    const type = event.dataTransfer.getData('application/reactflow');
    if (!type) return;

    const position = {
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    };

    const newNode = {
      id: `${type}_${Date.now()}`,
      type,
      position,
      data: { label: `${type} node` },
    };

    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    setSelectedNode(node);
  }, []);

  const handlePaneContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
  }, []);

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

  // Effects
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="flex h-full w-full bg-background">
      {/* Unified Sidebar */}
      {!canvasOnly && (
        <UnifiedSidebar 
          nodes={nodes}
          edges={edges}
          selectedNode={selectedNodes[0]}
          sessionId={sessionId}
          testInput={{}}
          onWorkflowUpdate={() => {}}
          showTestConsole={showTestConsole}
          showCodeEditor={showCodeEditor}
          setShowTestConsole={setShowTestConsole}
          setShowCodeEditor={setShowCodeEditor}
          onAddNode={addNode}
          onLayoutChange={onLayoutChange}
        />
      )}

      {/* Main Canvas Area */}
      <div className="flex-1 relative overflow-hidden">
        <div 
          ref={reactFlowWrapper} 
          className="w-full h-full"
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
                  onPaneContextMenu={handlePaneContextMenu}
                  onNodeClick={(event, node) => {
                    setSelectedNode(node);
                    handleNodeSelect(node);
                  }}
                  onPaneClick={() => {
                    setSelectedNode(null);
                    handleNodeSelect(null);
                  }}
                  nodeTypes={safeNodeTypes}
                  edgeTypes={safeEdgeTypes}
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
                  panOnDrag={dragMode === 'pan'}
                  minZoom={0.1}
                  maxZoom={2}
                  defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                  selectionOnDrag={dragMode === 'select'}
                  multiSelectionKeyCode="Shift"
                  deleteKeyCode={["Delete", "Backspace"]}
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
      </div>

      {/* Overlay Panels */}
      {showTestConsole && (
        <div className="fixed bottom-0 left-0 right-0 z-40">
          <TestingConsolePanel 
            isVisible={showTestConsole}
            onToggle={() => setShowTestConsole(false)}
            sessionId={sessionId}
            selectedNode={selectedNodes[0]}
            workflowNodes={nodes}
            workflowEdges={edges}
            heightClass="h-[40vh]"
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
                <Button size="sm" variant="ghost" onClick={() => setShowInsights(false)}>
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
          if (sessionData?.canvas?.nodes) {
            setNodes(sessionData.canvas.nodes);
          }
          if (sessionData?.canvas?.edges) {
            setEdges(sessionData.canvas.edges);
          }
        }}
        onSessionSync={(sessionData) => {
          console.log('Session synced:', sessionData);
        }}
      />

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

// Export AdvancedReactFlow for backward compatibility
export const AdvancedReactFlow = AdvancedReactFlowWrapper;