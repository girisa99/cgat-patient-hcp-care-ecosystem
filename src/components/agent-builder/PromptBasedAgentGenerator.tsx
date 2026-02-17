import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles, Play, Users, FileText, MessageSquare, Search, Brain } from 'lucide-react';
import { useMasterToast } from '@/hooks/useMasterToast';
import { useUniversalAI } from '@/hooks/useUniversalAI';
import { getErrorMessage } from '@/utils/errorHandling';

interface PromptBasedAgentGeneratorProps {
  onGenerate: (agentData: any) => void;
  className?: string;
  prefillPrompt?: string;
}

const SUGGESTED_PROMPTS = [
  {
    title: "Multi-Agent Support Team",
    prompt: "A comprehensive support team with routing agent, specialized technical support agents, human escalation, and knowledge base integration",
    icon: Users,
    category: "Support"
  },
  {
    title: "Content Publishing Workflow",
    prompt: "Content generation agent → human review → approval workflow → multi-channel publishing with API integrations",
    icon: FileText,
    category: "Content"
  },
  {
    title: "Data Processing Pipeline",
    prompt: "HTTP API data retrieval → database storage → AI analysis agent → conditional routing → automated reporting",
    icon: Search,
    category: "Research"
  },
  {
    title: "Customer Journey Automation",
    prompt: "Customer input → intent classification → decision routing → specialized agents → follow-up automation with human oversight",
    icon: Brain,
    category: "Analysis"
  }
];


export const PromptBasedAgentGenerator: React.FC<PromptBasedAgentGeneratorProps> = ({
  onGenerate,
  className = "",
  prefillPrompt = ""
}) => {
  const [prompt, setPrompt] = useState(prefillPrompt);
  const { generateAgent, isLoading, providers } = useUniversalAI();
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const { showSuccess, showError, showInfo } = useMasterToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showInfo('Please enter a description for your agent');
      return;
    }

    try {
      const agentData = await generateAgent(prompt.trim(), selectedProvider as "openai" | "claude" | "gemini");
      
      if (!agentData) {
        throw new Error('No data returned from AI generation');
      }
      
      // Check if we got nodes back
      if (!agentData.nodes || agentData.nodes.length === 0) {
        console.warn('No nodes in generated data:', agentData);
        showError('AI generated workflow but no nodes were created. Try a different prompt.');
        return;
      }
      
      showSuccess(`Agent generated successfully! Created ${agentData.nodes.length} nodes.`);
      onGenerate(agentData);
      try {
        if (typeof window !== 'undefined') {
          // Broadcast so any canvas can react immediately
          try { window.dispatchEvent(new CustomEvent('workflow-generated', { detail: agentData })); } catch {}
          // Persist for /agents page to pick up and render
          try { localStorage.setItem('pendingWorkflow', JSON.stringify(agentData)); } catch {}
          // Navigate to /agents without full reload (react-router)
          if (window.location?.pathname !== '/agents') {
            window.history.pushState({}, '', '/agents');
            window.dispatchEvent(new PopStateEvent('popstate'));
          }
        }
      } catch {}
      setPrompt('');
    } catch (error) {
      console.error('Error generating agent:', error);
      showError(getErrorMessage(error));
    }
  };

  const handleSuggestedPrompt = (suggestedPrompt: string) => {
    setPrompt(suggestedPrompt);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            What would you like to build?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Suggested Prompts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SUGGESTED_PROMPTS.map((suggestion, index) => {
              const IconComponent = suggestion.icon;
              return (
                <div
                  key={index}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => handleSuggestedPrompt(suggestion.prompt)}
                >
                  <div className="flex items-start gap-3">
                    <IconComponent className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{suggestion.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {suggestion.prompt}
                      </div>
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {suggestion.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Prompt Input */}
          <div className="space-y-3">
            <Textarea
              placeholder="Describe your agent in natural language... e.g., 'A team of support agents that can handle billing, technical, and general queries'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px] resize-none"
            />
            
            {/* AI Provider Selection */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">AI Provider:</span>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {providers.map(provider => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={isLoading || !prompt.trim()}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating your Agent...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Generate Agent
                </>
              )}
            </Button>
          </div>

          {/* Generation Progress */}
          {isLoading && (
            <div className="space-y-2">
              <div className="flex justify-center">
                <Sparkles className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <div className="text-center text-sm text-muted-foreground">
                Generating your Agentflow...
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};