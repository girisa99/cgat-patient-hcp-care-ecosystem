import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ModelSelector } from './ModelSelector';
import { useModelRouting } from '@/hooks/useModelRouting';
import { ModelRequest } from '@/services/ModelRoutingService';
import { UserModelPreferences, ModelCapability } from '@/types/ModelTypes';
import { Settings, Zap, Brain, TestTube, BarChart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ModelManagementDashboard: React.FC = () => {
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
          <h1 className="text-3xl font-bold text-foreground">Model Management</h1>
          <p className="text-muted-foreground">
            Configure Small Language Models (SLMs) and routing preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{allModels.length} Models Available</Badge>
          <Badge variant="secondary">{localModels.length} Local</Badge>
          <Badge variant="secondary">{apiModels.length} API</Badge>
        </div>
      </div>

      <Tabs defaultValue="preferences" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="models" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Models
          </TabsTrigger>
          <TabsTrigger value="testing" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Testing
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preferences">
          <ModelSelector
            onPreferencesChange={handlePreferencesChange}
            currentPreferences={preferences || undefined}
          />
        </TabsContent>

        <TabsContent value="models">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  API Language Models
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {apiModels.map(model => (
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
          </div>
        </TabsContent>

        <TabsContent value="testing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Model Routing Test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Task Type</label>
                  <select 
                    className="w-full mt-1 p-2 border rounded-md"
                    value={testRequest.taskType}
                    onChange={(e) => setTestRequest(prev => ({ 
                      ...prev, 
                      taskType: e.target.value as ModelCapability 
                    }))}
                  >
                    <option value="chat">Chat</option>
                    <option value="code">Code</option>
                    <option value="medical">Medical</option>
                    <option value="embeddings">Embeddings</option>
                    <option value="classification">Classification</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <select 
                    className="w-full mt-1 p-2 border rounded-md"
                    value={testRequest.priority}
                    onChange={(e) => setTestRequest(prev => ({ 
                      ...prev, 
                      priority: e.target.value as any 
                    }))}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Test Input</label>
                <textarea
                  className="w-full mt-1 p-2 border rounded-md"
                  rows={3}
                  value={testRequest.inputText}
                  onChange={(e) => setTestRequest(prev => ({ 
                    ...prev, 
                    inputText: e.target.value 
                  }))}
                  placeholder="Enter test input text..."
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={testRequest.requiresPrivacy}
                    onChange={(e) => setTestRequest(prev => ({ 
                      ...prev, 
                      requiresPrivacy: e.target.checked 
                    }))}
                  />
                  <span className="text-sm">Requires Privacy (Local Only)</span>
                </label>
              </div>

              <Button onClick={handleTestRouting} className="w-full">
                Test Model Routing
              </Button>
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