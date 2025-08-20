import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Variable, Plus, Trash2, Edit, 
  Database, Settings, Info, 
  ArrowRight, ArrowLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WorkflowVariable {
  id: string;
  apiName: string;
  displayName: string;
  description: string;
  dataType: 'Text' | 'Number' | 'Boolean' | 'Date' | 'Record' | 'Collection';
  object?: string;
  isRequired: boolean;
  isInput: boolean;
  isOutput: boolean;
  defaultValue?: any;
  validationRules?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    allowedValues?: string[];
  };
  metadata?: {
    fieldMapping?: string;
    sourceObject?: string;
    calculationFormula?: string;
  };
}

interface VariableEditorProps {
  variables?: WorkflowVariable[];
  onVariablesChange?: (variables: WorkflowVariable[]) => void;
  availableObjects?: string[];
  mode?: 'edit' | 'view';
  contextSuggestions?: any[];
}

export const VariableEditor: React.FC<VariableEditorProps> = ({
  variables = [],
  onVariablesChange,
  availableObjects = ['Contact', 'Account', 'Case', 'Lead', 'Opportunity'],
  mode = 'edit'
}) => {
  const [workflowVariables, setWorkflowVariables] = useState<WorkflowVariable[]>(variables);
  const [editingVariable, setEditingVariable] = useState<WorkflowVariable | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedVariable, setSelectedVariable] = useState<WorkflowVariable | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setWorkflowVariables(variables);
  }, [variables]);

  const handleVariableUpdate = (updatedVariable: WorkflowVariable) => {
    const newVariables = workflowVariables.map(v => 
      v.id === updatedVariable.id ? updatedVariable : v
    );
    setWorkflowVariables(newVariables);
    onVariablesChange?.(newVariables);
  };

  const handleVariableCreate = (newVariable: Omit<WorkflowVariable, 'id'>) => {
    const variable: WorkflowVariable = {
      ...newVariable,
      id: `var_${Date.now()}`
    };
    const newVariables = [...workflowVariables, variable];
    setWorkflowVariables(newVariables);
    onVariablesChange?.(newVariables);
    setShowCreateDialog(false);
    toast({
      title: "Variable Created",
      description: `${variable.displayName} has been added to the workflow.`,
    });
  };

  const handleVariableDelete = (variableId: string) => {
    const newVariables = workflowVariables.filter(v => v.id !== variableId);
    setWorkflowVariables(newVariables);
    onVariablesChange?.(newVariables);
    toast({
      title: "Variable Deleted",
      description: "The variable has been removed from the workflow.",
    });
  };

  const getDataTypeIcon = (type: WorkflowVariable['dataType']) => {
    switch (type) {
      case 'Record': return <Database className="h-4 w-4" />;
      case 'Collection': return <Database className="h-4 w-4" />;
      default: return <Variable className="h-4 w-4" />;
    }
  };

  const getDataTypeColor = (type: WorkflowVariable['dataType']) => {
    switch (type) {
      case 'Text': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Number': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Boolean': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Date': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Record': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Collection': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Workflow Variables</h3>
          <p className="text-sm text-muted-foreground">
            Manage variables used in your workflow for data flow and processing
          </p>
        </div>
        {mode === 'edit' && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Variable
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Variable</DialogTitle>
              </DialogHeader>
              <VariableForm
                availableObjects={availableObjects}
                onSubmit={handleVariableCreate}
                onCancel={() => setShowCreateDialog(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Variables List */}
      <div className="space-y-4">
        {workflowVariables.map((variable) => (
          <Card key={variable.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 rounded-lg bg-muted">
                    {getDataTypeIcon(variable.dataType)}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{variable.displayName}</h4>
                      <Badge className={`text-xs ${getDataTypeColor(variable.dataType)}`}>
                        {variable.dataType}
                      </Badge>
                      {variable.isRequired && (
                        <Badge variant="destructive" className="text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {variable.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>API Name: <code className="font-mono">{variable.apiName}</code></span>
                      {variable.object && (
                        <span>Object: <strong>{variable.object}</strong></span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {variable.isInput && (
                        <Badge variant="outline" className="text-xs">
                          <ArrowRight className="h-3 w-3 mr-1" />
                          Input
                        </Badge>
                      )}
                      {variable.isOutput && (
                        <Badge variant="outline" className="text-xs">
                          <ArrowLeft className="h-3 w-3 mr-1" />
                          Output
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                {mode === 'edit' && (
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setEditingVariable(variable)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Edit Variable</DialogTitle>
                        </DialogHeader>
                        <VariableForm
                          initialData={variable}
                          availableObjects={availableObjects}
                          onSubmit={(updated) => {
                            handleVariableUpdate({ ...updated, id: variable.id });
                            setEditingVariable(null);
                          }}
                          onCancel={() => setEditingVariable(null)}
                        />
                      </DialogContent>
                    </Dialog>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleVariableDelete(variable.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {workflowVariables.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Variable className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Variables Defined</h3>
            <p className="text-muted-foreground">
              Add variables to store and pass data between workflow steps.
            </p>
            {mode === 'edit' && (
              <Button className="mt-4" onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Variable
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

interface VariableFormProps {
  initialData?: WorkflowVariable;
  availableObjects: string[];
  onSubmit: (variable: Omit<WorkflowVariable, 'id'>) => void;
  onCancel: () => void;
}

const VariableForm: React.FC<VariableFormProps> = ({
  initialData,
  availableObjects,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<Omit<WorkflowVariable, 'id'>>({
    apiName: initialData?.apiName || '',
    displayName: initialData?.displayName || '',
    description: initialData?.description || '',
    dataType: initialData?.dataType || 'Text',
    object: initialData?.object || '',
    isRequired: initialData?.isRequired || false,
    isInput: initialData?.isInput || false,
    isOutput: initialData?.isOutput || true,
    defaultValue: initialData?.defaultValue || '',
    validationRules: initialData?.validationRules || {},
    metadata: initialData?.metadata || {}
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate API name if not provided
    if (!formData.apiName && formData.displayName) {
      formData.apiName = formData.displayName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
    }

    onSubmit(formData);
  };

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="displayName">Display Name *</Label>
          <Input
            id="displayName"
            value={formData.displayName}
            onChange={(e) => updateFormData({ displayName: e.target.value })}
            placeholder="Contact Record"
            required
          />
          <p className="text-xs text-muted-foreground">
            Human-readable name for this variable
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="apiName">API Name</Label>
          <Input
            id="apiName"
            value={formData.apiName}
            onChange={(e) => updateFormData({ apiName: e.target.value })}
            placeholder="contact_record"
          />
          <p className="text-xs text-muted-foreground">
            Unique name for API usage (auto-generated if empty)
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          placeholder="The contact record associated with the identified customer"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dataType">Data Type *</Label>
          <Select 
            value={formData.dataType} 
            onValueChange={(value) => updateFormData({ dataType: value as WorkflowVariable['dataType'] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Text">Text</SelectItem>
              <SelectItem value="Number">Number</SelectItem>
              <SelectItem value="Boolean">Boolean</SelectItem>
              <SelectItem value="Date">Date</SelectItem>
              <SelectItem value="Record">Record</SelectItem>
              <SelectItem value="Collection">Collection</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {(formData.dataType === 'Record' || formData.dataType === 'Collection') && (
          <div className="space-y-2">
            <Label htmlFor="object">Object</Label>
            <Select 
              value={formData.object} 
              onValueChange={(value) => updateFormData({ object: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select object" />
              </SelectTrigger>
              <SelectContent>
                {availableObjects.map(obj => (
                  <SelectItem key={obj} value={obj}>{obj}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Label>Availability Outside the Flow</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isInput"
              checked={formData.isInput}
              onCheckedChange={(checked) => updateFormData({ isInput: !!checked })}
            />
            <Label htmlFor="isInput" className="text-sm">
              Available for input
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isOutput"
              checked={formData.isOutput}
              onCheckedChange={(checked) => updateFormData({ isOutput: !!checked })}
            />
            <Label htmlFor="isOutput" className="text-sm">
              Available for output
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isRequired"
              checked={formData.isRequired}
              onCheckedChange={(checked) => updateFormData({ isRequired: !!checked })}
            />
            <Label htmlFor="isRequired" className="text-sm">
              Required field
            </Label>
          </div>
        </div>
      </div>

      {formData.dataType === 'Text' && (
        <div className="space-y-4">
          <Label>Validation Rules</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minLength">Min Length</Label>
              <Input
                id="minLength"
                type="number"
                value={formData.validationRules?.minLength || ''}
                onChange={(e) => updateFormData({ 
                  validationRules: { 
                    ...formData.validationRules, 
                    minLength: parseInt(e.target.value) || undefined 
                  }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxLength">Max Length</Label>
              <Input
                id="maxLength"
                type="number"
                value={formData.validationRules?.maxLength || ''}
                onChange={(e) => updateFormData({ 
                  validationRules: { 
                    ...formData.validationRules, 
                    maxLength: parseInt(e.target.value) || undefined 
                  }
                })}
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? 'Update' : 'Create'} Variable
        </Button>
      </div>
    </form>
  );
};