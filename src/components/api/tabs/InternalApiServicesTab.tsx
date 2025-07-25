import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Database, Plus, RefreshCw, Settings, Activity,
  AlertCircle, CheckCircle, Search, Zap, Shield, Clock, Trash2
} from "lucide-react";
import { useMasterApiServices } from '@/hooks/useMasterApiServices';
import ConfigurationDialog from '../ConfigurationDialog';

const InternalApiServicesTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<any>(null);
  const { toast } = useToast();
  
  const {
    apiServices,
    isLoading,
    error,
    createApiService,
    deleteApiService,
    isDeletingApiService,
    refetch,
    searchApiServices,
    getApiServiceStats
  } = useMasterApiServices();

  // Filter for internal APIs (type = 'internal' or bidirectional internal APIs)
  const internalServices = apiServices?.filter(api => 
    api.type === 'internal' || 
    (api.direction === 'bidirectional' && api.type === 'internal') ||
    api.direction === 'outbound'
  ) || [];

  // Debug logging
  console.log('🔍 All API Services:', apiServices);
  console.log('🔍 Internal Services:', internalServices);
  
  // Get filtered services based on search (from internal APIs only)
  const filteredServices = searchQuery 
    ? internalServices.filter(service => 
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : internalServices;

  // Get statistics for internal APIs only
  const stats = {
    total: internalServices.length,
    statusDistribution: internalServices.reduce((acc, service) => {
      acc[service.status] = (acc[service.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    // Count actual API protocol types based on service names/descriptions
    protocolDistribution: internalServices.reduce((acc, service) => {
      console.log(`🔍 Checking service: ${service.name} - ${service.description}`);
      
      // Determine protocol based on service name or description
      if (service.name?.toLowerCase().includes('rest') || 
          service.name?.toLowerCase().includes('api') ||
          service.description?.toLowerCase().includes('rest')) {
        console.log(`✅ Found REST API: ${service.name}`);
        acc['REST'] = (acc['REST'] || 0) + 1;
      } else if (service.name?.toLowerCase().includes('graphql') ||
                 service.description?.toLowerCase().includes('graphql')) {
        console.log(`✅ Found GraphQL API: ${service.name}`);
        acc['GraphQL'] = (acc['GraphQL'] || 0) + 1;
      } else {
        console.log(`➡️ Defaulting to REST for: ${service.name}`);
        // Default to REST for API services
        acc['REST'] = (acc['REST'] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>)
  };

  const handleRefresh = async () => {
    console.log('🔄 Refreshing API services...');
    try {
      await refetch();
      toast({
        title: "Refreshed Successfully",
        description: "API services data has been refreshed.",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh API services data.",
        variant: "destructive",
      });
    }
  };

  const handleCreateService = async () => {
    console.log('🔄 Creating new REST API service...');
    
    try {
      createApiService({
        name: 'New REST API Service',
        description: 'A new REST API service for system integration',
        category: 'healthcare',
        type: 'internal',
        direction: 'bidirectional',
        purpose: 'publishing'
      });
      
      console.log('✅ REST API service creation initiated');
    } catch (err) {
      console.error('❌ Failed to create REST API service:', err);
    }
  };

  const handleCreateGraphQLService = async () => {
    console.log('🔄 Creating new GraphQL API service...');
    
    try {
      createApiService({
        name: 'GraphQL Healthcare API',
        description: 'A GraphQL API service for healthcare data management and queries',
        category: 'healthcare',
        type: 'internal',
        direction: 'bidirectional',
        purpose: 'publishing'
      });
      
      console.log('✅ GraphQL API service creation initiated');
    } catch (err) {
      console.error('❌ Failed to create GraphQL API service:', err);
    }
  };

  const handleDeleteService = async (serviceId: string, serviceName: string) => {
    console.log('🗑️ Deleting service:', serviceName);
    
    if (window.confirm(`Are you sure you want to delete "${serviceName}"? This action cannot be undone.`)) {
      try {
        deleteApiService(serviceId);
      } catch (err) {
        console.error('❌ Failed to delete service:', err);
      }
    }
  };

  const handleConfigureService = (service: any) => {
    setSelectedService(service);
    console.log(`🔧 Opening configuration for: ${service.name} (${service.id})`);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Internal API Services</h2>
          <p className="text-gray-600">Manage internal API integrations and services</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleRefresh} variant="outline" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleCreateService} disabled={isLoading}>
            <Plus className="h-4 w-4 mr-2" />
            Add REST API
          </Button>
          <Button onClick={handleCreateGraphQLService} disabled={isLoading}>
            <Plus className="h-4 w-4 mr-2" />
            Add GraphQL API
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search internal API services..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Total Services</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <Database className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Active</p>
                <p className="text-2xl font-bold text-green-900">{stats.statusDistribution.active || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">REST APIs</p>
                <p className="text-2xl font-bold text-purple-900">{stats.protocolDistribution.REST || 0}</p>
              </div>
              <Zap className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">GraphQL</p>
                <p className="text-2xl font-bold text-orange-900">{stats.protocolDistribution.GraphQL || 0}</p>
              </div>
              <Shield className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>Error Loading API Services</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{error?.message || String(error)}</p>
          </CardContent>
        </Card>
      )}

      {/* Services Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Internal API Services ({filteredServices.length})</span>
            </div>
            {searchQuery && (
              <Badge variant="outline">
                Showing results for: "{searchQuery}"
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredServices.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold mb-2">
                {searchQuery ? 'No Services Match Your Search' : 'No Internal API Services Found'}
              </h3>
              <p className="text-sm mb-4">
                {searchQuery 
                  ? 'Try adjusting your search terms or clear the search to see all services.'
                  : 'No internal API services have been configured yet.'
                }
              </p>
              <div className="flex gap-2 justify-center">
                {searchQuery && (
                  <Button variant="outline" onClick={() => setSearchQuery('')}>
                    Clear Search
                  </Button>
                )}
                <Button onClick={handleCreateService}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Service
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <Card key={service.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-blue-600" />
                      <span className="truncate">{service.name}</span>
                    </CardTitle>
                    <Badge variant={service.status === 'active' ? "default" : "secondary"}>
                      {service.status}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {service.description || 'No description available'}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Activity className="h-3 w-3" />
                            {service.type}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {service.direction || 'bidirectional'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            {service.category || 'integration'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(service.updated_at || service.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                       <div className="flex items-center justify-between pt-2 border-t">
                        <div className="text-xs text-gray-500">
                          ID: {service.id.slice(0, 8)}...
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleConfigureService(service)}
                          >
                            <Settings className="h-3 w-3 mr-1" />
                            Configure
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteService(service.id, service.name)}
                            disabled={isDeletingApiService}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration Dialog */}
      <ConfigurationDialog
        service={selectedService}
        isOpen={!!selectedService}
        onClose={() => setSelectedService(null)}
      />
    </div>
  );
};

export default InternalApiServicesTab;