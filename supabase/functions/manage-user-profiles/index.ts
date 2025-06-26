
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProfileRequest {
  action: 'update' | 'get' | 'list';
  user_id?: string;
  profile_data?: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    department?: string;
    facility_id?: string;
    avatar_url?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify authentication
    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const { action, user_id, profile_data }: ProfileRequest = await req.json();

    let result;
    switch (action) {
      case 'update':
        const targetUserId = user_id || user.id;
        
        // Check if user can update this profile
        if (targetUserId !== user.id) {
          const { data: hasPermission } = await supabase.rpc('has_role', {
            user_id: user.id,
            role_name: 'superAdmin'
          });
          
          if (!hasPermission) {
            const { data: hasOnboardingRole } = await supabase.rpc('has_role', {
              user_id: user.id,
              role_name: 'onboardingTeam'
            });
            
            if (!hasOnboardingRole) {
              return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
              });
            }
          }
        }

        console.log('🔄 Updating profile for user:', targetUserId, profile_data);

        // First, check if profile exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', targetUserId)
          .single();

        if (existingProfile) {
          // Update existing profile
          console.log('✅ Profile exists, updating...');
          result = await supabase
            .from('profiles')
            .update({
              ...profile_data,
              updated_at: new Date().toISOString()
            })
            .eq('id', targetUserId)
            .select();
        } else {
          // Create new profile - get user email first
          console.log('⚠️ Profile does not exist, creating new one...');
          const { data: authUser } = await supabase.auth.admin.getUserById(targetUserId);
          
          if (!authUser.user) {
            return new Response(JSON.stringify({ error: 'User not found' }), {
              status: 404,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
          }

          result = await supabase
            .from('profiles')
            .insert({
              id: targetUserId,
              email: authUser.user.email,
              ...profile_data,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select();
        }

        console.log('✅ Profile update/create result:', result);
        break;

      case 'get':
        const getUserId = user_id || user.id;
        result = await supabase
          .from('profiles')
          .select(`
            *,
            facilities (
              id,
              name,
              facility_type
            )
          `)
          .eq('id', getUserId)
          .single();
        break;

      case 'list':
        // Check if user has permission to list profiles
        const { data: canList } = await supabase.rpc('has_role', {
          user_id: user.id,
          role_name: 'superAdmin'
        });
        
        if (!canList) {
          const { data: hasManagerRole } = await supabase.rpc('has_role', {
            user_id: user.id,
            role_name: 'caseManager'
          });
          
          if (!hasManagerRole) {
            return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
              status: 403,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
          }
        }

        console.log('🔍 Fetching all users from auth.users table...');
        
        // Use admin API to fetch all users from auth.users
        const { data: authUsers, error: authUsersError } = await supabase.auth.admin.listUsers();
        
        if (authUsersError) {
          console.error('❌ Error fetching auth users:', authUsersError);
          return new Response(JSON.stringify({ error: authUsersError.message }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        console.log('✅ Auth users fetched:', authUsers.users.length);

        // Get user IDs for batch queries
        const userIds = authUsers.users.map(u => u.id);

        // Fetch profiles for all users
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

        // FIXED: Fetch user roles with proper join structure to get role names
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

        // Combine auth users with their profiles and roles
        const combinedUsers = authUsers.users.map(authUser => {
          const profile = profiles?.find(p => p.id === authUser.id);
          
          // FIXED: Properly filter and map roles for this specific user
          const userRoleRecords = userRoles?.filter(ur => ur.user_id === authUser.id) || [];
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
        
        result = { data: combinedUsers };
        break;

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    }

    if (result.error) {
      console.error('Database error:', result.error);
      return new Response(JSON.stringify({ error: result.error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ success: true, data: result.data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('Error in manage-user-profiles:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);
