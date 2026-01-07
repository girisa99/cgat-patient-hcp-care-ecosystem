import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Brain, Eye, Zap, Database, Wrench, Globe } from 'lucide-react';
import { SelectedModelConfig } from '@/components/ai';

interface StreamlinedModelSelectorProps {
  selectedModels: SelectedModelConfig[];
  onModelsChange: (models: SelectedModelConfig[]) => void;
  selectedFeatures: string[];
  onFeaturesChange: (features: string[]) => void;
  selectedMCPTools: string[];
  onMCPToolsChange: (tools: string[]) => void;
  mode: 'single' | 'multi' | 'system' | 'publish';
  onModelPriorityChange?: (priorities: { [key: string]: number }) => void;
}

interface ModelOption {
  id: string;
  name: string;
  provider: 'openai' | 'claude' | 'gemini';
  category: 'llm' | 'small' | 'vision';
  description: string;
}

const modelOptions: ModelOption[] = [
  // LLM Models
  { id: 'gpt-5', name: 'GPT-5', provider: 'openai', category: 'llm', description: 'Latest GPT-5 model' },
  { id: 'gpt-5-mini', name: 'GPT-5 Mini', provider: 'openai', category: 'llm', description: 'Efficient GPT-5 variant' },
  { id: 'claude-sonnet-4', name: 'Claude Sonnet 4', provider: 'claude', category: 'llm', description: 'Advanced reasoning model' },
  { id: 'claude-haiku-4', name: 'Claude Haiku 4', provider: 'claude', category: 'llm', description: 'Fast response model' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'gemini', category: 'llm', description: 'Google\'s flagship model' },
  
  // Vision Models
  { id: 'gpt-5-vision', name: 'GPT-5 Vision', provider: 'openai', category: 'vision', description: 'Multimodal capabilities' },
  { id: 'claude-4-vision', name: 'Claude 4 Vision', provider: 'claude', category: 'vision', description: 'Image analysis' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'gemini', category: 'vision', description: 'Fast vision processing' },
  
  // Small Models
  { id: 'gpt-5-nano', name: 'GPT-5 Nano', provider: 'openai', category: 'small', description: 'Efficient chat model' },
  { id: 'claude-haiku-fast', name: 'Claude Haiku Fast', provider: 'claude', category: 'small', description: 'Ultra-fast responses' },
];

const featureOptions = [
  { id: 'medical', label: 'Medical Context', icon: <Brain className="h-4 w-4" />, description: 'Healthcare expertise + provider consultation reminder' },
  { id: 'knowledge', label: 'Knowledge Base', icon: <Database className="h-4 w-4" />, description: 'RAG integration' },
  { id: 'web', label: 'Web Search', icon: <Globe className="h-4 w-4" />, description: 'Real-time information' },
  { id: 'vision', label: 'Vision Analysis', icon: <Eye className="h-4 w-4" />, description: 'Image processing' },
  { id: 'tools', label: 'MCP Tools', icon: <Wrench className="h-4 w-4" />, description: 'External tool access' }
];

const mcpTools = [
  'filesystem', 'memory', 'web-search', 'database', 'api-client', 
  'document-processor', 'image-analyzer', 'code-executor'
];

