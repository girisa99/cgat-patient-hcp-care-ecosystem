
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

        result = await supabase
          .from('profiles')
          .update({
            ...profile_data,
            updated_at: new Date().toISOString()
          })
          .eq('id', targetUserId)
          .select();
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
        console.log('📊 Auth users list:');
        authUsers.users.forEach((authUser, index) => {
          console.log(`  ${index + 1}. ID: ${authUser.id}`);
          console.log(`     Email: ${authUser.email}`);
          console.log(`     Created: ${authUser.created_at}`);
          console.log(`     Confirmed: ${authUser.email_confirmed_at || 'Not confirmed'}`);
          console.log('     ---');
        });

        // Now get profiles for each auth user (if they exist)
        const userIds = authUsers.users.map(u => u.id);
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

        // Get user roles for all users
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select(`
            user_id,
            roles (
              name,
              description
            )
          `)
          .in('user_id', userIds);

        if (rolesError) {
          console.error('❌ Error fetching roles:', rolesError);
        } else {
          console.log('✅ User roles fetched:', userRoles?.length || 0);
        }

        // Combine auth users with their profiles and roles
        const combinedUsers = authUsers.users.map(authUser => {
          const profile = profiles?.find(p => p.id === authUser.id);
          const roles = userRoles?.filter(ur => ur.user_id === authUser.id) || [];
          
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
            // Include roles
            user_roles: roles.map(ur => ({
              roles: {
                name: ur.roles?.name || 'patientCaregiver',
                description: ur.roles?.description || null
              }
            }))
          };
        });

        console.log('✅ Combined users prepared:', combinedUsers.length);
        
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
