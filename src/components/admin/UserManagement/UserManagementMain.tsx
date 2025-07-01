
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter,
  Download,
  Upload,
  Settings,
  Shield,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import UsersList from '@/components/users/UsersList';
import { UserManagementDialogs } from './UserManagementDialogs';
import UserPermissionsDialog from '@/components/users/UserPermissionsDialog';
import AssignModuleDialog from '@/components/users/AssignModuleDialog';
import ViewUserModulesDialog from '@/components/users/ViewUserModulesDialog';
import ResendVerificationDialog from '@/components/users/ResendVerificationDialog';
import DeactivateUserDialog from '@/components/users/DeactivateUserDialog';
import BulkUserActionsDialog from '@/components/users/BulkUserActionsDialog';

export const UserManagementMain: React.FC = () => {
  const { users, isLoading, getUserStats } = useUsers();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedUserName, setSelectedUserName] = useState('');
  const [selectedUserEmail, setSelectedUserEmail] = useState('');

  // Dialog states
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [assignRoleOpen, setAssignRoleOpen] = useState(false);
  const [removeRoleOpen, setRemoveRoleOpen] = useState(false);
  const [assignFacilityOpen, setAssignFacilityOpen] = useState(false);
  const [userPermissionsOpen, setUserPermissionsOpen] = useState(false);
  const [assignModuleOpen, setAssignModuleOpen] = useState(false);
  const [viewUserModulesOpen, setViewUserModulesOpen] = useState(false);
  const [resendVerificationOpen, setResendVerificationOpen] = useState(false);
  const [deactivateUserOpen, setDeactivateUserOpen] = useState(false);
  const [bulkActionsOpen, setBulkActionsOpen] = useState(false);

  const stats = getUserStats();
  const filteredUsers = users.filter(user => 
    user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditUser = (user: any) => {
    console.log('✏️ Opening edit dialog for user:', user.id);
    setSelectedUser(user);
    setSelectedUserName(`${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email);
    setEditUserOpen(true);
  };

  const handleAssignRole = (userId: string) => {
    setSelectedUserId(userId);
    const user = users.find(u => u.id === userId);
    setSelectedUserName(`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email || '');
    setAssignRoleOpen(true);
  };

  const handleRemoveRole = (userId: string) => {
    setSelectedUserId(userId);
    const user = users.find(u => u.id === userId);
    setSelectedUserName(`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email || '');
    setRemoveRoleOpen(true);
  };

  const handleAssignFacility = (userId: string) => {
    setSelectedUserId(userId);
    const user = users.find(u => u.id === userId);
    setSelectedUserName(`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email || '');
    setAssignFacilityOpen(true);
  };

  const handleManagePermissions = (userId: string, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setUserPermissionsOpen(true);
  };

  const handleAssignModule = (userId: string, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setAssignModuleOpen(true);
  };

  const handleViewModules = (userId: string, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setViewUserModulesOpen(true);
  };

  const handleResendVerification = (userEmail: string, userName: string) => {
    setSelectedUserEmail(userEmail);
    setSelectedUserName(userName);
    setResendVerificationOpen(true);
  };

  const handleDeactivateUser = (userId: string, userName: string, userEmail: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setSelectedUserEmail(userEmail);
    setDeactivateUserOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-gray-600">Manage users, roles, permissions, and access</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setBulkActionsOpen(true)} variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Bulk Actions
          </Button>
          <Button onClick={() => setCreateUserOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active} active, {stats.inactive} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.admins}</div>
            <p className="text-xs text-muted-foreground">Super admins & moderators</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regular Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.regularUsers}</div>
            <p className="text-xs text-muted-foreground">Standard user accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Moderators</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.moderators}</div>
            <p className="text-xs text-muted-foreground">Content moderators</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Users List */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">Users List</TabsTrigger>
          <TabsTrigger value="roles">Role Management</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          {isLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">Loading users...</p>
              </CardContent>
            </Card>
          ) : (
            <UsersList
              onEditUser={handleEditUser}
              onAssignRole={handleAssignRole}
              onRemoveRole={handleRemoveRole}
              onAssignFacility={handleAssignFacility}
              onManagePermissions={handleManagePermissions}
              onAssignModule={handleAssignModule}
              onViewModules={handleViewModules}
              onResendVerification={handleResendVerification}
              onDeactivateUser={handleDeactivateUser}
            />
          )}
        </TabsContent>

        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle>Role Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Role management interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle>Permission Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Permission management interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* All Dialogs */}
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

      <UserPermissionsDialog
        open={userPermissionsOpen}
        onOpenChange={setUserPermissionsOpen}
        userId={selectedUserId}
        userName={selectedUserName}
      />

      <AssignModuleDialog
        open={assignModuleOpen}
        onOpenChange={setAssignModuleOpen}
        userId={selectedUserId}
        userName={selectedUserName}
      />

      <ViewUserModulesDialog
        open={viewUserModulesOpen}
        onOpenChange={setViewUserModulesOpen}
        userId={selectedUserId}
        userName={selectedUserName}
      />

      <ResendVerificationDialog
        open={resendVerificationOpen}
        onOpenChange={setResendVerificationOpen}
        userEmail={selectedUserEmail}
        userName={selectedUserName}
      />

      <DeactivateUserDialog
        open={deactivateUserOpen}
        onOpenChange={setDeactivateUserOpen}
        userId={selectedUserId}
        userName={selectedUserName}
        userEmail={selectedUserEmail}
      />

      <BulkUserActionsDialog
        open={bulkActionsOpen}
        onOpenChange={setBulkActionsOpen}
      />
    </div>
  );
};
