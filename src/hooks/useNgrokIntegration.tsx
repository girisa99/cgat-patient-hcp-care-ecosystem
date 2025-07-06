
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface NgrokTunnel {
  id: string;
  name: string;
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
}

export interface NgrokConfig {
  authToken?: string;
  region?: string;
  tunnels: {
    [key: string]: {
      addr: string;
      proto: string;
      inspect?: boolean;
      bind_tls?: boolean;
    };
  };
}

export const useNgrokIntegration = () => {
  const [tunnels, setTunnels] = useState<NgrokTunnel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<NgrokConfig>({
    tunnels: {}
  });

  // Updated to use localhost:4040 API by default
  const getTunnels = useCallback(async (ngrokApiUrl?: string) => {
    setIsLoading(true);
    setError(null);

    // Try localhost first, then fallback to provided URL
    const apiEndpoints = [
      'http://localhost:4040',
      ngrokApiUrl || 'https://26a3-52-41-62-68.ngrok-free.app'
    ];

    console.log('🔗 Fetching ngrok tunnels from multiple endpoints...');
    
    try {
      // Try each endpoint until one works
      for (const endpoint of apiEndpoints) {
        console.log(`🔗 Trying endpoint: ${endpoint}`);
        
        try {
          const { data, error: functionError } = await supabase.functions.invoke('ngrok-webhook', {
            body: {
              action: 'get_tunnels',
              ngrok_api_url: endpoint
            }
          });

          if (functionError) {
            console.warn(`⚠️ Endpoint ${endpoint} failed:`, functionError);
            continue;
          }
          
          setTunnels(data.tunnels || []);
          console.log('✅ Retrieved tunnels from', endpoint, ':', data.tunnels);
          
          // Success - break out of loop
          break;
        } catch (endpointError) {
          console.warn(`⚠️ Endpoint ${endpoint} error:`, endpointError);
          continue;
        }
      }
      
    } catch (err) {
      console.error('❌ All endpoints failed:', err);
      setError('Failed to connect to ngrok. Make sure ngrok is running on localhost:4040 or provide a valid tunnel URL.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new tunnel configuration
  const createTunnel = useCallback(async (tunnelConfig: {
    name: string;
    addr: string;
    proto: string;
    inspect?: boolean;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🚀 Creating tunnel:', tunnelConfig);
      
      const { data, error: functionError } = await supabase.functions.invoke('ngrok-webhook', {
        body: {
          action: 'create_tunnel',
          tunnel_config: tunnelConfig
        }
      });

      if (functionError) throw functionError;
      
      // Update local config
      setConfig(prev => ({
        ...prev,
        tunnels: {
          ...prev.tunnels,
          [tunnelConfig.name]: {
            addr: tunnelConfig.addr,
            proto: tunnelConfig.proto,
            inspect: tunnelConfig.inspect || true
          }
        }
      }));

      console.log('✅ Tunnel created:', data);
      
      // Refresh tunnels list
      await getTunnels();
      
    } catch (err) {
      console.error('❌ Error creating tunnel:', err);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [getTunnels]);

  // Test webhook endpoint
  const testWebhook = useCallback(async (webhookUrl: string, payload: any) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🧪 Testing webhook:', webhookUrl, payload);
      
      const { data, error: functionError } = await supabase.functions.invoke('ngrok-webhook', {
        body: {
          action: 'test_webhook',
          webhook_url: webhookUrl,
          payload
        }
      });

      if (functionError) throw functionError;
      
      console.log('✅ Webhook test result:', data);
      return data;
      
    } catch (err) {
      console.error('❌ Error testing webhook:', err);
      setError((err as Error).message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Register webhook with external service
  const registerWebhook = useCallback(async (serviceConfig: {
    service_name: string;
    webhook_url: string;
    events: string[];
    secret?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('📡 Registering webhook:', serviceConfig);
      
      const { data, error: functionError } = await supabase.functions.invoke('ngrok-webhook', {
        body: {
          action: 'register_webhook',
          service_config: serviceConfig
        }
      });

      if (functionError) throw functionError;
      
      console.log('✅ Webhook registered:', data);
      return data;
      
    } catch (err) {
      console.error('❌ Error registering webhook:', err);
      setError((err as Error).message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    tunnels,
    config,
    isLoading,
    error,
    getTunnels,
    createTunnel,
    testWebhook,
    registerWebhook,
    
    // Helper function to check if ngrok is running locally
    checkLocalNgrok: () => getTunnels('http://localhost:4040'),
    
    // Meta info
    meta: {
      hookName: 'useNgrokIntegration',
      version: 'ngrok-integration-v1.0.0',
      singleSourceValidated: true,
      supportsLocalhost: true,
      fallbackUrls: ['http://localhost:4040', 'external-url']
    }
  };
};
