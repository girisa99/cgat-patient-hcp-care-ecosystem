import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VoiceCloneRequest {
  action: 'create_clone' | 'generate_speech' | 'list_clones' | 'delete_clone';
  voiceId?: string;
  name?: string;
  description?: string;
  audioSamples?: string[]; // Base64 encoded audio files
  text?: string;
  settings?: {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: VoiceCloneRequest = await req.json();
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');

    console.log(`🎤 Voice Clone Request:`, {
      action: request.action,
      voiceId: request.voiceId,
      hasAudioSamples: !!request.audioSamples?.length,
      textLength: request.text?.length
    });

    if (!ELEVENLABS_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'ELEVENLABS_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result;

    switch (request.action) {
      case 'create_clone':
        result = await createVoiceClone(ELEVENLABS_API_KEY, request);
        break;

      case 'generate_speech':
        result = await generateSpeech(ELEVENLABS_API_KEY, request);
        break;

      case 'list_clones':
        result = await listVoiceClones(ELEVENLABS_API_KEY);
        break;

      case 'delete_clone':
        result = await deleteVoiceClone(ELEVENLABS_API_KEY, request.voiceId!);
        break;

      default:
        throw new Error(`Unknown action: ${request.action}`);
    }

    return new Response(
      JSON.stringify({ success: true, ...result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Voice clone error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function createVoiceClone(apiKey: string, request: VoiceCloneRequest): Promise<{
  voiceId: string;
  name: string;
  status: string;
}> {
  if (!request.audioSamples?.length || !request.name) {
    throw new Error('Audio samples and name are required for voice cloning');
  }

  // Create form data for ElevenLabs API
  const formData = new FormData();
  formData.append('name', request.name);
  if (request.description) {
    formData.append('description', request.description);
  }

  // Add audio samples
  for (let i = 0; i < request.audioSamples.length; i++) {
    const audioData = request.audioSamples[i];
    const binaryData = Uint8Array.from(atob(audioData), c => c.charCodeAt(0));
    const blob = new Blob([binaryData], { type: 'audio/mpeg' });
    formData.append('files', blob, `sample_${i}.mp3`);
  }

  const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs API error: ${error}`);
  }

  const data = await response.json();
  
  return {
    voiceId: data.voice_id,
    name: request.name,
    status: 'created'
  };
}

async function generateSpeech(apiKey: string, request: VoiceCloneRequest): Promise<{
  audioUrl: string;
  audioBase64: string;
  duration: number;
}> {
  if (!request.voiceId || !request.text) {
    throw new Error('Voice ID and text are required for speech generation');
  }

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${request.voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: request.text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: request.settings?.stability ?? 0.5,
        similarity_boost: request.settings?.similarity_boost ?? 0.75,
        style: request.settings?.style ?? 0,
        use_speaker_boost: request.settings?.use_speaker_boost ?? true,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs TTS error: ${error}`);
  }

  const audioBuffer = await response.arrayBuffer();
  const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
  
  // Estimate duration based on text length (rough approximation)
  const wordsPerMinute = 150;
  const wordCount = request.text.split(/\s+/).length;
  const estimatedDuration = (wordCount / wordsPerMinute) * 60;

  return {
    audioUrl: `data:audio/mpeg;base64,${audioBase64}`,
    audioBase64,
    duration: estimatedDuration
  };
}

async function listVoiceClones(apiKey: string): Promise<{
  voices: Array<{
    voiceId: string;
    name: string;
    category: string;
    labels: Record<string, string>;
  }>;
}> {
  const response = await fetch('https://api.elevenlabs.io/v1/voices', {
    headers: {
      'xi-api-key': apiKey,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs API error: ${error}`);
  }

  const data = await response.json();
  
  return {
    voices: data.voices.map((voice: any) => ({
      voiceId: voice.voice_id,
      name: voice.name,
      category: voice.category,
      labels: voice.labels || {}
    }))
  };
}

async function deleteVoiceClone(apiKey: string, voiceId: string): Promise<{
  deleted: boolean;
  voiceId: string;
}> {
  const response = await fetch(`https://api.elevenlabs.io/v1/voices/${voiceId}`, {
    method: 'DELETE',
    headers: {
      'xi-api-key': apiKey,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs API error: ${error}`);
  }

  return {
    deleted: true,
    voiceId
  };
}
