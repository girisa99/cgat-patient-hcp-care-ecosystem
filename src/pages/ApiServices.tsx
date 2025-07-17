
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Globe, Plus, RefreshCw, Settings, Activity,
  AlertCircle, CheckCircle, Zap, Search, BarChart3,
  Database, Shield, Clock
} from "lucide-react";
import { useMasterApiServices } from '@/hooks/useMasterApiServices';
import AppLayout from '@/components/layout/AppLayout';
import { getErrorMessage } from '@/utils/errorHandling';

const ApiServices = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const {
    apiServices,
    isLoading,
    error,
    createApiService,
    refetch,
    searchApiServices,
    getApiServiceStats,
    meta
  } = useMasterApiServices();

  // Get filtered services based on search
  const filteredServices = searchQuery 
    ? searchApiServices(searchQuery)
    : apiServices;

  // Get statistics
  const stats = getApiServiceStats();

  console.log('🔌 API Services Page - Master Hook State:', {
    serviceCount: apiServices.length,
    filteredCount: filteredServices.length,
    isLoading,
    error,
    searchQuery,
    stats
  });

  const handleRefresh = () => {
    console.log('🔄 Refreshing API services data...');
    refetch();
  };

  const handleCreateService = async () => {
    try {
      await createApiService({
        name: 'New API Service',
        description: 'A new API service created from the UI',
        category: 'integration',
        type: 'REST',
        direction: 'bidirectional',
        purpose: 'data_exchange'
      });
    } catch (err) {
      console.error('Failed to create API service:', err);
    }
  };


  if (isLoading) {
    return (
      <AppLayout title="API Services">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
           </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="API Services">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                API Services
              </h1>
              <p className="text-lg text-gray-600">
                Comprehensive API service management and analytics
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleRefresh}
                variant="outline"
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={handleCreateService} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Service
              </Button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative mt-6 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search API services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <Card className="border-0 shadow-sm bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Services</p>
                    <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                  </div>
                  <Database className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Active</p>
                    <p className="text-2xl font-bold text-green-900">{stats.statusDistribution.active || 0}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm bg-purple-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Types</p>
                    <p className="text-2xl font-bold text-purple-900">{Object.keys(stats.typeDistribution).length}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Categories</p>
                    <p className="text-2xl font-bold text-orange-900">{apiServices.filter(s => s.type).map(s => s.type).filter((v, i, a) => a.indexOf(v) === i).length}</p>
                  </div>
                  <Shield className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-0 shadow-sm bg-red-50 border-red-200 mb-6">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5" />
                <span>Error Loading API Services</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">{getErrorMessage(error)}</p>
              <Button onClick={handleRefresh} className="mt-4" variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* API Services Grid */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>API Services ({filteredServices.length} of {apiServices.length})</span>
              </div>
              {searchQuery && (
                <Badge variant="outline" className="text-sm">
                  Showing results for: "{searchQuery}"
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredServices.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="font-semibold mb-2">
                  {searchQuery ? 'No Services Match Your Search' : 'No API Services Found'}
                </h3>
                <p className="text-sm mb-4">
                  {searchQuery 
                    ? 'Try adjusting your search terms or clear the search to see all services.'
                    : error 
                      ? 'There was an error loading API services.' 
                      : 'No API services have been configured yet.'
                  }
                </p>
                <div className="flex gap-2 justify-center">
                  {searchQuery && (
                    <Button variant="outline" onClick={() => setSearchQuery('')}>
                      Clear Search
                    </Button>
                  )}
                  <Button onClick={handleRefresh}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                  <Card key={service.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-blue-600" />
                        <span className="truncate">{service.name}</span>
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={service.status === 'active' ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {service.status}
                        </Badge>
                      </div>
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
                              {service.type || 'API'}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Shield className="h-3 w-3" />
                              {service.status || 'active'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              ID: {service.id.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 border-t">
                          <Badge variant="outline" className="text-xs">
                            {new Date(service.updated_at || service.created_at).toLocaleDateString()}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Settings className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Status & Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* System Status */}
          <Card className="border-0 shadow-sm bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800 flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-blue-700 space-y-2">
                <div className="flex justify-between">
                  <span>Database Connection:</span>
                  <span className="font-medium">{error ? '❌ Error' : '✅ Connected'}</span>
                </div>
                <div className="flex justify-between">
                  <span>API Services Loaded:</span>
                  <span className="font-medium">{apiServices.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cache Status:</span>
                  <span className="font-medium">✅ Active</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Updated:</span>
                  <span className="font-medium">{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Analytics */}
          <Card className="border-0 shadow-sm bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Service Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-green-700 space-y-2">
                <div className="flex justify-between">
                  <span>Types Distribution:</span>
                  <span className="font-medium">
                    {Object.entries(stats.typeDistribution).map(([type, count]) => `${type}: ${count}`).join(', ') || 'None'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Status Distribution:</span>
                  <span className="font-medium">
                    {Object.entries(stats.statusDistribution).map(([status, count]) => `${status}: ${count}`).join(', ') || 'None'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Hook Metadata:</span>
                  <span className="font-medium">useMasterApiServices v{meta.version}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Cache Update:</span>
                  <span className="font-medium">{meta.lastFetched}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default ApiServices;
