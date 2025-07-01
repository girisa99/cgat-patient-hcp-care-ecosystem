
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OverviewTabContent } from './tabs/OverviewTabContent';
import { InternalApisTabContent } from './tabs/InternalApisTabContent';
import { ExternalApisTabContent } from './tabs/ExternalApisTabContent';
import { PublishedApisTabContent } from './tabs/PublishedApisTabContent';
import { DeveloperTabContent } from './tabs/DeveloperTabContent';
import { ApiKeysTabContent } from './tabs/ApiKeysTabContent';
import { TestingTabContent } from './tabs/TestingTabContent';
import { SandboxTabContent } from './tabs/SandboxTabContent';

interface ApiIntegrationsTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  searchTerm: string;
  integrations: any[];
  internalApis: any[];
  externalApis: any[];
  publishedApis: any[];
  consolidatedData?: {
    consolidatedApis: any[];
    syncStatus: any;
  };
  createDialogOpen: boolean;
  onCreateDialogChange: (open: boolean) => void;
  onDownloadCollection: (id: string) => void;
  onViewDetails: (id: string) => void;
  onViewDocumentation: (id: string) => void;
  onCopyUrl: (url: string) => void;
  onTestEndpoint: (integrationId: string, endpointId?: string) => Promise<void>;
}

export const ApiIntegrationsTabs: React.FC<ApiIntegrationsTabsProps> = React.memo(({
  activeTab,
  onTabChange,
  searchTerm,
  integrations,
  internalApis,
  externalApis,
  publishedApis,
  consolidatedData,
  createDialogOpen,
  onCreateDialogChange,
  onDownloadCollection,
  onViewDetails,
  onViewDocumentation,
  onCopyUrl,
  onTestEndpoint
}) => {
  console.log('🔍 ApiIntegrationsTabs: Rendering with data:', {
    consolidatedCount: consolidatedData?.consolidatedApis?.length || 0,
    internalCount: internalApis.length,
    externalCount: externalApis.length,
    publishedCount: publishedApis.length
  });

  // Use consolidated data as single source of truth
  const consolidatedApis = consolidatedData?.consolidatedApis || integrations;
  
  // Simple filtering for different API categories
  const consolidatedInternalApis = consolidatedApis.filter(api => {
    return api.type === 'internal' || 
           api.direction === 'inbound' || 
           api.direction === 'bidirectional';
  });
  
  const consolidatedExternalApis = consolidatedApis.filter(api => {
    return api.type === 'external' || 
           api.direction === 'outbound' ||
           api.isExternalOnly;
  });
  
  const consolidatedPublishedApis = consolidatedApis.filter(api => {
    return api.status === 'published' || 
           api.lifecycle_stage === 'production';
  });

  console.log('📊 Filtered API counts:', {
    totalApis: consolidatedApis.length,
    internalApis: consolidatedInternalApis.length,
    externalApis: consolidatedExternalApis.length,
    publishedApis: consolidatedPublishedApis.length
  });

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-8">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="internal">Internal ({consolidatedInternalApis.length})</TabsTrigger>
        <TabsTrigger value="external">External ({consolidatedExternalApis.length})</TabsTrigger>
        <TabsTrigger value="published">Published ({consolidatedPublishedApis.length})</TabsTrigger>
        <TabsTrigger value="developer">Developer</TabsTrigger>
        <TabsTrigger value="keys">API Keys</TabsTrigger>
        <TabsTrigger value="testing">Testing</TabsTrigger>
        <TabsTrigger value="sandbox">Sandbox</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-4">
        <OverviewTabContent 
          integrations={consolidatedApis}
          consolidatedData={consolidatedData}
        />
      </TabsContent>

      <TabsContent value="internal" className="mt-4">
        <InternalApisTabContent
          internalApis={consolidatedInternalApis}
          searchTerm={searchTerm}
          createDialogOpen={createDialogOpen}
          setCreateDialogOpen={onCreateDialogChange}
          onDownloadCollection={onDownloadCollection}
          onViewDetails={onViewDetails}
          onViewDocumentation={onViewDocumentation}
          onCopyUrl={onCopyUrl}
        />
      </TabsContent>

      <TabsContent value="external" className="mt-4">
        <ExternalApisTabContent
          externalApis={consolidatedExternalApis}
          searchTerm={searchTerm}
          createDialogOpen={createDialogOpen}
          setCreateDialogOpen={onCreateDialogChange}
          onDownloadCollection={onDownloadCollection}
          onViewDetails={onViewDetails}
          onViewDocumentation={onViewDocumentation}
          onCopyUrl={onCopyUrl}
        />
      </TabsContent>

      <TabsContent value="published" className="mt-4">
        <PublishedApisTabContent 
          consolidatedApis={consolidatedPublishedApis}
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
          consolidatedApis={consolidatedApis}
          onTestEndpoint={onTestEndpoint}
        />
      </TabsContent>

      <TabsContent value="sandbox" className="mt-4">
        <SandboxTabContent 
          integrations={consolidatedApis}
          onTestEndpoint={onTestEndpoint}
        />
      </TabsContent>
    </Tabs>
  );
});

ApiIntegrationsTabs.displayName = 'ApiIntegrationsTabs';
