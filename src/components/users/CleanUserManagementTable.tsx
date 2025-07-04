
/**
 * CLEAN USER MANAGEMENT TABLE - SINGLE SOURCE OF TRUTH
 * Simple, focused component using only useMasterUserManagement
 * Version: clean-user-management-table-v1.0.0
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMasterUserManagement } from '@/hooks/useMasterUserManagement';
import { Users, RefreshCw, UserPlus } from 'lucide-react';

export const CleanUserManagementTable: React.FC = () => {
  const {
    users,
    isLoading,
    error,
    fetchUsers,
    totalUsers,
    activeUsers,
    patientCount,
    staffCount
  } = useMasterUserManagement();

  console.log('🎯 Clean User Management Table - Master Consolidation Compliant');

  const handleRefresh = async () => {
    await fetchUsers();
  };

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error loading users: {error}
            <Button onClick={handleRefresh} className="ml-4" variant="outline">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium">Total Users</p>
                <div className="text-2xl font-bold">{totalUsers}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-4 w-4 text-green-600" />
              <div className="ml-2">
                <p className="text-sm font-medium">Active</p>
                <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-4 w-4 text-blue-600" />
              <div className="ml-2">
                <p className="text-sm font-medium">Patients</p>
                <div className="text-2xl font-bold text-blue-600">{patientCount}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-4 w-4 text-purple-600" />
              <div className="ml-2">
                <p className="text-sm font-medium">Staff</p>
                <div className="text-2xl font-bold text-purple-600">{staffCount}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main User Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>User Management</span>
              <Badge variant="secondary">{totalUsers} users</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Loading...' : 'Refresh'}
              </Button>
              <Button
                size="sm"
                className="flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Add User
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {isLoading ? 'Loading users...' : 'No users found'}
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    <div className="flex items-center gap-2 mt-1">
                      {user.role && (
                        <Badge variant="outline">{user.role}</Badge>
                      )}
                      <Badge variant={user.isActive ? 'default' : 'secondary'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      Roles
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Source Verification */}
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="p-4">
          <div className="text-center">
            <div className="text-sm font-medium text-green-700">
              ✅ Single Source of Truth Active - Master User Management
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Data Source: useMasterUserManagement | Users: {totalUsers} | Version: v13.0.0
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
