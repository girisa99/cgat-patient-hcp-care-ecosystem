/**
 * COMPREHENSIVE DEMO DASHBOARD
 * Combines SuperAdmin + Onboarding Team functionality for demo users
 * with clear visual separation and complete API access
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgenticAIPresentation } from '@/components/presentation/AgenticAIPresentation';
import { OnboardingProgressDashboard } from '@/components/onboarding/OnboardingProgressDashboard';
import { 
  Activity, 
  Users,
  Building2,
  Stethoscope,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Plus,
  Settings,
  Presentation,
  Crown,
  Shield,
  Sparkles,
  Eye,
  Database,
  Bot,
  Brain,
  FileText,
  Globe,
  TestTube,
  Upload
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { useRealTimeUserStats } from '@/hooks/useRealTimeUserStats';
import { useMasterOnboarding } from '@/hooks/useMasterOnboarding';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { useMasterData } from '@/hooks/useMasterData';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const DemoDashboard: React.FC = () => {
  const [showPresentation, setShowPresentation] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  const { user, userRoles } = useMasterAuth();
  const { users, modules, facilities } = useMasterData();
  const { onboardingApplications, onboardingStats } = useMasterOnboarding();
  const { data: userStats, isLoading: userStatsLoading } = useRealTimeUserStats();

  // Check if user is demo user
  const isDemoUser = userRoles.includes('demoUser');

  // Fetch real activity data from audit logs
  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 60000,
  });

  // Demo-specific stats combining all functionality
  const demoStats = {
    totalUsers: users?.length || 0,
    totalModules: modules?.filter(m => m.is_active)?.length || 0,
    totalFacilities: facilities?.filter(f => f.is_active)?.length || 0,
    onboardingApplications: onboardingApplications?.length || 0,
    apiServices: 12, // Static for demo
    aiAgents: 8, // Static for demo
  };

  const handleQuickAction = (action: string) => {
    toast({
      title: "Demo Feature Access",
      description: `Accessing ${action} in demo mode...`,
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'insert':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'update':
        return <Settings className="h-4 w-4 text-blue-600" />;
      case 'delete':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionDescription = (log: any) => {
    const tableName = log.table_name?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
    switch (log.action?.toLowerCase()) {
      case 'insert':
        return `New ${tableName} created`;
      case 'update':
        return `${tableName} updated`;
      case 'delete':
        return `${tableName} deleted`;
      default:
        return `${tableName} ${log.action}`;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Demo User Header with Visual Separation */}
        {isDemoUser && (
          <div className="bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-green-500/20 border border-purple-500/30 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-purple-600" />
                    Complete Demo Dashboard
                  </h1>
                  <p className="text-muted-foreground">
                    Experience all SuperAdmin + Onboarding Team functionality in demonstration mode
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      <Eye className="h-3 w-3 mr-1" />
                      Demo Mode
                    </Badge>
                    <Badge variant="outline" className="border-blue-500 text-blue-700">
                      <Shield className="h-3 w-3 mr-1" />
                      Full Access
                    </Badge>
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => setShowPresentation(!showPresentation)}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Presentation className="h-4 w-4" />
                {showPresentation ? 'Hide' : 'View'} AI Presentation
              </Button>
            </div>
          </div>
        )}

        {/* Presentation Display */}
        {showPresentation && (
          <div className="mb-8">
            <AgenticAIPresentation onExit={() => setShowPresentation(false)} />
          </div>
        )}

        {/* Demo Tabs for Different Functionality Areas */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              System Overview
            </TabsTrigger>
            <TabsTrigger value="superadmin" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              SuperAdmin Features
            </TabsTrigger>
            <TabsTrigger value="onboarding" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Treatment Centers
            </TabsTrigger>
            <TabsTrigger value="ai-platform" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Platform
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Combined Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <Card className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-blue-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold text-blue-700">{demoStats.totalUsers}</p>
                      <p className="text-xs text-muted-foreground">Total Users</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/20 to-green-500/5 border-green-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold text-green-700">{demoStats.onboardingApplications}</p>
                      <p className="text-xs text-muted-foreground">Treatment Centers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-purple-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Settings className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold text-purple-700">{demoStats.totalModules}</p>
                      <p className="text-xs text-muted-foreground">Active Modules</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500/20 to-orange-500/5 border-orange-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-8 w-8 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold text-orange-700">{demoStats.apiServices}</p>
                      <p className="text-xs text-muted-foreground">API Services</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-pink-500/20 to-pink-500/5 border-pink-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-8 w-8 text-pink-600" />
                    <div>
                      <p className="text-2xl font-bold text-pink-700">{demoStats.aiAgents}</p>
                      <p className="text-xs text-muted-foreground">AI Agents</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-teal-500/20 to-teal-500/5 border-teal-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Stethoscope className="h-8 w-8 text-teal-600" />
                    <div>
                      <p className="text-2xl font-bold text-teal-700">{demoStats.totalFacilities}</p>
                      <p className="text-xs text-muted-foreground">Healthcare Facilities</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent System Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activityLoading ? (
                      <div className="flex items-center space-x-3">
                        <div className="animate-pulse h-4 w-4 bg-gray-300 rounded-full"></div>
                        <div className="flex-1">
                          <div className="animate-pulse h-4 bg-gray-300 rounded mb-1"></div>
                          <div className="animate-pulse h-3 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    ) : recentActivity && recentActivity.length > 0 ? (
                      recentActivity.map((log: any) => (
                        <div key={log.id} className="flex items-center space-x-3">
                          {getActionIcon(log.action)}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{getActionDescription(log)}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatTimeAgo(log.created_at)}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            Demo
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">System running smoothly</p>
                          <p className="text-xs text-muted-foreground">Demo environment active</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Demo Features Available
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">User Management</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Treatment Center Onboarding</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">AI Agent Platform</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">API Services</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Healthcare AI</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Security & Governance</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* SuperAdmin Features Tab */}
          <TabsContent value="superadmin" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-purple-600" />
                  SuperAdmin Management Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link to="/users">
                    <Button variant="outline" className="h-20 w-full flex flex-col items-center gap-2">
                      <Users className="h-6 w-6" />
                      <span className="text-sm">User Management</span>
                    </Button>
                  </Link>
                  <Link to="/modules">
                    <Button variant="outline" className="h-20 w-full flex flex-col items-center gap-2">
                      <Settings className="h-6 w-6" />
                      <span className="text-sm">Module Management</span>
                    </Button>
                  </Link>
                  <Link to="/facilities">
                    <Button variant="outline" className="h-20 w-full flex flex-col items-center gap-2">
                      <Building2 className="h-6 w-6" />
                      <span className="text-sm">Facility Management</span>
                    </Button>
                  </Link>
                  <Link to="/security">
                    <Button variant="outline" className="h-20 w-full flex flex-col items-center gap-2">
                      <Shield className="h-6 w-6" />
                      <span className="text-sm">Security Center</span>
                    </Button>
                  </Link>
                  <Link to="/role-management">
                    <Button variant="outline" className="h-20 w-full flex flex-col items-center gap-2">
                      <BarChart3 className="h-6 w-6" />
                      <span className="text-sm">Role Management</span>
                    </Button>
                  </Link>
                  <Link to="/api-services">
                    <Button variant="outline" className="h-20 w-full flex flex-col items-center gap-2">
                      <Globe className="h-6 w-6" />
                      <span className="text-sm">API Services</span>
                    </Button>
                  </Link>
                  <Link to="/reports">
                    <Button variant="outline" className="h-20 w-full flex flex-col items-center gap-2">
                      <FileText className="h-6 w-6" />
                      <span className="text-sm">System Reports</span>
                    </Button>
                  </Link>
                  <Link to="/governance">
                    <Button variant="outline" className="h-20 w-full flex flex-col items-center gap-2">
                      <Eye className="h-6 w-6" />
                      <span className="text-sm">Governance</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onboarding/Treatment Centers Tab */}
          <TabsContent value="onboarding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-green-600" />
                  Treatment Center Onboarding
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  <Link to="/onboarding">
                    <Button variant="outline" className="h-20 w-full flex flex-col items-center gap-2">
                      <Plus className="h-6 w-6" />
                      <span className="text-sm">New Treatment Center</span>
                    </Button>
                  </Link>
                  <Link to="/treatment-centers">
                    <Button variant="outline" className="h-20 w-full flex flex-col items-center gap-2">
                      <Building2 className="h-6 w-6" />
                      <span className="text-sm">View All Centers</span>
                    </Button>
                  </Link>
                  <Link to="/data-import">
                    <Button variant="outline" className="h-20 w-full flex flex-col items-center gap-2">
                      <Upload className="h-6 w-6" />
                      <span className="text-sm">Data Import</span>
                    </Button>
                  </Link>
                </div>
                
                {/* Onboarding Progress Component */}
                <OnboardingProgressDashboard 
                  applications={onboardingApplications}
                  onNavigateToStep={() => {}}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Platform Tab */}
          <TabsContent value="ai-platform" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  AI Platform & Automation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link to="/agents">
                    <Button variant="outline" className="h-20 w-full flex flex-col items-center gap-2">
                      <Bot className="h-6 w-6" />
                      <span className="text-sm">AI Agents</span>
                    </Button>
                  </Link>
                  <Link to="/healthcare-ai">
                    <Button variant="outline" className="h-20 w-full flex flex-col items-center gap-2">
                      <Brain className="h-6 w-6" />
                      <span className="text-sm">Healthcare AI</span>
                    </Button>
                  </Link>
                  <Link to="/testing">
                    <Button variant="outline" className="h-20 w-full flex flex-col items-center gap-2">
                      <TestTube className="h-6 w-6" />
                      <span className="text-sm">AI Testing Suite</span>
                    </Button>
                  </Link>
                  <Link to="/framework">
                    <Button variant="outline" className="h-20 w-full flex flex-col items-center gap-2">
                      <Database className="h-6 w-6" />
                      <span className="text-sm">Framework</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default DemoDashboard;