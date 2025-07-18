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

      if (error) throw error;

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
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
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
                    placeholder="Describe what this template does"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select 
                      value={editForm.category || 'custom'} 
                      onValueChange={(value) => setEditForm({...editForm, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
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
                      value={editForm.type || 'on_demand'} 
                      onValueChange={(value) => setEditForm({...editForm, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
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
                      value={editForm.priority || 'medium'} 
                      onValueChange={(value) => setEditForm({...editForm, priority: value})}
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
                    <Label>Duration (minutes)</Label>
                    <Input
                      type="number"
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

                {/* Tasks Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Tasks</Label>
                    <Button variant="outline" size="sm" onClick={addTask}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task
                    </Button>
                  </div>
                  {tasks.map((task, index) => (
                    <Card key={task.id}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <Input
                            value={task.task_name}
                            onChange={(e) => updateTask(task.id, { task_name: e.target.value })}
                            placeholder="Task name"
                          />
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeTask(task.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <Textarea
                          value={task.task_description || ''}
                          onChange={(e) => updateTask(task.id, { task_description: e.target.value })}
                          placeholder="Task description"
                          rows={2}
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label className="text-xs">Order</Label>
                            <Input
                              type="number"
                              value={task.task_order}
                              onChange={(e) => updateTask(task.id, { task_order: parseInt(e.target.value) })}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Type</Label>
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
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">Timeout (min)</Label>
                            <Input
                              type="number"
                              value={task.timeout_minutes}
                              onChange={(e) => updateTask(task.id, { timeout_minutes: parseInt(e.target.value) })}
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
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createTemplate}>
                    <Save className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Templates List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Action Templates ({templates.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {templates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No templates found</p>
                  <p className="text-sm">Create or generate templates to get started</p>
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-3">
                    {templates.map((template) => (
                      <Card 
                        key={template.id} 
                        className={`cursor-pointer transition-all ${
                          selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
                        }`} 
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getCategoryIcon(template.category)}
                                <h4 className="font-medium">{template.name}</h4>
                                <Badge variant={getPriorityColor(template.priority) as any}>
                                  {template.priority}
                                </Badge>
                                {template.is_system_template && (
                                  <Badge variant="outline">System</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {template.description || 'No description'}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  ~{template.estimated_duration}min
                                </span>
                                <span className="flex items-center gap-1">
                                  <Target className="h-3 w-3" />
                                  {template.type}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {template.tasks?.length || 0} tasks
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-1">
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
                                  setSelectedTemplate(template);
                                  setEditForm(template);
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
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Template Details */}
        <div>
          {selectedTemplate ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Template Details</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onTemplateSelect?.(selectedTemplate)}
                  >
                    Use Template
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium">{selectedTemplate.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedTemplate.description || 'No description'}
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Category</span>
                    <Badge variant="outline">{selectedTemplate.category}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Type</span>
                    <span className="text-sm">{selectedTemplate.type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Priority</span>
                    <Badge variant={getPriorityColor(selectedTemplate.priority) as any}>
                      {selectedTemplate.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Duration</span>
                    <span className="text-sm">~{selectedTemplate.estimated_duration}min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Requires Approval</span>
                    <span className="text-sm">{selectedTemplate.requires_approval ? 'Yes' : 'No'}</span>
                  </div>
                </div>

                {selectedTemplate.tasks && selectedTemplate.tasks.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-sm font-medium">Tasks ({selectedTemplate.tasks.length})</Label>
                      <div className="mt-2 space-y-2">
                        {selectedTemplate.tasks
                          .sort((a, b) => a.task_order - b.task_order)
                          .map((task) => (
                          <div key={task.id} className="p-2 border rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">{task.task_name}</span>
                              <Badge variant="outline" className="text-xs">
                                {task.task_type}
                              </Badge>
                            </div>
                            {task.task_description && (
                              <p className="text-xs text-muted-foreground mb-1">
                                {task.task_description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>Order: {task.task_order}</span>
                              <span>Timeout: {task.timeout_minutes}min</span>
                              {task.is_critical && (
                                <Badge variant="destructive" className="text-xs">Critical</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a template to view details</p>
                <p className="text-sm">Click on a template from the list to see its configuration</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};