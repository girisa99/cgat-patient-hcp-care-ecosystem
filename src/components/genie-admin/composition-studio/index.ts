/**
 * COMPOSITION STUDIO BARREL EXPORT
 */

// Primary Studio - Simplified V3 with Ecosystem Integration
export { SimpleCompositionStudio } from './SimpleCompositionStudio';
export { default as SimpleCompositionStudioDefault } from './SimpleCompositionStudio';

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

export * from './types';
export type { LandingPageSection } from './TemplatePreviewDialog';
