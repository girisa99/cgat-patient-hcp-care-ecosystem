
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { OverviewTabContent } from './tabs/OverviewTabContent';
import { InternalApisTabContent } from './tabs/InternalApisTabContent';
import { ExternalApisTabContent } from './tabs/ExternalApisTabContent';
import { PublishedApisTabContent } from './tabs/PublishedApisTabContent';
import { DeveloperTabContent } from './tabs/DeveloperTabContent';
import { ApiKeysTabContent } from './tabs/ApiKeysTabContent';
import { TestingTabContent } from './tabs/TestingTabContent';

interface ApiIntegrationsTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  internalApis: any[];
  externalApis: any[];
  searchTerm: string;
  createDialogOpen: boolean;
  setCreateDialogOpen: (open: boolean) => void;
  onDownloadCollection: (id: string) => void;
  onViewDetails: (id: string) => void;
  onViewDocumentation: (id: string) => void;
  onCopyUrl: (url: string) => void;
  integrations: any[];
  onClose: () => void;
}

export const ApiIntegrationsTabs: React.FC<ApiIntegrationsTabsProps> = ({
  activeTab,
  onTabChange,
  internalApis,
  externalApis,
  searchTerm,
  createDialogOpen,
  setCreateDialogOpen,
  onDownloadCollection,
  onViewDetails,
  onViewDocumentation,
  onCopyUrl,
  integrations,
  onClose
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid grid-cols-7 w-full">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="internal">Internal APIs</TabsTrigger>
        <TabsTrigger value="external">External APIs</TabsTrigger>
        <TabsTrigger value="published">Published APIs</TabsTrigger>
        <TabsTrigger value="developer">Developer</TabsTrigger>
        <TabsTrigger value="keys">API Keys</TabsTrigger>
        <TabsTrigger value="testing">Testing</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <OverviewTabContent />
      </TabsContent>

      <TabsContent value="internal" className="space-y-6">
        <InternalApisTabContent
          internalApis={internalApis}
          searchTerm={searchTerm}
          createDialogOpen={createDialogOpen}
          setCreateDialogOpen={setCreateDialogOpen}
          onDownloadCollection={onDownloadCollection}
          onViewDetails={onViewDetails}
          onViewDocumentation={onViewDocumentation}
          onCopyUrl={onCopyUrl}
        />
      </TabsContent>

      <TabsContent value="external" className="space-y-6">
        <ExternalApisTabContent
          externalApis={externalApis}
          searchTerm={searchTerm}
          createDialogOpen={createDialogOpen}
          setCreateDialogOpen={setCreateDialogOpen}
          onDownloadCollection={onDownloadCollection}
          onViewDetails={onViewDetails}
          onViewDocumentation={onViewDocumentation}
          onCopyUrl={onCopyUrl}
        />
      </TabsContent>

      <TabsContent value="published" className="space-y-6">
        <PublishedApisTabContent />
      </TabsContent>

      <TabsContent value="developer" className="space-y-6">
        <DeveloperTabContent />
      </TabsContent>

      <TabsContent value="keys" className="space-y-6">
        <ApiKeysTabContent />
      </TabsContent>

      <TabsContent value="testing" className="space-y-6">
        <TestingTabContent
          integrations={integrations}
          onClose={onClose}
        />
      </TabsContent>
    </Tabs>
  );
};
