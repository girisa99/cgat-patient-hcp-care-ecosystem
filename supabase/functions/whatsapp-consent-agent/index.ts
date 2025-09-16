import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConsentSession {
  id: string;
  enrollment_id?: string;
  phone_number: string;
  location_type: 'facility' | 'remote' | 'caregiver';
  consent_method: 'whatsapp_chat' | 'whatsapp_voice' | 'verbal_phone';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  session_data: any;
}

interface PatientConsentData {
  name?: string;
  email?: string;
  phone?: string;
  consent_given?: boolean;
  consent_type?: string;
  signature_alternative?: string;
  caregiver_info?: any;
}

async function createConsentSession(payload: any, supabase: any) {
  const { sessionData } = payload;
  
  console.log('Creating consent session:', sessionData);
  
  const { data: session, error: sessionError } = await supabase
    .from('whatsapp_consent_sessions')
    .insert(sessionData)
    .select()
    .single();

  if (sessionError) throw sessionError;

  return new Response(
    JSON.stringify({ 
      success: true, 
      data: session,
      message: 'Session created successfully'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, ...payload } = await req.json();

    console.log('WhatsApp Consent Agent - Action:', action, 'Payload:', payload);

    switch (action) {
      case 'create_session':
        return await createConsentSession(payload, supabase);
      case 'initiate_consent':
        return await initiateConsentProcess(payload, supabase);
      case 'process_message':
        return await processWhatsAppMessage(payload, supabase);
      case 'handle_voice':
        return await handleVoiceConsent(payload, supabase);
      case 'complete_consent':
        return await completeConsentProcess(payload, supabase);
      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('WhatsApp Consent Agent error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});

async function initiateConsentProcess(payload: any, supabase: any) {
  const { phone_number, session_id, location_type, consent_method, n8n_webhook } = payload;

  console.log('Initiating consent process for:', phone_number);

  // Create or update session
  const { data: session, error: sessionError } = await supabase
    .from('whatsapp_consent_sessions')
    .upsert({
      id: session_id || crypto.randomUUID(),
      phone_number,
      location_type,
      consent_method,
      status: 'in_progress',
      session_data: {
        initiated_at: new Date().toISOString(),
        location_context: getLocationContext(location_type),
        n8n_webhook
      }
    })
    .select()
    .single();

  if (sessionError) throw sessionError;

  // Send initial WhatsApp message
  const initialMessage = generateInitialMessage(location_type, consent_method);
  await sendWhatsAppMessage(phone_number, initialMessage);

  // Trigger n8n workflow if provided
  if (n8n_webhook) {
    await triggerN8nWorkflow(n8n_webhook, {
      event: 'consent_initiated',
      session_id,
      phone_number,
      location_type,
      timestamp: new Date().toISOString()
    });
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      session,
      message: 'Consent process initiated successfully'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function processWhatsAppMessage(payload: any, supabase: any) {
  const { message, phone_number, session_id } = payload;

  console.log('Processing WhatsApp message:', message, 'for session:', session_id);

  // Get current session
  const { data: session, error: sessionError } = await supabase
    .from('whatsapp_consent_sessions')
    .select('*')
    .eq('id', session_id)
    .single();

  if (sessionError) throw sessionError;

  // Process message with AI to extract patient information
  const extractedData = await extractPatientInfo(message, session.session_data?.current_step || 'greeting');
  
  // Update session with new information
  const updatedSessionData = {
    ...session.session_data,
    conversation_history: [...(session.session_data.conversation_history || []), {
      timestamp: new Date().toISOString(),
      message,
      extracted_data: extractedData
    }],
    patient_info: {
      ...session.session_data.patient_info,
      ...extractedData.patient_info
    }
  };

  await supabase
    .from('whatsapp_consent_sessions')
    .update({
      session_data: updatedSessionData
    })
    .eq('id', session_id);

  // Generate next response
  const nextResponse = generateNextResponse(extractedData, session);
  
  if (nextResponse.message) {
    await sendWhatsAppMessage(phone_number, nextResponse.message);
  }

  // Check if consent is complete
  if (nextResponse.consent_complete) {
    await completeConsentProcess({ session_id }, supabase);
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      next_step: nextResponse.next_step,
      consent_complete: nextResponse.consent_complete
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleVoiceConsent(payload: any, supabase: any) {
  const { voice_data, session_id } = payload;

  console.log('Handling voice consent for session:', session_id);

  // Process voice data (this would integrate with speech-to-text)
  const transcription = await processVoiceData(voice_data);
  
  // Extract consent information from transcription
  const consentData = await extractConsentFromTranscription(transcription);

  // Update session
  await supabase
    .from('whatsapp_consent_sessions')
    .update({
      session_data: {
        voice_consent: {
          transcription,
          consent_given: consentData.consent_given,
          timestamp: new Date().toISOString()
        }
      }
    })
    .eq('id', session_id);

  return new Response(
    JSON.stringify({ 
      success: true, 
      consent_data: consentData,
      transcription 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function completeConsentProcess(payload: any, supabase: any) {
  const { session_id } = payload;

  console.log('Completing consent process for session:', session_id);

  // Get session data
  const { data: session, error: sessionError } = await supabase
    .from('whatsapp_consent_sessions')
    .select('*')
    .eq('id', session_id)
    .single();

  if (sessionError) throw sessionError;

  // Create enrollment consent record
  const consentData = {
    enrollment_id: session.enrollment_id,
    consent_type: 'whatsapp_digital',
    consent_method: session.consent_method,
    consent_given: true,
    consent_date: new Date().toISOString(),
    patient_signature: session.session_data?.signature_alternative || 'Verbal consent via WhatsApp',
    location_type: session.location_type,
    session_data: session.session_data
  };

  const { error: consentError } = await supabase
    .from('enrollment_consent')
    .insert(consentData);

  if (consentError) throw consentError;

  // Create patient info record if not exists
  const patientInfo = session.session_data?.patient_info;
  if (patientInfo) {
    await supabase
      .from('enrollment_patient_info')
      .upsert({
        enrollment_id: session.enrollment_id,
        ...patientInfo,
        collection_method: 'whatsapp_agent'
      });
  }

  // Update session status
  await supabase
    .from('whatsapp_consent_sessions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString()
    })
    .eq('id', session_id);

  // Send completion confirmation
  await sendWhatsAppMessage(session.phone_number, 
    "✅ Thank you! Your patient enrollment and consent process is now complete. You'll receive a confirmation shortly with next steps."
  );

  // Trigger n8n completion workflow
  if (session.session_data?.n8n_webhook) {
    await triggerN8nWorkflow(session.session_data.n8n_webhook, {
      event: 'consent_completed',
      session_id,
      enrollment_id: session.enrollment_id,
      patient_info: patientInfo,
      timestamp: new Date().toISOString()
    });
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Consent process completed successfully',
      consent_data: consentData
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function getLocationContext(location_type: string) {
  const contexts = {
    facility: {
      greeting: "Hello! I'm your healthcare enrollment assistant at the facility. I'll help you complete your patient enrollment and consent process.",
      verification_level: 'in_person',
      signature_method: 'digital_tablet'
    },
    remote: {
      greeting: "Hello! I'm your virtual healthcare enrollment assistant. I'll guide you through the patient enrollment from your location.",
      verification_level: 'remote_identity',
      signature_method: 'voice_confirmation'
    },
    caregiver: {
      greeting: "Hello! I understand you're helping with patient enrollment as a caregiver. I'll guide you through the consent process.",
      verification_level: 'caregiver_verification',
      signature_method: 'verbal_consent'
    }
  };
  return contexts[location_type] || contexts.remote;
}

function generateInitialMessage(location_type: string, consent_method: string) {
  const context = getLocationContext(location_type);
  let message = context.greeting + "\n\n";
  
  if (consent_method === 'whatsapp_voice') {
    message += "I can accept voice messages - feel free to speak your responses or type them.\n\n";
  }
  
  message += "To get started, please provide:\n";
  message += "1. Patient's full name\n";
  message += "2. Date of birth (MM/DD/YYYY)\n";
  message += "3. Phone number\n";
  message += "4. Email address\n\n";
  message += "Type 'START' when you're ready to begin, or send me the information above.";
  
  return message;
}

async function extractPatientInfo(message: string, current_step: string) {
  // This would use AI/NLP to extract structured data from the message
  // For now, using simple pattern matching
  
  const extractedData: any = {
    patient_info: {},
    consent_info: {},
    next_step: current_step
  };

  // Extract name patterns
  const nameMatch = message.match(/name[:\s]*([a-zA-Z\s]+)/i);
  if (nameMatch) {
    extractedData.patient_info.name = nameMatch[1].trim();
  }

  // Extract phone patterns
  const phoneMatch = message.match(/phone[:\s]*([0-9\-\(\)\s]+)/i);
  if (phoneMatch) {
    extractedData.patient_info.phone = phoneMatch[1].trim();
  }

  // Extract email patterns
  const emailMatch = message.match(/email[:\s]*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
  if (emailMatch) {
    extractedData.patient_info.email = emailMatch[1].trim();
  }

  // Extract consent keywords
  if (message.toLowerCase().includes('consent') || message.toLowerCase().includes('agree')) {
    extractedData.consent_info.consent_given = true;
  }

  return extractedData;
}

function generateNextResponse(extractedData: any, session: any) {
  const patientInfo = session.session_data?.patient_info || {};
  const hasName = patientInfo.name || extractedData.patient_info.name;
  const hasPhone = patientInfo.phone || extractedData.patient_info.phone;
  const hasEmail = patientInfo.email || extractedData.patient_info.email;

  if (!hasName || !hasPhone || !hasEmail) {
    return {
      message: `Thank you for the information! I still need:\n${!hasName ? '• Patient full name\n' : ''}${!hasPhone ? '• Phone number\n' : ''}${!hasEmail ? '• Email address\n' : ''}Please provide the missing information.`,
      next_step: 'collect_info',
      consent_complete: false
    };
  }

  if (!extractedData.consent_info?.consent_given) {
    return {
      message: `Perfect! I have:\n• Name: ${hasName}\n• Phone: ${hasPhone}\n• Email: ${hasEmail}\n\nNow I need your consent for treatment and data processing. Do you agree to:\n1. Receive medical treatment as prescribed\n2. Allow us to process your health information\n3. Share information with your healthcare providers as needed\n\nPlease reply "I AGREE" to provide your consent.`,
      next_step: 'collect_consent',
      consent_complete: false
    };
  }

  return {
    message: `Excellent! Your consent has been recorded. I'm now processing your enrollment information and will send you a confirmation shortly.`,
    next_step: 'completed',
    consent_complete: true
  };
}

async function sendWhatsAppMessage(phoneNumber: string, message: string) {
  console.log('Sending WhatsApp message to:', phoneNumber);
  
  try {
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      console.error('Missing Twilio credentials');
      return;
    }

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: `whatsapp:${twilioPhoneNumber}`,
        To: `whatsapp:${phoneNumber}`,
        Body: message,
      }),
    });

    if (!response.ok) {
      throw new Error(`Twilio API error: ${response.statusText}`);
    }

    console.log('WhatsApp message sent successfully');
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
  }
}

async function processVoiceData(voiceData: any) {
  // Placeholder for voice processing - would integrate with speech-to-text service
  return "Voice transcription would be processed here";
}

async function extractConsentFromTranscription(transcription: string) {
  // Extract consent from voice transcription
  const consentKeywords = ['agree', 'consent', 'yes', 'accept', 'confirm'];
  const consent_given = consentKeywords.some(keyword => 
    transcription.toLowerCase().includes(keyword)
  );

  return { consent_given };
}

async function triggerN8nWorkflow(webhookUrl: string, data: any) {
  try {
    console.log('Triggering n8n workflow:', webhookUrl);
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`n8n webhook error: ${response.statusText}`);
    }

    console.log('n8n workflow triggered successfully');
  } catch (error) {
    console.error('Failed to trigger n8n workflow:', error);
  }
}