export const StreamlinedModelSelector: React.FC<StreamlinedModelSelectorProps> = ({
  selectedModels,
  onModelsChange,
  selectedFeatures,
  onFeaturesChange,
  selectedMCPTools,
  onMCPToolsChange,
  mode,
  onModelPriorityChange
}) => {
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [modelPriorities, setModelPriorities] = useState<{ [key: string]: number }>({});
  const [mediaAccuracy, setMediaAccuracy] = useState<'high' | 'medium' | 'fast'>('high');

  // Auto-enable features based on selected models
  useEffect(() => {
    const newFeatures = [...selectedFeatures];
    
    // Auto-enable vision if vision models are selected
    if (selectedModels.some(m => m.category === 'vision') && !newFeatures.includes('vision')) {
      newFeatures.push('vision');
    }
    
    // Auto-enable medical context for system and publish modes
    if ((mode === 'system' || mode === 'publish') && !newFeatures.includes('medical')) {
      newFeatures.push('medical');
    }
    
    // Auto-enable knowledge and web features for publish mode
    if (mode === 'publish') {
      if (!newFeatures.includes('knowledge')) newFeatures.push('knowledge');
      if (!newFeatures.includes('web')) newFeatures.push('web');
    }
    
    if (newFeatures.length !== selectedFeatures.length) {
      onFeaturesChange(newFeatures);
    }
  }, [selectedModels, mode, selectedFeatures, onFeaturesChange]);

  const filteredModels = modelOptions.filter(model => 
    providerFilter === 'all' || model.provider === providerFilter
  );

  const handleModelToggle = (model: ModelOption) => {
    const isSelected = selectedModels.some(m => m.model === model.id);
    
    if (isSelected) {
      // Remove model
      onModelsChange(selectedModels.filter(m => m.model !== model.id));
      // Remove from priorities
      const newPriorities = { ...modelPriorities };
      delete newPriorities[model.id];
      setModelPriorities(newPriorities);
      onModelPriorityChange?.(newPriorities);
    } else {
      // Add model
      const newModel: SelectedModelConfig = {
        model: model.id,
        provider: model.provider,
        name: model.name,
        category: model.category,
        role: selectedModels.length === 0 ? 'primary' : 'secondary',
        weight: 1
      };
      
      if (mode === 'single') {
        onModelsChange([newModel]);
      } else {
        onModelsChange([...selectedModels, newModel]);
        // Set default priority
        const newPriorities = { ...modelPriorities, [model.id]: selectedModels.length + 1 };
        setModelPriorities(newPriorities);
        onModelPriorityChange?.(newPriorities);
      }
    }
  };

  const handlePriorityChange = (modelId: string, priority: number) => {
    const newPriorities = { ...modelPriorities, [modelId]: priority };
    setModelPriorities(newPriorities);
    onModelPriorityChange?.(newPriorities);
  };

  const handleFeatureToggle = (featureId: string) => {
    if (selectedFeatures.includes(featureId)) {
      onFeaturesChange(selectedFeatures.filter(f => f !== featureId));
    } else {
      onFeaturesChange([...selectedFeatures, featureId]);
    }
  };

  const handleMCPToolToggle = (tool: string) => {
    if (selectedMCPTools.includes(tool)) {
      onMCPToolsChange(selectedMCPTools.filter(t => t !== tool));
    } else {
      onMCPToolsChange([...selectedMCPTools, tool]);
    }
  };

  return (
    <div className="space-y-6 max-h-[600px] overflow-y-auto">
      {/* Models Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">AI Models</h3>
          <Select value={providerFilter} onValueChange={setProviderFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Providers</SelectItem>
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="claude">Claude</SelectItem>
              <SelectItem value="gemini">Gemini</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Model Categories */}
        <div className="space-y-4">
          {['llm', 'vision', 'small'].map(category => {
            const categoryModels = filteredModels.filter(m => m.category === category);
            if (categoryModels.length === 0) return null;

            return (
              <div key={category} className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground capitalize">
                  {category === 'llm' ? 'Language Models' : category === 'vision' ? 'Vision Models' : 'Small Models'}
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {categoryModels.map(model => {
                    const isSelected = selectedModels.some(m => m.model === model.id);
                    return (
                      <button
                        key={model.id}
                        onClick={() => handleModelToggle(model)}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          isSelected 
                            ? 'bg-primary/10 border-primary text-primary' 
                            : 'bg-card border-border hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{model.name}</div>
                            <div className="text-xs text-muted-foreground">{model.description}</div>
                            {isSelected && mode === 'multi' && (
                              <div className="mt-2">
                                <Select
                                  value={modelPriorities[model.id]?.toString() || '1'}
                                  onValueChange={(value) => handlePriorityChange(model.id, parseInt(value))}
                                >
                                  <SelectTrigger className="w-24 h-6 text-xs">
                                    <SelectValue placeholder="Priority" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="1">1st</SelectItem>
                                    <SelectItem value="2">2nd</SelectItem>
                                    <SelectItem value="3">3rd</SelectItem>
                                    <SelectItem value="4">Default</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge variant={model.provider === 'openai' ? 'default' : model.provider === 'claude' ? 'secondary' : 'outline'} className="text-xs">
                              {model.provider}
                            </Badge>
                            {isSelected && modelPriorities[model.id] && (
                              <Badge variant="outline" className="text-xs">
                                Priority {modelPriorities[model.id]}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Features Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Features</h3>
        <div className="grid grid-cols-1 gap-2">
          {featureOptions.map(feature => (
            <div key={feature.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
              <div className="flex items-center gap-3">
                <div className="text-primary">{feature.icon}</div>
                <div>
                  <div className="font-medium text-sm">{feature.label}</div>
                  <div className="text-xs text-muted-foreground">{feature.description}</div>
                </div>
              </div>
              <Switch
                checked={selectedFeatures.includes(feature.id)}
                onCheckedChange={() => handleFeatureToggle(feature.id)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* MCP Tools Section */}
      {selectedFeatures.includes('tools') && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">MCP Tools</h3>
          <div className="grid grid-cols-2 gap-2">
            {mcpTools.map(tool => (
              <button
                key={tool}
                onClick={() => handleMCPToolToggle(tool)}
                className={`p-2 rounded border text-xs transition-colors ${
                  selectedMCPTools.includes(tool)
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-card border-border hover:bg-muted/50'
                }`}
              >
                {tool.replace(/-/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Media Quality Settings */}
      {(selectedFeatures.includes('vision') || selectedModels.some(m => m.category === 'vision')) && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Media Generation Quality</h3>
          <div className="p-3 rounded-lg border bg-card">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-medium text-sm">Content Accuracy</div>
                <div className="text-xs text-muted-foreground">Higher accuracy = slower generation</div>
              </div>
              <Select value={mediaAccuracy} onValueChange={(value: 'high' | 'medium' | 'fast') => setMediaAccuracy(value)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="fast">Fast</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Selection Summary */}
      <div className="p-4 bg-muted/50 rounded-lg">
        <div className="text-sm font-medium mb-2">Configuration Summary</div>
        <div className="space-y-1 text-xs text-muted-foreground">
          <div>Models: {selectedModels.length} selected</div>
          <div>Features: {selectedFeatures.length} enabled</div>
          <div>Tools: {selectedMCPTools.length} active</div>
          <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-yellow-800 dark:text-yellow-200">
            <strong>Medical Disclaimer:</strong> This AI provides educational information only. Always consult qualified healthcare providers for medical advice, diagnosis, or treatment decisions.
          </div>
        </div>
      </div>
    </div>
  );
};