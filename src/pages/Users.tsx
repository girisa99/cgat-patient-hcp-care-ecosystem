
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { AdminStatsGrid, StatCard } from '@/components/layout/AdminStatsGrid';
import { Card, CardContent } from '@/components/ui/card';
import { Users as UsersIcon, UserPlus, Settings, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUsers } from '@/hooks/useUsers';

// Import consolidated components
import {
  UsersList,
  CreateUserDialog,
  EditUserDialog,
  AssignRoleDialog,
  RemoveRoleDialog,
  AssignFacilityDialog,
  BulkRoleAssignment
} from '@/components/users';

const Users = () => {
  const { 
    users, 
    isLoading, 
    createUser, 
    assignRole, 
    assignFacility,
    meta 
  } = useUsers();

  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [assignRoleOpen, setAssignRoleOpen] = useState(false);
  const [removeRoleOpen, setRemoveRoleOpen] = useState(false);
  const [assignFacilityOpen, setAssignFacilityOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');

  const handleCreateUser = () => {
    setCreateUserOpen(true);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setEditUserOpen(true);
  };

  const handleAssignRole = (userId: string) => {
    const user = users?.find(u => u.id === userId);
    const userName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email : 'User';
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setAssignRoleOpen(true);
  };

  const handleRemoveRole = (userId: string) => {
    const user = users?.find(u => u.id === userId);
    const userName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email : 'User';
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setRemoveRoleOpen(true);
  };

  const handleAssignFacility = (userId: string) => {
    const user = users?.find(u => u.id === userId);
    const userName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email : 'User';
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setAssignFacilityOpen(true);
  };

  const headerActions = (
    <Button onClick={handleCreateUser}>
      <UserPlus className="h-4 w-4 mr-2" />
      Add User
    </Button>
  );

  // Calculate stats from meta data or fallback to users array
  const stats = {
    totalUsers: meta?.totalUsers || users?.length || 0,
    usersWithRoles: users?.filter(u => u.user_roles && u.user_roles.length > 0).length || 0,
    activeUsers: meta?.totalUsers || users?.length || 0,
    usersWithFacilities: users?.filter(u => u.facilities).length || 0
  };

  return (
    <MainLayout>
      <PageContainer
        title="Users Management"
        subtitle="Manage system users, roles, and permissions across the healthcare platform"
        headerActions={headerActions}
      >
        <div className="space-y-6">
          {/* Stats Grid */}
          <AdminStatsGrid columns={4}>
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={UsersIcon}
              description="All system users"
            />
            <StatCard
              title="With Roles"
              value={stats.usersWithRoles}
              icon={Shield}
              description="Users with assigned roles"
            />
            <StatCard
              title="Active Users"
              value={stats.activeUsers}
              icon={Settings}
              description="Currently active users"
            />
            <StatCard
              title="With Facilities"
              value={stats.usersWithFacilities}
              icon={Settings}
              description="Users assigned to facilities"
            />
          </AdminStatsGrid>

          {/* Bulk Role Assignment */}
          <BulkRoleAssignment />

          {/* Users List */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <UsersList
                onCreateUser={handleCreateUser}
                onAssignRole={handleAssignRole}
                onRemoveRole={handleRemoveRole}
                onAssignFacility={handleAssignFacility}
                onEditUser={handleEditUser}
              />
            </CardContent>
          </Card>
        </div>

        {/* Dialogs */}
        <CreateUserDialog
          open={createUserOpen}
          onOpenChange={setCreateUserOpen}
        />

        <EditUserDialog
          open={editUserOpen}
          onOpenChange={setEditUserOpen}
          user={selectedUser}
        />

        <AssignRoleDialog
          open={assignRoleOpen}
          onOpenChange={setAssignRoleOpen}
          userId={selectedUserId}
          userName={selectedUserName}
        />

        <RemoveRoleDialog
          open={removeRoleOpen}
          onOpenChange={setRemoveRoleOpen}
          userId={selectedUserId}
          userName={selectedUserName}
        />

        <AssignFacilityDialog
          open={assignFacilityOpen}
          onOpenChange={setAssignFacilityOpen}
          userId={selectedUserId}
          userName={selectedUserName}
        />
      </PageContainer>
    </MainLayout>
  );
};

export default Users;
