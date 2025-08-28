import { useState, useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { useWorkflowManager } from './useWorkflowManager';
import { useMasterToast } from './useMasterToast';

interface WorkflowData {
  nodes: Node[];
  edges: Edge[];
  metadata?: any;
}

interface WorkflowEditorOptions {
  sessionId?: string;
  onSave?: (workflowData: WorkflowData) => void;
  onLoad?: (workflowData: WorkflowData) => void;
}

export const useWorkflowEditor = (options: WorkflowEditorOptions = {}) => {
  const { sessionId, onSave, onLoad } = options;
  const { showSuccess, showError } = useMasterToast();
  const { workflows, createWorkflow, updateWorkflow, isCreating, isUpdating } = useWorkflowManager(sessionId);
  
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null);
  const [isModified, setIsModified] = useState(false);

  // Save workflow (handles both new and existing workflows)
  const saveWorkflow = useCallback(async (nodes: Node[], edges: Edge[], metadata?: any) => {
    const workflowData: WorkflowData = {
      nodes: nodes.map(n => ({ 
        ...n, 
        data: { 
          ...n.data,
          // Preserve node-specific configurations
          isConfigured: n.data?.isConfigured || false,
          lastModified: new Date().toISOString()
        } 
      })),
      edges: edges.map(e => ({ ...e, data: { ...e.data } })),
      metadata: {
        timestamp: new Date().toISOString(),
        sessionId,
        version: 1,
        lastModified: new Date().toISOString(),
        nodeCount: nodes.length,
        connectionCount: edges.length,
        ...metadata
      }
    };
    
    try {
      const existingWorkflows = workflows || [];
      const existingWorkflow = currentWorkflowId 
        ? existingWorkflows.find(w => w.id === currentWorkflowId)
        : existingWorkflows.find(w => w.agent_session_id === sessionId);
      
      let result;
      if (existingWorkflow) {
        // Update existing workflow
        result = await updateWorkflow({ 
          id: existingWorkflow.id, 
          workflow_data: workflowData as any,
          name: metadata?.name || existingWorkflow.name,
          description: metadata?.description || existingWorkflow.description,
          status: 'active'
        });
        showSuccess('Workflow updated successfully');
        setCurrentWorkflowId(existingWorkflow.id);
      } else {
        // Create new workflow
        result = await createWorkflow({
          name: metadata?.name || `Workflow ${new Date().toLocaleString()}`,
          description: metadata?.description || 'Generated workflow with custom configurations',
          workflow_data: workflowData as any,
          agent_session_id: sessionId,
          status: 'draft'
        });
        showSuccess('New workflow saved successfully');
        // Note: createWorkflow returns void in the current implementation
      }
      
      setIsModified(false);
      
      if (onSave) {
        onSave(workflowData);
      }
      
      return workflowData;
    } catch (error) {
      console.error('Save error:', error);
      showError('Failed to save workflow: ' + (error as Error).message);
      throw error;
    }
  }, [workflows, currentWorkflowId, sessionId, updateWorkflow, createWorkflow, showSuccess, showError, onSave]);

  // Load existing workflow
  const loadWorkflow = useCallback(async (workflowId?: string): Promise<WorkflowData | null> => {
    try {
      const existingWorkflows = workflows || [];
      if (existingWorkflows.length === 0) {
        showError('No saved workflows found');
        return null;
      }
      
      // Find workflow to load
      const workflowToLoad = workflowId 
        ? existingWorkflows.find(w => w.id === workflowId)
        : existingWorkflows.find(w => w.agent_session_id === sessionId) || existingWorkflows[0];
      
      if (!workflowToLoad?.workflow_data) {
        showError('Selected workflow has no data');
        return null;
      }
      
      // Type cast the JSON data
      const workflowData = workflowToLoad.workflow_data as any;
      
      // Process nodes with their specific configurations
      const loadedNodes: Node[] = (workflowData.nodes || []).map((node: any) => ({
        ...node,
        data: {
          ...node.data,
          // Ensure node-specific data is preserved and marked as configured
          isConfigured: true,
          loadedAt: new Date().toISOString(),
          // Preserve any existing node-specific configurations
          ...(node.data || {})
        }
      }));
      
      const loadedEdges: Edge[] = workflowData.edges || [];
      
      setCurrentWorkflowId(workflowToLoad.id);
      setIsModified(false);
      
      showSuccess(`Loaded workflow: ${workflowToLoad.name}`);
      
      const result: WorkflowData = {
        nodes: loadedNodes,
        edges: loadedEdges,
        metadata: workflowData.metadata
      };
      
      if (onLoad) {
        onLoad(result);
      }
      
      return result;
    } catch (error) {
      console.error('Load error:', error);
      showError('Failed to load workflow: ' + (error as Error).message);
      return null;
    }
  }, [workflows, sessionId, showSuccess, showError, onLoad]);

  // Mark workflow as modified
  const markAsModified = useCallback(() => {
    setIsModified(true);
  }, []);

  // Get available workflows for loading
  const getAvailableWorkflows = useCallback(() => {
    return workflows?.map(w => {
      const workflowData = w.workflow_data as any;
      return {
        id: w.id,
        name: w.name,
        description: w.description,
        status: w.status,
        lastModified: w.updated_at,
        sessionId: w.agent_session_id,
        nodeCount: workflowData?.nodes?.length || 0,
        connectionCount: workflowData?.edges?.length || 0
      };
    }) || [];
  }, [workflows]);

  return {
    saveWorkflow,
    loadWorkflow,
    markAsModified,
    getAvailableWorkflows,
    currentWorkflowId,
    isModified,
    isSaving: isCreating || isUpdating,
    availableWorkflows: getAvailableWorkflows()
  };
};