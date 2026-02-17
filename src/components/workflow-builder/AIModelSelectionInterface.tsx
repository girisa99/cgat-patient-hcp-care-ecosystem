/**
 * AI Model Selection Interface
 * Provides UI for selecting and configuring AI models for nodes
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Zap, 
  Settings, 
  Eye, 
  MessageSquare,
  BarChart3,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AIModel {
  id: string;
  name: string;
  provider: string;
  model_type: string;
  capabilities: string[];
  configuration: any;
  performance_tier: string;
  cost_per_request: number;
  max_context_length: number;
  supports_function_calling: boolean;
  supports_vision: boolean;
  is_active: boolean;
}

interface AIModelConfig {
  model_id: string;
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  custom_system_prompt?: string;
}

interface AIModelSelectionInterfaceProps {
  selectedNodeId?: string;
  currentConfig?: AIModelConfig;
  onConfigChange: (config: AIModelConfig) => void;
  showPerformanceMetrics?: boolean;
}

export const AIModelSelectionInterface: React.FC<AIModelSelectionInterfaceProps> = ({
  selectedNodeId,
  currentConfig,
  onConfigChange,
  showPerformanceMetrics = true
}) => {
  const [models, setModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [config, setConfig] = useState<AIModelConfig>(currentConfig || {
    model_id: '',
    temperature: 0.7,
    max_tokens: 1000,
    top_p: 1.0,
    frequency_penalty: 0,
    presence_penalty: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAIModels();
  }, []);

  useEffect(() => {
    if (config.model_id && models.length > 0) {
      const model = models.find(m => m.id === config.model_id);
      setSelectedModel(model || null);
    }
  }, [config.model_id, models]);

  const loadAIModels = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_model_integrations')
        .select('*')
        .eq('is_active', true)
        .order('provider', { ascending: true });

      if (error) throw error;

      // Map the data to match our interface
      const mappedModels: AIModel[] = (data || []).map(model => ({
        id: model.id,
        name: model.name,
        provider: model.provider,
        model_type: model.model_type,
        capabilities: model.capabilities || [],
        configuration: model.model_config || {},
        performance_tier: 'standard', // Default value
        cost_per_request: 0.001, // Default value
        max_context_length: model.max_context_length || 4000,
        supports_function_calling: model.supports_function_calling || false,
        supports_vision: model.supports_vision || false,
        is_active: model.is_active
      }));

      setModels(mappedModels);
      
      // Set default model if none selected
      if (!config.model_id && mappedModels && mappedModels.length > 0) {
        const defaultModel = mappedModels.find(m => m.provider === 'openai') || mappedModels[0];
        updateConfig({ model_id: defaultModel.id });
      }
    } catch (error) {
      console.error('Failed to load AI models:', error);
      toast({
        title: "Error",
        description: "Failed to load AI models",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = (updates: Partial<AIModelConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'openai':
        return <Brain className="w-4 h-4" />;
      case 'anthropic':
        return <MessageSquare className="w-4 h-4" />;
      case 'google':
        return <Eye className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  const getPerformanceTierColor = (tier: string) => {
    switch (tier) {
      case 'premium':
        return 'bg-purple-500';
      case 'standard':
        return 'bg-blue-500';
      case 'basic':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const validateConfig = () => {
    if (!config.model_id) return false;
    if (config.temperature < 0 || config.temperature > 2) return false;
    if (config.max_tokens < 1 || config.max_tokens > 4000) return false;
    return true;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Brain className="w-8 h-8 animate-pulse mx-auto mb-2" />
            <p>Loading AI models...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Model Configuration
            {validateConfig() ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="selection" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="selection">Model Selection</TabsTrigger>
              <TabsTrigger value="parameters">Parameters</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="selection" className="space-y-4">
              <div>
                <Label>AI Model</Label>
                <Select value={config.model_id} onValueChange={(value) => updateConfig({ model_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an AI model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex items-center gap-2">
                          {getProviderIcon(model.provider)}
                          <span>{model.name}</span>
                          <Badge variant="outline" className={`${getPerformanceTierColor(model.performance_tier)} text-white`}>
                            {model.performance_tier}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedModel && (
                <div className="space-y-3 p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Provider:</span>
                    <div className="flex items-center gap-1">
                      {getProviderIcon(selectedModel.provider)}
                      <span>{selectedModel.provider}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Type:</span>
                    <span>{selectedModel.model_type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Context Length:</span>
                    <span>{selectedModel.max_context_length?.toLocaleString()} tokens</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Cost per Request:</span>
                    <span>${selectedModel.cost_per_request?.toFixed(4)}</span>
                  </div>
                  <div>
                    <span className="font-medium">Capabilities:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedModel.capabilities?.map((cap, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {cap}
                        </Badge>
                      ))}
                      {selectedModel.supports_function_calling && (
                        <Badge variant="secondary" className="text-xs">Function Calling</Badge>
                      )}
                      {selectedModel.supports_vision && (
                        <Badge variant="secondary" className="text-xs">Vision</Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="parameters" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Temperature: {config.temperature}</Label>
                  <Slider
                    value={[config.temperature]}
                    onValueChange={([value]) => updateConfig({ temperature: value })}
                    max={2}
                    min={0}
                    step={0.1}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Controls randomness. Higher values = more creative, lower values = more focused
                  </p>
                </div>

                <div>
                  <Label>Max Tokens: {config.max_tokens}</Label>
                  <Slider
                    value={[config.max_tokens]}
                    onValueChange={([value]) => updateConfig({ max_tokens: value })}
                    max={4000}
                    min={1}
                    step={10}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Maximum number of tokens to generate
                  </p>
                </div>

                <div>
                  <Label>Top P: {config.top_p}</Label>
                  <Slider
                    value={[config.top_p]}
                    onValueChange={([value]) => updateConfig({ top_p: value })}
                    max={1}
                    min={0}
                    step={0.1}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Nucleus sampling parameter
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Frequency Penalty: {config.frequency_penalty}</Label>
                  <Slider
                    value={[config.frequency_penalty]}
                    onValueChange={([value]) => updateConfig({ frequency_penalty: value })}
                    max={2}
                    min={-2}
                    step={0.1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Presence Penalty: {config.presence_penalty}</Label>
                  <Slider
                    value={[config.presence_penalty]}
                    onValueChange={([value]) => updateConfig({ presence_penalty: value })}
                    max={2}
                    min={-2}
                    step={0.1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Custom System Prompt</Label>
                  <Input
                    placeholder="Optional custom system prompt..."
                    value={config.custom_system_prompt || ''}
                    onChange={(e) => updateConfig({ custom_system_prompt: e.target.value })}
                    className="mt-2"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {showPerformanceMetrics && selectedModel && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-900">Performance Metrics</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Estimated Latency:</span>
                  <div className="font-medium">~2-5 seconds</div>
                </div>
                <div>
                  <span className="text-blue-700">Quality Score:</span>
                  <div className="font-medium">
                    {selectedModel.performance_tier === 'premium' ? '95%' : 
                     selectedModel.performance_tier === 'standard' ? '85%' : '75%'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};