
import React, { useState } from 'react';
import { useUsers } from '@/hooks/useUsers';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Shield } from 'lucide-react';
import UserActions from './UserActions';
import PermissionManagementDialog from './PermissionManagementDialog';
import ModuleAssignmentDialog from '@/components/modules/ModuleAssignmentDialog';

interface UsersListProps {
  onCreateUser: () => void;
  onAssignRole: (userId: string) => void;
  onRemoveRole?: (userId: string) => void;
  onAssignFacility: (userId: string) => void;
  onEditUser: (user: any) => void;
}

const UsersList: React.FC<UsersListProps> = ({
  onCreateUser,
  onAssignRole,
  onRemoveRole,
  onAssignFacility,
  onEditUser
}) => {
  const { users, isLoading } = useUsers();
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');

  const handleManagePermissions = (userId: string, userName: string) => {
    console.log('Managing permissions for:', userId, userName);
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setPermissionDialogOpen(true);
  };

  const handleAssignModule = (userId: string, userName: string) => {
    console.log('Assigning module for:', userId, userName);
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setModuleDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">No users found</p>
        <Button onClick={onCreateUser}>
          <Plus className="mr-2 h-4 w-4" />
          Create First User
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Shield className="h-5 w-5" />
          All Users ({users.length})
        </h3>
        <Button onClick={onCreateUser}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="border rounded-lg">
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
                    <p className="font-medium">
                      {user.first_name || user.last_name 
                        ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                        : 'No name set'
                      }
                    </p>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600">
                    {user.department || 'Not specified'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.user_roles && user.user_roles.length > 0 ? (
                      user.user_roles.map((userRole, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {userRole.roles.name}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        No roles
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600">
                    {user.facilities?.name || 'Not assigned'}
                  </span>
                </TableCell>
                <TableCell>
                  <UserActions
                    user={user}
                    onEditUser={onEditUser}
                    onAssignRole={onAssignRole}
                    onRemoveRole={onRemoveRole}
                    onAssignFacility={onAssignFacility}
                    onManagePermissions={handleManagePermissions}
                    onAssignModule={handleAssignModule}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Permission Management Dialog */}
      <PermissionManagementDialog
        open={permissionDialogOpen}
        onOpenChange={setPermissionDialogOpen}
        userId={selectedUserId}
        userName={selectedUserName}
      />

      {/* Module Assignment Dialog */}
      <ModuleAssignmentDialog
        open={moduleDialogOpen}
        onOpenChange={setModuleDialogOpen}
        userId={selectedUserId}
        userName={selectedUserName}
      />
    </div>
  );
};

export default UsersList;
