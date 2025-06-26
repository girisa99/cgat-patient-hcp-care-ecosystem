import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Globe, 
  Rocket, 
  Settings, 
  Eye, 
  Users, 
  TrendingUp,
  Plus,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  ArrowDown,
  AlertTriangle
} from 'lucide-react';
import { useApiIntegrations } from '@/hooks/useApiIntegrations';
import { useExternalApis } from '@/hooks/useExternalApis';
import PublishableApisList from './PublishableApisList';
import ExternalApiConfigDialog from './ExternalApiConfigDialog';
import ExternalApiAnalyticsDialog from './ExternalApiAnalyticsDialog';

// Helper function to get status color
const getStatusColor = (status: string) => {
  switch (status) {
    case 'published':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'review':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'draft':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'deprecated':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const ExternalApiPublisher = () => {
  const { integrations } = useApiIntegrations();
  const { 
    externalApis, 
    publishedApis, 
    marketplaceStats, 
    publishApi, 
    isPublishing,
    updateApiStatus,
    isUpdatingStatus
  } = useExternalApis();

  const [selectedApi, setSelectedApi] = useState<string | null>(null);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false);
  const [configApi, setConfigApi] = useState<any>(null);
  const [analyticsApi, setAnalyticsApi] = useState<any>(null);
  
  const [publishForm, setPublishForm] = useState({
    external_name: '',
    external_description: '',
    version: '1.0.0',
    status: 'draft' as const,
    visibility: 'private' as const,
    pricing_model: 'free' as const,
    category: 'general',
    documentation_url: '',
    tags: [] as string[],
    rate_limits: {
      requests: 1000,
      period: 'hour'
    },
    authentication_methods: ['api_key'],
    supported_formats: ['json'],
    marketplace_config: {},
    analytics_config: {}
  });

  const handlePublishApi = (apiId: string, apiName: string) => {
    console.log('🚀 Publishing API - Starting:', { apiId, apiName });
    
    setSelectedApi(apiId);
    const integration = integrations?.find(i => i.id === apiId);
    console.log('📋 Found integration:', integration);
    
    const newFormData = {
      external_name: apiName,
      external_description: integration?.description || '',
      version: integration?.version || '1.0.0',
      status: 'draft' as const,
      visibility: 'private' as const,
      pricing_model: 'free' as const,
      category: integration?.category || 'general',
      documentation_url: integration?.externalDocumentation?.apiReference || '',
      tags: [] as string[],
      rate_limits: {
        requests: 1000,
        period: 'hour'
      },
      authentication_methods: ['api_key'],
      supported_formats: ['json'],
      marketplace_config: {},
      analytics_config: {}
    };
    
    console.log('📝 Setting form data:', newFormData);
    setPublishForm(newFormData);
    setShowPublishDialog(true);
  };

  const handleSubmitPublish = async () => {
    if (!selectedApi) {
      console.error('❌ No selected API for publishing');
      return;
    }

    console.log('📤 Submitting publish with data:', {
      internalApiId: selectedApi,
      config: publishForm
    });

    try {
      console.log('🔄 Calling publishApi...');
      await publishApi({
        internalApiId: selectedApi,
        config: publishForm
      });

      console.log('✅ API published successfully');
      setShowPublishDialog(false);
      
      // Reset form to initial state
      setPublishForm({
        external_name: '',
        external_description: '',
        version: '1.0.0',
        status: 'draft',
        visibility: 'private',
        pricing_model: 'free',
        category: 'general',
        documentation_url: '',
        tags: [],
        rate_limits: { requests: 1000, period: 'hour' },
        authentication_methods: ['api_key'],
        supported_formats: ['json'],
        marketplace_config: {},
        analytics_config: {}
      });
      setSelectedApi(null);
    } catch (error) {
      console.error('❌ Failed to publish API:', error);
    }
  };

  const handleStatusUpdate = (externalApiId: string, newStatus: any) => {
    console.log('🔄 Updating API status:', { externalApiId, newStatus });
    updateApiStatus({ externalApiId, status: newStatus });
  };

  const handleConfigureApi = (api: any) => {
    setConfigApi(api);
    setShowConfigDialog(true);
  };

  const handleViewAnalytics = (api: any) => {
    setAnalyticsApi(api);
    setShowAnalyticsDialog(true);
  };

  const handleRevertToDraft = (api: any) => {
    handleStatusUpdate(api.id, 'draft');
  };

  const handleChangeVisibility = (api: any, newVisibility: string) => {
    // This would need to be implemented in the backend to update visibility
    console.log('Changing visibility:', api.id, newVisibility);
  };

  // Calculate counts - fixed logic
  const draftApis = externalApis.filter(api => api.status === 'draft');
  const reviewApis = externalApis.filter(api => api.status === 'review');
  const draftAndReviewCount = draftApis.length + reviewApis.length;

  // Debug logging
  console.log('🔍 External API Publisher Debug:', {
    integrations: integrations?.length || 0,
    externalApis: externalApis?.length || 0,
    publishedApis: publishedApis?.length || 0,
    selectedApi,
    showPublishDialog,
    isPublishing
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">External API Publisher</h3>
          <p className="text-muted-foreground">
            Publish your internal APIs for external consumption and marketplace distribution
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{publishedApis.length}</p>
                <p className="text-sm text-muted-foreground">Published APIs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{marketplaceStats?.approvedApplications || 0}</p>
                <p className="text-sm text-muted-foreground">Developer Apps</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{marketplaceStats?.approvedListings || 0}</p>
                <p className="text-sm text-muted-foreground">Marketplace</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{draftAndReviewCount}</p>
                <p className="text-sm text-muted-foreground">Drafts & Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="available" className="space-y-4">
        <TabsList>
          <TabsTrigger value="available">Available to Publish</TabsTrigger>
          <TabsTrigger value="published">Published APIs</TabsTrigger>
          <TabsTrigger value="drafts">Drafts & Review ({draftAndReviewCount})</TabsTrigger>
          <TabsTrigger value="documentation">
            <FileText className="h-4 w-4 mr-1" />
            Documentation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          <PublishableApisList onPublishApi={handlePublishApi} />
        </TabsContent>

        <TabsContent value="published" className="space-y-4">
          <div className="grid gap-4">
            {publishedApis.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="text-lg font-medium mb-2">No Published APIs</h4>
                  <p className="text-muted-foreground">No APIs have been published externally yet.</p>
                </CardContent>
              </Card>
            ) : (
              publishedApis.map((api) => (
                <Card key={api.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{api.external_name}</h4>
                          <Badge className={getStatusColor(api.status)}>
                            {api.status}
                          </Badge>
                          <Badge variant="outline">{api.visibility}</Badge>
                          <Badge variant="secondary">{api.pricing_model}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {api.external_description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Version {api.version}</span>
                          <span>•</span>
                          <span>Published {new Date(api.published_at!).toLocaleDateString()}</span>
                          {api.base_url && (
                            <>
                              <span>•</span>
                              <a href={api.base_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                View API
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleConfigureApi(api)}
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          Configure
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewAnalytics(api)}
                        >
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Analytics
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleRevertToDraft(api)}
                          disabled={isUpdatingStatus}
                        >
                          <ArrowDown className="h-3 w-3 mr-1" />
                          Revert
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="drafts" className="space-y-4">
          <div className="grid gap-4">
            {draftAndReviewCount === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="text-lg font-medium mb-2">No Draft or Review APIs</h4>
                  <p className="text-muted-foreground">No APIs are currently in draft or review status.</p>
                </CardContent>
              </Card>
            ) : (
              [...draftApis, ...reviewApis].map((api) => (
                <Card key={api.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{api.external_name}</h4>
                          <Badge className={getStatusColor(api.status)}>
                            {api.status}
                          </Badge>
                          <Badge variant="outline">{api.visibility}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {api.external_description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Version {api.version}</span>
                          <span>•</span>
                          <span>Created {new Date(api.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStatusUpdate(api.id, 'published')}
                          disabled={isUpdatingStatus}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Publish
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleConfigureApi(api)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="documentation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                External API Publishing Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold mb-4">Getting Started with External API Publishing</h3>
                <p className="text-muted-foreground mb-6">
                  Transform your internal APIs into secure, manageable external endpoints that can be consumed by developers, partners, and third-party applications.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Rocket className="h-4 w-4 text-blue-500" />
                      Quick Publishing Process
                    </h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                      <li>Select an internal API from the "Available to Publish" tab</li>
                      <li>Configure external settings (name, description, visibility)</li>
                      <li>Set authentication and rate limiting preferences</li>
                      <li>Review and publish to make it available externally</li>
                    </ol>
                  </Card>

                  <Card className="p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Readiness Checklist
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>✓ At least 1 endpoint defined (30 points)</li>
                      <li>✓ Security policies configured (25 points)</li>
                      <li>✓ Data mappings established (25 points)</li>
                      <li>✓ Detailed description (20+ chars) (20 points)</li>
                      <li className="text-xs text-amber-600">Need 40+ points to review, 70+ to publish</li>
                    </ul>
                  </Card>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold mb-3">API Visibility Options</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="border rounded-lg p-3">
                        <h5 className="font-medium text-blue-600">Private</h5>
                        <p className="text-sm text-muted-foreground">Only accessible with direct API key invitation</p>
                      </div>
                      <div className="border rounded-lg p-3">
                        <h5 className="font-medium text-green-600">Public</h5>
                        <p className="text-sm text-muted-foreground">Listed in public developer directory</p>
                      </div>
                      <div className="border rounded-lg p-3">
                        <h5 className="font-medium text-purple-600">Marketplace</h5>
                        <p className="text-sm text-muted-foreground">Featured in developer marketplace with enhanced discovery</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold mb-3">Pricing Models</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-3">
                        <h5 className="font-medium text-green-600">Free</h5>
                        <p className="text-sm text-muted-foreground">No cost to developers, great for community APIs</p>
                      </div>
                      <div className="border rounded-lg p-3">
                        <h5 className="font-medium text-blue-600">Freemium</h5>
                        <p className="text-sm text-muted-foreground">Free tier with premium features available</p>
                      </div>
                      <div className="border rounded-lg p-3">
                        <h5 className="font-medium text-orange-600">Paid</h5>
                        <p className="text-sm text-muted-foreground">Subscription-based access with usage tiers</p>
                      </div>
                      <div className="border rounded-lg p-3">
                        <h5 className="font-medium text-purple-600">Enterprise</h5>
                        <p className="text-sm text-muted-foreground">Custom pricing for large organizations</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">💡 Best Practices</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Provide comprehensive API documentation with examples</li>
                      <li>• Set appropriate rate limits to prevent abuse</li>
                      <li>• Use semantic versioning for API updates</li>
                      <li>• Monitor usage analytics to understand developer needs</li>
                      <li>• Maintain backward compatibility when possible</li>
                    </ul>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="font-semibold text-amber-800 mb-2">⚠️ Security Considerations</h4>
                    <ul className="text-sm text-amber-700 space-y-1">
                      <li>• Always require authentication for sensitive endpoints</li>
                      <li>• Implement proper rate limiting and throttling</li>
                      <li>• Validate all input data and sanitize responses</li>
                      <li>• Use HTTPS for all external API communications</li>
                      <li>• Log API usage for security monitoring</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Publish Dialog */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Publish Internal API</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="external-name">External API Name</Label>
                <Input
                  id="external-name"
                  value={publishForm.external_name}
                  onChange={(e) => {
                    console.log('📝 Updating external_name:', e.target.value);
                    setPublishForm(prev => ({ ...prev, external_name: e.target.value }));
                  }}
                  placeholder="Healthcare API v1"
                />
              </div>
              <div>
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  value={publishForm.version}
                  onChange={(e) => {
                    console.log('📝 Updating version:', e.target.value);
                    setPublishForm(prev => ({ ...prev, version: e.target.value }));
                  }}
                  placeholder="1.0.0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={publishForm.external_description}
                onChange={(e) => {
                  console.log('📝 Updating external_description:', e.target.value);
                  setPublishForm(prev => ({ ...prev, external_description: e.target.value }));
                }}
                placeholder="Comprehensive healthcare API for patient data management..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Status</Label>
                <Select 
                  value={publishForm.status} 
                  onValueChange={(value: any) => {
                    console.log('📝 Updating status:', value);
                    setPublishForm(prev => ({ ...prev, status: value }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Visibility</Label>
                <Select 
                  value={publishForm.visibility} 
                  onValueChange={(value: any) => {
                    console.log('📝 Updating visibility:', value);
                    setPublishForm(prev => ({ ...prev, visibility: value }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="marketplace">Marketplace</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Pricing Model</Label>
                <Select 
                  value={publishForm.pricing_model} 
                  onValueChange={(value: any) => {
                    console.log('📝 Updating pricing_model:', value);
                    setPublishForm(prev => ({ ...prev, pricing_model: value }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="freemium">Freemium</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="documentation-url">Documentation URL</Label>
              <Input
                id="documentation-url"
                value={publishForm.documentation_url}
                onChange={(e) => {
                  console.log('📝 Updating documentation_url:', e.target.value);
                  setPublishForm(prev => ({ ...prev, documentation_url: e.target.value }));
                }}
                placeholder="https://docs.yourapi.com"
              />
            </div>

            {/* Debug info in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-gray-100 p-3 rounded text-xs">
                <strong>Debug Info:</strong>
                <br />Selected API: {selectedApi}
                <br />Form Valid: {!!(selectedApi && publishForm.external_name)}
                <br />Publishing: {isPublishing ? 'Yes' : 'No'}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPublishDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitPublish} 
                disabled={!selectedApi || !publishForm.external_name || isPublishing}
              >
                {isPublishing ? 'Publishing...' : 'Publish API'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Configuration Dialog */}
      <ExternalApiConfigDialog
        open={showConfigDialog}
        onOpenChange={setShowConfigDialog}
        api={configApi}
      />

      {/* Analytics Dialog */}
      <ExternalApiAnalyticsDialog
        open={showAnalyticsDialog}
        onOpenChange={setShowAnalyticsDialog}
        api={analyticsApi}
      />
    </div>
  );
};

export default ExternalApiPublisher;
