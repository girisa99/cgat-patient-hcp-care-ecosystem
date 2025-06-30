
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Server, 
  Globe, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Code, 
  Users, 
  Database,
  ExternalLink,
  Upload
} from 'lucide-react';
import { useApiIntegrations } from '@/hooks/useApiIntegrations';
import { useExternalApis } from '@/hooks/useExternalApis';
import { useEnhancedExternalApis } from '@/hooks/useEnhancedExternalApis';
import { InternalApisTabContent } from '../ApiIntegrations/tabs/InternalApisTabContent';
import { ExternalApisTabContent } from '../ApiIntegrations/tabs/ExternalApisTabContent';
import { PublishedApisTabContent } from '../ApiIntegrations/tabs/PublishedApisTabContent';
import { DeveloperTabContent } from '../ApiIntegrations/tabs/DeveloperTabContent';
import { ApiKeysTabContent } from '../ApiIntegrations/tabs/ApiKeysTabContent';
import { TestingTabContent } from '../ApiIntegrations/tabs/TestingTabContent';
import { DataImportModule } from '../DataImportModule';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export const ApiServicesModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { 
    integrations, 
    isLoading, 
    error, 
    internalApis,
    externalApis,
    downloadPostmanCollection,
    testEndpoint
  } = useApiIntegrations();
  
  const { 
    externalApis: publishedApis, 
    marketplaceStats,
    isLoadingExternalApis 
  } = useExternalApis();

  const { 
    externalApis: enhancedPublishedApis 
  } = useEnhancedExternalApis();

  const handleDownloadCollection = (integrationId: string) => {
    if (downloadPostmanCollection) {
      downloadPostmanCollection(integrationId);
    }
  };

  const handleViewDetails = (integrationId: string) => {
    console.log('View details for:', integrationId);
  };

  const handleViewDocumentation = (integrationId: string) => {
    console.log('View documentation for:', integrationId);
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

  const OverviewStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Server className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{internalApis?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Internal APIs</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-green-500">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <ArrowDownCircle className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{externalApis?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Consuming APIs</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-purple-500">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <ArrowUpCircle className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold">{publishedApis?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Published APIs</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-orange-500">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Users className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">{marketplaceStats?.approvedApplications || 0}</p>
              <p className="text-sm text-muted-foreground">Developer Apps</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const OverviewContent = () => (
    <div className="space-y-6">
      <OverviewStats />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-blue-500" />
              Internal API Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Manage and monitor your internal APIs, endpoints, and configurations.
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{internalApis?.length || 0} APIs</Badge>
              <Badge variant="outline">Active</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-green-500" />
              External API Consumption
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Integrate with third-party APIs and manage external dependencies.
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{externalApis?.length || 0} Integrations</Badge>
              <Badge variant="outline">Active</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpCircle className="h-5 w-5 text-purple-500" />
              API Publishing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Publish your internal APIs for external consumption and developer access.
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{publishedApis?.length || 0} Published</Badge>
              <Badge variant="outline">Marketplace</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-orange-500" />
              Developer Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              API keys, testing tools, documentation, and developer portal management.
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Testing Suite</Badge>
              <Badge variant="outline">Documentation</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (isLoading || isLoadingExternalApis) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading API services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">API Services</h1>
          <p className="text-muted-foreground">
            Comprehensive API management platform for internal APIs, external integrations, publishing, and developer tools
          </p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search APIs and services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="internal">Internal APIs</TabsTrigger>
          <TabsTrigger value="consuming">Consuming</TabsTrigger>
          <TabsTrigger value="publishing">Publishing</TabsTrigger>
          <TabsTrigger value="developer">Developer</TabsTrigger>
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="data-import">Data Import</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <OverviewContent />
        </TabsContent>

        <TabsContent value="internal" className="mt-4">
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
        </TabsContent>

        <TabsContent value="consuming" className="mt-4">
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
        </TabsContent>

        <TabsContent value="publishing" className="mt-4">
          <PublishedApisTabContent 
            publishedApis={enhancedPublishedApis || publishedApis || []}
            searchTerm={searchTerm}
          />
        </TabsContent>

        <TabsContent value="developer" className="mt-4">
          <DeveloperTabContent />
        </TabsContent>

        <TabsContent value="keys" className="mt-4">
          <ApiKeysTabContent />
        </TabsContent>

        <TabsContent value="testing" className="mt-4">
          <TestingTabContent
            integrations={integrations || []}
            onClose={() => {}}
            onTestEndpoint={handleTestEndpoint}
          />
        </TabsContent>

        <TabsContent value="data-import" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Data Import & API Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataImportModule />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
