import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
// RadioGroup not available, using custom implementation
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useLabelStudio, type LSTask, type LSAnnotation } from '@/hooks/useLabelStudio';
import { useMasterToast } from '@/hooks/useMasterToast';
import { CheckCircle, Circle, ArrowLeft, ArrowRight, Save, Loader2 } from 'lucide-react';

interface LSAnnotationWorkflowProps {
  projectId: number;
  tasks?: LSTask[];
  onAnnotationComplete?: (taskId: number, annotation: any) => void;
  onWorkflowComplete?: () => void;
}

export const LSAnnotationWorkflow: React.FC<LSAnnotationWorkflowProps> = ({
  projectId,
  tasks: externalTasks,
  onAnnotationComplete,
  onWorkflowComplete
}) => {
  const [tasks, setTasks] = useState<LSTask[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [annotations, setAnnotations] = useState<Record<number, any>>({});
  const [currentAnnotation, setCurrentAnnotation] = useState<any>({});
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set());
  
  const {
    loading,
    listProjectTasks,
    listTaskAnnotations,
    createAnnotation,
    updateTask
  } = useLabelStudio();
  
  const { showSuccess, showError } = useMasterToast();

  const currentTask = tasks[currentTaskIndex];
  const progress = tasks.length > 0 ? (completedTasks.size / tasks.length) * 100 : 0;

  // Load tasks
  useEffect(() => {
    if (externalTasks) {
      setTasks(externalTasks);
    } else {
      loadTasks();
    }
  }, [projectId, externalTasks]);

  // Load existing annotations for current task
  useEffect(() => {
    if (currentTask?.id) {
      loadTaskAnnotations(currentTask.id);
    }
  }, [currentTask]);

  const loadTasks = async () => {
    try {
      const data = await listProjectTasks(projectId);
      setTasks(data);
    } catch (error) {
      showError('Failed to load tasks for annotation workflow');
    }
  };

  const loadTaskAnnotations = async (taskId: number) => {
    try {
      const data = await listTaskAnnotations(taskId);
      if (data.length > 0) {
        const latestAnnotation = data[data.length - 1];
        setCurrentAnnotation(latestAnnotation.result || {});
        setCompletedTasks(prev => new Set([...prev, taskId]));
      } else {
        setCurrentAnnotation({});
      }
    } catch (error) {
      console.error('Failed to load task annotations:', error);
    }
  };

  const handleSaveAnnotation = async () => {
    if (!currentTask?.id) return;

    try {
      const annotationData = {
        task: currentTask.id,
        result: currentAnnotation,
        completed_by: 1, // User ID - in real implementation, get from auth
        was_cancelled: false
      };

      await createAnnotation(currentTask.id, annotationData);
      setCompletedTasks(prev => new Set([...prev, currentTask.id]));
      setAnnotations(prev => ({
        ...prev,
        [currentTask.id]: currentAnnotation
      }));

      onAnnotationComplete?.(currentTask.id, currentAnnotation);
      showSuccess(`Annotation saved for Task ${currentTask.id}`);

      // Auto-advance to next task
      if (currentTaskIndex < tasks.length - 1) {
        setCurrentTaskIndex(prev => prev + 1);
      } else {
        showSuccess('Workflow completed!');
        onWorkflowComplete?.();
      }
    } catch (error) {
      showError('Failed to save annotation');
    }
  };

  const handleSkipTask = () => {
    if (currentTaskIndex < tasks.length - 1) {
      setCurrentTaskIndex(prev => prev + 1);
    } else {
      onWorkflowComplete?.();
    }
  };

  const handlePreviousTask = () => {
    if (currentTaskIndex > 0) {
      setCurrentTaskIndex(prev => prev - 1);
    }
  };

  const handleAnnotationChange = (field: string, value: any) => {
    setCurrentAnnotation(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderAnnotationInterface = () => {
    if (!currentTask) return null;

    // Simple text annotation interface
    if (currentTask.data?.text) {
      return (
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Text to Annotate:</h4>
            <p className="text-sm">{currentTask.data.text}</p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="sentiment">Sentiment Classification</Label>
              <div className="mt-2 space-y-2">
                {['positive', 'negative', 'neutral'].map(sentiment => (
                  <div key={sentiment} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={sentiment}
                      name="sentiment"
                      value={sentiment}
                      checked={currentAnnotation.sentiment === sentiment}
                      onChange={(e) => handleAnnotationChange('sentiment', e.target.value)}
                      className="h-4 w-4 text-primary"
                    />
                    <Label htmlFor={sentiment} className="capitalize">{sentiment}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="confidence">Confidence Level</Label>
              <div className="mt-2 space-y-2">
                {['high', 'medium', 'low'].map(confidence => (
                  <div key={confidence} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={confidence}
                      name="confidence"
                      value={confidence}
                      checked={currentAnnotation.confidence === confidence}
                      onChange={(e) => handleAnnotationChange('confidence', e.target.value)}
                      className="h-4 w-4 text-primary"
                    />
                    <Label htmlFor={confidence} className="capitalize">{confidence}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="categories">Categories (select all that apply)</Label>
              <div className="mt-2 space-y-2">
                {['Healthcare', 'Technology', 'Business', 'Personal', 'Education'].map(category => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={category.toLowerCase()}
                      checked={currentAnnotation.categories?.includes(category) || false}
                      onCheckedChange={(checked) => {
                        const current = currentAnnotation.categories || [];
                        if (checked) {
                          handleAnnotationChange('categories', [...current, category]);
                        } else {
                          handleAnnotationChange('categories', current.filter((c: string) => c !== category));
                        }
                      }}
                    />
                    <Label htmlFor={category.toLowerCase()}>{category}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes or observations..."
                value={currentAnnotation.notes || ''}
                onChange={(e) => handleAnnotationChange('notes', e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
        </div>
      );
    }

    // Generic JSON data annotation interface
    return (
      <div className="space-y-4">
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">Task Data:</h4>
          <pre className="text-sm overflow-auto whitespace-pre-wrap">
            {JSON.stringify(currentTask.data, null, 2)}
          </pre>
        </div>

        <div>
          <Label htmlFor="annotation-json">Annotation (JSON Format)</Label>
          <Textarea
            id="annotation-json"
            placeholder="Enter your annotation in JSON format..."
            value={JSON.stringify(currentAnnotation, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                setCurrentAnnotation(parsed);
              } catch (error) {
                // Invalid JSON, don't update state
              }
            }}
            className="mt-2 font-mono"
            rows={8}
          />
        </div>
      </div>
    );
  };

  if (loading && tasks.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading annotation workflow...</span>
        </CardContent>
      </Card>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="text-muted-foreground">No tasks available for annotation</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Annotation Workflow</span>
            <Badge variant="secondary">
              {currentTaskIndex + 1} of {tasks.length}
            </Badge>
          </CardTitle>
          <CardDescription>
            Complete annotations for all tasks in the project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{completedTasks.size} of {tasks.length} completed</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Current Task */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {completedTasks.has(currentTask?.id || 0) ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
            Task {currentTask?.id}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderAnnotationInterface()}
          
          {/* Navigation Controls */}
          <div className="flex justify-between items-center pt-6 border-t mt-6">
            <Button
              variant="outline"
              onClick={handlePreviousTask}
              disabled={currentTaskIndex === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSkipTask}>
                Skip
              </Button>
              <Button onClick={handleSaveAnnotation} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save & Continue
              </Button>
            </div>

            {currentTaskIndex < tasks.length - 1 && (
              <Button
                variant="outline"
                onClick={() => setCurrentTaskIndex(prev => prev + 1)}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Task Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Task Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-8 gap-2">
            {tasks.map((task, index) => (
              <Button
                key={task.id}
                variant={index === currentTaskIndex ? 'default' : 'outline'}
                size="sm"
                className={`h-8 w-8 p-0 ${completedTasks.has(task.id) ? 'bg-green-100 border-green-300' : ''}`}
                onClick={() => setCurrentTaskIndex(index)}
              >
                {completedTasks.has(task.id) ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <span className="text-xs">{index + 1}</span>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};