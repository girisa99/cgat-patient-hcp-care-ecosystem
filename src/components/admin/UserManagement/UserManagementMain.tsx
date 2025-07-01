
import React, { useState } from 'react';
import { useConsolidatedUsers } from '@/hooks/useConsolidatedUsers';
import { useUserManagementDialogs } from '@/hooks/useUserManagementDialogs';
import { useUserDeactivation } from '@/hooks/mutations/useUserDeactivation';
import { ConsolidatedUserManagement } from './ConsolidatedUserManagement';

export const UserManagementMain: React.FC = () => {
  const {
    users,
    assignRole,
    removeRole,
    assignFacility,
    isAssigningRole,
    isRemovingRole,
    isAssigningFacility,
    getUserStats,
    meta
  } = useConsolidatedUsers();

  const {
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
    setSelectedUserId,
    handleAssignRole,
    handleRemoveRole,
    handleAssignFacility,
    handleEditUser,
    resetSelection
  } = useUserManagementDialogs();

  const { deactivateUser } = useUserDeactivation();

  // Pass the removeRole function from consolidated hook to the dialogs management
  const enhancedHandleRemoveRole = (userId: string) => {
    handleRemoveRole(userId);
  };

  const handleRoleAssignment = (roleName: string) => {
    if (selectedUserId) {
      assignRole({ userId: selectedUserId, roleName: roleName as any });
      setAssignRoleOpen(false);
      resetSelection();
    }
  };

  const handleRoleRemoval = (roleName: string) => {
    if (selectedUserId) {
      removeRole({ userId: selectedUserId, roleName: roleName as any });
      setRemoveRoleOpen(false);
      resetSelection();
    }
  };

  const handleFacilityAssignment = (facilityId: string) => {
    if (selectedUserId) {
      assignFacility({ userId: selectedUserId, facilityId });
      setAssignFacilityOpen(false);
      resetSelection();
    }
  };

  return (
    <ConsolidatedUserManagement />
  );
};
