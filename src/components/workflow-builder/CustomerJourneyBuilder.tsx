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
  MarkerType,
  Handle,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, MessageCircle, Phone, Mail, Calendar, CheckCircle, 
  AlertTriangle, Clock, Users, Workflow, Sparkles, Settings,
  Play, Pause, RotateCcw, Save, Download, Upload, Eye, Plus, Trash2, Lightbulb
} from 'lucide-react';
import { useMasterToast } from '@/hooks/useMasterToast';
import { NodeConfigurationPanel } from './NodeConfigurationPanel';
import { AIGuidancePanel } from './AIGuidancePanel';
import { NodeTemplateLibrary } from './NodeTemplateLibrary';
import { EnhancedWorkflowNode, EnhancedNodeData } from './EnhancedWorkflowNode';
import { AutoSuggestConnector } from './AutoSuggestConnector';
import { autoConnectEngine } from './AutoConnectEngine';

// Custom Node Components
const CustomerNode = ({ data }: { data: any }) => (
  <div className="px-4 py-3 shadow-md rounded-md bg-background border-2 border-primary min-w-[180px] relative">
    <Handle type="target" position={Position.Left} className="custom-handle" />
    <div className="flex items-center gap-2 mb-2">
      <Users className="h-4 w-4 text-primary" />
      <div className="font-bold text-sm">{data.label}</div>
    </div>
    <div className="text-xs text-muted-foreground whitespace-normal break-words leading-snug">{data.description}</div>
    {data.persona && (
      <Badge variant="outline" className="mt-1 text-xs">{data.persona}</Badge>
    )}
    <Handle type="source" position={Position.Right} className="custom-handle" />
  </div>
);

const TouchpointNode = ({ data }: { data: any }) => (
  <div className="px-4 py-3 shadow-md rounded-md bg-accent border-2 border-accent-foreground min-w-[160px] relative">
    <Handle type="target" position={Position.Left} className="custom-handle" />
    <div className="flex items-center gap-2 mb-2">
      {data.channel === 'chat' && <MessageCircle className="h-4 w-4" />}
      {data.channel === 'phone' && <Phone className="h-4 w-4" />}
      {data.channel === 'email' && <Mail className="h-4 w-4" />}
      {data.channel === 'appointment' && <Calendar className="h-4 w-4" />}
      <div className="font-bold text-sm">{data.label}</div>
    </div>
    <div className="text-xs text-muted-foreground whitespace-normal break-words leading-snug">{data.description}</div>
    {data.automationLevel && (
      <Badge variant="secondary" className="mt-1 text-xs">
        {data.automationLevel}% Automated
      </Badge>
    )}
    <Handle type="source" position={Position.Right} className="custom-handle" />
  </div>
);

const DecisionNode = ({ data }: { data: any }) => (
  <div className="px-4 py-3 shadow-md rounded-md bg-yellow-100 border-2 border-yellow-400 min-w-[140px] dark:bg-yellow-900 dark:border-yellow-600 relative">
    <Handle type="target" position={Position.Left} className="custom-handle" />
    <div className="flex items-center gap-2 mb-2">
      <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      <div className="font-bold text-sm">{data.label}</div>
    </div>
    <div className="text-xs text-muted-foreground whitespace-normal break-words leading-snug">{data.description}</div>
    {data.conditions && (
      <div className="mt-1 text-xs">
        {data.conditions.map((condition: string, idx: number) => (
          <Badge key={idx} variant="outline" className="mr-1 text-xs">{condition}</Badge>
        ))}
      </div>
    )}
    <Handle type="source" position={Position.Right} className="custom-handle" />
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
  enhanced: EnhancedWorkflowNode,
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
  // Unified builder context
  useCaseData?: {
    name: string;
    description: string;
    selectedUseCase?: any;
    detailedUseCase?: string;
    targetUsers?: string;
    expectedOutcomes?: string;
  };
  capturedRequirements?: {
    connectors: string[];
    actions: string[];
    steps: string[];
    integrations: string[];
  };
  journeyStages?: any[];
  sessionId?: string;
}

