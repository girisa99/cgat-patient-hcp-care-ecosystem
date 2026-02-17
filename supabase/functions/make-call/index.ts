import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MakeCallRequest {
  phoneNumberId: string;
  destinationNumber: string;
  agentId?: string;
  voiceProviderId?: string;
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

    const { phoneNumberId, destinationNumber, agentId, voiceProviderId }: MakeCallRequest = await req.json();

    if (!phoneNumberId || !destinationNumber) {
      return new Response(
        JSON.stringify({ error: 'Phone number ID and destination number are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get phone number details
    const { data: phoneNumber, error: phoneError } = await supabase
      .from('phone_numbers')
      .select('*')
      .eq('id', phoneNumberId)
      .single();

    if (phoneError || !phoneNumber) {
      return new Response(
        JSON.stringify({ error: 'Phone number not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate unique session ID
    const sessionId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create call session record
    const { data: callSession, error: sessionError } = await supabase
      .from('call_sessions')
      .insert({
        session_id: sessionId,
        phone_number_id: phoneNumberId,
        agent_id: agentId,
        callee_number: destinationNumber,
        caller_number: phoneNumber.phone_number,
        call_direction: 'outbound',
        call_status: 'initiated',
        voice_provider_id: voiceProviderId,
        metadata: {
          provider_type: phoneNumber.provider_type,
          initiation_time: new Date().toISOString(),
          test_call: phoneNumber.provider_type === 'test_number'
        }
      })
      .select()
      .single();

    if (sessionError) {
      throw sessionError;
    }

    let callResult;

    // Handle different provider types
    switch (phoneNumber.provider_type) {
      case 'test_number':
        callResult = await handleTestCall(phoneNumber, destinationNumber, sessionId);
        break;
      case 'twilio':
        callResult = await handleTwilioCall(phoneNumber, destinationNumber, sessionId);
        break;
      case 'google_cx':
        callResult = await handleGoogleCXCall(phoneNumber, destinationNumber, sessionId);
        break;
      default:
        callResult = await simulateCall(phoneNumber, destinationNumber, sessionId);
        break;
    }

    // Update call session with provider response
    await supabase
      .from('call_sessions')
      .update({
        call_status: callResult.success ? 'ringing' : 'failed',
        provider_call_sid: callResult.providerCallId,
        metadata: {
          ...callSession.metadata,
          provider_response: callResult,
          call_setup_duration_ms: Date.now() - new Date(callSession.created_at).getTime()
        }
      })
      .eq('id', callSession.id);

    // If it's a test call, simulate the call progression
    if (phoneNumber.provider_type === 'test_number') {
      setTimeout(() => simulateCallProgression(supabase, callSession.id), 2000);
    }

    return new Response(
      JSON.stringify({
        success: true,
        callSession,
        providerResponse: callResult,
        sessionId
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Make call error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function handleTestCall(phoneNumber: any, destinationNumber: string, sessionId: string) {
  console.log(`Test call initiated from ${phoneNumber.phone_number} to ${destinationNumber}`);
  
  return {
    success: true,
    providerCallId: `test_${sessionId}`,
    status: 'ringing',
    message: 'Test call initiated successfully',
    estimated_connection_time: 3000
  };
}

async function handleTwilioCall(phoneNumber: any, destinationNumber: string, sessionId: string) {
  // This would integrate with Twilio's API
  console.log(`Twilio call initiated from ${phoneNumber.phone_number} to ${destinationNumber}`);
  
  // Simulate Twilio API call
  return {
    success: true,
    providerCallId: `TW${Math.random().toString(36).substr(2, 16)}`,
    status: 'initiated',
    message: 'Twilio call initiated successfully'
  };
}

async function handleGoogleCXCall(phoneNumber: any, destinationNumber: string, sessionId: string) {
  // This would integrate with Google CX API
  console.log(`Google CX call initiated from ${phoneNumber.phone_number} to ${destinationNumber}`);
  
  return {
    success: true,
    providerCallId: `GCX${Math.random().toString(36).substr(2, 16)}`,
    status: 'initiated',
    message: 'Google CX call initiated successfully'
  };
}

async function simulateCall(phoneNumber: any, destinationNumber: string, sessionId: string) {
  // Generic simulation for other providers
  console.log(`Simulated call initiated from ${phoneNumber.phone_number} to ${destinationNumber}`);
  
  return {
    success: true,
    providerCallId: `SIM${Math.random().toString(36).substr(2, 16)}`,
    status: 'simulated',
    message: 'Simulated call initiated successfully'
  };
}

async function simulateCallProgression(supabase: any, callSessionId: string) {
  try {
    // Simulate call being answered after 3 seconds
    setTimeout(async () => {
      await supabase
        .from('call_sessions')
        .update({
          call_status: 'answered',
          metadata: {
            answered_at: new Date().toISOString(),
            simulation: true
          }
        })
        .eq('id', callSessionId);
      
      // Start generating sample transcriptions
      generateSampleTranscriptions(supabase, callSessionId);
    }, 3000);
    
  } catch (error) {
    console.error('Error simulating call progression:', error);
  }
}

async function generateSampleTranscriptions(supabase: any, callSessionId: string) {
  const sampleTranscriptions = [
    { speaker: 'caller', text: 'Hello, this is a test call from the softphone system.' },
    { speaker: 'agent', text: 'Hello! I can hear you clearly. This is the AI agent responding.' },
    { speaker: 'caller', text: 'Great! The transcription seems to be working well.' },
    { speaker: 'agent', text: 'Yes, I can see the real-time transcription is functioning properly. How can I assist you today?' },
    { speaker: 'caller', text: 'I\'m testing the multi-provider integration capabilities.' },
    { speaker: 'agent', text: 'Excellent! The system supports Twilio, ElevenLabs, OpenAI, Hugging Face, and Google CX providers.' }
  ];

  for (let i = 0; i < sampleTranscriptions.length; i++) {
    setTimeout(async () => {
      try {
        await supabase
          .from('call_transcriptions')
          .insert({
            call_session_id: callSessionId,
            speaker_type: sampleTranscriptions[i].speaker,
            transcript_text: sampleTranscriptions[i].text,
            confidence_score: 0.95 + (Math.random() * 0.05),
            timestamp_offset: (i + 1) * 5000, // 5 seconds apart
            language_code: 'en-US',
            provider_used: 'test_transcription'
          });
      } catch (error) {
        console.error('Error inserting transcription:', error);
      }
    }, (i + 1) * 5000);
  }

  // End the call after all transcriptions
  setTimeout(async () => {
    const endTime = new Date();
    const { data: session } = await supabase
      .from('call_sessions')
      .select('start_time')
      .eq('id', callSessionId)
      .single();
    
    if (session) {
      const duration = Math.floor((endTime.getTime() - new Date(session.start_time).getTime()) / 1000);
      
      await supabase
        .from('call_sessions')
        .update({
          call_status: 'ended',
          end_time: endTime.toISOString(),
          duration_seconds: duration
        })
        .eq('id', callSessionId);
    }
  }, (sampleTranscriptions.length + 2) * 5000);
}