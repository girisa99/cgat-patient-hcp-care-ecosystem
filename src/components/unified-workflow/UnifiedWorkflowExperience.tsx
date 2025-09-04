import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Play, Square, Bot, GitBranch, Zap, MessageSquare, Settings, 
  Sparkles, Workflow, Users, ArrowRight, Plus, FileText, 
  Target, Brain, Network, Layers
} from 'lucide-react';
import { toast } from 'sonner';
import { EnhancedWorkflowCanvas } from '@/components/workflow-builder/EnhancedWorkflowCanvas';
import { EnhancedNodePalette } from '@/components/workflow-builder/EnhancedNodePalette';
import { useWorkflowNodes } from '@/hooks/useWorkflowNodes';
import { AIAssistIntegration } from './AIAssistIntegration';
import { ConfigurableNodePanel } from './ConfigurableNodePanel';
import { TemplateGallery } from './TemplateGallery';
import { EnvironmentChannelManager } from './EnvironmentChannelManager';
import { DynamicNodeConfiguration } from './DynamicNodeConfiguration';
import { AnimatedFlowVisualizer } from '@/components/workflow-testing/AnimatedFlowVisualizer';

interface NodeTypeInfo {
  id: string;
  category: 'control' | 'agent' | 'action' | 'integration';
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  isRequired?: boolean;
  maxInstances?: number;
}

interface WorkflowScenario {
  id: string;
  title: string;
  description: string;
  nodes: string[];
  connections: Array<{ from: string; to: string; condition?: string }>;
  useCase: string;
}

interface UnifiedWorkflowExperienceProps {
  embedded?: boolean;
  onWorkflowUpdate?: (nodes: any[], edges: any[]) => void;
  onNodeAdd?: (node: any) => void;
  onNodeTest?: (nodeId: string, result: any) => void;
}

/**
 * Unified Workflow Experience - Complete UX for workflow creation
 * Addresses: Node types, Agent relationships, Drag & Drop, AI assistance
 */
