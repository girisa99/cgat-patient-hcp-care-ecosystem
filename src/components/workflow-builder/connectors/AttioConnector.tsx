import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, Users, Calendar, Mail, Phone, Tag,
  Settings, Zap, BarChart3, Filter, Search, Plus
} from 'lucide-react';
import { useMasterToast } from '@/hooks/useMasterToast';

interface AttioConfig {
  connection: {
    apiKey: string;
    workspace: string;
    environment: 'production' | 'sandbox';
  };
  objects: {
    companies: boolean;
    people: boolean;
    deals: boolean;
    notes: boolean;
    tasks: boolean;
    events: boolean;
  };
  automation: {
    syncFrequency: 'realtime' | 'hourly' | 'daily';
    bidirectionalSync: boolean;
    conflictResolution: 'attio_wins' | 'external_wins' | 'manual';
    autoCreateRecords: boolean;
  };
  workflows: {
    triggers: string[];
    actions: string[];
    conditions: any[];
  };
  fieldMapping: {
    [key: string]: string;
  };
  filters: {
    companies: any[];
    people: any[];
    deals: any[];
  };
}

interface AttioConnectorProps {
  onConfigurationChange?: (config: AttioConfig) => void;
  onConnect?: (config: AttioConfig) => void;
  initialConfig?: Partial<AttioConfig>;
}

