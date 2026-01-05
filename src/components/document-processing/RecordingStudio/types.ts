/**
 * Types for the Fullscreen Recording Studio
 */

export interface ScriptData {
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
  showId?: string; // Link to show/event
}

export interface VoiceoverData {
  id: string;
  name: string;
  url: string;
  scriptText?: string | null; // Enhanced/clean script used for TTS
  originalScript?: string | null; // Original script before enhancement
  scriptType?: string | null; // 'video' | 'audio' | 'tts' | 'voiceover' | 'narration'
  metadataType?: string | null; // From database metadata.type field (highest priority)
}

export interface MusicData {
  id: string;
  name: string;
  url: string;
}

// Production context for when studio is opened from Production Hub
export interface ProductionContextForStudio {
  showId: string;
  showTitle: string;
  showType: string;
  scriptMode: 'podcast' | 'webcast' | 'video' | 'audio';
  currentStage: string;
  participants: { id: string; name: string; role: string }[];
  linkedScriptId?: string;
  linkedMusicId?: string;
  studioSettings?: {
    teleprompterSpeed: number;
    teleprompterEnabled: boolean;
    ttsVoiceId: string;
    ttsProvider: 'openai' | 'elevenlabs';
    ttsVoiceSettings: {
      stability: number;
      similarity_boost: number;
      style: number;
      speed: number;
    };
    showParticipantList: boolean;
    showTimer: boolean;
    showVisualCues: boolean;
    studioSoundEnabled: boolean;
  };
}

export interface RecordingStudioProps {
  isOpen: boolean;
  onClose: () => void;
  scripts: ScriptData[];
  voiceovers: VoiceoverData[];
  music: MusicData[];
  selectedScriptId?: string;
  selectedVoiceoverId?: string;
  selectedMusicId?: string;
  // Optional upload callbacks from parent
  onUploadVoiceover?: (file: File) => Promise<void>;
  onUploadMusic?: (file: File) => Promise<void>;
  isUploading?: boolean;
  // Production context when opened from Production Hub
  productionContext?: ProductionContextForStudio;
  // Callback to notify parent of recording state changes
  onRecordingStateChange?: (isRecording: boolean) => void;
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  isStopped: boolean;
  duration: number;
  recordedChunks: Blob[];
}

export interface CameraState {
  stream: MediaStream | null;
  isEnabled: boolean;
  isMicEnabled: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AudioState {
  voiceoverAudio: HTMLAudioElement | null;
  musicAudio: HTMLAudioElement | null;
  ttsAudio: HTMLAudioElement | null;
  voiceoverVolume: number;
  musicVolume: number;
  ttsVolume: number;
  musicLoop: boolean;
}

export interface LibraryRecording {
  id: number;
  name: string;
  blob: Blob;
  timestamp: number;
  duration: number;
  size: number;
  type: string;
  scriptTitle?: string | null;
  hasVoiceover?: boolean;
  hasMusic?: boolean;
  hasCaptions?: boolean;
  captionsText?: string;
  format?: string;
}

export interface LogoState {
  enabled: boolean;
  src: string | null;
  position: { x: number; y: number };
  size: 'small' | 'medium' | 'large';
}

export interface TeleprompterState {
  enabled: boolean;
  scrollSpeed: number;
  isScrolling: boolean;
}

export type AudioTabType = 'voiceover' | 'tts' | 'music';
