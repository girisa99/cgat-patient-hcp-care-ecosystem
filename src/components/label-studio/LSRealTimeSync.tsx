import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useLabelStudio, type LSProject, type LSTask } from '@/hooks/useLabelStudio';
import { useMasterToast } from '@/hooks/useMasterToast';
import { Activity, Wifi, WifiOff, RefreshCw, Clock } from 'lucide-react';

interface LSRealTimeSyncProps {
  projectId: number;
  onTaskUpdate?: (task: LSTask) => void;
  onProjectUpdate?: (project: LSProject) => void;
  syncInterval?: number; // milliseconds
}

export const LSRealTimeSync: React.FC<LSRealTimeSyncProps> = ({
  projectId,
  onTaskUpdate,
  onProjectUpdate,
  syncInterval = 30000 // 30 seconds default
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [autoSync, setAutoSync] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncCount, setSyncCount] = useState(0);
  const [taskCache, setTaskCache] = useState<Map<number, LSTask>>(new Map());
  const [projectData, setProjectData] = useState<LSProject | null>(null);
  const [syncHistory, setSyncHistory] = useState<Array<{
    timestamp: Date;
    type: 'task_update' | 'project_update' | 'sync_start' | 'error';
    details: string;
  }>>([]);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstLoad = useRef(true);

  const {
    loading,
    getProject,
    listProjectTasks,
    getProjectStats
  } = useLabelStudio();

  const { showSuccess, showError, showInfo } = useMasterToast();

  // Initialize sync
  useEffect(() => {
    if (projectId) {
      initializeSync();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [projectId]);

  // Handle auto-sync toggle
  useEffect(() => {
    if (autoSync && projectId) {
      startRealTimeSync();
    } else {
      stopRealTimeSync();
    }

    return () => stopRealTimeSync();
  }, [autoSync, projectId, syncInterval]);

  const initializeSync = async () => {
    try {
      setIsConnected(true);
      addSyncHistory('sync_start', 'Initializing real-time sync');
      
      const [project, tasks] = await Promise.all([
        getProject(projectId),
        listProjectTasks(projectId)
      ]);

      setProjectData(project);
      
      // Build initial task cache
      const taskMap = new Map<number, LSTask>();
      tasks.forEach(task => taskMap.set(task.id, task));
      setTaskCache(taskMap);
      
      setLastSync(new Date());
      setSyncCount(1);
      
      if (isFirstLoad.current) {
        showInfo('Real-time sync initialized');
        isFirstLoad.current = false;
      }

      addSyncHistory('sync_start', `Initialized with ${tasks.length} tasks`);
    } catch (error) {
      setIsConnected(false);
      addSyncHistory('error', `Failed to initialize: ${error instanceof Error ? error.message : 'Unknown error'}`);
      showError('Failed to initialize real-time sync');
    }
  };

  const startRealTimeSync = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(async () => {
      await performSync();
    }, syncInterval);

    addSyncHistory('sync_start', `Auto-sync started (${syncInterval / 1000}s interval)`);
  };

  const stopRealTimeSync = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const performSync = async () => {
    if (!projectId || loading) return;

    try {
      const [project, tasks] = await Promise.all([
        getProject(projectId),
        listProjectTasks(projectId)
      ]);

      // Check for project updates
      if (projectData && (
        project.updated_at !== projectData.updated_at ||
        project.title !== projectData.title
      )) {
        setProjectData(project);
        onProjectUpdate?.(project);
        addSyncHistory('project_update', `Project updated: ${project.title}`);
      }

      // Check for task updates
      let updatedTasks = 0;
      const newTaskMap = new Map<number, LSTask>();
      
      tasks.forEach(task => {
        newTaskMap.set(task.id, task);
        const cachedTask = taskCache.get(task.id);
        
        if (!cachedTask) {
          // New task
          onTaskUpdate?.(task);
          addSyncHistory('task_update', `New task added: ${task.id}`);
          updatedTasks++;
        } else if (task.updated_at !== cachedTask.updated_at) {
          // Updated task
          onTaskUpdate?.(task);
          addSyncHistory('task_update', `Task updated: ${task.id}`);
          updatedTasks++;
        }
      });

      setTaskCache(newTaskMap);
      setLastSync(new Date());
      setSyncCount(prev => prev + 1);

      if (updatedTasks > 0) {
        showSuccess(`Synced ${updatedTasks} task updates`);
      }

    } catch (error) {
      addSyncHistory('error', `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Real-time sync error:', error);
    }
  };

  const addSyncHistory = (type: typeof syncHistory[0]['type'], details: string) => {
    setSyncHistory(prev => [
      { timestamp: new Date(), type, details },
      ...prev.slice(0, 9) // Keep last 10 entries
    ]);
  };

  const handleManualSync = () => {
    performSync();
  };

  const formatTime = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleTimeString();
  };

  const getStatusIcon = () => {
    if (!isConnected) return <WifiOff className="h-4 w-4 text-red-500" />;
    if (autoSync) return <Activity className="h-4 w-4 text-green-500" />;
    return <Wifi className="h-4 w-4 text-blue-500" />;
  };

  const getStatusText = () => {
    if (!isConnected) return 'Disconnected';
    if (autoSync) return 'Auto-sync Active';
    return 'Connected';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Real-Time Sync
          </CardTitle>
          <CardDescription>
            Monitor and sync Label Studio project changes in real-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Status Row */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={isConnected ? 'default' : 'destructive'}>
                    {getStatusText()}
                  </Badge>
                  {projectData && (
                    <Badge variant="secondary">
                      {projectData.title || `Project ${projectId}`}
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  Last sync: {formatTime(lastSync)} • {syncCount} syncs completed
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={autoSync}
                    onCheckedChange={setAutoSync}
                    disabled={!isConnected}
                    id="auto-sync"
                  />
                  <label htmlFor="auto-sync" className="text-sm">Auto-sync</label>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManualSync}
                  disabled={loading || !isConnected}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Sync Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-lg font-semibold">{taskCache.size}</div>
                <div className="text-xs text-muted-foreground">Tasks Tracked</div>
              </div>
              <div className="space-y-1">
                <div className="text-lg font-semibold">{syncInterval / 1000}s</div>
                <div className="text-xs text-muted-foreground">Sync Interval</div>
              </div>
              <div className="space-y-1">
                <div className="text-lg font-semibold">{syncCount}</div>
                <div className="text-xs text-muted-foreground">Total Syncs</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sync History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Sync Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {syncHistory.map((entry, index) => (
              <div key={index} className="flex items-center gap-3 text-sm">
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                  {entry.timestamp.toLocaleTimeString()}
                </div>
                <Badge
                  variant={
                    entry.type === 'error' ? 'destructive' :
                    entry.type === 'task_update' ? 'default' :
                    entry.type === 'project_update' ? 'secondary' :
                    'outline'
                  }
                  className="text-xs"
                >
                  {entry.type.replace('_', ' ')}
                </Badge>
                <div className="text-xs truncate">{entry.details}</div>
              </div>
            ))}
            
            {syncHistory.length === 0 && (
              <div className="text-center py-4 text-xs text-muted-foreground">
                No sync activity yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};