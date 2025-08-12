import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useLabelStudio } from '@/hooks/useLabelStudio';
import { useMasterToast } from '@/hooks/useMasterToast';
import {
  Play,
  Pause,
  Settings,
  Zap,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Plus,
  Edit,
  Trash2,
  Activity,
  Target,
  Filter,
  Bell
} from 'lucide-react';

interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'task_created' | 'task_completed' | 'annotation_submitted' | 'quality_threshold' | 'schedule';
    conditions: any;
  };
  actions: Array<{
    type: 'assign_annotator' | 'quality_check' | 'notify' | 'export' | 'create_task' | 'update_status';
    config: any;
  }>;
  isActive: boolean;
  priority: number;
  createdAt: string;
  lastTriggered?: string;
  triggerCount: number;
}

interface LSWorkflowAutomationProps {
  projectId: number;
  onWorkflowUpdate?: (workflow: WorkflowRule) => void;
}

export const LSWorkflowAutomation: React.FC<LSWorkflowAutomationProps> = ({
  projectId,
  onWorkflowUpdate
}) => {
  const [workflows, setWorkflows] = useState<WorkflowRule[]>([
    {
      id: 'auto-assignment',
      name: 'Smart Task Assignment',
      description: 'Automatically assign new tasks based on annotator expertise and workload',
      trigger: {
        type: 'task_created',
        conditions: { projectId }
      },
      actions: [
        {
          type: 'assign_annotator',
          config: {
            strategy: 'load_balancing',
            considerExpertise: true,
            maxTasksPerAnnotator: 10
          }
        }
      ],
      isActive: true,
      priority: 1,
      createdAt: '2024-01-15',
      lastTriggered: '2024-01-23',
      triggerCount: 156
    },
    {
      id: 'quality-control',
      name: 'Quality Control Pipeline',
      description: 'Automatically review annotations and flag low-quality submissions',
      trigger: {
        type: 'annotation_submitted',
        conditions: { confidence: '<0.8' }
      },
      actions: [
        {
          type: 'quality_check',
          config: {
            reviewRequired: true,
            flagForReview: true
          }
        },
        {
          type: 'notify',
          config: {
            recipients: ['quality_team@company.com'],
            message: 'Low confidence annotation requires review'
          }
        }
      ],
      isActive: true,
      priority: 2,
      createdAt: '2024-01-12',
      lastTriggered: '2024-01-22',
      triggerCount: 23
    },
    {
      id: 'completion-export',
      name: 'Auto Export Completed Tasks',
      description: 'Export tasks to external system when project reaches completion threshold',
      trigger: {
        type: 'quality_threshold',
        conditions: { completionRate: '>80%' }
      },
      actions: [
        {
          type: 'export',
          config: {
            format: 'json',
            destination: 'api_endpoint',
            includeAnnotations: true
          }
        },
        {
          type: 'notify',
          config: {
            recipients: ['project_manager@company.com'],
            message: 'Project export completed successfully'
          }
        }
      ],
      isActive: false,
      priority: 3,
      createdAt: '2024-01-10',
      triggerCount: 5
    },
    {
      id: 'daily-backup',
      name: 'Daily Backup Workflow',
      description: 'Create daily backups of project annotations and metadata',
      trigger: {
        type: 'schedule',
        conditions: { cron: '0 2 * * *' } // Daily at 2 AM
      },
      actions: [
        {
          type: 'export',
          config: {
            format: 'json',
            destination: 'backup_storage',
            includeMetadata: true
          }
        }
      ],
      isActive: true,
      priority: 4,
      createdAt: '2024-01-08',
      lastTriggered: '2024-01-23',
      triggerCount: 15
    }
  ]);

  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowRule | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { showSuccess, showError, showInfo } = useMasterToast();

  const activeWorkflows = useMemo(() => 
    workflows.filter(w => w.isActive).length,
    [workflows]
  );

  const totalTriggers = useMemo(() => 
    workflows.reduce((sum, w) => sum + w.triggerCount, 0),
    [workflows]
  );

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'task_created': return <Plus className="h-4 w-4" />;
      case 'task_completed': return <CheckCircle className="h-4 w-4" />;
      case 'annotation_submitted': return <Target className="h-4 w-4" />;
      case 'quality_threshold': return <Filter className="h-4 w-4" />;
      case 'schedule': return <Clock className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'assign_annotator': return <Target className="h-4 w-4" />;
      case 'quality_check': return <CheckCircle className="h-4 w-4" />;
      case 'notify': return <Bell className="h-4 w-4" />;
      case 'export': return <ArrowRight className="h-4 w-4" />;
      case 'create_task': return <Plus className="h-4 w-4" />;
      case 'update_status': return <Settings className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const toggleWorkflow = (workflowId: string) => {
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId ? { ...w, isActive: !w.isActive } : w
    ));
    const workflow = workflows.find(w => w.id === workflowId);
    if (workflow) {
      showSuccess(`Workflow "${workflow.name}" ${workflow.isActive ? 'disabled' : 'enabled'}`);
    }
  };

  const deleteWorkflow = (workflowId: string) => {
    setWorkflows(prev => prev.filter(w => w.id !== workflowId));
    showSuccess('Workflow deleted successfully');
  };

  const executeWorkflow = (workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (workflow) {
      // Simulate workflow execution
      setWorkflows(prev => prev.map(w => 
        w.id === workflowId 
          ? { ...w, lastTriggered: new Date().toISOString(), triggerCount: w.triggerCount + 1 }
          : w
      ));
      showSuccess(`Workflow "${workflow.name}" executed successfully`);
    }
  };

  const createWorkflow = () => {
    const newWorkflow: WorkflowRule = {
      id: `workflow-${Date.now()}`,
      name: 'New Workflow',
      description: 'Custom workflow description',
      trigger: {
        type: 'task_created',
        conditions: {}
      },
      actions: [],
      isActive: false,
      priority: workflows.length + 1,
      createdAt: new Date().toISOString(),
      triggerCount: 0
    };
    
    setWorkflows(prev => [...prev, newWorkflow]);
    setSelectedWorkflow(newWorkflow);
    setIsCreating(false);
    setIsEditing(true);
    showSuccess('New workflow created');
  };

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workflow Automation</h2>
          <p className="text-muted-foreground">
            Automate your Label Studio workflows with custom rules and triggers
          </p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Workflow
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Automation Workflow</DialogTitle>
              <DialogDescription>
                Set up automated actions based on project events
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="workflow-name">Workflow Name</Label>
                <Input id="workflow-name" placeholder="My Automation Workflow" />
              </div>
              <div>
                <Label htmlFor="trigger-type">Trigger Event</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select trigger event" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="task_created">Task Created</SelectItem>
                    <SelectItem value="task_completed">Task Completed</SelectItem>
                    <SelectItem value="annotation_submitted">Annotation Submitted</SelectItem>
                    <SelectItem value="quality_threshold">Quality Threshold</SelectItem>
                    <SelectItem value="schedule">Schedule</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="action-type">Action to Perform</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assign_annotator">Assign Annotator</SelectItem>
                    <SelectItem value="quality_check">Quality Check</SelectItem>
                    <SelectItem value="notify">Send Notification</SelectItem>
                    <SelectItem value="export">Export Data</SelectItem>
                    <SelectItem value="create_task">Create Task</SelectItem>
                    <SelectItem value="update_status">Update Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button onClick={createWorkflow}>
                Create Workflow
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Workflows</p>
                <p className="text-2xl font-bold">{workflows.length}</p>
              </div>
              <Settings className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Workflows</p>
                <p className="text-2xl font-bold text-green-600">{activeWorkflows}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Triggers</p>
                <p className="text-2xl font-bold">{totalTriggers}</p>
              </div>
              <Zap className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">98.5%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflows List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Automation Rules</h3>
        {workflows.map((workflow) => (
          <Card key={workflow.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Switch 
                    checked={workflow.isActive}
                    onCheckedChange={() => toggleWorkflow(workflow.id)}
                  />
                  <div>
                    <CardTitle className="text-lg">{workflow.name}</CardTitle>
                    <CardDescription>{workflow.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={workflow.isActive ? 'default' : 'secondary'}>
                    {workflow.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => executeWorkflow(workflow.id)}>
                    <Play className="h-3 w-3 mr-1" />
                    Test
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Trigger Information */}
                <div className="flex items-center gap-2 text-sm">
                  {getTriggerIcon(workflow.trigger.type)}
                  <span className="font-medium">Trigger:</span>
                  <span className="capitalize">{workflow.trigger.type.replace('_', ' ')}</span>
                </div>

                {/* Actions */}
                <div>
                  <p className="text-sm font-medium mb-2">Actions:</p>
                  <div className="flex flex-wrap gap-2">
                    {workflow.actions.map((action, index) => (
                      <div key={index} className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-xs">
                        {getActionIcon(action.type)}
                        <span className="capitalize">{action.type.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Statistics */}
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>Triggered {workflow.triggerCount} times</span>
                  <span>Last: {formatTimeAgo(workflow.lastTriggered)}</span>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => {
                      setSelectedWorkflow(workflow);
                      setIsEditing(true);
                    }}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => deleteWorkflow(workflow.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {workflows.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">No workflows configured</p>
            <p className="text-muted-foreground mb-4">
              Create your first automation workflow to streamline your labeling process
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Workflow
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Workflow Dialog */}
      {selectedWorkflow && (
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Workflow: {selectedWorkflow.name}</DialogTitle>
              <DialogDescription>
                Configure automation rules and actions
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="general">
              <TabsList>
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="trigger">Trigger</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Workflow Name</Label>
                  <Input id="edit-name" defaultValue={selectedWorkflow.name} />
                </div>
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Input id="edit-description" defaultValue={selectedWorkflow.description} />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch defaultChecked={selectedWorkflow.isActive} />
                  <Label>Enable this workflow</Label>
                </div>
              </TabsContent>
              
              <TabsContent value="trigger" className="space-y-4">
                <div>
                  <Label>Trigger Type</Label>
                  <Select defaultValue={selectedWorkflow.trigger.type}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="task_created">Task Created</SelectItem>
                      <SelectItem value="task_completed">Task Completed</SelectItem>
                      <SelectItem value="annotation_submitted">Annotation Submitted</SelectItem>
                      <SelectItem value="quality_threshold">Quality Threshold</SelectItem>
                      <SelectItem value="schedule">Schedule</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Conditions (JSON)</Label>
                  <textarea 
                    className="w-full p-2 border rounded h-32 font-mono text-sm"
                    defaultValue={JSON.stringify(selectedWorkflow.trigger.conditions, null, 2)}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="actions" className="space-y-4">
                <div>
                  <Label className="mb-2 block">Workflow Actions</Label>
                  {selectedWorkflow.actions.map((action, index) => (
                    <div key={index} className="border rounded p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getActionIcon(action.type)}
                          <span className="font-medium capitalize">{action.type.replace('_', ' ')}</span>
                        </div>
                        <Button size="sm" variant="ghost" className="text-red-600">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <textarea 
                        className="w-full p-2 border rounded text-sm font-mono h-20"
                        defaultValue={JSON.stringify(action.config, null, 2)}
                      />
                    </div>
                  ))}
                  <Button size="sm" variant="outline" className="w-full">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Action
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                setIsEditing(false);
                showSuccess('Workflow updated successfully');
              }}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};