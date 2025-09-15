import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Brain, Zap, Eye, Bot, ChevronDown, X, Users } from 'lucide-react';
import { useUniversalAI } from '@/hooks/useUniversalAI';
import { useMasterToast } from '@/hooks/useMasterToast';
import { MODEL_REGISTRY, getModelsByCategory, getModelsByProvider } from '@/config/modelConfig';

export interface SelectedModelConfig {
  provider: string;
  model: string;
  category: 'llm' | 'small' | 'vision' | 'mcp';
  name: string;
  role: 'primary' | 'secondary' | 'specialized';
  weight: number;
}

interface SimplifiedModelSelectorProps {
  onModelsSelect: (models: SelectedModelConfig[]) => void;
  selectedModels: SelectedModelConfig[];
  mode: 'single' | 'multi' | 'system';
  maxSelections?: number;
  enableWeights?: boolean;
}

const categoryIcons = {
  llm: Brain,
  small: Zap,
  vision: Eye,
  mcp: Bot
};

const categoryLabels = {
  llm: 'Language Models',
  small: 'Small Models',
  vision: 'Vision Models',
  mcp: 'MCP Tools'
};

const features = [
  { id: 'medical', name: 'Medical Analysis', category: ['llm', 'vision'] },
  { id: 'coding', name: 'Code Generation', category: ['llm', 'small'] },
  { id: 'research', name: 'Research & Analysis', category: ['llm', 'mcp'] },
  { id: 'creative', name: 'Creative Writing', category: ['llm', 'small'] },
  { id: 'data', name: 'Data Analysis', category: ['llm', 'mcp', 'vision'] },
  { id: 'integration', name: 'External Integration', category: ['mcp'] }
];

