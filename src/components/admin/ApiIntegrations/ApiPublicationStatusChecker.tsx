
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useApiIntegrations } from '@/hooks/useApiIntegrations';
import { useExternalApis } from '@/hooks/useExternalApis';
import { usePublishedApiIntegration } from '@/hooks/usePublishedApiIntegration';
import { 
  Search, 
  CheckCircle, 
  Clock, 
  Settings, 
  AlertCircle,
  Globe,
  Eye,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

const ApiPublicationStatusChecker = () => {
  const { integrations } = useApiIntegrations();
  const { externalApis } = useExternalApis();
  const { publishedApisForDevelopers } = usePublishedApiIntegration();
  const [selectedApiId, setSelectedApiId] = useState<string>('');

  const getPublicationStatus = (internalApiId: string) => {
    // Find the external API record
    const externalApi = externalApis.find(api => api.internal_api_id === internalApiId);
    
    if (!externalApi) {
      return {
        status: 'not_published',
        message: 'API has not been published externally',
        color: 'bg-gray-100 text-gray-800',
        icon: <AlertCircle className="h-4 w-4 text-gray-500" />
      };
    }

    // Check if it's available in the developer portal (fully published)
    const publishedApi = publishedApisForDevelopers.find(api => api.id === externalApi.id);
    
    switch (externalApi.status) {
      case 'draft':
        return {
          status: 'draft',
          message: 'API is in draft status - not visible to developers',
          color: 'bg-yellow-100 text-yellow-800',
          icon: <Settings className="h-4 w-4 text-yellow-500" />,
          externalApi,
          publishedApi: null
        };
      case 'review':
        return {
          status: 'review',
          message: 'API is under review - pending publication',
          color: 'bg-blue-100 text-blue-800',
          icon: <Clock className="h-4 w-4 text-blue-500" />,
          externalApi,
          publishedApi: null
        };
      case 'published':
        return {
          status: 'published',
          message: publishedApi 
            ? 'API is fully published and available to developers' 
            : 'API is marked as published but may not be fully synchronized',
          color: 'bg-green-100 text-green-800',
          icon: <CheckCircle className="h-4 w-4 text-green-500" />,
          externalApi,
          publishedApi
        };
      case 'deprecated':
        return {
          status: 'deprecated',
          message: 'API is deprecated - still accessible but marked for retirement',
          color: 'bg-red-100 text-red-800',
          icon: <AlertCircle className="h-4 w-4 text-red-500" />,
          externalApi,
          publishedApi
        };
      default:
        return {
          status: 'unknown',
          message: `API has unknown status: ${externalApi.status}`,
          color: 'bg-gray-100 text-gray-800',
          icon: <AlertCircle className="h-4 w-4 text-gray-500" />,
          externalApi,
          publishedApi: null
        };
    }
  };

  const selectedApi = integrations.find(api => api.id === selectedApiId);
  const statusInfo = selectedApiId ? getPublicationStatus(selectedApiId) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          API Publication Status Checker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="api-select">Select API to Check</Label>
          <Select value={selectedApiId} onValueChange={setSelectedApiId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an API to check publication status" />
            </SelectTrigger>
            <SelectContent>
              {integrations.map((api) => {
                const apiData = api as any;
                const displayName = apiData.name || 'API Service';
                const endpointCount = (api as any).integrationType === 'external' 
                  ? apiData.external_api_endpoints?.length || 0 
                  : apiData.endpoints_count || 0;
                return (
                  <SelectItem key={api.id} value={api.id}>
                    {displayName} - {endpointCount} endpoints
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {selectedApi && statusInfo && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {statusInfo.icon}
                  <h3 className="font-semibold">
                    {(selectedApi as any).name || 'API Service'}
                  </h3>
                </div>
                <Badge className={statusInfo.color}>
                  {statusInfo.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">{statusInfo.message}</p>
            </div>

            {statusInfo.externalApi && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">External API Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div><strong>External Name:</strong> {statusInfo.externalApi.external_name}</div>
                    <div><strong>Version:</strong> {statusInfo.externalApi.version}</div>
                    <div><strong>Visibility:</strong> {statusInfo.externalApi.visibility}</div>
                    <div><strong>Pricing:</strong> {statusInfo.externalApi.pricing_model}</div>
                    {statusInfo.externalApi.published_at && (
                      <div><strong>Published:</strong> {new Date(statusInfo.externalApi.published_at).toLocaleString()}</div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Developer Availability</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {statusInfo.publishedApi ? (
                      <>
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>Available in Developer Portal</span>
                        </div>
                        <div><strong>Endpoints:</strong> {statusInfo.publishedApi.endpoints?.length || 0}</div>
                        <div><strong>Auth Methods:</strong> {statusInfo.publishedApi.authentication_methods.join(', ')}</div>
                        {statusInfo.publishedApi.documentation_url && (
                          <div className="flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" />
                            <a 
                              href={statusInfo.publishedApi.documentation_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              View Documentation
                            </a>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-orange-600">
                        <AlertCircle className="h-4 w-4" />
                        <span>Not available to developers</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {!statusInfo.externalApi && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>This API has not been published externally yet.</span>
                </div>
              </div>
            )}
          </div>
        )}

        {!selectedApiId && (
          <div className="text-center py-8 text-muted-foreground">
            <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Select an API above to check its publication status</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ApiPublicationStatusChecker;
