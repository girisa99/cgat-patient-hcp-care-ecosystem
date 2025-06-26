
import React from 'react';
import { useConsistentUsers } from '@/hooks/useConsistentUsers';
import { useUserManagementDialogs } from '@/hooks/useUserManagementDialogs';
import { useUserStatistics } from '@/hooks/useUserStatistics';
import { useDebugMode } from '@/hooks/useDebugMode';
import { UserManagementStats } from '@/components/admin/UserManagement/UserManagementStats';
import { UserManagementActions } from '@/components/admin/UserManagement/UserManagementActions';
import { UserManagementList } from '@/components/admin/UserManagement/UserManagementList';
import { UserManagementDialogs } from '@/components/admin/UserManagement/UserManagementDialogs';

const ConsistentUsers = () => {
  const { users, isLoading, meta } = useConsistentUsers();
  const { debugMode, handleToggleDebug } = useDebugMode();
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Users Management (Unified)</h2>
        <p className="text-muted-foreground">
          Manage user accounts, roles, permissions using unified data source
        </p>
      </div>

      <UserManagementStats
        userStats={userStats}
        meta={meta}
        debugMode={debugMode}
        onToggleDebug={handleToggleDebug}
      />

      <UserManagementActions />
      
      <UserManagementList
        onCreateUser={() => setCreateUserOpen(true)}
        onAssignRole={handleAssignRole}
        onRemoveRole={handleRemoveRole}
        onAssignFacility={handleAssignFacility}
        onEditUser={handleEditUser}
      />

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
        selectedUserName={users?.find(u => u.id === selectedUserId)?.first_name || ''}
      />
    </div>
  );
};

export default ConsistentUsers;
