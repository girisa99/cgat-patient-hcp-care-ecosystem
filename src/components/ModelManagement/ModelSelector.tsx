import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ModelConfig, UserModelPreferences, ModelCapability, ALL_MODELS } from '@/types/ModelTypes';
import { useToast } from '@/hooks/use-toast';
import { Cpu, Zap, DollarSign, Shield, Cloud, HardDrive } from 'lucide-react';

interface ModelSelectorProps {
  onPreferencesChange: (preferences: UserModelPreferences) => void;
  currentPreferences?: UserModelPreferences;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  onPreferencesChange,
  currentPreferences
}) => {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<UserModelPreferences>(
    currentPreferences || {
      userId: 'current-user',
      preferredModels: {
        chat: 'phi-3-mini',
        code: 'phi-3-mini', 
        medical: 'gpt-4o-mini',
        embeddings: 'distilbert-base',
        classification: 'distilbert-base'
      },
      fallbackStrategy: 'local-first',
      maxCostPerRequest: 0.01,
      allowLocalModels: true,
      performancePreference: 'speed',
      autoDownloadModels: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  );

  const [selectedCapability, setSelectedCapability] = useState<ModelCapability>('chat');

  const localModels = ALL_MODELS.filter(m => m.isLocal);
  const apiModels = ALL_MODELS.filter(m => !m.isLocal);
  const capabilityModels = ALL_MODELS.filter(m => m.capabilities.includes(selectedCapability));

  const updatePreference = (key: keyof UserModelPreferences, value: any) => {
    const updated = {
      ...preferences,
      [key]: value,
      updatedAt: new Date().toISOString()
    };
    setPreferences(updated);
    onPreferencesChange(updated);
  };

  const updatePreferredModel = (capability: ModelCapability, modelId: string) => {
    const updated = {
      ...preferences,
      preferredModels: {
        ...preferences.preferredModels,
        [capability]: modelId
      },
      updatedAt: new Date().toISOString()
    };
    setPreferences(updated);
    onPreferencesChange(updated);
  };

  const getModelIcon = (model: ModelConfig) => {
    if (model.isLocal) return <HardDrive className="h-4 w-4" />;
    return <Cloud className="h-4 w-4" />;
  };

  const getPerformanceIcon = (type: string) => {
    switch (type) {
      case 'speed': return <Zap className="h-4 w-4 text-yellow-500" />;
      case 'accuracy': return <Cpu className="h-4 w-4 text-blue-500" />;
      case 'cost': return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'privacy': return <Shield className="h-4 w-4 text-purple-500" />;
      default: return <Cpu className="h-4 w-4" />;
    }
  };

  const ModelCard: React.FC<{ model: ModelConfig; isSelected: boolean; onSelect: () => void }> = ({
    model,
    isSelected,
    onSelect
  }) => (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            {getModelIcon(model)}
            {model.name}
          </CardTitle>
          <div className="flex gap-1">
            <Badge variant={model.isLocal ? "default" : "secondary"} className="text-xs">
              {model.isLocal ? 'Local' : 'API'}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {model.size}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground mb-2">{model.description}</p>
        <div className="flex flex-wrap gap-1 mb-2">
          {model.capabilities.map(cap => (
            <Badge key={cap} variant="outline" className="text-xs">
              {cap}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Latency: {model.latency}</span>
          <span>Accuracy: {model.accuracy}</span>
        </div>
        {model.costPerToken && (
          <div className="text-xs text-muted-foreground mt-1">
            Cost: ${model.costPerToken}/token
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            Model Preferences & Routing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Performance Preference */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Performance Priority</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {(['speed', 'accuracy', 'cost', 'privacy'] as const).map(pref => (
                <Button
                  key={pref}
                  variant={preferences.performancePreference === pref ? "default" : "outline"}
                  size="sm"
                  onClick={() => updatePreference('performancePreference', pref)}
                  className="flex items-center gap-2"
                >
                  {getPerformanceIcon(pref)}
                  {pref.charAt(0).toUpperCase() + pref.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Fallback Strategy */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Fallback Strategy</Label>
            <Select 
              value={preferences.fallbackStrategy} 
              onValueChange={(value: any) => updatePreference('fallbackStrategy', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local-first">Local First (Privacy)</SelectItem>
                <SelectItem value="api-first">API First (Quality)</SelectItem>
                <SelectItem value="cost-optimized">Cost Optimized</SelectItem>
                <SelectItem value="speed-optimized">Speed Optimized</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="allow-local"
                checked={preferences.allowLocalModels}
                onCheckedChange={(checked) => updatePreference('allowLocalModels', checked)}
              />
              <Label htmlFor="allow-local" className="text-sm">Allow Local Models</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-download"
                checked={preferences.autoDownloadModels}
                onCheckedChange={(checked) => updatePreference('autoDownloadModels', checked)}
              />
              <Label htmlFor="auto-download" className="text-sm">Auto Download Models</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model Selection by Capability */}
      <Card>
        <CardHeader>
          <CardTitle>Model Selection by Task</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="chat" onValueChange={(value) => setSelectedCapability(value as ModelCapability)}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
              <TabsTrigger value="medical">Medical</TabsTrigger>
              <TabsTrigger value="embeddings">Embeddings</TabsTrigger>
              <TabsTrigger value="classification">Classification</TabsTrigger>
            </TabsList>

            {(['chat', 'code', 'medical', 'embeddings', 'classification'] as ModelCapability[]).map(capability => (
              <TabsContent key={capability} value={capability} className="space-y-4">
                <div className="text-sm text-muted-foreground mb-4">
                  Select your preferred model for {capability} tasks
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ALL_MODELS
                    .filter(m => m.capabilities.includes(capability))
                    .map(model => (
                      <ModelCard
                        key={model.id}
                        model={model}
                        isSelected={preferences.preferredModels[capability] === model.id}
                        onSelect={() => updatePreferredModel(capability, model.id)}
                      />
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Available Models Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Available Models</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="local">
            <TabsList>
              <TabsTrigger value="local">Local Models ({localModels.length})</TabsTrigger>
              <TabsTrigger value="api">API Models ({apiModels.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="local" className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Small language models that run locally in your browser
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {localModels.map(model => (
                  <Card key={model.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <HardDrive className="h-4 w-4" />
                        {model.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-muted-foreground mb-2">{model.description}</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {model.capabilities.map(cap => (
                          <Badge key={cap} variant="outline" className="text-xs">
                            {cap}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        RAM: {model.minRam}GB | Device: {model.preferredDevice}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="api" className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Large language models accessed via API
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {apiModels.map(model => (
                  <Card key={model.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Cloud className="h-4 w-4" />
                        {model.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-muted-foreground mb-2">{model.description}</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {model.capabilities.map(cap => (
                          <Badge key={cap} variant="outline" className="text-xs">
                            {cap}
                          </Badge>
                        ))}
                      </div>
                      {model.costPerToken && (
                        <div className="text-xs text-muted-foreground">
                          Cost: ${model.costPerToken}/token
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};