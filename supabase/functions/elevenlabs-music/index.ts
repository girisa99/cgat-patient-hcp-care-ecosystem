import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt, duration } = await req.json()

    if (!prompt) {
      throw new Error('Music prompt is required')
    }

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY')
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ElevenLabs API key not configured')
    }

    console.log(`Generating music: "${prompt}" for ${duration || 30} seconds`)

    // Generate music using ElevenLabs Music API
    const response = await fetch('https://api.elevenlabs.io/v1/music', {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        duration_seconds: duration || 30,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('ElevenLabs Music API error:', error)
      throw new Error(`ElevenLabs Music API error: ${error}`)
    }

    // Convert audio to base64 using proper encoding
    const arrayBuffer = await response.arrayBuffer()
    const base64Audio = base64Encode(arrayBuffer)

    console.log(`Successfully generated music: ${base64Audio.length} bytes`)

    return new Response(
      JSON.stringify({ 
        audioContent: base64Audio,
        prompt,
        duration: duration || 30,
        type: 'instrumental'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error generating music:', error)
    return new Response(
      JSON.stringify({ error: (error instanceof Error ? error.message : String(error)) }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
