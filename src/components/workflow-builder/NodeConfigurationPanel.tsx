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

interface StorageField {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'email' | 'phone';
  required: boolean;
  defaultValue?: string;
  mappedTable?: string;
  mappedColumn?: string;
}

interface DataStorageConfig {
  enabled: boolean;
  storageType: 'memory' | 'database' | 'cache';
  retentionDays: number;
  maxRecords: number;
  fields: StorageField[];
  targetTable?: string;
  apiEndpoint?: string;
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
      fields: [],
      targetTable: '',
      apiEndpoint: ''
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

  const addStorageField = () => {
    const newField: StorageField = {
      id: `field_${Date.now()}`,
      name: '',
      type: 'string',
      required: false,
      defaultValue: ''
    };
    const updatedFields = [...dataStorage.fields, newField];
    updateDataStorage({ fields: updatedFields });
  };

  const updateStorageField = (id: string, updates: Partial<StorageField>) => {
    const updatedFields = dataStorage.fields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    );
    updateDataStorage({ fields: updatedFields });
  };

  const removeStorageField = (id: string) => {
    const updatedFields = dataStorage.fields.filter(field => field.id !== id);
    updateDataStorage({ fields: updatedFields });
  };

  // Available tables for mapping
  const availableTables = [
    'profiles', 'facilities', 'treatment_center_onboarding', 
    'agents', 'agent_conversations', 'api_keys', 'services'
  ];

  // Common field templates
  const addFieldTemplate = (template: string) => {
    const templates: Record<string, Partial<StorageField>> = {
      'patient_info': { name: 'first_name', type: 'string', required: true, mappedTable: 'profiles', mappedColumn: 'first_name' },
      'contact_info': { name: 'email', type: 'email', required: true, mappedTable: 'profiles', mappedColumn: 'email' },
      'address_info': { name: 'address', type: 'string', required: false }
    };
    
    const templateFields = template === 'patient_info' ? [
      { ...templates.patient_info, id: `field_${Date.now()}_1`, name: 'first_name' },
      { ...templates.patient_info, id: `field_${Date.now()}_2`, name: 'last_name', mappedColumn: 'last_name' },
      { ...templates.contact_info, id: `field_${Date.now()}_3`, name: 'email' },
      { ...templates.address_info, id: `field_${Date.now()}_4`, name: 'phone', type: 'phone' as const }
    ] : template === 'address_info' ? [
      { ...templates.address_info, id: `field_${Date.now()}_5`, name: 'address' },
      { ...templates.address_info, id: `field_${Date.now()}_6`, name: 'city' },
      { ...templates.address_info, id: `field_${Date.now()}_7`, name: 'state' },
      { ...templates.address_info, id: `field_${Date.now()}_8`, name: 'zip' }
    ] : [];

    const updatedFields = [...dataStorage.fields, ...templateFields as StorageField[]];
    updateDataStorage({ fields: updatedFields });
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
    <Card className="w-full min-w-[20rem] max-w-[28rem] max-h-[90vh] overflow-hidden flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
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
      <CardContent className="flex-1 overflow-hidden p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="px-4 pb-2 border-b bg-background/50 flex-shrink-0">
            <TabsList className="grid w-full grid-cols-2 h-8 gap-0.5">
              <TabsTrigger value="basic" className="text-xs px-2 h-7">
                <Bot className="h-3 w-3" />
                <span className="ml-1 truncate">Basic</span>
              </TabsTrigger>
              <TabsTrigger value="variables" className="text-xs px-2 h-7">
                <Variable className="h-3 w-3" />
                <span className="ml-1 truncate">Vars</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Second row of tabs */}
            <TabsList className="grid w-full grid-cols-2 h-8 gap-0.5 mt-1">
              <TabsTrigger value="apis" className="text-xs px-2 h-7">
                <Code className="h-3 w-3" />
                <span className="ml-1 truncate">APIs</span>
              </TabsTrigger>
              <TabsTrigger value="storage" className="text-xs px-2 h-7">
                <Database className="h-3 w-3" />
                <span className="ml-1 truncate">Storage</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1 overflow-y-auto px-4 py-2">

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

                {dataStorage.storageType === 'database' && (
                  <div>
                    <Label htmlFor="target-table">Target Database Table</Label>
                    <Select
                      value={dataStorage.targetTable || ''}
                      onValueChange={(value) => updateDataStorage({ targetTable: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select existing table" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTables.map(table => (
                          <SelectItem key={table} value={table}>{table}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

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

                {/* Field Templates */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addFieldTemplate('patient_info')}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Patient Info
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addFieldTemplate('address_info')}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Address Fields
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={addStorageField}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Custom Field
                  </Button>
                </div>

                {/* Storage Fields Configuration */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Storage Fields</Label>
                  
                  {dataStorage.fields.map((field) => (
                    <Card key={field.id} className="p-3">
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            value={field.name}
                            onChange={(e) => updateStorageField(field.id, { name: e.target.value })}
                            placeholder="Field name (e.g., first_name)"
                            className="text-xs"
                          />
                          <div className="flex items-center gap-1">
                            <Select
                              value={field.type}
                              onValueChange={(value: any) => updateStorageField(field.id, { type: value })}
                            >
                              <SelectTrigger className="text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="string">Text</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="phone">Phone</SelectItem>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="date">Date</SelectItem>
                                <SelectItem value="boolean">Boolean</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeStorageField(field.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {dataStorage.storageType === 'database' && (
                          <div className="grid grid-cols-2 gap-2">
                            <Select
                              value={field.mappedTable || ''}
                              onValueChange={(value) => updateStorageField(field.id, { mappedTable: value })}
                            >
                              <SelectTrigger className="text-xs">
                                <SelectValue placeholder="Map to table" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableTables.map(table => (
                                  <SelectItem key={table} value={table}>{table}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              value={field.mappedColumn || ''}
                              onChange={(e) => updateStorageField(field.id, { mappedColumn: e.target.value })}
                              placeholder="Column name"
                              className="text-xs"
                            />
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            value={field.defaultValue || ''}
                            onChange={(e) => updateStorageField(field.id, { defaultValue: e.target.value })}
                            placeholder="Default value"
                            className="text-xs"
                          />
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={field.required}
                              onCheckedChange={(checked) => updateStorageField(field.id, { required: checked })}
                            />
                            <Label className="text-xs">Required</Label>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}

                  {dataStorage.fields.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground text-xs">
                      No fields configured. Use the buttons above to add patient info, address fields, or custom fields.
                    </div>
                  )}
                </div>

                <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                  <strong>Storage Options:</strong>
                  <br />• Memory: Fast, session-based (variables only)
                  <br />• Database: Persistent with table mapping (profiles, facilities, etc.)
                  <br />• Cache: Fast with TTL expiration (Redis-based)
                  <br />
                  <br /><strong>Field Mapping:</strong> When using database storage, fields can be mapped to existing table columns for direct data insertion.
                </div>
              </div>
            )}
          </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};