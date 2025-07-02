
import { supabase } from '@/integrations/supabase/client';

export interface ComprehensiveTestCase {
  id: string;
  test_suite_type: 'unit' | 'integration' | 'system' | 'regression' | 'uat' | 'api_integration';
  test_category: string;
  test_name: string;
  test_description?: string;
  test_steps?: any[];
  expected_results?: string;
  actual_results?: string;
  test_status: 'pending' | 'passed' | 'failed' | 'skipped' | 'blocked';
  execution_data?: any;
  related_functionality?: string;
  database_source?: string;
  api_integration_id?: string;
  compliance_requirements?: any;
  validation_level?: 'IQ' | 'OQ' | 'PQ' | 'validation_plan';
  cfr_part11_metadata?: any;
  auto_generated?: boolean;
  created_at: string;
  updated_at: string;
  last_executed_at?: string;
  execution_duration_ms?: number;
  created_by?: string;
  updated_by?: string;
}

export interface TestExecutionResult {
  execution_batch_id: string;
  suite_type: string;
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  skipped_tests: number;
  pass_rate: number;
  executed_at: string;
  compliance_status: string;
}

export interface SystemFunctionality {
  id: string;
  functionality_type: 'table' | 'function' | 'view' | 'trigger' | 'policy' | 'component' | 'hook' | 'service';
  functionality_name: string;
  schema_name: string;
  description?: string;
  dependencies?: any[];
  test_coverage_status: 'uncovered' | 'partial' | 'full';
  last_analyzed_at: string;
  created_at: string;
  updated_at: string;
  metadata?: any;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
}

class ComprehensiveTestingService {
  /**
   * Detect and register system functionality
   */
  async detectSystemFunctionality(): Promise<void> {
    console.log('🔍 Detecting system functionality...');
    
    try {
      const { error } = await supabase.rpc('detect_system_functionality');
      
      if (error) {
        console.error('Failed to detect system functionality:', error);
        throw error;
      }
      
      console.log('✅ System functionality detection completed');
    } catch (error) {
      console.error('Error detecting system functionality:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive test cases for detected functionality
   */
  async generateTestCases(functionalityId?: string): Promise<number> {
    console.log('🧪 Generating comprehensive test cases...');
    
    try {
      const { data, error } = await supabase.rpc('generate_comprehensive_test_cases', {
        functionality_id: functionalityId || null
      });
      
      if (error) {
        console.error('Failed to generate test cases:', error);
        throw error;
      }
      
      const testCasesCreated = data || 0;
      console.log(`✅ Generated ${testCasesCreated} comprehensive test cases`);
      return testCasesCreated;
    } catch (error) {
      console.error('Error generating test cases:', error);
      throw error;
    }
  }

  /**
   * Execute comprehensive test suite
   */
  async executeTestSuite(suiteType?: string, batchSize: number = 50): Promise<TestExecutionResult> {
    console.log(`🚀 Executing comprehensive test suite: ${suiteType || 'all'}`);
    
    try {
      const { data, error } = await supabase.rpc('execute_comprehensive_test_suite', {
        suite_type: suiteType || null,
        batch_size: batchSize
      });
      
      if (error) {
        console.error('Failed to execute test suite:', error);
        throw error;
      }
      
      console.log('✅ Test suite execution completed:', data);
      
      // Safely handle the database response
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const result = data as Record<string, any>;
        return {
          execution_batch_id: String(result.execution_batch_id || ''),
          suite_type: String(result.suite_type || ''),
          total_tests: Number(result.total_tests || 0),
          passed_tests: Number(result.passed_tests || 0),
          failed_tests: Number(result.failed_tests || 0),
          skipped_tests: Number(result.skipped_tests || 0),
          pass_rate: Number(result.pass_rate || 0),
          executed_at: String(result.executed_at || new Date().toISOString()),
          compliance_status: String(result.compliance_status || '')
        };
      }
      
      throw new Error('Invalid response from test execution');
    } catch (error) {
      console.error('Error executing test suite:', error);
      throw error;
    }
  }

  /**
   * Get all test cases with filtering
   */
  async getTestCases(filters?: {
    suite_type?: string;
    test_status?: string;
    functionality?: string;
    limit?: number;
  }): Promise<ComprehensiveTestCase[]> {
    try {
      let query = supabase
        .from('comprehensive_test_cases')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.suite_type) {
        query = query.eq('test_suite_type', filters.suite_type);
      }
      
      if (filters?.test_status) {
        query = query.eq('test_status', filters.test_status);
      }
      
      if (filters?.functionality) {
        query = query.ilike('related_functionality', `%${filters.functionality}%`);
      }
      
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Failed to fetch test cases:', error);
        throw error;
      }
      
      // Safely convert database response to proper types
      return (data || []).map(item => ({
        ...item,
        test_suite_type: item.test_suite_type as ComprehensiveTestCase['test_suite_type'],
        test_status: item.test_status as ComprehensiveTestCase['test_status'],
        validation_level: item.validation_level as ComprehensiveTestCase['validation_level'],
        test_steps: Array.isArray(item.test_steps) ? item.test_steps : [],
        execution_data: typeof item.execution_data === 'object' ? item.execution_data : {},
        compliance_requirements: typeof item.compliance_requirements === 'object' ? item.compliance_requirements : {},
        cfr_part11_metadata: typeof item.cfr_part11_metadata === 'object' ? item.cfr_part11_metadata : {},
      }));
    } catch (error) {
      console.error('Error fetching test cases:', error);
      throw error;
    }
  }

