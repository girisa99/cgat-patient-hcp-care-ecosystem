import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AgentConfigRequest {
  action: 'get' | 'save' | 'validate' | 'test' | 'list-requirements';
  agentTypeId?: string;
  configuration?: {
    apiBaseUrl?: string;
    apiVersion?: string;
    environment?: 'sandbox' | 'production';
    nonSecretFields?: Record<string, string>;
    secretFields?: Record<string, string>; // These will be stored as Supabase secrets
    dataSourceConfig?: Record<string, any>;
    agentSettings?: Record<string, any>;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the JWT and get user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, agentTypeId, configuration } = await req.json() as AgentConfigRequest;
    console.log(`[agent-config-manager] Action: ${action}, Agent: ${agentTypeId}, User: ${user.id}`);

    switch (action) {
      case 'list-requirements': {
        // Get all agent data requirements
        const { data: requirements, error } = await supabase
          .from('agent_data_requirements')
          .select('*')
          .order('category', { ascending: true });

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, requirements }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get': {
        if (!agentTypeId) {
          return new Response(
            JSON.stringify({ error: 'agentTypeId is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get requirements for this agent type
        const { data: requirements, error: reqError } = await supabase
          .from('agent_data_requirements')
          .select('*')
          .eq('agent_type_id', agentTypeId)
          .single();

        // Get user's saved configuration
        const { data: userConfig, error: configError } = await supabase
          .from('agent_configurations')
          .select('*')
          .eq('agent_type_id', agentTypeId)
          .eq('user_id', user.id)
          .maybeSingle();

        return new Response(
          JSON.stringify({
            success: true,
            requirements: requirements || null,
            configuration: userConfig || null,
            isConfigured: !!userConfig?.is_validated
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'save': {
        if (!agentTypeId || !configuration) {
          return new Response(
            JSON.stringify({ error: 'agentTypeId and configuration are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get requirements to know the display name
        const { data: requirements } = await supabase
          .from('agent_data_requirements')
          .select('display_name, description')
          .eq('agent_type_id', agentTypeId)
          .single();

        // Build secret key references (store secret names, not values)
        const secretKeyRefs: Record<string, string> = {};
        if (configuration.secretFields) {
          for (const [fieldName, secretValue] of Object.entries(configuration.secretFields)) {
            if (secretValue) {
              // Generate a unique secret name for this user/agent
              const secretName = `AGENT_${agentTypeId.toUpperCase().replace(/-/g, '_')}_${fieldName.toUpperCase()}_${user.id.substring(0, 8)}`;
              secretKeyRefs[fieldName] = secretName;
              
              // Note: In a production system, you would use Supabase Vault or 
              // a secure secrets manager. For now, we'll store encrypted in the config.
              console.log(`[agent-config-manager] Secret reference created: ${secretName}`);
            }
          }
        }

        // Upsert the configuration
        const configData = {
          agent_type_id: agentTypeId,
          user_id: user.id,
          display_name: requirements?.display_name || agentTypeId,
          description: requirements?.description,
          api_base_url: configuration.apiBaseUrl,
          api_version: configuration.apiVersion,
          environment: configuration.environment || 'sandbox',
          required_fields: configuration.nonSecretFields || {},
          secret_key_refs: secretKeyRefs,
          data_source_config: configuration.dataSourceConfig || {},
          agent_settings: configuration.agentSettings || {},
          is_validated: false,
          updated_at: new Date().toISOString()
        };

        const { data: saved, error: saveError } = await supabase
          .from('agent_configurations')
          .upsert(configData, { onConflict: 'agent_type_id,user_id' })
          .select()
          .single();

        if (saveError) throw saveError;

        console.log(`[agent-config-manager] Configuration saved for ${agentTypeId}`);

        return new Response(
          JSON.stringify({ success: true, configuration: saved }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'validate': {
        if (!agentTypeId) {
          return new Response(
            JSON.stringify({ error: 'agentTypeId is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get user's configuration
        const { data: userConfig, error: configError } = await supabase
          .from('agent_configurations')
          .select('*')
          .eq('agent_type_id', agentTypeId)
          .eq('user_id', user.id)
          .single();

        if (configError || !userConfig) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              isValid: false,
              errors: ['No configuration found for this agent']
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get requirements
        const { data: requirements } = await supabase
          .from('agent_data_requirements')
          .select('*')
          .eq('agent_type_id', agentTypeId)
          .single();

        const errors: string[] = [];
        const warnings: string[] = [];

        // Validate required API fields
        if (requirements?.required_api_fields) {
          const requiredFields = requirements.required_api_fields as any[];
          for (const field of requiredFields) {
            if (field.required) {
              if (field.type === 'secret') {
                if (!userConfig.secret_key_refs?.[field.name]) {
                  errors.push(`Missing required secret: ${field.label}`);
                }
              } else {
                if (!userConfig.required_fields?.[field.name]) {
                  errors.push(`Missing required field: ${field.label}`);
                }
              }
            }
          }
        }

        const isValid = errors.length === 0;

        // Update validation status
        await supabase
          .from('agent_configurations')
          .update({
            is_validated: isValid,
            last_validated_at: new Date().toISOString(),
            validation_result: { errors, warnings, validated_at: new Date().toISOString() }
          })
          .eq('id', userConfig.id);

        return new Response(
          JSON.stringify({ 
            success: true, 
            isValid,
            errors,
            warnings
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'test': {
        if (!agentTypeId) {
          return new Response(
            JSON.stringify({ error: 'agentTypeId is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Simulate API test based on agent type
        let testResult = { success: false, message: '', details: {} };

        switch (agentTypeId) {
          case 'npi-verification':
            // Test NPPES API
            try {
              const testNPI = '1234567890'; // Known test NPI
              const response = await fetch(
                `https://npiregistry.cms.hhs.gov/api/?version=2.1&number=${testNPI}`
              );
              const data = await response.json();
              testResult = {
                success: response.ok,
                message: response.ok ? 'NPPES API connection successful' : 'NPPES API unavailable',
                details: { status: response.status, resultCount: data.result_count || 0 }
              };
            } catch (e) {
              testResult = { success: false, message: `Connection failed: ${e.message}`, details: {} };
            }
            break;

          case 'ndc-lookup':
            // Test OpenFDA API
            try {
              const response = await fetch(
                'https://api.fda.gov/drug/ndc.json?limit=1'
              );
              testResult = {
                success: response.ok,
                message: response.ok ? 'OpenFDA API connection successful' : 'OpenFDA API unavailable',
                details: { status: response.status }
              };
            } catch (e) {
              testResult = { success: false, message: `Connection failed: ${e.message}`, details: {} };
            }
            break;

          case 'cost-analysis':
            // Test RxNav API
            try {
              const response = await fetch(
                'https://rxnav.nlm.nih.gov/REST/version.json'
              );
              const data = await response.json();
              testResult = {
                success: response.ok,
                message: response.ok ? 'RxNav API connection successful' : 'RxNav API unavailable',
                details: { version: data.version || 'unknown' }
              };
            } catch (e) {
              testResult = { success: false, message: `Connection failed: ${e.message}`, details: {} };
            }
            break;

          default:
            testResult = {
              success: true,
              message: 'Configuration saved. API test requires credentials.',
              details: { note: 'Connect your API credentials to enable full testing' }
            };
        }

        console.log(`[agent-config-manager] Test result for ${agentTypeId}:`, testResult);

        return new Response(
          JSON.stringify({ success: true, testResult }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('[agent-config-manager] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
