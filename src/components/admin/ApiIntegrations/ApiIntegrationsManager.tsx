import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  Eye,
  TestTube,
  Users,
  Key
} from 'lucide-react';
import { useApiIntegrations } from '@/hooks/useApiIntegrations';
import { useRealtime } from '@/hooks/useRealtime';
import { apiIntegrationManager } from '@/utils/api/ApiIntegrationManager';
import { CreateIntegrationDialog } from './CreateIntegrationDialog';
import { IntegrationDetailView } from './IntegrationDetailView';
import { ApiOverviewSection } from './ApiOverviewSection';
import { ApiDocumentationViewer } from './ApiDocumentationViewer';
import { ApiTestingInterface } from './ApiTestingInterface';
import DeveloperPortal from './DeveloperPortal';
import ApiKeyManager from './ApiKeyManager';
import { useToast } from '@/hooks/use-toast';

const ApiIntegrationsManager = () => {
  const { toast } = useToast();
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
  const [showDocumentationViewer, setShowDocumentationViewer] = useState(false);
  const [showTestingInterface, setShowTestingInterface] = useState(false);
  const [selectedIntegrationForDocs, setSelectedIntegrationForDocs] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const internalApis = integrations?.filter(i => i.type === 'internal') || [];
  const externalApis = integrations?.filter(i => i.type === 'external') || [];

  const handleDownloadCollection = (integrationId: string) => {
    downloadPostmanCollection(integrationId);
  };

  const handleViewDetails = (integrationId: string) => {
    setSelectedIntegration(integrationId);
  };

  const handleViewDocumentation = (integrationId: string) => {
    setSelectedIntegrationForDocs(integrationId);
    setShowDocumentationViewer(true);
  };

  const handleOpenTesting = (integrationId: string) => {
    setSelectedIntegrationForDocs(integrationId);
    setShowTestingInterface(true);
  };

  const handleTestEndpoint = (endpointId: string) => {
    // Logic for testing specific endpoint
    console.log('Testing endpoint:', endpointId);
    toast({
      title: "Endpoint Test",
      description: "Opening endpoint test interface...",
    });
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code Copied",
      description: "Code has been copied to clipboard",
    });
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "URL Copied",
      description: "URL has been copied to clipboard",
    });
  };

  const selectedIntegrationData = selectedIntegrationForDocs 
    ? integrations?.find(i => i.id === selectedIntegrationForDocs)
    : null;

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
            Comprehensive API management with documentation, testing, and developer portal
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
              a.download = 'complete-api-documentation.json';
              a.click();
            }}
          >
            <FileText className="h-4 w-4 mr-2" />
            Export Complete Docs
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add External Integration
          </Button>
        </div>
      </div>

      {/* Enhanced Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
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
              <Shield className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-2xl font-bold">
                  {integrations?.reduce((acc, i) => acc + i.rlsPolicies.length, 0) || 0}
                </p>
                <p className="text-sm text-muted-foreground">RLS Policies</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-muted-foreground">Developers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-pink-500" />
              <div>
                <p className="text-2xl font-bold">8</p>
                <p className="text-sm text-muted-foreground">API Keys</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">API Overview</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="testing">Testing Hub</TabsTrigger>
          <TabsTrigger value="developer-portal">Developer Portal</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ApiOverviewSection
            internalApis={internalApis}
            externalApis={externalApis}
            onDownloadCollection={handleDownloadCollection}
            onViewDetails={handleViewDetails}
            onViewDocumentation={handleViewDocumentation}
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
                      <span className="font-medium">Security Policies</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      RLS policies and data mappings automatically synchronized
                    </p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-purple-500" />
                      <span className="font-medium">Documentation Sync</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      OpenAPI specs and test collections auto-generated
                    </p>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Latest Updates</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>API schemas refreshed</span>
                      <Badge variant="secondary">Just now</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>RLS policies synchronized</span>
                      <Badge variant="secondary">2 mins ago</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Test collections updated</span>
                      <Badge variant="secondary">5 mins ago</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                API Testing Hub
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Quick Testing</h4>
                  <div className="space-y-2">
                    {[...internalApis, ...externalApis].slice(0, 5).map((integration) => (
                      <div key={integration.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{integration.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {integration.endpoints.length} endpoints
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleOpenTesting(integration.id)}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Test
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Documentation & Testing Tools</h4>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => window.open('https://web.postman.co/', '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Postman Web
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => window.open('https://swagger.io/tools/swagger-ui/', '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Swagger UI
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        const allDocs = apiIntegrationManager.exportApiDocumentation();
                        const blob = new Blob([JSON.stringify(allDocs, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'api-testing-suite.json';
                        a.click();
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Testing Suite
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="developer-portal" className="space-y-6">
          <DeveloperPortal />
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-6">
          <ApiKeyManager />
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                API Marketplace Strategy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Market Readiness Checklist</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">✓</Badge>
                      <span className="text-sm">API Documentation Complete</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">✓</Badge>
                      <span className="text-sm">Authentication System</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">✓</Badge>
                      <span className="text-sm">Rate Limiting</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">○</Badge>
                      <span className="text-sm">SLA Definitions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">○</Badge>
                      <span className="text-sm">Pricing Model</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Recommended Process</h4>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 border rounded-lg">
                      <strong>1. Beta Program</strong>
                      <p className="text-muted-foreground">Invite selected partners to test APIs</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <strong>2. Module-Based Access</strong>
                      <p className="text-muted-foreground">Different tiers for different modules</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <strong>3. Tiered Pricing</strong>
                      <p className="text-muted-foreground">Free tier, professional, enterprise</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <strong>4. Support & SLA</strong>
                      <p className="text-muted-foreground">Define support levels and guarantees</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2">Suggested API Gateway Structure</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Sandbox:</strong> Free access with limited rate limits</p>
                  <p><strong>Development:</strong> Higher limits for registered developers</p>
                  <p><strong>Production:</strong> Commercial licenses with SLA guarantees</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  Create SLA Template
                </Button>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Pricing Tiers
                </Button>
                <Button variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Launch Beta Program
                </Button>
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

      <Dialog open={showDocumentationViewer} onOpenChange={setShowDocumentationViewer}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>API Documentation</DialogTitle>
          </DialogHeader>
          {selectedIntegrationData && (
            <ApiDocumentationViewer
              integration={selectedIntegrationData}
              onTestEndpoint={handleTestEndpoint}
              onCopyCode={handleCopyCode}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showTestingInterface} onOpenChange={setShowTestingInterface}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>API Testing Interface</DialogTitle>
          </DialogHeader>
          {selectedIntegrationData && (
            <ApiTestingInterface
              integration={selectedIntegrationData}
              onClose={() => setShowTestingInterface(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApiIntegrationsManager;
