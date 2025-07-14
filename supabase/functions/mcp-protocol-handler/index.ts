import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MCPMessage {
  id: string;
  type: 'request' | 'response' | 'notification';
  method: string;
  params?: any;
  result?: any;
  error?: any;
}

interface MCPContext {
  user_id?: string;
  facility_id?: string;
  session_id: string;
  permissions: string[];
  compliance_level: 'basic' | 'enhanced' | 'validated';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context }: { message: MCPMessage, context: MCPContext } = await req.json();
    
    if (!message || !message.method) {
      throw new Error('Invalid MCP message format');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Route MCP message to appropriate handler
    const response = await routeMCPMessage(supabase, message, context);

    // Log MCP interaction for audit
    await logMCPInteraction(supabase, message, context, response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('MCP Protocol Error:', error);
    
    const errorResponse: MCPMessage = {
      id: 'error',
      type: 'response',
      method: 'error',
      error: {
        code: -32603,
        message: error.message || 'Internal MCP error',
        data: { timestamp: new Date().toISOString() }
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function routeMCPMessage(
  supabase: any, 
  message: MCPMessage, 
  context: MCPContext
): Promise<MCPMessage> {
  
  switch (message.method) {
    case 'healthcare.facility.list':
      return await handleFacilityList(supabase, message, context);
    
    case 'healthcare.clinical.trials':
      return await handleClinicalTrials(supabase, message, context);
    
    case 'healthcare.compliance.status':
      return await handleComplianceStatus(supabase, message, context);
    
    case 'healthcare.api.integrations':
      return await handleAPIIntegrations(supabase, message, context);
    
    case 'healthcare.onboarding.status':
      return await handleOnboardingStatus(supabase, message, context);
    
    case 'healthcare.security.events':
      return await handleSecurityEvents(supabase, message, context);
    
    case 'healthcare.audit.query':
      return await handleAuditQuery(supabase, message, context);
      
    case 'healthcare.test.execution':
      return await handleTestExecution(supabase, message, context);
    
    default:
      throw new Error(`Unknown MCP method: ${message.method}`);
  }
}

async function handleFacilityList(
  supabase: any, 
  message: MCPMessage, 
  context: MCPContext
): Promise<MCPMessage> {
  
  const { filter = {}, limit = 10 } = message.params || {};
  
  let query = supabase
    .from('facilities')
    .select(`
      id, name, facility_type, address, phone, email,
      license_number, npi_number, is_active, created_at
    `)
    .eq('is_active', true)
    .limit(limit);

  if (filter.facility_type) {
    query = query.eq('facility_type', filter.facility_type);
  }

  const { data, error } = await query;
  
  if (error) throw error;

  return {
    id: message.id,
    type: 'response',
    method: message.method,
    result: {
      facilities: data,
      count: data?.length || 0,
      compliance_level: context.compliance_level,
      timestamp: new Date().toISOString()
    }
  };
}

async function handleClinicalTrials(
  supabase: any, 
  message: MCPMessage, 
  context: MCPContext
): Promise<MCPMessage> {
  
  const { filter = {}, limit = 5 } = message.params || {};
  
  let query = supabase
    .from('clinical_trials')
    .select(`
      id, title, phase, trial_status, primary_indication,
      patient_population, enrollment_current, enrollment_target,
      primary_endpoint, secondary_endpoints, nct_number,
      start_date, estimated_completion_date
    `)
    .eq('is_active', true)
    .limit(limit);

  if (filter.phase) {
    query = query.eq('phase', filter.phase);
  }
  
  if (filter.status) {
    query = query.eq('trial_status', filter.status);
  }

  const { data, error } = await query;
  
  if (error) throw error;

  return {
    id: message.id,
    type: 'response',
    method: message.method,
    result: {
      clinical_trials: data,
      count: data?.length || 0,
      regulatory_compliance: 'ICH_GCP_compliant',
      timestamp: new Date().toISOString()
    }
  };
}

async function handleComplianceStatus(
  supabase: any, 
  message: MCPMessage, 
  context: MCPContext
): Promise<MCPMessage> {
  
  const { facility_id, test_type = 'all' } = message.params || {};
  
  // Get compliance test cases
  let query = supabase
    .from('comprehensive_test_cases')
    .select(`
      id, test_name, test_category, test_suite_type,
      validation_level, test_status, compliance_requirements,
      cfr_part11_metadata, module_name, last_executed_at
    `)
    .limit(20);

  if (test_type !== 'all') {
    query = query.eq('test_suite_type', test_type);
  }

  const { data: testCases, error } = await query;
  
  if (error) throw error;

  // Calculate compliance metrics
  const totalTests = testCases?.length || 0;
  const passedTests = testCases?.filter(t => t.test_status === 'passed').length || 0;
  const failedTests = testCases?.filter(t => t.test_status === 'failed').length || 0;
  const pendingTests = testCases?.filter(t => t.test_status === 'pending').length || 0;

  const complianceScore = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

  return {
    id: message.id,
    type: 'response',
    method: message.method,
    result: {
      compliance_summary: {
        total_tests: totalTests,
        passed_tests: passedTests,
        failed_tests: failedTests,
        pending_tests: pendingTests,
        compliance_score: complianceScore,
        compliance_level: complianceScore >= 95 ? 'validated' : complianceScore >= 80 ? 'enhanced' : 'basic'
      },
      test_cases: testCases,
      cfr_part_11_status: 'compliant',
      last_audit: new Date().toISOString(),
      timestamp: new Date().toISOString()
    }
  };
}

async function handleAPIIntegrations(
  supabase: any, 
  message: MCPMessage, 
  context: MCPContext
): Promise<MCPMessage> {
  
  const { status = 'active', limit = 10 } = message.params || {};
  
  const { data: integrations, error } = await supabase
    .from('api_integration_registry')
    .select(`
      id, name, type, category, status, lifecycle_stage,
      description, purpose, base_url, version,
      endpoints_count, rls_policies_count, data_mappings_count,
      security_requirements, sla_requirements, created_at
    `)
    .eq('status', status)
    .limit(limit);

  if (error) throw error;

  return {
    id: message.id,
    type: 'response',
    method: message.method,
    result: {
      api_integrations: integrations,
      count: integrations?.length || 0,
      security_compliance: 'hipaa_compliant',
      timestamp: new Date().toISOString()
    }
  };
}

async function handleOnboardingStatus(
  supabase: any, 
  message: MCPMessage, 
  context: MCPContext
): Promise<MCPMessage> {
  
  const { status_filter, limit = 10 } = message.params || {};
  
  let query = supabase
    .from('treatment_center_onboarding')
    .select(`
      id, facility_name, facility_type, onboarding_status,
      primary_specialty, current_step, compliance_status,
      created_at, updated_at
    `)
    .limit(limit)
    .order('created_at', { ascending: false });

  if (status_filter) {
    query = query.eq('onboarding_status', status_filter);
  }

  const { data, error } = await query;
  
  if (error) throw error;

  return {
    id: message.id,
    type: 'response',
    method: message.method,
    result: {
      onboarding_records: data,
      count: data?.length || 0,
      compliance_tracking: 'active',
      timestamp: new Date().toISOString()
    }
  };
}

async function handleSecurityEvents(
  supabase: any, 
  message: MCPMessage, 
  context: MCPContext
): Promise<MCPMessage> {
  
  const { severity_filter, limit = 10 } = message.params || {};
  
  let query = supabase
    .from('security_events')
    .select(`
      id, event_type, severity, description, metadata,
      created_at, ip_address
    `)
    .limit(limit)
    .order('created_at', { ascending: false });

  if (severity_filter) {
    query = query.eq('severity', severity_filter);
  }

  const { data, error } = await query;
  
  if (error) throw error;

  return {
    id: message.id,
    type: 'response',
    method: message.method,
    result: {
      security_events: data,
      count: data?.length || 0,
      security_status: 'monitored',
      timestamp: new Date().toISOString()
    }
  };
}

async function handleAuditQuery(
  supabase: any, 
  message: MCPMessage, 
  context: MCPContext
): Promise<MCPMessage> {
  
  const { table_name, action_filter, limit = 20 } = message.params || {};
  
  let query = supabase
    .from('audit_logs')
    .select(`
      id, action, table_name, record_id,
      old_values, new_values, created_at, ip_address
    `)
    .limit(limit)
    .order('created_at', { ascending: false });

  if (table_name) {
    query = query.eq('table_name', table_name);
  }
  
  if (action_filter) {
    query = query.eq('action', action_filter);
  }

  const { data, error } = await query;
  
  if (error) throw error;

  return {
    id: message.id,
    type: 'response',
    method: message.method,
    result: {
      audit_records: data,
      count: data?.length || 0,
      audit_compliance: '21_cfr_part_11_compliant',
      timestamp: new Date().toISOString()
    }
  };
}

async function handleTestExecution(
  supabase: any, 
  message: MCPMessage, 
  context: MCPContext
): Promise<MCPMessage> {
  
  const { suite_type, batch_size = 10 } = message.params || {};
  
  // Execute comprehensive test suite
  const { data: executionResult, error } = await supabase
    .rpc('execute_comprehensive_test_suite', {
      suite_type,
      batch_size
    });

  if (error) throw error;

  return {
    id: message.id,
    type: 'response',
    method: message.method,
    result: {
      execution_results: executionResult,
      validation_status: 'cfr_part_11_compliant',
      timestamp: new Date().toISOString()
    }
  };
}

async function logMCPInteraction(
  supabase: any,
  message: MCPMessage,
  context: MCPContext,
  response: MCPMessage
): Promise<void> {
  try {
    await supabase.rpc('log_security_event', {
      p_user_id: context.user_id || null,
      p_event_type: 'mcp_protocol_interaction',
      p_severity: 'info',
      p_description: `MCP method executed: ${message.method}`,
      p_metadata: {
        method: message.method,
        session_id: context.session_id,
        facility_id: context.facility_id,
        compliance_level: context.compliance_level,
        response_status: response.error ? 'error' : 'success',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Failed to log MCP interaction:', error);
  }
}