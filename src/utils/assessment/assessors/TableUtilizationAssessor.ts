
/**
 * Table Utilization Assessor
 * Handles assessment of database table utilization and identifies unnecessary tables
 */

import { supabase } from '@/integrations/supabase/client';
import { databaseSchemaAnalyzer } from '@/utils/api/DatabaseSchemaAnalyzer';
import { TableUtilizationAssessment } from '../types/AssessmentTypes';

export class TableUtilizationAssessor {
  /**
   * Assess table utilization and identify unnecessary tables
   */
  static async assessTableUtilization(): Promise<TableUtilizationAssessment> {
    console.log('📊 Assessing table utilization...');

    try {
      // Get all database tables
      const databaseTables = await databaseSchemaAnalyzer.getAllTables();
      
      // Essential tables for core functionality
      const essentialTables = [
        {
          name: 'profiles',
          purpose: 'User profile data - Core user management',
          recordCount: await this.getTableRecordCount('profiles'),
          lastActivity: await this.getTableLastActivity('profiles'),
          isActive: true
        },
        {
          name: 'facilities',
          purpose: 'Healthcare facility management - Core business entity',
          recordCount: await this.getTableRecordCount('facilities'),
          lastActivity: await this.getTableLastActivity('facilities'),
          isActive: true
        },
        {
          name: 'modules',
          purpose: 'System modules and features - Core application structure',
          recordCount: await this.getTableRecordCount('modules'),
          lastActivity: await this.getTableLastActivity('modules'),
          isActive: true
        },
        {
          name: 'roles',
          purpose: 'RBAC roles - Core security (✅ Real-time enabled)',
          recordCount: await this.getTableRecordCount('roles'),
          lastActivity: await this.getTableLastActivity('roles'),
          isActive: true
        },
        {
          name: 'user_roles',
          purpose: 'User role assignments - Core RBAC (✅ Real-time enabled)',
          recordCount: await this.getTableRecordCount('user_roles'),
          lastActivity: await this.getTableLastActivity('user_roles'),
          isActive: true
        },
        {
          name: 'permissions',
          purpose: 'System permissions - Core RBAC',
          recordCount: await this.getTableRecordCount('permissions'),
          lastActivity: await this.getTableLastActivity('permissions'),
          isActive: true
        },
        {
          name: 'api_integration_registry',
          purpose: 'API integrations registry - Core API management',
          recordCount: await this.getTableRecordCount('api_integration_registry'),
          lastActivity: await this.getTableLastActivity('api_integration_registry'),
          isActive: true
        },
        {
          name: 'external_api_registry',
          purpose: 'Published APIs registry - Core external API management',
          recordCount: await this.getTableRecordCount('external_api_registry'),
          lastActivity: await this.getTableLastActivity('external_api_registry'),
          isActive: true
        },
        {
          name: 'api_lifecycle_events',
          purpose: 'API lifecycle tracking - Consolidated change tracking (✅ Actively used)',
          recordCount: await this.getTableRecordCount('api_lifecycle_events'),
          lastActivity: await this.getTableLastActivity('api_lifecycle_events'),
          isActive: true
        }
      ];

      // Updated unnecessary tables list after cleanup - api_change_tracking was removed
      const unnecessaryTables = [
        {
          name: 'developer_notification_preferences',
          reason: 'Low usage - developer notifications not fully implemented',
          recordCount: await this.getTableRecordCount('developer_notification_preferences'),
          canDelete: false,
          dependencies: ['developer_notifications']
        },
        {
          name: 'marketplace_listings',
          reason: 'Marketplace feature not in active use',
          recordCount: await this.getTableRecordCount('marketplace_listings'),
          canDelete: false,
          dependencies: ['external_api_registry']
        }
      ];

      // Empty tables analysis
      const emptyTables = [];
      for (const table of databaseTables) {
        const count = await this.getTableRecordCount(table.table_name);
        if (count === 0) {
          emptyTables.push({
            name: table.table_name,
            purpose: this.getTablePurpose(table.table_name),
            shouldKeep: this.shouldKeepEmptyTable(table.table_name),
            reason: this.getEmptyTableReason(table.table_name)
          });
        }
      }

      return {
        essentialTables,
        unnecessaryTables,
        emptyTables
      };
    } catch (error) {
      console.error('❌ Error assessing table utilization:', error);
      return {
        essentialTables: [],
        unnecessaryTables: [],
        emptyTables: []
      };
    }
  }

