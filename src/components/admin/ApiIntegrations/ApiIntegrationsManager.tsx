
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter, Download } from 'lucide-react';
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

  const stats = getApiStats();
  const filteredApis = searchApis(searchTerm);

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">API Integrations</h1>
          <p className="text-gray-600">Manage internal and external API integrations</p>
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
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading API integrations...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">Error loading APIs: {error.message}</p>
            </div>
          ) : (
            <ApiIntegrationsTabs
              consolidatedCount={stats.totalIntegrations}
              internalCount={stats.internalApis}
              externalCount={stats.externalApis}
              publishedCount={stats.publishedApis}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
