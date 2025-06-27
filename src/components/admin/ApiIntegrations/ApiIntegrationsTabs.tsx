
import React from 'react';
import { EnhancedTabs, EnhancedTabsList, EnhancedTabsTrigger, EnhancedTabsContent } from '@/components/ui/enhanced-tabs';
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
    <EnhancedTabs defaultValue={activeTab} className="w-full">
      <EnhancedTabsList>
        <EnhancedTabsTrigger value="overview">Overview</EnhancedTabsTrigger>
        <EnhancedTabsTrigger value="internal">Internal APIs</EnhancedTabsTrigger>
        <EnhancedTabsTrigger value="external">External APIs</EnhancedTabsTrigger>
        <EnhancedTabsTrigger value="published">Published APIs</EnhancedTabsTrigger>
        <EnhancedTabsTrigger value="developer">Developer</EnhancedTabsTrigger>
        <EnhancedTabsTrigger value="keys">API Keys</EnhancedTabsTrigger>
        <EnhancedTabsTrigger value="testing">Testing</EnhancedTabsTrigger>
      </EnhancedTabsList>

      <EnhancedTabsContent value="overview">
        <OverviewTabContent />
      </EnhancedTabsContent>

      <EnhancedTabsContent value="internal">
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
      </EnhancedTabsContent>

      <EnhancedTabsContent value="external">
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
      </EnhancedTabsContent>

      <EnhancedTabsContent value="published">
        <PublishedApisTabContent />
      </EnhancedTabsContent>

      <EnhancedTabsContent value="developer">
        <DeveloperTabContent />
      </EnhancedTabsContent>

      <EnhancedTabsContent value="keys">
        <ApiKeysTabContent />
      </EnhancedTabsContent>

      <EnhancedTabsContent value="testing">
        <TestingTabContent
          integrations={integrations}
          onClose={onClose}
        />
      </EnhancedTabsContent>
    </EnhancedTabs>
  );
};
