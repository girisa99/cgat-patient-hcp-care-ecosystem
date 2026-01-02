import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { text, voice, model, speed } = await req.json()

    if (!text) {
      throw new Error('Text is required')
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured')
    }

    // Valid OpenAI TTS voices
    const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']
    const selectedVoice = validVoices.includes(voice) ? voice : 'alloy'
    const selectedModel = model || 'tts-1'
    const selectedSpeed = speed || 1.0

    console.log(`[TTS] Generating speech with voice: ${selectedVoice}, model: ${selectedModel}`)

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: selectedModel,
        input: text,
        voice: selectedVoice,
        speed: selectedSpeed,
        response_format: 'mp3'
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('[TTS] OpenAI API error:', error)
      throw new Error(`OpenAI TTS API error: ${error}`)
    }

    // Get audio as ArrayBuffer and convert to base64
    const audioBuffer = await response.arrayBuffer()
    const base64Audio = base64Encode(audioBuffer)

    console.log(`[TTS] Successfully generated ${base64Audio.length} bytes of audio`)

    return new Response(
      JSON.stringify({ 
        audioContent: base64Audio,
        voice: selectedVoice,
        model: selectedModel
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('[TTS] Error generating speech:', error)
    return new Response(
      JSON.stringify({ error: (error instanceof Error ? error.message : String(error)) }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
