
import React, { useState } from 'react';
import { useApiIntegrations } from '@/hooks/useApiIntegrations';
import { useEnhancedExternalApis } from '@/hooks/useEnhancedExternalApis';
import IntegrationDetailView from './IntegrationDetailView';
import { LoadingState } from '../shared/LoadingState';
import { ErrorState } from '../shared/ErrorState';
import { ApiIntegrationsStats } from './ApiIntegrationsStats';
import { ApiIntegrationsTabs } from './ApiIntegrationsTabs';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ApiIntegration } from '@/utils/api/ApiIntegrationTypes';

const ApiIntegrationsManager = () => {
  const { 
    integrations, 
    isLoading, 
    error, 
    internalApis,
    externalApis,
    downloadPostmanCollection,
    testEndpoint
  } = useApiIntegrations();
  
  const { externalApis: publishedApis, isLoading: isLoadingPublished } = useEnhancedExternalApis();
  const [activeTab, setActiveTab] = useState('overview');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIntegration, setSelectedIntegration] = useState<ApiIntegration | null>(null);

  const handleDownloadCollection = (integrationId: string) => {
    if (downloadPostmanCollection) {
      downloadPostmanCollection(integrationId);
    }
  };

  const handleViewDetails = (integrationId: string) => {
    const integration = integrations?.find(i => i.id === integrationId);
    if (integration) {
      setSelectedIntegration(integration);
    }
  };

  const handleViewDocumentation = (integrationId: string) => {
    console.log('Opening documentation for integration:', integrationId);
    // Implementation would open documentation in new tab
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  const handleTestEndpoint = async (integrationId: string, endpointId: string) => {
    try {
      if (testEndpoint) {
        await testEndpoint(integrationId, endpointId);
      }
    } catch (error) {
      console.error('Error testing endpoint:', error);
    }
  };

  if (isLoading || isLoadingPublished) {
    return <LoadingState title="API Integrations" description="Loading API integrations..." />;
  }

  if (error) {
    return <ErrorState title="API Integrations" error={{ message: typeof error === 'string' ? error : error.message }} />;
  }

  if (selectedIntegration) {
    return (
      <IntegrationDetailView
        integrationId={selectedIntegration.id}
        onBack={() => setSelectedIntegration(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">API Integrations</h1>
          <p className="text-muted-foreground">Manage internal APIs, external integrations, and developer tools</p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search integrations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <ApiIntegrationsStats
        totalIntegrations={integrations?.length || 0}
        internalApis={internalApis?.length || 0}
        externalApis={externalApis?.length || 0}
        publishedApis={publishedApis?.length || 0}
      />

      <ApiIntegrationsTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchTerm={searchTerm}
        integrations={integrations || []}
        internalApis={internalApis || []}
        externalApis={externalApis || []}
        publishedApis={publishedApis || []}
        createDialogOpen={createDialogOpen}
        onCreateDialogChange={setCreateDialogOpen}
        onDownloadCollection={handleDownloadCollection}
        onViewDetails={handleViewDetails}
        onViewDocumentation={handleViewDocumentation}
        onCopyUrl={handleCopyUrl}
        onTestEndpoint={handleTestEndpoint}
        onClose={() => setSelectedIntegration(null)}
      />
    </div>
  );
};

export default ApiIntegrationsManager;
