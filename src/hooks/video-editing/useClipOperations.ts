/**
 * useClipOperations — High-Level Clip Manipulation Facade
 *
 * Wraps useVideoTimeline with convenience methods for common editing workflows:
 *   - Add clip from AI generation result
 *   - Import offline video/audio file
 *   - Quick trim (trim to selected range)
 *   - Split at playhead
 *   - Merge selected clips
 *   - Replace clip with new generation
 *   - Duplicate clip
 *   - Batch regenerate failed clips
 *   - Auto-arrange clips on a track (remove gaps)
 *   - Create scene from selection
 *   - Import chapter structure from script
 *
 * Style-agnostic: works with any of the 93 styles, offline imports, or mixed content.
 */

import { useCallback } from 'react';
import type {
  VideoTimelineHook,
  TimelineClip,
  ClipMediaType,
  TrackType,
} from './useVideoTimeline';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface AIGenerationResult {
  styleId: string;
  provider: string;
  model?: string;
  quality: string;
  outputUrl: string;
  thumbnailUrl?: string;
  durationMs: number;
  prompt?: string;
}

export interface ScriptChapter {
  title: string;
  description: string;
  scenes: {
    label: string;
    scriptText: string;
    estimatedDurationMs: number;
    ttsText?: string;
  }[];
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useClipOperations(timeline: VideoTimelineHook) {
  const { state, addClip, removeClip, updateClip, splitClip, mergeClips, addScene, addChapter, addMarker, selectClips } = timeline;

  /** Add a clip from an AI video generation result */
  const addFromGeneration = useCallback((
    trackId: string,
    result: AIGenerationResult,
    label: string,
  ) => {
    const lastClipEnd = getTrackEndMs(trackId);
    return addClip(trackId, {
      trackId,
      mediaType: 'video',
      status: 'ready',
      startMs: lastClipEnd,
      durationMs: result.durationMs,
      trimStartMs: 0,
      trimEndMs: 0,
      label,
      sourceUrl: result.outputUrl,
      thumbnailUrl: result.thumbnailUrl,
      generationParams: {
        styleId: result.styleId,
        provider: result.provider,
        model: result.model,
        quality: result.quality,
        prompt: result.prompt,
        regenerateCount: 0,
      },
      locked: false,
    });
  }, [addClip, state.tracks, state.clips]);

  /** Add a TTS audio clip */
  const addTTSClip = useCallback((
    text: string,
    audioUrl: string,
    durationMs: number,
    provider: string,
    language: string,
  ) => {
    const voiceTrack = state.tracks.find(t => t.type === 'audio_voice');
    if (!voiceTrack) return null;
    const lastEnd = getTrackEndMs(voiceTrack.id);
    return addClip(voiceTrack.id, {
      trackId: voiceTrack.id,
      mediaType: 'audio',
      status: 'ready',
      startMs: lastEnd,
      durationMs,
      trimStartMs: 0,
      trimEndMs: 0,
      label: `TTS: ${text.slice(0, 40)}...`,
      sourceUrl: audioUrl,
      generationParams: {
        provider,
        prompt: text,
        model: language,
      },
      volume: 100,
      locked: false,
    });
  }, [addClip, state.tracks, state.clips]);

  /** Add subtitle/caption clip */
  const addSubtitleClip = useCallback((
    text: string,
    startMs: number,
    durationMs: number,
  ) => {
    const subTrack = state.tracks.find(t => t.type === 'subtitle');
    if (!subTrack) return null;
    return addClip(subTrack.id, {
      trackId: subTrack.id,
      mediaType: 'text_overlay',
      status: 'ready',
      startMs,
      durationMs,
      trimStartMs: 0,
      trimEndMs: 0,
      label: text,
      locked: false,
    });
  }, [addClip, state.tracks]);

  /** Add background music clip */
  const addMusicClip = useCallback((
    musicUrl: string,
    durationMs: number,
    label: string,
    volume = 30,
  ) => {
    const musicTrack = state.tracks.find(t => t.type === 'audio_music');
    if (!musicTrack) return null;
    return addClip(musicTrack.id, {
      trackId: musicTrack.id,
      mediaType: 'audio',
      status: 'ready',
      startMs: 0,
      durationMs,
      trimStartMs: 0,
      trimEndMs: 0,
      label,
      sourceUrl: musicUrl,
      volume,
      locked: false,
    });
  }, [addClip, state.tracks]);

  /** Duplicate a clip (place right after original) */
  const duplicateClip = useCallback((clipId: string) => {
    const clip = state.clips[clipId];
    if (!clip) return null;
    const effectiveDuration = clip.durationMs - clip.trimStartMs - clip.trimEndMs;
    return addClip(clip.trackId, {
      ...clip,
      startMs: clip.startMs + effectiveDuration,
      label: `${clip.label} (copy)`,
      locked: false,
    });
  }, [state.clips, addClip]);

  /** Split clip at the current playhead position */
  const splitAtPlayhead = useCallback(() => {
    const selected = state.selectedClipIds[0];
    if (!selected) return;
    splitClip(selected, state.playheadMs);
  }, [state.selectedClipIds, state.playheadMs, splitClip]);

  /** Merge all currently selected clips */
  const mergeSelected = useCallback(() => {
    if (state.selectedClipIds.length < 2) return;
    mergeClips(state.selectedClipIds);
  }, [state.selectedClipIds, mergeClips]);

  /** Delete all selected clips */
  const deleteSelected = useCallback(() => {
    state.selectedClipIds.forEach(id => removeClip(id));
    selectClips([]);
  }, [state.selectedClipIds, removeClip, selectClips]);

  /** Batch regenerate all failed clips */
  const regenerateAllFailed = useCallback(() => {
    Object.values(state.clips)
      .filter(c => c.status === 'failed')
      .forEach(c => {
        updateClip(c.id, {
          status: 'queued',
          generationParams: {
            ...c.generationParams,
            regenerateCount: (c.generationParams?.regenerateCount || 0) + 1,
          },
        });
      });
  }, [state.clips, updateClip]);

  /** Auto-arrange clips on a track: remove gaps, place sequentially */
  const autoArrangeTrack = useCallback((trackId: string) => {
    const track = state.tracks.find(t => t.id === trackId);
    if (!track) return;

    let cursor = 0;
    track.clips.forEach(clipId => {
      const clip = state.clips[clipId];
      if (!clip) return;
      if (clip.startMs !== cursor) {
        updateClip(clipId, { startMs: cursor });
      }
      cursor += clip.durationMs - clip.trimStartMs - clip.trimEndMs;
    });
  }, [state.tracks, state.clips, updateClip]);

  /** Create a scene from the currently selected clips */
  const createSceneFromSelection = useCallback((label: string) => {
    const clips = state.selectedClipIds
      .map(id => state.clips[id])
      .filter(Boolean)
      .sort((a, b) => a.startMs - b.startMs);

    if (clips.length === 0) return null;

    const startMs = clips[0].startMs;
    const endMs = Math.max(...clips.map(c => c.startMs + c.durationMs));
    return addScene(label, startMs, endMs - startMs);
  }, [state.selectedClipIds, state.clips, addScene]);

  /** Import chapter structure from a script (creates chapters + scenes + placeholder clips) */
  const importFromScript = useCallback((chapters: ScriptChapter[]) => {
    let cursor = 0;
    const videoTrack = state.tracks.find(t => t.type === 'primary_video');
    const voiceTrack = state.tracks.find(t => t.type === 'audio_voice');
    if (!videoTrack) return;

    chapters.forEach(chapter => {
      const sceneIds: string[] = [];

      chapter.scenes.forEach(scene => {
        // Add video placeholder
        addClip(videoTrack.id, {
          trackId: videoTrack.id,
          mediaType: 'video',
          status: 'placeholder',
          startMs: cursor,
          durationMs: scene.estimatedDurationMs,
          trimStartMs: 0,
          trimEndMs: 0,
          label: scene.label,
          generationParams: { prompt: scene.scriptText },
          locked: false,
        });

        // Add voice placeholder
        if (voiceTrack && scene.ttsText) {
          addClip(voiceTrack.id, {
            trackId: voiceTrack.id,
            mediaType: 'audio',
            status: 'placeholder',
            startMs: cursor,
            durationMs: scene.estimatedDurationMs,
            trimStartMs: 0,
            trimEndMs: 0,
            label: `Voice: ${scene.label}`,
            generationParams: { prompt: scene.ttsText },
            locked: false,
          });
        }

        // Create scene
        const sceneId = addScene(scene.label, cursor, scene.estimatedDurationMs);
        if (sceneId) sceneIds.push(sceneId);

        cursor += scene.estimatedDurationMs;
      });

      // Create chapter
      addChapter(chapter.title, sceneIds);
    });

    // Add markers
    addMarker('Intro', 0, 'intro');
    if (cursor > 0) {
      addMarker('Outro', cursor - 3000, 'outro');
    }
  }, [state.tracks, addClip, addScene, addChapter, addMarker]);

  /** Get end time of the last clip on a track */
  const getTrackEndMs = useCallback((trackId: string) => {
    const track = state.tracks.find(t => t.id === trackId);
    if (!track || track.clips.length === 0) return 0;
    let max = 0;
    track.clips.forEach(id => {
      const c = state.clips[id];
      if (c) {
        const end = c.startMs + c.durationMs - c.trimStartMs - c.trimEndMs;
        if (end > max) max = end;
      }
    });
    return max;
  }, [state.tracks, state.clips]);

  return {
    // From AI generation
    addFromGeneration,
    addTTSClip,
    addSubtitleClip,
    addMusicClip,

    // Editing shortcuts
    duplicateClip,
    splitAtPlayhead,
    mergeSelected,
    deleteSelected,

    // Batch operations
    regenerateAllFailed,
    autoArrangeTrack,

    // Structure
    createSceneFromSelection,
    importFromScript,

    // Utility
    getTrackEndMs,
  };
}

export type ClipOperationsHook = ReturnType<typeof useClipOperations>;
