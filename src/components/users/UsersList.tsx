
import React, { useState } from 'react';
import { useUsers } from '@/hooks/useUsers';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, UserPlus, Building2, RefreshCw, AlertCircle, Edit } from 'lucide-react';

interface UsersListProps {
  onCreateUser: () => void;
  onAssignRole: (userId: string) => void;
  onAssignFacility: (userId: string) => void;
  onEditUser: (user: any) => void;
}

const UsersList: React.FC<UsersListProps> = ({
  onCreateUser,
  onAssignRole,
  onAssignFacility,
  onEditUser
}) => {
  const { users, isLoading, error, refetch } = useUsers();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    console.log('🔄 Manual refresh triggered by user...');
    try {
      await refetch();
      console.log('✅ Manual refresh completed successfully');
    } catch (error) {
      console.error('❌ Manual refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <div>
            <p className="text-red-600 font-medium">Error loading users</p>
            <p className="text-sm text-gray-500 mt-1">
              {error.message || 'Failed to fetch users'}
            </p>
          </div>
          <Button onClick={handleRefresh} variant="outline" disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500 mb-4">No users found</p>
        <Button onClick={onCreateUser}>
          <Plus className="mr-2 h-4 w-4" />
          Add First User
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">All Users</h3>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <Button onClick={onCreateUser}>
          <Plus className="mr-2 h-4 w-4" />
          Add New User
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Roles</TableHead>
            <TableHead>Facility</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div>
                  <div className="font-medium">
                    {user.first_name || user.last_name 
                      ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                      : <span className="text-gray-400 italic">No name set</span>
                    }
                  </div>
                  <div className="text-sm text-gray-500">{user.phone || 'No phone'}</div>
                </div>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.department || '-'}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {user.user_roles?.length > 0 ? (
                    user.user_roles.map((userRole, index) => (
                      <Badge key={index} variant="secondary">
                        {userRole.roles.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-400">No roles</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {user.facilities ? (
                  <div>
                    <div className="font-medium">{user.facilities.name}</div>
                    <div className="text-sm text-gray-500">{user.facilities.facility_type}</div>
                  </div>
                ) : (
                  <span className="text-gray-400">No facility</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEditUser(user)}
                    title="Edit User"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAssignRole(user.id)}
                    title="Assign Role"
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAssignFacility(user.id)}
                    title="Assign Facility"
                  >
                    <Building2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersList;
