
import React from 'react';
import { Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UserManagementHeaderProps {
  meta: {
    dataSource: string;
    totalUsers: number;
    patientCount: number;
    staffCount: number;
    adminCount: number;
    lastFetch: string;
  };
}

export const UserManagementHeader: React.FC<UserManagementHeaderProps> = ({ meta }) => {
  return (
    <>
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Users Management</h2>
        <p className="text-muted-foreground">
          Manage user accounts, roles, permissions, and facility assignments
        </p>
      </div>

      <Card className="border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <Shield className="h-5 w-5" />
            ✅ Using Unified Data Source
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-green-800">
            <p><strong>Data Source:</strong> {meta.dataSource}</p>
            <p><strong>Total Users:</strong> {meta.totalUsers}</p>
            <p><strong>Patients:</strong> {meta.patientCount}</p>
            <p><strong>Staff:</strong> {meta.staffCount}</p>
            <p><strong>Admins:</strong> {meta.adminCount}</p>
            <p><strong>Last Updated:</strong> {new Date(meta.lastFetch).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
