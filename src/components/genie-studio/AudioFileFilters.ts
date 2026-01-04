/**
 * Audio File Filter Utilities - Shared between GenieStudio and RecordingStudio
 * Extracts filter logic to avoid duplication
 * 
 * PRIORITY ORDER for classification:
 * 1. metadataType (from database metadata.type) - HIGHEST priority, most reliable
 * 2. scriptType (from script generation context)
 * 3. Name patterns (fallback only)
 * 
 * CLASSIFICATION TYPES:
 * - instrumental/music/background_music: Background music files
 * - tts: Text-to-speech generated audio
 * - voiceover: Recorded narration/voiceover
 * - custom-voice: User-recorded custom voice samples
 */

export interface VoiceoverData {
  id: string;
  name: string;
  url?: string;
  timestamp?: number;
  scriptText?: string; // Enhanced/clean script used for TTS
  originalScript?: string; // Original script before enhancement
  scriptType?: 'video' | 'audio' | 'tts' | 'voiceover' | 'narration' | 'instrumental' | 'music';
  metadataType?: string; // From database metadata.type field - HIGHEST priority
}

export interface MusicItem {
  id: string;
  name: string;
  url?: string;
}

// Audio type constants for consistent classification
export const AUDIO_TYPES = {
  INSTRUMENTAL: ['instrumental', 'music', 'background_music', 'bgm'],
  TTS: ['tts', 'text-to-speech', 'generated'],
  VOICEOVER: ['voiceover', 'voice-over', 'narration', 'narrator', 'recording'],
  CUSTOM_VOICE: ['custom-voice', 'custom_voice', 'my-voice', 'voice-sample'],
} as const;

/**
 * Check if file is instrumental/background music
 * PRIORITY: metadataType (from database) > scriptType > name patterns
 */
export function isInstrumental(v: VoiceoverData): boolean {
  // 1. Database metadata is the HIGHEST priority - most reliable source
  if (v.metadataType) {
    const mt = v.metadataType.toLowerCase();
    if (AUDIO_TYPES.INSTRUMENTAL.some(t => mt === t || mt.includes(t))) return true;
    // If explicitly NOT instrumental, return false early
    if (AUDIO_TYPES.VOICEOVER.some(t => mt === t) || AUDIO_TYPES.TTS.some(t => mt === t)) return false;
  }
  
  // 2. Script type next
  if (v.scriptType) {
    const st = v.scriptType.toLowerCase();
    if (st === 'instrumental' || st === 'music') return true;
    if (st === 'voiceover' || st === 'tts' || st === 'narration') return false;
  }
  
  // 3. Fall back to name patterns only if no metadata
  const lowerName = v.name.toLowerCase();
  
  // Explicit instrumental markers
  if (lowerName.includes('instrumental')) return true;
  if (lowerName.includes('bgm') || lowerName.includes('background_music')) return true;
  
  // "music" without voice-related terms
  if (lowerName.includes('music') && 
      !lowerName.includes('voiceover') && 
      !lowerName.includes('voice') &&
      !lowerName.includes('tts')) return true;
  
  // "background" without voice
  if (lowerName.startsWith('background') && 
      !lowerName.includes('voice') &&
      !lowerName.includes('narr')) return true;
  
  return false;
}

/**
 * Check if file is TTS generated (text-to-speech from script)
 * PRIORITY: metadataType (from database) > scriptType > name patterns
 * CRITICAL: If metadataType is "voiceover", this file is NOT TTS regardless of name
 */
export function isTTSFile(v: VoiceoverData): boolean {
  // 1. Database metadata is the HIGHEST priority - NEVER override this
  if (v.metadataType) {
    const mt = v.metadataType.toLowerCase();
    // If marked as voiceover, instrumental, or custom-voice in database, it's NOT TTS
    if (AUDIO_TYPES.VOICEOVER.some(t => mt === t)) return false;
    if (AUDIO_TYPES.INSTRUMENTAL.some(t => mt === t || mt.includes(t))) return false;
    if (AUDIO_TYPES.CUSTOM_VOICE.some(t => mt === t || mt.includes(t))) return false;
    // If explicitly marked as TTS in database
    if (AUDIO_TYPES.TTS.some(t => mt === t || mt.includes(t))) return true;
  }
  
  // 2. Script type next
  if (v.scriptType) {
    const st = v.scriptType.toLowerCase();
    if (st === 'voiceover' || st === 'narration') return false;
    if (st === 'instrumental' || st === 'music') return false;
    if (st === 'tts') return true;
  }
  
  // 3. Fall back to name patterns only if no metadata
  const lowerName = v.name.toLowerCase();
  
  // Explicit TTS markers in name
  if (lowerName.includes(' tts') || lowerName.includes('_tts') || lowerName.includes('-tts')) return true;
  if (lowerName.includes('enhanced tts') || lowerName.includes('enhanced-tts')) return true;
  if (lowerName.includes('text-to-speech') || lowerName.includes('text to speech')) return true;
  
  // Only if scriptType is 'audio' AND name includes TTS explicitly
  if (v.scriptType === 'audio' && lowerName.includes('tts')) return true;
  
  // NOTE: Having scriptText alone does NOT make it TTS
  // Many voiceovers have associated script text for reference
  
  return false;
}

