
import React from 'react';
import StandardizedDashboardLayout from '@/components/layout/StandardizedDashboardLayout';
import ApiIntegrationsManager from '@/components/admin/ApiIntegrations/ApiIntegrationsManager';

const ApiIntegrations = () => {
  return (
    <StandardizedDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Integrations</h1>
          <p className="text-muted-foreground">
            Manage internal APIs, external integrations, and developer tools
          </p>
        </div>
        
        <ApiIntegrationsManager />
      </div>
    </StandardizedDashboardLayout>
  );
};

export default ApiIntegrations;
