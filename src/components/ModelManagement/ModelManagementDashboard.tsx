import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UniversalModelSelector, SelectedModelConfig } from '@/components/ai';
import { useModelRouting } from '@/hooks/useModelRouting';
import { ModelRequest } from '@/services/ModelRoutingService';
import { UserModelPreferences, ModelCapability } from '@/types/ModelTypes';
import { Settings, Zap, Brain, TestTube, BarChart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ModelManagementDashboardProps {
  selectedTemplate?: any;
  templateId?: string;
}

export const ModelManagementDashboard: React.FC<ModelManagementDashboardProps> = ({ 
  selectedTemplate, 
  templateId 
}) => {
  const { toast } = useToast();
  const {
    preferences,
    modelMetrics,
    isLoading,
    selectModel,
    updatePreferences,
    testModelRouting,
    getAvailableModels
  } = useModelRouting();

  const [testRequest, setTestRequest] = useState<ModelRequest>({
    taskType: 'chat' as ModelCapability,
    inputText: 'Hello, can you help me with healthcare data analysis?',
    priority: 'medium',
    requiresPrivacy: false
  });

  const handlePreferencesChange = (newPreferences: UserModelPreferences) => {
    updatePreferences(newPreferences);
  };

  const handleTestRouting = () => {
    try {
      const result = testModelRouting(testRequest);
      toast({
        title: "Model Routing Test",
        description: `Selected: ${result.selectedModel.name}`,
      });
      console.log('Routing test result:', result);
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Could not test model routing",
        variant: "destructive",
      });
    }
  };

  const allModels = getAvailableModels();
  const localModels = allModels.filter(m => m.isLocal);
  const apiModels = allModels.filter(m => !m.isLocal);
  const providerPriority = ['anthropic','openai','azure','google'] as const;
  const sortedApiModels = [...apiModels].sort((a, b) => {
    const ai = providerPriority.indexOf(a.provider as any);
    const bi = providerPriority.indexOf(b.provider as any);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading model configurations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Models & Templates</h1>
          <p className="text-muted-foreground">
            Configure AI models, templates, and actions for your agent
          </p>
          {selectedTemplate && (
            <div className="mt-2 p-2 bg-secondary/50 rounded-md">
              <p className="text-sm text-foreground font-medium">
                Selected Template: {selectedTemplate.name || 'Unnamed Template'}
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedTemplate.description || 'Template configured for your agent'}
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{allModels.length} Models Available</Badge>
          <Badge variant="secondary">{localModels.length} Local</Badge>
          <Badge variant="secondary">{apiModels.length} API</Badge>
        </div>
      </div>

      <Tabs defaultValue="model-selection" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="model-selection" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Model Selection
          </TabsTrigger>
          <TabsTrigger value="available-models" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Available Models
          </TabsTrigger>
          <TabsTrigger value="api-models" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            API Models
          </TabsTrigger>
          <TabsTrigger value="actions-tasks" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Actions & Tasks
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="model-selection">
          <UniversalModelSelector
            onModelsSelect={(models) => {
              // Convert to the proper UserModelPreferences format
              const newPreferences: UserModelPreferences = {
                userId: preferences?.userId || 'current-user',
                preferredModels: {
                  chat: models.find(m => m.category === 'llm')?.model || preferences?.preferredModels?.chat || 'auto',
                  code: models.find(m => m.category === 'small')?.model || preferences?.preferredModels?.code || 'auto',
                  medical: models.find(m => m.role === 'specialized')?.model || preferences?.preferredModels?.medical || 'auto',
                  embeddings: preferences?.preferredModels?.embeddings || 'auto',
                  classification: preferences?.preferredModels?.classification || 'auto'
                },
                fallbackStrategy: preferences?.fallbackStrategy || 'api-first',
                maxCostPerRequest: preferences?.maxCostPerRequest || 0.1,
                allowLocalModels: preferences?.allowLocalModels || false,
                performancePreference: preferences?.performancePreference || 'accuracy',
                autoDownloadModels: preferences?.autoDownloadModels || false,
                createdAt: preferences?.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
              handlePreferencesChange(newPreferences);
            }}
            selectedModels={[]}
            mode="single"
            allowModeSwitch={true}
            maxSelections={5}
          />
        </TabsContent>

        <TabsContent value="available-models">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Local Small Language Models
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {localModels.map(model => (
                  <div key={model.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{model.name}</div>
                      <div className="text-sm text-muted-foreground">{model.description}</div>
                      <div className="flex gap-1 mt-1">
                        {model.capabilities.map(cap => (
                          <Badge key={cap} variant="outline" className="text-xs">
                            {cap}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="default">Local</Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {model.minRam}GB RAM
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-models">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                API Language Models
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sortedApiModels.map(model => (
                  <div key={model.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{model.name}</div>
                      <div className="text-sm text-muted-foreground">{model.description}</div>
                      <div className="flex gap-1 mt-1">
                        {model.capabilities.map(cap => (
                          <Badge key={cap} variant="outline" className="text-xs">
                            {cap}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">API</Badge>
                      {model.costPerToken && (
                        <div className="text-xs text-muted-foreground mt-1">
                          ${model.costPerToken}/token
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions-tasks">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Actions & Tasks Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Configure automated actions and tasks for your agent based on the selected template and models.
                </div>
                {selectedTemplate && (
                  <div className="p-4 bg-secondary/20 rounded-lg">
                    <h4 className="font-medium mb-2">Template-Based Actions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Journey Stages</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedTemplate.journey_stages?.length || 0} configured stages
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Agent Type</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedTemplate.template_type || 'custom'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Actions and tasks configuration will be implemented here</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    This will integrate with your selected models and template
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modelMetrics.map(metric => (
              <Card key={metric.modelId}>
                <CardHeader>
                  <CardTitle className="text-sm">
                    {allModels.find(m => m.id === metric.modelId)?.name || metric.modelId}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Requests</span>
                    <span className="text-sm font-medium">{metric.totalRequests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Success Rate</span>
                    <span className="text-sm font-medium">{metric.successRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Avg Latency</span>
                    <span className="text-sm font-medium">{metric.averageLatency.toFixed(0)}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Satisfaction</span>
                    <span className="text-sm font-medium">{metric.userSatisfactionScore.toFixed(1)}/10</span>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {modelMetrics.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No model usage metrics available yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Start using models to see analytics here
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};