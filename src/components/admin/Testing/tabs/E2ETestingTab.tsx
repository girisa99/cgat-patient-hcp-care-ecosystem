
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Globe, 
  CheckCircle, 
  XCircle, 
  Users,
  MousePointer,
  Clock,
  Eye
} from 'lucide-react';

interface E2ETestingTabProps {
  testingData: any;
}

export const E2ETestingTab: React.FC<E2ETestingTabProps> = ({ testingData }) => {
  const [isRunning, setIsRunning] = useState(false);
  const e2eTests = testingData.e2eTests;

  const handleRunTests = async () => {
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 10000);
  };

  return (
    <div className="space-y-6">
      {/* E2E Test Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-600" />
              Total Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{e2eTests.total}</div>
            <p className="text-xs text-muted-foreground">E2E scenarios</p>
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
            <div className="text-2xl font-bold text-green-600">{e2eTests.passed}</div>
            <p className="text-xs text-muted-foreground">{((e2eTests.passed / e2eTests.total) * 100).toFixed(1)}% success rate</p>
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
            <div className="text-2xl font-bold text-red-600">{e2eTests.failed}</div>
            <p className="text-xs text-muted-foreground">User journey issues</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4 text-purple-600" />
              Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{e2eTests.coverage}%</div>
            <p className="text-xs text-muted-foreground">User journeys</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* E2E Test Execution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              E2E Test Execution
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
                    Running E2E Tests...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run E2E Suite
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">User Authentication Journey</span>
                  <Badge variant="default">5 tests</Badge>
                </div>
                <Progress value={80} className="h-2 mb-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>4 passed, 1 failed</span>
                  <span>Avg: 45s</span>
                </div>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">API Integration Workflows</span>
                  <Badge variant="default">8 tests</Badge>
                </div>
                <Progress value={88} className="h-2 mb-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>7 passed, 1 failed</span>
                  <span>Avg: 62s</span>
                </div>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Data Management Flows</span>
                  <Badge variant="default">6 tests</Badge>
                </div>
                <Progress value={83} className="h-2 mb-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>5 passed, 1 failed</span>
                  <span>Avg: 78s</span>
                </div>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Admin Panel Operations</span>
                  <Badge variant="default">4 tests</Badge>
                </div>
                <Progress value={75} className="h-2 mb-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>3 passed, 1 failed</span>
                  <span>Avg: 92s</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Journey Coverage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Journey Coverage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { journey: 'New User Onboarding', steps: 12, coverage: 92, completion: 'Complete' },
              { journey: 'API Key Management', steps: 8, coverage: 88, completion: 'Complete' },
              { journey: 'Integration Setup', steps: 15, coverage: 80, completion: 'Partial' },
              { journey: 'Testing Workflow', steps: 10, coverage: 85, completion: 'Complete' },
              { journey: 'Admin Dashboard', steps: 6, coverage: 83, completion: 'Complete' }
            ].map((journey, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MousePointer className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">{journey.journey}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{journey.steps} steps</Badge>
                    <Badge variant={journey.completion === 'Complete' ? 'default' : 'secondary'}>
                      {journey.completion}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <Progress value={journey.coverage} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Coverage: {journey.coverage}%</span>
                    <span>{Math.floor(journey.steps * journey.coverage / 100)} of {journey.steps} steps</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* E2E Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Recent E2E Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { 
                test: 'Complete User Registration → API Setup Flow', 
                status: 'passed', 
                duration: '2m 34s', 
                browser: 'Chrome',
                steps: 15
              },
              { 
                test: 'Admin Login → User Management → API Creation', 
                status: 'passed', 
                duration: '1m 52s', 
                browser: 'Firefox',
                steps: 12
              },
              { 
                test: 'API Integration → Testing → Documentation', 
                status: 'failed', 
                duration: '3m 18s', 
                browser: 'Safari',
                steps: 18
              },
              { 
                test: 'User Dashboard → Settings → Profile Update', 
                status: 'passed', 
                duration: '1m 23s', 
                browser: 'Edge',
                steps: 8
              },
              { 
                test: 'API Key Generation → Testing → Monitoring', 
                status: 'passed', 
                duration: '2m 07s', 
                browser: 'Chrome',
                steps: 11
              }
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
                    <p className="text-sm text-muted-foreground">
                      {result.steps} steps · {result.browser}
                    </p>
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

      {/* Browser Compatibility */}
      <Card>
        <CardHeader>
          <CardTitle>Browser Compatibility Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { browser: 'Chrome', version: '118+', tests: 23, passed: 21, coverage: 91 },
              { browser: 'Firefox', version: '119+', tests: 23, passed: 20, coverage: 87 },
              { browser: 'Safari', version: '17+', tests: 23, passed: 19, coverage: 83 },
              { browser: 'Edge', version: '118+', tests: 23, passed: 22, coverage: 96 }
            ].map((browser, index) => (
              <div key={index} className="p-3 border rounded-lg text-center">
                <div className="font-medium mb-2">{browser.browser}</div>
                <div className="text-sm text-muted-foreground mb-2">{browser.version}</div>
                <Progress value={browser.coverage} className="h-2 mb-2" />
                <div className="text-sm">
                  <span className="font-medium">{browser.coverage}%</span>
                  <div className="text-xs text-muted-foreground">
                    {browser.passed}/{browser.tests} passed
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
