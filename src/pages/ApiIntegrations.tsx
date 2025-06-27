
import React from 'react';
import StandardizedDashboardLayout from '@/components/layout/StandardizedDashboardLayout';
import ApiIntegrationsManager from '@/components/admin/ApiIntegrations/ApiIntegrationsManager';

const ApiIntegrations = () => {
  return (
    <StandardizedDashboardLayout
      pageTitle="API Integrations"
      pageSubtitle="Manage internal APIs, external integrations, and developer tools"
      showPageHeader={true}
    >
      <ApiIntegrationsManager />
    </StandardizedDashboardLayout>
  );
};

export default ApiIntegrations;
