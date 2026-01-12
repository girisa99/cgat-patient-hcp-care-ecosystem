import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Voice Director Agent - Multi-Provider TTS Support
// Providers: ElevenLabs, OpenAI, Google Cloud TTS

interface VoiceDirectorRequest {
  text: string
  provider: 'elevenlabs' | 'openai' | 'google' | 'auto'
  voice?: string
  mode?: 'coaching' | 'narration' | 'dialogue' | 'presentation'
  speed?: number
  pitch?: number
  emotion?: string
  voiceSettings?: {
    stability?: number
    similarity_boost?: number
    style?: number
  }
}

interface VoiceDirectorResponse {
  audioContent: string
  provider: string
  voice: string
  duration_estimate?: number
  metadata: Record<string, unknown>
}

// Provider-specific voice mappings
const ELEVENLABS_VOICES: Record<string, { id: string; name: string; style: string }> = {
  'professional': { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', style: 'professional' },
  'friendly': { id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice', style: 'friendly' },
  'narrator': { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian', style: 'narrator' },
  'energetic': { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', style: 'energetic' },
  'calm': { id: 'SAz9YHcvj6GT2YYXdXww', name: 'River', style: 'calm' },
  'warm': { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', style: 'warm' },
}

const OPENAI_VOICES = ['alloy', 'ash', 'coral', 'echo', 'fable', 'onyx', 'nova', 'sage', 'shimmer']

const GOOGLE_VOICES: Record<string, { name: string; gender: string; language: string }> = {
  'en-US-Neural2-D': { name: 'David (US Male)', gender: 'MALE', language: 'en-US' },
  'en-US-Neural2-C': { name: 'Claire (US Female)', gender: 'FEMALE', language: 'en-US' },
  'en-US-Neural2-J': { name: 'James (US Male)', gender: 'MALE', language: 'en-US' },
  'en-GB-Neural2-B': { name: 'Benjamin (UK Male)', gender: 'MALE', language: 'en-GB' },
  'en-GB-Neural2-A': { name: 'Alice (UK Female)', gender: 'FEMALE', language: 'en-GB' },
}

// Mode presets for voice direction
const MODE_PRESETS: Record<string, { speed: number; pitch: number; stability: number; style: number }> = {
  'coaching': { speed: 1.0, pitch: 0, stability: 0.65, style: 0.4 },
  'narration': { speed: 0.95, pitch: 0, stability: 0.7, style: 0.2 },
  'dialogue': { speed: 1.05, pitch: 0, stability: 0.5, style: 0.5 },
  'presentation': { speed: 0.9, pitch: 0, stability: 0.75, style: 0.15 },
}

// Select best provider based on requirements
function selectProvider(request: VoiceDirectorRequest): string {
  if (request.provider !== 'auto') {
    return request.provider
  }
  
  // Auto-select based on mode and requirements
  if (request.mode === 'coaching' || request.mode === 'dialogue') {
    return 'elevenlabs' // Best for expressive speech
  }
  if (request.mode === 'presentation') {
    return 'google' // Best for clear, professional speech
  }
  return 'openai' // Good default for narration
}

// Generate with ElevenLabs
async function generateWithElevenLabs(
  text: string,
  voice: string,
  settings: { stability: number; similarity_boost: number; style: number; speed: number }
): Promise<{ audio: ArrayBuffer; metadata: Record<string, unknown> }> {
  const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY')
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured')
  }

  const voiceConfig = ELEVENLABS_VOICES[voice] || ELEVENLABS_VOICES['professional']
  const voiceId = voiceConfig.id

  console.log(`[VoiceDirector] ElevenLabs - voice: ${voiceConfig.name}, stability: ${settings.stability}`)

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': ELEVENLABS_API_KEY,
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: settings.stability,
        similarity_boost: settings.similarity_boost,
        style: settings.style,
        use_speaker_boost: true,
        speed: settings.speed,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`ElevenLabs API error: ${error}`)
  }

  return {
    audio: await response.arrayBuffer(),
    metadata: {
      voice: voiceConfig.name,
      voiceId,
      model: 'eleven_multilingual_v2',
      settings,
    },
  }
}

// Generate with OpenAI
async function generateWithOpenAI(
  text: string,
  voice: string,
  speed: number
): Promise<{ audio: ArrayBuffer; metadata: Record<string, unknown> }> {
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured')
  }

  const selectedVoice = OPENAI_VOICES.includes(voice) ? voice : 'alloy'

  console.log(`[VoiceDirector] OpenAI - voice: ${selectedVoice}, speed: ${speed}`)

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1-hd',
      input: text,
      voice: selectedVoice,
      speed: Math.max(0.25, Math.min(4.0, speed)),
      response_format: 'mp3',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI TTS API error: ${error}`)
  }

  return {
    audio: await response.arrayBuffer(),
    metadata: {
      voice: selectedVoice,
      model: 'tts-1-hd',
      speed,
    },
  }
}

// Generate with Google Cloud TTS
async function generateWithGoogle(
  text: string,
  voice: string,
  speed: number,
  pitch: number
): Promise<{ audio: ArrayBuffer; metadata: Record<string, unknown> }> {
  const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY') || Deno.env.get('GEMINI_API_KEY')
  if (!GOOGLE_API_KEY) {
    throw new Error('Google API key not configured')
  }

  const voiceConfig = GOOGLE_VOICES[voice] || GOOGLE_VOICES['en-US-Neural2-D']

  console.log(`[VoiceDirector] Google - voice: ${voiceConfig.name}, speed: ${speed}, pitch: ${pitch}`)

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
          name: voice,
          ssmlGender: voiceConfig.gender,
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: speed,
          pitch,
          effectsProfileId: ['small-bluetooth-speaker-class-device'],
        },
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Google TTS API error: ${error}`)
  }

  const data = await response.json()
  
  if (!data.audioContent) {
    throw new Error('No audio content from Google TTS')
  }

  // Google returns base64 encoded audio, decode it
  const binaryString = atob(data.audioContent)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  return {
    audio: bytes.buffer,
    metadata: {
      voice: voiceConfig.name,
      voiceName: voice,
      language: voiceConfig.language,
      speed,
      pitch,
    },
  }
}

