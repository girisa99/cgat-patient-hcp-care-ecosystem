
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/components/layout/AppLayout';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { useMasterSecurity } from '@/hooks/useMasterSecurity';
import { Badge } from '@/components/ui/badge';

const SimpleSecurity: React.FC = () => {
  console.log('🔒 Simple Security page rendering');
  const { currentRole, isSuperAdmin, hasAccess } = useRoleBasedNavigation();
  const { securityEvents, securityStats, isLoading } = useMasterSecurity();

  return (
    <AppLayout title="Security Dashboard">
      <div className="space-y-6">
        {/* Security Access Verification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Security Access Control
              <Badge variant={isSuperAdmin ? 'default' : 'destructive'}>
                {hasAccess('/security') ? 'Authorized' : 'Restricted'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>Current role: <strong>{currentRole}</strong></p>
              <p>Security access: <strong>{hasAccess('/security') ? 'Granted' : 'Denied'}</strong></p>
              
              {isSuperAdmin ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded">
                  <p className="text-green-800">
                    ✅ Full security access granted. You can manage all security features.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-red-50 border border-red-200 rounded">
                  <p className="text-red-800">
                    ❌ Limited access. Security management requires Super Admin role.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Security Features */}
        {hasAccess('/security') && (
          <Card>
            <CardHeader>
              <CardTitle>Security Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Security monitoring and management functionality available here.</p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded">
                  <h3 className="font-semibold">User Access Control</h3>
                  <p className="text-sm text-muted-foreground">Manage user permissions and roles</p>
                </div>
                <div className="p-4 border rounded">
                  <h3 className="font-semibold">Security Monitoring</h3>
                  <p className="text-sm text-muted-foreground">Monitor security events and alerts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default SimpleSecurity;
