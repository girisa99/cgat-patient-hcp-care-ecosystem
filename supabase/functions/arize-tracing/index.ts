import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const arizeApiKey = Deno.env.get('ARIZE_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, traceId, spanId, nodeId, operationName, metadata, tags, status, duration, result, spaceKey, modelId, modelVersion } = await req.json();

    console.log('Arize tracing request:', { action, traceId, nodeId, operationName });

    if (!arizeApiKey) {
      console.error('ARIZE_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'Arize API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    switch (action) {
      case 'initialize':
        // Test Arize connection
        const initResponse = await fetch('https://api.arize.com/v1/model/check', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${arizeApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            space_key: spaceKey,
            model_id: modelId,
            model_version: modelVersion
          })
        });

        if (initResponse.ok) {
          console.log('Arize connection successful');
          return new Response(JSON.stringify({ status: 'connected' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          console.error('Arize connection failed:', await initResponse.text());
          return new Response(JSON.stringify({ error: 'Failed to connect to Arize' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

      case 'start_trace':
        // Send trace start to Arize
        const traceData = {
          trace_id: traceId,
          span_id: spanId,
          operation_name: operationName,
          start_time: new Date().toISOString(),
          tags: {
            'node.id': nodeId,
            'workflow.tracing': 'enabled',
            ...tags
          },
          model_id: modelId || 'workflow-agent',
          model_version: modelVersion || '1.0.0',
          environment: 'development',
          ...metadata
        };

        const startResponse = await fetch('https://api.arize.com/v1/span/start', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${arizeApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(traceData)
        });

        if (startResponse.ok) {
          console.log('Trace started in Arize:', traceId);
          return new Response(JSON.stringify({ status: 'trace_started', traceId }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          console.error('Failed to start trace in Arize:', await startResponse.text());
          // Don't fail the request, just log the error
          return new Response(JSON.stringify({ status: 'trace_logged_locally', traceId }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

      case 'end_trace':
        // Send trace completion to Arize
        const endData = {
          trace_id: traceId,
          end_time: new Date().toISOString(),
          status: status,
          duration_ms: duration,
          output: result,
          tags: {
            'completion.status': status,
            'workflow.completed': true
          }
        };

        const endResponse = await fetch('https://api.arize.com/v1/span/end', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${arizeApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(endData)
        });

        if (endResponse.ok) {
          console.log('Trace completed in Arize:', traceId);
          return new Response(JSON.stringify({ status: 'trace_completed', traceId }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          console.error('Failed to complete trace in Arize:', await endResponse.text());
          // Don't fail the request, just log the error
          return new Response(JSON.stringify({ status: 'trace_logged_locally', traceId }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

      case 'log_event':
        // Log custom events to Arize
        const eventData = {
          trace_id: traceId,
          event_name: operationName,
          timestamp: new Date().toISOString(),
          properties: metadata,
          tags: tags
        };

        const logResponse = await fetch('https://api.arize.com/v1/event/log', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${arizeApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventData)
        });

        if (logResponse.ok) {
          console.log('Event logged to Arize:', operationName);
          return new Response(JSON.stringify({ status: 'event_logged' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          console.error('Failed to log event to Arize:', await logResponse.text());
          return new Response(JSON.stringify({ status: 'event_logged_locally' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

  } catch (error) {
    console.error('Error in arize-tracing function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});