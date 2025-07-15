import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Building, Package, Activity, TrendingUp, Shield } from 'lucide-react';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { useMasterUserManagement } from '@/hooks/useMasterUserManagement';
import { useMasterFacilities } from '@/hooks/useMasterFacilities';
import { useSingleMasterModules } from '@/hooks/useSingleMasterModules';

export const DashboardManagementTable: React.FC = () => {
  const { userRoles, user } = useMasterAuth();
  const { users } = useMasterUserManagement();
  const { facilities } = useMasterFacilities();
  const { modules, activeModules } = useSingleMasterModules();

  const isAdmin = userRoles.includes('superAdmin') || userRoles.includes('onboardingTeam');

  console.log('🏠 Dashboard Management - Using consolidated hooks');

  const stats = [
    {
      title: 'Total Users',
      value: users.length,
      icon: Users,
      change: '+12%',
      description: 'Active platform users'
    },
    {
      title: 'Facilities',
      value: facilities.length,
      icon: Building,
      change: '+3%',
      description: 'Healthcare facilities'
    },
    {
      title: 'Modules',
      value: modules.length,
      icon: Package,
      change: 'Stable',
      description: 'Available modules'
    },
    {
      title: 'Active Modules',
      value: activeModules.length,
      icon: Activity,
      change: '+5%',
      description: 'Currently active'
    }
  ];

  const recentActivity = [
    { action: 'New user registered', time: '2 minutes ago', type: 'user' },
    { action: 'Facility updated', time: '15 minutes ago', type: 'facility' },
    { action: 'Module activated', time: '1 hour ago', type: 'module' },
    { action: 'Role assigned', time: '2 hours ago', type: 'role' }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.email?.split('@')[0] || 'User'}
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your healthcare management platform today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {userRoles.map((role, index) => (
            <Badge key={index} variant="default" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              {role}
            </Badge>
          ))}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isAdmin && (
                <>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => window.location.href = '/users'}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => window.location.href = '/facilities'}
                  >
                    <Building className="h-4 w-4 mr-2" />
                    Add Facility
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => window.location.href = '/modules'}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Configure Modules
                  </Button>
                </>
              )}
              <Button className="w-full justify-start" variant="outline">
                <Activity className="h-4 w-4 mr-2" />
                View Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 border rounded">
              <span className="text-sm font-medium">Authentication</span>
              <Badge variant="default">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded">
              <span className="text-sm font-medium">Database</span>
              <Badge variant="default">Connected</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded">
              <span className="text-sm font-medium">API Services</span>
              <Badge variant="default">Operational</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};