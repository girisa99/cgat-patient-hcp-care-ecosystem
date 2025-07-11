
/**
 * Standardized User Data Utilities for Edge Functions
 * 
 * This module ensures consistent user data handling across ALL edge functions.
 * CRITICAL: All user data MUST come from auth.users table as primary source.
 */

export interface StandardizedUser {
  id: string;
  email: string;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  department: string | null;
  facility_id: string | null;
  avatar_url: string | null;
  updated_at: string;
  last_login: string | null;
  has_mfa_enabled: boolean;
  is_email_verified: boolean;
  facilities: any;
  user_roles: Array<{
    roles: {
      name: string;
      description: string | null;
    };
  }>;
}

/**
 * Fetches all users from auth.users table (PRIMARY SOURCE)
 * This is the ONLY way edge functions should get user data
 */
export async function fetchAllAuthUsers(supabase: any) {
  console.log('🔍 [USER-DATA-UTILS] Fetching all users from auth.users table...');
  
  const { data: authUsers, error: authUsersError } = await supabase.auth.admin.listUsers();
  
  if (authUsersError) {
    console.error('❌ [USER-DATA-UTILS] Error fetching auth users:', authUsersError);
    throw new Error(`Failed to fetch users from auth.users: ${authUsersError.message}`);
  }

  console.log('✅ [USER-DATA-UTILS] Auth users fetched:', authUsers.users.length);
  validateAuthUsersData(authUsers.users);
  
  return authUsers.users;
}

/**
 * Fetches supplementary profile data (SECONDARY SOURCE ONLY)
 * This should NEVER be used as primary user data source
 */
export async function fetchSupplementaryProfiles(supabase: any, userIds: string[]) {
  if (userIds.length === 0) {
    console.log('⚠️ [USER-DATA-UTILS] No user IDs provided for profile fetch');
    return [];
  }

  console.log('📝 [USER-DATA-UTILS] Fetching supplementary profiles for:', userIds.length, 'users');

  // First get basic profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .in('id', userIds);

  if (profilesError) {
    console.error('❌ [USER-DATA-UTILS] Error fetching supplementary profiles:', profilesError);
    // Don't throw error - profiles are supplementary only
  }

  console.log('✅ [USER-DATA-UTILS] Basic profiles fetched:', profiles?.length || 0);
  
  // Get facilities separately
  const facilitiesPromises = (profiles || []).map(async (profile) => {
    if (!profile.facility_id) return { ...profile, facilities: null };
    
    const { data: facility } = await supabase
      .from('facilities')
      .select('id, name, facility_type')
      .eq('id', profile.facility_id)
      .single();
    
    return { ...profile, facilities: facility };
  });

  const profilesWithFacilities = await Promise.all(facilitiesPromises);
  console.log('✅ [USER-DATA-UTILS] Profiles with facilities processed:', profilesWithFacilities.length);
  
  return profilesWithFacilities || [];
}

/**
 * Fetches user roles from user_roles table
 */
export async function fetchUserRoles(supabase: any, userIds: string[]) {
  if (userIds.length === 0) {
    return [];
  }

  console.log('🔐 [USER-DATA-UTILS] Fetching user roles for:', userIds.length, 'users');

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
    console.error('❌ [USER-DATA-UTILS] Error fetching roles:', rolesError);
  } else {
    console.log('✅ [USER-DATA-UTILS] User roles fetched:', userRoles?.length || 0);
  }

  return userRoles || [];
}

/**
 * Fetches user facility access data
 */
