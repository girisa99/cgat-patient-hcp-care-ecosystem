import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/components/layout/AppLayout';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { useOnboarding } from '@/hooks/useOnboarding';
import { Badge } from '@/components/ui/badge';

const Onboarding: React.FC = () => {
  console.log('🚀 Onboarding page rendering');
  const { currentRole, hasAccess } = useRoleBasedNavigation();
  const { onboardingWorkflows } = useOnboarding();
  
  // Mock data for display
  const onboardingProgress = onboardingWorkflows.filter((w: any) => w.status === 'in_progress');
  const pendingReviews = onboardingWorkflows.filter((w: any) => w.status === 'pending');
  const completedOnboarding = onboardingWorkflows.filter((w: any) => w.status === 'completed');

  if (!hasAccess('/onboarding')) {
    return (
      <AppLayout title="Access Denied">
        <Card>
          <CardContent className="p-8 text-center">
            <p>You don't have permission to access Onboarding Management.</p>
            <p className="text-sm text-muted-foreground mt-2">Current role: {currentRole}</p>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Onboarding Management">
      <div className="space-y-6">
        {/* Onboarding Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{onboardingProgress.length}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{pendingReviews.length}</div>
              <div className="text-sm text-muted-foreground">Pending Review</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{completedOnboarding.length}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((completedOnboarding.length / (onboardingProgress.length + completedOnboarding.length + pendingReviews.length)) * 100) || 0}%
              </div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Onboarding Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Treatment Center Onboarding
              <Badge variant="outline">
                {onboardingProgress.length + pendingReviews.length} active
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>Manage treatment center onboarding processes, applications, and workflow approvals.</p>
              
              {/* Onboarding Workflow Stages */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded">
                  <h3 className="font-semibold">Application Review</h3>
                  <p className="text-sm text-muted-foreground">Review new treatment center applications</p>
                  <Badge variant="outline" className="mt-2">
                    {pendingReviews.filter((pr: any) => pr.stage === 'application').length} pending
                  </Badge>
                </div>
                <div className="p-4 border rounded">
                  <h3 className="font-semibold">Documentation Verification</h3>
                  <p className="text-sm text-muted-foreground">Verify licenses and certifications</p>
                  <Badge variant="outline" className="mt-2">
                    {pendingReviews.filter((pr: any) => pr.stage === 'documentation').length} pending
                  </Badge>
                </div>
                <div className="p-4 border rounded">
                  <h3 className="font-semibold">System Setup</h3>
                  <p className="text-sm text-muted-foreground">Configure system access and modules</p>
                  <Badge variant="outline" className="mt-2">
                    {onboardingProgress.filter((op: any) => op.stage === 'setup').length} in progress
                  </Badge>
                </div>
                <div className="p-4 border rounded">
                  <h3 className="font-semibold">Training & Activation</h3>
                  <p className="text-sm text-muted-foreground">User training and system activation</p>
                  <Badge variant="outline" className="mt-2">
                    {onboardingProgress.filter((op: any) => op.stage === 'training').length} in progress
                  </Badge>
                </div>
              </div>

              {/* Recent Onboarding Activity */}
              {(onboardingProgress.length > 0 || pendingReviews.length > 0) && (
                <div className="space-y-2">
                  <h4 className="font-medium">Recent Onboarding Activity</h4>
                  {[...onboardingProgress.slice(0, 3), ...pendingReviews.slice(0, 2)].map((item: any, index: number) => (
                    <div key={`${item.id}-${index}`} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{item.facilityName || item.name || 'Treatment Center'}</div>
                        <div className="text-sm text-muted-foreground">
                          Stage: {item.stage} • {new Date(item.updated_at || item.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge 
                        variant={
                          item.status === 'completed' ? 'default' : 
                          item.status === 'pending' ? 'secondary' : 
                          item.status === 'in_progress' ? 'outline' :
                          'secondary'
                        }
                      >
                        {item.status || 'pending'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {/* Completed Onboarding Summary */}
              {completedOnboarding.length > 0 && (
                <div className="p-4 bg-green-50 border border-green-200 rounded">
                  <h4 className="font-medium text-green-800">Recently Completed</h4>
                  <p className="text-sm text-green-700">
                    {completedOnboarding.length} treatment centers successfully onboarded this month.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Onboarding;