
import { UserProfile } from './types.ts';

export async function fetchUserProfiles(supabase: any, userIds: string[]): Promise<UserProfile[]> {
  if (userIds.length === 0) {
    return [];
  }

  try {
    console.log('👥 User IDs found in audit logs:', userIds);
    
    // First get all auth users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
      return [];
    }
    
    console.log('✅ Total auth users available:', authUsers.users.length);
    
    // Get profile data for all users
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email');
    
    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
    } else {
      console.log('📝 Total profiles available:', profilesData?.length || 0);
    }
    
    // Create user profiles map for all users (not just those in audit logs)
    const userProfiles = authUsers.users.map(authUser => {
      const profile = profilesData?.find(p => p.id === authUser.id);
      return {
        id: authUser.id,
        first_name: profile?.first_name || authUser.user_metadata?.firstName || authUser.user_metadata?.first_name || null,
        last_name: profile?.last_name || authUser.user_metadata?.lastName || authUser.user_metadata?.last_name || null,
        email: profile?.email || authUser.email
      };
    });
    
    console.log('✅ User profiles prepared for all users:', userProfiles.length);
    return userProfiles;
    
  } catch (error) {
    console.error('❌ Error fetching user data:', error);
    return [];
  }
}

export function enrichAuditLogsWithUserData(auditLogs: any[], userProfiles: UserProfile[]) {
  return auditLogs.map(log => {
    const userProfile = userProfiles.find(profile => profile && profile.id === log.user_id);
    
    return {
      ...log,
      profiles: userProfile || null
    };
  });
}
