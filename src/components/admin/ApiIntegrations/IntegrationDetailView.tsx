
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink, Code, Shield, Database } from 'lucide-react';
import { useApiIntegrations } from '@/hooks/useApiIntegrations';

interface IntegrationDetailViewProps {
  integrationId: string;
  onBack: () => void;
}

const IntegrationDetailView: React.FC<IntegrationDetailViewProps> = ({
  integrationId,
  onBack
}) => {
  const { integrations } = useApiIntegrations();
  const integration = integrations?.find(i => i.id === integrationId);

  if (!integration) {
    return (
      <div className="space-y-6">
        <Button onClick={onBack} variant="outline" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-medium mb-2">Integration Not Found</h3>
            <p className="text-muted-foreground">The requested integration could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle different data structures from our single source of truth
  const displayName = (integration as any).integrationType === 'external' 
    ? (integration as any).external_name 
    : (integration as any).name;
    
  const displayDescription = (integration as any).integrationType === 'external'
    ? (integration as any).external_description
    : (integration as any).description;

  const endpointsCount = (integration as any).integrationType === 'external'
    ? (integration as any).external_api_endpoints?.length || 0
    : (integration as any).endpoints_count || 0;

  const rlsPoliciesCount = (integration as any).integrationType === 'external'
    ? 0
    : (integration as any).rls_policies_count || 0;

  const mappingsCount = (integration as any).integrationType === 'external'
    ? 0
    : (integration as any).data_mappings_count || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{displayName}</h2>
          <p className="text-muted-foreground">{displayDescription}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{endpointsCount}</p>
                <p className="text-sm text-muted-foreground">Endpoints</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{rlsPoliciesCount}</p>
                <p className="text-sm text-muted-foreground">RLS Policies</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{mappingsCount}</p>
                <p className="text-sm text-muted-foreground">Data Mappings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integration Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Type</label>
              <Badge variant="outline" className="ml-2 capitalize">
                {(integration as any).integrationType === 'external' ? 'external' : (integration as any).type}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Badge className="ml-2" variant="outline">
                {(integration as any).status}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <p className="capitalize">{(integration as any).category}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Version</label>
              <p>v{(integration as any).version}</p>
            </div>
          </div>
          
          {(integration as any).base_url && (
            <div>
              <label className="text-sm font-medium">Base URL</label>
              <div className="flex items-center gap-2 mt-1">
                <code className="bg-muted px-2 py-1 rounded text-sm flex-1">
                  {(integration as any).base_url}
                </code>
                <Button size="sm" variant="outline" asChild>
                  <a href={(integration as any).base_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {(integration as any).integrationType === 'external' && (integration as any).external_api_endpoints && (integration as any).external_api_endpoints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>API Endpoints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(integration as any).external_api_endpoints.map((endpoint: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{endpoint.method}</Badge>
                    <code className="text-sm">{endpoint.external_path}</code>
                    <span className="text-sm text-muted-foreground">{endpoint.summary}</span>
                  </div>
                  {endpoint.is_public && (
                    <Badge variant="secondary">Public</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IntegrationDetailView;
