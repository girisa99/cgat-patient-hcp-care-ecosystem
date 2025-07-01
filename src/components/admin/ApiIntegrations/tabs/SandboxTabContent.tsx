
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Play, Code, Settings, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SandboxTabContentProps {
  integrations: any[];
  onTestEndpoint: (integrationId: string, endpointId: string) => void;
}

export const SandboxTabContent: React.FC<SandboxTabContentProps> = ({
  integrations,
  onTestEndpoint
}) => {
  const { toast } = useToast();
  const [selectedApi, setSelectedApi] = useState<string>('');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('');
  const [requestBody, setRequestBody] = useState<string>('{\n  \n}');
  const [headers, setHeaders] = useState<string>('{\n  "Content-Type": "application/json"\n}');
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const selectedApiData = integrations.find(api => api.id === selectedApi);
  const availableEndpoints = selectedApiData?.endpoints || [];

  const handleTestRequest = async () => {
    if (!selectedApi || !selectedEndpoint) {
      toast({
        title: "Missing Selection",
        description: "Please select an API and endpoint to test.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API testing
      const mockResponse = {
        status: 200,
        data: {
          message: "Test successful",
          timestamp: new Date().toISOString(),
          api: selectedApiData?.name,
          endpoint: selectedEndpoint
        },
        headers: {
          "content-type": "application/json",
          "x-response-time": "142ms"
        }
      };

      setResponse(JSON.stringify(mockResponse, null, 2));
      
      toast({
        title: "Test Successful",
        description: "API endpoint tested successfully in sandbox environment.",
      });
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Failed to test the API endpoint.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">API Sandbox</h2>
          <p className="text-muted-foreground">Test API endpoints in a safe sandbox environment</p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700">
          <Database className="h-3 w-3 mr-1" />
          Sandbox Environment
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Request Configuration
            </CardTitle>
            <CardDescription>
              Configure your API request parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select API</label>
              <Select value={selectedApi} onValueChange={setSelectedApi}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an API to test" />
                </SelectTrigger>
                <SelectContent>
                  {integrations.map((api) => (
                    <SelectItem key={api.id} value={api.id}>
                      {api.name} ({api.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Select Endpoint</label>
              <Select 
                value={selectedEndpoint} 
                onValueChange={setSelectedEndpoint}
                disabled={!selectedApi}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an endpoint" />
                </SelectTrigger>
                <SelectContent>
                  {availableEndpoints.map((endpoint: any) => (
                    <SelectItem key={endpoint.id} value={endpoint.id}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {endpoint.method}
                        </Badge>
                        {endpoint.url}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Request Headers</label>
              <Textarea
                value={headers}
                onChange={(e) => setHeaders(e.target.value)}
                placeholder="Request headers in JSON format"
                className="font-mono text-sm"
                rows={4}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Request Body</label>
              <Textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                placeholder="Request body in JSON format"
                className="font-mono text-sm"
                rows={6}
              />
            </div>

            <Button 
              onClick={handleTestRequest} 
              disabled={isLoading || !selectedApi || !selectedEndpoint}
              className="w-full"
            >
              <Play className="h-4 w-4 mr-2" />
              {isLoading ? 'Testing...' : 'Test Request'}
            </Button>
          </CardContent>
        </Card>

        {/* Response Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Code className="h-5 w-5 mr-2" />
              Response
            </CardTitle>
            <CardDescription>
              API response will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Response Body</label>
                <Textarea
                  value={response}
                  readOnly
                  placeholder="Response will appear here after testing..."
                  className="font-mono text-sm bg-gray-50"
                  rows={15}
                />
              </div>
              
              {response && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(response)}
                  >
                    Copy Response
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setResponse('')}
                  >
                    Clear
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Environment Info */}
      <Card>
        <CardHeader>
          <CardTitle>Sandbox Environment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900">Safe Testing</h4>
              <p className="text-sm text-blue-700 mt-1">
                All requests are isolated and won't affect production data
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900">Rate Limiting</h4>
              <p className="text-sm text-green-700 mt-1">
                Relaxed rate limits for testing and development
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-900">Mock Data</h4>
              <p className="text-sm text-purple-700 mt-1">
                Responses may include mock or sample data
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