export const CustomerJourneyBuilder: React.FC<CustomerJourneyBuilderProps> = ({
  onSave,
  onGenerateAgent,
  initialWorkflow,
  useCaseData,
  capturedRequirements,
  journeyStages,
  sessionId
}) => {
  // Generate enhanced initial nodes from unified builder context
  const generateContextualNodes = (): Node<EnhancedNodeData>[] => {
    if (!capturedRequirements && !journeyStages) {
      // Convert initial nodes to enhanced format
      const enhancedInitialNodes: Node<EnhancedNodeData>[] = initialNodes.map(node => ({
        ...node,
        type: 'enhanced',
        data: {
          ...node.data,
          type: node.type as any,
          dataFields: ['input_data', 'output_data', 'status'],
          connectors: [
            { id: 'input', label: 'Input', type: 'input', position: Position.Left },
            { id: 'output', label: 'Output', type: 'output', position: Position.Right }
          ]
        }
      }));
      return enhancedInitialNodes;
    }
    
    const contextualNodes: Node<EnhancedNodeData>[] = [];
    let xPos = 50;
    
    // Add use case header node if we have use case data
    if (useCaseData) {
      contextualNodes.push({
        id: 'use-case',
        type: 'enhanced',
        position: { x: xPos, y: 50 },
        data: {
          label: useCaseData.name || 'Use Case',
          description: useCaseData.description || 'Generated from unified builder',
          type: 'customer',
          persona: useCaseData.targetUsers || 'Target Users',
          dataFields: ['use_case_id', 'target_users', 'expected_outcomes'],
          connectors: [
            { id: 'output', label: 'Use Case Output', type: 'output', position: Position.Right, dataType: 'use_case_data' }
          ],
          context: useCaseData
        }
      });
      xPos += 300;
    }
    
    // Add nodes from journey stages with enhanced data
    if (journeyStages && journeyStages.length > 0) {
      journeyStages.forEach((stage, idx) => {
        contextualNodes.push({
          id: `stage-${idx}`,
          type: 'enhanced',
          position: { x: xPos, y: 150 },
          data: {
            label: stage.title || `Stage ${idx + 1}`,
            description: stage.description || 'Journey stage',
            type: 'touchpoint',
            channel: 'chat',
            automationLevel: 70,
            dataFields: [
              'stage_input',
              'stage_output', 
              'completion_status',
              'duration',
              'stakeholder_feedback'
            ],
            connectors: [
              { id: 'input', label: 'Stage Input', type: 'input', position: Position.Left, dataType: 'stage_data' },
              { id: 'output', label: 'Stage Output', type: 'output', position: Position.Right, dataType: 'stage_data' },
              { id: 'escalation', label: 'Escalation', type: 'output', position: Position.Top, dataType: 'escalation_data' }
            ],
            stage: stage
          }
        });
        xPos += 280;
      });
    }
    
    // Add nodes from captured requirements steps
    if (capturedRequirements?.steps && capturedRequirements.steps.length > 0) {
      capturedRequirements.steps.forEach((step, idx) => {
        contextualNodes.push({
          id: `step-${idx}`,
          type: 'agent',
          position: { x: 50 + (idx * 280), y: 300 },
          data: {
            label: step,
            description: `AI agent for ${step}`,
            capabilities: ['Processing', 'Analysis'],
            aiModel: 'gpt-4o-mini',
            step: step
          }
        });
      });
    }
    
    // Add decision nodes for complex workflows
    if (capturedRequirements?.integrations && capturedRequirements.integrations.length > 1) {
      contextualNodes.push({
        id: 'routing-decision',
        type: 'decision',
        position: { x: 300, y: 450 },
        data: {
          label: 'Route to Integration',
          description: 'Determine which integration to use',
          conditions: capturedRequirements.integrations.slice(0, 3)
        }
      });
    }
    
    return contextualNodes.length > 0 ? contextualNodes : initialNodes;
  };

  // Generate contextual edges
  const generateContextualEdges = () => {
    const contextualEdges: Edge[] = [];
    
    if (useCaseData && (journeyStages?.length || capturedRequirements?.steps?.length)) {
      // Connect use case to first stage/step
      const firstNodeId = journeyStages?.length ? 'stage-0' : capturedRequirements?.steps?.length ? 'step-0' : null;
      if (firstNodeId) {
        contextualEdges.push({
          id: 'use-case-flow',
          source: 'use-case',
          target: firstNodeId,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#8b5cf6' }
        });
      }
    }
    
    // Connect journey stages sequentially
    if (journeyStages && journeyStages.length > 1) {
      for (let i = 0; i < journeyStages.length - 1; i++) {
        contextualEdges.push({
          id: `stage-${i}-${i + 1}`,
          source: `stage-${i}`,
          target: `stage-${i + 1}`,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#10b981' }
        });
      }
    }
    
    // Connect stages to steps if both exist
    if (journeyStages?.length && capturedRequirements?.steps?.length) {
      contextualEdges.push({
        id: 'stage-to-step',
        source: `stage-${Math.floor(journeyStages.length / 2)}`,
        target: 'step-0',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#f59e0b' }
      });
    }
    
    return contextualEdges.length > 0 ? contextualEdges : initialEdges;
  };
  const [nodes, setNodes, onNodesChange] = useNodesState(
    initialWorkflow?.nodes || 
    (useCaseData || capturedRequirements || journeyStages ? generateContextualNodes() : initialNodes)
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    initialWorkflow?.edges || 
    (useCaseData || capturedRequirements || journeyStages ? generateContextualEdges() : initialEdges)
  );
  
  // Display unified builder context in the UI
  const contextInfo = useCaseData ? {
    title: useCaseData.name,
    description: useCaseData.description,
    requirements: capturedRequirements,
    stages: journeyStages?.length || 0
  } : null;
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [showAIGuidance, setShowAIGuidance] = useState(true);
  const [showNodeConfig, setShowNodeConfig] = useState(false);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const { showSuccess, showError } = useMasterToast();
  const { setViewport, getViewport } = useReactFlow();

  // Available connectors and AI models for configuration
  const availableConnectors = ['Supabase', 'OpenAI', 'Stripe', 'Twilio', 'SendGrid', 'Zoom'];
  const aiModels = ['gpt-4o-mini', 'gpt-4o', 'claude-3-haiku', 'claude-3-sonnet'];

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
        order: nodes.length,
        active: true,
        variables: [],
        apis: [],
        dataStorage: { enabled: false, storageType: 'memory', retentionDays: 30, maxRecords: 1000, fields: [] },
        ...(type === 'touchpoint' && { channel: 'chat', automationLevel: 50 }),
        ...(type === 'agent' && { capabilities: ['General'], aiModel: 'gpt-4o-mini' }),
        ...(type === 'decision' && { conditions: ['Yes', 'No'] })
      }
    };
    setNodes(prev => [...prev, newNode]);
  };

  // Update node configuration
  const updateNode = (nodeId: string, updates: any) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, ...updates } : node
    ));
  };

  // Delete node
  const deleteNode = (nodeId: string) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    setEdges(prev => prev.filter(edge => edge.source !== nodeId && edge.target !== nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
      setShowNodeConfig(false);
    }
    showSuccess('Node deleted successfully');
  };

  // Handle AI guidance suggestions
  const handleAISuggestion = (suggestion: any) => {
    switch (suggestion.action) {
      case 'Add Customer Touchpoint':
        addNode('customer');
        break;
      case 'Add Decision Node':
        addNode('decision');
        break;
      case 'Add AI Agent':
        addNode('agent');
        break;
      case 'Add Connections':
        if (nodes.length >= 2) {
          const newEdge = {
            id: `edge-${Date.now()}`,
            source: nodes[0].id,
            target: nodes[1].id,
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { stroke: '#8b5cf6' }
          };
          setEdges(prev => [...prev, newEdge]);
        }
        break;
      default:
        showSuccess('Suggestion applied!');
    }
  };

  // Handle user prompts from AI assistant
  const handleUserPrompt = (prompt: string) => {
    // Process user prompts and potentially modify workflow
    console.log('Processing user prompt:', prompt);
  };

  // Add template-based node
  const addTemplateNode = (template: any, position: { x: number; y: number }) => {
    const newNode = {
      id: `${Date.now()}`,
      type: template.type,
      position,
      data: {
        ...template.defaultData,
        templateId: template.id,
        isTemplate: true
      }
    };
    setNodes(prev => [...prev, newNode]);
    setShowTemplateLibrary(false);
    showSuccess(`${template.name} template added!`);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Context Information Header */}
      {contextInfo && (
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">{contextInfo.title}</h3>
              <Badge variant="secondary">From Unified Builder</Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {contextInfo.requirements?.connectors?.length && (
                <Badge variant="outline">{contextInfo.requirements.connectors.length} Connectors</Badge>
              )}
              {contextInfo.requirements?.actions?.length && (
                <Badge variant="outline">{contextInfo.requirements.actions.length} Actions</Badge>
              )}
              {contextInfo.stages > 0 && (
                <Badge variant="outline">{contextInfo.stages} Journey Stages</Badge>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {contextInfo.description} • Pre-configured with your requirements and journey stages
          </p>
        </div>
      )}
      
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
            onClick={() => setShowTemplateLibrary(true)}
          >
            <Sparkles className="h-4 w-4 mr-1" />
            Templates
          </Button>
          
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
        <div className="w-64 border-r bg-muted/30 p-4 h-full overflow-y-auto">
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
            onNodeClick={(event, node) => {
              setSelectedNode(node);
              setShowNodeConfig(true);
            }}
            onNodeDoubleClick={(event, node) => {
              setSelectedNode(node);
              setShowNodeConfig(true);
            }}
            fitView
            panOnScroll
            zoomOnScroll
            panOnDrag
            attributionPosition="bottom-right"
          >
            <Controls />
            <MiniMap />
            <Background gap={20} size={1} />
          </ReactFlow>

          {/* Enhanced Node Configuration Panel */}
          {showNodeConfig && selectedNode && (
            <div className={`absolute top-4 ${showAIGuidance ? 'right-[26rem]' : 'right-4'} z-10`}>
              <NodeConfigurationPanel
                node={selectedNode}
                onUpdate={updateNode}
                onDelete={deleteNode}
                onClose={() => {
                  setShowNodeConfig(false);
                  setSelectedNode(null);
                }}
                availableConnectors={availableConnectors}
                aiModels={aiModels}
              />
            </div>
          )}
        </div>
      </div>

      {/* Node Template Library */}
      <NodeTemplateLibrary
        onAddTemplate={addTemplateNode}
        isOpen={showTemplateLibrary}
        onClose={() => setShowTemplateLibrary(false)}
      />

      {/* AI Guidance Panel */}
      <AIGuidancePanel
        currentWorkflow={{ nodes, edges }}
        onApplySuggestion={handleAISuggestion}
        onUserPrompt={handleUserPrompt}
        isVisible={showAIGuidance}
        onToggle={() => setShowAIGuidance(!showAIGuidance)}
      />
    </div>
  );
};