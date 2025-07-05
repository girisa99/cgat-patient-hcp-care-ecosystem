
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, RefreshCw, Plus, UserCheck } from 'lucide-react';
import { useMasterData } from '@/hooks/useMasterData';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { useUnifiedDevelopmentLifecycle } from '@/hooks/useUnifiedDevelopmentLifecycle';
import AccessDenied from '@/components/AccessDenied';

const Onboarding: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading, userRoles } = useMasterAuth();
  const { navigation } = useUnifiedDevelopmentLifecycle();
  const { 
    users, 
    facilities,
    isLoading, 
    error, 
    refreshData, 
    stats
  } = useMasterData();
  
  const [searchQuery, setSearchQuery] = React.useState('');

  console.log('🚀 Onboarding Page - Master Data Integration');

  // Role-based access guard
  if (!navigation.hasAccess('/onboarding')) {
    return <AccessDenied />;
  }

  if (authLoading || isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="text-muted-foreground">Loading onboarding data...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">Please log in to view onboarding</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-red-600">Error loading onboarding data: {error.message}</div>
            <Button onClick={refreshData} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter for onboarding team members
  const onboardingTeam = users.filter(user => 
    user.user_roles.some(ur => ['onboardingTeam', 'superAdmin'].includes(ur.role.name))
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Onboarding Management</h1>
        <p className="text-muted-foreground">
          Manage user and facility onboarding workflows
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
          <div className="text-sm text-blue-600">Total Users</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.totalFacilities}</div>
          <div className="text-sm text-green-600">Facilities</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{onboardingTeam.length}</div>
          <div className="text-sm text-purple-600">Team Members</div>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{userRoles.length}</div>
          <div className="text-sm text-orange-600">Your Roles</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Recent User Registrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {users.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{user.first_name} {user.last_name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                    <div className="flex gap-1 mt-1">
                      {user.user_roles.map((ur, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {ur.role.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <div className="text-center p-4 text-muted-foreground">
                  No recent registrations
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Facilities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Recent Facility Registrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {facilities.slice(0, 5).map((facility) => (
                <div key={facility.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{facility.name}</div>
                    <div className="text-sm text-muted-foreground">{facility.facility_type}</div>
                    <div className="flex gap-1 mt-1">
                      <Badge variant={facility.is_active ? 'default' : 'secondary'} className="text-xs">
                        {facility.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(facility.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
              {facilities.length === 0 && (
                <div className="text-center p-4 text-muted-foreground">
                  No recent facility registrations
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex gap-4">
        <Button onClick={refreshData} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          New Onboarding
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
