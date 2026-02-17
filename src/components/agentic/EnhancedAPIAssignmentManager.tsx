import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAgentAPIAssignments } from '@/hooks/useAgentAPIAssignments';
import { ManualConnectorDialog } from './ManualConnectorDialog';
import { 
  Plus, 
  Settings, 
  Trash2, 
  Link, 
  CheckCircle, 
  AlertCircle, 
  Zap, 
  ExternalLink,
  Filter,
  Search,
  Sparkles,
  Target,
  Workflow
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

interface EnhancedAPIAssignmentManagerProps {
  sessionId: string;
  tasks?: Array<{
    id: string;
    name: string;
    type: 'action' | 'workflow_step' | 'connector';
    description?: string;
    category?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
  }>;
}

export const EnhancedAPIAssignmentManager: React.FC<EnhancedAPIAssignmentManagerProps> = ({ 
  sessionId, 
  tasks = [] 
}) => {
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showManualConnectorDialog, setShowManualConnectorDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [selectedAPI, setSelectedAPI] = useState('');
  const [apiConfig, setAPIConfig] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAssignmentStatus, setFilterAssignmentStatus] = useState('all');
  const [autoSuggestEnabled, setAutoSuggestEnabled] = useState(true);
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);
  
  const {
    apiAssignments,
    availableAPIs,
    isLoading,
    assignAPI,
    removeAssignment,
    updateAssignment,
    getTaskAssignment,
    getAssignmentsByType,
  } = useAgentAPIAssignments(sessionId);

  // Enhanced sample tasks with more detail
  const defaultTasks = tasks.length > 0 ? tasks : [
    { 
      id: 'task-1', 
      name: 'Patient Data Processing', 
      type: 'action' as const, 
      description: 'Process and validate incoming patient data from EHR systems',
      category: 'healthcare',
      priority: 'high' as const
    },
    { 
      id: 'task-2', 
      name: 'SMS Notification Service', 
      type: 'connector' as const, 
      description: 'Send appointment reminders and alerts to patients',
      category: 'communication',
      priority: 'medium' as const
    },
    { 
      id: 'task-3', 
      name: 'Clinical Validation Workflow', 
      type: 'workflow_step' as const, 
      description: 'Multi-step validation of medical information and compliance',
      category: 'healthcare',
      priority: 'critical' as const
    },
    { 
      id: 'task-4', 
      name: 'Compliance Report Generation', 
      type: 'action' as const, 
      description: 'Generate HIPAA and FDA compliance reports',
      category: 'compliance',
      priority: 'high' as const
    },
    { 
      id: 'task-5', 
      name: 'Document Signature Workflow', 
      type: 'workflow_step' as const, 
      description: 'Electronic signature process for consent forms',
      category: 'legal',
      priority: 'medium' as const
    },
    { 
      id: 'task-6', 
      name: 'Provider Directory Sync', 
      type: 'connector' as const, 
      description: 'Synchronize provider information with external directories',
      category: 'healthcare',
      priority: 'low' as const
    }
  ];

  // Auto-suggest API assignments based on task type and category
  const autoSuggestAPI = (task: any) => {
    const suggestions = availableAPIs.filter(api => {
      const taskCategory = task.category?.toLowerCase() || '';
      const apiCategory = api.category?.toLowerCase() || '';
      const taskName = task.name.toLowerCase();
      const apiName = api.name.toLowerCase();
      
      // Category matching
      if (taskCategory && apiCategory && taskCategory === apiCategory) return true;
      
      // Keyword matching
      if (taskName.includes('sms') || taskName.includes('notification')) {
        return apiName.includes('twilio') || apiName.includes('sms');
      }
      
      if (taskName.includes('signature') || taskName.includes('document')) {
        return apiName.includes('docusign') || apiName.includes('signature');
      }
      
      if (taskName.includes('patient') || taskName.includes('clinical')) {
        return apiName.includes('patient') || apiName.includes('clinical') || apiName.includes('fhir');
      }
      
      if (taskName.includes('provider') || taskName.includes('directory')) {
        return apiName.includes('provider') || apiName.includes('npi') || apiName.includes('directory');
      }
      
      return false;
    });
    
    return suggestions[0]; // Return best suggestion
  };

  const applySuggestion = (task: any) => {
    const suggestion = autoSuggestAPI(task);
    if (suggestion) {
      assignAPI.mutate({
        agent_session_id: sessionId,
        task_id: task.id,
        task_type: task.type,
        assigned_api_service: suggestion.id,
        api_configuration: {
          auto_suggested: true,
          suggestion_score: 0.85,
          endpoint: availableAPIs.find(api => api.id === suggestion.id)?.name || 'default',
          timeout: 5000
        },
      });
    }
  };

  const handleAssignAPI = () => {
    if (!selectedTask || !selectedAPI) return;

    const mutation = getTaskAssignment(selectedTask.id, selectedTask.type) 
      ? updateAssignment 
      : assignAPI;

    const assignmentData = getTaskAssignment(selectedTask.id, selectedTask.type)
      ? {
          assignmentId: getTaskAssignment(selectedTask.id, selectedTask.type)!.id,
          updates: {
            assigned_api_service: selectedAPI,
            api_configuration: apiConfig,
          }
        }
      : {
          agent_session_id: sessionId,
          task_id: selectedTask.id,
          task_type: selectedTask.type,
          assigned_api_service: selectedAPI,
          api_configuration: apiConfig,
        };

    (mutation as any).mutate(assignmentData, {
      onSuccess: () => {
        setShowAssignDialog(false);
        setSelectedTask(null);
        setSelectedAPI('');
        setAPIConfig({});
      }
    });
  };

  // Filtered tasks based on search and filters
  const filteredTasks = useMemo(() => {
    return defaultTasks.filter(task => {
      const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
      
      const assignment = getTaskAssignment(task.id, task.type);
      const matchesStatus = filterAssignmentStatus === 'all' ||
                           (filterAssignmentStatus === 'assigned' && assignment) ||
                           (filterAssignmentStatus === 'unassigned' && !assignment);
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [defaultTasks, searchTerm, filterCategory, filterAssignmentStatus, apiAssignments]);

  const assignmentsByType = getAssignmentsByType();
  const assignmentStats = {
    total: defaultTasks.length,
    assigned: apiAssignments.length,
    unassigned: defaultTasks.length - apiAssignments.length,
    autoSuggested: apiAssignments.filter(a => a.api_configuration?.auto_suggested).length
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats and Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Enhanced API Integration Manager</h3>
          <p className="text-sm text-muted-foreground">
            Assign and manage external API connectors for agent tasks
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowManualConnectorDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Connector
          </Button>
          <Badge variant="outline" className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            {assignmentStats.assigned}/{assignmentStats.total} Assigned
          </Badge>
        </div>
      </div>

      {/* Auto-suggest Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Smart Assignment Controls
            </CardTitle>
            <Switch
              checked={autoSuggestEnabled}
              onCheckedChange={setAutoSuggestEnabled}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                filteredTasks
                  .filter(task => !getTaskAssignment(task.id, task.type))
                  .forEach(task => applySuggestion(task));
              }}
              disabled={!autoSuggestEnabled}
            >
              <Zap className="h-4 w-4 mr-2" />
              Apply All Suggestions
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toast({
                  title: "Auto-suggestions Refreshed",
                  description: "API suggestions have been updated based on current tasks."
                });
              }}
              disabled={!autoSuggestEnabled}
            >
              Refresh Suggestions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="communication">Communication</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterAssignmentStatus} onValueChange={setFilterAssignmentStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Assignment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Task List */}
      <div className="grid gap-4">
        {filteredTasks.map((task) => {
          const assignment = getTaskAssignment(task.id, task.type);
          const assignedAPI = availableAPIs.find(api => api.id === assignment?.assigned_api_service);
          const suggestion = autoSuggestEnabled ? autoSuggestAPI(task) : null;

          return (
            <Card key={task.id} className="relative overflow-hidden">
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                assignment ? 'bg-green-500' : suggestion ? 'bg-blue-500' : 'bg-gray-300'
              }`} />
              
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        assignment ? 'bg-green-500' : suggestion ? 'bg-blue-500' : 'bg-gray-300'
                      }`} />
                      <CardTitle className="text-base">{task.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {task.type.replace('_', ' ')}
                      </Badge>
                      {task.priority && (
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} 
                             title={`Priority: ${task.priority}`} />
                      )}
                      {task.category && (
                        <Badge variant="secondary" className="text-xs">
                          {task.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {assignment && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeAssignment.mutate(assignment.id)}
                        title="Remove assignment"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    {suggestion && !assignment && autoSuggestEnabled && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => applySuggestion(task)}
                        title="Apply AI suggestion"
                      >
                        <Sparkles className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTask(task);
                        setSelectedAPI(assignment?.assigned_api_service || suggestion?.id || '');
                        setAPIConfig(assignment?.api_configuration || {});
                        setShowAssignDialog(true);
                      }}
                      title={assignment ? "Configure assignment" : "Assign API"}
                    >
                      {assignment ? <Settings className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                {task.description && (
                  <CardDescription>{task.description}</CardDescription>
                )}
              </CardHeader>
              
              <CardContent className="pt-0">
                {assignment && assignedAPI && (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200 mb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Link className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-green-900">{assignedAPI.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {assignedAPI.category}
                            </Badge>
                            {assignment.api_configuration?.auto_suggested && (
                              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                AI Suggested
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-green-700 mt-1">{assignedAPI.description}</p>
                          {assignment.api_configuration?.endpoint && (
                            <div className="flex items-center gap-1 mt-1">
                              <ExternalLink className="h-3 w-3 text-green-600" />
                              <span className="text-xs text-green-600 font-mono">
                                {assignment.api_configuration.endpoint}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {suggestion && !assignment && autoSuggestEnabled && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <Sparkles className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-blue-900">AI Suggests: {suggestion.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {suggestion.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-blue-700 mt-1">{suggestion.description}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => applySuggestion(task)}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Enhanced Assignment Summary */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="by-type">By Type</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assignment Overview</CardTitle>
              <CardDescription>Current status of API assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{assignmentStats.total}</div>
                  <div className="text-sm text-muted-foreground">Total Tasks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{assignmentStats.assigned}</div>
                  <div className="text-sm text-muted-foreground">Assigned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{assignmentStats.unassigned}</div>
                  <div className="text-sm text-muted-foreground">Unassigned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{assignmentStats.autoSuggested}</div>
                  <div className="text-sm text-muted-foreground">AI Suggested</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-type">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assignments by Task Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(assignmentsByType).map(([taskType, assignments]) => (
                <div key={taskType} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Workflow className="h-4 w-4" />
                    <div>
                      <Badge variant="outline" className="capitalize">{taskType.replace('_', ' ')}</Badge>
                      <div className="text-sm text-muted-foreground mt-1">
                        {assignments.length} assignment{assignments.length !== 1 ? 's' : ''}
                      </div>
                    </div>
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
                <div className="text-center py-8">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No API assignments yet. Start by assigning APIs to your tasks above.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assignment Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Assignment Coverage</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-muted rounded-full">
                      <div 
                        className="h-2 bg-green-500 rounded-full transition-all"
                        style={{ width: `${(assignmentStats.assigned / assignmentStats.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {Math.round((assignmentStats.assigned / assignmentStats.total) * 100)}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span>AI Suggestion Accuracy</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-muted rounded-full">
                      <div 
                        className="h-2 bg-purple-500 rounded-full transition-all"
                        style={{ width: `${assignmentStats.assigned > 0 ? (assignmentStats.autoSuggested / assignmentStats.assigned) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {assignmentStats.assigned > 0 ? Math.round((assignmentStats.autoSuggested / assignmentStats.assigned) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Enhanced Assignment Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
          
          <div className="space-y-6">
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
                        {api.type === 'external' && (
                          <ExternalLink className="h-3 w-3" />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedAPI && (
              <>
                <Separator />
                
                <Tabs defaultValue="basic" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="basic">Basic Config</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
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
                      <Label htmlFor="method">HTTP Method</Label>
                      <Select 
                        value={apiConfig.method || 'POST'} 
                        onValueChange={(value) => setAPIConfig(prev => ({ ...prev, method: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                          <SelectItem value="DELETE">DELETE</SelectItem>
                          <SelectItem value="PATCH">PATCH</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>

                  <TabsContent value="advanced" className="space-y-4">
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
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="retries">Retry Attempts</Label>
                        <Input
                          id="retries"
                          type="number"
                          placeholder="3"
                          value={apiConfig.retries || ''}
                          onChange={(e) => setAPIConfig(prev => ({ ...prev, retries: parseInt(e.target.value) || 3 }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="rate_limit">Rate Limit (req/min)</Label>
                        <Input
                          id="rate_limit"
                          type="number"
                          placeholder="60"
                          value={apiConfig.rate_limit || ''}
                          onChange={(e) => setAPIConfig(prev => ({ ...prev, rate_limit: parseInt(e.target.value) || 60 }))}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="security" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Enable SSL Verification</Label>
                      <Switch
                        checked={apiConfig.ssl_verify !== false}
                        onCheckedChange={(checked) => setAPIConfig(prev => ({ ...prev, ssl_verify: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Log Requests/Responses</Label>
                      <Switch
                        checked={apiConfig.enable_logging || false}
                        onCheckedChange={(checked) => setAPIConfig(prev => ({ ...prev, enable_logging: checked }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="auth_token">Authentication Token</Label>
                      <Input
                        id="auth_token"
                        type="password"
                        placeholder="Enter API token or key"
                        value={apiConfig.auth_token || ''}
                        onChange={(e) => setAPIConfig(prev => ({ ...prev, auth_token: e.target.value }))}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssignAPI} 
              disabled={!selectedTask || !selectedAPI || assignAPI.isPending || updateAssignment.isPending}
            >
              {assignAPI.isPending || updateAssignment.isPending ? 'Saving...' : 'Save Assignment'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manual Connector Dialog */}
      <ManualConnectorDialog
        open={showManualConnectorDialog}
        onOpenChange={setShowManualConnectorDialog}
        onConnectorCreated={() => {
          // Refresh available APIs
          window.location.reload();
        }}
      />
    </div>
  );
};