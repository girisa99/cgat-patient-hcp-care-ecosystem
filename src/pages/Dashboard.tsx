
import React from 'react';
import { useAuthContext } from '@/components/auth/CleanAuthProvider';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, Settings, UserPlus, Code, Shield, Activity, Layers, FileText } from 'lucide-react';
import ProfileCard from '@/components/dashboard/ProfileCard';
import { useUsers } from '@/hooks/useUsers';
import { useFacilities } from '@/hooks/useFacilities';
import { useModules } from '@/hooks/useModules';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const { user, userRoles, profile } = useAuthContext();
  const { users, isLoading: usersLoading } = useUsers();
  const { facilities, isLoading: facilitiesLoading } = useFacilities();
  const { modules, isLoading: modulesLoading } = useModules();

  // Fetch API integrations count
  const { data: apiIntegrationsCount, isLoading: apiLoading } = useQuery({
    queryKey: ['api-integrations-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('api_integration_registry')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
      
      if (error) {
        console.error('Error fetching API integrations count:', error);
        return 0;
      }
      
      return count || 0;
    }
  });

  const isAdmin = userRoles.includes('superAdmin');
  const isOnboarding = userRoles.includes('onboardingTeam');
  const hasAdminAccess = isAdmin || isOnboarding;

  console.log('📊 Dashboard data:', {
    usersCount: users?.length || 0,
    facilitiesCount: facilities?.length || 0,
    modulesCount: modules?.length || 0,
    apiIntegrationsCount: apiIntegrationsCount || 0,
    userRoles,
    hasAdminAccess
  });

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

                      <Link to="/modules">
                        <Button variant="outline" className="w-full h-20 flex-col">
                          <Layers className="h-6 w-6 mb-2" />
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
                  
                  <Link to="/patients">
                    <Button variant="outline" className="w-full h-20 flex-col">
                      <UserPlus className="h-6 w-6 mb-2" />
                      Patients
                    </Button>
                  </Link>
                  
                  <Link to="/onboarding">
                    <Button variant="outline" className="w-full h-20 flex-col">
                      <FileText className="h-6 w-6 mb-2" />
                      Onboarding
                    </Button>
                  </Link>
                  
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

        {/* Admin Overview Cards */}
        {hasAdminAccess && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {usersLoading ? '...' : users?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">Active users in system</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Facilities</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {facilitiesLoading ? '...' : facilities?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">Registered facilities</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Modules</CardTitle>
                <Layers className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {modulesLoading ? '...' : modules?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">Available modules</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API Integrations</CardTitle>
                <Code className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {apiLoading ? '...' : apiIntegrationsCount || 0}
                </div>
                <p className="text-xs text-muted-foreground">Active integrations</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* System Health Status */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health
            </CardTitle>
            <CardDescription>Current system status and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">All Systems Operational</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Last checked: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </CardContent>
        </Card>

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
