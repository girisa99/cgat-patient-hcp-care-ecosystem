
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface JourneyStep {
  id: string;
  title: string;
  description: string;
  type: 'action' | 'decision' | 'integration' | 'validation';
  connectors: string[];
  actions: string[];
  requirements: string[];
  stakeholders: string[];
  businessValue: string;
  riskLevel: 'low' | 'medium' | 'high';
  automationLevel: 'manual' | 'semi-automated' | 'fully-automated';
  estimatedDuration: number;
  dependencies: string[];
}

export const useJourneyAISuggestions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<JourneyStep[]>([]);
  const { toast } = useToast();

  const generateSuggestions = async (useCase: string, context?: string) => {
    if (!useCase?.trim()) {
      toast({
        title: "Use Case Required",
        description: "Please provide a use case to generate journey suggestions",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log('🤖 Generating AI journey suggestions for use case:', useCase);

    try {
      const { data, error } = await supabase.functions.invoke('generate-journey-suggestions', {
        body: {
          useCase: useCase.trim(),
          modelType: 'llm',
          context: context || 'Healthcare workflow automation'
        }
      });

      if (error) {
        console.error('❌ Supabase function error:', error);
        throw error;
      }

      if (!data || !Array.isArray(data.steps)) {
        console.error('❌ Invalid response format:', data);
        throw new Error('Invalid response format from AI service');
      }

      console.log('✅ AI suggestions generated:', data.steps.length, 'steps');
      setSuggestions(data.steps);

      toast({
        title: "Journey Generated! 🎉",
        description: `Generated ${data.steps.length} workflow steps for your use case`,
        variant: "default",
      });

      return data.steps;
    } catch (error: any) {
      console.error('❌ Failed to generate journey suggestions:', error);
      
      const errorMessage = error.message || 'Failed to generate journey suggestions';
      
      // Check if it's an OpenAI API key issue
      if (errorMessage.includes('OPENAI_API_KEY')) {
        toast({
          title: "OpenAI API Key Required",
          description: "Please configure your OpenAI API key in the Edge Function secrets to generate AI suggestions",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Generation Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }

      // Return empty array on error
      setSuggestions([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const clearSuggestions = () => {
    setSuggestions([]);
  };

  return {
    isLoading,
    suggestions,
    generateSuggestions,
    clearSuggestions
  };
};
