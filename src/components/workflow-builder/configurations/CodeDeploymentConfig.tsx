import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Code, Container, Webhook, Globe, Plus, Trash2, GitBranch } from 'lucide-react';

interface CodeDeploymentConfigProps {
  nodeType: string;
  configuration: any;
  onChange: (config: any) => void;
  form: any;
}

export const CodeDeploymentConfig: React.FC<CodeDeploymentConfigProps> = ({
  nodeType,
  configuration,
  onChange,
  form
}) => {
  const renderAPIEndpoint = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-500" />
          API Endpoint Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="endpointPath"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endpoint Path *</FormLabel>
              <FormControl>
                <Input placeholder="/api/v1/workflow" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="httpMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>HTTP Method *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || 'POST'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="authentication"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Authentication Method</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select authentication method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">🔓 None</SelectItem>
                  <SelectItem value="api-key">🔑 API Key</SelectItem>
                  <SelectItem value="bearer-token">🎫 Bearer Token</SelectItem>
                  <SelectItem value="basic-auth">🔐 Basic Auth</SelectItem>
                  <SelectItem value="oauth2">🛡️ OAuth 2.0</SelectItem>
                  <SelectItem value="jwt">📜 JWT</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {/* Request/Response Schema */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="requestSchema"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Request Schema (JSON)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='{"type": "object", "properties": {...}}'
                    rows={4}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="responseSchema"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Response Schema (JSON)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='{"type": "object", "properties": {...}}'
                    rows={4}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="rateLimitEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Rate Limiting</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="corsEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>CORS Enabled</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="loggingEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Request Logging</FormLabel>
              </FormItem>
            )}
          />
        </div>

        {configuration.rateLimitEnabled && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="rateLimitRequests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requests per Minute</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="100" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rateLimitWindow"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Window (seconds)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="60" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderDockerContainer = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Container className="h-5 w-5 text-blue-600" />
          Docker Container Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="baseImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Base Image *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select base image" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="node:18-alpine">🟢 Node.js 18 Alpine</SelectItem>
                  <SelectItem value="python:3.11-slim">🐍 Python 3.11 Slim</SelectItem>
                  <SelectItem value="nginx:alpine">🌐 Nginx Alpine</SelectItem>
                  <SelectItem value="ubuntu:22.04">🐧 Ubuntu 22.04</SelectItem>
                  <SelectItem value="redis:alpine">📦 Redis Alpine</SelectItem>
                  <SelectItem value="postgres:15">🐘 PostgreSQL 15</SelectItem>
                  <SelectItem value="custom">🛠️ Custom Image</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {configuration.baseImage === 'custom' && (
          <FormField
            control={form.control}
            name="customImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custom Image *</FormLabel>
                <FormControl>
                  <Input placeholder="your-registry/your-image:tag" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="dockerfile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dockerfile</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="FROM node:18-alpine..."
                  rows={6}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Port Mappings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>Port Mappings</FormLabel>
            <Button 
              type="button"
              variant="outline" 
              size="sm"
              onClick={() => {
                const ports = configuration.portMappings || [];
                onChange({ 
                  ...configuration, 
                  portMappings: [...ports, { hostPort: '', containerPort: '', protocol: 'tcp' }] 
                });
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Port
            </Button>
          </div>
          
          {(configuration.portMappings || []).map((port: any, index: number) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-2">
                <Input
                  value={port.hostPort || ''}
                  onChange={(e) => {
                    const ports = [...(configuration.portMappings || [])];
                    ports[index] = { ...ports[index], hostPort: e.target.value };
                    onChange({ ...configuration, portMappings: ports });
                  }}
                  placeholder="Host port"
                  type="number"
                />
                <span>:</span>
                <Input
                  value={port.containerPort || ''}
                  onChange={(e) => {
                    const ports = [...(configuration.portMappings || [])];
                    ports[index] = { ...ports[index], containerPort: e.target.value };
                    onChange({ ...configuration, portMappings: ports });
                  }}
                  placeholder="Container port"
                  type="number"
                />
                <Select
                  value={port.protocol || 'tcp'}
                  onValueChange={(value) => {
                    const ports = [...(configuration.portMappings || [])];
                    ports[index] = { ...ports[index], protocol: value };
                    onChange({ ...configuration, portMappings: ports });
                  }}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tcp">TCP</SelectItem>
                    <SelectItem value="udp">UDP</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const ports = [...(configuration.portMappings || [])];
                    ports.splice(index, 1);
                    onChange({ ...configuration, portMappings: ports });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Environment Variables */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>Environment Variables</FormLabel>
            <Button 
              type="button"
              variant="outline" 
              size="sm"
              onClick={() => {
                const envVars = configuration.environmentVariables || [];
                onChange({ 
                  ...configuration, 
                  environmentVariables: [...envVars, { key: '', value: '', secret: false }] 
                });
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Variable
            </Button>
          </div>
          
          {(configuration.environmentVariables || []).map((envVar: any, index: number) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-2">
                <Input
                  value={envVar.key || ''}
                  onChange={(e) => {
                    const vars = [...(configuration.environmentVariables || [])];
                    vars[index] = { ...vars[index], key: e.target.value };
                    onChange({ ...configuration, environmentVariables: vars });
                  }}
                  placeholder="Variable name"
                />
                <Input
                  type={envVar.secret ? 'password' : 'text'}
                  value={envVar.value || ''}
                  onChange={(e) => {
                    const vars = [...(configuration.environmentVariables || [])];
                    vars[index] = { ...vars[index], value: e.target.value };
                    onChange({ ...configuration, environmentVariables: vars });
                  }}
                  placeholder="Variable value"
                />
                <Switch
                  checked={envVar.secret}
                  onCheckedChange={(checked) => {
                    const vars = [...(configuration.environmentVariables || [])];
                    vars[index] = { ...vars[index], secret: checked };
                    onChange({ ...configuration, environmentVariables: vars });
                  }}
                />
                <span className="text-xs">Secret</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const vars = [...(configuration.environmentVariables || [])];
                    vars.splice(index, 1);
                    onChange({ ...configuration, environmentVariables: vars });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cpuLimit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPU Limit (cores)</FormLabel>
                <FormControl>
                  <Input placeholder="0.5" step="0.1" type="number" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="memoryLimit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Memory Limit (MB)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="512" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderWebhookListener = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Webhook className="h-5 w-5 text-purple-500" />
          Webhook Listener Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="webhookUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Webhook URL Path *</FormLabel>
              <FormControl>
                <Input placeholder="/webhooks/github" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expectedMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expected HTTP Method</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || 'POST'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                  <SelectItem value="GET">GET</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="secretKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Secret Key (for verification)</FormLabel>
              <FormControl>
                <Input type="password" placeholder="webhook-secret-key" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="signatureHeader"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Signature Header</FormLabel>
              <FormControl>
                <Input placeholder="X-Hub-Signature-256" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="payloadProcessing"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payload Processing</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || 'json'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="json">Parse as JSON</SelectItem>
                  <SelectItem value="form">Parse as Form Data</SelectItem>
                  <SelectItem value="text">Keep as Text</SelectItem>
                  <SelectItem value="xml">Parse as XML</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="verifySignature"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Verify Signature</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="logPayloads"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Log Payloads</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableRetries"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Enable Retries</FormLabel>
              </FormItem>
            )}
          />
        </div>

        {/* Webhook Filters */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>Payload Filters</FormLabel>
            <Button 
              type="button"
              variant="outline" 
              size="sm"
              onClick={() => {
                const filters = configuration.payloadFilters || [];
                onChange({ 
                  ...configuration, 
                  payloadFilters: [...filters, { path: '', operator: 'equals', value: '' }] 
                });
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Filter
            </Button>
          </div>
          
          {(configuration.payloadFilters || []).map((filter: any, index: number) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-2">
                <Input
                  value={filter.path || ''}
                  onChange={(e) => {
                    const filters = [...(configuration.payloadFilters || [])];
                    filters[index] = { ...filters[index], path: e.target.value };
                    onChange({ ...configuration, payloadFilters: filters });
                  }}
                  placeholder="JSON path (e.g., event.type)"
                />
                <Select
                  value={filter.operator || 'equals'}
                  onValueChange={(value) => {
                    const filters = [...(configuration.payloadFilters || [])];
                    filters[index] = { ...filters[index], operator: value };
                    onChange({ ...configuration, payloadFilters: filters });
                  }}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="contains">Contains</SelectItem>
                    <SelectItem value="starts_with">Starts With</SelectItem>
                    <SelectItem value="regex">Regex</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  value={filter.value || ''}
                  onChange={(e) => {
                    const filters = [...(configuration.payloadFilters || [])];
                    filters[index] = { ...filters[index], value: e.target.value };
                    onChange({ ...configuration, payloadFilters: filters });
                  }}
                  placeholder="Expected value"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const filters = [...(configuration.payloadFilters || [])];
                    filters.splice(index, 1);
                    onChange({ ...configuration, payloadFilters: filters });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderDeploymentPipeline = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-green-500" />
          Deployment Pipeline Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="pipelineType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pipeline Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pipeline type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ci-cd">🔄 CI/CD Pipeline</SelectItem>
                  <SelectItem value="blue-green">🔵 Blue-Green Deployment</SelectItem>
                  <SelectItem value="canary">🐤 Canary Deployment</SelectItem>
                  <SelectItem value="rolling">📊 Rolling Update</SelectItem>
                  <SelectItem value="custom">🛠️ Custom Pipeline</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="triggerConditions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trigger Conditions</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select trigger" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="manual">🖱️ Manual Trigger</SelectItem>
                  <SelectItem value="git-push">📤 Git Push</SelectItem>
                  <SelectItem value="pull-request">🔀 Pull Request</SelectItem>
                  <SelectItem value="schedule">⏰ Scheduled</SelectItem>
                  <SelectItem value="webhook">🪝 Webhook</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="buildSteps"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Build Steps</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="npm install&#10;npm run build&#10;npm test"
                  rows={4}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="deploymentTarget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deployment Target</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select deployment target" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="kubernetes">☸️ Kubernetes</SelectItem>
                  <SelectItem value="docker">🐳 Docker</SelectItem>
                  <SelectItem value="aws">☁️ AWS</SelectItem>
                  <SelectItem value="gcp">🌩️ Google Cloud</SelectItem>
                  <SelectItem value="azure">🔵 Azure</SelectItem>
                  <SelectItem value="vercel">▲ Vercel</SelectItem>
                  <SelectItem value="netlify">🌐 Netlify</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="autoRollback"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Auto Rollback</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="runTests"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Run Tests</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="approvalRequired"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Approval Required</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderGenericDeployment = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          {nodeType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="deploymentName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deployment Name *</FormLabel>
              <FormControl>
                <Input placeholder="Enter deployment name" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="configuration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Configuration</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter deployment configuration..."
                  rows={4}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="autoStart"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Auto Start</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="monitoringEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Enable Monitoring</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  // Main render logic based on node type
  switch (nodeType) {
    case 'api_endpoint':
      return renderAPIEndpoint();
    case 'docker_container':
      return renderDockerContainer();
    case 'webhook_listener':
      return renderWebhookListener();
    case 'deployment_pipeline':
      return renderDeploymentPipeline();
    case 'kubernetes_pod':
    case 'code_snippet':
    default:
      return renderGenericDeployment();
  }
};