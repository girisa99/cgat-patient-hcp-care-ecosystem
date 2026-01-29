/**
 * COMPOSITION STUDIO BARREL EXPORT
 */

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
