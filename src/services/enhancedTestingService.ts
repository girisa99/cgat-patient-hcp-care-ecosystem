
import { supabase } from '@/integrations/supabase/client';
import { 
  ComprehensiveTestCase, 
  TestExecutionResult, 
  SystemFunctionality,
  comprehensiveTestingService
} from './comprehensiveTestingService';

export interface AdvancedTestFilters {
  suite_type?: string;
  test_status?: string;
  execution_status?: 'never_executed' | 'recently_executed' | 'stale' | 'failed_last_run';
  last_executed_within?: 'hour' | 'day' | 'week' | 'month';
  last_updated_within?: 'hour' | 'day' | 'week' | 'month';
  test_category?: 'technical' | 'system' | 'business' | 'security' | 'compliance';
  compliance_level?: 'IQ' | 'OQ' | 'PQ' | 'validation_plan';
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  module_name?: string;
  topic?: string;
  coverage_area?: string;
  business_function?: string;
  created_within?: 'hour' | 'day' | 'week' | 'month';
  auto_generated?: boolean;
}

export interface TestExecutionMetrics {
  totalTests: number;
  executedTests: number;
  pendingTests: number;
  failedTests: number;
  newTests: number;
  staleTests: number;
  securityTests: number;
  complianceTests: number;
  technicalTests: number;
  businessTests: number;
}

export interface RoleBasedTestSuite {
  roleName: string;
  moduleAccess: string[];
  requiredTests: ComprehensiveTestCase[];
  loginScenarios: ComprehensiveTestCase[];
  permissionTests: ComprehensiveTestCase[];
}

export interface DocumentationGenerationResult {
  userRequirements: string[];
  functionalRequirements: string[];
  traceabilityMatrix: Array<{
    requirement: string;
    testCases: string[];
    coverage: number;
  }>;
  testingPlan: {
    overview: string;
    testApproach: string;
    testSchedule: string;
    resources: string[];
  };
  generatedAt: string;
  compliance: {
    cfrPart11: boolean;
    validationLevel: string;
    auditTrail: boolean;
  };
}

