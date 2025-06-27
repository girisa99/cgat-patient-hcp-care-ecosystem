
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';
import UsersList from '@/components/users/UsersList';
import BulkRoleAssignment from '@/components/users/BulkRoleAssignment';
import { UserManagementDialogs } from '@/components/admin/UserManagement/UserManagementDialogs';
import { useConsistentUsers } from '@/hooks/useConsistentUsers';

const Users = () => {
  const { users, isLoading, meta } = useConsistentUsers();
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [assignRoleOpen, setAssignRoleOpen] = useState(false);
  const [removeRoleOpen, setRemoveRoleOpen] = useState(false);
  const [assignFacilityOpen, setAssignFacilityOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);

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

  // Calculate user statistics with correct data structure
  const userStats = useMemo(() => {
    if (!users) return { total: 0, active: 0, roles: {} };
    
    const stats = {
      total: users.length,
      active: users.length, // Assuming all users from auth.users are active
      roles: {} as Record<string, number>
    };

    users.forEach(user => {
      // Count roles from user_roles array
      if (user.user_roles && user.user_roles.length > 0) {
        user.user_roles.forEach(userRole => {
          const roleName = userRole.roles.name;
          stats.roles[roleName] = (stats.roles[roleName] || 0) + 1;
        });
      } else {
        // Count users without roles
        stats.roles['no_role'] = (stats.roles['no_role'] || 0) + 1;
      }
    });

    return stats;
  }, [users]);

  return (
    <div className="space-y-6">
      {/* Header Section - Left Aligned */}
      <div className="text-left">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">User Management</h2>
        <p className="text-muted-foreground mt-1">
          Manage user accounts, roles, permissions, and facility assignments
        </p>
        <div className="flex gap-2 mt-4">
          <Badge variant="outline">{userStats.total} Total</Badge>
          <Badge variant="default">{userStats.active} Active</Badge>
          {Object.entries(userStats.roles).map(([role, count]) => (
            <Badge key={role} variant="secondary" className="capitalize">
              {count} {role === 'no_role' ? 'No Role' : role}
            </Badge>
          ))}
        </div>
      </div>

      {/* Bulk Operations */}
      <Card>
        <CardContent className="pt-6">
          <BulkRoleAssignment />
        </CardContent>
      </Card>
      
      {/* Users List */}
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

      {/* Dialogs */}
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

export default Users;
