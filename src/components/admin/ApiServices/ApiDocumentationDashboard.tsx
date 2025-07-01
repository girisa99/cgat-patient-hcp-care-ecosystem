
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Search, Filter, Download, Globe, Code, BookOpen } from 'lucide-react';
import { ApiDocumentationViewer } from './ApiDocumentationViewer';
import { useApiServices } from '@/hooks/useApiServices';
import { useToast } from '@/hooks/use-toast';

export const ApiDocumentationDashboard: React.FC = () => {
  const { toast } = useToast();
  const { apiServices, internalApis, externalApis, isLoading } = useApiServices();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedApi, setSelectedApi] = useState<any>(null);

  // Filter APIs based on search and category
  const filteredApis = React.useMemo(() => {
    if (!apiServices) return [];
    
    return apiServices.filter(api => {
      const matchesSearch = !searchTerm || 
        api.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        api.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || 
        api.category === selectedCategory ||
        api.type === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [apiServices, searchTerm, selectedCategory]);

  const generatePostmanCollection = async (apis: any[]) => {
    try {
      const collection = {
        info: {
          name: "Healthcare API Collection",
          description: "Complete API collection for healthcare management system",
          schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
        },
        item: apis.map(api => ({
          name: api.name || api.external_name,
          description: api.description || api.external_description,
          item: [] // Would be populated with actual endpoints
        }))
      };

      const blob = new Blob([JSON.stringify(collection, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'healthcare-api-collection.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Collection Downloaded",
        description: "Postman collection has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to generate Postman collection",
        variant: "destructive",
      });
    }
  };

  const exportOpenApiSpec = async (api: any) => {
    try {
      const openApiSpec = {
        openapi: "3.0.0",
        info: {
          title: api.name || api.external_name,
          version: api.version || "1.0.0",
          description: api.description || api.external_description
        },
        servers: [
          {
            url: api.base_url || `${window.location.origin}/api/v1`,
            description: "Production server"
          }
        ],
        paths: {},
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT"
            }
          }
        }
      };

      const blob = new Blob([JSON.stringify(openApiSpec, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${api.name || api.external_name}-openapi.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "OpenAPI Spec Downloaded",
        description: "OpenAPI specification has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export OpenAPI specification",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading API documentation...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            API Documentation Dashboard
          </CardTitle>
          <CardDescription>
            Comprehensive documentation for all API integrations with interactive examples and code snippets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search APIs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="internal">Internal APIs</SelectItem>
                <SelectItem value="external">External APIs</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="integration">Integration</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => generatePostmanCollection(filteredApis)} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API Grid */}
      {selectedApi ? (
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => setSelectedApi(null)}
            className="mb-4"
          >
            ← Back to API List
          </Button>
          <ApiDocumentationViewer
            apiDetails={selectedApi}
            endpoints={selectedApi.endpoints || []}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApis.map((api, index) => (
            <Card key={api.id || index} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {api.name || api.external_name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {api.description || api.external_description || 'No description available'}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    {api.version || '1.0.0'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={api.type === 'internal' ? 'default' : 'secondary'}>
                      {api.type || 'API'}
                    </Badge>
                    {api.category && (
                      <Badge variant="outline">
                        {api.category}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Globe className="h-4 w-4" />
                    <span className="truncate">
                      {api.base_url || `${window.location.origin}/api/v1`}
                    </span>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => setSelectedApi(api)}
                      className="flex-1"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Docs
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => exportOpenApiSpec(api)}
                    >
                      <Code className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredApis.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No APIs found matching your criteria</p>
            <p className="text-sm text-gray-500 mt-2">
              Try adjusting your search or filter settings
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
