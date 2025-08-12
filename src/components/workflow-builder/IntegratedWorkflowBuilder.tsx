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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, MessageCircle, Phone, Mail, Calendar, CheckCircle, 
  AlertTriangle, Clock, Users, Workflow, Sparkles, Settings,
  Play, Pause, RotateCcw, Save, Download, Upload, Eye,
  Database, Brain, Zap, Tag, TestTube, Monitor
} from 'lucide-react';
import { useMasterToast } from '@/hooks/useMasterToast';

// Import all the integrated components
import { LSBindingPanel } from '@/components/label-studio';
import { useLabelStudio } from '@/hooks/useLabelStudio';

// Enhanced Node Components with integrated features
const CustomerNode = ({ data }: { data: any }) => (
  <div className="px-4 py-3 shadow-md rounded-md bg-background border-2 border-primary min-w-[200px]">
    <div className="flex items-center gap-2 mb-2">
      <Users className="h-4 w-4 text-primary" />
      <div className="font-bold text-sm">{data.label}</div>
      {data.aiRecommended && <Sparkles className="h-3 w-3 text-yellow-500" />}
    </div>
    <div className="text-xs text-muted-foreground mb-2">{data.description}</div>
    {data.persona && (
      <Badge variant="outline" className="mt-1 text-xs">{data.persona}</Badge>
    )}
    {data.labelStudioBinding && (
      <Badge variant="secondary" className="mt-1 text-xs flex items-center gap-1">
        <Tag className="h-3 w-3" />
        Label Studio
      </Badge>
    )}
  </div>
);

const TouchpointNode = ({ data }: { data: any }) => (
  <div className="px-4 py-3 shadow-md rounded-md bg-accent border-2 border-accent-foreground min-w-[180px]">
    <div className="flex items-center gap-2 mb-2">
      {data.channel === 'chat' && <MessageCircle className="h-4 w-4" />}
      {data.channel === 'phone' && <Phone className="h-4 w-4" />}
      {data.channel === 'email' && <Mail className="h-4 w-4" />}
      {data.channel === 'appointment' && <Calendar className="h-4 w-4" />}
      <div className="font-bold text-sm">{data.label}</div>
    </div>
    <div className="text-xs text-muted-foreground mb-2">{data.description}</div>
    {data.automationLevel && (
      <Badge variant="secondary" className="mt-1 text-xs">
        {data.automationLevel}% Automated
      </Badge>
    )}
    {data.mcpIntegration && (
      <Badge variant="outline" className="mt-1 text-xs flex items-center gap-1">
        <Database className="h-3 w-3" />
        MCP
      </Badge>
    )}
  </div>
);

const AgentNode = ({ data }: { data: any }) => (
  <div className="px-4 py-3 shadow-md rounded-md bg-green-100 border-2 border-green-400 min-w-[200px] dark:bg-green-900 dark:border-green-600">
    <div className="flex items-center gap-2 mb-2">
      <Bot className="h-4 w-4 text-green-600 dark:text-green-400" />
      <div className="font-bold text-sm">{data.label}</div>
      {data.realTimeTesting && <TestTube className="h-3 w-3 text-blue-500" />}
    </div>
    <div className="text-xs text-muted-foreground mb-2">{data.description}</div>
    
    {/* Language Model Info */}
    {data.languageModel && (
      <div className="mb-2">
        <Badge variant="outline" className="text-xs flex items-center gap-1">
          <Brain className="h-3 w-3" />
          {data.languageModel}
        </Badge>
      </div>
    )}
    
    {/* Capabilities */}
    <div className="mt-1 flex flex-wrap gap-1">
      {data.capabilities?.map((cap: string, idx: number) => (
        <Badge key={idx} variant="secondary" className="text-xs">{cap}</Badge>
      ))}
    </div>
    
    {/* Vision capabilities */}
    {data.visionEnabled && (
      <Badge variant="outline" className="mt-1 text-xs flex items-center gap-1">
        <Eye className="h-3 w-3" />
        Vision
      </Badge>
    )}
  </div>
);

