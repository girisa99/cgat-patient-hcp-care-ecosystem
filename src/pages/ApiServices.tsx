
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import ApiIntegrationsManager from '@/components/admin/ApiIntegrations/ApiIntegrationsManager';

const ApiServices: React.FC = () => {
  return (
    <MainLayout>
      <PageContainer
        title="API Services"
        subtitle="Comprehensive API management, development tools, and integration workflows"
        fluid
      >
        <ApiIntegrationsManager />
      </PageContainer>
    </MainLayout>
  );
};

export default ApiServices;
