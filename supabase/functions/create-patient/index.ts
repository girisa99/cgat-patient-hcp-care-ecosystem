import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

interface CreatePatientRequest {
  email: string
  password?: string
  first_name: string
  last_name: string
  facility_id?: string
}

Deno.serve(async (req) => {
  console.log('=== Edge function called ===')
  console.log('Method:', req.method)
  console.log('Headers:', Object.fromEntries(req.headers.entries()))
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== Starting main logic ===')
    
    // Parse the request
    let requestBody
    try {
      requestBody = await req.json()
      console.log('Request body parsed successfully:', JSON.stringify(requestBody))
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError)
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    const { email, password, first_name, last_name, facility_id }: CreatePatientRequest = requestBody

    // Validate required fields
    if (!email || !first_name || !last_name) {
      console.log('Validation failed - missing required fields')
      console.log('Missing email:', !email)
      console.log('Missing first_name:', !first_name) 
      console.log('Missing last_name:', !last_name)
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, first_name, last_name' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('=== Validation passed ===')

    // Check environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    console.log('Environment check:')
    console.log('- URL exists:', !!supabaseUrl)
    console.log('- Service key exists:', !!serviceRoleKey)
    console.log('- URL value:', supabaseUrl)
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing environment variables')
      return new Response(
        JSON.stringify({ error: 'Server configuration error - missing environment variables' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('=== Creating Supabase admin client ===')
    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('=== Starting user creation ===')
    
    // Step 1: Create the user with admin privileges
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: password || 'TempPassword123!',
      email_confirm: true,
      user_metadata: {
        firstName: first_name,
        lastName: last_name
      }
    })

    if (authError) {
      console.error('Auth user creation error:', authError)
      return new Response(
        JSON.stringify({ error: `Failed to create user: ${authError.message}` }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!authData.user) {
      console.error('No user data returned from auth creation')
      return new Response(
        JSON.stringify({ error: 'Failed to create user - no user data returned' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Auth user created successfully:', authData.user.id)

    console.log('=== Waiting for user to be fully committed ===')
    // Wait a moment to ensure the user is fully committed to the auth.users table
    await new Promise(resolve => setTimeout(resolve, 1000))

    console.log('=== Calling database function ===')
    // Step 2: Create profile and assign patient role using the database function
    const { data: profileData, error: profileError } = await supabaseAdmin.rpc('create_patient_profile_and_role', {
      p_user_id: authData.user.id,
      p_first_name: first_name,
      p_last_name: last_name,
      p_email: email,
      p_facility_id: facility_id || null
    })

    console.log('Database function result:', { profileData, profileError })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      
      // Clean up the auth user if profile creation fails
      console.log('Cleaning up auth user due to profile error...')
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      
      return new Response(
        JSON.stringify({ error: `Failed to create profile: ${profileError.message}` }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (profileData && typeof profileData === 'object' && 'error' in profileData) {
      console.error('Profile creation returned error:', profileData.error)
      // Clean up the auth user if profile creation fails
      console.log('Cleaning up auth user due to profile data error...')
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      
      return new Response(
        JSON.stringify({ error: profileData.error }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('=== Success! ===')
    console.log('Patient profile and role created successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        user_id: authData.user.id,
        message: 'Patient created successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('=== Unexpected error ===')
    console.error('Error type:', typeof error)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    console.error('Full error:', error)
    
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})