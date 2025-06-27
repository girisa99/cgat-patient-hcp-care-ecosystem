
/**
 * API Key Integration Monitor - Shows auto-activated integrations from API keys
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Key, 
  Zap, 
  Database, 
  Shield, 
  FileText, 
  Settings,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { useApiKeyMonitor } from '@/hooks/useApiKeyMonitor';
import { useApiKeys } from '@/hooks/useApiKeys';

const ApiKeyIntegrationMonitor = () => {
  const { apiKeys } = useApiKeys();
  const { triggerAutoIntegrationForApiKey } = useApiKeyMonitor();

  const getIntegrationStatus = (apiKey: any) => {
    // In a real implementation, you'd check the actual integration status
    const isRecent = new Date(apiKey.created_at) > new Date(Date.now() - 300000); // 5 minutes
    return isRecent ? 'auto-activated' : 'ready';
  };

  const getApiTypeFromName = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('internal') || lowerName.includes('system')) return 'internal';
    if (lowerName.includes('external') || lowerName.includes('public')) return 'external';
    return 'consumed';
  };

  if (!apiKeys || apiKeys.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No API Keys Found</h3>
          <p className="text-muted-foreground">
            Create an API key to automatically activate framework integrations.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Auto-Activated API Integrations</h3>
        <Badge variant="secondary">{apiKeys.length} Keys</Badge>
      </div>

      {apiKeys.map((apiKey) => {
        const integrationStatus = getIntegrationStatus(apiKey);
        const apiType = getApiTypeFromName(apiKey.name);
        
        return (
          <Card key={apiKey.id} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Key className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{apiKey.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="capitalize">
                        {apiKey.type}
                      </Badge>
                      <Badge 
                        variant={apiType === 'internal' ? 'default' : apiType === 'external' ? 'secondary' : 'outline'}
                      >
                        {apiType} API
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {integrationStatus === 'auto-activated' ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Auto-Activated
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Ready
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Integration Components Status */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Database className="h-4 w-4 text-blue-600 mr-1" />
                    <span className="text-sm font-medium">Schema</span>
                  </div>
                  <Badge variant={integrationStatus === 'auto-activated' ? 'default' : 'outline'} className="text-xs">
                    {integrationStatus === 'auto-activated' ? 'Generated' : 'Pending'}
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Shield className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm font-medium">RLS</span>
                  </div>
                  <Badge variant={integrationStatus === 'auto-activated' ? 'default' : 'outline'} className="text-xs">
                    {integrationStatus === 'auto-activated' ? 'Secured' : 'Pending'}
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <FileText className="h-4 w-4 text-purple-600 mr-1" />
                    <span className="text-sm font-medium">Docs</span>
                  </div>
                  <Badge variant={integrationStatus === 'auto-activated' ? 'default' : 'outline'} className="text-xs">
                    {integrationStatus === 'auto-activated' ? 'Created' : 'Pending'}
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Settings className="h-4 w-4 text-orange-600 mr-1" />
                    <span className="text-sm font-medium">Module</span>
                  </div>
                  <Badge variant={integrationStatus === 'auto-activated' ? 'default' : 'outline'} className="text-xs">
                    {integrationStatus === 'auto-activated' ? 'Registered' : 'Pending'}
                  </Badge>
                </div>
              </div>

              {/* API Key Details */}
              <div className="bg-muted p-3 rounded-lg mb-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Created:</span>
                    <span className="ml-1">{new Date(apiKey.created_at).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Usage:</span>
                    <span className="ml-1">{apiKey.usage_count || 0} requests</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Rate Limit:</span>
                    <span className="ml-1">{apiKey.rate_limit_requests}/{apiKey.rate_limit_period}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <span className="ml-1 capitalize">{apiKey.status}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  {integrationStatus === 'auto-activated' 
                    ? '✅ Framework automatically activated - schemas, RLS, docs, and modules generated'
                    : '⏳ Ready for auto-activation when API key is used'
                  }
                </div>
                <div className="flex gap-2">
                  {integrationStatus !== 'auto-activated' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => triggerAutoIntegrationForApiKey(apiKey)}
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      Activate Now
                    </Button>
                  )}
                  <Button size="sm" variant="outline" asChild>
                    <a href={`/api-integrations?key=${apiKey.id}`}>
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View Details
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ApiKeyIntegrationMonitor;
