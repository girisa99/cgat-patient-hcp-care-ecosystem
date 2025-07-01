
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

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
    console.log('🔄 [ONBOARDING-WORKFLOW] Processing request...')
    
    // Create Supabase client with service role for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

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

    console.log('✅ [ONBOARDING-WORKFLOW] User authenticated:', user.email)

    const body = await req.json()
    const { action } = body

    console.log('📝 [ONBOARDING-WORKFLOW] Action requested:', action)

    if (action === 'assign_role') {
      const { user_id, role_name } = body
      
      console.log('👤 [ONBOARDING-WORKFLOW] Assigning role:', role_name, 'to user:', user_id)

      // Use the security definer function to check admin status safely
      const { data: hasPermission, error: permissionError } = await supabase.rpc('is_admin_user', {
        check_user_id: user.id
      })

      if (permissionError) {
        console.error('❌ [ONBOARDING-WORKFLOW] Error checking permissions:', permissionError)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Error checking user permissions' 
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

      if (!hasPermission) {
        console.error('❌ [ONBOARDING-WORKFLOW] User lacks permission to assign roles')
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Insufficient permissions to assign roles' 
          }),
          { 
            status: 403,
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json' 
            } 
          }
        )
      }

      // Get the role ID using service role client to bypass RLS
      const { data: role, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', role_name)
        .single()

      if (roleError || !role) {
        console.error('❌ [ONBOARDING-WORKFLOW] Role not found:', role_name, roleError)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Role '${role_name}' not found` 
          }),
          { 
            status: 404,
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json' 
            } 
          }
        )
      }

      // Check if user already has this role using service role client
      const { data: existingRole, error: checkError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', user_id)
        .eq('role_id', role.id)
        .maybeSingle()

      if (checkError) {
        console.error('❌ [ONBOARDING-WORKFLOW] Error checking existing role:', checkError)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Error checking existing role assignment' 
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

      if (existingRole) {
        console.log('ℹ️ [ONBOARDING-WORKFLOW] User already has this role assigned')
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'User already has this role assigned'
          }),
          { 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json' 
            } 
          }
        )
      }

      // Assign the role using service role client to bypass RLS restrictions
      const { error: assignError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user_id,
          role_id: role.id
        })

      if (assignError) {
        console.error('❌ [ONBOARDING-WORKFLOW] Error assigning role:', assignError)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: assignError.message 
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

      console.log('✅ [ONBOARDING-WORKFLOW] Role assigned successfully')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Role '${role_name}' assigned successfully`
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    if (action === 'remove_role') {
      const { user_id, role_name } = body
      
      console.log('➖ [ONBOARDING-WORKFLOW] Removing role:', role_name, 'from user:', user_id)

      // Use the security definer function to check admin status safely
      const { data: hasPermission, error: permissionError } = await supabase.rpc('is_admin_user', {
        check_user_id: user.id
      })

      if (permissionError) {
        console.error('❌ [ONBOARDING-WORKFLOW] Error checking permissions:', permissionError)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Error checking user permissions' 
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

      if (!hasPermission) {
        console.error('❌ [ONBOARDING-WORKFLOW] User lacks permission to remove roles')
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Insufficient permissions to remove roles' 
          }),
          { 
            status: 403,
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json' 
            } 
          }
        )
      }

      // Get the role ID using service role client
      const { data: role, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', role_name)
        .single()

      if (roleError || !role) {
        console.error('❌ [ONBOARDING-WORKFLOW] Role not found:', role_name, roleError)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Role '${role_name}' not found` 
          }),
          { 
            status: 404,
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json' 
            } 
          }
        )
      }

      // Remove the role using service role client
      const { error: removeError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user_id)
        .eq('role_id', role.id)

      if (removeError) {
        console.error('❌ [ONBOARDING-WORKFLOW] Error removing role:', removeError)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: removeError.message 
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

      console.log('✅ [ONBOARDING-WORKFLOW] Role removed successfully')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Role '${role_name}' removed successfully`
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    if (action === 'complete_user_setup') {
      const { user_data } = body
      
      console.log('🆕 [ONBOARDING-WORKFLOW] Creating new user:', user_data)

      // Create user in auth system using service role
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: user_data.email,
        password: Math.random().toString(36).substring(2, 15), // Generate temporary password
        email_confirm: false,
        user_metadata: {
          first_name: user_data.first_name,
          last_name: user_data.last_name,
          role: user_data.role
        }
      })

      if (createError || !newUser.user) {
        console.error('❌ [ONBOARDING-WORKFLOW] Error creating user:', createError)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: createError?.message || 'Failed to create user' 
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

      // Create profile using service role client
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: newUser.user.id,
          email: user_data.email,
          first_name: user_data.first_name,
          last_name: user_data.last_name,
          phone: user_data.phone,
          department: user_data.department,
          facility_id: user_data.facility_id
        })

      if (profileError) {
        console.error('❌ [ONBOARDING-WORKFLOW] Error creating profile:', profileError)
        // Don't fail completely, profile might be created by trigger
      }

      // Assign role if provided
      if (user_data.role) {
        const { data: role, error: roleError } = await supabase
          .from('roles')
          .select('id')
          .eq('name', user_data.role)
          .single()

        if (role && !roleError) {
          const { error: assignError } = await supabase
            .from('user_roles')
            .insert({
              user_id: newUser.user.id,
              role_id: role.id
            })

          if (assignError) {
            console.error('❌ [ONBOARDING-WORKFLOW] Error assigning initial role:', assignError)
          }
        }
      }

      console.log('✅ [ONBOARDING-WORKFLOW] User created successfully')
      return new Response(
        JSON.stringify({ 
          success: true, 
          user: newUser.user,
          message: 'User created successfully'
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Invalid action: ${action}` 
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('❌ [ONBOARDING-WORKFLOW] Error:', error)
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
