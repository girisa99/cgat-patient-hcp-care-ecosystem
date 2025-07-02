
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Network, 
  CheckCircle, 
  XCircle, 
  Database,
  Globe,
  Clock,
  Link
} from 'lucide-react';

interface IntegrationTestingTabProps {
  testingData: any;
}

export const IntegrationTestingTab: React.FC<IntegrationTestingTabProps> = ({ testingData }) => {
  const [isRunning, setIsRunning] = useState(false);
  const integrationTests = testingData.integrationTests;

  const handleRunTests = async () => {
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Integration Test Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Network className="h-4 w-4 text-blue-600" />
              Total Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{integrationTests.total}</div>
            <p className="text-xs text-muted-foreground">Integration scenarios</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Passed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{integrationTests.passed}</div>
            <p className="text-xs text-muted-foreground">{((integrationTests.passed / integrationTests.total) * 100).toFixed(1)}% success rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{integrationTests.failed}</div>
            <p className="text-xs text-muted-foreground">Integration issues</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Link className="h-4 w-4 text-purple-600" />
              Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{integrationTests.coverage}%</div>
            <p className="text-xs text-muted-foreground">Integration paths</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Integration Test Execution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Integration Test Execution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Button 
                onClick={handleRunTests} 
                disabled={isRunning}
                className="flex-1"
              >
                {isRunning ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Running Integration Tests...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run Integration Suite
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">API-Database Integration</span>
                  <Badge variant="default">12 tests</Badge>
                </div>
                <Progress value={92} className="h-2 mb-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>11 passed, 1 failed</span>
                  <span>Avg: 2.3s</span>
                </div>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Service-to-Service</span>
                  <Badge variant="default">8 tests</Badge>
                </div>
                <Progress value={100} className="h-2 mb-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>8 passed, 0 failed</span>
                  <span>Avg: 1.8s</span>
                </div>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">External API Integration</span>
                  <Badge variant="default">15 tests</Badge>
                </div>
                <Progress value={80} className="h-2 mb-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>12 passed, 3 failed</span>
                  <span>Avg: 4.1s</span>
                </div>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Authentication Flow</span>
                  <Badge variant="default">6 tests</Badge>
                </div>
                <Progress value={100} className="h-2 mb-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>6 passed, 0 failed</span>
                  <span>Avg: 1.2s</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integration Points */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Integration Points
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { point: 'Supabase Database', type: 'database', status: 'healthy', tests: 28, uptime: '99.9%' },
              { point: 'External APIs', type: 'api', status: 'warning', tests: 15, uptime: '98.7%' },
              { point: 'Authentication Service', type: 'auth', status: 'healthy', tests: 12, uptime: '100%' },
              { point: 'File Storage', type: 'storage', status: 'healthy', tests: 8, uptime: '99.8%' },
              { point: 'Email Service', type: 'email', status: 'healthy', tests: 6, uptime: '99.5%' }
            ].map((point, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {point.type === 'database' && <Database className="h-4 w-4 text-blue-600" />}
                    {point.type === 'api' && <Globe className="h-4 w-4 text-green-600" />}
                    {point.type === 'auth' && <CheckCircle className="h-4 w-4 text-purple-600" />}
                    {point.type === 'storage' && <Network className="h-4 w-4 text-orange-600" />}
                    {point.type === 'email' && <Globe className="h-4 w-4 text-pink-600" />}
                    <span className="font-medium">{point.point}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${
                      point.status === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                    <Badge variant="outline">{point.tests} tests</Badge>
                  </div>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Uptime: {point.uptime}</span>
                  <span>{point.status === 'healthy' ? 'All systems go' : 'Minor issues'}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Integration Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Integration Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { test: 'API Registry → Database Integration', status: 'passed', duration: '3.2s', endpoint: 'POST /api/integrations' },
              { test: 'Authentication → User Profile Sync', status: 'passed', duration: '1.8s', endpoint: 'GET /api/user/profile' },
              { test: 'External API → Data Processing', status: 'failed', duration: '8.4s', endpoint: 'POST /api/external/sync' },
              { test: 'File Upload → Storage Integration', status: 'passed', duration: '2.1s', endpoint: 'POST /api/files/upload' },
              { test: 'Email Service → Notification Flow', status: 'passed', duration: '1.4s', endpoint: 'POST /api/notifications/email' }
            ].map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {result.status === 'passed' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium">{result.test}</p>
                    <p className="text-sm text-muted-foreground">{result.endpoint}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={result.status === 'passed' ? 'default' : 'destructive'}>
                    {result.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{result.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
