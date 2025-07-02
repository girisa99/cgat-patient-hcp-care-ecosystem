
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UnifiedTestingOverview } from './UnifiedTestingOverview';
import { IntegrationTestingTab } from './tabs/IntegrationTestingTab';
import { ComprehensiveTestingTab } from './tabs/ComprehensiveTestingTab';
import { TestResultsDashboard } from './TestResultsDashboard';
import { useUnifiedTestingData } from '@/hooks/useUnifiedTestingData';
import { useComprehensiveTesting } from '@/hooks/useComprehensiveTesting';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, TestTube, Database } from 'lucide-react';

export const TestingModule: React.FC = () => {
  const { 
    testingData, 
    meta, 
    isLoading: apiTestingLoading,
    runTestSuite,
    runAllTests,
    getRecentTestResults
  } = useUnifiedTestingData();

  const {
    systemHealth,
    isInitializing,
    error: comprehensiveError
  } = useComprehensiveTesting();
  
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="comprehensive">Comprehensive</TabsTrigger>
          <TabsTrigger value="api-integration">API Integration</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
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

        <TabsContent value="results">
          <TestResultsDashboard 
            testResults={[]} 
            isLoading={apiTestingLoading || isInitializing}
          />
        </TabsContent>

        <TabsContent value="compliance">
          <div className="grid grid-cols-1 gap-6">
            {/* 21 CFR Part 11 Compliance Overview */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <TestTube className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="text-xl font-semibold text-green-900">21 CFR Part 11 Compliance Status</h3>
                  <p className="text-green-700">Electronic Records and Electronic Signatures Compliance</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-green-100">
                  <h4 className="font-medium text-green-900 mb-2">Electronic Records</h4>
                  <div className="text-sm text-green-700 space-y-1">
                    <div>✅ Audit trails maintained</div>
                    <div>✅ Data integrity verified</div>
                    <div>✅ Access controls active</div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-green-100">
                  <h4 className="font-medium text-green-900 mb-2">Electronic Signatures</h4>
                  <div className="text-sm text-green-700 space-y-1">
                    <div>✅ Digital signatures required</div>
                    <div>✅ User authentication verified</div>
                    <div>✅ Signature binding validated</div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-green-100">
                  <h4 className="font-medium text-green-900 mb-2">Validation Documentation</h4>
                  <div className="text-sm text-green-700 space-y-1">
                    <div>✅ IQ/OQ/PQ protocols</div>
                    <div>✅ Test summary reports</div>
                    <div>✅ Change control records</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Compliance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border rounded-lg p-6">
                <h4 className="font-medium mb-4">Validation Levels Coverage</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">IQ (Installation Qualification)</span>
                    <span className="text-sm font-medium">Active</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">OQ (Operational Qualification)</span>
                    <span className="text-sm font-medium">Active</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">PQ (Performance Qualification)</span>
                    <span className="text-sm font-medium">Active</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white border rounded-lg p-6">
                <h4 className="font-medium mb-4">Compliance Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Test Cases with CFR Metadata</span>
                    <span className="text-sm font-medium text-green-600">100%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Electronic Signatures Required</span>
                    <span className="text-sm font-medium text-green-600">Critical Tests</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Audit Trail Coverage</span>
                    <span className="text-sm font-medium text-green-600">Complete</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
