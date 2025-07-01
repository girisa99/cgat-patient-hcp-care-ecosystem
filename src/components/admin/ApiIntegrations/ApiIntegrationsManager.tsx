
import React, { useState, useMemo } from 'react';
import { useApiServicesPage } from '@/hooks/useApiServicesPage';
import { useToast } from '@/hooks/use-toast';
import { PageContainer } from '@/components/layout/PageContainer';
import { SearchInput } from '@/components/ui/search-input';
import { ApiIntegrationsTabs } from './ApiIntegrationsTabs';

/**
 * API Integrations Manager - LOCKED IMPLEMENTATION
 * This component is locked to prevent changes that break other parts of the application
 * Uses dedicated useApiServicesPage hook for consistent data access
 */
const ApiIntegrationsManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  // Use the locked hook for consistent data access
  const { 
    integrations,
    consolidatedApiData,
    isLoading,
    generatePostmanCollection,
    meta
  } = useApiServicesPage();

  console.log('🔒 ApiIntegrationsManager - LOCKED VERSION active with data:', {
    integrationsCount: integrations.length,
    consolidatedCount: consolidatedApiData.consolidatedApis.length,
    implementationLocked: meta.implementationLocked
  });

  // Filter consolidated data for different categories - LOCKED LOGIC
  const { internalApis, externalApis, publishedApis } = useMemo(() => {
    const consolidatedApis = consolidatedApiData.consolidatedApis;
    
    const internal = consolidatedApis.filter(api => 
      api.type === 'internal' || api.direction === 'inbound'
    );
    
    const external = consolidatedApis.filter(api => 
      api.type === 'external' || api.direction === 'outbound' || api.direction === 'bidirectional'
    );
    
    const published = consolidatedApis.filter(api => 
      api.status === 'published' || api.lifecycle_stage === 'production'
    );

    return { internalApis: internal, externalApis: external, publishedApis: published };
  }, [consolidatedApiData.consolidatedApis]);

  // Filter by search term - LOCKED LOGIC
  const filteredIntegrations = useMemo(() => {
    if (!searchTerm.trim()) return consolidatedApiData.consolidatedApis;
    
    return consolidatedApiData.consolidatedApis.filter(api => 
      api.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      api.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      api.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [consolidatedApiData.consolidatedApis, searchTerm]);

  // Action handlers - LOCKED IMPLEMENTATIONS
  const handleDownloadCollection = async (integrationId: string) => {
    try {
      const collection = generatePostmanCollection(integrationId, consolidatedApiData.consolidatedApis);
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
    const api = consolidatedApiData.consolidatedApis.find(a => a.id === integrationId);
    console.log('👁️ Viewing details for API:', api?.name);
    toast({
      title: "API Details",
      description: `Viewing details for ${api?.name || 'API'}`,
    });
  };

  const handleViewDocumentation = (integrationId: string) => {
    const api = consolidatedApiData.consolidatedApis.find(a => a.id === integrationId);
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
    const api = consolidatedApiData.consolidatedApis.find(a => a.id === integrationId);
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
      subtitle={`Comprehensive API management with ${consolidatedApiData.consolidatedApis.length} integrated services`}
    >
      <div className="space-y-6">
        {/* LOCKED STATUS INDICATOR */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <h3 className="font-semibold text-green-900">🔒 Implementation Locked & Stable</h3>
          </div>
          <p className="text-sm text-green-700">
            Data synchronized from {consolidatedApiData.syncStatus?.internalCount || 0} internal APIs, 
            {consolidatedApiData.syncStatus?.externalCount || 0} external APIs, 
            with {consolidatedApiData.syncStatus?.endpointsCount || 0} total endpoints
          </p>
          <p className="text-xs text-green-600 mt-1">
            Hook Version: {meta.hookVersion} | Single Source Validated: {meta.singleSourceValidated ? '✅' : '❌'}
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
            {filteredIntegrations.length} of {consolidatedApiData.consolidatedApis.length} APIs
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
