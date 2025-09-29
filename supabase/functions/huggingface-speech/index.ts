import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Process base64 in chunks to prevent memory issues
function processBase64Chunks(base64String: string, chunkSize = 32768) {
  const chunks: Uint8Array[] = [];
  let position = 0;
  
  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);
    
    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }
    
    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { audio, agentType, model } = await req.json()
    
    if (!audio) {
      throw new Error('No audio data provided')
    }

    const HUGGING_FACE_TOKEN = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN')
    if (!HUGGING_FACE_TOKEN) {
      throw new Error('Hugging Face access token not configured')
    }

    console.log(`Processing speech-to-text for agent type: ${agentType}`)

    // Model selection based on agent type and requirements
    const getModelForAgentType = (agentType: string, userModel?: string) => {
      if (userModel) return userModel
      
      switch (agentType) {
        case 'conversational': return 'openai/whisper-large-v3' // High accuracy for conversation
        case 'structured': return 'openai/whisper-medium' // Balanced for structured input
        case 'traditional_form': return 'openai/whisper-small' // Fast for simple forms
        case 'fax': return 'openai/whisper-large-v3' // High accuracy for fax OCR
        case 'pdf': return 'openai/whisper-large-v3' // High accuracy for document processing
        default: return 'openai/whisper-medium'
      }
    }

    const selectedModel = getModelForAgentType(agentType, model)
    console.log(`Using model: ${selectedModel}`)

    // Process audio in chunks
    const binaryAudio = processBase64Chunks(audio)
    console.log(`Processed ${binaryAudio.length} bytes of audio data`)
    
    // Prepare form data for Hugging Face API
    const formData = new FormData()
    const blob = new Blob([binaryAudio], { type: 'audio/webm' })
    formData.append('file', blob, 'audio.webm')

    // Send to Hugging Face Inference API
    const response = await fetch(`https://api-inference.huggingface.co/models/${selectedModel}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUGGING_FACE_TOKEN}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Hugging Face API error:', errorText)
      throw new Error(`Hugging Face API error: ${errorText}`)
    }

    const result = await response.json()
    console.log('Transcription result:', result)

    // Handle different response formats from Hugging Face
    let transcribedText = ''
    if (typeof result === 'string') {
      transcribedText = result
    } else if (result.text) {
      transcribedText = result.text
    } else if (Array.isArray(result) && result.length > 0) {
      transcribedText = result[0].text || result[0]
    } else {
      console.warn('Unexpected response format:', result)
      transcribedText = JSON.stringify(result)
    }

    return new Response(
      JSON.stringify({ 
        text: transcribedText,
        model: selectedModel,
        agentType,
        confidence: result.confidence || null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing speech-to-text:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})