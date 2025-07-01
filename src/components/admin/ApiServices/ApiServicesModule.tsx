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
  CheckCircle,
  Activity,
  Target,
  TrendingUp,
  Zap
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

// Import the seeder component
import { ApiDataSeeder } from '@/components/admin/ApiIntegrations/ApiDataSeeder';

export const ApiServicesModule: React.FC = () => {
  console.log('🚀 ApiServicesModule: Single Source of Truth Implementation (Real Data with Seeder)');
  
  const [activeTab, setActiveTab] = useState('overview');
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
    apiRegistrations,
    getDetailedApiStats,
    consolidateApiServices,
    analyzeCoreApis,
    generatePostmanCollection
  } = useApiServiceDetails();

  // Consolidate APIs to remove duplicates - Single Source of Truth
  const consolidatedApis = React.useMemo(() => {
    if (!apiServices) return [];
    return consolidateApiServices(apiServices);
  }, [apiServices, consolidateApiServices]);

  // Get comprehensive detailed stats with real data
  const detailedStats = React.useMemo(() => {
    return getDetailedApiStats(consolidatedApis);
  }, [consolidatedApis, getDetailedApiStats]);

  // Analyze core API status - Single Source of Truth validation
  const coreApiAnalysis = React.useMemo(() => {
    return analyzeCoreApis(apiServices);
  }, [apiServices, analyzeCoreApis]);

  // Check if we need to show the seeder (no endpoints available)
  const needsSeeding = detailedStats.totalEndpoints === 0 && coreApiAnalysis.singleSourceOfTruth && consolidatedApis.length > 0;

  // Real data filtering with consolidated APIs
  const internalApis = consolidatedApis.filter(api => 
    api.direction === 'inbound' || api.type === 'internal' || api.direction === 'bidirectional'
  );
  
  const externalApis = consolidatedApis.filter(api => 
    api.direction === 'outbound' || api.type === 'external'
  );
  
  const consumingApis = consolidatedApis.filter(api => 
    api.direction === 'bidirectional' || (api.purpose && api.purpose.toLowerCase().includes('consuming'))
  );
  
  const publishingApis = consolidatedApis.filter(api => 
    api.status === 'active' && (api.lifecycle_stage === 'production' || api.type === 'internal')
  );

  console.log('📊 ApiServicesModule: Real Data Metrics Summary (with Seeder Check):', {
    totalOriginalApis: apiServices?.length || 0,
    totalConsolidatedApis: consolidatedApis.length,
    totalEndpoints: detailedStats.totalEndpoints,
    totalSchemas: detailedStats.totalSchemas,
    totalSecurityPolicies: detailedStats.totalSecurityPolicies,
    singleSourceOfTruth: coreApiAnalysis.isConsolidated,
    internal: internalApis.length,
    external: externalApis.length,
    consuming: consumingApis.length,
    publishing: publishingApis.length,
    needsSeeding,
    realTimeMetrics: detailedStats.realTimeMetrics
  });

  const handleDownloadCollection = React.useCallback((integrationId: string) => {
    console.log('📥 Generating real Postman collection for:', integrationId);
    const collection = generatePostmanCollection(integrationId, consolidatedApis);
    
    if (collection) {
      try {
        const blob = new Blob([JSON.stringify(collection, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${collection.info.name.replace(/\s+/g, '-')}-collection.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: "✅ Collection Downloaded",
          description: `Real Postman collection with ${collection.item.length} endpoints downloaded successfully.`,
        });
      } catch (error) {
        console.error('❌ Error downloading collection:', error);
        toast({
          title: "❌ Download Failed",
          description: "Failed to generate collection. Please try again.",
          variant: "destructive",
        });
      }
    }
  }, [consolidatedApis, generatePostmanCollection, toast]);

  const handleViewDetails = React.useCallback((integrationId: string) => {
    console.log('👁️ View real details for:', integrationId);
    const integration = consolidatedApis.find(api => api.id === integrationId);
    if (integration) {
      const stats = detailedStats.apiBreakdown[integrationId];
      console.log('Real Integration details:', { integration, stats });
      toast({
        title: "Real Integration Details",
        description: `${integration.name}: ${stats?.endpointCount || 0} endpoints, ${stats?.schemaCompleteness || 0}% schema coverage`,
      });
    }
  }, [consolidatedApis, detailedStats, toast]);

  const handleViewDocumentation = React.useCallback((integrationId: string) => {
    console.log('📚 View real documentation for:', integrationId);
    const integration = consolidatedApis.find(api => api.id === integrationId);
    if (integration?.documentation_url) {
      window.open(integration.documentation_url, '_blank');
      toast({
        title: "📚 Real Documentation Opened",
        description: `Opening live documentation for ${integration.name}`,
      });
    } else {
      toast({
        title: "📚 No Documentation Available",
        description: `No documentation URL configured for this API`,
        variant: "destructive",
      });
    }
  }, [consolidatedApis, toast]);

  const handleCopyUrl = React.useCallback((integrationId: string) => {
    const integration = consolidatedApis.find(api => api.id === integrationId);
    const url = integration?.base_url || `${window.location.origin}/api/v1/${integrationId}`;
    navigator.clipboard.writeText(url);
    console.log('📋 Real URL copied:', url);
    toast({
      title: "📋 Real URL Copied",
      description: "Live API endpoint URL copied to clipboard.",
    });
  }, [consolidatedApis, toast]);

  const handleTestEndpoint = React.useCallback(async (integrationId: string, endpointId?: string): Promise<void> => {
    try {
      console.log('🧪 Testing real endpoint:', { integrationId, endpointId });
      const integration = consolidatedApis.find(api => api.id === integrationId);
      
      if (integration) {
        const testUrl = integration.base_url || `${window.location.origin}/api/v1/${integrationId}`;
        
        // Test with real endpoint
        const response = await fetch(testUrl, { 
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const stats = detailedStats.apiBreakdown[integrationId];
        console.log('✅ Real endpoint test result:', response.status, response.statusText);
        
        toast({
          title: "🧪 Real Endpoint Test Complete",
          description: `${integration.name}: ${response.status} ${response.statusText} | ${stats?.endpointCount || 0} endpoints available`,
          variant: response.ok ? "default" : "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Error testing real endpoint:', error);
      toast({
        title: "❌ Real Endpoint Test Failed",
        description: "Failed to test live endpoint. Please check connectivity.",
        variant: "destructive",
      });
      throw error;
    }
  }, [consolidatedApis, detailedStats, toast]);

  const handleCreateNew = React.useCallback(() => {
    console.log('➕ Creating new API service...');
    setCreateDialogOpen(true);
    toast({
      title: "➕ Create New API",
      description: "Opening API creation dialog for single source of truth...",
    });
  }, [toast]);

  // Real-time overview stats component
  const RealTimeOverviewStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Server className="h-6 w-6 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{detailedStats.realTimeMetrics.activeApis}</p>
              <p className="text-sm text-muted-foreground">Active APIs</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-green-500">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{detailedStats.totalEndpoints}</p>
              <p className="text-sm text-muted-foreground">Live Endpoints</p>
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
              <p className="text-sm text-muted-foreground">Real Schemas</p>
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
              <p className="text-sm text-muted-foreground">Security Policies</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-teal-500">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-teal-500" />
            <div>
              <p className="text-2xl font-bold">{Math.round(detailedStats.realTimeMetrics.schemaCompleteness)}%</p>
              <p className="text-sm text-muted-foreground">Schema Coverage</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-indigo-500">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-indigo-500" />
            <div>
              <p className="text-2xl font-bold">{Math.round(detailedStats.realTimeMetrics.documentationCoverage)}%</p>
              <p className="text-sm text-muted-foreground">Documentation</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const OverviewContent = () => (
    <div className="space-y-6">
      {/* Single Source of Truth Status */}
      <Card className={`border-l-4 ${coreApiAnalysis.isConsolidated ? 'border-l-green-500 bg-green-50' : 'border-l-red-500 bg-red-50'}`}>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-2">
            {coreApiAnalysis.isConsolidated ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            <h3 className="font-semibold">Single Source of Truth Status</h3>
          </div>
          <p className={`text-sm ${coreApiAnalysis.isConsolidated ? 'text-green-800' : 'text-red-800'}`}>
            {coreApiAnalysis.isConsolidated 
              ? '✅ Consolidated: internal_healthcare_api is the single source of truth'
              : `⚠️ ${coreApiAnalysis.coreApis.length} core APIs found - consolidation needed`
            }
          </p>
        </CardContent>
      </Card>

      {/* Show seeder if needed */}
      {needsSeeding && (
        <ApiDataSeeder />
      )}
      
      <RealTimeOverviewStats />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Real-time API Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span>Production APIs</span>
                <Badge variant="default">{detailedStats.realTimeMetrics.productionApis}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span>Avg Endpoints/API</span>
                <Badge variant="outline">{detailedStats.realTimeMetrics.averageEndpointsPerApi}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span>Security Compliance</span>
                <Badge variant="secondary">{Math.round(detailedStats.realTimeMetrics.securityCompliance)}%</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span>Total Mappings</span>
                <Badge variant="outline">{detailedStats.totalMappings}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Category Distribution (Real Data)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(detailedStats.categoryBreakdown).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium capitalize">{category}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
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
          <p className="text-muted-foreground">Loading real API data from single source of truth...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Database className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Error loading real API data: {(error as Error).message}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Healthcare API Services Platform</h1>
          <p className="text-muted-foreground">
            {coreApiAnalysis.isConsolidated ? (
              <span className="text-green-600 font-medium">
                ✅ Single Source of Truth: {consolidatedApis.length} APIs, {detailedStats.totalEndpoints} endpoints, {Math.round(detailedStats.realTimeMetrics.schemaCompleteness)}% schema coverage
              </span>
            ) : (
              <span className="text-red-600 font-medium">
                ⚠️ {coreApiAnalysis.coreApis.length} core APIs detected - consolidation required
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search real APIs and healthcare services..."
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
          <TabsTrigger value="overview">
            Overview
          </TabsTrigger>
          <TabsTrigger value="internal">Internal ({internalApis.length})</TabsTrigger>
          <TabsTrigger value="consuming">Consuming ({consumingApis.length})</TabsTrigger>
          <TabsTrigger value="publishing">Publishing ({publishingApis.length})</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="developer">Developer</TabsTrigger>
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
        </TabsList>

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
            integrations={consolidatedApis}
            onTestEndpoint={handleTestEndpoint}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
