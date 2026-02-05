/**
 * Video Assembly Pipeline - Public API
 * 
 * Enhanced video assembly with:
 * - Batch processing queue
 * - Real-time progress streaming  
 * - Quality presets with tier gating
 * - Smart retry and error recovery
 * - Cost estimation and preview
 */

// Types
export * from './types';

// Main service
export { videoAssemblyService, VideoAssemblyService } from './VideoAssemblyService';

// Hooks
export { useVideoAssembly } from './hooks/useVideoAssembly';
export { useAssemblyProgress, formatElapsedTime, getPhaseDisplayName } from './hooks/useAssemblyProgress';
export { useCostEstimation, formatCredits, getCostSummary, getQualityRecommendation } from './hooks/useCostEstimation';
