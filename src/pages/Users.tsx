import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { useAdminRealtime } from '@/hooks/useAdminRealtime';

// Import the new compact component
import CompactUserManagement from '@/components/users/CompactUserManagement';

// Import consolidated components
import {
  CreateUserDialog,
  EditUserDialog,
  AssignRoleDialog,
  RemoveRoleDialog,
  AssignFacilityDialog,
  PermissionManagementDialog
} from '@/components/users';

// Import the enhanced dialog instead
import EnhancedResendVerificationDialog from '@/components/users/EnhancedResendVerificationDialog';
import DeactivateUserDialog from '@/components/users/DeactivateUserDialog';
import AssignModuleDialog from '@/components/users/AssignModuleDialog';
import UserModuleAccessDialog from '@/components/users/UserModuleAccessDialog';

const Users = () => {
  const { toast } = useToast();
  
  // Enable real-time updates for user management area
  useAdminRealtime({
    enableNotifications: true,
    areas: ['userManagement', 'rbac', 'facility']
  });

  const { 
    users, 
    isLoading, 
    error,
    refetch,
    createUser, 
    assignRole, 
    assignFacility
  } = useUsers();

  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [assignRoleOpen, setAssignRoleOpen] = useState(false);
  const [removeRoleOpen, setRemoveRoleOpen] = useState(false);
  const [assignFacilityOpen, setAssignFacilityOpen] = useState(false);
  const [permissionManagementOpen, setPermissionManagementOpen] = useState(false);
  const [resendVerificationOpen, setResendVerificationOpen] = useState(false);
  const [deactivateUserOpen, setDeactivateUserOpen] = useState(false);
  const [assignModuleOpen, setAssignModuleOpen] = useState(false);
  const [viewModulesOpen, setViewModulesOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');
  const [selectedUserEmail, setSelectedUserEmail] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleCreateUser = () => {
    setCreateUserOpen(true);
  };

  const handleEditUser = (user: any) => {
    console.log('📝 Users.tsx - handleEditUser called with:', user);
    console.log('🔍 User object keys:', Object.keys(user));
    console.log('📧 User email:', user.email);
    console.log('👤 User name:', user.first_name, user.last_name);
    
    setSelectedUser(user);
    setEditUserOpen(true);
    
    console.log('✅ EditUserDialog state updated - selectedUser set, dialog should open');
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

  const handleManagePermissions = (userId: string, userName: string) => {
    console.log('🔒 Opening permission management for user:', userId, userName);
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setPermissionManagementOpen(true);
  };

  const handleAssignModule = (userId: string, userName: string) => {
    console.log('📦 Opening module assignment for user:', userId, userName);
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setAssignModuleOpen(true);
  };

  const handleViewModules = (userId: string, userName: string) => {
    console.log('👁️ Opening module access view for user:', userId, userName);
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setViewModulesOpen(true);
  };

  const handleResendVerification = (userEmail: string, userName: string) => {
    console.log('📧 Opening resend verification dialog for:', userName, userEmail);
    setSelectedUserEmail(userEmail);
    setSelectedUserName(userName);
    setResendVerificationOpen(true);
  };

  const handleDeactivateUser = (userId: string, userName: string, userEmail: string) => {
    console.log('🚫 Opening deactivate user dialog for:', userId, userName, userEmail);
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setSelectedUserEmail(userEmail);
    setDeactivateUserOpen(true);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: "Data Refreshed",
        description: "User data has been refreshed successfully.",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh user data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const headerActions = (
    <Button 
      variant="outline" 
      onClick={handleRefresh}
      disabled={isRefreshing}
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
      Refresh
    </Button>
  );

  // Calculate stats from users array
  const stats = {
    totalUsers: users?.length || 0,
    usersWithRoles: users?.filter(u => u.user_roles && u.user_roles.length > 0).length || 0,
    activeUsers: users?.length || 0,
    usersWithFacilities: users?.filter(u => u.facilities).length || 0
  };

  // Show loading state
  if (isLoading) {
    return (
      <MainLayout>
        <PageContainer
          title="Users Management"
          subtitle="Loading user data..."
        >
          <div className="flex justify-center items-center min-h-[400px]">
            <LoadingSpinner size="lg" />
          </div>
        </PageContainer>
      </MainLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <MainLayout>
        <PageContainer
          title="Users Management"
          subtitle="Error loading user data"
        >
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <p className="text-red-600">Failed to load users: {error.message}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </PageContainer>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageContainer
        title="Users Management"
        subtitle="Manage system users with streamlined interface and bulk operations"
        headerActions={headerActions}
      >
        <CompactUserManagement
          stats={stats}
          onCreateUser={handleCreateUser}
          onAssignRole={handleAssignRole}
          onRemoveRole={handleRemoveRole}
          onAssignFacility={handleAssignFacility}
          onEditUser={handleEditUser}
          onManagePermissions={handleManagePermissions}
          onAssignModule={handleAssignModule}
          onResendVerification={handleResendVerification}
          onDeactivateUser={handleDeactivateUser}
          onViewModules={handleViewModules}
        />

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

        <PermissionManagementDialog
          open={permissionManagementOpen}
          onOpenChange={setPermissionManagementOpen}
          userId={selectedUserId}
          userName={selectedUserName}
        />

        <AssignModuleDialog
          open={assignModuleOpen}
          onOpenChange={setAssignModuleOpen}
          userId={selectedUserId || ''}
          userName={selectedUserName}
        />

        <EnhancedResendVerificationDialog
          open={resendVerificationOpen}
          onOpenChange={setResendVerificationOpen}
          userEmail={selectedUserEmail}
          userName={selectedUserName}
        />

        <DeactivateUserDialog
          open={deactivateUserOpen}
          onOpenChange={setDeactivateUserOpen}
          userId={selectedUserId || ''}
          userName={selectedUserName}
          userEmail={selectedUserEmail}
        />

        <UserModuleAccessDialog
          open={viewModulesOpen}
          onOpenChange={setViewModulesOpen}
          userId={selectedUserId || ''}
          userName={selectedUserName}
        />
      </PageContainer>
    </MainLayout>
  );
};

export default Users;
