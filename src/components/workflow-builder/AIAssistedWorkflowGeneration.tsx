import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Wand2, Brain, Lightbulb, Zap, Download, Copy } from 'lucide-react';
import { Node, Edge } from '@xyflow/react';
import { useMasterToast } from '@/hooks/useMasterToast';

interface AIAssistedWorkflowGenerationProps {
  onWorkflowGenerated?: (nodes: Node[], edges: Edge[]) => void;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  complexity: 'simple' | 'medium' | 'complex';
  estimatedNodes: number;
  useCase: string;
}

interface GeneratedWorkflow {
  nodes: Node[];
  edges: Edge[];
  description: string;
  complexity: string;
  estimatedExecutionTime: string;
  requiredIntegrations: string[];
}

const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'customer-support',
    name: 'Customer Support Chatbot',
    description: 'Automated customer support with sentiment analysis and escalation',
    category: 'Customer Service',
    complexity: 'medium',
    estimatedNodes: 8,
    useCase: 'Handle customer inquiries, analyze sentiment, and escalate complex issues to human agents'
  },
  {
    id: 'document-qa',
    name: 'Document Q&A System',
    description: 'RAG-based document question answering with vector search',
    category: 'Knowledge Management',
    complexity: 'complex',
    estimatedNodes: 12,
    useCase: 'Answer questions based on uploaded documents using retrieval-augmented generation'
  },
  {
    id: 'lead-qualification',
    name: 'Lead Qualification Bot',
    description: 'Qualify leads through conversational AI and scoring',
    category: 'Sales & Marketing',
    complexity: 'medium',
    estimatedNodes: 10,
    useCase: 'Engage prospects, qualify leads based on criteria, and route to appropriate sales team'
  },
  {
    id: 'content-moderation',
    name: 'Content Moderation Pipeline',
    description: 'Automated content screening with human review for edge cases',
    category: 'Content Management',
    complexity: 'medium',
    estimatedNodes: 7,
    useCase: 'Automatically detect and moderate inappropriate content with human oversight'
  },
  {
    id: 'data-extraction',
    name: 'Document Data Extraction',
    description: 'Extract structured data from unstructured documents',
    category: 'Data Processing',
    complexity: 'complex',
    estimatedNodes: 15,
    useCase: 'Process invoices, forms, and documents to extract key information automatically'
  }
];

