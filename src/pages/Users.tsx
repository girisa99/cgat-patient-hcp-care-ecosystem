
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UsersList from '@/components/users/UsersList';
import CreateUserDialog from '@/components/users/CreateUserDialog';
import AssignRoleDialog from '@/components/users/AssignRoleDialog';
import AssignFacilityDialog from '@/components/users/AssignFacilityDialog';
import { useUsers } from '@/hooks/useUsers';

const Users = () => {
  const { users } = useUsers();
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [assignRoleOpen, setAssignRoleOpen] = useState(false);
  const [assignFacilityOpen, setAssignFacilityOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const selectedUser = users?.find(u => u.id === selectedUserId);
  const selectedUserName = selectedUser 
    ? `${selectedUser.first_name} ${selectedUser.last_name}`
    : '';

  const handleAssignRole = (userId: string) => {
    setSelectedUserId(userId);
    setAssignRoleOpen(true);
  };

  const handleAssignFacility = (userId: string) => {
    setSelectedUserId(userId);
    setAssignFacilityOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Users Management</h2>
        <p className="text-muted-foreground">
          Manage user accounts, roles, and facility assignments
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>System Users</CardTitle>
        </CardHeader>
        <CardContent>
          <UsersList
            onCreateUser={() => setCreateUserOpen(true)}
            onAssignRole={handleAssignRole}
            onAssignFacility={handleAssignFacility}
          />
        </CardContent>
      </Card>

      <CreateUserDialog
        open={createUserOpen}
        onOpenChange={setCreateUserOpen}
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
