
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
  Clock
} from 'lucide-react';
import { useApiIntegrations } from '@/hooks/useApiIntegrations';
import { useExternalApis } from '@/hooks/useExternalApis';
import PublishableApisList from './PublishableApisList';

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
  const [publishForm, setPublishForm] = useState({
    external_name: '',
    external_description: '',
    version: '1.0.0',
    status: 'draft' as const,
    visibility: 'private' as const,
    pricing_model: 'free' as const,
    documentation_url: '',
    tags: [] as string[],
    rate_limits: {
      requests: 1000,
      period: 'hour'
    },
    authentication_methods: ['api_key']
  });

  const handlePublishApi = (apiId: string, apiName: string) => {
    setSelectedApi(apiId);
    const integration = integrations?.find(i => i.id === apiId);
    setPublishForm(prev => ({
      ...prev,
      external_name: apiName,
      external_description: integration?.description || '',
      version: integration?.version || '1.0.0'
    }));
    setShowPublishDialog(true);
  };

  const handleSubmitPublish = () => {
    if (!selectedApi) return;

    publishApi({
      internalApiId: selectedApi,
      config: {
        ...publishForm,
        marketplace_config: {},
        analytics_config: {},
        supported_formats: ['json']
      }
    });

    setShowPublishDialog(false);
    setPublishForm({
      external_name: '',
      external_description: '',
      version: '1.0.0',
      status: 'draft',
      visibility: 'private',
      pricing_model: 'free',
      documentation_url: '',
      tags: [],
      rate_limits: { requests: 1000, period: 'hour' },
      authentication_methods: ['api_key']
    });
    setSelectedApi(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500';
      case 'review': return 'bg-yellow-500';
      case 'draft': return 'bg-gray-500';
      case 'deprecated': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleStatusUpdate = (externalApiId: string, newStatus: any) => {
    updateApiStatus({ externalApiId, status: newStatus });
  };

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
                <p className="text-2xl font-bold">{marketplaceStats?.totalPublishedApis || 0}</p>
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
                <p className="text-2xl font-bold">{marketplaceStats?.pendingApplications || 0}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="available" className="space-y-4">
        <TabsList>
          <TabsTrigger value="available">Available to Publish</TabsTrigger>
          <TabsTrigger value="published">Published APIs</TabsTrigger>
          <TabsTrigger value="drafts">Drafts & Review</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          <PublishableApisList onPublishApi={handlePublishApi} />
        </TabsContent>

        <TabsContent value="published" className="space-y-4">
          <div className="grid gap-4">
            {publishedApis.map((api) => (
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
                      <Button size="sm" variant="outline">
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        Analytics
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="drafts" className="space-y-4">
          <div className="grid gap-4">
            {externalApis.filter(api => api.status !== 'published').map((api) => (
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
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
                  onChange={(e) => setPublishForm(prev => ({ ...prev, external_name: e.target.value }))}
                  placeholder="Healthcare API v1"
                />
              </div>
              <div>
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  value={publishForm.version}
                  onChange={(e) => setPublishForm(prev => ({ ...prev, version: e.target.value }))}
                  placeholder="1.0.0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={publishForm.external_description}
                onChange={(e) => setPublishForm(prev => ({ ...prev, external_description: e.target.value }))}
                placeholder="Comprehensive healthcare API for patient data management..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Status</Label>
                <Select 
                  value={publishForm.status} 
                  onValueChange={(value: any) => setPublishForm(prev => ({ ...prev, status: value }))}
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
                  onValueChange={(value: any) => setPublishForm(prev => ({ ...prev, visibility: value }))}
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
                  onValueChange={(value: any) => setPublishForm(prev => ({ ...prev, pricing_model: value }))}
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
                onChange={(e) => setPublishForm(prev => ({ ...prev, documentation_url: e.target.value }))}
                placeholder="https://docs.yourapi.com"
              />
            </div>

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
    </div>
  );
};

export default ExternalApiPublisher;
