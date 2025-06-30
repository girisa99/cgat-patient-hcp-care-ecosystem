
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { SecurityDashboard } from '@/components/security/SecurityDashboard';

const SecurityPage: React.FC = () => {
  return (
    <MainLayout>
      <PageContainer
        title="Security"
        subtitle="Monitor system security and compliance"
      >
        <SecurityDashboard />
      </PageContainer>
    </MainLayout>
  );
};

export default SecurityPage;