export const SimplifiedModelSelector: React.FC<SimplifiedModelSelectorProps> = ({
  onModelsSelect,
  selectedModels,
  mode,
  maxSelections = 6,
  enableWeights = true
}) => {
  const { isProviderAvailable } = useUniversalAI();
  const { showError, showSuccess, showInfo } = useMasterToast();
  
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  // Get all available providers
  const availableProviders = useMemo(() => {
    const providers = new Set<string>();
    ['llm', 'small', 'vision', 'mcp'].forEach(category => {
      const models = getModelsByCategory(category as any);
      models.forEach(model => providers.add(model.provider));
    });
    return ['all', ...Array.from(providers).sort()];
  }, []);

  // Get models by category filtered by provider
  const getFilteredModels = useCallback((category: string) => {
    const categoryModels = getModelsByCategory(category as any);
    return categoryModels.filter(model => 
      selectedProvider === 'all' || model.provider === selectedProvider
    );
  }, [selectedProvider]);

  // Get selected models for a category
  const getSelectedModelsForCategory = useCallback((category: string) => {
    return selectedModels.filter(m => m.category === category);
  }, [selectedModels]);

  // Handle model toggle
  const handleModelToggle = useCallback((modelDetails: any, category: string, checked: boolean) => {
    const modelKey = `${modelDetails.provider}-${modelDetails.id}`;
    let newModels = [...selectedModels];

    if (checked) {
      // Add model (check limits)
      if (selectedModels.length >= maxSelections) {
        showError(`Maximum ${maxSelections} models can be selected`);
        return;
      }

      // Determine role based on category and existing selections
      let role: 'primary' | 'secondary' | 'specialized' = 'secondary';
      if (category === 'llm' && !selectedModels.some(m => m.category === 'llm')) {
        role = 'primary';
      } else if (category === 'mcp') {
        role = 'specialized';
      }

      // Ensure only one primary
      if (role === 'primary') {
        newModels = newModels.map(m => 
          m.role === 'primary' ? { ...m, role: 'secondary' as const } : m
        );
      }

      const newModel: SelectedModelConfig = {
        provider: modelDetails.provider,
        model: modelDetails.id,
        category: category as any,
        name: modelDetails.name,
        role,
        weight: role === 'primary' ? 0.6 : role === 'secondary' ? 0.3 : 0.1
      };

      newModels.push(newModel);
      showSuccess(`Added ${modelDetails.name}`);
    } else {
      // Remove model
      const existingIndex = newModels.findIndex(m => `${m.provider}-${m.model}` === modelKey);
      if (existingIndex >= 0) {
        newModels.splice(existingIndex, 1);
        showInfo(`Removed ${modelDetails.name}`);
      }
    }

    // Normalize weights
    if (enableWeights && newModels.length > 0) {
      const totalWeight = newModels.reduce((sum, m) => sum + m.weight, 0);
      newModels = newModels.map(m => ({
        ...m,
        weight: m.weight / totalWeight
      }));
    }

    onModelsSelect(newModels);
  }, [selectedModels, maxSelections, enableWeights, onModelsSelect, showError, showSuccess, showInfo]);

  // Handle feature toggle
  const handleFeatureToggle = useCallback((featureId: string, checked: boolean) => {
    let newFeatures = [...selectedFeatures];
    if (checked) {
      if (!newFeatures.includes(featureId)) {
        newFeatures.push(featureId);
      }
    } else {
      newFeatures = newFeatures.filter(f => f !== featureId);
    }
    setSelectedFeatures(newFeatures);

    // Auto-suggest models based on selected features
    const feature = features.find(f => f.id === featureId);
    if (feature && checked) {
      feature.category.forEach(category => {
        const categoryModels = getFilteredModels(category);
        if (categoryModels.length > 0 && !selectedModels.some(m => m.category === category)) {
          const recommendedModel = categoryModels[0]; // Take first available model
          handleModelToggle(recommendedModel, category, true);
        }
      });
    }
  }, [selectedFeatures, getFilteredModels, selectedModels, handleModelToggle]);

  // Clear all selections
  const handleClearAll = useCallback(() => {
    onModelsSelect([]);
    setSelectedFeatures([]);
    showInfo('Cleared all selections');
  }, [onModelsSelect, showInfo]);

  // Render category dropdown
  const renderCategoryDropdown = useCallback((category: string) => {
    const models = getFilteredModels(category);
    const selectedCategoryModels = getSelectedModelsForCategory(category);
    const Icon = categoryIcons[category as keyof typeof categoryIcons];
    
    if (models.length === 0) return null;

    return (
      <div key={category} className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          {categoryLabels[category as keyof typeof categoryLabels]}
          {selectedCategoryModels.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {selectedCategoryModels.length}
            </Badge>
          )}
        </label>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between h-auto min-h-[40px] p-3"
            >
              <div className="flex items-center gap-2 flex-wrap">
                {selectedCategoryModels.length === 0 ? (
                  <span className="text-muted-foreground">Select {categoryLabels[category as keyof typeof categoryLabels]}...</span>
                ) : (
                  selectedCategoryModels.map((model) => (
                    <Badge key={`${model.provider}-${model.model}`} variant="secondary" className="text-xs">
                      {model.name}
                    </Badge>
                  ))
                )}
              </div>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 bg-background border shadow-md z-[60]" align="start">
            <div className="p-4 max-h-60 overflow-auto">
              <div className="space-y-3">
                {models.map((model) => {
                  const modelKey = `${model.provider}-${model.id}`;
                  const isSelected = selectedModels.some(m => `${m.provider}-${m.model}` === modelKey);
                  const isAvailable = isProviderAvailable(model.provider as any);
                  
                  return (
                    <div key={modelKey} className="flex items-start space-x-3">
                      <Checkbox
                        id={modelKey}
                        checked={isSelected}
                        onCheckedChange={(checked) => handleModelToggle(model, category, checked as boolean)}
                        disabled={!isAvailable}
                      />
                      <div className="flex-1 min-w-0">
                        <label
                          htmlFor={modelKey}
                          className={`text-sm font-medium cursor-pointer ${!isAvailable ? 'text-muted-foreground' : ''}`}
                        >
                          {model.name}
                        </label>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {model.provider}
                          </Badge>
                          {!isAvailable && (
                            <Badge variant="destructive" className="text-xs">
                              Unavailable
                            </Badge>
                          )}
                        </div>
                        {model.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {model.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }, [getFilteredModels, getSelectedModelsForCategory, selectedModels, handleModelToggle, isProviderAvailable]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Model Selection
            <Badge variant="secondary" className="text-xs">
              {mode.toUpperCase()}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span>{selectedModels.length}/{maxSelections}</span>
            {selectedModels.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="h-6 px-2"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Provider Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Provider Filter</label>
          <Select value={selectedProvider} onValueChange={setSelectedProvider}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent className="bg-background border z-50">
              {availableProviders.map((provider) => (
                <SelectItem key={provider} value={provider}>
                  {provider === 'all' ? 'All Providers' : provider.charAt(0).toUpperCase() + provider.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Feature Context */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Feature Context</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between h-auto min-h-[40px] p-3"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedFeatures.length === 0 ? (
                    <span className="text-muted-foreground">Select features...</span>
                  ) : (
                    selectedFeatures.map((featureId) => {
                      const feature = features.find(f => f.id === featureId);
                      return (
                        <Badge key={featureId} variant="secondary" className="text-xs">
                          {feature?.name}
                        </Badge>
                      );
                    })
                  )}
                </div>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <div className="p-4 max-h-60 overflow-auto">
                <div className="space-y-3">
                  {features.map((feature) => (
                    <div key={feature.id} className="flex items-start space-x-3">
                      <Checkbox
                        id={feature.id}
                        checked={selectedFeatures.includes(feature.id)}
                        onCheckedChange={(checked) => handleFeatureToggle(feature.id, checked as boolean)}
                      />
                      <div className="flex-1">
                        <label
                          htmlFor={feature.id}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {feature.name}
                        </label>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {feature.category.map(cat => (
                            <Badge key={cat} variant="outline" className="text-xs">
                              {categoryLabels[cat as keyof typeof categoryLabels]}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Model Categories as Dropdowns */}
        <div className="space-y-4">
          {['llm', 'small', 'vision', 'mcp'].map(renderCategoryDropdown)}
        </div>

        {/* Selected Models Summary */}
        {selectedModels.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Selected Models Summary</label>
            <div className="grid grid-cols-1 gap-2 p-3 bg-primary/5 rounded-lg">
              {selectedModels.map((model) => {
                const Icon = categoryIcons[model.category];
                return (
                  <div key={`${model.provider}-${model.model}`} className="flex items-center justify-between p-2 bg-background rounded border">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">{model.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {model.category.toUpperCase()}
                      </Badge>
                      <Badge variant={model.role === 'primary' ? 'default' : 'secondary'} className="text-xs">
                        {model.role}
                      </Badge>
                      {enableWeights && (
                        <Badge variant="outline" className="text-xs">
                          {Math.round(model.weight * 100)}%
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};