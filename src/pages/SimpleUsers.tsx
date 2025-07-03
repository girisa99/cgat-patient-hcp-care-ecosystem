import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/components/layout/AppLayout';
import { useUnifiedUserManagement } from '@/hooks/useUnifiedUserManagement';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { Badge } from '@/components/ui/badge';

const SimpleUsers: React.FC = () => {
  console.log('👥 Simple Users page rendering');
  const { users, isLoading, error, meta } = useUnifiedUserManagement();
  const { hasAccess, currentRole } = useRoleBasedNavigation();

  if (!hasAccess('/users')) {
    return (
      <AppLayout title="Access Denied">
        <Card>
          <CardContent className="p-8 text-center">
            <p>You don't have permission to access User Management.</p>
            <p className="text-sm text-muted-foreground mt-2">Current role: {currentRole}</p>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="User Management">
      <div className="space-y-6">
        {/* User Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{meta.totalUsers}</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{meta.adminCount}</div>
              <div className="text-sm text-muted-foreground">Admins</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{meta.staffCount}</div>
              <div className="text-sm text-muted-foreground">Staff</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{meta.patientCount}</div>
              <div className="text-sm text-muted-foreground">Patients</div>
            </CardContent>
          </Card>
        </div>

        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              User Management
              <Badge variant="outline">{users.length} users</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading users...</p>
            ) : error ? (
              <p className="text-red-600">Error: {String(error)}</p>
            ) : (
              <div className="space-y-4">
                <p>Managing {users.length} users across the platform.</p>
                
                {/* User List Preview */}
                <div className="space-y-2">
                  {users.slice(0, 5).map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{user.first_name} {user.last_name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                      <Badge variant={user.is_active ? 'default' : 'secondary'}>
                        {user.role || 'No Role'}
                      </Badge>
                    </div>
                  ))}
                  {users.length > 5 && (
                    <p className="text-sm text-muted-foreground">
                      And {users.length - 5} more users...
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default SimpleUsers;