export const UnifiedWorkflowExperience: React.FC<UnifiedWorkflowExperienceProps> = ({ 
  embedded = false,
  onWorkflowUpdate,
  onNodeAdd,
  onNodeTest
}) => {
  const { nodeTypes, categories } = useWorkflowNodes();
  const [selectedMode, setSelectedMode] = useState<'prompt' | 'visual' | 'template'>('prompt');
  const [promptInput, setPromptInput] = useState('');
  const [selectedScenario, setSelectedScenario] = useState<WorkflowScenario | null>(null);
  const [showNodeHelp, setShowNodeHelp] = useState(false);
  const [activeStep, setActiveStep] = useState<'scenario' | 'design' | 'configure' | 'test' | 'deploy'>('scenario');
  const [showAIAssist, setShowAIAssist] = useState(false);
  const [aiAssistMode, setAIAssistMode] = useState<'build' | 'generate' | 'test' | 'deploy' | 'configure'>('build');
  const [selectedNodeId, setSelectedNodeId] = useState<string>();
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [selectedNodeData, setSelectedNodeData] = useState<any>(null);
  const [isTestMode, setIsTestMode] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [showDeploymentManager, setShowDeploymentManager] = useState(false);
  const [showDynamicConfig, setShowDynamicConfig] = useState(false);
  
  // Canvas state (kept local and synced to canvas component)
  const [canvasNodes, setCanvasNodes] = useState<any[]>([]);
  const [canvasEdges, setCanvasEdges] = useState<any[]>([]);

  // Define comprehensive node type information
  const nodeTypeInfo: NodeTypeInfo[] = [
    {
      id: 'start',
      category: 'control',
      name: 'Start Node',
      description: 'Entry point for the workflow - required for every workflow',
      icon: Play,
      color: '#10b981',
      isRequired: true,
      maxInstances: 1
    },
    {
      id: 'end',
      category: 'control', 
      name: 'End Node',
      description: 'Exit point for the workflow - required for completion',
      icon: Square,
      color: '#ef4444',
      isRequired: true,
      maxInstances: 1
    },
    {
      id: 'single-agent',
      category: 'agent',
      name: 'Single Agent',
      description: 'Individual AI agent with specific capabilities and knowledge',
      icon: Bot,
      color: '#3b82f6'
    },
    {
      id: 'multi-agent',
      category: 'agent', 
      name: 'Multi-Agent System',
      description: 'Orchestrated team of specialized agents working together',
      icon: Users,
      color: '#8b5cf6'
    },
    {
      id: 'condition',
      category: 'action',
      name: 'Condition',
      description: 'Decision point that routes workflow based on logic',
      icon: GitBranch,
      color: '#f59e0b'
    },
    {
      id: 'action',
      category: 'action',
      name: 'Action',
      description: 'Automated task execution (API calls, data processing)',
      icon: Zap,
      color: '#06b6d4'
    },
    {
      id: 'human-input',
      category: 'action',
      name: 'Human Input',
      description: 'Points where human interaction is required',
      icon: MessageSquare,
      color: '#84cc16'
    }
  ];

  // Predefined workflow scenarios for quick start
  const workflowScenarios: WorkflowScenario[] = [
    {
      id: 'patient-onboarding',
      title: 'Patient Onboarding',
      description: 'Complete patient intake and care coordination workflow',
      nodes: ['start', 'single-agent', 'condition', 'multi-agent', 'action', 'end'],
      connections: [
        { from: 'start', to: 'single-agent' },
        { from: 'single-agent', to: 'condition' },
        { from: 'condition', to: 'multi-agent', condition: 'complex_case' },
        { from: 'condition', to: 'action', condition: 'simple_case' },
        { from: 'multi-agent', to: 'end' },
        { from: 'action', to: 'end' }
      ],
      useCase: 'Healthcare patient management and coordination'
    },
    {
      id: 'treatment-planning',
      title: 'Treatment Planning',
      description: 'AI-assisted treatment plan development and approval',
      nodes: ['start', 'multi-agent', 'human-input', 'condition', 'action', 'end'],
      connections: [
        { from: 'start', to: 'multi-agent' },
        { from: 'multi-agent', to: 'human-input' },
        { from: 'human-input', to: 'condition' },
        { from: 'condition', to: 'action', condition: 'approved' },
        { from: 'condition', to: 'multi-agent', condition: 'needs_revision' },
        { from: 'action', to: 'end' }
      ],
      useCase: 'Medical treatment planning with physician oversight'
    },
    {
      id: 'customer-support',
      title: 'Customer Support',
      description: 'Multi-tier support system with escalation',
      nodes: ['start', 'single-agent', 'condition', 'human-input', 'action', 'end'],
      connections: [
        { from: 'start', to: 'single-agent' },
        { from: 'single-agent', to: 'condition' },
        { from: 'condition', to: 'action', condition: 'resolved' },
        { from: 'condition', to: 'human-input', condition: 'escalate' },
        { from: 'human-input', to: 'action' },
        { from: 'action', to: 'end' }
      ],
      useCase: 'Customer service with automated and human assistance'
    }
  ];

  const handlePromptGenerate = useCallback(async () => {
    if (!promptInput.trim()) {
      toast.error('Please describe your workflow scenario');
      return;
    }

    // Open AI Assist with the prompt
    setAIAssistMode('build');
    setShowAIAssist(true);
  }, [promptInput]);

  const handleWorkflowGenerated = useCallback((workflow: any) => {
    console.log('Workflow generated:', workflow);
    
    // Update the workflow canvas with generated nodes and edges
    if (workflow.nodes && Array.isArray(workflow.nodes)) {
      // Convert AI-generated workflow to ReactFlow format
      const reactFlowNodes = workflow.nodes.map((node: any, index: number) => ({
        id: node.id || `node-${Date.now()}-${index}`,
        type: node.type || 'agent',
        position: node.position || { x: 100 + (index * 250), y: 100 + Math.floor(index / 4) * 150 },
        data: {
          label: node.label || node.name || `Generated Node ${index + 1}`,
          description: node.description || node.purpose || 'AI-generated workflow node',
          ...node.data,
          aiGenerated: true
        }
      }));
      
      const reactFlowEdges = workflow.edges?.map((edge: any, index: number) => ({
        id: edge.id || `edge-${Date.now()}-${index}`,
        source: edge.source,
        target: edge.target,
        type: edge.type || 'default',
        animated: true,
        style: { stroke: '#8b5cf6' }
      })) || [];
      
      // Update local canvas state
      setCanvasNodes(reactFlowNodes as any);
      setCanvasEdges(reactFlowEdges as any);
      
      // Trigger canvas update callback (optional)
      if (onWorkflowUpdate) {
        onWorkflowUpdate(reactFlowNodes, reactFlowEdges);
      }
    }
    
    setActiveStep('design');
    setShowAIAssist(false);
    toast.success('Workflow generated! Review and customize your nodes.');
  }, [onWorkflowUpdate]);

  const handleNodeGenerated = useCallback((node: any) => {
    console.log('Node generated:', node);
    
    // Add the generated node to the canvas
    if (node) {
      const reactFlowNode = {
        id: node.id || `node-${Date.now()}`,
        type: node.type || 'agent',
        position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
        data: {
          label: node.name || node.label || 'Generated Node',
          description: node.description || node.purpose || 'AI-generated node',
          ...node.data,
          aiGenerated: true
        }
      };
      
      // Trigger node addition (this will be handled by the parent component)
      if (onNodeAdd) {
        onNodeAdd(reactFlowNode);
      }
    }
    
    toast.success('Node generated successfully!');
  }, [onNodeAdd]);

  const handleAIAssistOpen = useCallback((mode: 'build' | 'generate' | 'test' | 'deploy' | 'configure', nodeId?: string) => {
    setAIAssistMode(mode);
    setSelectedNodeId(nodeId);
    setShowAIAssist(true);
  }, []);

  const handleNodeConfigOpen = useCallback((nodeData: any) => {
    setSelectedNodeData(nodeData);
    setSelectedNodeId(nodeData?.id);
    setShowConfigPanel(true);
  }, []);

  const handleNodeConfigSave = useCallback((nodeData: any) => {
    // Save node configuration
    toast.success('Node configuration saved');
    setShowConfigPanel(false);
  }, []);

  const handleScenarioSelect = useCallback((scenario: WorkflowScenario) => {
    setSelectedScenario(scenario);
    setActiveStep('design');
    toast.success(`${scenario.title} template loaded`);
  }, []);

  const handleTemplateSelect = useCallback((template: any) => {
    // Apply template to canvas
    if (template.configuration && template.configuration.nodes) {
      setCanvasNodes(template.configuration.nodes);
      setCanvasEdges(template.configuration.edges || []);
    }
    setActiveStep('design');
    toast.success(`Template "${template.name}" applied`);
  }, []);

  const handleDeployment = useCallback((deploymentConfig: any) => {
    console.log('Deployment config:', deploymentConfig);
    toast.success('Agent deployed successfully');
  }, []);

  const renderNodeTypeGuide = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Understanding Workflow Nodes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(
            nodeTypeInfo.reduce((acc, node) => {
              if (!acc[node.category]) acc[node.category] = [];
              acc[node.category].push(node);
              return acc;
            }, {} as Record<string, NodeTypeInfo[]>)
          ).map(([category, nodes]) => (
            <div key={category} className="space-y-2">
              <h4 className="font-semibold capitalize text-sm text-muted-foreground">
                {category} Nodes
              </h4>
              {nodes.map((node) => {
                const Icon = node.icon;
                return (
                  <div key={node.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <Icon className="h-4 w-4 mt-0.5 text-blue-600" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{node.name}</span>
                        {node.isRequired && (
                          <Badge variant="secondary" className="text-xs">Required</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{node.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">🎯 How to Build Workflows:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>AI Generate:</strong> Use "AI Intelligence & Suggestions" button to generate workflows</li>
              <li>• <strong>Drag & Drop:</strong> Drag nodes from the left palette to the canvas</li>
              <li>• <strong>Connect Nodes:</strong> Click and drag between node connection points</li>
              <li>• <strong>Configure:</strong> Right-click nodes for configuration options</li>
              <li>• <strong>Test:</strong> Use AI Assistant to test individual nodes or complete workflows</li>
            </ul>
          </div>
      </CardContent>
    </Card>
  );

  const renderScenarioMode = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Choose Your Approach
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant={selectedMode === 'prompt' ? 'default' : 'outline'}
              onClick={() => setSelectedMode('prompt')}
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Sparkles className="h-6 w-6" />
              <div className="text-center">
                <div className="font-semibold">AI Prompt</div>
                <div className="text-xs text-muted-foreground">Describe in natural language</div>
              </div>
            </Button>
            
            <Button
              variant={selectedMode === 'visual' ? 'default' : 'outline'}
              onClick={() => setSelectedMode('visual')}
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Workflow className="h-6 w-6" />
              <div className="text-center">
                <div className="font-semibold">Visual Builder</div>
                <div className="text-xs text-muted-foreground">Drag and drop nodes</div>
              </div>
            </Button>

            <Button
              variant={selectedMode === 'template' ? 'default' : 'outline'}
              onClick={() => setSelectedMode('template')}
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <FileText className="h-6 w-6" />
              <div className="text-center">
                <div className="font-semibold">Templates</div>
                <div className="text-xs text-muted-foreground">Start from examples</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedMode === 'prompt' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Describe Your Workflow
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Example: I need a patient onboarding workflow that starts with basic information collection, uses an AI agent to assess patient needs, routes complex cases to a specialist team, and simple cases to automated scheduling..."
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              rows={4}
            />
            <div className="flex gap-2">
              <Button onClick={handlePromptGenerate} className="flex-1">
                <Sparkles className="h-4 w-4 mr-2" />
                Generate with AI
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleAIAssistOpen('configure')}
                className="px-3"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedMode === 'template' && (
        <Card>
          <CardHeader>
            <CardTitle>Pre-built Workflow Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workflowScenarios.map((scenario) => (
                <Card key={scenario.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{scenario.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{scenario.description}</p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {scenario.nodes.slice(0, 4).map((nodeType) => {
                        const nodeInfo = nodeTypeInfo.find(n => n.id === nodeType);
                        return nodeInfo ? (
                          <Badge key={nodeType} variant="secondary" className="text-xs">
                            {nodeInfo.name}
                          </Badge>
                        ) : null;
                      })}
                      {scenario.nodes.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{scenario.nodes.length - 4} more
                        </Badge>
                      )}
                    </div>
                    <Button 
                      onClick={() => handleScenarioSelect(scenario)}
                      className="w-full"
                    >
                      Use This Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
              
              <Card className="cursor-pointer hover:shadow-md transition-shadow border-dashed">
                <CardContent className="p-6 text-center">
                  <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Browse Template Gallery</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Explore more pre-built templates from the community
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => setShowTemplateGallery(true)}
                  >
                    Open Gallery
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedMode === 'visual' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="h-5 w-5" />
              Start with Visual Builder
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => handleAIAssistOpen('generate')}
              className="w-full"
            >
              <Brain className="h-4 w-4 mr-2" />
              AI Intelligence & Suggestions
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderDesignMode = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Workflow Canvas
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNodeHelp(!showNodeHelp)}
            >
              {showNodeHelp ? 'Hide' : 'Show'} Node Guide
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showNodeHelp && renderNodeTypeGuide()}
          
          <div className="grid grid-cols-12 gap-4 min-h-[600px]">
            {/* Node Palette */}
            <div className="col-span-3">
              <EnhancedNodePalette onNodeSelect={() => {}} />
            </div>
            
            {/* Workflow Canvas */}
            <div className="col-span-9 border rounded-lg relative">
              <EnhancedWorkflowCanvas 
                initialNodes={canvasNodes}
                initialEdges={canvasEdges}
                onNodesChange={(nodes) => {
                  setCanvasNodes(nodes as any);
                  onWorkflowUpdate?.(nodes as any, canvasEdges as any);
                }}
                onEdgesChange={(edges) => {
                  setCanvasEdges(edges as any);
                  onWorkflowUpdate?.(canvasNodes as any, edges as any);
                }}
              />
              
              {/* Test Mode Overlay */}
              {isTestMode && (
                <div className="absolute top-4 right-4 z-10">
                  <AnimatedFlowVisualizer 
                    nodes={[]} // Would get actual nodes from canvas
                    edges={[]} // Would get actual edges from canvas
                    isTestMode={isTestMode}
                    onTestStart={() => {}}
                    onTestStop={() => setIsTestMode(false)}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <Button variant="outline" onClick={() => setActiveStep('scenario')}>
              Back to Scenarios
            </Button>
            
            <div className="flex gap-2">
              {/* AI Assist Buttons */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleAIAssistOpen('generate')}
              >
                <Bot className="h-4 w-4 mr-1" />
                AI Generate
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleAIAssistOpen('test')}
              >
                <Play className="h-4 w-4 mr-1" />
                AI Test
              </Button>
              
              <Button 
                variant={isTestMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsTestMode(!isTestMode)}
              >
                <Zap className="h-4 w-4 mr-1" />
                {isTestMode ? 'Exit Test' : 'Test Mode'}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowDynamicConfig(true)}
              >
                <Settings className="h-4 w-4 mr-1" />
                Configure
              </Button>
              <Button onClick={() => setActiveStep('configure')}>
                Next Step
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const steps = [
    { id: 'scenario', title: 'Choose Scenario', icon: Target },
    { id: 'design', title: 'Design Workflow', icon: Workflow },
    { id: 'configure', title: 'Configure Nodes', icon: Settings },
    { id: 'test', title: 'Test & Validate', icon: Play },
    { id: 'deploy', title: 'Deploy Agents', icon: Bot }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Unified Workflow Experience</CardTitle>
          <p className="text-muted-foreground">
            Create, configure, and deploy AI agent workflows with intuitive guidance
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === activeStep;
              const isCompleted = steps.findIndex(s => s.id === activeStep) > index;
              
              return (
                <React.Fragment key={step.id}>
                  <div className={`flex flex-col items-center gap-2 ${isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <div className={`p-2 rounded-full border-2 ${isActive ? 'border-primary bg-primary/10' : isCompleted ? 'border-green-600 bg-green-50' : 'border-muted-foreground/20'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-medium">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${isCompleted ? 'bg-green-600' : 'bg-muted-foreground/20'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {activeStep === 'scenario' && renderScenarioMode()}
      {activeStep === 'design' && renderDesignMode()}
      {activeStep === 'configure' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Configure Nodes & Agents</span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowDynamicConfig(true)}
                >
                  <Bot className="h-4 w-4 mr-1" />
                  Node Config
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveStep('test')}
                >
                  Next: Test
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Select nodes from your workflow to configure their behavior, AI models, and settings.</p>
          </CardContent>
        </Card>
      )}
      
      {activeStep === 'test' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Test & Validate Workflow</span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleAIAssistOpen('test')}
                >
                  <Bot className="h-4 w-4 mr-1" />
                  AI Test
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveStep('deploy')}
                >
                  Next: Deploy
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Run validation tests on your workflow to ensure proper operation before deployment.</p>
          </CardContent>
        </Card>
      )}
      
      {activeStep === 'deploy' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Deploy Agents</span>
              <Button 
                onClick={() => setShowDeploymentManager(true)}
              >
                <Bot className="h-4 w-4 mr-2" />
                Deploy to Channels
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Choose deployment environments and channels for your agents.</p>
          </CardContent>
        </Card>
      )}

      {/* Template Gallery */}
      <TemplateGallery
        isOpen={showTemplateGallery}
        onClose={() => setShowTemplateGallery(false)}
        onTemplateSelect={handleTemplateSelect}
      />

      {/* Deployment Manager */}
      <EnvironmentChannelManager
        isOpen={showDeploymentManager}
        onClose={() => setShowDeploymentManager(false)}
        onDeploy={handleDeployment}
        agentId="current-agent"
      />

      {/* Dynamic Node Configuration */}
      {showDynamicConfig && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-auto">
            <DynamicNodeConfiguration
              nodeType={selectedNodeData?.type || 'default'}
              configuration={selectedNodeData?.configuration || {}}
              onChange={(config) => setSelectedNodeData({...selectedNodeData, configuration: config})}
              onSave={() => {
                setShowDynamicConfig(false);
                toast.success('Node configuration saved');
              }}
              onCancel={() => setShowDynamicConfig(false)}
            />
          </div>
        </div>
      )}

      {/* AI Assistant Integration */}
      <AIAssistIntegration
        isOpen={showAIAssist}
        onClose={() => setShowAIAssist(false)}
        onWorkflowGenerated={handleWorkflowGenerated}
        onNodeGenerated={handleNodeGenerated}
        initialMode={aiAssistMode}
        selectedNodeId={selectedNodeId}
      />

      {/* Configurable Node Panel */}
      <ConfigurableNodePanel
        isOpen={showConfigPanel}
        onClose={() => setShowConfigPanel(false)}
        nodeData={selectedNodeData}
        onSave={handleNodeConfigSave}
        onAIAssist={handleAIAssistOpen}
      />
    </div>
  );
};

export default UnifiedWorkflowExperience;