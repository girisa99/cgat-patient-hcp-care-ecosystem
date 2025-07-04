
/**
 * MASTER USER TABLE - FOCUSED SINGLE SOURCE COMPONENT
 * Clean implementation using master consolidation principles
 * Version: master-user-table-v2.0.0
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMasterUserManagement } from '@/hooks/useMasterUserManagement';
import { PlusCircle, RefreshCw, Edit, Trash2 } from 'lucide-react';

export const MasterUserTable: React.FC = () => {
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

  console.log('🎯 Master User Table - Fixed Method Signatures');

  // Fixed method calls - no parameters as per master hook interface
  const handleRefresh = async () => {
    await fetchUsers();
  };

  const handleCreate = async () => {
    await createUser();
  };

  const handleUpdate = async () => {
    await updateUser();
  };

  const handleDelete = async () => {
    await deleteUser();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Master User Management</span>
            <Badge variant="secondary">{totalUsers} total</Badge>
            <Badge variant="default">{activeUsers} active</Badge>
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
              onClick={handleCreate}
              size="sm"
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
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
                  {user.role && (
                    <Badge variant="outline" className="mt-1">
                      {user.role}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={user.isActive ? 'default' : 'secondary'}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button
                    onClick={handleUpdate}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    onClick={handleDelete}
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
  );
};
