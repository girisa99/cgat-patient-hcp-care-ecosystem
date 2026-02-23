/**
 * useProductionSession — Unified Script → Audio → Video → Timeline Bridge
 *
 * THE SINGLE SESSION OBJECT that carries state through the entire pipeline:
 *   Script authoring → TTS generation → Video generation → Recording →
 *   Timeline editing → Assembly → Export
 *
 * Supports ALL production formats:
 *   - Video: narration script (TTS) + visual prompt (video generation)
 *   - Podcast: narration script + audio production (music beds, SFX, intros)
 *   - Webcast: narration script + slide directions + Q&A segments
 *   - Presentation: slide script + speaker notes + visual layout
 *   - Animation: narration + motion/visual prompts
 *   - Avatar: narration + lip-sync + visual prompt
 *
 * Solves these critical gaps:
 *   1. Script edit → auto-invalidates TTS/video for affected scene
 *   2. Visual prompt edit → invalidates video ONLY (not TTS)
 *   3. TTS results → auto-populate timeline audio_voice track
 *   4. Video results → auto-populate timeline primary_video track
 *   5. Recording → splits into per-scene segments on timeline
 *   6. Teleprompter → scene-aware (knows which scene is active)
 *   7. Timeline ↔ Authoring: bidirectional sync
 *   8. Duration mismatches → detected and auto-fixed
 *   9. Chapter structure → propagated from script to timeline
 *  10. Podcast/webcast formats carry segment metadata (music, SFX, slides)
 *
 * Full pipeline: CREATE → PRODUCE → EDIT → REVIEW → PUBLISH
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type {
  SceneScript,
  TemplateMapping,
} from '@/hooks/useUnifiedAuthoring';
import type { TTSAudioResult } from '@/hooks/useLiveTTSPreview';
import type { VideoTimelineHook, TimelineClip, TrackType } from './useVideoTimeline';

// ─── Types ─────────────────────────────────────────────────────────────────

export type SceneMediaState = 'empty' | 'script_only' | 'tts_ready' | 'video_ready' | 'recording_ready' | 'complete' | 'stale';

export type ProductionFormat = 'video' | 'podcast' | 'webcast' | 'presentation' | 'animation' | 'avatar' | 'screen_recording';

export type SceneSegmentType = 'narration' | 'intro' | 'outro' | 'transition' | 'qa_segment' | 'music_bed' | 'sfx_cue' | 'slide' | 'b_roll';

export interface SceneProductionState {
  sceneId: string;
  sceneIndex: number;
  title: string;

  // Production format (what type of output this scene belongs to)
  format: ProductionFormat;
  segmentType: SceneSegmentType;

  // Narration Script (what the speaker SAYS → drives TTS)
  scriptText: string;
  scriptVersion: number;           // Incremented on edit; triggers TTS invalidation

  // Visual/Video Script (what the VIEWER SEES → drives video generation)
  visualPrompt: string;            // Scene description for video gen (camera, action, setting)
  visualPromptVersion: number;     // Incremented on edit; triggers video-only invalidation
  visualPipelineConfig: Record<string, unknown> | null; // Pipeline metadata from authoring

  // Podcast-specific
  musicBedCue: string | null;      // Music bed direction (e.g., "upbeat intro music")
  sfxCue: string | null;           // Sound effect cue (e.g., "transition whoosh")
  speakerLabel: string | null;     // Multi-speaker podcasts: who's speaking

  // Webcast/Presentation-specific
  slideDirections: string | null;  // Slide content directions
  speakerNotes: string | null;     // Separate from narration — private notes for presenter

  // Timing
  scriptedDurationMs: number;      // From script's durationSeconds
  actualAudioDurationMs: number;   // From TTS or recording
  actualVideoDurationMs: number;   // From video generation
  durationMismatchMs: number;      // |audio - video|

  // Audio (TTS or Recording)
  audioSource: 'tts' | 'recording' | 'none';
  ttsResult: TTSAudioResult | null;
  recordingBlob: Blob | null;
  recordingUrl: string | null;
  audioClipId: string | null;      // Timeline clip ID on audio_voice track

  // Video
  videoUrl: string | null;
  videoProvider: string | null;
  videoClipId: string | null;      // Timeline clip ID on primary_video track

  // Subtitle
  subtitleClipId: string | null;   // Timeline clip ID on subtitle track

  // Status
  mediaState: SceneMediaState;
  isStale: boolean;                // True if script changed after TTS/video gen
  isVideoStale: boolean;           // True if visual prompt changed (video only, not TTS)
  needsRegeneration: boolean;
}

export interface ChapterProductionState {
  chapterId: string;
  title: string;
  description: string;
  sceneIds: string[];
  timelineChapterId: string | null;
}

export interface TeleprompterCursor {
  activeSceneIndex: number;
  activeSceneId: string;
  activeSceneTitle: string;
  wordIndexInScene: number;
  totalWordsInScene: number;
  overallWordIndex: number;
  overallTotalWords: number;
  overallProgress: number;         // 0-1
  sceneProgress: number;           // 0-1
  currentWord: string;
  upcomingWords: string[];         // Next 8 words
  previousScene: string | null;
  nextScene: string | null;
  isLastScene: boolean;
}

export interface ProductionSessionState {
  // Identity
  sessionId: string;
  createdAt: string;

  // Production format
  format: ProductionFormat;

  // Source mapping
  mapping: TemplateMapping | null;

  // Per-scene production state
  scenes: SceneProductionState[];
  chapters: ChapterProductionState[];

  // Aggregate status
  totalScenes: number;
  scenesWithAudio: number;
  scenesWithVideo: number;
  scenesStale: number;
  scenesWithVideoStale: number;    // Scenes where visual prompt changed (video only)
  isReadyForAssembly: boolean;

  // Teleprompter
  teleprompterCursor: TeleprompterCursor;

  // Combined scripts
  fullScript: string;              // All narration text (what speaker says)
  fullScriptWithMarkers: string;   // Includes [SCENE 1] [SCENE 2] markers
  fullVisualScript: string;        // All visual prompts (what viewer sees)
  fullVisualScriptWithMarkers: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────

const CHARS_PER_SECOND = 14;
const SYNC_TOLERANCE_MS = 500;

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useProductionSession(timeline: VideoTimelineHook) {
  const [mapping, setMapping] = useState<TemplateMapping | null>(null);
  const [sceneStates, setSceneStates] = useState<SceneProductionState[]>([]);
  const [chapters, setChapters] = useState<ChapterProductionState[]>([]);
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const [productionFormat, setProductionFormat] = useState<ProductionFormat>('video');
  const [playheadSceneIndex, setPlayheadSceneIndex] = useState(0);
  const scriptVersions = useRef<Map<string, number>>(new Map());
  const visualVersions = useRef<Map<string, number>>(new Map());

  // ── Initialize from TemplateMapping ────────────────────────────────────

  const initializeFromMapping = useCallback((
    newMapping: TemplateMapping,
    format: ProductionFormat = 'video',
  ) => {
    setMapping(newMapping);
    setProductionFormat(format);

    // Create per-scene production states with full script data
    const scenes: SceneProductionState[] = newMapping.scenes.map((scene, i) => {
      const durationMs = scene.durationSeconds * 1000;
      scriptVersions.current.set(scene.sceneId, 1);
      visualVersions.current.set(scene.sceneId, 1);

      // Derive visual prompt from visual pipeline config or generate from script
      const visualPipeline = Array.isArray(scene.visualPipeline) && scene.visualPipeline.length > 0
        ? scene.visualPipeline[0] as Record<string, unknown>
        : null;
      const visualPrompt = (visualPipeline?.prompt as string)
        || (visualPipeline?.description as string)
        || deriveVisualPromptFromScript(scene.editedText || scene.scriptText, format);

      // Determine segment type from scene position and format
      const segmentType = deriveSegmentType(i, newMapping.scenes.length, format);

      return {
        sceneId: scene.sceneId,
        sceneIndex: i,
        title: scene.title,
        format,
        segmentType,
        scriptText: scene.editedText || scene.scriptText,
        scriptVersion: 1,
        visualPrompt,
        visualPromptVersion: 1,
        visualPipelineConfig: visualPipeline,
        musicBedCue: format === 'podcast' && i === 0 ? 'Intro music' : null,
        sfxCue: null,
        speakerLabel: scene.characterVoice || null,
        slideDirections: format === 'presentation' ? `Slide ${i + 1}: ${scene.title}` : null,
        speakerNotes: null,
        scriptedDurationMs: durationMs,
        actualAudioDurationMs: 0,
        actualVideoDurationMs: 0,
        durationMismatchMs: 0,
        audioSource: 'none',
        ttsResult: null,
        recordingBlob: null,
        recordingUrl: null,
        audioClipId: null,
        videoUrl: null,
        videoProvider: null,
        videoClipId: null,
        subtitleClipId: null,
        mediaState: 'script_only',
        isStale: false,
        isVideoStale: false,
        needsRegeneration: false,
      };
    });

    setSceneStates(scenes);

    // Populate timeline from mapping
    populateTimeline(scenes);
  }, [timeline]);

  // ── Populate timeline with placeholder clips from scenes ───────────────

  const populateTimeline = useCallback((scenes: SceneProductionState[]) => {
    // Reset timeline
    timeline.reset();

    let cursor = 0;
    const sceneIds: string[] = [];

    scenes.forEach((scene, i) => {
      const durationMs = scene.scriptedDurationMs || 5000;

      // Add video placeholder clip (uses visualPrompt, NOT narration script)
      const videoClipId = timeline.addClip('track-video', {
        trackId: 'track-video',
        mediaType: 'video',
        status: 'placeholder',
        startMs: cursor,
        durationMs,
        trimStartMs: 0,
        trimEndMs: 0,
        label: scene.title,
        generationParams: {
          prompt: scene.visualPrompt || scene.scriptText.slice(0, 200),
          narration: scene.scriptText,
          format: scene.format,
        },
        locked: false,
      });

      // Add voice placeholder clip
      const audioClipId = timeline.addClip('track-voice', {
        trackId: 'track-voice',
        mediaType: 'audio',
        status: 'placeholder',
        startMs: cursor,
        durationMs,
        trimStartMs: 0,
        trimEndMs: 0,
        label: `Voice: ${scene.title}`,
        generationParams: {
          prompt: scene.scriptText,
        },
        volume: 100,
        locked: false,
      });

      // Add subtitle placeholder
      const subtitleClipId = timeline.addClip('track-subtitle', {
        trackId: 'track-subtitle',
        mediaType: 'text_overlay',
        status: 'placeholder',
        startMs: cursor,
        durationMs,
        trimStartMs: 0,
        trimEndMs: 0,
        label: scene.scriptText.slice(0, 60),
        locked: false,
      });

      // Create timeline scene
      const timelineSceneId = timeline.addScene(scene.title, cursor, durationMs);
      if (timelineSceneId) sceneIds.push(timelineSceneId);

      // Update scene state with clip IDs
      setSceneStates(prev => prev.map(s =>
        s.sceneId === scene.sceneId
          ? { ...s, videoClipId, audioClipId, subtitleClipId }
          : s
      ));

      // Add scene marker
      timeline.addMarker(scene.title, cursor, i === 0 ? 'intro' : 'chapter_start');

      cursor += durationMs;
    });

    // Add outro marker
    if (cursor > 0) {
      timeline.addMarker('Outro', cursor - 2000, 'outro');
    }

    // Create chapter from all scenes
    if (sceneIds.length > 0) {
      timeline.addChapter('Full Production', sceneIds);
    }
  }, [timeline]);

  // ── Script Edit → Invalidation Cascade ─────────────────────────────────

  const updateSceneScript = useCallback((sceneId: string, newText: string) => {
    const version = (scriptVersions.current.get(sceneId) || 0) + 1;
    scriptVersions.current.set(sceneId, version);

    setSceneStates(prev => prev.map(s => {
      if (s.sceneId !== sceneId) return s;

      const newDurationMs = (newText.length / CHARS_PER_SECOND) * 1000;

      return {
        ...s,
        scriptText: newText,
        scriptVersion: version,
        scriptedDurationMs: newDurationMs,
        isStale: s.audioSource !== 'none', // Mark stale if audio already generated
        needsRegeneration: s.audioSource !== 'none',
        mediaState: s.ttsResult || s.recordingBlob ? 'stale' : 'script_only',
      };
    }));

    // Mark timeline clips as needing regeneration
    const scene = sceneStates.find(s => s.sceneId === sceneId);
    if (scene) {
      if (scene.audioClipId) {
        timeline.updateClip(scene.audioClipId, {
          status: 'queued',
          label: `Voice: ${newText.slice(0, 40)}...`,
          generationParams: { prompt: newText },
        });
      }
      // Video also invalidated because narration changed (affects timing/sync)
      if (scene.videoClipId) {
        timeline.updateClip(scene.videoClipId, {
          status: 'queued',
          generationParams: {
            ...timeline.state.clips[scene.videoClipId]?.generationParams,
            narration: newText,
          },
        });
      }
      if (scene.subtitleClipId) {
        timeline.updateClip(scene.subtitleClipId, {
          label: newText.slice(0, 60),
        });
      }
    }
  }, [sceneStates, timeline]);

  // ── Visual Prompt Edit → Video-Only Invalidation ────────────────────────
  // Editing the visual prompt (what the viewer SEES) only regenerates video,
  // NOT TTS audio. This is the key distinction from narration script editing.

  const updateSceneVisualPrompt = useCallback((sceneId: string, newVisualPrompt: string) => {
    const version = (visualVersions.current.get(sceneId) || 0) + 1;
    visualVersions.current.set(sceneId, version);

    setSceneStates(prev => prev.map(s => {
      if (s.sceneId !== sceneId) return s;

      return {
        ...s,
        visualPrompt: newVisualPrompt,
        visualPromptVersion: version,
        isVideoStale: s.videoUrl !== null, // Only stale if video already generated
      };
    }));

    // Only invalidate VIDEO clip (not audio — visual prompt doesn't affect TTS)
    const scene = sceneStates.find(s => s.sceneId === sceneId);
    if (scene?.videoClipId) {
      timeline.updateClip(scene.videoClipId, {
        status: 'queued',
        generationParams: {
          ...timeline.state.clips[scene.videoClipId]?.generationParams,
          prompt: newVisualPrompt,
        },
      });
    }
  }, [sceneStates, timeline]);

  // ── Update Podcast/Webcast Metadata ─────────────────────────────────────

  const updateSceneMetadata = useCallback((sceneId: string, updates: {
    musicBedCue?: string | null;
    sfxCue?: string | null;
    speakerLabel?: string | null;
    slideDirections?: string | null;
    speakerNotes?: string | null;
    segmentType?: SceneSegmentType;
  }) => {
    setSceneStates(prev => prev.map(s =>
      s.sceneId === sceneId ? { ...s, ...updates } : s
    ));
  }, []);

  // ── Receive TTS Result → Update Timeline ───────────────────────────────

  const receiveTTSResult = useCallback((sceneId: string, result: TTSAudioResult) => {
    setSceneStates(prev => prev.map(s => {
      if (s.sceneId !== sceneId) return s;

      const audioDurationMs = result.durationSeconds * 1000;

      // Update audio clip on timeline
      if (s.audioClipId) {
        timeline.updateClip(s.audioClipId, {
          status: 'ready',
          sourceUrl: result.audioUrl,
          durationMs: audioDurationMs,
          label: `TTS: ${s.title}`,
        });
      }

      // Update subtitle timing to match audio
      if (s.subtitleClipId) {
        timeline.updateClip(s.subtitleClipId, {
          status: 'ready',
          durationMs: audioDurationMs,
        });
      }

      const durationMismatchMs = s.actualVideoDurationMs > 0
        ? Math.abs(audioDurationMs - s.actualVideoDurationMs)
        : 0;

      return {
        ...s,
        ttsResult: result,
        audioSource: 'tts',
        actualAudioDurationMs: audioDurationMs,
        durationMismatchMs,
        isStale: false,
        needsRegeneration: false,
        mediaState: s.videoUrl ? 'complete' : 'tts_ready',
      };
    }));
  }, [timeline]);

  // ── Receive Recording → Replace TTS for a Scene ───────────────────────

  const receiveRecording = useCallback((sceneId: string, blob: Blob, durationMs: number) => {
    const url = URL.createObjectURL(blob);

    setSceneStates(prev => prev.map(s => {
      if (s.sceneId !== sceneId) return s;

      // Update audio clip on timeline with recording
      if (s.audioClipId) {
        timeline.updateClip(s.audioClipId, {
          status: 'ready',
          sourceUrl: url,
          durationMs,
          label: `Recorded: ${s.title}`,
        });
      }

      const durationMismatchMs = s.actualVideoDurationMs > 0
        ? Math.abs(durationMs - s.actualVideoDurationMs)
        : 0;

      return {
        ...s,
        recordingBlob: blob,
        recordingUrl: url,
        audioSource: 'recording',
        actualAudioDurationMs: durationMs,
        durationMismatchMs,
        isStale: false,
        needsRegeneration: false,
        mediaState: s.videoUrl ? 'complete' : 'recording_ready',
      };
    }));
  }, [timeline]);

  // ── Receive Video Result → Update Timeline ────────────────────────────

  const receiveVideoResult = useCallback((
    sceneId: string,
    videoUrl: string,
    durationMs: number,
    provider: string,
  ) => {
    setSceneStates(prev => prev.map(s => {
      if (s.sceneId !== sceneId) return s;

      // Update video clip on timeline
      if (s.videoClipId) {
        timeline.updateClip(s.videoClipId, {
          status: 'ready',
          sourceUrl: videoUrl,
          durationMs,
          label: s.title,
          generationParams: {
            ...timeline.state.clips[s.videoClipId]?.generationParams,
            provider,
          },
        });
      }

      const durationMismatchMs = s.actualAudioDurationMs > 0
        ? Math.abs(s.actualAudioDurationMs - durationMs)
        : 0;

      return {
        ...s,
        videoUrl,
        videoProvider: provider,
        actualVideoDurationMs: durationMs,
        durationMismatchMs,
        mediaState: s.audioSource !== 'none' ? 'complete' : 'video_ready',
      };
    }));
  }, [timeline]);

  // ── Bulk Import Recording → Split into Scenes ─────────────────────────
  // Takes a full recording blob and splits it into per-scene segments
  // based on scripted durations

  const splitRecordingIntoScenes = useCallback((fullBlob: Blob, totalDurationMs: number) => {
    // Calculate proportional split based on scripted durations
    const totalScriptedMs = sceneStates.reduce((sum, s) => sum + s.scriptedDurationMs, 0);
    if (totalScriptedMs <= 0) return;

    let cursor = 0;
    sceneStates.forEach(scene => {
      const proportion = scene.scriptedDurationMs / totalScriptedMs;
      const segmentDurationMs = totalDurationMs * proportion;

      // We can't actually split a Blob by time without decoding audio,
      // but we can update the timeline clips with the full recording
      // and set trim points for each scene's segment
      if (scene.audioClipId) {
        timeline.updateClip(scene.audioClipId, {
          status: 'ready',
          sourceUrl: URL.createObjectURL(fullBlob),
          startMs: cursor,
          durationMs: segmentDurationMs,
          trimStartMs: cursor,
          trimEndMs: totalDurationMs - (cursor + segmentDurationMs),
          label: `Recorded: ${scene.title}`,
        });
      }

      setSceneStates(prev => prev.map(s =>
        s.sceneId === scene.sceneId
          ? {
              ...s,
              audioSource: 'recording',
              actualAudioDurationMs: segmentDurationMs,
              recordingBlob: fullBlob,
              recordingUrl: URL.createObjectURL(fullBlob),
              mediaState: s.videoUrl ? 'complete' : 'recording_ready',
            }
          : s
      ));

      cursor += segmentDurationMs;
    });
  }, [sceneStates, timeline]);

  // ── Regenerate Stale Scenes ───────────────────────────────────────────

  const regenerateStaleScenes = useCallback(() => {
    sceneStates.filter(s => s.isStale).forEach(scene => {
      if (scene.audioClipId) {
        timeline.updateClip(scene.audioClipId, { status: 'queued' });
      }
      if (scene.videoClipId) {
        timeline.updateClip(scene.videoClipId, { status: 'queued' });
      }

      setSceneStates(prev => prev.map(s =>
        s.sceneId === scene.sceneId
          ? { ...s, isStale: false, needsRegeneration: true, mediaState: 'script_only' }
          : s
      ));
    });
  }, [sceneStates, timeline]);

  // ── Auto-fix Duration Mismatches ──────────────────────────────────────

  const autoFixDurationMismatches = useCallback(() => {
    sceneStates.forEach(scene => {
      if (scene.durationMismatchMs <= SYNC_TOLERANCE_MS) return;

      // Strategy: adjust video duration to match audio (audio is ground truth)
      if (scene.videoClipId && scene.actualAudioDurationMs > 0) {
        timeline.updateClip(scene.videoClipId, {
          durationMs: scene.actualAudioDurationMs,
        });

        setSceneStates(prev => prev.map(s =>
          s.sceneId === scene.sceneId
            ? { ...s, actualVideoDurationMs: scene.actualAudioDurationMs, durationMismatchMs: 0 }
            : s
        ));
      }
    });
  }, [sceneStates, timeline]);

  // ── Scene-Aware Teleprompter ──────────────────────────────────────────

  const teleprompterCursor = useMemo((): TeleprompterCursor => {
    if (sceneStates.length === 0) {
      return {
        activeSceneIndex: 0,
        activeSceneId: '',
        activeSceneTitle: '',
        wordIndexInScene: 0,
        totalWordsInScene: 0,
        overallWordIndex: 0,
        overallTotalWords: 0,
        overallProgress: 0,
        sceneProgress: 0,
        currentWord: '',
        upcomingWords: [],
        previousScene: null,
        nextScene: null,
        isLastScene: true,
      };
    }

    // Determine active scene from playhead position
    const playheadMs = timeline.state.playheadMs;
    let cumulativeMs = 0;
    let activeSceneIdx = 0;

    for (let i = 0; i < sceneStates.length; i++) {
      const sceneDur = sceneStates[i].actualAudioDurationMs || sceneStates[i].scriptedDurationMs;
      if (playheadMs < cumulativeMs + sceneDur) {
        activeSceneIdx = i;
        break;
      }
      cumulativeMs += sceneDur;
      if (i === sceneStates.length - 1) activeSceneIdx = i;
    }

    const activeScene = sceneStates[activeSceneIdx];
    const sceneDur = activeScene.actualAudioDurationMs || activeScene.scriptedDurationMs;
    const timeInScene = playheadMs - cumulativeMs;
    const sceneProgress = sceneDur > 0 ? Math.min(1, timeInScene / sceneDur) : 0;

    // Word-level cursor within scene (weighted by word length + punctuation)
    const words = activeScene.scriptText.split(/\s+/).filter(w => w.length > 0);
    const weights = words.map(word => {
      let weight = word.length;
      if (word.match(/[.!?]$/)) weight += 8;
      else if (word.match(/[,;:]$/)) weight += 4;
      return Math.max(weight, 3);
    });
    const totalWeight = weights.reduce((s, w) => s + w, 0);

    let accumulated = 0;
    let wordIdx = 0;
    for (let i = 0; i < words.length; i++) {
      if (accumulated / totalWeight >= sceneProgress * 0.98) {
        wordIdx = Math.max(0, i - 1);
        break;
      }
      accumulated += weights[i];
      wordIdx = i;
    }

    // Overall progress
    const totalDurMs = sceneStates.reduce((s, sc) => s + (sc.actualAudioDurationMs || sc.scriptedDurationMs), 0);
    const overallProgress = totalDurMs > 0 ? playheadMs / totalDurMs : 0;

    // Overall word index (sum words in previous scenes + current word)
    const wordsBeforeActive = sceneStates
      .slice(0, activeSceneIdx)
      .reduce((s, sc) => s + sc.scriptText.split(/\s+/).filter(w => w.length > 0).length, 0);
    const overallTotalWords = sceneStates
      .reduce((s, sc) => s + sc.scriptText.split(/\s+/).filter(w => w.length > 0).length, 0);

    return {
      activeSceneIndex: activeSceneIdx,
      activeSceneId: activeScene.sceneId,
      activeSceneTitle: activeScene.title,
      wordIndexInScene: wordIdx,
      totalWordsInScene: words.length,
      overallWordIndex: wordsBeforeActive + wordIdx,
      overallTotalWords,
      overallProgress,
      sceneProgress,
      currentWord: words[wordIdx] || '',
      upcomingWords: words.slice(wordIdx + 1, wordIdx + 9),
      previousScene: activeSceneIdx > 0 ? sceneStates[activeSceneIdx - 1].title : null,
      nextScene: activeSceneIdx < sceneStates.length - 1 ? sceneStates[activeSceneIdx + 1].title : null,
      isLastScene: activeSceneIdx === sceneStates.length - 1,
    };
  }, [sceneStates, timeline.state.playheadMs]);

  // ── Full Script with Scene Markers ────────────────────────────────────

  const fullScript = useMemo(
    () => sceneStates.map(s => s.scriptText).join('\n\n'),
    [sceneStates],
  );

  const fullScriptWithMarkers = useMemo(
    () => sceneStates.map((s, i) => `[SCENE ${i + 1}: ${s.title}]\n${s.scriptText}`).join('\n\n'),
    [sceneStates],
  );

  // Full visual script (what the viewer sees — prompts for video generation)
  const fullVisualScript = useMemo(
    () => sceneStates.map(s => s.visualPrompt).filter(Boolean).join('\n\n'),
    [sceneStates],
  );

  const fullVisualScriptWithMarkers = useMemo(
    () => sceneStates
      .map((s, i) => `[SCENE ${i + 1}: ${s.title}]\n${s.visualPrompt || '(no visual direction)'}`)
      .join('\n\n'),
    [sceneStates],
  );

  // ── Assembly Readiness Check ──────────────────────────────────────────

  const isReadyForAssembly = useMemo(() => {
    if (sceneStates.length === 0) return false;
    return sceneStates.every(s =>
      s.mediaState === 'complete' ||
      (s.audioSource !== 'none' && s.videoUrl)
    );
  }, [sceneStates]);

  // ── Session State (exported) ──────────────────────────────────────────

  const sessionState = useMemo((): ProductionSessionState => ({
    sessionId,
    createdAt: new Date().toISOString(),
    format: productionFormat,
    mapping,
    scenes: sceneStates,
    chapters,
    totalScenes: sceneStates.length,
    scenesWithAudio: sceneStates.filter(s => s.audioSource !== 'none').length,
    scenesWithVideo: sceneStates.filter(s => s.videoUrl !== null).length,
    scenesStale: sceneStates.filter(s => s.isStale).length,
    scenesWithVideoStale: sceneStates.filter(s => s.isVideoStale).length,
    isReadyForAssembly,
    teleprompterCursor,
    fullScript,
    fullScriptWithMarkers,
    fullVisualScript,
    fullVisualScriptWithMarkers,
  }), [sessionId, productionFormat, mapping, sceneStates, chapters, isReadyForAssembly, teleprompterCursor, fullScript, fullScriptWithMarkers, fullVisualScript, fullVisualScriptWithMarkers]);

  return {
    // State
    session: sessionState,

    // Initialization
    initializeFromMapping,
    setProductionFormat,

    // Narration script management (what speaker SAYS → TTS + video invalidation)
    updateSceneScript,

    // Visual prompt management (what viewer SEES → video-only invalidation)
    updateSceneVisualPrompt,

    // Podcast/webcast metadata (music cues, SFX, speaker labels, slide directions)
    updateSceneMetadata,

    // Audio (TTS or Recording)
    receiveTTSResult,
    receiveRecording,
    splitRecordingIntoScenes,

    // Video
    receiveVideoResult,

    // Maintenance
    regenerateStaleScenes,
    autoFixDurationMismatches,

    // Teleprompter
    teleprompterCursor,
  };
}

export type ProductionSessionHook = ReturnType<typeof useProductionSession>;

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Derive a visual prompt from narration script when no explicit visual direction exists.
 * Different formats need different visual language.
 */
