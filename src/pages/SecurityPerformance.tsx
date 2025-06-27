
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import SecurityDashboard from '@/components/security/SecurityDashboard';

const SecurityPerformance = () => {
  return (
    <MainLayout>
      <PageContainer
        title="Security & Performance Center"
        subtitle="Monitor system security, performance metrics, and compliance status"
      >
        <SecurityDashboard />
      </PageContainer>
    </MainLayout>
  );
};

export default SecurityPerformance;
