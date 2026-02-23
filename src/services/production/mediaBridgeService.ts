/**
 * Media Bridge Service — Mind → Cast Audio Integration
 *
 * Bridges Mind's generated audio (TTS, voiceovers, music) into
 * Cast's video production pipeline. Queries generated_media by type
 * and exposes asset selection for scene binding.
 *
 * Usage:
 *   import { mediaBridgeService } from '@/services/production/mediaBridgeService';
 *
 *   // Get all available voiceovers for a Cast project
 *   const voiceovers = await mediaBridgeService.getAvailableVoiceovers();
 *
 *   // Bind audio to a scene
 *   await mediaBridgeService.bindAudioToScene(projectId, sceneKey, audioId, 'voiceover');
 */

import { supabase } from '@/integrations/supabase/client';

// ─── Types ──────────────────────────────────────────────────────────────────

export type AudioAssetRole = 'voiceover' | 'music' | 'sfx' | 'narration' | 'background';

export interface AudioAsset {
  id: string;
  name: string;
  url: string | null;
  durationSeconds: number | null;
  source: string | null;
  role: AudioAssetRole;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface SceneAudioBinding {
  sceneKey: string;
  role: AudioAssetRole;
  audioAssetId: string;
  audioAsset?: AudioAsset;
}

export interface ProjectAudioConfig {
  projectId: string;
  bindings: SceneAudioBinding[];
  primaryVoiceoverId: string | null;
  primaryMusicId: string | null;
}

// ─── Classification ─────────────────────────────────────────────────────────

function classifyAudioRole(metadata: Record<string, unknown> | null, source: string | null): AudioAssetRole {
  const type = (metadata?.type as string) || '';
  const uploadedAs = (metadata?.uploadedAs as string) || '';

  if (type === 'instrumental' || type === 'music' || uploadedAs === 'music') return 'music';
  if (type === 'sfx' || source === 'elevenlabs-sfx') return 'sfx';
  if (type === 'voiceover' || type === 'narration') return 'voiceover';
  if (type === 'tts') return 'narration';
  return 'voiceover';
}

function mapToAudioAsset(row: {
  id: string;
  name: string;
  file_url: string | null;
  duration_seconds: number | null;
  source: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}): AudioAsset {
  return {
    id: row.id,
    name: row.name,
    url: row.file_url,
    durationSeconds: row.duration_seconds,
    source: row.source,
    role: classifyAudioRole(row.metadata, row.source),
    metadata: (row.metadata as Record<string, unknown>) || {},
    createdAt: row.created_at,
  };
}

// ─── Service ────────────────────────────────────────────────────────────────

export const mediaBridgeService = {
  /** Get all audio assets for the current user */
  async getAllAudio(): Promise<AudioAsset[]> {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return [];

    const { data, error } = await supabase
      .from('generated_media')
      .select('id, name, file_url, duration_seconds, source, metadata, created_at')
      .eq('user_id', authData.user.id)
      .eq('file_type', 'audio')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map((row: any) => mapToAudioAsset(row));
  },

  /** Get voiceovers only (TTS + recorded narration) */
  async getAvailableVoiceovers(): Promise<AudioAsset[]> {
    const all = await this.getAllAudio();
    return all.filter((a) => a.role === 'voiceover' || a.role === 'narration');
  },

  /** Get music only (instrumental + background) */
  async getAvailableMusic(): Promise<AudioAsset[]> {
    const all = await this.getAllAudio();
    return all.filter((a) => a.role === 'music');
  },

  /** Get SFX only */
  async getAvailableSFX(): Promise<AudioAsset[]> {
    const all = await this.getAllAudio();
    return all.filter((a) => a.role === 'sfx');
  },

  /** Get audio assets linked to a specific script */
  async getAudioForScript(scriptId: string): Promise<AudioAsset[]> {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return [];

    const { data, error } = await supabase
      .from('generated_media')
      .select('id, name, file_url, duration_seconds, source, metadata, created_at')
      .eq('user_id', authData.user.id)
      .eq('file_type', 'audio')
      .filter('metadata->>scriptId', 'eq', scriptId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map((row: any) => mapToAudioAsset(row));
  },

  // ── Scene Bindings (localStorage, upgradable to DB) ────────────────────

  /** Get audio config for a Cast project */
  getProjectAudioConfig(projectId: string): ProjectAudioConfig {
    try {
      const raw = localStorage.getItem(`cast-audio-config-${projectId}`);
      if (raw) return JSON.parse(raw);
    } catch { /* ignore parse errors */ }
    return {
      projectId,
      bindings: [],
      primaryVoiceoverId: null,
      primaryMusicId: null,
    };
  },

  /** Bind an audio asset to a scene in a Cast project */
  bindAudioToScene(
    projectId: string,
    sceneKey: string,
    audioAssetId: string,
    role: AudioAssetRole
  ): ProjectAudioConfig {
    const config = this.getProjectAudioConfig(projectId);

    // Remove existing binding for this scene+role
    config.bindings = config.bindings.filter(
      (b) => !(b.sceneKey === sceneKey && b.role === role)
    );

    config.bindings.push({ sceneKey, role, audioAssetId });

    // Auto-set primary if first of its type
    if (role === 'voiceover' && !config.primaryVoiceoverId) {
      config.primaryVoiceoverId = audioAssetId;
    }
    if (role === 'music' && !config.primaryMusicId) {
      config.primaryMusicId = audioAssetId;
    }

    localStorage.setItem(`cast-audio-config-${projectId}`, JSON.stringify(config));
    return config;
  },

  /** Remove an audio binding from a scene */
  unbindAudioFromScene(
    projectId: string,
    sceneKey: string,
    role: AudioAssetRole
  ): ProjectAudioConfig {
    const config = this.getProjectAudioConfig(projectId);
    config.bindings = config.bindings.filter(
      (b) => !(b.sceneKey === sceneKey && b.role === role)
    );
    localStorage.setItem(`cast-audio-config-${projectId}`, JSON.stringify(config));
    return config;
  },

  /** Set primary voiceover for a project */
  setPrimaryVoiceover(projectId: string, audioAssetId: string | null): void {
    const config = this.getProjectAudioConfig(projectId);
    config.primaryVoiceoverId = audioAssetId;
    localStorage.setItem(`cast-audio-config-${projectId}`, JSON.stringify(config));
  },

  /** Set primary music for a project */
  setPrimaryMusic(projectId: string, audioAssetId: string | null): void {
    const config = this.getProjectAudioConfig(projectId);
    config.primaryMusicId = audioAssetId;
    localStorage.setItem(`cast-audio-config-${projectId}`, JSON.stringify(config));
  },

  /** Build input_config for edge function with audio bindings */
  buildAudioInputConfig(projectId: string): {
    voiceover_id: string | null;
    music_id: string | null;
    sfx_ids: string[];
    scene_bindings: SceneAudioBinding[];
  } {
    const config = this.getProjectAudioConfig(projectId);
    return {
      voiceover_id: config.primaryVoiceoverId,
      music_id: config.primaryMusicId,
      sfx_ids: config.bindings
        .filter((b) => b.role === 'sfx')
        .map((b) => b.audioAssetId),
      scene_bindings: config.bindings,
    };
  },
};
