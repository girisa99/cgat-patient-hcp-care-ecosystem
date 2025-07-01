
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Play, 
  Pause, 
  RotateCcw,
  Download,
  Trash2,
  Merge,
  RefreshCw
} from 'lucide-react';
import { CodebaseAnalyzer, CodebaseAnalysisResult } from '@/utils/refactoring/CodebaseAnalyzer';
import { RefactoringExecutor, RefactoringExecutionResult } from '@/utils/refactoring/RefactoringExecutor';
import { useToast } from '@/hooks/use-toast';

const RefactoringDashboard: React.FC = () => {
  const [analysis, setAnalysis] = useState<CodebaseAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState<RefactoringExecutionResult[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    runAnalysis();
  }, []);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await CodebaseAnalyzer.analyzeCodebase();
      setAnalysis(result);
      toast({
        title: "📊 Analysis Complete",
        description: `Found ${result.duplicateAnalysis.totalDuplicates} duplicates and ${result.deadCodeAnalysis.totalDeadCode} dead code items`,
        variant: "default",
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: "❌ Analysis Failed",
        description: "Failed to analyze codebase. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const executeRefactoring = async () => {
    setIsExecuting(true);
    try {
      const results = await RefactoringExecutor.executeRefactoringPlan();
      setExecutionResults(results);
      
      const successCount = results.filter(r => r.success).length;
      toast({
        title: "🔧 Refactoring Complete",
        description: `${successCount}/${results.length} phases completed successfully`,
        variant: successCount === results.length ? "default" : "destructive",
      });
    } catch (error) {
      console.error('Refactoring failed:', error);
      toast({
        title: "❌ Refactoring Failed",
        description: "Failed to execute refactoring plan. Please review the logs.",
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const downloadReport = () => {
    if (!analysis) return;
    
    const report = `
# Codebase Refactoring Analysis Report

## Executive Summary
- **Total Duplicates:** ${analysis.duplicateAnalysis.totalDuplicates}
- **Dead Code Items:** ${analysis.deadCodeAnalysis.totalDeadCode}
- **Refactoring Phases:** ${analysis.refactoringPlan.phases.length}
- **Estimated Effort:** ${analysis.refactoringPlan.estimatedEffort}
- **Risk Score:** ${analysis.riskAssessment.overallRiskScore}/100

## Duplicate Analysis
${analysis.duplicateAnalysis.duplicateComponents.map(item => `
### ${item.name}
- **Type:** ${item.type}
- **Similarity:** ${item.similarity}%
- **Files:** ${item.files.join(', ')}
- **Strategy:** ${item.consolidationStrategy}
`).join('\n')}

## Refactoring Plan
${analysis.refactoringPlan.phases.map(phase => `
### ${phase.name}
- **Duration:** ${phase.estimatedDuration}
- **Risk Level:** ${phase.riskLevel}
- **Tasks:** ${phase.tasks.length}
- **Description:** ${phase.description}
`).join('\n')}

## Expected Benefits
${analysis.refactoringPlan.expectedBenefits.map(benefit => `
- **${benefit.category}:** ${benefit.description} (${benefit.expectedImprovement})
`).join('\n')}

---
Generated on: ${new Date().toISOString()}
    `.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `refactoring-analysis-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Codebase Refactoring Dashboard
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={runAnalysis} 
                disabled={isAnalyzing}
                variant="outline"
                size="sm"
              >
                {isAnalyzing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                {isAnalyzing ? 'Analyzing...' : 'Refresh Analysis'}
              </Button>
              <Button 
                onClick={downloadReport} 
                disabled={!analysis}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Comprehensive analysis and execution plan for eliminating duplicates and dead code
          </CardDescription>
        </CardHeader>
        {analysis && (
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-red-600">{analysis.duplicateAnalysis.totalDuplicates}</div>
                <div className="text-sm text-muted-foreground">Total Duplicates</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{analysis.deadCodeAnalysis.totalDeadCode}</div>
                <div className="text-sm text-muted-foreground">Dead Code Items</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{analysis.refactoringPlan.phases.length}</div>
                <div className="text-sm text-muted-foreground">Refactoring Phases</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{analysis.riskAssessment.overallRiskScore}</div>
                <div className="text-sm text-muted-foreground">Risk Score</div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {analysis && (
        <Tabs defaultValue="duplicates" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="duplicates">Duplicates</TabsTrigger>
            <TabsTrigger value="dead-code">Dead Code</TabsTrigger>
            <TabsTrigger value="plan">Refactoring Plan</TabsTrigger>
            <TabsTrigger value="risks">Risk Assessment</TabsTrigger>
            <TabsTrigger value="execution">Execution</TabsTrigger>
          </TabsList>

          {/* Duplicates Tab */}
          <TabsContent value="duplicates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Merge className="h-5 w-5" />
                  Duplicate Code Analysis
                </CardTitle>
                <CardDescription>
                  Components, hooks, and utilities that can be consolidated
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {analysis.duplicateAnalysis.duplicateComponents.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Duplicate Components</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {analysis.duplicateAnalysis.duplicateHooks.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Duplicate Hooks</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {analysis.duplicateAnalysis.duplicateUtilities.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Duplicate Utilities</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Consolidation Opportunities</h4>
                  {analysis.duplicateAnalysis.duplicateComponents.map((item, index) => (
                    <Alert key={index}>
                      <Merge className="h-4 w-4" />
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.name}</span>
                          <Badge variant="outline">{item.similarity}% similar</Badge>
                        </div>
                        <AlertDescription>
                          <div className="text-sm">{item.consolidationStrategy}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            <strong>Files:</strong> {item.files.join(', ')}
                          </div>
                        </AlertDescription>
                      </div>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dead Code Tab */}
          <TabsContent value="dead-code" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5" />
                  Dead Code Analysis
                </CardTitle>
                <CardDescription>
                  Unused components and files that can be safely removed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <span className="font-medium">Cleanup Potential</span>
                  <div className="flex items-center gap-2">
                    <Progress value={analysis.deadCodeAnalysis.cleanupPotential} className="w-32" />
                    <span className="text-sm font-medium">{analysis.deadCodeAnalysis.cleanupPotential}%</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Items for Removal</h4>
                  {analysis.deadCodeAnalysis.unusedComponents.map((item, index) => (
                    <Alert key={index}>
                      <Trash2 className="h-4 w-4" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.name}</span>
                          <Badge variant={item.safeToRemove ? 'default' : 'destructive'}>
                            {item.safeToRemove ? 'Safe to Remove' : 'Needs Review'}
                          </Badge>
                        </div>
                        <AlertDescription>
                          <div className="text-sm">{item.filePath}</div>
                        </AlertDescription>
                      </div>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Refactoring Plan Tab */}
          <TabsContent value="plan" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Refactoring Implementation Plan
                </CardTitle>
                <CardDescription>
                  Step-by-step plan for safe refactoring execution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {analysis.refactoringPlan.phases.map((phase, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-lg">{phase.name}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant={getRiskColor(phase.riskLevel) as any}>
                          {phase.riskLevel} risk
                        </Badge>
                        <Badge variant="outline">{phase.estimatedDuration}</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{phase.description}</p>
                    <div className="space-y-2">
                      <h5 className="font-medium">Tasks:</h5>
                      {phase.tasks.map((task: any, taskIndex: number) => (
                        <div key={taskIndex} className="flex items-center gap-2 text-sm">
                          <Badge variant="outline" className="text-xs">
                            {task.action}
                          </Badge>
                          <span>{task.target}</span>
                          <Badge variant={task.effort === 'high' ? 'destructive' : task.effort === 'medium' ? 'default' : 'secondary'}>
                            {task.effort}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Expected Benefits:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.refactoringPlan.expectedBenefits.map((benefit, index) => (
                      <div key={index} className="p-3 bg-green-50 rounded-lg">
                        <div className="font-medium">{benefit.category}</div>
                        <div className="text-sm text-muted-foreground">{benefit.description}</div>
                        <div className="text-sm font-medium text-green-600">{benefit.expectedImprovement}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Risk Assessment Tab */}
          <TabsContent value="risks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Risk Assessment
                </CardTitle>
                <CardDescription>
                  Potential risks and mitigation strategies for the refactoring
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <span className="font-medium">Overall Risk Score</span>
                  <div className="flex items-center gap-2">
                    <Progress value={analysis.riskAssessment.overallRiskScore} className="w-32" />
                    <span className="text-sm font-medium">{analysis.riskAssessment.overallRiskScore}/100</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Breaking Change Risks</h4>
                  {analysis.riskAssessment.breakingChanges.map((risk, index) => (
                    <Alert key={index}>
                      <AlertTriangle className="h-4 w-4" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{risk.component}</span>
                          <Badge variant={getRiskColor(risk.riskLevel) as any}>
                            {risk.riskLevel} risk
                          </Badge>
                        </div>
                        <AlertDescription>
                          <div className="text-sm">{risk.reason}</div>
                          <div className="text-sm text-blue-600 mt-1">
                            <strong>Mitigation:</strong> {risk.mitigation}
                          </div>
                        </AlertDescription>
                      </div>
                    </Alert>
                  ))}
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Mitigation Strategies</h4>
                  {analysis.riskAssessment.mitigationStrategies.map((strategy, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <span className="text-sm">{strategy}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Execution Tab */}
          <TabsContent value="execution" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    Refactoring Execution
                  </div>
                  <Button 
                    onClick={executeRefactoring}
                    disabled={isExecuting}
                    className="flex items-center gap-2"
                  >
                    {isExecuting ? (
                      <>
                        <Pause className="h-4 w-4" />
                        Executing...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        Execute Refactoring
                      </>
                    )}
                  </Button>
                </CardTitle>
                <CardDescription>
                  Execute the refactoring plan with safety checks and rollback capability
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {executionResults.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Execution Results</h4>
                    {executionResults.map((result, index) => (
                      <Alert key={index}>
                        {result.success ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{result.phase}</span>
                            <Badge variant={result.success ? 'default' : 'destructive'}>
                              {result.success ? 'Success' : 'Failed'}
                            </Badge>
                          </div>
                          <AlertDescription>
                            <div className="text-sm">
                              Changes: {result.changes.length} | Errors: {result.errors.length}
                            </div>
                            {result.errors.length > 0 && (
                              <div className="text-sm text-red-600 mt-1">
                                Errors: {result.errors.map(e => e.error).join(', ')}
                              </div>
                            )}
                          </AlertDescription>
                        </div>
                      </Alert>
                    ))}
                  </div>
                )}

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>⚠️ Important:</strong> This is a planning and analysis tool. 
                    Actual refactoring implementation requires careful manual execution 
                    following the generated plan to ensure no functionality is broken.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default RefactoringDashboard;
