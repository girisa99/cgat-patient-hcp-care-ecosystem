
import { fetchAllAuthUsers, fetchSupplementaryProfiles, combineUserDataStandardized, enrichWithUserData, validateDataArchitectureCompliance, type StandardizedUser } from '../_shared/user-data-utils.ts';

export async function fetchUserProfiles(supabase: any, userIds: string[]): Promise<StandardizedUser[]> {
  validateDataArchitectureCompliance('audit-logs/fetchUserProfiles');
  
  if (userIds.length === 0) {
    console.log('⚠️ [AUDIT-LOGS] No user IDs provided for user profile fetch');
    return [];
  }

  try {
    console.log('👥 [AUDIT-LOGS] User IDs found in audit logs:', userIds);
    
    // Use standardized utilities to fetch user data
    const authUsers = await fetchAllAuthUsers(supabase);
    const profiles = await fetchSupplementaryProfiles(supabase, userIds);
    
    // No roles needed for audit logs, so pass empty array
    const userProfiles = combineUserDataStandardized(authUsers, profiles, []);
    
    console.log('✅ [AUDIT-LOGS] User profiles prepared using standardized utilities:', userProfiles.length);
    return userProfiles;
    
  } catch (error) {
    console.error('❌ [AUDIT-LOGS] Error fetching user data:', error);
    return [];
  }
}

export function enrichAuditLogsWithUserData(auditLogs: any[], userProfiles: StandardizedUser[]) {
  console.log('🔄 [AUDIT-LOGS] Enriching audit logs with standardized user data');
  return enrichWithUserData(auditLogs, userProfiles);
}