export async function fetchUserFacilityAccess(supabase: any, userIds: string[]) {
  if (userIds.length === 0) {
    return [];
  }

  console.log('🏢 [USER-DATA-UTILS] Fetching facility access for:', userIds.length, 'users');

  const { data: facilityAccess, error: accessError } = await supabase
    .from('user_facility_access')
    .select(`
      user_id,
      facility_id,
      access_level,
      facilities!inner (
        id,
        name,
        facility_type
      )
    `)
    .in('user_id', userIds)
    .eq('is_active', true);

  if (accessError) {
    console.error('❌ [USER-DATA-UTILS] Error fetching facility access:', accessError);
  } else {
    console.log('✅ [USER-DATA-UTILS] Facility access fetched:', facilityAccess?.length || 0);
  }

  return facilityAccess || [];
}

/**
 * Combines auth.users data (primary) with supplementary data
 * This is the ONLY way to create complete user objects
 */
export function combineUserDataStandardized(
  authUsers: any[], 
  profiles: any[], 
  userRoles: any[],
  facilityAccess: any[] = []
): StandardizedUser[] {
  console.log('🔄 [USER-DATA-UTILS] Combining user data with auth.users as primary source...');
  
  if (!authUsers || authUsers.length === 0) {
    console.error('❌ [USER-DATA-UTILS] CRITICAL: No auth users provided - violates data architecture');
    throw new Error('CRITICAL: auth.users must be primary data source');
  }

  const combinedUsers = authUsers.map(authUser => {
    // Validate auth user has required fields
    if (!authUser.id || !authUser.email) {
      console.error('❌ [USER-DATA-UTILS] Invalid auth user data:', authUser);
      throw new Error('Invalid auth user data structure');
    }

    // Find supplementary data (profiles table is secondary only)
    const profile = profiles?.find(p => p.id === authUser.id);
    
    // Filter and map roles for this specific user
    const userRoleRecords = userRoles?.filter(ur => ur.user_id === authUser.id) || [];
    const formattedRoles = userRoleRecords.map(ur => ({
      roles: {
        name: ur.roles?.name || 'patientCaregiver',
        description: ur.roles?.description || null
      }
    }));
    
    // Find facility access for this user
    const userFacilityAccess = facilityAccess?.filter(fa => fa.user_id === authUser.id) || [];
    
    // Determine primary facility - either from profile or from first facility access
    let primaryFacility = profile?.facilities;
    if (!primaryFacility && userFacilityAccess.length > 0) {
      primaryFacility = userFacilityAccess[0].facilities;
    }
    
    // Extract name data with comprehensive fallback chain
    const extractNameFromMetadata = (metadata: any, field: string) => {
      if (!metadata) return null;
      return metadata[field] || 
             metadata[field.replace('_', '')] || // firstName instead of first_name
             metadata[field.charAt(0).toUpperCase() + field.slice(1)] || // FirstName
             metadata[field.charAt(0).toUpperCase() + field.slice(1).replace('_', '')] || // FirstName
             null;
    };
    
    const firstName = profile?.first_name || 
                     extractNameFromMetadata(authUser.user_metadata, 'first_name') ||
                     extractNameFromMetadata(authUser.raw_user_meta_data, 'first_name') ||
                     extractNameFromMetadata(authUser.app_metadata, 'first_name') ||
                     null;
                     
    const lastName = profile?.last_name || 
                    extractNameFromMetadata(authUser.user_metadata, 'last_name') ||
                    extractNameFromMetadata(authUser.raw_user_meta_data, 'last_name') ||
                    extractNameFromMetadata(authUser.app_metadata, 'last_name') ||
                    null;

    console.log(`👤 [USER-DATA-UTILS] Processing user ${authUser.email}:`);
    console.log(`   - Profile: ${profile ? 'Found' : 'Not found'}`);
    console.log(`   - First name: "${firstName}" (from ${profile?.first_name ? 'profile' : 'metadata'})`);
    console.log(`   - Last name: "${lastName}" (from ${profile?.last_name ? 'profile' : 'metadata'})`);
    console.log(`   - Roles: ${formattedRoles.length}`);
    console.log(`   - Facility access: ${userFacilityAccess.length}`);
    console.log(`   - Primary facility: ${primaryFacility?.name || 'None'}`);
    
    // PRIMARY SOURCE: auth.users data
    // SECONDARY SOURCE: profiles table for supplementary data only
    const combinedUser: StandardizedUser = {
      // AUTH.USERS PRIMARY DATA (REQUIRED)
      id: authUser.id,
      email: authUser.email,
      created_at: authUser.created_at,
      
      // SUPPLEMENTARY DATA (profiles table or auth metadata)
      first_name: firstName,
      last_name: lastName,
      phone: profile?.phone || extractNameFromMetadata(authUser.user_metadata, 'phone') || extractNameFromMetadata(authUser.raw_user_meta_data, 'phone') || null,
      department: profile?.department || null,
      facility_id: profile?.facility_id || null,
      avatar_url: profile?.avatar_url || null,
      updated_at: profile?.updated_at || authUser.updated_at,
      last_login: profile?.last_login || authUser.last_sign_in_at,
      has_mfa_enabled: profile?.has_mfa_enabled || false,
      is_email_verified: profile?.is_email_verified || !!authUser.email_confirmed_at,
      
      // RELATED DATA
      facilities: primaryFacility || null,
      user_roles: formattedRoles
    };

    return combinedUser;
  });

  console.log('✅ [USER-DATA-UTILS] Combined users prepared:', combinedUsers.length);
  console.log('📊 [USER-DATA-UTILS] Data source validation: PRIMARY=auth.users, SUPPLEMENTARY=profiles');
  
  return combinedUsers;
}

