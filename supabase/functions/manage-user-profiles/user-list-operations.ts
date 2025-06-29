
import { validateDataArchitectureCompliance, getAuthUserById } from '../_shared/user-data-utils.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

export async function listAllUsers(supabase: any) {
  validateDataArchitectureCompliance('manage-user-profiles/listAllUsers');
  
  console.log('🔍 [MANAGE-USER-PROFILES] Fetching all users with standardized pattern');

  // Get users from auth.users (PRIMARY SOURCE)
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error('❌ [MANAGE-USER-PROFILES] Error fetching from auth.users:', authError);
    throw new Error(`Failed to fetch users from auth.users: ${authError.message}`);
  }

  console.log(`✅ [MANAGE-USER-PROFILES] Found ${authUsers.users.length} users in auth.users (primary source)`);

  // Get supplementary data from profiles table
  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select(`
      *,
      user_roles (
        roles (
          name,
          description
        )
      ),
      facilities (
        id,
        name,
        facility_type
      )
    `);

  if (profilesError) {
    console.warn('⚠️ [MANAGE-USER-PROFILES] Could not fetch supplementary profiles data:', profilesError);
  }

  // Merge auth.users data (primary) with profiles data (supplementary)
  const mergedUsers = authUsers.users.map((authUser: any) => {
    const profile = profilesData?.find(p => p.id === authUser.id) || {};
    
    return {
      id: authUser.id,
      email: authUser.email, // Always use email from auth.users (primary source)
      email_confirmed_at: authUser.email_confirmed_at,
      created_at: authUser.created_at,
      updated_at: authUser.updated_at,
      // Merge supplementary data from profiles
      first_name: profile.first_name || null,
      last_name: profile.last_name || null,
      phone: profile.phone || null,
      facility_id: profile.facility_id || null,
      user_roles: profile.user_roles || [],
      facilities: profile.facilities || null
    };
  });

  console.log(`✅ [MANAGE-USER-PROFILES] Successfully merged ${mergedUsers.length} users with supplementary data`);
  
  return { data: mergedUsers, error: null };
}

export async function deactivateUser(supabase: any, userId: string, reason: string, deactivatedBy: string) {
  validateDataArchitectureCompliance('manage-user-profiles/deactivateUser');
  
  console.log('🔄 [MANAGE-USER-PROFILES] Deactivating user:', userId, 'Reason:', reason);

  try {
    // Validate user exists in auth.users first
    const authUser = await getAuthUserById(supabase, userId);
    console.log('✅ [MANAGE-USER-PROFILES] User validated for deactivation:', authUser.email);

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
            email: authUser.email,
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
