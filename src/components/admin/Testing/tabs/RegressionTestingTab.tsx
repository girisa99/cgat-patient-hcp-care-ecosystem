
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  GitBranch, 
  CheckCircle, 
  XCircle, 
  History,
  Shield,
  Clock,
  TrendingUp
} from 'lucide-react';

interface RegressionTestingTabProps {
  testingData: any;
}

export const RegressionTestingTab: React.FC<RegressionTestingTabProps> = ({ testingData }) => {
  const [isRunning, setIsRunning] = useState(false);
  const regressionTests = testingData.regressionTests;

  const handleRunTests = async () => {
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 6000);
  };

  return (
    <div className="space-y-6">
      {/* Regression Test Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-blue-600" />
              Total Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{regressionTests.total}</div>
            <p className="text-xs text-muted-foreground">Regression scenarios</p>
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
            <div className="text-2xl font-bold text-green-600">{regressionTests.passed}</div>
            <p className="text-xs text-muted-foreground">{((regressionTests.passed / regressionTests.total) * 100).toFixed(1)}% success rate</p>
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
            <div className="text-2xl font-bold text-red-600">{regressionTests.failed}</div>
            <p className="text-xs text-muted-foreground">Regression issues</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-600" />
              Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{regressionTests.coverage}%</div>
            <p className="text-xs text-muted-foreground">Feature coverage</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regression Test Execution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Regression Test Execution
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
                    Running Regression Tests...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run Regression Suite
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Core Features</span>
                  <Badge variant="default">18 tests</Badge>
                </div>
                <Progress value={94} className="h-2 mb-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>17 passed, 1 failed</span>
                  <span>Critical path coverage</span>
                </div>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">API Endpoints</span>
                  <Badge variant="default">22 tests</Badge>
                </div>
                <Progress value={95} className="h-2 mb-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>21 passed, 1 failed</span>
                  <span>All endpoints tested</span>
                </div>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">User Workflows</span>
                  <Badge variant="default">14 tests</Badge>
                </div>
                <Progress value={93} className="h-2 mb-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>13 passed, 1 failed</span>
                  <span>End-to-end flows</span>
                </div>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Data Integrity</span>
                  <Badge variant="default">16 tests</Badge>
                </div>
                <Progress value={100} className="h-2 mb-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>16 passed, 0 failed</span>
                  <span>Data consistency verified</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Regression Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Regression Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { period: 'Last 7 Days', tests: 420, passed: 398, trend: 'improving', change: '+2.3%' },
              { period: 'Last 30 Days', tests: 1680, passed: 1587, trend: 'stable', change: '+0.1%' },
              { period: 'Last Quarter', tests: 5040, passed: 4738, trend: 'improving', change: '+4.2%' }
            ].map((trend, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{trend.period}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={trend.trend === 'improving' ? 'default' : 'secondary'}>
                      {trend.change}
                    </Badge>
                    <div className={`h-2 w-2 rounded-full ${
                      trend.trend === 'improving' ? 'bg-green-500' : 'bg-blue-500'
                    }`} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Progress value={(trend.passed / trend.tests) * 100} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{trend.passed}/{trend.tests} passed</span>
                    <span>{((trend.passed / trend.tests) * 100).toFixed(1)}% success</span>
                  </div>
                </div>
              </div>
            ))}

            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-900">Stability Score</span>
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">94.2</div>
              <p className="text-sm text-green-700">Excellent stability with consistent performance</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Regression Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Recent Regression Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { 
                test: 'API Authentication Flow Regression', 
                status: 'resolved', 
                impact: 'high', 
                introduced: '2 days ago',
                description: 'Token validation failed after security update'
              },
              { 
                test: 'Data Export Feature Regression', 
                status: 'investigating', 
                impact: 'medium', 
                introduced: '4 hours ago',
                description: 'CSV export generates malformed data'
              },
              { 
                test: 'UI Component Layout Regression', 
                status: 'resolved', 
                impact: 'low', 
                introduced: '1 week ago',
                description: 'Button alignment issues on mobile devices'
              },
              { 
                test: 'Database Query Performance', 
                status: 'resolved', 
                impact: 'medium', 
                introduced: '3 days ago',
                description: 'Slow response times for complex queries'
              }
            ].map((issue, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {issue.status === 'resolved' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-yellow-600" />
                    )}
                    <span className="font-medium">{issue.test}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      issue.impact === 'high' ? 'destructive' : 
                      issue.impact === 'medium' ? 'default' : 'secondary'
                    }>
                      {issue.impact} impact
                    </Badge>
                    <Badge variant={issue.status === 'resolved' ? 'default' : 'secondary'}>
                      {issue.status}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{issue.description}</p>
                <p className="text-xs text-muted-foreground">Introduced: {issue.introduced}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
