
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import UnifiedDashboard from '@/components/dashboard/UnifiedDashboard';
import { useUnifiedUserManagement } from '@/hooks/useUnifiedUserManagement';
import { Card, CardContent } from '@/components/ui/card';

const Dashboard = () => {
  const { users, isLoading, error, meta } = useUnifiedUserManagement();

  if (isLoading) {
    return (
      <MainLayout>
        <PageContainer title="Dashboard" subtitle="Loading system overview...">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading dashboard data...</p>
            </CardContent>
          </Card>
        </PageContainer>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <PageContainer title="Dashboard" subtitle="Error loading dashboard">
          <Card>
            <CardContent className="p-8 text-center text-red-600">
              <p>Error loading dashboard: {error.message}</p>
            </CardContent>
          </Card>
        </PageContainer>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageContainer
        title="Dashboard"
        subtitle={`Welcome back! Here's your system overview.`}
        fluid
      >
        <UnifiedDashboard />
      </PageContainer>
    </MainLayout>
  );
};

export default Dashboard;
