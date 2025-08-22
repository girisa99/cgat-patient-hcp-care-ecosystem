import React, { useCallback, useState, useRef, useEffect } from 'react';
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
  Handle,
  Position,
  NodeToolbar,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Theme and styling
import { FlowiseThemeProvider, useFlowiseTheme, getFlowiseStyles } from './FlowiseTheme';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, Database, Zap, MessageCircle, Mail, Phone, Calendar,
  Play, Pause, Save, Download, Upload, Settings, Eye, Plus,
  Trash2, Copy, Edit, RotateCcw, Maximize2, Sun, Moon, X
} from 'lucide-react';
import { useMasterToast } from '@/hooks/useMasterToast';

// Enhanced Panels
import { EnhancedNodeLibraryPanel } from './panels/EnhancedNodeLibraryPanel';

// Connectors
import { AgentTokConnector } from './connectors/AgentTokConnector';
import { AttioConnector } from './connectors/AttioConnector';

// FlowiseAI-style Node Components
const FlowiseAgentNode = ({ id, data, selected }: { id: string; data: any; selected: boolean }) => {
  const { theme } = useFlowiseTheme();
  const styles = getFlowiseStyles(theme);
  
  return (
    <>
      <NodeToolbar isVisible={selected} position={Position.Top}>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" className="h-6 w-6 p-0">
            <Edit className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="outline" className="h-6 w-6 p-0">
            <Copy className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="destructive" className="h-6 w-6 p-0">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </NodeToolbar>
      
      <div 
        className="relative min-w-[200px] rounded-xl shadow-lg border-2 transition-all duration-200"
        style={{
          backgroundColor: theme.colors.node.agent,
          borderColor: selected ? theme.colors.border.active : theme.colors.border.default,
          boxShadow: selected ? theme.shadows.glow : theme.shadows.node,
        }}
      >
        <Handle 
          type="target" 
          position={Position.Left} 
          className="!bg-white !border-2 !border-gray-300 !w-3 !h-3"
        />
        
        {/* Node Header */}
        <div className="p-3 border-b border-white/20">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="text-white font-semibold text-sm">{data.label}</div>
            {data.status === 'active' && (
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            )}
          </div>
        </div>
        
        {/* Node Content */}
        <div className="p-3">
          <div className="text-white/80 text-xs mb-2">{data.model || 'GPT-4'}</div>
          <div className="text-white/60 text-xs leading-relaxed">
            {data.description}
          </div>
          
          {data.capabilities && (
            <div className="flex flex-wrap gap-1 mt-2">
              {data.capabilities.map((cap: string, idx: number) => (
                <Badge key={idx} variant="secondary" className="text-xs bg-white/10 text-white/80 border-white/20">
                  {cap}
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        <Handle 
          type="source" 
          position={Position.Right} 
          className="!bg-white !border-2 !border-gray-300 !w-3 !h-3"
        />
      </div>
    </>
  );
};

const FlowiseDataNode = ({ id, data, selected }: { id: string; data: any; selected: boolean }) => {
  const { theme } = useFlowiseTheme();
  
  return (
    <>
      <NodeToolbar isVisible={selected} position={Position.Top}>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" className="h-6 w-6 p-0">
            <Edit className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="outline" className="h-6 w-6 p-0">
            <Settings className="h-3 w-3" />
          </Button>
        </div>
      </NodeToolbar>
      
      <div 
        className="relative min-w-[180px] rounded-xl shadow-lg border-2 transition-all duration-200"
        style={{
          backgroundColor: theme.colors.node.data,
          borderColor: selected ? theme.colors.border.active : theme.colors.border.default,
          boxShadow: selected ? theme.shadows.glow : theme.shadows.node,
        }}
      >
        <Handle 
          type="target" 
          position={Position.Left} 
          className="!bg-white !border-2 !border-gray-300 !w-3 !h-3"
        />
        
        <div className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <Database className="h-4 w-4 text-white" />
            </div>
            <div className="text-white font-semibold text-sm">{data.label}</div>
          </div>
          
          <div className="text-white/60 text-xs leading-relaxed mb-2">
            {data.description}
          </div>
          
          {data.source && (
            <Badge variant="secondary" className="text-xs bg-white/10 text-white/80 border-white/20">
              {data.source}
            </Badge>
          )}
        </div>
        
        <Handle 
          type="source" 
          position={Position.Right} 
          className="!bg-white !border-2 !border-gray-300 !w-3 !h-3"
        />
      </div>
    </>
  );
};

const FlowiseIntegrationNode = ({ id, data, selected }: { id: string; data: any; selected: boolean }) => {
  const { theme } = useFlowiseTheme();
  
  return (
    <>
      <NodeToolbar isVisible={selected} position={Position.Top}>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" className="h-6 w-6 p-0">
            <Settings className="h-3 w-3" />
          </Button>
        </div>
      </NodeToolbar>
      
      <div 
        className="relative min-w-[160px] rounded-xl shadow-lg border-2 transition-all duration-200"
        style={{
          backgroundColor: theme.colors.node.integration,
          borderColor: selected ? theme.colors.border.active : theme.colors.border.default,
          boxShadow: selected ? theme.shadows.glow : theme.shadows.node,
        }}
      >
        <Handle 
          type="target" 
          position={Position.Left} 
          className="!bg-white !border-2 !border-gray-300 !w-3 !h-3"
        />
        
        <div className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <div className="text-white font-semibold text-sm">{data.label}</div>
          </div>
          
          <div className="text-white/60 text-xs leading-relaxed">
            {data.description}
          </div>
        </div>
        
        <Handle 
          type="source" 
          position={Position.Right} 
          className="!bg-white !border-2 !border-gray-300 !w-3 !h-3"
        />
      </div>
    </>
  );
};

const FlowiseStartNode = ({ id, data, selected }: { id: string; data: any; selected: boolean }) => {
  const { theme } = useFlowiseTheme();
  
  return (
    <div 
      className="relative w-16 h-16 rounded-full shadow-lg border-2 flex items-center justify-center transition-all duration-200"
      style={{
        backgroundColor: theme.colors.node.start,
        borderColor: selected ? theme.colors.border.active : theme.colors.border.success,
        boxShadow: selected ? theme.shadows.glow : theme.shadows.node,
      }}
    >
      <Play className="h-6 w-6 text-white ml-1" />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="!bg-white !border-2 !border-gray-300 !w-3 !h-3"
      />
    </div>
  );
};

// Node Types
const nodeTypes: NodeTypes = {
  flowiseAgent: FlowiseAgentNode,
  flowiseData: FlowiseDataNode,
  flowiseIntegration: FlowiseIntegrationNode,
  flowiseStart: FlowiseStartNode,
};

// Edge Types
const edgeTypes: EdgeTypes = {};

interface FlowiseStyleWorkflowProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onSave?: (data: any) => void;
}

const FlowiseStyleWorkflowInner: React.FC<FlowiseStyleWorkflowProps> = ({
  initialNodes = [],
  initialEdges = [],
  onSave
}) => {
  const { theme, toggleTheme } = useFlowiseTheme();
  const { showSuccess, showError } = useMasterToast();
  const styles = getFlowiseStyles(theme);
  
  const [nodes, setNodes, onNodesChange] = useNodesState([
    {
      id: '1',
      type: 'flowiseStart',
      position: { x: 50, y: 200 },
      data: { label: 'Start' },
    },
    {
      id: '2',
      type: 'flowiseAgent',
      position: { x: 200, y: 100 },
      data: { 
        label: 'Technical Agent',
        description: 'Handles technical queries and provides solutions',
        model: 'GPT-4',
        status: 'active',
        capabilities: ['Problem Solving', 'Code Review', 'Documentation']
      },
    },
    {
      id: '3',
      type: 'flowiseData',
      position: { x: 200, y: 300 },
      data: { 
        label: 'Customer Data',
        description: 'Access customer information and history',
        source: 'Attio CRM'
      },
    },
    {
      id: '4',
      type: 'flowiseIntegration',
      position: { x: 500, y: 200 },
      data: { 
        label: 'AgentTok',
        description: 'Social media automation and posting'
      },
    },
    ...initialNodes
  ]);
  
  const [edges, setEdges, onEdgesChange] = useEdgesState([
    {
      id: 'e1-2',
      source: '1',
      target: '2',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: theme.colors.primary, strokeWidth: 2 }
    },
    {
      id: 'e1-3',
      source: '1',
      target: '3',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: theme.colors.primary, strokeWidth: 2 }
    },
    {
      id: 'e2-4',
      source: '2',
      target: '4',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: theme.colors.success, strokeWidth: 2 }
    },
    ...initialEdges
  ]);

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showNodeLibrary, setShowNodeLibrary] = useState(true);
  const [activeConnector, setActiveConnector] = useState<'agenttok' | 'attio' | null>(null);

  const onConnect = useCallback((params: Connection) => {
    const newEdge: Edge = {
      ...params,
      id: `e${params.source}-${params.target}`,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: theme.colors.success, strokeWidth: 2 },
      sourceHandle: params.sourceHandle || null,
      targetHandle: params.targetHandle || null
    };
    setEdges((eds) => addEdge(newEdge, eds));
  }, [theme.colors.success, setEdges]);

  const addNode = (type: string) => {
    const newNode: Node = {
      id: `${Date.now()}`,
      type: `flowise${type}`,
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: { 
        label: `New ${type}`,
        description: `A new ${type.toLowerCase()} node`
      }
    };
    setNodes((nds) => [...nds, newNode]);
    showSuccess(`${type} node added`);
  };

  const handleNodeSelect = (nodeItem: any) => {
    const newNode: Node = {
      id: `${Date.now()}`,
      type: `flowise${nodeItem.type === 'llm' || nodeItem.type === 'vlm' ? 'Agent' : 
                  nodeItem.type === 'api' || nodeItem.type === 'mcp' ? 'Data' : 'Integration'}`,
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: { 
        label: nodeItem.name,
        description: nodeItem.description,
        model: nodeItem.provider,
        capabilities: nodeItem.capabilities,
        status: nodeItem.status,
        configuration: nodeItem.configuration
      }
    };
    setNodes((nds) => [...nds, newNode]);
    showSuccess(`${nodeItem.name} node added to canvas`);
  };

  const handleSave = () => {
    const workflowData = {
      nodes,
      edges,
      theme: theme.dark ? 'dark' : 'light',
      timestamp: new Date().toISOString()
    };
    
    if (onSave) {
      onSave(workflowData);
    }
    
    showSuccess('Workflow saved successfully');
  };

  return (
    <div className="h-screen w-full flex" style={{ backgroundColor: theme.colors.background }}>
      {/* Enhanced Node Library Panel */}
      <div className={`transition-all duration-300 border-r bg-background ${showNodeLibrary ? 'w-80' : 'w-0'} overflow-hidden flex flex-col`}>
        {showNodeLibrary && (
          <>
            <div className="p-4 border-b bg-muted/30 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm" style={{ color: theme.colors.text.primary }}>
                  Enhanced Node Library
                </h3>
                <Button
                  onClick={() => setShowNodeLibrary(false)}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <EnhancedNodeLibraryPanel
                isOpen={true}
                onToggle={() => setShowNodeLibrary(!showNodeLibrary)}
                onNodeSelect={handleNodeSelect}
              />
            </div>
          </>
        )}
      </div>

      {/* Main ReactFlow Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          style={styles.reactFlow}
          onNodeClick={(_, node) => setSelectedNode(node)}
          deleteKeyCode={['Backspace', 'Delete']}
        >
          <Controls 
            style={styles.controls}
            className="react-flow__controls"
          />
          <MiniMap 
            style={styles.miniMap}
            className="react-flow__minimap"
            nodeColor={(node) => {
              if (node.type?.includes('Agent')) return theme.colors.node.agent;
              if (node.type?.includes('Data')) return theme.colors.node.data;
              if (node.type?.includes('Integration')) return theme.colors.node.integration;
              return theme.colors.primary;
            }}
          />
          <Background 
            gap={20} 
            size={1}
            color={theme.colors.border.default}
          />
          
          {/* Top Toolbar */}
          <Panel position="top-left">
            <div className="flex items-center gap-2 p-3 rounded-lg" style={styles.panel}>
              {!showNodeLibrary && (
                <Button
                  onClick={() => setShowNodeLibrary(true)}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nodes
                </Button>
              )}
              <Button
                onClick={toggleTheme}
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
              >
                {theme.dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button
                onClick={() => addNode('Agent')}
                variant="outline"
                size="sm"
              >
                <Bot className="h-4 w-4 mr-2" />
                Quick Agent
              </Button>
              <Button
                onClick={handleSave}
                variant="default"
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Workflow
              </Button>
            </div>
          </Panel>

          {/* Right Side Panel - Connectors & Selected Node Info */}
          <Panel position="top-right">
            <div className="w-80 max-h-[80vh] overflow-y-auto" style={styles.panel}>
              <div className="p-4 space-y-4">
                {/* Active Connectors */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm" style={{ color: theme.colors.text.primary }}>
                      Active Connectors
                    </h3>
                  </div>
                  
                  <div className="space-y-2">
                    <Button
                      onClick={() => setActiveConnector(activeConnector === 'agenttok' ? null : 'agenttok')}
                      variant={activeConnector === 'agenttok' ? 'default' : 'outline'}
                      className="w-full justify-start text-xs"
                      size="sm"
                    >
                      <MessageCircle className="h-3 w-3 mr-2" />
                      AgentTok Integration
                    </Button>
                    <Button
                      onClick={() => setActiveConnector(activeConnector === 'attio' ? null : 'attio')}
                      variant={activeConnector === 'attio' ? 'default' : 'outline'}
                      className="w-full justify-start text-xs"
                      size="sm"
                    >
                      <Database className="h-3 w-3 mr-2" />
                      Attio CRM
                    </Button>
                  </div>

                  {activeConnector === 'agenttok' && (
                    <div className="border rounded-lg p-3 mt-3">
                      <AgentTokConnector />
                    </div>
                  )}

                  {activeConnector === 'attio' && (
                    <div className="border rounded-lg p-3 mt-3">
                      <AttioConnector />
                    </div>
                  )}
                </div>

                {/* Selected Node Details */}
                {selectedNode && (
                  <div className="border rounded-lg p-3">
                    <h4 className="font-medium mb-2 text-sm" style={{ color: theme.colors.text.primary }}>
                      Node Properties
                    </h4>
                    <div className="space-y-2 text-xs" style={{ color: theme.colors.text.secondary }}>
                      <div className="flex justify-between">
                        <span className="font-medium">Type:</span>
                        <Badge variant="outline" className="text-xs">
                          {selectedNode.type?.replace('flowise', '')}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">ID:</span>
                        <span className="font-mono text-xs">{selectedNode.id}</span>
                      </div>
                      {selectedNode.data?.label && (
                        <div className="flex justify-between">
                          <span className="font-medium">Name:</span>
                          <span>{String(selectedNode.data.label)}</span>
                        </div>
                      )}
                      {selectedNode.data?.status && (
                        <div className="flex justify-between">
                          <span className="font-medium">Status:</span>
                          <Badge 
                            variant={selectedNode.data.status === 'active' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {String(selectedNode.data.status)}
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="flex gap-1 mt-3">
                      <Button variant="outline" size="sm" className="flex-1 text-xs">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 text-xs">
                        <Copy className="h-3 w-3 mr-1" />
                        Clone
                      </Button>
                      <Button variant="destructive" size="sm" className="flex-1 text-xs">
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}

                {/* Workflow Stats */}
                <div className="border rounded-lg p-3">
                  <h4 className="font-medium mb-2 text-sm" style={{ color: theme.colors.text.primary }}>
                    Workflow Stats
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center p-2 bg-accent/50 rounded">
                      <div className="font-bold text-lg">{nodes.length}</div>
                      <div className="text-muted-foreground">Nodes</div>
                    </div>
                    <div className="text-center p-2 bg-accent/50 rounded">
                      <div className="font-bold text-lg">{edges.length}</div>
                      <div className="text-muted-foreground">Connections</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
};

export const FlowiseStyleWorkflow: React.FC<FlowiseStyleWorkflowProps> = (props) => {
  return (
    <FlowiseThemeProvider>
      <FlowiseStyleWorkflowInner {...props} />
    </FlowiseThemeProvider>
  );
};