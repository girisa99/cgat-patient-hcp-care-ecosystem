/**
 * Audio Split & Stitch Utility
 * 
 * Handles the Alibaba lip-sync 20s limit by:
 * 1. Splitting long TTS text into sentence-boundary chunks (~18s each)
 * 2. Generating TTS per chunk (with request stitching context)
 * 3. Concatenating audio blobs into a single file
 * 
 * Uses existing useTTSGeneration — does NOT create a new service.
 * Integrates with EP04 production config voice routing.
 */

import type { TTSOptions, TTSResult } from '@/components/document-processing/RecordingStudio/hooks/useTTSGeneration';

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const MAX_CHUNK_DURATION_SECONDS = 18;  // Stay under 20s Alibaba limit
const AVG_CHARS_PER_SECOND = 14;        // ~140 WPM average narration
const MAX_CHARS_PER_CHUNK = MAX_CHUNK_DURATION_SECONDS * AVG_CHARS_PER_SECOND; // ~252 chars

// ─── TYPES ───────────────────────────────────────────────────────────────────
export interface AudioChunk {
  index: number;
  text: string;
  previousText?: string;   // For ElevenLabs request stitching
  nextText?: string;        // For ElevenLabs request stitching
  audioBlob?: Blob;
  audioUrl?: string;
  duration?: number;
}

export interface SplitStitchResult {
  chunks: AudioChunk[];
  combinedBlob: Blob;
  combinedUrl: string;
  totalDuration: number;
  provider: string;
  voice: string;
}

export interface SplitStitchProgress {
  currentChunk: number;
  totalChunks: number;
  phase: 'splitting' | 'generating' | 'stitching' | 'done';
  percentage: number;
}

// ─── TEXT SPLITTING ──────────────────────────────────────────────────────────
/**
 * Split text into chunks at sentence boundaries, respecting max character limit.
 * Preserves natural speech pauses for better TTS quality.
 */
export function splitTextIntoChunks(text: string, maxChars = MAX_CHARS_PER_CHUNK): string[] {
  if (text.length <= maxChars) return [text];

  const sentences = text.match(/[^.!?]+[.!?]+\s*/g) || [text];
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChars && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Create AudioChunk objects with stitching context (previous/next text).
 * This enables ElevenLabs request stitching for natural transitions.
 */
export function createChunksWithContext(text: string, maxChars = MAX_CHARS_PER_CHUNK): AudioChunk[] {
  const textChunks = splitTextIntoChunks(text, maxChars);
  
  return textChunks.map((chunkText, index) => ({
    index,
    text: chunkText,
    previousText: index > 0 ? getLastSentences(textChunks[index - 1], 2) : undefined,
    nextText: index < textChunks.length - 1 ? getFirstSentences(textChunks[index + 1], 2) : undefined,
  }));
}

// ─── AUDIO STITCHING ─────────────────────────────────────────────────────────
/**
 * Concatenate multiple audio blobs into a single blob.
 * Works with MP3 format — simple concatenation is valid for MP3 frames.
 */
export function stitchAudioBlobs(blobs: Blob[]): Blob {
  return new Blob(blobs, { type: 'audio/mpeg' });
}

// ─── ORCHESTRATOR ────────────────────────────────────────────────────────────
/**
 * Full split-generate-stitch pipeline.
 * 
 * @param text - Full script text
 * @param ttsOptions - Base TTS options (provider, voice, etc.)
 * @param generateFn - The generate function from useTTSGeneration hook
 * @param onProgress - Progress callback
 */
export async function splitAndStitchTTS(
  text: string,
  ttsOptions: Omit<TTSOptions, 'text'>,
  generateFn: (options: TTSOptions) => Promise<TTSResult | null>,
  onProgress?: (progress: SplitStitchProgress) => void,
): Promise<SplitStitchResult | null> {
  // Phase 1: Split
  onProgress?.({ currentChunk: 0, totalChunks: 0, phase: 'splitting', percentage: 0 });
  const chunks = createChunksWithContext(text);
  
  if (chunks.length === 1) {
    // No splitting needed — generate directly
    const result = await generateFn({ ...ttsOptions, text });
    if (!result) return null;
    return {
      chunks: [{ index: 0, text, audioBlob: result.audioBlob, audioUrl: result.audioUrl, duration: result.duration }],
      combinedBlob: result.audioBlob,
      combinedUrl: result.audioUrl,
      totalDuration: result.duration,
      provider: result.provider,
      voice: result.voice,
    };
  }

  console.log(`[AudioSplitStitch] Splitting ${text.length} chars into ${chunks.length} chunks`);

  // Phase 2: Generate TTS per chunk (sequential for stitching consistency)
  const audioChunks: AudioChunk[] = [];
  
  for (let i = 0; i < chunks.length; i++) {
    onProgress?.({
      currentChunk: i + 1,
      totalChunks: chunks.length,
      phase: 'generating',
      percentage: Math.round(((i + 1) / chunks.length) * 80),
    });

    const result = await generateFn({
      ...ttsOptions,
      text: chunks[i].text,
    });

    if (!result) {
      console.error(`[AudioSplitStitch] Chunk ${i + 1}/${chunks.length} failed`);
      return null;
    }

    audioChunks.push({
      ...chunks[i],
      audioBlob: result.audioBlob,
      audioUrl: result.audioUrl,
      duration: result.duration,
    });
  }

  // Phase 3: Stitch
  onProgress?.({ currentChunk: chunks.length, totalChunks: chunks.length, phase: 'stitching', percentage: 90 });
  
  const blobs = audioChunks.map(c => c.audioBlob!).filter(Boolean);
  const combinedBlob = stitchAudioBlobs(blobs);
  const combinedUrl = URL.createObjectURL(combinedBlob);
  const totalDuration = audioChunks.reduce((sum, c) => sum + (c.duration || 0), 0);

  onProgress?.({ currentChunk: chunks.length, totalChunks: chunks.length, phase: 'done', percentage: 100 });

  console.log(`[AudioSplitStitch] ✅ Stitched ${chunks.length} chunks → ${totalDuration.toFixed(1)}s total`);

  return {
    chunks: audioChunks,
    combinedBlob,
    combinedUrl,
    totalDuration,
    provider: ttsOptions.provider,
    voice: ttsOptions.voice,
  };
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function getLastSentences(text: string, count: number): string {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  return sentences.slice(-count).join(' ').trim();
}

function getFirstSentences(text: string, count: number): string {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  return sentences.slice(0, count).join(' ').trim();
}

/**
 * Estimate if text will exceed the lip-sync duration limit.
 * Useful for UI warnings before generation.
 */
export function estimateAudioDuration(text: string, speed = 1.0): number {
  return (text.length / AVG_CHARS_PER_SECOND) / speed;
}

export function needsSplitting(text: string, speed = 1.0, maxSeconds = 20): boolean {
  return estimateAudioDuration(text, speed) > maxSeconds;
}
