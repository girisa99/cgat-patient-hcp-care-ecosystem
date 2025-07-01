
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, AlertCircle, CheckCircle } from 'lucide-react';

interface TestingTabContentProps {
  integrations: any[];
  onTestEndpoint?: (integrationId: string, endpointId?: string) => Promise<void>;
}

export const TestingTabContent: React.FC<TestingTabContentProps> = ({
  integrations,
  onTestEndpoint
}) => {
  const [selectedIntegration, setSelectedIntegration] = useState<string>('');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const currentIntegration = integrations.find(i => i.id === selectedIntegration);
  
  // Handle different integration types with proper type safety
  const endpoints = React.useMemo(() => {
    if (!currentIntegration) return [];
    
    if (currentIntegration.integrationType === 'external') {
      return currentIntegration.external_api_endpoints || [];
    }
    
    return currentIntegration.endpoints || [];
  }, [currentIntegration]);
    
  const currentEndpoint = endpoints.find((e: any) => e.id === selectedEndpoint);

  const handleTest = async () => {
    if (!selectedIntegration || !selectedEndpoint || !currentIntegration || !currentEndpoint) return;
    
    setIsLoading(true);
    try {
      if (onTestEndpoint) {
        await onTestEndpoint(selectedIntegration, selectedEndpoint);
      }
      
      // Add successful result
      const newResult = {
        timestamp: new Date().toISOString(),
        integration: currentIntegration.name || currentIntegration.external_name || 'Unknown',
        endpoint: currentEndpoint.name || currentEndpoint.summary || 'Unknown Endpoint',
        method: currentEndpoint.method || 'GET',
        result: { success: true, message: 'Test completed successfully' }
      };
      
      setTestResults(prev => [newResult, ...prev.slice(0, 9)]);
    } catch (error) {
      const errorResult = {
        timestamp: new Date().toISOString(),
        integration: currentIntegration.name || currentIntegration.external_name || 'Unknown',
        endpoint: currentEndpoint.name || currentEndpoint.summary || 'Unknown Endpoint',
        method: currentEndpoint.method || 'GET',
        result: { 
          success: false, 
          error: error instanceof Error ? error.message : 'Test failed' 
        }
      };
      
      setTestResults(prev => [errorResult, ...prev.slice(0, 9)]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Endpoint Testing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Integration</label>
              <Select value={selectedIntegration} onValueChange={setSelectedIntegration}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an integration" />
                </SelectTrigger>
                <SelectContent>
                  {integrations.map((integration) => (
                    <SelectItem key={integration.id} value={integration.id}>
                      {integration.name || integration.external_name || 'Unnamed Integration'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Select Endpoint</label>
              <Select 
                value={selectedEndpoint} 
                onValueChange={setSelectedEndpoint}
                disabled={!selectedIntegration || endpoints.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an endpoint" />
                </SelectTrigger>
                <SelectContent>
                  {endpoints.map((endpoint: any) => (
                    <SelectItem key={endpoint.id || Math.random()} value={endpoint.id || ''}>
                      {endpoint.method || 'GET'} {endpoint.name || endpoint.summary || 'Unnamed Endpoint'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {currentEndpoint && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{currentEndpoint.method || 'GET'}</Badge>
                <span className="font-mono text-sm">
                  {currentEndpoint.url || currentEndpoint.external_path || '/unknown'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {currentEndpoint.description || 'No description available'}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={handleTest}
              disabled={!selectedIntegration || !selectedEndpoint || isLoading}
            >
              <Play className="h-4 w-4 mr-2" />
              {isLoading ? 'Testing...' : 'Test Endpoint'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {result.result.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="font-medium">{result.endpoint}</span>
                      <Badge variant="outline">{result.method}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {result.result.success ? result.result.message : result.result.error}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
