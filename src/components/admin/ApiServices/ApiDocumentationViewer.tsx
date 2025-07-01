
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, ExternalLink, FileText, Code, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ApiDocumentationGenerator } from '@/utils/api/ApiDocumentationGenerator';

interface ApiDocumentationViewerProps {
  apiDetails: any;
  endpoints?: any[];
}

export const ApiDocumentationViewer: React.FC<ApiDocumentationViewerProps> = ({
  apiDetails,
  endpoints = []
}) => {
  const { toast } = useToast();
  const [selectedEndpoint, setSelectedEndpoint] = useState<any>(null);

  const documentation = ApiDocumentationGenerator.generateDocumentation({
    ...apiDetails,
    endpoints
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const openInNewWindow = () => {
    ApiDocumentationGenerator.viewDocumentation({
      ...apiDetails,
      endpoints
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {documentation.title}
                <Badge variant="outline">{documentation.version}</Badge>
              </CardTitle>
              <CardDescription>{documentation.description}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={openInNewWindow}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Full Docs
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Base URL</p>
              <div className="flex items-center gap-2 mt-1">
                <code className="bg-gray-100 px-2 py-1 rounded text-sm flex-1">
                  {documentation.baseUrl}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(documentation.baseUrl, 'Base URL')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Authentication</p>
              <div className="flex items-center gap-2 mt-1">
                <code className="bg-gray-100 px-2 py-1 rounded text-sm flex-1">
                  {documentation.authentication.example}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(documentation.authentication.example, 'Auth header')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoints ({documentation.endpoints.length})</CardTitle>
          <CardDescription>
            Click on any endpoint to view detailed documentation and examples
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {documentation.endpoints.map((endpoint, index) => (
              <Dialog key={index}>
                <DialogTrigger asChild>
                  <div className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Badge variant={
                        endpoint.method === 'GET' ? 'default' :
                        endpoint.method === 'POST' ? 'secondary' :
                        endpoint.method === 'PUT' ? 'outline' : 'destructive'
                      }>
                        {endpoint.method}
                      </Badge>
                      <code className="text-sm">{endpoint.path}</code>
                      <span className="text-sm text-gray-600">{endpoint.summary}</span>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Badge variant="outline">{endpoint.method}</Badge>
                      <code>{endpoint.path}</code>
                    </DialogTitle>
                    <DialogDescription>{endpoint.summary}</DialogDescription>
                  </DialogHeader>
                  
                  <ScrollArea className="max-h-[60vh]">
                    <Tabs defaultValue="overview" className="space-y-4">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="curl">cURL</TabsTrigger>
                        <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                        <TabsTrigger value="python">Python</TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="space-y-4">
                        {endpoint.description && (
                          <div>
                            <h4 className="font-medium mb-2">Description</h4>
                            <p className="text-sm text-gray-600">{endpoint.description}</p>
                          </div>
                        )}
                        
                        {endpoint.parameters && endpoint.parameters.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Parameters</h4>
                            <div className="space-y-2">
                              {endpoint.parameters.map((param: any, i: number) => (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                  <code className="bg-gray-100 px-2 py-1 rounded">{param.name}</code>
                                  <Badge variant="outline" className="text-xs">{param.type}</Badge>
                                  {param.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                                  <span className="text-gray-600">{param.description}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="curl">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">cURL Example</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(endpoint.examples.curl, 'cURL example')}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </Button>
                          </div>
                          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                            <code>{endpoint.examples.curl}</code>
                          </pre>
                        </div>
                      </TabsContent>

                      <TabsContent value="javascript">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">JavaScript Example</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(endpoint.examples.javascript, 'JavaScript example')}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </Button>
                          </div>
                          <pre className="bg-gray-900 text-blue-400 p-4 rounded-lg text-sm overflow-x-auto">
                            <code>{endpoint.examples.javascript}</code>
                          </pre>
                        </div>
                      </TabsContent>

                      <TabsContent value="python">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Python Example</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(endpoint.examples.python, 'Python example')}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </Button>
                          </div>
                          <pre className="bg-gray-900 text-yellow-400 p-4 rounded-lg text-sm overflow-x-auto">
                            <code>{endpoint.examples.python}</code>
                          </pre>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Start Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Start Guide
          </CardTitle>
          <CardDescription>
            Get started with this API in just a few steps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <h4 className="font-medium">Get API Key</h4>
              </div>
              <p className="text-sm text-gray-600">
                Sign up for an account and generate your API key from the dashboard.
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <h4 className="font-medium">Make First Request</h4>
              </div>
              <p className="text-sm text-gray-600">
                Use any of the code examples above to make your first API call.
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <h4 className="font-medium">Handle Response</h4>
              </div>
              <p className="text-sm text-gray-600">
                Process the JSON response and integrate with your application.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
