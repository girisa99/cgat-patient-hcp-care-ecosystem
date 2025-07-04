
import React from 'react';
import { MasterUserManagementTable } from '@/components/master/MasterUserManagementTable';

const Users: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          Manage users, roles, and permissions across the system
        </p>
      </div>
      <MasterUserManagementTable />
    </div>
  );
};

export default Users;
