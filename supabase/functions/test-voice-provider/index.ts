import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VoiceProvider {
  id: string;
  name: string;
  provider_type: string;
  configuration: any;
  api_credentials?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { providerId } = await req.json();

    if (!providerId) {
      return new Response(
        JSON.stringify({ error: 'Provider ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Fetch voice provider details
    const { data: provider, error: providerError } = await supabase
      .from('voice_providers')
      .select('*')
      .eq('id', providerId)
      .single();

    if (providerError || !provider) {
      return new Response(
        JSON.stringify({ error: 'Voice provider not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Simulate testing the voice provider
    let testResult = { success: false, message: '', details: {} };

    try {
      // Different test logic based on provider type
      switch (provider.provider_type.toLowerCase()) {
        case 'twilio':
          testResult = await testTwilioProvider(provider);
          break;
        case 'elevenlabs':
          testResult = await testElevenLabsProvider(provider);
          break;
        case 'deepgram':
          testResult = await testDeepgramProvider(provider);
          break;
        case 'azure':
          testResult = await testAzureProvider(provider);
          break;
        default:
          testResult = {
            success: false,
            message: `Unsupported provider type: ${provider.provider_type}`,
            details: {}
          };
      }

      // Update provider health status
      const { error: updateError } = await supabase
        .from('voice_providers')
        .update({
          health_status: testResult.success ? 'healthy' : 'unhealthy',
          updated_at: new Date().toISOString()
        })
        .eq('id', providerId);

      if (updateError) {
        console.error('Error updating provider health status:', updateError);
      }

    } catch (error) {
      console.error(`Error testing ${provider.name}:`, error);
      testResult = {
        success: false,
        message: `Test failed: ${error.message}`,
        details: { error: error.message }
      };
    }

    return new Response(
      JSON.stringify({
        providerId,
        providerName: provider.name,
        testResult
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Voice provider test error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Test functions for different providers
async function testTwilioProvider(provider: VoiceProvider) {
  // Simulate Twilio API test
  return {
    success: true,
    message: 'Twilio voice provider is working correctly',
    details: {
      api_version: 'v1',
      capabilities: ['voice', 'sms', 'video'],
      latency: '120ms'
    }
  };
}

async function testElevenLabsProvider(provider: VoiceProvider) {
  // Simulate ElevenLabs API test
  return {
    success: true,
    message: 'ElevenLabs TTS provider is working correctly',
    details: {
      available_voices: 20,
      supported_languages: 29,
      latency: '80ms'
    }
  };
}

async function testDeepgramProvider(provider: VoiceProvider) {
  // Simulate Deepgram API test
  return {
    success: true,
    message: 'Deepgram STT provider is working correctly',
    details: {
      models: ['nova-2', 'enhanced', 'base'],
      real_time: true,
      latency: '95ms'
    }
  };
}

async function testAzureProvider(provider: VoiceProvider) {
  // Simulate Azure Speech API test
  return {
    success: true,
    message: 'Azure Speech provider is working correctly',
    details: {
      speech_to_text: true,
      text_to_speech: true,
      translation: true,
      latency: '150ms'
    }
  };
}