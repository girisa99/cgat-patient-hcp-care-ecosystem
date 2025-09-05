import React, { useState, useCallback } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Connection,
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { NodeContextMenu } from './NodeContextMenu';
import { NodeConfigurationModal } from './NodeConfigurationModal';
import { NodeChatInterface } from './NodeChatInterface';
import { useEnhancedDragDropHandler } from './EnhancedDragDropHandler';
import { toast } from 'sonner';

interface EnhancedWorkflowCanvasProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
}

export const EnhancedWorkflowCanvas: React.FC<EnhancedWorkflowCanvasProps> = ({
  initialNodes = [],
  initialEdges = [],
  onNodesChange,
  onEdgesChange,
}) => {
  const [nodes, setNodes, handleNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, handleEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [configAction, setConfigAction] = useState('');
  const [chatAssistMode, setChatAssistMode] = useState<'build' | 'generate' | 'test' | 'deploy' | 'configure'>('configure');

// Sync with external changes to initialNodes/initialEdges
React.useEffect(() => {
  if (initialNodes && initialNodes.length) {
    setNodes(initialNodes as any);
  }
}, [JSON.stringify(initialNodes)]);

React.useEffect(() => {
  // If we have explicit edges, normalize and apply them
  if (initialEdges && initialEdges.length) {
    const processed = (initialEdges as any).map((e: Edge) => ({
      ...e,
      animated: true,
      style: { ...(e.style || {}), stroke: '#8b5cf6' },
      markerEnd: { type: MarkerType.ArrowClosed },
    }));
    setEdges(processed as any);
    return;
  }
  // Auto-connect sequentially when nodes are present but no edges provided
  if ((initialNodes?.length || 0) > 1 && (!initialEdges || initialEdges.length === 0)) {
    const auto = (initialNodes as any).slice(0, -1).map((n: Node, idx: number) => ({
      id: `auto-edge-${idx}`,
      source: n.id,
      target: (initialNodes as any)[idx + 1].id,
      animated: true,
      style: { stroke: '#8b5cf6' },
      markerEnd: { type: MarkerType.ArrowClosed },
      type: 'smoothstep',
    }));
    setEdges(auto as any);
  }
}, [JSON.stringify(initialEdges), JSON.stringify(initialNodes)]);

  // Handle opening chat interface
  const handleOpenChat = useCallback((nodeId: string, mode: 'build' | 'generate' | 'test' | 'deploy' | 'configure' = 'configure') => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setSelectedNode(node);
      setChatAssistMode(mode);
      setChatModalOpen(true);
    }
  }, [nodes]);

  // Handle edge connections
  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          { ...params, animated: true, style: { stroke: '#8b5cf6' }, markerEnd: { type: MarkerType.ArrowClosed } },
          eds
        )
      ),
    [setEdges]
  );

  // Edge and node helpers
  const handleEdgeContextMenu = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.preventDefault();
    setEdges((eds) =>
      eds.map((e) => (e.id === edge.id ? { ...e, source: edge.target, target: edge.source } : e))
    );
    toast.success('Edge direction swapped');
  }, [setEdges]);

  const handleNodeDoubleClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node);
    setConfigAction('configure');
    setConfigModalOpen(true);
  }, []);

  const handleNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node);
  }, []);

  // Handle drag and drop with enhanced AI integration
  const { handleDrop, handleDragOver } = useEnhancedDragDropHandler({
    onNodeAdd: (newNode) => {
      setNodes((nds) => nds.concat(newNode));
    },
    onAIAssist: handleOpenChat,
  });

  // Handle node configuration
  const handleConfigureNode = useCallback((nodeId: string, action: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setSelectedNode(node);
      setConfigAction(action);
      setConfigModalOpen(true);
    }
  }, [nodes]);

  // Handle node deletion
  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    toast.success('Node deleted successfully');
  }, [setNodes, setEdges]);

  // Handle node duplication
  const handleDuplicateNode = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      const newNode: Node = {
        ...node,
        id: `${nodeId}-copy-${Date.now()}`,
        position: {
          x: node.position.x + 50,
          y: node.position.y + 50,
        },
        data: {
          ...node.data,
          label: `${node.data.label} (Copy)`,
        },
      };
      setNodes((nds) => [...nds, newNode]);
      toast.success('Node duplicated successfully');
    }
  }, [nodes, setNodes]);

  // Handle configuration save
  const handleConfigurationSave = useCallback((nodeId: string, configuration: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                configuration: {
                  ...(typeof node.data.configuration === 'object' ? node.data.configuration : {}),
                  ...configuration,
                },
              },
            }
          : node
      )
    );
    toast.success('Configuration saved successfully');
  }, [setNodes]);

  // Handle configuration update from chat
  const handleConfigurationUpdate = useCallback((nodeId: string, config: any) => {
    handleConfigurationSave(nodeId, config);
  }, [handleConfigurationSave]);

  // Notify parent components of changes
  React.useEffect(() => {
    onNodesChange?.(nodes);
  }, [nodes, onNodesChange]);

  React.useEffect(() => {
    onEdgesChange?.(edges);
  }, [edges, onEdgesChange]);

  // Custom node renderer with context menu
  const nodeTypes = React.useMemo(() => {
    const createWrappedNodeType = (OriginalNode: React.ComponentType<any>) => {
      return React.memo((props: any) => (
        <NodeContextMenu
          nodeId={props.id}
          nodeType={props.data?.type || 'default'}
          onConfigureNode={handleConfigureNode}
          onDeleteNode={handleDeleteNode}
          onDuplicateNode={handleDuplicateNode}
          onOpenChat={handleOpenChat}
        >
          <OriginalNode {...props} />
        </NodeContextMenu>
      ));
    };

    // Create wrapped versions of default node types
    return {
      default: createWrappedNodeType(({ data }: any) => (
        <div className={`px-4 py-3 rounded-xl min-w-[200px] shadow-lg border-2 ${getCategoryStyling(data.category || 'default')}`}>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getCategoryIconBg(data.category || 'default')}`}>
              {data.icon || '⚙️'}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm">{data.label}</div>
              <div className="text-xs opacity-70">{data.type || 'Node'}</div>
              {data.tools && (
                <div className="flex gap-1 mt-1">
                  {data.tools.slice(0, 3).map((tool: string, i: number) => (
                    <span key={i} className="text-xs px-1 py-0.5 rounded bg-black/10 dark:bg-white/10">
                      {tool}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )),
      agent: createWrappedNodeType(({ data }: any) => (
        <div className={`px-4 py-3 rounded-xl min-w-[280px] shadow-lg border-2 ${getCategoryStyling('ai-agents')}`}>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getCategoryIconBg('ai-agents')}`}>
              🤖
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm">{data.label || 'AI Agent'}</div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/10 dark:bg-white/10">
                  <div className="w-4 h-4 text-xs">✨</div>
                  <span className="text-xs">{data.model || data.configuration?.model || 'gpt-4'}</span>
                </div>
                {data.provider && (
                  <div className="w-5 h-5 rounded bg-black/20 dark:bg-white/20 flex items-center justify-center">
                    <span className="text-xs">{data.provider.charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )),
      start: createWrappedNodeType(({ data }: any) => (
        <div className="px-4 py-3 rounded-xl bg-green-600 text-white min-w-[120px] shadow-lg border-2 border-green-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-green-700 flex items-center justify-center">
              ▶️
            </div>
            <div className="font-semibold text-sm">{data.label || 'Start'}</div>
          </div>
        </div>
      )),
      end: createWrappedNodeType(({ data }: any) => (
        <div className="px-4 py-3 rounded-xl bg-red-600 text-white min-w-[120px] shadow-lg border-2 border-red-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-red-700 flex items-center justify-center">
              ⏹️
            </div>
            <div className="font-semibold text-sm">{data.label || 'End'}</div>
          </div>
        </div>
      )),
      api: createWrappedNodeType(({ data }: any) => (
        <div className={`px-4 py-3 rounded-xl min-w-[200px] shadow-lg border-2 ${getCategoryStyling('integrations')}`}>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getCategoryIconBg('integrations')}`}>
              🌐
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm">{data.label || 'API Endpoint'}</div>
              <div className="text-xs opacity-70">Integration</div>
              {data.endpoint && (
                <div className="text-xs mt-1 truncate opacity-60">{data.endpoint}</div>
              )}
            </div>
          </div>
        </div>
      )),
      database: createWrappedNodeType(({ data }: any) => (
        <div className={`px-4 py-3 rounded-xl min-w-[200px] shadow-lg border-2 ${getCategoryStyling('data-processing')}`}>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getCategoryIconBg('data-processing')}`}>
              🗄️
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm">{data.label || 'Database'}</div>
              <div className="text-xs opacity-70">Data Storage</div>
              {data.dbType && (
                <div className="text-xs mt-1 px-1 py-0.5 rounded bg-black/10 dark:bg-white/10">{data.dbType}</div>
              )}
            </div>
          </div>
        </div>
      )),
    };
  }, [handleConfigureNode, handleDeleteNode, handleDuplicateNode, handleOpenChat]);

  // Category-based styling functions
  const getCategoryStyling = (category: string) => {
    switch (category) {
      case 'ai-agents':
        return 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-400 text-blue-900 dark:from-blue-900/30 dark:to-indigo-900/30 dark:border-blue-500 dark:text-blue-100';
      case 'integrations':
        return 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-400 text-emerald-900 dark:from-emerald-900/30 dark:to-teal-900/30 dark:border-emerald-500 dark:text-emerald-100';
      case 'data-processing':
        return 'bg-gradient-to-r from-purple-50 to-violet-50 border-purple-400 text-purple-900 dark:from-purple-900/30 dark:to-violet-900/30 dark:border-purple-500 dark:text-purple-100';
      case 'communication':
        return 'bg-gradient-to-r from-pink-50 to-rose-50 border-pink-400 text-pink-900 dark:from-pink-900/30 dark:to-rose-900/30 dark:border-pink-500 dark:text-pink-100';
      case 'automation':
        return 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-400 text-amber-900 dark:from-amber-900/30 dark:to-orange-900/30 dark:border-amber-500 dark:text-amber-100';
      case 'analytics':
        return 'bg-gradient-to-r from-cyan-50 to-sky-50 border-cyan-400 text-cyan-900 dark:from-cyan-900/30 dark:to-sky-900/30 dark:border-cyan-500 dark:text-cyan-100';
      default:
        return 'bg-gradient-to-r from-slate-50 to-gray-50 border-slate-400 text-slate-900 dark:from-slate-700 dark:to-gray-700 dark:border-slate-500 dark:text-slate-100';
    }
  };

  const getCategoryIconBg = (category: string) => {
    switch (category) {
      case 'ai-agents':
        return 'bg-blue-500 text-white';
      case 'integrations':
        return 'bg-emerald-500 text-white';
      case 'data-processing':
        return 'bg-purple-500 text-white';
      case 'communication':
        return 'bg-pink-500 text-white';
      case 'automation':
        return 'bg-amber-500 text-white';
      case 'analytics':
        return 'bg-cyan-500 text-white';
      default:
        return 'bg-slate-500 text-white';
    }
  };

  return (
    <div className="w-full h-full min-h-[600px]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onEdgeContextMenu={handleEdgeContextMenu}
        onNodeDoubleClick={handleNodeDoubleClick}
        onNodeClick={handleNodeClick}
        className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900"
        // Enable scrolling and zooming
        panOnScroll={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        // Fit view on mount
        fitView
        fitViewOptions={{
          padding: 0.2,
          includeHiddenNodes: true,
        }}
        // Allow infinite canvas
        translateExtent={[
          [-2000, -2000],
          [2000, 2000],
        ]}
        nodeExtent={[
          [-1500, -1500],
          [1500, 1500],
        ]}
      >
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>

      {/* Configuration Modal */}
      {selectedNode && (
        <NodeConfigurationModal
          isOpen={configModalOpen}
          onClose={() => setConfigModalOpen(false)}
          nodeId={selectedNode.id}
          nodeType={String(selectedNode.data?.type_key || selectedNode.data?.type || 'default')}
          configAction={configAction}
          initialData={selectedNode.data?.configuration}
          onSave={handleConfigurationSave}
        />
      )}

      {/* Chat Interface */}
      {selectedNode && (
        <NodeChatInterface
          isOpen={chatModalOpen}
          onClose={() => setChatModalOpen(false)}
          nodeId={selectedNode.id}
          nodeType={String(selectedNode.data?.type_key || selectedNode.data?.type || 'default')}
          currentConfig={selectedNode.data?.configuration || {}}
          onConfigurationUpdate={handleConfigurationUpdate}
          assistMode={chatAssistMode}
        />
      )}
    </div>
  );
};