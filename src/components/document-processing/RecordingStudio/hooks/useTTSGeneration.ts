/**
 * TTS Generation Hook - Real integration with ElevenLabs, OpenAI, Google Cloud, Amazon Polly, and Azure TTS
 */

import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

export interface TTSOptions {
  provider: 'openai' | 'elevenlabs' | 'google' | 'amazon' | 'azure';
  voice: string;
  text: string;
  speed?: number;
  stability?: number;
  similarityBoost?: number;
  pitch?: number;
  style?: string; // For Azure style support
  engine?: string; // For Amazon Polly engine selection
  scriptMode?: 'podcast' | 'webcast' | 'video' | 'audio';
  voiceSettings?: {
    stability: number;
    similarityBoost: number;
    style: number;
    speed: number;
  };
}

export interface TTSResult {
  audioUrl: string;
  audioBlob: Blob;
  duration: number;
  provider: string;
  voice: string;
  voiceName?: string;
  charactersProcessed: number;
  estimatedCost: number;
}

// Voice options
export const OPENAI_VOICES = [
  { value: 'alloy', label: 'Alloy', description: 'Neutral, balanced' },
  { value: 'echo', label: 'Echo', description: 'Warm, conversational' },
  { value: 'fable', label: 'Fable', description: 'Expressive, British' },
  { value: 'onyx', label: 'Onyx', description: 'Deep, authoritative' },
  { value: 'nova', label: 'Nova', description: 'Energetic, friendly' },
  { value: 'shimmer', label: 'Shimmer', description: 'Clear, professional' },
];

export const ELEVENLABS_VOICES = [
  { value: 'CwhRBWXzGAHq8TQ4Fs17', label: 'Roger', description: 'Male, American' },
  { value: 'EXAVITQu4vr4xnSDxMaL', label: 'Sarah', description: 'Female, American' },
  { value: 'FGY2WhTYpPnrIDTdsKH5', label: 'Laura', description: 'Female, American' },
  { value: 'IKne3meq5aSn9XLyUdCD', label: 'Charlie', description: 'Male, British' },
  { value: 'JBFqnCBsd6RMkjVDRZzb', label: 'George', description: 'Male, British' },
  { value: 'onwK4e9ZLuTAKqWW03F9', label: 'Daniel', description: 'Male, British' },
  { value: 'pFZP5JQG7iQjIQuC4Bku', label: 'Lily', description: 'Female, British' },
  { value: 'nPczCjzI2devNBz1zQrb', label: 'Brian', description: 'Male, narrator' },
  { value: 'cgSgspJ2msm6clMCkdW9', label: 'Jessica', description: 'Female, professional' },
];

export const GOOGLE_VOICES = [
  // US English - Neural2
  { value: 'en-US-Neural2-A', label: 'Adam (US)', description: 'Male, American' },
  { value: 'en-US-Neural2-C', label: 'Claire (US)', description: 'Female, American' },
  { value: 'en-US-Neural2-D', label: 'David (US)', description: 'Male, American' },
  { value: 'en-US-Neural2-E', label: 'Emma (US)', description: 'Female, American' },
  { value: 'en-US-Neural2-F', label: 'Fiona (US)', description: 'Female, American' },
  { value: 'en-US-Neural2-G', label: 'Grace (US)', description: 'Female, American' },
  { value: 'en-US-Neural2-I', label: 'Ian (US)', description: 'Male, American' },
  { value: 'en-US-Neural2-J', label: 'James (US)', description: 'Male, American' },
  // UK English
  { value: 'en-GB-Neural2-A', label: 'Alice (UK)', description: 'Female, British' },
  { value: 'en-GB-Neural2-B', label: 'Benjamin (UK)', description: 'Male, British' },
  { value: 'en-GB-Neural2-C', label: 'Charlotte (UK)', description: 'Female, British' },
  { value: 'en-GB-Neural2-D', label: 'Daniel (UK)', description: 'Male, British' },
  // Studio (Premium)
  { value: 'en-US-Studio-M', label: 'Studio Male', description: 'Premium, Male' },
  { value: 'en-US-Studio-O', label: 'Studio Female', description: 'Premium, Female' },
];

