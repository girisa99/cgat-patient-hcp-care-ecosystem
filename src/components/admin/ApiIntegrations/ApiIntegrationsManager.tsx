
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter, Download, AlertCircle } from 'lucide-react';
import { ApiIntegrationsTabs } from './ApiIntegrationsTabs';
import { useApiServices } from '@/hooks/useApiServices';

export const ApiIntegrationsManager: React.FC = () => {
  const { 
    integrations, 
    isLoading, 
    error, 
    getApiStats, 
    searchApis,
    refetch 
  } = useApiServices();

  const [searchTerm, setSearchTerm] = useState('');

  console.log('🔧 ApiIntegrationsManager - Rendering:', {
    integrations: integrations?.length || 0,
    isLoading,
    error: error?.message || null
  });

  const handleRefresh = () => {
    console.log('🔄 Refreshing API integrations...');
    refetch();
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">API Integrations</h1>
            <p className="text-gray-600">Loading API integrations...</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading API integrations...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">API Integrations</h1>
            <p className="text-red-600">Error loading API integrations</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Data</h3>
              <p className="text-red-600 mb-4">{error.message}</p>
              <Button onClick={handleRefresh} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = getApiStats();
  const filteredApis = searchApis(searchTerm);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">API Integrations</h1>
          <p className="text-gray-600">
            Manage internal and external API integrations ({stats.totalIntegrations} total)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search APIs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Main Content */}
      <Card>
        <CardContent className="p-6">
          <ApiIntegrationsTabs
            consolidatedCount={stats.totalIntegrations}
            internalCount={stats.internalApis}
            externalCount={stats.externalApis}
            publishedCount={stats.publishedApis}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiIntegrationsManager;
