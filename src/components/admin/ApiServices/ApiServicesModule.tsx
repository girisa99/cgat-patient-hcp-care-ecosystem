import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Server, 
  Globe, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Database,
  Search,
  Shield,
  GitBranch,
  FileText,
  Plus,
  Settings,
  Code,
  Key,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Use consolidated hooks with real data
import { useApiServices } from '@/hooks/useApiServices';
import { useApiServiceDetails } from '@/hooks/useApiServiceDetails';

// Import tab components
import { InternalApisTabContent } from '@/components/admin/ApiIntegrations/tabs/InternalApisTabContent';
import { ExternalApisTabContent } from '@/components/admin/ApiIntegrations/tabs/ExternalApisTabContent';
import { PublishedApisTabContent } from '@/components/admin/ApiIntegrations/tabs/PublishedApisTabContent';
import { DeveloperTabContent } from '@/components/admin/ApiIntegrations/tabs/DeveloperTabContent';
import { ApiKeysTabContent } from '@/components/admin/ApiIntegrations/tabs/ApiKeysTabContent';
import { TestingTabContent } from '@/components/admin/ApiIntegrations/tabs/TestingTabContent';
import { OnboardingIntegrationTabContent } from '@/components/admin/ApiIntegrations/tabs/OnboardingIntegrationTabContent';
import AutoIntegrationBanner from '../ApiIntegrations/AutoIntegrationBanner';

// Import the new components
import { ApiDataValidator } from '@/components/admin/ApiIntegrations/ApiDataValidator';
import { ApiDuplicateAnalyzer } from '@/components/admin/ApiIntegrations/ApiDuplicateAnalyzer';
import { ApiConsolidationAction } from '@/components/admin/ApiIntegrations/ApiConsolidationAction';

