import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ExternalLink, Upload, RefreshCw, Plus, Search,
  Globe, Code, Settings, CheckCircle, Clock,
  Eye, Map, FileText
} from "lucide-react";
import { useExternalApis } from '@/hooks/useExternalApis';
import { useExternalApiPublishing } from '@/hooks/useExternalApiPublishing';
import { useMasterApiServices } from '@/hooks/useMasterApiServices';

const ExternalIntegrationTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('external');
  
  const {
    externalApis,
    publishedApis,
    isLoadingExternalApis
  } = useExternalApis();

  const { apiServices } = useMasterApiServices();

  const {
    moveToReview,
    publishApi
  } = useExternalApiPublishing();

  // Get external APIs from main registry (direction = 'external' or type = 'external')
  const externalIntegrationApis = apiServices?.filter(api => 
    api.direction === 'external' || 
    api.type === 'external' ||
    api.direction === 'inbound' || 
    api.direction === 'bidirectional'
  ) || [];

  // Transform integration APIs to match external API format
  const transformedIntegrationApis = externalIntegrationApis.map(api => ({
    id: api.id,
    external_name: api.name,
    external_description: api.description || '',
    published_at: api.created_at,
    visibility: 'public' as const,
    pricing_model: 'free' as const,
    status: api.status,
    category: api.category,
    created_at: api.created_at,
    base_url: api.base_url,
    version: '1.0.0'
  }));

  // Combine with published external APIs
  const allExternalApis = [
    ...transformedIntegrationApis,
    ...(externalApis || [])
  ];

  // Filter external APIs based on search
  const filteredExternalApis = allExternalApis.filter(api =>
    api.external_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    api.external_description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    api.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter published APIs based on search
  const filteredPublishedApis = (publishedApis || []).filter(api =>
    api.external_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    api.external_description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefresh = () => {
    console.log('Refreshing external integrations...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">External Integration Management</h2>
          <p className="text-gray-600">Manage external APIs, publishing pipeline, and field mappings</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleRefresh} variant="outline" disabled={isLoadingExternalApis}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingExternalApis ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Integration
          </Button>
        </div>
      </div>

      {/* Integration Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">External APIs</p>
                <p className="text-2xl font-bold text-blue-900">{externalApis?.length || 0}</p>
              </div>
              <ExternalLink className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Published</p>
                <p className="text-2xl font-bold text-green-900">{publishedApis?.length || 0}</p>
              </div>
              <Upload className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">In Review</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {externalApis?.filter(api => api.status === 'review').length || 0}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Mappings</p>
                <p className="text-2xl font-bold text-purple-900">
                  {externalApis?.length || 0}
                </p>
              </div>
              <Map className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search integrations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Sub-tabs for different integration aspects */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="external">External APIs</TabsTrigger>
          <TabsTrigger value="publishing">Publishing Pipeline</TabsTrigger>
          <TabsTrigger value="mappings">Field Mappings</TabsTrigger>
        </TabsList>

        <TabsContent value="external" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ExternalLink className="h-5 w-5" />
                <span>External API Integrations ({filteredExternalApis.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredExternalApis.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ExternalLink className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="font-semibold mb-2">
                    {searchQuery ? 'No APIs Match Your Search' : 'No External API Integrations'}
                  </h3>
                  <p className="text-sm mb-4">
                    {searchQuery 
                      ? 'Try adjusting your search terms.'
                      : 'No external APIs have been integrated yet.'
                    }
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Integration
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredExternalApis.map((api) => (
                    <Card key={api.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">{api.external_name}</h3>
                              <Badge variant={
                                api.status === 'published' ? "default" :
                                api.status === 'draft' ? "secondary" : "outline"
                              }>
                                {api.status}
                              </Badge>
                              <Badge variant="outline">v{api.version}</Badge>
                              {api.category && <Badge variant="outline">{api.category}</Badge>}
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-3">
                              {api.external_description}
                            </p>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>Created: {new Date(api.created_at).toLocaleDateString()}</span>
                              {api.published_at && (
                                <span>Published: {new Date(api.published_at).toLocaleDateString()}</span>
                              )}
                              <span>Pricing: {api.pricing_model}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              Details
                            </Button>
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4 mr-1" />
                              Configure
                            </Button>
                            {api.base_url && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={api.base_url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  Open
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="publishing" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Publishing Pipeline ({publishedApis?.length || 0})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredPublishedApis.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="font-semibold mb-2">No APIs in Publishing Pipeline</h3>
                  <p className="text-sm mb-4">Start by publishing an internal API to external consumers.</p>
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Publish API
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPublishedApis.map((api) => (
                    <Card key={api.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">{api.external_name}</h3>
                              <Badge variant="default">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Published
                              </Badge>
                              <Badge variant="outline">v{api.version}</Badge>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-3">
                              {api.external_description}
                            </p>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>Published: {new Date(api.published_at || api.created_at).toLocaleDateString()}</span>
                              <span>Visibility: {api.visibility}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Globe className="h-4 w-4 mr-1" />
                              View Live
                            </Button>
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4 mr-1" />
                              Manage
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mappings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Map className="h-5 w-5" />
                <span>Field Mappings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Map className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="font-semibold mb-2">Field Mapping Configuration</h3>
                <p className="text-sm mb-4">Configure data transformations between internal and external API formats.</p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Mapping
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExternalIntegrationTab;