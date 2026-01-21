/**
 * Presentation Generator Constants - Centralized Exports
 * All model categories, output types, visual features, and frameworks
 */

// Model Categories (separated by type with consistent tiering)
export {
  IMAGE_MODELS,
  VIDEO_MODELS,
  MESH_3D_MODELS,
  VOICE_MODELS,
  STT_MODELS,
  OCR_MODELS,
  TRANSLATION_MODELS,
  TEXT_MODELS,
  ALL_MODEL_CATEGORIES,
  getModelsByTier,
  getDefaultModel,
  getModelById,
  getTierLabel,
  getTierColor,
  type ModelConfig
} from './modelCategories';

// Expanded Output Types (16 types across 3 tiers)
export {
  EXPANDED_OUTPUT_CONFIGS,
  OUTPUT_TIERS,
  OUTPUT_CATEGORIES,
  getOutputsByTier,
  getOutputsByCategory,
  getOutputById,
  getRecommendedOutput,
  type ExpandedOutputType,
  type ExpandedOutputConfig
} from './expandedOutputTypes';

// Expanded Visual Features (22 categories, 100+ sub-options)
export {
  EXPANDED_VISUAL_FEATURES,
  VISUAL_FEATURE_CATEGORIES,
  VISUAL_FEATURE_STATS,
  getVisualFeaturesByCategory,
  getVisualFeaturesByTier,
  getVisualFeatureById,
  type ExpandedVisualFeature,
  type VisualFeatureSubOption
} from './expandedVisualFeatures';

// Expanded Frameworks (Regional + Industry + Methodology)
export {
  EXPANDED_FRAMEWORK_CATEGORIES,
  FRAMEWORK_TYPE_LABELS,
  getFrameworksByType,
  getAllFrameworks,
  type Framework,
  type FrameworkCategory
} from './expandedFrameworks';

// Services - re-export for convenience
export * from '../services/visualOutputCompatibilityMatrix';
export * from '../services/outputModelSelection';
