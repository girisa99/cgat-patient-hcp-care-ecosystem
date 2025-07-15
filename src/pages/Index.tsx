
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { Card, CardContent } from '@/components/ui/card';
import { DashboardManagementTable } from '@/components/dashboard/DashboardManagementTable';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Index: React.FC = () => {
  console.log('🏠 Dashboard/Index page - Using existing working components and relationships');
  
  const { hasAccess, currentRole } = useRoleBasedNavigation();
  const navigate = useNavigate();
  
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
    <AppLayout title="Healthcare Management Dashboard">
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
    </AppLayout>
  );
};

export default Index;
