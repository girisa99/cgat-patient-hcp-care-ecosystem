import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, Brain, Play, Settings, TestTube, Rocket, 
  X, Minimize2, Maximize2, ChevronRight, Bot, Users
} from 'lucide-react';
import { useUniversalAI } from '@/hooks/useUniversalAI';
import { useWorkflowNodes } from '@/hooks/useWorkflowNodes';
import { useMasterToast } from '@/hooks/useMasterToast';
import { supabase } from '@/integrations/supabase/client';

interface AIAssistMode {
  id: 'build' | 'generate' | 'test' | 'deploy' | 'configure';
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface AIAssistIntegrationProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkflowGenerated: (workflow: any) => void;
  onNodeGenerated: (node: any) => void;
  initialMode?: 'build' | 'generate' | 'test' | 'deploy' | 'configure';
  selectedNodeId?: string;
}

export const AIAssistIntegration: React.FC<AIAssistIntegrationProps> = ({
  isOpen,
  onClose,
  onWorkflowGenerated,
  onNodeGenerated,
  initialMode = 'build',
  selectedNodeId
}) => {
  const { nodeTypes, categories } = useWorkflowNodes();
  const { generateAgent, testNode, analyzeWorkflow, isLoading } = useUniversalAI();
  const { showSuccess, showError } = useMasterToast();
  
  const [activeMode, setActiveMode] = useState<'build' | 'generate' | 'test' | 'deploy' | 'configure'>(initialMode);
  const [prompt, setPrompt] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'claude' | 'gemini'>('openai');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const aiModes: AIAssistMode[] = [
    {
      id: 'build',
      title: 'Build Workflow',
      description: 'Generate complete workflows from natural language',
      icon: Brain,
      color: '#3b82f6'
    },
    {
      id: 'generate',
      title: 'Generate Nodes',
      description: 'Create specific nodes and agents',
      icon: Sparkles,
      color: '#8b5cf6'
    },
    {
      id: 'test',
      title: 'Test & Validate',
      description: 'Test workflow nodes and connections',
      icon: TestTube,
      color: '#10b981'
    },
    {
      id: 'deploy',
      title: 'Deploy Agents',
      description: 'Deploy agents to production environment',
      icon: Rocket,
      color: '#f59e0b'
    },
    {
      id: 'configure',
      title: 'Configure',
      description: 'AI-assisted node configuration',
      icon: Settings,
      color: '#06b6d4'
    }
  ];

  const handleAIGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      showError('Please enter a prompt describing what you want to create');
      return;
    }

    try {
      setIsProcessing(true);
      const context = {
        availableCategories: categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          description: cat.description
        })),
        availableNodeTypes: nodeTypes.map(node => ({
          key: node.type_key,
          display_name: node.display_name,
          category: node.category?.name,
          description: node.description,
          capabilities: node.capabilities
        })),
        mode: activeMode
      };

      switch (activeMode) {
        case 'build':
          // Generate complete workflow using edge function
          const { data: workflowData, error: workflowError } = await supabase.functions.invoke('generate-agent-from-prompt', {
            body: {
              prompt: prompt.trim(),
              provider: selectedProvider,
              context,
              generateConnections: true,
              includeTemplates: true
            }
          });

          if (workflowError) throw workflowError;
          onWorkflowGenerated(workflowData);
          onClose();
          break;

        case 'generate':
          // Generate specific nodes/agents
          const agentData = await generateAgent(prompt, selectedProvider);
          if (agentData) {
            onNodeGenerated(agentData);
          }
          break;

        case 'test':
          // Test existing nodes
          if (selectedNodeId) {
            const { data: testData, error: testError } = await supabase.functions.invoke('ai-universal-processor', {
              body: {
                action: 'test_node',
                prompt: prompt.trim(),
                nodeId: selectedNodeId,
                provider: selectedProvider,
                context
              }
            });

            if (testError) throw testError;
            
            showSuccess(`Test completed successfully!`);
            console.log('Test results:', testData);
          } else {
            showError('Please select a node to test');
          }
          break;

        case 'configure':
          // AI-assisted configuration
          const { data: configData, error: configError } = await supabase.functions.invoke('ai-universal-processor', {
            body: {
              action: 'configure_node',
              prompt: prompt.trim(),
              nodeId: selectedNodeId,
              provider: selectedProvider,
              context
            }
          });

          if (configError) throw configError;
          
          showSuccess('Configuration generated successfully!');
          
          // Parse configuration if it's a JSON string
          let parsedConfig = configData;
          if (typeof configData.content === 'string') {
            try {
              parsedConfig = JSON.parse(configData.content);
            } catch {
              parsedConfig = { content: configData.content };
            }
          }
          
          onNodeGenerated(parsedConfig);
          break;

        case 'deploy':
          // Deploy existing agents
          const { data: deployData, error: deployError } = await supabase.functions.invoke('ai-universal-processor', {
            body: {
              action: 'deploy_agent',
              prompt: prompt.trim(),
              nodeId: selectedNodeId,
              provider: selectedProvider,
              context
            }
          });

          if (deployError) throw deployError;
          
          showSuccess('Agent deployment configuration generated!');
          onNodeGenerated(deployData);
          break;

        default:
          showError('Mode not implemented yet');
      }

      setPrompt('');
    } catch (error) {
      console.error('AI generation error:', error);
      showError('Failed to process AI request. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [prompt, activeMode, selectedProvider, nodeTypes, categories, selectedNodeId, generateAgent, testNode, onWorkflowGenerated, onNodeGenerated, showSuccess, showError]);

  const renderModeContent = () => {
    const currentMode = aiModes.find(mode => mode.id === activeMode);
    if (!currentMode) return null;
    
    const CurrentIcon = currentMode.icon;
    
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <CurrentIcon className="h-5 w-5" style={{ color: currentMode.color }} />
          <span className="font-medium">{currentMode.title}</span>
          <Badge variant="secondary" className="text-xs">{selectedProvider.toUpperCase()}</Badge>
        </div>

        <Textarea
          placeholder={`${currentMode!.description}... 

Examples for ${activeMode}:
${activeMode === 'build' ? '• "Create a patient onboarding workflow with intake, assessment, and care assignment"' : ''}
${activeMode === 'generate' ? '• "Generate a specialized nurse agent for medication management"' : ''}
${activeMode === 'test' ? '• "Test this agent with sample patient data"' : ''}
${activeMode === 'configure' ? '• "Configure this node for handling emergency cases"' : ''}`}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          className="resize-none"
        />

        <div className="flex items-center justify-between">
          <Select value={selectedProvider} onValueChange={(value: 'openai' | 'claude' | 'gemini') => setSelectedProvider(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="claude">Claude</SelectItem>
              <SelectItem value="gemini">Gemini</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            onClick={handleAIGenerate}
            disabled={isLoading || isProcessing || !prompt.trim()}
            className="min-w-32"
          >
            {isLoading || isProcessing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <>
                <CurrentIcon className="h-4 w-4 mr-2" />
                {currentMode.title}
              </>
            )}
          </Button>
        </div>

        {/* Context Information */}
        <div className="text-xs text-muted-foreground p-3 bg-secondary/50 rounded-lg">
          <p className="font-medium mb-1">AI will use your existing system:</p>
          <p>• {categories.length} categories: {categories.map(c => c.name).join(', ')}</p>
          <p>• {nodeTypes.length} node types available</p>
          <p>• Configurations sync with your database</p>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-4xl max-h-[90vh] ${isMinimized ? 'h-auto' : ''}`}>
        <DialogHeader className="flex flex-row items-center justify-between pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Workflow Assistant
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {!isMinimized && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Mode Selection */}
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-muted-foreground">AI Modes</h3>
              {aiModes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <Button
                    key={mode.id}
                    variant={activeMode === mode.id ? 'default' : 'ghost'}
                    onClick={() => setActiveMode(mode.id)}
                    className="w-full justify-start p-3 h-auto"
                  >
                    <Icon className="h-4 w-4 mr-2" style={{ color: activeMode === mode.id ? 'white' : mode.color }} />
                    <div className="text-left">
                      <div className="font-medium text-sm">{mode.title}</div>
                      <div className="text-xs opacity-70">{mode.description}</div>
                    </div>
                  </Button>
                );
              })}
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {renderModeContent()}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};