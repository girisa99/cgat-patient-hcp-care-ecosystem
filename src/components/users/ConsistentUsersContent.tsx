
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UsersList } from '@/components/users';
import { BulkRoleAssignment } from '@/components/users';

interface ConsistentUsersContentProps {
  onCreateUser: () => void;
  onAssignRole: (userId: string) => void;
  onRemoveRole: (userId: string) => void;
  onAssignFacility: (userId: string) => void;
  onEditUser: (userId: string) => void;
  
  // Dialog states
  createUserOpen: boolean;
  setCreateUserOpen: (open: boolean) => void;
  editUserOpen: boolean;
  setEditUserOpen: (open: boolean) => void;
  assignRoleOpen: boolean;
  setAssignRoleOpen: (open: boolean) => void;
  removeRoleOpen: boolean;
  setRemoveRoleOpen: (open: boolean) => void;
  assignFacilityOpen: boolean;
  setAssignFacilityOpen: (open: boolean) => void;
  
  // Selected user info
  selectedUserId: string | null;
  selectedUser: any;
  selectedUserName: string;
}

export const ConsistentUsersContent: React.FC<ConsistentUsersContentProps> = ({
  onCreateUser,
  onAssignRole,
  onRemoveRole,
  onAssignFacility,
  onEditUser,
  createUserOpen,
  setCreateUserOpen,
  editUserOpen,
  setEditUserOpen,
  assignRoleOpen,
  setAssignRoleOpen,
  removeRoleOpen,
  setRemoveRoleOpen,
  assignFacilityOpen,
  setAssignFacilityOpen,
  selectedUserId,
  selectedUser,
  selectedUserName
}) => {
  return (
    <div className="space-y-6">
      {/* Bulk Role Assignment */}
      <Card className="bg-white shadow-sm">
        <CardContent className="pt-6">
          <BulkRoleAssignment />
        </CardContent>
      </Card>

      {/* Users List Section */}
      <Card className="bg-white shadow-sm">
        <CardContent className="p-0">
          <UsersList
            onCreateUser={onCreateUser}
            onAssignRole={onAssignRole}
            onRemoveRole={onRemoveRole}
            onAssignFacility={onAssignFacility}
            onEditUser={onEditUser}
          />
        </CardContent>
      </Card>
    </div>
  );
};
