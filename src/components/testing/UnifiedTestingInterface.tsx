import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Sparkles, TestTube, Play, Brain, Zap, Settings2, 
  CheckCircle, XCircle, X, Clock, Terminal, Download, RotateCcw, Eye 
} from 'lucide-react';
import { useUniversalAI } from '@/hooks/useUniversalAI';
import { useMasterToast } from '@/hooks/useMasterToast';
import { PromptBasedAgentGenerator } from '@/components/agent-builder/PromptBasedAgentGenerator';
import { ArizeTracing } from '@/components/tracing/ArizeTracing';

interface TestResult {
  id: string;
  timestamp: string;
  status: 'running' | 'success' | 'error' | 'warning';
  message: string;
  duration?: number;
  data?: any;
}

interface UnifiedTestingInterfaceProps {
  workflowNodes?: any[];
  workflowEdges?: any[];
  selectedNode?: any;
  onAgentGenerated?: (agent: any) => void;
  onClose?: () => void;
}

export const UnifiedTestingInterface: React.FC<UnifiedTestingInterfaceProps> = ({
  workflowNodes = [],
  workflowEdges = [],
  selectedNode,
  onAgentGenerated,
  onClose
}) => {
  const [testingMode, setTestingMode] = useState<'generate' | 'test' | 'unified'>('unified');
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'claude' | 'gemini'>('openai');
  const [testInput, setTestInput] = useState('{"message": "Hello, test the workflow"}');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { showSuccess, showError } = useMasterToast();
  const {
    generateAgent,
    testNode,
    analyzeWorkflow,
    availableProviders,
    isLoading,
    hasAvailableProviders
  } = useUniversalAI({ defaultProvider: selectedProvider });

  // Auto-scroll to bottom when new results come in
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [testResults]);

  // Close on ESC when onClose is provided
  useEffect(() => {
    if (!onClose) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

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

  const handleAgentGeneration = async (agentData: any) => {
    addTestResult({
      status: 'success',
      message: `🎉 Agent "${agentData.name}" generated successfully! Contains ${agentData.nodes?.length || 0} nodes.`
    });
    
    if (onAgentGenerated) {
      onAgentGenerated(agentData);
    }

    // If in unified mode, automatically switch to testing the generated agent
    if (testingMode === 'unified' && agentData.nodes?.length > 0) {
      setTestingMode('test');
      showSuccess(`Now ready to test "${agentData.name}"!`);
    }
  };

  const runWorkflowTest = async () => {
    if (isRunning || workflowNodes.length === 0) return;

    setIsRunning(true);
    
    // Start Arize tracing
    let mainTraceId: string | null = null;
    if (window.arizeTracing?.isConnected) {
      mainTraceId = await window.arizeTracing.startTrace(
        'workflow-test',
        'complete-workflow-execution',
        {
          nodeCount: workflowNodes.length,
          edgeCount: workflowEdges.length,
          provider: selectedProvider
        }
      );
    }

    addTestResult({
      status: 'running',
      message: `🚀 Starting intelligent workflow test with ${selectedProvider.toUpperCase()} AI...${mainTraceId ? ' (Tracing enabled)' : ''}`
    });

    try {
      const inputData = JSON.parse(testInput);

      // First analyze the entire workflow
      addTestResult({
        status: 'running',
        message: `🧠 Analyzing workflow architecture with ${selectedProvider.toUpperCase()}...`
      });

      const analysis = await analyzeWorkflow(workflowNodes, workflowEdges, selectedProvider);
      
      if (analysis) {
        addTestResult({
          status: 'success',
          message: `📊 Workflow Analysis: ${analysis.complexity} complexity, ${analysis.riskAssessment} risk level`
        });

        if (analysis.issues?.length > 0) {
          analysis.issues.forEach((issue: any) => {
            addTestResult({
              status: issue.type === 'error' ? 'error' : 'warning',
              message: `⚠️ ${issue.message}`
            });
          });
        }
      }

      // Test each node with AI and tracing
      let currentData = inputData;
      for (const node of workflowNodes) {
        // Start node-specific trace
        let nodeTraceId: string | null = null;
        if (window.arizeTracing?.isConnected && mainTraceId) {
          nodeTraceId = await window.arizeTracing.startTrace(
            node.id,
            `node-execution-${node.type || 'unknown'}`,
            {
              nodeType: node.type,
              nodeLabel: node.data?.label,
              inputData: currentData
            }
          );
        }

        addTestResult({
          status: 'running',
          message: `🎯 AI testing: ${node.data?.label || node.id}${nodeTraceId ? ' (Traced)' : ''}`,
        });

        const nodeResult = await testNode(node, currentData, selectedProvider);
        
        if (nodeResult.success) {
          if (nodeTraceId && window.arizeTracing?.isConnected) {
            await window.arizeTracing.endTrace(nodeTraceId, 'success', {
              outputData: nodeResult.output,
              executionTime: nodeResult.executionTime
            });
          }
          
          addTestResult({
            status: 'success',
            message: `✅ ${nodeResult.message || `Node completed successfully`}`,
            duration: nodeResult.executionTime,
            data: nodeResult
          });
          currentData = nodeResult.output || currentData;
        } else {
          if (nodeTraceId && window.arizeTracing?.isConnected) {
            await window.arizeTracing.endTrace(nodeTraceId, 'error', {
              error: nodeResult.message,
              executionTime: nodeResult.executionTime
            });
          }
          
          addTestResult({
            status: 'error',
            message: `❌ ${nodeResult.message || `Node test failed`}`,
            duration: nodeResult.executionTime
          });
          break;
        }
      }

      // End main trace
      if (mainTraceId && window.arizeTracing?.isConnected) {
        await window.arizeTracing.endTrace(mainTraceId, 'success', {
          totalNodes: workflowNodes.length,
          finalOutput: currentData
        });
      }

      addTestResult({
        status: 'success',
        message: `🎉 Complete workflow test finished using ${selectedProvider.toUpperCase()}!${mainTraceId ? ' (Trace completed)' : ''}`,
      });

      showSuccess(`Workflow testing completed with ${selectedProvider.toUpperCase()}!`);

    } catch (error: any) {
      // End main trace with error
      if (mainTraceId && window.arizeTracing?.isConnected) {
        await window.arizeTracing.endTrace(mainTraceId, 'error', {
          error: error.message
        });
      }

      addTestResult({
        status: 'error',
        message: `💥 Test failed: ${error.message}`
      });
      showError(`Test failed: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const runSingleNodeTest = async () => {
    if (!selectedNode || isRunning) return;

    setIsRunning(true);
    addTestResult({
      status: 'running',
      message: `🎯 AI testing single node: ${selectedNode.data?.label || selectedNode.id}`
    });

    try {
      const inputData = JSON.parse(testInput);
      const result = await testNode(selectedNode, inputData, selectedProvider);
      
      if (result.success) {
        addTestResult({
          status: 'success',
          message: `✅ Node test passed: ${result.message}`,
          duration: result.executionTime,
          data: result
        });
        showSuccess('Node test completed successfully!');
      } else {
        addTestResult({
          status: 'error',
          message: `❌ Node test failed: ${result.message}`,
          duration: result.executionTime
        });
        showError('Node test failed!');
      }
    } catch (error: any) {
      addTestResult({
        status: 'error',
        message: `💥 Test error: ${error.message}`
      });
      showError(`Test error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
    showSuccess('Results cleared');
  };

  const exportResults = () => {
    const logsText = testResults.map(result => 
      `[${new Date(result.timestamp).toLocaleTimeString()}] ${result.status.toUpperCase()}: ${result.message}`
    ).join('\n');
    
    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unified-test-results-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    showSuccess('Results exported successfully!');
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'running': return <Clock className="h-3 w-3 text-blue-500 animate-spin" />;
      case 'success': return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'error': return <XCircle className="h-3 w-3 text-red-500" />;
      case 'warning': return <Clock className="h-3 w-3 text-yellow-500" />;
      default: return <Terminal className="h-3 w-3 text-gray-500" />;
    }
  };

  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader className="p-4 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Unified Testing Interface
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* AI Provider Selection */}
            <Select 
              value={selectedProvider} 
              onValueChange={(value: 'openai' | 'claude' | 'gemini') => setSelectedProvider(value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableProviders.map(provider => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Mode Selection */}
            <Select value={testingMode} onValueChange={(value: any) => setTestingMode(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unified">
                  <div className="flex items-center gap-2">
                    <Settings2 className="h-4 w-4" />
                    Unified Mode
                  </div>
                </SelectItem>
                <SelectItem value="generate">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Generate Only
                  </div>
                </SelectItem>
                <SelectItem value="test">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Test Only
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {onClose && (
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onClose} aria-label="Close unified testing">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-4 flex flex-col gap-4">
        <Tabs defaultValue="workspace" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="workspace" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Workspace
            </TabsTrigger>
            <TabsTrigger value="tracing" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Tracing
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              Results ({testResults.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workspace" className="flex-1 flex flex-col gap-4">
            {(testingMode === 'generate' || testingMode === 'unified') && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h3 className="font-medium">Agent Generation</h3>
                  <Badge variant="secondary">{selectedProvider.toUpperCase()}</Badge>
                </div>
                
                <PromptBasedAgentGenerator 
                  onGenerate={handleAgentGeneration}
                  className="border rounded-lg p-4"
                />
              </div>
            )}

            {(testingMode === 'test' || testingMode === 'unified') && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" />
                    <h3 className="font-medium">Workflow Testing</h3>
                    <Badge variant="secondary">{selectedProvider.toUpperCase()} AI</Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={runWorkflowTest}
                      disabled={isRunning || !hasAvailableProviders || workflowNodes.length === 0}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Test Workflow ({workflowNodes.length} nodes)
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={runSingleNodeTest}
                      disabled={isRunning || !hasAvailableProviders || !selectedNode}
                    >
                      <TestTube className="h-4 w-4 mr-2" />
                      Test Selected Node
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Test Input Data</label>
                  <Textarea
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    placeholder='{"message": "Hello, test the workflow"}'
                    className="h-20 font-mono text-sm"
                  />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tracing" className="flex-1 flex flex-col">
            <ArizeTracing 
              workflowId={workflowNodes.length > 0 ? `workflow-${Date.now()}` : undefined}
              isEnabled={true}
              onTraceEvent={(trace) => {
                addTestResult({
                  status: trace.status === 'error' ? 'error' : trace.status === 'warning' ? 'warning' : 'success',
                  message: `🔍 Trace: ${trace.nodeId || trace.workflowId} - ${trace.status} (${trace.duration}ms)`
                });
              }}
            />
          </TabsContent>

          <TabsContent value="results" className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Test Results</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={clearResults}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Clear
                </Button>
                <Button size="sm" variant="outline" onClick={exportResults} disabled={testResults.length === 0}>
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>
            
            <ScrollArea className="flex-1 border rounded-md p-2" ref={scrollRef}>
              <div className="space-y-1">
                {testResults.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No test results yet. Generate an agent or run a test to see results here.
                  </div>
                ) : (
                  testResults.map((result) => (
                    <div key={result.id} className="flex items-start gap-2 text-sm py-1">
                      {getStatusIcon(result.status)}
                      <span className="text-muted-foreground text-xs">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="flex-1">{result.message}</span>
                      {result.duration && (
                        <span className="text-xs text-muted-foreground">
                          {result.duration}ms
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};