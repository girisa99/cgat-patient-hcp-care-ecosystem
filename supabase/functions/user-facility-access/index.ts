
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FacilityAccessRequest {
  action: 'grant_access' | 'revoke_access' | 'update_access' | 'list_user_facilities' | 'list_facility_users';
  user_id?: string;
  facility_id?: string;
  access_level?: 'read' | 'write' | 'admin';
  expires_at?: string;
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

    const { action, user_id, facility_id, access_level, expires_at }: FacilityAccessRequest = await req.json();

    // Check permissions based on action
    const { data: hasAdminRole } = await supabase.rpc('has_role', {
      user_id: user.id,
      role_name: 'superAdmin'
    });

    if (!hasAdminRole) {
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

    let result;
    switch (action) {
      case 'grant_access':
        if (!user_id || !facility_id || !access_level) {
          return new Response(JSON.stringify({ error: 'User ID, facility ID, and access level are required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        result = await supabase
          .from('user_facility_access')
          .insert({
            user_id,
            facility_id,
            access_level,
            granted_by: user.id,
            expires_at,
            is_active: true
          })
          .select(`
            *,
            profiles!user_id (
              first_name,
              last_name,
              email
            ),
            facilities!facility_id (
              name,
              facility_type
            )
          `);
        break;

      case 'revoke_access':
        if (!user_id || !facility_id) {
          return new Response(JSON.stringify({ error: 'User ID and facility ID are required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        result = await supabase
          .from('user_facility_access')
          .update({ 
            is_active: false,
            granted_at: new Date().toISOString()
          })
          .eq('user_id', user_id)
          .eq('facility_id', facility_id)
          .select();
        break;

      case 'update_access':
        if (!user_id || !facility_id || !access_level) {
          return new Response(JSON.stringify({ error: 'User ID, facility ID, and access level are required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        result = await supabase
          .from('user_facility_access')
          .update({
            access_level,
            expires_at,
            granted_at: new Date().toISOString()
          })
          .eq('user_id', user_id)
          .eq('facility_id', facility_id)
          .eq('is_active', true)
          .select(`
            *,
            profiles!user_id (
              first_name,
              last_name,
              email
            ),
            facilities!facility_id (
              name,
              facility_type
            )
          `);
        break;

      case 'list_user_facilities':
        if (!user_id) {
          return new Response(JSON.stringify({ error: 'User ID is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        result = await supabase
          .from('user_facility_access')
          .select(`
            *,
            facilities!facility_id (
              id,
              name,
              facility_type,
              address,
              phone,
              email
            )
          `)
          .eq('user_id', user_id)
          .eq('is_active', true)
          .order('granted_at', { ascending: false });
        break;

      case 'list_facility_users':
        if (!facility_id) {
          return new Response(JSON.stringify({ error: 'Facility ID is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        result = await supabase
          .from('user_facility_access')
          .select(`
            *,
            profiles!user_id (
              id,
              first_name,
              last_name,
              email,
              phone,
              department
            )
          `)
          .eq('facility_id', facility_id)
          .eq('is_active', true)
          .order('granted_at', { ascending: false });
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
    console.error('Error in user-facility-access:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);
