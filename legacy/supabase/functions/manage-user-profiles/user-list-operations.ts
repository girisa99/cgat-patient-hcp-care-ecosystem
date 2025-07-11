
import { validateDataArchitectureCompliance, fetchAllAuthUsers, fetchSupplementaryProfiles, fetchUserRoles, fetchUserFacilityAccess, combineUserDataStandardized } from '../_shared/user-data-utils.ts';

export async function listAllUsers(supabase: any) {
  validateDataArchitectureCompliance('manage-user-profiles/listAllUsers');
  
  console.log('🔄 [MANAGE-USER-PROFILES] Starting user list operation with enhanced data fetching');

  try {
    // Fetch users from auth.users (PRIMARY SOURCE)
    const authUsers = await fetchAllAuthUsers(supabase);
    const userIds = authUsers.map(user => user.id);

    // Fetch supplementary data in parallel for better performance
    const [profiles, userRoles, facilityAccess] = await Promise.all([
      fetchSupplementaryProfiles(supabase, userIds),
      fetchUserRoles(supabase, userIds),
      fetchUserFacilityAccess(supabase, userIds)
    ]);

    // Combine all data using standardized utility with facility access
    const combinedUsers = combineUserDataStandardized(authUsers, profiles, userRoles, facilityAccess);

    console.log('✅ [MANAGE-USER-PROFILES] User list operation completed with enhanced data');
    console.log('📊 [MANAGE-USER-PROFILES] Stats:');
    console.log(`   - Total users: ${combinedUsers.length}`);
    console.log(`   - Users with names: ${combinedUsers.filter(u => u.first_name || u.last_name).length}`);
    console.log(`   - Users with facilities: ${combinedUsers.filter(u => u.facilities).length}`);
    
    return { data: combinedUsers, error: null };

  } catch (error: any) {
    console.error('❌ [MANAGE-USER-PROFILES] User list operation failed:', error);
    throw error;
  }
}

export async function deactivateUser(supabase: any, userId: string, reason: string, deactivatedBy: string) {
  validateDataArchitectureCompliance('manage-user-profiles/deactivateUser');
  
  console.log('🔄 [MANAGE-USER-PROFILES] Deactivating user:', userId, 'Reason:', reason);

  try {
    // Validate user exists in auth.users first
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
    
    if (authError || !authUser.user) {
      console.error('❌ [MANAGE-USER-PROFILES] User not found in auth.users:', authError);
      throw new Error(`User not found: ${authError?.message || 'User does not exist'}`);
    }

    console.log('✅ [MANAGE-USER-PROFILES] User validated for deactivation:', authUser.user.email);

    // Delete the user from auth.users (this will cascade to related tables)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
    
    if (deleteError) {
      console.error('❌ [MANAGE-USER-PROFILES] Error deleting user from auth:', deleteError);
      throw new Error(`Failed to deactivate user: ${deleteError.message}`);
    }

    // Log the deactivation action to audit_logs
    try {
      const { error: auditError } = await supabase
        .from('audit_logs')
        .insert({
          user_id: userId,
          action: 'USER_DEACTIVATED',
          table_name: 'auth.users',
          record_id: userId,
          old_values: {
            email: authUser.user.email,
            deactivated_at: new Date().toISOString()
          },
          new_values: {
            deactivation_reason: reason,
            deactivated_by: deactivatedBy,
            deactivated_at: new Date().toISOString()
          }
        });

      if (auditError) {
        console.warn('⚠️ [MANAGE-USER-PROFILES] Audit log insertion failed, but user was deactivated:', auditError);
      }
    } catch (auditErr) {
      console.warn('⚠️ [MANAGE-USER-PROFILES] Audit logging failed (non-critical):', auditErr);
    }

    console.log('✅ [MANAGE-USER-PROFILES] User deactivated successfully');
    return { data: { success: true }, error: null };
    
  } catch (error: any) {
    console.error('❌ [MANAGE-USER-PROFILES] User deactivation failed:', error);
    throw error;
  }
}
