
import React from 'react';
import BulkRoleAssignment from '@/components/users/BulkRoleAssignment';
import DatabaseHealthCheck from '@/components/users/DatabaseHealthCheck';

export const UserManagementActions: React.FC = () => {
  return (
    <>
      {/* Database Health Check */}
      <DatabaseHealthCheck />

      {/* Bulk Role Assignment */}
      <BulkRoleAssignment />
    </>
  );
};
