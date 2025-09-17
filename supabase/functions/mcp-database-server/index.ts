import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface McpDatabaseConfig {
  tables: string[]
  schema?: string
  filters?: Record<string, any>
  permissions?: {
    read: boolean
    write: boolean
    delete: boolean
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, config, data, query } = await req.json()
    const mcpConfig: McpDatabaseConfig = config || {
      tables: ['patient_enrollment'], // Default fallback
      schema: 'public',
      permissions: { read: true, write: true, delete: false }
    }

    console.log(`MCP Database Server - Action: ${action}, Tables: ${mcpConfig.tables.join(', ')}`)

    switch (action) {
      case 'get_schema':
        const schemaInfo = await getTableSchemas(supabase, mcpConfig.tables, mcpConfig.schema || 'public')
        return new Response(JSON.stringify({ success: true, data: schemaInfo }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'query_data':
        if (!mcpConfig.permissions?.read) {
          throw new Error('Read permission not granted')
        }
        const queryResult = await executeQuery(supabase, query, mcpConfig)
        return new Response(JSON.stringify({ success: true, data: queryResult }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'insert_data':
        if (!mcpConfig.permissions?.write) {
          throw new Error('Write permission not granted')
        }
        const insertResult = await insertData(supabase, data, mcpConfig)
        return new Response(JSON.stringify({ success: true, data: insertResult }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'update_data':
        if (!mcpConfig.permissions?.write) {
          throw new Error('Write permission not granted')
        }
        const updateResult = await updateData(supabase, data, mcpConfig)
        return new Response(JSON.stringify({ success: true, data: updateResult }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'get_conversation_context':
        const context = await getConversationContext(supabase, data.conversation_id, mcpConfig)
        return new Response(JSON.stringify({ success: true, data: context }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'store_agent_memory':
        const memoryResult = await storeAgentMemory(supabase, data, mcpConfig)
        return new Response(JSON.stringify({ success: true, data: memoryResult }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      default:
        throw new Error(`Unknown action: ${action}`)
    }
  } catch (error) {
    console.error('MCP Database Server Error:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function getTableSchemas(supabase: any, tables: string[], schema: string) {
  const schemas = {}
  
  for (const table of tables) {
    const { data, error } = await supabase.rpc('get_complete_schema_info')
    if (error) throw error
    
    const tableSchema = (data as any[]).find(t => t.table_name === table)
    if (tableSchema) {
      schemas[table] = {
        columns: tableSchema.columns,
        constraints: tableSchema.constraints,
        indexes: tableSchema.indexes,
        rls_enabled: tableSchema.rls_enabled,
        policies: tableSchema.rls_policies
      }
    }
  }
  
  return schemas
}

async function executeQuery(supabase: any, query: any, config: McpDatabaseConfig) {
  const { table, select, filters, limit } = query
  
  if (!config.tables.includes(table)) {
    throw new Error(`Table ${table} not allowed in current configuration`)
  }
  
  let queryBuilder = supabase.from(table)
  
  if (select) {
    queryBuilder = queryBuilder.select(select)
  }
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      queryBuilder = queryBuilder.eq(key, value)
    })
  }
  
  if (config.filters) {
    Object.entries(config.filters).forEach(([key, value]) => {
      queryBuilder = queryBuilder.eq(key, value)
    })
  }
  
  if (limit) {
    queryBuilder = queryBuilder.limit(limit)
  }
  
  const { data, error } = await queryBuilder
  if (error) throw error
  
  return data
}

async function insertData(supabase: any, data: any, config: McpDatabaseConfig) {
  const { table, records } = data
  
  if (!config.tables.includes(table)) {
    throw new Error(`Table ${table} not allowed in current configuration`)
  }
  
  // Apply default filters if configured
  const enrichedRecords = records.map(record => ({
    ...record,
    ...config.filters || {}
  }))
  
  const { data: result, error } = await supabase
    .from(table)
    .insert(enrichedRecords)
    .select()
  
  if (error) throw error
  return result
}

async function updateData(supabase: any, data: any, config: McpDatabaseConfig) {
  const { table, updates, filters } = data
  
  if (!config.tables.includes(table)) {
    throw new Error(`Table ${table} not allowed in current configuration`)
  }
  
  let queryBuilder = supabase.from(table).update(updates)
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      queryBuilder = queryBuilder.eq(key, value)
    })
  }
  
  // Apply config filters
  if (config.filters) {
    Object.entries(config.filters).forEach(([key, value]) => {
      queryBuilder = queryBuilder.eq(key, value)
    })
  }
  
  const { data: result, error } = await queryBuilder.select()
  if (error) throw error
  
  return result
}

async function getConversationContext(supabase: any, conversationId: string, config: McpDatabaseConfig) {
  // This can be made dynamic based on config.tables
  const conversationTable = config.tables.find(t => t.includes('conversation')) || 'agent_conversations'
  
  const { data, error } = await supabase
    .from(conversationTable)
    .select('*')
    .eq('id', conversationId)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  
  return data || {}
}

async function storeAgentMemory(supabase: any, data: any, config: McpDatabaseConfig) {
  const { agent_id, memory_type, content, metadata } = data
  
  // Use a memory table if available in config, or default behavior
  const memoryTable = config.tables.find(t => t.includes('memory')) || 'agent_conversations'
  
  const memoryData = {
    agent_id,
    memory_type,
    content,
    metadata: metadata || {},
    created_at: new Date().toISOString()
  }
  
  const { data: result, error } = await supabase
    .from(memoryTable)
    .upsert(memoryData)
    .select()
  
  if (error) throw error
  return result
}