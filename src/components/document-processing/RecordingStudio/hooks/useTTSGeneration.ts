/**
 * TTS Generation Hook - Real integration with ElevenLabs and OpenAI
 */

import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

export interface TTSOptions {
  provider: 'openai' | 'elevenlabs';
  voice: string;
  text: string;
  speed?: number;
  stability?: number;
  similarityBoost?: number;
}

export interface TTSResult {
  audioUrl: string;
  audioBlob: Blob;
  duration: number;
  provider: string;
  voice: string;
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

  // Main generate function
  const generate = useCallback(async (options: TTSOptions): Promise<TTSResult | null> => {
    if (!options.text?.trim()) {
      toast.error('No text to generate');
      return null;
    }

    setIsGenerating(true);
    setError(null);

    try {
      toast.info(`Generating TTS with ${options.provider === 'elevenlabs' ? 'ElevenLabs' : 'OpenAI'}...`);

      const result = options.provider === 'elevenlabs'
        ? await generateElevenLabs(options)
        : await generateOpenAI(options);

      setLastResult(result);
      toast.success(`TTS generated! Duration: ${result.duration.toFixed(1)}s`);
      
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'TTS generation failed';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [generateOpenAI, generateElevenLabs]);

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

// Helper: Get audio duration
async function getAudioDuration(url: string): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio(url);
    audio.addEventListener('loadedmetadata', () => {
      resolve(audio.duration || 0);
    });
    audio.addEventListener('error', () => {
      resolve(0);
    });
  });
}
