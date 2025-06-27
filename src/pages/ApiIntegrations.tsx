
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import ApiIntegrationsManager from '@/components/admin/ApiIntegrations/ApiIntegrationsManager';

const ApiIntegrations = () => {
  return (
    <MainLayout>
      <PageContainer
        title="API Integrations"
        subtitle="Manage internal APIs, external integrations, and developer tools"
        fluid
      >
        <div className="p-6">
          <ApiIntegrationsManager />
        </div>
      </PageContainer>
    </MainLayout>
  );
};

export default ApiIntegrations;
