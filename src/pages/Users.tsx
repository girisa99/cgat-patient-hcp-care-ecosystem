
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';
import { Grid, GridItem } from '@/components/ui/layout/Grid';
import { Section } from '@/components/ui/layout/Section';
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

  const statsBadges = (
    <div className="flex gap-2 flex-wrap">
      <Badge variant="outline">{userStats.total} Total</Badge>
      <Badge variant="default">{userStats.active} Active</Badge>
      {Object.entries(userStats.roles).map(([role, count]) => (
        <Badge key={role} variant="secondary" className="capitalize">
          {count} {role === 'no_role' ? 'No Role' : role}
        </Badge>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <Section variant="card" title="User Statistics" contentClassName="pt-0">
        {statsBadges}
      </Section>

      {/* Grid Layout for Main Content */}
      <Grid cols={12} gap="lg" responsive={{ mobile: 1, tablet: 1, laptop: 12 }}>
        <GridItem span={12}>
          {/* Bulk Operations */}
          <Section variant="card" title="Bulk Operations" subtitle="Perform actions on multiple users simultaneously">
            <BulkRoleAssignment />
          </Section>
        </GridItem>
        
        <GridItem span={12}>
          {/* Users List */}
          <Section variant="card" title="System Users" subtitle="Manage user accounts and permissions">
            <UsersList
              onCreateUser={() => setCreateUserOpen(true)}
              onAssignRole={handleAssignRole}
              onRemoveRole={handleRemoveRole}
              onAssignFacility={handleAssignFacility}
              onEditUser={handleEditUser}
            />
          </Section>
        </GridItem>
      </Grid>

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
