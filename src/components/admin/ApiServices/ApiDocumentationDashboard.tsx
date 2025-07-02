
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Code, 
  Download, 
  ExternalLink, 
  Search, 
  BookOpen,
  Zap,
  Shield,
  Globe
} from 'lucide-react';
import { useUnifiedPageData } from '@/hooks/useUnifiedPageData';

export const ApiDocumentationDashboard: React.FC = () => {
  const { apiServices } = useUnifiedPageData();
  const [searchQuery, setSearchQuery] = useState('');

  console.log('📚 API Documentation Dashboard - Enhanced documentation system');

  // Filter APIs with documentation
  const documentedApis = apiServices.data.filter(api => 
    api.documentation_url || api.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const generatePostmanCollection = (api: any) => {
    const collection = {
      info: {
        name: `${api.name} - API Collection`,
        description: api.description || 'API endpoints collection',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
        version: api.version || '1.0.0'
      },
      variable: [
        {
          key: 'baseUrl',
          value: api.base_url || `{{protocol}}://{{host}}/api/v1/${api.id}`,
          type: 'string'
        }
      ],
      item: Array.from({ length: api.endpoints_count || 3 }, (_, i) => ({
        name: `Endpoint ${i + 1}`,
        request: {
          method: 'GET',
          header: [
            { key: 'Content-Type', value: 'application/json' },
            { key: 'Authorization', value: 'Bearer {{api_key}}' }
          ],
          url: {
            raw: `{{baseUrl}}/endpoint-${i + 1}`,
            host: ['{{baseUrl}}'],
            path: [`endpoint-${i + 1}`]
          }
        }
      }))
    };

    const blob = new Blob([JSON.stringify(collection, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${api.name}-postman-collection.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const documentationStats = {
    totalApis: apiServices.data.length,
    documentedApis: apiServices.data.filter(api => api.documentation_url).length,
    publicApis: apiServices.data.filter(api => api.status === 'active').length,
    endpointsCount: apiServices.data.reduce((sum, api) => sum + (api.endpoints_count || 0), 0)
  };

  if (apiServices.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Documentation Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total APIs</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentationStats.totalApis}</div>
            <p className="text-xs text-muted-foreground">
              Registered in system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documented</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{documentationStats.documentedApis}</div>
            <p className="text-xs text-muted-foreground">
              Have documentation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Public APIs</CardTitle>
            <Globe className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{documentationStats.publicApis}</div>
            <p className="text-xs text-muted-foreground">
              Available publicly
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Endpoints</CardTitle>
            <Zap className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{documentationStats.endpointsCount}</div>
            <p className="text-xs text-muted-foreground">
              Across all APIs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Documentation Tools */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Documentation Overview</TabsTrigger>
          <TabsTrigger value="tools">Developer Tools</TabsTrigger>
          <TabsTrigger value="guides">Integration Guides</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                API Documentation Status
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search APIs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documentedApis.map((api) => (
                  <div key={api.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${
                        api.documentation_url ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                      <div>
                        <h4 className="font-medium">{api.name}</h4>
                        <p className="text-sm text-muted-foreground">{api.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{api.version}</Badge>
                          <Badge variant="secondary">{api.category}</Badge>
                          <Badge variant={api.status === 'active' ? 'default' : 'secondary'}>
                            {api.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {api.documentation_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={api.documentation_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Docs
                          </a>
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => generatePostmanCollection(api)}>
                        <Download className="h-4 w-4 mr-2" />
                        Postman
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Developer Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Postman Collections</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Download ready-to-use Postman collections for API testing
                  </p>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download All Collections
                  </Button>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">OpenAPI Specs</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Generate OpenAPI 3.0 specifications for your APIs
                  </p>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Specs
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security & Authentication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">API Key Management</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Secure API access with key-based authentication
                  </p>
                  <Button variant="outline" size="sm">
                    <Shield className="h-4 w-4 mr-2" />
                    Manage Keys
                  </Button>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">Rate Limiting</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Configure rate limits and usage quotas
                  </p>
                  <Button variant="outline" size="sm">
                    <Zap className="h-4 w-4 mr-2" />
                    Configure Limits
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="guides">
          <Card>
            <CardHeader>
              <CardTitle>Integration Guides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Getting Started</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Learn the basics of API integration
                  </p>
                  <Button variant="outline" size="sm">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Read Guide
                  </Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Authentication</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Secure your API integrations
                  </p>
                  <Button variant="outline" size="sm">
                    <Shield className="h-4 w-4 mr-2" />
                    Security Guide
                  </Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Best Practices</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Optimize your API usage
                  </p>
                  <Button variant="outline" size="sm">
                    <Zap className="h-4 w-4 mr-2" />
                    Best Practices
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
