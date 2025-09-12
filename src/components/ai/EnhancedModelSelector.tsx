import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Brain, Zap, Eye, Search, Sparkles, AlertTriangle, CheckCircle, Cpu, Bot } from 'lucide-react';
import { useUniversalAI } from '@/hooks/useUniversalAI';
import { useMasterToast } from '@/hooks/useMasterToast';

interface EnhancedModelSelectorProps {
  onModelSelect: (provider: string, model: string, category: string) => void;
  selectedModel?: { provider: string; model: string; category: string };
  enableFallback?: boolean;
}

// Enhanced model categories with healthcare/biotech specific models
const ENHANCED_MODEL_CATEGORIES = {
  llm: {
    openai: [
      'gpt-5-2025-08-07',
      'gpt-4.1-2025-04-14', 
      'o3-2025-04-16',
      'o4-mini-2025-04-16'
    ],
    claude: [
      'claude-opus-4-1-20250805',
      'claude-sonnet-4-20250514',
      'claude-3-5-sonnet-20241022'
    ],
    gemini: [
      'gemini-2.0-flash-exp',
      'gemini-pro',
      'gemini-1.5-pro'
    ]
  },
  small: {
    openai: [
      'gpt-5-mini-2025-08-07',
      'gpt-5-nano-2025-08-07',
      'gpt-4o-mini'
    ],
    claude: [
      'claude-3-5-haiku-20241022'
    ],
    gemini: [
      'gemini-2.0-flash'
    ],
    specialized: [
      'biomed-llama-7b',
      'clinical-bert',
      'pubmed-gpt',
      'pharma-t5',
      'biotech-mistral-7b'
    ]
  },
  vision: {
    openai: [
      'gpt-4o',
      'o4-mini-2025-04-16',
      'gpt-4-vision-preview'
    ],
    claude: [
      'claude-3-5-sonnet-20241022'
    ],
    gemini: [
      'gemini-pro-vision',
      'gemini-1.5-pro'
    ],
    healthcare: [
      'medical-imaging-vision',
      'radiology-ai-vision',
      'pathology-vision-pro'
    ]
  },
  mcp: {
    healthcare: [
      'healthcare-ai-mcp-server',
      'biomcp-biotech-pharma-server',
      'adk-healthcare-agent-server',
      'healthcare-database-mcp-server'
    ],
    biotech: [
      'genomics-mcp-server',
      'clinical-trials-mcp',
      'regulatory-compliance-mcp',
      'adverse-events-mcp'
    ],
    pharma: [
      'drug-discovery-mcp',
      'pharmacovigilance-mcp',
      'regulatory-affairs-mcp',
      'manufacturing-mcp'
    ],
    general: [
      'filesystem-mcp-server',
      'web-search-mcp',
      'database-mcp-toolbox',
      'email-automation-mcp'
    ]
  }
};

