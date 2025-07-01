
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Code, FileText, Settings, Zap } from 'lucide-react';

interface TestingTabContentProps {
  consolidatedApis: any[];
  onTestEndpoint: (integrationId: string, endpointId?: string) => Promise<void>;
}

export const TestingTabContent: React.FC<TestingTabContentProps> = ({
  consolidatedApis,
  onTestEndpoint
}) => {
  const [selectedApi, setSelectedApi] = useState<string>('');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleTest = async (apiId: string) => {
    setIsLoading(true);
    try {
      await onTestEndpoint(apiId);
      // Add test result
      setTestResults(prev => [...prev, {
        id: Date.now(),
        apiId,
        timestamp: new Date().toISOString(),
        status: 'success'
      }]);
    } catch (error) {
      setTestResults(prev => [...prev, {
        id: Date.now(),
        apiId,
        timestamp: new Date().toISOString(),
        status: 'error',
        error: error.message
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">API Testing</h2>
          <p className="text-muted-foreground">Test your API endpoints and monitor responses</p>
        </div>
      </div>

      <Tabs defaultValue="quick-test" className="w-full">
        <TabsList>
          <TabsTrigger value="quick-test">Quick Test</TabsTrigger>
          <TabsTrigger value="detailed-test">Detailed Test</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
        </TabsList>

        <TabsContent value="quick-test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick API Test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {consolidatedApis.slice(0, 6).map((api) => (
                  <Card key={api.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{api.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {api.endpoints_count || 0} endpoints
                        </p>
                      </div>
                      <Badge variant={api.status === 'active' ? 'default' : 'secondary'}>
                        {api.status}
                      </Badge>
                    </div>
                    <Button 
                      onClick={() => handleTest(api.id)}
                      disabled={isLoading}
                      className="w-full"
                      size="sm"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Test API
                    </Button>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed-test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Detailed API Testing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Request URL</label>
                    <Input placeholder="https://api.example.com/endpoint" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">HTTP Method</label>
                    <select className="w-full px-3 py-2 border rounded-md">
                      <option>GET</option>
                      <option>POST</option>
                      <option>PUT</option>
                      <option>DELETE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Headers</label>
                    <Textarea placeholder="Content-Type: application/json" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Request Body</label>
                    <Textarea placeholder="{ &quot;key&quot;: &quot;value&quot; }" />
                  </div>
                  <Button className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Send Request
                  </Button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Response</label>
                    <div className="bg-gray-50 p-4 rounded-md min-h-[200px]">
                      <p className="text-muted-foreground">Response will appear here...</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Test Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {testResults.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No test results yet. Run some tests to see results here.
                </p>
              ) : (
                <div className="space-y-3">
                  {testResults.map((result) => (
                    <div key={result.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          {consolidatedApis.find(api => api.id === result.apiId)?.name || 'Unknown API'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(result.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                        {result.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
