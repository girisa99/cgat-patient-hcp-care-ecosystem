
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApiServicesOverview } from './ApiServicesOverview';
import { ApiRegistryTab } from './ApiRegistryTab';
import { ApiDocumentationDashboard } from './ApiDocumentationDashboard';

export const ApiServicesModule: React.FC = () => {
  console.log('🚀 ApiServicesModule: Rendering with enhanced documentation system');

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="registry">API Registry</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ApiServicesOverview />
        </TabsContent>

        <TabsContent value="registry">
          <ApiRegistryTab />
        </TabsContent>

        <TabsContent value="documentation">
          <ApiDocumentationDashboard />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="text-center py-8 text-gray-500">
            Analytics dashboard coming soon...
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
