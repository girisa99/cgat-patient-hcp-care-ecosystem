import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, 
  Sparkles, 
  Workflow, 
  Loader2, 
  Database,
  Eye,
  Play,
  Zap
} from 'lucide-react';
import { useWorkflowNodes } from '@/hooks/useWorkflowNodes';
import { useRealAIIntegration } from '@/hooks/useRealAIIntegration';
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
  const [activeTab, setActiveTab] = useState('prompt');

  const { categories, nodeTypesByCategory, isLoading: nodesLoading } = useWorkflowNodes();
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

  const handleVisualWorkflow = () => {
    // Switch to visual workflow builder mode
    setActiveTab('visual');
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="prompt" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Generate Workflow
              </TabsTrigger>
              <TabsTrigger value="visual" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Visual Workflow
              </TabsTrigger>
            </TabsList>

            <TabsContent value="prompt" className="space-y-4">
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
                    onClick={handleVisualWorkflow}
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
                <Button onClick={() => setActiveTab('prompt')} variant="outline">
                  <Zap className="h-4 w-4 mr-2" />
                  Back to AI Generation
                </Button>
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