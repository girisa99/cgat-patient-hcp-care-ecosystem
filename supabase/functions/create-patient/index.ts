import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { getCorsHeaders } from '../_shared/cors.ts'

interface CreatePatientRequest {
  email: string
  password?: string
  first_name: string
  last_name: string
  facility_id?: string
}

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors })
  }

  try {
    // --- AUTH CHECK: Require authenticated user with appropriate role ---
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
      )
    }

    // Verify the caller's identity using their JWT
    const token = authHeader.replace('Bearer ', '')
    const anonClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    })
    const { data: { user: caller }, error: callerError } = await anonClient.auth.getUser(token)

    if (callerError || !caller) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } }
      )
    }

    // Verify caller has permission to create patients (admin, caseManager, onboardingTeam)
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    const { data: callerRoles } = await supabaseAdmin.rpc('get_user_roles', {
      check_user_id: caller.id
    })
    const roleNames = callerRoles?.map((r: any) => r.role_name) || []
    const allowedRoles = ['superAdmin', 'caseManager', 'onboardingTeam', 'healthcareProvider']
    const hasPermission = roleNames.some((r: string) => allowedRoles.includes(r))

    if (!hasPermission) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions to create patients' }),
        { status: 403, headers: { ...cors, 'Content-Type': 'application/json' } }
      )
    }

    // --- PARSE & VALIDATE INPUT ---
    let requestBody: CreatePatientRequest
    try {
      requestBody = await req.json()
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      )
    }

    const { email, password, first_name, last_name, facility_id } = requestBody

    if (!email || !first_name || !last_name) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, first_name, last_name' }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      )
    }

    // Require an explicit password — never use a default
    if (!password || password.length < 8) {
      return new Response(
        JSON.stringify({ error: 'A password of at least 8 characters is required' }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      )
    }

    // --- CREATE USER ---
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        firstName: first_name,
        lastName: last_name
      }
    })

    if (authError || !authData.user) {
      return new Response(
        JSON.stringify({ error: `Failed to create user: ${authError?.message || 'Unknown error'}` }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      )
    }

    // Wait for user record to propagate
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Create profile and assign patient role
    const { data: profileData, error: profileError } = await supabaseAdmin.rpc('create_patient_profile_and_role', {
      p_user_id: authData.user.id,
      p_first_name: first_name,
      p_last_name: last_name,
      p_email: email,
      p_facility_id: facility_id || null
    })

    if (profileError) {
      // Clean up the auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return new Response(
        JSON.stringify({ error: `Failed to create profile: ${profileError.message}` }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      )
    }

    if (profileData && typeof profileData === 'object' && 'error' in profileData) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return new Response(
        JSON.stringify({ error: (profileData as any).error }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        user_id: authData.user.id,
        message: 'Patient created successfully'
      }),
      { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('create-patient error:', error instanceof Error ? error.message : String(error))

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
    )
  }
})