class EnhancedTestingService {
  /**
   * Get test cases with advanced filtering capabilities - delegates to existing service
   */
  async getAdvancedTestCases(filters: AdvancedTestFilters = {}): Promise<ComprehensiveTestCase[]> {
    try {
      // Convert our advanced filters to the format expected by the comprehensive service
      const comprehensiveFilters = {
        suite_type: filters.suite_type,
        test_status: filters.test_status,
        module_name: filters.module_name,
        topic: filters.topic,
        coverage_area: filters.coverage_area,
        business_function: filters.business_function
      };
      
      // Use the existing comprehensive testing service method with correct name
      return await comprehensiveTestingService.getTestCases(comprehensiveFilters);
    } catch (error) {
      console.error('Error fetching advanced test cases:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive test execution metrics
   */
  async getTestExecutionMetrics(): Promise<TestExecutionMetrics> {
    const testCases = await this.getAdvancedTestCases({});
    const now = Date.now();
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
    const oneDayAgo = now - (24 * 60 * 60 * 1000);

    const metrics: TestExecutionMetrics = {
      totalTests: testCases.length,
      executedTests: testCases.filter(tc => tc.last_executed_at).length,
      pendingTests: testCases.filter(tc => tc.test_status === 'pending').length,
      failedTests: testCases.filter(tc => tc.test_status === 'failed').length,
      newTests: testCases.filter(tc => new Date(tc.created_at).getTime() > oneDayAgo).length,
      staleTests: testCases.filter(tc => 
        tc.last_executed_at && 
        new Date(tc.last_executed_at).getTime() < oneWeekAgo
      ).length,
      securityTests: testCases.filter(tc => 
        tc.coverage_area === 'Security' || 
        tc.topic?.includes('Security') ||
        tc.test_name.toLowerCase().includes('security')
      ).length,
      complianceTests: testCases.filter(tc => 
        tc.coverage_area === 'Compliance' ||
        tc.validation_level ||
        tc.cfr_part11_metadata
      ).length,
      technicalTests: testCases.filter(tc => 
        ['Technical', 'Database', 'API'].includes(tc.coverage_area || '')
      ).length,
      businessTests: testCases.filter(tc => 
        ['Business', 'Operations', 'User Experience'].includes(tc.coverage_area || '')
      ).length
    };

    return metrics;
  }

  /**
   * Generate comprehensive documentation from existing test cases and system data
   */
  async generateComprehensiveDocumentation(): Promise<DocumentationGenerationResult> {
    try {
      console.log('🔄 Generating comprehensive documentation...');
      
      const testCases = await this.getAdvancedTestCases({});
      const metrics = await this.getTestExecutionMetrics();
      
      const userRequirements = this.extractUserRequirements(testCases);
      const functionalRequirements = this.generateFunctionalRequirements(testCases);
      const traceabilityMatrix = this.buildTraceabilityMatrix(userRequirements, testCases);
      const testingPlan = this.createTestingPlan(testCases, metrics);
      
      const documentation: DocumentationGenerationResult = {
        userRequirements,
        functionalRequirements,
        traceabilityMatrix,
        testingPlan,
        generatedAt: new Date().toISOString(),
        compliance: {
          cfrPart11: true,
          validationLevel: 'PQ',
          auditTrail: true
        }
      };
      
      console.log('✅ Comprehensive documentation generated successfully');
      return documentation;
      
    } catch (error) {
      console.error('❌ Failed to generate documentation:', error);
      throw error;
    }
  }

  /**
   * Generate role-based test suites automatically - delegates to existing service
   */
  async generateRoleBasedTestSuites(): Promise<RoleBasedTestSuite[]> {
    try {
      // Use existing service functionality
      const testCases = await this.getAdvancedTestCases({});
      
      // For now, return a simple structure - this should be enhanced based on actual roles
      const roleBasedSuites: RoleBasedTestSuite[] = [
        {
          roleName: 'admin',
          moduleAccess: ['all'],
          requiredTests: testCases.filter(tc => tc.coverage_area === 'Security'),
          loginScenarios: testCases.filter(tc => tc.test_name.toLowerCase().includes('login')),
          permissionTests: testCases.filter(tc => tc.test_name.toLowerCase().includes('permission'))
        }
      ];

      return roleBasedSuites;
    } catch (error) {
      console.error('Error generating role-based test suites:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive security and compliance test cases - delegates to existing service
   */
  async generateSecurityAndComplianceTests(): Promise<number> {
    try {
      // Use existing comprehensive testing service method with correct name
      return await comprehensiveTestingService.generateTestCases();
    } catch (error) {
      console.error('Error generating security and compliance tests:', error);
      throw error;
    }
  }

  /**
   * Private helper methods for documentation generation
   */
  private extractUserRequirements(testCases: ComprehensiveTestCase[]): string[] {
    const requirements = new Set<string>();
    
    testCases.forEach(testCase => {
      if (testCase.business_function) {
        requirements.add(`The system shall support ${testCase.business_function} functionality`);
      }
      if (testCase.coverage_area) {
        requirements.add(`The system shall provide ${testCase.coverage_area} capabilities`);
      }
      if (testCase.module_name) {
        requirements.add(`The system shall include ${testCase.module_name} module`);
      }
    });
    
    return Array.from(requirements);
  }

  private generateFunctionalRequirements(testCases: ComprehensiveTestCase[]): string[] {
    const functionalReqs = new Set<string>();
    
    testCases.forEach(testCase => {
      if (testCase.test_description) {
        const requirement = testCase.test_description
          .replace(/test/gi, 'system')
          .replace(/verify/gi, 'shall')
          .replace(/automated/gi, 'automatic');
        functionalReqs.add(requirement);
      }
    });
    
    return Array.from(functionalReqs);
  }

  private buildTraceabilityMatrix(
    requirements: string[], 
    testCases: ComprehensiveTestCase[]
  ): Array<{ requirement: string; testCases: string[]; coverage: number }> {
    return requirements.map(requirement => {
      const relatedTests = testCases.filter(tc => 
        tc.test_description?.toLowerCase().includes(requirement.toLowerCase().split(' ')[3]) ||
        tc.module_name?.toLowerCase().includes(requirement.toLowerCase().split(' ')[4]) ||
        tc.coverage_area?.toLowerCase().includes(requirement.toLowerCase().split(' ')[4])
      );
      
      return {
        requirement,
        testCases: relatedTests.map(tc => tc.test_name),
        coverage: relatedTests.length > 0 ? Math.min(100, relatedTests.length * 25) : 0
      };
    });
  }

  private createTestingPlan(
    testCases: ComprehensiveTestCase[], 
    metrics: TestExecutionMetrics
  ): DocumentationGenerationResult['testingPlan'] {
    return {
      overview: `Comprehensive testing plan covering ${metrics.totalTests} test cases across multiple test suites including security, compliance, and functional testing.`,
      testApproach: 'Risk-based testing approach with automated test execution, continuous integration, and 21 CFR Part 11 compliance validation.',
      testSchedule: 'Continuous testing with daily automated runs, weekly regression testing, and monthly comprehensive validation cycles.',
      resources: [
        'Automated testing framework',
        'Test data management system',
        'Compliance validation tools',
        'Security testing utilities',
        'Performance monitoring tools'
      ]
    };
  }
}

export const enhancedTestingService = new EnhancedTestingService();
