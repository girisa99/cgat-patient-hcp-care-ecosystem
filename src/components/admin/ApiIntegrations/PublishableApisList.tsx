
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpCircle, Globe, Settings, CheckCircle, Database, Shield } from 'lucide-react';

interface PublishableApisListProps {
  apis: any[];
  onPublishApi: (apiId: string, config: any) => void;
  isPublishing: boolean;
}

const PublishableApisList: React.FC<PublishableApisListProps> = ({
  apis,
  onPublishApi,
  isPublishing
}) => {
  const [selectedApiId, setSelectedApiId] = useState<string>('');

  // Filter APIs that can be published (internal APIs)
  const publishableApis = apis.filter(api => {
    if ((api as any).integrationType === 'internal') {
      const apiData = api as any;
      return apiData.direction === 'outbound' || apiData.direction === 'bidirectional';
    }
    return false;
  });

  const selectedApi = publishableApis.find(api => api.id === selectedApiId);

  const handlePublish = () => {
    if (!selectedApi) return;
    
    const apiData = selectedApi as any;
    const publishConfig = {
      external_name: apiData.name,
      external_description: apiData.description || 'No description provided',
      version: '1.0.0',
      category: apiData.category || 'general',
      visibility: 'private' as const,
      pricing_model: 'free' as const,
      status: 'draft' as const,
      base_url: apiData.base_url,
      rate_limits: { requests: 1000, period: 'hour' },
      authentication_methods: ['api_key'],
      supported_formats: ['json'],
      tags: []
    };

    onPublishApi(selectedApi.id, publishConfig);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <ArrowUpCircle className="h-5 w-5 text-blue-500" />
          Publish Internal APIs
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Make your internal APIs available for external consumption
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select API to Publish</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Select value={selectedApiId} onValueChange={setSelectedApiId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an internal API to publish" />
              </SelectTrigger>
              <SelectContent>
                {publishableApis.map((api) => {
                  const apiData = api as any;
                  const displayName = apiData.name || 'API Service';
                  const endpointCount = apiData.endpoints_count || 0;
                  return (
                    <SelectItem key={api.id} value={api.id}>
                      {displayName} - {endpointCount} endpoints
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {selectedApi && (
            <div className="bg-blue-50 p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{(selectedApi as any).name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {(selectedApi as any).description || 'No description provided'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{(selectedApi as any).direction}</Badge>
                  <Badge variant="secondary">{(selectedApi as any).category}</Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  <span>{(selectedApi as any).endpoints_count || 0} endpoints</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>{(selectedApi as any).rls_policies_count || 0} policies</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>{(selectedApi as any).data_mappings_count || 0} mappings</span>
                </div>
              </div>

              <div className="bg-white p-3 rounded border">
                <h5 className="font-medium mb-2">Publication Preview</h5>
                <div className="text-sm space-y-1">
                  <p><strong>Name:</strong> {(selectedApi as any).name}</p>
                  <p><strong>Version:</strong> 1.0.0</p>
                  <p><strong>Visibility:</strong> Private</p>
                  <p><strong>Pricing:</strong> Free</p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handlePublish} 
                  disabled={isPublishing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isPublishing ? (
                    <>
                      <Settings className="h-4 w-4 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Globe className="h-4 w-4 mr-2" />
                      Publish Externally
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {publishableApis.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <ArrowUpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No publishable APIs found</p>
              <p className="text-sm">Create APIs with outbound or bidirectional direction to publish them externally.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PublishableApisList;
