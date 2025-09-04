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
import { useWorkflowNodes } from '@/hooks/useWorkflowNodes';
import { AIAssistIntegration } from './AIAssistIntegration';
import { ConfigurableNodePanel } from './ConfigurableNodePanel';

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

/**
 * Unified Workflow Experience - Complete UX for workflow creation
 * Addresses: Node types, Agent relationships, Drag & Drop, AI assistance
 */
export const UnifiedWorkflowExperience: React.FC = () => {
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
    setActiveStep('design');
    setShowAIAssist(false);
    toast.success('Workflow generated! Review and customize your nodes.');
  }, []);

  const handleNodeGenerated = useCallback((node: any) => {
    toast.success('Node generated successfully!');
  }, []);

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
          <h4 className="font-semibold text-blue-900 mb-2">Key Concepts:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Agents are not nodes</strong> - Agents are deployed through agent nodes</li>
            <li>• <strong>Every workflow needs</strong> a Start node and End node</li>
            <li>• <strong>Single agents</strong> handle specific tasks independently</li>
            <li>• <strong>Multi-agent systems</strong> coordinate multiple specialized agents</li>
            <li>• <strong>Connections</strong> define the flow between nodes with optional conditions</li>
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
              onClick={() => setActiveStep('design')}
              className="w-full"
            >
              Open Visual Canvas
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
          
          <div className="border rounded-lg p-4 min-h-[500px]">
            <EnhancedWorkflowCanvas />
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
                variant="outline" 
                size="sm"
                onClick={() => handleNodeConfigOpen({})}
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
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleAIAssistOpen('configure')}
              >
                <Bot className="h-4 w-4 mr-1" />
                AI Configure
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Node configuration interface coming soon...</p>
          </CardContent>
        </Card>
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