import React, { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useAgentSession } from '@/hooks/useAgentSession';
import { useMasterToast } from '@/hooks/useMasterToast';

interface NodeUpdateHandlerProps {
  sessionId?: string;
  onNodeUpdate?: (nodeId: string, updates: any) => void;
  onNodeDelete?: (nodeId: string) => void;
}

export const useNodeUpdateHandler = ({ sessionId, onNodeUpdate, onNodeDelete }: NodeUpdateHandlerProps) => {
  const { getNodes, setNodes, getEdges, setEdges } = useReactFlow();
  const { autoSave } = useAgentSession();
  const { showSuccess, showError } = useMasterToast();

  const updateNode = useCallback(async (nodeId: string, updates: any) => {
    try {
      const updatedNodes = getNodes().map(node => 
        node.id === nodeId ? { ...node, ...updates } : node
      );
      
      setNodes(updatedNodes);
      
      // Persist to backend if sessionId exists
      if (sessionId && autoSave) {
        try {
          autoSave.mutate({
            sessionId,
            updates: {
              canvas: {
                workflow_steps: updatedNodes,
                connections: getEdges(),
                layout: { timestamp: new Date().toISOString() }
              }
            }
          });
        } catch (error) {
          console.warn('Auto-save failed:', error);
        }
      }
      
      onNodeUpdate?.(nodeId, updates);
      // console.info('Node updated successfully');
    } catch (error) {
      showError('Failed to update node');
    }
  }, [getNodes, setNodes, getEdges, sessionId, autoSave, onNodeUpdate, showSuccess, showError]);

  const deleteNode = useCallback(async (nodeId: string) => {
    try {
      const updatedNodes = getNodes().filter(node => node.id !== nodeId);
      const updatedEdges = getEdges().filter(edge => 
        edge.source !== nodeId && edge.target !== nodeId
      );
      
      setNodes(updatedNodes);
      setEdges(updatedEdges);
      
      // Persist to backend if sessionId exists
      if (sessionId && autoSave) {
        try {
          autoSave.mutate({
            sessionId,
            updates: {
              canvas: {
                workflow_steps: updatedNodes,
                connections: updatedEdges,
                layout: { timestamp: new Date().toISOString() }
              }
            }
          });
        } catch (error) {
          console.warn('Auto-save failed:', error);
        }
      }
      
      onNodeDelete?.(nodeId);
      // console.info('Node deleted successfully');
    } catch (error) {
      showError('Failed to delete node');
    }
  }, [getNodes, setNodes, getEdges, setEdges, sessionId, autoSave, onNodeDelete, showSuccess, showError]);

  // Keyboard shortcuts handler
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // ignore when typing in inputs/textareas or contenteditable
    const target = event.target as HTMLElement | null;
    const tag = target?.tagName?.toLowerCase();
    const isTyping = tag === 'input' || tag === 'textarea' || (target as any)?.isContentEditable;
    if (isTyping) return;

    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      const selectedNodes = getNodes().filter(node => node.selected);
      const selectedEdges = getEdges().filter(edge => edge.selected);
      
      if (selectedNodes.length > 0) {
        selectedNodes.forEach(node => deleteNode(node.id));
      }
      
      if (selectedEdges.length > 0) {
        const updatedEdges = getEdges().filter(edge => !edge.selected);
        setEdges(updatedEdges);
        
        if (sessionId && autoSave) {
          try {
            autoSave.mutate({
              sessionId,
              updates: {
                canvas: {
                  workflow_steps: getNodes(),
                  connections: updatedEdges,
                  layout: { timestamp: new Date().toISOString() }
                }
              }
            });
          } catch (error) {
            console.warn('Auto-save failed:', error);
          }
        }
        
        showSuccess(`${selectedEdges.length} edge(s) deleted`);
      }
    }
  }, [getNodes, getEdges, setEdges, deleteNode, sessionId, autoSave, showSuccess]);

  // Add keyboard event listener
  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  React.useEffect(() => {
    const onDelete = (e: any) => {
      const { nodeId } = e.detail || {};
      if (nodeId) deleteNode(nodeId);
    };
    const onDuplicate = (e: any) => {
      const { nodeId } = e.detail || {};
      if (!nodeId) return;
      const nodes = getNodes();
      const original = nodes.find(n => n.id === nodeId);
      if (!original) return;
      const newId = `${nodeId}-copy-${Date.now()}`;
      const newNode = {
        ...original,
        id: newId,
        selected: false,
        position: {
          x: (original.position?.x || 0) + 40,
          y: (original.position?.y || 0) + 40,
        },
        data: {
          ...original.data,
          label: `${original.data?.label || original.id} (copy)`,
        },
      } as any;
      setNodes([...nodes, newNode]);
      if (sessionId && autoSave) {
        try {
          autoSave.mutate({
            sessionId,
            updates: {
              canvas: {
                workflow_steps: [...nodes, newNode],
                connections: getEdges(),
                layout: { timestamp: new Date().toISOString() }
              }
            }
          });
        } catch (error) {
          console.warn('Auto-save failed:', error);
        }
      }
      showSuccess('Node duplicated');
    };
    const onMarkStart = (e: any) => {
      const { nodeId } = e.detail || {};
      if (!nodeId) return;
      const updatedNodes = getNodes().map(n => ({
        ...n,
        data: { ...n.data, isStartNode: n.id === nodeId }
      }));
      setNodes(updatedNodes);
      if (sessionId && autoSave) {
        try {
          autoSave.mutate({
            sessionId,
            updates: {
              canvas: {
                workflow_steps: updatedNodes,
                connections: getEdges(),
                layout: { timestamp: new Date().toISOString() }
              }
            }
          });
        } catch (error) {
          console.warn('Auto-save failed:', error);
        }
      }
      showSuccess('Marked as start node');
    };
    const onUpdate = (e: any) => {
      const { nodeId, updates } = e.detail || {};
      if (nodeId && updates) {
        updateNode(nodeId, updates);
      }
    };
    const onConfigUpdated = (e: any) => {
      const { nodeId, config } = e.detail || {};
      if (!nodeId) return;
      const existing = getNodes().find(n => n.id === nodeId);
      const newData = { ...(existing?.data || {}), config };
      updateNode(nodeId, { data: newData });
      showSuccess('Node configuration updated');
    };

    window.addEventListener('delete-node', onDelete as EventListener);
    window.addEventListener('duplicate-node', onDuplicate as EventListener);
    window.addEventListener('mark-start-node', onMarkStart as EventListener);
    window.addEventListener('update-node', onUpdate as EventListener);
    window.addEventListener('node-config-updated', onConfigUpdated as EventListener);
    return () => {
      window.removeEventListener('delete-node', onDelete as EventListener);
      window.removeEventListener('duplicate-node', onDuplicate as EventListener);
      window.removeEventListener('mark-start-node', onMarkStart as EventListener);
      window.removeEventListener('update-node', onUpdate as EventListener);
      window.removeEventListener('node-config-updated', onConfigUpdated as EventListener);
    };
  }, [getNodes, setNodes, getEdges, sessionId, autoSave, showSuccess, updateNode, deleteNode]);

  return {
    updateNode,
    deleteNode
  };
};

export const NodeUpdateHandler: React.FC<NodeUpdateHandlerProps> = (props) => {
  useNodeUpdateHandler(props);
  return null;
};