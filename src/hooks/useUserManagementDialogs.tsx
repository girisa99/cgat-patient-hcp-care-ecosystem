
/**
 * USER MANAGEMENT DIALOGS HOOK
 * Manages dialog states for user management
 */
import { useState } from 'react';

export const useUserManagementDialogs = () => {
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [assignRoleOpen, setAssignRoleOpen] = useState(false);
  const [removeRoleOpen, setRemoveRoleOpen] = useState(false);
  const [assignFacilityOpen, setAssignFacilityOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  return {
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
    setSelectedUserId,
    selectedUser,
    setSelectedUser
  };
};
