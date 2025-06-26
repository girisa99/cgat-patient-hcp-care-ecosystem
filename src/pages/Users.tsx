
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import UsersList from '@/components/users/UsersList';
import CreateUserDialog from '@/components/users/CreateUserDialog';
import EditUserDialog from '@/components/users/EditUserDialog';
import AssignRoleDialog from '@/components/users/AssignRoleDialog';
import RemoveRoleDialog from '@/components/users/RemoveRoleDialog';
import AssignFacilityDialog from '@/components/users/AssignFacilityDialog';
import RoleAssignmentDebugger from '@/components/users/RoleAssignmentDebugger';
import BulkRoleAssignment from '@/components/users/BulkRoleAssignment';
import DatabaseHealthCheck from '@/components/users/DatabaseHealthCheck';
import { useUsers } from '@/hooks/useUsers';
import { AlertTriangle, Bug, Shield, Key } from 'lucide-react';

const Users = () => {
  const { users, isLoading } = useUsers();
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Users Management</h2>
        <p className="text-muted-foreground">
          Manage user accounts, roles, permissions, and facility assignments
        </p>
      </div>

      {/* Permission System Feature Card */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Key className="h-5 w-5" />
            Enhanced Permission System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-blue-900">New Features Available:</h4>
                <ul className="text-blue-800 space-y-1">
                  <li>• Individual user permission grants</li>
                  <li>• Role-based permission inheritance</li>
                  <li>• Permission expiration dates</li>
                  <li>• Granular access control</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-blue-900">How to Use:</h4>
                <ul className="text-blue-800 space-y-1">
                  <li>• Click the <Key className="h-3 w-3 inline mx-1" /> button next to any user</li>
                  <li style={{ marginLeft: '0.5rem' }}>to manage their permissions</li>
                  <li>• View effective permissions from all sources</li>
                  <li>• Grant or revoke individual permissions</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Health Check */}
      <DatabaseHealthCheck />

      {/* Role Assignment Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Role Assignment Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center mb-4">
            <Badge variant="outline">
              Total Users: {userStats.totalUsers}
            </Badge>
            <Badge variant="default">
              With Roles: {userStats.usersWithRoles}
            </Badge>
            <Badge variant="destructive">
              Without Roles: {userStats.usersWithoutRoles}
            </Badge>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => setDebugMode(!debugMode)}
              variant="outline"
              size="sm"
            >
              <Bug className="mr-2 h-4 w-4" />
              {debugMode ? 'Hide' : 'Show'} Role Debug Info
            </Button>
          </div>

          {debugMode && userStats.usersWithoutRoles > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800 mb-2">
                <strong>Diagnostic Information:</strong>
              </p>
              <p className="text-sm text-yellow-700">
                {userStats.usersWithoutRoles} users don't have roles assigned. This could be due to:
              </p>
              <ul className="text-sm text-yellow-700 ml-4 mt-2 list-disc">
                <li>Users created before role assignment was implemented</li>
                <li>Role assignment failures due to RLS policy issues</li>
                <li>Database synchronization problems</li>
                <li>Edge function errors during user creation</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Management Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Role & Permission Management Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="font-medium text-blue-900 mb-2">How to Manage User Access:</h4>
              <ul className="text-blue-800 space-y-1">
                <li><strong>Assign New Role:</strong> Click "Assign Role" next to any user to add additional roles</li>
                <li><strong>Remove Existing Role:</strong> Click "Remove Role" next to any user to remove current roles</li>
                <li><strong>Manage Permissions:</strong> Click the <Key className="h-3 w-3 inline mx-1" /> button to grant/revoke individual permissions</li>
                <li><strong>Multiple Roles:</strong> Users can have multiple roles assigned simultaneously</li>
                <li><strong>Bulk Assignment:</strong> Use the bulk assignment tool below for users without roles</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Role Assignment */}
      <BulkRoleAssignment />
      
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

      {/* Debug Panel - Only render when in debug mode and user is selected */}
      {debugMode && selectedUserId && (
        <RoleAssignmentDebugger
          userId={selectedUserId}
          userName={selectedUserName}
        />
      )}

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
  );
};

export default Users;
