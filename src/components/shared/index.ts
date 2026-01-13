/**
 * Shared Components - Cross-Product Universal Components
 * These components are used across multiple Genie products (Vibe, Spark, Mind, Arc, ProductionHub)
 * 
 * Last Updated: 2026-01-13
 */

// ============================================================================
// AUDIO & VOICE COMPONENTS
// ============================================================================

// Universal Audio Mixer - used in Vibe, Spark, Mind, Arc
export { AudioMixer } from '@/components/mobile/AudioMixer';

// Voice Commands - voice control for all products
export { VoiceCommands } from '@/components/mobile/VoiceCommands';
export type { VoiceCommand, VoiceCommandResult } from '@/components/mobile/VoiceCommands';

// Music Composer Panel - AI music generation
export { MusicComposerPanel } from '@/components/mobile/MusicComposerPanel';

// Voice Director Panel - TTS and coaching
export { VoiceDirectorPanel } from '@/components/mobile/VoiceDirectorPanel';

// ============================================================================
// ANALYSIS & AI COMPONENTS
// ============================================================================

// Scene Analyzer - AI scene detection
export { SceneAnalyzerPanel } from '@/components/mobile/SceneAnalyzerPanel';

// Content Analyzer - bidirectional content analysis
export { ContentAnalyzer } from '@/components/document-processing/RecordingStudio/components/ContentAnalyzer';

// ============================================================================
// DISTRIBUTION & PUBLISHING
// ============================================================================

// Publish Panel - multi-platform publishing
export { PublishPanel } from '@/components/mobile/PublishPanel';

// Distribution Agent - social/cloud export
export { DistributionAgentPanel } from '@/components/mobile/DistributionAgentPanel';

// ============================================================================
// EDITING & PROCESSING
// ============================================================================

// Quick Clips Generator - clip creation
export { QuickClipsGenerator } from '@/components/mobile/QuickClipsGenerator';

// Auto Editor Panel - AI editing
export { AutoEditorPanel } from '@/components/mobile/AutoEditorPanel';

// Script Video Matcher - script-to-video matching
export { ScriptVideoMatcherPanel } from '@/components/mobile/ScriptVideoMatcherPanel';

// Smart Transitions - AI transitions
export { SmartTransitions } from '@/components/mobile/SmartTransitions';

// AI Auto Arrange - clip arrangement
export { AIAutoArrange } from '@/components/mobile/AIAutoArrange';

// ============================================================================
// TIMELINE & MIXING
// ============================================================================

// Multi-Clip Timeline - timeline editing
export { MultiClipTimeline } from '@/components/mobile/MultiClipTimeline';

// Timeline Clip Editor - full clip manipulation
export { TimelineClipEditor } from '@/components/mobile/TimelineClipEditor';

// Music Sync Assembly - beat sync
export { MusicSyncAssembly } from '@/components/mobile/MusicSyncAssembly';

// Location Story Mode - geo-based storytelling
export { LocationStoryMode } from '@/components/mobile/LocationStoryMode';

// Floating Audio Mixer - compact mixer
export { FloatingAudioMixer } from '@/components/document-processing/RecordingStudio/components/FloatingAudioMixer';

// ============================================================================
// GUIDED EXPERIENCE
// ============================================================================

// Guided Editing Wizard
export { GuidedEditingWizard } from '@/components/mobile/GuidedEditingWizard';

// Smart Editing Sidebar
export { SmartEditingSidebar } from '@/components/mobile/SmartEditingSidebar';

// Universal AI Assistant
export { UniversalAIEditingAssistant } from '@/components/mobile/UniversalAIEditingAssistant';

// Guided Editing Experience (combined)
export { GuidedEditingExperience } from '@/components/mobile/GuidedEditingExperience';

// ============================================================================
// TEMPLATES
// ============================================================================

// Quick Templates
export { QuickTemplates } from '@/components/mobile/QuickTemplates';
export type { SocialTemplate, TemplateConfig } from '@/components/mobile/QuickTemplates';

// ============================================================================
// PROGRESS & STATUS
// ============================================================================

// Pipeline Progress
export { PipelineProgress } from '@/components/mobile/PipelineProgress';
export type { PipelineStage } from '@/components/mobile/PipelineProgress';

// ============================================================================
// PRODUCTION COMPONENTS (Cross-hub)
// ============================================================================

// Raw Recording Polisher
export { RawRecordingPolisher } from '@/components/production/RawRecordingPolisher';

// Multi-File Merger
export { MultiFileMerger } from '@/components/production/MultiFileMerger';

// B-Roll Integrator
export { BRollIntegrator } from '@/components/production/BRollIntegrator';

// Image Script Assembler
export { ImageScriptAssembler } from '@/components/production/ImageScriptAssembler';

// Podcast to Video Converter
export { PodcastToVideoConverter } from '@/components/production/PodcastToVideoConverter';

// Webinar Highlight Extractor
export { WebinarHighlightExtractor } from '@/components/production/WebinarHighlightExtractor';
