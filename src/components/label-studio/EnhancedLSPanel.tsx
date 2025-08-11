import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLabelStudio, type LSProject, type LSTask, type LSAnnotation } from '@/hooks/useLabelStudio';
import { useMasterToast } from '@/hooks/useMasterToast';
import { Loader2, Search, Download, Upload, BarChart3, RefreshCw, Eye } from 'lucide-react';

interface EnhancedLSPanelProps {
  projectId?: number;
  onTaskSelect?: (task: LSTask) => void;
  onAnnotationComplete?: (taskId: number, annotation: any) => void;
  onExportComplete?: (data: any) => void;
}

export const EnhancedLSPanel: React.FC<EnhancedLSPanelProps> = ({
  projectId,
  onTaskSelect,
  onAnnotationComplete,
  onExportComplete
}) => {
  const [selectedProject, setSelectedProject] = useState<LSProject | null>(null);
  const [projects, setProjects] = useState<LSProject[]>([]);
  const [tasks, setTasks] = useState<LSTask[]>([]);
  const [annotations, setAnnotations] = useState<LSAnnotation[]>([]);
  const [projectStats, setProjectStats] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTask, setCurrentTask] = useState<LSTask | null>(null);
  const [realTimeSync, setRealTimeSync] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  
  const {
    loading,
    listProjects,
    getProject,
    listProjectTasks,
    listTaskAnnotations,
    exportProject,
    createAnnotation,
    updateTask,
    bulkImportTasks,
    getProjectStats,
    searchTasks,
    listProjectTasksWithFilters
  } = useLabelStudio();
  
  const { showSuccess, showError } = useMasterToast();

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  // Load project data when projectId changes
  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
    }
  }, [projectId]);

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh && selectedProject?.id) {
      const interval = setInterval(() => {
        loadTasks();
        loadProjectStats();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh, selectedProject]);

  const loadProjects = async () => {
    try {
      const data = await listProjects();
      setProjects(data);
    } catch (error) {
      showError('Failed to load Label Studio projects');
    }
  };

  const loadProject = async (id: number) => {
    try {
      const project = await getProject(id);
      setSelectedProject(project);
      await loadTasks(id);
      await loadProjectStats(id);
    } catch (error) {
      showError('Failed to load project details');
    }
  };

  const loadTasks = async (projectId?: number) => {
    if (!projectId && !selectedProject?.id) return;
    
    try {
      const id = projectId || selectedProject!.id;
      let data;
      
      if (searchQuery.trim()) {
        data = await searchTasks(id, searchQuery);
      } else {
        data = await listProjectTasks(id);
      }
      
      setTasks(data);
    } catch (error) {
      showError('Failed to load tasks');
    }
  };

  const loadProjectStats = async (projectId?: number) => {
    if (!projectId && !selectedProject?.id) return;
    
    try {
      const id = projectId || selectedProject!.id;
      const stats = await getProjectStats(id);
      setProjectStats(stats);
    } catch (error) {
      console.error('Failed to load project stats:', error);
    }
  };

  const loadTaskAnnotations = async (taskId: number) => {
    try {
      const data = await listTaskAnnotations(taskId);
      setAnnotations(data);
    } catch (error) {
      showError('Failed to load annotations');
    }
  };

  const handleTaskClick = async (task: LSTask) => {
    setCurrentTask(task);
    await loadTaskAnnotations(task.id);
    onTaskSelect?.(task);
  };

  const handleExportProject = async () => {
    if (!selectedProject?.id) return;
    
    try {
      const data = await exportProject(selectedProject.id);
      onExportComplete?.(data);
      showSuccess('Project exported successfully');
      
      // Download as JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedProject.title || 'project'}_export.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      showError('Failed to export project');
    }
  };

  const handleBulkImport = async (file: File) => {
    if (!selectedProject?.id) return;
    
    try {
      const text = await file.text();
      const bulkTasks = JSON.parse(text);
      await bulkImportTasks(selectedProject.id, bulkTasks);
      showSuccess('Bulk import completed');
      await loadTasks();
    } catch (error) {
      showError('Failed to import tasks');
    }
  };

  const handleAnnotationSave = async (annotation: any) => {
    if (!currentTask?.id) return;
    
    try {
      await createAnnotation(currentTask.id, annotation);
      onAnnotationComplete?.(currentTask.id, annotation);
      showSuccess('Annotation saved');
      await loadTaskAnnotations(currentTask.id);
    } catch (error) {
      showError('Failed to save annotation');
    }
  };

  if (loading && !projects.length) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading Label Studio projects...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Enhanced Label Studio Integration
          </CardTitle>
          <CardDescription>
            Advanced Label Studio project management with real-time sync and bulk operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Project Selection */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Select
                  value={selectedProject?.id?.toString() || ''}
                  onValueChange={(value) => {
                    const project = projects.find(p => p.id.toString() === value);
                    if (project) loadProject(project.id);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a Label Studio project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.title || `Project ${project.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="sm" onClick={loadProjects} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {/* Real-time Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={autoRefresh}
                    onCheckedChange={setAutoRefresh}
                    id="auto-refresh"
                  />
                  <label htmlFor="auto-refresh" className="text-sm">Auto-refresh (30s)</label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={realTimeSync}
                    onCheckedChange={setRealTimeSync}
                    id="realtime-sync"
                  />
                  <label htmlFor="realtime-sync" className="text-sm">Real-time sync</label>
                </div>
              </div>
              {selectedProject && (
                <Badge variant="secondary">
                  {selectedProject.title || `Project ${selectedProject.id}`}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedProject && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="annotations">Annotations</TabsTrigger>
            <TabsTrigger value="export">Export & Import</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Project Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                {projectStats ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{projectStats.total_tasks}</div>
                      <div className="text-sm text-muted-foreground">Total Tasks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{projectStats.completed_tasks}</div>
                      <div className="text-sm text-muted-foreground">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{Math.round(projectStats.completion_rate)}%</div>
                      <div className="text-sm text-muted-foreground">Progress</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{projectStats.total_tasks - projectStats.completed_tasks}</div>
                      <div className="text-sm text-muted-foreground">Remaining</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <div className="text-sm text-muted-foreground">Loading statistics...</div>
                  </div>
                )}
                
                {projectStats && (
                  <div className="mt-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Completion Progress</span>
                      <span>{Math.round(projectStats.completion_rate)}%</span>
                    </div>
                    <Progress value={projectStats.completion_rate} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Tasks</span>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && loadTasks()}
                        className="pl-8 w-64"
                      />
                    </div>
                    <Button variant="outline" size="sm" onClick={() => loadTasks()}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                      onClick={() => handleTaskClick(task)}
                    >
                      <div className="flex-1">
                        <div className="font-medium">Task {task.id}</div>
                        {task.data && (
                          <div className="text-sm text-muted-foreground">
                            {JSON.stringify(task.data).substring(0, 100)}...
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={task.data ? 'default' : 'secondary'}>
                          {task.data ? 'Data Available' : 'No Data'}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {tasks.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchQuery ? 'No tasks found matching your search' : 'No tasks available'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="annotations">
            <Card>
              <CardHeader>
                <CardTitle>Task Annotations</CardTitle>
                <CardDescription>
                  {currentTask ? `Viewing annotations for Task ${currentTask.id}` : 'Select a task to view annotations'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentTask ? (
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="font-medium mb-2">Task Data:</div>
                      <pre className="text-sm overflow-auto">
                        {JSON.stringify(currentTask.data, null, 2)}
                      </pre>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="font-medium">Annotations ({annotations.length}):</div>
                      {annotations.map((annotation) => (
                        <div key={annotation.id} className="border p-3 rounded-lg">
                          <div className="text-sm text-muted-foreground mb-2">
                            Annotation {annotation.id} • Created: {annotation.created_at}
                          </div>
                          <pre className="text-sm overflow-auto">
                            {JSON.stringify(annotation.result, null, 2)}
                          </pre>
                        </div>
                      ))}
                      
                      {annotations.length === 0 && (
                        <div className="text-center py-4 text-muted-foreground">
                          No annotations available for this task
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Select a task from the Tasks tab to view its annotations
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export">
            <Card>
              <CardHeader>
                <CardTitle>Export & Import Operations</CardTitle>
                <CardDescription>
                  Bulk operations for data management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Export Options</h4>
                    <div className="flex gap-2">
                      <Button onClick={handleExportProject} disabled={loading}>
                        <Download className="h-4 w-4 mr-2" />
                        Export Project Data
                      </Button>
                      <Button variant="outline" disabled={!projectStats}>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Export Statistics
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Import Options</h4>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept=".json"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleBulkImport(file);
                        }}
                        className="hidden"
                        id="bulk-import"
                      />
                      <Button variant="outline" onClick={() => document.getElementById('bulk-import')?.click()}>
                        <Upload className="h-4 w-4 mr-2" />
                        Bulk Import Tasks
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};