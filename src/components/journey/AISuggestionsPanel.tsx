import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import { 
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable';
import { 
  useDraggable
} from '@dnd-kit/core';
import { 
  Bot, 
  Sparkles, 
  Eye, 
  Brain, 
  Tags, 
  Plus, 
  ChevronDown, 
  ChevronUp,
  CheckCircle2,
  Circle,
  ArrowRight,
  Zap,
  GripVertical
} from 'lucide-react';
import type { JourneyStep } from '@/components/journey/EnhancedJourneyDesigner';
import { useJourneyAISuggestions } from '@/hooks/useJourneyAISuggestions';
import { useToast } from '@/hooks/use-toast';
import { DraggableAISuggestion } from '@/components/journey/DraggableAISuggestion';
import { useUniversalAI } from '@/hooks/useUniversalAI';

interface AISuggestionsPanelProps {
  useCase: string;
  onAddStep: (step: JourneyStep) => void;
  onAddAllSteps: (steps: JourneyStep[]) => void;
  currentStepsCount: number;
}

interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'claude' | 'gemini';
  model: string;
  icon: React.ReactNode;
  description: string;
  bestFor: string[];
  pricing: string;
}

export const AISuggestionsPanel: React.FC<AISuggestionsPanelProps> = ({
  useCase,
  onAddStep,
  onAddAllSteps,
  currentStepsCount
}) => {
  const { toast } = useToast();
  const { suggestions, isLoading, generateSuggestions } = useJourneyAISuggestions();
  const { availableProviders } = useUniversalAI();
  
  // Transform providers into AIModel format for compatibility
  const aiModels: AIModel[] = availableProviders.map(provider => ({
    id: provider.id,
    name: provider.name,
    provider: provider.id as 'openai' | 'claude' | 'gemini',
    model: provider.models?.[0] || provider.id,
    icon: <Sparkles className="w-4 h-4" />,
    description: provider.description || 'AI Provider',
    bestFor: provider.capabilities || [],
    pricing: 'Real-time pricing'
  }));

  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(aiModels[0] || null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleGenerateSuggestions = async (model: AIModel) => {
    setSelectedModel(model);
    
    if (!useCase.trim()) {
      toast({
        title: "Use case required",
        description: "Please provide a use case to generate suggestions.",
        variant: "destructive",
      });
      return;
    }

    try {
      await generateSuggestions(useCase, model.provider);
      toast({
        title: "AI Suggestions Generated",
        description: `Generated ${suggestions.length} workflow suggestions using ${model.name}`,
      });
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate AI suggestions. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddStep = (step: JourneyStep) => {
    onAddStep(step);
    toast({
      title: "Step Added",
      description: `Added "${step.title}" to your journey`,
    });
  };

  const handleAddAllSteps = () => {
    onAddAllSteps(suggestions);
    toast({
      title: "All Steps Added",
      description: `Added ${suggestions.length} AI-suggested steps to your journey`,
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && over.id === 'workflow-canvas') {
      const stepId = active.id as string;
      const step = suggestions.find(s => s.id === stepId);
      if (step) {
        handleAddStep(step);
      }
    }
  };

  const toggleStepDetails = (stepId: string) => {
    setExpandedStep(expandedStep === stepId ? null : stepId);
  };

  const getStepTypeColor = (type: JourneyStep['type']) => {
    const colors = {
      touchpoint: 'bg-blue-100 text-blue-800',
      process: 'bg-green-100 text-green-800',
      decision: 'bg-yellow-100 text-yellow-800',
      automation: 'bg-purple-100 text-purple-800',
      integration: 'bg-orange-100 text-orange-800',
      milestone: 'bg-pink-100 text-pink-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          AI Journey Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI Model Selection */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Select AI Model for Suggestions</h4>
          <div className="grid grid-cols-1 gap-2">
            {aiModels.map(model => (
              <Button
                key={model.id}
                variant={selectedModel?.id === model.id ? "default" : "outline"}
                className="flex items-start gap-3 h-auto p-3 justify-start text-left"
                onClick={() => handleGenerateSuggestions(model)}
                disabled={isLoading}
              >
                <div className="flex items-center gap-2">
                  {model.icon}
                  <div>
                    <div className="font-medium text-sm">{model.name}</div>
                    <div className="text-xs text-muted-foreground">{model.description}</div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Suggestions Display */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">
              Suggested Steps ({suggestions.length})
            </h4>
            {suggestions.length > 0 && (
              <Button
                size="sm"
                onClick={handleAddAllSteps}
                className="gap-1"
              >
                <Plus className="w-3 h-3" />
                Add All
              </Button>
            )}
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {!isLoading && suggestions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No suggestions yet</p>
              <p className="text-xs">Generate AI suggestions using a model above</p>
            </div>
          )}

          {suggestions.length > 0 && (
            <DndContext 
              sensors={sensors} 
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <ScrollArea className="h-[400px]">
                <div className="space-y-2 pr-2">
                  {suggestions.map((step, index) => (
                    <DraggableAISuggestion
                      key={step.id}
                      step={step}
                      index={index}
                      isExpanded={expandedStep === step.id}
                      onToggleExpanded={() => toggleStepDetails(step.id)}
                      onAddStep={() => handleAddStep(step)}
                      getStepTypeColor={getStepTypeColor}
                    />
                  ))}
                </div>
              </ScrollArea>
            </DndContext>
          )}
        </div>

        {/* Usage Stats */}
        {suggestions.length > 0 && (
          <>
            <Separator />
            <div className="text-xs text-muted-foreground">
              Current journey: {currentStepsCount} steps • 
              AI suggestions: {suggestions.length} steps •
              Model: {selectedModel?.name || 'None'}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};