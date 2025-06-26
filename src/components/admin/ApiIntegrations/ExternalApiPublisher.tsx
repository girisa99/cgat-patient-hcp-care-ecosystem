
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApiIntegrations } from '@/hooks/useApiIntegrations';
import { useExternalApiPublishing } from '@/hooks/useExternalApiPublishing';
import { useExternalApis } from '@/hooks/useExternalApis';
import { Loader2, Globe, Lock, Zap, Settings, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const ExternalApiPublisher = () => {
  const { internalApis, isLoading: isLoadingInternal } = useApiIntegrations();
  const { externalApis, isLoadingExternalApis, updateApiStatus } = useExternalApis();
  const {
    createDraft,
    isCreatingDraft,
    moveToReview,
    isMovingToReview,
    publishApi,
    isPublishing,
    completeWorkflow,
    isCompletingWorkflow,
    isAnyActionPending
  } = useExternalApiPublishing();

  const [selectedApiId, setSelectedApiId] = useState<string>('');
  const [publishingConfig, setPublishingConfig] = useState({
    external_name: '',
    external_description: '',
    version: '1.0.0',
    category: 'healthcare',
    visibility: 'private' as 'private' | 'public' | 'marketplace',
    pricing_model: 'free' as 'free' | 'freemium' | 'paid' | 'enterprise',
    base_url: '',
    documentation_url: '',
    sandbox_url: '',
    authentication_methods: ['api_key'],
    supported_formats: ['json'],
    tags: []
  });

  const handleCreateDraft = () => {
    if (!selectedApiId || !publishingConfig.external_name) {
      return;
    }

    console.log('🚀 Creating draft with config:', { selectedApiId, publishingConfig });
    
    createDraft({
      internalApiId: selectedApiId,
      config: publishingConfig
    });
  };

  const handleCompleteWorkflow = () => {
    if (!selectedApiId || !publishingConfig.external_name) {
      return;
    }

    console.log('🚀 Starting complete workflow:', { selectedApiId, publishingConfig });
    
    completeWorkflow({
      internalApiId: selectedApiId,
      config: publishingConfig
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Settings className="h-4 w-4 text-yellow-500" />;
      case 'review':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'published':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'deprecated':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Settings className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'review':
        return 'bg-blue-100 text-blue-800';
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'deprecated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const draftApis = externalApis.filter(api => api.status === 'draft');
  const reviewApis = externalApis.filter(api => api.status === 'review');
  const publishedApis = externalApis.filter(api => api.status === 'published');

  if (isLoadingInternal || isLoadingExternalApis) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading API integrations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">External API Publisher</h2>
          <p className="text-muted-foreground">
            Manage the complete publishing workflow for your APIs
          </p>
        </div>
      </div>

      <Tabs defaultValue="publish" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="publish">Publish New API</TabsTrigger>
          <TabsTrigger value="drafts">
            Drafts ({draftApis.length})
          </TabsTrigger>
          <TabsTrigger value="review">
            Review ({reviewApis.length})
          </TabsTrigger>
          <TabsTrigger value="published">
            Published ({publishedApis.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="publish" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Publish Internal API
              </CardTitle>
              <CardDescription>
                Configure and publish your internal API for external consumption
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="api-select">Select Internal API</Label>
                    <Select value={selectedApiId} onValueChange={setSelectedApiId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an API to publish" />
                      </SelectTrigger>
                      <SelectContent>
                        {internalApis.map((api) => (
                          <SelectItem key={api.id} value={api.id}>
                            {api.name} - {api.endpoints.length} endpoints
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="external-name">External API Name</Label>
                    <Input
                      id="external-name"
                      value={publishingConfig.external_name}
                      onChange={(e) => setPublishingConfig(prev => ({
                        ...prev,
                        external_name: e.target.value
                      }))}
                      placeholder="Enter external API name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={publishingConfig.external_description}
                      onChange={(e) => setPublishingConfig(prev => ({
                        ...prev,
                        external_description: e.target.value
                      }))}
                      placeholder="Describe your API"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="version">Version</Label>
                    <Input
                      id="version"
                      value={publishingConfig.version}
                      onChange={(e) => setPublishingConfig(prev => ({
                        ...prev,
                        version: e.target.value
                      }))}
                      placeholder="1.0.0"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={publishingConfig.category}
                      onValueChange={(value) => setPublishingConfig(prev => ({
                        ...prev,
                        category: value
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="visibility">Visibility</Label>
                    <Select
                      value={publishingConfig.visibility}
                      onValueChange={(value: 'private' | 'public' | 'marketplace') => 
                        setPublishingConfig(prev => ({
                          ...prev,
                          visibility: value
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">
                          <div className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            Private
                          </div>
                        </SelectItem>
                        <SelectItem value="public">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Public
                          </div>
                        </SelectItem>
                        <SelectItem value="marketplace">
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            Marketplace
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="pricing">Pricing Model</Label>
                    <Select
                      value={publishingConfig.pricing_model}
                      onValueChange={(value: 'free' | 'freemium' | 'paid' | 'enterprise') => 
                        setPublishingConfig(prev => ({
                          ...prev,
                          pricing_model: value
                        }))
                      }
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
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <Button
                  onClick={handleCreateDraft}
                  disabled={!selectedApiId || !publishingConfig.external_name || isAnyActionPending}
                  className="flex-1"
                >
                  {isCreatingDraft ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Settings className="h-4 w-4 mr-2" />
                  )}
                  Create Draft
                </Button>
                
                <Button
                  onClick={handleCompleteWorkflow}
                  disabled={!selectedApiId || !publishingConfig.external_name || isAnyActionPending}
                  variant="default"
                  className="flex-1"
                >
                  {isCompletingWorkflow ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Globe className="h-4 w-4 mr-2" />
                  )}
                  Complete Publishing Workflow
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drafts" className="space-y-4">
          <div className="grid gap-4">
            {draftApis.map((api) => (
              <Card key={api.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{api.external_name}</CardTitle>
                      <Badge className={getStatusColor(api.status)}>
                        {getStatusIcon(api.status)}
                        {api.status}
                      </Badge>
                    </div>
                    <Button
                      onClick={() => moveToReview(api.id)}
                      disabled={isMovingToReview}
                      size="sm"
                    >
                      {isMovingToReview ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Clock className="h-4 w-4 mr-2" />
                      )}
                      Move to Review
                    </Button>
                  </div>
                  <CardDescription>{api.external_description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
            {draftApis.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No draft APIs found. Create a new draft above.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="review" className="space-y-4">
          <div className="grid gap-4">
            {reviewApis.map((api) => (
              <Card key={api.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{api.external_name}</CardTitle>
                      <Badge className={getStatusColor(api.status)}>
                        {getStatusIcon(api.status)}
                        {api.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => updateApiStatus(api.id, 'draft')}
                        variant="outline"
                        size="sm"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Back to Draft
                      </Button>
                      <Button
                        onClick={() => publishApi(api.id)}
                        disabled={isPublishing}
                        size="sm"
                      >
                        {isPublishing ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Publish
                      </Button>
                    </div>
                  </div>
                  <CardDescription>{api.external_description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
            {reviewApis.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No APIs in review. Move drafts to review first.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="published" className="space-y-4">
          <div className="grid gap-4">
            {publishedApis.map((api) => (
              <Card key={api.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{api.external_name}</CardTitle>
                      <Badge className={getStatusColor(api.status)}>
                        {getStatusIcon(api.status)}
                        {api.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => updateApiStatus(api.id, 'deprecated')}
                        variant="outline"
                        size="sm"
                      >
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Deprecate
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    {api.external_description}
                    {api.published_at && (
                      <div className="text-sm text-muted-foreground mt-1">
                        Published: {new Date(api.published_at).toLocaleDateString()}
                      </div>
                    )}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
            {publishedApis.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No published APIs found. Complete the publishing workflow above.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExternalApiPublisher;
