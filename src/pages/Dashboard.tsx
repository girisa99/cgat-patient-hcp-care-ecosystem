
import React from 'react';
import { useAuthContext } from '@/components/auth/CleanAuthProvider';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, Settings, UserPlus, Database, Code, Shield } from 'lucide-react';
import ProfileCard from '@/components/dashboard/ProfileCard';
import { useAdminRealtime } from '@/hooks/useAdminRealtime';

const Dashboard = () => {
  const { user, userRoles, profile } = useAuthContext();

  // Enable real-time updates for dashboard
  useAdminRealtime({
    enableNotifications: true,
    areas: ['dashboard', 'rbac', 'userManagement', 'apiIntegration']
  });

  const isAdmin = userRoles.includes('superAdmin');
  const isOnboarding = userRoles.includes('onboardingTeam');
  const hasAdminAccess = isAdmin || isOnboarding;

  return (
    <MainLayout>
      <PageContainer
        title="Dashboard"
        subtitle={`Welcome back, ${profile?.first_name || user?.email || 'User'}!`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <ProfileCard profile={profile} user={user} />
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Access your most used features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hasAdminAccess && (
                    <>
                      <Link to="/users">
                        <Button variant="outline" className="w-full h-20 flex-col">
                          <Users className="h-6 w-6 mb-2" />
                          User Management
                        </Button>
                      </Link>
                      
                      <Link to="/facilities">
                        <Button variant="outline" className="w-full h-20 flex-col">
                          <Building2 className="h-6 w-6 mb-2" />
                          Facilities
                        </Button>
                      </Link>
                    </>
                  )}
                  
                  <Link to="/patients">
                    <Button variant="outline" className="w-full h-20 flex-col">
                      <UserPlus className="h-6 w-6 mb-2" />
                      Patients
                    </Button>
                  </Link>
                  
                  {hasAdminAccess && (
                    <>
                      <Link to="/modules">
                        <Button variant="outline" className="w-full h-20 flex-col">
                          <Database className="h-6 w-6 mb-2" />
                          Modules
                        </Button>
                      </Link>
                      
                      <Link to="/api-integrations">
                        <Button variant="outline" className="w-full h-20 flex-col">
                          <Code className="h-6 w-6 mb-2" />
                          API Integrations
                        </Button>
                      </Link>
                      
                      <Link to="/audit-log">
                        <Button variant="outline" className="w-full h-20 flex-col">
                          <Shield className="h-6 w-6 mb-2" />
                          Audit Log
                        </Button>
                      </Link>
                    </>
                  )}
                  
                  <Link to="/settings">
                    <Button variant="outline" className="w-full h-20 flex-col">
                      <Settings className="h-6 w-6 mb-2" />
                      Settings
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Role Information */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Your Access Level</CardTitle>
            <CardDescription>Current roles and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {userRoles.length > 0 ? (
                userRoles.map((role) => (
                  <span
                    key={role}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {role}
                  </span>
                ))
              ) : (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                  No roles assigned
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    </MainLayout>
  );
};

export default Dashboard;
