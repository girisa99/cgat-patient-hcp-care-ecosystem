import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ARIZE_API_KEY = Deno.env.get('ARIZE_API_KEY');

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();
    
    if (!ARIZE_API_KEY) {
      throw new Error('Arize API key not configured');
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
        return await initializeArize(userId, data);
      case 'send_trace':
        return await sendTrace(userId, data);
      case 'get_metrics':
        return await getMetrics(userId);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Arize Integration Error:', error);
    return new Response(
      JSON.stringify({ 
        error: (error instanceof Error ? error.message : 'Arize integration failed'),
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

async function initializeArize(userId: string, config: any) {
  console.log('Initializing Arize for user:', userId);
  
  // Test connection to Arize
  const response = await fetch('https://api.arize.com/v1/spaces', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${ARIZE_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to connect to Arize API');
  }

  const spaces = await response.json();
  
  return new Response(
    JSON.stringify({ 
      success: true,
      message: 'Arize connection established',
      spaces: spaces.data || []
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
  console.log('Sending trace to Arize for user:', userId);
  
  const payload = {
    model_id: traceData.model_id || 'default',
    model_version: traceData.model_version || '1.0',
    environment: traceData.environment || 'production',
    prediction_id: traceData.trace_id,
    prediction_label: traceData.operation_name,
    prediction_timestamp: traceData.start_time,
    features: traceData.metadata || {},
    tags: traceData.tags || {},
  };

  const response = await fetch('https://api.arize.com/v1/log', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ARIZE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Arize API Error:', error);
    throw new Error(`Failed to send trace to Arize: ${error}`);
  }

  const result = await response.json();
  
  return new Response(
    JSON.stringify({ 
      success: true,
      message: 'Trace sent to Arize successfully',
      arize_response: result
    }),
    {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      }
    }
  );
}

async function getMetrics(userId: string) {
  console.log('Getting Arize metrics for user:', userId);
  
  // Get metrics from Arize
  const response = await fetch('https://api.arize.com/v1/metrics', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${ARIZE_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch metrics from Arize');
  }

  const metrics = await response.json();
  
  return new Response(
    JSON.stringify({ 
      success: true,
      metrics: metrics.data || {},
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