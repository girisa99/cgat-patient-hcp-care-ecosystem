
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Filter,
  Download,
  Users,
  MoreHorizontal
} from 'lucide-react';
import { useConsolidatedUsers } from '@/hooks/useConsolidatedUsers';
import { useUserManagementDialogs } from '@/hooks/useUserManagementDialogs';

// Import existing components instead of creating new ones
import UsersList from '@/components/users/UsersList';
import BulkRoleAssignment from '@/components/users/BulkRoleAssignment';
import { UserManagementDialogs } from './UserManagementDialogs';

export const ConsolidatedUserManagement: React.FC = () => {
  const { 
    users, 
    isLoading, 
    getUserStats, 
    searchUsers,
    meta
  } = useConsolidatedUsers();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('users');

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
    handleAssignRole,
    handleRemoveRole,
    handleAssignFacility,
    handleEditUser,
    resetSelection
  } = useUserManagementDialogs();

  const stats = getUserStats();
  const filteredUsers = searchUsers(searchQuery);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading users from consolidated data source...</p>
      </div>
    );
  }

  const handleCreateUser = () => {
    setCreateUserOpen(true);
  };

  // Get selected user name for dialog titles
  const selectedUserName = selectedUser 
    ? `${selectedUser.first_name || ''} ${selectedUser.last_name || ''}`.trim() || selectedUser.email
    : '';

  return (
    <div className="space-y-6">
      {/* Data Source Information */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-900 text-lg">
            <Users className="h-5 w-5" />
            Consolidated User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Data Source:</strong> {meta.dataSource}</p>
            <div className="flex gap-4">
              <span><strong>Total:</strong> {meta.totalUsers}</span>
              <span><strong>Patients:</strong> {meta.patientCount}</span>
              <span><strong>Staff:</strong> {meta.staffCount}</span>
              <span><strong>Admins:</strong> {meta.adminCount}</span>
            </div>
            <p className="text-xs"><strong>Last Updated:</strong> {new Date(meta.lastFetched).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      {/* Compact Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
          <Users className="h-5 w-5 text-blue-600" />
          <div>
            <div className="text-xl font-semibold text-blue-900">{stats.total}</div>
            <div className="text-sm text-blue-700">Total Users</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
          <div className="h-5 w-5 bg-green-600 rounded" />
          <div>
            <div className="text-xl font-semibold text-green-900">{stats.withRoles}</div>
            <div className="text-sm text-green-700">With Roles</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
          <div className="h-5 w-5 bg-purple-600 rounded" />
          <div>
            <div className="text-xl font-semibold text-purple-900">{stats.active}</div>
            <div className="text-sm text-purple-700">Active</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg">
          <div className="h-5 w-5 bg-orange-600 rounded" />
          <div>
            <div className="text-xl font-semibold text-orange-900">{stats.withFacilities}</div>
            <div className="text-sm text-orange-700">With Facilities</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">User Management</CardTitle>
              <p className="text-gray-600 mt-1">Manage users, roles, and permissions across the platform</p>
            </div>
            <Button onClick={handleCreateUser}>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
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

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Users List ({filteredUsers.length})
              </TabsTrigger>
              <TabsTrigger value="bulk" className="flex items-center gap-2">
                <MoreHorizontal className="h-4 w-4" />
                Bulk Actions
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="users" className="mt-6">
              {/* Use existing UsersList component with all the existing functionality */}
              <UsersList
                onEditUser={handleEditUser}
                onAssignRole={handleAssignRole}
                onRemoveRole={handleRemoveRole}
                onAssignFacility={handleAssignFacility}
                onManagePermissions={(userId, userName) => {
                  console.log('Manage permissions for:', userId, userName);
                  // TODO: Implement when needed
                }}
                onAssignModule={(userId, userName) => {
                  console.log('Assign module for:', userId, userName);
                  // TODO: Implement when needed
                }}
                onResendVerification={(userEmail, userName) => {
                  console.log('Resend verification for:', userEmail, userName);
                  // TODO: Implement when needed 
                }}
                onDeactivateUser={(userId, userName, userEmail) => {
                  console.log('Deactivate user:', userId, userName, userEmail);
                  // TODO: Implement when needed
                }}
                onViewModules={(userId, userName) => {
                  console.log('View modules for:', userId, userName);
                  // TODO: Implement when needed
                }}
              />
            </TabsContent>
            
            <TabsContent value="bulk" className="mt-6">
              {/* Use existing BulkRoleAssignment component */}
              <BulkRoleAssignment />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Use existing UserManagementDialogs component */}
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
