import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SecurityAlert {
  alert_type: 'suspicious_access' | 'failed_auth' | 'data_breach' | 'unusual_pattern'
  severity: 'low' | 'medium' | 'high' | 'critical'
  user_id?: string
  ip_address?: string
  user_agent?: string
  resource_accessed?: string
  alert_details: any
  created_at?: string
}

interface AccessPattern {
  user_id: string
  ip_address: string
  access_count: number
  last_access: string
  failed_attempts: number
  resources_accessed: string[]
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, data } = await req.json()

    switch (action) {
      case 'analyze_patterns':
        return await analyzeSecurityPatterns(supabase)
      case 'create_alert':
        return await createSecurityAlert(supabase, data)
      case 'get_alerts':
        return await getSecurityAlerts(supabase, data?.filters)
      case 'check_suspicious_access':
        return await checkSuspiciousAccess(supabase, data)
      default:
        throw new Error(`Unknown action: ${action}`)
    }
  } catch (error) {
    console.error('Security monitor error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Security monitor error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})

async function analyzeSecurityPatterns(supabase: any) {
  console.log('Analyzing security patterns...')
  
  // Get recent access patterns from audit logs
  const { data: auditLogs, error: auditError } = await supabase
    .from('audit_logs')
    .select('*')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })

  if (auditError) {
    throw new Error(`Failed to fetch audit logs: ${auditError.message}`)
  }

  // Analyze patterns and generate alerts
  const alerts: SecurityAlert[] = []
  const userPatterns = new Map<string, AccessPattern>()

  // Process audit logs to detect patterns
  for (const log of auditLogs || []) {
    const userId = log.user_id
    const ipAddress = log.metadata?.ip_address || 'unknown'
    const resource = log.table_name || 'unknown'
    
    if (!userId) continue

    // Track user access patterns
    if (!userPatterns.has(userId)) {
      userPatterns.set(userId, {
        user_id: userId,
        ip_address: ipAddress,
        access_count: 0,
        last_access: log.created_at,
        failed_attempts: 0,
        resources_accessed: []
      })
    }

    const pattern = userPatterns.get(userId)!
    pattern.access_count++
    pattern.last_access = log.created_at
    
    if (!pattern.resources_accessed.includes(resource)) {
      pattern.resources_accessed.push(resource)
    }

    // Check for suspicious patterns
    if (log.action_type === 'failed_auth') {
      pattern.failed_attempts++
    }
  }

  // Generate alerts based on patterns
  for (const [userId, pattern] of userPatterns) {
    // Alert for multiple failed authentication attempts
    if (pattern.failed_attempts >= 5) {
      alerts.push({
        alert_type: 'failed_auth',
        severity: pattern.failed_attempts >= 10 ? 'high' : 'medium',
        user_id: userId,
        ip_address: pattern.ip_address,
        alert_details: {
          failed_attempts: pattern.failed_attempts,
          timeframe: '24h'
        }
      })
    }

    // Alert for unusual high access volume
    if (pattern.access_count > 1000) {
      alerts.push({
        alert_type: 'unusual_pattern',
        severity: pattern.access_count > 5000 ? 'high' : 'medium',
        user_id: userId,
        ip_address: pattern.ip_address,
        alert_details: {
          access_count: pattern.access_count,
          timeframe: '24h',
          resources: pattern.resources_accessed
        }
      })
    }

    // Alert for accessing sensitive data
    const sensitiveResources = ['clinical_trials', 'commercial_products', 'treatment_center_onboarding']
    const accessedSensitive = pattern.resources_accessed.filter(r => sensitiveResources.includes(r))
    
    if (accessedSensitive.length > 0) {
      alerts.push({
        alert_type: 'suspicious_access',
        severity: 'high',
        user_id: userId,
        ip_address: pattern.ip_address,
        alert_details: {
          sensitive_resources: accessedSensitive,
          access_count: pattern.access_count
        }
      })
    }
  }

  // Store alerts in database
  if (alerts.length > 0) {
    const { error: insertError } = await supabase
      .from('security_alerts')
      .insert(alerts)

    if (insertError) {
      console.error('Failed to insert alerts:', insertError)
    } else {
      console.log(`Generated ${alerts.length} security alerts`)
    }
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      alerts_generated: alerts.length,
      patterns_analyzed: userPatterns.size 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function createSecurityAlert(supabase: any, alertData: SecurityAlert) {
  console.log('Creating security alert:', alertData.alert_type)
  
  const { data, error } = await supabase
    .from('security_alerts')
    .insert([{
      ...alertData,
      created_at: new Date().toISOString()
    }])
    .select()

  if (error) {
    throw new Error(`Failed to create alert: ${error.message}`)
  }

  return new Response(
    JSON.stringify({ success: true, alert: data[0] }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getSecurityAlerts(supabase: any, filters?: any) {
  console.log('Fetching security alerts with filters:', filters)
  
  let query = supabase.from('security_alerts').select('*')

  if (filters?.severity) {
    query = query.eq('severity', filters.severity)
  }

  if (filters?.alert_type) {
    query = query.eq('alert_type', filters.alert_type)
  }

  if (filters?.since) {
    query = query.gte('created_at', filters.since)
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(filters?.limit || 100)

  if (error) {
    throw new Error(`Failed to fetch alerts: ${error.message}`)
  }

  return new Response(
    JSON.stringify({ success: true, alerts: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function checkSuspiciousAccess(supabase: any, accessData: any) {
  console.log('Checking for suspicious access:', accessData)
  
  const { user_id, ip_address, resource, user_agent } = accessData
  
  // Check recent access patterns for this user
  const { data: recentLogs, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('user_id', user_id)
    .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to check access patterns: ${error.message}`)
  }

  let suspiciousScore = 0
  const reasons: string[] = []

  // Check for rapid successive access
  if (recentLogs && recentLogs.length > 50) {
    suspiciousScore += 30
    reasons.push(`High frequency access: ${recentLogs.length} requests in 1 hour`)
  }

  // Check for new IP address
  const uniqueIPs = new Set(recentLogs?.map((log: any) => log.metadata?.ip_address).filter(Boolean))
  if (uniqueIPs.size > 3) {
    suspiciousScore += 20
    reasons.push(`Multiple IP addresses: ${uniqueIPs.size} different IPs`)
  }

  // Check for access to sensitive resources
  const sensitiveResources = ['clinical_trials', 'commercial_products', 'treatment_center_onboarding']
  if (sensitiveResources.includes(resource)) {
    suspiciousScore += 25
    reasons.push(`Access to sensitive resource: ${resource}`)
  }

  const isSuspicious = suspiciousScore >= 50

  if (isSuspicious) {
    // Create alert
    await createSecurityAlert(supabase, {
      alert_type: 'suspicious_access',
      severity: suspiciousScore >= 75 ? 'high' : 'medium',
      user_id,
      ip_address,
      user_agent,
      resource_accessed: resource,
      alert_details: {
        suspicious_score: suspiciousScore,
        reasons,
        access_time: new Date().toISOString()
      }
    })
  }

  return new Response(
    JSON.stringify({ 
      suspicious: isSuspicious, 
      score: suspiciousScore,
      reasons 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}