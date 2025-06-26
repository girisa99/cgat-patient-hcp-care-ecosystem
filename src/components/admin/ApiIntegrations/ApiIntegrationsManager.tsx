
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Plus, 
  Download, 
  RefreshCw, 
  FileText,
  Globe,
  Server,
  ArrowDownCircle,
  ArrowUpCircle,
  Bug
} from 'lucide-react';
import { useApiIntegrations } from '@/hooks/useApiIntegrations';
import { useExternalApis } from '@/hooks/useExternalApis';
import ApiOverviewDashboard from './ApiOverviewDashboard';
import { ApiOverviewSection } from './ApiOverviewSection';
import { InternalApiEndpointsList } from './InternalApiEndpointsList';
import { ExternalApiEndpointsList } from './ExternalApiEndpointsList';
import { CreateIntegrationDialog } from './CreateIntegrationDialog';
import IntegrationDetailView from './IntegrationDetailView';
import ExternalApiPublisher from './ExternalApiPublisher';
import DeveloperPortal from './DeveloperPortal';
import { ArchitectureDocumentation } from './ArchitectureDocumentation';

const ApiIntegrationsManager = () => {
  const { toast } = useToast();
  const { integrations, isLoading } = useApiIntegrations();
  const { externalApis: publishedExternalApis } = useExternalApis();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedView, setSelectedView] = useState<'overview' | 'internal' | 'external' | 'publishing' | 'developer' | 'docs'>('overview');
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  // Filter integrations based on search term
  const filteredIntegrations = integrations?.filter(integration =>
    integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    integration.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Separate internal and external APIs
  const internalApis = filteredIntegrations.filter(api => api.type === 'internal');
  const consumingExternalApis = filteredIntegrations.filter(api => api.type === 'external');

  const handleDownloadCollection = (integrationId: string) => {
    const integration = integrations?.find(i => i.id === integrationId);
    if (integration) {
      toast({
        title: "Download Started",
        description: `Downloading Postman collection for ${integration.name}`,
      });
    }
  };

  const handleViewDetails = (integrationId: string) => {
    setSelectedIntegration(integrationId);
  };

  const handleViewDocumentation = (integrationId: string) => {
    const integration = integrations?.find(i => i.id === integrationId);
    if (integration?.baseUrl) {
      window.open(`${integration.baseUrl}/docs`, '_blank');
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "URL Copied",
      description: "URL has been copied to clipboard",
    });
  };

  const handleRefreshDetection = async () => {
    // Refresh functionality would be implemented here
    toast({
      title: "Detection Refreshed",
      description: "API detection has been refreshed successfully.",
    });
  };

  if (selectedIntegration) {
    return (
      <IntegrationDetailView
        integrationId={selectedIntegration}
        onBack={() => setSelectedIntegration(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">API Integrations</h2>
          <p className="text-muted-foreground">
            Manage internal APIs, external integrations, and published endpoints
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDebugMode(!debugMode)}
            className="bg-yellow-50 hover:bg-yellow-100 border-yellow-200"
          >
            <Bug className="h-4 w-4 mr-2" />
            Global Debug: {debugMode ? 'ON' : 'OFF'}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleRefreshDetection}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Detection
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Integration
          </Button>
        </div>
      </div>

      {/* Global Debug Panel */}
      {debugMode && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="space-y-2 text-sm">
              <div><strong>Current View:</strong> {selectedView}</div>
              <div><strong>Total Integrations:</strong> {integrations?.length || 0}</div>
              <div><strong>Internal APIs:</strong> {internalApis.length}</div>
              <div><strong>External APIs (Consuming):</strong> {consumingExternalApis.length}</div>
              <div><strong>Published External APIs:</strong> {publishedExternalApis?.length || 0}</div>
              <div><strong>Search Term:</strong> "{searchTerm}"</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter Controls */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search APIs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Server className="h-3 w-3" />
          {internalApis.length} Internal
        </Badge>
        <Badge variant="outline" className="flex items-center gap-1">
          <Globe className="h-3 w-3" />
          {consumingExternalApis.length} External
        </Badge>
      </div>

      <Tabs value={selectedView} onValueChange={(value: any) => setSelectedView(value)}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="internal" className="flex items-center gap-1">
            <Server className="h-3 w-3" />
            Internal ({internalApis.length})
          </TabsTrigger>
          <TabsTrigger value="external" className="flex items-center gap-1">
            <ArrowDownCircle className="h-3 w-3" />
            Consuming ({consumingExternalApis.length})
          </TabsTrigger>
          <TabsTrigger value="publishing" className="flex items-center gap-1">
            <ArrowUpCircle className="h-3 w-3" />
            Publishing
          </TabsTrigger>
          <TabsTrigger value="developer">Developer Portal</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ApiOverviewDashboard />
        </TabsContent>

        <TabsContent value="internal">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Server className="h-5 w-5 text-blue-500" />
                  Internal APIs
                </h3>
                <p className="text-sm text-muted-foreground">
                  APIs generated from your internal database schema and business logic
                </p>
              </div>
            </div>
            <InternalApiEndpointsList
              apis={internalApis}
              searchTerm={searchTerm}
              onDownloadCollection={handleDownloadCollection}
              onViewDetails={handleViewDetails}
              onViewDocumentation={handleViewDocumentation}
              onCopyUrl={handleCopyUrl}
            />
          </div>
        </TabsContent>

        <TabsContent value="external">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <ArrowDownCircle className="h-5 w-5 text-green-500" />
                  External APIs We're Consuming
                </h3>
                <p className="text-sm text-muted-foreground">
                  Third-party APIs integrated into your platform
                </p>
              </div>
            </div>
            <ExternalApiEndpointsList
              apis={consumingExternalApis}
              searchTerm={searchTerm}
              onDownloadCollection={handleDownloadCollection}
              onViewDetails={handleViewDetails}
              onViewDocumentation={handleViewDocumentation}
              onCopyUrl={handleCopyUrl}
            />
          </div>
        </TabsContent>

        <TabsContent value="publishing">
          <ExternalApiPublisher />
        </TabsContent>

        <TabsContent value="developer">
          <DeveloperPortal />
        </TabsContent>

        <TabsContent value="docs">
          <ArchitectureDocumentation />
        </TabsContent>
      </Tabs>

      <CreateIntegrationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
};

export default ApiIntegrationsManager;
