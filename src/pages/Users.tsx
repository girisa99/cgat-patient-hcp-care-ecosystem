
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import UsersList from '@/components/users/UsersList';
import BulkRoleAssignment from '@/components/users/BulkRoleAssignment';
import { UserManagementDialogs } from '@/components/admin/UserManagement/UserManagementDialogs';
import { useConsistentUsers } from '@/hooks/useConsistentUsers';

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

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
        <p className="text-muted-foreground">
          Manage user accounts, roles, permissions, and facility assignments
        </p>
      </div>

      {/* Bulk Operations */}
      <BulkRoleAssignment />
      
      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UsersList
            onCreateUser={() => setCreateUserOpen(true)}
            onAssignRole={handleAssignRole}
            onRemoveRole={handleRemoveRole}
            onAssignFacility={handleAssignFacility}
            onEditUser={handleEditUser}
          />
        </CardContent>
      </Card>

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
    </div>
  );
};

export default Users;
