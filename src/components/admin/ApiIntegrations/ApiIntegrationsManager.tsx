
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section - Left Aligned */}
        <div className="mb-8 text-left">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">API Management</h1>
          <p className="text-lg text-gray-600 mb-4">
            Manage your APIs, integrations, and access keys
          </p>
          <div className="flex gap-2">
            <Badge variant="outline">{integrations?.length || 0} Total</Badge>
            <Badge variant="default">{internalApis?.length || 0} Internal</Badge>
            <Badge variant="secondary">{externalApis?.length || 0} External</Badge>
            <Badge variant="outline">{publishedApis?.length || 0} Published</Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="internal">Internal APIs</TabsTrigger>
            <TabsTrigger value="external">External APIs</TabsTrigger>
            <TabsTrigger value="published">Published APIs</TabsTrigger>
            <TabsTrigger value="keys">API Keys</TabsTrigger>
            <TabsTrigger value="testing">Testing</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <ApiOverviewDashboard />
          </TabsContent>

          <TabsContent value="internal" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Internal APIs</CardTitle>
                  <CreateIntegrationDialog 
                    open={createDialogOpen}
                    onOpenChange={setCreateDialogOpen}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  APIs developed and managed internally ({internalApis?.length || 0} total).
                </p>
              </CardHeader>
              <CardContent>
                <InternalApiEndpointsList 
                  apis={internalApis || []} 
                  searchTerm={searchTerm}
                  onDownloadCollection={handleDownloadCollection}
                  onViewDetails={handleViewDetails}
                  onViewDocumentation={handleViewDocumentation}
                  onCopyUrl={handleCopyUrl}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="external" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>External APIs</CardTitle>
                  <CreateIntegrationDialog 
                    open={createDialogOpen}
                    onOpenChange={setCreateDialogOpen}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  APIs from external sources ({externalApis?.length || 0} total).
                </p>
              </CardHeader>
              <CardContent>
                <ExternalApiEndpointsList 
                  apis={externalApis || []}
                  searchTerm={searchTerm}
                  onDownloadCollection={handleDownloadCollection}
                  onViewDetails={handleViewDetails}
                  onViewDocumentation={handleViewDocumentation}
                  onCopyUrl={handleCopyUrl}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="published" className="space-y-6">
            <PublishedApisSection />
            <ExternalApiPublisher />
          </TabsContent>

          <TabsContent value="keys" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Key Management</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Manage your API keys and access tokens
                </p>
              </CardHeader>
              <CardContent>
                <ApiKeyManager />
                <div className="mt-6">
                  <ApiKeyIntegrationMonitor />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="testing" className="space-y-6">
            <ApiTestingInterface 
              integration={integrations?.[0]} 
              onClose={() => setActiveTab('overview')}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ApiIntegrationsManager;
