/**
 * Music Composer Agent Edge Function
 * Unified audio generation hub for Voice, Music, and SFX
 * Supports tier-based provider routing (Standard, Advanced, Premium)
 * 
 * Actions:
 * - generate_voice: TTS voice generation
 * - generate_music: Background music generation
 * - generate_sfx: Sound effects generation
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Tier definitions for routing
type GlobalTier = 1 | 2 | 3;

interface AudioRequest {
  action: 'generate_voice' | 'generate_music' | 'generate_sfx' | 'generate' | 'generate_music';
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

// Default voice IDs per provider
const DEFAULT_VOICES: Record<string, string> = {
  'elevenlabs': 'JBFqnCBsd6RMkjVDRZzb', // George
  'openai': 'alloy',
  'google': 'en-US-Neural2-A',
  'azure': 'en-US-JennyNeural',
};

// Get appropriate provider based on tier
function getVoiceProvider(tier: GlobalTier, preferredProvider?: string): string {
  if (preferredProvider) return preferredProvider;
  
  switch (tier) {
    case 3: return 'elevenlabs'; // Premium
    case 2: return 'openai';     // Advanced
    case 1: 
    default: return 'google';    // Standard
  }
}

function getMusicProvider(tier: GlobalTier): string {
  switch (tier) {
    case 3: return 'elevenlabs'; // Premium
    case 2: return 'suno';       // Advanced (fallback to elevenlabs)
    case 1: 
    default: return 'basic';     // Standard (pre-generated loops)
  }
}

function getSfxProvider(tier: GlobalTier): string {
  switch (tier) {
    case 3: return 'elevenlabs'; // Premium
    case 2: return 'adobe';      // Advanced (fallback to elevenlabs)
    case 1: 
    default: return 'freesound'; // Standard (library)
  }
}

// Generate voice using ElevenLabs
async function generateElevenLabsVoice(
  text: string,
  voiceId: string,
  apiKey: string,
  options?: { speed?: number; stability?: number }
): Promise<ArrayBuffer> {
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

// Generate voice using OpenAI
async function generateOpenAIVoice(
  text: string,
  voiceId: string,
  apiKey: string,
  options?: { speed?: number }
): Promise<ArrayBuffer> {
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

// Generate music using ElevenLabs
async function generateElevenLabsMusic(
  prompt: string,
  duration: number,
  apiKey: string
): Promise<ArrayBuffer> {
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

// Generate SFX using ElevenLabs
async function generateElevenLabsSFX(
  prompt: string,
  duration: number,
  apiKey: string
): Promise<ArrayBuffer> {
  const response = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: prompt,
      duration_seconds: Math.min(duration || 5, 22), // Max 22 seconds
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
    
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    console.log(`[MusicComposerAgent] Action: ${action}, Tier: ${tier}`);

    // ========== VOICE GENERATION ==========
    if (action === 'generate_voice') {
      const { text, voiceId, voiceProvider, speed, stability, languageCode } = body;
      
      if (!text) {
        throw new Error('Text is required for voice generation');
      }

      const provider = getVoiceProvider(tier, voiceProvider);
      const finalVoiceId = voiceId || DEFAULT_VOICES[provider] || 'alloy';
      
      console.log(`[Voice] Provider: ${provider}, VoiceId: ${finalVoiceId}, Text length: ${text.length}`);

      let audioBuffer: ArrayBuffer;

      if (provider === 'elevenlabs') {
        if (!ELEVENLABS_API_KEY) {
          // Fallback to OpenAI if ElevenLabs not configured
          console.log('[Voice] ElevenLabs not configured, falling back to OpenAI');
          if (!OPENAI_API_KEY) {
            throw new Error('No voice API keys configured (ELEVENLABS_API_KEY or OPENAI_API_KEY required)');
          }
          audioBuffer = await generateOpenAIVoice(text, 'alloy', OPENAI_API_KEY, { speed });
        } else {
          audioBuffer = await generateElevenLabsVoice(text, finalVoiceId, ELEVENLABS_API_KEY, { speed, stability });
        }
      } else if (provider === 'openai') {
        if (!OPENAI_API_KEY) {
          throw new Error('OpenAI API key not configured');
        }
        audioBuffer = await generateOpenAIVoice(text, finalVoiceId, OPENAI_API_KEY, { speed });
      } else {
        // Default fallback to OpenAI
        if (!OPENAI_API_KEY) {
          throw new Error('OpenAI API key not configured');
        }
        audioBuffer = await generateOpenAIVoice(text, 'alloy', OPENAI_API_KEY, { speed });
      }

      return new Response(audioBuffer, {
        headers: { ...corsHeaders, 'Content-Type': 'audio/mpeg' },
      });
    }

    // ========== MUSIC GENERATION ==========
    if (action === 'generate' || action === 'generate_music') {
      const { prompt, duration = 30, genre } = body;

      const provider = getMusicProvider(tier);
      console.log(`[Music] Provider: ${provider}, Prompt: ${prompt}, Duration: ${duration}s`);

      if (provider === 'elevenlabs' || provider === 'suno') {
        if (!ELEVENLABS_API_KEY) {
          throw new Error('ElevenLabs API key not configured for music generation');
        }
        
        const fullPrompt = genre ? `${genre} style: ${prompt}` : prompt || 'background music';
        const audioBuffer = await generateElevenLabsMusic(fullPrompt, duration, ELEVENLABS_API_KEY);

        return new Response(audioBuffer, {
          headers: { ...corsHeaders, 'Content-Type': 'audio/mpeg' },
        });
      } else {
        // Basic tier - return placeholder response
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
        if (!ELEVENLABS_API_KEY) {
          throw new Error('ElevenLabs API key not configured for SFX generation');
        }
        
        const audioBuffer = await generateElevenLabsSFX(effectPrompt, duration, ELEVENLABS_API_KEY);

        return new Response(audioBuffer, {
          headers: { ...corsHeaders, 'Content-Type': 'audio/mpeg' },
        });
      } else {
        // Non-premium tiers - return guidance
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