export const AttioConnector: React.FC<AttioConnectorProps> = ({
  onConfigurationChange,
  onConnect,
  initialConfig = {}
}) => {
  const { showSuccess, showError } = useMasterToast();
  const [config, setConfig] = useState<AttioConfig>({
    connection: {
      apiKey: '',
      workspace: '',
      environment: 'production'
    },
    objects: {
      companies: true,
      people: true,
      deals: true,
      notes: false,
      tasks: false,
      events: false
    },
    automation: {
      syncFrequency: 'hourly',
      bidirectionalSync: true,
      conflictResolution: 'attio_wins',
      autoCreateRecords: true
    },
    workflows: {
      triggers: [],
      actions: [],
      conditions: []
    },
    fieldMapping: {},
    filters: {
      companies: [],
      people: [],
      deals: []
    },
    ...initialConfig
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const updateConfig = (updates: Partial<AttioConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onConfigurationChange?.(newConfig);
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    try {
      // Simulate API connection test
      await new Promise(resolve => setTimeout(resolve, 1500));
      showSuccess('Connection test successful!');
    } catch (error) {
      showError('Connection test failed. Please check your credentials.');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // Simulate API connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onConnect?.(config);
      showSuccess('Connected to Attio CRM successfully!');
    } catch (error) {
      showError('Failed to connect to Attio. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const availableTriggers = [
    'Company Created', 'Company Updated', 'Person Created', 'Person Updated',
    'Deal Created', 'Deal Updated', 'Deal Stage Changed', 'Task Completed',
    'Note Added', 'Event Scheduled'
  ];

  const availableActions = [
    'Create Company', 'Update Company', 'Create Person', 'Update Person',
    'Create Deal', 'Update Deal', 'Send Email', 'Create Task', 'Add Note',
    'Schedule Event', 'Add Tag', 'Remove Tag'
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Attio CRM Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>API Key</Label>
            <Input
              type="password"
              placeholder="Enter your Attio API key..."
              value={config.connection.apiKey}
              onChange={(e) => updateConfig({
                connection: { ...config.connection, apiKey: e.target.value }
              })}
            />
          </div>

          <div className="space-y-2">
            <Label>Workspace</Label>
            <Input
              placeholder="Your Attio workspace name..."
              value={config.connection.workspace}
              onChange={(e) => updateConfig({
                connection: { ...config.connection, workspace: e.target.value }
              })}
            />
          </div>

          <div className="space-y-2">
            <Label>Environment</Label>
            <Select 
              value={config.connection.environment} 
              onValueChange={(value: any) => updateConfig({
                connection: { ...config.connection, environment: value }
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="production">Production</SelectItem>
                <SelectItem value="sandbox">Sandbox</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={testConnection} 
            disabled={isTestingConnection || !config.connection.apiKey}
            variant="outline"
            className="w-full"
          >
            {isTestingConnection ? 'Testing...' : 'Test Connection'}
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="objects" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="objects">Objects</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="mapping">Mapping</TabsTrigger>
        </TabsList>

        <TabsContent value="objects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Sync Objects
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <Label>Companies</Label>
                  </div>
                  <Switch
                    checked={config.objects.companies}
                    onCheckedChange={(checked) => updateConfig({
                      objects: { ...config.objects, companies: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <Label>People</Label>
                  </div>
                  <Switch
                    checked={config.objects.people}
                    onCheckedChange={(checked) => updateConfig({
                      objects: { ...config.objects, people: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <Label>Deals</Label>
                  </div>
                  <Switch
                    checked={config.objects.deals}
                    onCheckedChange={(checked) => updateConfig({
                      objects: { ...config.objects, deals: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <Label>Notes</Label>
                  </div>
                  <Switch
                    checked={config.objects.notes}
                    onCheckedChange={(checked) => updateConfig({
                      objects: { ...config.objects, notes: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <Label>Tasks</Label>
                  </div>
                  <Switch
                    checked={config.objects.tasks}
                    onCheckedChange={(checked) => updateConfig({
                      objects: { ...config.objects, tasks: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <Label>Events</Label>
                  </div>
                  <Switch
                    checked={config.objects.events}
                    onCheckedChange={(checked) => updateConfig({
                      objects: { ...config.objects, events: checked }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Automation Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Sync Frequency</Label>
                <Select 
                  value={config.automation.syncFrequency} 
                  onValueChange={(value: any) => updateConfig({
                    automation: { ...config.automation, syncFrequency: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label>Bidirectional Sync</Label>
                <Switch
                  checked={config.automation.bidirectionalSync}
                  onCheckedChange={(checked) => updateConfig({
                    automation: { ...config.automation, bidirectionalSync: checked }
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label>Conflict Resolution</Label>
                <Select 
                  value={config.automation.conflictResolution} 
                  onValueChange={(value: any) => updateConfig({
                    automation: { ...config.automation, conflictResolution: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="attio_wins">Attio Wins</SelectItem>
                    <SelectItem value="external_wins">External System Wins</SelectItem>
                    <SelectItem value="manual">Manual Resolution</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label>Auto-Create Records</Label>
                <Switch
                  checked={config.automation.autoCreateRecords}
                  onCheckedChange={(checked) => updateConfig({
                    automation: { ...config.automation, autoCreateRecords: checked }
                  })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Workflow Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Triggers</Label>
                <Select onValueChange={(value) => {
                  if (!config.workflows.triggers.includes(value)) {
                    updateConfig({
                      workflows: {
                        ...config.workflows,
                        triggers: [...config.workflows.triggers, value]
                      }
                    });
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add trigger..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTriggers.map((trigger) => (
                      <SelectItem key={trigger} value={trigger}>{trigger}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2">
                  {config.workflows.triggers.map((trigger) => (
                    <Badge 
                      key={trigger} 
                      variant="secondary" 
                      className="cursor-pointer"
                      onClick={() => updateConfig({
                        workflows: {
                          ...config.workflows,
                          triggers: config.workflows.triggers.filter(t => t !== trigger)
                        }
                      })}
                    >
                      {trigger} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Actions</Label>
                <Select onValueChange={(value) => {
                  if (!config.workflows.actions.includes(value)) {
                    updateConfig({
                      workflows: {
                        ...config.workflows,
                        actions: [...config.workflows.actions, value]
                      }
                    });
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add action..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableActions.map((action) => (
                      <SelectItem key={action} value={action}>{action}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2">
                  {config.workflows.actions.map((action) => (
                    <Badge 
                      key={action} 
                      variant="secondary" 
                      className="cursor-pointer"
                      onClick={() => updateConfig({
                        workflows: {
                          ...config.workflows,
                          actions: config.workflows.actions.filter(a => a !== action)
                        }
                      })}
                    >
                      {action} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mapping" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Field Mapping
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Map external fields to Attio object fields. This ensures data flows correctly between systems.
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>External Field</Label>
                    <Input placeholder="external_field_name" />
                  </div>
                  <div>
                    <Label>Attio Field</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Attio field..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="company">Company</SelectItem>
                        <SelectItem value="title">Title</SelectItem>
                        <SelectItem value="status">Status</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Mapping
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Connection Button */}
      <Button 
        onClick={handleConnect} 
        disabled={isConnecting || !config.connection.apiKey}
        className="w-full"
        size="lg"
      >
        <Zap className="h-4 w-4 mr-2" />
        {isConnecting ? 'Connecting...' : 'Connect to Attio CRM'}
      </Button>
    </div>
  );
};