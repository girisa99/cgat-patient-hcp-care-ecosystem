
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Download, 
  Play, 
  Settings, 
  Database, 
  Code, 
  FileText,
  ExternalLink,
  Shield,
  Zap,
  Globe,
  Server,
  Copy,
  Share,
  Eye
} from 'lucide-react';
import { useApiIntegrations } from '@/hooks/useApiIntegrations';
import { useRealtime } from '@/hooks/useRealtime';
import { apiIntegrationManager } from '@/utils/api/ApiIntegrationManager';
import { CreateIntegrationDialog } from './CreateIntegrationDialog';
import { IntegrationDetailView } from './IntegrationDetailView';
import { ApiOverviewSection } from './ApiOverviewSection';

const ApiIntegrationsManager = () => {
  const {
    integrations,
    isLoading,
    selectedIntegration,
    setSelectedIntegration,
    executeIntegration,
    isExecuting,
    downloadPostmanCollection
  } = useApiIntegrations();

  // Enable real-time updates for API integrations
  useRealtime({
    tableName: 'api_integrations',
    moduleName: 'API Integrations',
    enableNotifications: true,
    customInvalidation: ['api-integrations', 'api-integration-stats']
  });

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const internalApis = integrations?.filter(i => i.type === 'internal') || [];
  const externalApis = integrations?.filter(i => i.type === 'external') || [];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleDownloadCollection = (integrationId: string) => {
    downloadPostmanCollection(integrationId);
  };

  const handleViewDetails = (integrationId: string) => {
    setSelectedIntegration(integrationId);
  };

  const handleCopyUrl = (url: string) => {
    copyToClipboard(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">API Integration Center</h2>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading API integrations...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">API Integration Center</h2>
          <p className="text-muted-foreground">
            Comprehensive view of internal platform APIs and external integrations with real-time updates
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => {
              const docs = apiIntegrationManager.exportApiDocumentation();
              const blob = new Blob([JSON.stringify(docs, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'api-documentation.json';
              a.click();
            }}
          >
            <FileText className="h-4 w-4 mr-2" />
            Export Docs
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add External Integration
          </Button>
        </div>
      </div>

      {/* Enhanced Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{internalApis.length}</p>
                <p className="text-sm text-muted-foreground">Internal APIs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{externalApis.length}</p>
                <p className="text-sm text-muted-foreground">External APIs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {integrations?.reduce((acc, i) => acc + i.endpoints.length, 0) || 0}
                </p>
                <p className="text-sm text-muted-foreground">Total Endpoints</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{integrations?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Collections Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Enhanced Overview</TabsTrigger>
          <TabsTrigger value="monitoring">Real-time Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ApiOverviewSection
            internalApis={internalApis}
            externalApis={externalApis}
            onDownloadCollection={handleDownloadCollection}
            onViewDetails={handleViewDetails}
            onCopyUrl={handleCopyUrl}
          />
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Real-time API Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">Active Monitoring</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Real-time updates enabled for all API integrations
                    </p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Auto-sync Policies</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      RLS policies and mappings updated automatically
                    </p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-purple-500" />
                      <span className="font-medium">Documentation Sync</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      OpenAPI specs and collections auto-generated
                    </p>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Latest Updates</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Internal API schemas refreshed</span>
                      <Badge variant="secondary">Just now</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Postman collections updated</span>
                      <Badge variant="secondary">2 mins ago</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>RLS policies synchronized</span>
                      <Badge variant="secondary">5 mins ago</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateIntegrationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      {selectedIntegration && (
        <IntegrationDetailView
          integrationId={selectedIntegration}
          onClose={() => setSelectedIntegration(null)}
        />
      )}
    </div>
  );
};

export default ApiIntegrationsManager;
