
import React from 'react';
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
import { Plus, UserPlus, Building2 } from 'lucide-react';

interface UsersListProps {
  onCreateUser: () => void;
  onAssignRole: (userId: string) => void;
  onAssignFacility: (userId: string) => void;
}

const UsersList: React.FC<UsersListProps> = ({
  onCreateUser,
  onAssignRole,
  onAssignFacility
}) => {
  const { users, isLoading, error } = useUsers();

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
        <p className="text-red-600">Error loading users: {error.message}</p>
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
        <h3 className="text-lg font-semibold">All Users</h3>
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
                    {user.first_name} {user.last_name}
                  </div>
                  <div className="text-sm text-gray-500">{user.phone}</div>
                </div>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.department || '-'}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {user.user_roles?.map((userRole, index) => (
                    <Badge key={index} variant="secondary">
                      {userRole.roles.name}
                    </Badge>
                  )) || <span className="text-gray-400">No roles</span>}
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
                    onClick={() => onAssignRole(user.id)}
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAssignFacility(user.id)}
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
