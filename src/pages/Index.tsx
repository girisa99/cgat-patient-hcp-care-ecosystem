
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { Card, CardContent } from '@/components/ui/card';
import { DashboardManagementTable } from '@/components/dashboard/DashboardManagementTable';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, UserCheck, Activity, Bot, TestTube } from 'lucide-react';
import { normalizeRoles, hasAnyRole } from '@/utils/roles';

const Index: React.FC = () => {
  console.log('🏠 Dashboard/Index page - Using existing working components and relationships');
  
  const { hasAccess, currentRole } = useRoleBasedNavigation();
  const { userRoles } = useMasterAuth();
  const normalizedRoles = normalizeRoles(userRoles || []);
  const isHealthcareProvider = hasAnyRole(normalizedRoles, ['healthcareProvider']);
  const isAdmin = hasAnyRole(normalizedRoles, ['superAdmin', 'onboardingTeam']);
  const pageTitle = isHealthcareProvider ? 'Healthcare Provider Dashboard' : 'Healthcare Management Dashboard';
  const navigate = useNavigate();

  console.log('🏠 Dashboard Role Check:', {
    userRoles,
    normalizedRoles,
    isHealthcareProvider,
    isAdmin,
    pageTitle
  });
  
  if (!hasAccess('/dashboard')) {
    return (
      <AppLayout title="Access Denied">
        <Card>
          <CardContent className="p-8 text-center">
            <p>You don't have permission to access the Dashboard.</p>
            <p className="text-sm text-muted-foreground mt-2">Current role: {currentRole}</p>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={pageTitle}>
      {isHealthcareProvider ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card onClick={() => navigate('/order-management')} className="cursor-pointer hover:shadow-sm transition-shadow">
            <CardContent className="p-6 flex items-center gap-4">
              <ShoppingCart className="h-6 w-6" />
              <div>
                <h3 className="font-semibold">Order Management</h3>
                <p className="text-sm text-muted-foreground">Manage prescriptions and medication orders</p>
              </div>
            </CardContent>
          </Card>
          <Card onClick={() => navigate('/patient-onboarding')} className="cursor-pointer hover:shadow-sm transition-shadow">
            <CardContent className="p-6 flex items-center gap-4">
              <UserCheck className="h-6 w-6" />
              <div>
                <h3 className="font-semibold">Patient Onboarding</h3>
                <p className="text-sm text-muted-foreground">Enroll and onboard patients</p>
              </div>
            </CardContent>
          </Card>
          <Card onClick={() => navigate('/api-services')} className="cursor-pointer hover:shadow-sm transition-shadow">
            <CardContent className="p-6 flex items-center gap-4">
              <Activity className="h-6 w-6" />
              <div>
                <h3 className="font-semibold">API Services</h3>
                <p className="text-sm text-muted-foreground">Integration and connectivity tools</p>
              </div>
            </CardContent>
          </Card>
          <Card onClick={() => navigate('/agents')} className="cursor-pointer hover:shadow-sm transition-shadow">
            <CardContent className="p-6 flex items-center gap-4">
              <Bot className="h-6 w-6" />
              <div>
                <h3 className="font-semibold">Agents</h3>
                <p className="text-sm text-muted-foreground">AI agents for provider workflows</p>
              </div>
            </CardContent>
          </Card>
          <Card onClick={() => navigate('/testing')} className="cursor-pointer hover:shadow-sm transition-shadow">
            <CardContent className="p-6 flex items-center gap-4">
              <TestTube className="h-6 w-6" />
              <div>
                <h3 className="font-semibold">Testing Suite</h3>
                <p className="text-sm text-muted-foreground">Provider-specific validation tools</p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Development Tools</h3>
              <Button 
                onClick={() => navigate('/research')}
                className="mr-4"
              >
                🔍 Research NPM Packages with Claude AI
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Use Claude AI to find correct package names for Model Context Protocol and other dependencies
              </p>
            </CardContent>
          </Card>
          
          <DashboardManagementTable />
        </div>
      )}
    </AppLayout>
  );
};

export default Index;
