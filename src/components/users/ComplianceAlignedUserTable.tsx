
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useMasterUserManagement } from '@/hooks/useMasterUserManagement';

export const ComplianceAlignedUserTable: React.FC = () => {
  const { users, isLoading } = useMasterUserManagement();
  
  console.log('👥 Compliance Aligned User Table - Real Database Data');

  if (isLoading) {
    return <div className="text-center p-4">Loading users from database...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                {user.firstName} {user.lastName}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {user.user_roles[0]?.role?.name || 'user'}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={user.isActive ? "default" : "secondary"}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(user.created_at).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="p-4 text-sm text-gray-600 border-t">
        <div className="flex items-center justify-between">
          <span>Total Users: {users.length}</span>
          <span>Data Source: Real Database (Supabase)</span>
        </div>
      </div>
    </div>
  );
};
