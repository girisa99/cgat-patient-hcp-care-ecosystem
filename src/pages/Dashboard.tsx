
import React from 'react';
import { useAuthContext } from '@/components/auth/CleanAuthProvider';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, Settings, UserPlus, Database, Code, Shield, Activity, Layers, FileText } from 'lucide-react';
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
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">Active users in system</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Facilities</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">Registered facilities</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API Integrations</CardTitle>
                <Code className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">Active integrations</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Healthy</div>
                <p className="text-xs text-muted-foreground">All systems operational</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Module Links */}
        {hasAdminAccess && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>System Administration</CardTitle>
              <CardDescription>Advanced system management and configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link to="/modules" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Layers className="h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="font-medium">Module Registry</h3>
                      <p className="text-sm text-gray-600">Manage system modules and permissions</p>
                    </div>
                  </div>
                </Link>

                <Link to="/api-integrations" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Code className="h-8 w-8 text-green-600" />
                    <div>
                      <h3 className="font-medium">API Management</h3>
                      <p className="text-sm text-gray-600">Configure and monitor API integrations</p>
                    </div>
                  </div>
                </Link>

                <Link to="/audit-log" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-8 w-8 text-red-600" />
                    <div>
                      <h3 className="font-medium">Security & Audit</h3>
                      <p className="text-sm text-gray-600">View system audit logs and security events</p>
                    </div>
                  </div>
                </Link>

                <Link to="/users" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Users className="h-8 w-8 text-purple-600" />
                    <div>
                      <h3 className="font-medium">User Administration</h3>
                      <p className="text-sm text-gray-600">Manage users, roles, and permissions</p>
                    </div>
                  </div>
                </Link>

                <Link to="/facilities" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-8 w-8 text-orange-600" />
                    <div>
                      <h3 className="font-medium">Facility Management</h3>
                      <p className="text-sm text-gray-600">Oversee healthcare facilities and locations</p>
                    </div>
                  </div>
                </Link>

                <Link to="/patients" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <UserPlus className="h-8 w-8 text-teal-600" />
                    <div>
                      <h3 className="font-medium">Patient Management</h3>
                      <p className="text-sm text-gray-600">Access patient records and data</p>
                    </div>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

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
