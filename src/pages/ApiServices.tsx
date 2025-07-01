
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, Settings, Activity, Shield, Plus, Eye, Edit } from 'lucide-react';
import { useApiServices } from '@/hooks/useApiServices';

const ApiServices: React.FC = () => {
  const { integrations, isLoading, createIntegration, isCreating } = useApiServices();

  console.log('🔍 API Services page loaded with integrations:', integrations?.length || 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API Services</h1>
          <p className="text-gray-600 mt-2">Loading API integrations...</p>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const handleCreateIntegration = () => {
    const newIntegration = {
      name: 'New API Integration',
      description: 'Created via API Services page',
      type: 'external',
      direction: 'inbound',
      category: 'healthcare',
      purpose: 'data-exchange',
      lifecycle_stage: 'development',
      status: 'active',
      version: '1.0.0'
    };
    
    createIntegration(newIntegration);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API Services</h1>
          <p className="text-gray-600 mt-2">
            Manage API integrations and external services ({integrations?.length || 0} integrations)
          </p>
        </div>
        <Button onClick={handleCreateIntegration} disabled={isCreating}>
          <Plus className="h-4 w-4 mr-2" />
          {isCreating ? 'Creating...' : 'New Integration'}
        </Button>
      </div>

      {/* Data Source Indicator */}
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-green-900 text-lg">
            <Globe className="h-5 w-5" />
            API Integration Registry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-green-800">
            <p><strong>Data Source:</strong> api_integration_registry table</p>
            <p><strong>Total Integrations:</strong> {integrations?.length || 0}</p>
          </div>
        </CardContent>
      </Card>

      {/* API Integrations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations && integrations.length > 0 ? (
          integrations.map((integration) => (
            <Card key={integration.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center space-y-0 pb-3">
                <div className="flex-1">
                  <CardTitle className="text-lg">{integration.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {integration.description || 'No description available'}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={integration.status === 'active' ? 'default' : 'secondary'}>
                    {integration.status}
                  </Badge>
                  <Badge variant="outline">
                    {integration.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Direction:</span>
                    <span className="capitalize">{integration.direction}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Category:</span>
                    <span className="capitalize">{integration.category}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Version:</span>
                    <span>{integration.version}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Stage:</span>
                    <span className="capitalize">{integration.lifecycle_stage}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center">
              <Globe className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 mb-4">No API integrations found</p>
              <Button onClick={handleCreateIntegration} disabled={isCreating}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Integration
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Stats */}
      {integrations && integrations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {integrations.filter(i => i.status === 'active').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {integrations.filter(i => i.type === 'external').length}
                  </p>
                  <p className="text-sm text-muted-foreground">External</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {integrations.filter(i => i.type === 'internal').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Internal</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {integrations.filter(i => i.lifecycle_stage === 'production').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Production</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ApiServices;
