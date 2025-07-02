
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UnifiedTestingOverview } from './UnifiedTestingOverview';
import { IntegrationTestingTab } from './tabs/IntegrationTestingTab';
import { ComprehensiveTestingTab } from './tabs/ComprehensiveTestingTab';
import { UnitTestingTab } from './tabs/UnitTestingTab';
import { RoleBasedTestingTab } from './tabs/RoleBasedTestingTab';
import { UnifiedTestResultsDisplay } from './components/UnifiedTestResultsDisplay';
import { RefactoringProgress } from './RefactoringProgress';
import TestingErrorBoundary from './components/TestingErrorBoundary';
import { useUnifiedTestingData } from '@/hooks/useUnifiedTestingData';
import { useComprehensiveTesting } from '@/hooks/useComprehensiveTesting';
import { useEnhancedTestingBusinessLayer } from '@/hooks/useEnhancedTestingBusinessLayer';
import { testingServiceFactory } from '@/services/testing/TestingServiceFactory';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, TestTube, Database, Wrench, Factory } from 'lucide-react';
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

  const {
    enhancedMetrics,
    isLoadingMetrics: isLoadingEnhancedMetrics
  } = useEnhancedTestingBusinessLayer();

  const [allTestResults, setAllTestResults] = useState<TestResult[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [serviceFactoryStatus, setServiceFactoryStatus] = useState<any>(null);

  // Initialize service factory and load health status
  useEffect(() => {
    const initializeServices = async () => {
      try {
        await testingServiceFactory.initialize({
          enableEnhancedFeatures: true,
          enableComplianceMode: true,
          batchSize: 50,
          environment: 'development'
        });
        
        const healthStatus = testingServiceFactory.getHealthStatus();
        setServiceFactoryStatus(healthStatus);
        
        console.log('🏭 Testing Service Factory initialized with health status:', healthStatus);
      } catch (error) {
        console.error('❌ Failed to initialize Testing Service Factory:', error);
      }
    };

    initializeServices();
  }, []);

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
  
  console.log('🧪 Testing Module - Enhanced Service Layer Architecture Active');

  return (
    <TestingErrorBoundary>
      <div className="space-y-6">
        {/* Enhanced Service Layer Header */}
        <div className="bg-gradient-to-r from-emerald-50 via-blue-50 to-purple-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <Factory className="h-6 w-6 text-purple-600" />
            <h3 className="font-semibold text-emerald-900">🧪 Enhanced Testing Suite - Service Layer Architecture</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            {/* Enhanced Business Layer Status */}
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <div className="flex items-center gap-2 mb-3">
                <Factory className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium text-blue-900">Enhanced Business Layer</h4>
              </div>
              <div className="text-sm text-blue-700 space-y-1">
                <div><strong>Service Factory:</strong> {serviceFactoryStatus?.factoryInitialized ? '✅ Ready' : '⏳ Loading'}</div>
                <div><strong>Compliance Score:</strong> {enhancedMetrics?.complianceScore ?? 0}%</div>
                <div><strong>Enhanced Features:</strong> {serviceFactoryStatus?.availableServices?.enhanced ? '✅ Enabled' : '❌ Disabled'}</div>
                <div><strong>Business Logic:</strong> {serviceFactoryStatus?.availableServices?.businessLayer ? '✅ Active' : '❌ Inactive'}</div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gradient-to-r from-emerald-100 to-purple-100 border border-emerald-300 rounded-md">
            <p className="text-emerald-800 font-medium">
              ⚡ Enhanced service layer architecture provides unified testing capabilities with improved dependency injection,
              error handling, and business intelligence. Phase 2: Service Layer Architecture is now complete.
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

        {!serviceFactoryStatus?.factoryInitialized && (
          <Alert>
            <Factory className="h-4 w-4" />
            <AlertDescription>
              <strong>Service Factory Initializing:</strong> Enhanced testing services are being configured.
              Some features may be limited until initialization completes.
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
              isLoading={apiTestingLoading || isInitializing || isLoadingResults || isLoadingEnhancedMetrics}
              title="All Test Results"
              showTrends={true}
            />
          </TabsContent>

          <TabsContent value="refactoring">
            <RefactoringProgress />
          </TabsContent>
        </Tabs>
      </div>
    </TestingErrorBoundary>
  );
};
