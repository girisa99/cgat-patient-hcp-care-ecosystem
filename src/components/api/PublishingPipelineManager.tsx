import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, RefreshCw, Plus, Search, Eye, Settings,
  CheckCircle, Clock, AlertCircle, ArrowRight,
  FileText, Zap, Globe
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';
import { useMasterApiServices } from '@/hooks/useMasterApiServices';

interface PublishingConfig {
  source_api_id: string;
  external_name: string;
  external_description: string;
  visibility: 'public' | 'private' | 'partner';
  pricing_model: 'free' | 'freemium' | 'paid' | 'enterprise';
  rate_limit: number;
  version: string;
  category: string;
}

const PublishingPipelineManager: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [publishingConfig, setPublishingConfig] = useState<PublishingConfig>({
    source_api_id: '',
    external_name: '',
    external_description: '',
    visibility: 'public',
    pricing_model: 'free',
    rate_limit: 1000,
    version: '1.0.0',
    category: ''
  });

  const { showSuccess, showError } = useMasterToast();
  const queryClient = useQueryClient();
  const { apiServices } = useMasterApiServices();

  // Get published APIs from the external APIs table
  const { data: publishedApis = [], isLoading } = useQuery({
    queryKey: ['published-external-apis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_integration_registry')
        .select('*')
        .eq('direction', 'outbound')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 300000,
  });

  // Get pending APIs (internal APIs that can be published)
  const pendingApis = apiServices?.filter(api => 
    api.status === 'active' && 
    !publishedApis.some(pub => pub.name === api.name)
  ) || [];

  // Create publishing mutation
  const publishApiMutation = useMutation({
    mutationFn: async (config: PublishingConfig) => {
      // First get the source API details
      const sourceApi = apiServices?.find(api => api.id === config.source_api_id);
      if (!sourceApi) throw new Error('Source API not found');

      // Create external API entry
      const { data, error } = await supabase
        .from('api_integration_registry')
        .insert([{
          name: config.external_name,
          description: config.external_description,
          type: 'external',
          direction: 'outbound',
          category: config.category,
          status: 'active',
          version: config.version,
          base_url: sourceApi.base_url,
          purpose: `Published external API for ${config.external_name}`,
          contact_info: {
            support_email: 'api-support@healthcare.com',
            documentation_url: `/api/docs/${config.external_name.toLowerCase().replace(/\s+/g, '-')}`
          },
          rate_limits: {
            requests_per_hour: config.rate_limit,
            burst_limit: Math.floor(config.rate_limit / 10)
          },
          lifecycle_stage: 'production'
        }])
        .select()
        .maybeSingle();

      if (error || !data) throw error ?? new Error('Insert returned no data');
      return data;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['published-external-apis'] });
      queryClient.invalidateQueries({ queryKey: ['master-api-services'] });
      setShowPublishDialog(false);
      setPublishingConfig({
        source_api_id: '',
        external_name: '',
        external_description: '',
        visibility: 'public',
        pricing_model: 'free',
        rate_limit: 1000,
        version: '1.0.0',
        category: ''
      });
      showSuccess('API published successfully to external registry');
    },
    onError: (error) => {
      showError('Failed to publish API');
      console.error('Publishing error:', error);
    }
  });

  // Update API status mutation
  const updateApiStatusMutation = useMutation({
    mutationFn: async ({ apiId, status }: { apiId: string, status: string }) => {
      const { data, error } = await supabase
        .from('api_integration_registry')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', apiId)
        .select()
        .maybeSingle();

      if (error || !data) throw error ?? new Error('Update returned no data');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['published-external-apis'] });
      showSuccess('API status updated successfully');
    },
    onError: () => {
      showError('Failed to update API status');
    }
  });

  const filteredPublishedApis = publishedApis.filter(api =>
    api.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    api.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    api.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPendingApis = pendingApis.filter(api =>
    api.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    api.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    api.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePublishApi = () => {
    if (!publishingConfig.source_api_id || !publishingConfig.external_name.trim()) {
      showError('Please select a source API and provide an external name');
      return;
    }
    
    publishApiMutation.mutate(publishingConfig);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'deprecated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'public': return 'bg-blue-100 text-blue-800';
      case 'private': return 'bg-gray-100 text-gray-800';
      case 'partner': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Upload className="h-6 w-6" />
            <span>Publishing Pipeline</span>
          </h2>
          <p className="text-gray-600">Manage API publishing workflow and external API registry</p>
        </div>
        <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Publish API
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Publish API to External Registry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Publishing Notice</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Publishing will make this API available to external consumers. Ensure all security and compliance requirements are met.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Source API</label>
                <Select 
                  value={publishingConfig.source_api_id} 
                  onValueChange={(value) => {
                    const sourceApi = apiServices?.find(api => api.id === value);
                    setPublishingConfig(prev => ({
                      ...prev,
                      source_api_id: value,
                      external_name: sourceApi?.name || '',
                      external_description: sourceApi?.description || '',
                      category: sourceApi?.category || ''
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select internal API to publish" />
                  </SelectTrigger>
                  <SelectContent>
                    {pendingApis.map(api => (
                      <SelectItem key={api.id} value={api.id}>
                        {api.name} ({api.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">External Name</label>
                <Input
                  placeholder="Public name for this API"
                  value={publishingConfig.external_name}
                  onChange={(e) => setPublishingConfig(prev => ({ ...prev, external_name: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Public Description</label>
                <Textarea
                  placeholder="Description for external consumers..."
                  value={publishingConfig.external_description}
                  onChange={(e) => setPublishingConfig(prev => ({ ...prev, external_description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Visibility</label>
                  <Select 
                    value={publishingConfig.visibility} 
                    onValueChange={(value: 'public' | 'private' | 'partner') => 
                      setPublishingConfig(prev => ({ ...prev, visibility: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public (discoverable)</SelectItem>
                      <SelectItem value="private">Private (invite only)</SelectItem>
                      <SelectItem value="partner">Partner (restricted)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Pricing Model</label>
                  <Select 
                    value={publishingConfig.pricing_model} 
                    onValueChange={(value: 'free' | 'freemium' | 'paid' | 'enterprise') => 
                      setPublishingConfig(prev => ({ ...prev, pricing_model: value }))
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Rate Limit (req/hour)</label>
                  <Input
                    type="number"
                    placeholder="1000"
                    value={publishingConfig.rate_limit}
                    onChange={(e) => setPublishingConfig(prev => ({ ...prev, rate_limit: parseInt(e.target.value) || 1000 }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Version</label>
                  <Input
                    placeholder="1.0.0"
                    value={publishingConfig.version}
                    onChange={(e) => setPublishingConfig(prev => ({ ...prev, version: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowPublishDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handlePublishApi}
                  disabled={publishApiMutation.isPending}
                >
                  {publishApiMutation.isPending ? 'Publishing...' : 'Publish API'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Published APIs</p>
                <p className="text-2xl font-bold">{publishedApis.length}</p>
              </div>
              <Globe className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending APIs</p>
                <p className="text-2xl font-bold">{pendingApis.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active APIs</p>
                <p className="text-2xl font-bold">
                  {publishedApis.filter(api => api.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold">
                  {publishedApis.reduce((acc, api) => {
                    const rateLimits = api.rate_limits as any;
                    return acc + (rateLimits?.requests_per_hour || 0);
                  }, 0)}
                </p>
              </div>
              <Zap className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search APIs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="pending">Pending Publication ({pendingApis.length})</TabsTrigger>
          <TabsTrigger value="published">Published APIs ({publishedApis.length})</TabsTrigger>
          <TabsTrigger value="review">Review Process</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>APIs Ready for Publication</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredPendingApis.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="font-semibold mb-2">No APIs Pending Publication</h3>
                  <p className="text-sm mb-4">All active internal APIs have been published or are not ready for external publication.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPendingApis.map((api) => (
                    <div key={api.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{api.name}</h3>
                            <Badge variant="outline">{api.category}</Badge>
                            <Badge className={getStatusColor(api.status)}>
                              {api.status}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3">
                            {api.description}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Created: {new Date(api.created_at).toLocaleDateString()}</span>
                            <span>Type: {api.type}</span>
                            <span>Direction: {api.direction}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setPublishingConfig(prev => ({
                                ...prev,
                                source_api_id: api.id,
                                external_name: api.name,
                                external_description: api.description || '',
                                category: api.category || ''
                              }));
                              setShowPublishDialog(true);
                            }}
                          >
                            <Upload className="h-3 w-3 mr-1" />
                            Publish
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            Preview
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="published" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Published External APIs</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredPublishedApis.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="font-semibold mb-2">No Published APIs</h3>
                  <p className="text-sm mb-4">No APIs have been published to the external registry yet.</p>
                  <Button onClick={() => setShowPublishDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Publish First API
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPublishedApis.map((api) => (
                    <div key={api.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{api.name}</h3>
                            <Badge className={getStatusColor(api.status)}>
                              {api.status}
                            </Badge>
                            <Badge variant="outline">v{api.version}</Badge>
                            <Badge variant="outline">{api.category}</Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3">
                            {api.description}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Published: {new Date(api.created_at).toLocaleDateString()}</span>
                            <span>Rate Limit: {(api.rate_limits as any)?.requests_per_hour || 'N/A'}/hour</span>
                            <span>Stage: {api.lifecycle_stage}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            View Live
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="h-3 w-3 mr-1" />
                            Manage
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateApiStatusMutation.mutate({
                              apiId: api.id,
                              status: api.status === 'active' ? 'deprecated' : 'active'
                            })}
                          >
                            {api.status === 'active' ? 'Deprecate' : 'Activate'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Publication Review Process</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">1</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Preparation & Documentation</h3>
                    <p className="text-sm text-gray-600">Ensure API documentation, security review, and testing are complete</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>

                <div className="flex items-center space-x-4 p-4 bg-yellow-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">2</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Review & Approval</h3>
                    <p className="text-sm text-gray-600">Technical and business review process for external publication</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>

                <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">3</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Publication & Monitoring</h3>
                    <p className="text-sm text-gray-600">API goes live with monitoring, analytics, and support enabled</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Review Checklist</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>API documentation complete and up-to-date</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Security review and penetration testing completed</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Rate limiting and throttling configured</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Monitoring and alerting set up</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Support documentation and processes defined</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PublishingPipelineManager;