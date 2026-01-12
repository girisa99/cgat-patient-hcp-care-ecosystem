/**
 * Mobile Components Index
 * P1 Mobile MVP - Complete Component Library (100% Complete)
 * P2 Advanced Features - 100% Complete
 * 
 * Pipeline: Record → Clips → Mix → Timeline → Templates → Voice → Edit → Publish
 * Components: 19 total (14 P1 + 5 P2)
 * Last Updated: 2026-01-12
 */

// Status & Native
export { MobileStatusBar } from './MobileStatusBar';
export { NativeFeatureButton } from './NativeFeatureButton';
export { PWAInstallPrompt } from './PWAInstallPrompt';

// P1: Offline Mode
export { OfflineStudioMode } from './OfflineStudioMode';
export type { OfflineFeature, PendingItem } from './OfflineStudioMode';

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

// P2: Timeline Clip Editor (Full Manipulation)
export { TimelineClipEditor } from './TimelineClipEditor';

// P2: AI Auto-Arrange
export { AIAutoArrange } from './AIAutoArrange';

// P2: Smart Transitions
export { SmartTransitions } from './SmartTransitions';

// P2: Music Sync Assembly
export { MusicSyncAssembly } from './MusicSyncAssembly';

// P2: Location Story Mode
export { LocationStoryMode } from './LocationStoryMode';

// Legacy (kept for compatibility)
export { ScriptStitcher } from './ScriptStitcher';
export type { ScriptSegment, MusicTrack, StitchedResult } from './ScriptStitcher';
