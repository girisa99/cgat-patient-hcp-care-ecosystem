/**
 * Video Editing Hooks — Universal Production Pipeline
 *
 * Style-agnostic editing system supporting:
 *   - 93 production styles (master + extended)
 *   - All formats: video, podcast, webcast, presentation, animation, avatar
 *   - Multi-track timeline (video, audio, subtitle, overlay)
 *   - Unified production session: script → TTS → video → timeline
 *   - A/V sync alignment with pre-render validation
 *   - 30+ platform export targets
 *   - Streaming downloads with pause/resume for large files
 *   - Offline video import, clip operations, chapters, scenes
 */

export { useVideoTimeline, type VideoTimelineHook } from './useVideoTimeline';
export { useClipOperations, type ClipOperationsHook } from './useClipOperations';
export { usePlatformExport, type PlatformExportHook } from './usePlatformExport';
export { useAVSync, type AVSyncHook } from './useAVSync';
export { useStreamingDownload, type StreamingDownloadHook, VIDEO_DOWNLOAD_PRESETS } from './useStreamingDownload';
export { useProductionEstimator, type ProductionEstimatorHook, PROVIDER_LIMITS, TTS_PROVIDER_LIMITS } from './useProductionEstimator';
export { useProductionSession, type ProductionSessionHook, type ProductionFormat, type SceneMediaState, type SceneSegmentType } from './useProductionSession';
export { useVideoEffects, type VideoEffectsHook, type VideoEffect, type EffectPreset, type EffectCategory, type ColorGradingPreset, type FilterType, type MotionEffect, type CompositionMode } from './useVideoEffects';
