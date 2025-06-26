
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Globe, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Settings,
  Search,
  BarChart3,
  Users
} from 'lucide-react';
import { useApiIntegrations } from '@/hooks/useApiIntegrations';
import { useExternalApis } from '@/hooks/useExternalApis';
import { usePublishedApiIntegration } from '@/hooks/usePublishedApiIntegration';
import ApiOverviewDashboard from './ApiOverviewDashboard';
import ExternalApiPublisher from './ExternalApiPublisher';
import PublishedApisSection from './PublishedApisSection';
import ApiPublicationStatusChecker from './ApiPublicationStatusChecker';

const ApiIntegrationsManager = () => {
  const { integrations } = useApiIntegrations();
  const { externalApis } = useExternalApis();
  const { publishedApisForDevelopers } = usePublishedApiIntegration();

  // Calculate counts
  const internalApis = integrations?.filter(api => api.type === 'internal') || [];
  const consumedApis = integrations?.filter(api => api.type === 'external') || [];
  const draftApis = externalApis.filter(api => api.status === 'draft');
  const reviewApis = externalApis.filter(api => api.status === 'review');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Integrations</h1>
          <p className="text-muted-foreground">
            Manage your API ecosystem - consume external APIs and publish internal APIs
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="status-checker" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Status Checker
          </TabsTrigger>
          <TabsTrigger value="publisher" className="flex items-center gap-2">
            <ArrowUpCircle className="h-4 w-4" />
            Publisher
            {(draftApis.length > 0 || reviewApis.length > 0) && (
              <Badge variant="secondary" className="ml-1">
                {draftApis.length + reviewApis.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="published" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Published APIs
            <Badge variant="outline" className="ml-1">
              {publishedApisForDevelopers.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="developer-portal" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Developer Portal
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ApiOverviewDashboard />
        </TabsContent>

        <TabsContent value="status-checker">
          <ApiPublicationStatusChecker />
        </TabsContent>

        <TabsContent value="publisher">
          <ExternalApiPublisher />
        </TabsContent>

        <TabsContent value="published">
          <PublishedApisSection showInDeveloperPortal={false} />
        </TabsContent>

        <TabsContent value="developer-portal">
          <PublishedApisSection showInDeveloperPortal={true} />
        </TabsContent>

        <TabsContent value="settings">
          <div className="text-center py-12">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">API Settings</h3>
            <p className="text-muted-foreground">Advanced API configuration options coming soon.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiIntegrationsManager;
