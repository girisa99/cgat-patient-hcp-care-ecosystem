import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const url = new URL(req.url)
    const path = url.pathname.replace('/workflow-resources', '')
    const method = req.method

    console.log(`Processing ${method} request for path: ${path}`)

    // Libraries endpoints
    if (path.startsWith('/libraries')) {
      return await handleLibraries(supabase, req, method, path)
    }
    
    // Actions endpoints
    if (path.startsWith('/actions')) {
      return await handleActions(supabase, req, method, path)
    }
    
    // Operators endpoints
    if (path.startsWith('/operators')) {
      return await handleOperators(supabase, req, method, path)
    }
    
    // Connections endpoints
    if (path.startsWith('/connections')) {
      return await handleConnections(supabase, req, method, path)
    }

    // Install/uninstall library
    if (path.startsWith('/install-library')) {
      return await handleInstallLibrary(supabase, req, method)
    }

    // Use action (increment usage)
    if (path.startsWith('/use-action')) {
      return await handleUseAction(supabase, req, method)
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function handleLibraries(supabase: any, req: Request, method: string, path: string) {
  const url = new URL(req.url)
  const category = url.searchParams.get('category')
  const search = url.searchParams.get('search')

  switch (method) {
    case 'GET':
      let query = supabase
        .from('workflow_libraries')
        .select('*')
        .order('created_at', { ascending: false })

      if (category && category !== 'all') {
        query = query.eq('category', category)
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
      }

      const { data, error } = await query
      if (error) throw error

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    case 'POST':
      const libraryData = await req.json()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data: newLibrary, error: insertError } = await supabase
        .from('workflow_libraries')
        .insert([{
          ...libraryData,
          created_by: user.id,
          is_custom: true
        }])
        .select()
        .single()

      if (insertError) throw insertError

      return new Response(
        JSON.stringify(newLibrary),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    case 'PUT':
      const id = path.split('/')[2]
      const updateData = await req.json()
      
      const { data: updatedLibrary, error: updateError } = await supabase
        .from('workflow_libraries')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      return new Response(
        JSON.stringify(updatedLibrary),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    case 'DELETE':
      const deleteId = path.split('/')[2]
      
      const { error: deleteError } = await supabase
        .from('workflow_libraries')
        .delete()
        .eq('id', deleteId)

      if (deleteError) throw deleteError

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    default:
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
  }
}

async function handleActions(supabase: any, req: Request, method: string, path: string) {
  const url = new URL(req.url)
  const category = url.searchParams.get('category')
  const search = url.searchParams.get('search')
  const type = url.searchParams.get('type')

  switch (method) {
    case 'GET':
      let query = supabase
        .from('workflow_actions')
        .select('*, workflow_libraries(name)')
        .order('created_at', { ascending: false })

      if (category && category !== 'all') {
        query = query.eq('category', category)
      }

      if (type) {
        query = query.eq('type', type)
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
      }

      const { data, error } = await query
      if (error) throw error

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    case 'POST':
      const actionData = await req.json()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data: newAction, error: insertError } = await supabase
        .from('workflow_actions')
        .insert([{
          ...actionData,
          created_by: user.id,
          is_custom: true
        }])
        .select()
        .single()

      if (insertError) throw insertError

      return new Response(
        JSON.stringify(newAction),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    case 'PUT':
      const id = path.split('/')[2]
      const updateData = await req.json()
      
      const { data: updatedAction, error: updateError } = await supabase
        .from('workflow_actions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      return new Response(
        JSON.stringify(updatedAction),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    case 'DELETE':
      const deleteId = path.split('/')[2]
      
      const { error: deleteError } = await supabase
        .from('workflow_actions')
        .delete()
        .eq('id', deleteId)

      if (deleteError) throw deleteError

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    default:
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
  }
}

async function handleOperators(supabase: any, req: Request, method: string, path: string) {
  const url = new URL(req.url)
  const category = url.searchParams.get('category')
  const search = url.searchParams.get('search')

  switch (method) {
    case 'GET':
      let query = supabase
        .from('workflow_operators')
        .select('*')
        .order('name', { ascending: true })

      if (category && category !== 'all') {
        query = query.eq('category', category)
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,symbol.ilike.%${search}%`)
      }

      const { data, error } = await query
      if (error) throw error

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    case 'POST':
      const operatorData = await req.json()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data: newOperator, error: insertError } = await supabase
        .from('workflow_operators')
        .insert([{
          ...operatorData,
          created_by: user.id
        }])
        .select()
        .single()

      if (insertError) throw insertError

      return new Response(
        JSON.stringify(newOperator),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    default:
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
  }
}

async function handleConnections(supabase: any, req: Request, method: string, path: string) {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  switch (method) {
    case 'POST':
      const connectionData = await req.json()
      
      const { data: newConnection, error: insertError } = await supabase
        .from('workflow_connections')
        .insert([{
          ...connectionData,
          created_by: user.id
        }])
        .select()
        .single()

      if (insertError) throw insertError

      return new Response(
        JSON.stringify(newConnection),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    case 'GET':
      const url = new URL(req.url)
      const workflowId = url.searchParams.get('workflow_id')
      
      if (!workflowId) {
        return new Response(
          JSON.stringify({ error: 'workflow_id is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data, error } = await supabase
        .from('workflow_connections')
        .select(`
          *,
          workflow_libraries(name),
          workflow_actions(name),
          workflow_operators(name)
        `)
        .eq('workflow_id', workflowId)
        .eq('created_by', user.id)

      if (error) throw error

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    default:
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
  }
}

async function handleInstallLibrary(supabase: any, req: Request, method: string) {
  if (method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { libraryId, install } = await req.json()
  
  const { data, error } = await supabase
    .from('workflow_libraries')
    .update({ 
      is_installed: install,
      downloads: install ? supabase.raw('downloads + 1') : supabase.raw('downloads')
    })
    .eq('id', libraryId)
    .select()
    .single()

  if (error) throw error

  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleUseAction(supabase: any, req: Request, method: string) {
  if (method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { actionId } = await req.json()
  
  const { data, error } = await supabase
    .from('workflow_actions')
    .update({ 
      usage_count: supabase.raw('usage_count + 1')
    })
    .eq('id', actionId)
    .select()
    .single()

  if (error) throw error

  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}