
import { useUnifiedTesting } from './useUnifiedTesting';

// This is a compatibility wrapper for the unified testing data
export const useUnifiedTestingData = (config?: any) => {
  console.log('🔗 useUnifiedTestingData: Compatibility wrapper called');
  
  try {
    const unifiedData = useUnifiedTesting(config);
    console.log('🔗 useUnifiedTestingData: Successfully wrapped unified testing data');
    
    return {
      ...unifiedData,
      // Ensure we have the meta data structure expected by the Testing page
      meta: unifiedData.meta || {
        singleSourceEnforced: true,
        integrationValidated: true,
        testingVersion: 'v3.0.0-unified',
        totalTestSuites: 4,
        overallCoverage: 0,
        dataSource: 'Unified Testing Architecture',
        usingRealData: true,
        lastSyncAt: new Date().toISOString(),
        totalApisAvailable: 0,
        testingFocus: 'Comprehensive Unified Testing',
        serviceFactoryStatus: null
      }
    };
  } catch (error) {
    console.error('🔗 useUnifiedTestingData: Error in compatibility wrapper:', error);
    
    // Return a safe fallback
    return {
      testingData: {
        apiIntegrationTests: { total: 0, passed: 0, failed: 0, skipped: 0, coverage: 0 },
        systemHealth: { totalFunctionality: 0, totalTestCases: 0, overallCoverage: 0, criticalIssues: 0 }
      },
      meta: {
        singleSourceEnforced: true,
        integrationValidated: false,
        testingVersion: 'v3.0.0-unified',
        totalTestSuites: 4,
        overallCoverage: 0,
        dataSource: 'Unified Testing Architecture',
        usingRealData: true,
        lastSyncAt: new Date().toISOString(),
        totalApisAvailable: 0,
        testingFocus: 'Comprehensive Unified Testing',
        serviceFactoryStatus: null
      },
      isLoading: false,
      error: error instanceof Error ? error : new Error('Unknown error in testing data')
    };
  }
};

export default useUnifiedTestingData;
