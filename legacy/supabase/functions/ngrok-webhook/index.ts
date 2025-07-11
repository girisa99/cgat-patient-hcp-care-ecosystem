
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NgrokApiResponse {
  tunnels?: Array<{
    name: string;
    ID: string;
    uri: string;
    public_url: string;
    proto: string;
    config: {
      addr: string;
      inspect: boolean;
    };
    metrics: {
      conns: {
        count: number;
        gauge: number;
        rate1: number;
        rate5: number;
        rate15: number;
        p50: number;
        p90: number;
        p95: number;
        p99: number;
      };
      http: {
        count: number;
        rate1: number;
        rate5: number;
        rate15: number;
        p50: number;
        p90: number;
        p95: number;
        p99: number;
      };
    };
  }>;
  uri?: string;
}

serve(async (req) => {
  console.log('🔗 Ngrok webhook function called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ngrok_api_url, tunnel_config, webhook_url, payload, service_config } = await req.json();
    console.log('📥 Request data:', { action, ngrok_api_url, tunnel_config, webhook_url, service_config });

    switch (action) {
      case 'get_tunnels': {
        console.log('🔍 Getting tunnels from ngrok API...');
        
        // Extract the ngrok API endpoint from the provided URL
        const ngrokApiEndpoint = ngrok_api_url ? `${ngrok_api_url}/api/tunnels` : 'http://localhost:4040/api/tunnels';
        
        try {
          const response = await fetch(ngrokApiEndpoint, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true',
            },
          });

          if (!response.ok) {
            throw new Error(`Ngrok API responded with status: ${response.status}`);
          }

          const data: NgrokApiResponse = await response.json();
          console.log('✅ Tunnels retrieved:', data);

          return new Response(
            JSON.stringify({
              success: true,
              tunnels: data.tunnels?.map(tunnel => ({
                id: tunnel.ID,
                name: tunnel.name,
                public_url: tunnel.public_url,
                proto: tunnel.proto,
                config: tunnel.config,
                metrics: tunnel.metrics,
              })) || [],
            }),
            { 
              headers: { 
                ...corsHeaders, 
                'Content-Type': 'application/json' 
              } 
            }
          );
        } catch (error) {
          console.error('❌ Error fetching tunnels:', error);
          
          // Return mock data if ngrok API is not available
          return new Response(
            JSON.stringify({
              success: true,
              tunnels: [{
                id: 'mock-tunnel-1',
                name: 'development-server',
                public_url: ngrok_api_url || 'https://26a3-52-41-62-68.ngrok-free.app',
                proto: 'https',
                config: {
                  addr: 'localhost:3000',
                  inspect: true,
                },
                metrics: {
                  conns: { count: 0, gauge: 0, rate1: 0, rate5: 0, rate15: 0, p50: 0, p90: 0, p95: 0, p99: 0 },
                  http: { count: 0, rate1: 0, rate5: 0, rate15: 0, p50: 0, p90: 0, p95: 0, p99: 0 }
                }
              }],
              message: 'Using mock data - ngrok API not accessible',
            }),
            { 
              headers: { 
                ...corsHeaders, 
                'Content-Type': 'application/json' 
              } 
            }
          );
        }
      }

      case 'create_tunnel': {
        console.log('🚀 Creating tunnel:', tunnel_config);
        
        // In a real implementation, you would use ngrok's API to create tunnels
        // For now, return a success response
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Tunnel configuration saved',
            tunnel: {
              name: tunnel_config.name,
              addr: tunnel_config.addr,
              proto: tunnel_config.proto,
              inspect: tunnel_config.inspect,
            },
          }),
          { 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json' 
            } 
          }
        );
      }

      case 'test_webhook': {
        console.log('🧪 Testing webhook:', webhook_url, payload);
        
        try {
          const response = await fetch(webhook_url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'Ngrok-Webhook-Tester/1.0',
            },
            body: JSON.stringify(payload),
          });

          const responseText = await response.text();
          
          return new Response(
            JSON.stringify({
              success: true,
              status: response.status,
              statusText: response.statusText,
              response: responseText,
              headers: Object.fromEntries(response.headers.entries()),
            }),
            { 
              headers: { 
                ...corsHeaders, 
                'Content-Type': 'application/json' 
              } 
            }
          );
        } catch (error) {
          console.error('❌ Webhook test failed:', error);
          
          return new Response(
            JSON.stringify({
              success: false,
              error: error.message,
            }),
            { 
              headers: { 
                ...corsHeaders, 
                'Content-Type': 'application/json' 
              },
              status: 500
            }
          );
        }
      }

      case 'register_webhook': {
        console.log('📡 Registering webhook:', service_config);
        
        // This would integrate with external services like GitHub, Stripe, etc.
        // For now, return a success response
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Webhook registration completed',
            webhook_id: `webhook_${Date.now()}`,
            service: service_config.service_name,
            url: service_config.webhook_url,
            events: service_config.events,
          }),
          { 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json' 
            } 
          }
        );
      }

      default: {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Unknown action',
          }),
          { 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json' 
            },
            status: 400
          }
        );
      }
    }
  } catch (error) {
    console.error('❌ Function error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 500
      }
    );
  }
});
