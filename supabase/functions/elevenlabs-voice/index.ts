import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Real ElevenLabs Voice ID mappings
const VOICE_IDS: Record<string, string> = {
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
  'rachel': 'EXAVITQu4vr4xnSDxMaL',
  'domi': 'XrExE9yKIg1WjnnlVkGX',
  'bella': 'pFZP5JQG7iQjIQuC4Bku',
  'antoni': 'onwK4e9ZLuTAKqWW03F9',
  'elli': 'cgSgspJ2msm6clMCkdW9',
  'josh': 'nPczCjzI2devNBz1zQrb',
  'arnold': 'CwhRBWXzGAHq8TQ4Fs17',
  'adam': 'TX3LPaxmHKxFdv7VOQHJ',
  'sam': 'bIHbv24MWmeRgasZH58o',
}

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

const SCRIPT_MODE_VOICES: Record<string, { voice: string; stability: number; similarity: number; style: number; speed: number }> = {
  'podcast': { voice: 'brian', stability: 0.45, similarity: 0.75, style: 0.35, speed: 1.0 },
  'webcast': { voice: 'daniel', stability: 0.65, similarity: 0.7, style: 0.15, speed: 0.95 },
  'video': { voice: 'george', stability: 0.55, similarity: 0.85, style: 0.4, speed: 0.9 },
  'audio': { voice: 'matilda', stability: 0.7, similarity: 0.8, style: 0.1, speed: 0.92 },
}

const MAX_CHUNK_SIZE = 4500 // Safe limit under 5000

// Split text into chunks at natural boundaries (sentences/paragraphs)
function splitTextIntoChunks(text: string): string[] {
  if (text.length <= MAX_CHUNK_SIZE) {
    return [text]
  }

  const chunks: string[] = []
  let remaining = text

  while (remaining.length > 0) {
    if (remaining.length <= MAX_CHUNK_SIZE) {
      chunks.push(remaining)
      break
    }

    // Find the best split point within the chunk size limit
    let splitIndex = MAX_CHUNK_SIZE
    
    // Try to split at paragraph break first
    const paragraphBreak = remaining.lastIndexOf('\n\n', MAX_CHUNK_SIZE)
    if (paragraphBreak > MAX_CHUNK_SIZE * 0.5) {
      splitIndex = paragraphBreak + 2
    } else {
      // Try sentence break (., !, ?)
      const sentenceBreak = Math.max(
        remaining.lastIndexOf('. ', MAX_CHUNK_SIZE),
        remaining.lastIndexOf('! ', MAX_CHUNK_SIZE),
        remaining.lastIndexOf('? ', MAX_CHUNK_SIZE)
      )
      if (sentenceBreak > MAX_CHUNK_SIZE * 0.5) {
        splitIndex = sentenceBreak + 2
      } else {
        // Try comma or other natural break
        const commaBreak = remaining.lastIndexOf(', ', MAX_CHUNK_SIZE)
        if (commaBreak > MAX_CHUNK_SIZE * 0.5) {
          splitIndex = commaBreak + 2
        }
      }
    }

    chunks.push(remaining.substring(0, splitIndex).trim())
    remaining = remaining.substring(splitIndex).trim()
  }

  return chunks.filter(c => c.length > 0)
}

// Get context text for stitching (last ~2 sentences)
function getContextText(text: string, fromEnd: boolean): string {
  const sentences = text.split(/(?<=[.!?])\s+/)
  if (fromEnd) {
    return sentences.slice(-2).join(' ').substring(0, 500)
  }
  return sentences.slice(0, 2).join(' ').substring(0, 500)
}

// Concatenate audio buffers
function concatenateAudioBuffers(buffers: ArrayBuffer[]): ArrayBuffer {
  const totalLength = buffers.reduce((acc, buf) => acc + buf.byteLength, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0
  for (const buffer of buffers) {
    result.set(new Uint8Array(buffer), offset)
    offset += buffer.byteLength
  }
  return result.buffer
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, voice, model, agentType, scriptMode, voiceSettings } = await req.json()

    if (!text) {
      throw new Error('Text is required')
    }

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY')
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ElevenLabs API key not configured')
    }

    console.log(`[ElevenLabs] Generating speech - text length: ${text.length}, agent type: ${agentType}, script mode: ${scriptMode}`)

    const modeSettings = scriptMode ? SCRIPT_MODE_VOICES[scriptMode] : null

    let selectedVoiceName = voice?.toLowerCase() || 
      (modeSettings ? modeSettings.voice : null) ||
      (agentType ? AGENT_TYPE_VOICES[agentType] : null) || 
      'aria'

    let voiceId = VOICE_IDS[selectedVoiceName]
    
    if (!voiceId && voice && /^[a-zA-Z][a-zA-Z0-9]{10,}$/.test(voice)) {
      voiceId = voice
      selectedVoiceName = 'custom'
    }
    
    if (!voiceId) {
      voiceId = VOICE_IDS['aria']
      selectedVoiceName = 'aria'
    }

    const modelId = model || 'eleven_multilingual_v2'
    const stability = voiceSettings?.stability ?? modeSettings?.stability ?? 0.5
    const similarityBoost = voiceSettings?.similarity_boost ?? modeSettings?.similarity ?? 0.75
    const style = voiceSettings?.style ?? modeSettings?.style ?? 0.0
    const speed = voiceSettings?.speed ?? modeSettings?.speed ?? 1.0

    console.log(`[ElevenLabs] Using voice: ${selectedVoiceName} (${voiceId}), model: ${modelId}`)

    // Split text into chunks if needed
    const chunks = splitTextIntoChunks(text)
    console.log(`[ElevenLabs] Split into ${chunks.length} chunks`)

    const audioBuffers: ArrayBuffer[] = []

    // Process chunks with request stitching for smooth transitions
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      const isFirst = i === 0
      const isLast = i === chunks.length - 1

      // Build request with stitching context
      const requestBody: Record<string, unknown> = {
        text: chunk,
        model_id: modelId,
        voice_settings: {
          stability,
          similarity_boost: similarityBoost,
          style,
          use_speaker_boost: true,
          speed
        }
      }

      // Add context for stitching (except first/last chunks)
      if (!isFirst && chunks[i - 1]) {
        requestBody.previous_text = getContextText(chunks[i - 1], true)
      }
      if (!isLast && chunks[i + 1]) {
        requestBody.next_text = getContextText(chunks[i + 1], false)
      }

      console.log(`[ElevenLabs] Processing chunk ${i + 1}/${chunks.length} (${chunk.length} chars)`)

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const error = await response.text()
        console.error(`[ElevenLabs] API error on chunk ${i + 1}:`, error)
        throw new Error(`ElevenLabs API error: ${error}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      audioBuffers.push(arrayBuffer)
      console.log(`[ElevenLabs] Chunk ${i + 1} complete: ${arrayBuffer.byteLength} bytes`)
    }

    // Concatenate all audio chunks
    const combinedAudio = chunks.length === 1 
      ? audioBuffers[0] 
      : concatenateAudioBuffers(audioBuffers)
    
    const base64Audio = base64Encode(combinedAudio)

    console.log(`[ElevenLabs] Successfully generated ${base64Audio.length} bytes total from ${chunks.length} chunks`)

    return new Response(
      JSON.stringify({ 
        audioContent: base64Audio,
        voice: selectedVoiceName,
        voiceId,
        model: modelId,
        agentType,
        chunksProcessed: chunks.length
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
