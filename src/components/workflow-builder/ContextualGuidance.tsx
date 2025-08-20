import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Lightbulb, Target, ArrowRight, CheckCircle, Clock, AlertCircle,
  Brain, Database, Link, Settings, Zap, Activity, GitBranch,
  TrendingUp, Users, Workflow, Star
} from 'lucide-react';

interface ContextualGuidanceProps {
  workflowContext?: {
    type: 'visual' | 'manual';
    stage: string;
    useCaseData?: any;
    capturedRequirements?: any;
  };
  selectedNode?: any;
  suggestions: any[];
  nextSteps: any[];
  onSuggestionAction: (suggestion: any) => void;
}

export const ContextualGuidance: React.FC<ContextualGuidanceProps> = ({
  workflowContext,
  selectedNode,
  suggestions,
  nextSteps,
  onSuggestionAction
}) => {
  const getStageProgress = () => {
    const stages = ['use-case', 'journey', 'wizard', 'canvas'];
    const currentIndex = stages.indexOf(workflowContext?.stage || 'use-case');
    return ((currentIndex + 1) / stages.length) * 100;
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'assets': return <Database className="h-4 w-4" />;
      case 'connector': return <Link className="h-4 w-4" />;
      case 'variables': return <Settings className="h-4 w-4" />;
      case 'ai_model': return <Brain className="h-4 w-4" />;
      case 'workflow': return <Workflow className="h-4 w-4" />;
      case 'integration': return <GitBranch className="h-4 w-4" />;
      case 'guidance': return <Lightbulb className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'current': return <Activity className="h-4 w-4 text-blue-500" />;
      case 'next': return <ArrowRight className="h-4 w-4 text-orange-500" />;
      case 'upcoming': return <Clock className="h-4 w-4 text-gray-400" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Workflow Progress */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Workflow Progress
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {workflowContext?.type || 'visual'} mode
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Current Stage: {workflowContext?.stage?.replace('-', ' ').toUpperCase() || 'CANVAS'}</span>
              <span>{Math.round(getStageProgress())}%</span>
            </div>
            <Progress value={getStageProgress()} className="h-2" />
          </div>
          
          {workflowContext?.useCaseData && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">{workflowContext.useCaseData.name}</h4>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {workflowContext.useCaseData.description}
              </p>
              {workflowContext.useCaseData.domain && (
                <Badge variant="secondary" className="text-xs">
                  {workflowContext.useCaseData.domain}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Node Context */}
      {selectedNode && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4" />
              Selected Node Context
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs">
                {selectedNode.type || selectedNode.data?.type || 'Node'}
              </Badge>
              <span className="font-medium text-sm">
                {selectedNode.data?.label || selectedNode.id}
              </span>
            </div>
            {selectedNode.data?.description && (
              <p className="text-xs text-muted-foreground">
                {selectedNode.data.description}
              </p>
            )}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {selectedNode.data?.connectors && (
                <div>
                  <span className="text-muted-foreground">Connectors:</span>
                  <div className="font-medium">{selectedNode.data.connectors.length}</div>
                </div>
              )}
              {selectedNode.data?.dataFields && (
                <div>
                  <span className="text-muted-foreground">Data Fields:</span>
                  <div className="font-medium">{selectedNode.data.dataFields.length}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Intelligent Suggestions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Smart Suggestions
            <Badge variant="secondary" className="text-xs">
              {suggestions.length} insights
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {suggestions.length === 0 ? (
            <div className="text-center py-4">
              <Lightbulb className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Continue building your workflow to get intelligent suggestions
              </p>
            </div>
          ) : (
            suggestions.map((suggestion, idx) => (
              <Card key={idx} className="hover:bg-accent/50 transition-colors">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getSuggestionIcon(suggestion.type)}
                      <span className="font-medium text-sm">{suggestion.title}</span>
                    </div>
                    <Badge className={`text-xs ${getPriorityColor(suggestion.priority)}`}>
                      {suggestion.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    {suggestion.description}
                  </p>
                  
                  {/* Suggestion-specific content */}
                  {suggestion.assets && (
                    <div className="mb-3">
                      <p className="text-xs font-medium mb-1">Recommended Assets:</p>
                      <div className="flex flex-wrap gap-1">
                        {suggestion.assets.slice(0, 3).map((asset: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">{asset}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {suggestion.connectors && (
                    <div className="mb-3">
                      <p className="text-xs font-medium mb-1">Available Connectors:</p>
                      <div className="flex flex-wrap gap-1">
                        {suggestion.connectors.slice(0, 3).map((connector: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">{connector}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {suggestion.suggestedVariables && (
                    <div className="mb-3">
                      <p className="text-xs font-medium mb-1">Suggested Variables:</p>
                      <div className="flex flex-wrap gap-1">
                        {suggestion.suggestedVariables.slice(0, 3).map((variable: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">{variable}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full text-xs"
                    onClick={() => onSuggestionAction(suggestion)}
                  >
                    {suggestion.action || 'Apply Suggestion'}
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Next Steps Roadmap */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Workflow className="h-4 w-4" />
            Next Steps Roadmap
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {nextSteps.map((step, idx) => (
            <div key={step.id} className="flex items-start gap-3">
              <div className="mt-0.5">
                {getStepStatusIcon(step.status)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${
                    step.status === 'current' ? 'text-blue-600 dark:text-blue-400' :
                    step.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                    'text-muted-foreground'
                  }`}>
                    {step.title}
                  </span>
                  {step.status === 'current' && (
                    <Badge variant="default" className="text-xs">Current</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Workflow Health */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Workflow Health
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <span className="text-muted-foreground">Completeness</span>
              <div className="flex items-center gap-1">
                <Progress value={75} className="h-1 flex-1" />
                <span className="font-medium">75%</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Connectivity</span>
              <div className="flex items-center gap-1">
                <Progress value={60} className="h-1 flex-1" />
                <span className="font-medium">60%</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Data Flow</span>
              <div className="flex items-center gap-1">
                <Progress value={90} className="h-1 flex-1" />
                <span className="font-medium">90%</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Automation</span>
              <div className="flex items-center gap-1">
                <Progress value={45} className="h-1 flex-1" />
                <span className="font-medium">45%</span>
              </div>
            </div>
          </div>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Consider adding more decision nodes and AI agents to improve workflow automation.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button size="sm" variant="outline" className="w-full justify-start text-xs">
            <Database className="h-3 w-3 mr-2" />
            Browse Asset Library
          </Button>
          <Button size="sm" variant="outline" className="w-full justify-start text-xs">
            <Link className="h-3 w-3 mr-2" />
            Add Connector
          </Button>
          <Button size="sm" variant="outline" className="w-full justify-start text-xs">
            <Settings className="h-3 w-3 mr-2" />
            Create Variable
          </Button>
          <Button size="sm" variant="outline" className="w-full justify-start text-xs">
            <Brain className="h-3 w-3 mr-2" />
            Get AI Suggestions
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};