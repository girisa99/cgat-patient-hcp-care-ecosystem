import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, Trash2, Settings, Key, Variable, 
  Bot, Database, MessageSquare, Phone, 
  Zap, Brain, Check, X, Eye, EyeOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAIModelManager } from '@/hooks/useAIModelManager';
import { useApiServices } from '@/hooks/useApiServices';
import { useApiServiceConfigurations } from '@/hooks/useApiServiceConfigurations';

interface Variable {
  id: string;
  name: string;
  type: 'static' | 'runtime';
  value: string;
  description?: string;
}

interface Credential {
  id: string;
  name: string;
  type: 'api_key' | 'bearer_token' | 'basic_auth' | 'oauth' | 'custom';
  value: string;
  masked: boolean;
}

interface ToolConfig {
  id: string;
  name: string;
  type: string;
  provider?: string;
  config: Record<string, any>;
}

interface UnifiedNodeConfiguratorProps {
  nodeId: string;
  nodeType: string;
  category: string;
  initialConfig?: {
    tools?: ToolConfig[];
    credentials?: Credential[];
    variables?: Variable[];
  };
  onSave: (config: {
    tools: ToolConfig[];
    credentials: Credential[];
    variables: Variable[];
  }) => void;
  onCancel?: () => void;
}

export const UnifiedNodeConfigurator: React.FC<UnifiedNodeConfiguratorProps> = ({
  nodeId,
  nodeType,
  category,
  initialConfig,
  onSave,
  onCancel
}) => {
  const [tools, setTools] = useState<ToolConfig[]>(initialConfig?.tools || []);
  const [credentials, setCredentials] = useState<Credential[]>(initialConfig?.credentials || []);
  const [variables, setVariables] = useState<Variable[]>(initialConfig?.variables || []);
  const [activeTab, setActiveTab] = useState('tools');

  const { toast } = useToast();
  const { aiModels, isLoading: loadingModels } = useAIModelManager();
  const { apiServices, isLoading: loadingServices } = useApiServices();
  const { apiServiceConfigurations } = useApiServiceConfigurations();

  // Get available tools based on node type and category
  const getAvailableTools = () => {
    const tools = [];
    
    if (aiModels) {
      tools.push(...aiModels.map(model => ({
        id: model.id,
        name: model.name || model.model_id,
        type: 'ai_model',
        provider: model.provider,
        config: model
      })));
    }
    
    if (apiServices) {
      tools.push(...apiServices.map(service => ({
        id: service.id,
        name: service.name || 'Unnamed Service',
        type: 'api_service',
        provider: 'API Service',
        config: service
      })));
    }
    
    if (apiServiceConfigurations) {
      tools.push(...apiServiceConfigurations.map(config => ({
        id: config.id,
        name: config.service_name,
        type: 'api_config',
        provider: 'Custom',
        config: config
      })));
    }
    
    return tools;
  };

  const addTool = (toolData: any) => {
    const newTool: ToolConfig = {
      id: Date.now().toString(),
      name: toolData.name,
      type: toolData.type,
      provider: toolData.provider,
      config: toolData.config
    };
    setTools([...tools, newTool]);
  };

  const removeTool = (id: string) => {
    setTools(tools.filter(tool => tool.id !== id));
  };

  const addCredential = () => {
    const newCredential: Credential = {
      id: Date.now().toString(),
      name: '',
      type: 'api_key',
      value: '',
      masked: true
    };
    setCredentials([...credentials, newCredential]);
  };

  const updateCredential = (id: string, updates: Partial<Credential>) => {
    setCredentials(credentials.map(cred => 
      cred.id === id ? { ...cred, ...updates } : cred
    ));
  };

  const removeCredential = (id: string) => {
    setCredentials(credentials.filter(cred => cred.id !== id));
  };

  const addVariable = () => {
    const newVariable: Variable = {
      id: Date.now().toString(),
      name: '',
      type: 'static',
      value: '',
      description: ''
    };
    setVariables([...variables, newVariable]);
  };

  const updateVariable = (id: string, updates: Partial<Variable>) => {
    setVariables(variables.map(variable => 
      variable.id === id ? { ...variable, ...updates } : variable
    ));
  };

  const removeVariable = (id: string) => {
    setVariables(variables.filter(variable => variable.id !== id));
  };

  const handleSave = () => {
    onSave({
      tools,
      credentials,
      variables
    });
    
    toast({
      title: "Configuration Saved",
      description: `Node ${nodeType} configured successfully with ${tools.length} tools, ${credentials.length} credentials, and ${variables.length} variables.`,
    });
  };

  const availableTools = getAvailableTools();

  return (
    <Card className="w-full max-w-4xl max-h-[80vh]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configure {nodeType} Node
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tools" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Tools ({tools.length})
            </TabsTrigger>
            <TabsTrigger value="credentials" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Credentials ({credentials.length})
            </TabsTrigger>
            <TabsTrigger value="variables" className="flex items-center gap-2">
              <Variable className="h-4 w-4" />
              Variables ({variables.length})
            </TabsTrigger>
          </TabsList>

          {/* Tools Tab */}
          <TabsContent value="tools" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Available Tools</h3>
              <Badge variant="outline">{availableTools.length} available</Badge>
            </div>
            
            <ScrollArea className="h-64 border rounded-md p-4">
              <div className="grid grid-cols-1 gap-3">
                {availableTools.map((tool) => (
                  <Card key={tool.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {tool.type === 'ai_model' && <Bot className="h-4 w-4" />}
                        {tool.type === 'api_service' && <Database className="h-4 w-4" />}
                        {tool.type === 'api_config' && <Settings className="h-4 w-4" />}
                        <div>
                          <p className="font-medium text-sm">{tool.name}</p>
                          <p className="text-xs text-muted-foreground">{tool.provider} • {tool.type}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={tools.some(t => t.id === tool.id) ? "secondary" : "default"}
                        onClick={() => tools.some(t => t.id === tool.id) ? removeTool(tool.id) : addTool(tool)}
                      >
                        {tools.some(t => t.id === tool.id) ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </Button>
                    </div>
                  </Card>
                ))}
                
                {availableTools.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No tools available for this node type
                  </div>
                )}
              </div>
            </ScrollArea>

            {tools.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-3">Selected Tools ({tools.length})</h4>
                  <div className="space-y-2">
                    {tools.map((tool) => (
                      <div key={tool.id} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{tool.name}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeTool(tool.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* Credentials Tab */}
          <TabsContent value="credentials" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Credentials</h3>
              <Button onClick={addCredential} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Credential
              </Button>
            </div>

            <ScrollArea className="h-64">
              <div className="space-y-4">
                {credentials.map((credential) => (
                  <Card key={credential.id} className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`cred-name-${credential.id}`}>Name</Label>
                        <Input
                          id={`cred-name-${credential.id}`}
                          value={credential.name}
                          onChange={(e) => updateCredential(credential.id, { name: e.target.value })}
                          placeholder="e.g., OpenAI API Key"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`cred-type-${credential.id}`}>Type</Label>
                        <Select
                          value={credential.type}
                          onValueChange={(value: any) => updateCredential(credential.id, { type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="api_key">API Key</SelectItem>
                            <SelectItem value="bearer_token">Bearer Token</SelectItem>
                            <SelectItem value="basic_auth">Basic Auth</SelectItem>
                            <SelectItem value="oauth">OAuth</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor={`cred-value-${credential.id}`}>Value</Label>
                        <div className="flex gap-2">
                          <Input
                            id={`cred-value-${credential.id}`}
                            type={credential.masked ? "password" : "text"}
                            value={credential.value}
                            onChange={(e) => updateCredential(credential.id, { value: e.target.value })}
                            placeholder="Enter credential value"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateCredential(credential.id, { masked: !credential.masked })}
                          >
                            {credential.masked ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeCredential(credential.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                
                {credentials.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No credentials configured. Click "Add Credential" to get started.
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Variables Tab */}
          <TabsContent value="variables" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Variables</h3>
              <Button onClick={addVariable} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Variable
              </Button>
            </div>

            <ScrollArea className="h-64">
              <div className="space-y-4">
                {variables.map((variable) => (
                  <Card key={variable.id} className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`var-name-${variable.id}`}>Variable Name *</Label>
                        <Input
                          id={`var-name-${variable.id}`}
                          value={variable.name}
                          onChange={(e) => updateVariable(variable.id, { name: e.target.value })}
                          placeholder="e.g., user_input"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`var-type-${variable.id}`}>Type *</Label>
                        <Select
                          value={variable.type}
                          onValueChange={(value: 'static' | 'runtime') => updateVariable(variable.id, { type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="static">Static</SelectItem>
                            <SelectItem value="runtime">Runtime</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor={`var-value-${variable.id}`}>Value *</Label>
                        <Textarea
                          id={`var-value-${variable.id}`}
                          value={variable.value}
                          onChange={(e) => updateVariable(variable.id, { value: e.target.value })}
                          placeholder={variable.type === 'static' ? 'Enter static value' : 'Enter runtime expression'}
                          rows={2}
                        />
                      </div>
                      <div className="col-span-2">
                        <div className="flex justify-between items-center">
                          <Label htmlFor={`var-desc-${variable.id}`}>Description</Label>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeVariable(variable.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Input
                          id={`var-desc-${variable.id}`}
                          value={variable.description || ''}
                          onChange={(e) => updateVariable(variable.id, { description: e.target.value })}
                          placeholder="Optional description"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
                
                {variables.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No variables configured. Click "Add Variable" to get started.
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <Separator className="my-6" />
        
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button onClick={handleSave}>
            Save Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};