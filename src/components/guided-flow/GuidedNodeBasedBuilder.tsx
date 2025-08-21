import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeTypes,
  Handle,
  Position,
  MarkerType,
  useReactFlow,
  NodeProps,
  useKeyPress,
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bot, MessageCircle, Phone, Mail, Calendar, CheckCircle, 
  AlertTriangle, Clock, Users, Workflow, Sparkles, Settings,
  Play, Pause, RotateCcw, Save, Download, Upload, Eye, Plus, 
  Trash2, Lightbulb, Database, Cloud, Cpu, BookOpen, TestTube, 
  Rocket, Layers, GitBranch, Target, Zap, Brain, ChevronRight,
  Edit, Copy, X
} from 'lucide-react';
import { useJourneyAISuggestions, JourneyStep } from '@/hooks/useJourneyAISuggestions';
import { useWorkflowManager } from '@/hooks/useWorkflowManager';
import { useMasterToast } from '@/hooks/useMasterToast';
import { useNodeSuggestions } from '@/hooks/useNodeSuggestions';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AIInsightsPanel } from './AIInsightsPanel';

// Node Data Types
interface BaseNodeData {
  label: string;
  description: string;
  step: number;
  stepType: 'useCase' | 'journey' | 'decision' | 'agent' | 'template' | 'aiModel' | 'assets' | 'deployment' | 'channels' | 'testing' | 'deploy';
  status: 'pending' | 'configuring' | 'complete' | 'error';
  data?: any;
  config?: {
    onJourneyGenerated?: (suggestions: JourneyStep[]) => void;
  };
  journeySteps?: JourneyStep[];
}

// Typed NodeProps
interface TypedNodeProps extends Omit<NodeProps, 'data'> {
  data: BaseNodeData;
}