export const AIAssistedWorkflowGeneration: React.FC<AIAssistedWorkflowGenerationProps> = ({
  onWorkflowGenerated
}) => {
  const { showSuccess, showError, showInfo } = useMasterToast();
  const [prompt, setPrompt] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedComplexity, setSelectedComplexity] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWorkflow, setGeneratedWorkflow] = useState<GeneratedWorkflow | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);

  const categories = ['Customer Service', 'Knowledge Management', 'Sales & Marketing', 'Content Management', 'Data Processing'];
  const complexities = ['simple', 'medium', 'complex'];

  const generateWorkflowFromPrompt = async () => {
    if (!prompt.trim()) {
      showError('Please enter a workflow description');
      return;
    }

    setIsGenerating(true);
    showInfo('AI is analyzing your prompt and generating workflow...');

    try {
      // Simulate AI-powered workflow generation
      await new Promise(resolve => setTimeout(resolve, 3000));

      const nodes = generateNodesFromPrompt(prompt);
      const edges = generateEdgesFromNodes(nodes);

      const workflow: GeneratedWorkflow = {
        nodes,
        edges,
        description: `AI-generated workflow based on: "${prompt}"`,
        complexity: selectedComplexity || 'medium',
        estimatedExecutionTime: '2-5 minutes',
        requiredIntegrations: extractRequiredIntegrations(prompt)
      };

      setGeneratedWorkflow(workflow);
      showSuccess('Workflow generated successfully!');
    } catch (error) {
      showError('Failed to generate workflow');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateWorkflowFromTemplate = async (template: WorkflowTemplate) => {
    setIsGenerating(true);
    showInfo(`Generating ${template.name} workflow...`);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const nodes = generateNodesFromTemplate(template);
      const edges = generateEdgesFromNodes(nodes);

      const workflow: GeneratedWorkflow = {
        nodes,
        edges,
        description: template.description,
        complexity: template.complexity,
        estimatedExecutionTime: getEstimatedTime(template.complexity),
        requiredIntegrations: getTemplateIntegrations(template.id)
      };

      setGeneratedWorkflow(workflow);
      setSelectedTemplate(template);
      showSuccess(`${template.name} workflow generated!`);
    } catch (error) {
      showError('Failed to generate workflow from template');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateNodesFromPrompt = (prompt: string): Node[] => {
    // Analyze prompt and generate appropriate nodes
    const nodes: Node[] = [];
    let nodeCount = 0;

    // Always start with an input node
    nodes.push({
      id: `node-${nodeCount++}`,
      type: 'input',
      position: { x: 100, y: 50 },
      data: { label: 'User Input' }
    });

    // Analyze prompt for different capabilities
    if (prompt.toLowerCase().includes('chatbot') || prompt.toLowerCase().includes('conversation')) {
      nodes.push({
        id: `node-${nodeCount++}`,
        type: 'llm-agent',
        position: { x: 300, y: 50 },
        data: { label: 'Conversational AI', nodeType: 'llm-agent' }
      });
    }

    if (prompt.toLowerCase().includes('document') || prompt.toLowerCase().includes('search') || prompt.toLowerCase().includes('knowledge')) {
      nodes.push({
        id: `node-${nodeCount++}`,
        type: 'retriever-node',
        position: { x: 500, y: 50 },
        data: { label: 'Document Retriever', nodeType: 'retriever-node' }
      });
    }

    if (prompt.toLowerCase().includes('condition') || prompt.toLowerCase().includes('if') || prompt.toLowerCase().includes('decision')) {
      nodes.push({
        id: `node-${nodeCount++}`,
        type: 'condition-agent',
        position: { x: 300, y: 200 },
        data: { label: 'Decision Logic', nodeType: 'condition-agent' }
      });
    }

    if (prompt.toLowerCase().includes('tool') || prompt.toLowerCase().includes('api') || prompt.toLowerCase().includes('integration')) {
      nodes.push({
        id: `node-${nodeCount++}`,
        type: 'tool-agent',
        position: { x: 500, y: 200 },
        data: { label: 'External Tool', nodeType: 'tool-agent' }
      });
    }

    if (prompt.toLowerCase().includes('loop') || prompt.toLowerCase().includes('iterate') || prompt.toLowerCase().includes('repeat')) {
      nodes.push({
        id: `node-${nodeCount++}`,
        type: 'loop-node',
        position: { x: 300, y: 350 },
        data: { label: 'Loop Logic', nodeType: 'loop-node' }
      });
    }

    // Always end with an output node
    nodes.push({
      id: `node-${nodeCount++}`,
      type: 'output',
      position: { x: 700, y: 200 },
      data: { label: 'Final Output' }
    });

    return nodes;
  };

  const generateNodesFromTemplate = (template: WorkflowTemplate): Node[] => {
    const nodes: Node[] = [];
    let nodeCount = 0;
    let yPosition = 50;

    switch (template.id) {
      case 'customer-support':
        return [
          { id: `node-${nodeCount++}`, type: 'input', position: { x: 100, y: yPosition }, data: { label: 'Customer Query' } },
          { id: `node-${nodeCount++}`, type: 'llm-agent', position: { x: 300, y: yPosition }, data: { label: 'Intent Classifier', nodeType: 'llm-agent' } },
          { id: `node-${nodeCount++}`, type: 'condition-agent', position: { x: 500, y: yPosition }, data: { label: 'Route Decision', nodeType: 'condition-agent' } },
          { id: `node-${nodeCount++}`, type: 'retriever-node', position: { x: 300, y: yPosition + 150 }, data: { label: 'Knowledge Base', nodeType: 'retriever-node' } },
          { id: `node-${nodeCount++}`, type: 'llm-agent', position: { x: 500, y: yPosition + 150 }, data: { label: 'Response Generator', nodeType: 'llm-agent' } },
          { id: `node-${nodeCount++}`, type: 'condition-agent', position: { x: 700, y: yPosition + 150 }, data: { label: 'Escalation Check', nodeType: 'condition-agent' } },
          { id: `node-${nodeCount++}`, type: 'tool-agent', position: { x: 500, y: yPosition + 300 }, data: { label: 'Human Handoff', nodeType: 'tool-agent' } },
          { id: `node-${nodeCount++}`, type: 'output', position: { x: 900, y: yPosition + 150 }, data: { label: 'Customer Response' } }
        ];

      case 'document-qa':
        return [
          { id: `node-${nodeCount++}`, type: 'input', position: { x: 100, y: yPosition }, data: { label: 'User Question' } },
          { id: `node-${nodeCount++}`, type: 'retriever-node', position: { x: 300, y: yPosition }, data: { label: 'Vector Search', nodeType: 'retriever-node' } },
          { id: `node-${nodeCount++}`, type: 'condition-agent', position: { x: 500, y: yPosition }, data: { label: 'Relevance Check', nodeType: 'condition-agent' } },
          { id: `node-${nodeCount++}`, type: 'llm-agent', position: { x: 300, y: yPosition + 150 }, data: { label: 'Context Processor', nodeType: 'llm-agent' } },
          { id: `node-${nodeCount++}`, type: 'llm-agent', position: { x: 500, y: yPosition + 150 }, data: { label: 'Answer Generator', nodeType: 'llm-agent' } },
          { id: `node-${nodeCount++}`, type: 'condition-agent', position: { x: 700, y: yPosition + 150 }, data: { label: 'Confidence Score', nodeType: 'condition-agent' } },
          { id: `node-${nodeCount++}`, type: 'output', position: { x: 900, y: yPosition + 150 }, data: { label: 'Final Answer' } }
        ];

      default:
        // Generic template
        return [
          { id: `node-${nodeCount++}`, type: 'input', position: { x: 100, y: yPosition }, data: { label: 'Input' } },
          { id: `node-${nodeCount++}`, type: 'llm-agent', position: { x: 300, y: yPosition }, data: { label: 'AI Processor', nodeType: 'llm-agent' } },
          { id: `node-${nodeCount++}`, type: 'condition-agent', position: { x: 500, y: yPosition }, data: { label: 'Logic Gate', nodeType: 'condition-agent' } },
          { id: `node-${nodeCount++}`, type: 'output', position: { x: 700, y: yPosition }, data: { label: 'Output' } }
        ];
    }
  };

  const generateEdgesFromNodes = (nodes: Node[]): Edge[] => {
    const edges: Edge[] = [];
    
    // Connect nodes sequentially for basic workflow
    for (let i = 0; i < nodes.length - 1; i++) {
      edges.push({
        id: `edge-${i}`,
        source: nodes[i].id,
        target: nodes[i + 1].id,
        type: 'smoothstep'
      });
    }

    return edges;
  };

  const extractRequiredIntegrations = (prompt: string): string[] => {
    const integrations: string[] = [];
    
    if (prompt.toLowerCase().includes('openai') || prompt.toLowerCase().includes('gpt')) {
      integrations.push('OpenAI API');
    }
    if (prompt.toLowerCase().includes('anthropic') || prompt.toLowerCase().includes('claude')) {
      integrations.push('Anthropic API');
    }
    if (prompt.toLowerCase().includes('pinecone') || prompt.toLowerCase().includes('vector')) {
      integrations.push('Vector Database');
    }
    if (prompt.toLowerCase().includes('slack') || prompt.toLowerCase().includes('discord')) {
      integrations.push('Chat Platform');
    }
    if (prompt.toLowerCase().includes('email') || prompt.toLowerCase().includes('gmail')) {
      integrations.push('Email Service');
    }

    return integrations.length > 0 ? integrations : ['Basic AI Models'];
  };

  const getTemplateIntegrations = (templateId: string): string[] => {
    const integrationMap: Record<string, string[]> = {
      'customer-support': ['OpenAI API', 'Vector Database', 'CRM Integration'],
      'document-qa': ['OpenAI API', 'Pinecone', 'Document Storage'],
      'lead-qualification': ['OpenAI API', 'CRM API', 'Email Service'],
      'content-moderation': ['OpenAI API', 'Image Recognition', 'Notification Service'],
      'data-extraction': ['OpenAI API', 'OCR Service', 'Database']
    };

    return integrationMap[templateId] || ['Basic AI Models'];
  };

  const getEstimatedTime = (complexity: string): string => {
    const timeMap = {
      simple: '1-2 minutes',
      medium: '2-5 minutes',
      complex: '5-15 minutes'
    };
    return timeMap[complexity as keyof typeof timeMap] || '2-5 minutes';
  };

  const applyGeneratedWorkflow = () => {
    if (generatedWorkflow && onWorkflowGenerated) {
      onWorkflowGenerated(generatedWorkflow.nodes, generatedWorkflow.edges);
      showSuccess('Workflow applied to canvas!');
    }
  };

  const exportWorkflow = () => {
    if (generatedWorkflow) {
      const dataStr = JSON.stringify(generatedWorkflow, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = 'ai-generated-workflow.json';
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      showSuccess('Workflow exported!');
    }
  };

  const copyWorkflowJSON = () => {
    if (generatedWorkflow) {
      navigator.clipboard.writeText(JSON.stringify(generatedWorkflow, null, 2));
      showSuccess('Workflow JSON copied to clipboard!');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI-Assisted Workflow Generation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="prompt" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="prompt">Generate from Prompt</TabsTrigger>
              <TabsTrigger value="templates">Use Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="prompt" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Describe your workflow
                  </label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Example: Create a customer support chatbot that can answer questions from our knowledge base, escalate complex issues to humans, and track customer satisfaction..."
                    className="min-h-[120px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Category (Optional)
                    </label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Complexity (Optional)
                    </label>
                    <Select value={selectedComplexity} onValueChange={setSelectedComplexity}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select complexity" />
                      </SelectTrigger>
                      <SelectContent>
                        {complexities.map(complexity => (
                          <SelectItem key={complexity} value={complexity}>
                            {complexity.charAt(0).toUpperCase() + complexity.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={generateWorkflowFromPrompt}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Zap className="h-4 w-4 animate-pulse" />
                      Generating Workflow...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      Generate Workflow
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {WORKFLOW_TEMPLATES.map((template) => (
                    <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{template.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {template.description}
                            </p>
                          </div>
                          <Button
                            onClick={() => generateWorkflowFromTemplate(template)}
                            disabled={isGenerating}
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <Brain className="h-4 w-4" />
                            Generate
                          </Button>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary">{template.category}</Badge>
                          <Badge variant={template.complexity === 'simple' ? 'outline' : template.complexity === 'medium' ? 'default' : 'destructive'} 
                                 className={template.complexity === 'simple' ? 'border-green-500 text-green-700' : ''}>
                            {template.complexity}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            ~{template.estimatedNodes} nodes
                          </span>
                        </div>

                        <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                          <div className="text-sm">
                            <strong>Use Case:</strong> {template.useCase}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Generated Workflow Preview */}
      {generatedWorkflow && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Generated Workflow
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm">{generatedWorkflow.description}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{generatedWorkflow.nodes.length}</div>
                <div className="text-sm text-muted-foreground">Nodes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{generatedWorkflow.edges.length}</div>
                <div className="text-sm text-muted-foreground">Connections</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{generatedWorkflow.complexity}</div>
                <div className="text-sm text-muted-foreground">Complexity</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{generatedWorkflow.estimatedExecutionTime}</div>
                <div className="text-sm text-muted-foreground">Est. Time</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Required Integrations:</h4>
              <div className="flex gap-2 flex-wrap">
                {generatedWorkflow.requiredIntegrations.map((integration, index) => (
                  <Badge key={index} variant="outline">{integration}</Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={applyGeneratedWorkflow} className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Apply to Canvas
              </Button>
              <Button variant="outline" onClick={exportWorkflow} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export JSON
              </Button>
              <Button variant="outline" onClick={copyWorkflowJSON} className="flex items-center gap-2">
                <Copy className="h-4 w-4" />
                Copy JSON
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIAssistedWorkflowGeneration;