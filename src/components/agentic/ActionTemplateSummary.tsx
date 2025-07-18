import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CheckCircle, Edit, Clock, Users, Brain, Database, 
  MessageSquare, Zap, Settings, Bot, Target, AlertTriangle
} from 'lucide-react';

interface ActionTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  type: string;
  priority: string;
  estimated_duration: number;
  requires_approval: boolean;
  tasks?: ActionTemplateTask[];
}

interface ActionTemplateTask {
  id: string;
  task_name: string;
  task_description?: string;
  task_type: string;
  timeout_minutes: number;
  is_critical: boolean;
}

interface ActionTemplateSummaryProps {
  selectedTemplates: ActionTemplate[];
  onEdit?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  isLoading?: boolean;
}

export const ActionTemplateSummary: React.FC<ActionTemplateSummaryProps> = ({
  selectedTemplates,
  onEdit,
  onApprove,
  onReject,
  isLoading = false
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'communication': return <MessageSquare className="h-4 w-4" />;
      case 'data_processing': return <Database className="h-4 w-4" />;
      case 'analysis': return <Brain className="h-4 w-4" />;
      case 'integration': return <Zap className="h-4 w-4" />;
      case 'automation': return <Settings className="h-4 w-4" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'validation': return <CheckCircle className="h-3 w-3" />;
      case 'analysis': return <Brain className="h-3 w-3" />;
      case 'notification': return <MessageSquare className="h-3 w-3" />;
      default: return <Target className="h-3 w-3" />;
    }
  };

  const totalEstimatedTime = selectedTemplates.reduce(
    (total, template) => total + template.estimated_duration, 0
  );

  const totalTasks = selectedTemplates.reduce(
    (total, template) => total + (template.tasks?.length || 0), 0
  );

  const criticalTasks = selectedTemplates.reduce(
    (total, template) => total + (template.tasks?.filter(task => task.is_critical).length || 0), 0
  );

  const approvalRequired = selectedTemplates.some(template => template.requires_approval);

  if (selectedTemplates.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No Action Templates Selected</h3>
          <p className="text-muted-foreground">
            Please go back and select action templates to continue.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Action Templates Summary
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Review your selected action templates and tasks before proceeding
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{selectedTemplates.length}</div>
              <div className="text-sm text-muted-foreground">Templates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalTasks}</div>
              <div className="text-sm text-muted-foreground">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{totalEstimatedTime}min</div>
              <div className="text-sm text-muted-foreground">Est. Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{criticalTasks}</div>
              <div className="text-sm text-muted-foreground">Critical Tasks</div>
            </div>
          </div>
          
          {approvalRequired && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                Some templates require approval before execution
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Template Details */}
      <Card>
        <CardHeader>
          <CardTitle>Selected Action Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {selectedTemplates.map((template, index) => (
                <Card key={template.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(template.category)}
                        <h4 className="font-medium">{template.name}</h4>
                        <Badge variant="outline">#{index + 1}</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={getPriorityColor(template.priority) as any}>
                          {template.priority}
                        </Badge>
                        {template.requires_approval && (
                          <Badge variant="outline">Requires Approval</Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {template.description || 'No description provided'}
                    </p>
                    
                    <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        ~{template.estimated_duration}min
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {template.tasks?.length || 0} tasks
                      </span>
                      <span className="capitalize">{template.type}</span>
                      <span className="capitalize">{template.category}</span>
                    </div>
                    
                    {/* Tasks */}
                    {template.tasks && template.tasks.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium">Tasks:</h5>
                        <div className="grid gap-2">
                          {template.tasks.map((task) => (
                            <div 
                              key={task.id} 
                              className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm"
                            >
                              <div className="flex items-center gap-2">
                                {getTaskTypeIcon(task.task_type)}
                                <span>{task.task_name}</span>
                                {task.is_critical && (
                                  <Badge variant="destructive" className="h-5 text-xs">
                                    Critical
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{task.task_type}</span>
                                <span>•</span>
                                <span>{task.timeout_minutes}min timeout</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onEdit} disabled={isLoading}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Selection
        </Button>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={onReject} disabled={isLoading}>
            Back
          </Button>
          <Button onClick={onApprove} disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-background border-t-foreground" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve & Continue
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};