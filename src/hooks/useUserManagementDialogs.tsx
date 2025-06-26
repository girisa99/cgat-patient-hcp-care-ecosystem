
import { useState } from 'react';

export const useUserManagementDialogs = () => {
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [assignRoleOpen, setAssignRoleOpen] = useState(false);
  const [removeRoleOpen, setRemoveRoleOpen] = useState(false);
  const [assignFacilityOpen, setAssignFacilityOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const handleAssignRole = (userId: string) => {
    setSelectedUserId(userId);
    setAssignRoleOpen(true);
  };

  const handleRemoveRole = (userId: string) => {
    setSelectedUserId(userId);
    setRemoveRoleOpen(true);
  };

  const handleAssignFacility = (userId: string) => {
    setSelectedUserId(userId);
    setAssignFacilityOpen(true);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setEditUserOpen(true);
  };

  const resetSelection = () => {
    setSelectedUserId(null);
    setSelectedUser(null);
  };

  return {
    // State
    createUserOpen,
    editUserOpen,
    assignRoleOpen,
    removeRoleOpen,
    assignFacilityOpen,
    selectedUserId,
    selectedUser,
    
    // Setters
    setCreateUserOpen,
    setEditUserOpen,
    setAssignRoleOpen,
    setRemoveRoleOpen,
    setAssignFacilityOpen,
    
    // Handlers
    handleAssignRole,
    handleRemoveRole,
    handleAssignFacility,
    handleEditUser,
    resetSelection
  };
};
