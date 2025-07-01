
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
    console.log('👤 Opening role assignment for user:', userId);
    setSelectedUserId(userId);
    setAssignRoleOpen(true);
  };

  const handleRemoveRole = (userId: string) => {
    console.log('➖ Opening role removal for user:', userId);
    setSelectedUserId(userId);
    setRemoveRoleOpen(true);
  };

  const handleAssignFacility = (userId: string) => {
    console.log('🏢 Opening facility assignment for user:', userId);
    setSelectedUserId(userId);
    setAssignFacilityOpen(true);
  };

  const handleEditUser = (user: any) => {
    console.log('✏️ Opening edit dialog for user:', user.id, user.email);
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
    setSelectedUserId,
    
    // Handlers
    handleAssignRole,
    handleRemoveRole,
    handleAssignFacility,
    handleEditUser,
    resetSelection
  };
};
