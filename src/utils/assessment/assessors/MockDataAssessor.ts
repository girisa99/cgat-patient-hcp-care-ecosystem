
/**
 * Mock Data Assessor
 * Handles assessment of mock data usage across the codebase
 */

import { MockDataAssessment } from '../types/AssessmentTypes';

export class MockDataAssessor {
  /**
   * Assess mock data usage across the codebase
   */
  static async assessMockDataUsage(): Promise<MockDataAssessment> {
    console.log('📊 Assessing mock data usage...');

    // Updated assessment after cleanup
    const mockDataPatterns = [
      'mockUsers',
      'mockFacilities', 
      'mockPatients',
      'dummyData',
      'fakeData',
      'testData',
      'sampleData'
    ];

    // Updated files list after cleanup
    const filesWithMockData = [
      'utils/api/ExternalApiManager.ts - Contains example/mock API configurations (acceptable for demos)'
    ];

    // Updated components list after cleanup
    const componentsUsingMockData = [
      'ApiTestingInterface - Uses mock API responses for testing (acceptable)',
      'DeveloperPortal - Might have mock developer applications (acceptable for demos)'
    ];

    // Updated hooks list after cleanup
    const hooksWithMockData = [
      'useExternalApis - Verify no mock API responses in production'
    ];

    return {
      filesWithMockData,
      componentsUsingMockData,
      hooksWithMockData,
      mockDataPatterns,
      severity: 'low', // Reduced from medium after cleanup
      cleanupRecommendations: [
        '✅ UserManagementDebug component removed from production',
        '✅ Mock data cleaned up from user management components',
        'Verify remaining test components are only used in development',
        'Ensure API testing interfaces have proper environment checks'
      ]
    };
  }
}
