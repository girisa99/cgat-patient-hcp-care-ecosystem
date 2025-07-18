import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, X, Bot, Zap, MessageSquare, Search, FileText, 
  Database, Settings, AlertCircle, CheckCircle, Brain,
  Sparkles, Target, Clock, Users, RefreshCw, Upload, Download,
  Edit, Trash2, Save, Copy
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ActionTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  type: string;
  priority: string;
  estimated_duration: number;
  requires_approval: boolean;
  template_config: any;
  is_system_template: boolean;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  tasks?: ActionTemplateTask[];
}

interface ActionTemplateTask {
  id: string;
  template_id: string;
  task_name: string;
  task_description?: string;
  task_order: number;
  task_type: string;
  required_inputs: any[];
  expected_outputs: any[];
  validation_rules: any;
  timeout_minutes: number;
  retry_attempts: number;
  is_critical: boolean;
}

interface AIModel {
  id: string;
  name: string;
  provider: string;
  model_type: string;
  capabilities: any;
  model_config: any;
}

interface MCPServer {
  id: string;
  server_id: string;
  name: string;
  type: string;
  capabilities: any;
  description: string;
  reliability_score: number;
}

interface ActionTemplateManagerProps {
  agentType?: string;
  agentPurpose?: string;
  categories?: string[];
  businessUnits?: string[];
  onTemplateSelect?: (template: ActionTemplate) => void;
}

