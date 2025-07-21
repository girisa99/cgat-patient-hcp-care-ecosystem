import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useAgentAPIAssignments } from '@/hooks/useAgentAPIAssignments';
import { Plus, Settings, Trash2, Link, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface APIAssignmentManagerProps {
  sessionId: string;
  tasks?: Array<{
    id: string;
    name: string;
    type: 'action' | 'workflow_step' | 'connector';
    description?: string;
  }>;
}

export const APIAssignmentManager: React.FC<APIAssignmentManagerProps> = ({ 
  sessionId, 
  tasks = [] 
}) => {
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [selectedAPI, setSelectedAPI] = useState('');
  const [apiConfig, setAPIConfig] = useState<Record<string, any>>({});
  
  const {
    apiAssignments,
    availableAPIs,
    isLoading,
    assignAPI,
    removeAssignment,
    getTaskAssignment,
    getAssignmentsByType,
  } = useAgentAPIAssignments(sessionId);

  const handleAssignAPI = () => {
    if (!selectedTask || !selectedAPI) return;

    assignAPI.mutate({
      agent_session_id: sessionId,
      task_id: selectedTask.id,
      task_type: selectedTask.type,
      assigned_api_service: selectedAPI,
      api_configuration: apiConfig,
    }, {
      onSuccess: () => {
        setShowAssignDialog(false);
        setSelectedTask(null);
        setSelectedAPI('');
        setAPIConfig({});
      }
    });
  };

  const assignmentsByType = getAssignmentsByType();

  // Create sample tasks if none provided
  const defaultTasks = tasks.length > 0 ? tasks : [
    { id: 'task-1', name: 'Data Processing', type: 'action' as const, description: 'Process incoming patient data' },
    { id: 'task-2', name: 'Notification Service', type: 'connector' as const, description: 'Send notifications to healthcare providers' },
    { id: 'task-3', name: 'Validation Workflow', type: 'workflow_step' as const, description: 'Validate medical information' },
    { id: 'task-4', name: 'Report Generation', type: 'action' as const, description: 'Generate compliance reports' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">API Integration Assignments</h3>
          <p className="text-sm text-muted-foreground">
            Assign external API services to specific tasks and actions
          </p>
        </div>
        <Badge variant="outline">
          {apiAssignments.length} Assignment{apiAssignments.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Task List with Assignments */}
      <div className="grid gap-4">
        {defaultTasks.map((task) => {
          const assignment = getTaskAssignment(task.id, task.type);
          const assignedAPI = availableAPIs.find(api => api.id === assignment?.assigned_api_service);

          return (
            <Card key={task.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        assignment ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                      <CardTitle className="text-base">{task.name}</CardTitle>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {task.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {assignment && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeAssignment.mutate(assignment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTask(task);
                        setSelectedAPI(assignment?.assigned_api_service || '');
                        setAPIConfig(assignment?.api_configuration || {});
                        setShowAssignDialog(true);
                      }}
                    >
                      {assignment ? <Settings className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                {task.description && (
                  <CardDescription>{task.description}</CardDescription>
                )}
              </CardHeader>
              
              {assignment && assignedAPI && (
                <CardContent className="pt-0">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Link className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-900">{assignedAPI.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {assignedAPI.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-green-700 mt-1">{assignedAPI.description}</p>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Assignment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Assignment Summary</CardTitle>
          <CardDescription>Overview of API assignments by task type</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(assignmentsByType).map(([taskType, assignments]) => (
            <div key={taskType} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{taskType.replace('_', ' ')}</Badge>
                <span className="text-sm text-muted-foreground">
                  {assignments.length} assignment{assignments.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex gap-1">
                {assignments.map((assignment, index) => (
                  <div
                    key={assignment.id}
                    className="w-2 h-2 bg-green-500 rounded-full"
                    title={`Assignment ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          ))}
          
          {Object.keys(assignmentsByType).length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No API assignments yet. Start by assigning APIs to your tasks above.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Assignment Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedTask && getTaskAssignment(selectedTask.id, selectedTask.type) 
                ? 'Update API Assignment' 
                : 'Assign API Service'
              }
            </DialogTitle>
            <DialogDescription>
              {selectedTask && `Configure API integration for "${selectedTask.name}"`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="api-service">API Service</Label>
              <Select value={selectedAPI} onValueChange={setSelectedAPI}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an API service" />
                </SelectTrigger>
                <SelectContent>
                  {availableAPIs.map((api) => (
                    <SelectItem key={api.id} value={api.id}>
                      <div className="flex items-center gap-2">
                        <span>{api.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {api.category}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedAPI && (
              <>
                <Separator />
                <div className="space-y-3">
                  <Label>API Configuration</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="endpoint">Endpoint URL</Label>
                      <Input
                        id="endpoint"
                        placeholder="https://api.example.com"
                        value={apiConfig.endpoint || ''}
                        onChange={(e) => setAPIConfig(prev => ({ ...prev, endpoint: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="timeout">Timeout (ms)</Label>
                      <Input
                        id="timeout"
                        type="number"
                        placeholder="5000"
                        value={apiConfig.timeout || ''}
                        onChange={(e) => setAPIConfig(prev => ({ ...prev, timeout: parseInt(e.target.value) || 5000 }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="headers">Custom Headers (JSON)</Label>
                    <Textarea
                      id="headers"
                      placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
                      value={apiConfig.headers ? JSON.stringify(apiConfig.headers, null, 2) : ''}
                      onChange={(e) => {
                        try {
                          const headers = JSON.parse(e.target.value || '{}');
                          setAPIConfig(prev => ({ ...prev, headers }));
                        } catch {
                          // Invalid JSON, ignore
                        }
                      }}
                      rows={3}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssignAPI} 
              disabled={!selectedTask || !selectedAPI || assignAPI.isPending}
            >
              {assignAPI.isPending ? 'Assigning...' : 'Assign API'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};