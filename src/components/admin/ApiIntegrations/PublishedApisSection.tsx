
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Globe, 
  FileText, 
  TestTube, 
  Clock, 
  Zap, 
  Key, 
  Code, 
  Copy,
  ExternalLink,
  Bell,
  BookOpen
} from 'lucide-react';
import { usePublishedApiIntegration, PublishedApiForDevelopers } from '@/hooks/usePublishedApiIntegration';
import { useToast } from '@/hooks/use-toast';

interface PublishedApisSectionProps {
  showInDeveloperPortal?: boolean;
}

const PublishedApisSection = ({ showInDeveloperPortal = false }: PublishedApisSectionProps) => {
  const { toast } = useToast();
  const [selectedApi, setSelectedApi] = useState<PublishedApiForDevelopers | null>(null);
  const [showApiDialog, setShowApiDialog] = useState(false);

  const {
    publishedApisForDevelopers,
    isLoadingPublishedApis,
    generateDocumentation,
    isGeneratingDocs,
    notifyDevelopers,
    isNotifyingDevelopers
  } = usePublishedApiIntegration();

  const handleViewApi = (api: PublishedApiForDevelopers) => {
    setSelectedApi(api);
    setShowApiDialog(true);
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "URL Copied",
      description: "URL has been copied to clipboard",
    });
  };

  const handleGenerateDocs = (apiId: string) => {
    generateDocumentation(apiId);
  };

  const handleNotifyDevelopers = (apiId: string) => {
    notifyDevelopers(apiId);
  };

  if (isLoadingPublishedApis) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          Loading published APIs...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-500" />
            {showInDeveloperPortal ? 'Available APIs' : 'Published APIs'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {showInDeveloperPortal 
              ? 'APIs available for integration in your applications'
              : 'APIs published and available to developers'
            }
          </p>
        </div>
        <Badge variant="secondary">{publishedApisForDevelopers.length} APIs</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {publishedApisForDevelopers.map((api) => (
          <Card key={api.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base">{api.external_name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {api.external_description || 'No description available'}
                  </p>
                </div>
                <Badge variant="outline" className="ml-2">
                  v{api.version}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="flex flex-wrap gap-1">
                {api.category && (
                  <Badge variant="secondary" className="text-xs">
                    {api.category}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {api.pricing_model}
                </Badge>
                {api.endpoints && api.endpoints.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {api.endpoints.length} endpoints
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Key className="h-3 w-3" />
                  <span>{api.authentication_methods.join(', ')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-3 w-3" />
                  <span>
                    {api.rate_limits?.requests || 1000} requests/{api.rate_limits?.period || 'hour'}
                  </span>
                </div>
                {api.published_at && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Published {new Date(api.published_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" onClick={() => handleViewApi(api)} className="flex-1">
                  View Details
                </Button>
                {!showInDeveloperPortal && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleGenerateDocs(api.id)}
                    disabled={isGeneratingDocs}
                  >
                    <FileText className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {publishedApisForDevelopers.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No Published APIs</h3>
            <p className="text-sm text-muted-foreground">
              {showInDeveloperPortal 
                ? 'No APIs are currently available for development.'
                : 'Publish your first API to make it available to developers.'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* API Details Dialog */}
      <Dialog open={showApiDialog} onOpenChange={setShowApiDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {selectedApi?.external_name}
              <Badge variant="outline">v{selectedApi?.version}</Badge>
            </DialogTitle>
          </DialogHeader>

          {selectedApi && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
                <TabsTrigger value="authentication">Auth</TabsTrigger>
                <TabsTrigger value="examples">Examples</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">API Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Category:</strong> {selectedApi.category || 'General'}</div>
                      <div><strong>Pricing:</strong> {selectedApi.pricing_model}</div>
                      <div><strong>Version:</strong> {selectedApi.version}</div>
                      <div><strong>Formats:</strong> {selectedApi.supported_formats.join(', ')}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Rate Limits</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Requests:</strong> {selectedApi.rate_limits?.requests || 1000}</div>
                      <div><strong>Period:</strong> {selectedApi.rate_limits?.period || 'hour'}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedApi.external_description || 'No description available.'}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyUrl(selectedApi.sandbox_url)}
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    Copy Sandbox URL
                  </Button>
                  {selectedApi.documentation_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(selectedApi.documentation_url, '_blank')}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      View Documentation
                    </Button>
                  )}
                  {!showInDeveloperPortal && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleNotifyDevelopers(selectedApi.id)}
                      disabled={isNotifyingDevelopers}
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      Notify Developers
                    </Button>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="endpoints" className="space-y-4">
                <div className="space-y-3">
                  {selectedApi.endpoints?.map((endpoint) => (
                    <Card key={endpoint.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{endpoint.method}</Badge>
                            <code className="text-sm">{endpoint.external_path}</code>
                          </div>
                          <div className="flex gap-1">
                            {endpoint.is_public && (
                              <Badge variant="secondary" className="text-xs">Public</Badge>
                            )}
                            {endpoint.requires_authentication && (
                              <Badge variant="outline" className="text-xs">Auth Required</Badge>
                            )}
                          </div>
                        </div>
                        <h5 className="font-medium">{endpoint.summary}</h5>
                        {endpoint.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {endpoint.description}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  {(!selectedApi.endpoints || selectedApi.endpoints.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No endpoints documented yet.
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="authentication" className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Authentication Methods</h4>
                  <div className="space-y-2">
                    {selectedApi.authentication_methods.map((method) => (
                      <Badge key={method} variant="outline">{method}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">How to Authenticate</h4>
                  <div className="bg-muted p-3 rounded-lg">
                    <code className="text-sm">
                      Authorization: Bearer YOUR_API_KEY
                    </code>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="examples" className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">cURL Example</h4>
                  <div className="bg-muted p-3 rounded-lg">
                    <code className="text-sm whitespace-pre-wrap">
{`curl -X GET "${selectedApi.sandbox_url}/endpoint" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
                    </code>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">JavaScript Example</h4>
                  <div className="bg-muted p-3 rounded-lg">
                    <code className="text-sm whitespace-pre-wrap">
{`const response = await fetch('${selectedApi.sandbox_url}/endpoint', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});
const data = await response.json();`}
                    </code>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PublishedApisSection;
