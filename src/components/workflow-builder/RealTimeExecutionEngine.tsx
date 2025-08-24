import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, Pause, Square, RotateCcw, Activity, 
  CheckCircle, XCircle, Clock, Zap, AlertTriangle 
} from 'lucide-react';
import { useMasterToast } from '@/hooks/useMasterToast';
import { supabase } from '@/integrations/supabase/client';
import { Node, Edge } from '@xyflow/react';

interface RealTimeExecutionEngineProps {
  nodes: Node[];
  edges: Edge[];
  sessionId?: string;
  onNodeStatusChange?: (nodeId: string, status: ExecutionStatus) => void;
  isVisible?: boolean;
}

type ExecutionStatus = 'idle' | 'running' | 'success' | 'error' | 'warning' | 'paused';

interface NodeExecution {
  nodeId: string;
  status: ExecutionStatus;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  input?: any;
  output?: any;
  error?: string;
  progress: number;
}

interface WorkflowExecution {
  id: string;
  status: ExecutionStatus;
  startTime: Date;
  endTime?: Date;
  totalNodes: number;
  completedNodes: number;
  nodeExecutions: Map<string, NodeExecution>;
  currentNodeId?: string;
}

export const RealTimeExecutionEngine: React.FC<RealTimeExecutionEngineProps> = ({
  nodes,
  edges,
  sessionId,
  onNodeStatusChange,
  isVisible = true
}) => {
  const [execution, setExecution] = useState<WorkflowExecution | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionHistory, setExecutionHistory] = useState<WorkflowExecution[]>([]);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  
  const { showSuccess, showError } = useMasterToast();

  // Real-time updates subscription
  useEffect(() => {
    if (!sessionId || !realTimeUpdates) return;

    const channel = supabase
      .channel(`workflow-execution-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'action_execution_logs'
        },
        (payload) => {
          handleRealTimeUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, realTimeUpdates]);

  const handleRealTimeUpdate = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    if (eventType === 'INSERT' || eventType === 'UPDATE') {
      updateNodeExecution(newRecord);
    }
  };

  const updateNodeExecution = (executionLog: any) => {
    if (!execution) return;

    const nodeId = executionLog.execution_context?.nodeId;
    if (!nodeId) return;

    setExecution(prev => {
      if (!prev) return null;

      const nodeExecution: NodeExecution = {
        nodeId,
        status: mapExecutionStatus(executionLog.status),
        startTime: new Date(executionLog.started_at),
        endTime: executionLog.completed_at ? new Date(executionLog.completed_at) : undefined,
        duration: executionLog.duration_ms,
        input: executionLog.input_data,
        output: executionLog.output_data,
        error: executionLog.error_details?.message,
        progress: calculateNodeProgress(executionLog.status)
      };

      const newNodeExecutions = new Map(prev.nodeExecutions);
      newNodeExecutions.set(nodeId, nodeExecution);

      const completedNodes = Array.from(newNodeExecutions.values())
        .filter(ne => ne.status === 'success' || ne.status === 'error').length;

      // Notify parent component about node status change
      if (onNodeStatusChange) {
        onNodeStatusChange(nodeId, nodeExecution.status);
      }

      return {
        ...prev,
        nodeExecutions: newNodeExecutions,
        completedNodes,
        currentNodeId: nodeExecution.status === 'running' ? nodeId : prev.currentNodeId
      };
    });
  };

  const mapExecutionStatus = (status: string): ExecutionStatus => {
    switch (status) {
      case 'pending': return 'idle';
      case 'running': return 'running';
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'warning': return 'warning';
      case 'paused': return 'paused';
      default: return 'idle';
    }
  };

  const calculateNodeProgress = (status: string): number => {
    switch (status) {
      case 'pending': return 0;
      case 'running': return 50;
      case 'completed': return 100;
      case 'failed': return 100;
      case 'warning': return 100;
      default: return 0;
    }
  };

  const startExecution = useCallback(async () => {
    if (isExecuting || nodes.length === 0) return;

    setIsExecuting(true);
    
    const newExecution: WorkflowExecution = {
      id: `exec_${Date.now()}`,
      status: 'running',
      startTime: new Date(),
      totalNodes: nodes.length,
      completedNodes: 0,
      nodeExecutions: new Map(),
      currentNodeId: undefined
    };

    setExecution(newExecution);
    showSuccess('Workflow execution started');

    try {
      // Find start nodes (nodes with no incoming edges)
      const startNodes = nodes.filter(node => 
        !edges.some(edge => edge.target === node.id)
      );

      if (startNodes.length === 0) {
        throw new Error('No start nodes found in workflow');
      }

      // Execute workflow using breadth-first traversal
      await executeWorkflowBFS(startNodes[0], newExecution);

      // Mark execution as complete
      setExecution(prev => prev ? {
        ...prev,
        status: 'success',
        endTime: new Date()
      } : null);

      showSuccess('Workflow execution completed successfully');

    } catch (error: any) {
      setExecution(prev => prev ? {
        ...prev,
        status: 'error',
        endTime: new Date()
      } : null);
      
      showError(`Workflow execution failed: ${error.message}`);
    } finally {
      setIsExecuting(false);
    }
  }, [nodes, edges, isExecuting]);

  const executeWorkflowBFS = async (startNode: Node, workflowExecution: WorkflowExecution) => {
    const queue = [startNode];
    const visited = new Set<string>();
    const executing = new Set<string>();

    while (queue.length > 0) {
      const currentNode = queue.shift()!;
      
      if (visited.has(currentNode.id) || executing.has(currentNode.id)) {
        continue;
      }

      executing.add(currentNode.id);
      
      try {
        await executeNode(currentNode, workflowExecution);
        visited.add(currentNode.id);
        executing.delete(currentNode.id);

        // Find next nodes to execute
        const nextEdges = edges.filter(edge => edge.source === currentNode.id);
        for (const edge of nextEdges) {
          const nextNode = nodes.find(node => node.id === edge.target);
          if (nextNode && !visited.has(nextNode.id)) {
            
            // Check if all prerequisites are met
            const incomingEdges = edges.filter(e => e.target === nextNode.id);
            const allPrerequisitesMet = incomingEdges.every(ie => 
              visited.has(ie.source)
            );

            if (allPrerequisitesMet) {
              queue.push(nextNode);
            }
          }
        }

      } catch (error: any) {
        executing.delete(currentNode.id);
        throw new Error(`Node ${currentNode.id} execution failed: ${error.message}`);
      }
    }
  };

  const executeNode = async (node: Node, workflowExecution: WorkflowExecution): Promise<void> => {
    const nodeExecution: NodeExecution = {
      nodeId: node.id,
      status: 'running',
      startTime: new Date(),
      progress: 0
    };

    // Update execution state
    setExecution(prev => {
      if (!prev) return null;
      const newNodeExecutions = new Map(prev.nodeExecutions);
      newNodeExecutions.set(node.id, nodeExecution);
      return {
        ...prev,
        nodeExecutions: newNodeExecutions,
        currentNodeId: node.id
      };
    });

    // Notify parent about status change
    if (onNodeStatusChange) {
      onNodeStatusChange(node.id, 'running');
    }

    try {
      // Simulate node execution time based on node type
      const executionTime = getNodeExecutionTime(node.type);
      
      // Simulate progressive execution
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, executionTime / 10));
        
        setExecution(prev => {
          if (!prev) return null;
          const nodeExec = prev.nodeExecutions.get(node.id);
          if (!nodeExec) return prev;
          
          const updatedNodeExec = { ...nodeExec, progress: i };
          const newNodeExecutions = new Map(prev.nodeExecutions);
          newNodeExecutions.set(node.id, updatedNodeExec);
          
          return {
            ...prev,
            nodeExecutions: newNodeExecutions
          };
        });
      }

      // Simulate potential failures based on node configuration
      const failureRate = (typeof node.data?.failureRate === 'number' ? node.data.failureRate : 0.05); // 5% default failure rate
      const shouldFail = Math.random() < failureRate;

      if (shouldFail) {
        throw new Error(`Node execution failed: Simulated failure for ${node.data?.label || node.id}`);
      }

      // Mark as successful
      const successExecution: NodeExecution = {
        ...nodeExecution,
        status: 'success',
        endTime: new Date(),
        duration: Date.now() - nodeExecution.startTime!.getTime(),
        progress: 100,
        output: generateNodeOutput(node)
      };

      setExecution(prev => {
        if (!prev) return null;
        const newNodeExecutions = new Map(prev.nodeExecutions);
        newNodeExecutions.set(node.id, successExecution);
        const completedNodes = Array.from(newNodeExecutions.values())
          .filter(ne => ne.status === 'success' || ne.status === 'error').length;
        
        return {
          ...prev,
          nodeExecutions: newNodeExecutions,
          completedNodes
        };
      });

      if (onNodeStatusChange) {
        onNodeStatusChange(node.id, 'success');
      }

    } catch (error: any) {
      const errorExecution: NodeExecution = {
        ...nodeExecution,
        status: 'error',
        endTime: new Date(),
        duration: Date.now() - nodeExecution.startTime!.getTime(),
        progress: 100,
        error: error.message
      };

      setExecution(prev => {
        if (!prev) return null;
        const newNodeExecutions = new Map(prev.nodeExecutions);
        newNodeExecutions.set(node.id, errorExecution);
        const completedNodes = Array.from(newNodeExecutions.values())
          .filter(ne => ne.status === 'success' || ne.status === 'error').length;
        
        return {
          ...prev,
          nodeExecutions: newNodeExecutions,
          completedNodes
        };
      });

      if (onNodeStatusChange) {
        onNodeStatusChange(node.id, 'error');
      }

      throw error;
    }
  };

  const getNodeExecutionTime = (nodeType?: string): number => {
    switch (nodeType) {
      case 'agent': return 2000; // AI agents take longer
      case 'decision': return 500; // Decisions are quick
      case 'data': return 1000; // Data processing is medium
      case 'api': return 1500; // API calls vary
      default: return 800; // Default execution time
    }
  };

  const generateNodeOutput = (node: Node): any => {
    return {
      nodeId: node.id,
      nodeType: node.type,
      processed: true,
      timestamp: new Date().toISOString(),
      result: `Output from ${node.data?.label || node.id}`,
      metadata: {
        executionTime: Date.now(),
        version: '1.0'
      }
    };
  };

  const pauseExecution = () => {
    setIsExecuting(false);
    setExecution(prev => prev ? { ...prev, status: 'paused' } : null);
    showError('Workflow execution paused');
  };

  const stopExecution = () => {
    setIsExecuting(false);
    setExecution(prev => {
      if (prev) {
        setExecutionHistory(prevHistory => [...prevHistory, { ...prev, status: 'error', endTime: new Date() }]);
      }
      return null;
    });
    showError('Workflow execution stopped');
  };

  const resetExecution = () => {
    setExecution(null);
    setIsExecuting(false);
    
    // Reset all node statuses
    nodes.forEach(node => {
      if (onNodeStatusChange) {
        onNodeStatusChange(node.id, 'idle');
      }
    });
    
    showSuccess('Execution state reset');
  };

  const getOverallProgress = (): number => {
    if (!execution || execution.totalNodes === 0) return 0;
    return Math.round((execution.completedNodes / execution.totalNodes) * 100);
  };

  const getStatusColor = (status: ExecutionStatus): string => {
    switch (status) {
      case 'running': return 'text-blue-500';
      case 'success': return 'text-green-500';
      case 'error': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      case 'paused': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: ExecutionStatus) => {
    switch (status) {
      case 'running': return <Activity className="h-3 w-3 animate-pulse" />;
      case 'success': return <CheckCircle className="h-3 w-3" />;
      case 'error': return <XCircle className="h-3 w-3" />;
      case 'warning': return <AlertTriangle className="h-3 w-3" />;
      case 'paused': return <Pause className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  if (!isVisible) return null;

  return (
    <Card className="w-full">
      <CardHeader className="p-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Zap className="h-4 w-4" />
            Real-Time Execution
            {execution && (
              <Badge variant="outline" className={`text-xs ${getStatusColor(execution.status)}`}>
                {execution.status.toUpperCase()}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-1">
            {!isExecuting ? (
              <Button
                size="sm"
                onClick={startExecution}
                disabled={nodes.length === 0}
                className="h-7 text-xs"
              >
                <Play className="h-3 w-3 mr-1" />
                Execute
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={pauseExecution}
                  className="h-7 text-xs"
                >
                  <Pause className="h-3 w-3 mr-1" />
                  Pause
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={stopExecution}
                  className="h-7 text-xs"
                >
                  <Square className="h-3 w-3 mr-1" />
                  Stop
                </Button>
              </>
            )}
            
            <Button
              size="sm"
              variant="outline"
              onClick={resetExecution}
              disabled={isExecuting}
              className="h-7 text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-3">
        {execution ? (
          <div className="space-y-3">
            {/* Overall Progress */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Overall Progress</span>
                <span>{execution.completedNodes}/{execution.totalNodes} nodes</span>
              </div>
              <Progress value={getOverallProgress()} className="h-2" />
            </div>

            {/* Execution Statistics */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center p-2 bg-muted rounded">
                <div className="font-medium">Duration</div>
                <div className="text-muted-foreground">
                  {execution.endTime 
                    ? `${execution.endTime.getTime() - execution.startTime.getTime()}ms`
                    : `${Date.now() - execution.startTime.getTime()}ms`
                  }
                </div>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <div className="font-medium">Success Rate</div>
                <div className="text-muted-foreground">
                  {execution.completedNodes > 0 
                    ? Math.round((Array.from(execution.nodeExecutions.values()).filter(ne => ne.status === 'success').length / execution.completedNodes) * 100)
                    : 0
                  }%
                </div>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <div className="font-medium">Current Node</div>
                <div className="text-muted-foreground">
                  {execution.currentNodeId || 'None'}
                </div>
              </div>
            </div>

            {/* Node Execution Details */}
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {Array.from(execution.nodeExecutions.entries()).map(([nodeId, nodeExec]) => {
                const node = nodes.find(n => n.id === nodeId);
                return (
                  <div key={nodeId} className="flex items-center justify-between text-xs p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <div className={getStatusColor(nodeExec.status)}>
                        {getStatusIcon(nodeExec.status)}
                      </div>
                      <span className="font-medium">{(node?.data?.label as string) || nodeId}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={nodeExec.progress} className="w-16 h-1" />
                      {nodeExec.duration && (
                        <span className="text-muted-foreground">{nodeExec.duration}ms</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground text-xs">
            No active execution. Click "Execute" to start workflow.
          </div>
        )}
      </CardContent>
    </Card>
  );
};