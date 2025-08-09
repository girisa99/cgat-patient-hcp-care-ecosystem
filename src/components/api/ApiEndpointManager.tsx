import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Zap, Plus, Search, Eye, Edit, Trash2, 
  Globe, Lock, Clock, PlayCircle, Code
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';
import ApiSandboxManager from './ApiSandboxManager';
import ApiDocumentationViewer from './ApiDocumentationViewer';

interface ApiEndpoint {
  id: string;
  endpoint_path: string;
  method: string;
  description?: string;
  category: string;
  is_public: boolean;
  requires_authentication: boolean;
  rate_limit_config: any;
  sandbox_available: boolean;
  testing_status: string;
  api_integration_id?: string;
  created_at: string;
  updated_at: string;
}

const ApiEndpointManager: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSandbox, setShowSandbox] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [newEndpoint, setNewEndpoint] = useState({
    endpoint_path: '',
    method: 'GET',
    description: '',
    category: '',
    is_public: false,
    requires_authentication: true,
    sandbox_available: true
  });
  const { showSuccess, showError } = useMasterToast();
  const queryClient = useQueryClient();

  // Fetch endpoints from database
  const { data: endpoints = [], isLoading, refetch } = useQuery({
    queryKey: ['api-endpoints'],
    queryFn: async (): Promise<ApiEndpoint[]> => {
      const { data, error } = await supabase
        .from('api_endpoints')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 300000,
  });

  // Get unique categories
  const categories = ['all', ...new Set(endpoints.map(ep => ep.category))];

  // Filter endpoints
  const filteredEndpoints = endpoints.filter(endpoint => {
    const matchesSearch = 
      endpoint.endpoint_path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      endpoint.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || endpoint.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const groupedEndpoints = filteredEndpoints.reduce((acc, endpoint) => {
    if (!acc[endpoint.category]) {
      acc[endpoint.category] = [];
    }
    acc[endpoint.category].push(endpoint);
    return acc;
  }, {} as Record<string, ApiEndpoint[]>);

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'bg-green-100 text-green-800';
      case 'POST': return 'bg-blue-100 text-blue-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'PATCH': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Create endpoint mutation
  const createEndpointMutation = useMutation({
    mutationFn: async (endpointData: { endpoint_path: string; method: string; description?: string; category: string; is_public: boolean; requires_authentication: boolean; sandbox_available: boolean; }) => {
      const { data, error } = await supabase
        .from('api_endpoints')
        .insert([{
          ...endpointData,
          rate_limit_config: { period: 'hour', requests: 1000 },
          request_schema: {},
          response_schema: {},
          example_request: {},
          example_response: {},
          testing_status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-endpoints'] });
      setShowCreateDialog(false);
      setNewEndpoint({
        endpoint_path: '',
        method: 'GET',
        description: '',
        category: '',
        is_public: false,
        requires_authentication: true,
        sandbox_available: true
      });
      showSuccess('Endpoint created successfully');
    },
    onError: (error) => {
      showError('Failed to create endpoint');
      console.error('Create endpoint error:', error);
    }
  });

  const testEndpoint = (endpoint: ApiEndpoint) => {
    setSelectedEndpoint(endpoint);
    setShowSandbox(true);
  };

  const viewDocumentation = (endpoint: ApiEndpoint) => {
    setSelectedEndpoint(endpoint);
    setShowDocumentation(true);
  };

  const handleCreateEndpoint = () => {
    if (!newEndpoint.endpoint_path.trim()) {
      showError('Please enter an endpoint path');
      return;
    }
    if (!newEndpoint.category.trim()) {
      showError('Please enter a category');
      return;
    }
    
    createEndpointMutation.mutate(newEndpoint);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Zap className="h-6 w-6" />
            <span>API Endpoints</span>
          </h2>
          <p className="text-gray-600">Manage and test API endpoints</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Endpoint
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New API Endpoint</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Endpoint Path</label>
                <Input
                  placeholder="/api/v1/users"
                  value={newEndpoint.endpoint_path}
                  onChange={(e) => setNewEndpoint(prev => ({ ...prev, endpoint_path: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">HTTP Method</label>
                <Select 
                  value={newEndpoint.method} 
                  onValueChange={(value) => setNewEndpoint(prev => ({ ...prev, method: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Input
                  placeholder="e.g., users, patients, auth"
                  value={newEndpoint.category}
                  onChange={(e) => setNewEndpoint(prev => ({ ...prev, category: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  placeholder="Describe what this endpoint does..."
                  value={newEndpoint.description}
                  onChange={(e) => setNewEndpoint(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_public"
                    checked={newEndpoint.is_public}
                    onCheckedChange={(checked) => setNewEndpoint(prev => ({ ...prev, is_public: !!checked }))}
                  />
                  <label htmlFor="is_public" className="text-sm">Public endpoint (no authentication required)</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requires_authentication"
                    checked={newEndpoint.requires_authentication}
                    onCheckedChange={(checked) => setNewEndpoint(prev => ({ ...prev, requires_authentication: !!checked }))}
                  />
                  <label htmlFor="requires_authentication" className="text-sm">Requires authentication</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sandbox_available"
                    checked={newEndpoint.sandbox_available}
                    onCheckedChange={(checked) => setNewEndpoint(prev => ({ ...prev, sandbox_available: !!checked }))}
                  />
                  <label htmlFor="sandbox_available" className="text-sm">Available in sandbox</label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateEndpoint}
                  disabled={createEndpointMutation.isPending}
                >
                  {createEndpointMutation.isPending ? 'Creating...' : 'Create Endpoint'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Endpoints</p>
                <p className="text-2xl font-bold">{endpoints.length}</p>
              </div>
              <Zap className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Public Endpoints</p>
                <p className="text-2xl font-bold">
                  {endpoints.filter(ep => ep.is_public).length}
                </p>
              </div>
              <Globe className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Authenticated</p>
                <p className="text-2xl font-bold">
                  {endpoints.filter(ep => ep.requires_authentication).length}
                </p>
              </div>
              <Lock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sandbox Ready</p>
                <p className="text-2xl font-bold">
                  {endpoints.filter(ep => ep.sandbox_available).length}
                </p>
              </div>
              <PlayCircle className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search endpoints..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category}
            </option>
          ))}
        </select>
      </div>

      {/* Endpoints List */}
      <Tabs defaultValue="grouped" className="w-full">
        <TabsList>
          <TabsTrigger value="grouped">Grouped by Category</TabsTrigger>
          <TabsTrigger value="list">All Endpoints</TabsTrigger>
        </TabsList>

        <TabsContent value="grouped" className="space-y-6">
          {Object.entries(groupedEndpoints).map(([category, categoryEndpoints]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-lg capitalize">
                  {category} ({categoryEndpoints.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryEndpoints.map((endpoint) => (
                    <div key={endpoint.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge className={getMethodColor(endpoint.method)}>
                            {endpoint.method}
                          </Badge>
                          <code className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                            {endpoint.endpoint_path}
                          </code>
                          {endpoint.is_public && (
                            <Badge variant="outline">
                              <Globe className="h-3 w-3 mr-1" />
                              Public
                            </Badge>
                          )}
                          {endpoint.requires_authentication && (
                            <Badge variant="outline">
                              <Lock className="h-3 w-3 mr-1" />
                              Auth Required
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => testEndpoint(endpoint)}
                          >
                            <PlayCircle className="h-3 w-3 mr-1" />
                            Test
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewDocumentation(endpoint)}
                          >
                            <Code className="h-3 w-3 mr-1" />
                            Docs
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {endpoint.description && (
                        <p className="text-sm text-gray-600 mt-2">
                          {endpoint.description}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>Status: {endpoint.testing_status}</span>
                        <span>Created: {new Date(endpoint.created_at).toLocaleDateString()}</span>
                        {endpoint.sandbox_available && (
                          <Badge variant="secondary" className="text-xs">
                            Sandbox Available
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          {filteredEndpoints.map((endpoint) => (
            <Card key={endpoint.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge className={getMethodColor(endpoint.method)}>
                      {endpoint.method}
                    </Badge>
                    <code className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {endpoint.endpoint_path}
                    </code>
                    <Badge variant="outline">{endpoint.category}</Badge>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testEndpoint(endpoint)}
                    >
                      <PlayCircle className="h-3 w-3 mr-1" />
                      Test
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewDocumentation(endpoint)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {filteredEndpoints.length === 0 && !isLoading && (
        <div className="text-center py-12 text-gray-500">
          <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="font-semibold mb-2">No endpoints found</h3>
          <p className="text-sm">No endpoints match your current filters.</p>
        </div>
      )}
    </div>
  );
};

export default ApiEndpointManager;