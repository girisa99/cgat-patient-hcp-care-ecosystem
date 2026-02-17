import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedLSPanel, LSAnnotationWorkflow, LSRealTimeSync } from '@/components/label-studio';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Database, Workflow, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const EnhancedLabelStudioPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const handleTaskSelect = (task: any) => {
    setSelectedTask(task);
  };

  const handleAnnotationComplete = (taskId: number, annotation: any) => {
    console.log('Annotation completed:', { taskId, annotation });
  };

  const handleTaskUpdate = (task: any) => {
    console.log('Task updated:', task);
  };

  const handleProjectUpdate = (project: any) => {
    console.log('Project updated:', project);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Agent Builder
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Enhanced Label Studio</h1>
            <p className="text-muted-foreground">
              Advanced Label Studio integration and workflow management
            </p>
          </div>
        </div>
        {projectId && (
          <Badge variant="secondary">Project {projectId}</Badge>
        )}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="workflow" className="flex items-center gap-2">
            <Workflow className="h-4 w-4" />
            Annotation Workflow
          </TabsTrigger>
          <TabsTrigger value="sync" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Real-Time Sync
          </TabsTrigger>
          <TabsTrigger value="advanced">
            Advanced Features
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <EnhancedLSPanel
            projectId={projectId ? parseInt(projectId) : undefined}
            onTaskSelect={handleTaskSelect}
            onAnnotationComplete={handleAnnotationComplete}
          />
        </TabsContent>

        <TabsContent value="workflow">
          {projectId ? (
            <LSAnnotationWorkflow
              projectId={parseInt(projectId)}
              onAnnotationComplete={handleAnnotationComplete}
              onWorkflowComplete={() => {
                console.log('Annotation workflow completed');
              }}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <div className="text-muted-foreground">
                  Select a project to start the annotation workflow
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sync">
          {projectId ? (
            <LSRealTimeSync
              projectId={parseInt(projectId)}
              onTaskUpdate={handleTaskUpdate}
              onProjectUpdate={handleProjectUpdate}
              syncInterval={30000} // 30 seconds
            />
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <div className="text-muted-foreground">
                  Select a project to enable real-time sync
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="advanced">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Batch Operations</CardTitle>
                <CardDescription>
                  Perform bulk operations on tasks and annotations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Coming soon: Batch import/export, bulk annotation updates, and automated processing workflows.
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI-Assisted Labeling</CardTitle>
                <CardDescription>
                  Use AI to pre-label and suggest annotations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Coming soon: AI-powered annotation suggestions, quality scoring, and automated labeling workflows.
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quality Control</CardTitle>
                <CardDescription>
                  Monitor and ensure annotation quality
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Coming soon: Inter-annotator agreement metrics, quality dashboards, and automated quality checks.
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Integration Hub</CardTitle>
                <CardDescription>
                  Connect with external tools and services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Coming soon: Webhook integrations, API connectors, and third-party tool synchronization.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Selected Task Panel */}
      {selectedTask && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Task Details</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm overflow-auto bg-muted p-4 rounded">
              {JSON.stringify(selectedTask, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};