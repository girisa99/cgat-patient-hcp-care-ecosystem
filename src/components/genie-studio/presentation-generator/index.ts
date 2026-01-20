/**
 * Presentation Generator - Module Exports
 * Part of Genie Spark - Mind to Media Production
 * 
 * Extended with:
 * - Template & theme selection
 * - Branding customization (logo, colors)
 * - Table & chart editing
 * - Multi-language parallel generation
 * - Drag-and-drop layout editing
 * - Agent-based generation with real-time streaming
 * - Version comparison and enhancement
 */

export * from './types';
export { SlideAIEnhancer } from './SlideAIEnhancer';
export { BulletPointEditor } from './BulletPointEditor';
export { SlideCard } from './SlideCard';
export type { SlideConfidence } from './SlideCard';
export { PresentationGeneratorPanel } from './PresentationGeneratorPanel';
export { PresentationWizard } from './PresentationWizard';
export { VideoExportPanel } from './VideoExportPanel';
export { LanguageSelector } from './LanguageSelector';
export { ComplianceChecker } from './ComplianceChecker';
export { RichSlideEditor } from './RichSlideEditor';
export { AIProviderPanel } from './AIProviderPanel';
export { GenerationProgressPanel } from './GenerationProgressPanel';
export { TemplateThemeSelector, TEMPLATES, COLOR_PALETTES, FONT_OPTIONS } from './TemplateThemeSelector';
export { BrandingCustomizer, DEFAULT_BRAND_CONFIG, type BrandConfig } from './BrandingCustomizer';
export { TableEditor, ChartEditor } from './TableChartEditor';
export { MultiLanguageGenerator, useMultiLanguageGeneration, SUPPORTED_LANGUAGES } from './MultiLanguageGenerator';
export type { LanguageConfig, LanguageGenerationStatus } from './MultiLanguageGenerator';
export { DraggableSlideLayout } from './DraggableSlideLayout';
export type { LayoutElement } from './DraggableSlideLayout';

// Agent-based multi-language generation components
export { LanguageModelSelector } from './LanguageModelSelector';
export { LanguageConfigPopup } from './LanguageConfigPopup';
export { GenerationSummaryPanel } from './GenerationSummaryPanel';
export { VersionComparisonPanel } from './VersionComparisonPanel';
export { SlideEnhancerPanel } from './SlideEnhancerPanel';
export type { SlideEnhancementType } from './SlideEnhancerPanel';
export { RealTimeSlideStreamer } from './RealTimeSlideStreamer';

// Wizard Constants & Types (centralized configuration)
export { 
  COLLATERAL_TYPES,
  INDUSTRY_CATEGORIES,
  CONSULTING_TEMPLATES,
  AI_MODELS,
  THEME_PRESETS,
  SEGMENTS,
  getRecommendedProviders,
  type CollateralType,
  type IndustryCategory,
  type ConsultingTemplate,
  type AIModelConfig,
  type FinalWorkflowConfig,
  type Segment,
  type AIProviderRecommendation,
  type ThemeConfig,
  type SlideLayout,
  type LayoutZone,
} from './wizardConstants';

// Legacy: EnhancedTemplateWorkflow (deprecated - use wizardConstants instead)
export { EnhancedTemplateWorkflow } from './EnhancedTemplateWorkflow';

// Agent architecture definitions
export { 
  AGENT_TYPES, 
  AGENT_CATALOG,
  type AgentType,
  type AgentConfig,
  type AgentMessageType,
  type AgentMessage,
  type AgentExecutionContext,
} from './AgentArchitecture';

// Template Repository
export { TemplateRepository } from './TemplateRepository';
export { VoiceAudioConfigPanel } from './VoiceAudioConfigPanel';
export { ContentContextPanel } from './ContentContextPanel';
export { AgentLanguageConfigPanel } from './AgentLanguageConfigPanel';
