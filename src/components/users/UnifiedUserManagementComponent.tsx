
/**
 * UNIFIED USER MANAGEMENT COMPONENT - SINGLE SOURCE IMPLEMENTATION
 * Consolidates all user management functionality with proper master hook integration
 * Version: unified-user-management-v1.0.0
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMasterUserManagement } from '@/hooks/useMasterUserManagement';
import { PlusCircle, RefreshCw, Edit, Trash2, Users, UserCheck, UserX } from 'lucide-react';

export const UnifiedUserManagementComponent: React.FC = () => {
  const {
    users,
    isLoading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    assignRole,
    removeRole,
    assignFacility,
    deactivateUser,
    totalUsers,
    activeUsers,
    inactiveUsers,
    patientCount,
    staffCount,
    adminCount,
    isCreatingUser,
    isAssigningRole,
    isRemovingRole,
    isAssigningFacility,
    isDeactivating
  } = useMasterUserManagement();

  console.log('🎯 Unified User Management - Master Hook Integration Active');

  // Fixed method calls - no parameters as per master hook interface
  const handleRefresh = async () => {
    await fetchUsers();
  };

  const handleCreateUser = async () => {
    await createUser();
  };

  const handleUpdateUser = async () => {
    await updateUser();
  };

  const handleDeleteUser = async () => {
    await deleteUser();
  };

  const handleAssignRole = async () => {
    await assignRole();
  };

  const handleRemoveRole = async () => {
    await removeRole();
  };

  const handleAssignFacility = async () => {
    await assignFacility();
  };

  const handleDeactivateUser = async () => {
    await deactivateUser();
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <UserCheck className="h-4 w-4 text-green-600" />
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
              <UserX className="h-4 w-4 text-red-600" />
              <div className="ml-2">
                <p className="text-sm font-medium">Inactive</p>
                <div className="text-2xl font-bold text-red-600">{inactiveUsers}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-4 w-4 text-blue-600" />
              <div className="ml-2">
                <p className="text-sm font-medium">By Role</p>
                <div className="text-xs text-muted-foreground">
                  Patients: {patientCount}, Staff: {staffCount}, Admins: {adminCount}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main User Management Card */}
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
                onClick={handleCreateUser}
                size="sm"
                disabled={isCreatingUser}
                className="flex items-center gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                {isCreatingUser ? 'Creating...' : 'Add User'}
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
                    <Button
                      onClick={handleUpdateUser}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      onClick={handleAssignRole}
                      variant="outline"
                      size="sm"
                      disabled={isAssigningRole}
                      className="flex items-center gap-1"
                    >
                      Role
                    </Button>
                    <Button
                      onClick={handleAssignFacility}
                      variant="outline"
                      size="sm"
                      disabled={isAssigningFacility}
                      className="flex items-center gap-1"
                    >
                      Facility
                    </Button>
                    <Button
                      onClick={handleDeleteUser}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
