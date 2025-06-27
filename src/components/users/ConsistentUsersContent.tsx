
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserManagementActions } from '@/components/admin/UserManagement/UserManagementActions';
import { UserManagementList } from '@/components/admin/UserManagement/UserManagementList';
import { UserManagementDialogs } from '@/components/admin/UserManagement/UserManagementDialogs';

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
      {/* Actions Section */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <UserManagementActions />
        </CardContent>
      </Card>

      {/* Users List Section */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">Users Directory</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <UserManagementList
            onCreateUser={onCreateUser}
            onAssignRole={onAssignRole}
            onRemoveRole={onRemoveRole}
            onAssignFacility={onAssignFacility}
            onEditUser={onEditUser}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <UserManagementDialogs
        createUserOpen={createUserOpen}
        setCreateUserOpen={setCreateUserOpen}
        editUserOpen={editUserOpen}
        setEditUserOpen={setEditUserOpen}
        assignRoleOpen={assignRoleOpen}
        setAssignRoleOpen={setAssignRoleOpen}
        removeRoleOpen={removeRoleOpen}
        setRemoveRoleOpen={setRemoveRoleOpen}
        assignFacilityOpen={assignFacilityOpen}
        setAssignFacilityOpen={setAssignFacilityOpen}
        selectedUserId={selectedUserId}
        selectedUser={selectedUser}
        selectedUserName={selectedUserName}
      />
    </div>
  );
};
