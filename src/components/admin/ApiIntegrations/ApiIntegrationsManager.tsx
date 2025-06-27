
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Grid, GridItem } from '@/components/ui/layout/Grid';
import { Section } from '@/components/ui/layout/Section';
import { useApiIntegrations } from '@/hooks/useApiIntegrations.tsx';
import { useEnhancedExternalApis } from '@/hooks/useEnhancedExternalApis';
import ApiKeyIntegrationMonitor from './ApiKeyIntegrationMonitor';
import ApiOverviewDashboard from './ApiOverviewDashboard';
import { InternalApiEndpointsList } from './InternalApiEndpointsList';
import { ExternalApiEndpointsList } from './ExternalApiEndpointsList';
import PublishedApisSection from './PublishedApisSection';
import { CreateIntegrationDialog } from './CreateIntegrationDialog';
import ExternalApiPublisher from './ExternalApiPublisher';
import ApiKeyManager from './ApiKeyManager';
import { ApiTestingInterface } from './ApiTestingInterface';
import IntegrationDetailView from './IntegrationDetailView';
import DeveloperPortal from './DeveloperPortal';
import { LoadingState } from '../shared/LoadingState';
import { ErrorState } from '../shared/ErrorState';

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
    // Navigate to documentation view
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

  const statsBadges = (
    <div className="flex gap-2 flex-wrap">
      <Badge variant="outline">{integrations?.length || 0} Total</Badge>
      <Badge variant="default">{internalApis?.length || 0} Internal</Badge>
      <Badge variant="secondary">{externalApis?.length || 0} External</Badge>
      <Badge variant="outline">{publishedApis?.length || 0} Published</Badge>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <Section>
        {statsBadges}
      </Section>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="internal">Internal APIs</TabsTrigger>
          <TabsTrigger value="external">External APIs</TabsTrigger>
          <TabsTrigger value="published">Published APIs</TabsTrigger>
          <TabsTrigger value="developer">Developer</TabsTrigger>
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ApiOverviewDashboard />
        </TabsContent>

        <TabsContent value="internal" className="space-y-6">
          <Section 
            variant="card" 
            title="Internal APIs" 
            subtitle={`APIs developed and managed internally (${internalApis?.length || 0} total).`}
            headerActions={
              <CreateIntegrationDialog 
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
              />
            }
          >
            <InternalApiEndpointsList 
              apis={internalApis || []} 
              searchTerm={searchTerm}
              onDownloadCollection={handleDownloadCollection}
              onViewDetails={handleViewDetails}
              onViewDocumentation={handleViewDocumentation}
              onCopyUrl={handleCopyUrl}
            />
          </Section>
        </TabsContent>

        <TabsContent value="external" className="space-y-6">
          <Section 
            variant="card" 
            title="External APIs" 
            subtitle={`APIs from external sources (${externalApis?.length || 0} total).`}
            headerActions={
              <CreateIntegrationDialog 
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
              />
            }
          >
            <ExternalApiEndpointsList 
              apis={externalApis || []}
              searchTerm={searchTerm}
              onDownloadCollection={handleDownloadCollection}
              onViewDetails={handleViewDetails}
              onViewDocumentation={handleViewDocumentation}
              onCopyUrl={handleCopyUrl}
            />
          </Section>
        </TabsContent>

        <TabsContent value="published" className="space-y-6">
          <Grid cols={12} gap="lg">
            <GridItem span={12}>
              <PublishedApisSection />
            </GridItem>
            <GridItem span={12}>
              <ExternalApiPublisher />
            </GridItem>
          </Grid>
        </TabsContent>

        <TabsContent value="developer" className="space-y-6">
          <DeveloperPortal />
        </TabsContent>

        <TabsContent value="keys" className="space-y-6">
          <Section 
            variant="card" 
            title="API Key Management" 
            subtitle="Manage your API keys and access tokens"
          >
            <div className="space-y-6">
              <ApiKeyManager />
              <ApiKeyIntegrationMonitor />
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <ApiTestingInterface 
            integration={integrations?.[0]} 
            onClose={() => setActiveTab('overview')}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiIntegrationsManager;
