
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Server, 
  Globe, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Database,
  Search,
  Shield,
  GitBranch,
  FileText,
  Plus,
  Settings
} from 'lucide-react';

// Use consolidated hook with real data
import { useApiServices } from '@/hooks/useApiServices';

// Import tab components
import { InternalApisTabContent } from '@/components/admin/ApiIntegrations/tabs/InternalApisTabContent';
import { ExternalApisTabContent } from '@/components/admin/ApiIntegrations/tabs/ExternalApisTabContent';
import { PublishedApisTabContent } from '@/components/admin/ApiIntegrations/tabs/PublishedApisTabContent';
import { DeveloperTabContent } from '@/components/admin/ApiIntegrations/tabs/DeveloperTabContent';
import { ApiKeysTabContent } from '@/components/admin/ApiIntegrations/tabs/ApiKeysTabContent';
import { TestingTabContent } from '@/components/admin/ApiIntegrations/tabs/TestingTabContent';
import { OnboardingIntegrationTabContent } from '@/components/admin/ApiIntegrations/tabs/OnboardingIntegrationTabContent';
import AutoIntegrationBanner from '../ApiIntegrations/AutoIntegrationBanner';

export const ApiServicesModule: React.FC = () => {
  console.log('🚀 ApiServicesModule: Using consolidated real data source');
  
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Use consolidated hook with real data
  const { 
    apiServices,
    internalApis,
    externalApis,
    consumingApis,
    publishingApis,
    isLoading, 
    error, 
    getApiServiceStats,
    createApiService,
    updateApiService,
    deleteApiService,
    isCreatingApiService
  } = useApiServices();

  console.log('📊 ApiServicesModule: Real data stats:', {
    total: apiServices?.length || 0,
    internal: internalApis?.length || 0,
    external: externalApis?.length || 0,
    consuming: consumingApis?.length || 0,
    publishing: publishingApis?.length || 0,
    isLoading,
    error: error?.message
  });

  const stats = getApiServiceStats();

  const handleDownloadCollection = (integrationId: string) => {
    console.log('📥 Download collection for:', integrationId);
    const integration = apiServices.find(api => api.id === integrationId);
    if (integration) {
      // Generate and download Postman collection using real data
      const collection = {
        info: {
          name: integration.name,
          description: integration.description || 'API Collection',
          schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
        },
        item: [{
          name: integration.name,
          request: {
            method: 'GET',
            header: [],
            url: integration.base_url || `${window.location.origin}/api/v1/${integration.id}`
          }
        }]
      };
      
      const blob = new Blob([JSON.stringify(collection, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${integration.name}-collection.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleViewDetails = (integrationId: string) => {
    console.log('👁️ View details for:', integrationId);
    const integration = apiServices.find(api => api.id === integrationId);
    if (integration) {
      console.log('Integration details:', integration);
    }
  };

  const handleViewDocumentation = (integrationId: string) => {
    console.log('📚 View documentation for:', integrationId);
    const integration = apiServices.find(api => api.id === integrationId);
    if (integration?.documentation_url) {
      window.open(integration.documentation_url, '_blank');
    }
  };

  const handleCopyUrl = (integrationId: string) => {
    const integration = apiServices.find(api => api.id === integrationId);
    const url = integration?.base_url || `${window.location.origin}/api/v1/${integrationId}`;
    navigator.clipboard.writeText(url);
    console.log('📋 URL copied:', url);
  };

  const handleTestEndpoint = async (integrationId: string, endpointId?: string) => {
    try {
      console.log('🧪 Testing endpoint:', { integrationId, endpointId });
      const integration = apiServices.find(api => api.id === integrationId);
      if (integration) {
        const testUrl = integration.base_url || `${window.location.origin}/api/v1/${integrationId}`;
        // Perform actual API test
        const response = await fetch(testUrl, { method: 'GET' });
        console.log('Test result:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Error testing endpoint:', error);
    }
  };

  const OverviewStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Server className="h-6 w-6 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{stats.internal}</p>
              <p className="text-sm text-muted-foreground">Internal APIs</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-green-500">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <ArrowDownCircle className="h-6 w-6 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{stats.consuming}</p>
              <p className="text-sm text-muted-foreground">Consuming APIs</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-purple-500">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6 text-purple-500" />
            <div>
              <p className="text-2xl font-bold">{stats.external}</p>
              <p className="text-sm text-muted-foreground">External APIs</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-orange-500">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">{stats.active}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-teal-500">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <GitBranch className="h-6 w-6 text-teal-500" />
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Services</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-indigo-500">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-indigo-500" />
            <div>
              <p className="text-2xl font-bold">{Object.keys(stats.typeBreakdown).length}</p>
              <p className="text-sm text-muted-foreground">Types</p>
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
              Manage and monitor your internal APIs, endpoints, and configurations for treatment centers and healthcare facilities.
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{stats.internal} APIs</Badge>
              <Badge variant="outline">Healthcare Ready</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-green-500" />
              External API Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Integrate with third-party APIs including EHR systems, pharmacy networks, and financial verification services.
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{stats.external} Integrations</Badge>
              <Badge variant="outline">HIPAA Compliant</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Real-time API Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.categoryBreakdown).map(([category, count]) => (
              <div key={category} className="text-center">
                <p className="text-2xl font-bold text-blue-600">{count}</p>
                <p className="text-sm text-muted-foreground capitalize">{category}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading API services from database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Database className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Error loading API services: {error.message}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Healthcare API Services Platform</h1>
          <p className="text-muted-foreground">
            Comprehensive API management with real data from {stats.total} registered services
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search APIs and healthcare services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            onClick={() => setCreateDialogOpen(true)}
            disabled={isCreatingApiService}
          >
            <Plus className="h-4 w-4 mr-2" />
            New API
          </Button>
        </div>
      </div>

      <AutoIntegrationBanner />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="internal">Internal APIs</TabsTrigger>
          <TabsTrigger value="consuming">Consuming</TabsTrigger>
          <TabsTrigger value="publishing">Publishing</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="developer">Developer</TabsTrigger>
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <OverviewContent />
        </TabsContent>

        <TabsContent value="internal" className="mt-4">
          <InternalApisTabContent
            internalApis={internalApis}
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
            externalApis={consumingApis}
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
            publishedApis={publishingApis}
            searchTerm={searchTerm}
          />
        </TabsContent>

        <TabsContent value="onboarding" className="mt-4">
          <OnboardingIntegrationTabContent />
        </TabsContent>

        <TabsContent value="developer" className="mt-4">
          <DeveloperTabContent />
        </TabsContent>

        <TabsContent value="keys" className="mt-4">
          <ApiKeysTabContent />
        </TabsContent>

        <TabsContent value="testing" className="mt-4">
          <TestingTabContent
            integrations={apiServices}
            onClose={() => {}}
            onTestEndpoint={handleTestEndpoint}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
