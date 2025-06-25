
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FacilityRequest {
  action: 'create' | 'update' | 'deactivate' | 'list';
  facility_id?: string;
  facility_data?: {
    name: string;
    facility_type: 'treatmentFacility' | 'referralFacility' | 'prescriberFacility';
    address?: string;
    phone?: string;
    email?: string;
    license_number?: string;
    npi_number?: string;
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
      console.error('Authentication error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Check permissions
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
        console.error('Insufficient permissions for user:', user.id);
        return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }

    let requestBody: FacilityRequest;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const { action, facility_id, facility_data } = requestBody;
    console.log('Processing facility action:', action, { facility_id, facility_data });

    let result;
    switch (action) {
      case 'create':
        if (!facility_data) {
          return new Response(JSON.stringify({ error: 'Facility data is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
        console.log('Creating facility:', facility_data);
        result = await supabase
          .from('facilities')
          .insert({
            ...facility_data,
            is_active: true
          })
          .select();
        
        if (result.error) {
          console.error('Error creating facility:', result.error);
        } else {
          console.log('Facility created successfully:', result.data);
        }
        break;

      case 'update':
        if (!facility_id || !facility_data) {
          return new Response(JSON.stringify({ error: 'Facility ID and data are required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
        console.log('Updating facility:', facility_id, facility_data);
        result = await supabase
          .from('facilities')
          .update({
            ...facility_data,
            updated_at: new Date().toISOString()
          })
          .eq('id', facility_id)
          .select();
        break;

      case 'deactivate':
        if (!facility_id) {
          return new Response(JSON.stringify({ error: 'Facility ID is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
        console.log('Deactivating facility:', facility_id);
        result = await supabase
          .from('facilities')
          .update({ 
            is_active: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', facility_id)
          .select();
        break;

      case 'list':
        console.log('Fetching facilities list...');
        // Get all active facilities, ordered by name
        result = await supabase
          .from('facilities')
          .select('*')
          .eq('is_active', true)
          .order('name');
        
        console.log('Facilities query result:', result);
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

    console.log('Operation completed successfully:', { action, dataCount: result.data?.length });
    return new Response(JSON.stringify({ success: true, data: result.data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('Error in manage-facilities:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);
