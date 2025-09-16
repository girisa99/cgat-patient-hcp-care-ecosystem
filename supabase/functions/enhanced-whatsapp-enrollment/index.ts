import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, ...payload } = await req.json()
    console.log(`🤖 Enhanced WhatsApp Enrollment Action: ${action}`)

    switch (action) {
      case 'initiate_enrollment':
        return await initiateEnrollment(payload)
      case 'send_choice_menu':
        return await sendChoiceMenu(payload)
      case 'process_conversation':
        return await processConversation(payload)
      case 'sync_form_data':
        return await syncFormData(payload)
      case 'get_business_numbers':
        return await getBusinessNumbers()
      case 'get_agent_types':
        return await getAgentTypes()
      default:
        throw new Error(`Unknown action: ${action}`)
    }
  } catch (error) {
    console.error('❌ Enhanced WhatsApp Enrollment Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function initiateEnrollment(payload: any) {
  const { patientData, providerData, agentType = 'hybrid', personalityType = 'humorous_warm' } = payload
  
  // Get default business phone number
  const { data: businessNumber } = await supabase
    .from('whatsapp_business_numbers')
    .select('*')
    .eq('is_default', true)
    .eq('is_active', true)
    .single()

  if (!businessNumber) {
    throw new Error('No active business phone number configured')
  }

  // Create enrollment session
  const sessionId = crypto.randomUUID()
  const { data: session, error: sessionError } = await supabase
    .from('whatsapp_enrollment_sessions')
    .insert({
      session_id: sessionId,
      patient_phone: patientData.cellPhone,
      from_phone: businessNumber.phone_number,
      agent_type: agentType,
      enrollment_mode: 'hybrid_choice', // Let patient choose
      conversation_personality: personalityType,
      patient_data: patientData,
      provider_data: providerData,
      current_step: 'introduction'
    })
    .select()
    .single()

  if (sessionError) throw sessionError

  // Send initial choice message via Twilio
  await sendChoiceMenuToPatient(session, patientData)

  // Initialize real-time sync
  await initializeRealtimeSync(sessionId, patientData)

  return new Response(
    JSON.stringify({
      success: true,
      sessionId,
      businessNumber: businessNumber.phone_number,
      agentType,
      message: 'Enrollment initiated with choice menu sent to patient'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function sendChoiceMenuToPatient(session: any, patientData: any) {
  const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
  const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
  
  if (!twilioAccountSid || !twilioAuthToken) {
    console.warn('⚠️ Twilio credentials not configured, simulating message send')
    return
  }

  // Get conversation flow for choice offering
  const { data: flow } = await supabase
    .from('whatsapp_conversation_flows')
    .select('*')
    .eq('agent_type', 'hybrid')
    .eq('flow_stage', 'choice_offering')
    .single()

  let message = `Hi ${patientData.firstName}! 👋 I'm your AI enrollment assistant from ${session.provider_data?.treatmentCenter || 'the treatment center'}. 

🎯 Let's make your enrollment super easy! How would you like to complete it?

📱 *Option 1: WhatsApp Chat* - Continue right here with friendly conversation
📞 *Option 2: Phone Call* - I'll call you for a quick verbal enrollment  
🤝 *Option 3: Hybrid* - Mix of chat + call when needed
🎭 *Option 4: Choose Your AI Style* - Pick your preferred assistant personality

Just reply with 1, 2, 3, or 4! 

Fun fact: I'm powered by AI but I promise I'm more helpful than your phone's autocorrect! 😄`

  if (flow) {
    message = flow.prompt_template.replace('{firstName}', patientData.firstName)
    const humor = flow.humor_elements?.choices || []
    if (humor.length > 0) {
      message += `\n\n💫 ${humor[Math.floor(Math.random() * humor.length)]}`
    }
  }

  // Send via Twilio WhatsApp
  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`
  const auth = btoa(`${twilioAccountSid}:${twilioAuthToken}`)

  const formData = new URLSearchParams()
  formData.append('From', `whatsapp:${session.from_phone}`)
  formData.append('To', `whatsapp:${session.patient_phone}`)
  formData.append('Body', message)

  const response = await fetch(twilioUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formData
  })

  const result = await response.json()
  console.log('📱 WhatsApp message sent:', result.status)
}

async function sendChoiceMenu(payload: any) {
  const { sessionId } = payload
  
  const { data: session } = await supabase
    .from('whatsapp_enrollment_sessions')
    .select('*')
    .eq('session_id', sessionId)
    .single()

  if (!session) throw new Error('Session not found')

  await sendChoiceMenuToPatient(session, session.patient_data)
  
  return new Response(
    JSON.stringify({ success: true, message: 'Choice menu sent' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function processConversation(payload: any) {
  const { sessionId, userMessage, messageType = 'text' } = payload

  // Get session and conversation flows
  const { data: session } = await supabase
    .from('whatsapp_enrollment_sessions')
    .select('*')
    .eq('session_id', sessionId)
    .single()

  if (!session) throw new Error('Session not found')

  // Determine response based on user choice and current step
  let responseMessage = ''
  let nextStep = session.current_step
  let agentType = session.agent_type
  let enrollmentMode = session.enrollment_mode

  // Process user choice
  if (session.current_step === 'introduction' && ['1', '2', '3', '4'].includes(userMessage.trim())) {
    const choice = userMessage.trim()
    
    switch (choice) {
      case '1': // WhatsApp Chat
        enrollmentMode = 'whatsapp_chat'
        agentType = 'conversational'
        nextStep = 'collect_basic_info'
        responseMessage = `Perfect! 💬 Let's continue chatting here. I'll make this fun and easy!\n\nFirst, let me confirm - is your name ${session.patient_data.firstName}? And is ${session.patient_data.cellPhone} the best number to reach you? 📱`
        break
        
      case '2': // Phone Call
        enrollmentMode = 'phone_verbal'
        agentType = 'structured'
        nextStep = 'schedule_call'
        responseMessage = `Excellent choice! 📞 I'll arrange a call for you. When's a good time?\n\n⏰ *Available times:*\n- Morning (9-11 AM)\n- Afternoon (1-4 PM) \n- Evening (5-7 PM)\n\nJust reply with "morning", "afternoon", or "evening"!`
        break
        
      case '3': // Hybrid
        enrollmentMode = 'hybrid_choice'
        agentType = 'hybrid'
        nextStep = 'collect_basic_info'
        responseMessage = `Smart choice! 🤝 We'll chat here and I can call if needed for complex stuff.\n\nLet's start with the basics. I see you're ${session.patient_data.firstName} - that's a lovely name! What should I call you? (First name is fine) 😊`
        break
        
      case '4': // Choose AI Style
        nextStep = 'personality_selection'
        responseMessage = `Fun! 🎭 Pick your AI assistant style:\n\n🤗 *Friendly Professional* - Warm but efficient\n😄 *Humorous & Warm* - Jokes and encouragement (my specialty!)\n💚 *Medical Empathetic* - Gentle and understanding\n😎 *Casual Supportive* - Relaxed and encouraging\n\nReply with: friendly, humorous, medical, or casual`
        break
    }
  } else if (session.current_step === 'personality_selection') {
    const personalities = {
      'friendly': 'friendly_professional',
      'humorous': 'humorous_warm', 
      'medical': 'medical_empathetic',
      'casual': 'casual_supportive'
    }
    
    const selectedPersonality = personalities[userMessage.toLowerCase()] || 'humorous_warm'
    
    // Update session with personality
    await supabase
      .from('whatsapp_enrollment_sessions')
      .update({ conversation_personality: selectedPersonality })
      .eq('session_id', sessionId)
    
    enrollmentMode = 'whatsapp_chat'
    agentType = 'conversational'
    nextStep = 'collect_basic_info'
    responseMessage = getPersonalityResponse(selectedPersonality, session.patient_data.firstName)
  } else {
    // Handle data collection based on current step and agent type
    responseMessage = await processDataCollection(session, userMessage, messageType)
    nextStep = getNextStep(session.current_step)
  }

  // Update session
  await supabase
    .from('whatsapp_enrollment_sessions')
    .update({
      current_step: nextStep,
      agent_type: agentType,
      enrollment_mode: enrollmentMode,
      conversation_context: {
        ...session.conversation_context,
        last_message: userMessage,
        last_response: responseMessage,
        timestamp: new Date().toISOString()
      }
    })
    .eq('session_id', sessionId)

  // Send response via Twilio
  await sendTwilioMessage(session.from_phone, session.patient_phone, responseMessage)

  // Trigger real-time sync if data was collected
  if (nextStep !== session.current_step) {
    await syncCollectedData(sessionId, session.current_step, userMessage)
  }

  return new Response(
    JSON.stringify({
      success: true,
      response: responseMessage,
      nextStep,
      agentType,
      enrollmentMode
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function processDataCollection(session: any, userMessage: string, messageType: string) {
  const agentType = session.agent_type
  const step = session.current_step
  const personality = session.conversation_personality
  
  // Get appropriate conversation flow
  const { data: flow } = await supabase
    .from('whatsapp_conversation_flows')
    .select('*')
    .eq('agent_type', agentType)
    .eq('personality_type', personality)
    .eq('flow_stage', step)
    .single()

  if (flow) {
    let response = flow.prompt_template
    
    // Replace placeholders
    Object.keys(session.patient_data).forEach(key => {
      response = response.replace(`{${key}}`, session.patient_data[key] || '')
    })
    
    // Add humor elements if available
    if (flow.humor_elements && personality === 'humorous_warm') {
      const elements = Object.values(flow.humor_elements).flat()
      if (elements.length > 0) {
        const randomElement = elements[Math.floor(Math.random() * elements.length)]
        response += `\n\n😊 ${randomElement}`
      }
    }
    
    return response
  }
  
  // Fallback responses
  return getDefaultResponse(step, personality, session.patient_data.firstName)
}

function getPersonalityResponse(personality: string, firstName: string): string {
  const responses = {
    'friendly_professional': `Perfect, ${firstName}! I'll be your friendly and efficient assistant. Let's get started with your enrollment - I'll make sure everything goes smoothly! ✨`,
    'humorous_warm': `Awesome choice, ${firstName}! 😄 You picked the fun assistant! I promise to make this enrollment as entertaining as possible (while still being super helpful). Ready to have some fun with paperwork? 🎉`,
    'medical_empathetic': `Thank you, ${firstName}. I understand that medical enrollment can feel overwhelming. I'm here to guide you gently through each step, ensuring you feel comfortable and informed throughout the process. 💚`,
    'casual_supportive': `Cool choice, ${firstName}! 😎 I'm your laid-back but totally reliable assistant. We'll take this at whatever pace feels right for you. No stress, just good vibes! 🌟`
  }
  
  return responses[personality] || responses['humorous_warm']
}

async function sendTwilioMessage(from: string, to: string, message: string) {
  const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
  const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
  
  if (!twilioAccountSid || !twilioAuthToken) {
    console.log('📝 Would send message:', message)
    return
  }

  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`
  const auth = btoa(`${twilioAccountSid}:${twilioAuthToken}`)

  const formData = new URLSearchParams()
  formData.append('From', `whatsapp:${from}`)
  formData.append('To', `whatsapp:${to}`)
  formData.append('Body', message)

  await fetch(twilioUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formData
  })
}

async function initializeRealtimeSync(sessionId: string, patientData: any) {
  // Create sync records for all patient data fields
  const syncPromises = Object.entries(patientData).map(([field, value]) => 
    supabase
      .from('enrollment_real_time_sync')
      .insert({
        session_id: sessionId,
        field_name: field,
        field_value: value,
        sync_direction: 'bidirectional',
        sync_status: 'synced'
      })
  )

  await Promise.all(syncPromises)
}

async function syncCollectedData(sessionId: string, step: string, userMessage: string) {
  // Determine field based on step and update sync
  const fieldMapping = {
    'collect_basic_info': 'firstName',
    'collect_contact': 'cellPhone',
    'collect_insurance': 'medicalInsurance',
    'collect_address': 'address'
  }

  const fieldName = fieldMapping[step]
  if (fieldName) {
    await supabase
      .from('enrollment_real_time_sync')
      .insert({
        session_id: sessionId,
        field_name: fieldName,
        field_value: userMessage,
        sync_direction: 'whatsapp_to_form',
        sync_status: 'pending'
      })
  }
}

async function syncFormData(payload: any) {
  const { sessionId, formData } = payload

  // Update all form fields in sync table
  const syncPromises = Object.entries(formData).map(([field, value]) =>
    supabase
      .from('enrollment_real_time_sync')
      .upsert({
        session_id: sessionId,
        field_name: field,
        field_value: value,
        sync_direction: 'form_to_whatsapp',
        sync_status: 'synced'
      })
  )

  await Promise.all(syncPromises)

  return new Response(
    JSON.stringify({ success: true, message: 'Form data synced' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getBusinessNumbers() {
  const { data: numbers } = await supabase
    .from('whatsapp_business_numbers')
    .select('*')
    .eq('is_active', true)
    .order('is_default', { ascending: false })

  return new Response(
    JSON.stringify({ success: true, numbers }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getAgentTypes() {
  const agentTypes = [
    {
      id: 'conversational',
      name: 'Conversational AI',
      description: 'Friendly, natural conversation with adaptive responses',
      personalities: ['humorous_warm', 'friendly_professional', 'casual_supportive']
    },
    {
      id: 'structured',
      name: 'Structured Agent',
      description: 'Systematic, step-by-step data collection',
      personalities: ['friendly_professional', 'medical_empathetic']
    },
    {
      id: 'mcp_stepwise',
      name: 'MCP Stepwise Agent',
      description: 'Protocol-driven with validation checkpoints',
      personalities: ['medical_empathetic', 'friendly_professional']
    },
    {
      id: 'hybrid',
      name: 'Hybrid Agent',
      description: 'Combines multiple approaches based on patient preference',
      personalities: ['humorous_warm', 'friendly_professional', 'casual_supportive', 'medical_empathetic']
    }
  ]

  return new Response(
    JSON.stringify({ success: true, agentTypes }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

function getDefaultResponse(step: string, personality: string, firstName: string): string {
  const responses = {
    'collect_basic_info': `Thanks ${firstName}! Let's verify your information. Is your full name spelled correctly as we have it?`,
    'collect_contact': `Great! Now let's confirm your contact details. Is ${firstName} the best phone number to reach you?`,
    'collect_insurance': `Perfect! Let's talk about your insurance. What's your insurance provider?`,
    'collect_address': `Excellent! What's your current address?`
  }
  
  return responses[step] || `Thanks for that information, ${firstName}! What else can I help you with?`
}

function getNextStep(currentStep: string): string {
  const stepFlow = {
    'introduction': 'collect_basic_info',
    'personality_selection': 'collect_basic_info',
    'collect_basic_info': 'collect_contact',
    'collect_contact': 'collect_insurance',
    'collect_insurance': 'collect_address',
    'collect_address': 'consent_collection',
    'consent_collection': 'completed'
  }
  
  return stepFlow[currentStep] || 'completed'
}