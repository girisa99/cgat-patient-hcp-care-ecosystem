
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useConsolidatedUsers } from '@/hooks/useConsolidatedUsers';
import { UsersTableHeader } from './UsersTableHeader';
import { UserTableRow } from './UserTableRow';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface UsersListProps {
  onEditUser: (user: any) => void;
  onAssignRole: (userId: string) => void;
  onRemoveRole?: (userId: string) => void; 
  onAssignFacility: (userId: string) => void;
  onManagePermissions: (userId: string, userName: string) => void;
  onAssignModule?: (userId: string, userName: string) => void;
  onResendVerification?: (userEmail: string, userName: string) => void;
  onDeactivateUser?: (userId: string, userName: string, userEmail: string) => void;
  onViewModules?: (userId: string, userName: string) => void;
}

const UsersList: React.FC<UsersListProps> = ({
  onEditUser,
  onAssignRole,
  onRemoveRole,
  onAssignFacility,
  onManagePermissions,
  onAssignModule,
  onResendVerification,
  onDeactivateUser,
  onViewModules
}) => {
  const { users, isLoading, searchUsers } = useConsolidatedUsers();
  const [searchQuery, setSearchQuery] = useState('');

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading users...</p>
        </CardContent>
      </Card>
    );
  }

  const filteredUsers = searchUsers(searchQuery);

  return (
    <Card>
      <UsersTableHeader 
        userCount={filteredUsers.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email Status</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Facility</TableHead>
                <TableHead>Account Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <UserTableRow
                  key={user.id}
                  user={user}
                  onEditUser={onEditUser}
                  onAssignRole={onAssignRole}
                  onRemoveRole={onRemoveRole}
                  onAssignFacility={onAssignFacility}
                  onManagePermissions={onManagePermissions}
                  onAssignModule={onAssignModule}
                  onResendVerification={onResendVerification}
                  onDeactivateUser={onDeactivateUser}
                  onViewModules={onViewModules}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default UsersList;