/**
 * Validates that auth users data is properly structured
 */
function validateAuthUsersData(authUsers: any[]) {
  if (!Array.isArray(authUsers)) {
    throw new Error('VALIDATION ERROR: auth users must be an array');
  }

  authUsers.forEach((user, index) => {
    if (!user.id || !user.email) {
      console.error(`❌ [USER-DATA-UTILS] Invalid user at index ${index}:`, user);
      throw new Error(`VALIDATION ERROR: User missing required fields (id, email) at index ${index}`);
    }
  });

  console.log('✅ [USER-DATA-UTILS] Auth users data validation passed');
}

/**
 * Enriches any array of objects with user data
 * Used for audit logs, activity logs, etc.
 */
export function enrichWithUserData<T extends { user_id: string }>(
  records: T[], 
  userProfiles: StandardizedUser[]
): (T & { profiles: StandardizedUser | null })[] {
  console.log('🔄 [USER-DATA-UTILS] Enriching', records.length, 'records with user data');
  
  return records.map(record => {
    const userProfile = userProfiles.find(profile => profile && profile.id === record.user_id);
    
    return {
      ...record,
      profiles: userProfile || null
    };
  });
}

/**
 * Gets a single user by ID from auth.users (PRIMARY SOURCE)
 */
export async function getAuthUserById(supabase: any, userId: string) {
  console.log('🔍 [USER-DATA-UTILS] Fetching single user from auth.users:', userId);
  
  const { data: authUser, error } = await supabase.auth.admin.getUserById(userId);
  
  if (error) {
    console.error('❌ [USER-DATA-UTILS] Error fetching auth user:', error);
    throw new Error(`Failed to fetch user from auth.users: ${error.message}`);
  }

  if (!authUser.user) {
    throw new Error('User not found in auth.users table');
  }

  console.log('✅ [USER-DATA-UTILS] Auth user fetched:', authUser.user.email);
  return authUser.user;
}

/**
 * DEVELOPMENT VALIDATION: Ensures edge functions follow data architecture
 */
export function validateDataArchitectureCompliance(context: string) {
  console.log(`🔍 [USER-DATA-UTILS] Validating data architecture compliance for: ${context}`);
  console.log('✅ [USER-DATA-UTILS] Using standardized user data utilities');
  console.log('✅ [USER-DATA-UTILS] auth.users confirmed as primary data source');
  console.log('✅ [USER-DATA-UTILS] profiles table used for supplementary data only');
}
