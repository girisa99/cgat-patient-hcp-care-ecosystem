import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

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
    const { text, voice, model, agentType } = await req.json()

    if (!text) {
      throw new Error('Text is required')
    }

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY')
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ElevenLabs API key not configured')
    }

    console.log(`Generating speech for agent type: ${agentType}`)

    // Voice selection based on agent type
    const getVoiceForAgentType = (agentType: string, userVoice?: string) => {
      if (userVoice) return userVoice
      
      switch (agentType) {
        case 'conversational': return 'Aria' // 9BWtsMINqrJLrRacOk9x
        case 'structured': return 'Sarah' // EXAVITQu4vr4xnSDxMaL
        case 'traditional_form': return 'Laura' // FGY2WhTYpPnrIDTdsKH5
        case 'fax': return 'Charlie' // IKne3meq5aSn9XLyUdCD
        case 'pdf': return 'Jessica' // cgSgspJ2msm6clMCkdW9
        default: return 'Aria'
      }
    }

    const selectedVoice = getVoiceForAgentType(agentType, voice)
    
    // Voice ID mapping
    const voiceIds: Record<string, string> = {
      'Aria': '9BWtsMINqrJLrRacOk9x',
      'Roger': 'CwhRBWXzGAHq8TQ4Fs17',
      'Sarah': 'EXAVITQu4vr4xnSDxMaL',
      'Laura': 'FGY2WhTYpPnrIDTdsKH5',
      'Charlie': 'IKne3meq5aSn9XLyUdCD',
      'Jessica': 'cgSgspJ2msm6clMCkdW9',
      'Will': 'bIHbv24MWmeRgasZH58o',
      'Brian': 'nPczCjzI2devNBz1zQrb',
      'Daniel': 'onwK4e9ZLuTAKqWW03F9'
    }

    const voiceId = voiceIds[selectedVoice] || voiceIds['Aria']
    const modelId = model || 'eleven_multilingual_v2'

    console.log(`Using voice: ${selectedVoice} (${voiceId}) with model: ${modelId}`)

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
          similarity_boost: 0.5,
          style: 0.0,
          use_speaker_boost: true
        }
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('ElevenLabs API error:', error)
      throw new Error(`ElevenLabs API error: ${error}`)
    }

    // Convert audio to base64
    const arrayBuffer = await response.arrayBuffer()
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(arrayBuffer))
    )

    console.log(`Successfully generated ${base64Audio.length} bytes of audio`)

    return new Response(
      JSON.stringify({ 
        audioContent: base64Audio,
        voice: selectedVoice,
        voiceId,
        model: modelId,
        agentType
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error generating speech:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})