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
      if (sessionId) {
        await autoSave(sessionId, {
          canvas: {
            nodes: updatedNodes,
            edges: getEdges(),
            metadata: { timestamp: new Date().toISOString() }
          }
        });
      }
      
      onNodeUpdate?.(nodeId, updates);
      showSuccess('Node updated successfully');
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
      if (sessionId) {
        await autoSave(sessionId, {
          canvas: {
            nodes: updatedNodes,
            edges: updatedEdges,
            metadata: { timestamp: new Date().toISOString() }
          }
        });
      }
      
      onNodeDelete?.(nodeId);
      showSuccess('Node deleted successfully');
    } catch (error) {
      showError('Failed to delete node');
    }
  }, [getNodes, setNodes, getEdges, setEdges, sessionId, autoSave, onNodeDelete, showSuccess, showError]);

  // Keyboard shortcuts handler
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      const selectedNodes = getNodes().filter(node => node.selected);
      const selectedEdges = getEdges().filter(edge => edge.selected);
      
      if (selectedNodes.length > 0) {
        selectedNodes.forEach(node => deleteNode(node.id));
      }
      
      if (selectedEdges.length > 0) {
        const updatedEdges = getEdges().filter(edge => !edge.selected);
        setEdges(updatedEdges);
        
        if (sessionId) {
          autoSave(sessionId, {
            canvas: {
              nodes: getNodes(),
              edges: updatedEdges,
              metadata: { timestamp: new Date().toISOString() }
            }
          });
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

  return {
    updateNode,
    deleteNode
  };
};

export const NodeUpdateHandler: React.FC<NodeUpdateHandlerProps> = (props) => {
  useNodeUpdateHandler(props);
  return null;
};