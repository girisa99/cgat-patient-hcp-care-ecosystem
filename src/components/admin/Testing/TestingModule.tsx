
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UnifiedTestingOverview } from './UnifiedTestingOverview';
import { UnitTestingTab } from './tabs/UnitTestingTab';
import { IntegrationTestingTab } from './tabs/IntegrationTestingTab';
import { SystemTestingTab } from './tabs/SystemTestingTab';
import { RegressionTestingTab } from './tabs/RegressionTestingTab';
import { E2ETestingTab } from './tabs/E2ETestingTab';
import { TestReportsTab } from './tabs/TestReportsTab';
import { useUnifiedTestingData } from '@/hooks/useUnifiedTestingData';

export const TestingModule: React.FC = () => {
  const { 
    testingData, 
    meta, 
    isLoading,
    runTestSuite,
    runAllTests,
    getRecentTestResults
  } = useUnifiedTestingData();
  
  console.log('🧪 Testing Module - Real data implementation with functional buttons');

  return (
    <div className="space-y-6">
      {/* Testing Implementation Status Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <h3 className="font-semibold text-emerald-900">🧪 Testing Tools - Real Data Implementation</h3>
        </div>
        <div className="text-sm text-emerald-700 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p><strong>Pattern:</strong> {meta.singleSourceEnforced ? '✅ Enforced' : '❌ Not Enforced'}</p>
            <p><strong>Version:</strong> {meta.testingVersion}</p>
          </div>
          <div>
            <p><strong>Test Suites:</strong> {meta.totalTestSuites}</p>
            <p><strong>Coverage:</strong> {meta.overallCoverage}%</p>
          </div>
          <div>
            <p><strong>Data Source:</strong> {meta.dataSource}</p>
            <p><strong>Real Data:</strong> {meta.usingRealData ? '✅ Active' : '❌ Mock'}</p>
          </div>
          <div>
            <p><strong>Status:</strong> Production Ready</p>
            <p><strong>Last Sync:</strong> {meta.lastSyncAt ? new Date(meta.lastSyncAt).toLocaleTimeString() : 'Never'}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="unit">Unit Tests</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="regression">Regression</TabsTrigger>
          <TabsTrigger value="e2e">E2E Tests</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
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

        <TabsContent value="unit">
          <UnitTestingTab 
            testingData={testingData}
            runTestSuite={runTestSuite}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="integration">
          <IntegrationTestingTab 
            testingData={testingData}
            runTestSuite={runTestSuite}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="system">
          <SystemTestingTab 
            testingData={testingData}
            runTestSuite={runTestSuite}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="regression">
          <RegressionTestingTab 
            testingData={testingData}
            runTestSuite={runTestSuite}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="e2e">
          <E2ETestingTab 
            testingData={testingData}
            runTestSuite={runTestSuite}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="reports">
          <TestReportsTab testingData={testingData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
