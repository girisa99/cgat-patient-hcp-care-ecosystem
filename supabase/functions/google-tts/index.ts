import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Google Cloud TTS voices - curated selection
const GOOGLE_VOICES = {
  // English US - Neural2 (High quality)
  'en-US-Neural2-A': { gender: 'MALE', language: 'en-US', name: 'Adam (US Male)' },
  'en-US-Neural2-C': { gender: 'FEMALE', language: 'en-US', name: 'Claire (US Female)' },
  'en-US-Neural2-D': { gender: 'MALE', language: 'en-US', name: 'David (US Male)' },
  'en-US-Neural2-E': { gender: 'FEMALE', language: 'en-US', name: 'Emma (US Female)' },
  'en-US-Neural2-F': { gender: 'FEMALE', language: 'en-US', name: 'Fiona (US Female)' },
  'en-US-Neural2-G': { gender: 'FEMALE', language: 'en-US', name: 'Grace (US Female)' },
  'en-US-Neural2-H': { gender: 'FEMALE', language: 'en-US', name: 'Hannah (US Female)' },
  'en-US-Neural2-I': { gender: 'MALE', language: 'en-US', name: 'Ian (US Male)' },
  'en-US-Neural2-J': { gender: 'MALE', language: 'en-US', name: 'James (US Male)' },
  // English UK
  'en-GB-Neural2-A': { gender: 'FEMALE', language: 'en-GB', name: 'Alice (UK Female)' },
  'en-GB-Neural2-B': { gender: 'MALE', language: 'en-GB', name: 'Benjamin (UK Male)' },
  'en-GB-Neural2-C': { gender: 'FEMALE', language: 'en-GB', name: 'Charlotte (UK Female)' },
  'en-GB-Neural2-D': { gender: 'MALE', language: 'en-GB', name: 'Daniel (UK Male)' },
  // Studio voices (Premium)
  'en-US-Studio-M': { gender: 'MALE', language: 'en-US', name: 'Studio Male (Premium)' },
  'en-US-Studio-O': { gender: 'FEMALE', language: 'en-US', name: 'Studio Female (Premium)' },
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { text, voice, speed, pitch } = await req.json()

    if (!text) {
      throw new Error('Text is required')
    }

    // Try GOOGLE_API_KEY first, then GEMINI_API_KEY as fallback
    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY') || Deno.env.get('GEMINI_API_KEY')
    if (!GOOGLE_API_KEY) {
      throw new Error('Google API key not configured (GOOGLE_API_KEY or GEMINI_API_KEY)')
    }

    // Default to a high-quality Neural2 voice
    const selectedVoice = voice && GOOGLE_VOICES[voice as keyof typeof GOOGLE_VOICES] 
      ? voice 
      : 'en-US-Neural2-D'
    
    const voiceConfig = GOOGLE_VOICES[selectedVoice as keyof typeof GOOGLE_VOICES] || GOOGLE_VOICES['en-US-Neural2-D']
    const selectedSpeed = speed || 1.0
    const selectedPitch = pitch || 0

    console.log(`[Google TTS] Generating with voice: ${selectedVoice}, speed: ${selectedSpeed}`)

    // Google Cloud Text-to-Speech API request
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: voiceConfig.language,
            name: selectedVoice,
            ssmlGender: voiceConfig.gender,
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: selectedSpeed,
            pitch: selectedPitch,
            effectsProfileId: ['small-bluetooth-speaker-class-device'], // Optimized for speakers
          },
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('[Google TTS] API error:', error)
      throw new Error(`Google TTS API error: ${error}`)
    }

    const data = await response.json()
    
    if (!data.audioContent) {
      throw new Error('No audio content returned from Google TTS')
    }

    console.log(`[Google TTS] Successfully generated audio`)

    return new Response(
      JSON.stringify({ 
        audioContent: data.audioContent,
        voice: selectedVoice,
        voiceName: voiceConfig.name,
        language: voiceConfig.language,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('[Google TTS] Error:', error)
    return new Response(
      JSON.stringify({ error: (error instanceof Error ? error.message : String(error)) }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
