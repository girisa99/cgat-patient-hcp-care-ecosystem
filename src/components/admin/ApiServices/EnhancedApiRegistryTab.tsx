
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Globe, Database, Settings } from 'lucide-react';
import { useUnifiedPageData } from '@/hooks/useUnifiedPageData';

export const EnhancedApiRegistryTab: React.FC = () => {
  const { apiServices } = useUnifiedPageData();
  const [searchQuery, setSearchQuery] = useState('');

  console.log('🚀 Enhanced API Registry Tab with Internal/External subtabs');

  const internalApis = apiServices.data.filter(api => api.type === 'internal');
  const externalApis = apiServices.data.filter(api => api.type === 'external');

  return (
    <div className="space-y-6">
      {/* Registry Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">API Registry</h3>
          <p className="text-sm text-muted-foreground">
            Comprehensive API management with internal and external APIs
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Register Internal API
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Register External API
          </Button>
        </div>
      </div>

      {/* Registry Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-600" />
              Internal APIs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{internalApis.length}</div>
            <p className="text-xs text-muted-foreground">Private APIs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4 text-green-600" />
              External APIs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{externalApis.length}</div>
            <p className="text-xs text-muted-foreground">Public APIs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active APIs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {apiServices.data.filter(api => api.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Endpoints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {apiServices.data.reduce((sum, api) => sum + (api.endpoints_count || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">All endpoints</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search APIs by name, category, or endpoint..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Registry Tabs */}
      <Tabs defaultValue="internal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="internal" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Internal APIs ({internalApis.length})
          </TabsTrigger>
          <TabsTrigger value="external" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            External APIs ({externalApis.length})
          </TabsTrigger>
          <TabsTrigger value="all">All APIs ({apiServices.data.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="internal">
          <InternalApisSubtab apis={internalApis} searchQuery={searchQuery} />
        </TabsContent>

        <TabsContent value="external">
          <ExternalApisSubtab apis={externalApis} searchQuery={searchQuery} />
        </TabsContent>

        <TabsContent value="all">
          <AllApisSubtab apis={apiServices.data} searchQuery={searchQuery} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Internal APIs Subtab Component
const InternalApisSubtab: React.FC<{ apis: any[], searchQuery: string }> = ({ apis, searchQuery }) => {
  const filteredApis = apis.filter(api =>
    !searchQuery || 
    api.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    api.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-600" />
          Internal APIs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredApis.map((api) => (
            <div key={api.id} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium">{api.name}</h4>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">Internal</Badge>
                    <Badge variant={api.status === 'active' ? 'default' : 'secondary'}>
                      {api.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{api.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Version: {api.version}</span>
                    <span>Endpoints: {api.endpoints_count || 0}</span>
                    <span>Category: {api.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {filteredApis.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No internal APIs found matching your search criteria.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// External APIs Subtab Component
const ExternalApisSubtab: React.FC<{ apis: any[], searchQuery: string }> = ({ apis, searchQuery }) => {
  const filteredApis = apis.filter(api =>
    !searchQuery || 
    api.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    api.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-green-600" />
          External APIs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredApis.map((api) => (
            <div key={api.id} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium">{api.name}</h4>
                    <Badge variant="outline" className="bg-green-50 text-green-700">External</Badge>
                    <Badge variant={api.status === 'active' ? 'default' : 'secondary'}>
                      {api.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{api.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Version: {api.version}</span>
                    <span>Endpoints: {api.endpoints_count || 0}</span>
                    <span>Category: {api.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {filteredApis.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No external APIs found matching your search criteria.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// All APIs Subtab Component
const AllApisSubtab: React.FC<{ apis: any[], searchQuery: string }> = ({ apis, searchQuery }) => {
  const filteredApis = apis.filter(api =>
    !searchQuery || 
    api.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    api.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>All APIs Registry</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredApis.map((api) => (
            <div key={api.id} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium">{api.name}</h4>
                    <Badge variant="outline" className={api.type === 'internal' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}>
                      {api.type === 'internal' ? 'Internal' : 'External'}
                    </Badge>
                    <Badge variant={api.status === 'active' ? 'default' : 'secondary'}>
                      {api.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{api.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Version: {api.version}</span>
                    <span>Endpoints: {api.endpoints_count || 0}</span>
                    <span>Category: {api.category}</span>
                    <span>Stage: {api.lifecycle_stage}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {filteredApis.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No APIs found matching your search criteria.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
