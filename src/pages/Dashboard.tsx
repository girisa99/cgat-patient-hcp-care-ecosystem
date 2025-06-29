
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useIntelligentRouting } from '@/hooks/useIntelligentRouting';
import UnifiedDashboard from '@/components/dashboard/UnifiedDashboard';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, User, Building, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '@/hooks/useDashboard';

const Dashboard = () => {
  const { userRoles } = useAuthContext();
  const { canAccessUnifiedDashboard, userPreferences } = useIntelligentRouting();
  const { dashboardData, profile } = useDashboard();
  const navigate = useNavigate();

  // Super admins get the unified dashboard
  if (canAccessUnifiedDashboard && userPreferences.preferredDashboard !== 'module-specific') {
    return (
      <ProtectedRoute>
        <MainLayout>
          <PageContainer
            title="System Dashboard"
            subtitle="Comprehensive system overview and administration"
            headerActions={
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/settings')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            }
          >
            <UnifiedDashboard />
          </PageContainer>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  // Role-specific dashboard for non-super-admin users
  const getRoleSpecificContent = () => {
    if (userRoles.includes('onboardingTeam')) {
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Onboarding Dashboard</CardTitle>
              <CardDescription>
                Manage customer onboarding and user setup processes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  className="h-20 flex-col"
                  onClick={() => navigate('/onboarding')}
                >
                  <User className="h-6 w-6 mb-2" />
                  Onboarding Workflow
                </Button>
                <Button 
                  variant="outline"
                  className="h-20 flex-col"
                  onClick={() => navigate('/users')}
                >
                  <Shield className="h-6 w-6 mb-2" />
                  User Management
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (userRoles.includes('healthcareProvider') || userRoles.includes('nurse')) {
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Healthcare Dashboard</CardTitle>
              <CardDescription>
                Patient care and healthcare facility management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  className="h-20 flex-col"
                  onClick={() => navigate('/patients')}
                >
                  <User className="h-6 w-6 mb-2" />
                  Patient Management
                </Button>
                <Button 
                  variant="outline"
                  className="h-20 flex-col"
                  onClick={() => navigate('/facilities')}
                >
                  <Building className="h-6 w-6 mb-2" />
                  Facilities
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Default dashboard for other roles
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {profile?.first_name || 'User'}!</CardTitle>
            <CardDescription>
              Your personalized healthcare portal dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-lg font-medium mb-2">
                Your role: {userRoles.join(', ')}
              </div>
              <div className="text-gray-600 mb-4">
                Access modules based on your permissions through the navigation menu.
              </div>
              <Button onClick={() => navigate('/modules')}>
                View Available Modules
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <PageContainer
          title="Dashboard"
          subtitle="Your personalized healthcare portal"
        >
          {getRoleSpecificContent()}
        </PageContainer>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default Dashboard;
