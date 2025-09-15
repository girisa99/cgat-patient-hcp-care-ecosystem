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
  mode: 'single' | 'multi' | 'system';
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
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', category: 'llm', description: 'Latest GPT-4 Omni model' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', category: 'llm', description: 'Efficient GPT-4 variant' },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'claude', category: 'llm', description: 'Advanced reasoning model' },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'claude', category: 'llm', description: 'Fast response model' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'gemini', category: 'llm', description: 'Google\'s flagship model' },
  
  // Vision Models
  { id: 'gpt-4o-vision', name: 'GPT-4o Vision', provider: 'openai', category: 'vision', description: 'Multimodal capabilities' },
  { id: 'claude-3-sonnet-vision', name: 'Claude 3 Sonnet Vision', provider: 'claude', category: 'vision', description: 'Image analysis' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'gemini', category: 'vision', description: 'Fast vision processing' },
  
  // Small Models
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai', category: 'small', description: 'Efficient chat model' },
  { id: 'claude-3-haiku-fast', name: 'Claude 3 Haiku Fast', provider: 'claude', category: 'small', description: 'Ultra-fast responses' },
];

const featureOptions = [
  { id: 'medical', label: 'Medical Context', icon: <Brain className="h-4 w-4" />, description: 'Healthcare expertise' },
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
  mode
}) => {
  const [providerFilter, setProviderFilter] = useState<string>('all');

  // Auto-enable features based on selected models
  useEffect(() => {
    const newFeatures = [...selectedFeatures];
    
    // Auto-enable vision if vision models are selected
    if (selectedModels.some(m => m.category === 'vision') && !newFeatures.includes('vision')) {
      newFeatures.push('vision');
    }
    
    // Auto-enable medical context for system mode
    if (mode === 'system' && !newFeatures.includes('medical')) {
      newFeatures.push('medical');
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
      }
    }
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
                          <div>
                            <div className="font-medium text-sm">{model.name}</div>
                            <div className="text-xs text-muted-foreground">{model.description}</div>
                          </div>
                          <Badge variant={model.provider === 'openai' ? 'default' : model.provider === 'claude' ? 'secondary' : 'outline'} className="text-xs">
                            {model.provider}
                          </Badge>
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

      {/* Selection Summary */}
      <div className="p-4 bg-muted/50 rounded-lg">
        <div className="text-sm font-medium mb-2">Configuration Summary</div>
        <div className="space-y-1 text-xs text-muted-foreground">
          <div>Models: {selectedModels.length} selected</div>
          <div>Features: {selectedFeatures.length} enabled</div>
          <div>Tools: {selectedMCPTools.length} active</div>
        </div>
      </div>
    </div>
  );
};