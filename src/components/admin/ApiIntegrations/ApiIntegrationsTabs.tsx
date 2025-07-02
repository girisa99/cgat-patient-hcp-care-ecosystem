
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { InternalApisTabContent } from './tabs/InternalApisTabContent';
import { ExternalApisTabContent } from './tabs/ExternalApisTabContent';
import { OverviewTabContent } from './tabs/OverviewTabContent';
import { useApiServices } from '@/hooks/useApiServices';

interface ApiIntegrationsTabsProps {
  consolidatedCount: number;
  internalCount: number;
  externalCount: number;
  publishedCount: number;
}

export const ApiIntegrationsTabs: React.FC<ApiIntegrationsTabsProps> = ({
  consolidatedCount,
  internalCount,
  externalCount,
  publishedCount
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  const { integrations, internalApis, externalApis } = useApiServices();

  console.log('🔍 ApiIntegrationsTabs: Rendering with data:', {
    consolidatedCount,
    internalCount,
    externalCount,
    publishedCount
  });

  const handleEditApi = (api: any) => {
    console.log('✏️ Edit API:', api);
  };

  const handleDeleteApi = async (id: string) => {
    console.log('🗑️ Delete API:', id);
  };

  const handleTestEndpoint = async (endpoint: any) => {
    console.log('🧪 Test endpoint:', endpoint);
  };

  const handleDownloadCollection = (id: string) => {
    console.log('📥 Download collection:', id);
  };

  const handleViewDetails = (id: string) => {
    console.log('👁️ View details:', id);
  };

  const handleCreateClick = () => {
    setCreateDialogOpen(true);
  };

  const handlePublishClick = () => {
    console.log('🌍 Publish API clicked');
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          Overview
          <Badge variant="secondary" className="ml-1">
            {consolidatedCount}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="internal" className="flex items-center gap-2">
          Internal APIs
          <Badge variant="secondary" className="ml-1">
            {internalCount}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="external" className="flex items-center gap-2">
          External APIs
          <Badge variant="secondary" className="ml-1">
            {externalCount}
          </Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <OverviewTabContent 
          totalIntegrations={consolidatedCount}
          consolidatedData={integrations || []}
        />
      </TabsContent>

      <TabsContent value="internal" className="space-y-4">
        <InternalApisTabContent
          internalApis={internalApis || []}
          searchTerm={searchTerm}
          createDialogOpen={createDialogOpen}
          onSearchChange={setSearchTerm}
          onCreateClick={handleCreateClick}
          onEditApi={handleEditApi}
          onViewDetails={handleViewDetails}
          onDownloadCollection={handleDownloadCollection}
        />
      </TabsContent>

      <TabsContent value="external" className="space-y-4">
        <ExternalApisTabContent
          externalApis={externalApis || []}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onPublishClick={handlePublishClick}
          onViewDetails={handleViewDetails}
          onTestEndpoint={handleTestEndpoint}
        />
      </TabsContent>
    </Tabs>
  );
};
