
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Code, 
  CheckCircle, 
  XCircle, 
  FileText,
  Cpu,
  Clock,
  Target
} from 'lucide-react';

interface UnitTestingTabProps {
  testingData: any;
}

export const UnitTestingTab: React.FC<UnitTestingTabProps> = ({ testingData }) => {
  const [isRunning, setIsRunning] = useState(false);
  const unitTests = testingData.unitTests;

  const handleRunTests = async () => {
    setIsRunning(true);
    // Simulate test execution
    setTimeout(() => setIsRunning(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Unit Test Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              Total Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{unitTests.total}</div>
            <p className="text-xs text-muted-foreground">Unit test cases</p>
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
            <div className="text-2xl font-bold text-green-600">{unitTests.passed}</div>
            <p className="text-xs text-muted-foreground">{((unitTests.passed / unitTests.total) * 100).toFixed(1)}% success rate</p>
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
            <div className="text-2xl font-bold text-red-600">{unitTests.failed}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Cpu className="h-4 w-4 text-purple-600" />
              Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{unitTests.coverage}%</div>
            <p className="text-xs text-muted-foreground">Code coverage</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Execution Control */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Unit Test Execution
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
                    Running Tests...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run All Unit Tests
                  </>
                )}
              </Button>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                View Reports
              </Button>
            </div>

            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">API Services Tests</span>
                  <Badge variant="default">23 tests</Badge>
                </div>
                <Progress value={95} className="h-2 mb-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>22 passed, 1 failed</span>
                  <span>Coverage: 95%</span>
                </div>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Authentication Tests</span>
                  <Badge variant="default">18 tests</Badge>
                </div>
                <Progress value={100} className="h-2 mb-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>18 passed, 0 failed</span>
                  <span>Coverage: 98%</span>
                </div>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Data Processing Tests</span>
                  <Badge variant="default">31 tests</Badge>
                </div>
                <Progress value={87} className="h-2 mb-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>27 passed, 4 failed</span>
                  <span>Coverage: 87%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Test Categories & Coverage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { category: 'Component Tests', tests: 45, coverage: 94, status: 'healthy' },
              { category: 'Hook Tests', tests: 28, coverage: 91, status: 'healthy' },
              { category: 'Utility Function Tests', tests: 38, coverage: 96, status: 'healthy' },
              { category: 'API Client Tests', tests: 22, coverage: 88, status: 'warning' },
              { category: 'State Management Tests', tests: 19, coverage: 93, status: 'healthy' }
            ].map((category, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{category.category}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{category.tests} tests</Badge>
                    <div className={`h-2 w-2 rounded-full ${
                      category.status === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Progress value={category.coverage} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Coverage: {category.coverage}%</span>
                    <span>{category.status === 'healthy' ? 'All passing' : 'Some issues'}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Unit Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { test: 'ApiServices.handleCreateIntegration', status: 'passed', duration: '234ms', file: 'ApiServices.test.tsx' },
              { test: 'useUnifiedPageData.fetchData', status: 'passed', duration: '156ms', file: 'useUnifiedPageData.test.tsx' },
              { test: 'TestingModule.renderAllTabs', status: 'failed', duration: '445ms', file: 'TestingModule.test.tsx' },
              { test: 'AuthenticationFlow.validateToken', status: 'passed', duration: '298ms', file: 'AuthenticationFlow.test.tsx' },
              { test: 'DataProcessor.transformApiData', status: 'passed', duration: '187ms', file: 'DataProcessor.test.tsx' }
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
                    <p className="text-sm text-muted-foreground">{result.file}</p>
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
