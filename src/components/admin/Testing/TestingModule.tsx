
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UnifiedTestingOverview } from './UnifiedTestingOverview';
import { IntegrationTestingTab } from './tabs/IntegrationTestingTab';
import { ComprehensiveTestingTab } from './tabs/ComprehensiveTestingTab';
import { UnitTestingTab } from './tabs/UnitTestingTab';
import { RoleBasedTestingTab } from './tabs/RoleBasedTestingTab';
import { UnifiedTestResultsDisplay } from './components/UnifiedTestResultsDisplay';
import { RefactoringProgress } from './RefactoringProgress';
import { useUnifiedTestingData } from '@/hooks/useUnifiedTestingData';
import { useComprehensiveTesting } from '@/hooks/useComprehensiveTesting';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, TestTube, Database, Wrench } from 'lucide-react';
import { TestResult } from '@/services/testingService';

export const TestingModule: React.FC = () => {
  const { 
    testingData, 
    meta, 
    isLoading: apiTestingLoading,
    runTestSuite,
    runAllTests,
    getRecentTestResults,
    getAllTestResults
  } = useUnifiedTestingData();

  const {
    systemHealth,
    isInitializing,
    error: comprehensiveError
  } = useComprehensiveTesting();

  const [allTestResults, setAllTestResults] = useState<TestResult[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);

  // Load all test results when component mounts or when getAllTestResults changes
  useEffect(() => {
    const loadAllTestResults = async () => {
      if (!getAllTestResults) return;
      
      setIsLoadingResults(true);
      try {
        const results = await getAllTestResults();
        setAllTestResults(Array.isArray(results) ? results : []);
      } catch (error) {
        console.error('Failed to load test results:', error);
        setAllTestResults([]);
      } finally {
        setIsLoadingResults(false);
      }
    };

    loadAllTestResults();
  }, [getAllTestResults]);
  
  console.log('🧪 Testing Module - Unified Testing Suite (API + Comprehensive)');

  return (
    <div className="space-y-6">
      {/* Unified Testing Header */}
      <div className="bg-gradient-to-r from-emerald-50 via-blue-50 to-purple-50 border border-emerald-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <TestTube className="h-6 w-6 text-purple-600" />
          <h3 className="font-semibold text-emerald-900">🧪 Unified Testing Suite - Single Source of Truth</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* API Integration Testing Status */}
          <div className="bg-white rounded-lg p-4 border border-emerald-100">
            <div className="flex items-center gap-2 mb-3">
              <Database className="h-5 w-5 text-emerald-600" />
              <h4 className="font-medium text-emerald-900">API Integration Testing</h4>
            </div>
            <div className="text-sm text-emerald-700 space-y-1">
              <div><strong>APIs Available:</strong> {meta.totalApisAvailable}</div>
              <div><strong>Coverage:</strong> {meta.overallCoverage}%</div>
              <div><strong>Data Source:</strong> {meta.dataSource}</div>
              <div><strong>Real Data:</strong> {meta.usingRealData ? '✅ Active' : '❌ Mock'}</div>
            </div>
          </div>

          {/* Comprehensive Testing Status */}
          <div className="bg-white rounded-lg p-4 border border-purple-100">
            <div className="flex items-center gap-2 mb-3">
              <TestTube className="h-5 w-5 text-purple-600" />
              <h4 className="font-medium text-purple-900">Comprehensive Testing</h4>
            </div>
            <div className="text-sm text-purple-700 space-y-1">
              <div><strong>System Functions:</strong> {systemHealth.totalFunctionality}</div>
              <div><strong>Test Cases:</strong> {systemHealth.totalTestCases}</div>
              <div><strong>Coverage:</strong> {systemHealth.overallCoverage}%</div>
              <div><strong>Issues:</strong> {systemHealth.criticalIssues}</div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-gradient-to-r from-emerald-100 to-purple-100 border border-emerald-300 rounded-md">
          <p className="text-emerald-800 font-medium">
            ⚡ This unified suite provides comprehensive testing coverage including API integrations, 
            system functionality, unit tests, regression testing, and 21 CFR Part 11 compliance validation.
          </p>
        </div>
      </div>

      {/* Error Alerts */}
      {(meta.totalApisAvailable === 0 && systemHealth.totalFunctionality === 0) && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>System Not Initialized:</strong> No APIs or system functionality detected. 
            Please initialize the comprehensive testing system or add APIs to the integration registry.
          </AlertDescription>
        </Alert>
      )}

      {comprehensiveError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Comprehensive Testing Error:</strong> {comprehensiveError}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="comprehensive">Comprehensive</TabsTrigger>
          <TabsTrigger value="api-integration">API Integration</TabsTrigger>
          <TabsTrigger value="unit">Unit Tests</TabsTrigger>
          <TabsTrigger value="role-based">Role-Based</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="refactoring">Refactoring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <UnifiedTestingOverview 
            testingData={testingData}
            isLoading={apiTestingLoading || isInitializing}
            runTestSuite={runTestSuite}
            runAllTests={runAllTests}
            getRecentTestResults={getRecentTestResults}
          />
        </TabsContent>

        <TabsContent value="comprehensive">
          <ComprehensiveTestingTab />
        </TabsContent>

        <TabsContent value="api-integration">
          <IntegrationTestingTab 
            testingData={testingData}
            runTestSuite={runTestSuite}
            isLoading={apiTestingLoading}
          />
        </TabsContent>

        <TabsContent value="unit">
          <UnitTestingTab
            testingData={testingData}
            runTestSuite={runTestSuite}
            isLoading={apiTestingLoading}
          />
        </TabsContent>

        <TabsContent value="role-based">
          <RoleBasedTestingTab />
        </TabsContent>

        <TabsContent value="results">
          <UnifiedTestResultsDisplay 
            testResults={allTestResults} 
            isLoading={apiTestingLoading || isInitializing || isLoadingResults}
            title="All Test Results"
            showTrends={true}
          />
        </TabsContent>

        <TabsContent value="refactoring">
          <RefactoringProgress />
        </TabsContent>
      </Tabs>
    </div>
  );
};
