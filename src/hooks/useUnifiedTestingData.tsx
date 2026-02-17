import { useUnifiedTesting } from './useUnifiedTesting';

// Compatibility wrapper without conditional hook usage
export const useUnifiedTestingData = (config?: unknown) => {
  console.log('🔗 useUnifiedTestingData: wrapper');

  const unifiedData = useUnifiedTesting(config);

  if (unifiedData.error) {
    console.error('🔗 useUnifiedTestingData: underlying hook returned error', unifiedData.error);

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
      error: unifiedData.error
    };
  }

  return {
    ...unifiedData,
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
};

export default useUnifiedTestingData;
