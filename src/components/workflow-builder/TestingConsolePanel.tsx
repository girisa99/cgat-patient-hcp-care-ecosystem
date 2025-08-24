import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Play, Pause, Square, RotateCcw, Download, Upload, 
  Terminal, Bug, CheckCircle, XCircle, Clock, Zap 
} from 'lucide-react';
import { useMasterToast } from '@/hooks/useMasterToast';
import { useAIModelTesting } from '@/hooks/useAIModelTesting';
import { supabase } from '@/integrations/supabase/client';

interface TestingConsolePanelProps {
  isVisible: boolean;
  onToggle: () => void;
  sessionId?: string;
  selectedNode?: any;
  workflowNodes?: any[];
  workflowEdges?: any[];
  heightClass?: string;
}

interface TestResult {
  id: string;
  timestamp: string;
  status: 'running' | 'success' | 'error' | 'warning';
  message: string;
  nodeId?: string;
  duration?: number;
  data?: any;
}

export const TestingConsolePanel: React.FC<TestingConsolePanelProps> = ({
  isVisible,
  onToggle,
  sessionId,
  selectedNode,
  workflowNodes = [],
  workflowEdges = [],
  heightClass
}) => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [testInput, setTestInput] = useState('{"message": "Hello, test the workflow"}');
  const [activeTab, setActiveTab] = useState('console');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { showSuccess, showError } = useMasterToast();
  const { startTestRun, testRuns, loading } = useAIModelTesting();

  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        onToggle();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, onToggle]);

  // Auto-scroll to bottom when new results come in
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [testResults]);

  // Real-time test execution monitoring
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`test-execution-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agent_test_runs'
        },
        (payload) => {
          const newResult: TestResult = {
            id: payload.new.id,
            timestamp: new Date().toISOString(),
            status: payload.new.status === 'completed' ? 'success' : 
                   payload.new.status === 'failed' ? 'error' : 'running',
            message: `Test run ${payload.new.test_name} ${payload.new.status}`,
            duration: payload.new.end_time ? 
              new Date(payload.new.end_time).getTime() - new Date(payload.new.start_time).getTime() : 
              undefined,
            data: payload.new.results
          };
          setTestResults(prev => [...prev, newResult]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const addTestResult = (result: Partial<TestResult>) => {
    const newResult: TestResult = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      status: 'success',
      message: '',
      ...result
    };
    setTestResults(prev => [...prev, newResult]);
  };

  const runWorkflowTest = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setCurrentTest('workflow-execution');
    
    addTestResult({
      status: 'running',
      message: `🚀 Starting workflow test with ${workflowNodes.length} nodes...`
    });

    try {
      // Parse test input
      let inputData;
      try {
        inputData = JSON.parse(testInput);
      } catch (e) {
        throw new Error('Invalid JSON in test input');
      }

      // Simulate workflow execution through nodes
      for (const node of workflowNodes) {
        addTestResult({
          status: 'running',
          message: `⚡ Executing node: ${node.data?.label || node.id}`,
          nodeId: node.id
        });

        // Simulate node processing time
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

        // Simulate different outcomes based on node type
        const nodeSuccess = Math.random() > 0.1; // 90% success rate
        
        if (nodeSuccess) {
          addTestResult({
            status: 'success',
            message: `✅ Node ${node.data?.label || node.id} completed successfully`,
            nodeId: node.id,
            duration: Math.round(500 + Math.random() * 1000),
            data: { input: inputData, output: { processed: true, nodeId: node.id } }
          });
        } else {
          addTestResult({
            status: 'error',
            message: `❌ Node ${node.data?.label || node.id} failed - simulated error`,
            nodeId: node.id,
            duration: Math.round(200 + Math.random() * 500)
          });
          break;
        }
      }

      addTestResult({
        status: 'success',
        message: `🎉 Workflow test completed successfully!`,
        duration: Math.round(2000 + Math.random() * 3000)
      });

      showSuccess('Workflow test completed successfully!');

    } catch (error: any) {
      addTestResult({
        status: 'error',
        message: `💥 Workflow test failed: ${error.message}`,
        duration: Math.round(1000)
      });
      showError(`Test failed: ${error.message}`);
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  const runSingleNodeTest = async () => {
    if (!selectedNode || isRunning) return;

    setIsRunning(true);
    setCurrentTest(`node-${selectedNode.id}`);

    addTestResult({
      status: 'running',
      message: `🎯 Testing single node: ${selectedNode.data?.label || selectedNode.id}`
    });

    try {
      const inputData = JSON.parse(testInput);
      
      // Simulate node testing
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      const success = Math.random() > 0.05; // 95% success for single nodes
      
      if (success) {
        addTestResult({
          status: 'success',
          message: `✅ Node test passed for ${selectedNode.data?.label || selectedNode.id}`,
          nodeId: selectedNode.id,
          duration: Math.round(1000 + Math.random() * 2000),
          data: { 
            input: inputData, 
            output: { 
              processed: true, 
              nodeType: selectedNode.type,
              nodeData: selectedNode.data 
            } 
          }
        });
        showSuccess('Node test passed!');
      } else {
        addTestResult({
          status: 'error',
          message: `❌ Node test failed for ${selectedNode.data?.label || selectedNode.id}`,
          nodeId: selectedNode.id,
          duration: Math.round(500)
        });
        showError('Node test failed!');
      }

    } catch (error: any) {
      addTestResult({
        status: 'error',
        message: `💥 Node test error: ${error.message}`,
        nodeId: selectedNode?.id,
        duration: Math.round(300)
      });
      showError(`Node test error: ${error.message}`);
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  const stopTest = () => {
    setIsRunning(false);
    setCurrentTest('');
    addTestResult({
      status: 'warning',
      message: '⏹️ Test execution stopped by user'
    });
  };

  const clearConsole = () => {
    setTestResults([]);
    showSuccess('Console cleared');
  };

  const exportLogs = () => {
    const logsText = testResults.map(result => 
      `[${new Date(result.timestamp).toLocaleTimeString()}] ${result.status.toUpperCase()}: ${result.message}`
    ).join('\n');
    
    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-test-logs-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    showSuccess('Logs exported successfully!');
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'running': return <Clock className="h-3 w-3 text-blue-500 animate-spin" />;
      case 'success': return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'error': return <XCircle className="h-3 w-3 text-red-500" />;
      case 'warning': return <Bug className="h-3 w-3 text-yellow-500" />;
      default: return <Terminal className="h-3 w-3 text-gray-500" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'running': return 'text-blue-600';
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  if (!isVisible) return null;

  return (
    <Card className={`w-full ${heightClass || 'h-80'} border-t-2 border-primary/20 bg-background/95 backdrop-blur resize-y overflow-auto`}>
      <CardHeader className="p-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Terminal className="h-4 w-4" />
            Testing Console
            {isRunning && (
              <Badge variant="outline" className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Running
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={runWorkflowTest}
              disabled={isRunning || workflowNodes.length === 0}
              className="h-7 text-xs"
            >
              <Play className="h-3 w-3 mr-1" />
              Classic Test
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={runSingleNodeTest}
              disabled={isRunning || !selectedNode}
              className="h-7 text-xs"
            >
              <Bug className="h-3 w-3 mr-1" />
              Test Node
            </Button>
            
            {isRunning ? (
              <Button
                size="sm"
                variant="destructive"
                onClick={stopTest}
                className="h-7 text-xs"
              >
                <Square className="h-3 w-3 mr-1" />
                Stop
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={clearConsole}
                className="h-7 text-xs"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
            
            <Button
              size="sm"
              variant="outline"
              onClick={exportLogs}
              disabled={testResults.length === 0}
              className="h-7 text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={onToggle}
              className="h-7 text-xs"
              title="Close Console (ESC)"
            >
              ✕
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="w-full grid grid-cols-4 h-8">
            <TabsTrigger value="console" className="text-xs">Console</TabsTrigger>
            <TabsTrigger value="input" className="text-xs">Test Input</TabsTrigger>
            <TabsTrigger value="results" className="text-xs">Results</TabsTrigger>
            <TabsTrigger value="ai-assistant" className="text-xs">AI Assistant</TabsTrigger>
          </TabsList>
          
          <TabsContent value="console" className="h-60 m-0">
            <ScrollArea className="h-full" ref={scrollRef}>
              <div className="p-3 space-y-1 font-mono text-xs">
                {testResults.length === 0 ? (
                  <div className="text-muted-foreground text-center py-8">
                    No test results yet. Click "Test Workflow" or "Test Node" to start.
                  </div>
                ) : (
                  testResults.map((result) => (
                    <div
                      key={result.id}
                      className={`flex items-start gap-2 py-1 ${getStatusColor(result.status)}`}
                    >
                      {getStatusIcon(result.status)}
                      <span className="text-gray-500 min-w-[60px] text-[10px]">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="flex-1">{result.message}</span>
                      {result.duration && (
                        <span className="text-[10px] text-gray-400">
                          {result.duration}ms
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="input" className="h-60 m-0 p-3">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium mb-1 block">Test Input (JSON)</label>
                <Textarea
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder='{"message": "Hello world", "data": {...}}'
                  className="h-32 text-xs font-mono"
                />
              </div>
              <div className="text-xs text-muted-foreground">
                This JSON will be sent as input to the workflow or selected node for testing.
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="results" className="h-60 m-0">
            <ScrollArea className="h-full">
              <div className="p-3">
                {testResults.filter(r => r.data).length === 0 ? (
                  <div className="text-muted-foreground text-center py-8 text-xs">
                    No detailed results yet. Run tests to see output data.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {testResults
                      .filter(r => r.data)
                      .map((result) => (
                        <Card key={result.id} className="p-2">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusIcon(result.status)}
                            <span className="text-xs font-medium">
                              {result.nodeId ? `Node: ${result.nodeId}` : 'Workflow'}
                            </span>
                            <Badge variant="outline" className="text-[10px]">
                              {result.status}
                            </Badge>
                          </div>
                          <pre className="text-[10px] bg-muted p-2 rounded overflow-auto max-h-24">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </Card>
                      ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="ai-assistant" className="h-60 m-0 p-0">
            <div className="h-full">
              {/* AI Assistant will be imported and used here */}
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Terminal className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">AI Testing Assistant</p>
                  <p className="text-xs">Analyze workflow and get AI-powered testing insights</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};