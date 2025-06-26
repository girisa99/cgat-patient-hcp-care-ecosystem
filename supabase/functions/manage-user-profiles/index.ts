
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import type { ProfileRequest } from './types.ts';
import { verifyAuthentication } from './auth.ts';
import { handleProfileRequest } from './request-handler.ts';
import { validateDataArchitectureCompliance } from './_shared/user-data-utils.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate data architecture compliance
    validateDataArchitectureCompliance('manage-user-profiles/main');
    
    console.log('🔄 [MANAGE-USER-PROFILES] Processing request with standardized user data pattern');

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    const { user, error: authError, supabase } = await verifyAuthentication(authHeader);
    
    if (authError || !user || !supabase) {
      return new Response(JSON.stringify({ error: authError || 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Parse and handle the request
    const profileRequest: ProfileRequest = await req.json();
    const result = await handleProfileRequest(supabase, user, profileRequest);

    if (result.error) {
      console.error('❌ [MANAGE-USER-PROFILES] Database error:', result.error);
      return new Response(JSON.stringify({ error: result.error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log('✅ [MANAGE-USER-PROFILES] Request completed successfully using standardized pattern');

    return new Response(JSON.stringify({ success: true, data: result.data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('❌ [MANAGE-USER-PROFILES] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);
