/**
 * Video Editing Hooks — Universal Production Pipeline
 *
 * Style-agnostic editing system supporting:
 *   - 93 production styles (master + extended)
 *   - Multi-track timeline (video, audio, subtitle, overlay)
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
