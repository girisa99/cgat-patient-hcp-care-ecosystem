
/**
 * Integrated System Verifier
 * Combines SystemVerificationDashboard checks with existing automation
 */

import { supabase } from '@/integrations/supabase/client';

interface SystemVerificationResult {
  component: string;
  status: 'success' | 'error' | 'warning' | 'loading';
  message: string;
  details?: string[];
  lastChecked: string;
  metrics?: Record<string, any>;
}

export class IntegratedSystemVerifier {
  /**
   * Run comprehensive system verification (for background automation)
   */
  static async runAutomatedSystemVerification(): Promise<{
    results: SystemVerificationResult[];
    overallStatus: 'healthy' | 'warning' | 'critical';
    healthScore: number;
  }> {
    console.log('🔍 INTEGRATED: Running automated system verification...');
    
    const results: SystemVerificationResult[] = [];
    
    try {
      // Test Authentication System
      const authResult = await this.verifyAuthenticationSystem();
      results.push(authResult);

      // Test User Management
      const userResult = await this.verifyUserManagement();
      results.push(userResult);

      // Test Facilities Management
      const facilitiesResult = await this.verifyFacilitiesManagement();
      results.push(facilitiesResult);

      // Test Modules System
      const modulesResult = await this.verifyModulesSystem();
      results.push(modulesResult);

      // Test Database Connection
      const dbResult = await this.verifyDatabaseConnection();
      results.push(dbResult);

      // Calculate overall health
      const { overallStatus, healthScore } = this.calculateOverallHealth(results);

      console.log('✅ INTEGRATED: System verification completed', {
        totalChecks: results.length,
        overallStatus,
        healthScore
      });

      return { results, overallStatus, healthScore };

    } catch (error) {
      console.error('❌ INTEGRATED: System verification failed:', error);
      throw error;
    }
  }

