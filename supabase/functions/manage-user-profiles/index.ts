
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

        result = await supabase
          .from('profiles')
          .select(`
            *,
            facilities (
              id,
              name,
              facility_type
            ),
            user_roles (
              roles (
                name,
                description
              )
            )
          `)
          .order('last_name');
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
