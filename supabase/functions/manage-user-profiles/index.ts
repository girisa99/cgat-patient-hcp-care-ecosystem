
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          first_name: string | null
          last_name: string | null
          phone: string | null
          department: string | null
          facility_id: string | null
          created_at: string | null
          updated_at: string | null
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role_id: string
          created_at: string | null
        }
      }
      roles: {
        Row: {
          id: string
          name: string
          description: string | null
        }
      }
      facilities: {
        Row: {
          id: string
          name: string
          facility_type: string
        }
      }
    }
  }
}

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
    console.log('🔄 [MANAGE-USER-PROFILES] Processing request...')
    
    // Create Supabase client with service role for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

    // Get user from JWT token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      throw new Error('Invalid token or user not found')
    }

    console.log('✅ [MANAGE-USER-PROFILES] User authenticated:', user.email)

    const { action } = await req.json()

    if (action === 'list') {
      console.log('📋 [MANAGE-USER-PROFILES] Fetching user list...')

      // Get all users from auth.users and join with profiles and roles
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

      if (authError) {
        console.error('❌ [MANAGE-USER-PROFILES] Error fetching auth users:', authError)
        throw new Error(`Failed to fetch users: ${authError.message}`)
      }

      console.log('✅ [MANAGE-USER-PROFILES] Found auth users:', authUsers.users.length)

      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')

      if (profilesError) {
        console.error('❌ [MANAGE-USER-PROFILES] Error fetching profiles:', profilesError)
      }

      // Get all user roles with role details
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          roles (
            name,
            description
          )
        `)

      if (rolesError) {
        console.error('❌ [MANAGE-USER-PROFILES] Error fetching roles:', rolesError)
      }

      // Get all facilities
      const { data: facilities, error: facilitiesError } = await supabase
        .from('facilities')
        .select('id, name, facility_type')

      if (facilitiesError) {
        console.error('❌ [MANAGE-USER-PROFILES] Error fetching facilities:', facilitiesError)
      }

      // Combine auth users with profile and role data
      const combinedUsers = authUsers.users.map((authUser) => {
        const profile = profiles?.find(p => p.id === authUser.id)
        const userRolesList = userRoles?.filter(ur => ur.user_id === authUser.id) || []
        const userFacility = profile?.facility_id ? facilities?.find(f => f.id === profile.facility_id) : null

        return {
          id: authUser.id,
          email: authUser.email || profile?.email || '',
          first_name: profile?.first_name || '',
          last_name: profile?.last_name || '',
          phone: profile?.phone || '',
          department: profile?.department || '',
          facility_id: profile?.facility_id || null,
          created_at: authUser.created_at,
          updated_at: authUser.updated_at || profile?.updated_at,
          // Add auth-related properties for verification status
          email_confirmed_at: authUser.email_confirmed_at,
          last_sign_in_at: authUser.last_sign_in_at,
          user_roles: userRolesList,
          facilities: userFacility
        }
      })

      console.log('✅ [MANAGE-USER-PROFILES] Combined users prepared:', combinedUsers.length)

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: combinedUsers,
          message: `Successfully fetched ${combinedUsers.length} users`
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    throw new Error(`Unknown action: ${action}`)

  } catch (error) {
    console.error('❌ [MANAGE-USER-PROFILES] Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
