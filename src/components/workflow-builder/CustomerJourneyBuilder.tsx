import React, { useCallback, useState, useRef, useEffect } from 'react';
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
  useReactFlow,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, MessageCircle, Phone, Mail, Calendar, CheckCircle, 
  AlertTriangle, Clock, Users, Workflow, Sparkles, Settings,
  Play, Pause, RotateCcw, Save, Download, Upload, Eye
} from 'lucide-react';
import { useMasterToast } from '@/hooks/useMasterToast';

// Custom Node Components
const CustomerNode = ({ data }: { data: any }) => (
  <div className="px-4 py-3 shadow-md rounded-md bg-background border-2 border-primary min-w-[180px]">
    <div className="flex items-center gap-2 mb-2">
      <Users className="h-4 w-4 text-primary" />
      <div className="font-bold text-sm">{data.label}</div>
    </div>
    <div className="text-xs text-muted-foreground">{data.description}</div>
    {data.persona && (
      <Badge variant="outline" className="mt-1 text-xs">{data.persona}</Badge>
    )}
  </div>
);

const TouchpointNode = ({ data }: { data: any }) => (
  <div className="px-4 py-3 shadow-md rounded-md bg-accent border-2 border-accent-foreground min-w-[160px]">
    <div className="flex items-center gap-2 mb-2">
      {data.channel === 'chat' && <MessageCircle className="h-4 w-4" />}
      {data.channel === 'phone' && <Phone className="h-4 w-4" />}
      {data.channel === 'email' && <Mail className="h-4 w-4" />}
      {data.channel === 'appointment' && <Calendar className="h-4 w-4" />}
      <div className="font-bold text-sm">{data.label}</div>
    </div>
    <div className="text-xs text-muted-foreground">{data.description}</div>
    {data.automationLevel && (
      <Badge variant="secondary" className="mt-1 text-xs">
        {data.automationLevel}% Automated
      </Badge>
    )}
  </div>
);

const DecisionNode = ({ data }: { data: any }) => (
  <div className="px-4 py-3 shadow-md rounded-md bg-yellow-100 border-2 border-yellow-400 min-w-[140px] dark:bg-yellow-900 dark:border-yellow-600">
    <div className="flex items-center gap-2 mb-2">
      <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      <div className="font-bold text-sm">{data.label}</div>
    </div>
    <div className="text-xs text-muted-foreground">{data.description}</div>
    {data.conditions && (
      <div className="mt-1 text-xs">
        {data.conditions.map((condition: string, idx: number) => (
          <Badge key={idx} variant="outline" className="mr-1 text-xs">{condition}</Badge>
        ))}
      </div>
    )}
  </div>
);

const AgentNode = ({ data }: { data: any }) => (
  <div className="px-4 py-3 shadow-md rounded-md bg-green-100 border-2 border-green-400 min-w-[160px] dark:bg-green-900 dark:border-green-600">
    <div className="flex items-center gap-2 mb-2">
      <Bot className="h-4 w-4 text-green-600 dark:text-green-400" />
      <div className="font-bold text-sm">{data.label}</div>
    </div>
    <div className="text-xs text-muted-foreground">{data.description}</div>
    <div className="mt-1 flex gap-1">
      {data.capabilities?.map((cap: string, idx: number) => (
        <Badge key={idx} variant="secondary" className="text-xs">{cap}</Badge>
      ))}
    </div>
  </div>
);

const nodeTypes: NodeTypes = {
  customer: CustomerNode,
  touchpoint: TouchpointNode,
  decision: DecisionNode,
  agent: AgentNode,
};

// Initial nodes for healthcare customer journey
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'customer',
    position: { x: 50, y: 100 },
    data: { 
      label: 'Patient Initial Contact', 
      description: 'Patient seeks healthcare service',
      persona: 'Healthcare Seeker'
    }
  },
  {
    id: '2',
    type: 'touchpoint',
    position: { x: 300, y: 100 },
    data: { 
      label: 'Initial Inquiry',
      description: 'Patient makes first contact',
      channel: 'chat',
      automationLevel: 80
    }
  },
  {
    id: '3',
    type: 'agent',
    position: { x: 550, y: 100 },
    data: { 
      label: 'Intake Assistant',
      description: 'AI agent handles initial screening',
      capabilities: ['Screening', 'Scheduling']
    }
  },
  {
    id: '4',
    type: 'decision',
    position: { x: 300, y: 250 },
    data: { 
      label: 'Urgency Assessment',
      description: 'Determine care urgency level',
      conditions: ['Emergency', 'Urgent', 'Routine']
    }
  }
];

const initialEdges: Edge[] = [
  { 
    id: 'e1-2', 
    source: '1', 
    target: '2',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#8b5cf6' }
  },
  { 
    id: 'e2-3', 
    source: '2', 
    target: '3',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#10b981' }
  },
  { 
    id: 'e2-4', 
    source: '2', 
    target: '4',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#f59e0b' }
  }
];

interface CustomerJourneyBuilderProps {
  onSave?: (workflow: any) => void;
  onGenerateAgent?: (workflow: any) => void;
  initialWorkflow?: any;
}

