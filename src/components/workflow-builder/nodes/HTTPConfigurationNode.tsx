import React, { useState, useEffect } from 'react';
import { BaseWorkflowNode } from './BaseWorkflowNode';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Globe, Key, FileText, Settings } from 'lucide-react';

export const HTTPConfigurationNode: React.FC<{ id: string; data: any; selected: boolean }> = ({ id, data, selected }) => {
  const [config, setConfig] = useState({
    // HTTP Request Configuration
    method: data.method || 'GET',
    url: data.url || '',
    
    // Headers
    headers: data.headers || [],
    
    // Query Parameters
    query_params: data.query_params || [],
    
    // Request Body
    body_type: data.body_type || 'json',
    body_content: data.body_content || '',
    
    // Authentication
    auth_type: data.auth_type || 'none',
    auth_token: data.auth_token || '',
    auth_username: data.auth_username || '',
    auth_password: data.auth_password || '',
    api_key: data.api_key || '',
    api_key_header: data.api_key_header || 'X-API-Key',
    
    // Response Processing
    response_format: data.response_format || 'json',
    response_path: data.response_path || '',
    error_handling: data.error_handling || 'throw',
    
    // Timeout and Retry
    timeout_ms: data.timeout_ms || 30000,
    retry_attempts: data.retry_attempts || 3,
    retry_delay_ms: data.retry_delay_ms || 1000,
    
    // Variables
    input_variables: data.input_variables || [],
    output_variables: data.output_variables || [],
    
    // Webhook Configuration (if applicable)
    webhook_secret: data.webhook_secret || '',
    webhook_verify_signature: data.webhook_verify_signature || false,
    
    // SSL/TLS Configuration
    verify_ssl: data.verify_ssl || true,
    custom_ca_cert: data.custom_ca_cert || '',
    
    // Proxy Configuration
    use_proxy: data.use_proxy || false,
    proxy_url: data.proxy_url || ''
  });
  
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (typeof data?.configOpen !== 'undefined') {
      setIsExpanded(!!data.configOpen);
    }
  }, [data?.configOpen]);

  const updateConfig = (updates: Partial<typeof config>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const addHeader = () => {
    updateConfig({
      headers: [...config.headers, { key: '', value: '', description: '' }]
    });
  };

  const updateHeader = (index: number, field: string, value: string) => {
    const updated = [...config.headers];
    updated[index] = { ...updated[index], [field]: value };
    updateConfig({ headers: updated });
  };

  const removeHeader = (index: number) => {
    updateConfig({
      headers: config.headers.filter((_, i) => i !== index)
    });
  };

  const addQueryParam = () => {
    updateConfig({
      query_params: [...config.query_params, { key: '', value: '', description: '' }]
    });
  };

  const updateQueryParam = (index: number, field: string, value: string) => {
    const updated = [...config.query_params];
    updated[index] = { ...updated[index], [field]: value };
    updateConfig({ query_params: updated });
  };

  const removeQueryParam = (index: number) => {
    updateConfig({
      query_params: config.query_params.filter((_, i) => i !== index)
    });
  };

  const addVariable = (type: 'input' | 'output') => {
    const field = type === 'input' ? 'input_variables' : 'output_variables';
    updateConfig({
      [field]: [...config[field], { name: '', type: 'string', description: '', source: '' }]
    });
  };

  const updateVariable = (type: 'input' | 'output', index: number, field: string, value: any) => {
    const configField = type === 'input' ? 'input_variables' : 'output_variables';
    const updated = [...config[configField]];
    updated[index] = { ...updated[index], [field]: value };
    updateConfig({ [configField]: updated });
  };

  const removeVariable = (type: 'input' | 'output', index: number) => {
    const field = type === 'input' ? 'input_variables' : 'output_variables';
    updateConfig({
      [field]: config[field].filter((_, i) => i !== index)
    });
  };

  const httpMethods = [
    { value: 'GET', label: 'GET' },
    { value: 'POST', label: 'POST' },
    { value: 'PUT', label: 'PUT' },
    { value: 'PATCH', label: 'PATCH' },
    { value: 'DELETE', label: 'DELETE' },
    { value: 'HEAD', label: 'HEAD' },
    { value: 'OPTIONS', label: 'OPTIONS' }
  ];

  const bodyTypes = [
    { value: 'json', label: 'JSON' },
    { value: 'form', label: 'Form Data' },
    { value: 'text', label: 'Plain Text' },
    { value: 'xml', label: 'XML' },
    { value: 'binary', label: 'Binary' }
  ];

  const authTypes = [
    { value: 'none', label: 'None' },
    { value: 'bearer', label: 'Bearer Token' },
    { value: 'basic', label: 'Basic Auth' },
    { value: 'api_key', label: 'API Key' },
    { value: 'oauth2', label: 'OAuth 2.0' }
  ];

  const responseFormats = [
    { value: 'json', label: 'JSON' },
    { value: 'text', label: 'Text' },
    { value: 'xml', label: 'XML' },
    { value: 'html', label: 'HTML' },
    { value: 'binary', label: 'Binary' }
  ];

  const errorHandlingOptions = [
    { value: 'throw', label: 'Throw Error' },
    { value: 'continue', label: 'Continue with null' },
    { value: 'retry', label: 'Retry Request' },
    { value: 'fallback', label: 'Use Fallback Value' }
  ];

  const variableTypes = [
    { value: 'string', label: 'String' },
    { value: 'number', label: 'Number' },
    { value: 'boolean', label: 'Boolean' },
    { value: 'object', label: 'Object' },
    { value: 'array', label: 'Array' }
  ];

  return (
    <BaseWorkflowNode
      id={id}
      data={data}
      selected={selected}
      icon={Globe}
      title={`${data.display_name || 'HTTP Request'} - ${config.method}`}
    >
      <div className="text-xs text-muted-foreground mb-2">
        <Badge variant="secondary" className="mr-1">
          {config.method}
        </Badge>
        {config.auth_type !== 'none' && (
          <Badge variant="outline" className="mr-1">{config.auth_type}</Badge>
        )}
        {config.headers.length > 0 && (
          <Badge variant="outline">{config.headers.length} Headers</Badge>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-4 mt-4">
          {/* HTTP Request Configuration */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Globe className="w-4 h-4" />
                HTTP Request
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Method</Label>
                  <Select value={config.method} onValueChange={(value) => updateConfig({ method: value })}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {httpMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">URL</Label>
                  <Input
                    className="h-8"
                    value={config.url}
                    onChange={(e) => updateConfig({ url: e.target.value })}
                    placeholder="https://api.example.com/endpoint"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Timeout (ms)</Label>
                  <Input
                    type="number"
                    className="h-8"
                    value={config.timeout_ms}
                    onChange={(e) => updateConfig({ timeout_ms: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Retry Attempts</Label>
                  <Input
                    type="number"
                    className="h-8"
                    value={config.retry_attempts}
                    onChange={(e) => updateConfig({ retry_attempts: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Retry Delay (ms)</Label>
                  <Input
                    type="number"
                    className="h-8"
                    value={config.retry_delay_ms}
                    onChange={(e) => updateConfig({ retry_delay_ms: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Authentication */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Key className="w-4 h-4" />
                Authentication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Auth Type</Label>
                <Select value={config.auth_type} onValueChange={(value) => updateConfig({ auth_type: value })}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {authTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {config.auth_type === 'bearer' && (
                <div>
                  <Label className="text-xs">Bearer Token</Label>
                  <Input
                    type="password"
                    className="h-8"
                    value={config.auth_token}
                    onChange={(e) => updateConfig({ auth_token: e.target.value })}
                    placeholder="Your bearer token"
                  />
                </div>
              )}

              {config.auth_type === 'basic' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Username</Label>
                    <Input
                      className="h-8"
                      value={config.auth_username}
                      onChange={(e) => updateConfig({ auth_username: e.target.value })}
                      placeholder="Username"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Password</Label>
                    <Input
                      type="password"
                      className="h-8"
                      value={config.auth_password}
                      onChange={(e) => updateConfig({ auth_password: e.target.value })}
                      placeholder="Password"
                    />
                  </div>
                </div>
              )}

              {config.auth_type === 'api_key' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">API Key Header</Label>
                    <Input
                      className="h-8"
                      value={config.api_key_header}
                      onChange={(e) => updateConfig({ api_key_header: e.target.value })}
                      placeholder="X-API-Key"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">API Key</Label>
                    <Input
                      type="password"
                      className="h-8"
                      value={config.api_key}
                      onChange={(e) => updateConfig({ api_key: e.target.value })}
                      placeholder="Your API key"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Headers */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                Headers
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addHeader}
                  className="ml-auto h-6 w-6 p-0"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {config.headers.map((header, index) => (
                <div key={index} className="border rounded p-2 space-y-2">
                  <div className="flex gap-2 items-center">
                    <Input
                      className="h-8 flex-1"
                      value={header.key}
                      onChange={(e) => updateHeader(index, 'key', e.target.value)}
                      placeholder="Header name"
                    />
                    <Input
                      className="h-8 flex-1"
                      value={header.value}
                      onChange={(e) => updateHeader(index, 'value', e.target.value)}
                      placeholder="Header value"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeHeader(index)}
                      className="h-6 w-6 p-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <Input
                    className="h-8"
                    value={header.description}
                    onChange={(e) => updateHeader(index, 'description', e.target.value)}
                    placeholder="Header description (optional)"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Query Parameters */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                Query Parameters
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addQueryParam}
                  className="ml-auto h-6 w-6 p-0"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {config.query_params.map((param, index) => (
                <div key={index} className="border rounded p-2 space-y-2">
                  <div className="flex gap-2 items-center">
                    <Input
                      className="h-8 flex-1"
                      value={param.key}
                      onChange={(e) => updateQueryParam(index, 'key', e.target.value)}
                      placeholder="Parameter name"
                    />
                    <Input
                      className="h-8 flex-1"
                      value={param.value}
                      onChange={(e) => updateQueryParam(index, 'value', e.target.value)}
                      placeholder="Parameter value"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeQueryParam(index)}
                      className="h-6 w-6 p-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Request Body */}
          {(['POST', 'PUT', 'PATCH'].includes(config.method)) && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Request Body
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Body Type</Label>
                  <Select value={config.body_type} onValueChange={(value) => updateConfig({ body_type: value })}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {bodyTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Body Content</Label>
                  <Textarea
                    className="min-h-24 text-xs font-mono"
                    value={config.body_content}
                    onChange={(e) => updateConfig({ body_content: e.target.value })}
                    placeholder={config.body_type === 'json' ? '{"key": "value"}' : 'Request body content...'}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Response Processing */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Response Processing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Response Format</Label>
                  <Select value={config.response_format} onValueChange={(value) => updateConfig({ response_format: value })}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {responseFormats.map((format) => (
                        <SelectItem key={format.value} value={format.value}>{format.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Error Handling</Label>
                  <Select value={config.error_handling} onValueChange={(value) => updateConfig({ error_handling: value })}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {errorHandlingOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-xs">Response Path (JSONPath/XPath)</Label>
                <Input
                  className="h-8"
                  value={config.response_path}
                  onChange={(e) => updateConfig({ response_path: e.target.value })}
                  placeholder="$.data.result or //response/data"
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.verify_ssl}
                    onCheckedChange={(checked) => updateConfig({ verify_ssl: checked })}
                  />
                  <Label className="text-xs">Verify SSL</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.use_proxy}
                    onCheckedChange={(checked) => updateConfig({ use_proxy: checked })}
                  />
                  <Label className="text-xs">Use Proxy</Label>
                </div>
              </div>

              {config.use_proxy && (
                <div>
                  <Label className="text-xs">Proxy URL</Label>
                  <Input
                    className="h-8"
                    value={config.proxy_url}
                    onChange={(e) => updateConfig({ proxy_url: e.target.value })}
                    placeholder="http://proxy.example.com:8080"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Input Variables */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                Input Variables
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addVariable('input')}
                  className="ml-auto h-6 w-6 p-0"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {config.input_variables.map((variable, index) => (
                <div key={index} className="border rounded p-2 space-y-2">
                  <div className="flex gap-2 items-center">
                    <Input
                      className="h-8 flex-1"
                      value={variable.name}
                      onChange={(e) => updateVariable('input', index, 'name', e.target.value)}
                      placeholder="Variable name"
                    />
                    <Select
                      value={variable.type}
                      onValueChange={(value) => updateVariable('input', index, 'type', value)}
                    >
                      <SelectTrigger className="h-8 w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {variableTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeVariable('input', index)}
                      className="h-6 w-6 p-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <Input
                    className="h-8"
                    value={variable.source}
                    onChange={(e) => updateVariable('input', index, 'source', e.target.value)}
                    placeholder="Variable source (e.g., flow_state.user_id)"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Output Variables */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                Output Variables
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addVariable('output')}
                  className="ml-auto h-6 w-6 p-0"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {config.output_variables.map((variable, index) => (
                <div key={index} className="border rounded p-2 space-y-2">
                  <div className="flex gap-2 items-center">
                    <Input
                      className="h-8 flex-1"
                      value={variable.name}
                      onChange={(e) => updateVariable('output', index, 'name', e.target.value)}
                      placeholder="Variable name"
                    />
                    <Select
                      value={variable.type}
                      onValueChange={(value) => updateVariable('output', index, 'type', value)}
                    >
                      <SelectTrigger className="h-8 w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {variableTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeVariable('output', index)}
                      className="h-6 w-6 p-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <Input
                    className="h-8"
                    value={variable.source}
                    onChange={(e) => updateVariable('output', index, 'source', e.target.value)}
                    placeholder="Response path (e.g., $.data.result)"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </BaseWorkflowNode>
  );
};