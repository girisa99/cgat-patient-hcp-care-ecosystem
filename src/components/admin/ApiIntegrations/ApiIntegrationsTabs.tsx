
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { OverviewTabContent } from './tabs/OverviewTabContent';
import { InternalApisTabContent } from './tabs/InternalApisTabContent';
import { ExternalApisTabContent } from './tabs/ExternalApisTabContent';
import { ApiConsumptionTab } from '@/components/api/ApiConsumptionTab';
import { ApiPublishTab } from '@/components/api/ApiPublishTab';
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
  console.log('🔍 ApiIntegrationsTabs: Rendering with data:', {
    consolidatedCount,
    internalCount,
    externalCount,
    publishedCount
  });

  const { selectedApiId } = useApiServices();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="overview">
          Overview
          <Badge variant="secondary" className="ml-2">{consolidatedCount}</Badge>
        </TabsTrigger>
        <TabsTrigger value="internal">
          Internal APIs
          <Badge variant="secondary" className="ml-2">{internalCount}</Badge>
        </TabsTrigger>
        <TabsTrigger value="external">
          External APIs
          <Badge variant="secondary" className="ml-2">{externalCount}</Badge>
        </TabsTrigger>
        <TabsTrigger value="consumption">
          Consumption
        </TabsTrigger>
        <TabsTrigger value="publish">
          Publish
        </TabsTrigger>
        <TabsTrigger value="published">
          Published
          <Badge variant="secondary" className="ml-2">{publishedCount}</Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <OverviewTabContent 
          totalIntegrations={consolidatedCount}
          consolidatedData={consolidatedCount}
        />
      </TabsContent>

      <TabsContent value="internal" className="space-y-4">
        <InternalApisTabContent />
      </TabsContent>

      <TabsContent value="external" className="space-y-4">
        <ExternalApisTabContent />
      </TabsContent>

      <TabsContent value="consumption" className="space-y-4">
        <ApiConsumptionTab />
      </TabsContent>

      <TabsContent value="publish" className="space-y-4">
        {selectedApiId ? (
          <ApiPublishTab apiId={selectedApiId} />
        ) : (
          <div className="text-center py-8 text-gray-500">
            Select an API from the External APIs tab to configure publishing settings.
          </div>
        )}
      </TabsContent>

      <TabsContent value="published" className="space-y-4">
        <div className="text-center py-8 text-gray-500">
          Published APIs management coming soon.
        </div>
      </TabsContent>
    </Tabs>
  );
};