// Healthcare/Biotech specific model descriptions
const MODEL_DESCRIPTIONS = {
  'biomed-llama-7b': 'Specialized for biomedical text and research papers',
  'clinical-bert': 'Clinical notes and medical text understanding',
  'pubmed-gpt': 'PubMed research and literature analysis',
  'pharma-t5': 'Pharmaceutical research and drug development',
  'biotech-mistral-7b': 'Biotech workflows and regulatory compliance',
  'medical-imaging-vision': 'Medical imaging analysis and diagnostics',
  'radiology-ai-vision': 'Radiology image interpretation',
  'pathology-vision-pro': 'Pathology slide analysis',
  'healthcare-ai-mcp-server': 'General healthcare AI and clinical support',
  'biomcp-biotech-pharma-server': 'Biotech/pharma workflows with regulatory compliance',
  'adk-healthcare-agent-server': 'Healthcare agent development kit',
  'healthcare-database-mcp-server': 'Healthcare database access with HIPAA compliance',
  'genomics-mcp-server': 'Genomics data analysis and personalized medicine',
  'clinical-trials-mcp': 'Clinical trial management and patient matching',
  'regulatory-compliance-mcp': 'FDA/EMA/PMDA regulatory compliance checking',
  'adverse-events-mcp': 'Adverse event monitoring and reporting'
};

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
  
  const [activeCategory, setActiveCategory] = useState<keyof typeof ENHANCED_MODEL_CATEGORIES>('llm');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [fallbackAttempts, setFallbackAttempts] = useState<Record<string, number>>({});

  // Get available providers for the selected category
  const availableProviders = useMemo(() => {
    const providers = Object.keys(ENHANCED_MODEL_CATEGORIES[activeCategory]);
    return ['all', ...providers];
  }, [activeCategory]);

  // Filter models based on search and provider selection
  const filteredModels = useMemo(() => {
    const categoryModels = ENHANCED_MODEL_CATEGORIES[activeCategory];
    let filtered: Array<{ provider: string; models: string[] }> = [];

    Object.entries(categoryModels).forEach(([provider, models]) => {
      if (selectedProvider === 'all' || selectedProvider === provider) {
        const searchFiltered = models.filter(model =>
          model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          provider.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        if (searchFiltered.length > 0) {
          filtered.push({ provider, models: searchFiltered });
        }
      }
    });

    return filtered;
  }, [activeCategory, selectedProvider, searchTerm]);

  // Handle model selection with fallback logic
  const handleModelSelect = useCallback(async (provider: string, model: string) => {
    const modelKey = `${provider}-${model}`;
    
    try {
      // Check if provider is available (for non-MCP models)
      if (activeCategory !== 'mcp' && !isProviderAvailable(provider as any)) {
        if (enableFallback) {
          showInfo(`${provider} unavailable, attempting fallback...`);
          
          // Find fallback model in same category
          const fallbackOptions = ENHANCED_MODEL_CATEGORIES[activeCategory][provider] || [];
          const currentIndex = fallbackOptions.indexOf(model);
          const fallbackModel = fallbackOptions[currentIndex + 1] || fallbackOptions[0];
          
          if (fallbackModel && fallbackModel !== model) {
            setFallbackAttempts(prev => ({ ...prev, [modelKey]: (prev[modelKey] || 0) + 1 }));
            onModelSelect(provider, fallbackModel, activeCategory);
            showSuccess(`Fallback to ${fallbackModel} successful`);
            return;
          }
          
          // Try different provider in same category
          const otherProviders = Object.keys(ENHANCED_MODEL_CATEGORIES[activeCategory])
            .filter(p => p !== provider && isProviderAvailable(p as any));
          
          if (otherProviders.length > 0) {
            const fallbackProvider = otherProviders[0];
            const fallbackModels = ENHANCED_MODEL_CATEGORIES[activeCategory][fallbackProvider];
            if (fallbackModels.length > 0) {
              onModelSelect(fallbackProvider, fallbackModels[0], activeCategory);
              showSuccess(`Fallback to ${fallbackProvider}/${fallbackModels[0]} successful`);
              return;
            }
          }
          
          showError(`No fallback available for ${provider}/${model}`);
        } else {
          showError(`Provider ${provider} is not available`);
        }
        return;
      }

      // Successful selection
      onModelSelect(provider, model, activeCategory);
      showSuccess(`Selected ${provider}/${model}`);
      
      // Reset fallback attempts on successful selection
      setFallbackAttempts(prev => ({ ...prev, [modelKey]: 0 }));
      
    } catch (error) {
      showError(`Failed to select model: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [activeCategory, isProviderAvailable, enableFallback, onModelSelect, showError, showSuccess, showInfo]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Enhanced AI Model Selection
          {enableFallback && (
            <Badge variant="secondary" className="text-xs">
              Fallback Enabled
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category Selection */}
        <div className="grid grid-cols-4 gap-2">
          {Object.keys(ENHANCED_MODEL_CATEGORIES).map((category) => {
            const Icon = categoryIcons[category as keyof typeof categoryIcons];
            const isActive = activeCategory === category;
            
            return (
              <Button
                key={category}
                variant={isActive ? "default" : "outline"}
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setActiveCategory(category as any)}
              >
                <Icon className="h-4 w-4" />
                {category.toUpperCase()}
              </Button>
            );
          })}
        </div>

        {/* Category Description */}
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            {categoryDescriptions[activeCategory]}
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={`Search ${activeCategory} models...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedProvider} onValueChange={setSelectedProvider}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Provider" />
            </SelectTrigger>
            <SelectContent>
              {availableProviders.map((provider) => (
                <SelectItem key={provider} value={provider}>
                  {provider === 'all' ? 'All' : provider.charAt(0).toUpperCase() + provider.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Model Grid */}
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {filteredModels.map(({ provider, models }) => (
              <div key={provider} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h4 className="font-semibold capitalize">{provider}</h4>
                  {activeCategory !== 'mcp' && !isProviderAvailable(provider as any) && (
                    <Badge variant="destructive" className="text-xs">
                      Unavailable
                    </Badge>
                  )}
                  {activeCategory !== 'mcp' && isProviderAvailable(provider as any) && (
                    <Badge variant="secondary" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Available
                    </Badge>
                  )}
                </div>
                
                <div className="grid gap-2">
                  {models.map((model) => {
                    const isSelected = selectedModel?.provider === provider && 
                                     selectedModel?.model === model && 
                                     selectedModel?.category === activeCategory;
                    const modelKey = `${provider}-${model}`;
                    const attempts = fallbackAttempts[modelKey] || 0;
                    const description = MODEL_DESCRIPTIONS[model as keyof typeof MODEL_DESCRIPTIONS];
                    
                    return (
                      <Button
                        key={model}
                        variant={isSelected ? "default" : "ghost"}
                        size="sm"
                        className="h-auto p-3 justify-start text-left"
                        onClick={() => handleModelSelect(provider, model)}
                        disabled={activeCategory !== 'mcp' && !isProviderAvailable(provider as any)}
                      >
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{model}</span>
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
                          </div>
                          {description && (
                            <p className="text-xs text-muted-foreground">
                              {description}
                            </p>
                          )}
                          <div className="text-xs text-muted-foreground">
                            {activeCategory === 'llm' && 'Most capable and intelligent'}
                            {activeCategory === 'small' && 'Fast and efficient processing'}
                            {activeCategory === 'vision' && 'Supports images and visual analysis'}
                            {activeCategory === 'mcp' && 'Protocol integration and tools'}
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
                
                {provider !== filteredModels[filteredModels.length - 1].provider && (
                  <Separator className="my-2" />
                )}
              </div>
            ))}
            
            {filteredModels.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Cpu className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No models found matching your criteria</p>
                <p className="text-xs">Try adjusting your search or provider filter</p>
              </div>
            )}
          </div>
        </ScrollArea>

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
              {MODEL_DESCRIPTIONS[selectedModel.model as keyof typeof MODEL_DESCRIPTIONS] && (
                <p className="text-muted-foreground">
                  {MODEL_DESCRIPTIONS[selectedModel.model as keyof typeof MODEL_DESCRIPTIONS]}
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};