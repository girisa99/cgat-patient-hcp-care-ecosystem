/**
 * Genie Studio Services - Barrel Export
 * Re-exports all Genie Studio-specific services
 */

// Script generation services
export { audioToScriptService } from '@/services/audioToScriptService';
export { documentToScriptService } from '@/services/documentToScriptService';
export { imageToScriptService } from '@/services/imageToScriptService';
export { urlToScriptService } from '@/services/urlToScriptService';
export { videoToScriptService } from '@/services/videoToScriptService';
export { genieScriptService } from '@/services/genieScriptService';

// Media production services
export { AIMediaService } from '@/services/aiMediaService';
export { universalMediaService } from '@/services/universalMediaService';
export { bulkVideoGenerationService } from '@/services/bulkVideoGenerationService';
export { externalVisualContentService } from '@/services/externalVisualContentService';
export { geminiMediaService } from '@/services/geminiMediaService';
export { mediaProductionOrchestrator } from '@/services/mediaProductionOrchestrator';
export { multiLanguageDubbingService } from '@/services/multiLanguageDubbingService';
export { socialCutsService } from '@/services/socialCutsService';

// Content safety and compliance
export type { ContentViolation } from '@/services/contentViolationTracker';
export { seoOptimizationService } from '@/services/seoOptimizationService';

// Publishing and distribution
export { scheduledPublishingService } from '@/services/scheduledPublishingService';

// AI provider services
export { aiProviderService } from '@/services/aiProviderService';
export { enhancedAIService } from '@/services/enhancedAIService';
export { unifiedAIConnector } from '@/services/unifiedAIConnector';

// Proactive editing services (NEW)
export { 
  proactivePipelineEditorService, 
  PIPELINE_EDITOR_CONFIGS,
  EDIT_CAPABILITIES,
  type ProactiveEditSuggestion,
  type PipelineEditorConfig,
  type EditCapability,
  type EditorType,
  type EditorPriority,
  type DeviceContext
} from '@/services/proactivePipelineEditorService';

// Ask Genie Knowledge Base (updated with 180 pipelines + editing)
export { 
  askGeniePipelineKnowledgeBase,
  WIZARD_STEPS_KNOWLEDGE,
  EDITING_KNOWLEDGE,
  A2A_AGENT_KNOWLEDGE,
  SUPPORT_KNOWLEDGE,
  ASK_GENIE_AI_CAPABILITIES
} from '@/services/askGeniePipelineKnowledgeBase';
