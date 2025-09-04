import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Activity, 
  Eye, 
  BarChart3, 
  Zap, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  Database,
  Play
} from 'lucide-react';
import { useObservabilityConfig } from '@/hooks/useObservabilityConfig';
import { useObservabilityMetrics } from '@/hooks/useObservabilityMetrics';

export const ObservabilityDashboard: React.FC = () => {
  const {
    config,
    isLoading: isLoadingConfig,
    saveConfig,
    isSaving,
    initializePlatform,
    isInitializing,
  } = useObservabilityConfig();

  const {
    traces,
    metrics,
    arizeMetrics,
    langwatchAnalytics,
    isLoading: isLoadingMetrics,
  } = useObservabilityMetrics();

  const isLoading = isLoadingConfig || isLoadingMetrics;

  const handleConfigChange = (updates: Partial<typeof config>) => {
    const newConfig = { ...config, ...updates };
    saveConfig(newConfig);
  };

  const handleInitializePlatform = (platform: 'arize' | 'langwatch') => {
    initializePlatform(platform);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'running': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      case 'running': return <Clock className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Workflow Observability</h2>
          <p className="text-muted-foreground">Monitor and analyze your AI workflows with Arize and LangWatch</p>
        </div>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          <Activity className="w-3 h-3 mr-1" />
          Real-time Monitoring
        </Badge>
      </div>

      {/* Platform Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Platform Comparison: Arize vs LangWatch
          </CardTitle>
          <CardDescription>
            Choose the right observability platform for your AI workflows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Arize */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Target className="w-4 h-4 text-orange-600" />
                </div>
                <h3 className="font-semibold">Arize AI</h3>
                <Badge variant="outline">Enterprise ML</Badge>
              </div>
              <div className="text-sm space-y-2">
                <p><strong>Best for:</strong> Traditional ML models, drift detection, model performance</p>
                <p><strong>Focus:</strong> Model monitoring, data quality, production ML</p>
                <p><strong>Strengths:</strong> Advanced analytics, enterprise features, model drift detection</p>
                <p><strong>LLM Support:</strong> Good (newer addition)</p>
              </div>
            </div>

            {/* LangWatch */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="font-semibold">LangWatch</h3>
                <Badge variant="outline">LLM-Native</Badge>
              </div>
              <div className="text-sm space-y-2">
                <p><strong>Best for:</strong> LLM applications, conversation flows, prompt optimization</p>
                <p><strong>Focus:</strong> LLM tracing, prompt engineering, conversation analytics</p>
                <p><strong>Strengths:</strong> LLM-native design, easy setup, conversation insights</p>
                <p><strong>LLM Support:</strong> Excellent (purpose-built)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Traces</p>
                <p className="text-2xl font-bold">{metrics.totalTraces}</p>
              </div>
              <Database className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{metrics.successRate.toFixed(1)}%</p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold">{metrics.avgResponseTime.toFixed(0)}ms</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Error Rate</p>
                <p className="text-2xl font-bold">{metrics.errorRate}%</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration and Traces */}
      <Tabs defaultValue="configuration" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="traces">Recent Traces</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="configuration" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Arize Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-orange-600" />
                  Arize AI Configuration
                </CardTitle>
                <CardDescription>
                  Configure Arize for ML model monitoring and drift detection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="arize-enabled">Enable Arize Integration</Label>
                  <Switch
                    id="arize-enabled"
                    checked={config.arizeEnabled}
                    onCheckedChange={(checked) => handleConfigChange({ arizeEnabled: checked })}
                  />
                </div>
                
                {config.arizeEnabled && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="arize-api-key">API Key</Label>
                      <Input
                        id="arize-api-key"
                        type="password"
                        placeholder="Enter Arize API key"
                        value={config.arizeApiKey || ''}
                        onChange={(e) => handleConfigChange({ arizeApiKey: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="arize-space-key">Space Key</Label>
                      <Input
                        id="arize-space-key"
                        placeholder="Enter Arize space key"
                        value={config.arizeSpaceKey || ''}
                        onChange={(e) => handleConfigChange({ arizeSpaceKey: e.target.value })}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* LangWatch Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-purple-600" />
                  LangWatch Configuration
                </CardTitle>
                <CardDescription>
                  Configure LangWatch for LLM application monitoring
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="langwatch-enabled">Enable LangWatch Integration</Label>
                  <Switch
                    id="langwatch-enabled"
                    checked={config.langwatchEnabled}
                    onCheckedChange={(checked) => handleConfigChange({ langwatchEnabled: checked })}
                  />
                </div>
                
                {config.langwatchEnabled && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="langwatch-api-key">API Key</Label>
                      <Input
                        id="langwatch-api-key"
                        type="password"
                        placeholder="Enter LangWatch API key"
                        value={config.langwatchApiKey || ''}
                        onChange={(e) => handleConfigChange({ langwatchApiKey: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="langwatch-project">Project ID</Label>
                      <Input
                        id="langwatch-project"
                        placeholder="Enter LangWatch project ID"
                        value={config.langwatchProjectId || ''}
                        onChange={(e) => handleConfigChange({ langwatchProjectId: e.target.value })}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={() => {
                if (config.arizeEnabled) handleInitializePlatform('arize');
                if (config.langwatchEnabled) handleInitializePlatform('langwatch');
              }} 
              disabled={isSaving || isInitializing}
            >
              <Settings className="w-4 h-4 mr-2" />
              {isSaving || isInitializing ? 'Initializing...' : 'Test & Initialize Platforms'}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="traces" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Workflow Traces</CardTitle>
              <CardDescription>
                Latest execution traces from your AI workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              {traces.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No traces available. Run some workflows to see traces here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {traces.map((trace) => (
                    <div key={trace.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={getStatusColor(trace.status)}>
                          {getStatusIcon(trace.status)}
                        </div>
                        <div>
                          <p className="font-medium">{trace.operation_name || 'Unnamed Operation'}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(trace.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span>{trace.duration_ms || 0}ms</span>
                        <Badge variant={trace.status === 'success' ? 'default' : 'destructive'}>
                          {trace.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Performance Analytics
              </CardTitle>
              <CardDescription>
                Insights and trends from your AI workflow performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Analytics dashboard coming soon</p>
                <p className="text-sm">Performance charts and insights will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};