import React, { useState } from 'react';
import { BaseWorkflowNode } from './BaseWorkflowNode';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { TestTube, Play, CheckCircle, XCircle, Clock } from 'lucide-react';

interface TestCase {
  id: string;
  name: string;
  type: 'unit' | 'integration' | 'e2e' | 'performance';
  status: 'pending' | 'running' | 'passed' | 'failed';
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  duration?: number;
}

export const TestingNode: React.FC<{ id: string; data: any; selected: boolean }> = ({ id, data, selected }) => {
  const [testCases, setTestCases] = useState<TestCase[]>(data.testCases || [
    {
      id: '1',
      name: 'Basic Conversation Test',
      type: 'integration',
      status: 'passed',
      input: 'Hello, how can you help me?',
      expectedOutput: 'Welcome! I can help you with...',
      actualOutput: 'Welcome! I can help you with...',
      duration: 250
    },
    {
      id: '2',
      name: 'Error Handling Test',
      type: 'unit',
      status: 'failed',
      input: 'Invalid input data',
      expectedOutput: 'Error: Invalid input format',
      actualOutput: 'Server Error 500',
      duration: 100
    }
  ]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const addTestCase = () => {
    const newTest: TestCase = {
      id: Date.now().toString(),
      name: 'New Test Case',
      type: 'unit',
      status: 'pending',
      input: '',
      expectedOutput: ''
    };
    setTestCases([...testCases, newTest]);
  };

  const updateTestCase = (id: string, updates: Partial<TestCase>) => {
    setTestCases(testCases.map(test => test.id === id ? { ...test, ...updates } : test));
  };

  const runAllTests = async () => {
    setIsRunning(true);
    // Simulate running tests
    for (const test of testCases) {
      updateTestCase(test.id, { status: 'running' });
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Simulate random results
      const passed = Math.random() > 0.3;
      updateTestCase(test.id, { 
        status: passed ? 'passed' : 'failed',
        duration: Math.floor(Math.random() * 500) + 50,
        actualOutput: passed ? test.expectedOutput : 'Test failed with error'
      });
    }
    setIsRunning(false);
  };

  const runSingleTest = async (testId: string) => {
    const test = testCases.find(t => t.id === testId);
    if (!test) return;

    updateTestCase(testId, { status: 'running' });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const passed = Math.random() > 0.3;
    updateTestCase(testId, { 
      status: passed ? 'passed' : 'failed',
      duration: Math.floor(Math.random() * 500) + 50,
      actualOutput: passed ? test.expectedOutput : 'Test failed with error'
    });
  };

  const getStatusIcon = (status: TestCase['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'failed':
        return <XCircle className="h-3 w-3 text-red-500" />;
      case 'running':
        return <Clock className="h-3 w-3 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-3 w-3 text-gray-400" />;
    }
  };

  const getTypeColor = (type: TestCase['type']) => {
    const colors = {
      unit: 'bg-blue-100 text-blue-800',
      integration: 'bg-green-100 text-green-800',
      e2e: 'bg-purple-100 text-purple-800',
      performance: 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const passedTests = testCases.filter(t => t.status === 'passed').length;
  const failedTests = testCases.filter(t => t.status === 'failed').length;
  const totalTests = testCases.length;
  const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

  return (
    <BaseWorkflowNode
      id={id}
      data={data}
      selected={selected}
      icon={TestTube}
      title="Testing"
      className="bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {totalTests} Test{totalTests !== 1 ? 's' : ''}
            </Badge>
            <Badge variant="outline" className="text-xs text-green-600">
              {passedTests} Passed
            </Badge>
            {failedTests > 0 && (
              <Badge variant="outline" className="text-xs text-red-600">
                {failedTests} Failed
              </Badge>
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 px-2 text-xs"
          >
            {isExpanded ? 'Collapse' : 'Manage'}
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span>Pass Rate: {passRate.toFixed(1)}%</span>
            <span>{passedTests}/{totalTests}</span>
          </div>
          <Progress value={passRate} className="h-2" />
        </div>

        {!isExpanded && (
          <div className="space-y-1">
            {testCases.slice(0, 3).map((test) => (
              <div key={test.id} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {getStatusIcon(test.status)}
                  <span className="text-xs truncate">{test.name}</span>
                </div>
                <Badge variant="outline" className={`text-[10px] px-1 ${getTypeColor(test.type)}`}>
                  {test.type}
                </Badge>
              </div>
            ))}
            {testCases.length > 3 && (
              <div className="text-xs text-muted-foreground text-center py-1">
                +{testCases.length - 3} more tests
              </div>
            )}
          </div>
        )}

        {isExpanded && (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={runAllTests}
                disabled={isRunning}
                className="flex-1 h-7 text-xs"
              >
                <Play className="h-3 w-3 mr-1" />
                {isRunning ? 'Running...' : 'Run All'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={addTestCase}
                className="h-7 text-xs"
              >
                Add Test
              </Button>
            </div>

            {testCases.map((test) => (
              <div key={test.id} className="p-2 bg-white rounded border space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    {getStatusIcon(test.status)}
                    <Input
                      value={test.name}
                      onChange={(e) => updateTestCase(test.id, { name: e.target.value })}
                      className="h-6 text-xs"
                      placeholder="Test case name"
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => runSingleTest(test.id)}
                    disabled={test.status === 'running'}
                    className="h-6 px-2 text-xs"
                  >
                    <Play className="h-3 w-3" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Type</Label>
                    <Select value={test.type} onValueChange={(value: any) => updateTestCase(test.id, { type: value })}>
                      <SelectTrigger className="h-6 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unit">Unit</SelectItem>
                        <SelectItem value="integration">Integration</SelectItem>
                        <SelectItem value="e2e">End-to-End</SelectItem>
                        <SelectItem value="performance">Performance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Status</Label>
                    <div className="flex items-center gap-2 h-6">
                      {getStatusIcon(test.status)}
                      <span className="text-xs capitalize">{test.status}</span>
                      {test.duration && (
                        <span className="text-xs text-muted-foreground">({test.duration}ms)</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <Label className="text-xs">Input</Label>
                    <Textarea
                      value={test.input}
                      onChange={(e) => updateTestCase(test.id, { input: e.target.value })}
                      className="min-h-[40px] text-xs"
                      placeholder="Test input data"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Expected Output</Label>
                    <Textarea
                      value={test.expectedOutput}
                      onChange={(e) => updateTestCase(test.id, { expectedOutput: e.target.value })}
                      className="min-h-[40px] text-xs"
                      placeholder="Expected test result"
                    />
                  </div>
                  {test.actualOutput && (
                    <div>
                      <Label className="text-xs">Actual Output</Label>
                      <Textarea
                        value={test.actualOutput}
                        readOnly
                        className={`min-h-[40px] text-xs ${
                          test.status === 'failed' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                        }`}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </BaseWorkflowNode>
  );
};