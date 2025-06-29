
import React, { useState } from 'react';
import { useApiIntegrations } from '@/hooks/useApiIntegrations.tsx';
import { useEnhancedExternalApis } from '@/hooks/useEnhancedExternalApis';
import IntegrationDetailView from './IntegrationDetailView';
import { LoadingState } from '../shared/LoadingState';
import { ErrorState } from '../shared/ErrorState';
import { ApiIntegrationsStats } from './ApiIntegrationsStats';
import { ApiIntegrationsTabs } from './ApiIntegrationsTabs';

const ApiIntegrationsManager = () => {
  const { 
    integrations, 
    isLoading, 
    error, 
    selectedIntegration, 
    setSelectedIntegration,
    internalApis,
    externalApis,
    downloadPostmanCollection,
    testEndpoint
  } = useApiIntegrations();
  
  const { externalApis: publishedApis, isLoading: isLoadingPublished } = useEnhancedExternalApis();
  const [activeTab, setActiveTab] = useState('overview');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleDownloadCollection = (integrationId: string) => {
    downloadPostmanCollection(integrationId);
  };

  const handleViewDetails = (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
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

  const handleTestEndpoint = async (endpointId: string) => {
    try {
      await testEndpoint(endpointId);
    } catch (error) {
      console.error('Error testing endpoint:', error);
    }
  };

  if (isLoading || isLoadingPublished) {
    return <LoadingState message="Loading API integrations..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (selectedIntegration) {
    return (
      <IntegrationDetailView
        integration={selectedIntegration}
        onBack={() => setSelectedIntegration(null)}
        onTestEndpoint={handleTestEndpoint}
      />
    );
  }

  return (
    <div className="space-y-6">
      <ApiIntegrationsStats
        totalIntegrations={integrations.length}
        internalApis={internalApis.length}
        externalApis={externalApis.length}
        publishedApis={publishedApis.length}
      />

      <ApiIntegrationsTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        integrations={integrations}
        internalApis={internalApis}
        externalApis={externalApis}
        publishedApis={publishedApis}
        createDialogOpen={createDialogOpen}
        setCreateDialogOpen={setCreateDialogOpen}
        onDownloadCollection={handleDownloadCollection}
        onViewDetails={handleViewDetails}
        onViewDocumentation={handleViewDocumentation}
        onCopyUrl={handleCopyUrl}
        onTestEndpoint={handleTestEndpoint}
      />
    </div>
  );
};

export default ApiIntegrationsManager;
