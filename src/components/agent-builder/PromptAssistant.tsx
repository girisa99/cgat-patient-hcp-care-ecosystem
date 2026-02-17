import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Wand2, 
  ArrowRight, 
  Lightbulb,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export type AgentMode = 'visual' | 'manual';

interface PromptAssistantProps {
  mode: AgentMode;
  onGenerate: (prompt: string, generatedConfig: any) => void;
  isVisible: boolean;
  onToggle: () => void;
}

export const PromptAssistant: React.FC<PromptAssistantProps> = ({
  mode,
  onGenerate,
  isVisible,
  onToggle
}) => {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Missing Prompt",
        description: "Please describe what you want to build first.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate AI generation (replace with actual AI call)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const generatedConfig = generateConfigFromPrompt(prompt, mode);
      
      onGenerate(prompt, generatedConfig);
      
      toast({
        title: "Configuration Generated!",
        description: `Your ${mode} agent configuration has been generated and applied.`,
      });
      
      setPrompt('');
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate configuration. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateConfigFromPrompt = (prompt: string, mode: AgentMode) => {
    // This would be replaced with actual AI generation logic
    if (mode === 'visual') {
      return {
        type: 'visual',
        nodes: [
          { id: '1', type: 'start', data: { label: 'Start' }, position: { x: 100, y: 100 } },
          { id: '2', type: 'process', data: { label: 'Process Request' }, position: { x: 300, y: 100 } },
          { id: '3', type: 'end', data: { label: 'End' }, position: { x: 500, y: 100 } }
        ],
        edges: [
          { id: 'e1-2', source: '1', target: '2' },
          { id: 'e2-3', source: '2', target: '3' }
        ]
      };
    } else {
      return {
        type: 'manual',
        agentName: extractAgentName(prompt),
        description: prompt,
        actions: generateActionsFromPrompt(prompt),
        connectors: generateConnectorsFromPrompt(prompt),
        knowledgeBase: generateKnowledgeFromPrompt(prompt)
      };
    }
  };

  const extractAgentName = (prompt: string): string => {
    // Simple extraction logic - would be enhanced with AI
    const words = prompt.split(' ');
    return `${words[0]} Agent`;
  };

  const generateActionsFromPrompt = (prompt: string): string[] => {
    // Simple generation logic - would be enhanced with AI
    if (prompt.toLowerCase().includes('customer')) return ['Handle Customer Inquiries', 'Process Requests'];
    if (prompt.toLowerCase().includes('data')) return ['Analyze Data', 'Generate Reports'];
    return ['Process Information', 'Provide Responses'];
  };

  const generateConnectorsFromPrompt = (prompt: string): string[] => {
    // Simple generation logic - would be enhanced with AI
    const connectors = [];
    if (prompt.toLowerCase().includes('email')) connectors.push('Email Integration');
    if (prompt.toLowerCase().includes('database')) connectors.push('Database Connector');
    if (prompt.toLowerCase().includes('api')) connectors.push('REST API Connector');
    return connectors;
  };

  const generateKnowledgeFromPrompt = (prompt: string): string[] => {
    // Simple generation logic - would be enhanced with AI
    return ['General Knowledge Base', 'Domain-specific Information'];
  };

  if (!isVisible) {
    return (
      <Button
        onClick={onToggle}
        variant="outline"
        size="sm"
        className="fixed bottom-6 right-6 shadow-lg z-50"
      >
        <Zap className="w-4 h-4 mr-2" />
        AI Assistant
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 shadow-xl z-50 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wand2 className="w-5 h-5 text-primary" />
            AI Prompt Assistant
          </CardTitle>
          <Button onClick={onToggle} variant="ghost" size="sm">
            ×
          </Button>
        </div>
        <Badge variant="outline" className="w-fit">
          {mode === 'visual' ? 'Visual Workflow Mode' : 'Manual Configuration Mode'}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium mb-1">Describe your agent:</p>
              <p className="text-muted-foreground text-xs">
                {mode === 'visual' 
                  ? "I'll generate a visual workflow based on your description"
                  : "I'll pre-fill the configuration forms based on your description"
                }
              </p>
            </div>
          </div>
          
          <Textarea
            placeholder={mode === 'visual' 
              ? "e.g., Create a customer support agent that handles inquiries and escalates complex issues..."
              : "e.g., Build an agent that analyzes sales data, connects to our CRM, and generates weekly reports..."
            }
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="flex-1 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Generate {mode === 'visual' ? 'Workflow' : 'Config'}
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p className="flex items-center gap-1">
            <ArrowRight className="w-3 h-3" />
            {mode === 'visual' 
              ? "Creates visual nodes and connections"
              : "Pre-fills forms and settings"
            }
          </p>
          <p className="flex items-center gap-1">
            <ArrowRight className="w-3 h-3" />
            You can refine the generated configuration afterward
          </p>
        </div>
      </CardContent>
    </Card>
  );
};