import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Real ElevenLabs Voice ID mappings
// Reference: https://elevenlabs.io/voice-library
const VOICE_IDS: Record<string, string> = {
  // Premium voices
  'roger': 'CwhRBWXzGAHq8TQ4Fs17',
  'sarah': 'EXAVITQu4vr4xnSDxMaL',
  'laura': 'FGY2WhTYpPnrIDTdsKH5',
  'charlie': 'IKne3meq5aSn9XLyUdCD',
  'george': 'JBFqnCBsd6RMkjVDRZzb',
  'callum': 'N2lVS1w4EtoT3dr4eOWO',
  'river': 'SAz9YHcvj6GT2YYXdXww',
  'liam': 'TX3LPaxmHKxFdv7VOQHJ',
  'alice': 'Xb7hH8MSUJpSbSDYk0k2',
  'matilda': 'XrExE9yKIg1WjnnlVkGX',
  'will': 'bIHbv24MWmeRgasZH58o',
  'jessica': 'cgSgspJ2msm6clMCkdW9',
  'eric': 'cjVigY5qzO86Huf0OWal',
  'chris': 'iP95p4xoKVk53GoZ742B',
  'brian': 'nPczCjzI2devNBz1zQrb',
  'daniel': 'onwK4e9ZLuTAKqWW03F9',
  'lily': 'pFZP5JQG7iQjIQuC4Bku',
  'bill': 'pqHfZKP75CvOlQylNhV4',
  'aria': '9BWtsMINqrJLrRacOk9x',
  // Legacy names (for backward compatibility)
  'rachel': 'EXAVITQu4vr4xnSDxMaL', // Maps to Sarah
  'domi': 'XrExE9yKIg1WjnnlVkGX', // Maps to Matilda
  'bella': 'pFZP5JQG7iQjIQuC4Bku', // Maps to Lily
  'antoni': 'onwK4e9ZLuTAKqWW03F9', // Maps to Daniel
  'elli': 'cgSgspJ2msm6clMCkdW9', // Maps to Jessica
  'josh': 'nPczCjzI2devNBz1zQrb', // Maps to Brian
  'arnold': 'CwhRBWXzGAHq8TQ4Fs17', // Maps to Roger
  'adam': 'TX3LPaxmHKxFdv7VOQHJ', // Maps to Liam
  'sam': 'bIHbv24MWmeRgasZH58o', // Maps to Will
}

// Agent type to voice mapping for narrator-style usage
const AGENT_TYPE_VOICES: Record<string, string> = {
  'conversational': 'aria',
  'structured': 'sarah',
  'traditional_form': 'laura',
  'fax': 'charlie',
  'pdf': 'jessica',
  'narrator': 'brian',
  'professional': 'daniel',
  'friendly': 'alice',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, voice, model, agentType } = await req.json()

    if (!text) {
      throw new Error('Text is required')
    }

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY')
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ElevenLabs API key not configured')
    }

    console.log(`[ElevenLabs] Generating speech - agent type: ${agentType}, requested voice: ${voice}`)

    // Determine voice: user-specified > agent type default > fallback
    let selectedVoiceName = voice?.toLowerCase() || 
      (agentType ? AGENT_TYPE_VOICES[agentType] : null) || 
      'aria'

    // Get voice ID from mapping
    let voiceId = VOICE_IDS[selectedVoiceName]
    
    // If not found in mapping, check if it's already a voice ID (starts with letter + has alphanumeric)
    if (!voiceId && voice && /^[a-zA-Z][a-zA-Z0-9]{10,}$/.test(voice)) {
      voiceId = voice
      selectedVoiceName = 'custom'
    }
    
    // Final fallback to Aria
    if (!voiceId) {
      voiceId = VOICE_IDS['aria']
      selectedVoiceName = 'aria'
    }

    const modelId = model || 'eleven_multilingual_v2'

    console.log(`[ElevenLabs] Using voice: ${selectedVoiceName} (${voiceId}) with model: ${modelId}`)

    // Generate speech using ElevenLabs API
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        }
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('[ElevenLabs] API error:', error)
      throw new Error(`ElevenLabs API error: ${error}`)
    }

    // Convert audio to base64 using proper encoding
    const arrayBuffer = await response.arrayBuffer()
    const base64Audio = base64Encode(arrayBuffer)

    console.log(`[ElevenLabs] Successfully generated ${base64Audio.length} bytes of audio`)

    return new Response(
      JSON.stringify({ 
        audioContent: base64Audio,
        voice: selectedVoiceName,
        voiceId,
        model: modelId,
        agentType
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('[ElevenLabs] Error generating speech:', error)
    return new Response(
      JSON.stringify({ error: (error instanceof Error ? error.message : String(error)) }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