export const AMAZON_POLLY_VOICES = [
  // US English - Neural
  { value: 'Joanna', label: 'Joanna', description: 'Female, American Neural' },
  { value: 'Matthew', label: 'Matthew', description: 'Male, American Neural' },
  { value: 'Kendra', label: 'Kendra', description: 'Female, American Neural' },
  { value: 'Kimberly', label: 'Kimberly', description: 'Female, American Neural' },
  { value: 'Salli', label: 'Salli', description: 'Female, American Neural' },
  { value: 'Joey', label: 'Joey', description: 'Male, American Neural' },
  { value: 'Justin', label: 'Justin', description: 'Male, American Neural' },
  { value: 'Kevin', label: 'Kevin', description: 'Male, American Neural' },
  { value: 'Ruth', label: 'Ruth', description: 'Female, American Neural' },
  { value: 'Stephen', label: 'Stephen', description: 'Male, American Neural' },
  // UK English - Neural
  { value: 'Amy', label: 'Amy', description: 'Female, British Neural' },
  { value: 'Emma', label: 'Emma (UK)', description: 'Female, British Neural' },
  { value: 'Brian', label: 'Brian (UK)', description: 'Male, British Neural' },
  { value: 'Arthur', label: 'Arthur', description: 'Male, British Neural' },
  // Australian English
  { value: 'Olivia', label: 'Olivia (AU)', description: 'Female, Australian Neural' },
  // Generative (Long-form)
  { value: 'Matthew-generative', label: 'Matthew (Long-form)', description: 'Male, Generative Engine' },
  { value: 'Ruth-generative', label: 'Ruth (Long-form)', description: 'Female, Generative Engine' },
];

export const AZURE_VOICES = [
  // US English - Neural
  { value: 'en-US-JennyNeural', label: 'Jenny', description: 'Female, American', styles: ['cheerful', 'sad', 'angry'] },
  { value: 'en-US-GuyNeural', label: 'Guy', description: 'Male, American', styles: ['newscast'] },
  { value: 'en-US-AriaNeural', label: 'Aria', description: 'Female, American', styles: ['chat', 'customerservice', 'narration'] },
  { value: 'en-US-DavisNeural', label: 'Davis', description: 'Male, American', styles: ['chat', 'angry', 'cheerful'] },
  { value: 'en-US-AmberNeural', label: 'Amber', description: 'Female, American' },
  { value: 'en-US-AnaNeural', label: 'Ana (Child)', description: 'Female, American' },
  { value: 'en-US-AshleyNeural', label: 'Ashley', description: 'Female, American' },
  { value: 'en-US-BrandonNeural', label: 'Brandon', description: 'Male, American' },
  { value: 'en-US-ChristopherNeural', label: 'Christopher', description: 'Male, American' },
  { value: 'en-US-CoraNeural', label: 'Cora', description: 'Female, American' },
  { value: 'en-US-ElizabethNeural', label: 'Elizabeth', description: 'Female, American' },
  { value: 'en-US-EricNeural', label: 'Eric', description: 'Male, American' },
  { value: 'en-US-JacobNeural', label: 'Jacob', description: 'Male, American' },
  { value: 'en-US-JaneNeural', label: 'Jane', description: 'Female, American', styles: ['angry', 'cheerful', 'sad'] },
  { value: 'en-US-JasonNeural', label: 'Jason', description: 'Male, American', styles: ['angry', 'cheerful', 'sad'] },
  { value: 'en-US-MichelleNeural', label: 'Michelle', description: 'Female, American' },
  { value: 'en-US-MonicaNeural', label: 'Monica', description: 'Female, American' },
  { value: 'en-US-NancyNeural', label: 'Nancy', description: 'Female, American', styles: ['angry', 'cheerful', 'sad'] },
  { value: 'en-US-RogerNeural', label: 'Roger', description: 'Male, American' },
  { value: 'en-US-SaraNeural', label: 'Sara', description: 'Female, American', styles: ['angry', 'cheerful', 'sad'] },
  { value: 'en-US-SteffanNeural', label: 'Steffan', description: 'Male, American' },
  { value: 'en-US-TonyNeural', label: 'Tony', description: 'Male, American', styles: ['angry', 'cheerful', 'sad'] },
  // UK English - Neural
  { value: 'en-GB-SoniaNeural', label: 'Sonia', description: 'Female, British', styles: ['cheerful', 'sad'] },
  { value: 'en-GB-RyanNeural', label: 'Ryan', description: 'Male, British', styles: ['chat', 'cheerful'] },
  { value: 'en-GB-LibbyNeural', label: 'Libby', description: 'Female, British' },
  { value: 'en-GB-AbbiNeural', label: 'Abbi', description: 'Female, British' },
  { value: 'en-GB-AlfieNeural', label: 'Alfie', description: 'Male, British' },
  { value: 'en-GB-BellaNeural', label: 'Bella', description: 'Female, British' },
  { value: 'en-GB-ElliotNeural', label: 'Elliot', description: 'Male, British' },
  { value: 'en-GB-EthanNeural', label: 'Ethan', description: 'Male, British' },
  { value: 'en-GB-HollieNeural', label: 'Hollie', description: 'Female, British' },
  { value: 'en-GB-MaisieNeural', label: 'Maisie (Child)', description: 'Female, British' },
  { value: 'en-GB-NoahNeural', label: 'Noah', description: 'Male, British' },
  { value: 'en-GB-OliverNeural', label: 'Oliver', description: 'Male, British' },
  { value: 'en-GB-OliviaNeural', label: 'Olivia (UK)', description: 'Female, British' },
  { value: 'en-GB-ThomasNeural', label: 'Thomas', description: 'Male, British' },
  // Australian English
  { value: 'en-AU-NatashaNeural', label: 'Natasha', description: 'Female, Australian' },
  { value: 'en-AU-WilliamNeural', label: 'William', description: 'Male, Australian' },
];

