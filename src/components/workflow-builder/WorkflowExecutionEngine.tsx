import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Pause, Square, RotateCcw, Zap, CheckCircle, AlertCircle, Clock, Rocket } from 'lucide-react';
import { Node, Edge } from '@xyflow/react';
import { useMasterToast } from '@/hooks/useMasterToast';

interface WorkflowExecutionEngineProps {
  nodes: Node[];
  edges: Edge[];
  workflowId?: string;
  onExecutionComplete?: (result: any) => void;
}

interface ExecutionStep {
  id: string;
  nodeId: string;
  nodeName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  result?: any;
  error?: string;
}

export const WorkflowExecutionEngine: React.FC<WorkflowExecutionEngineProps> = ({
  nodes,
  edges,
  workflowId,
  onExecutionComplete
}) => {
  const { showSuccess, showError, showInfo } = useMasterToast();
  const [isExecuting, setIsExecuting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [executionResult, setExecutionResult] = useState<any>(null);

  // Initialize execution steps from workflow nodes
  useEffect(() => {
    const steps: ExecutionStep[] = nodes.map((node, index) => ({
      id: `step-${index}`,
      nodeId: node.id,
      nodeName: String(node.data?.label || `Node ${index + 1}`),
      status: 'pending'
    }));
    setExecutionSteps(steps);
  }, [nodes]);

  // Update progress based on completed steps
  useEffect(() => {
    const completedSteps = executionSteps.filter(step => step.status === 'completed').length;
    const progress = executionSteps.length > 0 ? (completedSteps / executionSteps.length) * 100 : 0;
    setExecutionProgress(progress);
  }, [executionSteps]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setExecutionLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const executeWorkflow = async () => {
    if (nodes.length === 0) {
      showError('No nodes to execute');
      return;
    }

    setIsExecuting(true);
    setIsPaused(false);
    setCurrentStepIndex(0);
    setExecutionResult(null);
    setExecutionLogs([]);
    
    addLog('Starting workflow execution...');
    showInfo('Workflow execution started');

    try {
      // Reset all steps to pending
      setExecutionSteps(prev => prev.map(step => ({ ...step, status: 'pending' })));

      // Execute each step sequentially
      for (let i = 0; i < executionSteps.length; i++) {
        if (isPaused) {
          addLog('Execution paused');
          break;
        }

        setCurrentStepIndex(i);
        const step = executionSteps[i];
        
        // Update step to running
        setExecutionSteps(prev => prev.map(s => 
          s.id === step.id ? { ...s, status: 'running', startTime: new Date() } : s
        ));

        addLog(`Executing node: ${step.nodeName}`);

        try {
          // Simulate node execution
          const result = await executeNode(nodes[i], i);
          
          // Update step to completed
          setExecutionSteps(prev => prev.map(s => 
            s.id === step.id ? { 
              ...s, 
              status: 'completed', 
              endTime: new Date(),
              duration: Date.now() - (s.startTime?.getTime() || Date.now()),
              result 
            } : s
          ));

          addLog(`Completed node: ${step.nodeName}`);
        } catch (error) {
          // Update step to failed
          setExecutionSteps(prev => prev.map(s => 
            s.id === step.id ? { 
              ...s, 
              status: 'failed', 
              endTime: new Date(),
              error: error instanceof Error ? error.message : 'Unknown error'
            } : s
          ));

          addLog(`Failed node: ${step.nodeName} - ${error}`);
          throw error;
        }

        // Small delay for visualization
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const result = {
        workflowId,
        executedAt: new Date(),
        totalSteps: executionSteps.length,
        successfulSteps: executionSteps.filter(s => s.status === 'completed').length,
        executionTime: executionSteps.reduce((total, step) => total + (step.duration || 0), 0)
      };

      setExecutionResult(result);
      addLog('Workflow execution completed successfully');
      showSuccess('Workflow executed successfully');
      onExecutionComplete?.(result);

    } catch (error) {
      addLog(`Workflow execution failed: ${error}`);
      showError('Workflow execution failed');
    } finally {
      setIsExecuting(false);
    }
  };

  const executeNode = async (node: Node, index: number): Promise<any> => {
    // Simulate different node type execution
    const nodeType = node.type || 'default';
    
    switch (nodeType) {
      case 'llm-agent':
        return simulateLLMExecution(node);
      case 'tool-agent':
        return simulateToolExecution(node);
      case 'retriever-node':
        return simulateRetrieverExecution(node);
      case 'iteration-node':
        return simulateIterationExecution(node);
      case 'loop-node':
        return simulateLoopExecution(node);
      default:
        return simulateDefaultExecution(node);
    }
  };

  const simulateLLMExecution = async (node: Node): Promise<any> => {
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    return {
      type: 'llm_response',
      response: 'AI generated response based on configuration',
      tokens: Math.floor(Math.random() * 1000) + 100
    };
  };

  const simulateToolExecution = async (node: Node): Promise<any> => {
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1500));
    return {
      type: 'tool_result',
      result: 'Tool execution completed',
      data: { success: true, processed: Math.floor(Math.random() * 100) }
    };
  };

  const simulateRetrieverExecution = async (node: Node): Promise<any> => {
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
    return {
      type: 'retrieval_result',
      documents: Array.from({ length: 5 }, (_, i) => ({
        id: `doc-${i}`,
        content: `Document ${i + 1} content`,
        score: 0.9 - (i * 0.1)
      }))
    };
  };

  const simulateIterationExecution = async (node: Node): Promise<any> => {
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));
    return {
      type: 'iteration_result',
      iterations: 3,
      results: ['Result 1', 'Result 2', 'Result 3']
    };
  };

  const simulateLoopExecution = async (node: Node): Promise<any> => {
    await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 1800));
    return {
      type: 'loop_result',
      loops: 2,
      completed: true
    };
  };

  const simulateDefaultExecution = async (node: Node): Promise<any> => {
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));
    return {
      type: 'default_result',
      processed: true
    };
  };

  const pauseExecution = () => {
    setIsPaused(true);
    addLog('Execution paused by user');
    showInfo('Execution paused');
  };

  const resumeExecution = () => {
    setIsPaused(false);
    addLog('Execution resumed by user');
    showInfo('Execution resumed');
  };

  const stopExecution = () => {
    setIsExecuting(false);
    setIsPaused(false);
    addLog('Execution stopped by user');
    showInfo('Execution stopped');
  };

  const resetExecution = () => {
    setIsExecuting(false);
    setIsPaused(false);
    setCurrentStepIndex(0);
    setExecutionProgress(0);
    setExecutionResult(null);
    setExecutionLogs([]);
    setExecutionSteps(prev => prev.map(step => ({ ...step, status: 'pending' })));
    addLog('Execution reset');
  };

  const getStatusIcon = (status: ExecutionStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Zap className="h-4 w-4 text-blue-500 animate-pulse" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: ExecutionStep['status']) => {
    const variants = {
      pending: 'secondary',
      running: 'default',
      completed: 'outline',
      failed: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status] || 'secondary'} className={status === 'completed' ? 'border-green-500 text-green-700' : ''}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Execution Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Workflow Execution Engine
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Button
              onClick={executeWorkflow}
              disabled={isExecuting || nodes.length === 0}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              {isExecuting ? 'Executing...' : 'Execute'}
            </Button>

            {isExecuting && (
              <>
                <Button
                  onClick={isPaused ? resumeExecution : pauseExecution}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>

                <Button
                  onClick={stopExecution}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Square className="h-4 w-4" />
                  Stop
                </Button>
              </>
            )}

            <Button
              onClick={resetExecution}
              variant="outline"
              disabled={isExecuting}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(executionProgress)}%</span>
            </div>
            <Progress value={executionProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Execution Details */}
      <Tabs defaultValue="steps" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="steps">Execution Steps</TabsTrigger>
          <TabsTrigger value="logs">Execution Logs</TabsTrigger>
          <TabsTrigger value="result">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="steps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Execution Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {executionSteps.map((step, index) => (
                    <div
                      key={step.id}
                      className={`p-4 border rounded-lg ${
                        index === currentStepIndex ? 'border-primary bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(step.status)}
                          <div>
                            <div className="font-medium">{step.nodeName}</div>
                            <div className="text-sm text-muted-foreground">
                              Node ID: {step.nodeId}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(step.status)}
                          {step.duration && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {step.duration}ms
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {step.error && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                          Error: {step.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Execution Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-1 font-mono text-sm">
                  {executionLogs.map((log, index) => (
                    <div key={index} className="p-2 hover:bg-muted/50">
                      {log}
                    </div>
                  ))}
                  {executionLogs.length === 0 && (
                    <div className="text-muted-foreground text-center py-8">
                      No logs available. Start execution to see logs.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="result" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Execution Result</CardTitle>
            </CardHeader>
            <CardContent>
              {executionResult ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {executionResult.successfulSteps}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Successful Steps
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {executionResult.totalSteps}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Steps
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {Math.round(executionResult.executionTime)}ms
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Execution Time
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round((executionResult.successfulSteps / executionResult.totalSteps) * 100)}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Success Rate
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No execution results available. Execute the workflow to see results.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkflowExecutionEngine;