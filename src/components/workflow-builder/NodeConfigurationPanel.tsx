import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, Trash2, Plus, Minus, Database, Key, 
  Bot, Code, Variable, Link, Archive, ChevronUp, ChevronDown
} from 'lucide-react';
import { useMasterToast } from '@/hooks/useMasterToast';

interface NodeVariable {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  value: any;
  required: boolean;
  description: string;
}

interface APIConfiguration {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers: Record<string, string>;
  auth: {
    type: 'none' | 'api_key' | 'bearer' | 'oauth';
    key: string;
    value: string;
  };
  enabled: boolean;
}

interface DataStorageConfig {
  enabled: boolean;
  storageType: 'memory' | 'database' | 'cache';
  retentionDays: number;
  maxRecords: number;
  fields: string[];
}

interface NodeConfigurationPanelProps {
  node: any;
  onUpdate: (nodeId: string, updates: any) => void;
  onDelete: (nodeId: string) => void;
  onClose: () => void;
  availableConnectors: string[];
  aiModels: string[];
}

export const NodeConfigurationPanel: React.FC<NodeConfigurationPanelProps> = ({
  node,
  onUpdate,
  onDelete,
  onClose,
  availableConnectors,
  aiModels
}) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [variables, setVariables] = useState<NodeVariable[]>(node.data?.variables || []);
  const [apis, setApis] = useState<APIConfiguration[]>(node.data?.apis || []);
  const [dataStorage, setDataStorage] = useState<DataStorageConfig>(
    node.data?.dataStorage || {
      enabled: false,
      storageType: 'memory',
      retentionDays: 30,
      maxRecords: 1000,
      fields: []
    }
  );
  const { showSuccess, showError } = useMasterToast();

  const handleBasicUpdate = (field: string, value: any) => {
    onUpdate(node.id, {
      data: {
        ...node.data,
        [field]: value
      }
    });
  };

  const addVariable = () => {
    const newVariable: NodeVariable = {
      id: `var_${Date.now()}`,
      name: 'newVariable',
      type: 'string',
      value: '',
      required: false,
      description: ''
    };
    const updatedVariables = [...variables, newVariable];
    setVariables(updatedVariables);
    onUpdate(node.id, {
      data: { ...node.data, variables: updatedVariables }
    });
  };

  const updateVariable = (id: string, updates: Partial<NodeVariable>) => {
    const updatedVariables = variables.map(v => 
      v.id === id ? { ...v, ...updates } : v
    );
    setVariables(updatedVariables);
    onUpdate(node.id, {
      data: { ...node.data, variables: updatedVariables }
    });
  };

  const removeVariable = (id: string) => {
    const updatedVariables = variables.filter(v => v.id !== id);
    setVariables(updatedVariables);
    onUpdate(node.id, {
      data: { ...node.data, variables: updatedVariables }
    });
  };

  const addAPI = () => {
    const newAPI: APIConfiguration = {
      id: `api_${Date.now()}`,
      name: 'New API',
      url: '',
      method: 'GET',
      headers: {},
      auth: { type: 'none', key: '', value: '' },
      enabled: true
    };
    const updatedAPIs = [...apis, newAPI];
    setApis(updatedAPIs);
    onUpdate(node.id, {
      data: { ...node.data, apis: updatedAPIs }
    });
  };

  const updateAPI = (id: string, updates: Partial<APIConfiguration>) => {
    const updatedAPIs = apis.map(api => 
      api.id === id ? { ...api, ...updates } : api
    );
    setApis(updatedAPIs);
    onUpdate(node.id, {
      data: { ...node.data, apis: updatedAPIs }
    });
  };

  const removeAPI = (id: string) => {
    const updatedAPIs = apis.filter(api => api.id !== id);
    setApis(updatedAPIs);
    onUpdate(node.id, {
      data: { ...node.data, apis: updatedAPIs }
    });
  };

  const updateDataStorage = (updates: Partial<DataStorageConfig>) => {
    const updatedStorage = { ...dataStorage, ...updates };
    setDataStorage(updatedStorage);
    onUpdate(node.id, {
      data: { ...node.data, dataStorage: updatedStorage }
    });
  };

  const moveNode = (direction: 'up' | 'down') => {
    const currentOrder = node.data?.order || 0;
    const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;
    onUpdate(node.id, {
      data: { ...node.data, order: newOrder }
    });
    showSuccess(`Node moved ${direction}`);
  };

  return (
    <Card className="w-96 max-h-[90vh] overflow-y-auto overscroll-contain">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Node Configuration
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => moveNode('up')}>
              <ChevronUp className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => moveNode('down')}>
              <ChevronDown className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(node.id)} className="text-destructive">
              <Trash2 className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 text-xs">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="variables">Variables</TabsTrigger>
            <TabsTrigger value="apis">APIs</TabsTrigger>
            <TabsTrigger value="storage">Storage</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div>
              <Label htmlFor="node-type">Type</Label>
              <Select
                value={node.type}
                onValueChange={(value) => onUpdate(node.id, { type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer Touchpoint</SelectItem>
                  <SelectItem value="touchpoint">Interaction Point</SelectItem>
                  <SelectItem value="decision">Decision Point</SelectItem>
                  <SelectItem value="agent">AI Agent</SelectItem>
                  <SelectItem value="process">Process Step</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="node-label">Label</Label>
              <Input
                id="node-label"
                value={node.data?.label || ''}
                onChange={(e) => handleBasicUpdate('label', e.target.value)}
                placeholder="Enter node label"
              />
            </div>

            <div>
              <Label htmlFor="node-description">Description</Label>
              <Textarea
                id="node-description"
                value={node.data?.description || ''}
                onChange={(e) => handleBasicUpdate('description', e.target.value)}
                placeholder="Describe this node's purpose"
                rows={3}
              />
            </div>

            {node.type === 'agent' && (
              <div>
                <Label htmlFor="ai-model">AI Model</Label>
                <Select
                  value={node.data?.aiModel || 'gpt-4o-mini'}
                  onValueChange={(value) => handleBasicUpdate('aiModel', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {aiModels.map(model => (
                      <SelectItem key={model} value={model}>{model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="connector">Connector</Label>
              <Select
                value={node.data?.connector || ''}
                onValueChange={(value) => handleBasicUpdate('connector', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select connector" />
                </SelectTrigger>
                <SelectContent>
                  {availableConnectors.map(connector => (
                    <SelectItem key={connector} value={connector}>{connector}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="node-active">Active</Label>
              <Switch
                id="node-active"
                checked={node.data?.active !== false}
                onCheckedChange={(checked) => handleBasicUpdate('active', checked)}
              />
            </div>
          </TabsContent>

          <TabsContent value="variables" className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Variables</h4>
              <Button size="sm" onClick={addVariable}>
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>

            <div className="space-y-3">
              {variables.map((variable) => (
                <Card key={variable.id} className="p-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Input
                        value={variable.name}
                        onChange={(e) => updateVariable(variable.id, { name: e.target.value })}
                        placeholder="Variable name"
                        className="text-xs"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeVariable(variable.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Select
                        value={variable.type}
                        onValueChange={(value: any) => updateVariable(variable.id, { type: value })}
                      >
                        <SelectTrigger className="text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">String</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                          <SelectItem value="array">Array</SelectItem>
                          <SelectItem value="object">Object</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <div className="flex items-center">
                        <Switch
                          checked={variable.required}
                          onCheckedChange={(checked) => updateVariable(variable.id, { required: checked })}
                        />
                        <Label className="text-xs ml-1">Required</Label>
                      </div>
                    </div>

                    <Input
                      value={variable.value}
                      onChange={(e) => updateVariable(variable.id, { value: e.target.value })}
                      placeholder="Default value"
                      className="text-xs"
                    />

                    <Input
                      value={variable.description}
                      onChange={(e) => updateVariable(variable.id, { description: e.target.value })}
                      placeholder="Description"
                      className="text-xs"
                    />
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="apis" className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">API Configurations</h4>
              <Button size="sm" onClick={addAPI}>
                <Plus className="h-3 w-3 mr-1" />
                Add API
              </Button>
            </div>

            <div className="space-y-3">
              {apis.map((api) => (
                <Card key={api.id} className="p-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Input
                        value={api.name}
                        onChange={(e) => updateAPI(api.id, { name: e.target.value })}
                        placeholder="API name"
                        className="text-xs"
                      />
                      <div className="flex items-center gap-1">
                        <Switch
                          checked={api.enabled}
                          onCheckedChange={(checked) => updateAPI(api.id, { enabled: checked })}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeAPI(api.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <Select
                        value={api.method}
                        onValueChange={(value: any) => updateAPI(api.id, { method: value })}
                      >
                        <SelectTrigger className="text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                          <SelectItem value="DELETE">DELETE</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Input
                        value={api.url}
                        onChange={(e) => updateAPI(api.id, { url: e.target.value })}
                        placeholder="API URL"
                        className="text-xs col-span-2"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Authentication</Label>
                      <div className="grid grid-cols-3 gap-1">
                        <Select
                          value={api.auth.type}
                          onValueChange={(value: any) => 
                            updateAPI(api.id, { 
                              auth: { ...api.auth, type: value } 
                            })
                          }
                        >
                          <SelectTrigger className="text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="api_key">API Key</SelectItem>
                            <SelectItem value="bearer">Bearer</SelectItem>
                            <SelectItem value="oauth">OAuth</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        {api.auth.type !== 'none' && (
                          <>
                            <Input
                              value={api.auth.key}
                              onChange={(e) => 
                                updateAPI(api.id, { 
                                  auth: { ...api.auth, key: e.target.value } 
                                })
                              }
                              placeholder="Key"
                              className="text-xs"
                            />
                            <Input
                              type="password"
                              value={api.auth.value}
                              onChange={(e) => 
                                updateAPI(api.id, { 
                                  auth: { ...api.auth, value: e.target.value } 
                                })
                              }
                              placeholder="Value"
                              className="text-xs"
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="storage" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="storage-enabled">Enable Data Storage</Label>
              <Switch
                id="storage-enabled"
                checked={dataStorage.enabled}
                onCheckedChange={(checked) => updateDataStorage({ enabled: checked })}
              />
            </div>

            {dataStorage.enabled && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="storage-type">Storage Type</Label>
                  <Select
                    value={dataStorage.storageType}
                    onValueChange={(value: any) => updateDataStorage({ storageType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="memory">Memory (Session)</SelectItem>
                      <SelectItem value="database">Database (Persistent)</SelectItem>
                      <SelectItem value="cache">Cache (Redis)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="retention">Retention (Days)</Label>
                    <Input
                      id="retention"
                      type="number"
                      value={dataStorage.retentionDays}
                      onChange={(e) => updateDataStorage({ retentionDays: parseInt(e.target.value) })}
                      min="1"
                      max="365"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="max-records">Max Records</Label>
                    <Input
                      id="max-records"
                      type="number"
                      value={dataStorage.maxRecords}
                      onChange={(e) => updateDataStorage({ maxRecords: parseInt(e.target.value) })}
                      min="100"
                      max="100000"
                      step="100"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="storage-fields">Storage Fields (comma-separated)</Label>
                  <Input
                    id="storage-fields"
                    value={dataStorage.fields.join(', ')}
                    onChange={(e) => updateDataStorage({ 
                      fields: e.target.value.split(',').map(f => f.trim()).filter(f => f) 
                    })}
                    placeholder="field1, field2, field3"
                  />
                </div>

                <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                  <strong>Storage Info:</strong>
                  <br />• Memory: Fast but temporary (session-based)
                  <br />• Database: Persistent with CRUD operations
                  <br />• Cache: Fast with TTL expiration
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};