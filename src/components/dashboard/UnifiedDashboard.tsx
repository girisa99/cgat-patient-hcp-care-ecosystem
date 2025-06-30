import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '@/hooks/useDashboard';
import { useModules } from '@/hooks/useModules';
import { useIntelligentRouting } from '@/hooks/useIntelligentRouting';
import { 
  Users, 
  Building, 
  Settings, 
  Activity, 
  TrendingUp, 
  Shield,
  Clock,
  ChevronRight,
  Zap
} from 'lucide-react';

const UnifiedDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { dashboardData, loading, profile, userRoles } = useDashboard();
  const { userModules } = useModules();
  const { moduleProgress, getAccessibleModules } = useIntelligentRouting();

  const quickActions = [
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: Users,
      path: '/users',
      color: 'bg-blue-500'
    },
    {
      title: 'Facility Management',
      description: 'Oversee healthcare facilities',
      icon: Building,
      path: '/facilities',
      color: 'bg-green-500'
    },
    {
      title: 'System Configuration',
      description: 'Configure modules and settings',
      icon: Settings,
      path: '/modules',
      color: 'bg-purple-500'
    },
    {
      title: 'Audit & Security',
      description: 'Review system audit logs',
      icon: Shield,
      path: '/audit-log',
      color: 'bg-red-500'
    }
  ];

  const systemMetrics = [
    {
      title: 'Total Users',
      value: dashboardData?.totalUsers || 0,
      icon: Users,
      trend: '+12%'
    },
    {
      title: 'Active Facilities',
      value: dashboardData?.totalFacilities || 0,
      icon: Building,
      trend: '+5%'
    },
    {
      title: 'System Health',
      value: dashboardData?.systemHealth || 'healthy',
      icon: Activity,
      trend: 'stable'
    },
    {
      title: 'API Integrations',
      value: dashboardData?.apiIntegrations || 0,
      icon: Zap,
      trend: '+2'
    }
  ];

  const recentActivity = moduleProgress?.slice(0, 3) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {profile?.first_name || 'Admin'}!
            </h1>
            <p className="text-gray-600 mt-1">
              Super Admin Dashboard - Full system oversight and control
            </p>
            <div className="flex gap-2 mt-3">
              {userRoles.map(role => (
                <Badge key={role} variant="secondary">
                  {role}
                </Badge>
              ))}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">System Status</div>
            <Badge variant="default" className="bg-green-500">
              All Systems Operational
            </Badge>
          </div>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {metric.trend}
                    </p>
                  </div>
                  <Icon className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common administrative tasks and system management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start h-auto p-4"
                  onClick={() => navigate(action.path)}
                >
                  <div className={`p-2 rounded-md ${action.color} mr-3`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-medium">{action.title}</div>
                    <div className="text-sm text-gray-500">{action.description}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your recent module usage and system interactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium capitalize">{activity.moduleId}</div>
                      <div className="text-sm text-gray-500">{activity.lastPath}</div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => navigate('/settings')}
                >
                  View All Activity
                </Button>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <div>No recent activity</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Accessible Modules */}
      <Card>
        <CardHeader>
          <CardTitle>Your Modules</CardTitle>
          <CardDescription>
            All modules you have access to based on your permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userModules?.map((module) => (
              <Card key={module.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{module.moduleName}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {module.description || 'No description available'}
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => navigate(`/${module.moduleName.toLowerCase()}`)}
                    >
                      Open
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedDashboard;