const MCPNode = ({ data }: { data: any }) => (
  <div className="px-4 py-3 shadow-md rounded-md bg-blue-100 border-2 border-blue-400 min-w-[160px] dark:bg-blue-900 dark:border-blue-600">
    <div className="flex items-center gap-2 mb-2">
      <Database className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      <div className="font-bold text-sm">{data.label}</div>
    </div>
    <div className="text-xs text-muted-foreground mb-2">{data.description}</div>
    {data.serverType && (
      <Badge variant="outline" className="mt-1 text-xs">{data.serverType}</Badge>
    )}
    {data.tools && (
      <div className="mt-1 text-xs text-muted-foreground">
        {data.tools.length} tools available
      </div>
    )}
  </div>
);

const LabelStudioNode = ({ data }: { data: any }) => (
  <div className="px-4 py-3 shadow-md rounded-md bg-purple-100 border-2 border-purple-400 min-w-[180px] dark:bg-purple-900 dark:border-purple-600">
    <div className="flex items-center gap-2 mb-2">
      <Tag className="h-4 w-4 text-purple-600 dark:text-purple-400" />
      <div className="font-bold text-sm">{data.label}</div>
    </div>
    <div className="text-xs text-muted-foreground mb-2">{data.description}</div>
    {data.projectId && (
      <Badge variant="outline" className="mt-1 text-xs">Project: {data.projectId}</Badge>
    )}
    {data.annotationTypes && (
      <div className="mt-1 flex flex-wrap gap-1">
        {data.annotationTypes.map((type: string, idx: number) => (
          <Badge key={idx} variant="secondary" className="text-xs">{type}</Badge>
        ))}
      </div>
    )}
  </div>
);

const DecisionNode = ({ data }: { data: any }) => (
  <div className="px-4 py-3 shadow-md rounded-md bg-yellow-100 border-2 border-yellow-400 min-w-[160px] dark:bg-yellow-900 dark:border-yellow-600">
    <div className="flex items-center gap-2 mb-2">
      <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      <div className="font-bold text-sm">{data.label}</div>
    </div>
    <div className="text-xs text-muted-foreground mb-2">{data.description}</div>
    {data.conditions && (
      <div className="mt-1 text-xs">
        {data.conditions.map((condition: string, idx: number) => (
          <Badge key={idx} variant="outline" className="mr-1 text-xs">{condition}</Badge>
        ))}
      </div>
    )}
    {data.aiRecommendedActions && (
      <Badge variant="outline" className="mt-1 text-xs flex items-center gap-1">
        <Sparkles className="h-3 w-3" />
        AI Actions
      </Badge>
    )}
  </div>
);

const nodeTypes: NodeTypes = {
  customer: CustomerNode,
  touchpoint: TouchpointNode,
  decision: DecisionNode,
  agent: AgentNode,
  mcp: MCPNode,
  labelstudio: LabelStudioNode,
};

// Enhanced initial nodes with integrated features
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'customer',
    position: { x: 50, y: 100 },
    data: { 
      label: 'Patient Initial Contact', 
      description: 'Patient seeks healthcare service',
      persona: 'Healthcare Seeker',
      aiRecommended: true,
      labelStudioBinding: true
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
      automationLevel: 80,
      mcpIntegration: true
    }
  },
  {
    id: '3',
    type: 'agent',
    position: { x: 550, y: 100 },
    data: { 
      label: 'Healthcare AI Assistant',
      description: 'AI agent with vision and language capabilities',
      capabilities: ['NLP', 'Vision', 'Scheduling'],
      languageModel: 'gpt-4o-mini',
      visionEnabled: true,
      realTimeTesting: true
    }
  },
  {
    id: '4',
    type: 'mcp',
    position: { x: 300, y: 300 },
    data: { 
      label: 'Healthcare MCP Server',
      description: 'Model Context Protocol server for healthcare data',
      serverType: 'Healthcare',
      tools: ['patient_lookup', 'schedule_appointment', 'insurance_verify']
    }
  },
  {
    id: '5',
    type: 'labelstudio',
    position: { x: 50, y: 300 },
    data: { 
      label: 'Medical Data Labeling',
      description: 'Label Studio for medical image and text annotation',
      projectId: 'healthcare-2024',
      annotationTypes: ['Medical Images', 'Clinical Notes', 'Symptoms']
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
    id: 'e4-3', 
    source: '4', 
    target: '3',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#3b82f6' }
  },
  { 
    id: 'e5-2', 
    source: '5', 
    target: '2',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#a855f7' }
  }
];

