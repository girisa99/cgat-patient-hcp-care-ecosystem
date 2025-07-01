
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { ApiServicesModule } from '@/components/admin/ApiServices/ApiServicesModule';

const ApiServices: React.FC = () => {
  console.log('🚀 ApiServicesPage: Using consolidated real data architecture');

  return (
    <MainLayout>
      <PageContainer
        title="API Services"
        subtitle="Consolidated API integration management system"
        fluid
      >
        <ApiServicesModule />
      </PageContainer>
    </MainLayout>
  );
};

export default ApiServices;
