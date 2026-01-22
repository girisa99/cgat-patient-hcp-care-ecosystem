/**
 * Registry System - Central Export
 * 
 * Modular, extensible configuration system for the Generation Pipeline.
 * Add new industries, frameworks, outputs, or visuals without code changes.
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
