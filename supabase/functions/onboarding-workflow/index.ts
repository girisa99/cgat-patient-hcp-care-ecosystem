
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OnboardingRequest {
  action: 'start_facility_onboarding' | 'complete_user_setup' | 'grant_facility_access' | 'get_onboarding_status';
  facility_data?: {
    name: string;
    facility_type: 'treatmentFacility' | 'referralFacility' | 'prescriberFacility';
    address?: string;
    phone?: string;
    email?: string;
    license_number?: string;
  };
  user_data?: {
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    department?: string;
    role: string;
    facility_id?: string;
  };
  access_data?: {
    user_id: string;
    facility_id: string;
    access_level: 'read' | 'write' | 'admin';
    expires_at?: string;
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

    // Check if user has onboarding permissions
    const { data: hasPermission } = await supabase.rpc('has_role', {
      user_id: user.id,
      role_name: 'onboardingTeam'
    });

    if (!hasPermission) {
      const { data: hasSuperAdminRole } = await supabase.rpc('has_role', {
        user_id: user.id,
        role_name: 'superAdmin'
      });
      
      if (!hasSuperAdminRole) {
        return new Response(JSON.stringify({ error: 'Insufficient permissions for onboarding operations' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }

    const { action, facility_data, user_data, access_data }: OnboardingRequest = await req.json();

    let result;
    switch (action) {
      case 'start_facility_onboarding':
        if (!facility_data) {
          return new Response(JSON.stringify({ error: 'Facility data is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        // Create facility
        const facilityResult = await supabase
          .from('facilities')
          .insert({
            ...facility_data,
            is_active: true
          })
          .select()
          .single();

        if (facilityResult.error) {
          throw facilityResult.error;
        }

        result = { facility: facilityResult.data };
        break;

      case 'complete_user_setup':
        if (!user_data) {
          return new Response(JSON.stringify({ error: 'User data is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        // Create user account
        const { data: newUser, error: createUserError } = await supabase.auth.admin.createUser({
          email: user_data.email,
          password: Math.random().toString(36).slice(-12), // Temporary password
          email_confirm: true,
          user_metadata: {
            firstName: user_data.first_name,
            lastName: user_data.last_name,
          }
        });

        if (createUserError) {
          throw createUserError;
        }

        // Update profile
        const profileResult = await supabase
          .from('profiles')
          .update({
            first_name: user_data.first_name,
            last_name: user_data.last_name,
            phone: user_data.phone,
            department: user_data.department,
            facility_id: user_data.facility_id,
            updated_at: new Date().toISOString()
          })
          .eq('id', newUser.user.id);

        if (profileResult.error) {
          throw profileResult.error;
        }

        // Assign role
        const { data: role } = await supabase
          .from('roles')
          .select('id')
          .eq('name', user_data.role)
          .single();

        if (role) {
          await supabase
            .from('user_roles')
            .insert({
              user_id: newUser.user.id,
              role_id: role.id,
              assigned_by: user.id
            });
        }

        result = { user: newUser.user, profile_updated: true, role_assigned: !!role };
        break;

      case 'grant_facility_access':
        if (!access_data) {
          return new Response(JSON.stringify({ error: 'Access data is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        result = await supabase
          .from('user_facility_access')
          .insert({
            user_id: access_data.user_id,
            facility_id: access_data.facility_id,
            access_level: access_data.access_level,
            granted_by: user.id,
            expires_at: access_data.expires_at,
            is_active: true
          })
          .select();
        break;

      case 'get_onboarding_status':
        // Get recent onboarding activities
        const facilitiesResult = await supabase
          .from('facilities')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        const usersResult = await supabase
          .from('profiles')
          .select(`
            *,
            user_roles (
              roles (
                name
              )
            )
          `)
          .order('created_at', { ascending: false })
          .limit(10);

        result = {
          recent_facilities: facilitiesResult.data || [],
          recent_users: usersResult.data || []
        };
        break;

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('Error in onboarding-workflow:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);
