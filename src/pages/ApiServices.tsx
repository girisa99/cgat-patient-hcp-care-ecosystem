
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Globe, Plus, RefreshCw, Settings, Activity,
  AlertCircle, CheckCircle, Zap
} from "lucide-react";
import { useMasterData } from '@/hooks/useMasterData';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import DashboardHeader from "@/components/layout/DashboardHeader";
import { getErrorMessage } from '@/utils/errorHandling';

const ApiServices = () => {
  const { user: authUser, userRoles, isAuthenticated } = useMasterAuth();
  const { 
    apiServices, 
    isLoading, 
    error,
    stats,
    refreshData,
    createApiService
  } = useMasterData();

  console.log('🔌 API Services Page - Current state:', {
    isAuthenticated,
    serviceCount: apiServices.length,
    isLoading,
    error,
    currentUser: authUser?.email
  });

  const handleRefresh = () => {
    console.log('🔄 Refreshing API services data...');
    refreshData();
  };

  const handleCreateService = async () => {
    try {
      await createApiService({
        name: 'New API Service',
        description: 'A new API service',
        base_url: '/api/new-service',
        type: 'REST'
      });
    } catch (err) {
      console.error('Failed to create API service:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="border-0 shadow-sm bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-yellow-800 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5" />
                <span>Authentication Required</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-yellow-700">
                You need to be logged in to view API services.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                API Services
              </h1>
              <p className="text-lg text-gray-600">
                Manage and monitor your API services and integrations
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              variant="outline"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          <div className="flex items-center space-x-2 mt-3">
            <Badge variant="outline" className="text-sm">
              Total Services: {stats.totalApiServices}
            </Badge>
            <Badge variant="outline" className="text-sm">
              Active: {stats.activeApiServices.length}
            </Badge>
            {userRoles.length > 0 && (
              <Badge variant="default" className="text-sm">
                Your Role: {userRoles.join(', ')}
              </Badge>
            )}
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
                <span>API Services ({apiServices.length})</span>
              </div>
              <Button size="sm" onClick={handleCreateService}>
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {apiServices.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="font-semibold mb-2">No API Services Found</h3>
                <p className="text-sm mb-4">
                  {error ? 'There was an error loading API services.' : 'No API services have been configured yet.'}
                </p>
                <Button onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {apiServices.map((service) => (
                  <Card key={service.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-blue-600" />
                        <span>{service.name}</span>
                      </CardTitle>
                      <Badge 
                        variant={service.status === 'active' ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {service.status}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600">
                          {service.description || 'No description available'}
                        </p>
                        
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Activity className="h-3 w-3" />
                            <span>Type: {service.type}</span>
                          </div>
                          <div className="flex space-x-1">
                            <Button variant="outline" size="sm">
                              <Settings className="h-3 w-3" />
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

        {/* Development Info */}
        <Card className="border-0 shadow-sm bg-blue-50 border-blue-200 mt-8">
          <CardHeader>
            <CardTitle className="text-blue-800">🚧 Development Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Database Connection:</strong> {error ? '❌ Error' : '✅ Connected'}</p>
              <p><strong>API Services Loaded:</strong> {apiServices.length}</p>
              <p><strong>Current User:</strong> {authUser?.email || 'Not logged in'}</p>
              <p><strong>User Roles:</strong> {userRoles.length > 0 ? userRoles.join(', ') : 'None assigned'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ApiServices;
