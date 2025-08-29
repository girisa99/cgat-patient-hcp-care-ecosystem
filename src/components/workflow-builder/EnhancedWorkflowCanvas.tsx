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
        <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
          <div className="flex">
            <div className="rounded-full w-12 h-12 flex justify-center items-center bg-gray-100">
              {data.icon || '⚙️'}
            </div>
            <div className="ml-2">
              <div className="text-lg font-bold">{data.label}</div>
              <div className="text-gray-500">{data.type || 'Node'}</div>
            </div>
          </div>
        </div>
      )),
      agent: createWrappedNodeType(({ data }: any) => (
        <div className="px-4 py-2 shadow-md rounded-md bg-blue-50 border-2 border-blue-400">
          <div className="flex">
            <div className="rounded-full w-12 h-12 flex justify-center items-center bg-blue-100">
              🤖
            </div>
            <div className="ml-2">
              <div className="text-lg font-bold text-blue-800">{data.label || 'AI Agent'}</div>
              <div className="text-blue-600">AI Agent</div>
            </div>
          </div>
        </div>
      )),
      api: createWrappedNodeType(({ data }: any) => (
        <div className="px-4 py-2 shadow-md rounded-md bg-green-50 border-2 border-green-400">
          <div className="flex">
            <div className="rounded-full w-12 h-12 flex justify-center items-center bg-green-100">
              🌐
            </div>
            <div className="ml-2">
              <div className="text-lg font-bold text-green-800">{data.label || 'API'}</div>
              <div className="text-green-600">API Endpoint</div>
            </div>
          </div>
        </div>
      )),
      database: createWrappedNodeType(({ data }: any) => (
        <div className="px-4 py-2 shadow-md rounded-md bg-purple-50 border-2 border-purple-400">
          <div className="flex">
            <div className="rounded-full w-12 h-12 flex justify-center items-center bg-purple-100">
              🗄️
            </div>
            <div className="ml-2">
              <div className="text-lg font-bold text-purple-800">{data.label}</div>
              <div className="text-purple-600">Database</div>
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
        className="bg-teal-50"
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