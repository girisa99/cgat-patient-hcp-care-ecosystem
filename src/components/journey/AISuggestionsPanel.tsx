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
  Check,
  RefreshCw,
  Lightbulb,
  Clock,
  ArrowRight,
  Zap,
  GripVertical
} from 'lucide-react';
import type { JourneyStep } from '@/components/journey/EnhancedJourneyDesigner';
import { useJourneyAISuggestions } from '@/hooks/useJourneyAISuggestions';
import { useToast } from '@/hooks/use-toast';
import { DraggableAISuggestion } from '@/components/journey/DraggableAISuggestion';

interface AISuggestionsPanelProps {
  useCase: string;
  onAddStep: (step: JourneyStep, position?: number) => void;
  onAddAllSteps: (steps: JourneyStep[]) => void;
  currentStepsCount: number;
}

interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'perplexity' | 'anthropic';
  model: string;
  icon: React.ReactNode;
  description: string;
  bestFor: string[];
  pricing: string;
}

// AI Models are now managed by the universal AI system
// Use useUniversalAI() hook to get available providers and models

const mockAIModels: AIModel[] = [
  { 
    id: 'gpt-4', 
    name: 'GPT-4.1 (OpenAI)', 
    provider: 'openai',
    model: 'gpt-4.1-2025-04-14',
    icon: <Sparkles className="w-4 h-4" />,
    description: 'Powerful reasoning and complex tasks',
    bestFor: ['complex analysis', 'coding'],
    pricing: '$0.03/1K tokens'
  }
];

export const AISuggestionsPanel: React.FC<AISuggestionsPanelProps> = ({
  useCase,
  onAddStep,
  onAddAllSteps,
  currentStepsCount
}) => {
  const { toast } = useToast();
  const { suggestions, isLoading, generateSuggestions } = useJourneyAISuggestions();
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleGenerateSuggestions = async (model: AIModel) => {
    if (!useCase.trim()) {
      toast({
        title: "Use case required",
        description: "Please provide a use case to generate AI suggestions",
        variant: "destructive"
      });
      return;
    }

    setSelectedModel(model);
    await generateSuggestions(useCase, model.provider);
    
    if (suggestions.length > 0) {
      toast({
        title: "AI suggestions generated",
        description: `Generated ${suggestions.length} intelligent journey steps using ${model.name}`,
      });
    }
  };

  const handleAddAllSteps = () => {
    onAddAllSteps(suggestions);
    toast({
      title: "All steps added",
      description: `Added ${suggestions.length} AI-generated steps to your journey`,
    });
  };

  const getStepTypeColor = (type: JourneyStep['type']) => {
    switch (type) {
      case 'action': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'decision': return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'integration': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'validation': return 'bg-purple-500/10 text-purple-700 border-purple-200';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const getTotalEstimatedTime = () => {
    return suggestions.reduce((total, step) => total + (step.estimatedDuration || 0), 0);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active } = event;
    
    if (active.data.current?.type === 'ai-suggestion') {
      const step = active.data.current.step as JourneyStep;
      onAddStep(step, currentStepsCount);
      toast({
        title: "Step added via drag & drop",
        description: `"${step.title}" added to your journey`,
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">AI Journey Suggestions</CardTitle>
          </div>
          {suggestions.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {suggestions.length} suggestions
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Generate intelligent journey steps based on your use case and selected AI model
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Use Case Display */}
        {useCase && (
          <div className="p-3 bg-muted/50 rounded-lg border">
            <p className="text-sm font-medium mb-1">Current Use Case:</p>
            <p className="text-sm text-muted-foreground">{useCase}</p>
          </div>
        )}

        {/* AI Model Selection */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Select AI Model for Suggestions</h4>
          <div className="grid grid-cols-1 gap-2">
            {mockAIModels.map(model => (
              <Button
                key={model.id}
                variant={selectedModel?.id === model.id ? "default" : "outline"}
                className="flex items-start gap-3 h-auto p-3 justify-start text-left"
                onClick={() => handleGenerateSuggestions(model)}
                disabled={isLoading}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {isLoading && selectedModel?.id === model.id ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    model.icon
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">{model.name}</div>
                    <Badge variant="outline" className="text-xs">
                      {model.pricing}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{model.description}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {model.bestFor.slice(0, 2).map(use => (
                      <Badge key={use} variant="secondary" className="text-xs px-1.5 py-0.5">
                        {use}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Generated Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-4">
            <Separator />
            
            {/* Summary */}
            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="space-y-1">
                <p className="font-medium text-sm">Generated Journey Steps</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {suggestions.length} steps
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    ~{getTotalEstimatedTime()} min total
                  </span>
                </div>
              </div>
              <Button onClick={handleAddAllSteps} className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Add All Steps
              </Button>
            </div>

            {/* Suggestions List with Drag & Drop */}
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <ScrollArea className="max-h-[400px]">
                <div className="space-y-3">
                  <div className="text-xs text-muted-foreground mb-2 px-2">
                    💡 <strong>Tip:</strong> Drag any suggestion to add it to your journey, or click the + button
                  </div>
                  
                  {suggestions.map((step, index) => (
                    <DraggableAISuggestion
                      key={step.id}
                      step={step}
                      index={index}
                      isExpanded={expandedStep === step.id}
                      onToggleExpanded={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                      onAddStep={() => onAddStep(step, currentStepsCount)}
                      getStepTypeColor={getStepTypeColor}
                    />
                  ))}
                </div>
              </ScrollArea>
            </DndContext>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && suggestions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Select an AI model above to generate intelligent journey step suggestions</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};