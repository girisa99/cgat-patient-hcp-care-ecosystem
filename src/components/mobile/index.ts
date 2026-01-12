/**
 * Mobile Components Index
 * P1 Mobile MVP - Complete Component Library (95% Complete)
 * P2 Advanced Features - Voice Commands (45% Complete)
 * 
 * Pipeline: Record → Clips → Mix → Timeline → Templates → Voice → Publish
 * Components: 13 total (11 P1 + 2 P2)
 * Last Updated: 2026-01-12
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

// P1: Quick Templates (Social)
export { QuickTemplates } from './QuickTemplates';
export type { SocialTemplate, TemplateConfig } from './QuickTemplates';

// P2: Voice-First Editing
export { VoiceCommands } from './VoiceCommands';
export type { VoiceCommand, VoiceCommandResult } from './VoiceCommands';

// Legacy (kept for compatibility)
export { ScriptStitcher } from './ScriptStitcher';
export type { ScriptSegment, MusicTrack, StitchedResult } from './ScriptStitcher';
