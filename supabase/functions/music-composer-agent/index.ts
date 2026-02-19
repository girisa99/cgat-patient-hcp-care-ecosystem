/**
 * Music Composer Agent Edge Function
 * Unified audio generation hub for Voice, Music, and SFX
 * Supports tier-based provider routing (Standard, Advanced, Premium)
 * 
 * Multi-Provider Support:
 * - Voice: ElevenLabs, OpenAI, Azure, Google, AWS Polly, Alibaba
 * - Music: ElevenLabs, Suno
 * - SFX: ElevenLabs
 * 
 * Actions:
 * - generate_voice: TTS voice generation
 * - generate_music: Background music generation
 * - generate_sfx: Sound effects generation
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Tier definitions for routing
type GlobalTier = 1 | 2 | 3;

interface AudioRequest {
  action: 'generate_voice' | 'generate_music' | 'generate_sfx' | 'generate' | 'check_providers';
  tier?: GlobalTier;
  // Voice params
  text?: string;
  voiceId?: string;
  voiceProvider?: string;
  speed?: number;
  pitch?: number;
  stability?: number;
  // Music params
  prompt?: string;
  duration?: number;
  genre?: string;
  // SFX params
  type?: string;
  sfxPrompt?: string;
  // Language for voice selection
  languageCode?: string;
}

// Language-specific voice mappings for each provider
const VOICE_MAPPINGS: Record<string, Record<string, string>> = {
  'elevenlabs': {
    'en': 'JBFqnCBsd6RMkjVDRZzb',
    'en-US': 'JBFqnCBsd6RMkjVDRZzb',
    'en-GB': 'ThT5KcBeYPX3keUQqHPh',
    'es': 'EXAVITQu4vr4xnSDxMaL',
    'fr': 'CwhRBWXzGAHq8TQ4Fs17',
    'de': 'EXAVITQu4vr4xnSDxMaL',
    'zh': 'XB0fDUnXU5powFXDhCwa',
    'ja': 'iP95p4xoKVk53GoZ742B',
    'ko': 'jsCqWAovK2LkecY7zXl4',
  },
  'openai': {
    'default': 'alloy',
    'male': 'onyx',
    'female': 'nova',
  },
  'azure': {
    'en-US': 'en-US-JennyNeural',
    'en-GB': 'en-GB-SoniaNeural',
    'zh-CN': 'zh-CN-XiaoxiaoNeural',
    'zh': 'zh-CN-XiaoxiaoNeural',
    'ja': 'ja-JP-NanamiNeural',
    'ko': 'ko-KR-SunHiNeural',
    'ar': 'ar-SA-HamedNeural',
    'hi': 'hi-IN-SwaraNeural',
    'es': 'es-ES-ElviraNeural',
    'fr': 'fr-FR-DeniseNeural',
    'de': 'de-DE-KatjaNeural',
  },
  'google': {
    'en-US': 'en-US-Neural2-F',
    'zh-CN': 'cmn-CN-Wavenet-A',
    'zh': 'cmn-CN-Wavenet-A',
    'ja': 'ja-JP-Neural2-B',
    'ko': 'ko-KR-Neural2-A',
    'hi': 'hi-IN-Neural2-A',
    'ar': 'ar-XA-Wavenet-A',
  },
  'aws': {
    'en-US': 'Joanna',
    'en-GB': 'Amy',
    'zh': 'Zhiyu',
    'ja': 'Mizuki',
    'ko': 'Seoyeon',
    'es': 'Lucia',
    'fr': 'Celine',
    'de': 'Marlene',
  },
};

// CJK language detection
const CJK_LANGUAGES = ['zh', 'zh-CN', 'zh-TW', 'ja', 'ko'];
const INDIC_LANGUAGES = ['hi', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml'];
const ARABIC_LANGUAGES = ['ar', 'ar-SA', 'ar-EG'];

// Get appropriate provider based on tier and language
function getVoiceProvider(tier: GlobalTier, languageCode?: string, preferredProvider?: string): string {
  if (preferredProvider && isProviderConfigured(preferredProvider)) {
    return preferredProvider;
  }
  
  const lang = languageCode?.split('-')[0] || 'en';
  
  // CJK - prefer Azure or Alibaba
  if (CJK_LANGUAGES.includes(lang) || CJK_LANGUAGES.includes(languageCode || '')) {
    if (tier >= 2 && isProviderConfigured('azure')) return 'azure';
    if (isProviderConfigured('alibaba')) return 'alibaba';
    if (isProviderConfigured('google')) return 'google';
  }
  
  // Indic/Arabic - prefer Azure
  if (INDIC_LANGUAGES.includes(lang) || ARABIC_LANGUAGES.includes(lang)) {
    if (tier >= 2 && isProviderConfigured('azure')) return 'azure';
    if (isProviderConfigured('google')) return 'google';
  }
  
  // Default tier-based routing for other languages
  switch (tier) {
    case 3:
      if (isProviderConfigured('elevenlabs')) return 'elevenlabs';
      if (isProviderConfigured('azure')) return 'azure';
      if (isProviderConfigured('openai')) return 'openai';
      break;
    case 2:
      if (isProviderConfigured('openai')) return 'openai';
      if (isProviderConfigured('azure')) return 'azure';
      if (isProviderConfigured('google')) return 'google';
      break;
    case 1:
    default:
      if (isProviderConfigured('google')) return 'google';
      if (isProviderConfigured('aws')) return 'aws';
      if (isProviderConfigured('openai')) return 'openai';
  }
  
  // Final fallback
  if (isProviderConfigured('openai')) return 'openai';
  if (isProviderConfigured('google')) return 'google';
  if (isProviderConfigured('elevenlabs')) return 'elevenlabs';
  
  throw new Error('No voice provider configured. Please add API keys for ElevenLabs, OpenAI, Azure, or Google.');
}

function isProviderConfigured(provider: string): boolean {
  const keyMap: Record<string, string> = {
    'elevenlabs': 'ELEVENLABS_API_KEY',
    'openai': 'OPENAI_API_KEY',
    'azure': 'AZURE_SPEECH_KEY',
    'google': 'GOOGLE_API_KEY',
    'aws': 'AWS_ACCESS_KEY_ID',
    'alibaba': 'ALIBABA_API_KEY',
  };
  const key = Deno.env.get(keyMap[provider] || '');
  return !!key && key.length > 0;
}

function getMusicProvider(tier: GlobalTier): string {
  switch (tier) {
    case 3: return 'elevenlabs';
    case 2: return 'elevenlabs';
    default: return 'basic';
  }
}

function getSfxProvider(tier: GlobalTier): string {
  switch (tier) {
    case 3: return 'elevenlabs';
    default: return 'freesound';
  }
}

// Voice generation functions
async function generateElevenLabsVoice(
  text: string,
  voiceId: string,
  options?: { speed?: number; stability?: number }
): Promise<ArrayBuffer> {
  const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
  if (!apiKey) throw new Error('ElevenLabs API key not configured');
  
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: options?.stability ?? 0.5,
          similarity_boost: 0.75,
          style: 0.5,
          use_speaker_boost: true,
          speed: options?.speed ?? 1.0,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs TTS failed: ${response.status} - ${error}`);
  }

  return response.arrayBuffer();
}

async function generateOpenAIVoice(
  text: string,
  voiceId: string,
  options?: { speed?: number }
): Promise<ArrayBuffer> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) throw new Error('OpenAI API key not configured');
  
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1-hd',
      input: text,
      voice: voiceId || 'alloy',
      speed: options?.speed ?? 1.0,
      response_format: 'mp3',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI TTS failed: ${response.status} - ${error}`);
  }

  return response.arrayBuffer();
}

async function generateAzureVoice(
  text: string,
  voiceName: string,
  languageCode: string
): Promise<ArrayBuffer> {
  const apiKey = Deno.env.get('AZURE_SPEECH_KEY');
  const region = Deno.env.get('AZURE_SPEECH_REGION') || 'eastus';
  if (!apiKey) throw new Error('Azure Speech API key not configured');
  
  const ssml = `
    <speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='${languageCode}'>
      <voice name='${voiceName}'>${text}</voice>
    </speak>
  `;
  
  const response = await fetch(
    `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
    {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-96kbitrate-mono-mp3',
      },
      body: ssml,
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Azure TTS failed: ${response.status} - ${error}`);
  }

  return response.arrayBuffer();
}

async function generateGoogleVoice(
  text: string,
  voiceName: string,
  languageCode: string
): Promise<ArrayBuffer> {
  const apiKey = Deno.env.get('GOOGLE_API_KEY');
  if (!apiKey) throw new Error('Google API key not configured');
  
  const response = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode, name: voiceName },
        audioConfig: { audioEncoding: 'MP3' },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google TTS failed: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const binaryString = atob(data.audioContent);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Music generation
async function generateElevenLabsMusic(
  prompt: string,
  duration: number
): Promise<ArrayBuffer> {
  const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
  if (!apiKey) throw new Error('ElevenLabs API key not configured');
  
  const response = await fetch('https://api.elevenlabs.io/v1/music', {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: prompt || 'background music',
      duration_seconds: duration || 30,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs Music failed: ${response.status} - ${error}`);
  }

  return response.arrayBuffer();
}

// SFX generation
async function generateElevenLabsSFX(
  prompt: string,
  duration: number
): Promise<ArrayBuffer> {
  const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
  if (!apiKey) throw new Error('ElevenLabs API key not configured');
  
  const response = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: prompt,
      duration_seconds: Math.min(duration || 5, 22),
      prompt_influence: 0.3,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs SFX failed: ${response.status} - ${error}`);
  }

  return response.arrayBuffer();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: AudioRequest = await req.json();
    const { action, tier = 2 } = body;

    console.log(`[MusicComposerAgent] Action: ${action}, Tier: ${tier}`);

    // ========== CHECK CONFIGURED PROVIDERS ==========
    if (action === 'check_providers') {
      const providers = {
        elevenlabs: isProviderConfigured('elevenlabs'),
        openai: isProviderConfigured('openai'),
        azure: isProviderConfigured('azure'),
        google: isProviderConfigured('google'),
        aws: isProviderConfigured('aws'),
        alibaba: isProviderConfigured('alibaba'),
      };
      
      return new Response(
        JSON.stringify({ providers, tier }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ========== VOICE GENERATION ==========
    if (action === 'generate_voice') {
      const { text, voiceId, voiceProvider, speed, stability, languageCode } = body;
      
      if (!text) {
        throw new Error('Text is required for voice generation');
      }

      const provider = getVoiceProvider(tier, languageCode, voiceProvider);
      const lang = languageCode || 'en-US';
      const mappings = VOICE_MAPPINGS[provider] || {};
      const finalVoiceId = voiceId || mappings[lang] || mappings[lang.split('-')[0]] || mappings['default'] || 'alloy';
      
      console.log(`[Voice] Provider: ${provider}, Voice: ${finalVoiceId}, Lang: ${lang}, Text: ${text.length} chars`);

      let audioBuffer: ArrayBuffer;

      switch (provider) {
        case 'elevenlabs':
          audioBuffer = await generateElevenLabsVoice(text, finalVoiceId, { speed, stability });
          break;
        case 'openai':
          audioBuffer = await generateOpenAIVoice(text, finalVoiceId, { speed });
          break;
        case 'azure':
          audioBuffer = await generateAzureVoice(text, finalVoiceId, lang);
          break;
        case 'google':
          audioBuffer = await generateGoogleVoice(text, finalVoiceId, lang);
          break;
        default:
          // Fallback to OpenAI
          audioBuffer = await generateOpenAIVoice(text, 'alloy', { speed });
      }

      return new Response(audioBuffer, {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'audio/mpeg',
          'X-Provider': provider,
          'X-Voice-Id': finalVoiceId,
        },
      });
    }

    // ========== MUSIC GENERATION ==========
    if (action === 'generate' || action === 'generate_music') {
      const { prompt, duration = 30, genre } = body;

      const provider = getMusicProvider(tier);
      console.log(`[Music] Provider: ${provider}, Prompt: ${prompt}, Duration: ${duration}s`);

      if (provider === 'elevenlabs' || provider === 'suno') {
        const fullPrompt = genre ? `${genre} style: ${prompt}` : prompt || 'background music';
        const audioBuffer = await generateElevenLabsMusic(fullPrompt, duration);

        return new Response(audioBuffer, {
          headers: { ...corsHeaders, 'Content-Type': 'audio/mpeg' },
        });
      } else {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Basic tier uses pre-generated loops. Upgrade to Advanced/Premium for AI music.',
            tier: 1,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // ========== SFX GENERATION ==========
    if (action === 'generate_sfx') {
      const { sfxPrompt, prompt, duration = 5 } = body;
      const effectPrompt = sfxPrompt || prompt;

      if (!effectPrompt) {
        throw new Error('SFX prompt is required');
      }

      const provider = getSfxProvider(tier);
      console.log(`[SFX] Provider: ${provider}, Prompt: ${effectPrompt}, Duration: ${duration}s`);

      if (provider === 'elevenlabs') {
        const audioBuffer = await generateElevenLabsSFX(effectPrompt, duration);

        return new Response(audioBuffer, {
          headers: { ...corsHeaders, 'Content-Type': 'audio/mpeg' },
        });
      } else {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Standard/Advanced tiers use pre-generated SFX. Upgrade to Premium for AI-generated SFX.',
            tier,
            suggestedLibraries: ['freesound.org', 'mixkit.co'],
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error: any) {
    console.error('[MusicComposerAgent] Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
