
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
import { useConsistentUsers } from '@/hooks/useConsistentUsers';
import { AlertTriangle, Bug, Shield, Key } from 'lucide-react';

const ConsistentUsers = () => {
  const { users, isLoading, meta } = useConsistentUsers();
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
        <h2 className="text-3xl font-bold tracking-tight">Users Management (Unified)</h2>
        <p className="text-muted-foreground">
          Manage user accounts, roles, permissions using unified data source
        </p>
      </div>

      {/* Data Source Information */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Shield className="h-5 w-5" />
            Unified Data Source
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-blue-800">
            <p><strong>Data Source:</strong> {meta.dataSource}</p>
            <p><strong>Total Users:</strong> {meta.totalUsers}</p>
            <p><strong>Patients:</strong> {meta.patientCount}</p>
            <p><strong>Staff:</strong> {meta.staffCount}</p>
            <p><strong>Admins:</strong> {meta.adminCount}</p>
            <p><strong>Last Updated:</strong> {new Date(meta.lastFetch).toLocaleString()}</p>
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

      {/* Debug Panel */}
      {debugMode && selectedUserId && (
        <RoleAssignmentDebugger
          userId={selectedUserId}
          userName={selectedUserName}
        />
      )}

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
  );
};

export default ConsistentUsers;
