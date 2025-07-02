import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  Filter,
  Download,
  Users,
  Shield
} from 'lucide-react';
import { useUnifiedUserManagement } from '@/hooks/useUnifiedUserManagement';
import { useUserManagementDialogs } from '@/hooks/useUserManagementDialogs';
import { useUserDeactivation } from '@/hooks/mutations/useUserDeactivation';

// Import refactored components
import { UserManagementStats } from '@/components/users/UserManagementStats';
import { UserManagementTabs } from '@/components/users/UserManagementTabs';
import { UserManagementDialogs } from './UserManagementDialogs';
import ResendVerificationDialog from '@/components/users/ResendVerificationDialog';
import ViewUserModulesDialog from '@/components/users/ViewUserModulesDialog';
import DeactivateUserDialog from '@/components/users/DeactivateUserDialog';
import PermissionManagementDialog from '@/components/users/PermissionManagementDialog';
import AssignModuleDialog from '@/components/users/AssignModuleDialog';
import CreateRoleDialog from '@/components/users/CreateRoleDialog';

export const ConsolidatedUserManagement: React.FC = () => {
  const { 
    users, 
    isLoading, 
    getUserStats, 
    searchUsers,
    meta
  } = useUnifiedUserManagement();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  
  // Additional dialog states
  const [resendVerificationOpen, setResendVerificationOpen] = useState(false);
  const [viewModulesOpen, setViewModulesOpen] = useState(false);
  const [deactivateUserOpen, setDeactivateUserOpen] = useState(false);
  const [permissionManagementOpen, setPermissionManagementOpen] = useState(false);
  const [assignModuleOpen, setAssignModuleOpen] = useState(false);
  const [createRoleOpen, setCreateRoleOpen] = useState(false);
  const [selectedUserEmail, setSelectedUserEmail] = useState('');

  // Use existing dialog management hook
  const {
    createUserOpen,
    setCreateUserOpen,
    editUserOpen,
    setEditUserOpen,
    assignRoleOpen,
    setAssignRoleOpen,
    removeRoleOpen,
    setRemoveRoleOpen,
    assignFacilityOpen,
    setAssignFacilityOpen,
    selectedUserId,
    selectedUser,
    setSelectedUserId,
    handleAssignRole,
    handleRemoveRole,
    handleAssignFacility,
    handleEditUser,
    resetSelection
  } = useUserManagementDialogs();

  const { deactivateUser } = useUserDeactivation();

  const stats = getUserStats();
  const filteredUsers = searchUsers(searchQuery);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading users from unified data source...</p>
        </CardContent>
      </Card>
    );
  }

  const handleCreateUser = () => {
    setCreateUserOpen(true);
  };

  const handleCreateRole = () => {
    setCreateRoleOpen(true);
  };

  const handleManagePermissions = (userId: string, userName: string) => {
    console.log('🔒 Managing permissions for user:', userId, userName);
    setSelectedUserId(userId);
    setPermissionManagementOpen(true);
  };

  const handleAssignModule = (userId: string, userName: string) => {
    console.log('📦 Assigning module for user:', userId, userName);
    setSelectedUserId(userId);
    setAssignModuleOpen(true);
  };

  const handleResendVerification = (userEmail: string, userName: string) => {
    console.log('📧 Resending verification for user:', userEmail, userName);
    setSelectedUserEmail(userEmail);
    setResendVerificationOpen(true);
  };

  const handleDeactivateUser = (userId: string, userName: string, userEmail: string) => {
    console.log('🚫 Deactivating user:', userId, userName, userEmail);
    setSelectedUserId(userId);
    setSelectedUserEmail(userEmail);
    setDeactivateUserOpen(true);
  };

  const handleViewModules = (userId: string, userName: string) => {
    console.log('👁️ Viewing modules for user:', userId, userName);
    setSelectedUserId(userId);
    setViewModulesOpen(true);
  };

  const selectedUserName = selectedUser 
    ? `${selectedUser.first_name || ''} ${selectedUser.last_name || ''}`.trim() || selectedUser.email
    : '';

  return (
    <div className="space-y-6">
      {/* Simplified Data Source Information - Removed duplicate status */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-900 text-lg">
            <Users className="h-5 w-5" />
            Unified User Management System
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Data Source:</strong> {meta.dataSource}</p>
            <div className="flex gap-4">
              <span><strong>Total:</strong> {meta.totalUsers}</span>
              <span><strong>Patients:</strong> {meta.patientCount}</span>
              <span><strong>Staff:</strong> {meta.staffCount}</span>
              <span><strong>Admins:</strong> {meta.adminCount}</span>
            </div>
            <p className="text-xs"><strong>Version:</strong> {meta.version} | <strong>Last Updated:</strong> {new Date(meta.lastFetched).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <UserManagementStats stats={stats} />

      {/* Main Content */}
      <Card>
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl mb-2">User Management</CardTitle>
              <p className="text-gray-600">Unified system for managing users, roles, and permissions</p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleCreateRole} variant="outline">
                <Shield className="h-4 w-4 mr-2" />
                Create Role
              </Button>
              <Button onClick={handleCreateUser}>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Search and Filters */}
          <div className="flex items-center gap-4 mb-6">
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

          <UserManagementTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            filteredUsersCount={filteredUsers.length}
            onEditUser={handleEditUser}
            onAssignRole={handleAssignRole}
            onRemoveRole={handleRemoveRole}
            onAssignFacility={handleAssignFacility}
            onManagePermissions={handleManagePermissions}
            onAssignModule={handleAssignModule}
            onResendVerification={handleResendVerification}
            onDeactivateUser={handleDeactivateUser}
            onViewModules={handleViewModules}
          />
        </CardContent>
      </Card>

      {/* All Dialog Components */}
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

      <CreateRoleDialog
        open={createRoleOpen}
        onOpenChange={setCreateRoleOpen}
      />

      <ResendVerificationDialog
        open={resendVerificationOpen}
        onOpenChange={setResendVerificationOpen}
        userEmail={selectedUserEmail}
        userName={selectedUserName}
      />

      <ViewUserModulesDialog
        open={viewModulesOpen}
        onOpenChange={setViewModulesOpen}
        userId={selectedUserId}
        userName={selectedUserName}
      />

      <DeactivateUserDialog
        open={deactivateUserOpen}
        onOpenChange={setDeactivateUserOpen}
        userId={selectedUserId}
        userName={selectedUserName}
        userEmail={selectedUserEmail}
      />

      <PermissionManagementDialog
        open={permissionManagementOpen}
        onOpenChange={setPermissionManagementOpen}
        userId={selectedUserId}
        userName={selectedUserName}
      />

      <AssignModuleDialog
        open={assignModuleOpen}
        onOpenChange={setAssignModuleOpen}
        userId={selectedUserId}
        userName={selectedUserName}
      />
    </div>
  );
};
