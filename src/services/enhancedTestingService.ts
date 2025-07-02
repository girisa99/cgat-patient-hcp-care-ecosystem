
import { supabase } from '@/integrations/supabase/client';
import { comprehensiveTestingService, ComprehensiveTestCase } from './comprehensiveTestingService';

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

class EnhancedTestingService {
  /**
   * Get test cases with advanced filtering capabilities
   */
  async getAdvancedTestCases(filters: AdvancedTestFilters = {}): Promise<ComprehensiveTestCase[]> {
    try {
      let query = supabase
        .from('comprehensive_test_cases')
        .select('*')
        .order('created_at', { ascending: false });

      // Basic filters
      if (filters.suite_type) {
        query = query.eq('test_suite_type', filters.suite_type);
      }
      
      if (filters.test_status) {
        query = query.eq('test_status', filters.test_status);
      }

      if (filters.module_name) {
        query = query.eq('module_name', filters.module_name);
      }

      if (filters.topic) {
        query = query.eq('topic', filters.topic);
      }

      if (filters.coverage_area) {
        query = query.eq('coverage_area', filters.coverage_area);
      }

      if (filters.business_function) {
        query = query.eq('business_function', filters.business_function);
      }

      if (filters.compliance_level) {
        query = query.eq('validation_level', filters.compliance_level);
      }

      if (filters.auto_generated !== undefined) {
        query = query.eq('auto_generated', filters.auto_generated);
      }

      // Execution status filtering
      if (filters.execution_status) {
        switch (filters.execution_status) {
          case 'never_executed':
            query = query.is('last_executed_at', null);
            break;
          case 'recently_executed':
            query = query.gte('last_executed_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
            break;
          case 'stale':
            query = query.lt('last_executed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
            break;
          case 'failed_last_run':
            query = query.eq('test_status', 'failed');
            break;
        }
      }

      // Time-based filtering
      if (filters.last_executed_within) {
        const timeMap = {
          hour: 60 * 60 * 1000,
          day: 24 * 60 * 60 * 1000,
          week: 7 * 24 * 60 * 60 * 1000,
          month: 30 * 24 * 60 * 60 * 1000
        };
        const cutoff = new Date(Date.now() - timeMap[filters.last_executed_within]).toISOString();
        query = query.gte('last_executed_at', cutoff);
      }

      if (filters.last_updated_within) {
        const timeMap = {
          hour: 60 * 60 * 1000,
          day: 24 * 60 * 60 * 1000,
          week: 7 * 24 * 60 * 60 * 1000,
          month: 30 * 24 * 60 * 60 * 1000
        };
        const cutoff = new Date(Date.now() - timeMap[filters.last_updated_within]).toISOString();
        query = query.gte('updated_at', cutoff);
      }

      if (filters.created_within) {
        const timeMap = {
          hour: 60 * 60 * 1000,
          day: 24 * 60 * 60 * 1000,
          week: 7 * 24 * 60 * 60 * 1000,
          month: 30 * 24 * 60 * 60 * 1000
        };
        const cutoff = new Date(Date.now() - timeMap[filters.created_within]).toISOString();
        query = query.gte('created_at', cutoff);
      }

      // Category-based filtering
      if (filters.test_category) {
        switch (filters.test_category) {
          case 'technical':
            query = query.in('coverage_area', ['Technical', 'Database', 'API']);
            break;
          case 'system':
            query = query.in('coverage_area', ['Performance', 'Infrastructure', 'System']);
            break;
          case 'business':
            query = query.in('coverage_area', ['Business', 'User Experience', 'Operations']);
            break;
          case 'security':
            query = query.in('coverage_area', ['Security', 'Privacy', 'Authentication']);
            break;
          case 'compliance':
            query = query.in('coverage_area', ['Compliance', 'Regulatory', 'Audit']);
            break;
        }
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Failed to fetch advanced test cases:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching advanced test cases:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive test execution metrics
   */
  async getTestExecutionMetrics(): Promise<TestExecutionMetrics> {
    const testCases = await comprehensiveTestingService.getTestCases();
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
   * Generate role-based test suites automatically
   */
  async generateRoleBasedTestSuites(): Promise<RoleBasedTestSuite[]> {
    try {
      // Get all roles from the system
      const { data: roles, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .eq('is_active', true);

      if (rolesError) throw rolesError;

      const roleBasedSuites: RoleBasedTestSuite[] = [];

      for (const role of roles || []) {
        // Get modules accessible by this role
        const { data: roleModuleAccess, error: moduleError } = await supabase
          .from('role_module_assignments')
          .select(`
            modules:module_id(name)
          `)
          .eq('role_id', role.id)
          .eq('is_active', true);

        if (moduleError) {
          console.error(`Error fetching modules for role ${role.name}:`, moduleError);
          continue;
        }

        const moduleNames = roleModuleAccess?.map(rma => rma.modules?.name).filter(Boolean) || [];

        // Generate test cases for this role
        const requiredTests = await this.generateRoleSpecificTests(role.name, moduleNames);
        const loginScenarios = await this.generateLoginScenarios(role.name);
        const permissionTests = await this.generatePermissionTests(role.name, moduleNames);

        roleBasedSuites.push({
          roleName: role.name,
          moduleAccess: moduleNames,
          requiredTests,
          loginScenarios,
          permissionTests
        });
      }

      return roleBasedSuites;
    } catch (error) {
      console.error('Error generating role-based test suites:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive security and compliance test cases
   */
  async generateSecurityAndComplianceTests(): Promise<number> {
    let testCasesCreated = 0;
    const batchId = crypto.randomUUID();

    const securityTestTemplates = [
      {
        category: 'Authentication Security',
        tests: [
          'Password Policy Validation',
          'Multi-Factor Authentication',
          'Session Management',
          'Account Lockout Mechanisms',
          'Password Reset Security'
        ]
      },
      {
        category: 'Data Privacy',
        tests: [
          'PII Data Encryption',
          'Data Anonymization',
          'Right to be Forgotten',
          'Data Access Logging',
          'Consent Management'
        ]
      },
      {
        category: 'Vulnerability Testing',
        tests: [
          'SQL Injection Prevention',
          'Cross-Site Scripting (XSS) Protection',
          'CSRF Token Validation',
          'Input Sanitization',
          'API Rate Limiting'
        ]
      },
      {
        category: 'Database Security',
        tests: [
          'Row Level Security Validation',
          'Database Access Controls',
          'Audit Trail Integrity',
          'Backup Security',
          'Connection Security'
        ]
      },
      {
        category: 'Compliance Testing',
        tests: [
          '21 CFR Part 11 Electronic Records',
          '21 CFR Part 11 Electronic Signatures',
          'HIPAA Data Protection',
          'GxP Compliance Validation',
          'Regulatory Audit Trail'
        ]
      }
    ];

    for (const template of securityTestTemplates) {
      for (const testName of template.tests) {
        try {
          const { error } = await supabase
            .from('comprehensive_test_cases')
            .insert({
              test_suite_type: 'system',
              test_category: 'security_compliance',
              test_name: `${template.category}: ${testName}`,
              test_description: `Automated security and compliance test for ${testName} within ${template.category}`,
              related_functionality: template.category.toLowerCase().replace(' ', '_'),
              validation_level: template.category.includes('Compliance') ? 'PQ' : 'OQ',
              module_name: 'Security & Compliance',
              topic: template.category,
              coverage_area: template.category.includes('Compliance') ? 'Compliance' : 'Security',
              business_function: 'Risk Management',
              cfr_part11_metadata: {
                compliance_level: '21_cfr_part_11',
                validation_required: true,
                electronic_signature_required: template.category.includes('Compliance'),
                security_category: template.category,
                risk_level: 'high'
              },
              execution_data: {
                batch_id: batchId,
                auto_generated: true,
                security_test: true,
                compliance_test: template.category.includes('Compliance')
              }
            });

          if (!error) {
            testCasesCreated++;
          }
        } catch (error) {
          console.error(`Failed to create test case for ${testName}:`, error);
        }
      }
    }

    console.log(`✅ Generated ${testCasesCreated} security and compliance test cases`);
    return testCasesCreated;
  }

  /**
   * Private helper methods
   */
  private async generateRoleSpecificTests(roleName: string, moduleNames: string[]): Promise<ComprehensiveTestCase[]> {
    const tests: ComprehensiveTestCase[] = [];
    
    for (const moduleName of moduleNames) {
      const testCase: Partial<ComprehensiveTestCase> = {
        id: crypto.randomUUID(),
        test_suite_type: 'integration',
        test_category: 'role_based_testing',
        test_name: `${roleName} Role - ${moduleName} Module Access Test`,
        test_description: `Verify ${roleName} role can access ${moduleName} module functionality`,
        module_name: moduleName,
        topic: 'Role-Based Access Control',
        coverage_area: 'Security',
        business_function: 'User Administration',
        test_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      tests.push(testCase as ComprehensiveTestCase);
    }
    
    return tests;
  }

  private async generateLoginScenarios(roleName: string): Promise<ComprehensiveTestCase[]> {
    const scenarios = [
      'Valid Login Scenario',
      'Invalid Password Scenario',
      'Account Lockout Scenario',
      'Password Reset Scenario',
      'Session Timeout Scenario'
    ];

    return scenarios.map(scenario => ({
      id: crypto.randomUUID(),
      test_suite_type: 'system',
      test_category: 'authentication_testing',
      test_name: `${roleName} - ${scenario}`,
      test_description: `Test ${scenario} for ${roleName} role`,
      module_name: 'Authentication',
      topic: 'Login Security',
      coverage_area: 'Security',
      business_function: 'User Authentication',
      test_status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })) as ComprehensiveTestCase[];
  }

  private async generatePermissionTests(roleName: string, moduleNames: string[]): Promise<ComprehensiveTestCase[]> {
    const permissionActions = ['Create', 'Read', 'Update', 'Delete'];
    const tests: ComprehensiveTestCase[] = [];

    for (const moduleName of moduleNames) {
      for (const action of permissionActions) {
        tests.push({
          id: crypto.randomUUID(),
          test_suite_type: 'unit',
          test_category: 'permission_testing',
          test_name: `${roleName} - ${action} Permission Test for ${moduleName}`,
          test_description: `Verify ${roleName} role ${action} permissions for ${moduleName} module`,
          module_name: moduleName,
          topic: 'Permission Validation',
          coverage_area: 'Security',
          business_function: 'Access Control',
          test_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as ComprehensiveTestCase);
      }
    }

    return tests;
  }
}

export const enhancedTestingService = new EnhancedTestingService();
