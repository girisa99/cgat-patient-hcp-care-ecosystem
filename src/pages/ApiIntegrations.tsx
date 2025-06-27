
import React from 'react';
import UnifiedDashboardLayout from '@/components/layout/UnifiedDashboardLayout';
import { PageContent } from '@/components/layout/PageContent';
import ApiIntegrationsManager from '@/components/admin/ApiIntegrations/ApiIntegrationsManager';

const ApiIntegrations = () => {
  return (
    <UnifiedDashboardLayout>
      <PageContent
        title="API Integrations"
        subtitle="Manage internal APIs, external integrations, and developer tools"
        maxWidth="full"
        padding="md"
      >
        <ApiIntegrationsManager />
      </PageContent>
    </UnifiedDashboardLayout>
  );
};

export default ApiIntegrations;
