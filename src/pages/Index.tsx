import React from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, Package, Shield, Building2, Globe, TestTube, 
  CheckCircle2, Activity, Database, UserPlus, HeartHandshake,
  AlertTriangle, Clock, TrendingUp, RefreshCw
} from "lucide-react";
import { useMasterAuth } from "@/hooks/useMasterAuth";
import { useComprehensiveSystemStatus } from "@/hooks/useComprehensiveSystemStatus";
import { useRoleBasedNavigation } from "@/hooks/useRoleBasedNavigation";
import DashboardHeader from "@/components/layout/DashboardHeader";

const Index = () => {
  const { user, profile, userRoles, isLoading } = useMasterAuth();
  const { systemStatus, isChecking, recheckStatus } = useComprehensiveSystemStatus();
  const { availableTabs, roleStats } = useRoleBasedNavigation();

  const getUserDisplayName = () => {
    // Try profile first name and last name
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    
    // Try just first name
    if (profile?.first_name) {
      return profile.first_name;
    }
    
    // Try user metadata as fallback
    if (user?.user_metadata?.first_name && user?.user_metadata?.last_name) {
      return `${user.user_metadata.first_name} ${user.user_metadata.last_name}`;
    }
    
    if (user?.user_metadata?.first_name) {
      return user.user_metadata.first_name;
    }
    
    // Try extracting from email
    if (user?.email) {
      const emailPart = user.email.split('@')[0];
      // Clean up email part for display
      return emailPart.replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    return 'User';
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthBadge = (health: string) => {
    switch (health) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // All Quick Actions including Data Import - ensuring all are visible
  const quickActions = [
    { title: "User Management", path: "/users", icon: Users, color: "text-blue-600" },
    { title: "Patients", path: "/patients", icon: HeartHandshake, color: "text-pink-600" },
    { title: "Facilities", path: "/facilities", icon: Building2, color: "text-green-600" },
    { title: "Modules", path: "/modules", icon: Package, color: "text-purple-600" },
    { title: "API Services", path: "/api-services", icon: Globe, color: "text-indigo-600" },
    { title: "Testing", path: "/testing", icon: TestTube, color: "text-orange-600" },
    { title: "Data Import", path: "/data-import", icon: Database, color: "text-teal-600" }, // ADDED Data Import
    { title: "Verification", path: "/active-verification", icon: CheckCircle2, color: "text-cyan-600" },
    { title: "Onboarding", path: "/onboarding", icon: UserPlus, color: "text-amber-600" },
    { title: "Security", path: "/security", icon: Shield, color: "text-red-600" }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayName = getUserDisplayName();
  
  // Debug logging for troubleshooting
  console.log('🎯 Dashboard Debug:', {
    user: user?.email,
    profile: profile,
    userRoles,
    availableTabs: availableTabs.length,
    displayName,
    profileFirstName: profile?.first_name,
    profileLastName: profile?.last_name,
    userMetadata: user?.user_metadata
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section with Better Name Display */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {displayName}! 👋
          </h1>
          <p className="text-lg text-gray-600">
            Here's your healthcare system overview and quick access to all modules.
          </p>
          <div className="flex items-center space-x-2 mt-3">
            <Badge variant="outline" className="text-sm">
              {userRoles.length > 0 ? `${userRoles.length} Active Role${userRoles.length !== 1 ? 's' : ''}` : 'Development Mode'}
            </Badge>
            <Badge variant="secondary" className="text-sm">
              {availableTabs.length} Modules Available
            </Badge>
            <Badge variant="outline" className="text-sm">
              {roleStats.roleLevel}
            </Badge>
          </div>
        </div>

        {/* System Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <Activity className={`h-4 w-4 ${systemStatus ? getHealthColor(systemStatus.overallHealth) : 'text-gray-400'}`} />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className={`text-2xl font-bold ${systemStatus ? getHealthColor(systemStatus.overallHealth) : 'text-gray-400'}`}>
                  {systemStatus ? systemStatus.overallHealth.toUpperCase() : 'CHECKING...'}
                </div>
                <Badge className={systemStatus ? getHealthBadge(systemStatus.overallHealth) : 'bg-gray-100 text-gray-800'}>
                  {systemStatus ? `${systemStatus.workingModules}/${systemStatus.totalModules}` : '0/0'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {systemStatus ? `${systemStatus.workingModules} modules working` : 'Loading status...'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {systemStatus ? systemStatus.userManagement.dataCount : 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Registered users
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Facilities</CardTitle>
              <Building2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {systemStatus ? systemStatus.facilities.dataCount : 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Healthcare facilities
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Services</CardTitle>
              <Globe className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {systemStatus ? systemStatus.apiIntegrations.dataCount : 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Active integrations
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Module Status Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Module Status</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={recheckStatus}
                  disabled={isChecking}
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemStatus && [
                  systemStatus.userManagement,
                  systemStatus.facilities,
                  systemStatus.modules,
                  systemStatus.apiIntegrations,
                  systemStatus.adminVerification
                ].map((module, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`h-3 w-3 rounded-full ${module.isWorking ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="font-medium">{module.moduleName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{module.dataCount} records</span>
                      {module.issues.length > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {module.issues.length} issues
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>System Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemStatus && systemStatus.recommendations.length > 0 ? (
                  systemStatus.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-blue-800">{rec}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-8 w-8 mx-auto mb-2" />
                    <p>System insights will appear here</p>
                  </div>
                )}
                
                {systemStatus && systemStatus.totalIssues > 0 && (
                  <div className="flex items-start space-x-2 p-3 bg-red-50 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-red-800">
                      {systemStatus.totalIssues} system issues detected requiring attention
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - All Available Pages Including Data Import */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Quick Actions - All Available Modules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link key={index} to={action.path}>
                    <div className="p-4 border rounded-lg hover:bg-gray-50 hover:shadow-md transition-all duration-200 cursor-pointer">
                      <div className="flex flex-col items-center space-y-2 text-center">
                        <Icon className={`h-6 w-6 ${action.color}`} />
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm">{action.title}</h3>
                          <p className="text-xs text-gray-600">Access {action.title.toLowerCase()}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Development Debug Info */}
        {(userRoles.length === 0 || roleStats.roleLevel === 'Development Mode') && (
          <Card className="border-0 shadow-sm bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-yellow-800">🚧 Development Mode Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-yellow-700">
                <p><strong>Status:</strong> All pages accessible for development</p>
                <p><strong>User:</strong> {user?.email}</p>
                <p><strong>Profile:</strong> {profile ? 'Loaded' : 'Not loaded'}</p>
                <p><strong>Roles:</strong> {userRoles.length > 0 ? userRoles.join(', ') : 'None loaded'}</p>
                <p><strong>Available Pages:</strong> {availableTabs.length}/{quickActions.length}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
