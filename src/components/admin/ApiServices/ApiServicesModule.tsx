
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApiServicesOverview } from './ApiServicesOverview';
import { ApiRegistryTab } from './ApiRegistryTab';
import { ApiDocumentationDashboard } from './ApiDocumentationDashboard';
import { ApiConsumptionTab } from '@/components/api/ApiConsumptionTab';
import { useApiServicesLocked } from '@/hooks/useApiServicesLocked';

export const ApiServicesModule: React.FC = () => {
  const { meta } = useApiServicesLocked();
  
  console.log('🔒 ApiServicesModule: Using locked hook pattern with single source of truth');
  console.log('📊 Locked Pattern Status:', {
    implementationLocked: meta.implementationLocked,
    singleSourceValidated: meta.singleSourceValidated,
    lockedPatternEnforced: meta.lockedPatternEnforced,
    version: meta.hookVersion
  });

  return (
    <div className="space-y-6">
      {/* Locked Implementation Status Banner */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          <h3 className="font-semibold text-green-900">🔒 API Services - Locked Implementation Active</h3>
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
            <p><strong>Last Updated:</strong> {new Date(meta.lastLockUpdate).toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="registry">API Registry</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
          <TabsTrigger value="consumption">Usage Analytics</TabsTrigger>
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

        <TabsContent value="consumption">
          <ApiConsumptionTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
