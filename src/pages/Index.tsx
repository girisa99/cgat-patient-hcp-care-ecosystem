
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { ValidationDashboard } from '@/components/validation/ValidationDashboard';

const Index = () => {
  console.log('🏠 Dashboard: Loading single source validation system');

  return (
    <MainLayout>
      <PageContainer
        title="Healthcare Admin Dashboard"
        subtitle="Single source of truth validation and system overview"
        fluid
      >
        <ValidationDashboard />
      </PageContainer>
    </MainLayout>
  );
};

export default Index;
