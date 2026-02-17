import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Download, ExternalLink, RefreshCw, FileText, 
  Code, Globe, Settings, Eye
} from "lucide-react";
import { useMasterApiServices } from '@/hooks/useMasterApiServices';
import { useRoleBasedApiSuite } from '@/hooks/useRoleBasedApiSuite';
import { useMasterToast } from '@/hooks/useMasterToast';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { PostmanCollectionGenerator } from '@/utils/api/PostmanCollectionGenerator';
import { DOMSecurity } from '@/utils/security/domSecurity';

interface PostmanCollection {
  id: string;
  name: string;
  description: string;
  version: string;
  endpoints: number;
  lastUpdated: string;
  size: string;
  apiId: string;
}

const PostmanCollectionManager: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [collections, setCollections] = useState<PostmanCollection[]>([]);
  
  const { apiServices, isLoading } = useMasterApiServices();
  const { generatePostmanCollection } = useRoleBasedApiSuite();
  const { userRoles } = useMasterAuth();
  const { showSuccess, showError } = useMasterToast();

  // Generate collections based on user roles and API access
  const roleBasedCollections: PostmanCollection[] = userRoles.map((role, index) => ({
    id: `role-${role}-${index}`,
    name: `${role.replace(/([A-Z])/g, ' $1').trim()} API Collection`,
    description: `Role-specific API collection for ${role} with appropriate access levels`,
    version: '2.1.0',
    endpoints: Math.floor(Math.random() * 15) + 5,
    lastUpdated: new Date().toISOString(),
    size: `${Math.floor(Math.random() * 75) + 25}KB`,
    apiId: `role-${role}`
  }));

  // Mock collections for demo - combined with role-based collections
  const mockCollections: PostmanCollection[] = [
    ...roleBasedCollections,
    ...(apiServices?.map((api, index) => ({
      id: api.id,
      name: `${api.name} Collection`,
      description: api.description || 'API collection for testing',
      version: '2.1.0',
      endpoints: Math.floor(Math.random() * 10) + 1,
      lastUpdated: new Date().toISOString(),
      size: `${Math.floor(Math.random() * 50) + 10}KB`,
      apiId: api.id
    })) || [])
  ];

  const generateCollection = async (apiId: string, apiName: string) => {
    setIsGenerating(true);
    try {
      // Check if this is a role-based collection
      if (apiId.startsWith('role-')) {
        const role = apiId.replace('role-', '') as any;
        const collection = generatePostmanCollection(role);
        showSuccess(`Role-based collection generated for ${role}`);
        return collection;
      }

      // Get the actual API service data
      const apiService = apiServices?.find(api => api.id === apiId);
      if (!apiService) {
        throw new Error('API service not found');
      }

      // Generate realistic collection based on API service data
      const collection = {
        info: {
          name: `${apiName} API Collection`,
          description: `Generated collection for ${apiName} - ${apiService.description || 'Healthcare API Integration'}`,
          version: '2.1.0',
          schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
        },
        item: [
          {
            name: `Get ${apiService.category} Data`,
            request: {
              method: 'GET',
              header: [
                {
                  key: 'Authorization',
                  value: 'Bearer {{apiKey}}',
                  type: 'text'
                },
                {
                  key: 'Content-Type',
                  value: 'application/json'
                }
              ],
              url: {
                raw: `{{baseUrl}}/${apiService.category.toLowerCase()}`,
                host: ['{{baseUrl}}'],
                path: [apiService.category.toLowerCase()]
              }
            }
          },
          {
            name: `Create ${apiService.category} Record`,
            request: {
              method: 'POST',
              header: [
                {
                  key: 'Authorization',
                  value: 'Bearer {{apiKey}}',
                  type: 'text'
                },
                {
                  key: 'Content-Type',
                  value: 'application/json'
                }
              ],
              body: {
                mode: 'raw',
                raw: JSON.stringify({
                  name: 'Sample Record',
                  category: apiService.category,
                  created_at: new Date().toISOString()
                }, null, 2)
              },
              url: {
                raw: `{{baseUrl}}/${apiService.category.toLowerCase()}`,
                host: ['{{baseUrl}}'],
                path: [apiService.category.toLowerCase()]
              }
            }
          },
          {
            name: `Update ${apiService.category} Record`,
            request: {
              method: 'PUT',
              header: [
                {
                  key: 'Authorization',
                  value: 'Bearer {{apiKey}}',
                  type: 'text'
                },
                {
                  key: 'Content-Type',
                  value: 'application/json'
                }
              ],
              body: {
                mode: 'raw',
                raw: JSON.stringify({
                  id: '{{recordId}}',
                  name: 'Updated Record',
                  updated_at: new Date().toISOString()
                }, null, 2)
              },
              url: {
                raw: `{{baseUrl}}/${apiService.category.toLowerCase()}/{{recordId}}`,
                host: ['{{baseUrl}}'],
                path: [apiService.category.toLowerCase(), '{{recordId}}']
              }
            }
          }
        ],
        variable: [
          {
            key: 'baseUrl',
            value: apiService.base_url || 'https://api.healthcare.com/v1',
            type: 'string'
          },
          {
            key: 'apiKey',
            value: 'your-api-key-here',
            type: 'string'
          },
          {
            key: 'recordId',
            value: '1',
            type: 'string'
          }
        ]
      };

      showSuccess(`Collection generated for ${apiName}`);
      return collection;
    } catch (error) {
      showError('Failed to generate collection');
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCollection = async (collection: PostmanCollection) => {
    try {
      const collectionData = await generateCollection(collection.apiId, collection.name);
      if (collectionData) {
        const blob = new Blob([JSON.stringify(collectionData, null, 2)], {
          type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${collection.name.replace(/\s+/g, '_')}.postman_collection.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showSuccess('Collection downloaded successfully');
      }
    } catch (error) {
      showError('Failed to download collection');
    }
  };

  const importToPostman = async (collection: PostmanCollection) => {
    try {
      // Generate the collection first
      const collectionData = await generateCollection(collection.apiId, collection.name);
      
      if (collectionData) {
        // Create a temporary download for Postman import
        const blob = new Blob([JSON.stringify(collectionData, null, 2)], {
          type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        
        // Try to open Postman import URL
        const postmanImportUrl = `https://www.postman.com/collections/import?url=${encodeURIComponent(url)}`;
        window.open(postmanImportUrl, '_blank');
        
        showSuccess('Opening Postman for import...');
        
        // Clean up the URL after a delay
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      }
    } catch (error) {
      showError('Failed to prepare collection for Postman import');
    }
  };

  const viewCollection = async (collection: PostmanCollection) => {
    try {
      const collectionData = await generateCollection(collection.apiId, collection.name);
      
      if (collectionData) {
        // Use secure DOM manipulation instead of document.write
        DOMSecurity.createAPIDetailsWindow({
          name: collection.name,
          description: collection.description,
          collectionData
        }, 'collection');
      }
        
      showSuccess(`Viewing collection: ${collection.name}`);
    } catch (error) {
      showError('Failed to view collection details');
    }
  };

  const generateAllCollections = async () => {
    setIsGenerating(true);
    try {
      const promises = apiServices?.map(api => 
        generateCollection(api.id, api.name)
      ) || [];
      
      await Promise.all(promises);
      showSuccess('All collections generated successfully');
    } catch (error) {
      showError('Failed to generate all collections');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadAllCollections = async () => {
    setIsGenerating(true);
    try {
      const collections = await Promise.all(
        apiServices?.map(async (api) => {
          const collection = await generateCollection(api.id, api.name);
          return {
            filename: `${api.name.replace(/\s+/g, '_')}.postman_collection.json`,
            data: collection
          };
        }) || []
      );

      // Create a zip-like bundle (simplified as multiple downloads)
      for (const collection of collections) {
        const blob = new Blob([JSON.stringify(collection.data, null, 2)], {
          type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = collection.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      showSuccess('All collections downloaded successfully');
    } catch (error) {
      showError('Failed to download collections bundle');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Download className="h-6 w-6" />
            <span>Postman Collections</span>
          </h2>
          <p className="text-gray-600">Ready-to-use collections for API testing - includes role-based collections</p>
          {userRoles.length > 0 && (
            <p className="text-sm text-blue-600 mt-1">
              Your roles: {userRoles.join(', ')} - {roleBasedCollections.length} role-specific collections available
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={generateAllCollections}
            disabled={isGenerating}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
            Generate All
          </Button>
          <Button onClick={downloadAllCollections}>
            <Download className="h-4 w-4 mr-2" />
            Download Bundle
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available Collections</p>
                <p className="text-2xl font-bold">{mockCollections.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Endpoints</p>
                <p className="text-2xl font-bold">
                  {mockCollections.reduce((sum, col) => sum + col.endpoints, 0)}
                </p>
              </div>
              <Globe className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Size</p>
                <p className="text-2xl font-bold">
                  {Math.floor(mockCollections.length * 25)}KB
                </p>
              </div>
              <Code className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="text-lg font-bold">Today</p>
              </div>
              <RefreshCw className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockCollections.map((collection) => (
          <Card key={collection.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{collection.name}</CardTitle>
                <Badge variant="outline">v{collection.version}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{collection.description}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{collection.endpoints} endpoints</span>
                <span>{collection.size}</span>
              </div>
              
              <div className="text-xs text-gray-500">
                Last updated: {new Date(collection.lastUpdated).toLocaleDateString()}
              </div>
              
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => viewCollection(collection)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => downloadCollection(collection)}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
              </div>
              
              <Button 
                className="w-full"
                onClick={() => importToPostman(collection)}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Import to Postman
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col"
              onClick={downloadAllCollections}
              disabled={isGenerating}
            >
              <Download className="h-6 w-6 mb-2" />
              Download All Collections
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col"
              onClick={generateAllCollections}
              disabled={isGenerating}
            >
              <RefreshCw className="h-6 w-6 mb-2" />
              Regenerate Collections
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col"
              onClick={() => window.open('https://www.postman.com/', '_blank')}
            >
              <ExternalLink className="h-6 w-6 mb-2" />
              Open Postman Workspace
            </Button>
          </div>
        </CardContent>
      </Card>

      {mockCollections.length === 0 && !isLoading && (
        <div className="text-center py-12 text-gray-500">
          <Download className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="font-semibold mb-2">No collections available</h3>
          <p className="text-sm">Collections will be generated from your active APIs.</p>
        </div>
      )}
    </div>
  );
};

export default PostmanCollectionManager;