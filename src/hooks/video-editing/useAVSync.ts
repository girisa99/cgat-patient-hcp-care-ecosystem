/**
 * useAVSync — Audio-Video Synchronization Engine
 *
 * Bridges the gap between independent audio_voice and primary_video tracks
 * in the timeline editor. Provides:
 *
 *   1. Real-time sync status calculation (aligned / audio_too_long / audio_too_short)
 *   2. Auto-align: stretch or trim video/audio to match durations
 *   3. Pre-render validation: catch mismatches before assembly
 *   4. Teleprompter sync: word-level cursor from audio playhead
 *   5. Speed adjustment: adjust TTS speed to fit video duration
 *
 * Works for ALL production types: avatar, cinematic, podcast, animation,
 * presentation video, screen recording, etc.
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { VideoTimelineHook, TimelineClip, TimelineTrack } from './useVideoTimeline';

// ─── Types ─────────────────────────────────────────────────────────────────

export type SyncState = 'aligned' | 'audio_too_long' | 'audio_too_short' | 'no_audio' | 'no_video';

export interface ClipSyncPair {
  sceneLabel: string;
  sceneIndex: number;
  videoClipId: string | null;
  audioClipId: string | null;
  videoDurationMs: number;
  audioDurationMs: number;
  syncState: SyncState;
  deviationMs: number;       // absolute difference
  deviationPercent: number;  // percentage deviation
  canAutoFix: boolean;
}

export interface SyncReport {
  pairs: ClipSyncPair[];
  totalPairs: number;
  alignedCount: number;
  mismatchCount: number;
  noAudioCount: number;
  noVideoCount: number;
  worstDeviationMs: number;
  overallStatus: 'perfect' | 'acceptable' | 'needs_attention' | 'critical';
  isReadyForRender: boolean;
}

export interface TeleprompterState {
  currentWordIndex: number;
  totalWords: number;
  progress: number;            // 0-1
  currentWord: string;
  upcomingWords: string[];     // Next 5 words
  isActive: boolean;
  scriptText: string;
}

// Tolerance: clips within this range are considered "aligned"
const SYNC_TOLERANCE_MS = 500; // 0.5 seconds
const ACCEPTABLE_DEVIATION_PERCENT = 10; // 10%
const CRITICAL_DEVIATION_PERCENT = 30;   // 30%

// Teleprompter speaking rate: characters per second
const CHARS_PER_SECOND = 14;

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useAVSync(timeline: VideoTimelineHook) {
  const { state } = timeline;
  const [teleprompterScript, setTeleprompterScript] = useState<string>('');
  const wordsRef = useRef<string[]>([]);
  const weightsRef = useRef<number[]>([]);
  const totalWeightRef = useRef(0);

  // ── Build clip sync pairs ────────────────────────────────────────────────
  // Pair up video clips with audio clips by matching startMs positions

  const syncPairs = useMemo((): ClipSyncPair[] => {
    const videoTrack = state.tracks.find(t => t.type === 'primary_video');
    const audioTrack = state.tracks.find(t => t.type === 'audio_voice');
    if (!videoTrack && !audioTrack) return [];

    const videoClips = (videoTrack?.clips || [])
      .map(id => state.clips[id])
      .filter(Boolean)
      .sort((a, b) => a.startMs - b.startMs);

    const audioClips = (audioTrack?.clips || [])
      .map(id => state.clips[id])
      .filter(Boolean)
      .sort((a, b) => a.startMs - b.startMs);

    // Match by proximity: pair clips that overlap or are within tolerance
    const pairs: ClipSyncPair[] = [];
    const usedAudioIds = new Set<string>();

    videoClips.forEach((vc, i) => {
      const effectiveVideoDur = vc.durationMs - vc.trimStartMs - vc.trimEndMs;
      const vcStart = vc.startMs;
      const vcEnd = vcStart + effectiveVideoDur;

      // Find best matching audio clip (overlapping or closest)
      let bestAudio: TimelineClip | null = null;
      let bestOverlap = 0;

      audioClips.forEach(ac => {
        if (usedAudioIds.has(ac.id)) return;
        const effectiveAudioDur = ac.durationMs - ac.trimStartMs - ac.trimEndMs;
        const acStart = ac.startMs;
        const acEnd = acStart + effectiveAudioDur;

        const overlapStart = Math.max(vcStart, acStart);
        const overlapEnd = Math.min(vcEnd, acEnd);
        const overlap = Math.max(0, overlapEnd - overlapStart);

        if (overlap > bestOverlap || (!bestAudio && Math.abs(vcStart - acStart) < 2000)) {
          bestOverlap = overlap;
          bestAudio = ac;
        }
      });

      if (bestAudio) usedAudioIds.add(bestAudio.id);

      const audioDurMs = bestAudio
        ? bestAudio.durationMs - bestAudio.trimStartMs - bestAudio.trimEndMs
        : 0;

      const deviationMs = Math.abs(effectiveVideoDur - audioDurMs);
      const deviationPercent = effectiveVideoDur > 0
        ? (deviationMs / effectiveVideoDur) * 100
        : 0;

      let syncState: SyncState;
      if (!bestAudio) {
        syncState = 'no_audio';
      } else if (deviationMs <= SYNC_TOLERANCE_MS) {
        syncState = 'aligned';
      } else if (audioDurMs > effectiveVideoDur) {
        syncState = 'audio_too_long';
      } else {
        syncState = 'audio_too_short';
      }

      pairs.push({
        sceneLabel: vc.label || `Scene ${i + 1}`,
        sceneIndex: i,
        videoClipId: vc.id,
        audioClipId: bestAudio?.id || null,
        videoDurationMs: effectiveVideoDur,
        audioDurationMs: audioDurMs,
        syncState,
        deviationMs,
        deviationPercent,
        canAutoFix: syncState !== 'no_audio' && deviationPercent < 50,
      });
    });

    // Orphaned audio clips (no matching video)
    audioClips.forEach((ac, i) => {
      if (usedAudioIds.has(ac.id)) return;
      const audioDurMs = ac.durationMs - ac.trimStartMs - ac.trimEndMs;
      pairs.push({
        sceneLabel: ac.label || `Audio ${i + 1}`,
        sceneIndex: pairs.length,
        videoClipId: null,
        audioClipId: ac.id,
        videoDurationMs: 0,
        audioDurationMs: audioDurMs,
        syncState: 'no_video',
        deviationMs: audioDurMs,
        deviationPercent: 100,
        canAutoFix: false,
      });
    });

    return pairs;
  }, [state.tracks, state.clips]);

  // ── Sync report ──────────────────────────────────────────────────────────

  const syncReport = useMemo((): SyncReport => {
    const alignedCount = syncPairs.filter(p => p.syncState === 'aligned').length;
    const mismatchCount = syncPairs.filter(p => p.syncState === 'audio_too_long' || p.syncState === 'audio_too_short').length;
    const noAudioCount = syncPairs.filter(p => p.syncState === 'no_audio').length;
    const noVideoCount = syncPairs.filter(p => p.syncState === 'no_video').length;
    const worstDeviationMs = Math.max(0, ...syncPairs.map(p => p.deviationMs));
    const worstDeviationPercent = Math.max(0, ...syncPairs.map(p => p.deviationPercent));

    let overallStatus: SyncReport['overallStatus'];
    if (mismatchCount === 0 && noAudioCount === 0) {
      overallStatus = 'perfect';
    } else if (worstDeviationPercent <= ACCEPTABLE_DEVIATION_PERCENT) {
      overallStatus = 'acceptable';
    } else if (worstDeviationPercent <= CRITICAL_DEVIATION_PERCENT) {
      overallStatus = 'needs_attention';
    } else {
      overallStatus = 'critical';
    }

    return {
      pairs: syncPairs,
      totalPairs: syncPairs.length,
      alignedCount,
      mismatchCount,
      noAudioCount,
      noVideoCount,
      worstDeviationMs,
      overallStatus,
      isReadyForRender: overallStatus === 'perfect' || overallStatus === 'acceptable',
    };
  }, [syncPairs]);

  // ── Auto-fix: trim audio to match video ──────────────────────────────────

  const trimAudioToVideo = useCallback((pairIndex: number) => {
    const pair = syncPairs[pairIndex];
    if (!pair || !pair.audioClipId || pair.syncState !== 'audio_too_long') return;

    const audioClip = state.clips[pair.audioClipId];
    if (!audioClip) return;

    // Trim the audio from end to match video duration
    const excess = pair.audioDurationMs - pair.videoDurationMs;
    timeline.updateClip(pair.audioClipId, {
      trimEndMs: audioClip.trimEndMs + excess,
    });
  }, [syncPairs, state.clips, timeline]);

  // ── Auto-fix: extend video to match audio ────────────────────────────────

  const extendVideoToAudio = useCallback((pairIndex: number) => {
    const pair = syncPairs[pairIndex];
    if (!pair || !pair.videoClipId || pair.syncState !== 'audio_too_short') return;

    const videoClip = state.clips[pair.videoClipId];
    if (!videoClip) return;

    // Trim the video from end to match audio duration (makes video shorter to match)
    const excess = pair.videoDurationMs - pair.audioDurationMs;
    timeline.updateClip(pair.videoClipId, {
      trimEndMs: videoClip.trimEndMs + excess,
    });
  }, [syncPairs, state.clips, timeline]);

  // ── Auto-fix: align start positions ──────────────────────────────────────

  const alignStartPositions = useCallback((pairIndex: number) => {
    const pair = syncPairs[pairIndex];
    if (!pair || !pair.audioClipId || !pair.videoClipId) return;

    const videoClip = state.clips[pair.videoClipId];
    const audioClip = state.clips[pair.audioClipId];
    if (!videoClip || !audioClip) return;

    // Snap audio startMs to video startMs
    if (audioClip.startMs !== videoClip.startMs) {
      timeline.updateClip(pair.audioClipId, { startMs: videoClip.startMs });
    }
  }, [syncPairs, state.clips, timeline]);

  // ── Auto-fix ALL pairs ───────────────────────────────────────────────────

  const autoFixAll = useCallback(() => {
    syncPairs.forEach((pair, i) => {
      if (!pair.canAutoFix) return;

      // First align start positions
      alignStartPositions(i);

      // Then fix durations
      if (pair.syncState === 'audio_too_long') {
        trimAudioToVideo(i);
      } else if (pair.syncState === 'audio_too_short') {
        extendVideoToAudio(i);
      }
    });
  }, [syncPairs, alignStartPositions, trimAudioToVideo, extendVideoToAudio]);

  // ── Pre-render validation ────────────────────────────────────────────────

  const validateForRender = useCallback((): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for clips with no media
    const placeholders = Object.values(state.clips).filter(c => c.status === 'placeholder');
    if (placeholders.length > 0) {
      errors.push(`${placeholders.length} placeholder clip(s) have no content`);
    }

    // Check for failed clips
    const failed = Object.values(state.clips).filter(c => c.status === 'failed');
    if (failed.length > 0) {
      errors.push(`${failed.length} clip(s) failed generation — regenerate before rendering`);
    }

    // Check for generating clips
    const generating = Object.values(state.clips).filter(c => c.status === 'generating' || c.status === 'queued');
    if (generating.length > 0) {
      errors.push(`${generating.length} clip(s) still generating — wait for completion`);
    }

    // Check A/V sync
    syncPairs.forEach(pair => {
      if (pair.syncState === 'no_audio' && pair.videoClipId) {
        warnings.push(`Scene "${pair.sceneLabel}" has no voiceover`);
      }
      if (pair.deviationPercent > CRITICAL_DEVIATION_PERCENT) {
        errors.push(`Scene "${pair.sceneLabel}" has ${(pair.deviationMs / 1000).toFixed(1)}s A/V mismatch (${Math.round(pair.deviationPercent)}%)`);
      } else if (pair.deviationPercent > ACCEPTABLE_DEVIATION_PERCENT) {
        warnings.push(`Scene "${pair.sceneLabel}" has minor A/V drift (${(pair.deviationMs / 1000).toFixed(1)}s)`);
      }
    });

    // Check total duration
    if (state.totalDurationMs === 0) {
      errors.push('Timeline is empty — add clips before rendering');
    }

    // Check for unapproved scenes
    const unapproved = state.scenes.filter(s => !s.approved);
    if (unapproved.length > 0 && state.scenes.length > 0) {
      warnings.push(`${unapproved.length} scene(s) not yet approved`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }, [state, syncPairs]);

  // ── Teleprompter sync ────────────────────────────────────────────────────
  // Reuses the weighted-word algorithm from useTeleprompterSync

  useEffect(() => {
    if (!teleprompterScript) {
      wordsRef.current = [];
      weightsRef.current = [];
      totalWeightRef.current = 0;
      return;
    }

    const words = teleprompterScript.split(/\s+/).filter(w => w.length > 0);
    wordsRef.current = words;

    const weights = words.map(word => {
      let weight = word.length;
      if (word.match(/[.!?]$/)) weight += 8;    // Sentence end pause
      else if (word.match(/[,;:]$/)) weight += 4; // Clause pause
      else if (word.match(/[-–—]$/)) weight += 2; // Dash pause
      return Math.max(weight, 3);
    });

    weightsRef.current = weights;
    totalWeightRef.current = weights.reduce((sum, w) => sum + w, 0);
  }, [teleprompterScript]);

  const teleprompterState = useMemo((): TeleprompterState => {
    const words = wordsRef.current;
    const weights = weightsRef.current;
    const totalWeight = totalWeightRef.current;

    if (words.length === 0 || state.totalDurationMs <= 0) {
      return {
        currentWordIndex: 0,
        totalWords: words.length,
        progress: 0,
        currentWord: '',
        upcomingWords: [],
        isActive: false,
        scriptText: teleprompterScript,
      };
    }

    // Calculate progress from playhead with 2% lag for natural reading
    const timeProgress = Math.max(0, (state.playheadMs / state.totalDurationMs) - 0.02);

    let accumulatedWeight = 0;
    let targetIndex = 0;

    for (let i = 0; i < words.length; i++) {
      const progress = accumulatedWeight / totalWeight;
      if (progress >= timeProgress) {
        targetIndex = Math.max(0, i - 1);
        break;
      }
      accumulatedWeight += weights[i];
      targetIndex = i;
    }

    targetIndex = Math.max(0, Math.min(targetIndex, words.length - 1));

    return {
      currentWordIndex: targetIndex,
      totalWords: words.length,
      progress: state.totalDurationMs > 0 ? state.playheadMs / state.totalDurationMs : 0,
      currentWord: words[targetIndex] || '',
      upcomingWords: words.slice(targetIndex + 1, targetIndex + 6),
      isActive: state.isPlaying,
      scriptText: teleprompterScript,
    };
  }, [state.playheadMs, state.totalDurationMs, state.isPlaying, teleprompterScript]);

  // ── Estimate TTS speed to fit video ──────────────────────────────────────

  const estimateTTSSpeed = useCallback((text: string, targetDurationMs: number): number => {
    const naturalDurationMs = (text.length / CHARS_PER_SECOND) * 1000;
    const speed = naturalDurationMs / targetDurationMs;
    // Clamp to reasonable TTS speed range
    return Math.max(0.5, Math.min(2.0, speed));
  }, []);

  return {
    // Sync analysis
    syncPairs,
    syncReport,

    // Auto-fix actions
    trimAudioToVideo,
    extendVideoToAudio,
    alignStartPositions,
    autoFixAll,

    // Pre-render validation
    validateForRender,

    // Teleprompter
    teleprompterState,
    setTeleprompterScript,

    // Utilities
    estimateTTSSpeed,
  };
}

export type AVSyncHook = ReturnType<typeof useAVSync>;
