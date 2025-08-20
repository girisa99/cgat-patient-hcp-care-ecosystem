import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, Plus, Zap, MessageSquare, FileText, 
  Calendar, ShoppingCart, User, Settings,
  Clock, CheckCircle, AlertCircle, Play
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AgentAction {
  id: string;
  name: string;
  type: 'system' | 'custom' | 'api' | 'workflow';
  category: string;
  description: string;
  instructions: string;
  requiredInputs: string[];
  expectedOutputs: string[];
  estimatedDuration: number;
  complexity: 'simple' | 'moderate' | 'complex';
  isActive: boolean;
  usageCount: number;
  successRate: number;
  metadata: {
    permissions?: string[];
    apiEndpoint?: string;
    workflowSteps?: number;
    tags?: string[];
  };
}

interface ActionsTasksManagerProps {
  onActionsSelect?: (actions: AgentAction[]) => void;
  selectedActions?: AgentAction[];
  mode?: 'select' | 'manage';
}

export const ActionsTasksManager: React.FC<ActionsTasksManagerProps> = ({
  onActionsSelect,
  selectedActions = [],
  mode = 'select'
}) => {
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [filteredActions, setFilteredActions] = useState<AgentAction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [sortBy, setSortBy] = useState<string>('name');
  const { toast } = useToast();

  // Mock data - replace with actual API calls
  const mockActions: AgentAction[] = [
    {
      id: '1',
      name: 'Add Case Comment',
      type: 'system',
      category: 'Case Management',
      description: 'Let a customer add a comment to an existing case for follow-up or additional information',
      instructions: 'Prompts the customer to provide additional details about their case and adds the comment to the case record',
      requiredInputs: ['case_id', 'comment_text'],
      expectedOutputs: ['confirmation_message', 'updated_case_record'],
      estimatedDuration: 2,
      complexity: 'simple',
      isActive: true,
      usageCount: 245,
      successRate: 98.5,
      metadata: {
        permissions: ['case_update'],
        tags: ['case', 'comment', 'customer']
      }
    },
    {
      id: '2',
      name: 'Answer Questions with Knowledge',
      type: 'system',
      category: 'Knowledge Base',
      description: 'Answers questions about company policies and procedures using the knowledge base',
      instructions: 'Searches the knowledge base for relevant information and provides comprehensive answers to customer queries',
      requiredInputs: ['question', 'context'],
      expectedOutputs: ['answer', 'source_references', 'confidence_score'],
      estimatedDuration: 3,
      complexity: 'moderate',
      isActive: true,
      usageCount: 1823,
      successRate: 94.2,
      metadata: {
        permissions: ['knowledge_access'],
        tags: ['knowledge', 'qa', 'support']
      }
    },
    {
      id: '3',
      name: 'Cancel Order',
      type: 'system',
      category: 'Order Management',
      description: 'Cancels a customer\'s order and processes refund if applicable',
      instructions: 'Validates order cancellation eligibility, cancels the order, and initiates refund process if payment was processed',
      requiredInputs: ['order_id', 'cancellation_reason'],
      expectedOutputs: ['cancellation_confirmation', 'refund_status', 'updated_order_status'],
      estimatedDuration: 5,
      complexity: 'complex',
      isActive: true,
      usageCount: 156,
      successRate: 96.8,
      metadata: {
        permissions: ['order_cancel', 'refund_process'],
        tags: ['order', 'cancel', 'refund']
      }
    },
    {
      id: '4',
      name: 'Create a Label',
      type: 'custom',
      category: 'Organization',
      description: 'Create a label with the specified label name for categorizing items',
      instructions: 'Creates a new organizational label that can be used to categorize and organize various items in the system',
      requiredInputs: ['label_name', 'label_color', 'description'],
      expectedOutputs: ['label_id', 'confirmation_message'],
      estimatedDuration: 1,
      complexity: 'simple',
      isActive: true,
      usageCount: 89,
      successRate: 99.1,
      metadata: {
        permissions: ['label_create'],
        tags: ['organization', 'label', 'categorization']
      }
    },
    {
      id: '5',
      name: 'Create a To Do',
      type: 'custom',
      category: 'Task Management',
      description: 'Create a task record based on user input for follow-up actions',
      instructions: 'Creates a new task in the system with specified details, due date, and priority for tracking and follow-up',
      requiredInputs: ['task_title', 'description', 'due_date', 'priority'],
      expectedOutputs: ['task_id', 'task_confirmation', 'assigned_user'],
      estimatedDuration: 3,
      complexity: 'moderate',
      isActive: true,
      usageCount: 342,
      successRate: 97.3,
      metadata: {
        permissions: ['task_create'],
        tags: ['task', 'todo', 'productivity']
      }
    },
    {
      id: '6',
      name: 'Schedule Patient Appointment',
      type: 'custom',
      category: 'Healthcare',
      description: 'Schedule a new appointment for a patient with available healthcare providers',
      instructions: 'Checks provider availability, schedules appointment, sends confirmation to patient and provider',
      requiredInputs: ['patient_id', 'provider_id', 'appointment_type', 'preferred_date'],
      expectedOutputs: ['appointment_id', 'confirmation_details', 'calendar_event'],
      estimatedDuration: 4,
      complexity: 'complex',
      isActive: true,
      usageCount: 567,
      successRate: 95.7,
      metadata: {
        permissions: ['appointment_schedule', 'calendar_access'],
        tags: ['healthcare', 'appointment', 'scheduling']
      }
    },
    {
      id: '7',
      name: 'Process Insurance Claim',
      type: 'api',
      category: 'Insurance',
      description: 'Submit and process insurance claims through external insurance API',
      instructions: 'Validates claim information, submits to insurance provider API, tracks claim status',
      requiredInputs: ['claim_data', 'policy_number', 'provider_details'],
      expectedOutputs: ['claim_id', 'submission_status', 'estimated_processing_time'],
      estimatedDuration: 8,
      complexity: 'complex',
      isActive: true,
      usageCount: 123,
      successRate: 92.4,
      metadata: {
        permissions: ['insurance_access'],
        apiEndpoint: '/api/insurance/claims',
        tags: ['insurance', 'claims', 'api']
      }
    }
  ];

  useEffect(() => {
    setActions(mockActions);
    setFilteredActions(mockActions);
  }, []);

  useEffect(() => {
    let filtered = actions.filter(action => {
      const matchesSearch = action.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          action.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          action.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || action.category === selectedCategory;
      const matchesType = selectedType === 'all' || action.type === selectedType;
      
      return matchesSearch && matchesCategory && matchesType && action.isActive;
    });

    // Sort results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'usage': return b.usageCount - a.usageCount;
        case 'success_rate': return b.successRate - a.successRate;
        case 'complexity': 
          const complexityOrder = { simple: 1, moderate: 2, complex: 3 };
          return complexityOrder[a.complexity] - complexityOrder[b.complexity];
        default: return a.name.localeCompare(b.name);
      }
    });
    
    setFilteredActions(filtered);
  }, [actions, searchTerm, selectedCategory, selectedType, sortBy]);

  const getActionIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'case management': return <FileText className="h-4 w-4" />;
      case 'knowledge base': return <MessageSquare className="h-4 w-4" />;
      case 'order management': return <ShoppingCart className="h-4 w-4" />;
      case 'task management': return <CheckCircle className="h-4 w-4" />;
      case 'healthcare': return <User className="h-4 w-4" />;
      case 'insurance': return <Settings className="h-4 w-4" />;
      case 'organization': return <Settings className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const getComplexityColor = (complexity: AgentAction['complexity']) => {
    switch (complexity) {
      case 'simple': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'complex': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeColor = (type: AgentAction['type']) => {
    switch (type) {
      case 'system': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'custom': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'api': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'workflow': return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleActionToggle = (actionId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(actionId)) {
      newSelected.delete(actionId);
    } else {
      newSelected.add(actionId);
    }
    setSelectedItems(newSelected);
    
    if (onActionsSelect) {
      const selectedActionsList = actions.filter(action => newSelected.has(action.id));
      onActionsSelect(selectedActionsList);
    }
  };

  const categories = [...new Set(actions.map(action => action.category))];
  const types = [...new Set(actions.map(action => action.type))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Add Available Actions</h2>
          <p className="text-muted-foreground">
            Select the actions you want to include in your agent
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Action
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Action</DialogTitle>
              </DialogHeader>
              <CreateActionForm onSubmit={() => setShowCreateDialog(false)} />
            </DialogContent>
          </Dialog>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add from Asset Library
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search actions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {types.map(type => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="usage">Usage Count</SelectItem>
                <SelectItem value="success_rate">Success Rate</SelectItem>
                <SelectItem value="complexity">Complexity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredActions.length} items • Sorted by {sortBy.replace('_', ' ')} • {selectedItems.size} selected
        </p>
        {selectedItems.size > 0 && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSelectedItems(new Set())}
          >
            Clear Selection
          </Button>
        )}
      </div>

      {/* Actions Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left p-4 font-medium">
                    <Checkbox
                      checked={selectedItems.size === filteredActions.length && filteredActions.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedItems(new Set(filteredActions.map(a => a.id)));
                        } else {
                          setSelectedItems(new Set());
                        }
                      }}
                    />
                  </th>
                  <th className="text-left p-4 font-medium">Agent Action Label</th>
                  <th className="text-left p-4 font-medium">Instructions</th>
                  <th className="text-left p-4 font-medium">Type</th>
                  <th className="text-left p-4 font-medium">Complexity</th>
                  <th className="text-left p-4 font-medium">Usage</th>
                  <th className="text-left p-4 font-medium">Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {filteredActions.map((action) => (
                  <tr 
                    key={action.id} 
                    className="border-b hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleActionToggle(action.id)}
                  >
                    <td className="p-4">
                      <Checkbox
                        checked={selectedItems.has(action.id)}
                        onCheckedChange={() => handleActionToggle(action.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                          {getActionIcon(action.category)}
                        </div>
                        <div>
                          <div className="font-medium">{action.name}</div>
                          <div className="text-sm text-muted-foreground">{action.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 max-w-md">
                      <p className="text-sm line-clamp-2">{action.instructions}</p>
                    </td>
                    <td className="p-4">
                      <Badge className={`text-xs ${getTypeColor(action.type)}`}>
                        {action.type}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={`text-xs ${getComplexityColor(action.complexity)}`}>
                        {action.complexity}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Play className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{action.usageCount}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span className="text-sm">{action.successRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {filteredActions.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Actions Found</h3>
            <p className="text-muted-foreground">
              No actions match your current search criteria.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const CreateActionForm: React.FC<{ onSubmit: () => void }> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    type: 'custom' as AgentAction['type'],
    description: '',
    instructions: '',
    complexity: 'simple' as AgentAction['complexity']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Action Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="instructions">Instructions</Label>
        <Textarea
          id="instructions"
          value={formData.instructions}
          onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as AgentAction['type'] }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">Custom</SelectItem>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="api">API</SelectItem>
              <SelectItem value="workflow">Workflow</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="complexity">Complexity</Label>
          <Select value={formData.complexity} onValueChange={(value) => setFormData(prev => ({ ...prev, complexity: value as AgentAction['complexity'] }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="simple">Simple</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="complex">Complex</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit">
          Create Action
        </Button>
      </div>
    </form>
  );
};