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
import { useClaudeIntegration } from '@/hooks/useClaudeIntegration';
import { useMasterToast } from '@/hooks/useMasterToast';

interface AIWorkflowPromptProps {
  onWorkflowGenerated: (workflow: any) => void;
  className?: string;
  hideHeader?: boolean;
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
  { id: 'claude', name: 'Claude', models: ['claude-sonnet-4-20250514', 'claude-opus-4-20250514'] },
  { id: 'gemini', name: 'Gemini', models: ['gemini-pro'] }
];

export const AIWorkflowPrompt: React.FC<AIWorkflowPromptProps> = ({
  onWorkflowGenerated,
  className = "",
  hideHeader = false
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
  const { generateWorkflowWithClaude, isLoading: isClaudeLoading } = useClaudeIntegration();
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
      if (selectedProvider === 'claude') {
        // Use Claude integration
        const workflow = await generateWorkflowWithClaude(prompt);
        if (workflow) {
          showSuccess('Workflow generated successfully with Claude!');
          onWorkflowGenerated(workflow);
          setPrompt('');
        }
      } else {
        // Use existing OpenAI/Gemini integration
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
    <div className={`h-full flex flex-col ${className}`}>
      {!hideHeader && (
        <div className="p-3 border-b bg-background relative z-30">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            AI Workflow Assistant
          </h3>
        </div>
      )}
      
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="p-2 border-b bg-background relative z-30">
            <TabsList level="child" className="flex w-full h-9 gap-2 overflow-x-auto whitespace-nowrap no-scrollbar">
              <TabsTrigger level="child" value="generate" className="text-xs px-2">
                <Sparkles className="h-3 w-3 mr-1" />
                Generate
              </TabsTrigger>
              <TabsTrigger level="child" value="test" className="text-xs px-2">
                <TestTube className="h-3 w-3 mr-1" />
                Test
              </TabsTrigger>
              <TabsTrigger level="child" value="visual" className="text-xs px-2">
                <Workflow className="h-3 w-3 mr-1" />
                Visual
              </TabsTrigger>
              <TabsTrigger level="child" value="deploy" className="text-xs px-2">
                <Rocket className="h-3 w-3 mr-1" />
                Deploy
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto">
            <TabsContent level="child" value="generate" className="h-full p-3 space-y-3">
              {/* Example Prompts - Simplified */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">Quick Start</div>
                <div className="grid gap-2">
                  {EXAMPLE_PROMPTS.slice(0, 2).map((example, index) => (
                    <div
                      key={index}
                      className="p-2 border rounded cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => handleExamplePrompt(example.prompt)}
                    >
                      <div className="font-medium text-xs">{example.title}</div>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {example.category}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Prompt Input */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">Describe Your Workflow</div>
                <Textarea
                  placeholder="e.g., Create a patient intake workflow with triage..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  className="resize-none text-xs"
                  dir="ltr"
                  style={{ textAlign: 'left', direction: 'ltr' }}
                />
              </div>

              {/* AI Settings - Compact */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">AI Settings</div>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[60] bg-popover">
                      {AI_PROVIDERS.map(provider => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[60] bg-popover">
                      {selectedProviderData?.models.map(model => (
                        <SelectItem key={model} value={model}>
                          {model.split('-')[0]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Generate Button */}
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || isClaudeLoading || !prompt.trim()}
                className="w-full h-8"
                size="sm"
              >
                {(isGenerating || isClaudeLoading) ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 mr-2" />
                    Generate with {selectedProvider === 'claude' ? 'Claude' : selectedProvider}
                  </>
                )}
              </Button>

              {/* Database Info - Compact */}
              <div className="p-2 bg-muted/50 rounded text-xs">
                <div className="flex items-center gap-1 mb-1">
                  <Database className="h-3 w-3 text-blue-600" />
                  <span className="font-medium">Database-Driven</span>
                </div>
                <div className="space-y-1 text-muted-foreground">
                  <div>• {categories.length} categories</div>
                  <div>• {Object.values(nodeTypesByCategory).flat().length} node types</div>
                </div>
              </div>
            </TabsContent>

            <TabsContent level="child" value="test" className="h-full p-3 space-y-3">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium text-muted-foreground">Test Workflow</div>
                  <Button 
                    onClick={handleTestWorkflow} 
                    disabled={isTestRunning}
                    size="sm"
                    className="h-7"
                  >
                    {isTestRunning ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <TestTube className="h-3 w-3 mr-1" />
                        Run Test
                      </>
                    )}
                  </Button>
                </div>

                {testResults.length > 0 && (
                  <ScrollArea className="h-32">
                    <div className="space-y-2">
                      {testResults.map((result, index) => (
                        <div key={index} className="p-2 bg-muted/50 rounded text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{result.nodeId}</span>
                            <Badge variant={result.status === 'passed' ? 'default' : 'destructive'} className="text-xs">
                              {result.status}
                            </Badge>
                          </div>
                          <div className="text-muted-foreground mt-1">{result.message}</div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}

                <div className="p-2 bg-muted/50 rounded text-xs">
                  <div className="font-medium mb-1">Test Options</div>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="h-3 w-3" />
                      <span>Include connectors</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="h-3 w-3" />
                      <span>Mock external APIs</span>
                    </label>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent level="child" value="visual" className="h-full p-3 space-y-3">
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="font-medium text-foreground">Visual Workflow</div>
                <p>Use the canvas on the right to visually build your workflow. Drag nodes from the Node Library tab, then connect them.</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Drag to pan; scroll to zoom</li>
                  <li>Right-click a node for configuration</li>
                  <li>Use the Smart Tips button above the canvas for suggestions</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent level="child" value="deploy" className="h-full p-3 space-y-3">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium text-muted-foreground">Deploy Workflow</div>
                  <Badge variant={deploymentStatus === 'deployed' ? 'default' : 'secondary'} className="text-xs">
                    {deploymentStatus}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-medium">Target</div>
                  <Select value={deploymentTarget} onValueChange={setDeploymentTarget}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="staging">Staging</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-medium">Options</div>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="h-3 w-3" />
                      <span className="text-xs">Enable monitoring</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="h-3 w-3" />
                      <span className="text-xs">Auto-scaling</span>
                    </label>
                  </div>
                </div>

                <Button 
                  onClick={handleDeployWorkflow} 
                  disabled={deploymentStatus === 'deploying'}
                  className="w-full h-8"
                  size="sm"
                >
                  {deploymentStatus === 'deploying' ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    <>
                      <Rocket className="h-3 w-3 mr-1" />
                      Deploy
                    </>
                  )}
                </Button>

                {deploymentStatus === 'deployed' && (
                  <div className="p-2 bg-green-50 border border-green-200 rounded text-xs">
                    <div className="flex items-center gap-1 text-green-800">
                      <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                      <span className="font-medium">Deployed to {deploymentTarget}</span>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};