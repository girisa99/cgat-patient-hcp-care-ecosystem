
import React, { useState, useMemo } from 'react';
import { useConsistentUsers } from '@/hooks/useConsistentUsers';
import { UserManagementStats } from '@/components/admin/UserManagement/UserManagementStats';
import { UserManagementActions } from '@/components/admin/UserManagement/UserManagementActions';
import { UserManagementList } from '@/components/admin/UserManagement/UserManagementList';
import { UserManagementDebug } from '@/components/admin/UserManagement/UserManagementDebug';
import { UserManagementDialogs } from '@/components/admin/UserManagement/UserManagementDialogs';

const ConsistentUsers = () => {
  const { users, isLoading, meta } = useConsistentUsers();
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [assignRoleOpen, setAssignRoleOpen] = useState(false);
  const [removeRoleOpen, setRemoveRoleOpen] = useState(false);
  const [assignFacilityOpen, setAssignFacilityOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [debugMode, setDebugMode] = useState(false);

  // Memoize calculations to prevent unnecessary re-renders
  const userStats = useMemo(() => {
    if (!users) return { totalUsers: 0, usersWithRoles: 0, usersWithoutRoles: 0 };
    
    const totalUsers = users.length;
    const usersWithRoles = users.filter(user => user.user_roles && user.user_roles.length > 0).length;
    const usersWithoutRoles = totalUsers - usersWithRoles;
    
    return { totalUsers, usersWithRoles, usersWithoutRoles };
  }, [users]);

  const selectedUserForRole = useMemo(() => {
    return users?.find(u => u.id === selectedUserId);
  }, [users, selectedUserId]);

  const selectedUserName = useMemo(() => {
    if (!selectedUserForRole) return '';
    return `${selectedUserForRole.first_name || ''} ${selectedUserForRole.last_name || ''}`.trim() || selectedUserForRole.email;
  }, [selectedUserForRole]);

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

  const handleToggleDebug = () => {
    setDebugMode(!debugMode);
  };

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

      <UserManagementDebug
        debugMode={debugMode}
        selectedUserId={selectedUserId}
        selectedUserName={selectedUserName}
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
        selectedUserName={selectedUserName}
      />
    </div>
  );
};

export default ConsistentUsers;
