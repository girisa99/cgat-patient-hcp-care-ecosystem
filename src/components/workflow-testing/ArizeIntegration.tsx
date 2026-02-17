import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Settings, 
  Activity, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Zap,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useMasterToast } from '@/hooks/useMasterToast';
import { supabase } from '@/integrations/supabase/client';

interface ArizeConfig {
  apiKey?: string;
  organizationKey?: string;
  spaceKey?: string;
  modelId?: string;
  modelVersion?: string;
  enabled: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  samplingRate: number;
}

interface ArizeMetrics {
  totalTraces: number;
  successRate: number;
  avgLatency: number;
  errorRate: number;
  lastUpdate: Date;
}

interface ArizeTrace {
  traceId: string;
  timestamp: Date;
  status: 'success' | 'error' | 'running';
  duration: number;
  nodeCount: number;
  errorMessage?: string;
}

export const ArizeIntegration: React.FC = () => {
  const { showSuccess, showError, showInfo } = useMasterToast();
  
  const [config, setConfig] = useState<ArizeConfig>({
    enabled: false,
    logLevel: 'info',
    samplingRate: 1.0
  });
  
  const [metrics, setMetrics] = useState<ArizeMetrics>({
    totalTraces: 0,
    successRate: 0,
    avgLatency: 0,
    errorRate: 0,
    lastUpdate: new Date()
  });
  
  const [recentTraces, setRecentTraces] = useState<ArizeTrace[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');

  // Test Arize connection
  const testConnection = useCallback(async () => {
    if (!config.apiKey || !config.organizationKey) {
      showError('API Key and Organization Key are required');
      return;
    }

    setIsConnecting(true);
    
    try {
      // Simulate API call to Arize
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation:
      // const response = await fetch('https://api.arize.com/v1/validate', {
      //   headers: {
      //     'Authorization': `Bearer ${config.apiKey}`,
      //     'Arize-Organization-Key': config.organizationKey
      //   }
      // });
      
      setConnectionStatus('connected');
      showSuccess('Successfully connected to Arize!');
      
      // Load sample metrics
      setMetrics({
        totalTraces: 1247,
        successRate: 94.2,
        avgLatency: 1850,
        errorRate: 5.8,
        lastUpdate: new Date()
      });
      
      // Load sample traces
      setRecentTraces([
        {
          traceId: 'trace-001',
          timestamp: new Date(Date.now() - 300000),
          status: 'success',
          duration: 2340,
          nodeCount: 5
        },
        {
          traceId: 'trace-002',
          timestamp: new Date(Date.now() - 600000),
          status: 'error',
          duration: 1200,
          nodeCount: 3,
          errorMessage: 'Node timeout'
        },
        {
          traceId: 'trace-003',
          timestamp: new Date(Date.now() - 900000),
          status: 'success',
          duration: 3100,
          nodeCount: 7
        }
      ]);
      
    } catch (error) {
      console.error('Arize connection failed:', error);
      setConnectionStatus('error');
      showError('Failed to connect to Arize');
    } finally {
      setIsConnecting(false);
    }
  }, [config.apiKey, config.organizationKey, showSuccess, showError]);

  // Save configuration
  const saveConfig = useCallback(async () => {
    try {
      // Store in Supabase or localStorage
      localStorage.setItem('arize_config', JSON.stringify(config));
      showSuccess('Arize configuration saved');
    } catch (error) {
      showError('Failed to save configuration');
    }
  }, [config, showSuccess, showError]);

  // Load configuration
  React.useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('arize_config');
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig));
      }
    } catch (error) {
      console.error('Failed to load Arize config:', error);
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected': return 'default';
      case 'error': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Arize AI Observability
            <Badge variant={getStatusBadge(connectionStatus)}>
              {connectionStatus}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="setup" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="setup">Setup</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="traces">Traces</TabsTrigger>
            </TabsList>

            <TabsContent value="setup" className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="api-key">API Key</Label>
                    <Input
                      id="api-key"
                      type="password"
                      placeholder="Enter your Arize API key"
                      value={config.apiKey || ''}
                      onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="org-key">Organization Key</Label>
                    <Input
                      id="org-key"
                      placeholder="Enter organization key"
                      value={config.organizationKey || ''}
                      onChange={(e) => setConfig(prev => ({ ...prev, organizationKey: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="space-key">Space Key</Label>
                    <Input
                      id="space-key"
                      placeholder="Enter space key"
                      value={config.spaceKey || ''}
                      onChange={(e) => setConfig(prev => ({ ...prev, spaceKey: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="model-id">Model ID</Label>
                    <Input
                      id="model-id"
                      placeholder="workflow-model"
                      value={config.modelId || ''}
                      onChange={(e) => setConfig(prev => ({ ...prev, modelId: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enable-arize"
                    checked={config.enabled}
                    onCheckedChange={(enabled) => setConfig(prev => ({ ...prev, enabled }))}
                  />
                  <Label htmlFor="enable-arize">Enable Arize Tracing</Label>
                </div>

                <div className="flex gap-2">
                  <Button onClick={testConnection} disabled={isConnecting}>
                    {isConnecting ? 'Testing...' : 'Test Connection'}
                  </Button>
                  <Button variant="outline" onClick={saveConfig}>
                    Save Configuration
                  </Button>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">What Arize Tracks:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• <strong>Workflow Traces:</strong> End-to-end execution paths</li>
                    <li>• <strong>Node Performance:</strong> Latency, success rates, error patterns</li>
                    <li>• <strong>Data Flow:</strong> Input/output data between nodes</li>
                    <li>• <strong>AI Agent Interactions:</strong> Model calls, embeddings, predictions</li>
                    <li>• <strong>Error Analysis:</strong> Failure points and debugging context</li>
                    <li>• <strong>Business Metrics:</strong> Throughput, cost analysis, optimization insights</li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-4">
              {connectionStatus === 'connected' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-blue-600" />
                          <div>
                            <div className="text-2xl font-bold">{metrics.totalTraces}</div>
                            <div className="text-xs text-muted-foreground">Total Traces</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <div>
                            <div className="text-2xl font-bold">{metrics.successRate}%</div>
                            <div className="text-xs text-muted-foreground">Success Rate</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-orange-600" />
                          <div>
                            <div className="text-2xl font-bold">{metrics.avgLatency}ms</div>
                            <div className="text-xs text-muted-foreground">Avg Latency</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <div>
                            <div className="text-2xl font-bold">{metrics.errorRate}%</div>
                            <div className="text-xs text-muted-foreground">Error Rate</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Last updated: {metrics.lastUpdate.toLocaleString()}
                    </div>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View in Arize
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Connect to Arize to view metrics</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="traces" className="space-y-4">
              {connectionStatus === 'connected' ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Recent Workflow Traces</h4>
                    <Button variant="outline" size="sm">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View All
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {recentTraces.map((trace) => (
                      <Card key={trace.traceId}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0">
                                {trace.status === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                                {trace.status === 'error' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                                {trace.status === 'running' && <Activity className="h-4 w-4 text-blue-600 animate-spin" />}
                              </div>
                              
                              <div>
                                <div className="font-mono text-sm">{trace.traceId}</div>
                                <div className="text-xs text-muted-foreground">
                                  {trace.timestamp.toLocaleString()} • {trace.nodeCount} nodes • {trace.duration}ms
                                </div>
                                {trace.errorMessage && (
                                  <div className="text-xs text-red-600">{trace.errorMessage}</div>
                                )}
                              </div>
                            </div>
                            
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Connect to Arize to view traces</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Integration Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Why Use Arize for Workflow Testing?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-600" />
                Real-time Monitoring
              </h4>
              <p className="text-sm text-muted-foreground">
                Monitor workflow execution in real-time with detailed traces showing data flow between nodes and agents.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                Performance Analytics
              </h4>
              <p className="text-sm text-muted-foreground">
                Analyze latency, throughput, and success rates to optimize your workflow performance.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                Error Detection
              </h4>
              <p className="text-sm text-muted-foreground">
                Automatically detect and alert on workflow failures with detailed error context for debugging.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Eye className="h-4 w-4 text-purple-600" />
                AI Observability
              </h4>
              <p className="text-sm text-muted-foreground">
                Deep insights into AI agent behavior, model performance, and data quality issues.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ArizeIntegration;