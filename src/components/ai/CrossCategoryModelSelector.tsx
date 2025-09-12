import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Brain, Zap, Eye, Bot, Search, Sparkles, CheckCircle, Cpu, Plus, X, Settings, Users } from 'lucide-react';
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

interface CrossCategoryModelSelectorProps {
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

const categoryDescriptions = {
  llm: 'Large Language Models - Complex reasoning, detailed analysis',
  small: 'Small Models - Fast inference, specialized tasks',
  vision: 'Vision Models - Image processing, visual analysis',
  mcp: 'MCP Tools - External integrations, specialized functions'
};

const roleDescriptions = {
  primary: 'Main reasoning and response generation',
  secondary: 'Supporting analysis and validation',
  specialized: 'Domain-specific processing'
};

export const CrossCategoryModelSelector: React.FC<CrossCategoryModelSelectorProps> = ({
  onModelsSelect,
  selectedModels,
  mode,
  maxSelections = 6,
  enableWeights = true
}) => {
  const { isProviderAvailable } = useUniversalAI();
  const { showError, showSuccess, showInfo } = useMasterToast();
  
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['llm']) // Start with LLM expanded
  );

  // Get all available providers
  const availableProviders = useMemo(() => {
    const providers = new Set<string>();
    ['llm', 'small', 'vision', 'mcp'].forEach(category => {
      const models = getModelsByCategory(category as any);
      Object.keys(models).forEach(provider => providers.add(provider));
    });
    return ['all', ...Array.from(providers).sort()];
  }, []);

  // Get models organized by category and provider
  const organizedModels = useMemo(() => {
    const organized: Record<string, Record<string, any[]>> = {
      llm: {},
      small: {},
      vision: {},
      mcp: {}
    };

    ['llm', 'small', 'vision', 'mcp'].forEach(category => {
      const categoryModels = getModelsByCategory(category as any);
      Object.entries(categoryModels).forEach(([provider, models]) => {
        if (selectedProvider === 'all' || selectedProvider === provider) {
          if (!organized[category][provider]) {
            organized[category][provider] = [];
          }
          
          // Handle models array properly
          const modelArray = Array.isArray(models) ? models : [models];
          modelArray.forEach(model => {
            const modelDetails = MODEL_REGISTRY[model] || {
              name: model,
              description: `${category} model from ${provider}`,
              provider,
              category,
              id: model
            };
            
            if (!searchTerm || 
                modelDetails.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                provider.toLowerCase().includes(searchTerm.toLowerCase())) {
              organized[category][provider].push(modelDetails);
            }
          });

          if (organized[category][provider].length === 0) {
            delete organized[category][provider];
          }
        }
      });
    });

    return organized;
  }, [selectedProvider, searchTerm]);

  const handleModelToggle = useCallback((modelDetails: any, category: string) => {
    const modelKey = `${modelDetails.provider}-${modelDetails.id}`;
    const existingIndex = selectedModels.findIndex(
      m => `${m.provider}-${m.model}` === modelKey
    );

    let newModels = [...selectedModels];
    let role: 'primary' | 'secondary' | 'specialized' = 'secondary';

    if (existingIndex >= 0) {
      // Remove model
      newModels.splice(existingIndex, 1);
    } else {
      // Add model (check limits)
      if (selectedModels.length >= maxSelections) {
        showError(`Maximum ${maxSelections} models can be selected`);
        return;
      }

      // Determine role based on existing selections
      if (selectedModels.length === 0 || category === 'llm') {
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
    
    if (existingIndex >= 0) {
      showInfo(`Removed ${modelDetails.name}`);
    } else {
      showSuccess(`Added ${modelDetails.name} as ${role}`);
    }
  }, [selectedModels, maxSelections, enableWeights, onModelsSelect, showError, showSuccess, showInfo]);

  // Handle role change
  const handleRoleChange = useCallback((modelKey: string, newRole: 'primary' | 'secondary' | 'specialized') => {
    let newModels = [...selectedModels];
    
    // Ensure only one primary
    if (newRole === 'primary') {
      newModels = newModels.map(m => 
        m.role === 'primary' ? { ...m, role: 'secondary' as const } : m
      );
    }

    const modelIndex = newModels.findIndex(m => `${m.provider}-${m.model}` === modelKey);
    if (modelIndex >= 0) {
      newModels[modelIndex] = { ...newModels[modelIndex], role: newRole };
      
      // Auto-adjust weights based on role
      if (enableWeights) {
        const roleWeights: Record<string, number> = { primary: 0.6, secondary: 0.3, specialized: 0.1 };
        newModels[modelIndex].weight = roleWeights[newRole] || 0.3;
        
        // Normalize weights
        const totalWeight = newModels.reduce((sum, m) => sum + m.weight, 0);
        newModels = newModels.map(m => ({
          ...m,
          weight: m.weight / totalWeight
        }));
      }

      onModelsSelect(newModels);
      showSuccess(`Changed ${newModels[modelIndex].name} role to ${newRole}`);
    }
  }, [selectedModels, enableWeights, onModelsSelect, showSuccess]);

  // Toggle category expansion
  const toggleCategory = useCallback((category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  }, [expandedCategories]);

  // Clear all selections
  const handleClearAll = useCallback(() => {
    onModelsSelect([]);
    showInfo('Cleared all selections');
  }, [onModelsSelect, showInfo]);

  // Get provider-based suggestions
  const getProviderSuggestions = useCallback(() => {
    if (selectedProvider === 'all' || selectedModels.length === 0) return [];
    
    const suggestions: { category: string; models: any[] }[] = [];
    const selectedCategories = new Set(selectedModels.map(m => m.category));
    
    ['llm', 'small', 'vision', 'mcp'].forEach(category => {
      if (!selectedCategories.has(category as any) && organizedModels[category][selectedProvider]) {
        const models = organizedModels[category][selectedProvider].slice(0, 2);
        if (models.length > 0) {
          suggestions.push({ category, models });
        }
      }
    });
    
    return suggestions;
  }, [selectedProvider, selectedModels, organizedModels]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Cross-Category Model Selection
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
            <SelectContent>
              {availableProviders.map((provider) => (
                <SelectItem key={provider} value={provider}>
                  {provider === 'all' ? 'All Providers' : provider.charAt(0).toUpperCase() + provider.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search models..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Selected Models */}
        {selectedModels.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Selected Models</label>
            <div className="space-y-2 p-3 bg-primary/5 rounded-lg">
              {selectedModels.map((model) => {
                const Icon = categoryIcons[model.category];
                const modelKey = `${model.provider}-${model.model}`;
                
                return (
                  <div key={modelKey} className="flex items-center justify-between p-2 bg-background rounded border">
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
                    <div className="flex items-center gap-1">
                      <Select
                        value={model.role}
                        onValueChange={(value) => handleRoleChange(modelKey, value as any)}
                      >
                        <SelectTrigger className="h-6 text-xs w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="primary">Primary</SelectItem>
                          <SelectItem value="secondary">Secondary</SelectItem>
                          <SelectItem value="specialized">Specialized</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newModels = selectedModels.filter(m => `${m.provider}-${m.model}` !== modelKey);
                          onModelsSelect(newModels);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Provider Suggestions */}
        {selectedProvider !== 'all' && getProviderSuggestions().length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Suggested from {selectedProvider}</label>
            <div className="grid grid-cols-2 gap-2">
              {getProviderSuggestions().map(({ category, models }) => (
                <div key={category} className="p-2 border rounded">
                  <div className="flex items-center gap-1 mb-1">
                    {React.createElement(categoryIcons[category as keyof typeof categoryIcons], {
                      className: "h-3 w-3"
                    })}
                    <span className="text-xs font-medium uppercase">{category}</span>
                  </div>
                  {models.map((model) => (
                    <Button
                      key={model.id}
                      variant="outline"
                      size="sm"
                      className="w-full h-6 text-xs justify-start mb-1"
                      onClick={() => handleModelToggle(model, category)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {model.name}
                    </Button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Model Categories */}
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {Object.entries(organizedModels).map(([category, providers]) => {
              const Icon = categoryIcons[category as keyof typeof categoryIcons];
              const isExpanded = expandedCategories.has(category);
              const hasModels = Object.keys(providers).length > 0;
              
              if (!hasModels) return null;

              return (
                <div key={category} className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-auto p-3"
                    onClick={() => toggleCategory(category)}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <Icon className="h-5 w-5 text-primary" />
                      <div className="text-left">
                        <div className="font-semibold">{category.toUpperCase()} Models</div>
                        <div className="text-xs text-muted-foreground">
                          {categoryDescriptions[category as keyof typeof categoryDescriptions]}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {Object.values(providers).reduce((sum, models) => sum + models.length, 0)} models
                      </Badge>
                      <Settings className={`h-4 w-4 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </Button>

                  {isExpanded && (
                    <div className="ml-4 space-y-3">
                      {Object.entries(providers).map(([provider, models]) => (
                        <div key={provider} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <span className="font-medium capitalize">{provider}</span>
                            {!isProviderAvailable(provider as any) && (
                              <Badge variant="destructive" className="text-xs">
                                Unavailable
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid gap-2">
                            {models.map((model) => {
                              const modelKey = `${provider}-${model.id}`;
                              const isSelected = selectedModels.some(m => `${m.provider}-${m.model}` === modelKey);
                              
                              return (
                                <div
                                  key={model.id}
                                  className="flex items-center gap-3 p-2 border rounded hover:bg-muted/50 cursor-pointer"
                                  onClick={() => handleModelToggle(model, category)}
                                >
                                  <Checkbox
                                    checked={isSelected}
                                    disabled={!isProviderAvailable(provider as any)}
                                  />
                                  <div className="flex-1">
                                    <div className="font-medium text-sm">{model.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {model.description}
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <Badge variant="secondary" className="text-xs">
                                      Selected
                                    </Badge>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <Separator />
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Summary */}
        {selectedModels.length > 0 && (
          <div className="p-3 bg-muted rounded-lg text-sm">
            <div className="font-medium mb-2">Selection Summary:</div>
            <div className="space-y-1">
              <div>• Total Models: {selectedModels.length}</div>
              <div>• Primary: {selectedModels.filter(m => m.role === 'primary').length}</div>
              <div>• Secondary: {selectedModels.filter(m => m.role === 'secondary').length}</div>
              <div>• Specialized: {selectedModels.filter(m => m.role === 'specialized').length}</div>
              {enableWeights && (
                <div>• Total Weight: {Math.round(selectedModels.reduce((sum, m) => sum + m.weight, 0) * 100)}%</div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};