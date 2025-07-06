
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, UserPlus, RefreshCw, Settings,
  AlertCircle, CheckCircle, Users
} from "lucide-react";
import { useMasterData } from '@/hooks/useMasterData';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import DashboardHeader from "@/components/layout/DashboardHeader";

// Extended interface for roles with is_active
interface ExtendedRole {
  id: string;
  name: string;
  description?: string | null;
  is_active?: boolean;
}

const RoleManagement = () => {
  const { user: authUser, userRoles, isAuthenticated } = useMasterAuth();
  const { 
    roles, 
    isLoading, 
    error,
    refreshData
  } = useMasterData();

  console.log('🔐 Role Management - Current state:', {
    isAuthenticated,
    roleCount: roles.length,
    isLoading,
    error,
    currentUser: authUser?.email
  });

  const handleRefresh = () => {
    console.log('🔄 Refreshing roles data...');
    refreshData();
  };

  // Convert roles to extended format
  const extendedRoles: ExtendedRole[] = roles.map(role => ({
    ...role,
    is_active: true // Default to active since base roles don't have this field
  }));

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
                You need to be logged in to manage roles.
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
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
                Role Management
              </h1>
              <p className="text-lg text-gray-600">
                Manage user roles and permissions
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
              Total Roles: {extendedRoles.length}
            </Badge>
            <Badge variant="outline" className="text-sm">
              Active: {extendedRoles.filter(r => r.is_active).length}
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
                <span>Error Loading Roles</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">{error}</p>
              <Button onClick={handleRefresh} className="mt-4" variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {extendedRoles.map((role) => (
            <Card key={role.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span>{role.name}</span>
                </CardTitle>
                <Badge 
                  variant={role.is_active ? "default" : "secondary"}
                  className="text-xs"
                >
                  {role.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    {role.description || 'No description available'}
                  </p>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Users className="h-3 w-3" />
                      <span>Role ID: {role.id}</span>
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

        {/* Empty State */}
        {extendedRoles.length === 0 && !error && (
          <Card className="border-0 shadow-sm">
            <CardContent className="text-center py-12">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50 text-gray-400" />
              <h3 className="font-semibold mb-2 text-gray-700">No Roles Found</h3>
              <p className="text-sm mb-4 text-gray-500">
                No roles have been configured yet.
              </p>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Create First Role
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Development Info */}
        <Card className="border-0 shadow-sm bg-blue-50 border-blue-200 mt-8">
          <CardHeader>
            <CardTitle className="text-blue-800">🚧 Development Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Database Connection:</strong> {error ? '❌ Error' : '✅ Connected'}</p>
              <p><strong>Roles Loaded:</strong> {extendedRoles.length}</p>
              <p><strong>Current User:</strong> {authUser?.email || 'Not logged in'}</p>
              <p><strong>User Roles:</strong> {userRoles.length > 0 ? userRoles.join(', ') : 'None assigned'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RoleManagement;