/**
 * Check if file is a true voiceover (recorded narration, not TTS or music)
 * PRIORITY: metadataType (from database) > scriptType > name patterns
 */
export function isVoiceover(v: VoiceoverData): boolean {
  // 1. Database metadata is the HIGHEST priority
  if (v.metadataType) {
    const mt = v.metadataType.toLowerCase();
    if (mt === 'voiceover' || mt === 'narration') return true;
    if (AUDIO_TYPES.TTS.some(t => mt === t)) return false;
    if (AUDIO_TYPES.INSTRUMENTAL.some(t => mt === t || mt.includes(t))) return false;
  }
  
  // 2. Explicit voiceover/narration type from scriptType
  if (v.scriptType) {
    const st = v.scriptType.toLowerCase();
    if (st === 'voiceover' || st === 'narration') return true;
    if (st === 'tts' || st === 'instrumental' || st === 'music') return false;
  }
  
  // 3. Name patterns for voiceover (only if no metadata)
  const lowerName = v.name.toLowerCase();
  if (lowerName.includes('voiceover') || lowerName.includes('voice-over')) return true;
  if (lowerName.includes('narration') || lowerName.includes('narrator')) return true;
  if (lowerName.includes('recording') && !lowerName.includes('music') && !lowerName.includes('tts')) return true;
  
  return false;
}

/**
 * Check if file is a custom recorded voice sample
 */
export function isCustomVoice(v: VoiceoverData): boolean {
  // 1. Database metadata is the HIGHEST priority
  if (v.metadataType) {
    const mt = v.metadataType.toLowerCase();
    if (AUDIO_TYPES.CUSTOM_VOICE.some(t => mt === t || mt.includes(t))) return true;
  }
  
  // 2. Name patterns
  const lowerName = v.name.toLowerCase();
  if (lowerName.includes('my voice') || lowerName.includes('my-voice')) return true;
  if (lowerName.includes('custom voice') || lowerName.includes('custom-voice')) return true;
  if (lowerName.includes('voice sample') || lowerName.includes('voice-sample')) return true;
  if (lowerName.includes('voice recording') || lowerName.includes('voice-recording')) return true;
  
  return false;
}

/**
 * Get the audio type classification for a file
 * Returns: 'instrumental' | 'tts' | 'voiceover' | 'custom-voice' | 'unknown'
 */
export function getAudioType(v: VoiceoverData): string {
  if (isInstrumental(v)) return 'instrumental';
  if (isTTSFile(v)) return 'tts';
  if (isCustomVoice(v)) return 'custom-voice';
  if (isVoiceover(v)) return 'voiceover';
  return 'unknown';
}

// Filter voiceovers to get only instrumental/music files
export function filterInstrumentalFiles<T extends VoiceoverData>(files: T[]): T[] {
  return files.filter(isInstrumental);
}

// Filter to get only TTS files
export function filterTTSFiles<T extends VoiceoverData>(files: T[]): T[] {
  return files.filter(v => !isInstrumental(v) && isTTSFile(v));
}

// Filter to get only actual voiceovers (not TTS, not instrumental, not custom voice)
export function filterActualVoiceovers<T extends VoiceoverData>(files: T[]): T[] {
  return files.filter(v => {
    if (isInstrumental(v)) return false;
    if (isTTSFile(v)) return false;
    if (isCustomVoice(v)) return false;
    if (isVoiceover(v)) return true;
    // Default: remaining unclassified audio files go to voiceover tab
    return true;
  });
}

// Filter to get custom voice recordings
export function filterCustomVoices<T extends VoiceoverData>(files: T[]): T[] {
  return files.filter(isCustomVoice);
}

// Combine music lists avoiding duplicates
export function combineMusic(musicList: MusicItem[], voiceovers: VoiceoverData[]): MusicItem[] {
  const instrumentalFiles = filterInstrumentalFiles(voiceovers);
  
  return [
    ...musicList,
    ...instrumentalFiles
      .filter(v => !musicList.some(m => m.id === v.id))
      .map(v => ({
        id: v.id,
        name: v.name,
        url: v.url
      }))
  ];
}

/**
 * Debug helper: Log audio file classification
 */
export function debugAudioClassification(files: VoiceoverData[]): void {
  console.group('[AudioFileFilters] Classification Debug');
  files.forEach(f => {
    console.log(`${f.name}:`, {
      metadataType: f.metadataType || 'none',
      scriptType: f.scriptType || 'none',
      classification: getAudioType(f),
    });
  });
  console.groupEnd();
}
