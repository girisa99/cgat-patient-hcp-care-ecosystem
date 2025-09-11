import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { faxData, action, voiceInstructions, agentType } = await req.json()

    console.log(`Processing fax with voice for agent type: ${agentType}, action: ${action}`)

    let result: any = {}

    switch (action) {
      case 'ocr_and_speak':
        // OCR fax content and convert to speech
        result = await ocrFaxAndSpeak(faxData, agentType)
        break
        
      case 'voice_dictation':
        // Create fax content from voice dictation
        result = await createFaxFromVoice(voiceInstructions, agentType)
        break
        
      case 'fax_status_announcement':
        // Announce fax status via voice
        result = await announceFaxStatus(faxData, agentType)
        break
        
      default:
        throw new Error(`Unknown fax action: ${action}`)
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing fax with voice:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

async function ocrFaxAndSpeak(faxData: string, agentType: string) {
  console.log('Performing OCR on fax and converting to speech')
  
  // Simulate OCR processing (in real implementation, use OCR service)
  const ocrText = `
    Fax received from: Medical Center
    Date: ${new Date().toLocaleDateString()}
    Subject: Patient Enrollment Form
    
    Patient Name: John Doe
    Date of Birth: January 15, 1980
    Phone: (555) 123-4567
    Address: 123 Main Street, Anytown, USA
    
    Medical Information:
    - Primary Care Physician: Dr. Smith
    - Insurance Provider: Health Plus
    - Policy Number: HP123456789
    
    Please process this enrollment as priority.
  `
  
  // Convert OCR text to speech
  const speechResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/elevenlabs-voice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
    },
    body: JSON.stringify({
      text: ocrText,
      agentType,
      voice: 'Charlie' // Fax-specific voice
    })
  })

  const speechResult = await speechResponse.json()

  return {
    ocrText,
    audioContent: speechResult.audioContent,
    confidence: 0.95,
    agentType,
    processedAt: new Date().toISOString()
  }
}

async function createFaxFromVoice(voiceInstructions: string, agentType: string) {
  console.log('Creating fax content from voice dictation')
  
  // Convert voice to text
  const transcriptionResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/huggingface-speech`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
    },
    body: JSON.stringify({
      audio: voiceInstructions,
      agentType: 'fax'
    })
  })

  const transcription = await transcriptionResponse.json()
  
  // Structure the dictated content into fax format
  const faxContent = formatVoiceDictationToFax(transcription.text)
  
  // Generate confirmation
  const confirmationText = `I've created your fax with the following content: ${faxContent.subject}. The fax is ready to send. Would you like me to proceed?`
  
  const confirmationResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/elevenlabs-voice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
    },
    body: JSON.stringify({
      text: confirmationText,
      agentType,
      voice: 'Charlie'
    })
  })

  const confirmation = await confirmationResponse.json()

  return {
    transcription: transcription.text,
    faxContent,
    confirmationAudio: confirmation.audioContent,
    readyToSend: true,
    agentType
  }
}

async function announceFaxStatus(faxData: string, agentType: string) {
  console.log('Announcing fax status via voice')
  
  // Simulate fax status check
  const status = {
    id: 'FAX-' + Date.now(),
    status: 'completed',
    sentAt: new Date().toISOString(),
    pages: 3,
    recipient: 'Medical Center'
  }
  
  const statusText = `Fax ${status.id} has been ${status.status}. Sent ${status.pages} pages to ${status.recipient} at ${new Date(status.sentAt).toLocaleTimeString()}.`
  
  const statusResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/elevenlabs-voice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
    },
    body: JSON.stringify({
      text: statusText,
      agentType,
      voice: 'Charlie'
    })
  })

  const statusAudio = await statusResponse.json()

  return {
    status,
    statusText,
    statusAudio: statusAudio.audioContent,
    agentType
  }
}

function formatVoiceDictationToFax(dictation: string): any {
  // Parse dictation into structured fax content
  const faxContent = {
    to: extractField(dictation, 'to', 'send to'),
    from: extractField(dictation, 'from', 'from'),
    subject: extractField(dictation, 'subject', 'regarding'),
    message: dictation,
    priority: dictation.toLowerCase().includes('urgent') ? 'high' : 'normal',
    createdAt: new Date().toISOString()
  }
  
  return faxContent
}

function extractField(text: string, ...patterns: string[]): string {
  for (const pattern of patterns) {
    const regex = new RegExp(`${pattern}:?\\s*([^.\\n]+)`, 'i')
    const match = text.match(regex)
    if (match) return match[1].trim()
  }
  return ''
}