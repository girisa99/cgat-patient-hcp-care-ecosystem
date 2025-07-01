
import React, { useState, useMemo } from 'react';
import { useApiServices } from '@/hooks/useApiServices';
import { useApiServiceDetails } from '@/hooks/useApiServiceDetails';
import { useToast } from '@/hooks/use-toast';
import { PageContainer } from '@/components/layout/PageContainer';
import { SearchInput } from '@/components/ui/search-input';
import { ApiIntegrationsTabs } from './ApiIntegrationsTabs';

const ApiIntegrationsManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  // Get data from both hooks for single source of truth
  const { apiServices, isLoading: isLoadingServices } = useApiServices();
  const { 
    consolidatedApiData, 
    isLoading: isLoadingDetails,
    generatePostmanCollection
  } = useApiServiceDetails();

  console.log('🔍 ApiIntegrationsManager: Single source of truth data:', {
    apiServicesCount: apiServices.length,
    consolidatedCount: consolidatedApiData.consolidatedApis.length,
    syncStatus: consolidatedApiData.syncStatus
  });

  // Use consolidated data as the single source of truth
  const consolidatedApis = consolidatedApiData.consolidatedApis;
  const isLoading = isLoadingServices || isLoadingDetails;

  // Filter consolidated data for different categories
  const { internalApis, externalApis, publishedApis } = useMemo(() => {
    const internal = consolidatedApis.filter(api => 
      api.type === 'internal' || api.direction === 'inbound'
    );
    
    const external = consolidatedApis.filter(api => 
      api.type === 'external' || api.direction === 'outbound' || api.direction === 'bidirectional'
    );
    
    const published = consolidatedApis.filter(api => 
      api.status === 'published' || api.lifecycle_stage === 'production'
    );

    console.log('📊 Filtered API categories:', {
      internal: internal.length,
      external: external.length,
      published: published.length
    });

    return { internalApis: internal, externalApis: external, publishedApis: published };
  }, [consolidatedApis]);

  // Filter by search term
  const filteredIntegrations = useMemo(() => {
    if (!searchTerm.trim()) return consolidatedApis;
    
    return consolidatedApis.filter(api => 
      api.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      api.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      api.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      api.purpose?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [consolidatedApis, searchTerm]);

  // Action handlers
  const handleDownloadCollection = async (integrationId: string) => {
    try {
      const collection = generatePostmanCollection(integrationId, consolidatedApis);
      if (collection) {
        const blob = new Blob([JSON.stringify(collection, null, 2)], {
          type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${collection.info.name.replace(/\s+/g, '-')}.postman_collection.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Collection Downloaded",
          description: "Postman collection has been downloaded successfully.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download collection.",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (integrationId: string) => {
    const api = consolidatedApis.find(a => a.id === integrationId);
    console.log('👁️ Viewing details for API:', api?.name);
    toast({
      title: "API Details",
      description: `Viewing details for ${api?.name || 'API'}`,
    });
  };

  const handleViewDocumentation = (integrationId: string) => {
    const api = consolidatedApis.find(a => a.id === integrationId);
    if (api?.documentation_url) {
      window.open(api.documentation_url, '_blank');
    } else {
      toast({
        title: "No Documentation",
        description: "Documentation is not available for this API.",
        variant: "destructive",
      });
    }
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "URL Copied",
        description: "API URL has been copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy URL to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleTestEndpoint = async (integrationId: string, endpointId?: string) => {
    const api = consolidatedApis.find(a => a.id === integrationId);
    console.log('🧪 Testing endpoint for API:', api?.name, 'Endpoint:', endpointId);
    
    toast({
      title: "Endpoint Test",
      description: `Testing ${endpointId ? 'specific endpoint' : 'API'} for ${api?.name || 'API'}`,
    });
  };

  if (isLoading) {
    return (
      <PageContainer 
        title="API Services" 
        subtitle="Loading API integration data..."
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading consolidated API data...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer 
      title="API Services" 
      subtitle={`Comprehensive API management with ${consolidatedApis.length} integrated services`}
    >
      <div className="space-y-6">
        {/* Single Source of Truth Status */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <h3 className="font-semibold text-blue-900">Single Source of Truth Active</h3>
          </div>
          <p className="text-sm text-blue-700">
            Data synchronized from {consolidatedApiData.syncStatus?.internalCount || 0} internal APIs, 
            {consolidatedApiData.syncStatus?.externalCount || 0} external APIs, 
            with {consolidatedApiData.syncStatus?.endpointsCount || 0} total endpoints
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search APIs by name, category, or purpose..."
            className="max-w-sm"
          />
          <div className="text-sm text-muted-foreground">
            {filteredIntegrations.length} of {consolidatedApis.length} APIs
          </div>
        </div>

        {/* Tabs with Consolidated Data */}
        <ApiIntegrationsTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          searchTerm={searchTerm}
          integrations={filteredIntegrations}
          internalApis={internalApis}
          externalApis={externalApis}
          publishedApis={publishedApis}
          consolidatedData={consolidatedApiData}
          createDialogOpen={createDialogOpen}
          onCreateDialogChange={setCreateDialogOpen}
          onDownloadCollection={handleDownloadCollection}
          onViewDetails={handleViewDetails}
          onViewDocumentation={handleViewDocumentation}
          onCopyUrl={handleCopyUrl}
          onTestEndpoint={handleTestEndpoint}
        />
      </div>
    </PageContainer>
  );
};

export default ApiIntegrationsManager;
