
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Server, 
  CheckCircle, 
  XCircle, 
  Monitor,
  Cpu,
  Clock,
  Activity
} from 'lucide-react';

interface SystemTestingTabProps {
  testingData: any;
}

export const SystemTestingTab: React.FC<SystemTestingTabProps> = ({ testingData }) => {
  const [isRunning, setIsRunning] = useState(false);
  const systemTests = testingData.systemTests;

  const handleRunTests = async () => {
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 8000);
  };

  return (
    <div className="space-y-6">
      {/* System Test Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Server className="h-4 w-4 text-blue-600" />
              Total Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{systemTests.total}</div>
            <p className="text-xs text-muted-foreground">System scenarios</p>
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
            <div className="text-2xl font-bold text-green-600">{systemTests.passed}</div>
            <p className="text-xs text-muted-foreground">{((systemTests.passed / systemTests.total) * 100).toFixed(1)}% success rate</p>
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
            <div className="text-2xl font-bold text-red-600">{systemTests.failed}</div>
            <p className="text-xs text-muted-foreground">System issues</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-600" />
              Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{systemTests.coverage}%</div>
            <p className="text-xs text-muted-foreground">System paths</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Test Execution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              System Test Execution
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
                    Running System Tests...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run System Suite
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Performance Tests</span>
                  <Badge variant="default">8 tests</Badge>
                </div>
                <Progress value={88} className="h-2 mb-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>7 passed, 1 failed</span>
                  <span>Avg: 12.3s</span>
                </div>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Load Tests</span>
                  <Badge variant="default">6 tests</Badge>
                </div>
                <Progress value={83} className="h-2 mb-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>5 passed, 1 failed</span>
                  <span>Avg: 18.7s</span>
                </div>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Security Tests</span>
                  <Badge variant="default">10 tests</Badge>
                </div>
                <Progress value={90} className="h-2 mb-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>9 passed, 1 failed</span>
                  <span>Avg: 8.1s</span>
                </div>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Scalability Tests</span>
                  <Badge variant="default">4 tests</Badge>
                </div>
                <Progress value={75} className="h-2 mb-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>3 passed, 1 failed</span>
                  <span>Avg: 45.2s</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Health Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              System Health Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { metric: 'CPU Usage', value: '23%', status: 'healthy', trend: 'stable', threshold: '< 80%' },
              { metric: 'Memory Usage', value: '456 MB', status: 'healthy', trend: 'stable', threshold: '< 2GB' },
              { metric: 'Response Time', value: '1.2s', status: 'warning', trend: 'increasing', threshold: '< 2s' },
              { metric: 'Throughput', value: '850 req/min', status: 'healthy', trend: 'stable', threshold: '> 500/min' },
              { metric: 'Error Rate', value: '0.3%', status: 'healthy', trend: 'decreasing', threshold: '< 1%' }
            ].map((metric, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">{metric.metric}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg">{metric.value}</span>
                    <div className={`h-2 w-2 rounded-full ${
                      metric.status === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                  </div>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Threshold: {metric.threshold}</span>
                  <span className={`${
                    metric.trend === 'stable' ? 'text-blue-600' :
                    metric.trend === 'decreasing' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {metric.trend}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* System Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Recent System Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { test: 'High Load Performance Test', status: 'passed', duration: '45.2s', metric: '1000 concurrent users' },
              { test: 'Database Connection Pool Test', status: 'passed', duration: '12.8s', metric: '100 connections' },
              { test: 'Memory Leak Detection', status: 'failed', duration: '180.3s', metric: 'Memory usage spike' },
              { test: 'API Rate Limiting Test', status: 'passed', duration: '23.4s', metric: '10k requests/min' },
              { test: 'Security Penetration Test', status: 'passed', duration: '67.1s', metric: 'All endpoints secure' }
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
                    <p className="text-sm text-muted-foreground">{result.metric}</p>
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
