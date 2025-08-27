import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { 
  Play, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Zap, 
  Settings, 
  RefreshCw,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useWorkflowValidator, ValidationStep, FixOption } from '@/hooks/useWorkflowValidator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface WorkflowTestingProps {
  nodes: any[];
  edges: any[];
  onNodesChange?: (nodes: any[]) => void;
  onEdgesChange?: (edges: any[]) => void;
}

export const WorkflowTesting: React.FC<WorkflowTestingProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange
}) => {
  const [userPrompt, setUserPrompt] = useState('');
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [applyingFix, setApplyingFix] = useState<string | null>(null);

  const {
    isValidating,
    validationResult,
    currentStep,
    fixOptions,
    validateWorkflow,
    performAutoFix
  } = useWorkflowValidator();

  const handleValidate = () => {
    validateWorkflow(nodes, edges, userPrompt);
  };

  const handleAutoFix = async (fixOption: FixOption) => {
    if (!fixOption.autoFixFunction) return;
    
    setApplyingFix(fixOption.id);
    try {
      const success = await fixOption.autoFixFunction();
      if (success) {
        // Re-run validation after successful fix
        validateWorkflow(nodes, edges, userPrompt);
      }
    } finally {
      setApplyingFix(null);
    }
  };

  const getStatusIcon = (status: ValidationStep['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: ValidationStep['status']) => {
    switch (status) {
      case 'passed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      case 'running': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  const toggleStepExpansion = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Workflow Testing & Validation</h2>
          <p className="text-sm text-muted-foreground">
            Analyze your workflow, identify issues, and get recommendations
          </p>
        </div>
        <Button 
          onClick={handleValidate} 
          disabled={isValidating || nodes.length === 0}
          className="gap-2"
        >
          <Play className="h-4 w-4" />
          {isValidating ? 'Validating...' : 'Run Validation'}
        </Button>
      </div>

      {/* User Prompt Input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Original Prompt (Optional)</CardTitle>
          <CardDescription>
            Provide the original prompt to check if the workflow aligns with your intent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter the original prompt that describes what this workflow should do..."
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            className="min-h-[80px]"
          />
        </CardContent>
      </Card>

      {/* Current Validation Step */}
      {isValidating && currentStep && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
              <span className="text-sm">{currentStep}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Results */}
      {validationResult && (
        <Tabs defaultValue="overview" className="flex-1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="steps">Detailed Steps</TabsTrigger>
            <TabsTrigger value="fixes">Fix Options</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Overall Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{validationResult.score}/100</div>
                  <Progress value={validationResult.score} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant={
                    validationResult.overallStatus === 'passed' ? 'default' : 
                    validationResult.overallStatus === 'warning' ? 'secondary' : 'destructive'
                  }>
                    {validationResult.overallStatus.toUpperCase()}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Critical Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-500">
                    {validationResult.criticalIssues.length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Auto-fixable</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">
                    {validationResult.autoFixableIssues}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Execution Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Steps:</span>
                  <span>{validationResult.executionSummary.totalSteps}</span>
                </div>
                <div className="flex justify-between">
                  <span>Passed:</span>
                  <span className="text-green-500">{validationResult.executionSummary.passedSteps}</span>
                </div>
                <div className="flex justify-between">
                  <span>Failed:</span>
                  <span className="text-red-500">{validationResult.executionSummary.failedSteps}</span>
                </div>
                <div className="flex justify-between">
                  <span>Warnings:</span>
                  <span className="text-yellow-500">{validationResult.executionSummary.warningSteps}</span>
                </div>
                <div className="flex justify-between">
                  <span>Execution Time:</span>
                  <span>{validationResult.executionSummary.totalExecutionTime}ms</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="steps">
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {validationResult.steps.map((step, index) => (
                  <Card key={step.id}>
                    <Collapsible>
                      <CollapsibleTrigger 
                        className="w-full"
                        onClick={() => toggleStepExpansion(step.id)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                  {String(index + 1).padStart(2, '0')}
                                </span>
                                {getStatusIcon(step.status)}
                              </div>
                              <div className="text-left">
                                <CardTitle className="text-sm">{step.name}</CardTitle>
                                {step.message && (
                                  <p className="text-xs text-muted-foreground">{step.message}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {step.executionTime && (
                                <span className="text-xs text-muted-foreground">
                                  {step.executionTime}ms
                                </span>
                              )}
                              {expandedSteps.has(step.id) ? 
                                <ChevronDown className="h-4 w-4" /> : 
                                <ChevronRight className="h-4 w-4" />
                              }
                            </div>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <CardContent className="pt-0">
                          {step.details && (
                            <div className="mb-3">
                              <h4 className="text-sm font-medium mb-1">Details:</h4>
                              <p className="text-sm text-muted-foreground">{step.details}</p>
                            </div>
                          )}
                          
                          {step.recommendations && step.recommendations.length > 0 && (
                            <div className="mb-3">
                              <h4 className="text-sm font-medium mb-1">Recommendations:</h4>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {step.recommendations.map((rec, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span>•</span>
                                    <span>{rec}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {step.manualFixSteps && step.manualFixSteps.length > 0 && (
                            <div className="mb-3">
                              <h4 className="text-sm font-medium mb-1">Manual Fix Steps:</h4>
                              <ol className="text-sm text-muted-foreground space-y-1">
                                {step.manualFixSteps.map((fixStep, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span>{i + 1}.</span>
                                    <span>{fixStep}</span>
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            {step.autoFixAvailable && (
                              <Badge variant="outline" className="text-xs">
                                <Zap className="h-3 w-3 mr-1" />
                                Auto-fixable
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              <div className={`w-2 h-2 rounded-full mr-1 ${getStatusColor(step.status)}`} />
                              {step.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="fixes">
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {fixOptions.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No fixes needed! Your workflow looks good.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  fixOptions.map((option) => (
                    <Card key={option.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-sm flex items-center gap-2">
                              {option.type === 'auto' ? (
                                <Zap className="h-4 w-4 text-blue-500" />
                              ) : (
                                <Settings className="h-4 w-4 text-orange-500" />
                              )}
                              {option.title}
                            </CardTitle>
                            <CardDescription>{option.description}</CardDescription>
                          </div>
                          <div className="text-right">
                            <Badge variant={
                              option.impact === 'high' ? 'destructive' : 
                              option.impact === 'medium' ? 'secondary' : 'outline'
                            }>
                              {option.impact} impact
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {option.estimatedTime}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {option.steps && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium mb-2">Steps:</h4>
                            <ol className="text-sm text-muted-foreground space-y-1">
                              {option.steps.map((step, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span>{i + 1}.</span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}
                        
                        {option.type === 'auto' && (
                          <Button
                            onClick={() => handleAutoFix(option)}
                            disabled={applyingFix === option.id}
                            className="w-full"
                          >
                            {applyingFix === option.id ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Applying Fix...
                              </>
                            ) : (
                              <>
                                <Zap className="h-4 w-4 mr-2" />
                                Apply Auto Fix
                              </>
                            )}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="recommendations">
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {validationResult.criticalIssues.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm text-red-500 flex items-center gap-2">
                        <XCircle className="h-4 w-4" />
                        Critical Issues
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {validationResult.criticalIssues.map((issue, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span>•</span>
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {validationResult.warnings.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm text-yellow-500 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Warnings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {validationResult.warnings.map((warning, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span>•</span>
                            <span>{warning}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">General Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Regularly validate your workflow as you make changes</li>
                      <li>• Use auto-fix for simple issues to save time</li>
                      <li>• Review security settings for sensitive data handling</li>
                      <li>• Consider performance implications for large workflows</li>
                      <li>• Test individual components before full deployment</li>
                      <li>• Keep your original prompt aligned with the current workflow</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};