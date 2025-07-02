
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TestingServiceRefactoringManager, 
  TESTING_SERVICE_REFACTORING_PLAN 
} from '@/utils/refactoring/TestingServiceRefactoringPlan';
import { CheckCircle, Clock, AlertCircle, Wrench } from 'lucide-react';

export const RefactoringProgress: React.FC = () => {
  const progress = TestingServiceRefactoringManager.getProgress();
  const currentPhase = TestingServiceRefactoringManager.getCurrentPhase();
  const nextTasks = TestingServiceRefactoringManager.getNextTasks();

  const handleMarkCompleted = (taskId: string) => {
    TestingServiceRefactoringManager.markTaskCompleted(taskId);
    // Force re-render by triggering a state update
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Testing Service Refactoring Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Overall Progress:</span>
              <span>{progress.completedTasks}/{progress.totalTasks} tasks completed</span>
            </div>
            <Progress value={progress.progressPercentage} className="h-2" />
            <div className="text-center text-sm font-medium">
              {Math.round(progress.progressPercentage)}% Complete
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Phase */}
      {currentPhase && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Current Phase: {currentPhase.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <Badge variant={
                  currentPhase.priority === 'high' ? 'destructive' :
                  currentPhase.priority === 'medium' ? 'default' : 'secondary'
                }>
                  {currentPhase.priority} priority
                </Badge>
              </div>
              <div>
                <Badge variant="outline">
                  {currentPhase.status}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Est. {currentPhase.estimatedHours} hours
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Benefits:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {currentPhase.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Next Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {nextTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <p>All tasks completed! 🎉</p>
              </div>
            ) : (
              nextTasks.map((task) => (
                <div key={task.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{task.description}</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkCompleted(task.id)}
                    >
                      Mark Complete
                    </Button>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <Badge variant="secondary">{task.type}</Badge>
                    <Badge variant={
                      task.impact === 'high' ? 'destructive' :
                      task.impact === 'medium' ? 'default' : 'secondary'
                    }>
                      {task.impact} impact
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Files affected: {task.files.length}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* All Phases Overview */}
      <Card>
        <CardHeader>
          <CardTitle>All Phases Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {TESTING_SERVICE_REFACTORING_PLAN.map((phase, index) => {
              const completedTasks = phase.tasks.filter(t => t.completed).length;
              const phaseProgress = (completedTasks / phase.tasks.length) * 100;
              
              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{phase.name}</h4>
                    <Badge variant={
                      phase.status === 'completed' ? 'default' :
                      phase.status === 'in-progress' ? 'secondary' : 'outline'
                    }>
                      {phase.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>{completedTasks}/{phase.tasks.length} tasks</span>
                    <span>{Math.round(phaseProgress)}%</span>
                  </div>
                  <Progress value={phaseProgress} className="h-1" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
