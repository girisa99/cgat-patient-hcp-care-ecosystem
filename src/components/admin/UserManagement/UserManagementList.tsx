
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          System Users
        </CardTitle>
      </CardHeader>
      <CardContent>
        <UsersList
          onCreateUser={onCreateUser}
          onAssignRole={onAssignRole}
          onRemoveRole={onRemoveRole}
          onAssignFacility={onAssignFacility}
          onEditUser={onEditUser}
        />
      </CardContent>
    </Card>
  );
};
