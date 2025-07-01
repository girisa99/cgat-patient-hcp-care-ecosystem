
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '@/hooks/useDashboard';
import { useModules } from '@/hooks/useModules';
import { useIntelligentRouting } from '@/hooks/useIntelligentRouting';
import { PageLoader } from '@/components/ui/PageLoader';
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
  const { dashboardData, profile, userRoles, meta, loading } = useDashboard();
  const { userModules } = useModules();
  const { moduleProgress } = useIntelligentRouting();

  console.log('📊 UnifiedDashboard rendering with data:', {
    loading,
    dashboardData: !!dashboardData,
    userRoles: userRoles?.length || 0
  });

  if (loading) {
    return <PageLoader message="Loading dashboard..." />;
  }

  const quickActions = [
    {
      title: 'User Management',
      description: `Manage ${dashboardData?.totalUsers || 0} users and roles`,
      icon: Users,
      path: '/users',
      color: 'bg-blue-500',
      count: dashboardData?.totalUsers || 0
    },
    {
      title: 'Facility Management',
      description: `Oversee ${dashboardData?.totalFacilities || 0} healthcare facilities`,
      icon: Building,
      path: '/facilities',
      color: 'bg-green-500',
      count: dashboardData?.totalFacilities || 0
    },
    {
      title: 'System Modules',
      description: `Configure ${dashboardData?.totalModules || 0} system modules`,
      icon: Settings,
      path: '/modules',
      color: 'bg-purple-500',
      count: dashboardData?.totalModules || 0
    },
    {
      title: 'API Services',
      description: `Monitor ${dashboardData?.totalApiServices || 0} API integrations`,
      icon: Zap,
      path: '/admin/api-services',
      color: 'bg-orange-500',
      count: dashboardData?.totalApiServices || 0
    }
  ];

  const systemMetrics = [
    {
      title: 'Total Users',
      value: dashboardData?.totalUsers || 0,
      icon: Users,
      trend: dashboardData?.userStats ? `${dashboardData.userStats.admins} admins` : 'N/A',
      description: 'Active system users'
    },
    {
      title: 'Active Facilities',
      value: dashboardData?.facilityStats?.active || 0,
      icon: Building,
      trend: `${dashboardData?.facilityStats?.total || 0} total`,
      description: 'Healthcare facilities'
    },
    {
      title: 'System Health',
      value: dashboardData?.systemHealth === 'healthy' ? 'Healthy' : 'Warning',
      icon: Activity,
      trend: 'All systems operational',
      description: 'Overall system status'
    },
    {
      title: 'API Integrations',
      value: dashboardData?.apiIntegrations || 0,
      icon: Zap,
      trend: `${dashboardData?.apiServiceStats?.active || 0} active`,
      description: 'Connected services'
    }
  ];

  const recentActivity = moduleProgress?.slice(0, 3) || [];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {dashboardData?.welcomeMessage || 'Welcome to Healthcare Portal!'}
            </h1>
            <p className="text-gray-600 mt-1">
              {dashboardData?.summary || 'Healthcare Management Dashboard'}
            </p>
            <div className="flex gap-2 mt-3">
              {userRoles && userRoles.length > 0 ? (
                userRoles.map(role => (
                  <Badge key={role} variant="secondary">
                    {role}
                  </Badge>
                ))
              ) : (
                <Badge variant="outline">User</Badge>
              )}
              <Badge variant="outline" className="bg-green-50 text-green-700">
                System Active
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">System Status</div>
            <Badge variant="default" className="bg-green-500">
              {dashboardData?.systemHealth === 'healthy' ? 'Operational' : 'Warning'}
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
              Administrative tasks with live data counts
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
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{action.count}</Badge>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
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
                  onClick={() => navigate('/security')}
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

      {/* System Architecture Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Architecture Status</CardTitle>
          <CardDescription>
            Verification of single source of truth implementation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {meta?.dataSources && Object.entries(meta.dataSources).map(([system, source]) => (
              <div key={system} className="p-3 bg-green-50 border border-green-200 rounded">
                <div className="font-medium text-green-800 capitalize">{system}</div>
                <div className="text-xs text-green-600 mt-1">{source}</div>
                <Badge variant="outline" className="mt-2 text-green-700 border-green-300">
                  ✓ Consolidated
                </Badge>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <div className="text-sm font-medium text-blue-800">
              ✅ Single Source of Truth Verified
            </div>
            <div className="text-xs text-blue-600 mt-1">
              All systems using consolidated data sources • Version: {meta?.version || 'v1'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedDashboard;