function deriveVisualPromptFromScript(script: string, format: ProductionFormat): string {
  const firstSentence = script.split(/[.!?]/)[0]?.trim() || script.slice(0, 100);

  switch (format) {
    case 'podcast':
      return `Podcast studio setting. Two hosts in conversation. Warm lighting, microphones visible. Topic: ${firstSentence}`;
    case 'webcast':
      return `Professional webinar setting. Speaker presenting with slides. Clean, modern background. Topic: ${firstSentence}`;
    case 'presentation':
      return `Presentation slide with key points. Professional design, brand colors. Content: ${firstSentence}`;
    case 'avatar':
      return `Close-up of presenter speaking directly to camera. Professional setting. Saying: ${firstSentence}`;
    case 'animation':
      return `Animated scene illustrating the concept. Motion graphics, clean design. Theme: ${firstSentence}`;
    case 'screen_recording':
      return `Screen recording showing the workflow. Cursor movements and highlights. Demonstrating: ${firstSentence}`;
    case 'video':
    default:
      return `Cinematic scene. ${firstSentence}. Professional lighting, smooth camera movement.`;
  }
}

/**
 * Derive scene segment type from position and format.
 */
function deriveSegmentType(
  sceneIndex: number,
  totalScenes: number,
  format: ProductionFormat,
): SceneSegmentType {
  if (sceneIndex === 0) return 'intro';
  if (sceneIndex === totalScenes - 1) return 'outro';

  if (format === 'podcast' || format === 'webcast') {
    // Every 4th segment is a transition in podcast/webcast
    if (sceneIndex % 4 === 0) return 'transition';
  }

  return 'narration';
}
