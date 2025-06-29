
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

export const ApiIntegrationsTabs: React.FC<ApiIntegrationsTabsProps> = ({
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
  return (
    <EnhancedTabs defaultValue={activeTab} className="w-full" onValueChange={onTabChange}>
      <EnhancedTabsList>
        <EnhancedTabsTrigger value="overview">Overview</EnhancedTabsTrigger>
        <EnhancedTabsTrigger value="internal">Internal APIs ({internalApis?.length || 0})</EnhancedTabsTrigger>
        <EnhancedTabsTrigger value="external">External APIs ({externalApis?.length || 0})</EnhancedTabsTrigger>
        <EnhancedTabsTrigger value="published">Published APIs ({publishedApis?.length || 0})</EnhancedTabsTrigger>
        <EnhancedTabsTrigger value="developer">Developer</EnhancedTabsTrigger>
        <EnhancedTabsTrigger value="keys">API Keys</EnhancedTabsTrigger>
        <EnhancedTabsTrigger value="testing">Testing</EnhancedTabsTrigger>
      </EnhancedTabsList>

      <EnhancedTabsContent value="overview">
        <OverviewTabContent 
          integrations={integrations}
          internalApis={internalApis}
          externalApis={externalApis}
          publishedApis={publishedApis}
        />
      </EnhancedTabsContent>

      <EnhancedTabsContent value="internal">
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
      </EnhancedTabsContent>

      <EnhancedTabsContent value="external">
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
      </EnhancedTabsContent>

      <EnhancedTabsContent value="published">
        <PublishedApisTabContent 
          publishedApis={publishedApis}
          searchTerm={searchTerm}
        />
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
          onTestEndpoint={onTestEndpoint}
        />
      </EnhancedTabsContent>
    </EnhancedTabs>
  );
};