export const ActionTemplateManager: React.FC<ActionTemplateManagerProps> = ({
  agentType,
  agentPurpose,
  categories,
  businessUnits,
  onTemplateSelect
}) => {
  const [templates, setTemplates] = useState<ActionTemplate[]>([]);
  const [aiModels, setAIModels] = useState<AIModel[]>([]);
  const [mcpServers, setMCPServers] = useState<MCPServer[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ActionTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editForm, setEditForm] = useState<Partial<ActionTemplate>>({});
  const [tasks, setTasks] = useState<ActionTemplateTask[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [customTypes, setCustomTypes] = useState<string[]>([]);
  const [customTaskTypes, setCustomTaskTypes] = useState<string[]>([]);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [newTypeInput, setNewTypeInput] = useState('');
  const [newTaskTypeInput, setNewTaskTypeInput] = useState('');

  // Load data from database
  useEffect(() => {
    loadTemplates();
    loadAIModels();
    loadMCPServers();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('action_templates')
        .select(`
          *,
          tasks:action_template_tasks(*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map(template => ({
        ...template,
        template_config: template.template_config || {},
        tasks: (template.tasks || []).map((task: any) => ({
          ...task,
          required_inputs: Array.isArray(task.required_inputs) ? task.required_inputs : [],
          expected_outputs: Array.isArray(task.expected_outputs) ? task.expected_outputs : [],
          validation_rules: task.validation_rules || {}
        }))
      }));
      
      setTemplates(transformedData);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load action templates');
    }
  };

  const loadAIModels = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_model_integrations')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      setAIModels(data || []);
    } catch (error) {
      console.error('Error loading AI models:', error);
    }
  };

  const loadMCPServers = async () => {
    try {
      const { data, error } = await supabase
        .from('mcp_servers')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      setMCPServers(data || []);
    } catch (error) {
      console.error('Error loading MCP servers:', error);
    }
  };

  const generateAITemplates = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-action-templates', {
        body: {
          agentType,
          agentPurpose,
          categories,
          businessUnits,
          count: 5,
          context: 'healthcare'
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (!data || !data.templates) {
        throw new Error('No templates received from AI generator');
      }

      const generatedTemplates = data.templates;

      // Save templates to database
      for (const template of generatedTemplates) {
        const { data: savedTemplate, error: saveError } = await supabase
          .from('action_templates')
          .insert({
            name: template.name,
            description: template.description,
            category: template.category,
            type: template.type,
            priority: template.priority,
            estimated_duration: template.estimated_duration,
            requires_approval: template.requires_approval,
            template_config: template.template_config,
            is_system_template: false,
            is_active: true
          })
          .select()
          .single();

        if (saveError) {
          console.error('Error saving template:', saveError);
          continue;
        }

        // Save tasks for this template
        if (template.tasks && savedTemplate) {
          const tasksToInsert = template.tasks.map((task: any) => ({
            template_id: savedTemplate.id,
            task_name: task.task_name,
            task_description: task.task_description,
            task_order: task.task_order,
            task_type: task.task_type,
            required_inputs: task.required_inputs || [],
            expected_outputs: task.expected_outputs || [],
            validation_rules: task.validation_rules || {},
            timeout_minutes: task.timeout_minutes || 30,
            retry_attempts: task.retry_attempts || 3,
            is_critical: task.is_critical || false
          }));

          await supabase
            .from('action_template_tasks')
            .insert(tasksToInsert);
        }
      }

      await loadTemplates();
      toast.success(`Generated ${generatedTemplates.length} new action templates using AI`);
    } catch (error) {
      console.error('Error generating templates:', error);
      toast.error('Failed to generate action templates');
    } finally {
      setIsGenerating(false);
    }
  };

  const createTemplate = async () => {
    if (!editForm.name) {
      toast.error('Template name is required');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('action_templates')
        .insert({
          name: editForm.name,
          description: editForm.description || '',
          category: editForm.category || 'custom',
          type: editForm.type || 'on_demand',
          priority: editForm.priority || 'medium',
          estimated_duration: editForm.estimated_duration || 5,
          requires_approval: editForm.requires_approval || false,
          template_config: editForm.template_config || {},
          is_system_template: false,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      // Save tasks if any
      if (tasks.length > 0) {
        const tasksToInsert = tasks.map(task => ({
          template_id: data.id,
          task_name: task.task_name,
          task_description: task.task_description,
          task_order: task.task_order,
          task_type: task.task_type,
          required_inputs: task.required_inputs,
          expected_outputs: task.expected_outputs,
          validation_rules: task.validation_rules,
          timeout_minutes: task.timeout_minutes,
          retry_attempts: task.retry_attempts,
          is_critical: task.is_critical
        }));

        await supabase
          .from('action_template_tasks')
          .insert(tasksToInsert);
      }

      await loadTemplates();
      setIsCreating(false);
      setEditForm({});
      setTasks([]);
      toast.success('Action template created successfully');
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create action template');
    }
  };

  const updateTemplate = async () => {
    if (!selectedTemplate || !editForm.name) return;

    try {
      const { error } = await supabase
        .from('action_templates')
        .update({
          name: editForm.name,
          description: editForm.description,
          category: editForm.category,
          type: editForm.type,
          priority: editForm.priority,
          estimated_duration: editForm.estimated_duration,
          requires_approval: editForm.requires_approval,
          template_config: editForm.template_config
        })
        .eq('id', selectedTemplate.id);

      if (error) throw error;

      // Update tasks if needed
      if (tasks.length > 0) {
        // Delete existing tasks and recreate
        await supabase
          .from('action_template_tasks')
          .delete()
          .eq('template_id', selectedTemplate.id);

        const tasksToInsert = tasks.map(task => ({
          template_id: selectedTemplate.id,
          task_name: task.task_name,
          task_description: task.task_description,
          task_order: task.task_order,
          task_type: task.task_type,
          required_inputs: task.required_inputs,
          expected_outputs: task.expected_outputs,
          validation_rules: task.validation_rules,
          timeout_minutes: task.timeout_minutes,
          retry_attempts: task.retry_attempts,
          is_critical: task.is_critical
        }));

        await supabase
          .from('action_template_tasks')
          .insert(tasksToInsert);
      }

      await loadTemplates();
      setIsEditing(false);
      toast.success('Template updated successfully');
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error('Failed to update template');
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('action_templates')
        .update({ is_active: false })
        .eq('id', templateId);

      if (error) throw error;

      await loadTemplates();
      if (selectedTemplate?.id === templateId) {
        setSelectedTemplate(null);
      }
      toast.success('Template deleted successfully');
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const duplicateTemplate = async (template: ActionTemplate) => {
    try {
      const { data, error } = await supabase
        .from('action_templates')
        .insert({
          name: `${template.name} (Copy)`,
          description: template.description,
          category: template.category,
          type: template.type,
          priority: template.priority,
          estimated_duration: template.estimated_duration,
          requires_approval: template.requires_approval,
          template_config: template.template_config,
          is_system_template: false,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      // Duplicate tasks
      if (template.tasks && template.tasks.length > 0) {
        const tasksToInsert = template.tasks.map(task => ({
          template_id: data.id,
          task_name: task.task_name,
          task_description: task.task_description,
          task_order: task.task_order,
          task_type: task.task_type,
          required_inputs: task.required_inputs,
          expected_outputs: task.expected_outputs,
          validation_rules: task.validation_rules,
          timeout_minutes: task.timeout_minutes,
          retry_attempts: task.retry_attempts,
          is_critical: task.is_critical
        }));

        await supabase
          .from('action_template_tasks')
          .insert(tasksToInsert);
      }

      await loadTemplates();
      toast.success('Template duplicated successfully');
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast.error('Failed to duplicate template');
    }
  };

  const addTask = () => {
    const newTask: ActionTemplateTask = {
      id: `temp-${Date.now()}`,
      template_id: selectedTemplate?.id || '',
      task_name: 'New Task',
      task_description: '',
      task_order: tasks.length + 1,
      task_type: 'action',
      required_inputs: [],
      expected_outputs: [],
      validation_rules: {},
      timeout_minutes: 30,
      retry_attempts: 3,
      is_critical: false
    };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (taskId: string, updates: Partial<ActionTemplateTask>) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const removeTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'communication': return <MessageSquare className="h-4 w-4" />;
      case 'data_processing': return <Database className="h-4 w-4" />;
      case 'analysis': return <Brain className="h-4 w-4" />;
      case 'integration': return <Zap className="h-4 w-4" />;
      case 'automation': return <Settings className="h-4 w-4" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Action Template Manager</h3>
          <p className="text-sm text-muted-foreground">
            Create, manage, and deploy intelligent action templates
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={generateAITemplates}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            AI Generate
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadTemplates}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Action Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    placeholder="Enter template name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="template-description">Description</Label>
                  <Textarea
                    id="template-description"
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    placeholder="Enter template description"
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="template-category">Category</Label>
                    <Select 
                      value={editForm.category || ''} 
                      onValueChange={(value) => setEditForm({...editForm, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="communication">Communication</SelectItem>
                        <SelectItem value="data_processing">Data Processing</SelectItem>
                        <SelectItem value="analysis">Analysis</SelectItem>
                        <SelectItem value="integration">Integration</SelectItem>
                        <SelectItem value="automation">Automation</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                        {customCategories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2 mt-2">
                      <Input
                        placeholder="Add new category"
                        value={newCategoryInput}
                        onChange={(e) => setNewCategoryInput(e.target.value)}
                        className="h-8"
                      />
                      <Button 
                        type="button"
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          if (newCategoryInput.trim() && !customCategories.includes(newCategoryInput.trim())) {
                            setCustomCategories([...customCategories, newCategoryInput.trim()]);
                            setEditForm({...editForm, category: newCategoryInput.trim()});
                            setNewCategoryInput('');
                          }
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="template-type">Type</Label>
                    <Select 
                      value={editForm.type || ''} 
                      onValueChange={(value) => setEditForm({...editForm, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trigger">Trigger</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="on_demand">On Demand</SelectItem>
                        {customTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2 mt-2">
                      <Input
                        placeholder="Add new type"
                        value={newTypeInput}
                        onChange={(e) => setNewTypeInput(e.target.value)}
                        className="h-8"
                      />
                      <Button 
                        type="button"
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          if (newTypeInput.trim() && !customTypes.includes(newTypeInput.trim())) {
                            setCustomTypes([...customTypes, newTypeInput.trim()]);
                            setEditForm({...editForm, type: newTypeInput.trim()});
                            setNewTypeInput('');
                          }
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="template-priority">Priority</Label>
                    <Select 
                      value={editForm.priority || ''} 
                      onValueChange={(value) => setEditForm({...editForm, priority: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
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
                    <Label htmlFor="template-duration">Duration (minutes)</Label>
                    <Input
                      id="template-duration"
                      type="number"
                      min="1"
                      max="180"
                      value={editForm.estimated_duration || 5}
                      onChange={(e) => setEditForm({...editForm, estimated_duration: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="requires-approval"
                    checked={editForm.requires_approval || false}
                    onCheckedChange={(checked) => setEditForm({...editForm, requires_approval: checked})}
                  />
                  <Label htmlFor="requires-approval">Requires Approval</Label>
                </div>

                {/* AI Model Selection */}
                <div>
                  <Label>Recommended AI Model</Label>
                  <Select 
                    value={editForm.template_config?.recommended_ai_model_id || ''} 
                    onValueChange={(value) => setEditForm({
                      ...editForm, 
                      template_config: {
                        ...editForm.template_config,
                        recommended_ai_model_id: value
                      }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select AI model" />
                    </SelectTrigger>
                    <SelectContent>
                      {aiModels.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex flex-col">
                            <span>{model.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {model.provider} • {model.model_type}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* MCP Server Selection */}
                <div>
                  <Label>Recommended MCP Server</Label>
                  <Select 
                    value={editForm.template_config?.recommended_mcp_server_id || ''} 
                    onValueChange={(value) => setEditForm({
                      ...editForm, 
                      template_config: {
                        ...editForm.template_config,
                        recommended_mcp_server_id: value
                      }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select MCP server" />
                    </SelectTrigger>
                    <SelectContent>
                      {mcpServers.map((server) => (
                        <SelectItem key={server.id} value={server.server_id}>
                          <div className="flex flex-col">
                            <span>{server.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {server.type} • Score: {server.reliability_score}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tasks Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Tasks</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addTask}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task
                    </Button>
                  </div>
                  
                  {tasks.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                      <p className="text-muted-foreground">No tasks added yet</p>
                      <p className="text-sm text-muted-foreground">Add tasks to define the workflow</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tasks.map((task) => (
                        <Card key={task.id} className="p-4">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">Task {task.task_order}</Badge>
                                <span className="text-sm font-medium">
                                  {task.task_name}
                                </span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeTask(task.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Task Name</Label>
                                <Input
                                  value={task.task_name}
                                  onChange={(e) => updateTask(task.id, { task_name: e.target.value })}
                                  placeholder="Enter task name"
                                />
                              </div>
                              
                              <div>
                                <Label>Task Type</Label>
                                <Select 
                                  value={task.task_type} 
                                  onValueChange={(value) => updateTask(task.id, { task_type: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="action">Action</SelectItem>
                                    <SelectItem value="validation">Validation</SelectItem>
                                    <SelectItem value="analysis">Analysis</SelectItem>
                                    <SelectItem value="notification">Notification</SelectItem>
                                    {customTaskTypes.map(type => (
                                      <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <div className="flex gap-2 mt-2">
                                  <Input
                                    placeholder="Add task type"
                                    value={newTaskTypeInput}
                                    onChange={(e) => setNewTaskTypeInput(e.target.value)}
                                    className="h-8"
                                  />
                                  <Button 
                                    type="button"
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      if (newTaskTypeInput.trim() && !customTaskTypes.includes(newTaskTypeInput.trim())) {
                                        setCustomTaskTypes([...customTaskTypes, newTaskTypeInput.trim()]);
                                        updateTask(task.id, { task_type: newTaskTypeInput.trim() });
                                        setNewTaskTypeInput('');
                                      }
                                    }}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <Label>Task Description</Label>
                              <Textarea
                                value={task.task_description || ''}
                                onChange={(e) => updateTask(task.id, { task_description: e.target.value })}
                                placeholder="Describe what this task does"
                                className="min-h-[80px]"
                              />
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <Label>Timeout (min)</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  max="60"
                                  value={task.timeout_minutes}
                                  onChange={(e) => updateTask(task.id, { timeout_minutes: parseInt(e.target.value) })}
                                />
                              </div>
                              
                              <div>
                                <Label>Retry Attempts</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="5"
                                  value={task.retry_attempts}
                                  onChange={(e) => updateTask(task.id, { retry_attempts: parseInt(e.target.value) })}
                                />
                              </div>
                              
                              <div className="flex items-center space-x-2 pt-6">
                                <Switch
                                  checked={task.is_critical}
                                  onCheckedChange={(checked) => updateTask(task.id, { is_critical: checked })}
                                />
                                <Label>Critical</Label>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => {
                    setIsCreating(false);
                    setEditForm({});
                    setTasks([]);
                  }}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={createTemplate}>
                    <Save className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow" 
                onClick={() => {
                  setSelectedTemplate(template);
                  setTasks(template.tasks || []);
                }}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(template.category)}
                  <h4 className="font-medium">{template.name}</h4>
                </div>
                <div className="flex gap-1">
                  <Badge variant={getPriorityColor(template.priority) as any}>
                    {template.priority}
                  </Badge>
                  {template.template_config?.generated_by === 'ai' && (
                    <Badge variant="secondary">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI
                    </Badge>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">
                {template.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    ~{template.estimated_duration}min
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {template.tasks?.length || 0} tasks
                  </span>
                </div>
                
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTemplate(template);
                      setEditForm(template);
                      setTasks(template.tasks || []);
                      setIsEditing(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateTemplate(template);
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTemplateSelect?.(template);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTemplate(template.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Template Edit Dialog */}
      {selectedTemplate && (
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Edit Template: {selectedTemplate.name}
                {selectedTemplate.template_config?.generated_by === 'ai' && (
                  <Badge variant="secondary">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI Generated
                  </Badge>
                )}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-template-name">Template Name</Label>
                <Input
                  id="edit-template-name"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  placeholder="Enter template name"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-template-description">Description</Label>
                <Textarea
                  id="edit-template-description"
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  placeholder="Enter template description"
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select 
                    value={editForm.category || ''} 
                    onValueChange={(value) => setEditForm({...editForm, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="communication">Communication</SelectItem>
                      <SelectItem value="data_processing">Data Processing</SelectItem>
                      <SelectItem value="analysis">Analysis</SelectItem>
                      <SelectItem value="integration">Integration</SelectItem>
                      <SelectItem value="automation">Automation</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Type</Label>
                  <Select 
                    value={editForm.type || ''} 
                    onValueChange={(value) => setEditForm({...editForm, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trigger">Trigger</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="on_demand">On Demand</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Priority</Label>
                  <Select 
                    value={editForm.priority || ''} 
                    onValueChange={(value) => setEditForm({...editForm, priority: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
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
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="180"
                    value={editForm.estimated_duration || 5}
                    onChange={(e) => setEditForm({...editForm, estimated_duration: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={editForm.requires_approval || false}
                  onCheckedChange={(checked) => setEditForm({...editForm, requires_approval: checked})}
                />
                <Label>Requires Approval</Label>
              </div>

              {/* Tasks Section for Editing */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Tasks</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addTask}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </div>
                
                {tasks.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                    <p className="text-muted-foreground">No tasks added yet</p>
                    <p className="text-sm text-muted-foreground">Add tasks to define the workflow</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <Card key={task.id} className="p-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">Task {task.task_order}</Badge>
                              <span className="text-sm font-medium">
                                {task.task_name}
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTask(task.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Task Name</Label>
                              <Input
                                value={task.task_name}
                                onChange={(e) => updateTask(task.id, { task_name: e.target.value })}
                                placeholder="Enter task name"
                              />
                            </div>
                            
                            <div>
                              <Label>Task Type</Label>
                              <Select 
                                value={task.task_type} 
                                onValueChange={(value) => updateTask(task.id, { task_type: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="action">Action</SelectItem>
                                  <SelectItem value="validation">Validation</SelectItem>
                                  <SelectItem value="analysis">Analysis</SelectItem>
                                  <SelectItem value="notification">Notification</SelectItem>
                                  {customTaskTypes.map(type => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <div className="flex gap-2 mt-2">
                                <Input
                                  placeholder="Add task type"
                                  value={newTaskTypeInput}
                                  onChange={(e) => setNewTaskTypeInput(e.target.value)}
                                  className="h-8"
                                />
                                <Button 
                                  type="button"
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    if (newTaskTypeInput.trim() && !customTaskTypes.includes(newTaskTypeInput.trim())) {
                                      setCustomTaskTypes([...customTaskTypes, newTaskTypeInput.trim()]);
                                      updateTask(task.id, { task_type: newTaskTypeInput.trim() });
                                      setNewTaskTypeInput('');
                                    }
                                  }}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <Label>Task Description</Label>
                            <Textarea
                              value={task.task_description || ''}
                              onChange={(e) => updateTask(task.id, { task_description: e.target.value })}
                              placeholder="Describe what this task does"
                              className="min-h-[80px]"
                            />
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label>Timeout (min)</Label>
                              <Input
                                type="number"
                                min="1"
                                max="60"
                                value={task.timeout_minutes}
                                onChange={(e) => updateTask(task.id, { timeout_minutes: parseInt(e.target.value) })}
                              />
                            </div>
                            
                            <div>
                              <Label>Retry Attempts</Label>
                              <Input
                                type="number"
                                min="0"
                                max="5"
                                value={task.retry_attempts}
                                onChange={(e) => updateTask(task.id, { retry_attempts: parseInt(e.target.value) })}
                              />
                            </div>
                            
                            <div className="flex items-center space-x-2 pt-6">
                              <Switch
                                checked={task.is_critical}
                                onCheckedChange={(checked) => updateTask(task.id, { is_critical: checked })}
                              />
                              <Label>Critical</Label>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsEditing(false);
                  setEditForm({});
                  setTasks([]);
                }}>
                  Cancel
                </Button>
                <Button type="button" onClick={updateTemplate}>
                  <Save className="h-4 w-4 mr-2" />
                  Update Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};