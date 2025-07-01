
import React, { useState } from 'react';
import { useApiIntegrations } from '@/hooks/useApiIntegrations.tsx';
import { usePublishedApiIntegration } from '@/hooks/usePublishedApiIntegration';
import IntegrationDetailView from './IntegrationDetailView';
import { LoadingState } from '../shared/LoadingState';
import { ErrorState } from '../shared/ErrorState';
import { ApiIntegrationsStats } from './ApiIntegrationsStats';
import { ApiIntegrationsTabs } from './ApiIntegrationsTabs';
import { Input } from '@/components/ui/input';
import { Search, Settings, Code, Globe, Key, BarChart3, Zap } from 'lucide-react';
import { ApiIntegration } from '@/utils/api/ApiIntegrationTypes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
  
  const { publishedApisForDevelopers, isLoadingPublishedApis } = usePublishedApiIntegration();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIntegration, setSelectedIntegration] = useState<ApiIntegration | null>(null);

  console.log('🔍 API Services Manager State:', {
    integrations: integrations?.length || 0,
    internalApis: internalApis?.length || 0,
    externalApis: externalApis?.length || 0,
    publishedForDevelopers: publishedApisForDevelopers?.length || 0,
    activeTab,
    isLoading,
    isLoadingPublishedApis,
    error: error?.message
  });

  // Quick stats for the overview
  const quickStats = {
    totalIntegrations: integrations?.length || 0,
    internalApis: internalApis?.length || 0,
    externalApis: externalApis?.length || 0,
    publishedApis: publishedApisForDevelopers?.length || 0,
    developerApis: publishedApisForDevelopers?.length || 0,
    activeEndpoints: integrations?.reduce((sum, i) => sum + (i.endpoints?.length || 0), 0) || 0
  };

  const handleDownloadCollection = (integrationId: string) => {
    if (downloadPostmanCollection) {
      downloadPostmanCollection(integrationId);
    }
  };

  const handleViewDetails = (integrationId: string) => {
    const integration = integrations?.find(i => i.id === integrationId);
    if (integration) {
      const integrationWithDescription = {
        ...integration,
        description: integration.description || 'No description provided'
      };
      setSelectedIntegration(integrationWithDescription);
    }
  };

  const handleViewDocumentation = (integrationId: string) => {
    console.log('Opening documentation for integration:', integrationId);
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

  if (isLoading || isLoadingPublishedApis) {
    return <LoadingState title="API Services" description="Loading comprehensive API management tools..." />;
  }

  if (error) {
    return <ErrorState title="API Services" error={{ message: typeof error === 'string' ? error : error.message }} />;
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
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Services Hub</h1>
          <p className="text-muted-foreground mt-2">
            Complete API lifecycle management - from development to consumption
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search APIs, endpoints, documentation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Code className="h-4 w-4 mr-2 text-blue-500" />
              Total APIs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quickStats.totalIntegrations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Globe className="h-4 w-4 mr-2 text-green-500" />
              Internal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quickStats.internalApis}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Zap className="h-4 w-4 mr-2 text-orange-500" />
              External
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quickStats.externalApis}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Key className="h-4 w-4 mr-2 text-purple-500" />
              Published
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quickStats.publishedApis}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BarChart3 className="h-4 w-4 mr-2 text-red-500" />
              Developer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quickStats.developerApis}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Globe className="h-4 w-4 mr-2 text-indigo-500" />
              Endpoints
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quickStats.activeEndpoints}</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <ApiIntegrationsStats
        totalIntegrations={integrations?.length || 0}
        internalApis={internalApis?.length || 0}
        externalApis={externalApis?.length || 0}
        publishedApis={publishedApisForDevelopers?.length || 0}
      />

      {/* Main Tabs Interface */}
      <ApiIntegrationsTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchTerm={searchTerm}
        integrations={integrations || []}
        internalApis={internalApis || []}
        externalApis={externalApis || []}
        publishedApis={publishedApisForDevelopers || []}
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
