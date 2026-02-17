import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, Trash2, ArrowRight, ArrowLeft, 
  Info, Settings, Database 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ActionInput {
  id: string;
  name: string;
  instructions: string;
  dataType: string;
  isRequired: boolean;
  collectFromUser: boolean;
}

interface ActionOutput {
  id: string;
  name: string;
  instructions: string;
  dataType: string;
  filterFromAgent: boolean;
  showInConversation: boolean;
  outputRendering: string;
}

interface AgentActionCreatorProps {
  onSave?: (actionData: any) => void;
  onCancel?: () => void;
  initialData?: any;
}

export const AgentActionCreator: React.FC<AgentActionCreatorProps> = ({
  onSave,
  onCancel,
  initialData
}) => {
  const [actionName, setActionName] = useState(initialData?.name || '');
  const [actionInstructions, setActionInstructions] = useState(initialData?.instructions || '');
  const [inputs, setInputs] = useState<ActionInput[]>([
    {
      id: '1',
      name: 'emailAddress',
      instructions: 'Stores the email address provided by the customer.',
      dataType: 'lightning__textType',
      isRequired: true,
      collectFromUser: true
    }
  ]);
  const [outputs, setOutputs] = useState<ActionOutput[]>([
    {
      id: '1',
      name: 'contactRecord',
      instructions: 'The contact record associated with the identified customer.',
      dataType: 'lightning__recordInfoType',
      filterFromAgent: false,
      showInConversation: false,
      outputRendering: 'Object'
    }
  ]);
  
  const { toast } = useToast();

  const addInput = () => {
    const newInput: ActionInput = {
      id: Date.now().toString(),
      name: '',
      instructions: '',
      dataType: 'lightning__textType',
      isRequired: false,
      collectFromUser: false
    };
    setInputs([...inputs, newInput]);
  };

  const removeInput = (id: string) => {
    setInputs(inputs.filter(input => input.id !== id));
  };

  const updateInput = (id: string, updates: Partial<ActionInput>) => {
    setInputs(inputs.map(input => 
      input.id === id ? { ...input, ...updates } : input
    ));
  };

  const addOutput = () => {
    const newOutput: ActionOutput = {
      id: Date.now().toString(),
      name: '',
      instructions: '',
      dataType: 'lightning__textType',
      filterFromAgent: false,
      showInConversation: false,
      outputRendering: 'Object'
    };
    setOutputs([...outputs, newOutput]);
  };

  const removeOutput = (id: string) => {
    setOutputs(outputs.filter(output => output.id !== id));
  };

  const updateOutput = (id: string, updates: Partial<ActionOutput>) => {
    setOutputs(outputs.map(output => 
      output.id === id ? { ...output, ...updates } : output
    ));
  };

  const handleSave = () => {
    const actionData = {
      name: actionName,
      instructions: actionInstructions,
      inputs,
      outputs,
      createdAt: new Date().toISOString()
    };
    
    onSave?.(actionData);
    toast({
      title: "Agent Action Created",
      description: `${actionName} has been successfully created.`,
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Create an Agent Action</h1>
        <Input
          placeholder="Identify Customer by Email Address"
          value={actionName}
          onChange={(e) => setActionName(e.target.value)}
          className="text-lg font-medium"
        />
      </div>

      {/* Action Instructions */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Agent Action Instructions</Label>
              <Info className="h-4 w-4 text-muted-foreground" />
            </div>
            <Textarea
              placeholder="Get the Contact record based on email address provided"
              value={actionInstructions}
              onChange={(e) => setActionInstructions(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Input/Output Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="bg-blue-50/50 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              Input
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {inputs.map((input, index) => (
              <Card key={input.id} className="bg-white dark:bg-gray-800">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{index + 1}</Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeInput(input.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Input
                      placeholder="emailAddress"
                      value={input.name}
                      onChange={(e) => updateInput(input.id, { name: e.target.value })}
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">Instructions</Label>
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <Textarea
                      placeholder="Describe the input parameter..."
                      value={input.instructions}
                      onChange={(e) => updateInput(input.id, { instructions: e.target.value })}
                      rows={3}
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Data Type</Label>
                    <Select 
                      value={input.dataType} 
                      onValueChange={(value) => updateInput(input.id, { dataType: value })}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lightning__textType">Text</SelectItem>
                        <SelectItem value="lightning__numberType">Number</SelectItem>
                        <SelectItem value="lightning__booleanType">Boolean</SelectItem>
                        <SelectItem value="lightning__recordInfoType">Record</SelectItem>
                        <SelectItem value="lightning__collectionType">Collection</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`require-input-${input.id}`}
                        checked={input.isRequired}
                        onCheckedChange={(checked) => updateInput(input.id, { isRequired: !!checked })}
                      />
                      <Label htmlFor={`require-input-${input.id}`} className="text-xs">
                        Require input
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`collect-data-${input.id}`}
                        checked={input.collectFromUser}
                        onCheckedChange={(checked) => updateInput(input.id, { collectFromUser: !!checked })}
                      />
                      <Label htmlFor={`collect-data-${input.id}`} className="text-xs">
                        Collect data from user
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button onClick={addInput} variant="outline" size="sm" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Input
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="bg-green-50/50 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" />
              Output
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {outputs.map((output, index) => (
              <Card key={output.id} className="bg-white dark:bg-gray-800">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{index + 1}</Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeOutput(output.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Input
                      placeholder="contactRecord"
                      value={output.name}
                      onChange={(e) => updateOutput(output.id, { name: e.target.value })}
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">Instructions</Label>
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <Textarea
                      placeholder="Describe the output..."
                      value={output.instructions}
                      onChange={(e) => updateOutput(output.id, { instructions: e.target.value })}
                      rows={3}
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Data Type</Label>
                    <Select 
                      value={output.dataType} 
                      onValueChange={(value) => updateOutput(output.id, { dataType: value })}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lightning__textType">Text</SelectItem>
                        <SelectItem value="lightning__numberType">Number</SelectItem>
                        <SelectItem value="lightning__booleanType">Boolean</SelectItem>
                        <SelectItem value="lightning__recordInfoType">Record</SelectItem>
                        <SelectItem value="lightning__collectionType">Collection</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`filter-agent-${output.id}`}
                        checked={output.filterFromAgent}
                        onCheckedChange={(checked) => updateOutput(output.id, { filterFromAgent: !!checked })}
                      />
                      <Label htmlFor={`filter-agent-${output.id}`} className="text-xs">
                        Filter from agent action
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`show-conversation-${output.id}`}
                        checked={output.showInConversation}
                        onCheckedChange={(checked) => updateOutput(output.id, { showInConversation: !!checked })}
                      />
                      <Label htmlFor={`show-conversation-${output.id}`} className="text-xs">
                        Show in conversation
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Output Rendering</Label>
                    <Select 
                      value={output.outputRendering} 
                      onValueChange={(value) => updateOutput(output.id, { outputRendering: value })}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Object">Object</SelectItem>
                        <SelectItem value="String">String</SelectItem>
                        <SelectItem value="List">List</SelectItem>
                        <SelectItem value="Table">Table</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button onClick={addOutput} variant="outline" size="sm" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Output
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <span className="text-xs text-white">✓</span>
            </div>
            <span className="text-sm">Configuration</span>
          </div>
          <div className="w-8 h-px bg-border"></div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <span className="text-xs text-white">2</span>
            </div>
            <span className="text-sm">Testing</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Back
        </Button>
        <Button onClick={handleSave}>
          Finish
        </Button>
      </div>
    </div>
  );
};