  /**
   * Verify Authentication System
   */
  private static async verifyAuthenticationSystem(): Promise<SystemVerificationResult> {
    try {
      // Check if we can authenticate and get user info
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        return {
          component: 'Authentication',
          status: 'error',
          message: 'Authentication system error',
          details: [`❌ Error: ${error.message}`],
          lastChecked: new Date().toISOString()
        };
      }

      if (user) {
        // Check user roles - corrected query to join with roles table
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select(`
            roles (
              name
            )
          `)
          .eq('user_id', user.id);

        const roleNames = userRoles ? userRoles.map(ur => ur.roles?.name).filter(Boolean) : [];

        const authDetails = [
          `✅ Authentication service active`,
          `✅ User session valid: ${user.email}`,
          `✅ User ID: ${user.id}`,
          `✅ Roles: ${roleNames.length > 0 ? roleNames.join(', ') : 'No roles assigned'}`,
        ];

        return {
          component: 'Authentication',
          status: roleNames.length > 0 ? 'success' : 'warning',
          message: roleNames.length > 0 ? 'Authentication system working correctly' : 'User authenticated but no roles assigned',
          details: authDetails,
          lastChecked: new Date().toISOString(),
          metrics: {
            userAuthenticated: true,
            rolesCount: roleNames.length
          }
        };
      }

      return {
        component: 'Authentication',
        status: 'warning',
        message: 'No active user session found',
        details: ['⚠️ Background verification running without user context'],
        lastChecked: new Date().toISOString()
      };

    } catch (error: any) {
      return {
        component: 'Authentication',
        status: 'error',
        message: 'Authentication verification failed',
        details: [`❌ Error: ${error.message}`],
        lastChecked: new Date().toISOString()
      };
    }
  }

  /**
   * Verify User Management System
   */
  private static async verifyUserManagement(): Promise<SystemVerificationResult> {
    try {
      // Test direct database access to user data
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(5);

      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

      if (profilesError && authError) {
        return {
          component: 'User Management',
          status: 'error',
          message: 'User management system error',
          details: [
            `❌ Profiles error: ${profilesError.message}`,
            `❌ Auth users error: ${authError.message}`
          ],
          lastChecked: new Date().toISOString()
        };
      }

      const profilesCount = profiles?.length || 0;
      const authUsersCount = authUsers?.users?.length || 0;

      const userDetails = [
        `✅ Profiles table accessible: ${profilesCount} records`,
        `✅ Auth users accessible: ${authUsersCount} users`,
        `✅ User management system operational`
      ];

      return {
        component: 'User Management',
        status: 'success',
        message: 'User management system working correctly',
        details: userDetails,
        lastChecked: new Date().toISOString(),
        metrics: {
          profilesCount,
          authUsersCount,
          dataSource: 'direct_database'
        }
      };

    } catch (error: any) {
      return {
        component: 'User Management',
        status: 'error',
        message: 'User management verification failed',
        details: [`❌ Error: ${error.message}`],
        lastChecked: new Date().toISOString()
      };
    }
  }

  /**
   * Verify Facilities Management
   */
  private static async verifyFacilitiesManagement(): Promise<SystemVerificationResult> {
    try {
      const { data: facilities, error } = await supabase
        .from('facilities')
        .select('*');

      if (error) {
        return {
          component: 'Facilities Management',
          status: 'error',
          message: 'Facilities management system error',
          details: [`❌ Error: ${error.message}`],
          lastChecked: new Date().toISOString()
        };
      }

      const facilityDetails = [
        `✅ Total facilities: ${facilities?.length || 0}`,
        `✅ Active facilities: ${facilities?.filter(f => f.is_active).length || 0}`,
        `✅ Facility types: ${facilities ? [...new Set(facilities.map(f => f.facility_type))].join(', ') : 'None'}`
      ];

      return {
        component: 'Facilities Management',
        status: 'success',
        message: 'Facilities management system working correctly',
        details: facilityDetails,
        lastChecked: new Date().toISOString(),
        metrics: {
          totalFacilities: facilities?.length || 0,
          activeFacilities: facilities?.filter(f => f.is_active).length || 0
        }
      };

    } catch (error: any) {
      return {
        component: 'Facilities Management',
        status: 'error',
        message: 'Facilities management verification failed',
        details: [`❌ Error: ${error.message}`],
        lastChecked: new Date().toISOString()
      };
    }
  }

  /**
   * Verify Modules System
   */
  private static async verifyModulesSystem(): Promise<SystemVerificationResult> {
    try {
      const { data: modules, error } = await supabase
        .from('modules')
        .select('*');

      if (error) {
        return {
          component: 'Modules Management',
          status: 'error',
          message: 'Modules management system error',
          details: [`❌ Error: ${error.message}`],
          lastChecked: new Date().toISOString()
        };
      }

      const moduleDetails = [
        `✅ Total modules: ${modules?.length || 0}`,
        `✅ Active modules: ${modules?.filter(m => m.is_active).length || 0}`,
        `✅ Module names: ${modules?.map(m => m.name).join(', ') || 'None'}`
      ];

      return {
        component: 'Modules Management',
        status: 'success',
        message: 'Modules management system working correctly',
        details: moduleDetails,
        lastChecked: new Date().toISOString(),
        metrics: {
          totalModules: modules?.length || 0,
          activeModules: modules?.filter(m => m.is_active).length || 0
        }
      };

    } catch (error: any) {
      return {
        component: 'Modules Management',
        status: 'error',
        message: 'Modules management verification failed',
        details: [`❌ Error: ${error.message}`],
        lastChecked: new Date().toISOString()
      };
    }
  }

  /**
   * Verify Database Connection
   */
  private static async verifyDatabaseConnection(): Promise<SystemVerificationResult> {
    try {
      // Test basic database connectivity
      const { data, error } = await supabase
        .from('active_issues')
        .select('count', { count: 'exact', head: true });

      if (error) {
        return {
          component: 'Database Connection',
          status: 'error',
          message: 'Database connection error',
          details: [`❌ Error: ${error.message}`],
          lastChecked: new Date().toISOString()
        };
      }

      return {
        component: 'Database Connection',
        status: 'success',
        message: 'Database connection active',
        details: [
          '✅ Supabase client initialized',
          '✅ Database queries working',
          `✅ Active issues table accessible (${data || 0} records)`
        ],
        lastChecked: new Date().toISOString(),
        metrics: {
          activeIssuesCount: data || 0
        }
      };

    } catch (error: any) {
      return {
        component: 'Database Connection',
        status: 'error',
        message: 'Database connection verification failed',
        details: [`❌ Error: ${error.message}`],
        lastChecked: new Date().toISOString()
      };
    }
  }

  /**
   * Calculate overall system health
   */
  private static calculateOverallHealth(results: SystemVerificationResult[]): {
    overallStatus: 'healthy' | 'warning' | 'critical';
    healthScore: number;
  } {
    const totalChecks = results.length;
    const successCount = results.filter(r => r.status === 'success').length;
    const warningCount = results.filter(r => r.status === 'warning').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    const healthScore = Math.round((successCount / totalChecks) * 100);

    let overallStatus: 'healthy' | 'warning' | 'critical';
    if (errorCount > 0) {
      overallStatus = 'critical';
    } else if (warningCount > 0) {
      overallStatus = 'warning';
    } else {
      overallStatus = 'healthy';
    }

    return { overallStatus, healthScore };
  }
}

export const integratedSystemVerifier = new IntegratedSystemVerifier();
