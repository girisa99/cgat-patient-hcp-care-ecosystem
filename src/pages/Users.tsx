
import React, { useState } from 'react';
import StandardizedDashboardLayout from '@/components/layout/StandardizedDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users as UsersIcon, UserPlus, Settings, Shield } from 'lucide-react';
import UsersList from '@/components/users/UsersList';
import CreateUserDialog from '@/components/users/CreateUserDialog';
import EditUserDialog from '@/components/users/EditUserDialog';
import AssignRoleDialog from '@/components/users/AssignRoleDialog';
import RemoveRoleDialog from '@/components/users/RemoveRoleDialog';
import AssignFacilityDialog from '@/components/users/AssignFacilityDialog';
import { Button } from '@/components/ui/button';
import { useUsers } from '@/hooks/useUsers';

const Users = () => {
  const { users, isLoading } = useUsers();
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

  return (
    <StandardizedDashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
            <p className="text-muted-foreground">
              Manage system users, roles, and permissions
            </p>
          </div>
          <Button onClick={handleCreateUser}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* User Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">With Roles</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users?.filter(u => u.user_roles && u.user_roles.length > 0).length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Facilities</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users?.filter(u => u.facilities).length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users List */}
        <Card>
          <CardContent className="p-0">
            <UsersList
              onCreateUser={handleCreateUser}
              onAssignRole={handleAssignRole}
              onRemoveRole={handleRemoveRole}
              onAssignFacility={handleAssignFacility}
              onEditUser={handleEditUser}
            />
          </CardContent>
        </Card>

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
      </div>
    </StandardizedDashboardLayout>
  );
};

export default Users;
