/**
 * Genie Vibe Hooks - Export all hooks for the media production studio
 */

export { useCamera } from './useCamera';
export { useRecording } from './useRecording';
export { useRecordingStream } from './useRecordingStream';
export type { RecordingMode as StreamRecordingMode, PipConfig, PipPosition, PipSize } from './useRecordingStream';
export { useRecordingAudioMixer } from './useRecordingAudioMixer';
export { useRecordingPersistence } from './useRecordingPersistence';
export { useAudioPlayback } from './useAudioPlayback';
export { useRecordingLibrary } from './useRecordingLibrary';
export { useScreenShare } from './useScreenShare';
export type { RecordingMode } from './useScreenShare';
export { useScriptDraftStorage } from './useScriptDraftStorage';
export { useBackgroundBlur } from './useBackgroundBlur';
export { useMLBackgroundBlur } from './useMLBackgroundBlur';
export { useKeyboardShortcuts, SHORTCUTS } from './useKeyboardShortcuts';
export { useMediaProject, COST_ESTIMATES } from './useMediaProject';
export type { MediaProject, MediaProjectAsset, CostLog } from './useMediaProject';
export { useStudioSound, STUDIO_PRESETS } from './useStudioSound';
export type { StudioSoundSettings } from './useStudioSound';
export { useTTSGeneration, OPENAI_VOICES, ELEVENLABS_VOICES } from './useTTSGeneration';
export type { TTSOptions, TTSResult } from './useTTSGeneration';
export { useFFmpegTrim } from './useFFmpegTrim';
