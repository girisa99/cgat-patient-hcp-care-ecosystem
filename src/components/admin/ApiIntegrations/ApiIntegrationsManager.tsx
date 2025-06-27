
import React, { useState } from 'react';
import { Tabs } from '@/components/ui/tabs';
import { useApiIntegrations } from '@/hooks/useApiIntegrations.tsx';
import { useEnhancedExternalApis } from '@/hooks/useEnhancedExternalApis';
import IntegrationDetailView from './IntegrationDetailView';
import { LoadingState } from '../shared/LoadingState';
import { ErrorState } from '../shared/ErrorState';
import { ApiIntegrationsStats } from './ApiIntegrationsStats';
import { ApiIntegrationsTabs } from './ApiIntegrationsTabs';
import { OverviewTabContent } from './tabs/OverviewTabContent';
import { InternalApisTabContent } from './tabs/InternalApisTabContent';
import { ExternalApisTabContent } from './tabs/ExternalApisTabContent';
import { PublishedApisTabContent } from './tabs/PublishedApisTabContent';
import { DeveloperTabContent } from './tabs/DeveloperTabContent';
import { ApiKeysTabContent } from './tabs/ApiKeysTabContent';
import { TestingTabContent } from './tabs/TestingTabContent';

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

  // Helper functions for endpoint lists
  const handleDownloadCollection = (integrationId: string) => {
    downloadPostmanCollection(integrationId);
  };

  const handleViewDetails = (integrationId: string) => {
    setSelectedIntegration(integrationId);
  };

  const handleViewDocumentation = (integrationId: string) => {
    console.log('View documentation for:', integrationId);
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  if (isLoading) return <LoadingState title="API Management" description="Loading API integrations..." />;
  if (error) return <ErrorState title="API Management" error={error} />;

  if (selectedIntegration) {
    return (
      <IntegrationDetailView 
        integrationId={selectedIntegration}
        onBack={() => setSelectedIntegration(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <ApiIntegrationsStats
        integrations={integrations || []}
        internalApis={internalApis || []}
        externalApis={externalApis || []}
        publishedApis={publishedApis || []}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <ApiIntegrationsTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <OverviewTabContent />

        <InternalApisTabContent
          internalApis={internalApis || []}
          searchTerm={searchTerm}
          createDialogOpen={createDialogOpen}
          setCreateDialogOpen={setCreateDialogOpen}
          onDownloadCollection={handleDownloadCollection}
          onViewDetails={handleViewDetails}
          onViewDocumentation={handleViewDocumentation}
          onCopyUrl={handleCopyUrl}
        />

        <ExternalApisTabContent
          externalApis={externalApis || []}
          searchTerm={searchTerm}
          createDialogOpen={createDialogOpen}
          setCreateDialogOpen={setCreateDialogOpen}
          onDownloadCollection={handleDownloadCollection}
          onViewDetails={handleViewDetails}
          onViewDocumentation={handleViewDocumentation}
          onCopyUrl={handleCopyUrl}
        />

        <PublishedApisTabContent />

        <DeveloperTabContent />

        <ApiKeysTabContent />

        <TestingTabContent
          integrations={integrations || []}
          onClose={() => setActiveTab('overview')}
        />
      </Tabs>
    </div>
  );
};

export default ApiIntegrationsManager;
