import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Trash2, Database, 
  ArrowLeft, Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FieldMapping {
  id: string;
  fieldName: string;
  value: string;
  valueType: 'manual' | 'variable' | 'formula';
  variableSource?: string;
}

interface FlowRecordCreatorProps {
  onSave?: (recordData: any) => void;
  onCancel?: () => void;
  availableObjects?: string[];
  availableVariables?: Array<{ name: string; type: string; source: string }>;
}

export const FlowRecordCreator: React.FC<FlowRecordCreatorProps> = ({
  onSave,
  onCancel,
  availableObjects = ['Case Comment', 'Contact', 'Account', 'Lead', 'Opportunity'],
  availableVariables = [
    { name: 'caseComment', type: 'Text', source: 'Variable' },
    { name: 'caseRecord', type: 'Record', source: 'Case ID' },
    { name: 'True', type: 'Boolean', source: 'Constant' }
  ]
}) => {
  const [selectedObject, setSelectedObject] = useState('Case Comment');
  const [recordCreationMethod, setRecordCreationMethod] = useState('Manually');
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([
    {
      id: '1',
      fieldName: 'Body',
      value: 'caseComment',
      valueType: 'variable',
      variableSource: 'caseComment'
    },
    {
      id: '2',
      fieldName: 'Published',
      value: 'True',
      valueType: 'variable',
      variableSource: 'True'
    },
    {
      id: '3',
      fieldName: 'Parent ID',
      value: 'caseRecord > Case ID',
      valueType: 'variable',
      variableSource: 'caseRecord'
    }
  ]);

  const { toast } = useToast();

  const addField = () => {
    const newField: FieldMapping = {
      id: Date.now().toString(),
      fieldName: '',
      value: '',
      valueType: 'manual'
    };
    setFieldMappings([...fieldMappings, newField]);
  };

  const removeField = (id: string) => {
    setFieldMappings(fieldMappings.filter(field => field.id !== id));
  };

  const updateField = (id: string, updates: Partial<FieldMapping>) => {
    setFieldMappings(fieldMappings.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const handleSave = () => {
    const recordData = {
      object: selectedObject,
      method: recordCreationMethod,
      fieldMappings,
      createdAt: new Date().toISOString()
    };
    
    onSave?.(recordData);
    toast({
      title: "Record Creator Saved",
      description: `${selectedObject} record creation configured successfully.`,
    });
  };

  const getVariableColor = (valueType: string) => {
    switch (valueType) {
      case 'variable': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'formula': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'manual': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-pink-100 dark:bg-pink-900">
          <Database className="h-6 w-6 text-pink-600 dark:text-pink-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Create Records</h1>
          <p className="text-muted-foreground">
            Configure record creation with field mappings and data sources
          </p>
        </div>
      </div>

      {/* Configuration Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Record Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>How to set record field values</Label>
              <Select value={recordCreationMethod} onValueChange={setRecordCreationMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Manually">Manually</SelectItem>
                  <SelectItem value="Automatically">Automatically from template</SelectItem>
                  <SelectItem value="API">From API response</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Object Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Create a Record of This Object</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Object</Label>
            <Select value={selectedObject} onValueChange={setSelectedObject}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableObjects.map(obj => (
                  <SelectItem key={obj} value={obj}>{obj}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Field Mappings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Set Field Values for the {selectedObject}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 font-medium text-sm mb-4">
            <div>Field</div>
            <div>Value</div>
          </div>

          <div className="space-y-4">
            {fieldMappings.map((field) => (
              <div key={field.id} className="grid grid-cols-2 gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    <Database className="h-3 w-3 mr-1" />
                    {field.fieldName}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeField(field.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                  <div className="flex items-center gap-2 flex-1">
                    <Badge className={`text-xs ${getVariableColor(field.valueType)}`}>
                      <Settings className="h-3 w-3 mr-1" />
                      {field.value}
                    </Badge>
                    {field.valueType === 'variable' && field.variableSource && (
                      <span className="text-xs text-muted-foreground">
                        → {field.variableSource}
                      </span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      // Open variable selector
                    }}
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={addField} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Field
          </Button>
        </CardContent>
      </Card>

      {/* Variable Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Available Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableVariables.map((variable, index) => (
              <div 
                key={index}
                className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => {
                  // Handle variable selection
                }}
              >
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {variable.type}
                  </Badge>
                  <span className="font-mono text-sm">{variable.name}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Source: {variable.source}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline">
            Run
          </Button>
          <Button variant="outline">
            Debug
          </Button>
          <Button onClick={handleSave}>
            Save As New Flow
          </Button>
        </div>
      </div>
    </div>
  );
};