// Step 1: Use Case Node
const UseCaseNode: React.FC<TypedNodeProps> = ({ data, selected, id }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [useCase, setUseCase] = useState(data?.data?.useCase || '');
  const { generateSuggestions, isLoading } = useJourneyAISuggestions();

  const handleGenerateJourney = async () => {
    if (useCase.trim()) {
      const suggestions = await generateSuggestions(useCase);
      // Trigger creation of journey nodes
      if (suggestions) {
        data.config?.onJourneyGenerated?.(suggestions);
      }
    }
  };

  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 border-2 ${selected ? 'border-blue-500' : 'border-blue-300'} min-w-[280px] max-w-[400px]`}>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500" />
      
      <div className="flex items-center gap-2 mb-3">
        <Target className="h-5 w-5 text-blue-600" />
        <Badge variant="outline" className="text-xs">Step 1</Badge>
        <div className="font-bold text-sm text-blue-800">{(data as any).label}</div>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <Textarea
            value={useCase}
            onChange={(e) => setUseCase(e.target.value)}
            placeholder="Describe your use case in detail..."
            className="min-h-20 text-xs"
          />
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={handleGenerateJourney}
              disabled={isLoading || !useCase.trim()}
              className="text-xs"
            >
              {isLoading ? <Sparkles className="h-3 w-3 animate-spin mr-1" /> : <Brain className="h-3 w-3 mr-1" />}
              Generate Journey
            </Button>
            <Button size="sm" variant="outline" onClick={() => setIsEditing(false)} className="text-xs">
              Done
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-xs text-blue-700 line-clamp-3">{useCase || (data as any).description}</div>
          <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)} className="text-xs h-6">
            <Edit className="h-3 w-3 mr-1" />
            Edit Use Case
          </Button>
        </div>
      )}

      <div className="mt-2 flex items-center justify-between">
        <Badge variant={(data as any).status === 'complete' ? 'default' : 'secondary'} className="text-xs">
          {(data as any).status}
        </Badge>
        {(data as any).status === 'complete' && (
          <Button size="sm" className="h-6 w-6 p-0">
            <Plus className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};

// Step 2: Journey Steps Node
const JourneyStepsNode: React.FC<TypedNodeProps> = ({ data, selected }) => {
  const [selectedSteps, setSelectedSteps] = useState<string[]>([]);
  const [customSteps, setCustomSteps] = useState<JourneyStep[]>(data.journeySteps || []);

  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg bg-gradient-to-r from-green-50 to-green-100 border-2 ${selected ? 'border-green-500' : 'border-green-300'} min-w-[320px] max-w-[450px]`}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-green-500" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-green-500" />
      
      <div className="flex items-center gap-2 mb-3">
        <Workflow className="h-5 w-5 text-green-600" />
        <Badge variant="outline" className="text-xs">Step 2</Badge>
        <div className="font-bold text-sm text-green-800">{data.label}</div>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {customSteps.map((step, idx) => (
          <div key={step.id} className="flex items-start gap-2 p-2 bg-white/60 rounded border">
            <input
              type="checkbox"
              checked={selectedSteps.includes(step.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedSteps([...selectedSteps, step.id]);
                } else {
                  setSelectedSteps(selectedSteps.filter(id => id !== step.id));
                }
              }}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="text-xs font-medium text-green-800">{step.title}</div>
              <div className="text-xs text-green-600 line-clamp-2">{step.description}</div>
              <div className="flex gap-1 mt-1">
                <Badge variant="secondary" className="text-xs">{step.type}</Badge>
                <Badge variant="outline" className="text-xs">{step.riskLevel}</Badge>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <Badge variant={selectedSteps.length > 0 ? 'default' : 'secondary'} className="text-xs">
          {selectedSteps.length} Selected
        </Badge>
        <Button size="sm" className="h-6 w-6 p-0">
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

// Step 3: Decision Flow Node
const DecisionFlowNode: React.FC<TypedNodeProps> = ({ data, selected }) => {
  const [decisionType, setDecisionType] = useState<'single' | 'multiple' | 'loop'>('single');
  const [conditions, setConditions] = useState<string[]>(['Condition 1']);

  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 ${selected ? 'border-yellow-500' : 'border-yellow-300'} min-w-[280px]`}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-yellow-500" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-yellow-500" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-yellow-500" id="loop" />
      
      <div className="flex items-center gap-2 mb-3">
        <GitBranch className="h-5 w-5 text-yellow-600" />
        <Badge variant="outline" className="text-xs">Step 3</Badge>
        <div className="font-bold text-sm text-yellow-800">{data.label}</div>
      </div>

      <div className="space-y-3">
        <Select value={decisionType} onValueChange={(value: any) => setDecisionType(value)}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single">Single Agent</SelectItem>
            <SelectItem value="multiple">Multiple Agents</SelectItem>
            <SelectItem value="loop">Loop Back</SelectItem>
          </SelectContent>
        </Select>

        <div className="space-y-1">
          {conditions.map((condition, idx) => (
            <Input
              key={idx}
              value={condition}
              onChange={(e) => {
                const newConditions = [...conditions];
                newConditions[idx] = e.target.value;
                setConditions(newConditions);
              }}
              className="h-7 text-xs"
              placeholder="Decision condition"
            />
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <Badge variant="secondary" className="text-xs">{decisionType}</Badge>
        <Button size="sm" className="h-6 w-6 p-0">
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

// Additional node types for steps 4-11...
const AgentConfigNode: React.FC<TypedNodeProps> = ({ data, selected }) => (
  <div className={`px-4 py-3 shadow-lg rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 border-2 ${selected ? 'border-purple-500' : 'border-purple-300'} min-w-[250px]`}>
    <Handle type="target" position={Position.Left} className="w-3 h-3 bg-purple-500" />
    <Handle type="source" position={Position.Right} className="w-3 h-3 bg-purple-500" />
    
    <div className="flex items-center gap-2 mb-2">
      <Bot className="h-5 w-5 text-purple-600" />
      <Badge variant="outline" className="text-xs">Step 4</Badge>
      <div className="font-bold text-sm text-purple-800">{data.label}</div>
    </div>
    <div className="text-xs text-purple-700">{data.description}</div>
    <Badge variant="secondary" className="text-xs mt-2">{data.status}</Badge>
  </div>
);

const TemplateNode: React.FC<TypedNodeProps> = ({ data, selected }) => (
  <div className={`px-4 py-3 shadow-lg rounded-lg bg-gradient-to-r from-indigo-50 to-indigo-100 border-2 ${selected ? 'border-indigo-500' : 'border-indigo-300'} min-w-[250px]`}>
    <Handle type="target" position={Position.Left} className="w-3 h-3 bg-indigo-500" />
    <Handle type="source" position={Position.Right} className="w-3 h-3 bg-indigo-500" />
    
    <div className="flex items-center gap-2 mb-2">
      <Layers className="h-5 w-5 text-indigo-600" />
      <Badge variant="outline" className="text-xs">Step 6</Badge>
      <div className="font-bold text-sm text-indigo-800">{data.label}</div>
    </div>
    <div className="text-xs text-indigo-700">{data.description}</div>
    <Badge variant="secondary" className="text-xs mt-2">{data.status}</Badge>
  </div>
);

const AIModelNode: React.FC<TypedNodeProps> = ({ data, selected }) => (
  <div className={`px-4 py-3 shadow-lg rounded-lg bg-gradient-to-r from-cyan-50 to-cyan-100 border-2 ${selected ? 'border-cyan-500' : 'border-cyan-300'} min-w-[250px]`}>
    <Handle type="target" position={Position.Left} className="w-3 h-3 bg-cyan-500" />
    <Handle type="source" position={Position.Right} className="w-3 h-3 bg-cyan-500" />
    
    <div className="flex items-center gap-2 mb-2">
      <Brain className="h-5 w-5 text-cyan-600" />
      <Badge variant="outline" className="text-xs">Step 7</Badge>
      <div className="font-bold text-sm text-cyan-800">{data.label}</div>
    </div>
    <div className="text-xs text-cyan-700">{data.description}</div>
    <Badge variant="secondary" className="text-xs mt-2">{data.status}</Badge>
  </div>
);

const AssetsNode: React.FC<TypedNodeProps> = ({ data, selected }) => (
  <div className={`px-4 py-3 shadow-lg rounded-lg bg-gradient-to-r from-orange-50 to-orange-100 border-2 ${selected ? 'border-orange-500' : 'border-orange-300'} min-w-[250px]`}>
    <Handle type="target" position={Position.Left} className="w-3 h-3 bg-orange-500" />
    <Handle type="source" position={Position.Right} className="w-3 h-3 bg-orange-500" />
    
    <div className="flex items-center gap-2 mb-2">
      <Database className="h-5 w-5 text-orange-600" />
      <Badge variant="outline" className="text-xs">Step 8</Badge>
      <div className="font-bold text-sm text-orange-800">{data.label}</div>
    </div>
    <div className="text-xs text-orange-700">{data.description}</div>
    <Badge variant="secondary" className="text-xs mt-2">{data.status}</Badge>
  </div>
);

const DeploymentNode: React.FC<TypedNodeProps> = ({ data, selected }) => (
  <div className={`px-4 py-3 shadow-lg rounded-lg bg-gradient-to-r from-teal-50 to-teal-100 border-2 ${selected ? 'border-teal-500' : 'border-teal-300'} min-w-[250px]`}>
    <Handle type="target" position={Position.Left} className="w-3 h-3 bg-teal-500" />
    <Handle type="source" position={Position.Right} className="w-3 h-3 bg-teal-500" />
    
    <div className="flex items-center gap-2 mb-2">
      <Cloud className="h-5 w-5 text-teal-600" />
      <Badge variant="outline" className="text-xs">Step 9</Badge>
      <div className="font-bold text-sm text-teal-800">{data.label}</div>
    </div>
    <div className="text-xs text-teal-700">{data.description}</div>
    <Badge variant="secondary" className="text-xs mt-2">{data.status}</Badge>
  </div>
);

const ChannelsNode: React.FC<TypedNodeProps> = ({ data, selected }) => (
  <div className={`px-4 py-3 shadow-lg rounded-lg bg-gradient-to-r from-pink-50 to-pink-100 border-2 ${selected ? 'border-pink-500' : 'border-pink-300'} min-w-[250px]`}>
    <Handle type="target" position={Position.Left} className="w-3 h-3 bg-pink-500" />
    <Handle type="source" position={Position.Right} className="w-3 h-3 bg-pink-500" />
    
    <div className="flex items-center gap-2 mb-2">
      <MessageCircle className="h-5 w-5 text-pink-600" />
      <Badge variant="outline" className="text-xs">Step 10</Badge>
      <div className="font-bold text-sm text-pink-800">{data.label}</div>
    </div>
    <div className="text-xs text-pink-700">{data.description}</div>
    <Badge variant="secondary" className="text-xs mt-2">{data.status}</Badge>
  </div>
);

const TestingNode: React.FC<TypedNodeProps> = ({ data, selected }) => (
  <div className={`px-4 py-3 shadow-lg rounded-lg bg-gradient-to-r from-red-50 to-red-100 border-2 ${selected ? 'border-red-500' : 'border-red-300'} min-w-[250px]`}>
    <Handle type="target" position={Position.Left} className="w-3 h-3 bg-red-500" />
    <Handle type="source" position={Position.Right} className="w-3 h-3 bg-red-500" />
    
    <div className="flex items-center gap-2 mb-2">
      <TestTube className="h-5 w-5 text-red-600" />
      <Badge variant="outline" className="text-xs">Step 11</Badge>
      <div className="font-bold text-sm text-red-800">{data.label}</div>
    </div>
    <div className="text-xs text-red-700">{data.description}</div>
    <Badge variant="secondary" className="text-xs mt-2">{data.status}</Badge>
  </div>
);

// Node Types Registry
const nodeTypes: NodeTypes = {
  useCase: UseCaseNode,
  journey: JourneyStepsNode,
  decision: DecisionFlowNode,
  agent: AgentConfigNode,
  template: TemplateNode,
  aiModel: AIModelNode,
  assets: AssetsNode,
  deployment: DeploymentNode,
  channels: ChannelsNode,
  testing: TestingNode,
};

// Initial guided nodes representing the 11-step flow
const createInitialNodes = (): Node[] => [
  {
    id: 'step-1',
    type: 'useCase',
    position: { x: 50, y: 100 },
    data: {
      label: 'Define Use Case',
      description: 'Enter your use case description',
      step: 1,
      stepType: 'useCase',
      status: 'pending',
      config: {
        onJourneyGenerated: (suggestions: JourneyStep[]) => {
          // This will be handled by the parent component
          console.log('Journey generated:', suggestions);
        }
      }
    }
  },
  {
    id: 'step-2',
    type: 'journey',
    position: { x: 400, y: 100 },
    data: {
      label: 'AI Journey Steps',
      description: 'Review and select AI-generated journey steps',
      step: 2,
      stepType: 'journey',
      status: 'pending'
    }
  },
  {
    id: 'step-3',
    type: 'decision',
    position: { x: 750, y: 100 },
    data: {
      label: 'Decision Flow',
      description: 'Configure agent decisions and loops',
      step: 3,
      stepType: 'decision',
      status: 'pending'
    }
  },
  {
    id: 'step-4',
    type: 'agent',
    position: { x: 50, y: 300 },
    data: {
      label: 'Agent Config',
      description: 'Configure agent settings',
      step: 4,
      stepType: 'agent',
      status: 'pending'
    }
  },
  {
    id: 'step-6',
    type: 'template',
    position: { x: 400, y: 300 },
    data: {
      label: 'Templates',
      description: 'Assign canvas and templates',
      step: 6,
      stepType: 'template',
      status: 'pending'
    }
  },
  {
    id: 'step-7',
    type: 'aiModel',
    position: { x: 750, y: 300 },
    data: {
      label: 'AI Models',
      description: 'Assign AI models to actions',
      step: 7,
      stepType: 'aiModel',
      status: 'pending'
    }
  },
  {
    id: 'step-8',
    type: 'assets',
    position: { x: 50, y: 500 },
    data: {
      label: 'Assets & Connectors',
      description: 'Configure variables, libraries, APIs, DB, Knowledge base',
      step: 8,
      stepType: 'assets',
      status: 'pending'
    }
  },
  {
    id: 'step-9',
    type: 'deployment',
    position: { x: 400, y: 500 },
    data: {
      label: 'Deployment Modes',
      description: 'Set up Dev, Test, UAT, Prod environments',
      step: 9,
      stepType: 'deployment',
      status: 'pending'
    }
  },
  {
    id: 'step-10',
    type: 'channels',
    position: { x: 750, y: 500 },
    data: {
      label: 'Channel Assignment',
      description: 'Configure single or multiple channels',
      step: 10,
      stepType: 'channels',
      status: 'pending'
    }
  },
  {
    id: 'step-11',
    type: 'testing',
    position: { x: 400, y: 700 },
    data: {
      label: 'Testing & Deploy',
      description: 'Test and deploy your agent',
      step: 11,
      stepType: 'testing',
      status: 'pending'
    }
  }
];

const createInitialEdges = (): Edge[] => [
  { id: 'e1-2', source: 'step-1', target: 'step-2', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#8b5cf6' } },
  { id: 'e2-3', source: 'step-2', target: 'step-3', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#10b981' } },
  { id: 'e3-4', source: 'step-3', target: 'step-4', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#f59e0b' } },
  { id: 'e4-6', source: 'step-4', target: 'step-6', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#8b5cf6' } },
  { id: 'e6-7', source: 'step-6', target: 'step-7', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#10b981' } },
  { id: 'e7-8', source: 'step-7', target: 'step-8', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#f59e0b' } },
  { id: 'e8-9', source: 'step-8', target: 'step-9', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#8b5cf6' } },
  { id: 'e9-10', source: 'step-9', target: 'step-10', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#10b981' } },
  { id: 'e10-11', source: 'step-10', target: 'step-11', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#f59e0b' } }
];

interface GuidedNodeBasedBuilderProps {
  sessionId?: string;
  onComplete?: (agentData: any) => void;
}

export const GuidedNodeBasedBuilder: React.FC<GuidedNodeBasedBuilderProps> = ({
  sessionId,
  onComplete
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(createInitialNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(createInitialEdges());
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [contextMenuNode, setContextMenuNode] = useState<Node | null>(null);
  const [showProgress, setShowProgress] = useState(true);
  const [showAIInsights, setShowAIInsights] = useState(true);
  const [suggestedNodes, setSuggestedNodes] = useState<any[]>([]);
  
  const { showSuccess, showError } = useMasterToast();
  const { createWorkflow, autoSaveWorkflow } = useWorkflowManager(sessionId);
  const { generateSuggestions, isLoading, suggestions } = useJourneyAISuggestions();
  const { 
    getNodeConfigTemplate,
    validateNodeConfig,
    trackNodeUsage 
  } = useNodeSuggestions();

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setCurrentStep((node.data as unknown as BaseNodeData).step);
  }, []);

  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    setContextMenuNode(node);
  }, []);

  // Auto-save functionality
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (sessionId && nodes.length > 0) {
        autoSaveWorkflow({
          id: sessionId,
          nodes,
          edges,
          metadata: { currentStep, lastModified: new Date().toISOString() }
        });
      }
    }, 2000);

    return () => clearTimeout(saveTimer);
  }, [nodes, edges, currentStep, sessionId]);

  const handleJourneyGenerated = useCallback((suggestions: JourneyStep[]) => {
    // Update the journey node with AI suggestions
    setNodes((nds) =>
      nds.map((node) =>
        node.id === 'step-2'
          ? {
              ...node,
              data: {
                ...node.data,
                journeySteps: suggestions,
                status: 'configuring'
              }
            }
          : node
      )
    );
    showSuccess(`Generated ${suggestions.length} journey steps!`);
  }, [setNodes, showSuccess]);

  const updateNodeConfig = useCallback((nodeId: string, config: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                config,
                status: 'complete'
              }
            }
          : node
      )
    );
  }, [setNodes]);

  const addConnectorNode = useCallback((sourceNodeId: string) => {
    const sourceNode = nodes.find(n => n.id === sourceNodeId);
    if (!sourceNode) return;

    const newNode: Node = {
      id: `connector-${Date.now()}`,
      type: 'assets',
      position: {
        x: sourceNode.position.x + 300,
        y: sourceNode.position.y + 100
      },
      data: {
        label: 'New Connector',
        description: 'Configure connector settings',
        step: 8,
        stepType: 'assets',
        status: 'pending'
      }
    };

    const newEdge: Edge = {
      id: `e-${sourceNodeId}-${newNode.id}`,
      source: sourceNodeId,
      target: newNode.id,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#6366f1', strokeDasharray: '5,5' }
    };

    setNodes((nds) => [...nds, newNode]);
    setEdges((eds) => [...eds, newEdge]);
  }, [nodes, setNodes, setEdges]);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter(n => n.id !== nodeId));
    setEdges((eds) => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
  }, [setNodes, setEdges]);

  const duplicateNode = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    const newNode: Node = {
      ...node,
      id: `${nodeId}-copy-${Date.now()}`,
      position: {
        x: node.position.x + 50,
        y: node.position.y + 50
      }
    };

    setNodes((nds) => [...nds, newNode]);
  }, [nodes, setNodes]);

  const completedSteps = nodes.filter(node => node.data.status === 'complete').length;
  const progress = (completedSteps / nodes.length) * 100;

  // Handle AI suggested node addition
  const handleAddSuggestedNode = useCallback(async (suggestedNode: any) => {
    const template = await getNodeConfigTemplate(suggestedNode.type);
    const validation = validateNodeConfig(suggestedNode.type, suggestedNode.config);
    
    if (!validation.isValid) {
      showError(`Invalid node configuration: ${validation.errors.join(', ')}`);
      return;
    }

    const newNode: Node = {
      id: `${suggestedNode.type}-${Date.now()}`,
      type: suggestedNode.type,
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 400 + 100 
      },
      data: {
        label: suggestedNode.label,
        description: suggestedNode.description,
        step: nodes.length + 1,
        stepType: suggestedNode.type as any,
        status: 'pending',
        config: { ...template, ...suggestedNode.config }
      }
    };

    setNodes((nds) => [...nds, newNode]);
    
    // Track usage for analytics
    trackNodeUsage({
      nodeType: suggestedNode.type,
      nodeId: newNode.id,
      action: 'created'
    });
    
    showSuccess(`${suggestedNode.label} node added successfully`);
  }, [nodes.length, setNodes, getNodeConfigTemplate, validateNodeConfig, trackNodeUsage, showSuccess, showError]);

  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Progress Header */}
      {showProgress && (
        <div className="bg-white border-b p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-slate-800">Guided Agent Builder</h2>
            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-600">
                Step {currentStep} of 11 • {completedSteps} completed
              </div>
              <Button size="sm" variant="outline" onClick={() => setShowProgress(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Flow Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onNodeContextMenu={onNodeContextMenu}
          nodeTypes={nodeTypes}
          fitView
          className="bg-gradient-to-br from-slate-50 to-slate-100"
        >
          <Controls className="bg-white/90 backdrop-blur border shadow-lg" />
          <MiniMap 
            className="bg-white/90 backdrop-blur border shadow-lg" 
            nodeColor={(node) => {
              switch (node.data.status) {
                case 'complete': return '#10b981';
                case 'configuring': return '#f59e0b';
                case 'error': return '#ef4444';
                default: return '#6b7280';
              }
            }}
          />
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        </ReactFlow>

        {/* Context Menu */}
        {contextMenuNode && (
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <div className="fixed top-0 left-0 w-full h-full pointer-events-none" />
            </ContextMenuTrigger>
            <ContextMenuContent className="w-48">
              <ContextMenuItem onClick={() => addConnectorNode(contextMenuNode.id)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Connector
              </ContextMenuItem>
              <ContextMenuItem onClick={() => duplicateNode(contextMenuNode.id)}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate Node
              </ContextMenuItem>
              <ContextMenuItem onClick={() => deleteNode(contextMenuNode.id)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Node
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        )}
      </div>

      {/* Action Bar */}
      <div className="bg-white border-t p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs">
              {nodes.length} Nodes • {edges.length} Connections
            </Badge>
            {selectedNode && (
              <Badge variant="secondary" className="text-xs">
                Selected: {selectedNode.data.label as string}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline">
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button size="sm" variant="outline">
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-blue-500 to-purple-600"
              disabled={progress < 100}
            >
              <Rocket className="h-4 w-4 mr-1" />
              Deploy Agent
            </Button>
          </div>
        </div>
      </div>

      {/* AI Insights Panel */}
      <AIInsightsPanel
        isVisible={showAIInsights}
        onClose={() => setShowAIInsights(false)}
        onAddNode={handleAddSuggestedNode}
        currentNodes={nodes}
        onNodeSuggestion={setSuggestedNodes}
      />

      {/* AI Insights Toggle Button */}
      <Button
        className="fixed bottom-4 left-4 z-40 bg-gradient-to-r from-purple-500 to-blue-600 shadow-lg"
        onClick={() => setShowAIInsights(!showAIInsights)}
      >
        <Brain className="h-4 w-4 mr-2" />
        {showAIInsights ? 'Hide' : 'Show'} AI Insights
      </Button>
    </div>
  );
};

export default GuidedNodeBasedBuilder;