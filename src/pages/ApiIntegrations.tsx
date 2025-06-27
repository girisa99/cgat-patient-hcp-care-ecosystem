
import React from 'react';
import StandardizedDashboardLayout from '@/components/layout/StandardizedDashboardLayout';
import ApiIntegrationsManager from '@/components/admin/ApiIntegrations/ApiIntegrationsManager';
import { PageHeader } from '@/components/shared/PageHeader';
import { Zap } from 'lucide-react';

const ApiIntegrations = () => {
  return (
    <StandardizedDashboardLayout>
      <PageHeader
        title="API Integrations"
        description="Manage internal APIs, external integrations, and developer tools"
        icon={<Zap className="h-8 w-8 text-blue-600" />}
      />
      <ApiIntegrationsManager />
    </StandardizedDashboardLayout>
  );
};

export default ApiIntegrations;