export function useTTSGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastResult, setLastResult] = useState<TTSResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Generate TTS with OpenAI
  const generateOpenAI = useCallback(async (options: TTSOptions): Promise<TTSResult> => {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/openai-tts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          text: options.text,
          voice: options.voice,
          speed: options.speed || 1.0,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'TTS generation failed');
    }

    const data = await response.json();

    // Handle chunked response
    if (data.needsChunking) {
      // For long text, process chunks
      const audioChunks: Blob[] = [];
      for (let i = 0; i < data.chunks.length; i++) {
        const chunkResponse = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/openai-tts`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({
              text: data.chunks[i],
              voice: options.voice,
              speed: options.speed || 1.0,
              chunkIndex: i,
              totalChunks: data.chunks.length,
            }),
          }
        );

        if (!chunkResponse.ok) throw new Error(`Chunk ${i + 1} failed`);
        
        const chunkData = await chunkResponse.json();
        const chunkBlob = base64ToBlob(chunkData.audioContent, 'audio/mpeg');
        audioChunks.push(chunkBlob);
      }

      // Combine chunks
      const combinedBlob = new Blob(audioChunks, { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(combinedBlob);
      const duration = await getAudioDuration(audioUrl);

      return {
        audioUrl,
        audioBlob: combinedBlob,
        duration,
        provider: 'openai',
        voice: options.voice,
        charactersProcessed: options.text.length,
        estimatedCost: (options.text.length / 1000) * 0.015,
      };
    }

    // Single response
    const audioBlob = base64ToBlob(data.audioContent, 'audio/mpeg');
    const audioUrl = URL.createObjectURL(audioBlob);
    const duration = await getAudioDuration(audioUrl);

    return {
      audioUrl,
      audioBlob,
      duration,
      provider: 'openai',
      voice: options.voice,
      charactersProcessed: options.text.length,
      estimatedCost: (options.text.length / 1000) * 0.015,
    };
  }, []);

  // Generate TTS with ElevenLabs
  const generateElevenLabs = useCallback(async (options: TTSOptions): Promise<TTSResult> => {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-voice`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          text: options.text,
          voice: options.voice,
          model: 'eleven_multilingual_v2',
          scriptMode: options.scriptMode, // Pass script mode for mode-aware settings
          voiceSettings: options.voiceSettings ? {
            stability: options.voiceSettings.stability,
            similarity_boost: options.voiceSettings.similarityBoost,
            style: options.voiceSettings.style,
            speed: options.voiceSettings.speed,
          } : undefined,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'TTS generation failed');
    }

    const data = await response.json();
    
    // Use data URI for proper decoding
    const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
    const audioBlob = base64ToBlob(data.audioContent, 'audio/mpeg');
    const duration = await getAudioDuration(audioUrl);

    return {
      audioUrl,
      audioBlob,
      duration,
      provider: 'elevenlabs',
      voice: data.voice || options.voice,
      charactersProcessed: options.text.length,
      estimatedCost: (options.text.length / 1000) * 0.03,
    };
  }, []);

  // Generate TTS with Google Cloud
  const generateGoogle = useCallback(async (options: TTSOptions): Promise<TTSResult> => {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-tts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          text: options.text,
          voice: options.voice,
          speed: options.speed || 1.0,
          pitch: options.pitch || 0,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Google TTS generation failed');
    }

    const data = await response.json();
    
    // Use data URI for proper decoding
    const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
    const audioBlob = base64ToBlob(data.audioContent, 'audio/mpeg');
    const duration = await getAudioDuration(audioUrl);

    return {
      audioUrl,
      audioBlob,
      duration,
      provider: 'google',
      voice: options.voice,
      voiceName: data.voiceName,
      charactersProcessed: options.text.length,
      estimatedCost: (options.text.length / 1000000) * 4, // Google pricing ~$4 per 1M chars
    };
  }, []);

  // Generate TTS with Amazon Polly
  const generateAmazon = useCallback(async (options: TTSOptions): Promise<TTSResult> => {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/amazon-polly`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          text: options.text,
          voice: options.voice,
          speed: options.speed || 1.0,
          engine: options.engine, // 'neural' or 'generative'
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Amazon Polly TTS generation failed');
    }

    const data = await response.json();
    
    // Use data URI for proper decoding
    const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
    const audioBlob = base64ToBlob(data.audioContent, 'audio/mpeg');
    const duration = await getAudioDuration(audioUrl);

    return {
      audioUrl,
      audioBlob,
      duration,
      provider: 'amazon',
      voice: options.voice,
      voiceName: data.voiceName,
      charactersProcessed: options.text.length,
      estimatedCost: (options.text.length / 1000000) * 4, // Polly Neural ~$4 per 1M chars
    };
  }, []);

  // Generate TTS with Azure
  const generateAzure = useCallback(async (options: TTSOptions): Promise<TTSResult> => {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/azure-tts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          text: options.text,
          voice: options.voice,
          speed: options.speed || 1.0,
          pitch: options.pitch || 0,
          style: options.style, // e.g., 'cheerful', 'sad', 'angry'
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Azure TTS generation failed');
    }

    const data = await response.json();
    
    // Use data URI for proper decoding
    const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
    const audioBlob = base64ToBlob(data.audioContent, 'audio/mpeg');
    const duration = await getAudioDuration(audioUrl);

    return {
      audioUrl,
      audioBlob,
      duration,
      provider: 'azure',
      voice: options.voice,
      voiceName: data.voiceName,
      charactersProcessed: options.text.length,
      estimatedCost: (options.text.length / 1000000) * 4, // Azure ~$4 per 1M chars for neural
    };
  }, []);

  // Main generate function with fallback support
  const generate = useCallback(async (options: TTSOptions): Promise<TTSResult | null> => {
    if (!options.text?.trim()) {
      toast.error('No text to generate');
      return null;
    }

    setIsGenerating(true);
    setError(null);

    const providerNames: Record<string, string> = {
      elevenlabs: 'ElevenLabs',
      openai: 'OpenAI',
      google: 'Google Cloud',
      amazon: 'Amazon Polly',
      azure: 'Microsoft Azure',
    };

    // Define fallback chain: if primary fails, try fallback
    const fallbackProvider: Record<string, TTSOptions['provider']> = {
      google: 'elevenlabs',
      amazon: 'elevenlabs',
      azure: 'elevenlabs',
      openai: 'elevenlabs',
    };

    const generateWithProvider = async (provider: TTSOptions['provider'], opts: TTSOptions): Promise<TTSResult> => {
      switch (provider) {
        case 'elevenlabs':
          return await generateElevenLabs(opts);
        case 'google':
          return await generateGoogle(opts);
        case 'amazon':
          return await generateAmazon(opts);
        case 'azure':
          return await generateAzure(opts);
        case 'openai':
        default:
          return await generateOpenAI(opts);
      }
    };

    try {
      toast.info(`Generating TTS with ${providerNames[options.provider]}...`);

      let result: TTSResult;
      
      try {
        result = await generateWithProvider(options.provider, options);
      } catch (primaryError) {
        // If primary provider fails and there's a fallback, try fallback
        const fallback = fallbackProvider[options.provider];
        if (fallback && options.provider !== 'elevenlabs') {
          console.warn(`[TTS] ${providerNames[options.provider]} failed, falling back to ${providerNames[fallback]}:`, primaryError);
          toast.warning(`${providerNames[options.provider]} failed, trying ${providerNames[fallback]}...`);
          
          // Get default voice for fallback provider
          const fallbackVoice = fallback === 'elevenlabs' ? 'EXAVITQu4vr4xnSDxMaL' : options.voice; // Sarah voice as default
          
          result = await generateWithProvider(fallback, {
            ...options,
            provider: fallback,
            voice: fallbackVoice,
          });
        } else {
          throw primaryError;
        }
      }

      setLastResult(result);
      toast.success(`TTS generated with ${providerNames[result.provider as keyof typeof providerNames]}! Duration: ${result.duration.toFixed(1)}s`);
      
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'TTS generation failed';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [generateOpenAI, generateElevenLabs, generateGoogle, generateAmazon, generateAzure]);

  // Play generated audio
  const play = useCallback(() => {
    if (!lastResult?.audioUrl) return;

    if (audioRef.current) {
      audioRef.current.pause();
    }

    audioRef.current = new Audio(lastResult.audioUrl);
    audioRef.current.play();
  }, [lastResult]);

  // Stop playback
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  // Download audio
  const download = useCallback((filename?: string) => {
    if (!lastResult?.audioBlob) return;

    const url = URL.createObjectURL(lastResult.audioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `tts-${lastResult.provider}-${Date.now()}.mp3`;
    a.click();
    URL.revokeObjectURL(url);
  }, [lastResult]);

  // Get audio element for mixing
  const getAudioElement = useCallback((): HTMLAudioElement | null => {
    if (!lastResult?.audioUrl) return null;
    
    if (!audioRef.current || audioRef.current.src !== lastResult.audioUrl) {
      audioRef.current = new Audio(lastResult.audioUrl);
    }
    
    return audioRef.current;
  }, [lastResult]);

  return {
    isGenerating,
    lastResult,
    error,
    generate,
    play,
    stop,
    download,
    getAudioElement,
    openaiVoices: OPENAI_VOICES,
    elevenlabsVoices: ELEVENLABS_VOICES,
    googleVoices: GOOGLE_VOICES,
    amazonVoices: AMAZON_POLLY_VOICES,
    azureVoices: AZURE_VOICES,
  };
}

// Helper: Convert base64 to Blob
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

// Helper: Get audio duration with readyState check to prevent race condition
async function getAudioDuration(url: string): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio(url);
    
    const handleMetadata = () => {
      resolve(audio.duration || 0);
      cleanup();
    };
    
    const handleError = () => {
      resolve(0);
      cleanup();
    };
    
    const cleanup = () => {
      audio.removeEventListener('loadedmetadata', handleMetadata);
      audio.removeEventListener('error', handleError);
    };
    
    // Check if already loaded (cached audio)
    if (audio.readyState >= 1 && audio.duration) {
      resolve(audio.duration);
      return;
    }
    
    audio.addEventListener('loadedmetadata', handleMetadata);
    audio.addEventListener('error', handleError);
    
    // Timeout fallback to prevent hanging
    setTimeout(() => {
      if (audio.duration) {
        resolve(audio.duration);
      } else {
        resolve(0);
      }
      cleanup();
    }, 10000);
  });
}
