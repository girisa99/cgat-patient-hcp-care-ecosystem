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
import { Plus, Trash2, Server, Shield, Monitor, AlertTriangle } from 'lucide-react';

export const DeploymentEnvironmentConfigurationNode: React.FC<{ id: string; data: any; selected: boolean }> = ({ id, data, selected }) => {
  const [config, setConfig] = useState({
    // Environment Configuration
    environment_type: data.environment_type || 'development',
    environment_name: data.environment_name || '',
    
    // Infrastructure Configuration
    cloud_provider: data.cloud_provider || 'supabase',
    region: data.region || 'us-east-1',
    compute_type: data.compute_type || 'serverless',
    
    // Resource Allocation
    cpu_limit: data.cpu_limit || '1000m',
    memory_limit: data.memory_limit || '512Mi',
    storage_limit: data.storage_limit || '10Gi',
    
    // Scaling Configuration
    auto_scaling_enabled: data.auto_scaling_enabled || true,
    min_instances: data.min_instances || 1,
    max_instances: data.max_instances || 10,
    scaling_metric: data.scaling_metric || 'cpu_utilization',
    scaling_threshold: data.scaling_threshold || 70,
    
    // Environment Variables
    environment_variables: data.environment_variables || [],
    secrets: data.secrets || [],
    
    // Security Configuration
    access_control: data.access_control || 'private',
    ssl_enabled: data.ssl_enabled || true,
    custom_domain: data.custom_domain || '',
    
    // Monitoring & Logging
    monitoring_enabled: data.monitoring_enabled || true,
    log_level: data.log_level || 'info',
    metrics_retention_days: data.metrics_retention_days || 30,
    
    // Health Checks
    health_check_enabled: data.health_check_enabled || true,
    health_check_path: data.health_check_path || '/health',
    health_check_interval: data.health_check_interval || 30,
    health_check_timeout: data.health_check_timeout || 10,
    
    // Deployment Configuration
    deployment_strategy: data.deployment_strategy || 'rolling',
    rollback_on_failure: data.rollback_on_failure || true,
    max_unavailable: data.max_unavailable || 1,
    max_surge: data.max_surge || 1,
    
    // Backup & Recovery
    backup_enabled: data.backup_enabled || false,
    backup_schedule: data.backup_schedule || '0 2 * * *',
    retention_period_days: data.retention_period_days || 7,
    
    // Cost Optimization
    cost_alerts_enabled: data.cost_alerts_enabled || false,
    monthly_budget_limit: data.monthly_budget_limit || 100,
    auto_shutdown_enabled: data.auto_shutdown_enabled || false,
    shutdown_schedule: data.shutdown_schedule || '22:00-06:00'
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

  const addEnvironmentVariable = () => {
    updateConfig({
      environment_variables: [...config.environment_variables, { key: '', value: '', description: '' }]
    });
  };

  const updateEnvironmentVariable = (index: number, field: string, value: string) => {
    const updated = [...config.environment_variables];
    updated[index] = { ...updated[index], [field]: value };
    updateConfig({ environment_variables: updated });
  };

  const removeEnvironmentVariable = (index: number) => {
    updateConfig({
      environment_variables: config.environment_variables.filter((_, i) => i !== index)
    });
  };

  const addSecret = () => {
    updateConfig({
      secrets: [...config.secrets, { key: '', description: '', required: true }]
    });
  };

  const updateSecret = (index: number, field: string, value: any) => {
    const updated = [...config.secrets];
    updated[index] = { ...updated[index], [field]: value };
    updateConfig({ secrets: updated });
  };

  const removeSecret = (index: number) => {
    updateConfig({
      secrets: config.secrets.filter((_, i) => i !== index)
    });
  };

  const environmentTypes = [
    { value: 'development', label: 'Development' },
    { value: 'testing', label: 'Testing' },
    { value: 'uat', label: 'UAT' },
    { value: 'staging', label: 'Staging' },
    { value: 'production', label: 'Production' }
  ];

  const cloudProviders = [
    { value: 'supabase', label: 'Supabase' },
    { value: 'aws', label: 'AWS' },
    { value: 'gcp', label: 'Google Cloud' },
    { value: 'azure', label: 'Microsoft Azure' },
    { value: 'vercel', label: 'Vercel' },
    { value: 'netlify', label: 'Netlify' }
  ];

  const computeTypes = [
    { value: 'serverless', label: 'Serverless' },
    { value: 'container', label: 'Container' },
    { value: 'vm', label: 'Virtual Machine' },
    { value: 'kubernetes', label: 'Kubernetes' }
  ];

  const deploymentStrategies = [
    { value: 'rolling', label: 'Rolling Update' },
    { value: 'blue_green', label: 'Blue-Green' },
    { value: 'canary', label: 'Canary' },
    { value: 'recreate', label: 'Recreate' }
  ];

  const scalingMetrics = [
    { value: 'cpu_utilization', label: 'CPU Utilization' },
    { value: 'memory_utilization', label: 'Memory Utilization' },
    { value: 'request_count', label: 'Request Count' },
    { value: 'response_time', label: 'Response Time' }
  ];

  const logLevels = [
    { value: 'error', label: 'Error' },
    { value: 'warn', label: 'Warning' },
    { value: 'info', label: 'Info' },
    { value: 'debug', label: 'Debug' },
    { value: 'trace', label: 'Trace' }
  ];

  const accessControlTypes = [
    { value: 'private', label: 'Private' },
    { value: 'public', label: 'Public' },
    { value: 'whitelist', label: 'IP Whitelist' },
    { value: 'vpn', label: 'VPN Only' }
  ];

  const getEnvironmentIcon = () => {
    switch (config.environment_type) {
      case 'production': return Shield;
      case 'staging': return AlertTriangle;
      default: return Server;
    }
  };

  const EnvironmentIcon = getEnvironmentIcon();

  return (
    <BaseWorkflowNode
      id={id}
      data={data}
      selected={selected}
      icon={EnvironmentIcon}
      title={`${data.display_name || 'Deployment Environment'} - ${config.environment_type}`}
    >
      <div className="text-xs text-muted-foreground mb-2">
        <Badge variant="secondary" className="mr-1">
          {config.environment_type}
        </Badge>
        <Badge variant="outline" className="mr-1">{config.cloud_provider}</Badge>
        {config.auto_scaling_enabled && (
          <Badge variant="outline">Auto-Scale</Badge>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-4 mt-4">
          {/* Environment Configuration */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Server className="w-4 h-4" />
                Environment Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Environment Type</Label>
                  <Select value={config.environment_type} onValueChange={(value) => updateConfig({ environment_type: value })}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {environmentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Environment Name</Label>
                  <Input
                    className="h-8"
                    value={config.environment_name}
                    onChange={(e) => updateConfig({ environment_name: e.target.value })}
                    placeholder="my-app-prod"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Cloud Provider</Label>
                  <Select value={config.cloud_provider} onValueChange={(value) => updateConfig({ cloud_provider: value })}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cloudProviders.map((provider) => (
                        <SelectItem key={provider.value} value={provider.value}>{provider.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Region</Label>
                  <Input
                    className="h-8"
                    value={config.region}
                    onChange={(e) => updateConfig({ region: e.target.value })}
                    placeholder="us-east-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Compute Type</Label>
                  <Select value={config.compute_type} onValueChange={(value) => updateConfig({ compute_type: value })}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {computeTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resource Allocation */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Resource Allocation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">CPU Limit</Label>
                  <Input
                    className="h-8"
                    value={config.cpu_limit}
                    onChange={(e) => updateConfig({ cpu_limit: e.target.value })}
                    placeholder="1000m"
                  />
                </div>
                <div>
                  <Label className="text-xs">Memory Limit</Label>
                  <Input
                    className="h-8"
                    value={config.memory_limit}
                    onChange={(e) => updateConfig({ memory_limit: e.target.value })}
                    placeholder="512Mi"
                  />
                </div>
                <div>
                  <Label className="text-xs">Storage Limit</Label>
                  <Input
                    className="h-8"
                    value={config.storage_limit}
                    onChange={(e) => updateConfig({ storage_limit: e.target.value })}
                    placeholder="10Gi"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Auto Scaling */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Auto Scaling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Enable Auto Scaling</Label>
                <Switch
                  checked={config.auto_scaling_enabled}
                  onCheckedChange={(checked) => updateConfig({ auto_scaling_enabled: checked })}
                />
              </div>

              {config.auto_scaling_enabled && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Min Instances</Label>
                      <Input
                        type="number"
                        className="h-8"
                        value={config.min_instances}
                        onChange={(e) => updateConfig({ min_instances: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Max Instances</Label>
                      <Input
                        type="number"
                        className="h-8"
                        value={config.max_instances}
                        onChange={(e) => updateConfig({ max_instances: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Scaling Metric</Label>
                      <Select value={config.scaling_metric} onValueChange={(value) => updateConfig({ scaling_metric: value })}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {scalingMetrics.map((metric) => (
                            <SelectItem key={metric.value} value={metric.value}>{metric.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Threshold (%)</Label>
                      <Input
                        type="number"
                        className="h-8"
                        value={config.scaling_threshold}
                        onChange={(e) => updateConfig({ scaling_threshold: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Environment Variables */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                Environment Variables
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addEnvironmentVariable}
                  className="ml-auto h-6 w-6 p-0"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {config.environment_variables.map((envVar, index) => (
                <div key={index} className="border rounded p-2 space-y-2">
                  <div className="flex gap-2 items-center">
                    <Input
                      className="h-8 flex-1"
                      value={envVar.key}
                      onChange={(e) => updateEnvironmentVariable(index, 'key', e.target.value)}
                      placeholder="VARIABLE_NAME"
                    />
                    <Input
                      className="h-8 flex-1"
                      value={envVar.value}
                      onChange={(e) => updateEnvironmentVariable(index, 'value', e.target.value)}
                      placeholder="variable_value"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeEnvironmentVariable(index)}
                      className="h-6 w-6 p-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <Input
                    className="h-8"
                    value={envVar.description}
                    onChange={(e) => updateEnvironmentVariable(index, 'description', e.target.value)}
                    placeholder="Variable description"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Secrets */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Secrets
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addSecret}
                  className="ml-auto h-6 w-6 p-0"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {config.secrets.map((secret, index) => (
                <div key={index} className="border rounded p-2 space-y-2">
                  <div className="flex gap-2 items-center">
                    <Input
                      className="h-8 flex-1"
                      value={secret.key}
                      onChange={(e) => updateSecret(index, 'key', e.target.value)}
                      placeholder="SECRET_KEY"
                    />
                    <div className="flex items-center gap-1">
                      <Switch
                        checked={secret.required}
                        onCheckedChange={(checked) => updateSecret(index, 'required', checked)}
                      />
                      <Label className="text-xs">Required</Label>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeSecret(index)}
                      className="h-6 w-6 p-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <Input
                    className="h-8"
                    value={secret.description}
                    onChange={(e) => updateSecret(index, 'description', e.target.value)}
                    placeholder="Secret description"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Security Configuration */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Security Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Access Control</Label>
                  <Select value={config.access_control} onValueChange={(value) => updateConfig({ access_control: value })}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {accessControlTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Custom Domain</Label>
                  <Input
                    className="h-8"
                    value={config.custom_domain}
                    onChange={(e) => updateConfig({ custom_domain: e.target.value })}
                    placeholder="api.myapp.com"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-xs">Enable SSL</Label>
                <Switch
                  checked={config.ssl_enabled}
                  onCheckedChange={(checked) => updateConfig({ ssl_enabled: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Monitoring & Health Checks */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                Monitoring & Health Checks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.monitoring_enabled}
                    onCheckedChange={(checked) => updateConfig({ monitoring_enabled: checked })}
                  />
                  <Label className="text-xs">Enable Monitoring</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.health_check_enabled}
                    onCheckedChange={(checked) => updateConfig({ health_check_enabled: checked })}
                  />
                  <Label className="text-xs">Health Checks</Label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Log Level</Label>
                  <Select value={config.log_level} onValueChange={(value) => updateConfig({ log_level: value })}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {logLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Metrics Retention (days)</Label>
                  <Input
                    type="number"
                    className="h-8"
                    value={config.metrics_retention_days}
                    onChange={(e) => updateConfig({ metrics_retention_days: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              {config.health_check_enabled && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Health Check Path</Label>
                    <Input
                      className="h-8"
                      value={config.health_check_path}
                      onChange={(e) => updateConfig({ health_check_path: e.target.value })}
                      placeholder="/health"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Interval (s)</Label>
                    <Input
                      type="number"
                      className="h-8"
                      value={config.health_check_interval}
                      onChange={(e) => updateConfig({ health_check_interval: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Timeout (s)</Label>
                    <Input
                      type="number"
                      className="h-8"
                      value={config.health_check_timeout}
                      onChange={(e) => updateConfig({ health_check_timeout: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Deployment Strategy */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Deployment Strategy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Strategy</Label>
                  <Select value={config.deployment_strategy} onValueChange={(value) => updateConfig({ deployment_strategy: value })}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {deploymentStrategies.map((strategy) => (
                        <SelectItem key={strategy.value} value={strategy.value}>{strategy.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Rollback on Failure</Label>
                  <Switch
                    checked={config.rollback_on_failure}
                    onCheckedChange={(checked) => updateConfig({ rollback_on_failure: checked })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Max Unavailable</Label>
                  <Input
                    type="number"
                    className="h-8"
                    value={config.max_unavailable}
                    onChange={(e) => updateConfig({ max_unavailable: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Max Surge</Label>
                  <Input
                    type="number"
                    className="h-8"
                    value={config.max_surge}
                    onChange={(e) => updateConfig({ max_surge: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cost Optimization */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Cost Optimization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.cost_alerts_enabled}
                    onCheckedChange={(checked) => updateConfig({ cost_alerts_enabled: checked })}
                  />
                  <Label className="text-xs">Cost Alerts</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.auto_shutdown_enabled}
                    onCheckedChange={(checked) => updateConfig({ auto_shutdown_enabled: checked })}
                  />
                  <Label className="text-xs">Auto Shutdown</Label>
                </div>
              </div>

              {config.cost_alerts_enabled && (
                <div>
                  <Label className="text-xs">Monthly Budget Limit ($)</Label>
                  <Input
                    type="number"
                    className="h-8"
                    value={config.monthly_budget_limit}
                    onChange={(e) => updateConfig({ monthly_budget_limit: parseInt(e.target.value) })}
                  />
                </div>
              )}

              {config.auto_shutdown_enabled && (
                <div>
                  <Label className="text-xs">Shutdown Schedule</Label>
                  <Input
                    className="h-8"
                    value={config.shutdown_schedule}
                    onChange={(e) => updateConfig({ shutdown_schedule: e.target.value })}
                    placeholder="22:00-06:00"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </BaseWorkflowNode>
  );
};