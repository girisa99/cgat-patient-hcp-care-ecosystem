import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Eye, 
  MessageSquare, 
  Mic, 
  Speaker, 
  Zap, 
  Clock, 
  Target, 
  TrendingUp,
  PlayCircle,
  PauseCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  DollarSign,
  Cpu,
  Activity
} from 'lucide-react';
import { useAIModelTesting } from '@/hooks/useAIModelTesting';
import { useAgents } from '@/hooks/useAgents';
import { toast } from '@/hooks/use-toast';

const getModelTypeIcon = (modelType: string) => {
  switch (modelType) {
    case 'vision': return <Eye className="h-4 w-4" />;
    case 'text': return <MessageSquare className="h-4 w-4" />;
    case 'speech_to_text': return <Mic className="h-4 w-4" />;
    case 'text_to_speech': return <Speaker className="h-4 w-4" />;
    case 'multimodal': return <Brain className="h-4 w-4" />;
    case 'embedding': return <Target className="h-4 w-4" />;
    default: return <Brain className="h-4 w-4" />;
  }
};

const getPerformanceTierColor = (tier: string) => {
  switch (tier) {
    case 'lightweight': return 'bg-green-100 text-green-800';
    case 'standard': return 'bg-blue-100 text-blue-800';
    case 'premium': return 'bg-purple-100 text-purple-800';
    case 'gpu_intensive': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'running': return <Activity className="h-4 w-4 text-blue-600 animate-spin" />;
    case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
    case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
    default: return <Clock className="h-4 w-4 text-gray-600" />;
  }
};

