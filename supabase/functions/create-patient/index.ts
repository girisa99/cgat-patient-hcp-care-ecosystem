import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { email, first_name, last_name, password, facility_id } = await req.json()

    if (!email || !first_name || !last_name) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create user using admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: password || 'TempPassword123!',
      email_confirm: true,
      user_metadata: {
        firstName: first_name,
        lastName: last_name
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (authData.user) {
      // Update the profile with names and facility
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          first_name,
          last_name,
          facility_id: facility_id || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', authData.user.id)
        
      if (profileError) {
        console.error('Profile error:', profileError)
      }
        
      // Assign patient role using RPC to avoid schema issues
      const { error: roleError } = await supabase.rpc('assign_user_role', {
        p_user_id: authData.user.id,
        p_role_name: 'patientCaregiver'
      })
      
      if (roleError) {
        console.error('Role assignment error:', roleError)
        return new Response(
          JSON.stringify({ error: roleError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          user: authData.user,
          message: 'Patient created successfully'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Failed to create user' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})