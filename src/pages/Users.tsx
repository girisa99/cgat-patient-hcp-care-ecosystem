
import React, { useState, useMemo } from 'react';
import StandardizedDashboardLayout from '@/components/layout/StandardizedDashboardLayout';
import { Section } from '@/components/ui/layout/Section';
import UsersList from '@/components/users/UsersList';
import { UserManagementDialogs } from '@/components/admin/UserManagement/UserManagementDialogs';
import { useConsistentUsers } from '@/hooks/useConsistentUsers';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

const Users = () => {
  const { users, isLoading, meta } = useConsistentUsers();
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [assignRoleOpen, setAssignRoleOpen] = useState(false);
  const [removeRoleOpen, setRemoveRoleOpen] = useState(false);
  const [assignFacilityOpen, setAssignFacilityOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);

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

  const headerActions = (
    <Button onClick={() => setCreateUserOpen(true)}>
      <UserPlus className="w-4 h-4 mr-2" />
      Create User
    </Button>
  );

  return (
    <StandardizedDashboardLayout
      showPageHeader={true}
      pageTitle="System Users"
      pageSubtitle="Manage user accounts and permissions"
      headerActions={headerActions}
    >
      {/* Users List */}
      <Section variant="card" title="User Management" subtitle="View and manage system users">
        <UsersList
          onCreateUser={() => setCreateUserOpen(true)}
          onAssignRole={handleAssignRole}
          onRemoveRole={handleRemoveRole}
          onAssignFacility={handleAssignFacility}
          onEditUser={handleEditUser}
        />
      </Section>

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
    </StandardizedDashboardLayout>
  );
};

export default Users;
