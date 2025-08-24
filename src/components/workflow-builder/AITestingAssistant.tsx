import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, Zap, AlertTriangle, CheckCircle2, XCircle, Clock, 
  Play, Wrench, Lightbulb, TrendingUp, Eye, Settings
} from 'lucide-react';
import { useAIWorkflowAnalyzer, WorkflowIssue, ExecutionStep } from '@/hooks/useAIWorkflowAnalyzer';
import { useMasterToast } from '@/hooks/useMasterToast';

interface AITestingAssistantProps {
  nodes: any[];
  edges: any[];
  testInput: any;
  onWorkflowUpdate?: (nodes: any[], edges: any[]) => void;
  isVisible: boolean;
}

export const AITestingAssistant: React.FC<AITestingAssistantProps> = ({
  nodes,
  edges,
  testInput,
  onWorkflowUpdate,
  isVisible
}) => {
  const [activeTab, setActiveTab] = useState('analysis');
  const [autoAnalyze, setAutoAnalyze] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);
  const lastSigRef = useRef<string | null>(null);
  const {
    isAnalyzing,
    isExecuting,
    analysis,
    executionSteps,
    currentStep,
    analyzeWorkflow,
    executeWorkflowWithAI,
    fixIssue,
    generateOptimizations
  } = useAIWorkflowAnalyzer();
  
  const { showSuccess, showError } = useMasterToast();

  // Auto-analyze when workflow changes (signature-based, throttled)
  useEffect(() => {
    if (!autoAnalyze || !isVisible || nodes.length === 0 || isAnalyzing) return;

    const nodesSig = [...nodes]
      .map((n) => ({ id: n.id, type: n.type, x: n.position?.x, y: n.position?.y }))
      .sort((a, b) => a.id.localeCompare(b.id));
    const edgesSig = [...edges]
      .map((e) => ({ id: e.id, s: e.source, t: e.target }))
      .sort((a, b) => a.id.localeCompare(b.id));
    const sig = JSON.stringify({ n: nodesSig, e: edgesSig });

    if (sig === lastSigRef.current) return;

    const timer = setTimeout(() => {
      analyzeWorkflow(nodes, edges);
      lastSigRef.current = sig;
    }, 800);

    return () => clearTimeout(timer);
  }, [nodes, edges, autoAnalyze, isVisible, isAnalyzing, analyzeWorkflow]);

  // Update execution progress
  useEffect(() => {
    if (executionSteps.length > 0) {
      const completed = executionSteps.filter(s => s.status === 'completed' || s.status === 'failed').length;
      setExecutionProgress((completed / executionSteps.length) * 100);
    }
  }, [executionSteps]);

  const handleFixIssue = async (issue: WorkflowIssue) => {
    const updatedWorkflow = await fixIssue(issue, nodes, edges);
    if (updatedWorkflow && onWorkflowUpdate) {
      onWorkflowUpdate(updatedWorkflow.nodes, updatedWorkflow.edges);
    }
  };

  const handleExecuteWorkflow = () => {
    executeWorkflowWithAI(nodes, edges, testInput, (step) => {
      console.log('Step update:', step);
    });
  };

  const getIssueIcon = (issue: WorkflowIssue) => {
    switch (issue.type) {
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'suggestion': return <Lightbulb className="h-4 w-4 text-blue-500" />;
      default: return <Eye className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStepIcon = (step: ExecutionStep) => {
    switch (step.status) {
      case 'running': return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'skipped': return <Eye className="h-4 w-4 text-gray-400" />;
      default: return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="w-full h-full bg-background border-l">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">AI Testing Assistant</h3>
            {(isAnalyzing || isExecuting) && (
              <Badge variant="outline" className="animate-pulse">
                <Zap className="h-3 w-3 mr-1" />
                {isAnalyzing ? 'Analyzing' : 'Executing'}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => analyzeWorkflow(nodes, edges)}
              disabled={isAnalyzing || nodes.length === 0}
            >
              <Brain className="h-4 w-4 mr-2" />
              Analyze
            </Button>
            
            <Button
              size="sm"
              variant="default"
              onClick={handleExecuteWorkflow}
              disabled={isExecuting || nodes.length === 0}
            >
              <Play className="h-4 w-4 mr-2" />
              Test AI Flow
            </Button>
          </div>
        </div>

        {/* Execution Progress */}
        {isExecuting && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span>Execution Progress</span>
              <span>{Math.round(executionProgress)}%</span>
            </div>
            <Progress value={executionProgress} className="h-2" />
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList className="w-full px-4 py-2 sticky top-0 z-10 bg-background/95 backdrop-blur border-b flex flex-wrap gap-2 overflow-x-auto">
          <TabsTrigger value="analysis" className="whitespace-nowrap">Analysis</TabsTrigger>
          <TabsTrigger value="execution" className="whitespace-nowrap">Execution</TabsTrigger>
          <TabsTrigger value="issues" className="whitespace-nowrap">Issues</TabsTrigger>
          <TabsTrigger value="optimize" className="whitespace-nowrap">Optimize</TabsTrigger>
        </TabsList>

        <div className="px-4 pb-4 h-[calc(100%-6rem)]">
          <TabsContent value="analysis" className="h-full mt-0">
            <ScrollArea className="h-full">
              {analysis ? (
                <div className="space-y-4">
                  {/* Analysis Overview */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Workflow Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Complexity:</span>
                          <Badge className={`ml-2 ${
                            analysis.complexity === 'simple' ? 'bg-green-100 text-green-800' :
                            analysis.complexity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {analysis.complexity}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Risk:</span>
                          <Badge className={`ml-2 ${getSeverityColor(analysis.riskAssessment)}`}>
                            {analysis.riskAssessment}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Est. Runtime:</span>
                          <span className="ml-2 font-mono">{analysis.estimatedRunTime}ms</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Est. Cost:</span>
                          <span className="ml-2 font-mono">${analysis.estimatedCost.toFixed(4)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Suggestions */}
                  {analysis.suggestions.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Lightbulb className="h-4 w-4" />
                          AI Suggestions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {analysis.suggestions.map((suggestion, index) => (
                            <div key={index} className="text-sm p-3 bg-muted rounded-md">
                              {suggestion}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No analysis available. Click "Analyze" to start.</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="execution" className="h-full mt-0">
            <ScrollArea className="h-full">
              {executionSteps.length > 0 ? (
                <div className="space-y-2">
                  {executionSteps.map((step, index) => (
                    <Card 
                      key={step.id} 
                      className={`${currentStep === step.id ? 'ring-2 ring-primary' : ''}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {getStepIcon(step)}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-sm">{step.nodeName}</h4>
                              <Badge variant="outline" className="text-xs">
                                {step.status}
                              </Badge>
                            </div>
                            
                            {step.duration && (
                              <div className="text-xs text-muted-foreground mb-2">
                                Duration: {step.duration}ms
                              </div>
                            )}

                            {step.error && (
                              <div className="text-xs text-red-600 bg-red-50 p-2 rounded mt-2">
                                Error: {step.error}
                              </div>
                            )}

                            {step.logs.length > 0 && (
                              <div className="mt-2">
                                <details className="text-xs">
                                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                    View Logs ({step.logs.length})
                                  </summary>
                                  <div className="mt-2 space-y-1 font-mono">
                                    {step.logs.map((log, i) => (
                                      <div key={i} className="text-[10px] text-muted-foreground">
                                        {log}
                                      </div>
                                    ))}
                                  </div>
                                </details>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No execution steps yet. Click "Test AI Flow" to start.</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="issues" className="h-full mt-0">
            <ScrollArea className="h-full">
              {analysis?.issues && analysis.issues.length > 0 ? (
                <div className="space-y-3">
                  {analysis.issues.map((issue) => (
                    <Card key={issue.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {getIssueIcon(issue)}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-sm">{issue.title}</h4>
                              <Badge className={getSeverityColor(issue.severity)}>
                                {issue.severity}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-2">
                              {issue.description}
                            </p>
                            
                            <div className="text-xs bg-muted p-2 rounded mb-3">
                              <strong>Suggestion:</strong> {issue.suggestion}
                            </div>
                            
                            {issue.autoFixAvailable && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleFixIssue(issue)}
                                className="text-xs h-7"
                              >
                                <Wrench className="h-3 w-3 mr-1" />
                                Auto Fix
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No issues found. Your workflow looks good!</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="optimize" className="h-full mt-0">
            <ScrollArea className="h-full">
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Optimization suggestions coming soon...</p>
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};