import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  Eye, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Settings,
  TrendingUp,
  Zap
} from 'lucide-react';
import { fetchWithTimeout } from '@/hooks/shared/useFetchWithTimeout';

interface ArizeTrace {
  traceId: string;
  timestamp: string;
  status: 'success' | 'error' | 'warning' | 'running';
  workflowId: string;
  nodeId?: string;
  duration: number;
  metadata: any;
  spans: ArizeSpan[];
}

interface ArizeSpan {
  spanId: string;
  parentSpanId?: string;
  operationName: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  status: 'success' | 'error' | 'warning' | 'running';
  tags: Record<string, any>;
  logs: Array<{
    timestamp: string;
    level: 'info' | 'warn' | 'error';
    message: string;
    fields?: Record<string, any>;
  }>;
}

interface ArizeTracingProps {
  workflowId?: string;
  isEnabled?: boolean;
  onTraceEvent?: (trace: ArizeTrace) => void;
}

export const ArizeTracing: React.FC<ArizeTracingProps> = ({
  workflowId,
  isEnabled = true,
  onTraceEvent
}) => {
  const [traces, setTraces] = useState<ArizeTrace[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [spaceKey, setSpaceKey] = useState('');
  const [modelId, setModelId] = useState('workflow-agent');
  const [modelVersion, setModelVersion] = useState('1.0.0');
  const [autoTrace, setAutoTrace] = useState(true);
  const [selectedTrace, setSelectedTrace] = useState<ArizeTrace | null>(null);

  // Initialize Arize connection
  useEffect(() => {
    if (apiKey && spaceKey && isEnabled) {
      initializeArize();
    }
  }, [apiKey, spaceKey, isEnabled]);

  const initializeArize = async () => {
    try {
      // Test Arize connection by calling our edge function with timeout
      const result = await fetchWithTimeout<{ success?: boolean }>(
        'https://ithspbabhmdntioslfqe.supabase.co/functions/v1/arize-tracing',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'initialize',
            spaceKey,
            modelId,
            modelVersion
          }),
          timeoutMs: 15000, // 15 second timeout
        }
      );

      if (result.error) {
        throw result.error;
      }

      console.log('Arize tracing initialized successfully');
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to initialize Arize:', error);
      setIsConnected(false);
    }
  };

  const startTrace = async (nodeId: string, operationName: string, metadata: any = {}) => {
    if (!isConnected || !autoTrace) return null;

    const traceId = `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const spanId = `span_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const trace: ArizeTrace = {
      traceId,
      timestamp: new Date().toISOString(),
      status: 'running',
      workflowId: workflowId || 'default',
      nodeId,
      duration: 0,
      metadata: {
        modelId,
        modelVersion,
        environment: 'development',
        ...metadata
      },
      spans: [{
        spanId,
        operationName,
        startTime: new Date().toISOString(),
        status: 'running',
        tags: {
          'workflow.id': workflowId,
          'node.id': nodeId,
          'operation.name': operationName,
          ...metadata
        },
        logs: [{
          timestamp: new Date().toISOString(),
          level: 'info',
          message: `Started ${operationName}`,
          fields: metadata
        }]
      }]
    };

    setTraces(prev => [...prev, trace]);
    
    // Send trace start to Arize via edge function with timeout
    fetchWithTimeout('https://ithspbabhmdntioslfqe.supabase.co/functions/v1/arize-tracing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'start_trace',
        traceId,
        spanId,
        nodeId,
        operationName,
        metadata: trace.metadata,
        tags: trace.spans[0].tags
      }),
      timeoutMs: 10000,
    }).catch(error => {
      console.error('Failed to send trace to Arize:', error);
    });
    
    if (onTraceEvent) {
      onTraceEvent(trace);
    }

    return traceId;
  };

  const endTrace = async (traceId: string, status: 'success' | 'error' | 'warning', result: any = {}) => {
    if (!isConnected || !traceId) return;

    setTraces(prev => prev.map(trace => {
      if (trace.traceId === traceId) {
        const endTime = new Date().toISOString();
        const duration = Date.now() - new Date(trace.timestamp).getTime();
        
        const updatedTrace = {
          ...trace,
          status,
          duration,
          spans: trace.spans.map(span => ({
            ...span,
            endTime,
            duration: Date.now() - new Date(span.startTime).getTime(),
            status,
            logs: [
              ...span.logs,
              {
                timestamp: endTime,
                level: status === 'error' ? 'error' as const : 'info' as const,
                message: `Completed ${span.operationName}`,
                fields: result
              }
            ]
          }))
        };

        // Send trace end to Arize via edge function with timeout
        fetchWithTimeout('https://ithspbabhmdntioslfqe.supabase.co/functions/v1/arize-tracing', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'end_trace',
            traceId,
            status,
            duration,
            result
          }),
          timeoutMs: 10000,
        }).catch(error => {
          console.error('Failed to send trace completion to Arize:', error);
        });

        if (onTraceEvent) {
          onTraceEvent(updatedTrace);
        }

        return updatedTrace;
      }
      return trace;
    }));
  };

  const addSpanToTrace = (traceId: string, operationName: string, parentSpanId?: string) => {
    const spanId = `span_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    setTraces(prev => prev.map(trace => {
      if (trace.traceId === traceId) {
        const newSpan: ArizeSpan = {
          spanId,
          parentSpanId,
          operationName,
          startTime: new Date().toISOString(),
          status: 'running',
          tags: {
            'parent.span.id': parentSpanId,
            'operation.name': operationName
          },
          logs: [{
            timestamp: new Date().toISOString(),
            level: 'info',
            message: `Started ${operationName}`
          }]
        };
        
        return {
          ...trace,
          spans: [...trace.spans, newSpan]
        };
      }
      return trace;
    }));

    return spanId;
  };

  const logToSpan = (traceId: string, spanId: string, level: 'info' | 'warn' | 'error', message: string, fields?: any) => {
    setTraces(prev => prev.map(trace => {
      if (trace.traceId === traceId) {
        return {
          ...trace,
          spans: trace.spans.map(span => {
            if (span.spanId === spanId) {
              return {
                ...span,
                logs: [
                  ...span.logs,
                  {
                    timestamp: new Date().toISOString(),
                    level,
                    message,
                    fields
                  }
                ]
              };
            }
            return span;
          })
        };
      }
      return trace;
    }));
  };

  const getTraceMetrics = () => {
    const total = traces.length;
    const successful = traces.filter(t => t.status === 'success').length;
    const failed = traces.filter(t => t.status === 'error').length;
    const warnings = traces.filter(t => t.status === 'warning').length;
    const running = traces.filter(t => t.status === 'running').length;
    
    const avgDuration = traces.length > 0 
      ? traces.reduce((acc, t) => acc + t.duration, 0) / traces.length 
      : 0;

    return { total, successful, failed, warnings, running, avgDuration };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'running': return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const metrics = getTraceMetrics();

  // Expose tracing functions globally for workflow components
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.arizeTracing = {
        startTrace,
        endTrace,
        addSpanToTrace,
        logToSpan,
        isConnected
      };
    }
  }, [isConnected, autoTrace]);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Arize Workflow Tracing
            {isConnected && (
              <Badge variant="outline" className="text-green-600">
                Connected
              </Badge>
            )}
          </CardTitle>
          <Switch
            checked={autoTrace && isConnected}
            onCheckedChange={setAutoTrace}
            disabled={!isConnected}
          />
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="traces">Traces</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">Arize API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Arize API key"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="spaceKey">Space Key</Label>
                <Input
                  id="spaceKey"
                  value={spaceKey}
                  onChange={(e) => setSpaceKey(e.target.value)}
                  placeholder="Enter your space key"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modelId">Model ID</Label>
                <Input
                  id="modelId"
                  value={modelId}
                  onChange={(e) => setModelId(e.target.value)}
                  placeholder="workflow-agent"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modelVersion">Model Version</Label>
                <Input
                  id="modelVersion"
                  value={modelVersion}
                  onChange={(e) => setModelVersion(e.target.value)}
                  placeholder="1.0.0"
                />
              </div>
            </div>
            
            <Button 
              onClick={initializeArize} 
              disabled={!apiKey || !spaceKey}
              className="w-full"
            >
              <Zap className="h-4 w-4 mr-2" />
              Connect to Arize
            </Button>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Total Traces</span>
                  </div>
                  <div className="text-2xl font-bold mt-1">{metrics.total}</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Successful</span>
                  </div>
                  <div className="text-2xl font-bold mt-1 text-green-600">{metrics.successful}</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium">Failed</span>
                  </div>
                  <div className="text-2xl font-bold mt-1 text-red-600">{metrics.failed}</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">Warnings</span>
                  </div>
                  <div className="text-2xl font-bold mt-1 text-yellow-600">{metrics.warnings}</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Running</span>
                  </div>
                  <div className="text-2xl font-bold mt-1 text-blue-600">{metrics.running}</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">Avg Duration</span>
                  </div>
                  <div className="text-2xl font-bold mt-1 text-purple-600">
                    {Math.round(metrics.avgDuration)}ms
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="traces" className="space-y-4">
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {traces.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No traces recorded yet. Enable auto-tracing and run a workflow to see traces.
                  </div>
                ) : (
                  traces.map((trace) => (
                    <Card 
                      key={trace.traceId} 
                      className={`cursor-pointer transition-colors ${
                        selectedTrace?.traceId === trace.traceId ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedTrace(trace)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(trace.status)}
                            <div>
                              <div className="font-medium text-sm">
                                {trace.nodeId || trace.workflowId}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(trace.timestamp).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{trace.duration}ms</div>
                            <div className="text-xs text-muted-foreground">
                              {trace.spans.length} spans
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            {selectedTrace ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(selectedTrace.status)}
                      Trace Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Trace ID:</span>
                        <div className="font-mono text-xs mt-1">{selectedTrace.traceId}</div>
                      </div>
                      <div>
                        <span className="font-medium">Duration:</span>
                        <div className="mt-1">{selectedTrace.duration}ms</div>
                      </div>
                      <div>
                        <span className="font-medium">Workflow ID:</span>
                        <div className="mt-1">{selectedTrace.workflowId}</div>
                      </div>
                      <div>
                        <span className="font-medium">Node ID:</span>
                        <div className="mt-1">{selectedTrace.nodeId || 'N/A'}</div>
                      </div>
                    </div>

                    <div>
                      <span className="font-medium">Spans ({selectedTrace.spans.length}):</span>
                      <ScrollArea className="h-[200px] mt-2">
                        <div className="space-y-2">
                          {selectedTrace.spans.map((span) => (
                            <Card key={span.spanId} className="p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(span.status)}
                                  <span className="font-medium text-sm">{span.operationName}</span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {span.duration}ms
                                </span>
                              </div>
                              
                              {span.logs.length > 0 && (
                                <div className="space-y-1">
                                  {span.logs.map((log, i) => (
                                    <div key={i} className="text-xs flex items-start gap-2">
                                      <span className="text-muted-foreground">
                                        {new Date(log.timestamp).toLocaleTimeString()}
                                      </span>
                                      <Badge variant="outline" className="h-4 text-xs">
                                        {log.level}
                                      </Badge>
                                      <span>{log.message}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Select a trace from the Traces tab to see detailed information.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Type declarations for global window object
declare global {
  interface Window {
    arizeTracing?: {
      startTrace: (nodeId: string, operationName: string, metadata?: any) => Promise<string | null>;
      endTrace: (traceId: string, status: 'success' | 'error' | 'warning', result?: any) => Promise<void>;
      addSpanToTrace: (traceId: string, operationName: string, parentSpanId?: string) => string;
      logToSpan: (traceId: string, spanId: string, level: 'info' | 'warn' | 'error', message: string, fields?: any) => void;
      isConnected: boolean;
    };
  }
}

export default ArizeTracing;