/**
 * COMPOSITION STUDIO BARREL EXPORT
 */

// Primary Studio - Simplified V3 with Ecosystem Integration
export { SimpleCompositionStudio } from './SimpleCompositionStudio';
export { default as SimpleCompositionStudioDefault } from './SimpleCompositionStudio';

// AI Recommendations - Proactive template/visual suggestions with Label Studio learning
export { AIRecommendationsPanel } from './AIRecommendationsPanel';

// Ecosystem Services Hook - Connects to all existing services
export { useStudioEcosystem } from './useStudioEcosystem';
export type { StudioChapter, StudioProject, GenerationProgress, InlineEditAction } from './useStudioEcosystem';

// Inline Chapter Editor - Quick edit controls per chapter
export { ChapterInlineEditor } from './ChapterInlineEditor';

// Legacy Studio (keep for backwards compatibility)
export { UnifiedCompositionStudio } from './UnifiedCompositionStudio';
export { ChapterEditor } from './ChapterEditor';
export { LanguageSelectorPanel } from './LanguageSelectorPanel';
export { PreviewPanel } from './PreviewPanel';
export { ContentLibrary } from './ContentLibrary';
export { TemplatePreviewDialog, TEMPLATE_DEFINITIONS, LANDING_PAGE_SECTIONS } from './TemplatePreviewDialog';
export { ScheduledContentManager } from './ScheduledContentManager';
export { TemplateLandingMapper } from './TemplateLandingMapper';

// New: Category-based element management
export { ElementCategoryTabs, COMBINATION_PRESETS, DIALECT_REGIONS } from './ElementCategoryTabs';
export type { CategoryElement, ElementCategory, ElementConfig, DialectConfig, CombinationType } from './ElementCategoryTabs';

// New: Multi-stage review queue
export { ContentReviewQueue, getTargetRegionsFromLanguages } from './ContentReviewQueue';
export type { ReviewItem, ReviewStatus } from './ContentReviewQueue';

// New: Chapter management & selective regeneration
export { ChapterRegenerationPanel } from './ChapterRegenerationPanel';
export type { RegenerationTarget, RegenerationOptions } from './ChapterRegenerationPanel';
export { AddChapterDialog } from './AddChapterDialog';

// New: Thumbnail & metadata management
export { ThumbnailManager } from './ThumbnailManager';
export type { ThumbnailData, ContentMetadata } from './ThumbnailManager';

// New: Chapter Preview Panel - Inline preview with regenerate buttons
export { ChapterPreviewPanel } from './ChapterPreviewPanel';

// New: Review & Enhance Step - Dedicated review workflow
export { ReviewEnhanceStep } from './ReviewEnhanceStep';

// New: Generated Assets Sidebar - Floating assets overview
export { GeneratedAssetsSidebar, GeneratedAssetsTrigger } from './GeneratedAssetsSidebar';

// New: Multi-Language Audio Player - Primary + dropdown for other languages
export { MultiLanguageAudioPlayer } from './MultiLanguageAudioPlayer';

// New: Confidence Score Card - Quality analysis with 95% target
export { ConfidenceScoreCard } from './ConfidenceScoreCard';

// New: Script Enhance Editor - Inline editing with AI enhancement
export { ScriptEnhanceEditor } from './ScriptEnhanceEditor';

// New: Project Picker Dropdown - Consolidated project management
export { ProjectPickerDropdown } from './ProjectPickerDropdown';
export type { StoredProjectInfo } from './ProjectPickerDropdown';

// Scene Composition Engine - Scene-level creative freedom
// Service: src/services/sceneCompositionEngine.ts
// Hook: src/hooks/useSceneComposition.ts
// Recommendations: src/services/sceneRecommendationEngine.ts

export * from './types';
export type { LandingPageSection } from './TemplatePreviewDialog';