export const CustomerJourneyBuilder: React.FC<CustomerJourneyBuilderProps> = ({
  onSave,
  onGenerateAgent,
  initialWorkflow
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialWorkflow?.nodes || initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialWorkflow?.edges || initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const { showSuccess, showError } = useMasterToast();
  const { setViewport, getViewport } = useReactFlow();

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // AI-powered workflow generation
  const generateAIWorkflow = async (useCase: string) => {
    setIsGenerating(true);
    try {
      // Simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const aiGeneratedNodes = [
        {
          id: 'ai-1',
          type: 'customer',
          position: { x: 50, y: 400 },
          data: {
            label: `${useCase} Customer Entry`,
            description: `AI-generated entry point for ${useCase}`,
            persona: 'Target Persona'
          }
        },
        {
          id: 'ai-2',
          type: 'agent',
          position: { x: 300, y: 400 },
          data: {
            label: `${useCase} AI Agent`,
            description: `Specialized agent for ${useCase}`,
            capabilities: ['Analysis', 'Routing', 'Resolution']
          }
        }
      ];

      const aiGeneratedEdges = [
        {
          id: 'e-ai-1-2',
          source: 'ai-1',
          target: 'ai-2',
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#ec4899', strokeDasharray: '5,5' }
        }
      ];

      setNodes(prev => [...prev, ...aiGeneratedNodes]);
      setEdges(prev => [...prev, ...aiGeneratedEdges]);
      
      showSuccess('AI workflow generated successfully!');
    } catch (error) {
      showError('Failed to generate AI workflow');
    } finally {
      setIsGenerating(false);
    }
  };

  // Save workflow configuration
  const handleSave = () => {
    const workflowData = {
      nodes,
      edges,
      viewport: getViewport(),
      metadata: {
        created: new Date().toISOString(),
        version: '1.0',
        type: 'customer-journey'
      }
    };
    
    if (onSave) {
      onSave(workflowData);
    }
    showSuccess('Workflow saved successfully!');
  };

  // Generate agent from workflow
  const handleGenerateAgent = () => {
    const agentNodes = nodes.filter(node => node.type === 'agent');
    const workflowConfig = {
      nodes,
      edges,
      agentNodes,
      touchpoints: nodes.filter(node => node.type === 'touchpoint'),
      decisions: nodes.filter(node => node.type === 'decision')
    };

    if (onGenerateAgent) {
      onGenerateAgent(workflowConfig);
    }
    showSuccess('Agent configuration generated!');
  };

  // Add new node
  const addNode = (type: string, position = { x: 200, y: 200 }) => {
    const newNode = {
      id: `${Date.now()}`,
      type,
      position,
      data: {
        label: `New ${type}`,
        description: `Configure this ${type}`,
        ...(type === 'touchpoint' && { channel: 'chat', automationLevel: 50 }),
        ...(type === 'agent' && { capabilities: ['General'] }),
        ...(type === 'decision' && { conditions: ['Yes', 'No'] })
      }
    };
    setNodes(prev => [...prev, newNode]);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-2">
          <Workflow className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Customer Journey Builder</h2>
          <Badge variant="outline">AI-Powered</Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => generateAIWorkflow('Healthcare')}
            disabled={isGenerating}
          >
            <Sparkles className="h-4 w-4 mr-1" />
            {isGenerating ? 'Generating...' : 'AI Generate'}
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
          
          <Button 
            size="sm" 
            onClick={handleGenerateAgent}
            className="bg-primary hover:bg-primary/90"
          >
            <Bot className="h-4 w-4 mr-1" />
            Generate Agent
          </Button>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Node Palette */}
        <div className="w-64 border-r bg-muted/30 p-4">
          <h3 className="font-medium mb-3">Add Components</h3>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => addNode('customer')}
            >
              <Users className="h-4 w-4 mr-2" />
              Customer Touchpoint
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => addNode('touchpoint')}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Interaction Point
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => addNode('agent')}
            >
              <Bot className="h-4 w-4 mr-2" />
              AI Agent
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => addNode('decision')}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Decision Point
            </Button>
          </div>

          {/* Quick Templates */}
          <div className="mt-6">
            <h3 className="font-medium mb-3">Quick Templates</h3>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start text-xs"
                onClick={() => generateAIWorkflow('Patient Onboarding')}
              >
                Patient Onboarding
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start text-xs"
                onClick={() => generateAIWorkflow('Appointment Scheduling')}
              >
                Appointment Scheduling
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start text-xs"
                onClick={() => generateAIWorkflow('Insurance Verification')}
              >
                Insurance Verification
              </Button>
            </div>
          </div>
        </div>

        {/* Flow Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onNodeClick={(event, node) => setSelectedNode(node)}
            fitView
            attributionPosition="bottom-right"
          >
            <Controls />
            <MiniMap />
            <Background gap={20} size={1} />
          </ReactFlow>

          {/* Node Properties Panel */}
          {selectedNode && (
            <Card className="absolute top-4 right-4 w-72 max-h-96 overflow-auto">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  Node Properties
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedNode(null)}
                  >
                    ×
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs font-medium">Type</label>
                  <p className="text-sm capitalize">{selectedNode.type || 'unknown'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium">Label</label>
                  <p className="text-sm">{String(selectedNode.data?.label || 'No label')}</p>
                </div>
                <div>
                  <label className="text-xs font-medium">Description</label>
                  <p className="text-sm text-muted-foreground">
                    {String(selectedNode.data?.description || 'No description available')}
                  </p>
                </div>
                {selectedNode.type === 'agent' && selectedNode.data?.capabilities && Array.isArray(selectedNode.data.capabilities) && (
                  <div>
                    <label className="text-xs font-medium">Capabilities</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedNode.data.capabilities.map((cap: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs">{cap}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};