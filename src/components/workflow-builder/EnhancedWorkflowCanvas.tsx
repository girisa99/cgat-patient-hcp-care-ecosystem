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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { NodeContextMenu } from './NodeContextMenu';
import { NodeConfigurationModal } from './NodeConfigurationModal';
import { NodeChatInterface } from './NodeChatInterface';
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

  // Handle edge connections
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

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

  // Handle opening chat interface
  const handleOpenChat = useCallback((nodeId: string, mode: 'build' | 'generate' | 'test' | 'deploy' | 'configure' = 'configure') => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setSelectedNode(node);
      setChatAssistMode(mode);
      setChatModalOpen(true);
    }
  }, [nodes]);

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
        <div className="px-4 py-3 rounded-xl bg-slate-800 border border-slate-600 min-w-[200px] shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center">
              {data.icon || '⚙️'}
            </div>
            <div className="flex-1">
              <div className="text-white font-semibold text-sm">{data.label}</div>
              <div className="text-slate-400 text-xs">{data.type || 'Node'}</div>
            </div>
          </div>
        </div>
      )),
      agent: createWrappedNodeType(({ data }: any) => (
        <div className="px-4 py-3 rounded-xl bg-slate-800 border border-cyan-500 min-w-[280px] shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500 flex items-center justify-center">
              🤖
            </div>
            <div className="flex-1">
              <div className="text-white font-semibold text-sm">{data.label || 'Technical Agent'}</div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-700">
                  <div className="w-4 h-4 text-xs">✨</div>
                  <span className="text-slate-300 text-xs">{data.model || 'gemini-2.0-flash'}</span>
                </div>
                {data.provider && (
                  <div className="w-5 h-5 rounded bg-slate-600 flex items-center justify-center">
                    <span className="text-xs">{data.provider.charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )),
      start: createWrappedNodeType(({ data }: any) => (
        <div className="px-4 py-3 rounded-xl bg-green-600 min-w-[120px] shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-green-700 flex items-center justify-center">
              ▶️
            </div>
            <div className="text-white font-semibold text-sm">{data.label || 'Start'}</div>
          </div>
        </div>
      )),
      api: createWrappedNodeType(({ data }: any) => (
        <div className="px-4 py-3 rounded-xl bg-slate-800 border border-emerald-500 min-w-[200px] shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center">
              🌐
            </div>
            <div className="flex-1">
              <div className="text-white font-semibold text-sm">{data.label || 'API Endpoint'}</div>
              <div className="text-slate-400 text-xs">API Integration</div>
            </div>
          </div>
        </div>
      )),
      database: createWrappedNodeType(({ data }: any) => (
        <div className="px-4 py-3 rounded-xl bg-slate-800 border border-purple-500 min-w-[200px] shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center">
              🗄️
            </div>
            <div className="flex-1">
              <div className="text-white font-semibold text-sm">{data.label || 'Database'}</div>
              <div className="text-slate-400 text-xs">Data Storage</div>
            </div>
          </div>
        </div>
      )),
    };
  }, [handleConfigureNode, handleDeleteNode, handleDuplicateNode, handleOpenChat]);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-slate-900"
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
          nodeType={String(selectedNode.data?.type || 'default')}
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
          nodeType={String(selectedNode.data?.type || 'default')}
          currentConfig={selectedNode.data?.configuration || {}}
          onConfigurationUpdate={handleConfigurationUpdate}
          assistMode={chatAssistMode}
        />
      )}
    </div>
  );
};