export const AIModelTestingInterface: React.FC = () => {
  const { agents } = useAgents();
  const {
    testDatasets,
    modelConfigs,
    testRuns,
    loading,
    startTestRun,
    processSingleSample,
    getTestRecommendations,
    getPerformanceInsights,
    calculateCostEstimate
  } = useAIModelTesting();

  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [selectedDataset, setSelectedDataset] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [testName, setTestName] = useState<string>('');
  const [sampleLimit, setSampleLimit] = useState<number>(10);
  const [quickTestInput, setQuickTestInput] = useState<string>('');

  const deploymentReadyAgents = (agents || []).filter(agent => 
    agent.status === 'ready_to_deploy' || agent.status === 'deployed'
  );

  const handleStartTest = async () => {
    if (!selectedAgent || !selectedDataset || !selectedModel || !testName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields to start the test.",
        variant: "destructive"
      });
      return;
    }

    try {
      await startTestRun(selectedAgent, selectedDataset, selectedModel, testName, {
        sampleLimit,
        parallelProcessing: sampleLimit <= 10
      });
    } catch (error) {
      console.error('Failed to start test:', error);
    }
  };

  const handleQuickTest = async () => {
    if (!selectedModel || !quickTestInput) {
      toast({
        title: "Missing Information",
        description: "Please select a model and enter test input.",
        variant: "destructive"
      });
      return;
    }

    const modelConfig = modelConfigs.find(m => m.id === selectedModel);
    if (!modelConfig) return;

    try {
      let inputData: any = {};
      
      switch (modelConfig.model_type) {
        case 'text':
          inputData = { text: quickTestInput };
          break;
        case 'vision':
          inputData = { imageUrl: quickTestInput, prompt: 'Describe this image' };
          break;
        case 'speech_to_text':
          inputData = { audio: quickTestInput }; // Assume base64 audio
          break;
        case 'text_to_speech':
          inputData = { text: quickTestInput };
          break;
        default:
          inputData = { text: quickTestInput };
      }

      await processSingleSample(modelConfig, inputData, 'Quick Test');
    } catch (error) {
      console.error('Quick test failed:', error);
    }
  };

  const selectedDatasetObj = testDatasets.find(d => d.id === selectedDataset);
  const recommendations = selectedAgent && selectedDatasetObj 
    ? getTestRecommendations(selectedAgent, selectedDatasetObj.dataset_type)
    : null;

  const selectedModelObj = modelConfigs.find(m => m.id === selectedModel);
  const costEstimate = selectedModelObj && selectedDatasetObj
    ? calculateCostEstimate(selectedModelObj, sampleLimit)
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Brain className="h-8 w-8 animate-pulse mx-auto mb-2" />
          <p>Loading AI testing interface...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">AI Model Testing</h2>
          <p className="text-muted-foreground">
            Test your agents against various AI models with comprehensive datasets
          </p>
        </div>
      </div>

      <Tabs defaultValue="test-setup" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="test-setup">Test Setup</TabsTrigger>
          <TabsTrigger value="quick-test">Quick Test</TabsTrigger>
          <TabsTrigger value="test-runs">Test Runs</TabsTrigger>
          <TabsTrigger value="model-configs">Model Configs</TabsTrigger>
        </TabsList>

        <TabsContent value="test-setup" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Test Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlayCircle className="h-5 w-5" />
                  Test Configuration
                </CardTitle>
                <CardDescription>
                  Set up a comprehensive test run for your agent
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Agent</label>
                  <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an agent to test" />
                    </SelectTrigger>
                    <SelectContent>
                      {deploymentReadyAgents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Test Dataset</label>
                  <Select value={selectedDataset} onValueChange={setSelectedDataset}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select test dataset" />
                    </SelectTrigger>
                    <SelectContent>
                      {testDatasets.map((dataset) => (
                        <SelectItem key={dataset.id} value={dataset.id}>
                          <div className="flex items-center gap-2">
                            {getModelTypeIcon(dataset.dataset_type)}
                            {dataset.name} ({dataset.sample_count} samples)
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">AI Model</label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select AI model" />
                    </SelectTrigger>
                    <SelectContent>
                      {modelConfigs.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex items-center gap-2">
                            {getModelTypeIcon(model.model_type)}
                            {model.name}
                            <Badge className={getPerformanceTierColor(model.performance_tier)} variant="secondary">
                              {model.performance_tier}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Test Name</label>
                  <Input
                    placeholder="Enter a name for this test run"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Sample Limit</label>
                  <Input
                    type="number"
                    min="1"
                    max="1000"
                    value={sampleLimit}
                    onChange={(e) => setSampleLimit(parseInt(e.target.value) || 10)}
                  />
                </div>

                {costEstimate && (
                  <div className="p-3 bg-muted rounded-lg space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-medium">Cost Estimate: ${costEstimate.totalCost}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Estimated time: {costEstimate.estimatedTimeMinutes} minutes</span>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleStartTest}
                  className="w-full"
                  disabled={!selectedAgent || !selectedDataset || !selectedModel || !testName}
                >
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Start Test Run
                </Button>
              </CardContent>
            </Card>

            {/* Recommendations */}
            {recommendations && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Model Recommendations
                  </CardTitle>
                  <CardDescription>
                    Suggested models for your selected dataset type
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recommendations.lightweightModels.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-green-600 mb-2">
                        Lightweight (Fast & Cost-effective)
                      </h4>
                      <div className="space-y-1">
                        {recommendations.lightweightModels.map((model) => (
                          <div key={model.id} className="flex items-center justify-between text-sm">
                            <span>{model.name}</span>
                            <Badge variant="outline" className="text-green-600">
                              {model.provider}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {recommendations.premiumModels.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-purple-600 mb-2">
                        Premium (High Accuracy)
                      </h4>
                      <div className="space-y-1">
                        {recommendations.premiumModels.map((model) => (
                          <div key={model.id} className="flex items-center justify-between text-sm">
                            <span>{model.name}</span>
                            <Badge variant="outline" className="text-purple-600">
                              {model.provider}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      💡 Start with lightweight models for quick validation, then use premium models for production testing.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="quick-test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Model Test
              </CardTitle>
              <CardDescription>
                Test a single input with any AI model instantly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">AI Model</label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select AI model" />
                    </SelectTrigger>
                    <SelectContent>
                      {modelConfigs.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex items-center gap-2">
                            {getModelTypeIcon(model.model_type)}
                            {model.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Test Input</label>
                  <Input
                    placeholder="Enter text, image URL, or audio data..."
                    value={quickTestInput}
                    onChange={(e) => setQuickTestInput(e.target.value)}
                  />
                </div>
              </div>

              <Button 
                onClick={handleQuickTest}
                disabled={!selectedModel || !quickTestInput}
              >
                <Zap className="h-4 w-4 mr-2" />
                Run Quick Test
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test-runs" className="space-y-6">
          <div className="grid gap-4">
            {testRuns.length > 0 ? (
              testRuns.map((testRun) => {
                const insights = getPerformanceInsights(testRun);
                return (
                  <Card key={testRun.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          {getStatusIcon(testRun.status)}
                          {testRun.test_name}
                        </CardTitle>
                        <Badge variant="outline">
                          {testRun.status}
                        </Badge>
                      </div>
                      <CardDescription>
                        Started: {new Date(testRun.start_time).toLocaleString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{testRun.success_rate.toFixed(1)}%</div>
                          <div className="text-sm text-muted-foreground">Success Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{testRun.avg_response_time_ms}ms</div>
                          <div className="text-sm text-muted-foreground">Avg Response</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{testRun.avg_accuracy.toFixed(1)}%</div>
                          <div className="text-sm text-muted-foreground">Accuracy</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{testRun.processed_samples}/{testRun.total_samples}</div>
                          <div className="text-sm text-muted-foreground">Samples</div>
                        </div>
                      </div>

                      {testRun.status === 'running' && (
                        <Progress 
                          value={(testRun.processed_samples / testRun.total_samples) * 100} 
                          className="mb-4"
                        />
                      )}

                      {insights.length > 0 && (
                        <div className="space-y-2">
                          {insights.map((insight, index) => (
                            <div
                              key={index}
                              className={`p-2 rounded-lg text-sm flex items-center gap-2 ${
                                insight.type === 'success' ? 'bg-green-50 text-green-700' :
                                insight.type === 'warning' ? 'bg-yellow-50 text-yellow-700' :
                                'bg-red-50 text-red-700'
                              }`}
                            >
                              {insight.type === 'success' ? <CheckCircle className="h-4 w-4" /> :
                               insight.type === 'warning' ? <AlertTriangle className="h-4 w-4" /> :
                               <XCircle className="h-4 w-4" />}
                              {insight.message}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No test runs yet</h3>
                <p className="text-muted-foreground">Start your first test to see results here</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="model-configs" className="space-y-6">
          <div className="grid gap-4">
            {modelConfigs.map((model) => (
              <Card key={model.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getModelTypeIcon(model.model_type)}
                    {model.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Badge variant="outline">{model.provider}</Badge>
                    <Badge className={getPerformanceTierColor(model.performance_tier)} variant="secondary">
                      {model.performance_tier}
                    </Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Model Type</div>
                      <div className="font-medium">{model.model_type}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Cost per Request</div>
                      <div className="font-medium">${model.cost_per_request.toFixed(6)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Max Concurrent</div>
                      <div className="font-medium">{model.max_concurrent_requests}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Performance</div>
                      <div className="flex items-center gap-1">
                        <Cpu className="h-4 w-4" />
                        <span className="font-medium">{model.performance_tier}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};