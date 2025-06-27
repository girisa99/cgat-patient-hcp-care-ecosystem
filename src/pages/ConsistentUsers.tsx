
import React from 'react';
import { useConsistentUsers } from '@/hooks/useConsistentUsers';
import { useUserManagementDialogs } from '@/hooks/useUserManagementDialogs';
import { useUserStatistics } from '@/hooks/useUserStatistics';
import { useDebugMode } from '@/hooks/useDebugMode';
import { ConsistentUsersLayout } from '@/components/users/ConsistentUsersLayout';
import { ConsistentUsersHeader } from '@/components/users/ConsistentUsersHeader';
import { ConsistentUsersContent } from '@/components/users/ConsistentUsersContent';

const ConsistentUsers = () => {
  // Business Logic Hooks
  const { users, isLoading, meta } = useConsistentUsers();
  const { debugMode, toggleDebugMode } = useDebugMode();
  const userStats = useUserStatistics(users);
  
  const {
    createUserOpen,
    editUserOpen,
    assignRoleOpen,
    removeRoleOpen,
    assignFacilityOpen,
    selectedUserId,
    selectedUser,
    setCreateUserOpen,
    setEditUserOpen,
    setAssignRoleOpen,
    setRemoveRoleOpen,
    setAssignFacilityOpen,
    handleAssignRole,
    handleRemoveRole,
    handleAssignFacility,
    handleEditUser
  } = useUserManagementDialogs();

  // Loading state
  if (isLoading) {
    return (
      <ConsistentUsersLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-lg text-gray-600">Loading users...</div>
        </div>
      </ConsistentUsersLayout>
    );
  }

  return (
    <ConsistentUsersLayout
      showAlert={debugMode}
      alertMessage="Debug mode is enabled. Additional diagnostic information is available."
    >
      <ConsistentUsersHeader
        userStats={userStats}
        meta={meta}
        debugMode={debugMode}
        onToggleDebug={toggleDebugMode}
      />

      <ConsistentUsersContent
        onCreateUser={() => setCreateUserOpen(true)}
        onAssignRole={handleAssignRole}
        onRemoveRole={handleRemoveRole}
        onAssignFacility={handleAssignFacility}
        onEditUser={handleEditUser}
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
        selectedUserName={users?.find(u => u.id === selectedUserId)?.first_name || ''}
      />
    </ConsistentUsersLayout>
  );
};

export default ConsistentUsers;
