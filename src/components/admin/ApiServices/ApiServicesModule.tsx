
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApiServicesOverview } from './ApiServicesOverview';
import { EnhancedApiRegistryTab } from './EnhancedApiRegistryTab';
import { ApiDocumentationDashboard } from './ApiDocumentationDashboard';
import { ApiConsumptionTab } from '@/components/api/ApiConsumptionTab';
import { ApiPublishingWorkflowTab } from './tabs/ApiPublishingWorkflowTab';
import { ApiDeveloperPortalTab } from './tabs/ApiDeveloperPortalTab';
import { ApiTestingInterfaceTab } from './tabs/ApiTestingInterfaceTab';
import { PostmanIntegrationTab } from './tabs/PostmanIntegrationTab';
import { useApiServicesLocked } from '@/hooks/useApiServicesLocked';

export const ApiServicesModule: React.FC = () => {
  const { meta } = useApiServicesLocked();
  
  console.log('🔒 ApiServicesModule: Enhanced with all subtabs and advanced functionality');

  return (
    <div className="space-y-6">
      {/* Locked Implementation Status Banner */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          <h3 className="font-semibold text-green-900">🔒 API Services - Complete Implementation</h3>
        </div>
        <div className="text-sm text-green-700 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p><strong>Pattern:</strong> {meta.lockedPatternEnforced ? '✅ Enforced' : '❌ Not Enforced'}</p>
            <p><strong>Version:</strong> {meta.hookVersion}</p>
          </div>
          <div>
            <p><strong>Single Source:</strong> {meta.singleSourceValidated ? '✅ Validated' : '❌ Not Validated'}</p>
            <p><strong>Data Source:</strong> {meta.dataSource}</p>
          </div>
          <div>
            <p><strong>Total APIs:</strong> {meta.totalIntegrations}</p>
            <p><strong>Features:</strong> Publishing, Testing, Documentation, Consumption</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="registry">API Registry</TabsTrigger>
          <TabsTrigger value="publishing">Publishing</TabsTrigger>
          <TabsTrigger value="developer">Developer Portal</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="postman">Postman</TabsTrigger>
          <TabsTrigger value="consumption">Consumption</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ApiServicesOverview />
        </TabsContent>

        <TabsContent value="registry">
          <EnhancedApiRegistryTab />
        </TabsContent>

        <TabsContent value="publishing">
          <ApiPublishingWorkflowTab />
        </TabsContent>

        <TabsContent value="developer">
          <ApiDeveloperPortalTab />
        </TabsContent>

        <TabsContent value="testing">
          <ApiTestingInterfaceTab />
        </TabsContent>

        <TabsContent value="postman">
          <PostmanIntegrationTab />
        </TabsContent>

        <TabsContent value="consumption">
          <ApiConsumptionTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
