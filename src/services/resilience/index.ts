/**
 * Resilience Services Index
 * P4 Recovery & Error Handling (7→11 scenarios complete)
 * 
 * Exports:
 * - Circuit Breaker: Auto-disable failing providers
 * - Graceful Degradation: Fallback to lower quality
 * - Retry UI: User-facing retry controls
 */

export {
  circuitBreakerService,
  registerProviders,
  type CircuitState,
  type CircuitBreakerConfig,
  type ProviderCircuit,
  type CircuitBreakerEvent,
} from './circuitBreakerService';

export {
  gracefulDegradationService,
  type QualityTier,
  type DegradationConfig,
  type ProviderFallback,
  type DegradationEvent,
} from './gracefulDegradationService';

// Re-export RetryUI from components
export { RetryUI, useRetry, type RetryConfig, type RetryState } from '@/components/resilience/RetryUI';