// Get coaching feedback based on text analysis
function getCoachingFeedback(text: string): string[] {
  const feedback: string[] = []
  
  // Analyze text for common issues
  if (text.length > 500) {
    feedback.push('Consider breaking this into smaller segments for better pacing')
  }
  
  const sentenceCount = (text.match(/[.!?]/g) || []).length
  const avgSentenceLength = text.length / Math.max(sentenceCount, 1)
  
  if (avgSentenceLength > 100) {
    feedback.push('Some sentences are quite long - shorter sentences improve clarity')
  }
  
  if (!/[!?]/.test(text)) {
    feedback.push('Add variety with questions or exclamations for engagement')
  }
  
  if (text === text.toLowerCase() || text === text.toUpperCase()) {
    feedback.push('Use proper capitalization for natural reading')
  }
  
  return feedback
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const request: VoiceDirectorRequest = await req.json()
    const { text, provider, voice, mode, speed, pitch, emotion, voiceSettings } = request

    if (!text) {
      throw new Error('Text is required')
    }

    console.log(`[VoiceDirector] Request - provider: ${provider}, mode: ${mode}, text length: ${text.length}`)

    // Get mode presets
    const modePreset = mode ? MODE_PRESETS[mode] : MODE_PRESETS['narration']
    
    // Select provider
    const selectedProvider = selectProvider(request)
    console.log(`[VoiceDirector] Selected provider: ${selectedProvider}`)

    let result: { audio: ArrayBuffer; metadata: Record<string, unknown> }

    // Generate based on provider
    switch (selectedProvider) {
      case 'elevenlabs': {
        const settings = {
          stability: voiceSettings?.stability ?? modePreset.stability,
          similarity_boost: voiceSettings?.similarity_boost ?? 0.75,
          style: voiceSettings?.style ?? modePreset.style,
          speed: speed ?? modePreset.speed,
        }
        result = await generateWithElevenLabs(text, voice || 'professional', settings)
        break
      }

      case 'openai': {
        result = await generateWithOpenAI(text, voice || 'alloy', speed ?? modePreset.speed)
        break
      }

      case 'google': {
        result = await generateWithGoogle(
          text,
          voice || 'en-US-Neural2-D',
          speed ?? modePreset.speed,
          pitch ?? modePreset.pitch
        )
        break
      }

      default:
        throw new Error(`Unsupported provider: ${selectedProvider}`)
    }

    // Encode audio to base64
    const audioBase64 = base64Encode(result.audio)

    // Get coaching feedback
    const coachingFeedback = mode === 'coaching' ? getCoachingFeedback(text) : []

    // Estimate duration (rough: ~150 words per minute at 1.0 speed)
    const wordCount = text.split(/\s+/).length
    const durationEstimate = (wordCount / 150) * 60 / (speed ?? 1.0)

    console.log(`[VoiceDirector] Success - ${audioBase64.length} bytes, ~${durationEstimate.toFixed(1)}s`)

    const response: VoiceDirectorResponse = {
      audioContent: audioBase64,
      provider: selectedProvider,
      voice: result.metadata.voice as string,
      duration_estimate: durationEstimate,
      metadata: {
        ...result.metadata,
        mode,
        textLength: text.length,
        wordCount,
        coachingFeedback,
      },
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('[VoiceDirector] Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : String(error),
        provider: 'unknown'
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
