import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { 
  Brain, 
  Sparkles, 
  Workflow, 
  Loader2, 
  Database,
  Eye,
  Play,
  Zap,
  Settings,
  TestTube,
  Rocket,
  Activity,
  Link,
  GitBranch,
  Timer,
  Target,
  MessageSquare,
  Bot,
  Cloud
} from 'lucide-react';
import { useWorkflowNodes } from '@/hooks/useWorkflowNodes';
import { useRealAIIntegration } from '@/hooks/useRealAIIntegration';
import { useApiServices } from '@/hooks/useApiServices';
import { useMasterToast } from '@/hooks/useMasterToast';

interface AIWorkflowPromptProps {
  onWorkflowGenerated: (workflow: any) => void;
  className?: string;
}

const EXAMPLE_PROMPTS = [
  {
    title: "Patient Care Workflow",
    prompt: "Create a patient onboarding workflow with intake, triage, appointment scheduling, and follow-up",
    category: "Healthcare"
  },
  {
    title: "Customer Support Pipeline",
    prompt: "Build a support ticket workflow with automated routing, escalation, and resolution tracking",
    category: "Support"
  },
  {
    title: "Data Processing Chain",
    prompt: "Design a data ingestion workflow with validation, transformation, and storage steps",
    category: "Data"
  },
  {
    title: "Content Review Process",
    prompt: "Create a content approval workflow with review, feedback, and publishing stages",
    category: "Content"
  }
];

const AI_PROVIDERS = [
  { id: 'openai', name: 'OpenAI', models: ['gpt-5-2025-08-07', 'gpt-4.1-2025-04-14'] },
  { id: 'claude', name: 'Claude', models: ['claude-3-opus', 'claude-3-sonnet'] },
  { id: 'gemini', name: 'Gemini', models: ['gemini-pro'] }
];

