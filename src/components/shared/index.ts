 /**
  * Shared Components Index
  * Cross-product reusable components for Genie Suite ecosystem
  */
 
 // Regional & Localization
 export { RegionalDialectSelector, REGIONAL_CONFIG } from './RegionalDialectSelector';
 export type { DialectOption, SubRegion, RegionConfig } from './RegionalDialectSelector';
 
// Authoring Workflow
export { ScriptTemplateMapper } from './ScriptTemplateMapper';
export { AuthoringStageIndicator } from './AuthoringStageIndicator';
export { AVSyncPreview, type SyncStatus, type AVSyncPreviewProps } from './AVSyncPreview';
export { ApprovalDashboard } from './ApprovalDashboard';

// Unified Editor (Mind ↔ Cast shared)
export { UnifiedScriptPanel } from './UnifiedScriptPanel';
export { useUnifiedEditorState } from '@/hooks/useUnifiedEditorState';
export type { UnifiedEditorHook, EditorMode, SceneDocument } from '@/hooks/useUnifiedEditorState';
 
 // Re-export unified authoring hook for convenience
 export { useUnifiedAuthoring } from '@/hooks/useUnifiedAuthoring';
 export type {
   AuthoringStage,
   AuthoringConfig,
   AuthoringState,
   MessagingContent,
   SceneScript,
   TemplateMapping,
   ApprovalStatus,
 } from '@/hooks/useUnifiedAuthoring';
 
 // Re-export style intent resolver
 export { styleIntentResolver } from '@/services/styleIntentResolver';
 export type { StyleIntent, RegionZone, ProviderChain, ResolvedStyle } from '@/services/styleIntentResolver';
 
 // Re-export production components (for cross-product use)
 export { ImageScriptAssembler } from '@/components/production/ImageScriptAssembler';
 export { RawRecordingPolisher } from '@/components/production/RawRecordingPolisher';
 export { MultiFileMerger } from '@/components/production/MultiFileMerger';
 export { BRollIntegrator } from '@/components/production/BRollIntegrator';
 
 // Re-export mobile pipeline components (for cross-product use)
 export { QuickClipsGenerator } from '@/components/mobile/QuickClipsGenerator';
 export { MultiClipTimeline } from '@/components/mobile/MultiClipTimeline';
 export { AudioMixer } from '@/components/mobile/AudioMixer';
 export { PublishPanel } from '@/components/mobile/PublishPanel';
 export { PipelineProgress } from '@/components/mobile/PipelineProgress';
 export { VoiceCommands } from '@/components/mobile/VoiceCommands';
 export { SceneAnalyzerPanel } from '@/components/mobile/SceneAnalyzerPanel';
 export { AIAutoArrange } from '@/components/mobile/AIAutoArrange';
 export { SmartTransitions } from '@/components/mobile/SmartTransitions';
 export { MusicSyncAssembly } from '@/components/mobile/MusicSyncAssembly';
 export { LocationStoryMode } from '@/components/mobile/LocationStoryMode';
 export { TimelineClipEditor } from '@/components/mobile/TimelineClipEditor';