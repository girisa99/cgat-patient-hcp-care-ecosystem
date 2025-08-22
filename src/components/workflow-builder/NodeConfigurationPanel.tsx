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
import { useDatabaseSchema } from '@/hooks/useDatabaseSchema';
import { useWorkflowResources } from '@/hooks/useWorkflowResources';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WorkflowControls } from './WorkflowControls';

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
  const { libraries, actions, operators, isLoading: isLoadingResources } = useWorkflowResources({});
  const [selectedLibrary, setSelectedLibrary] = useState<string>('');
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [selectedOperator, setSelectedOperator] = useState<string>('');
  const [aiConfig, setAiConfig] = useState({
    prompt: node.data?.aiPrompt || '',
    temperature: node.data?.aiTemperature || 0.7,
    maxTokens: node.data?.aiMaxTokens || 1000,
    model: node.data?.aiModel || 'gpt-4o-mini'
  });

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

  // Available tables via schema hook
  const { tables, columnsByTable } = useDatabaseSchema();
  const availableTables = tables && tables.length > 0 
    ? tables
    : ['profiles', 'facilities', 'treatment_center_onboarding', 'agents', 'agent_conversations', 'api_keys', 'services'];

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
    <Card className="w-full min-w-[22rem] max-w-[32rem] h-[85vh] flex flex-col">
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
      <div className="px-4 pb-2 border-b bg-background/50">
        <WorkflowControls
          onSimulate={() => window.dispatchEvent(new CustomEvent('workflow:simulate'))}
          onSave={() => window.dispatchEvent(new CustomEvent('workflow:save'))}
          onLoad={() => window.dispatchEvent(new CustomEvent('workflow:load'))}
          onFitView={() => window.dispatchEvent(new CustomEvent('workflow:fitView'))}
          onDeploy={() => window.dispatchEvent(new CustomEvent('workflow:deploy'))}
        />
      </div>
      <CardContent className="flex-1 overflow-hidden p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="px-4 pb-2 border-b bg-background/50 flex-shrink-0">
            <TabsList className="flex w-full gap-1 rounded-none h-8 p-1 overflow-x-auto whitespace-nowrap">
              <TabsTrigger value="basic" className="text-xs px-3 h-7 min-w-fit font-medium">
                <Bot className="h-3 w-3" />
                <span className="ml-1 truncate">Basic</span>
              </TabsTrigger>
              <TabsTrigger value="variables" className="text-xs px-3 h-7 min-w-fit font-medium">
                <Variable className="h-3 w-3" />
                <span className="ml-1 truncate">Vars</span>
              </TabsTrigger>
              <TabsTrigger value="apis" className="text-xs px-3 h-7 min-w-fit font-medium">
                <Code className="h-3 w-3" />
                <span className="ml-1 truncate">APIs</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Second row of tabs */}
            <TabsList className="grid w-full grid-cols-3 h-8 gap-0.5 mt-1">
              <TabsTrigger value="storage" className="text-xs px-2 h-7">
                <Database className="h-3 w-3" />
                <span className="ml-1 truncate">Storage</span>
              </TabsTrigger>
              <TabsTrigger value="actions" className="text-xs px-2 h-7">
                <Archive className="h-3 w-3" />
                <span className="ml-1 truncate">Actions</span>
              </TabsTrigger>
              <TabsTrigger value="ai" className="text-xs px-2 h-7">
                <Bot className="h-3 w-3" />
                <span className="ml-1 truncate">AI</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="px-4 py-3">

          <TabsContent value="basic" className="space-y-6">
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

          <TabsContent value="variables" className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Variables</h4>
              <Button size="sm" onClick={addVariable}>
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>

            <div className="space-y-4">
              {variables.map((variable) => (
                <Card key={variable.id} className="p-4">
                  <div className="space-y-3">
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

          <TabsContent value="apis" className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">API Configurations</h4>
              <div className="flex gap-2">
                <Select onValueChange={(value) => {
                  if (value === 'patient') {
                    const patientAPI: APIConfiguration = {
                      id: `api_${Date.now()}`,
                      name: 'Patient API',
                      url: '/api/patients',
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      auth: { type: 'bearer', key: 'Authorization', value: 'Bearer {token}' },
                      enabled: true
                    };
                    const updatedAPIs = [...apis, patientAPI];
                    setApis(updatedAPIs);
                    onUpdate(node.id, { data: { ...node.data, apis: updatedAPIs } });
                  } else if (value === 'treatment') {
                    const treatmentAPI: APIConfiguration = {
                      id: `api_${Date.now()}`,
                      name: 'Treatment Center API',
                      url: '/api/treatment-centers',
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      auth: { type: 'bearer', key: 'Authorization', value: 'Bearer {token}' },
                      enabled: true
                    };
                    const updatedAPIs = [...apis, treatmentAPI];
                    setApis(updatedAPIs);
                    onUpdate(node.id, { data: { ...node.data, apis: updatedAPIs } });
                  } else if (value === 'onboarding') {
                    const onboardingAPI: APIConfiguration = {
                      id: `api_${Date.now()}`,
                      name: 'Onboarding API',
                      url: '/api/onboarding',
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      auth: { type: 'bearer', key: 'Authorization', value: 'Bearer {token}' },
                      enabled: true
                    };
                    const updatedAPIs = [...apis, onboardingAPI];
                    setApis(updatedAPIs);
                    onUpdate(node.id, { data: { ...node.data, apis: updatedAPIs } });
                  } else if (value === 'provider') {
                    const providerAPI: APIConfiguration = {
                      id: `api_${Date.now()}`,
                      name: 'Provider API',
                      url: '/api/providers',
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      auth: { type: 'bearer', key: 'Authorization', value: 'Bearer {token}' },
                      enabled: true
                    };
                    const updatedAPIs = [...apis, providerAPI];
                    setApis(updatedAPIs);
                    onUpdate(node.id, { data: { ...node.data, apis: updatedAPIs } });
                  }
                }}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Quick Add API" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patient">Patient API</SelectItem>
                    <SelectItem value="treatment">Treatment Center API</SelectItem>
                    <SelectItem value="onboarding">Onboarding API</SelectItem>
                    <SelectItem value="provider">Provider API</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={addAPI}>
                  <Plus className="h-3 w-3 mr-1" />
                  Custom API
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {apis.map((api) => (
                <Card key={api.id} className="p-4">
                  <div className="space-y-3">
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

          <TabsContent value="storage" className="space-y-6">
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
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Storage Fields</Label>
                  
                  {dataStorage.fields.map((field) => (
                    <Card key={field.id} className="p-4">
                      <div className="space-y-3">
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
                              onValueChange={(value) => updateStorageField(field.id, { mappedTable: value, mappedColumn: '' })}
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
                            {field.mappedTable && columnsByTable?.[field.mappedTable]?.length ? (
                              <Select
                                value={field.mappedColumn || ''}
                                onValueChange={(value) => updateStorageField(field.id, { mappedColumn: value })}
                              >
                                <SelectTrigger className="text-xs">
                                  <SelectValue placeholder="Column name" />
                                </SelectTrigger>
                                <SelectContent>
                                  {columnsByTable[field.mappedTable].map((col) => (
                                    <SelectItem key={col} value={col}>{col}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                value={field.mappedColumn || ''}
                                onChange={(e) => updateStorageField(field.id, { mappedColumn: e.target.value })}
                                placeholder="Column name"
                                className="text-xs"
                              />
                            )}
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

          <TabsContent value="actions" className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Workflow Actions</h4>
              <Badge variant="outline" className="text-xs">
                {isLoadingResources ? 'Loading...' : `${libraries?.length || 0} Libraries`}
              </Badge>
            </div>

            {/* Libraries Section */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Available Libraries</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {libraries?.map((library) => (
                  <Card key={library.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h5 className="text-xs font-medium">{library.name}</h5>
                        <p className="text-xs text-muted-foreground truncate">{library.description}</p>
                      </div>
                      <Button
                        size="sm"
                        variant={selectedLibrary === library.id ? "default" : "outline"}
                        onClick={() => setSelectedLibrary(library.id)}
                      >
                        {selectedLibrary === library.id ? 'Selected' : 'Select'}
                      </Button>
                    </div>
                  </Card>
                ))}
                
                {(!libraries || libraries.length === 0) && (
                  <div className="text-center py-4 text-muted-foreground text-xs">
                    No libraries available. Create libraries in the workflow resources panel.
                  </div>
                )}
              </div>
            </div>

            {/* Actions Section */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Available Actions</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {actions?.map((action) => (
                  <Card key={action.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h5 className="text-xs font-medium">{action.name}</h5>
                        <p className="text-xs text-muted-foreground truncate">{action.description}</p>
                        <Badge variant="secondary" className="text-xs">{action.category}</Badge>
                      </div>
                      <Button
                        size="sm"
                        variant={selectedAction === action.id ? "default" : "outline"}
                        onClick={() => setSelectedAction(action.id)}
                      >
                        {selectedAction === action.id ? 'Selected' : 'Select'}
                      </Button>
                    </div>
                  </Card>
                ))}
                
                {(!actions || actions.length === 0) && (
                  <div className="text-center py-4 text-muted-foreground text-xs">
                    No actions available. Create actions in the workflow resources panel.
                  </div>
                )}
              </div>
            </div>

            {/* Operators Section */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Available Operators</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {operators?.map((operator) => (
                  <Card key={operator.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h5 className="text-xs font-medium">{operator.name}</h5>
                        <p className="text-xs text-muted-foreground truncate">{operator.description}</p>
                        <Badge variant="secondary" className="text-xs">{operator.category || 'Operator'}</Badge>
                      </div>
                      <Button
                        size="sm"
                        variant={selectedOperator === operator.id ? "default" : "outline"}
                        onClick={() => setSelectedOperator(operator.id)}
                      >
                        {selectedOperator === operator.id ? 'Selected' : 'Select'}
                      </Button>
                    </div>
                  </Card>
                ))}
                
                {(!operators || operators.length === 0) && (
                  <div className="text-center py-4 text-muted-foreground text-xs">
                    No operators available. Create operators in the workflow resources panel.
                  </div>
                )}
              </div>
            </div>

            {/* Apply Selected Resources */}
            {(selectedLibrary || selectedAction || selectedOperator) && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Apply to Node</Label>
                <Button
                  onClick={() => {
                    const updates: any = {};
                    if (selectedLibrary) updates.selectedLibrary = selectedLibrary;
                    if (selectedAction) updates.selectedAction = selectedAction;
                    if (selectedOperator) updates.selectedOperator = selectedOperator;
                    
                    onUpdate(node.id, {
                      data: { ...node.data, ...updates }
                    });
                    showSuccess('Workflow resources applied to node');
                  }}
                  className="w-full"
                >
                  Apply Selected Resources
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">AI Configuration</h4>
              <Badge variant="outline" className="text-xs">
                Model: {aiConfig.model}
              </Badge>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="ai-prompt">AI Prompt</Label>
                <Textarea
                  id="ai-prompt"
                  value={aiConfig.prompt}
                  onChange={(e) => setAiConfig({ ...aiConfig, prompt: e.target.value })}
                  placeholder="Enter AI system prompt or instructions..."
                  rows={4}
                  className="text-xs"
                />
              </div>

              <div>
                <Label htmlFor="ai-model-select">AI Model</Label>
                <Select
                  value={aiConfig.model}
                  onValueChange={(value) => setAiConfig({ ...aiConfig, model: value })}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="temperature">Temperature</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    value={aiConfig.temperature}
                    onChange={(e) => setAiConfig({ ...aiConfig, temperature: parseFloat(e.target.value) })}
                    className="text-xs"
                  />
                  <div className="text-xs text-muted-foreground mt-1">0.0 = Focused, 2.0 = Creative</div>
                </div>

                <div>
                  <Label htmlFor="max-tokens">Max Tokens</Label>
                  <Input
                    id="max-tokens"
                    type="number"
                    min="1"
                    max="4000"
                    value={aiConfig.maxTokens}
                    onChange={(e) => setAiConfig({ ...aiConfig, maxTokens: parseInt(e.target.value) })}
                    className="text-xs"
                  />
                  <div className="text-xs text-muted-foreground mt-1">Max response length</div>
                </div>
              </div>

              <Button
                onClick={() => {
                  onUpdate(node.id, {
                    data: { 
                      ...node.data, 
                      aiPrompt: aiConfig.prompt,
                      aiModel: aiConfig.model,
                      aiTemperature: aiConfig.temperature,
                      aiMaxTokens: aiConfig.maxTokens
                    }
                  });
                  showSuccess('AI configuration updated');
                }}
                className="w-full"
              >
                Apply AI Configuration
              </Button>

              <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                <strong>AI Configuration:</strong>
                <br />• Prompt: System instructions for the AI model
                <br />• Temperature: Controls randomness (0.0-2.0)
                <br />• Max Tokens: Maximum response length
                <br />• Model: AI model to use for processing
              </div>
            </div>
          </TabsContent>

            </div>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
};