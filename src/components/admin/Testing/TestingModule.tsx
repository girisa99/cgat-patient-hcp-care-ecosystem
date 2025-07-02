
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UnifiedTestingOverview } from './UnifiedTestingOverview';
import { IntegrationTestingTab } from './tabs/IntegrationTestingTab';
import { TestResultsDashboard } from './TestResultsDashboard';
import { useUnifiedTestingData } from '@/hooks/useUnifiedTestingData';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export const TestingModule: React.FC = () => {
  const { 
    testingData, 
    meta, 
    isLoading,
    runTestSuite,
    runAllTests,
    getRecentTestResults
  } = useUnifiedTestingData();
  
  console.log('🧪 Testing Module - API Integration Testing ONLY');

  return (
    <div className="space-y-6">
      {/* Single Source of Truth Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <h3 className="font-semibold text-emerald-900">🧪 API Integration Testing Suite - Single Source of Truth</h3>
        </div>
        <div className="text-sm text-emerald-700 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p><strong>Pattern:</strong> {meta.singleSourceEnforced ? '✅ Enforced' : '❌ Not Enforced'}</p>
            <p><strong>Version:</strong> {meta.testingVersion}</p>
          </div>
          <div>
            <p><strong>Focus:</strong> {meta.testingFocus}</p>
            <p><strong>APIs Available:</strong> {meta.totalApisAvailable}</p>
          </div>
          <div>
            <p><strong>Data Source:</strong> {meta.dataSource}</p>
            <p><strong>Real Data:</strong> {meta.usingRealData ? '✅ Active' : '❌ Mock'}</p>
          </div>
          <div>
            <p><strong>Coverage:</strong> {meta.overallCoverage}%</p>
            <p><strong>Last Sync:</strong> {meta.lastSyncAt ? new Date(meta.lastSyncAt).toLocaleTimeString() : 'Never'}</p>
          </div>
        </div>
        <div className="mt-3 p-3 bg-emerald-100 border border-emerald-300 rounded-md">
          <p className="text-emerald-800 font-medium">
            ⚡ This suite tests ONLY API integrations from your registry. System functionality testing is handled separately.
          </p>
        </div>
      </div>

      {/* No APIs Warning */}
      {meta.totalApisAvailable === 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>No APIs Available:</strong> No active APIs found in your integration registry. 
            Please add APIs to the API Services section before running integration tests.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="integration">API Integration</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <UnifiedTestingOverview 
            testingData={testingData}
            isLoading={isLoading}
            runTestSuite={runTestSuite}
            runAllTests={runAllTests}
            getRecentTestResults={getRecentTestResults}
          />
        </TabsContent>

        <TabsContent value="integration">
          <IntegrationTestingTab 
            testingData={testingData}
            runTestSuite={runTestSuite}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="results">
          <TestResultsDashboard 
            testResults={[]} 
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
