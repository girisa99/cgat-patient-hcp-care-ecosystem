import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useGlobalAgentGenerator } from '@/hooks/useGlobalAgentGenerator';
import ProgressiveAgentBuilder from '@/components/unified/ProgressiveAgentBuilder';
import { Sparkles, TestTube } from 'lucide-react';
import { useMasterToast } from '@/hooks/useMasterToast';

export const GlobalAgentGeneratorModal: React.FC = () => {
  const { 
    isGeneratorOpen, 
    closeGenerator, 
    addGeneratedAgent, 
    context 
  } = useGlobalAgentGenerator();
  const { showSuccess } = useMasterToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAgentGenerated = (agentData: any) => {
    setIsGenerating(false);
    
    // Create a standardized agent object
    const generatedAgent = {
      id: `agent-${Date.now()}`,
      name: agentData.name || 'Generated Agent',
      nodes: agentData.nodes || [],
      edges: agentData.edges || [],
      prompt: agentData.metadata?.originalPrompt || '',
      provider: agentData.metadata?.provider || 'openai',
      generatedAt: new Date().toISOString()
    };

    addGeneratedAgent(generatedAgent);
    showSuccess(`Agent "${generatedAgent.name}" generated successfully! Ready for testing.`);
    closeGenerator();
  };

  const getDialogDescription = () => {
    if (context?.purpose) {
      return `Generate an AI agent for ${context.purpose}. Describe what you want the agent to do and we'll create a workflow ready for testing.`;
    }
    return "Describe your workflow in natural language and we'll generate a complete agent with connected nodes ready for testing.";
  };

  const getPrefillPrompt = () => {
    if (context?.prefillPrompt) {
      return context.prefillPrompt;
    }
    if (context?.purpose) {
      return `Create an agent for ${context.purpose} that can...`;
    }
    return '';
  };

  return (
    <Dialog open={isGeneratorOpen} onOpenChange={(open) => !open && closeGenerator()}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generate Agent for Testing
            {context?.purpose && (
              <Badge variant="secondary" className="ml-2">
                <TestTube className="h-3 w-3 mr-1" />
                {context.purpose}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {getDialogDescription()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <ProgressiveAgentBuilder
            onComplete={handleAgentGenerated}
            prefillPrompt={getPrefillPrompt()}
            step="prompt"
          />
        </div>
        
        {isGenerating && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 animate-pulse text-primary" />
              Generating your agent...
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};