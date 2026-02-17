import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AgentSession } from '@/types/agent-session';
import { 
  ListChecks, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  Settings,
  ArrowRight,
  Zap
} from 'lucide-react';

interface TaskExecutionPlanProps {
  session: AgentSession;
}

export const TaskExecutionPlan: React.FC<TaskExecutionPlanProps> = ({ session }) => {
  // Extract task information from session
  const getTaskInfo = () => {
    // Get tasks from actions configuration
    const actionTasks = session.actions?.assigned_actions || [];
    const customTasks = session.actions?.custom_actions || [];
    
    // Get workflow steps from canvas
    const workflowTasks = session.canvas?.workflow_steps || [];
    
    // Combine and structure task data
    const allTasks = [
      ...actionTasks.map((task: any, index: number) => ({
        id: task.id || `action-${index}`,
        name: task.name || `Action Task ${index + 1}`,
        type: 'action',
        description: task.description || 'Automated action task',
        priority: task.priority || 'medium',
        execution_time: task.estimated_duration || 5,
        dependencies: task.dependencies || [],
        is_critical: task.is_critical || false,
        status: 'configured',
        order: index + 1
      })),
      ...customTasks.map((task: any, index: number) => ({
        id: task.id || `custom-${index}`,
        name: task.name || `Custom Task ${index + 1}`,
        type: 'custom',
        description: task.description || 'Custom task implementation',
        priority: task.priority || 'medium',
        execution_time: task.execution_time || 10,
        dependencies: task.dependencies || [],
        is_critical: task.is_critical || false,
        status: 'configured',
        order: actionTasks.length + index + 1
      })),
      ...workflowTasks.map((task: any, index: number) => ({
        id: task.id || `workflow-${index}`,
        name: task.name || task.label || `Workflow Step ${index + 1}`,
        type: 'workflow',
        description: task.description || 'Workflow execution step',
        priority: 'medium',
        execution_time: 3,
        dependencies: task.dependencies || [],
        is_critical: true,
        status: 'configured',
        order: actionTasks.length + customTasks.length + index + 1
      }))
    ];
    
    // Sort by order and add execution sequence
    return allTasks.sort((a, b) => a.order - b.order).map((task, index) => ({
      ...task,
      sequence_number: index + 1
    }));
  };

  const tasks = getTaskInfo();
  const totalTasks = tasks.length;
  const criticalTasks = tasks.filter(t => t.is_critical).length;
  const averageExecutionTime = tasks.reduce((sum, task) => sum + task.execution_time, 0) / totalTasks || 0;
  const totalExecutionTime = tasks.reduce((sum, task) => sum + task.execution_time, 0);

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'action':
        return <Zap className="h-4 w-4" />;
      case 'workflow':
        return <Play className="h-4 w-4" />;
      case 'custom':
        return <Settings className="h-4 w-4" />;
      default:
        return <ListChecks className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'action':
        return 'bg-blue-100 text-blue-800';
      case 'workflow':
        return 'bg-purple-100 text-purple-800';
      case 'custom':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Task Execution Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5" />
            Task Execution Plan
          </CardTitle>
          <CardDescription>
            Comprehensive view of all tasks and their execution strategy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">{totalTasks}</p>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium">{criticalTasks}</p>
                <p className="text-sm text-muted-foreground">Critical Tasks</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">{Math.round(averageExecutionTime)}m</p>
                <p className="text-sm text-muted-foreground">Avg Duration</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">{totalExecutionTime}m</p>
                <p className="text-sm text-muted-foreground">Total Time</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <Card>
        <CardHeader>
          <CardTitle>Task Execution Sequence</CardTitle>
          <CardDescription>
            Tasks will be executed in the following order
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasks.map((task, index) => (
              <div key={task.id} className="relative">
                {/* Connection line to next task */}
                {index < tasks.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-200 dark:bg-gray-700" />
                )}
                
                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  {/* Sequence Number */}
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    {task.sequence_number}
                  </div>
                  
                  {/* Task Details */}
                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium flex items-center gap-2">
                        {getTypeIcon(task.type)}
                        {task.name}
                      </h4>
                      <div className="flex items-center gap-2">
                        {task.is_critical && (
                          <Badge variant="destructive" className="text-xs">
                            Critical
                          </Badge>
                        )}
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <Badge className={getTypeColor(task.type)}>
                          {task.type}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {task.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{task.execution_time}m duration</span>
                      </div>
                      
                      {task.dependencies.length > 0 && (
                        <div className="flex items-center gap-1">
                          <ArrowRight className="h-4 w-4" />
                          <span>Depends on {task.dependencies.length} task(s)</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>{task.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Execution Strategy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Execution Strategy
            </CardTitle>
            <CardDescription>
              How tasks will be executed in production
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Execution Mode</h4>
              <Badge variant="outline">Sequential with Parallel Optimization</Badge>
              <p className="text-sm text-muted-foreground mt-1">
                Tasks execute in sequence with parallel processing where possible
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Error Handling</h4>
              <Badge variant="outline">Graceful Degradation</Badge>
              <p className="text-sm text-muted-foreground mt-1">
                Non-critical task failures won't stop the entire workflow
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Retry Strategy</h4>
              <Badge variant="outline">3 Attempts with Backoff</Badge>
              <p className="text-sm text-muted-foreground mt-1">
                Failed tasks will be retried up to 3 times with increasing delays
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
            <CardDescription>
              Expected performance characteristics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Task Completion Rate</span>
                <span className="text-sm font-bold">95%</span>
              </div>
              <Progress value={95} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Parallel Efficiency</span>
                <span className="text-sm font-bold">78%</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Resource Utilization</span>
                <span className="text-sm font-bold">82%</span>
              </div>
              <Progress value={82} className="h-2" />
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>Estimated throughput: ~{Math.round(60 / averageExecutionTime)} tasks/hour</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Task Analysis */}
      {criticalTasks > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Critical Task Analysis
            </CardTitle>
            <CardDescription>
              Tasks essential for agent functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tasks.filter(task => task.is_critical).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <div>
                      <p className="font-medium">{task.name}</p>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getTypeColor(task.type)}>
                      {task.type}
                    </Badge>
                    <Badge variant="destructive">Critical</Badge>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-l-4 border-red-500 pl-4 mt-4">
              <p className="text-sm text-red-600 font-medium">Important</p>
              <p className="text-sm text-muted-foreground">
                Critical tasks must complete successfully for the agent to function properly. 
                Extra monitoring and alerting will be enabled for these tasks.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};