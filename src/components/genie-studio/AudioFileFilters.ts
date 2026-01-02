/**
 * Audio File Filter Utilities - Shared between GenieStudio and RecordingStudio
 * Extracts filter logic to avoid duplication
 */

export interface VoiceoverData {
  id: string;
  name: string;
  url?: string;
  timestamp?: number;
  scriptText?: string;
  scriptType?: 'video' | 'audio' | 'tts' | 'voiceover' | 'narration' | 'instrumental' | 'music';
  metadataType?: string;
}

export interface MusicItem {
  id: string;
  name: string;
  url?: string;
}

// Check if file is instrumental/background music
export function isInstrumental(v: VoiceoverData): boolean {
  const lowerName = v.name.toLowerCase();
  
  // Check scriptType/metadataType first (most reliable)
  if (v.scriptType === 'instrumental' || v.scriptType === 'music') return true;
  if (v.metadataType === 'instrumental' || v.metadataType === 'music') return true;
  
  // Check name patterns
  if (lowerName.includes('instrumental')) return true;
  if (lowerName.includes('bgm')) return true;
  if (lowerName.includes('background_music')) return true;
  // "music" in name but NOT voiceover-related
  if (lowerName.includes('music') && !lowerName.includes('voiceover') && !lowerName.includes('voice')) return true;
  // Check for pure "background" but avoid false positives
  if (lowerName.startsWith('background') && !lowerName.includes('voice')) return true;
  
  return false;
}

// Check if file is TTS generated (text-to-speech from script)
export function isTTSFile(v: VoiceoverData): boolean {
  const lowerName = v.name.toLowerCase();
  
  // Primary check: scriptType
  if (v.scriptType === 'tts') return true;
  if (v.scriptType === 'audio') return true; // ScriptsManager uses 'audio' scriptType for TTS
  
  // Check if has script text embedded (indicates TTS generation)
  if (v.scriptText && v.scriptText.length > 0) return true;
  
  // Name patterns for TTS
  if (lowerName.includes('tts')) return true;
  if (lowerName.includes('text-to-speech')) return true;
  // "generated" in name but not music
  if (lowerName.includes('generated') && !lowerName.includes('music') && !lowerName.includes('instrumental')) return true;
  
  return false;
}

// Check if file is a true voiceover (recorded narration, not TTS or music)
export function isVoiceover(v: VoiceoverData): boolean {
  const lowerName = v.name.toLowerCase();
  
  // Explicit voiceover type
  if (v.scriptType === 'voiceover' || v.scriptType === 'narration') return true;
  if (v.metadataType === 'voiceover') return true;
  
  // Name patterns for voiceover
  if (lowerName.includes('voiceover') || lowerName.includes('voice-over')) return true;
  if (lowerName.includes('narration') || lowerName.includes('narrator')) return true;
  if (lowerName.includes('recording') && !lowerName.includes('music')) return true;
  
  return false;
}

// Check if file is a custom recorded voice
export function isCustomVoice(v: VoiceoverData): boolean {
  const lowerName = v.name.toLowerCase();
  
  if (v.metadataType === 'custom-voice') return true;
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
