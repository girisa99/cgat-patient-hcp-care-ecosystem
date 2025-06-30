
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Onboarding = () => {
  const { user, userRoles, loading } = useAuthContext();
  const { toast } = useToast();
  const [systemStatus, setSystemStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const checkSystemStatus = async () => {
      if (!user || loading) return;

      try {
        console.log('🔍 Checking onboarding system status...');
        
        // Test basic database connectivity
        const { data: testData, error: testError } = await supabase
          .from('roles')
          .select('name')
          .limit(1);

        if (testError) {
          console.error('❌ Database connectivity test failed:', testError);
          setSystemStatus('error');
          setStatusMessage('Database connectivity issue');
          return;
        }

        console.log('✅ Database connectivity test passed');

        // Test user roles access
        const { data: userRoleData, error: roleError } = await supabase
          .from('user_roles')
          .select(`
            roles (
              name,
              description
            )
          `)
          .eq('user_id', user.id);

        if (roleError) {
          console.error('❌ User roles access test failed:', roleError);
          setSystemStatus('error');
          setStatusMessage('Unable to verify user permissions');
          return;
        }

        console.log('✅ User roles access test passed');
        setSystemStatus('ready');
        setStatusMessage('All systems operational');

      } catch (error) {
        console.error('❌ System status check failed:', error);
        setSystemStatus('error');
        setStatusMessage('System check failed');
      }
    };

    checkSystemStatus();
  }, [user, loading]);

  if (loading) {
    return (
      <MainLayout>
        <PageContainer title="Onboarding" subtitle="Loading...">
          <div className="flex justify-center items-center min-h-[400px]">
            <LoadingSpinner size="lg" />
          </div>
        </PageContainer>
      </MainLayout>
    );
  }

  // Check if user has onboarding role
  const hasOnboardingAccess = userRoles.includes('onboardingTeam') || userRoles.includes('superAdmin');

  if (!hasOnboardingAccess) {
    return (
      <MainLayout>
        <PageContainer title="Onboarding" subtitle="Access Denied">
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Restricted</h3>
              <p className="text-gray-600 mb-4">
                You need onboarding team permissions to access this module.
              </p>
              <p className="text-sm text-gray-500">
                Current roles: {userRoles.join(', ') || 'None'}
              </p>
            </div>
          </div>
        </PageContainer>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageContainer
        title="Onboarding Management"
        subtitle="Manage user onboarding and system setup"
      >
        <div className="space-y-6">
          {/* Welcome Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Welcome to Onboarding Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Welcome, {user?.email}! You have access to the onboarding management system.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">Access Confirmed</h4>
                <p className="text-green-700 text-sm">
                  You are successfully authenticated with the following roles: {userRoles.join(', ')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Authentication System</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    ✅ Working
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Role-Based Access</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    ✅ Active
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Database Connectivity</span>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    systemStatus === 'ready' 
                      ? 'bg-green-100 text-green-800' 
                      : systemStatus === 'error'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {systemStatus === 'ready' ? '✅ Connected' : 
                     systemStatus === 'error' ? '❌ Error' : '🔄 Checking'}
                  </span>
                </div>
              </div>
              {statusMessage && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-sm">{statusMessage}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <UserPlus className="h-5 w-5 text-blue-600" />
                  New User Setup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Set up new users and assign roles
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-green-600" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Manage existing user accounts and permissions
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5 text-purple-600" />
                  System Setup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Configure system settings and modules
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Debug Information */}
          <Card>
            <CardHeader>
              <CardTitle>Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>User ID:</strong> {user?.id}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Roles:</strong> {userRoles.join(', ') || 'None'}</p>
                <p><strong>System Status:</strong> {systemStatus}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </MainLayout>
  );
};

export default Onboarding;
