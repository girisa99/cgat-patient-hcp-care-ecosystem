
/**
 * CLEAN USER MANAGEMENT TABLE - MASTER CONSOLIDATION COMPLIANT
 * Uses correct method signatures from master hook
 * Version: clean-user-management-table-v2.0.0
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMasterUserManagement } from '@/hooks/useMasterUserManagement';
import { RefreshCw, UserPlus, Edit, Trash2 } from 'lucide-react';

export const CleanUserManagementTable: React.FC = () => {
  const {
    users,
    isLoading,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    totalUsers,
    activeUsers
  } = useMasterUserManagement();

  console.log('🎯 Clean User Management Table - Master Consolidation Compliant');

  // All method calls use correct signatures (no parameters)
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Clean User Management</span>
            <Badge variant="secondary">{totalUsers} users</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleCreateUser} size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="font-medium">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-sm text-gray-500">{user.email}</div>
                <div className="flex items-center gap-2 mt-1">
                  {user.role && <Badge variant="outline">{user.role}</Badge>}
                  <Badge variant={user.isActive ? 'default' : 'secondary'}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleUpdateUser} variant="outline" size="sm">
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button onClick={handleDeleteUser} variant="outline" size="sm">
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
