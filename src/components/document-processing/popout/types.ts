/**
 * Types for the pop-out recording studio
 */

export interface PopoutScriptData {
  id: string;
  title: string;
  content: string;
  originalContent?: string;
  enhancedContent?: string;
  cleanContent?: string; // Clean version for TTS (no pause markers)
  draftContent?: string; // In-progress draft content
  draftStatus?: 'in_progress' | 'completed';
  type?: 'video' | 'audio';
  purpose?: 'video' | 'audio' | 'podcast' | 'webcast' | 'interview' | 'panel' | 'tutorial';
}

export interface PopoutVoiceoverData {
  id: string;
  name: string;
  url: string;
  scriptText: string | null; // Enhanced/clean script used for TTS
  originalScript?: string | null; // Original script before enhancement
  scriptType: string | null; // 'video' | 'audio' | 'tts' | 'voiceover' | 'narration'
  metadataType?: string | null; // From database metadata.type field (highest priority)
}

export interface PopoutMusicData {
  id: string;
  name: string;
  url: string;
}

export interface PopoutConfig {
  scripts: PopoutScriptData[];
  voiceovers: PopoutVoiceoverData[];
  music: PopoutMusicData[];
  selectedScriptId: string;
  selectedVoiceoverId: string;
  selectedMusicId: string;
  supabaseUrl: string;
  supabaseKey: string;
  // Production context (optional) - required for saving to project
  productionContext?: {
    showId: string;
    showTitle: string;
    showType: string;
    scriptMode: 'podcast' | 'webcast' | 'video' | 'audio';
    currentStage: string;
    participants: { id: string; name: string; role: string }[];
    studioSettings?: {
      teleprompterSpeed: number;
      ttsVoiceId: string;
      ttsProvider: 'openai' | 'elevenlabs';
    };
  };
  // User auth token for backend saves
  userAccessToken?: string;
}

export interface MediaItemForPopout {
  id: string;
  name: string;
  url: string;
  file_type: 'video' | 'audio' | 'image';
  metadata?: Record<string, unknown>;
}

export interface ScriptItemForPopout {
  id: string;
  title: string;
  content: string;
}
