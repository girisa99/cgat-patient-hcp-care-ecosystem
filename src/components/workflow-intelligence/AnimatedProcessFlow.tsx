import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Node, Edge } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw,
  Activity, 
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Zap,
  BarChart3,
  TrendingUp,
  Database,
  Users,
  Settings
} from 'lucide-react';
import { useMasterToast } from '@/hooks/useMasterToast';
import { supabase } from '@/integrations/supabase/client';

interface FlowExecution {
  id: string;
  nodeId: string;
  nodeName: string;
  status: 'pending' | 'running' | 'completed' | 'error' | 'skipped';
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  data?: any;
  error?: string;
  progress?: number;
}

interface AnimationFrame {
  timestamp: number;
  activeNodes: Set<string>;
  activeEdges: Set<string>;
  dataFlows: Map<string, any>;
  metrics: {
    throughput: number;
    latency: number;
    errorRate: number;
  };
}

interface AnimatedProcessFlowProps {
  nodes: Node[];
  edges: Edge[];
  isVisible: boolean;
  onToggle: () => void;
  onNodeExecuted?: (nodeId: string, result: any) => void;
  testData?: any;
}

export const AnimatedProcessFlow: React.FC<AnimatedProcessFlowProps> = ({
  nodes,
  edges,
  isVisible,
  onToggle,
  onNodeExecuted,
  testData = {}
}) => {
  const { showSuccess, showError, showInfo } = useMasterToast();
  const [executions, setExecutions] = useState<FlowExecution[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [animationFrames, setAnimationFrames] = useState<AnimationFrame[]>([]);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showDataFlow, setShowDataFlow] = useState(true);
  const [metrics, setMetrics] = useState({
    totalExecutions: 0,
    avgDuration: 0,
    successRate: 100,
    throughput: 0
  });
  
  const animationRef = useRef<number>();
  const lastFrameTime = useRef<number>(0);

  // Generate execution path from workflow
  const generateExecutionPath = useCallback(() => {
    const startNode = nodes.find(n => 
      n.data?.type_key?.toString().includes('start') || 
      n.type === 'start' ||
      !edges.some(e => e.target === n.id)
    );
    
    if (!startNode) {
      showError('No start node found in workflow');
      return [];
    }

    const executions: FlowExecution[] = [];
    const visited = new Set<string>();
    const queue = [{ nodeId: startNode.id, depth: 0 }];

    while (queue.length > 0) {
      const { nodeId, depth } = queue.shift()!;
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      const node = nodes.find(n => n.id === nodeId);
      if (!node) continue;

      executions.push({
        id: `exec-${nodeId}-${depth}`,
        nodeId,
        nodeName: (node.data as any)?.label || node.id,
        status: 'pending',
        progress: 0
      });

      // Find next nodes in execution order
      const outgoingEdges = edges.filter(e => e.source === nodeId);
      outgoingEdges.forEach(edge => {
        if (!visited.has(edge.target)) {
          queue.push({ nodeId: edge.target, depth: depth + 1 });
        }
      });
    }

    return executions.sort((a, b) => {
      const nodeA = nodes.find(n => n.id === a.nodeId);
      const nodeB = nodes.find(n => n.id === b.nodeId);
      return (nodeA?.position.x || 0) - (nodeB?.position.x || 0);
    });
  }, [nodes, edges, showError]);

  // Execute workflow step with AI simulation
  const executeStep = useCallback(async (execution: FlowExecution, stepIndex: number) => {
    const node = nodes.find(n => n.id === execution.nodeId);
    if (!node) return;

    // Start execution
    setExecutions(prev => prev.map((exec, idx) => 
      idx === stepIndex 
        ? { ...exec, status: 'running', startTime: new Date(), progress: 0 }
        : exec
    ));

    try {
      // Simulate node execution with AI
      const nodeType = node.data?.type_key || node.type;
      const executionResult = await simulateNodeExecution(node, testData);
      
      // Animate progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 50 / playbackSpeed));
        setExecutions(prev => prev.map((exec, idx) => 
          idx === stepIndex ? { ...exec, progress } : exec
        ));
      }

      // Complete execution
      const endTime = new Date();
      const duration = endTime.getTime() - (execution.startTime?.getTime() || Date.now());
      
      setExecutions(prev => prev.map((exec, idx) => 
        idx === stepIndex 
          ? { 
              ...exec, 
              status: 'completed', 
              endTime, 
              duration,
              progress: 100,
              data: executionResult 
            }
          : exec
      ));

      // Notify parent component
      if (onNodeExecuted) {
        onNodeExecuted(execution.nodeId, executionResult);
      }

      // Update metrics
      setMetrics(prev => ({
        ...prev,
        totalExecutions: prev.totalExecutions + 1,
        avgDuration: (prev.avgDuration + duration) / 2,
        throughput: prev.throughput + 1
      }));

    } catch (error) {
      console.error(`Node execution error (${execution.nodeId}):`, error);
      setExecutions(prev => prev.map((exec, idx) => 
        idx === stepIndex 
          ? { 
              ...exec, 
              status: 'error', 
              endTime: new Date(),
              error: (error as Error).message 
            }
          : exec
      ));

      // Update error metrics
      setMetrics(prev => ({
        ...prev,
        successRate: Math.max(0, prev.successRate - 5)
      }));
    }
  }, [nodes, testData, playbackSpeed, onNodeExecuted]);

  // Simulate node execution with AI
  const simulateNodeExecution = async (node: Node, inputData: any) => {
    const nodeType = node.data?.type_key || node.type;
    const nodeConfig = node.data?.configuration || {};

    // Simulate different node types
    switch (nodeType) {
      case 'agent':
      case 'llm-agent':
        return await simulateAIAgent(node, inputData);
      case 'database':
      case 'query':
        return await simulateDatabase(node, inputData);
      case 'api':
      case 'http-request':
        return await simulateAPICall(node, inputData);
      case 'transform':
      case 'data-transform':
        return simulateDataTransform(node, inputData);
      default:
        return { success: true, output: inputData, processed: true };
    }
  };

  // Simulate AI agent execution
  const simulateAIAgent = async (node: Node, inputData: any) => {
    const agentConfig = node.data?.configuration || {};
    const prompt = String((agentConfig as any)?.prompt || '') || `Process the input data using ${node.data?.label}`;
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          action: 'process_data',
          prompt,
          data: inputData,
          provider: String((agentConfig as any)?.provider || '') || 'openai',
          nodeId: node.id
        }
      });

      if (error) throw error;
      
      return {
        success: true,
        output: data?.result || `Processed by ${node.data?.label}`,
        agent: node.data?.label,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`AI Agent execution failed: ${(error as Error).message}`);
    }
  };

  // Simulate database operations
  const simulateDatabase = async (node: Node, inputData: any) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      success: true,
      output: { ...inputData, dbResult: `Data processed by ${node.data?.label}` },
      recordsAffected: Math.floor(Math.random() * 100) + 1,
      executionTime: Math.random() * 50 + 10
    };
  };

  // Simulate API calls
  const simulateAPICall = async (node: Node, inputData: any) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      success: true,
      output: { ...inputData, apiResponse: `Response from ${node.data?.label}` },
      statusCode: 200,
      responseTime: Math.random() * 100 + 50
    };
  };

  // Simulate data transformation
  const simulateDataTransform = (node: Node, inputData: any) => {
    return {
      success: true,
      output: { ...inputData, transformed: true, transformedBy: node.data?.label },
      transformationType: 'data_mapping'
    };
  };

  // Start workflow execution
  const startExecution = useCallback(async () => {
    if (nodes.length === 0) {
      showError('No nodes to execute');
      return;
    }

    const executionPath = generateExecutionPath();
    if (executionPath.length === 0) return;

    setExecutions(executionPath);
    setIsRunning(true);
    setCurrentStep(0);
    
    showInfo('Starting workflow execution...');

    // Execute steps sequentially
    for (let i = 0; i < executionPath.length && isRunning; i++) {
      setCurrentStep(i);
      await executeStep(executionPath[i], i);
      
      // Brief pause between steps
      await new Promise(resolve => setTimeout(resolve, 500 / playbackSpeed));
    }

    setIsRunning(false);
    setCurrentStep(0);
    showSuccess('Workflow execution completed!');
  }, [nodes, generateExecutionPath, executeStep, isRunning, playbackSpeed, showError, showInfo, showSuccess]);

  // Stop execution
  const stopExecution = () => {
    setIsRunning(false);
    setCurrentStep(0);
    showInfo('Workflow execution stopped');
  };

  // Reset execution
  const resetExecution = () => {
    setExecutions([]);
    setCurrentStep(0);
    setIsRunning(false);
    setMetrics({
      totalExecutions: 0,
      avgDuration: 0,
      successRate: 100,
      throughput: 0
    });
  };

  const getStatusIcon = (status: FlowExecution['status']) => {
    switch (status) {
      case 'running':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: FlowExecution['status']) => {
    switch (status) {
      case 'running':
        return 'border-blue-500 bg-blue-50';
      case 'completed':
        return 'border-green-500 bg-green-50';
      case 'error':
        return 'border-red-500 bg-red-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <Button
          onClick={onToggle}
          size="sm"
          className="rounded-full shadow-lg"
          title="Show Process Flow Animation"
        >
          <Activity className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-[80vh] shadow-xl z-40 bg-background/95 backdrop-blur animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Activity className="h-4 w-4" />
            Process Flow Animation
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            <Square className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-3">
        <Tabs defaultValue="execution" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="execution">Execution</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="execution" className="mt-3">
            {/* Controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-1">
                <Button 
                  size="sm" 
                  onClick={startExecution}
                  disabled={isRunning || nodes.length === 0}
                >
                  <Play className="h-3 w-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={stopExecution}
                  disabled={!isRunning}
                >
                  <Pause className="h-3 w-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={resetExecution}
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </div>
              
              <select 
                value={playbackSpeed} 
                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                className="text-xs border rounded px-2 py-1"
              >
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={2}>2x</option>
                <option value={4}>4x</option>
              </select>
            </div>

            {/* Execution Steps */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {executions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Play className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Click play to start execution</p>
                </div>
              ) : (
                executions.map((execution, index) => (
                  <div 
                    key={execution.id}
                    className={`p-3 rounded-lg border transition-all ${getStatusColor(execution.status)} ${
                      index === currentStep ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(execution.status)}
                      <span className="font-medium text-sm">{execution.nodeName}</span>
                      <Badge variant="secondary" className="text-xs">
                        Step {index + 1}
                      </Badge>
                    </div>
                    
                    {execution.status === 'running' && execution.progress !== undefined && (
                      <Progress value={execution.progress} className="h-1 mb-2" />
                    )}
                    
                    {execution.duration && (
                      <div className="text-xs text-muted-foreground">
                        Duration: {execution.duration}ms
                      </div>
                    )}
                    
                    {execution.error && (
                      <div className="text-xs text-red-600 mt-1">
                        Error: {execution.error}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="mt-3">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-medium">Executions</span>
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    {metrics.totalExecutions}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-xs font-medium">Success Rate</span>
                  </div>
                  <div className="text-lg font-bold text-green-600">
                    {metrics.successRate.toFixed(1)}%
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-xs font-medium">Avg Duration</span>
                  </div>
                  <div className="text-lg font-bold text-yellow-600">
                    {metrics.avgDuration.toFixed(0)}ms
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-4 w-4 text-purple-600" />
                    <span className="text-xs font-medium">Throughput</span>
                  </div>
                  <div className="text-lg font-bold text-purple-600">
                    {metrics.throughput}/min
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted">
                <h4 className="font-medium text-sm mb-2">Workflow Health</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Performance</span>
                    <span className="font-medium">
                      {metrics.avgDuration < 100 ? 'Excellent' : 
                       metrics.avgDuration < 500 ? 'Good' : 'Needs Optimization'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Reliability</span>
                    <span className="font-medium">
                      {metrics.successRate > 95 ? 'Excellent' : 
                       metrics.successRate > 80 ? 'Good' : 'Needs Attention'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};