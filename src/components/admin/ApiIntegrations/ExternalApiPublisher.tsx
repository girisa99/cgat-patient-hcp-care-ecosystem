
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpCircle, Globe, Settings, CheckCircle } from 'lucide-react';
import { useApiServices } from '@/hooks/useApiServices';
import { useExternalApis } from '@/hooks/useExternalApis';

const ExternalApiPublisher = () => {
  const { apiServices } = useApiServices();
  const { publishApi, isPublishing } = useExternalApis();
  const [selectedApiId, setSelectedApiId] = useState<string>('');

  // Filter internal APIs that can be published
  const publishableApis = apiServices.filter(api => 
    api.direction === 'outbound' || api.direction === 'bidirectional'
  );

  const selectedApi = publishableApis.find(api => api.id === selectedApiId);

  const handlePublish = () => {
    if (!selectedApi) return;

    const publishConfig = {
      external_name: selectedApi.name,
      external_description: selectedApi.description || 'No description provided',
      version: '1.0.0',
      category: selectedApi.category || 'general',
      visibility: 'private' as const,
      pricing_model: 'free' as const,
      status: 'draft' as const,
      base_url: selectedApi.base_url,
      rate_limits: { requests: 1000, period: 'hour' },
      authentication_methods: ['api_key'],
      supported_formats: ['json'],
      tags: [],
      analytics_config: {},
      marketplace_config: {}
    };

    publishApi({ internalApiId: selectedApi.id, config: publishConfig });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <ArrowUpCircle className="h-5 w-5 text-blue-500" />
          Publish Internal API Externally
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
                {publishableApis.map((api) => (
                  <SelectItem key={api.id} value={api.id}>
                    {api.name} - {api.endpoints_count || 0} endpoints
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedApi && (
            <div className="bg-blue-50 p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{selectedApi.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedApi.description || 'No description provided'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{selectedApi.direction}</Badge>
                  <Badge variant="secondary">{selectedApi.category}</Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Endpoints:</span>
                  <p>{selectedApi.endpoints_count || 0}</p>
                </div>
                <div>
                  <span className="font-medium">Type:</span>
                  <p className="capitalize">{selectedApi.type}</p>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <p className="capitalize">{selectedApi.status}</p>
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

export default ExternalApiPublisher;
