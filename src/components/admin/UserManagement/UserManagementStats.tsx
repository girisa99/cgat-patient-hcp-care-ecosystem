
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Bug, Shield } from 'lucide-react';

interface UserManagementStatsProps {
  userStats: {
    totalUsers: number;
    usersWithRoles: number;
    usersWithoutRoles: number;
  };
  meta: {
    dataSource: string;
    totalUsers: number;
    patientCount: number;
    staffCount: number;
    adminCount: number;
    lastFetch: string;
  };
  debugMode: boolean;
  onToggleDebug: () => void;
}

export const UserManagementStats: React.FC<UserManagementStatsProps> = ({
  userStats,
  meta,
  debugMode,
  onToggleDebug
}) => {
  return (
    <>
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
              onClick={onToggleDebug}
              variant="outline"
              size="sm"
            >
              <Bug className="mr-2 h-4 w-4" />
              {debugMode ? 'Hide' : 'Show'} Role Debug Info
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
