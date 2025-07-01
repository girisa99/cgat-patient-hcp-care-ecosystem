
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
import { PostmanTabContent } from './tabs/PostmanTabContent';
import { ConsumptionTabContent } from './tabs/ConsumptionTabContent';
import { PublishingWorkflowTabContent } from './tabs/PublishingWorkflowTabContent';

interface ApiIntegrationsTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  searchTerm: string;
  integrations: any[];
  internalApis: any[];
  externalApis: any[];
  publishedApis: any[];
  createDialogOpen: boolean;
  onCreateDialogChange: (open: boolean) => void;
  onDownloadCollection: (id: string) => void;
  onViewDetails: (id: string) => void;
  onViewDocumentation: (id: string) => void;
  onCopyUrl: (url: string) => void;
  onTestEndpoint: (integrationId: string, endpointId: string) => void;
  onClose: () => void;
}

export const ApiIntegrationsTabs: React.FC<ApiIntegrationsTabsProps> = React.memo(({
  activeTab,
  onTabChange,
  searchTerm,
  integrations,
  internalApis,
  externalApis,
  publishedApis,
  createDialogOpen,
  onCreateDialogChange,
  onDownloadCollection,
  onViewDetails,
  onViewDocumentation,
  onCopyUrl,
  onTestEndpoint,
  onClose
}) => {
  const handleValueChange = React.useCallback((value: string) => {
    onTabChange(value);
  }, [onTabChange]);

  return (
    <Tabs value={activeTab} onValueChange={handleValueChange} className="w-full">
      <TabsList className="grid w-full grid-cols-11 gap-1">
        <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
        <TabsTrigger value="internal" className="text-xs">Internal ({internalApis?.length || 0})</TabsTrigger>
        <TabsTrigger value="external" className="text-xs">External ({externalApis?.length || 0})</TabsTrigger>
        <TabsTrigger value="published" className="text-xs">Published ({publishedApis?.length || 0})</TabsTrigger>
        <TabsTrigger value="developer" className="text-xs">Developer</TabsTrigger>
        <TabsTrigger value="sandbox" className="text-xs">Sandbox</TabsTrigger>
        <TabsTrigger value="postman" className="text-xs">Postman</TabsTrigger>
        <TabsTrigger value="publishing" className="text-xs">Publishing</TabsTrigger>
        <TabsTrigger value="consumption" className="text-xs">Analytics</TabsTrigger>
        <TabsTrigger value="keys" className="text-xs">API Keys</TabsTrigger>
        <TabsTrigger value="testing" className="text-xs">Testing</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <OverviewTabContent 
          integrations={integrations}
          internalApis={internalApis}
          externalApis={externalApis}
          publishedApis={publishedApis}
        />
      </TabsContent>

      <TabsContent value="internal">
        <InternalApisTabContent 
          internalApis={internalApis}
          searchTerm={searchTerm}
          createDialogOpen={createDialogOpen}
          setCreateDialogOpen={onCreateDialogChange}
          onDownloadCollection={onDownloadCollection}
          onViewDetails={onViewDetails}
          onViewDocumentation={onViewDocumentation}
          onCopyUrl={onCopyUrl}
        />
      </TabsContent>

      <TabsContent value="external">
        <ExternalApisTabContent 
          externalApis={externalApis}
          searchTerm={searchTerm}
          createDialogOpen={createDialogOpen}
          setCreateDialogOpen={onCreateDialogChange}
          onDownloadCollection={onDownloadCollection}
          onViewDetails={onViewDetails}
          onViewDocumentation={onViewDocumentation}
          onCopyUrl={onCopyUrl}
        />
      </TabsContent>

      <TabsContent value="published">
        <PublishedApisTabContent 
          publishedApis={publishedApis}
          searchTerm={searchTerm}
        />
      </TabsContent>

      <TabsContent value="developer">
        <DeveloperTabContent />
      </TabsContent>

      <TabsContent value="sandbox">
        <SandboxTabContent 
          integrations={integrations}
          onTestEndpoint={onTestEndpoint}
        />
      </TabsContent>

      <TabsContent value="postman">
        <PostmanTabContent 
          integrations={integrations}
          onDownloadCollection={onDownloadCollection}
        />
      </TabsContent>

      <TabsContent value="publishing">
        <PublishingWorkflowTabContent 
          internalApis={internalApis}
          externalApis={externalApis}
        />
      </TabsContent>

      <TabsContent value="consumption">
        <ConsumptionTabContent 
          publishedApis={publishedApis}
        />
      </TabsContent>

      <TabsContent value="keys">
        <ApiKeysTabContent />
      </TabsContent>

      <TabsContent value="testing">
        <TestingTabContent 
          integrations={integrations}
          onTestEndpoint={onTestEndpoint}
          onClose={onClose}
        />
      </TabsContent>
    </Tabs>
  );
});
