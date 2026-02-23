/**
 * Script Editor Module - Barrel export
 *
 * Modular architecture extracted from the monolithic ScriptEditorTab.tsx (2749 lines)
 * into focused sub-components and utilities.
 */

// Types
export type {
  ScriptPurpose,
  SavedScript,
  ScriptStats,
  AnalysisRecommendation,
  PauseOpportunity,
  SectionBreak,
  OverallAssessment,
  EngagementAnalysis,
  EnhancementChange,
  EnhancementMarkers,
  EngagementScore,
  ShowInfo,
  AnalysisResult,
  AIProvider,
  EnhancementFocus,
} from './types';

// Utilities
export { calculateStats, ANALYSIS_STEPS } from './utils';

// Sub-components
export { ScriptStatsBar } from './ScriptStatsBar';
export { ProgressiveAnalysisOverlay } from './ProgressiveAnalysisOverlay';
export { AnalysisResultsPanel } from './AnalysisResultsPanel';
export { EnhancementReviewPanel } from './EnhancementReviewPanel';
export { EnhancementDialog } from './EnhancementDialog';
export { TTSOptionsPanel } from './TTSOptionsPanel';
export { TranscreationPreview } from './TranscreationPreview';
export { BrandVoiceChecker } from './BrandVoiceChecker';
export { VersionHistoryPanel, type ScriptVersionEntry } from './VersionHistoryPanel';
