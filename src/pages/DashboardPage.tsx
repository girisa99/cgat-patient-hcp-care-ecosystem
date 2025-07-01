
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import UnifiedDashboard from '@/components/dashboard/UnifiedDashboard';

const DashboardPage: React.FC = () => {
  console.log('📊 DashboardPage: Rendering with unified dashboard');

  return (
    <MainLayout>
      <PageContainer
        title="Healthcare Management Dashboard"
        subtitle="Unified system overview with consolidated data sources"
        fluid
      >
        <UnifiedDashboard />
      </PageContainer>
    </MainLayout>
  );
};

export default DashboardPage;
