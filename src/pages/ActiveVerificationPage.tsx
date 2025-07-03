import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/components/layout/AppLayout';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { useAutomatedVerification } from '@/hooks/useAutomatedVerification';
import { Badge } from '@/components/ui/badge';

const ActiveVerificationPage: React.FC = () => {
  console.log('✅ Active Verification page rendering');
  const { currentRole, hasAccess } = useRoleBasedNavigation();
  const { isRunning } = useAutomatedVerification();
  
  // Mock data for display
  const verificationSessions = [];
  const isVerifying = isRunning;
  const verificationHistory = [];

  if (!hasAccess('/active-verification')) {
    return (
      <AppLayout title="Access Denied">
        <Card>
          <CardContent className="p-8 text-center">
            <p>You don't have permission to access Active Verification.</p>
            <p className="text-sm text-muted-foreground mt-2">Current role: {currentRole}</p>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Active Verification">
      <div className="space-y-6">
        {/* Verification Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{verificationSessions.length}</div>
              <div className="text-sm text-muted-foreground">Active Sessions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {verificationHistory.filter((vh: any) => vh.status === 'completed').length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {verificationHistory.filter((vh: any) => vh.status === 'pending').length}
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {verificationHistory.filter((vh: any) => vh.status === 'failed').length}
              </div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </CardContent>
          </Card>
        </div>

        {/* Active Verification Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              System Verification & Validation
              <Badge variant={isVerifying ? 'secondary' : 'outline'}>
                {isVerifying ? 'Verifying...' : 'Ready'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>Real-time system verification, automated testing, and validation processes.</p>
              
              {/* Verification Types */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded">
                  <h3 className="font-semibold">Database Verification</h3>
                  <p className="text-sm text-muted-foreground">Validate database integrity and constraints</p>
                </div>
                <div className="p-4 border rounded">
                  <h3 className="font-semibold">API Verification</h3>
                  <p className="text-sm text-muted-foreground">Verify API endpoints and responses</p>
                </div>
                <div className="p-4 border rounded">
                  <h3 className="font-semibold">Security Verification</h3>
                  <p className="text-sm text-muted-foreground">Validate security policies and access controls</p>
                </div>
                <div className="p-4 border rounded">
                  <h3 className="font-semibold">Performance Verification</h3>
                  <p className="text-sm text-muted-foreground">Monitor system performance and optimization</p>
                </div>
              </div>

              {/* Active Verification Sessions */}
              {verificationSessions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Active Verification Sessions</h4>
                  {verificationSessions.map((session: any) => (
                    <div key={session.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{session.type} Verification</div>
                        <div className="text-sm text-muted-foreground">
                          Started: {new Date(session.startTime).toLocaleTimeString()}
                        </div>
                      </div>
                      <Badge variant="secondary">Running</Badge>
                    </div>
                  ))}
                </div>
              )}

              {/* Recent Verification History */}
              {verificationHistory.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Recent Verification History</h4>
                  {verificationHistory.slice(0, 5).map((verification: any) => (
                    <div key={verification.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{verification.type} Verification</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(verification.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <Badge 
                        variant={
                          verification.status === 'completed' ? 'default' : 
                          verification.status === 'pending' ? 'secondary' : 
                          'destructive'
                        }
                      >
                        {verification.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ActiveVerificationPage;