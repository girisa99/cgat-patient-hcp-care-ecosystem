
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { TestResult, testingService } from '@/services/testingService';
import { supabase } from '@/integrations/supabase/client';

interface ApiIntegrationMetrics {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  coverage: number;
}

interface TestingData {
  apiIntegrationTests: ApiIntegrationMetrics;
}

interface TestingMeta {
  singleSourceEnforced: boolean;
  integrationValidated: boolean;
  testingVersion: string;
  totalTestSuites: number;
  overallCoverage: number;
  dataSource: string;
  usingRealData: boolean;
  lastSyncAt: string;
  totalApisAvailable: number;
  testingFocus: string;
}

export const useUnifiedTestingData = () => {
  const [testingData, setTestingData] = useState<TestingData>({
    apiIntegrationTests: { total: 0, passed: 0, failed: 0, skipped: 0, coverage: 0 }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [executionHistory, setExecutionHistory] = useState<TestResult[]>([]);
  const [availableApis, setAvailableApis] = useState<number>(0);
  const { toast } = useToast();

  // Check available APIs on mount
  useEffect(() => {
    const checkAvailableApis = async () => {
      try {
        const { data: apis, error } = await supabase
          .from('api_integration_registry')
          .select('id')
          .eq('status', 'active');
        
        if (error) {
          console.error('Error fetching APIs:', error);
          setAvailableApis(0);
        } else {
          setAvailableApis(apis?.length || 0);
          console.log(`🔍 Found ${apis?.length || 0} active APIs for integration testing`);
        }
      } catch (error) {
        console.error('Failed to check available APIs:', error);
        setAvailableApis(0);
      }
    };

    checkAvailableApis();
  }, []);

  const meta: TestingMeta = {
    singleSourceEnforced: true,
    integrationValidated: true,
    testingVersion: 'v2.1.0-api-focused',
    totalTestSuites: 1, // Only API Integration Testing
    overallCoverage: testingData.apiIntegrationTests.total > 0 
      ? Math.round((testingData.apiIntegrationTests.passed / testingData.apiIntegrationTests.total) * 100) 
      : 0,
    dataSource: 'Real API Integration Registry',
    usingRealData: true,
    lastSyncAt: new Date().toISOString(),
    totalApisAvailable: availableApis,
    testingFocus: 'API Integration Only'
  };

  const runTestSuite = async (testType: string): Promise<TestResult> => {
    if (testType !== 'integration') {
      throw new Error('This testing suite only supports API integration testing');
    }

    if (availableApis === 0) {
      toast({
        title: "⚠️ No APIs Available",
        description: "No active APIs found in the integration registry. Please add APIs before running tests.",
        variant: "destructive",
      });
      
      return {
        id: `no-apis-${Date.now()}`,
        testType: 'integration',
        testName: 'API Integration Test Suite',
        status: 'skipped',
        duration: 0,
        coverage: 0,
        executedAt: new Date().toISOString(),
        errorMessage: 'No APIs available for testing'
      };
    }

    setIsLoading(true);
    
    try {
      toast({
        title: `🧪 Executing API Integration Tests`,
        description: `Testing ${availableApis} active APIs...`,
      });

      const results = await testingService.executeTestSuite('integration');
      
      setExecutionHistory(prev => [...prev, ...results]);
      await updateTestingDataFromResults(results);
      
      const summary = generateTestSummary(results);
      
      toast({
        title: `✅ API Integration Tests Completed`,
        description: `${results.filter(r => r.status === 'passed').length}/${results.length} tests passed`,
      });

      return summary;
    } catch (error) {
      toast({
        title: "❌ API Integration Test Failed",
        description: `Failed to execute API integration tests. Check console for details.`,
        variant: "destructive",
      });
      console.error(`API integration test execution failed:`, error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const runAllTests = async (): Promise<TestResult[]> => {
    if (availableApis === 0) {
      toast({
        title: "⚠️ No APIs Available",
        description: "No active APIs found. Add APIs to your integration registry first.",
        variant: "destructive",
      });
      return [];
    }

    return [await runTestSuite('integration')];
  };

  const getRecentTestResults = async (): Promise<TestResult[]> => {
    try {
      const serviceResults = await testingService.getTestResults();
      const allResults = [...serviceResults, ...executionHistory];
      
      return allResults
        .filter(r => r.testType === 'integration') // Only API integration results
        .sort((a, b) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime())
        .slice(0, 20);
    } catch (error) {
      console.error('Failed to get recent test results:', error);
      return executionHistory
        .filter(r => r.testType === 'integration')
        .slice(-10);
    }
  };

  const updateTestingDataFromResults = async (results: TestResult[]) => {
    const integrationResults = results.filter(r => r.testType === 'integration');
    const total = integrationResults.length;
    const passed = integrationResults.filter(r => r.status === 'passed').length;
    const failed = integrationResults.filter(r => r.status === 'failed').length;
    const skipped = integrationResults.filter(r => r.status === 'skipped').length;
    const avgCoverage = total > 0 
      ? integrationResults.reduce((sum, r) => sum + (r.coverage || 0), 0) / total 
      : 0;

    setTestingData({
      apiIntegrationTests: {
        total,
        passed,
        failed,
        skipped,
        coverage: Math.round(avgCoverage)
      }
    });
  };

  const generateTestSummary = (results: TestResult[]): TestResult => {
    const passed = results.filter(r => r.status === 'passed').length;
    const total = results.length;
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
    const avgCoverage = results.reduce((sum, r) => sum + (r.coverage || 0), 0) / total;

    return {
      id: `api-integration-summary-${Date.now()}`,
      testType: 'integration',
      testName: 'API Integration Test Suite Summary',
      status: passed === total ? 'passed' : passed > 0 ? 'failed' : 'skipped',
      duration: totalDuration,
      coverage: Math.round(avgCoverage),
      executedAt: new Date().toISOString(),
      errorMessage: passed < total ? `${total - passed} API integration tests failed` : undefined
    };
  };

  // Refresh API count and testing data periodically
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const { data: apis } = await supabase
          .from('api_integration_registry')
          .select('id')
          .eq('status', 'active');
        
        const currentApiCount = apis?.length || 0;
        if (currentApiCount !== availableApis) {
          setAvailableApis(currentApiCount);
          console.log(`🔄 API count updated: ${currentApiCount} active APIs`);
        }
      } catch (error) {
        console.error('Failed to refresh API count:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [availableApis]);

  return {
    testingData,
    meta,
    isLoading,
    runTestSuite,
    runAllTests,
    getRecentTestResults,
    executionHistory,
    getTestStats: () => testingService.getTestSuiteStats(),
    getAllTestResults: () => testingService.getTestResults()
  };
};
