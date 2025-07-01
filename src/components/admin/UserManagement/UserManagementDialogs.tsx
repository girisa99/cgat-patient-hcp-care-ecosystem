
import React from 'react';
import CreateUserDialog from '@/components/users/CreateUserDialog';
import EditUserDialog from '@/components/users/EditUserDialog';
import AssignRoleDialog from '@/components/users/AssignRoleDialog';
import RemoveRoleDialog from '@/components/users/RemoveRoleDialog';
import AssignFacilityDialog from '@/components/users/AssignFacilityDialog';

interface UserManagementDialogsProps {
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
  selectedUserId: string | null;
  selectedUser: any;
  selectedUserName: string;
}

export const UserManagementDialogs: React.FC<UserManagementDialogsProps> = ({
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
  selectedUser
}) => {
  return (
    <>
      <CreateUserDialog
        open={createUserOpen}
        onOpenChange={setCreateUserOpen}
      />

      <EditUserDialog
        open={editUserOpen}
        onOpenChange={setEditUserOpen}
        user={selectedUser}
      />

      <AssignRoleDialog
        open={assignRoleOpen}
        onOpenChange={setAssignRoleOpen}
        userId={selectedUserId}
      />

      <RemoveRoleDialog
        open={removeRoleOpen}
        onOpenChange={setRemoveRoleOpen}
        userId={selectedUserId}
      />

      <AssignFacilityDialog
        open={assignFacilityOpen}
        onOpenChange={setAssignFacilityOpen}
        userId={selectedUserId}
      />
    </>
  );
};
