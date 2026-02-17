import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Activity, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Target,
  ArrowRight,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FlowNode {
  id: string;
  type: string;
  label: string;
  status: 'idle' | 'running' | 'success' | 'error';
  position: { x: number; y: number };
  metadata?: any;
}

interface FlowEdge {
  id: string;
  source: string;
  target: string;
  animated: boolean;
  status: 'idle' | 'active' | 'completed';
}

interface AnimationState {
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
  progress: number;
}

export const AnimatedFlowVisualizer: React.FC = () => {
  const [testMode, setTestMode] = useState(false);
  const [animationState, setAnimationState] = useState<AnimationState>({
    isPlaying: false,
    currentStep: 0,
    totalSteps: 0,
    progress: 0
  });

  // Sample workflow data
  const [nodes, setNodes] = useState<FlowNode[]>([
    { id: '1', type: 'trigger', label: 'User Input', status: 'idle', position: { x: 100, y: 100 } },
    { id: '2', type: 'llm', label: 'GPT-4 Analysis', status: 'idle', position: { x: 300, y: 100 } },
    { id: '3', type: 'decision', label: 'Route Decision', status: 'idle', position: { x: 500, y: 100 } },
    { id: '4', type: 'action', label: 'Send Response', status: 'idle', position: { x: 700, y: 50 } },
    { id: '5', type: 'action', label: 'Escalate to Human', status: 'idle', position: { x: 700, y: 150 } }
  ]);

  const [edges, setEdges] = useState<FlowEdge[]>([
    { id: 'e1-2', source: '1', target: '2', animated: false, status: 'idle' },
    { id: 'e2-3', source: '2', target: '3', animated: false, status: 'idle' },
    { id: 'e3-4', source: '3', target: '4', animated: false, status: 'idle' },
    { id: 'e3-5', source: '3', target: '5', animated: false, status: 'idle' }
  ]);

  const resetAnimation = useCallback(() => {
    setNodes(prev => prev.map(node => ({ ...node, status: 'idle' })));
    setEdges(prev => prev.map(edge => ({ ...edge, animated: false, status: 'idle' })));
    setAnimationState({
      isPlaying: false,
      currentStep: 0,
      totalSteps: nodes.length,
      progress: 0
    });
  }, [nodes.length]);

  const runAnimation = useCallback(async () => {
    if (!testMode) {
      toast.error('Please enable test mode first');
      return;
    }

    setAnimationState(prev => ({ ...prev, isPlaying: true, totalSteps: nodes.length }));
    
    // Simulate workflow execution
    const nodeSequence = ['1', '2', '3', '4']; // Simulate one path
    
    for (let i = 0; i < nodeSequence.length; i++) {
      const nodeId = nodeSequence[i];
      const progress = ((i + 1) / nodeSequence.length) * 100;
      
      // Activate current node
      setNodes(prev => prev.map(node => 
        node.id === nodeId ? { ...node, status: 'running' } : node
      ));
      
      // Animate incoming edge
      if (i > 0) {
        const prevNodeId = nodeSequence[i - 1];
        setEdges(prev => prev.map(edge => 
          edge.source === prevNodeId && edge.target === nodeId 
            ? { ...edge, animated: true, status: 'active' } 
            : edge
        ));
      }
      
      // Update animation state
      setAnimationState(prev => ({
        ...prev,
        currentStep: i + 1,
        progress
      }));
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Complete current node
      setNodes(prev => prev.map(node => 
        node.id === nodeId ? { ...node, status: 'success' } : node
      ));
      
      // Complete edge
      if (i > 0) {
        const prevNodeId = nodeSequence[i - 1];
        setEdges(prev => prev.map(edge => 
          edge.source === prevNodeId && edge.target === nodeId 
            ? { ...edge, status: 'completed' } 
            : edge
        ));
      }
    }
    
    setAnimationState(prev => ({ ...prev, isPlaying: false }));
    toast.success('Workflow execution completed');
  }, [testMode, nodes.length]);

  const pauseAnimation = () => {
    setAnimationState(prev => ({ ...prev, isPlaying: false }));
  };

  const getNodeStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Clock className="w-4 h-4 animate-spin" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getNodeStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'border-blue-500 bg-blue-50 text-blue-700';
      case 'success':
        return 'border-green-500 bg-green-50 text-green-700';
      case 'error':
        return 'border-red-500 bg-red-50 text-red-700';
      default:
        return 'border-gray-300 bg-white text-gray-700';
    }
  };

  const getEdgeClass = (edge: FlowEdge) => {
    const baseClass = 'stroke-2 fill-none';
    if (edge.animated) {
      return `${baseClass} stroke-blue-500 animate-pulse`;
    }
    if (edge.status === 'completed') {
      return `${baseClass} stroke-green-500`;
    }
    return `${baseClass} stroke-gray-300`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Animated Flow Visualization</h2>
          <p className="text-muted-foreground">Real-time workflow execution monitoring with animations</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="test-mode">Test Mode</Label>
            <Switch
              id="test-mode"
              checked={testMode}
              onCheckedChange={setTestMode}
            />
          </div>
          <Badge variant={testMode ? "default" : "secondary"}>
            {testMode ? 'Test Mode Active' : 'Test Mode Disabled'}
          </Badge>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Animation Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              onClick={runAnimation}
              disabled={!testMode || animationState.isPlaying}
              className="flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Start Animation
            </Button>
            
            <Button
              onClick={pauseAnimation}
              disabled={!animationState.isPlaying}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Pause className="w-4 h-4" />
              Pause
            </Button>
            
            <Button
              onClick={resetAnimation}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-muted-foreground">
                Step {animationState.currentStep} of {animationState.totalSteps}
              </span>
              <div className="w-32">
                <Progress value={animationState.progress} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flow Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Workflow Execution Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative bg-gray-50 rounded-lg p-8 min-h-[400px] overflow-hidden">
            {/* SVG for edges */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {edges.map((edge) => {
                const sourceNode = nodes.find(n => n.id === edge.source);
                const targetNode = nodes.find(n => n.id === edge.target);
                if (!sourceNode || !targetNode) return null;

                const sourceX = sourceNode.position.x + 60; // Node width / 2
                const sourceY = sourceNode.position.y + 25; // Node height / 2
                const targetX = targetNode.position.x;
                const targetY = targetNode.position.y + 25;

                return (
                  <g key={edge.id}>
                    <line
                      x1={sourceX}
                      y1={sourceY}
                      x2={targetX}
                      y2={targetY}
                      className={getEdgeClass(edge)}
                      markerEnd="url(#arrowhead)"
                    />
                    {edge.animated && (
                      <circle
                        r="4"
                        fill="currentColor"
                        className="text-blue-500"
                      >
                        <animateMotion
                          dur="1.5s"
                          repeatCount="indefinite"
                          path={`M${sourceX},${sourceY} L${targetX},${targetY}`}
                        />
                      </circle>
                    )}
                  </g>
                );
              })}
              
              {/* Arrow marker */}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    className="fill-current"
                  />
                </marker>
              </defs>
            </svg>

            {/* Nodes */}
            {nodes.map((node) => (
              <div
                key={node.id}
                className={cn(
                  'absolute bg-white border-2 rounded-lg p-3 shadow-sm transition-all duration-300',
                  getNodeStatusColor(node.status),
                  node.status === 'running' && 'scale-105 shadow-lg'
                )}
                style={{
                  left: node.position.x,
                  top: node.position.y,
                  width: 120,
                  minHeight: 50
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  {getNodeStatusIcon(node.status)}
                  <span className="text-xs font-medium">{node.type}</span>
                </div>
                <div className="text-sm font-medium">{node.label}</div>
                
                {node.status === 'running' && (
                  <div className="mt-2">
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      <span className="text-xs">Processing...</span>
                    </div>
                    <div className="w-full bg-white/50 rounded-full h-1 mt-1">
                      <div className="bg-current h-1 rounded-full animate-pulse" style={{ width: '60%' }} />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Live Status Indicators */}
            {testMode && (
              <div className="absolute top-4 right-4 bg-white border rounded-lg p-3 shadow-sm">
                <div className="text-sm font-medium mb-2">Live Status</div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'w-2 h-2 rounded-full',
                      animationState.isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
                    )} />
                    <span>Execution {animationState.isPlaying ? 'Active' : 'Idle'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>Step {animationState.currentStep}/{animationState.totalSteps}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Execution Metrics */}
      {testMode && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Nodes Executed</p>
                  <p className="text-2xl font-bold">{animationState.currentStep}</p>
                </div>
                <Activity className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">100%</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Latency</p>
                  <p className="text-2xl font-bold">1.5s</p>
                </div>
                <Zap className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Progress</p>
                  <p className="text-2xl font-bold">{Math.round(animationState.progress)}%</p>
                </div>
                <Target className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};