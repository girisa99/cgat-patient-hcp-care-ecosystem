
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileCode, Globe, Settings, Code } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PostmanTabContentProps {
  integrations: any[];
  onDownloadCollection: (id: string) => void;
}

export const PostmanTabContent: React.FC<PostmanTabContentProps> = ({
  integrations,
  onDownloadCollection
}) => {
  const { toast } = useToast();
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());

  const handleDownload = async (integrationId: string, integrationName: string) => {
    setDownloadingIds(prev => new Set(prev).add(integrationId));
    
    try {
      await onDownloadCollection(integrationId);
      toast({
        title: "Collection Downloaded",
        description: `Postman collection for "${integrationName}" has been generated and downloaded.`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to generate Postman collection.",
        variant: "destructive",
      });
    } finally {
      setDownloadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(integrationId);
        return newSet;
      });
    }
  };

  const generateCollectionPreview = (integration: any) => ({
    info: {
      name: `${integration.name} API Collection`,
      description: integration.description || `API collection for ${integration.name}`,
      schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    item: integration.endpoints?.slice(0, 3).map((endpoint: any) => ({
      name: endpoint.name || `${endpoint.method} ${endpoint.url}`,
      request: {
        method: endpoint.method,
        header: [
          { key: "Content-Type", value: "application/json" },
          { key: "Authorization", value: "Bearer {{api_key}}" }
        ],
        url: {
          raw: `{{base_url}}${endpoint.url}`,
          host: ["{{base_url}}"],
          path: endpoint.url.split('/').filter(Boolean)
        }
      }
    })) || []
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Postman Collections</h2>
          <p className="text-muted-foreground">Download and manage Postman collections for your APIs</p>
        </div>
        <Badge variant="outline" className="bg-orange-50 text-orange-700">
          <FileCode className="h-3 w-3 mr-1" />
          Collection Manager
        </Badge>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {integrations.map((integration) => {
          const isDownloading = downloadingIds.has(integration.id);
          const collectionPreview = generateCollectionPreview(integration);
          
          return (
            <Card key={integration.id} className="h-fit">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Globe className="h-5 w-5 mr-2" />
                    {integration.name}
                  </CardTitle>
                  <Badge variant={integration.type === 'internal' ? 'default' : 'secondary'}>
                    {integration.type}
                  </Badge>
                </div>
                <CardDescription>
                  {integration.description || 'No description available'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Collection Stats */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Endpoints:</span>
                  <span className="font-medium">{integration.endpoints?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Version:</span>
                  <span className="font-medium">{integration.version || '1.0.0'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Base URL:</span>
                  <span className="font-medium text-xs bg-gray-100 px-2 py-1 rounded">
                    {integration.baseUrl || 'Not configured'}
                  </span>
                </div>

                {/* Preview */}
                <div className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Code className="h-4 w-4" />
                    <span className="text-sm font-medium">Collection Preview</span>
                  </div>
                  <pre className="text-xs text-muted-foreground overflow-x-auto">
                    {JSON.stringify(collectionPreview, null, 2).slice(0, 200)}...
                  </pre>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleDownload(integration.id, integration.name)}
                    disabled={isDownloading}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isDownloading ? 'Generating...' : 'Download Collection'}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>

                {/* Endpoint List Preview */}
                {integration.endpoints && integration.endpoints.length > 0 && (
                  <div className="border-t pt-3">
                    <h4 className="text-sm font-medium mb-2">Sample Endpoints</h4>
                    <div className="space-y-1">
                      {integration.endpoints.slice(0, 3).map((endpoint: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                          <Badge variant="outline" className="text-xs">
                            {endpoint.method}
                          </Badge>
                          <span className="text-muted-foreground font-mono">
                            {endpoint.url}
                          </span>
                        </div>
                      ))}
                      {integration.endpoints.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{integration.endpoints.length - 3} more endpoints
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use Postman Collections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <h4 className="font-semibold">Download</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Click "Download Collection" to get the JSON file for your selected API.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <h4 className="font-semibold">Import</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Open Postman and import the downloaded collection file.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                <h4 className="font-semibold">Configure</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Set up environment variables for base_url and api_key, then start testing!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {integrations.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FileCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No API Integrations</h3>
            <p className="text-muted-foreground">
              Create some API integrations first to generate Postman collections.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