export const ApiServicesModule: React.FC = () => {
  console.log('🚀 ApiServicesModule: Using consolidated real data with validation');
  
  const [activeTab, setActiveTab] = useState('validation'); // Start with validation tab
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  // Use consolidated hooks with real data
  const { 
    apiServices,
    isLoading, 
    error, 
    createApiService,
    updateApiService,
    deleteApiService,
    isCreatingApiService
  } = useApiServices();

  const { 
    apiEndpoints,
    getDetailedApiStats,
    consolidateApiServices,
    analyzeCoreApis
  } = useApiServiceDetails();

  // Consolidate APIs to remove duplicates
  const consolidatedApis = React.useMemo(() => {
    if (!apiServices) return [];
    return consolidateApiServices(apiServices);
  }, [apiServices, consolidateApiServices]);

  // Get detailed stats with real data
  const detailedStats = React.useMemo(() => {
    return getDetailedApiStats(consolidatedApis);
  }, [consolidatedApis, getDetailedApiStats]);

  // Analyze core API duplicates
  const coreApiAnalysis = React.useMemo(() => {
    return analyzeCoreApis(apiServices);
  }, [apiServices, analyzeCoreApis]);

  // Filter APIs with consistent logic
  const internalApis = consolidatedApis.filter(api => 
    api.direction === 'inbound' || api.type === 'internal'
  );
  
  const externalApis = consolidatedApis.filter(api => 
    api.direction === 'outbound' || api.type === 'external'
  );
  
  const consumingApis = consolidatedApis.filter(api => 
    api.direction === 'bidirectional' || (api.purpose && api.purpose.toLowerCase().includes('consuming'))
  );
  
  const publishingApis = consolidatedApis.filter(api => 
    api.status === 'active' && (api.status === 'active' || api.type === 'internal')
  );

  console.log('📊 ApiServicesModule: Critical Analysis:', {
    totalOriginalApis: apiServices?.length || 0,
    totalConsolidatedApis: consolidatedApis.length,
    totalEndpoints: detailedStats.totalEndpoints,
    coreApiDuplicates: coreApiAnalysis.hasDuplicates,
    coreApiCount: coreApiAnalysis.coreApis.length,
    internal: internalApis.length,
    external: externalApis.length
  });

  // Functional handlers - ensure all buttons work
  const handleDownloadCollection = React.useCallback((integrationId: string) => {
    console.log('📥 Download collection for:', integrationId);
    const integration = apiServices.find(api => api.id === integrationId);
    if (integration) {
      try {
        // Generate and download Postman collection using real data
        const collection = {
          info: {
            name: integration.name,
            description: integration.description || 'API Collection',
            schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
            version: integration.version || '1.0.0'
          },
          item: [{
            name: integration.name,
            request: {
              method: 'GET',
              header: [
                {
                  key: 'Content-Type',
                  value: 'application/json'
                }
              ],
              url: {
                raw: integration.base_url || `${window.location.origin}/api/v1/${integration.id}`,
                host: ['{{base_url}}'],
                path: [integration.name.toLowerCase().replace(/\s+/g, '-')]
              },
              description: integration.description || ''
            }
          }]
        };
        
        const blob = new Blob([JSON.stringify(collection, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${integration.name.replace(/\s+/g, '-')}-collection.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Collection Downloaded",
          description: `Postman collection for ${integration.name} has been downloaded.`,
        });
      } catch (error) {
        console.error('❌ Error downloading collection:', error);
        toast({
          title: "Download Failed",
          description: "Failed to download collection. Please try again.",
          variant: "destructive",
        });
      }
    }
  }, [apiServices, toast]);

  const handleViewDetails = React.useCallback((integrationId: string) => {
    console.log('👁️ View details for:', integrationId);
    const integration = apiServices.find(api => api.id === integrationId);
    if (integration) {
      console.log('Integration details:', integration);
      toast({
        title: "Integration Details",
        description: `Viewing details for ${integration.name}`,
      });
    }
  }, [apiServices, toast]);

  const handleViewDocumentation = React.useCallback((integrationId: string) => {
    console.log('📚 View documentation for:', integrationId);
    const integration = apiServices.find(api => api.id === integrationId);
    if (integration) {
      if (integration.documentation_url) {
        window.open(integration.documentation_url, '_blank');
        toast({
          title: "Documentation Opened",
          description: `Opening documentation for ${integration.name}`,
        });
      } else {
        toast({
          title: "No Documentation",
          description: `No documentation URL available for ${integration.name}`,
          variant: "destructive",
        });
      }
    }
  }, [apiServices, toast]);

  const handleCopyUrl = React.useCallback((integrationId: string) => {
    const integration = apiServices.find(api => api.id === integrationId);
    const url = integration?.base_url || `${window.location.origin}/api/v1/${integrationId}`;
    navigator.clipboard.writeText(url);
    console.log('📋 URL copied:', url);
    toast({
      title: "URL Copied",
      description: "API endpoint URL has been copied to clipboard.",
    });
  }, [apiServices, toast]);

  const handleTestEndpoint = React.useCallback(async (integrationId: string, endpointId?: string): Promise<void> => {
    try {
      console.log('🧪 Testing endpoint:', { integrationId, endpointId });
      const integration = apiServices.find(api => api.id === integrationId);
      if (integration) {
        const testUrl = integration.base_url || `${window.location.origin}/api/v1/${integrationId}`;
        // Perform actual API test
        const response = await fetch(testUrl, { 
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log('✅ Test result:', response.status, response.statusText);
        toast({
          title: "Endpoint Test Complete",
          description: `Status: ${response.status} ${response.statusText}`,
          variant: response.ok ? "default" : "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Error testing endpoint:', error);
      toast({
        title: "Test Failed",
        description: "Failed to test endpoint. Please check the URL and try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [apiServices, toast]);

  const handleCreateNew = React.useCallback(() => {
    console.log('➕ Creating new API service...');
    setCreateDialogOpen(true);
    toast({
      title: "Create New API",
      description: "Opening API creation dialog...",
    });
  }, [toast]);

  const handleConsolidationComplete = React.useCallback(() => {
    console.log('🎉 Consolidation complete!');
    toast({
      title: "Consolidation Complete",
      description: "API services have been consolidated successfully.",
    });
  }, [toast]);

  const OverviewStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Server className="h-6 w-6 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{internalApis.length}</p>
              <p className="text-sm text-muted-foreground">Internal APIs</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-green-500">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <ArrowDownCircle className="h-6 w-6 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{detailedStats.totalEndpoints}</p>
              <p className="text-sm text-muted-foreground">Total Endpoints</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-purple-500">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6 text-purple-500" />
            <div>
              <p className="text-2xl font-bold">{detailedStats.totalSchemas}</p>
              <p className="text-sm text-muted-foreground">Schemas</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-orange-500">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">{detailedStats.totalSecurityPolicies}</p>
              <p className="text-sm text-muted-foreground">Security</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-teal-500">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <GitBranch className="h-6 w-6 text-teal-500" />
            <div>
              <p className="text-2xl font-bold">{consolidatedApis.length}</p>
              <p className="text-sm text-muted-foreground">Total Services</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-indigo-500">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-indigo-500" />
            <div>
              <p className="text-2xl font-bold">{detailedStats.totalDocs}</p>
              <p className="text-sm text-muted-foreground">Documentation</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const OverviewContent = () => (
    <div className="space-y-6">
      {/* Add Data Validator at the top */}
      <ApiDataValidator />
      
      <OverviewStats />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-blue-500" />
              API Services Overview (Consolidated)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.values(detailedStats.apiBreakdown).slice(0, 3).map((api: any) => (
                <div key={api.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{api.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {api.endpointCount} endpoints • {api.type} • {api.status}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{api.category}</Badge>
                    {api.hasDocumentation && (
                      <Badge variant="outline" className="text-blue-600">
                        <FileText className="h-3 w-3 mr-1" />
                        Docs
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-green-500" />
              Real-time Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{detailedStats.totalEndpoints}</p>
                <p className="text-sm text-muted-foreground">Active Endpoints</p>
              </div>
              <div className="text-center">  
                <p className="text-2xl font-bold text-green-600">{detailedStats.totalSchemas}</p>
                <p className="text-sm text-muted-foreground">API Schemas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{detailedStats.totalSecurityPolicies}</p>
                <p className="text-sm text-muted-foreground">Security Policies</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{detailedStats.totalDocs}</p>
                <p className="text-sm text-muted-foreground">Documentation</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading API services from database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Database className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Error loading API services: {error.message}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const ValidationContent = () => (
    <div className="space-y-6">
      {/* Critical Alert if duplicates found */}
      {coreApiAnalysis.hasDuplicates && (
        <Card className="border-red-500 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              CRITICAL: Duplicate Core APIs Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-red-800">
                Found {coreApiAnalysis.coreApis.length} core healthcare APIs. This explains the endpoint count mismatch 
                (Total: {detailedStats.totalEndpoints}, Internal shown: {internalApis.reduce((sum, api) => sum + (api.endpoints_count || 0), 0)}).
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {coreApiAnalysis.coreApis.map(api => (
                  <Card key={api.id} className="border-orange-300">
                    <CardContent className="pt-4">
                      <h4 className="font-bold text-orange-800">{api.name}</h4>
                      <div className="text-sm text-orange-700 space-y-1">
                        <p>Type: {api.type} | Direction: {api.direction}</p>
                        <p>Endpoints: {api.endpoints_count || 0}</p>
                        <p>ID: {api.id}</p>
                        <p>Created: {new Date(api.created_at).toLocaleDateString()}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Alert className="border-yellow-500 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <strong>Immediate Action Required:</strong> These duplicate APIs are causing data fragmentation. 
                  Choose ONE as your single source of truth and deprecate the others.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Direct Consolidation Action */}
      <ApiConsolidationAction 
        onConsolidationComplete={handleConsolidationComplete}
      />
      
      {/* Add the Duplicate Analyzer */}
      <ApiDuplicateAnalyzer />
      
      {/* Add Data Validator */}
      <ApiDataValidator />
      
      {/* Stats Overview */}
      <OverviewStats />
      
      {/* Consolidation Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Data Consolidation Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{apiServices?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Original APIs (with duplicates)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{consolidatedApis.length}</p>
              <p className="text-sm text-muted-foreground">Consolidated APIs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{detailedStats.totalEndpoints}</p>
              <p className="text-sm text-muted-foreground">Total Endpoints</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{coreApiAnalysis.coreApis.length}</p>
              <p className="text-sm text-muted-foreground">Core APIs (Should be 1)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Healthcare API Services Platform</h1>
          <p className="text-muted-foreground">
            {coreApiAnalysis.hasDuplicates ? (
              <span className="text-red-600 font-medium">
                ⚠️ CRITICAL: {coreApiAnalysis.coreApis.length} duplicate core APIs detected - ready for consolidation
              </span>
            ) : (
              `Consolidated API management with ${consolidatedApis.length} services and ${detailedStats.totalEndpoints} endpoints`
            )}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search APIs and healthcare services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            onClick={handleCreateNew}
            disabled={isCreatingApiService}
          >
            <Plus className="h-4 w-4 mr-2" />
            New API
          </Button>
        </div>
      </div>

      <AutoIntegrationBanner />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="validation" className={coreApiAnalysis.hasDuplicates ? "text-red-600 font-bold" : ""}>
            Validation {coreApiAnalysis.hasDuplicates && "⚠️"}
          </TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="internal">Internal ({internalApis.length})</TabsTrigger>
          <TabsTrigger value="consuming">Consuming ({consumingApis.length})</TabsTrigger>
          <TabsTrigger value="publishing">Publishing ({publishingApis.length})</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="developer">Developer</TabsTrigger>
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="validation" className="mt-4">
          <ValidationContent />
        </TabsContent>

        <TabsContent value="overview" className="mt-4">
          <OverviewContent />
        </TabsContent>

        <TabsContent value="internal" className="mt-4">
          <InternalApisTabContent
            internalApis={internalApis}
            searchTerm={searchTerm}
            createDialogOpen={createDialogOpen}
            setCreateDialogOpen={setCreateDialogOpen}
            onDownloadCollection={handleDownloadCollection}
            onViewDetails={handleViewDetails}
            onViewDocumentation={handleViewDocumentation}
            onCopyUrl={handleCopyUrl}
          />
        </TabsContent>

        <TabsContent value="consuming" className="mt-4">
          <ExternalApisTabContent
            externalApis={consumingApis}
            searchTerm={searchTerm}
            createDialogOpen={createDialogOpen}
            setCreateDialogOpen={setCreateDialogOpen}
            onDownloadCollection={handleDownloadCollection}
            onViewDetails={handleViewDetails}
            onViewDocumentation={handleViewDocumentation}
            onCopyUrl={handleCopyUrl}
          />
        </TabsContent>

        <TabsContent value="publishing" className="mt-4">
          <PublishedApisTabContent 
            publishedApis={publishingApis}
            searchTerm={searchTerm}
          />
        </TabsContent>

        <TabsContent value="onboarding" className="mt-4">
          <OnboardingIntegrationTabContent />
        </TabsContent>

        <TabsContent value="developer" className="mt-4">
          <DeveloperTabContent />
        </TabsContent>

        <TabsContent value="keys" className="mt-4">
          <ApiKeysTabContent />
        </TabsContent>

        <TabsContent value="testing" className="mt-4">
          <TestingTabContent
            integrations={apiServices}
            onTestEndpoint={handleTestEndpoint}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
