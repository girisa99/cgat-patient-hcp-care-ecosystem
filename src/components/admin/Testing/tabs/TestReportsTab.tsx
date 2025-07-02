
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp,
  BarChart3,
  PieChart,
  Share,
  Mail
} from 'lucide-react';

interface TestReportsTabProps {
  testingData: any;
}

export const TestReportsTab: React.FC<TestReportsTabProps> = ({ testingData }) => {
  const generateOverallStats = () => {
    const allSuites = Object.values(testingData) as any[];
    return allSuites.reduce((acc, suite) => ({
      total: acc.total + suite.total,
      passed: acc.passed + suite.passed,
      failed: acc.failed + suite.failed,
      skipped: acc.skipped + suite.skipped,
      coverage: acc.coverage + suite.coverage
    }), { total: 0, passed: 0, failed: 0, skipped: 0, coverage: 0 });
  };

  const stats = generateOverallStats();
  const avgCoverage = stats.coverage / Object.keys(testingData).length;

  return (
    <div className="space-y-6">
      {/* Report Generation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generate Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button className="w-full">
                <Download className="h-4 w-4 mr-2" />
                PDF Report
              </Button>
              <Button variant="outline" className="w-full">
                <Share className="h-4 w-4 mr-2" />
                Share Report
              </Button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">Executive Summary</span>
                <Button size="sm" variant="ghost">
                  <Download className="h-3 w-3 mr-1" />
                  PDF
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">Detailed Test Results</span>
                <Button size="sm" variant="ghost">
                  <Download className="h-3 w-3 mr-1" />
                  Excel
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">Coverage Analysis</span>
                <Button size="sm" variant="ghost">
                  <Download className="h-3 w-3 mr-1" />
                  CSV
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">Trend Analysis</span>
                <Button size="sm" variant="ghost">
                  <Download className="h-3 w-3 mr-1" />
                  JSON
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Scheduled Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Daily Test Summary</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Sent every day at 9:00 AM</p>
                  <p>Recipients: dev-team@company.com</p>
                </div>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Weekly Coverage Report</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Sent every Monday at 8:00 AM</p>
                  <p>Recipients: qa-leads@company.com</p>
                </div>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Monthly Executive Report</span>
                  <Badge variant="secondary">Paused</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Sent first Monday of each month</p>
                  <p>Recipients: executives@company.com</p>
                </div>
              </div>
            </div>

            <Button className="w-full">
              <Mail className="h-4 w-4 mr-2" />
              Configure Email Reports
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Testing Metrics Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Testing Metrics Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">{stats.total.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Tests</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">{((stats.passed / stats.total) * 100).toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Pass Rate</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">{avgCoverage.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Avg Coverage</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600 mb-1">94.2</div>
              <div className="text-sm text-muted-foreground">Quality Score</div>
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(testingData).map(([suiteName, suite]: [string, any]) => (
              <div key={suiteName} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium capitalize">{suiteName.replace('Tests', ' Tests')}</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{suite.total} tests</Badge>
                    <Badge variant={((suite.passed / suite.total) * 100) > 90 ? 'default' : 'secondary'}>
                      {((suite.passed / suite.total) * 100).toFixed(1)}% pass
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 mb-3">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">{suite.passed}</div>
                    <div className="text-xs text-muted-foreground">Passed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-red-600">{suite.failed}</div>
                    <div className="text-xs text-muted-foreground">Failed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-yellow-600">{suite.skipped}</div>
                    <div className="text-xs text-muted-foreground">Skipped</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-purple-600">{suite.coverage}%</div>
                    <div className="text-xs text-muted-foreground">Coverage</div>
                  </div>
                </div>
                <Progress value={(suite.passed / suite.total) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Historical Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Historical Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { period: 'Last 24 Hours', tests: 1250, passed: 1182, coverage: 91.2, trend: '+0.8%' },
              { period: 'Last 7 Days', tests: 8750, passed: 8225, coverage: 91.8, trend: '+1.2%' },
              { period: 'Last 30 Days', tests: 35000, passed: 32550, coverage: 90.4, trend: '+2.1%' },
              { period: 'Last Quarter', tests: 105000, passed: 97650, coverage: 89.8, trend: '+3.4%' }
            ].map((trend, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="font-medium">{trend.period}</div>
                    <div className="text-sm text-muted-foreground">{trend.tests.toLocaleString()} tests</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-sm font-medium text-green-600">
                      {((trend.passed / trend.tests) * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Pass Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-purple-600">{trend.coverage}%</div>
                    <div className="text-xs text-muted-foreground">Coverage</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-blue-600">{trend.trend}</div>
                    <div className="text-xs text-muted-foreground">Improvement</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quality Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Quality Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Test Distribution</h4>
              <div className="space-y-2">
                {Object.entries(testingData).map(([suiteName, suite]: [string, any]) => (
                  <div key={suiteName} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{suiteName.replace('Tests', '')}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20">
                        <Progress value={(suite.total / stats.total) * 100} className="h-2" />
                      </div>
                      <span className="text-sm font-medium w-12">
                        {((suite.total / stats.total) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Quality Metrics</h4>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-900">Test Stability</span>
                    <span className="text-sm font-bold text-green-600">Excellent</span>
                  </div>
                  <div className="text-xs text-green-700 mt-1">94.2% consistent pass rate</div>
                </div>
                
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-900">Coverage Growth</span>
                    <span className="text-sm font-bold text-blue-600">+3.4%</span>
                  </div>
                  <div className="text-xs text-blue-700 mt-1">Quarterly improvement</div>
                </div>

                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-purple-900">Execution Speed</span>
                    <span className="text-sm font-bold text-purple-600">Fast</span>
                  </div>
                  <div className="text-xs text-purple-700 mt-1">Average 12.3s per test</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
