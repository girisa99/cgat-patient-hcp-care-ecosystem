/**
 * Healthcare Services - Barrel Export
 * Consolidated exports for all healthcare-related services
 */

// ============================================
// COMPLIANCE & VERIFICATION
// ============================================
export { complianceCheckService } from '@/services/complianceCheckService';
export { checkProviderAvailability, verifyAllProviders } from '@/services/providerVerificationService';

// ============================================
// MEDICAL VISION AI
// ============================================
export { medicalVisionAIService } from '@/services/medicalVisionAIService';

// ============================================
// RAG SERVICE
// ============================================
export { ragService } from '@/services/ragService';

// ============================================
// ENROLLMENT MCP BRIDGE
// ============================================
export { EnrollmentMCPBridge } from '@/services/enrollmentMCPBridge';
export type { MCPBridgeConfig, MCPToolResult } from '@/services/enrollmentMCPBridge';

// ============================================
// MCP SERVICES
// ============================================
export { mcpCrmToolsService } from '@/services/mcpCrmToolsService';
export { mcpFieldMappingService } from '@/services/mcpFieldMappingService';

// ============================================
// DATA ROUTING
// ============================================
export { dataRoutingService } from '@/services/dataRoutingService';
export { dynamicFieldMappingService } from '@/services/dynamicFieldMappingService';

// ============================================
// INTENT DETECTION
// ============================================
export { intentDetectionService } from '@/services/intentDetectionService';
