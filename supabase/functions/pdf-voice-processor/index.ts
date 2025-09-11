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
    const { pdfData, action, voiceCommands, agentType } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    console.log(`Processing PDF with voice for agent type: ${agentType}, action: ${action}`)

    let result: any = {}

    switch (action) {
      case 'extract_text':
        // Extract text from PDF and convert to speech
        result = await extractAndSpeak(pdfData, agentType)
        break
        
      case 'fill_form':
        // Fill PDF form using voice commands
        result = await fillPDFWithVoice(pdfData, voiceCommands, agentType)
        break
        
      case 'voice_navigation':
        // Navigate PDF using voice commands
        result = await navigatePDFWithVoice(pdfData, voiceCommands, agentType)
        break
        
      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing PDF with voice:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

async function extractAndSpeak(pdfData: string, agentType: string) {
  console.log('Extracting text from PDF for voice conversion')
  
  // Simulate PDF text extraction (in real implementation, use PDF parsing library)
  const extractedText = "This is extracted text from the PDF document that can be converted to speech."
  
  // Convert to speech using ElevenLabs
  const speechResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/elevenlabs-voice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
    },
    body: JSON.stringify({
      text: extractedText,
      agentType,
      voice: getVoiceForPDF(agentType)
    })
  })

  const speechResult = await speechResponse.json()

  return {
    extractedText,
    audioContent: speechResult.audioContent,
    voice: speechResult.voice,
    agentType
  }
}

async function fillPDFWithVoice(pdfData: string, voiceCommands: string, agentType: string) {
  console.log('Filling PDF form using voice commands')
  
  // Convert voice to text first
  const transcriptionResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/huggingface-speech`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
    },
    body: JSON.stringify({
      audio: voiceCommands,
      agentType
    })
  })

  const transcription = await transcriptionResponse.json()
  
  // Parse voice commands to extract form field values
  const formData = parseVoiceCommandsToFormData(transcription.text)
  
  // Generate confirmation speech
  const confirmationText = `I've filled the following fields: ${Object.keys(formData).join(', ')}. Please confirm if this is correct.`
  
  const confirmationResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/elevenlabs-voice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
    },
    body: JSON.stringify({
      text: confirmationText,
      agentType,
      voice: getVoiceForPDF(agentType)
    })
  })

  const confirmation = await confirmationResponse.json()

  return {
    transcription: transcription.text,
    formData,
    confirmationAudio: confirmation.audioContent,
    filledPDF: pdfData, // In real implementation, fill the actual PDF
    agentType
  }
}

async function navigatePDFWithVoice(pdfData: string, voiceCommands: string, agentType: string) {
  console.log('Navigating PDF using voice commands')
  
  // Convert voice to text
  const transcriptionResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/huggingface-speech`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
    },
    body: JSON.stringify({
      audio: voiceCommands,
      agentType
    })
  })

  const transcription = await transcriptionResponse.json()
  
  // Parse navigation commands
  const navigationAction = parseNavigationCommands(transcription.text)
  
  // Generate navigation feedback
  const feedbackText = `Navigating to ${navigationAction.target}. Current page: ${navigationAction.page}`
  
  const feedbackResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/elevenlabs-voice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
    },
    body: JSON.stringify({
      text: feedbackText,
      agentType,
      voice: getVoiceForPDF(agentType)
    })
  })

  const feedback = await feedbackResponse.json()

  return {
    transcription: transcription.text,
    navigationAction,
    feedbackAudio: feedback.audioContent,
    agentType
  }
}

function getVoiceForPDF(agentType: string): string {
  switch (agentType) {
    case 'pdf': return 'Jessica'
    case 'fax': return 'Charlie'
    default: return 'Laura'
  }
}

function parseVoiceCommandsToFormData(text: string): Record<string, string> {
  // Simple parsing logic - in real implementation, use NLP
  const formData: Record<string, string> = {}
  
  // Extract name
  const nameMatch = text.match(/name is (.+?)(?:\.|,|$)/i)
  if (nameMatch) formData.name = nameMatch[1]
  
  // Extract email
  const emailMatch = text.match(/email is (.+?)(?:\.|,|$)/i)
  if (emailMatch) formData.email = emailMatch[1]
  
  // Extract phone
  const phoneMatch = text.match(/phone (?:number )?is (.+?)(?:\.|,|$)/i)
  if (phoneMatch) formData.phone = phoneMatch[1]
  
  return formData
}

function parseNavigationCommands(text: string): { target: string; page: number; action: string } {
  const lowerText = text.toLowerCase()
  
  if (lowerText.includes('next page')) {
    return { target: 'next page', page: 2, action: 'navigate_next' }
  } else if (lowerText.includes('previous page')) {
    return { target: 'previous page', page: 1, action: 'navigate_previous' }
  } else if (lowerText.includes('go to page')) {
    const pageMatch = text.match(/page (\d+)/i)
    const page = pageMatch ? parseInt(pageMatch[1]) : 1
    return { target: `page ${page}`, page, action: 'navigate_to_page' }
  } else {
    return { target: 'current page', page: 1, action: 'stay' }
  }
}