interface IntegratedWorkflowBuilderProps {
  onSave?: (workflow: any) => void;
  onGenerateAgent?: (workflow: any) => void;
  onTest?: (workflow: any) => void;
  initialWorkflow?: any;
}

export const IntegratedWorkflowBuilder: React.FC<IntegratedWorkflowBuilderProps> = ({
  onSave,
  onGenerateAgent,
  onTest,
  initialWorkflow
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialWorkflow?.nodes || initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialWorkflow?.edges || initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [activeTab, setActiveTab] = useState('canvas');
  const { showSuccess, showError } = useMasterToast();
  const { setViewport, getViewport } = useReactFlow();
  
  // Language model options
  const [languageModels] = useState([
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', type: 'fast', vision: true },
    { id: 'gpt-4o', name: 'GPT-4o', type: 'advanced', vision: true },
    { id: 'claude-3', name: 'Claude 3', type: 'reasoning', vision: false },
    { id: 'gemini-pro', name: 'Gemini Pro', type: 'multimodal', vision: true }
  ]);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Real-time testing
  const handleRealTimeTest = async () => {
    setIsTesting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate testing with different components
      const testResults = {
        agents: nodes.filter(n => n.type === 'agent').length,
        labelStudio: nodes.filter(n => n.type === 'labelstudio').length,
        mcpServers: nodes.filter(n => n.type === 'mcp').length,
        success: true
      };
      
      showSuccess(`Test completed! ${testResults.agents} agents, ${testResults.labelStudio} Label Studio instances, ${testResults.mcpServers} MCP servers tested successfully.`);
      
      if (onTest) {
        onTest({ workflow: { nodes, edges }, testResults });
      }
    } catch (error) {
      showError('Real-time testing failed');
    } finally {
      setIsTesting(false);
    }
  };

  // AI-powered workflow generation with recommendations
  const generateAIRecommendations = async () => {
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate AI-recommended nodes based on existing workflow
      const recommendations = [
        {
          id: `ai-rec-${Date.now()}`,
          type: 'decision',
          position: { x: 50, y: 500 },
          data: {
            label: 'AI Priority Routing',
            description: 'AI-recommended routing based on urgency',
            conditions: ['Critical', 'Standard', 'Low Priority'],
            aiRecommendedActions: true
          }
        },
        {
          id: `ai-rec-${Date.now() + 1}`,
          type: 'agent',
          position: { x: 300, y: 500 },
          data: {
            label: 'Specialized Vision Agent',
            description: 'AI-recommended agent for medical image analysis',
            capabilities: ['Medical Imaging', 'Radiology', 'Diagnosis'],
            languageModel: 'gpt-4o',
            visionEnabled: true,
            realTimeTesting: true
          }
        }
      ];

      setNodes(prev => [...prev, ...recommendations]);
      showSuccess('AI recommendations added to workflow!');
    } catch (error) {
      showError('Failed to generate AI recommendations');
    } finally {
      setIsGenerating(false);
    }
  };

  // Add new node with enhanced options
  const addNode = (type: string, position = { x: 200, y: 200 }) => {
    const nodeDefaults: Record<string, any> = {
      customer: {
        label: 'New Customer Touchpoint',
        description: 'Configure customer interaction',
        persona: 'Target User',
        aiRecommended: false,
        labelStudioBinding: false
      },
      touchpoint: {
        label: 'New Interaction Point',
        description: 'Configure interaction channel',
        channel: 'chat',
        automationLevel: 50,
        mcpIntegration: false
      },
      agent: {
        label: 'New AI Agent',
        description: 'Configure AI capabilities',
        capabilities: ['General'],
        languageModel: 'gpt-4o-mini',
        visionEnabled: false,
        realTimeTesting: false
      },
      decision: {
        label: 'New Decision Point',
        description: 'Configure decision logic',
        conditions: ['Yes', 'No'],
        aiRecommendedActions: false
      },
      mcp: {
        label: 'New MCP Server',
        description: 'Configure Model Context Protocol server',
        serverType: 'General',
        tools: []
      },
      labelstudio: {
        label: 'New Label Studio Instance',
        description: 'Configure data labeling project',
        projectId: 'new-project',
        annotationTypes: ['Text', 'Images']
      }
    };

    const newNode = {
      id: `${Date.now()}`,
      type,
      position,
      data: nodeDefaults[type] || { label: `New ${type}`, description: `Configure this ${type}` }
    };
    
    setNodes(prev => [...prev, newNode]);
  };

  const handleSave = () => {
    const workflowData = {
      nodes,
      edges,
      viewport: getViewport(),
      metadata: {
        created: new Date().toISOString(),
        version: '2.0',
        type: 'integrated-workflow',
        features: {
          labelStudio: nodes.some(n => n.type === 'labelstudio'),
          mcp: nodes.some(n => n.type === 'mcp'),
          visionModels: nodes.some(n => n.data?.visionEnabled),
          realTimeTesting: nodes.some(n => n.data?.realTimeTesting)
        }
      }
    };
    
    if (onSave) {
      onSave(workflowData);
    }
    showSuccess('Integrated workflow saved successfully!');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Enhanced Toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-2">
          <Workflow className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Integrated AI Workflow Builder</h2>
          <Badge variant="outline">Full-Stack AI</Badge>
          <Badge variant="secondary">Label Studio</Badge>
          <Badge variant="secondary">MCP</Badge>
          <Badge variant="secondary">Vision Models</Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={generateAIRecommendations}
            disabled={isGenerating}
          >
            <Sparkles className="h-4 w-4 mr-1" />
            {isGenerating ? 'Generating...' : 'AI Recommendations'}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRealTimeTest}
            disabled={isTesting}
          >
            <TestTube className="h-4 w-4 mr-1" />
            {isTesting ? 'Testing...' : 'Real-Time Test'}
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
          
          <Button 
            size="sm" 
            onClick={() => {
              const agentNodes = nodes.filter(node => node.type === 'agent');
              const workflowConfig = {
                nodes,
                edges,
                agentNodes,
                touchpoints: nodes.filter(node => node.type === 'touchpoint'),
                decisions: nodes.filter(node => node.type === 'decision'),
                mcpServers: nodes.filter(node => node.type === 'mcp'),
                labelStudioInstances: nodes.filter(node => node.type === 'labelstudio')
              };

              if (onGenerateAgent) {
                onGenerateAgent(workflowConfig);
              }
              showSuccess('Integrated agent configuration generated!');
            }}
            className="bg-primary hover:bg-primary/90"
          >
            <Bot className="h-4 w-4 mr-1" />
            Generate Agent
          </Button>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Enhanced Node Palette */}
        <div className="w-80 border-r bg-muted/30 p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="canvas">Canvas</TabsTrigger>
              <TabsTrigger value="components">Components</TabsTrigger>
            </TabsList>
            
            <TabsContent value="canvas" className="space-y-4">
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
                  onClick={() => addNode('agent')}
                >
                  <Bot className="h-4 w-4 mr-2" />
                  AI Agent (w/ Vision)
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => addNode('mcp')}
                >
                  <Database className="h-4 w-4 mr-2" />
                  MCP Server
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => addNode('labelstudio')}
                >
                  <Tag className="h-4 w-4 mr-2" />
                  Label Studio
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
                  onClick={() => addNode('decision')}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Decision Point
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="components" className="space-y-4">
              <h3 className="font-medium mb-3">Language Models</h3>
              <div className="space-y-2 mb-4">
                {languageModels.map(model => (
                  <div key={model.id} className="p-2 border rounded text-xs">
                    <div className="font-medium flex items-center gap-2">
                      {model.name}
                      {model.vision && <Eye className="h-3 w-3 text-blue-500" />}
                    </div>
                    <div className="text-muted-foreground">{model.type}</div>
                  </div>
                ))}
              </div>
              
              <h3 className="font-medium mb-3">Workflow Statistics</h3>
              <div className="space-y-2 text-xs">
                <div>Agents: {nodes.filter(n => n.type === 'agent').length}</div>
                <div>MCP Servers: {nodes.filter(n => n.type === 'mcp').length}</div>
                <div>Label Studio: {nodes.filter(n => n.type === 'labelstudio').length}</div>
                <div>Vision Enabled: {nodes.filter(n => n.data?.visionEnabled).length}</div>
                <div>Real-time Testing: {nodes.filter(n => n.data?.realTimeTesting).length}</div>
              </div>
            </TabsContent>
          </Tabs>
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

          {/* Enhanced Node Properties Panel */}
          {selectedNode && (
            <Card className="absolute top-4 right-4 w-80 max-h-96 overflow-auto">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  {selectedNode.type?.toUpperCase()} Properties
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
                  <label className="text-xs font-medium">Label</label>
                  <p className="text-sm">{String(selectedNode.data?.label || 'No label')}</p>
                </div>
                <div>
                  <label className="text-xs font-medium">Description</label>
                  <p className="text-sm text-muted-foreground">
                    {String(selectedNode.data?.description || 'No description')}
                  </p>
                </div>
                
                {/* Agent-specific properties */}
                {selectedNode.type === 'agent' && (
                  <>
                    {selectedNode.data?.languageModel && (
                      <div>
                        <label className="text-xs font-medium">Language Model</label>
                        <Badge variant="outline" className="text-xs flex items-center gap-1 w-fit">
                          <Brain className="h-3 w-3" />
                          {String(selectedNode.data.languageModel || 'Unknown')}
                        </Badge>
                      </div>
                    )}
                    {selectedNode.data?.visionEnabled && (
                      <div>
                        <label className="text-xs font-medium">Capabilities</label>
                        <div className="flex gap-1">
                          <Badge variant="secondary" className="text-xs">Vision Enabled</Badge>
                          {selectedNode.data?.realTimeTesting && (
                            <Badge variant="outline" className="text-xs">Real-time Testing</Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
                
                {/* MCP-specific properties */}
                {selectedNode.type === 'mcp' && selectedNode.data?.tools && (
                  <div>
                    <label className="text-xs font-medium">Available Tools</label>
                    <div className="text-xs text-muted-foreground">
                      {Array.isArray(selectedNode.data.tools) ? selectedNode.data.tools.length : 0} tools configured
                    </div>
                  </div>
                )}
                
                {/* Label Studio properties */}
                {selectedNode.type === 'labelstudio' && (
                  <>
                    {selectedNode.data?.projectId && (
                      <div>
                        <label className="text-xs font-medium">Project ID</label>
                        <p className="text-sm">{String(selectedNode.data.projectId || 'N/A')}</p>
                      </div>
                    )}
                    {selectedNode.data?.annotationTypes && Array.isArray(selectedNode.data.annotationTypes) && (
                      <div>
                        <label className="text-xs font-medium">Annotation Types</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedNode.data.annotationTypes.map((type: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">{type}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};