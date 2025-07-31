import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap, Plus, Search, Eye, Edit, Trash2, 
  Globe, Lock, Clock, PlayCircle, Code
} from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';

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
  const { showSuccess, showError } = useMasterToast();

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

  const testEndpoint = (endpoint: ApiEndpoint) => {
    showSuccess(`Testing endpoint: ${endpoint.method} ${endpoint.endpoint_path}`);
    // This would integrate with the sandbox environment
  };

  const viewDocumentation = (endpoint: ApiEndpoint) => {
    showSuccess(`Viewing documentation for: ${endpoint.endpoint_path}`);
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
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Endpoint
        </Button>
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