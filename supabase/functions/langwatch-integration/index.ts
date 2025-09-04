import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const LANGWATCH_API_KEY = Deno.env.get('LANGWATCH_API_KEY');

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();
    
    if (!LANGWATCH_API_KEY) {
      throw new Error('LangWatch API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get auth token from request
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('No authorization token provided');
    }

    // Verify user
    const { data: user } = await supabase.auth.getUser(token);
    if (!user?.user) {
      throw new Error('Invalid authorization token');
    }

    const userId = user.user.id;

    switch (action) {
      case 'initialize':
        return await initializeLangWatch(userId, data);
      case 'send_trace':
        return await sendTrace(userId, data);
      case 'get_analytics':
        return await getAnalytics(userId);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('LangWatch Integration Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'LangWatch integration failed',
        success: false
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

async function initializeLangWatch(userId: string, config: any) {
  console.log('Initializing LangWatch for user:', userId);
  
  // Test connection to LangWatch
  const response = await fetch('https://app.langwatch.ai/api/projects', {
    method: 'GET',
    headers: {
      'X-Auth-Token': LANGWATCH_API_KEY,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to connect to LangWatch API');
  }

  const projects = await response.json();
  
  return new Response(
    JSON.stringify({ 
      success: true,
      message: 'LangWatch connection established',
      projects: projects || []
    }),
    {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      }
    }
  );
}

async function sendTrace(userId: string, traceData: any) {
  console.log('Sending trace to LangWatch for user:', userId);
  
  const payload = {
    trace_id: traceData.trace_id,
    span_id: traceData.span_id,
    parent_span_id: traceData.parent_span_id,
    name: traceData.operation_name,
    start_time: traceData.start_time,
    end_time: traceData.end_time,
    duration: traceData.duration_ms,
    status: traceData.status,
    metadata: traceData.metadata || {},
    tags: traceData.tags || {},
    input: traceData.input,
    output: traceData.output,
    model: traceData.model,
  };

  const response = await fetch('https://app.langwatch.ai/api/traces', {
    method: 'POST',
    headers: {
      'X-Auth-Token': LANGWATCH_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('LangWatch API Error:', error);
    throw new Error(`Failed to send trace to LangWatch: ${error}`);
  }

  const result = await response.json();
  
  return new Response(
    JSON.stringify({ 
      success: true,
      message: 'Trace sent to LangWatch successfully',
      langwatch_response: result
    }),
    {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      }
    }
  );
}

async function getAnalytics(userId: string) {
  console.log('Getting LangWatch analytics for user:', userId);
  
  // Get analytics from LangWatch
  const response = await fetch('https://app.langwatch.ai/api/analytics', {
    method: 'GET',
    headers: {
      'X-Auth-Token': LANGWATCH_API_KEY,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch analytics from LangWatch');
  }

  const analytics = await response.json();
  
  return new Response(
    JSON.stringify({ 
      success: true,
      analytics: analytics || {},
      timestamp: new Date().toISOString()
    }),
    {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      }
    }
  );
}