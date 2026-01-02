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
  type?: 'video' | 'audio';
}

export interface VoiceoverData {
  id: string;
  name: string;
  url: string;
  scriptText?: string | null;
  scriptType?: string | null;
  metadataType?: string | null; // From database metadata.type field
}

export interface MusicData {
  id: string;
  name: string;
  url: string;
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
