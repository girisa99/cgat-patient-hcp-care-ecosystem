/**
 * Resilience Services Index
 * P4 Recovery & Error Handling (4→12 scenarios)
 * 
 * Exports:
 * - Circuit Breaker: Auto-disable failing providers
 * - Graceful Degradation: Fallback to lower quality
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
