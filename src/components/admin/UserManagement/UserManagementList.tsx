
import React from 'react';
import UsersList from '@/components/users/UsersList';

interface UserManagementListProps {
  onCreateUser: () => void;
  onAssignRole: (userId: string) => void;
  onRemoveRole: (userId: string) => void;
  onAssignFacility: (userId: string) => void;
  onEditUser: (user: any) => void;
}

export const UserManagementList: React.FC<UserManagementListProps> = ({
  onCreateUser,
  onAssignRole,
  onRemoveRole,
  onAssignFacility,
  onEditUser
}) => {
  return (
    <div className="p-6">
      <UsersList
        onCreateUser={onCreateUser}
        onAssignRole={onAssignRole}
        onRemoveRole={onRemoveRole}
        onAssignFacility={onAssignFacility}
        onEditUser={onEditUser}
      />
    </div>
  );
};
