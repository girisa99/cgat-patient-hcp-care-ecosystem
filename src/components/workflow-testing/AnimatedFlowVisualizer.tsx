import React, { useState, useEffect, useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  Square, 
  Zap, 
  Activity, 
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  BarChart3
} from 'lucide-react';
import { useMasterToast } from '@/hooks/useMasterToast';

interface FlowStep {
  id: string;
  nodeId: string;
  nodeName: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  data?: any;
  error?: string;
}

interface FlowTrace {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'error';
  steps: FlowStep[];
  totalDuration: number;
  arizeTraceId?: string;
}

interface AnimatedFlowVisualizerProps {
  nodes: Node[];
  edges: Edge[];
  isTestMode: boolean;
  onTestStart?: () => void;
  onTestStop?: () => void;
}

export const AnimatedFlowVisualizer: React.FC<AnimatedFlowVisualizerProps> = ({
  nodes,
  edges,
  isTestMode,
  onTestStart,
  onTestStop
}) => {
  const { showSuccess, showError, showInfo } = useMasterToast();
  
  const [activeTrace, setActiveTrace] = useState<FlowTrace | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [animatedEdges, setAnimatedEdges] = useState<Set<string>>(new Set());
  const [nodeStates, setNodeStates] = useState<Map<string, 'idle' | 'processing' | 'completed' | 'error'>>(new Map());
  const [flowData, setFlowData] = useState<Map<string, any>>(new Map());

  // Create flow animation styles
  const getFlowAnimationStyle = (edgeId: string, isActive: boolean) => {
    if (!isActive) return {};
    
    return {
      strokeDasharray: '10 5',
      animation: 'flow-animation 2s linear infinite',
      stroke: '#3b82f6',
      strokeWidth: 3,
      filter: 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.6))'
    };
  };

  // Generate test trace from workflow
  const generateTestTrace = useCallback((testData?: any) => {
    const startNode = nodes.find(n => n.type === 'start');
    if (!startNode) {
      showError('No start node found in workflow');
      return null;
    }

    const steps: FlowStep[] = [];
    const visited = new Set<string>();
    const queue = [startNode.id];

    // Build execution path
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      const node = nodes.find(n => n.id === nodeId);
      if (!node) continue;

      steps.push({
        id: `step-${nodeId}`,
        nodeId,
        nodeName: (node.data as any)?.label || node.id,
        status: 'pending'
      });

      // Find connected nodes
      const outgoingEdges = edges.filter(e => e.source === nodeId);
      outgoingEdges.forEach(edge => {
        if (!visited.has(edge.target)) {
          queue.push(edge.target);
        }
      });
    }

    const trace: FlowTrace = {
      id: `trace-${Date.now()}`,
      name: `Test Run - ${new Date().toLocaleTimeString()}`,
      status: 'running',
      steps,
      totalDuration: 0,
      arizeTraceId: `arize-${Math.random().toString(36).substr(2, 9)}`
    };

    return trace;
  }, [nodes, edges, showError]);

  // Start Arize tracing
  const startArizeTrace = useCallback(async (trace: FlowTrace) => {
    try {
      // Initialize Arize tracing session
      const arizeConfig = {
        traceId: trace.arizeTraceId,
        traceName: trace.name,
        workflow: {
          nodes: nodes.map(n => ({ id: n.id, type: n.type, name: n.data?.label })),
          edges: edges.map(e => ({ source: e.source, target: e.target }))
        },
        timestamp: new Date().toISOString()
      };

      showInfo(`Starting Arize trace: ${trace.arizeTraceId}`);
      console.log('Arize Trace Config:', arizeConfig);
      
      // In real implementation, this would call Arize API
      // await arize.startTrace(arizeConfig);
      
      return true;
    } catch (error) {
      console.error('Failed to start Arize trace:', error);
      showError('Failed to initialize Arize tracing');
      return false;
    }
  }, [nodes, edges, showInfo, showError]);

  // Execute workflow step with Arize logging
  const executeStep = useCallback(async (step: FlowStep, stepIndex: number) => {
    const node = nodes.find(n => n.id === step.nodeId);
    if (!node) return;

    // Update step status
    setActiveTrace(prev => {
      if (!prev) return null;
      const updatedSteps = [...prev.steps];
      updatedSteps[stepIndex] = {
        ...step,
        status: 'running',
        startTime: new Date()
      };
      return { ...prev, steps: updatedSteps };
    });

    // Update node visual state
    setNodeStates(prev => new Map(prev.set(step.nodeId, 'processing')));

    // Animate incoming edges
    const incomingEdges = edges.filter(e => e.target === step.nodeId);
    setAnimatedEdges(prev => {
      const newSet = new Set(prev);
      incomingEdges.forEach(edge => newSet.add(edge.id));
      return newSet;
    });

    try {
      // Simulate processing time based on node type
      const processingTime = node.type === 'agent' ? 3000 : 
                           node.type === 'condition' ? 1000 : 
                           node.type === 'action' ? 2000 : 1500;

      await new Promise(resolve => setTimeout(resolve, processingTime));

      // Generate mock output data
      const outputData = {
        nodeId: step.nodeId,
        nodeType: node.type,
        input: flowData.get(`input-${step.nodeId}`) || {},
        output: {
          success: true,
          data: `Processed by ${node.data?.label}`,
          timestamp: new Date().toISOString(),
          confidence: Math.random() * 0.3 + 0.7 // 0.7-1.0
        }
      };

      // Store flow data for next step
      setFlowData(prev => new Map(prev.set(`output-${step.nodeId}`, outputData.output)));

      // Log to Arize
      console.log('Arize Step Log:', {
        traceId: activeTrace?.arizeTraceId,
        stepId: step.id,
        nodeId: step.nodeId,
        nodeType: node.type,
        duration: processingTime,
        data: outputData
      });

      // Update step completion
      setActiveTrace(prev => {
        if (!prev) return null;
        const updatedSteps = [...prev.steps];
        updatedSteps[stepIndex] = {
          ...step,
          status: 'completed',
          startTime: step.startTime,
          endTime: new Date(),
          duration: processingTime,
          data: outputData
        };
        return { ...prev, steps: updatedSteps };
      });

      // Update node visual state
      setNodeStates(prev => new Map(prev.set(step.nodeId, 'completed')));

      showSuccess(`Completed: ${node.data?.label}`);
      
    } catch (error) {
      console.error('Step execution failed:', error);
      
      // Update step error
      setActiveTrace(prev => {
        if (!prev) return null;
        const updatedSteps = [...prev.steps];
        updatedSteps[stepIndex] = {
          ...step,
          status: 'error',
          endTime: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        return { ...prev, steps: updatedSteps };
      });

      setNodeStates(prev => new Map(prev.set(step.nodeId, 'error')));
      showError(`Failed: ${node.data?.label}`);
    }

    // Clear edge animations after delay
    setTimeout(() => {
      setAnimatedEdges(prev => {
        const newSet = new Set(prev);
        incomingEdges.forEach(edge => newSet.delete(edge.id));
        return newSet;
      });
    }, 1000);

  }, [nodes, edges, activeTrace?.arizeTraceId, flowData, showSuccess, showError]);

  // Start workflow test
  const startTest = useCallback(async () => {
    const trace = generateTestTrace();
    if (!trace) return;

    setActiveTrace(trace);
    setCurrentStepIndex(0);
    setIsRunning(true);
    setNodeStates(new Map());
    setFlowData(new Map());

    // Start Arize tracing
    const arizeStarted = await startArizeTrace(trace);
    if (!arizeStarted) return;

    onTestStart?.();
  }, [generateTestTrace, startArizeTrace, onTestStart]);

  // Execute next step
  useEffect(() => {
    if (!isRunning || !activeTrace || currentStepIndex >= activeTrace.steps.length) {
      if (isRunning && activeTrace) {
        // Test completed
        setIsRunning(false);
        setActiveTrace(prev => prev ? { ...prev, status: 'completed' } : null);
        showSuccess('Workflow test completed successfully!');
        onTestStop?.();
      }
      return;
    }

    const step = activeTrace.steps[currentStepIndex];
    executeStep(step, currentStepIndex).then(() => {
      setTimeout(() => setCurrentStepIndex(prev => prev + 1), 500);
    });
  }, [isRunning, activeTrace, currentStepIndex, executeStep, showSuccess, onTestStop]);

  const stopTest = useCallback(() => {
    setIsRunning(false);
    onTestStop?.();
  }, [onTestStop]);

  const getNodeIndicatorColor = (nodeId: string) => {
    const state = nodeStates.get(nodeId);
    switch (state) {
      case 'processing': return 'bg-blue-500 animate-pulse';
      case 'completed': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="space-y-4">
      {/* Add CSS animations */}
      <style>{`
        @keyframes flow-animation {
          0% { stroke-dashoffset: 15; }
          100% { stroke-dashoffset: 0; }
        }
        
        .node-indicator {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid white;
          z-index: 10;
        }
      `}</style>

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Workflow Testing with Arize Tracing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button 
              onClick={startTest} 
              disabled={isRunning || nodes.length === 0}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Start Test
            </Button>
            
            {isRunning && (
              <Button 
                variant="destructive"
                onClick={stopTest}
                className="flex items-center gap-2"
              >
                <Square className="h-4 w-4" />
                Stop Test
              </Button>
            )}

            {activeTrace?.arizeTraceId && (
              <Badge variant="outline" className="flex items-center gap-2">
                <BarChart3 className="h-3 w-3" />
                Arize: {activeTrace.arizeTraceId}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Flow Progress */}
      {activeTrace && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Flow Progress
              </span>
              <Badge 
                variant={activeTrace.status === 'completed' ? 'default' : 
                        activeTrace.status === 'error' ? 'destructive' : 'secondary'}
              >
                {activeTrace.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress 
                value={(currentStepIndex / activeTrace.steps.length) * 100} 
                className="w-full"
              />
              
              <div className="text-sm text-muted-foreground">
                Step {currentStepIndex + 1} of {activeTrace.steps.length}
              </div>

              {/* Step Timeline */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {activeTrace.steps.map((step, index) => (
                  <div 
                    key={step.id} 
                    className={`flex items-center gap-3 p-2 rounded border transition-all ${
                      index === currentStepIndex ? 'bg-blue-50 border-blue-200' :
                      step.status === 'completed' ? 'bg-green-50 border-green-200' :
                      step.status === 'error' ? 'bg-red-50 border-red-200' :
                      'bg-gray-50'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {step.status === 'running' && <Activity className="h-4 w-4 text-blue-600 animate-spin" />}
                      {step.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {step.status === 'error' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                      {step.status === 'pending' && <Clock className="h-4 w-4 text-gray-400" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{step.nodeName}</div>
                      {step.duration && (
                        <div className="text-xs text-muted-foreground">
                          {step.duration}ms
                        </div>
                      )}
                      {step.error && (
                        <div className="text-xs text-red-600">{step.error}</div>
                      )}
                    </div>

                    {index < activeTrace.steps.length - 1 && (
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Node Status Indicators (These would be positioned over the actual nodes) */}
      {isTestMode && (
        <Card>
          <CardHeader>
            <CardTitle>Node Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {nodes.map(node => (
                <div key={node.id} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getNodeIndicatorColor(node.id)}`} />
                  <span className="truncate">{(node.data as any)?.label || node.id}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Arize Integration Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Arize Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm">
            <strong>How Arize Works:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
              <li>Traces each workflow execution step-by-step</li>
              <li>Captures node performance metrics (latency, success rates)</li>
              <li>Logs input/output data for each processing step</li>
              <li>Provides observability for AI agent interactions</li>
              <li>Enables debugging and optimization insights</li>
            </ul>
          </div>
          
          {activeTrace?.arizeTraceId && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium">Active Trace</div>
              <div className="text-xs text-muted-foreground font-mono">
                {activeTrace.arizeTraceId}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Monitor this trace in your Arize dashboard for real-time insights
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnimatedFlowVisualizer;