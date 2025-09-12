import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Brain, Zap, Eye, Search, Sparkles, AlertTriangle, CheckCircle, Cpu, Bot, ChevronDown } from 'lucide-react';
import { useUniversalAI } from '@/hooks/useUniversalAI';
import { useMasterToast } from '@/hooks/useMasterToast';
import { MODEL_REGISTRY, getModelsByCategory, getModelsByProvider } from '@/config/modelConfig';

interface EnhancedModelSelectorProps {
  onModelSelect: (provider: string, model: string, category: string) => void;
  selectedModel?: { provider: string; model: string; category: string };
  enableFallback?: boolean;
}


const categoryIcons = {
  llm: Brain,
  small: Zap,
  vision: Eye,
  mcp: Bot
};

const categoryDescriptions = {
  llm: 'Large Language Models - Most capable, best for complex reasoning and detailed responses',
  small: 'Small Language Models - Faster, efficient, includes biotech/healthcare specialized models',
  vision: 'Vision Language Models - Process images, medical imaging, and visual content with text',
  mcp: 'Model Context Protocol - Healthcare, biotech, and pharma specific tool integrations'
};

export const EnhancedModelSelector: React.FC<EnhancedModelSelectorProps> = ({
  onModelSelect,
  selectedModel,
  enableFallback = true
}) => {
  const { isProviderAvailable } = useUniversalAI();
  const { showError, showSuccess, showInfo } = useMasterToast();
  
  const [selectedProviderFilter, setSelectedProviderFilter] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<'llm' | 'small' | 'vision' | 'mcp'>('llm');
  const [searchTerm, setSearchTerm] = useState('');
  const [fallbackAttempts, setFallbackAttempts] = useState<Record<string, number>>({});

  // Get all models for current category, grouped by provider
  const groupedModels = useMemo(() => {
    const categoryModels = getModelsByCategory(selectedCategory);
    const grouped: Record<string, any[]> = {};
    
    categoryModels.forEach(model => {
      if (!grouped[model.provider]) {
        grouped[model.provider] = [];
      }
      grouped[model.provider].push(model);
    });

    return grouped;
  }, [selectedCategory]);

  // Get available providers for dropdowns based on selected LLM provider
  const availableProviders = useMemo(() => {
    const allProviders = Object.keys(groupedModels);
    return ['all', ...allProviders];
  }, [groupedModels]);

  // Filter models based on hierarchical selection
  const filteredModels = useMemo(() => {
    let filtered = { ...groupedModels };

    // If a specific provider is selected, show only related models across all categories
    if (selectedProviderFilter !== 'all') {
      // For the selected category, filter by provider
      if (filtered[selectedProviderFilter]) {
        filtered = { [selectedProviderFilter]: filtered[selectedProviderFilter] };
      } else {
        filtered = {};
      }
    }

    // Apply search filter
    if (searchTerm) {
      Object.keys(filtered).forEach(provider => {
        filtered[provider] = filtered[provider].filter(model =>
          model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          model.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          model.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          provider.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        if (filtered[provider].length === 0) {
          delete filtered[provider];
        }
      });
    }

    return filtered;
  }, [groupedModels, selectedProviderFilter, searchTerm]);

  // Get related models for other categories when a provider is selected
  const relatedModels = useMemo(() => {
    if (selectedProviderFilter === 'all') return {};
    
    const related: Record<string, any[]> = {};
    const categories = ['llm', 'small', 'vision', 'mcp'] as const;
    
    categories.forEach(category => {
      if (category !== selectedCategory) {
        const models = getModelsByProvider(selectedProviderFilter).filter(m => m.category === category);
        if (models.length > 0) {
          related[category] = models;
        }
      }
    });

    return related;
  }, [selectedProviderFilter, selectedCategory]);

  // Handle model selection with fallback logic
  const handleModelSelect = useCallback(async (modelInfo: any) => {
    const modelKey = `${modelInfo.provider}-${modelInfo.id}`;
    
    try {
      // Check if provider is available (for non-MCP models)
      if (selectedCategory !== 'mcp' && !isProviderAvailable(modelInfo.provider as any)) {
        if (enableFallback && modelInfo.fallbackModels?.length > 0) {
          showInfo(`${modelInfo.provider} unavailable, attempting fallback...`);
          
          // Try fallback models
          for (const fallbackId of modelInfo.fallbackModels) {
            const fallbackModel = MODEL_REGISTRY[fallbackId];
            if (fallbackModel && isProviderAvailable(fallbackModel.provider as any)) {
              setFallbackAttempts(prev => ({ ...prev, [modelKey]: (prev[modelKey] || 0) + 1 }));
              onModelSelect(fallbackModel.provider, fallbackModel.id, fallbackModel.category);
              showSuccess(`Fallback to ${fallbackModel.name} successful`);
              return;
            }
          }
          
          showError(`No fallback available for ${modelInfo.name}`);
        } else {
          showError(`Provider ${modelInfo.provider} is not available`);
        }
        return;
      }

      // Successful selection
      onModelSelect(modelInfo.provider, modelInfo.id, modelInfo.category);
      showSuccess(`Selected ${modelInfo.name}`);
      
      // Reset fallback attempts on successful selection
      setFallbackAttempts(prev => ({ ...prev, [modelKey]: 0 }));
      
    } catch (error) {
      showError(`Failed to select model: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [selectedCategory, isProviderAvailable, enableFallback, onModelSelect, showError, showSuccess, showInfo]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Hierarchical AI Model Selection
          {enableFallback && (
            <Badge variant="secondary" className="text-xs">
              Fallback Enabled
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary LLM Provider Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">1. Select Primary LLM Provider</label>
          <Select value={selectedProviderFilter} onValueChange={setSelectedProviderFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose LLM Provider" />
              <ChevronDown className="h-4 w-4" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {availableProviders.map((provider) => (
                <SelectItem key={provider} value={provider}>
                  {provider === 'all' ? 'All Providers' : provider.charAt(0).toUpperCase() + provider.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">2. Select Model Category</label>
          <div className="grid grid-cols-4 gap-2">
            {Object.keys(categoryIcons).map((category) => {
              const Icon = categoryIcons[category as keyof typeof categoryIcons];
              const isActive = selectedCategory === category;
              
              return (
                <Button
                  key={category}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => setSelectedCategory(category as any)}
                >
                  <Icon className="h-4 w-4" />
                  {category.toUpperCase()}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Category Description */}
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            {categoryDescriptions[selectedCategory]}
          </p>
        </div>

        {/* Search Filter */}
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={`Search ${selectedCategory} models...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Current Category Models */}
        <div className="space-y-2">
          <label className="text-sm font-medium">3. Select {selectedCategory.toUpperCase()} Model</label>
          <ScrollArea className="h-64">
            <div className="space-y-4">
              {Object.entries(filteredModels).map(([provider, models]) => (
                <div key={provider} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold capitalize">{provider}</h4>
                    {selectedCategory !== 'mcp' && !isProviderAvailable(provider as any) && (
                      <Badge variant="destructive" className="text-xs">
                        Unavailable
                      </Badge>
                    )}
                    {selectedCategory !== 'mcp' && isProviderAvailable(provider as any) && (
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Available
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid gap-2">
                    {models.map((model) => {
                      const isSelected = selectedModel?.provider === provider && 
                                       selectedModel?.model === model.id && 
                                       selectedModel?.category === selectedCategory;
                      const modelKey = `${provider}-${model.id}`;
                      const attempts = fallbackAttempts[modelKey] || 0;
                      
                      return (
                        <Button
                          key={model.id}
                          variant={isSelected ? "default" : "ghost"}
                          size="sm"
                          className="h-auto p-3 justify-start text-left"
                          onClick={() => handleModelSelect(model)}
                          disabled={selectedCategory !== 'mcp' && !isProviderAvailable(provider as any)}
                        >
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{model.name}</span>
                              {isSelected && (
                                <Badge variant="secondary" className="text-xs">
                                  Selected
                                </Badge>
                              )}
                              {attempts > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  {attempts} fallback{attempts > 1 ? 's' : ''}
                                </Badge>
                              )}
                              {model.pricing && (
                                <Badge variant="outline" className="text-xs">
                                  {model.pricing}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {model.description}
                            </p>
                            {model.specialization && (
                              <div className="flex gap-1 flex-wrap">
                                {model.specialization.slice(0, 3).map((spec) => (
                                  <Badge key={spec} variant="outline" className="text-xs px-1">
                                    {spec}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Separator className="my-2" />
                </div>
              ))}
              
              {Object.keys(filteredModels).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Cpu className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No models found matching your criteria</p>
                  <p className="text-xs">Try adjusting your search or provider filter</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Related Models from Other Categories */}
        {selectedProviderFilter !== 'all' && Object.keys(relatedModels).length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Related Models from {selectedProviderFilter}</label>
            <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
              {Object.entries(relatedModels).map(([category, models]) => (
                <div key={category} className="space-y-1">
                  <div className="flex items-center gap-2">
                    {React.createElement(categoryIcons[category as keyof typeof categoryIcons], {
                      className: "h-3 w-3 text-muted-foreground"
                    })}
                    <span className="text-xs font-medium text-muted-foreground uppercase">
                      {category}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {models.slice(0, 4).map((model) => (
                      <Button
                        key={model.id}
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs justify-start"
                        onClick={() => {
                          setSelectedCategory(category as any);
                          handleModelSelect(model);
                        }}
                      >
                        {model.name}
                      </Button>
                    ))}
                  </div>
                  {models.length > 4 && (
                    <p className="text-xs text-muted-foreground">
                      +{models.length - 4} more models
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Model Info */}
        {selectedModel && (
          <div className="p-3 bg-primary/5 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Currently Selected</span>
            </div>
            <div className="text-sm space-y-1">
              <p><strong>Provider:</strong> {selectedModel.provider}</p>
              <p><strong>Model:</strong> {selectedModel.model}</p>
              <p><strong>Category:</strong> {selectedModel.category}</p>
              {MODEL_REGISTRY[selectedModel.model]?.description && (
                <p className="text-muted-foreground">
                  {MODEL_REGISTRY[selectedModel.model].description}
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};