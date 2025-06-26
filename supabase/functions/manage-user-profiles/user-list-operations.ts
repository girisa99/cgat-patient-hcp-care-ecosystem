
import type { CombinedUser } from './types.ts';
import { fetchAllAuthUsers, fetchSupplementaryProfiles, fetchUserRoles, combineUserDataStandardized, validateDataArchitectureCompliance } from '../_shared/user-data-utils.ts';

export async function listAllUsers(supabase: any) {
  validateDataArchitectureCompliance('manage-user-profiles/listAllUsers');
  
  console.log('🔄 [MANAGE-USER-PROFILES] Starting user list operation with standardized utilities');
  
  // Step 1: Fetch from auth.users (PRIMARY SOURCE)
  const authUsers = await fetchAllAuthUsers(supabase);
  const userIds = authUsers.map(u => u.id);
  
  // Step 2: Fetch supplementary data in parallel
  const [profiles, userRoles] = await Promise.all([
    fetchSupplementaryProfiles(supabase, userIds),
    fetchUserRoles(supabase, userIds)
  ]);

  // Step 3: Combine data with auth.users as primary source
  const combinedUsers = combineUserDataStandardized(authUsers, profiles, userRoles);
  
  console.log('✅ [MANAGE-USER-PROFILES] User list operation completed using standardized pattern');
  
  return { data: combinedUsers };
}
