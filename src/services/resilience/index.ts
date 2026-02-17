/**
 * Resilience Services Index
 * P4 Recovery & Error Handling (12/12 scenarios complete) ✅
 * 
 * Exports:
 * - Circuit Breaker: Auto-disable failing providers
 * - Graceful Degradation: Fallback to lower quality
 * - Retry UI: User-facing retry controls
 * - Auto-Healing: Self-correcting pipelines
 * - Error Analytics: Real-time error tracking
 * - User Error Reporting: One-click bug reports
 * - Debug Mode: Verbose logging toggle
 * - Session Recovery: Crash recovery
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

// Auto-Healing Pipelines
export {
  autoHealingService,
  type HealingStrategy,
  type HealingAction,
  type PipelineCheckpoint,
  type HealingConfig,
} from './autoHealingService';

// Re-export RetryUI from components
export { RetryUI, useRetry, type RetryConfig, type RetryState } from '@/components/resilience/RetryUI';

// Error Analytics Dashboard
export { ErrorAnalyticsDashboard } from '@/components/resilience/ErrorAnalyticsDashboard';

// User Error Reporting
export { UserErrorReporting } from '@/components/resilience/UserErrorReporting';

// Debug Mode
export { 
  DebugProvider, 
  DebugModeToggle, 
  DebugPanel, 
  useDebugMode 
} from '@/components/resilience/DebugModeToggle';

// Session Recovery
export { 
  useSessionRecovery, 
  type SessionState 
} from '@/hooks/useSessionRecovery';

export { 
  SessionRecoveryPrompt,
  SessionRecoveryPromptControlled,
  type SessionRecoveryPromptProps 
} from '@/components/resilience/SessionRecoveryPrompt';
