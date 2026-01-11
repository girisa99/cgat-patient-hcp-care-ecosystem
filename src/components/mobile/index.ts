/**
 * Mobile Components Index
 * P1 Mobile MVP - Complete Component Library
 * 
 * Pipeline: Record → Clips → Mix → Timeline → Publish
 */

// Status & Native
export { MobileStatusBar } from './MobileStatusBar';
export { NativeFeatureButton } from './NativeFeatureButton';
export { PWAInstallPrompt } from './PWAInstallPrompt';

// Recording
export { OneTapRecordButton } from './OneTapRecordButton';

// Pipeline Components
export { QuickClipsGenerator } from './QuickClipsGenerator';
export { AudioMixer } from './AudioMixer';
export { MultiClipTimeline } from './MultiClipTimeline';
export { PublishPanel } from './PublishPanel';
export { PipelineProgress } from './PipelineProgress';
export type { PipelineStage } from './PipelineProgress';

// Legacy (kept for compatibility)
export { ScriptStitcher } from './ScriptStitcher';
export type { ScriptSegment, MusicTrack, StitchedResult } from './ScriptStitcher';
