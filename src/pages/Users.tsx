
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { AdminStatsGrid, StatCard } from '@/components/layout/AdminStatsGrid';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Users as UsersIcon, Shield, Activity, Settings, Search, Filter, Download, Upload } from 'lucide-react';
import UsersList from '@/components/users/UsersList';
import CreateUserDialog from '@/components/users/CreateUserDialog';
import AssignRoleDialog from '@/components/users/AssignRoleDialog';
import { useUsers } from '@/hooks/useUsers';

const Users = () => {
  const { users, isLoading, getUserStats } = useUsers();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAssignRoleDialog, setShowAssignRoleDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const stats = getUserStats();

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssignRole = (userId: string) => {
    setSelectedUserId(userId);
    const user = users.find(u => u.id === userId);
    setSelectedUserName(`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email || '');
    setShowAssignRoleDialog(true);
  };

  const handleEditUser = (user: any) => {
    console.log('Edit user:', user);
    // Handle edit user functionality
  };

  const handleRemoveRole = (userId: string) => {
    console.log('Remove role for user:', userId);
    // Handle remove role functionality
  };

  const handleAssignFacility = (userId: string) => {
    console.log('Assign facility to user:', userId);
    // Handle assign facility functionality
  };

  const handleManagePermissions = (userId: string, userName: string) => {
    console.log('Manage permissions for user:', userId, userName);
    // Handle manage permissions functionality
  };

  const handleAssignModule = (userId: string, userName: string) => {
    console.log('Assign module to user:', userId, userName);
    // Handle assign module functionality
  };

  const handleViewModules = (userId: string, userName: string) => {
    console.log('View modules for user:', userId, userName);
    // Handle view modules functionality
  };

  const handleResendVerification = (userEmail: string, userName: string) => {
    console.log('Resend verification for user:', userEmail, userName);
    // Handle resend verification functionality
  };

  const handleDeactivateUser = (userId: string, userName: string, userEmail: string) => {
    console.log('Deactivate user:', userId, userName, userEmail);
    // Handle deactivate user functionality
  };

  const headerActions = (
    <div className="flex items-center gap-2">
      <Button variant="outline">
        <Upload className="h-4 w-4 mr-2" />
        Bulk Actions
      </Button>
      <Button onClick={() => setShowCreateDialog(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Add User
      </Button>
    </div>
  );

  return (
    <MainLayout>
      <PageContainer
        title="User Management"
        subtitle="Manage users, roles, permissions, and access"
        headerActions={headerActions}
      >
        <div className="space-y-6">
          {/* Stats Grid */}
          <AdminStatsGrid columns={4}>
            <StatCard
              title="Total Users"
              value={stats.total}
              icon={UsersIcon}
              description={`${stats.active} active, ${stats.inactive} inactive`}
            />
            <StatCard
              title="Administrators"
              value={stats.admins}
              icon={Shield}
              description="Super admins & moderators"
            />
            <StatCard
              title="Regular Users"
              value={stats.regularUsers}
              icon={Activity}
              description="Standard user accounts"
            />
            <StatCard
              title="Moderators"
              value={stats.moderators}
              icon={Settings}
              description="Content moderators"
            />
          </AdminStatsGrid>

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
          <Card className="shadow-sm">
            <CardContent className="p-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading users...</p>
                </div>
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
            </CardContent>
          </Card>
        </div>

        {/* Dialogs */}
        <CreateUserDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        />

        <AssignRoleDialog
          open={showAssignRoleDialog}
          onOpenChange={setShowAssignRoleDialog}
          userId={selectedUserId}
          userName={selectedUserName}
        />
      </PageContainer>
    </MainLayout>
  );
};

export default Users;
