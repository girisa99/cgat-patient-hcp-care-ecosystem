/**
 * SHARED - Cross-Product Infrastructure Index
 * 
 * This module contains shared infrastructure used by both 
 * Genie Studio and Healthcare products.
 * 
 * IMPORTANT: Code in this module should be product-agnostic.
 * Do NOT add product-specific logic here.
 * 
 * @see src/shared/config/product-config.ts for product boundaries
 */

// =============================================================================
// CONFIGURATION
// =============================================================================
export * from './config/product-config';
export * from './config/secret-keys';

// =============================================================================
// SHARED HOOKS (Re-exports from current locations)
// =============================================================================

// Authentication & Authorization
export { useMasterAuth } from '@/hooks/useMasterAuth';
export { usePermissions } from '@/hooks/usePermissions';
export { useRoles } from '@/hooks/useRoles';
export { useSubscription } from '@/hooks/useSubscription';

// Data & State
export { useMasterData } from '@/hooks/useMasterData';
export { useRealtime } from '@/hooks/useRealtime';

// AI & Credits
export { useAICredits } from '@/hooks/useAICredits';
export { useUniversalAI } from '@/hooks/useUniversalAI';
export { useRAGContext } from '@/hooks/useRAGContext';

// Agents Core
export { useAgents } from '@/hooks/useAgents';
export { useAgentDeployments } from '@/hooks/useAgentDeployments';
export { useAgentConfiguration } from '@/hooks/useAgentConfiguration';
export { useA2AProtocol } from '@/hooks/useA2AProtocol';
export { useMultiAgentOrchestration } from '@/hooks/useMultiAgentOrchestration';

// API Infrastructure
export { useApiServices } from '@/hooks/useApiServices';
export { useExternalApis } from '@/hooks/useExternalApis';
export { useInfrastructureManager } from '@/hooks/useInfrastructureManager';

// System & Debugging
export { useDebugMode } from '@/hooks/useDebugMode';
export { useErrorHandler } from '@/hooks/useErrorHandler';
export { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
export { useObservabilityConfig } from '@/hooks/useObservabilityConfig';

// UI Utilities
export { useMasterToast } from '@/hooks/useMasterToast';
export { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

// =============================================================================
// SHARED SERVICES
// =============================================================================
export { intentDetectionService } from '@/services/intentDetectionService';
export type { ResponseIntent } from '@/services/intentDetectionService';

export { agentArchitectureIntelligence } from '@/services/agentArchitectureIntelligence';
export type { 
  AgentArchitectureType, 
  ArchitectureRecommendation, 
  ArchitectureAnalysis,
  InputFactor 
} from '@/services/agentArchitectureIntelligence';

export { ModelRoutingService } from '@/services/ModelRoutingService';
export { analyticsIntegrationService } from '@/services/analyticsIntegrationService';
