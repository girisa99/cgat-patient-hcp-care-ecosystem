import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, X, Save, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface ActionTemplateCreatorProps {
  onSave: (template: any) => void;
  onCancel: () => void;
  categories: string[];
  types: string[];
  taskTypes: string[];
  onAddCategory: (category: string) => void;
  onAddType: (type: string) => void;
  onAddTaskType: (taskType: string) => void;
}

export const ActionTemplateCreator: React.FC<ActionTemplateCreatorProps> = ({
  onSave,
  onCancel,
  categories,
  types,
  taskTypes,
  onAddCategory,
  onAddType,
  onAddTaskType
}) => {
  const [templateData, setTemplateData] = useState({
    name: '',
    description: '',
    category: '',
    type: '',
    priority: 'medium',
    estimated_duration: 5,
    requires_approval: false
  });

  const [tasks, setTasks] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [newType, setNewType] = useState('');
  const [newTaskType, setNewTaskType] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddType, setShowAddType] = useState(false);
  const [showAddTaskType, setShowAddTaskType] = useState(false);

  const addTask = (taskType: string = 'action') => {
    const newTask = {
      id: `temp-${Date.now()}`,
      task_name: 'New Task',
      task_description: '',
      task_order: tasks.length + 1,
      task_type: taskType,
      required_inputs: [],
      expected_outputs: [],
      validation_rules: {},
      timeout_minutes: 30,
      retry_attempts: 3,
      is_critical: false
    };
    
    setTasks([...tasks, newTask]);
    toast.success(`New ${taskType} task added`);
  };

  const updateTask = (taskId: string, updates: any) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const removeTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleSave = () => {
    if (!templateData.name.trim()) {
      toast.error('Template name is required');
      return;
    }

    if (!templateData.category) {
      toast.error('Please select a category');
      return;
    }

    if (!templateData.type) {
      toast.error('Please select a template type');
      return;
    }

    const template = {
      ...templateData,
      tasks,
      template_config: {
        auto_generated: false,
        custom_fields: {}
      }
    };

    onSave(template);
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      onAddCategory(newCategory.trim());
      setNewCategory('');
      setShowAddCategory(false);
      setTemplateData(prev => ({ ...prev, category: newCategory.trim() }));
    }
  };

  const handleAddType = () => {
    if (newType.trim()) {
      onAddType(newType.trim());
      setNewType('');
      setShowAddType(false);
      setTemplateData(prev => ({ ...prev, type: newType.trim() }));
    }
  };

  const handleAddTaskType = () => {
    if (newTaskType.trim()) {
      onAddTaskType(newTaskType.trim());
      setNewTaskType('');
      setShowAddTaskType(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Create Action Template</h3>
          <p className="text-sm text-muted-foreground">
            Design a new action template with custom categories and types
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Template Configuration</CardTitle>
            <CardDescription>
              Configure the basic properties of your action template
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="template-name">Template Name *</Label>
              <Input
                id="template-name"
                value={templateData.name}
                onChange={(e) => setTemplateData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Patient Follow-up Workflow"
              />
            </div>

            <div>
              <Label htmlFor="template-description">Description</Label>
              <Textarea
                id="template-description"
                value={templateData.description}
                onChange={(e) => setTemplateData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this template does..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category *</Label>
                <div className="flex gap-2">
                  <Select 
                    value={templateData.category} 
                    onValueChange={(value) => setTemplateData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Category</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Category Name</Label>
                          <Input
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="e.g., patient_care"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleAddCategory}>Add Category</Button>
                          <Button variant="outline" onClick={() => setShowAddCategory(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div>
                <Label>Type *</Label>
                <div className="flex gap-2">
                  <Select 
                    value={templateData.type} 
                    onValueChange={(value) => setTemplateData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {types.map(type => (
                        <SelectItem key={type} value={type}>
                          {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Dialog open={showAddType} onOpenChange={setShowAddType}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Template Type</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Type Name</Label>
                          <Input
                            value={newType}
                            onChange={(e) => setNewType(e.target.value)}
                            placeholder="e.g., automated_workflow"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleAddType}>Add Type</Button>
                          <Button variant="outline" onClick={() => setShowAddType(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Priority</Label>
                <Select 
                  value={templateData.priority} 
                  onValueChange={(value) => setTemplateData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Estimated Duration (minutes)</Label>
                <Input
                  type="number"
                  value={templateData.estimated_duration}
                  onChange={(e) => setTemplateData(prev => ({ ...prev, estimated_duration: parseInt(e.target.value) || 5 }))}
                  min={1}
                  max={1440}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="requires-approval"
                checked={templateData.requires_approval}
                onCheckedChange={(checked) => setTemplateData(prev => ({ ...prev, requires_approval: checked }))}
              />
              <Label htmlFor="requires-approval">Requires Approval</Label>
            </div>
          </CardContent>
        </Card>

        {/* Task Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Template Tasks
              <div className="flex gap-2">
                <Dialog open={showAddTaskType} onOpenChange={setShowAddTaskType}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Task Type
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Task Type</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Task Type Name</Label>
                        <Input
                          value={newTaskType}
                          onChange={(e) => setNewTaskType(e.target.value)}
                          placeholder="e.g., data_validation"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleAddTaskType}>Add Task Type</Button>
                        <Button variant="outline" onClick={() => setShowAddTaskType(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Select onValueChange={(value) => addTask(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Add Task" />
                  </SelectTrigger>
                  <SelectContent>
                    {taskTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardTitle>
            <CardDescription>
              Define the tasks that will be part of this template
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No tasks added yet</p>
                <p className="text-sm">Use the dropdown above to add tasks</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {tasks.map((task, index) => (
                  <div key={task.id} className="border rounded-lg p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{task.task_type}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTask(task.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div>
                      <Input
                        value={task.task_name}
                        onChange={(e) => updateTask(task.id, { task_name: e.target.value })}
                        placeholder="Task name"
                        className="font-medium"
                      />
                    </div>
                    
                    <div>
                      <Textarea
                        value={task.task_description}
                        onChange={(e) => updateTask(task.id, { task_description: e.target.value })}
                        placeholder="Task description..."
                        rows={2}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Timeout (min)</Label>
                        <Input
                          type="number"
                          value={task.timeout_minutes}
                          onChange={(e) => updateTask(task.id, { timeout_minutes: parseInt(e.target.value) || 30 })}
                          min={1}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Retry Attempts</Label>
                        <Input
                          type="number"
                          value={task.retry_attempts}
                          onChange={(e) => updateTask(task.id, { retry_attempts: parseInt(e.target.value) || 3 })}
                          min={0}
                          max={10}
                          className="h-8"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={task.is_critical}
                        onCheckedChange={(checked) => updateTask(task.id, { is_critical: checked })}
                      />
                      <Label className="text-xs">Critical Task</Label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};