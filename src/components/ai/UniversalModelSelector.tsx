import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CrossCategoryModelSelector, SelectedModelConfig } from '@/components/ai/CrossCategoryModelSelector';
import { SimplifiedModelSelector } from '@/components/ai/SimplifiedModelSelector';
import { EnhancedModelSelector } from '@/components/ai/EnhancedModelSelector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Sparkles, Brain } from 'lucide-react';

interface UniversalModelSelectorProps {
  onModelsSelect: (models: SelectedModelConfig[]) => void;
  selectedModels: SelectedModelConfig[];
  mode: 'single' | 'multi' | 'system';
  enabledFeatures?: string[];
  maxSelections?: number;
  allowModeSwitch?: boolean;
  defaultSelectionMode?: 'single' | 'cross-category';
}

/**
 * Universal Model Selector that can be used across all components
 * Provides both traditional single model selection and cross-category multi-model selection
 */
export const UniversalModelSelector: React.FC<UniversalModelSelectorProps> = ({
  onModelsSelect,
  selectedModels,
  mode,
  enabledFeatures = [],
  maxSelections = 6,
  allowModeSwitch = true,
  defaultSelectionMode = 'single'
}) => {
  const [selectionMode, setSelectionMode] = React.useState<'single' | 'cross-category'>(defaultSelectionMode);
  const [singleModel, setSingleModel] = React.useState<{ provider: string; model: string; category: string } | null>(null);

  // Auto-suggest models based on enabled features
  React.useEffect(() => {
    if (enabledFeatures.length > 0 && selectionMode === 'cross-category') {
      autoSuggestModelsForFeatures(enabledFeatures);
    }
  }, [enabledFeatures, selectionMode]);

  const autoSuggestModelsForFeatures = (features: string[]) => {
    let suggestedModels: SelectedModelConfig[] = [];
    
    features.forEach(feature => {
      switch (feature) {
        case 'medical':
          suggestedModels.push(
            {
              provider: 'claude',
              model: 'claude-opus-4-7',
              category: 'llm',
              name: 'Claude Opus (Medical)',
              role: 'primary',
              weight: 0.4
            },
            {
              provider: 'openai',
              model: 'gpt-5',
              category: 'vision',
              name: 'GPT-5 Vision (Medical Imaging)',
              role: 'specialized',
              weight: 0.3
            }
          );
          break;
          
        case 'publication':
          suggestedModels.push(
            {
              provider: 'claude',
              model: 'claude-sonnet-4-6',
              category: 'llm',
              name: 'Claude Sonnet (Writing)',
              role: 'primary',
              weight: 0.6
            }
          );
          break;
      }
    });

    if (suggestedModels.length > 0) {
      onModelsSelect(suggestedModels);
    }
  };

  const handleSingleModelSelect = (provider: string, model: string, category: string) => {
    setSingleModel({ provider, model, category });
    
    // Convert to SelectedModelConfig format
    const modelConfig: SelectedModelConfig = {
      provider,
      model,
      category: category as any,
      name: model,
      role: 'primary',
      weight: 1
    };
    
    onModelsSelect([modelConfig]);
  };

  const getModeDescription = () => {
    switch (mode) {
      case 'single':
        return selectionMode === 'single' 
          ? 'Select one model for focused conversation'
          : 'Select multiple models across categories for intelligent collaboration';
      case 'multi':
        return selectionMode === 'single'
          ? 'Select models for side-by-side comparison'
          : 'Select models for parallel processing and intelligent merging';
      case 'system':
        return selectionMode === 'single'
          ? 'Auto-configured system with all available models'
          : 'Custom system configuration with cross-category intelligence';
      default:
        return '';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Model Selection
            <Badge variant="secondary" className="text-xs">
              {mode.toUpperCase()}
            </Badge>
          </div>
          {allowModeSwitch && (
            <Select value={selectionMode} onValueChange={setSelectionMode as any}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Traditional</SelectItem>
                <SelectItem value="cross-category">Cross-Category</SelectItem>
              </SelectContent>
            </Select>
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {getModeDescription()}
        </p>
      </CardHeader>
      <CardContent>
        {selectionMode === 'single' ? (
          <EnhancedModelSelector
            onModelSelect={handleSingleModelSelect}
            selectedModel={singleModel}
          />
        ) : (
          <SimplifiedModelSelector
            onModelsSelect={onModelsSelect}
            selectedModels={selectedModels}
            mode={mode}
            maxSelections={maxSelections}
          />
        )}
        
        {/* Feature-based suggestions */}
        {enabledFeatures.length > 0 && selectionMode === 'cross-category' && (
          <div className="mt-4 p-3 bg-primary/5 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Feature Optimizations</span>
            </div>
            <div className="flex gap-1 flex-wrap">
              {enabledFeatures.map(feature => (
                <Badge key={feature} variant="outline" className="text-xs">
                  {feature} optimized
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};