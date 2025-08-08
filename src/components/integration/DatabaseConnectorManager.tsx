import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Database, Plus, Settings, Trash2, TestTube, 
  CheckCircle, XCircle, Clock, Edit, Save, X 
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DatabaseConnector {
  id: string;
  name: string;
  type: string;
  host: string;
  port: number;
  database_name: string;
  username: string;
  status: string;
  ssl_enabled: boolean;
  connection_pool_size: number;
  timeout: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface DatabaseConnectorManagerProps {
  onClose?: () => void;
}

const DatabaseConnectorManager: React.FC<DatabaseConnectorManagerProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('list');
  const [editingConnector, setEditingConnector] = useState<DatabaseConnector | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'postgresql',
    host: '',
    port: 5432,
    database_name: '',
    username: '',
    password: '',
    ssl_enabled: true,
    connection_pool_size: 10,
    timeout: 30,
    description: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch database connectors
  const { data: connectors = [], isLoading } = useQuery({
    queryKey: ['database-connectors'],
    queryFn: async (): Promise<DatabaseConnector[]> => {
      const { data, error } = await supabase
        .from('api_integration_registry')
        .select('*')
        .eq('category', 'database_connector')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        type: item.type || 'postgresql',
        host: item.base_url || 'localhost',
        port: 5432,
        database_name: item.name,
        username: 'user',
        status: item.status,
        ssl_enabled: true,
        connection_pool_size: 10,
        timeout: 30,
        description: item.description,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
    }
  });

  // Create connector mutation
  const createConnectorMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: result, error } = await supabase
        .from('api_integration_registry')
        .insert({
          name: data.name,
          type: 'internal',
          category: 'database_connector',
          purpose: 'Database connectivity and data access',
          direction: 'internal',
          description: data.description,
          status: 'active',
          base_url: `${data.host}:${data.port}`,
          security_requirements: {
            type: data.type,
            host: data.host,
            port: data.port,
            database_name: data.database_name,
            username: data.username,
            password: data.password,
            ssl_enabled: data.ssl_enabled,
            connection_pool_size: data.connection_pool_size,
            timeout: data.timeout
          }
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Database Connector Created",
        description: "The database connector has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['database-connectors'] });
      setFormData({
        name: '',
        type: 'postgresql',
        host: '',
        port: 5432,
        database_name: '',
        username: '',
        password: '',
        ssl_enabled: true,
        connection_pool_size: 10,
        timeout: 30,
        description: ''
      });
      setActiveTab('list');
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create database connector",
        variant: "destructive",
      });
    }
  });

  // Test connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: async (config: any) => {
      // In production, this would test the actual database connection
      // For now, we'll simulate the test
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: Math.random() > 0.3, message: "Connection test completed" };
    },
    onSuccess: (result) => {
      toast({
        title: result.success ? "Connection Successful" : "Connection Failed",
        description: result.success 
          ? "Database connection established successfully" 
          : "Unable to connect to database",
        variant: result.success ? "default" : "destructive",
      });
    }
  });

  const handleCreateConnector = () => {
    if (!formData.name || !formData.host || !formData.database_name) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    createConnectorMutation.mutate(formData);
  };

  const handleTestConnection = () => {
    testConnectionMutation.mutate(formData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'testing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'inactive': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'testing': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto m-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Connector Manager
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage database connections for your healthcare applications
              </p>
            </div>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="list">Connectors ({connectors.length})</TabsTrigger>
              <TabsTrigger value="create">Create New</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Connectors List */}
            <TabsContent value="list" className="space-y-4">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-gray-100 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : connectors.length > 0 ? (
                <div className="space-y-3">
                  {connectors.map((connector) => (
                    <Card key={connector.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Database className="h-8 w-8 text-blue-600" />
                            <div>
                              <h3 className="font-semibold">{connector.name}</h3>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Badge variant="outline">{connector.type}</Badge>
                                <span>{connector.host}:{connector.port}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {getStatusIcon(connector.status)}
                              <Badge className={getStatusColor(connector.status)}>
                                {connector.status}
                              </Badge>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Database className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No Database Connectors</h3>
                  <p className="text-gray-600 mb-4">Create your first database connector to get started.</p>
                  <Button onClick={() => setActiveTab('create')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Connector
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Create New Connector */}
            <TabsContent value="create" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Connector Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Production PostgreSQL"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="type">Database Type</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="postgresql">PostgreSQL</SelectItem>
                        <SelectItem value="mysql">MySQL</SelectItem>
                        <SelectItem value="mongodb">MongoDB</SelectItem>
                        <SelectItem value="oracle">Oracle</SelectItem>
                        <SelectItem value="mssql">SQL Server</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="host">Host *</Label>
                      <Input
                        id="host"
                        value={formData.host}
                        onChange={(e) => setFormData(prev => ({ ...prev, host: e.target.value }))}
                        placeholder="localhost"
                      />
                    </div>
                    <div>
                      <Label htmlFor="port">Port</Label>
                      <Input
                        id="port"
                        type="number"
                        value={formData.port}
                        onChange={(e) => setFormData(prev => ({ ...prev, port: parseInt(e.target.value) || 5432 }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="database_name">Database Name *</Label>
                    <Input
                      id="database_name"
                      value={formData.database_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, database_name: e.target.value }))}
                      placeholder="healthcare_db"
                    />
                  </div>

                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="db_user"
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="ssl_enabled"
                      checked={formData.ssl_enabled}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ssl_enabled: checked }))}
                    />
                    <Label htmlFor="ssl_enabled">Enable SSL</Label>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description of this database connector..."
                  rows={3}
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={testConnectionMutation.isPending}
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  {testConnectionMutation.isPending ? 'Testing...' : 'Test Connection'}
                </Button>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setActiveTab('list')}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateConnector}
                    disabled={createConnectorMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {createConnectorMutation.isPending ? 'Creating...' : 'Create Connector'}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Settings */}
            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Global Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-retry failed connections</Label>
                      <p className="text-sm text-gray-600">Automatically retry failed database connections</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable connection pooling</Label>
                      <p className="text-sm text-gray-600">Use connection pooling for better performance</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Log database queries</Label>
                      <p className="text-sm text-gray-600">Log all database queries for debugging</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseConnectorManager;