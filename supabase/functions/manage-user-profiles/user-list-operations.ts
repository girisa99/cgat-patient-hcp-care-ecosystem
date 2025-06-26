
import type { CombinedUser } from './types.ts';

export async function fetchAllAuthUsers(supabase: any) {
  console.log('🔍 Fetching all users from auth.users table...');
  
  const { data: authUsers, error: authUsersError } = await supabase.auth.admin.listUsers();
  
  if (authUsersError) {
    console.error('❌ Error fetching auth users:', authUsersError);
    throw new Error(authUsersError.message);
  }

  console.log('✅ Auth users fetched:', authUsers.users.length);
  return authUsers.users;
}

export async function fetchUserProfiles(supabase: any, userIds: string[]) {
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select(`
      *,
      facilities (
        id,
        name,
        facility_type
      )
    `)
    .in('id', userIds);

  if (profilesError) {
    console.error('❌ Error fetching profiles:', profilesError);
  } else {
    console.log('✅ Profiles fetched:', profiles?.length || 0);
  }

  return profiles || [];
}

export async function fetchUserRoles(supabase: any, userIds: string[]) {
  const { data: userRoles, error: rolesError } = await supabase
    .from('user_roles')
    .select(`
      user_id,
      role_id,
      roles!inner (
        id,
        name,
        description
      )
    `)
    .in('user_id', userIds);

  if (rolesError) {
    console.error('❌ Error fetching roles:', rolesError);
    console.error('Roles error details:', rolesError);
  } else {
    console.log('✅ User roles fetched:', userRoles?.length || 0);
    console.log('🔍 Role details:', userRoles?.map(ur => ({
      user_id: ur.user_id,
      role_name: ur.roles?.name,
      role_desc: ur.roles?.description
    })));
  }

  return userRoles || [];
}

export function combineUserData(authUsers: any[], profiles: any[], userRoles: any[]): CombinedUser[] {
  console.log('✅ Combining user data...');
  
  const combinedUsers = authUsers.map(authUser => {
    const profile = profiles.find(p => p.id === authUser.id);
    
    // Filter and map roles for this specific user
    const userRoleRecords = userRoles.filter(ur => ur.user_id === authUser.id) || [];
    const formattedRoles = userRoleRecords.map(ur => ({
      roles: {
        name: ur.roles?.name || 'patientCaregiver',
        description: ur.roles?.description || null
      }
    }));
    
    console.log(`🔍 User ${authUser.email} roles:`, formattedRoles);
    
    return {
      // Use auth user data as base
      id: authUser.id,
      email: authUser.email,
      created_at: authUser.created_at,
      // Merge profile data if it exists, otherwise use auth metadata or defaults
      first_name: profile?.first_name || authUser.user_metadata?.firstName || authUser.user_metadata?.first_name || null,
      last_name: profile?.last_name || authUser.user_metadata?.lastName || authUser.user_metadata?.last_name || null,
      phone: profile?.phone || authUser.user_metadata?.phone || null,
      department: profile?.department || null,
      facility_id: profile?.facility_id || null,
      avatar_url: profile?.avatar_url || null,
      updated_at: profile?.updated_at || authUser.updated_at,
      last_login: profile?.last_login || authUser.last_sign_in_at,
      has_mfa_enabled: profile?.has_mfa_enabled || false,
      is_email_verified: profile?.is_email_verified || !!authUser.email_confirmed_at,
      // Include facility info if profile exists
      facilities: profile?.facilities || null,
      // Include properly formatted roles
      user_roles: formattedRoles
    };
  });

  console.log('✅ Combined users prepared:', combinedUsers.length);
  console.log('🔍 Final user role summary:');
  combinedUsers.forEach(user => {
    console.log(`  - ${user.email}: ${user.user_roles?.length || 0} roles`);
    user.user_roles?.forEach(ur => {
      console.log(`    * ${ur.roles.name}`);
    });
  });
  
  return combinedUsers;
}

export async function listAllUsers(supabase: any) {
  const authUsers = await fetchAllAuthUsers(supabase);
  const userIds = authUsers.map(u => u.id);
  
  const [profiles, userRoles] = await Promise.all([
    fetchUserProfiles(supabase, userIds),
    fetchUserRoles(supabase, userIds)
  ]);

  const combinedUsers = combineUserData(authUsers, profiles, userRoles);
  
  return { data: combinedUsers };
}
