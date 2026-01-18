/**
 * SHARED - Cross-Product Infrastructure Index
 */

// Configuration
export * from './config/product-config';
export * from './config/secret-keys';

// Authentication & Authorization
export { useMasterAuth } from '@/hooks/useMasterAuth';
export { usePermissions } from '@/hooks/usePermissions';
export { useRoles } from '@/hooks/useRoles';
export { useSubscription } from '@/hooks/useSubscription';

// Data & State
export { useMasterData } from '@/hooks/useMasterData';
export { useRealtime } from '@/hooks/useRealtime';

// AI & Credits - Single Source of Truth
export { useAICredits } from '@/hooks/useAICredits';
export { useUniversalAIHub, useContextualAIProviders } from '@/hooks/useUniversalAIHub';
export { useUniversalAI } from '@/hooks/useUniversalAI'; // Legacy - use useUniversalAIHub instead
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

// Services
export { intentDetectionService } from '@/services/intentDetectionService';
export { agentArchitectureIntelligence } from '@/services/agentArchitectureIntelligence';
export { ModelRoutingService } from '@/services/ModelRoutingService';
export { analyticsIntegrationService } from '@/services/analyticsIntegrationService';

// Shared Constants
export const SHARED_INFRASTRUCTURE = {
  products: ['genie-studio', 'healthcare', 'document-processing'],
  version: '1.0.0',
} as const;
