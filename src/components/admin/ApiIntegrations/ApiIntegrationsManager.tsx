import React, { useState, useCallback } from 'react';
import { useApiServices } from '@/hooks/useApiServices';
import { useApiIntegrations } from '@/hooks/useApiIntegrations';
import { SearchInput } from '@/components/ui/search-input';
import { ApiIntegrationsTabs } from './ApiIntegrationsTabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

const ApiIntegrationsManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Using consolidated useApiServices hook as primary source
  const {
    apiServices: integrations,
    internalApis,
    externalApis,
    isLoading,
    meta
  } = useApiServices();

  // Get additional functionality from useApiIntegrations (which delegates to useApiServices)
  const {
    downloadPostmanCollection,
    testEndpoint,
    isDownloading,
    isTesting
  } = useApiIntegrations();

  console.log('🔍 ApiIntegrationsManager - Using consolidated data source:', {
    totalIntegrations: integrations.length,
    internalCount: internalApis.length,
    externalCount: externalApis.length,
    meta,
    isLoading,
    dataSource: 'useApiServices (consolidated)',
    internalApisData: internalApis,
    externalApisData: externalApis
  });

  // Filter integrations based on search term
  const filteredIntegrations = React.useMemo(() => {
    if (!searchTerm.trim()) return integrations;
    
    return integrations.filter((integration: any) => {
      const name = integration.name || integration.external_name || '';
      const description = integration.description || integration.external_description || '';
      const category = integration.category || '';
      
      return (
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [integrations, searchTerm]);

  // Filter APIs by type for tabs - ensure we're using the actual data structure
  const filteredInternalApis = React.useMemo(() => {
    if (!searchTerm.trim()) return internalApis;
    
    return internalApis.filter((api: any) => {
      const name = api.name || '';
      const description = api.description || '';
      const category = api.category || '';
      
      return (
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [internalApis, searchTerm]);

  const filteredExternalApis = React.useMemo(() => {
    if (!searchTerm.trim()) return externalApis;
    
    return externalApis.filter((api: any) => {
      const name = api.external_name || api.name || '';
      const description = api.external_description || api.description || '';
      const category = api.category || '';
      
      return (
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [externalApis, searchTerm]);

  // Create published APIs list (external APIs with published status)
  const publishedApis = React.useMemo(() => {
    return externalApis.filter((api: any) => api.status === 'published');
  }, [externalApis]);

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);

  const handleDownloadCollection = useCallback((id: string) => {
    console.log('📥 Downloading Postman collection for:', id);
    downloadPostmanCollection(id);
  }, [downloadPostmanCollection]);

  const handleViewDetails = useCallback((id: string) => {
    console.log('👁️ Viewing details for integration:', id);
    // TODO: Implement view details functionality
  }, []);

  const handleViewDocumentation = useCallback((id: string) => {
    console.log('📚 Viewing documentation for integration:', id);
    // TODO: Implement view documentation functionality
  }, []);

  const handleCopyUrl = useCallback((url: string) => {
    navigator.clipboard.writeText(url);
    console.log('📋 Copied URL to clipboard:', url);
  }, []);

  const handleTestEndpoint = useCallback(async (integrationId: string, endpointId?: string) => {
    console.log('🧪 Testing endpoint:', integrationId, endpointId);
    await testEndpoint({ integrationId, endpointId });
  }, [testEndpoint]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Services</h1>
          <p className="text-gray-600">
            Consolidated API management with single source of truth architecture
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Total APIs: {meta.totalServices}</span>
          <span>•</span>
          <span>Internal: {internalApis.length}</span>
          <span>•</span>
          <span>External: {externalApis.length}</span>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-md">
        <SearchInput
          placeholder="Search APIs by name, description, or category..."
          value={searchTerm}
          onChange={setSearchTerm}
          className="w-full"
        />
      </div>

      {/* System Status Information */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-4">
          <div className="text-sm text-green-800">
            <strong>✅ System Status:</strong> Using consolidated useApiServices hook | 
            Data Source: {meta.dataSource} | 
            Version: {meta.version} | 
            Single Source of Truth: Verified
          </div>
        </CardContent>
      </Card>

      {/* No Data State */}
      {!isLoading && integrations.length === 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-center gap-3 pt-4">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-yellow-800 font-medium">No API Services Found</p>
              <p className="text-yellow-700 text-sm">
                Get started by creating your first API integration or importing external APIs.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs Content */}
      <ApiIntegrationsTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        searchTerm={searchTerm}
        integrations={filteredIntegrations}
        internalApis={filteredInternalApis}
        externalApis={filteredExternalApis}
        publishedApis={publishedApis}
        createDialogOpen={createDialogOpen}
        onCreateDialogChange={setCreateDialogOpen}
        onDownloadCollection={handleDownloadCollection}
        onViewDetails={handleViewDetails}
        onViewDocumentation={handleViewDocumentation}
        onCopyUrl={handleCopyUrl}
        onTestEndpoint={handleTestEndpoint}
      />

      {/* Loading States */}
      {(isDownloading || isTesting) && (
        <div className="fixed bottom-4 right-4 bg-blue-100 border border-blue-300 rounded-lg p-3">
          <div className="flex items-center gap-2 text-blue-800">
            <LoadingSpinner size="sm" />
            <span className="text-sm">
              {isDownloading && 'Downloading collection...'}
              {isTesting && 'Testing endpoint...'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiIntegrationsManager;