  /**
   * Get system functionality registry
   */
  async getSystemFunctionality(filters?: {
    functionality_type?: string;
    test_coverage_status?: string;
    risk_level?: string;
  }): Promise<SystemFunctionality[]> {
    try {
      let query = supabase
        .from('system_functionality_registry')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.functionality_type) {
        query = query.eq('functionality_type', filters.functionality_type);
      }
      
      if (filters?.test_coverage_status) {
        query = query.eq('test_coverage_status', filters.test_coverage_status);
      }
      
      if (filters?.risk_level) {
        query = query.eq('risk_level', filters.risk_level);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Failed to fetch system functionality:', error);
        throw error;
      }
      
      // Safely convert database response to proper types
      return (data || []).map(item => ({
        ...item,
        functionality_type: item.functionality_type as SystemFunctionality['functionality_type'],
        test_coverage_status: item.test_coverage_status as SystemFunctionality['test_coverage_status'],
        risk_level: item.risk_level as SystemFunctionality['risk_level'],
        dependencies: Array.isArray(item.dependencies) ? item.dependencies : [],
        metadata: typeof item.metadata === 'object' ? item.metadata : {},
      }));
    } catch (error) {
      console.error('Error fetching system functionality:', error);
      throw error;
    }
  }

  /**
   * Get test execution history
   */
  async getExecutionHistory(testCaseId?: string, limit: number = 50): Promise<any[]> {
    try {
      let query = supabase
        .from('test_execution_history')
        .select(`
          *,
          comprehensive_test_cases!inner(
            test_name,
            test_suite_type,
            related_functionality
          )
        `)
        .order('executed_at', { ascending: false })
        .limit(limit);

      if (testCaseId) {
        query = query.eq('test_case_id', testCaseId);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Failed to fetch execution history:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching execution history:', error);
      throw error;
    }
  }

  /**
   * Get test statistics summary
   */
  async getTestStatistics(): Promise<{
    totalTestCases: number;
    testsByType: Record<string, number>;
    testsByStatus: Record<string, number>;
    coverageByFunctionality: Record<string, number>;
    overallCoverage: number;
  }> {
    try {
      // Get test cases summary
      const { data: testCases, error: testError } = await supabase
        .from('comprehensive_test_cases')
        .select('test_suite_type, test_status, related_functionality');

      if (testError) throw testError;

      // Get functionality summary
      const { data: functionality, error: funcError } = await supabase
        .from('system_functionality_registry')
        .select('functionality_type, test_coverage_status');

      if (funcError) throw funcError;

      // Calculate statistics
      const totalTestCases = testCases?.length || 0;
      
      const testsByType = testCases?.reduce((acc, test) => {
        acc[test.test_suite_type] = (acc[test.test_suite_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const testsByStatus = testCases?.reduce((acc, test) => {
        acc[test.test_status] = (acc[test.test_status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const coverageByFunctionality = functionality?.reduce((acc, func) => {
        acc[func.functionality_type] = (acc[func.functionality_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const coveredFunctionality = functionality?.filter(f => f.test_coverage_status !== 'uncovered').length || 0;
      const totalFunctionality = functionality?.length || 0;
      const overallCoverage = totalFunctionality > 0 ? (coveredFunctionality / totalFunctionality) * 100 : 0;

      return {
        totalTestCases,
        testsByType,
        testsByStatus,
        coverageByFunctionality,
        overallCoverage: Math.round(overallCoverage)
      };
    } catch (error) {
      console.error('Error fetching test statistics:', error);
      throw error;
    }
  }

  /**
   * Initialize comprehensive testing system
   */
  async initializeComprehensiveTesting(): Promise<{
    functionalityDetected: number;
    testCasesGenerated: number;
    coverageAnalysis: any;
  }> {
    console.log('🚀 Initializing comprehensive testing system...');
    
    try {
      // Step 1: Detect system functionality
      await this.detectSystemFunctionality();
      
      // Step 2: Get detected functionality count
      const functionality = await this.getSystemFunctionality();
      const functionalityDetected = functionality.length;
      
      // Step 3: Generate test cases for all uncovered functionality
      const testCasesGenerated = await this.generateTestCases();
      
      // Step 4: Get coverage analysis
      const coverageAnalysis = await this.getTestStatistics();
      
      console.log('✅ Comprehensive testing system initialized:', {
        functionalityDetected,
        testCasesGenerated,
        overallCoverage: coverageAnalysis.overallCoverage
      });
      
      return {
        functionalityDetected,
        testCasesGenerated,
        coverageAnalysis
      };
    } catch (error) {
      console.error('Failed to initialize comprehensive testing:', error);
      throw error;
    }
  }
}

export const comprehensiveTestingService = new ComprehensiveTestingService();
