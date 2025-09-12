import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// Note: Using manual collapsible implementation since ui/collapsible is not available
import { 
  ArrowUp, 
  ArrowDown, 
  Plus, 
  X, 
  Edit3, 
  Save, 
  Bot, 
  Sparkles, 
  Eye,
  Brain,
  Tags,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AISuggestionsPanel } from '@/components/journey/AISuggestionsPanel';

export interface JourneyStep {
  id: string;
  title: string;
  description: string;
  type: 'action' | 'decision' | 'integration' | 'validation';
  connectors?: string[];
  actions?: string[];
  requirements?: string[];
  estimatedDuration?: number;
  dependencies?: string[];
  stakeholders?: string[];
  businessValue?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  automationLevel?: 'manual' | 'semi-automated' | 'fully-automated';
}

interface AIModel {
  id: string;
  name: string;
  type: 'mcp' | 'sml' | 'llm' | 'vision' | 'label-studio';
  icon: React.ReactNode;
}

interface EnhancedJourneyDesignerProps {
  steps: JourneyStep[];
  useCase?: string;
  onStepsChange: (steps: JourneyStep[]) => void;
  onGenerateEcosystem?: () => void;
}

// AI Models are now managed by the universal AI system
// Use useUniversalAI() hook to get available providers and models

// AI Models are now managed by the universal AI system via useUniversalAI() hook

