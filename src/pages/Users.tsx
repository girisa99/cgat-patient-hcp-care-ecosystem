
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import UsersList from '@/components/users/UsersList';
import CreateUserDialog from '@/components/users/CreateUserDialog';
import EditUserDialog from '@/components/users/EditUserDialog';
import AssignRoleDialog from '@/components/users/AssignRoleDialog';
import AssignFacilityDialog from '@/components/users/AssignFacilityDialog';
import RoleAssignmentDebugger from '@/components/users/RoleAssignmentDebugger';
import { useUsers } from '@/hooks/useUsers';
import { AlertTriangle, Bug } from 'lucide-react';

const Users = () => {
  const { users } = useUsers();
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [assignRoleOpen, setAssignRoleOpen] = useState(false);
  const [assignFacilityOpen, setAssignFacilityOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [debugMode, setDebugMode] = useState(false);

  const selectedUserForRole = users?.find(u => u.id === selectedUserId);
  const selectedUserName = selectedUserForRole 
    ? `${selectedUserForRole.first_name || ''} ${selectedUserForRole.last_name || ''}`.trim() || selectedUserForRole.email
    : '';

  const handleAssignRole = (userId: string) => {
    setSelectedUserId(userId);
    setAssignRoleOpen(true);
  };

  const handleAssignFacility = (userId: string) => {
    setSelectedUserId(userId);
    setAssignFacilityOpen(true);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setEditUserOpen(true);
  };

  // Calculate role assignment statistics
  const totalUsers = users?.length || 0;
  const usersWithRoles = users?.filter(user => user.user_roles && user.user_roles.length > 0).length || 0;
  const usersWithoutRoles = totalUsers - usersWithRoles;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Users Management</h2>
        <p className="text-muted-foreground">
          Manage user accounts, roles, and facility assignments
        </p>
      </div>

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
              Total Users: {totalUsers}
            </Badge>
            <Badge variant="default">
              With Roles: {usersWithRoles}
            </Badge>
            <Badge variant="destructive">
              Without Roles: {usersWithoutRoles}
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

          {debugMode && usersWithoutRoles > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800 mb-2">
                <strong>Diagnostic Information:</strong>
              </p>
              <p className="text-sm text-yellow-700">
                {usersWithoutRoles} users don't have roles assigned. This could be due to:
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
      
      <Card>
        <CardHeader>
          <CardTitle>System Users</CardTitle>
        </CardHeader>
        <CardContent>
          <UsersList
            onCreateUser={() => setCreateUserOpen(true)}
            onAssignRole={handleAssignRole}
            onAssignFacility={handleAssignFacility}
            onEditUser={handleEditUser}
          />
        </CardContent>
      </Card>

      {/* Debug Panel */}
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
