/**
 * Audio File Filter Utilities - Shared between GenieStudio and RecordingStudio
 * Extracts filter logic to avoid duplication
 */

export interface VoiceoverData {
  id: string;
  name: string;
  url?: string;
  timestamp?: number;
  scriptText?: string; // Enhanced/clean script used for TTS
  originalScript?: string; // Original script before enhancement
  scriptType?: 'video' | 'audio' | 'tts' | 'voiceover' | 'narration' | 'instrumental' | 'music';
  metadataType?: string;
}

export interface MusicItem {
  id: string;
  name: string;
  url?: string;
}

// Check if file is instrumental/background music
// PRIORITY: metadataType (from database) > scriptType > name patterns
export function isInstrumental(v: VoiceoverData): boolean {
  // 1. Database metadata is the HIGHEST priority - most reliable source
  if (v.metadataType === 'instrumental' || v.metadataType === 'music' || v.metadataType === 'background_music') return true;
  if (v.metadataType === 'voiceover' || v.metadataType === 'tts' || v.metadataType === 'custom-voice') return false;
  
  // 2. Script type next
  if (v.scriptType === 'instrumental' || v.scriptType === 'music') return true;
  if (v.scriptType === 'voiceover' || v.scriptType === 'tts' || v.scriptType === 'narration') return false;
  
  // 3. Fall back to name patterns only if no metadata
  const lowerName = v.name.toLowerCase();
  if (lowerName.includes('instrumental')) return true;
  if (lowerName.includes('bgm')) return true;
  if (lowerName.includes('background_music')) return true;
  if (lowerName.includes('music') && !lowerName.includes('voiceover') && !lowerName.includes('voice')) return true;
  if (lowerName.startsWith('background') && !lowerName.includes('voice')) return true;
  
  return false;
}

// Check if file is TTS generated (text-to-speech from script)
// PRIORITY: metadataType (from database) > scriptType > name patterns
// CRITICAL: If metadataType is "voiceover", this file is NOT TTS regardless of name
export function isTTSFile(v: VoiceoverData): boolean {
  // 1. Database metadata is the HIGHEST priority - NEVER override this
  // If marked as voiceover or instrumental in database, it's NOT TTS
  if (v.metadataType === 'voiceover' || v.metadataType === 'custom-voice') return false;
  if (v.metadataType === 'instrumental' || v.metadataType === 'music' || v.metadataType === 'background_music') return false;
  // If explicitly marked as TTS in database
  if (v.metadataType === 'tts') return true;
  
  // 2. Script type next
  if (v.scriptType === 'voiceover' || v.scriptType === 'narration') return false;
  if (v.scriptType === 'instrumental' || v.scriptType === 'music') return false;
  if (v.scriptType === 'tts') return true;
  
  // 3. Fall back to name patterns only if no metadata
  const lowerName = v.name.toLowerCase();
  
  // Name patterns for TTS - must be explicit TTS markers
  if (lowerName.includes(' tts') || lowerName.includes('_tts') || lowerName.includes('-tts')) return true;
  if (lowerName.includes('enhanced tts')) return true;
  if (lowerName.includes('text-to-speech')) return true;
  
  // Only if scriptType is 'audio' AND name includes TTS explicitly
  if (v.scriptType === 'audio' && lowerName.includes('tts')) return true;
  
  // NOTE: Having scriptText alone does NOT make it TTS
  // Many voiceovers have associated script text for reference
  
  return false;
}

// Check if file is a true voiceover (recorded narration, not TTS or music)
// PRIORITY: metadataType (from database) > scriptType > name patterns
export function isVoiceover(v: VoiceoverData): boolean {
  // 1. Database metadata is the HIGHEST priority
  if (v.metadataType === 'voiceover') return true;
  if (v.metadataType === 'tts' || v.metadataType === 'instrumental' || v.metadataType === 'music' || v.metadataType === 'background_music') return false;
  
  // 2. Explicit voiceover/narration type from scriptType
  if (v.scriptType === 'voiceover' || v.scriptType === 'narration') return true;
  if (v.scriptType === 'tts' || v.scriptType === 'instrumental' || v.scriptType === 'music') return false;
  
  // 3. Name patterns for voiceover (only if no metadata)
  const lowerName = v.name.toLowerCase();
  if (lowerName.includes('voiceover') || lowerName.includes('voice-over')) return true;
  if (lowerName.includes('narration') || lowerName.includes('narrator')) return true;
  if (lowerName.includes('recording') && !lowerName.includes('music')) return true;
  
  return false;
}

// Check if file is a custom recorded voice
export function isCustomVoice(v: VoiceoverData): boolean {
  // 1. Database metadata is the HIGHEST priority
  if (v.metadataType === 'custom-voice') return true;
  
  // 2. Name patterns
  const lowerName = v.name.toLowerCase();
  if (lowerName.includes('my voice') || lowerName.includes('custom voice')) return true;
  if (lowerName.includes('voice sample') || lowerName.includes('voice recording')) return true;
  
  return false;
}

// Filter voiceovers to get only instrumental/music files
export function filterInstrumentalFiles<T extends VoiceoverData>(files: T[]): T[] {
  return files.filter(isInstrumental);
}

// Filter to get only TTS files
export function filterTTSFiles<T extends VoiceoverData>(files: T[]): T[] {
  return files.filter(v => !isInstrumental(v) && isTTSFile(v));
}

// Filter to get only actual voiceovers (not TTS, not instrumental)
export function filterActualVoiceovers<T extends VoiceoverData>(files: T[]): T[] {
  return files.filter(v => {
    if (isInstrumental(v)) return false;
    if (isTTSFile(v)) return false;
    if (isVoiceover(v)) return true;
    return true; // Default: remaining files are assumed to be voiceovers
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
