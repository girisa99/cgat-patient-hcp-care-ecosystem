import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface TestExecutionStatusProps {
  isExecuting: boolean;
  isGenerating: boolean;
  testingStats: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    pendingTests: number;
    testCoverage: number;
  };
}

export const TestExecutionStatus: React.FC<TestExecutionStatusProps> = ({
  isExecuting,
  isGenerating,
  testingStats
}) => {
  if (isExecuting || isGenerating) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          <span className="font-medium text-blue-700">
            {isExecuting ? 'Executing Tests...' : 'Generating Tests...'}
          </span>
        </div>
        <Progress value={65} className="h-2" />
        <p className="text-sm text-blue-600 mt-2">
          {isExecuting ? 'Running test suite and validating results' : 'Creating comprehensive test cases'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <div>
          <div className="font-semibold text-green-700">{testingStats.passedTests}</div>
          <div className="text-sm text-green-600">Passed</div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
        <XCircle className="h-5 w-5 text-red-600" />
        <div>
          <div className="font-semibold text-red-700">{testingStats.failedTests}</div>
          <div className="text-sm text-red-600">Failed</div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <Clock className="h-5 w-5 text-yellow-600" />
        <div>
          <div className="font-semibold text-yellow-700">{testingStats.pendingTests}</div>
          <div className="text-sm text-yellow-600">Pending</div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <AlertTriangle className="h-5 w-5 text-blue-600" />
        <div>
          <div className="font-semibold text-blue-700">{testingStats.testCoverage.toFixed(1)}%</div>
          <div className="text-sm text-blue-600">Coverage</div>
        </div>
      </div>
    </div>
  );
};