  private static async getTableRecordCount(tableName: string): Promise<number> {
    try {
      // Handle specific tables with proper type checking
      switch (tableName) {
        case 'profiles': {
          const { count: profilesCount, error: profilesError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });
          return profilesError ? 0 : (profilesCount || 0);
        }
          
        case 'facilities': {
          const { count: facilitiesCount, error: facilitiesError } = await supabase
            .from('facilities')
            .select('*', { count: 'exact', head: true });
          return facilitiesError ? 0 : (facilitiesCount || 0);
        }
          
        case 'modules': {
          const { count: modulesCount, error: modulesError } = await supabase
            .from('modules')
            .select('*', { count: 'exact', head: true });
          return modulesError ? 0 : (modulesCount || 0);
        }
          
        case 'roles': {
          const { count: rolesCount, error: rolesError } = await supabase
            .from('roles')
            .select('*', { count: 'exact', head: true });
          return rolesError ? 0 : (rolesCount || 0);
        }
          
        case 'user_roles': {
          const { count: userRolesCount, error: userRolesError } = await supabase
            .from('user_roles')
            .select('*', { count: 'exact', head: true });
          return userRolesError ? 0 : (userRolesCount || 0);
        }
          
        case 'permissions': {
          const { count: permissionsCount, error: permissionsError } = await supabase
            .from('permissions')
            .select('*', { count: 'exact', head: true });
          return permissionsError ? 0 : (permissionsCount || 0);
        }
          
        case 'api_integration_registry': {
          const { count: apiIntegrationCount, error: apiIntegrationError } = await supabase
            .from('api_integration_registry')
            .select('*', { count: 'exact', head: true });
          return apiIntegrationError ? 0 : (apiIntegrationCount || 0);
        }
          
        case 'external_api_registry': {
          const { count: externalApiCount, error: externalApiError } = await supabase
            .from('external_api_registry')
            .select('*', { count: 'exact', head: true });
          return externalApiError ? 0 : (externalApiCount || 0);
        }
          
        case 'api_lifecycle_events': {
          const { count: lifecycleEventsCount, error: lifecycleEventsError } = await supabase
            .from('api_lifecycle_events')
            .select('*', { count: 'exact', head: true });
          return lifecycleEventsError ? 0 : (lifecycleEventsCount || 0);
        }
          
        case 'developer_notification_preferences': {
          const { count: devNotifPrefCount, error: devNotifPrefError } = await supabase
            .from('developer_notification_preferences')
            .select('*', { count: 'exact', head: true });
          return devNotifPrefError ? 0 : (devNotifPrefCount || 0);
        }
          
        case 'marketplace_listings': {
          const { count: marketplaceCount, error: marketplaceError } = await supabase
            .from('marketplace_listings')
            .select('*', { count: 'exact', head: true });
          return marketplaceError ? 0 : (marketplaceCount || 0);
        }
          
        default:
          console.warn(`Unknown table name: ${tableName}`);
          return 0;
      }
    } catch (error) {
      console.warn(`Error getting count for table ${tableName}:`, error);
      return 0;
    }
  }

  private static async getTableLastActivity(tableName: string): Promise<string | null> {
    try {
      // Handle tables that have updated_at and created_at columns
      const tablesWithTimestamps = [
        'profiles', 'facilities', 'modules', 'api_integration_registry', 
        'external_api_registry', 'api_lifecycle_events',
        'developer_notification_preferences', 'marketplace_listings'
      ];
      
      const tablesWithCreatedAt = [
        'roles', 'permissions', 'user_roles', 'role_permissions'
      ];

      if (tablesWithTimestamps.includes(tableName)) {
        switch (tableName) {
          case 'profiles': {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('created_at, updated_at')
              .order('updated_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            return profileError || !profileData ? null : (profileData.updated_at || profileData.created_at);
          }
            
          case 'facilities': {
            const { data: facilityData, error: facilityError } = await supabase
              .from('facilities')
              .select('created_at, updated_at')
              .order('updated_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            return facilityError || !facilityData ? null : (facilityData.updated_at || facilityData.created_at);
          }
            
          case 'modules': {
            const { data: moduleData, error: moduleError } = await supabase
              .from('modules')
              .select('created_at, updated_at')
              .order('updated_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            return moduleError || !moduleData ? null : (moduleData.updated_at || moduleData.created_at);
          }
            
          case 'api_lifecycle_events': {
            const { data: lifecycleData, error: lifecycleError } = await supabase
              .from('api_lifecycle_events')
              .select('created_at')
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            return lifecycleError || !lifecycleData ? null : lifecycleData.created_at;
          }
            
          default:
            return null;
        }
      } else if (tablesWithCreatedAt.includes(tableName)) {
        switch (tableName) {
          case 'roles': {
            const { data: roleData, error: roleError } = await supabase
              .from('roles')
              .select('created_at')
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            return roleError || !roleData ? null : roleData.created_at;
          }
            
          case 'permissions': {
            const { data: permissionData, error: permissionError } = await supabase
              .from('permissions')
              .select('created_at')
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            return permissionError || !permissionData ? null : permissionData.created_at;
          }
            
          default:
            return null;
        }
      }
      
      return null;
    } catch (error) {
      console.warn(`Error getting last activity for table ${tableName}:`, error);
      return null;
    }
  }

  private static getTablePurpose(tableName: string): string {
    const purposes: Record<string, string> = {
      'profiles': 'User profile data and basic information',
      'facilities': 'Healthcare facility information and management',
      'modules': 'System modules and feature definitions',
      'roles': 'RBAC role definitions',
      'user_roles': 'User role assignments',
      'permissions': 'System permission definitions',
      'api_integration_registry': 'Internal API integration registry',
      'external_api_registry': 'Published external API registry',
      'external_api_endpoints': 'External API endpoint definitions',
      'api_lifecycle_events': 'API lifecycle tracking and change management',
      'audit_logs': 'System audit trail and logging',
      'api_usage_analytics': 'API usage tracking and analytics',
      'developer_applications': 'Developer portal applications',
      'marketplace_listings': 'API marketplace listings (low usage)'
    };
    
    return purposes[tableName] || 'Unknown purpose - needs review';
  }

  private static shouldKeepEmptyTable(tableName: string): boolean {
    const keepEmpty = [
      'audit_logs', // Will be populated as system is used
      'api_usage_analytics', // Will be populated with API usage
      'external_api_endpoints', // Will be populated when APIs are published
      'developer_applications', // Will be populated when developers apply
      'api_lifecycle_events' // Will be populated with API changes
    ];
    
    return keepEmpty.includes(tableName);
  }

  private static getEmptyTableReason(tableName: string): string {
    const reasons: Record<string, string> = {
      'audit_logs': 'Will be populated as users perform actions - keep for audit trail',
      'api_usage_analytics': 'Will be populated with API usage data - essential for monitoring',
      'external_api_endpoints': 'Will be populated when APIs are published - core functionality',
      'developer_applications': 'Will be populated when developers apply for access - keep for future',
      'api_lifecycle_events': 'Will be populated with API changes and lifecycle events - actively used',
      'marketplace_listings': 'Low usage but may be needed for future marketplace features'
    };
    
    return reasons[tableName] || 'Empty table - review necessity';
  }
}
