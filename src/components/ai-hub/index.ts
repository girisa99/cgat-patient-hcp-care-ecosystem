/**
 * AI Hub Components - Barrel Export
 * 
 * Components for AI provider management, selection, and visualization
 * across the Genie Suite ecosystem.
 */

// Dashboard & Visualization
export { AIProviderMatrixDashboard } from './AIProviderMatrixDashboard';

// Contextual Selection
export { ContextualAISelector, default as ContextualAISelectorDefault } from './ContextualAISelector';

// Re-export hook for convenience
export { 
  useContextualAIProviders,
  type GenieProduct,
  type TaskScenario,
  type ProviderRecommendation,
  type ContextualProviderResult,
} from '@/hooks/useContextualAIProviders';

// Re-export unified AI hub hook
export { 
  useUniversalAIHub,
} from '@/hooks/useUniversalAIHub';