export const EnhancedJourneyDesigner: React.FC<EnhancedJourneyDesignerProps> = ({
  steps,
  useCase = '',
  onStepsChange,
  onGenerateEcosystem
}) => {
  const { toast } = useToast();
  const [editingStep, setEditingStep] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<JourneyStep[]>([]);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  
  // Local drafts to prevent input resets while typing
  const [drafts, setDrafts] = useState<Record<string, { title: string; description: string }>>({});

  // Initialize drafts when steps change
  React.useEffect(() => {
    const newDrafts: Record<string, { title: string; description: string }> = {};
    steps.forEach(step => {
      if (!drafts[step.id]) {
        newDrafts[step.id] = {
          title: step.title,
          description: step.description
        };
      }
    });
    if (Object.keys(newDrafts).length > 0) {
      setDrafts(prev => ({ ...prev, ...newDrafts }));
    }
  }, [steps]);

  const updateDraft = (stepId: string, field: 'title' | 'description', value: string) => {
    setDrafts(prev => ({
      ...prev,
      [stepId]: {
        ...prev[stepId],
        [field]: value
      }
    }));
  };

  const saveDraft = (stepId: string) => {
    const draft = drafts[stepId];
    if (draft) {
      updateStep(stepId, { 
        title: draft.title,
        description: draft.description 
      });
    }
  };

  // Move step up or down
  const moveStep = useCallback((stepId: string, direction: 'up' | 'down') => {
    const currentIndex = steps.findIndex(step => step.id === stepId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= steps.length) return;

    const newSteps = [...steps];
    [newSteps[currentIndex], newSteps[newIndex]] = [newSteps[newIndex], newSteps[currentIndex]];
    
    onStepsChange(newSteps);
    toast({
      title: "Step moved",
      description: `Step moved ${direction} successfully`,
    });
  }, [steps, onStepsChange, toast]);

  // Add new step at specific position
  const addStepAtPosition = useCallback((position: number) => {
    const newStep: JourneyStep = {
      id: `step-${Date.now()}`,
      title: 'New Journey Step',
      description: 'Describe what happens in this step',
      type: 'action',
      connectors: [],
      actions: [],
      requirements: [],
      estimatedDuration: 5
    };

    const newSteps = [...steps];
    newSteps.splice(position, 0, newStep);
    onStepsChange(newSteps);
    setEditingStep(newStep.id);
    
    // Save progress to localStorage
    const currentProgress = localStorage.getItem('agent-builder-progress');
    if (currentProgress) {
      try {
        const progress = JSON.parse(currentProgress);
        const updatedProgress = {
          ...progress,
          journeySteps: newSteps,
          timestamp: new Date().toISOString(),
          lastStep: 'journey-design'
        };
        localStorage.setItem('agent-builder-progress', JSON.stringify(updatedProgress));
      } catch (error) {
        console.error('Failed to save journey progress:', error);
      }
    }
    
    toast({
      title: "Step added",
      description: "New journey step added successfully",
    });
  }, [steps, onStepsChange, toast]);

  // Update step
  const updateStep = useCallback((stepId: string, updates: Partial<JourneyStep>) => {
    const newSteps = steps.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    );
    onStepsChange(newSteps);
    
    // Save progress to localStorage
    const currentProgress = localStorage.getItem('agent-builder-progress');
    if (currentProgress) {
      try {
        const progress = JSON.parse(currentProgress);
        const updatedProgress = {
          ...progress,
          journeySteps: newSteps,
          timestamp: new Date().toISOString(),
          lastStep: 'journey-design'
        };
        localStorage.setItem('agent-builder-progress', JSON.stringify(updatedProgress));
      } catch (error) {
        console.error('Failed to save journey progress:', error);
      }
    }
  }, [steps, onStepsChange]);

  // Remove step
  const removeStep = useCallback((stepId: string) => {
    if (steps.length <= 2) {
      toast({
        title: "Cannot remove step",
        description: "Journey must have at least 2 steps",
        variant: "destructive",
      });
      return;
    }

    const newSteps = steps.filter(step => step.id !== stepId);
    onStepsChange(newSteps);
    
    toast({
      title: "Step removed",
      description: "Journey step removed successfully",
    });
  }, [steps, onStepsChange, toast]);

  // Generate AI suggestions
  const generateAISuggestions = useCallback(async (model: AIModel) => {
    setIsGeneratingAI(true);
    
    try {
      // Simulate AI generation based on use case and model type
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const suggestions: JourneyStep[] = [];
      
      if (model.type === 'llm') {
        suggestions.push({
          id: `ai-${Date.now()}-1`,
          title: 'Natural Language Processing',
          description: 'Process and understand user input using advanced language models',
          type: 'action',
          connectors: ['OpenAI API', 'Anthropic Claude'],
          actions: ['Text Analysis', 'Intent Recognition', 'Response Generation'],
          requirements: ['API Keys', 'Rate Limiting'],
          estimatedDuration: 3
        });
      }
      
      if (model.type === 'vision') {
        suggestions.push({
          id: `ai-${Date.now()}-2`,
          title: 'Document Analysis',
          description: 'Analyze and extract information from uploaded documents',
          type: 'validation',
          connectors: ['Google Vision API', 'AWS Textract'],
          actions: ['OCR Processing', 'Data Extraction', 'Format Validation'],
          requirements: ['Image Processing', 'Data Privacy'],
          estimatedDuration: 5
        });
      }

      if (model.type === 'mcp') {
        suggestions.push({
          id: `ai-${Date.now()}-3`,
          title: 'Multi-Modal Context Processing',
          description: 'Process multiple data types and maintain context across interactions',
          type: 'integration',
          connectors: ['MCP Server', 'Context Database'],
          actions: ['Context Management', 'Multi-Modal Processing', 'State Tracking'],
          requirements: ['Memory Management', 'Context Persistence'],
          estimatedDuration: 4
        });
      }

      setAiSuggestions(suggestions);
      setShowAISuggestions(true);
      
      toast({
        title: "AI suggestions generated",
        description: `Generated ${suggestions.length} step suggestions using ${model.name}`,
      });
    } catch (error) {
      toast({
        title: "Failed to generate suggestions",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAI(false);
    }
  }, [useCase, toast]);

  // Add AI suggestion to journey
  const addAISuggestion = useCallback((suggestion: JourneyStep, position: number) => {
    const newSteps = [...steps];
    newSteps.splice(position, 0, { ...suggestion, id: `step-${Date.now()}` });
    onStepsChange(newSteps);
    
    toast({
      title: "AI suggestion added",
      description: "Step added to your journey successfully",
    });
  }, [steps, onStepsChange, toast]);

  const getStepTypeColor = (type: JourneyStep['type']) => {
    switch (type) {
      case 'action': return 'bg-blue-500';
      case 'decision': return 'bg-yellow-500';
      case 'integration': return 'bg-green-500';
      case 'validation': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Enhanced Journey Designer</h3>
          <p className="text-sm text-muted-foreground">
            Design, reorder, and enhance your journey steps with AI assistance
          </p>
        </div>
        
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                AI Suggestions
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle>AI-Powered Journey Suggestions</DialogTitle>
              </DialogHeader>
              
              <div className="overflow-y-auto">
                <AISuggestionsPanel
                  useCase={useCase}
                  onAddStep={(step, position) => addAISuggestion(step, position || steps.length)}
                  onAddAllSteps={(suggestedSteps) => {
                    suggestedSteps.forEach((step, index) => {
                      addAISuggestion(step, steps.length + index);
                    });
                  }}
                  currentStepsCount={steps.length}
                />
              </div>
            </DialogContent>
          </Dialog>

          <Button onClick={() => addStepAtPosition(steps.length)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Step
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id}>
            {/* Add step button between existing steps */}
            {index > 0 && (
              <div className="flex justify-center py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addStepAtPosition(index)}
                  className="text-xs opacity-50 hover:opacity-100"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Insert Step
                </Button>
              </div>
            )}

            <Card className="group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 ${getStepTypeColor(step.type)} rounded-full flex items-center justify-center text-white text-sm font-medium`}>
                      {index + 1}
                    </div>
                    
                    {editingStep === step.id ? (
                      <div className="flex-1 space-y-2">
                        <Input
                          value={drafts[step.id]?.title ?? step.title}
                          onChange={(e) => updateDraft(step.id, 'title', e.target.value)}
                          onBlur={() => saveDraft(step.id)}
                          className="font-medium"
                          placeholder="Step title"
                        />
                        <Input
                          value={drafts[step.id]?.description ?? step.description}
                          onChange={(e) => updateDraft(step.id, 'description', e.target.value)}
                          onBlur={() => saveDraft(step.id)}
                          className="text-sm"
                          placeholder="Step description"
                        />
                      </div>
                    ) : (
                      <div className="flex-1">
                        <h4 className="font-medium">{step.title}</h4>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Reorder buttons */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveStep(step.id, 'up')}
                      disabled={index === 0}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveStep(step.id, 'down')}
                      disabled={index === steps.length - 1}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </Button>

                    {/* Edit/Save button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingStep(editingStep === step.id ? null : step.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {editingStep === step.id ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                    </Button>

                    {/* Expand/Collapse details */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {expandedStep === step.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </Button>

                    {/* Remove button */}
                    {steps.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStep(step.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              {expandedStep === step.id && (
                <CardContent className="pt-0">
                  <Separator className="mb-4" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="font-medium text-xs text-muted-foreground">Type</label>
                      <select
                        value={step.type}
                        onChange={(e) => updateStep(step.id, { type: e.target.value as JourneyStep['type'] })}
                        className="w-full mt-1 px-3 py-1 border rounded"
                      >
                        <option value="action">Action</option>
                        <option value="decision">Decision</option>
                        <option value="integration">Integration</option>
                        <option value="validation">Validation</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-medium text-xs text-muted-foreground">Duration (minutes)</label>
                      <Input
                        type="number"
                        value={step.estimatedDuration || ''}
                        onChange={(e) => updateStep(step.id, { estimatedDuration: parseInt(e.target.value) || 0 })}
                        className="mt-1"
                        placeholder="5"
                      />
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="font-medium text-xs text-muted-foreground">Connectors</label>
                      <Textarea
                        value={step.connectors?.join(', ') || ''}
                        onChange={(e) => updateStep(step.id, { 
                          connectors: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
                        })}
                        className="mt-1 min-h-[60px]"
                        placeholder="API integrations, databases, etc."
                      />
                    </div>

                    <div>
                      <label className="font-medium text-xs text-muted-foreground">Actions</label>
                      <Textarea
                        value={step.actions?.join(', ') || ''}
                        onChange={(e) => updateStep(step.id, { 
                          actions: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
                        })}
                        className="mt-1 min-h-[60px]"
                        placeholder="Specific actions performed in this step"
                      />
                    </div>

                    <div>
                      <label className="font-medium text-xs text-muted-foreground">Requirements</label>
                      <Textarea
                        value={step.requirements?.join(', ') || ''}
                        onChange={(e) => updateStep(step.id, { 
                          requirements: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
                        })}
                        className="mt-1 min-h-[60px]"
                        placeholder="Prerequisites, permissions, etc."
                      />
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        ))}

        {/* Final add step button */}
        <div className="flex justify-center py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => addStepAtPosition(steps.length)}
            className="text-xs opacity-50 hover:opacity-100"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Final Step
          </Button>
        </div>
      </div>

      {onGenerateEcosystem && (
        <div className="space-y-3">
          <div className="text-center text-sm text-muted-foreground bg-green-50 dark:bg-green-950 p-3 rounded-lg border">
            <strong>What does "Generate Agent Ecosystem" do?</strong><br />
            This creates a complete agent configuration based on your journey steps, including:
            • Canvas workflow visualization • Action templates • Knowledge bases • Integration connectors
            <br />It moves you to the next phase where you'll configure these generated components.
          </div>
          <div className="flex justify-center">
            <Button onClick={onGenerateEcosystem} size="lg" className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Generate Agent Ecosystem
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedJourneyDesigner;