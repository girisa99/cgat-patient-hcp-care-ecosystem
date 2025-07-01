
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useUnifiedUserManagement } from '@/hooks/useUnifiedUserManagement';
import { UsersTableHeader } from './UsersTableHeader';
import { UserTableRow } from './UserTableRow';
import UserActions from './UserActions';

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
  const { users, isLoading, searchUsers } = useUnifiedUserManagement();
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredUsers = searchUsers(searchQuery);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading users from unified data source...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <UsersTableHeader
        userCount={filteredUsers.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <CardContent>
        <div className="space-y-4">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div key={user.id} className="border rounded-lg p-4">
                <UserTableRow user={user} />
                <div className="mt-3 flex justify-end">
                  <UserActions
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
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? 'No users found matching your search.' : 'No users found.'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UsersList;
