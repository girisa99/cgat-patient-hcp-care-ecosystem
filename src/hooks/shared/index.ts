/**
 * Shared Hooks Index - Consolidated utilities for reuse across Genie Suite
 * 
 * These hooks provide consistent patterns for:
 * - Audio element management with proper cleanup
 * - Fetch operations with timeout handling
 * - Global tier management across products
 */

// Audio utilities
export { 
  createManagedAudio,
  useAudioElement,
  getAudioDuration,
  playAudioOneShot,
  type AudioElementOptions,
  type AudioElementControls,
} from './useAudioElement';

// Fetch utilities  
export {
  fetchWithTimeout,
  useFetchWithTimeout,
  createEdgeFunctionFetcher,
  callEdgeFunction,
  type FetchWithTimeoutOptions,
  type FetchResult,
} from './useFetchWithTimeout';

// Shared module logic
export { useSharedModuleLogic } from './useSharedModuleLogic';

// Global Tier Management (cross-product)
export { useGlobalTier } from '../useGlobalTier';

// Re-export shared services
export * from '@/services/shared';
