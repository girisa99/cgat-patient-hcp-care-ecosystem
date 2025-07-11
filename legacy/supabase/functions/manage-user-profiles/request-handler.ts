
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          first_name: string | null
          last_name: string | null
          phone: string | null
          department: string | null
          facility_id: string | null
          created_at: string | null
          updated_at: string | null
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role_id: string
          created_at: string | null
        }
      }
      roles: {
        Row: {
          id: string
          name: string
          description: string | null
        }
      }
    }
  }
}

export const handleProfileRequest = async (supabase: any, user: any, action: string) => {
  console.log('🔍 [MANAGE-USER-PROFILES] Checking permissions for user:', user.id);
  
  // Check if user has appropriate role for listing users
  const { data: userRoles, error: rolesError } = await supabase
    .from('user_roles')
    .select(`
      roles (
        name
      )
    `)
    .eq('user_id', user.id);

  if (rolesError) {
    console.error('❌ [MANAGE-USER-PROFILES] Error fetching user roles:', rolesError);
    throw new Error('Error checking user permissions');
  }

  const roleNames = userRoles?.map((ur: any) => ur.roles?.name).filter(Boolean) || [];
  console.log('👤 [MANAGE-USER-PROFILES] User roles:', roleNames);

  // Allow superAdmin and onboardingTeam to list users
  const hasListPermission = roleNames.includes('superAdmin') || roleNames.includes('onboardingTeam');
  
  if (!hasListPermission) {
    console.log('❌ [MANAGE-USER-PROFILES] No list permissions found');
    throw new Error('Insufficient permissions to list users');
  }

  console.log('✅ [MANAGE-USER-PROFILES] User has appropriate permissions');

  if (action === 'list') {
    console.log('📋 [MANAGE-USER-PROFILES] Fetching user list...');

    // Create service role client for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const adminSupabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

    // Get all users from auth.users
    const { data: authUsers, error: authError } = await adminSupabase.auth.admin.listUsers()

    if (authError) {
      console.error('❌ [MANAGE-USER-PROFILES] Error fetching auth users:', authError);
      throw new Error(`Failed to fetch users: ${authError.message}`);
    }

    console.log('✅ [MANAGE-USER-PROFILES] Found auth users:', authUsers.users.length);

    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');

    if (profilesError) {
      console.error('❌ [MANAGE-USER-PROFILES] Error fetching profiles:', profilesError);
    }

    // Get all user roles with role details
    const { data: allUserRoles, error: allRolesError } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        roles (
          name,
          description
        )
      `);

    if (allRolesError) {
      console.error('❌ [MANAGE-USER-PROFILES] Error fetching roles:', allRolesError);
    }

    // Get all facilities
    const { data: facilities, error: facilitiesError } = await supabase
      .from('facilities')
      .select('id, name, facility_type');

    if (facilitiesError) {
      console.error('❌ [MANAGE-USER-PROFILES] Error fetching facilities:', facilitiesError);
    }

    // Combine auth users with profile and role data
    const combinedUsers = authUsers.users.map((authUser) => {
      const profile = profiles?.find(p => p.id === authUser.id);
      const userRolesList = allUserRoles?.filter(ur => ur.user_id === authUser.id) || [];
      const userFacility = profile?.facility_id ? facilities?.find(f => f.id === profile.facility_id) : null;

      return {
        id: authUser.id,
        email: authUser.email || profile?.email || '',
        first_name: profile?.first_name || '',
        last_name: profile?.last_name || '',
        phone: profile?.phone || '',
        department: profile?.department || '',
        facility_id: profile?.facility_id || null,
        created_at: authUser.created_at,
        updated_at: authUser.updated_at || profile?.updated_at,
        user_roles: userRolesList,
        facilities: userFacility
      };
    });

    console.log('✅ [MANAGE-USER-PROFILES] Combined users prepared:', combinedUsers.length);

    return {
      success: true,
      data: combinedUsers,
      message: `Successfully fetched ${combinedUsers.length} users`
    };
  }

  throw new Error(`Unknown action: ${action}`);
};
