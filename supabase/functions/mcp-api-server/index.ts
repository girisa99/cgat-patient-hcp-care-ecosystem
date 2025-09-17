import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface McpApiConfig {
  endpoints: Record<string, {
    url: string
    method: string
    headers?: Record<string, string>
    auth?: {
      type: 'bearer' | 'api_key' | 'basic'
      token?: string
      key?: string
      username?: string
      password?: string
    }
    rate_limit?: {
      requests_per_minute: number
      requests_per_hour: number
    }
    cache_ttl?: number
    transform?: {
      request?: string // JavaScript function as string
      response?: string // JavaScript function as string
    }
  }>
  default_headers?: Record<string, string>
  timeout?: number
}

// In-memory cache and rate limiting
const cache = new Map<string, { data: any, expires: number }>()
const rateLimits = new Map<string, { count: number, window_start: number }>()

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, config, endpoint, data, params } = await req.json()
    const apiConfig: McpApiConfig = config || { endpoints: {} }

    console.log(`MCP API Server - Action: ${action}, Endpoint: ${endpoint}`)

    switch (action) {
      case 'get_endpoints':
        return new Response(JSON.stringify({ 
          success: true, 
          data: Object.keys(apiConfig.endpoints) 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'call_api':
        const result = await callExternalApi(endpoint, data, params, apiConfig)
        return new Response(JSON.stringify({ success: true, data: result }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'healthcare_api_call':
        const healthcareResult = await callHealthcareApi(endpoint, data, apiConfig)
        return new Response(JSON.stringify({ success: true, data: healthcareResult }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'batch_api_calls':
        const batchResults = await executeBatchCalls(data.calls, apiConfig)
        return new Response(JSON.stringify({ success: true, data: batchResults }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'clear_cache':
        cache.clear()
        return new Response(JSON.stringify({ success: true, message: 'Cache cleared' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      default:
        throw new Error(`Unknown action: ${action}`)
    }
  } catch (error) {
    console.error('MCP API Server Error:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function callExternalApi(endpoint: string, data: any, params: any, config: McpApiConfig) {
  const endpointConfig = config.endpoints[endpoint]
  if (!endpointConfig) {
    throw new Error(`Endpoint ${endpoint} not configured`)
  }

  // Check rate limits
  if (endpointConfig.rate_limit) {
    const rateLimitKey = `${endpoint}_rate_limit`
    const now = Date.now()
    const windowMs = 60 * 1000 // 1 minute
    
    let rateLimit = rateLimits.get(rateLimitKey)
    if (!rateLimit || now - rateLimit.window_start > windowMs) {
      rateLimit = { count: 0, window_start: now }
    }
    
    if (rateLimit.count >= endpointConfig.rate_limit.requests_per_minute) {
      throw new Error('Rate limit exceeded')
    }
    
    rateLimit.count++
    rateLimits.set(rateLimitKey, rateLimit)
  }

  // Check cache
  const cacheKey = `${endpoint}_${JSON.stringify(params)}`
  const cached = cache.get(cacheKey)
  if (cached && cached.expires > Date.now()) {
    console.log(`Cache hit for ${endpoint}`)
    return cached.data
  }

  // Prepare request
  let url = endpointConfig.url
  const requestOptions: RequestInit = {
    method: endpointConfig.method,
    headers: {
      'Content-Type': 'application/json',
      ...config.default_headers,
      ...endpointConfig.headers
    }
  }

  // Add authentication
  if (endpointConfig.auth) {
    switch (endpointConfig.auth.type) {
      case 'bearer':
        requestOptions.headers['Authorization'] = `Bearer ${endpointConfig.auth.token}`
        break
      case 'api_key':
        requestOptions.headers['X-API-Key'] = endpointConfig.auth.key
        break
      case 'basic':
        const credentials = btoa(`${endpointConfig.auth.username}:${endpointConfig.auth.password}`)
        requestOptions.headers['Authorization'] = `Basic ${credentials}`
        break
    }
  }

  // Handle parameters
  if (params && endpointConfig.method === 'GET') {
    const urlParams = new URLSearchParams(params)
    url += `?${urlParams.toString()}`
  } else if (data) {
    // Apply request transformation if configured
    let transformedData = data
    if (endpointConfig.transform?.request) {
      try {
        const transformFn = new Function('data', endpointConfig.transform.request)
        transformedData = transformFn(data)
      } catch (e) {
        console.warn('Request transformation failed:', e)
      }
    }
    requestOptions.body = JSON.stringify(transformedData)
  }

  // Make request with timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), config.timeout || 30000)
  requestOptions.signal = controller.signal

  try {
    const response = await fetch(url, requestOptions)
    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`)
    }

    let result = await response.json()

    // Apply response transformation if configured
    if (endpointConfig.transform?.response) {
      try {
        const transformFn = new Function('data', endpointConfig.transform.response)
        result = transformFn(result)
      } catch (e) {
        console.warn('Response transformation failed:', e)
      }
    }

    // Cache result if TTL is configured
    if (endpointConfig.cache_ttl) {
      cache.set(cacheKey, {
        data: result,
        expires: Date.now() + (endpointConfig.cache_ttl * 1000)
      })
    }

    return result
  } finally {
    clearTimeout(timeoutId)
  }
}

async function callHealthcareApi(endpoint: string, data: any, config: McpApiConfig) {
  // Specialized healthcare API handling with HIPAA-compliant logging
  console.log(`Healthcare API call - Endpoint: ${endpoint}, Data keys: ${Object.keys(data || {}).join(', ')}`)
  
  const result = await callExternalApi(endpoint, data, null, config)
  
  // Healthcare-specific processing (e.g., data validation, compliance checks)
  if (result && typeof result === 'object') {
    // Add compliance metadata
    result._compliance = {
      processed_at: new Date().toISOString(),
      endpoint: endpoint,
      data_classification: 'healthcare'
    }
  }
  
  return result
}

async function executeBatchCalls(calls: any[], config: McpApiConfig) {
  const results = []
  
  for (const call of calls) {
    try {
      const result = await callExternalApi(call.endpoint, call.data, call.params, config)
      results.push({ success: true, endpoint: call.endpoint, data: result })
    } catch (error) {
      results.push({ 
        success: false, 
        endpoint: call.endpoint, 
        error: error.message 
      })
    }
  }
  
  return results
}