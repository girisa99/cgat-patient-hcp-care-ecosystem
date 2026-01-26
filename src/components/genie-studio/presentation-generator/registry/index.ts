/**
 * Registry System - Central Export
 * 
 * Modular, extensible configuration system for the Generation Pipeline.
 * Add new industries, frameworks, outputs, or visuals without code changes.
 * 
 * ECOSYSTEM BRIDGE:
 * - 7 Products: Spark, Mind, Vibe, Deck, Arc, Cast, Studio
 * - 21 Categories: Connected via OUTPUT_TO_CATEGORY_MAP
 * - 181 Pipelines: Accessible through PIPELINE_CATEGORIES_DROPDOWN
 */

// Step Registry - Wizard Step Management
export * from './stepRegistry';

// Context Registry - Industries, Frameworks, Visuals, Outputs
export * from './contextRegistry';

// Publishing Registry - Export, Cloud, Platform Distribution
export * from './publishingRegistry';

// Re-export commonly used types
export type { 
  StepId, 
  StepCategory, 
  StepConfig, 
  StepMetadata, 
  StepValidation,
  WizardContext 
} from './stepRegistry';

export type {
  IndustryItem,
  FrameworkItem,
  VisualFeatureItem,
  OutputTypeItem,
} from './contextRegistry';

export type {
  PublishConfig,
  ExportFormat,
  CloudPublishOption,
  PlatformPublishOption,
} from './publishingRegistry';

// Ecosystem Bridge Exports - 21 Categories, 181 Pipelines
export {
  OUTPUT_TO_CATEGORY_MAP,
  VISUAL_FEATURE_TO_CATEGORY_MAP,
  PIPELINE_CATEGORIES_DROPDOWN,
  getOutputProductRouting,
  getOutputsForProduct,
  getVisualFeaturesForCategory,
  getPipelineCategoriesForProduct,
  getPipelineCategory,
} from './contextRegistry';

export type { PipelineCategoryId } from './contextRegistry';
