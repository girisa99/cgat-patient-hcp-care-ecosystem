
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

  // Helper function to get user name
  const getUserName = (userId: string) => {
    const user = users?.find(u => u.id === userId);
    return user?.first_name || user?.last_name 
      ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
      : user?.email || '';
  };

  // Wrapper functions to handle the userName parameter
  const handleAssignRoleWithName = (userId: string) => {
    const userName = getUserName(userId);
    handleAssignRole(userId, userName);
  };

  const handleRemoveRoleWithName = (userId: string) => {
    const userName = getUserName(userId);
    handleRemoveRole(userId, userName);
  };

  const handleAssignFacilityWithName = (userId: string) => {
    const userName = getUserName(userId);
    handleAssignFacility(userId, userName);
  };

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
        onAssignRole={handleAssignRoleWithName}
        onRemoveRole={handleRemoveRoleWithName}
        onAssignFacility={handleAssignFacilityWithName}
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
        selectedUserName={selectedUserId ? getUserName(selectedUserId) : ''}
      />
    </ConsistentUsersLayout>
  );
};

export default ConsistentUsers;
