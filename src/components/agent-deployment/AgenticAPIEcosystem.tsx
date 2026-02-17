import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Database, 
  Globe, 
  Zap, 
  Settings, 
  Plus, 
  Edit, 
  Trash2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Network
} from 'lucide-react';
import { useApiServices } from '@/hooks/useApiServices';
import { useApiServiceConfigurations } from '@/hooks/useApiServiceConfigurations';
import { useToast } from '@/hooks/use-toast';

interface ApiConnection {
  id: string;
  name: string;
  type: 'internal' | 'external';
  status: 'active' | 'inactive' | 'error';
  endpoint: string;
  description: string;
  lastHealthCheck?: string;
}

const AgenticAPIEcosystem = () => {
  const { toast } = useToast();
  const { apiServices, isLoading: servicesLoading } = useApiServices();
  const { 
    apiServiceConfigurations, 
    createApiServiceConfiguration,
    updateApiServiceConfiguration,
    deleteApiServiceConfiguration,
    testApiServiceConnection,
    isLoading: configurationsLoading 
  } = useApiServiceConfigurations();

  const [connections, setConnections] = useState<ApiConnection[]>([
    {
      id: '1',
      name: 'Patient Database API',
      type: 'internal',
      status: 'active',
      endpoint: 'https://api.hospital.com/patients',
      description: 'Core patient management system integration',
      lastHealthCheck: '2025-01-08T10:30:00Z'
    },
    {
      id: '2',
      name: 'EHR Integration',
      type: 'external',
      status: 'active',
      endpoint: 'https://ehr-provider.com/api/v1',
      description: 'Electronic Health Records system connection',
      lastHealthCheck: '2025-01-08T10:25:00Z'
    }
  ]);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingConnection, setEditingConnection] = useState<ApiConnection | null>(null);
  const [newConnection, setNewConnection] = useState({
    name: '',
    type: 'internal' as const,
    endpoint: '',
    description: '',
    authType: 'api_key',
    credentials: ''
  });

  const handleAddConnection = async () => {
    if (!newConnection.name || !newConnection.endpoint) {
      toast({
        title: "Missing Information",
        description: "Please fill in connection name and endpoint.",
        variant: "destructive",
      });
      return;
    }

    try {
      const config = {
        service_name: newConnection.name,
        service_type: newConnection.type === 'internal' ? 'internal_api' : 'external_api',
        configuration: {
          endpoint: newConnection.endpoint,
          auth_type: newConnection.authType,
          description: newConnection.description
        },
        credentials: newConnection.credentials ? { api_key: newConnection.credentials } : undefined,
        is_active: true
      };

      await createApiServiceConfiguration(config);

      // Add to local state for immediate UI update
      const connection: ApiConnection = {
        id: Date.now().toString(),
        name: newConnection.name,
        type: newConnection.type,
        status: 'inactive',
        endpoint: newConnection.endpoint,
        description: newConnection.description
      };

      setConnections([...connections, connection]);
      setShowAddDialog(false);
      setNewConnection({
        name: '',
        type: 'internal',
        endpoint: '',
        description: '',
        authType: 'api_key',
        credentials: ''
      });
    } catch (error) {
      console.error('Error adding connection:', error);
    }
  };

  const handleTestConnection = async (connectionId: string) => {
    // Find the configuration from database
    const config = apiServiceConfigurations.find(c => 
      c.service_name === connections.find(conn => conn.id === connectionId)?.name
    );

    if (config) {
      await testApiServiceConnection(config.id);
    } else {
      toast({
        title: "Testing Connection",
        description: "Testing API connection and health status...",
      });
    }
  };

  const handleDeleteConnection = (connectionId: string) => {
    setConnections(connections.filter(c => c.id !== connectionId));
    toast({
      title: "Connection Removed",
      description: "API connection has been removed from the ecosystem.",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Database className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Internal APIs</p>
              <p className="text-2xl font-bold">
                {connections.filter(c => c.type === 'internal').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <Globe className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">External APIs</p>
              <p className="text-2xl font-bold">
                {connections.filter(c => c.type === 'external').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Network className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Connections</p>
              <p className="text-2xl font-bold">
                {connections.filter(c => c.status === 'active').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Connections */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              API Connections & System Connectors
            </CardTitle>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Connection
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage internal and external API integrations for your agents
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {connections.map((connection) => (
              <div key={connection.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(connection.status)}`} />
                  <div className="flex items-center gap-2">
                    {connection.type === 'internal' ? (
                      <Database className="h-4 w-4 text-blue-500" />
                    ) : (
                      <Globe className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{connection.name}</p>
                      <Badge variant="outline">
                        {connection.type}
                      </Badge>
                      {getStatusIcon(connection.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {connection.description}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {connection.endpoint}
                    </p>
                    {connection.lastHealthCheck && (
                      <p className="text-xs text-muted-foreground">
                        Last check: {new Date(connection.lastHealthCheck).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestConnection(connection.id)}
                  >
                    Test
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingConnection(connection)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteConnection(connection.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Integration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Health Monitoring</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Overall System Health</span>
                  <Badge variant="default" className="bg-green-500">
                    Healthy
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">API Response Times</span>
                  <span className="text-sm text-muted-foreground">&lt; 200ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Error Rate</span>
                  <span className="text-sm text-muted-foreground">0.1%</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Integration Settings</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Auto-Retry Failed Requests</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Health Check Interval</span>
                  <span className="text-sm text-muted-foreground">5 minutes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Alert on Failures</span>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Connection Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New API Connection</DialogTitle>
            <DialogDescription>
              Configure a new API integration for your agents.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="conn-name">Connection Name</Label>
              <Input
                id="conn-name"
                value={newConnection.name}
                onChange={(e) => setNewConnection(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Patient Management API"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="conn-type">Connection Type</Label>
              <Select 
                value={newConnection.type}
                onValueChange={(value) => setNewConnection(prev => ({ ...prev, type: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">Internal API</SelectItem>
                  <SelectItem value="external">External API</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="conn-endpoint">API Endpoint</Label>
              <Input
                id="conn-endpoint"
                value={newConnection.endpoint}
                onChange={(e) => setNewConnection(prev => ({ ...prev, endpoint: e.target.value }))}
                placeholder="https://api.example.com/v1"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="conn-description">Description</Label>
              <Textarea
                id="conn-description"
                value={newConnection.description}
                onChange={(e) => setNewConnection(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this API connection"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conn-auth">Authentication Type</Label>
              <Select 
                value={newConnection.authType}
                onValueChange={(value) => setNewConnection(prev => ({ ...prev, authType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="api_key">API Key</SelectItem>
                  <SelectItem value="bearer_token">Bearer Token</SelectItem>
                  <SelectItem value="basic_auth">Basic Authentication</SelectItem>
                  <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newConnection.authType === 'api_key' && (
              <div className="space-y-2">
                <Label htmlFor="conn-credentials">API Key</Label>
                <Input
                  id="conn-credentials"
                  type="password"
                  value={newConnection.credentials}
                  onChange={(e) => setNewConnection(prev => ({ ...prev, credentials: e.target.value }))}
                  placeholder="Enter API key"
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddConnection}>
              Add Connection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgenticAPIEcosystem;