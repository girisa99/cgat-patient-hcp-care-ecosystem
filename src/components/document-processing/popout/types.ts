/**
 * Types for the pop-out recording studio
 */

export interface PopoutScriptData {
  id: string;
  title: string;
  content: string;
}

export interface PopoutVoiceoverData {
  id: string;
  name: string;
  url: string;
  scriptText: string | null;
  scriptType: string | null;
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