export const AIWorkflowPrompt: React.FC<AIWorkflowPromptProps> = ({
  onWorkflowGenerated,
  className = ""
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [selectedModel, setSelectedModel] = useState('gpt-5-2025-08-07');
  const [activeTab, setActiveTab] = useState('generate');
  
  // Animation & Testing State
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isTestRunning, setIsTestRunning] = useState(false);
  
  // Connector State
  const [selectedConnectors, setSelectedConnectors] = useState<string[]>([]);
  const [connectorConfigs, setConnectorConfigs] = useState<Record<string, any>>({});
  
  // Deployment State
  const [deploymentTarget, setDeploymentTarget] = useState('staging');
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'deployed' | 'failed'>('idle');

  const { categories, nodeTypesByCategory, isLoading: nodesLoading } = useWorkflowNodes();
  const { apiServices, isLoading: apisLoading } = useApiServices();
  const { 
    generateWorkflowFromPrompt, 
    isGenerating, 
    enhancePromptWithContext 
  } = useRealAIIntegration();
  const { showSuccess, showError, showInfo } = useMasterToast();

  // Update model when provider changes
  useEffect(() => {
    const provider = AI_PROVIDERS.find(p => p.id === selectedProvider);
    if (provider && provider.models.length > 0) {
      setSelectedModel(provider.models[0]);
    }
  }, [selectedProvider]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showInfo('Please enter a workflow description');
      return;
    }

    try {
      // Enhance prompt with database context
      const enhancedPrompt = await enhancePromptWithContext(prompt, {
        categories,
        nodeTypes: nodeTypesByCategory
      });

      const workflow = await generateWorkflowFromPrompt({
        prompt: enhancedPrompt,
        context: {
          existingNodes: Object.values(nodeTypesByCategory).flat()
        },
        config: {
          provider: selectedProvider as 'openai' | 'claude' | 'gemini',
          model: selectedModel
        }
      });

      if (workflow) {
        showSuccess('Workflow generated successfully!');
        onWorkflowGenerated(workflow);
        setPrompt('');
      }
    } catch (error) {
      console.error('Error generating workflow:', error);
      showError('Failed to generate workflow. Please try again.');
    }
  };

  const handleTestWorkflow = async () => {
    setIsTestRunning(true);
    try {
      // Mock testing logic - would integrate with actual testing service
      const mockResults = [
        { nodeId: 'node1', status: 'passed', duration: 120, message: 'Node executed successfully' },
        { nodeId: 'node2', status: 'passed', duration: 85, message: 'API call completed' },
      ];
      
      setTimeout(() => {
        setTestResults(mockResults);
        setIsTestRunning(false);
        showSuccess('Workflow test completed successfully');
      }, 2000);
    } catch (error) {
      setIsTestRunning(false);
      showError('Test failed');
    }
  };

  const handleDeployWorkflow = async () => {
    setDeploymentStatus('deploying');
    try {
      // Mock deployment logic - would integrate with actual deployment service
      setTimeout(() => {
        setDeploymentStatus('deployed');
        showSuccess(`Workflow deployed to ${deploymentTarget} successfully`);
      }, 3000);
    } catch (error) {
      setDeploymentStatus('failed');
      showError('Deployment failed');
    }
  };

  const handleConnectorToggle = (connectorId: string) => {
    setSelectedConnectors(prev => 
      prev.includes(connectorId) 
        ? prev.filter(id => id !== connectorId)
        : [...prev, connectorId]
    );
  };

  const handleAnimateWorkflow = () => {
    setIsAnimating(!isAnimating);
    showInfo(isAnimating ? 'Animation stopped' : 'Animation started');
  };

  const handleExamplePrompt = (examplePrompt: string) => {
    setPrompt(examplePrompt);
  };

  const selectedProviderData = AI_PROVIDERS.find(p => p.id === selectedProvider);

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Workflow Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="generate" className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Generate
              </TabsTrigger>
              <TabsTrigger value="visual" className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                Visual
              </TabsTrigger>
              <TabsTrigger value="connectors" className="flex items-center gap-1">
                <Link className="h-3 w-3" />
                Connectors
              </TabsTrigger>
              <TabsTrigger value="animate" className="flex items-center gap-1">
                <Activity className="h-3 w-3" />
                Animate
              </TabsTrigger>
              <TabsTrigger value="test" className="flex items-center gap-1">
                <TestTube className="h-3 w-3" />
                Test
              </TabsTrigger>
              <TabsTrigger value="deploy" className="flex items-center gap-1">
                <Rocket className="h-3 w-3" />
                Deploy
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="space-y-4">
              {/* Example Prompts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {EXAMPLE_PROMPTS.map((example, index) => (
                  <div
                    key={index}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => handleExamplePrompt(example.prompt)}
                  >
                    <div className="font-medium text-sm">{example.title}</div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {example.prompt}
                    </div>
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {example.category}
                    </Badge>
                  </div>
                ))}
              </div>

              {/* Main Prompt Input */}
              <div className="space-y-3">
                <Textarea
                  placeholder="Describe your workflow in natural language... e.g., 'Create a patient intake workflow with automated triage and appointment scheduling'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  className="resize-none"
                  dir="ltr"
                  style={{ textAlign: 'left', direction: 'ltr' }}
                />

                {/* AI Provider & Model Selection */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Provider:</span>
                    <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AI_PROVIDERS.map(provider => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Model:</span>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedProviderData?.models.map(model => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Generate Button */}
                <div className="flex gap-2">
                  <Button 
                    onClick={handleGenerate} 
                    disabled={isGenerating || !prompt.trim()}
                    className="flex-1"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Generate
                      </>
                    )}
                  </Button>

                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('visual')}
                    size="lg"
                  >
                    <Workflow className="h-4 w-4 mr-2" />
                    Visual Workflow
                  </Button>
                </div>
              </div>

              {/* Database Integration Info */}
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-start gap-2">
                  <Database className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p><strong>DATABASE-DRIVEN:</strong> AI will use your actual node types and categories</p>
                    <div className="flex items-center gap-4">
                      <span>• {categories.length} categories from database</span>
                      <span>• {Object.values(nodeTypesByCategory).flat().length} node types available</span>
                      <span>• Real schemas and configurations</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="visual" className="space-y-4">
              <div className="text-center py-8">
                <Workflow className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Visual Workflow Builder</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Build workflows visually by dragging and connecting nodes
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => setActiveTab('generate')} variant="outline">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate First
                  </Button>
                  <Button onClick={() => setActiveTab('connectors')} variant="outline">
                    <Link className="h-4 w-4 mr-2" />
                    Setup Connectors
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="connectors" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">API Connectors</h3>
                  <Badge variant="secondary">{selectedConnectors.length} selected</Badge>
                </div>

                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {apisLoading ? (
                      <div className="text-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Loading API services...</p>
                      </div>
                    ) : (
                      apiServices.map(service => (
                        <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Link className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium text-sm">{service.name}</div>
                              <div className="text-xs text-muted-foreground">{service.description}</div>
                            </div>
                          </div>
                          <Switch
                            checked={selectedConnectors.includes(service.id)}
                            onCheckedChange={() => handleConnectorToggle(service.id)}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>

                <div className="flex gap-2">
                  <Button onClick={() => setActiveTab('generate')} variant="outline" className="flex-1">
                    <Brain className="h-4 w-4 mr-2" />
                    Generate with Connectors
                  </Button>
                  <Button onClick={() => setActiveTab('test')} variant="outline">
                    <TestTube className="h-4 w-4 mr-2" />
                    Test Connections
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="animate" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Workflow Animation</h3>
                  <Switch
                    checked={isAnimating}
                    onCheckedChange={handleAnimateWorkflow}
                  />
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Animation Speed</label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm">Slow</span>
                      <Input
                        type="range"
                        min="0.5"
                        max="3"
                        step="0.5"
                        value={animationSpeed}
                        onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-sm">Fast</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Current: {animationSpeed}x speed
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm">
                      <Timer className="h-4 w-4 mr-2" />
                      Step Mode
                    </Button>
                    <Button variant="outline" size="sm">
                      <Target className="h-4 w-4 mr-2" />
                      Highlight Path
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p><strong>Animation Features:</strong></p>
                    <p>• Real-time data flow visualization</p>
                    <p>• Node execution highlighting</p>
                    <p>• Conditional path tracing</p>
                    <p>• Performance bottleneck detection</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="test" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Workflow Testing</h3>
                  <Button onClick={handleTestWorkflow} disabled={isTestRunning}>
                    {isTestRunning ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <TestTube className="h-4 w-4 mr-2" />
                        Run Tests
                      </>
                    )}
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <Button variant="outline" size="sm">
                    <Bot className="h-4 w-4 mr-2" />
                    Unit Tests
                  </Button>
                  <Button variant="outline" size="sm">
                    <GitBranch className="h-4 w-4 mr-2" />
                    Integration
                  </Button>
                  <Button variant="outline" size="sm">
                    <Activity className="h-4 w-4 mr-2" />
                    Performance
                  </Button>
                </div>

                {testResults.length > 0 && (
                  <ScrollArea className="h-32">
                    <div className="space-y-2">
                      {testResults.map((result, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              result.status === 'passed' ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                            <span className="text-sm font-medium">{result.nodeId}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {result.duration}ms
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </TabsContent>

            <TabsContent value="deploy" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Deploy Workflow</h3>
                  <Badge variant={deploymentStatus === 'deployed' ? 'default' : 'secondary'}>
                    {deploymentStatus}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Deployment Target</label>
                    <Select value={deploymentTarget} onValueChange={setDeploymentTarget}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="staging">Staging Environment</SelectItem>
                        <SelectItem value="production">Production Environment</SelectItem>
                        <SelectItem value="testing">Testing Environment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      onClick={handleDeployWorkflow} 
                      disabled={deploymentStatus === 'deploying'}
                      className="flex-1"
                    >
                      {deploymentStatus === 'deploying' ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Deploying...
                        </>
                      ) : (
                        <>
                          <Rocket className="h-4 w-4 mr-2" />
                          Deploy Now
                        </>
                      )}
                    </Button>
                    <Button variant="outline">
                      <Cloud className="h-4 w-4 mr-2" />
                      Schedule
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p><strong>Deployment includes:</strong></p>
                    <p>• Workflow configuration</p>
                    <p>• Connected API services ({selectedConnectors.length})</p>
                    <p>• Node configurations and dependencies</p>
                    <p>• Health monitoring and rollback capability</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Available Nodes Preview */}
      {!nodesLoading && categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="h-4 w-4" />
              Available Node Types ({Object.values(nodeTypesByCategory).flat().length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {categories.map(category => {
                  const nodes = nodeTypesByCategory[category.name] || [];
                  if (nodes.length === 0) return null;
                  
                  return (
                    <div key={category.id} className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {category.name}
                      </Badge>
                      <div className="flex flex-wrap gap-1">
                        {nodes.slice(0, 3).map(node => (
                          <span key={node.id} className="text-xs text-muted-foreground">
                            {node.display_name}
                          </span>
                        ))}
                        {nodes.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{nodes.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};