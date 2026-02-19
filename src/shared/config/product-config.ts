/**
 * PRODUCT CONFIGURATION - Single Source of Truth
 * Defines product boundaries, routes, and feature flags
 * 
 * This config ensures:
 * 1. Clear separation between Genie Suite and Healthcare products
 * 2. Feature flags for enabling/disabling products
 * 3. Route protection and access control
 * 4. Edge function ownership mapping
 */

export type ProductId = 'genie-studio' | 'healthcare' | 'shared';

export interface ProductConfig {
  id: ProductId;
  name: string;
  description: string;
  enabled: boolean;
  routes: string[];
  edgeFunctions: string[];
  componentPaths: string[];
  authRequired: boolean;
  commercialLaunch: boolean;
}

// =============================================================================
// GENIE SUITE - Commercial Launch Product
// =============================================================================
export const GENIE_STUDIO_CONFIG: ProductConfig = {
  id: 'genie-studio',
  name: 'Genie Suite',
  description: 'AI-Powered Media Production Suite - Mind to Media',
  enabled: true,
  commercialLaunch: true,
  authRequired: true,
  
  routes: [
    '/genie-studio',
    '/genie-vibe',
    '/production-hub',
    '/content-tools',
    '/genie-studio-landing',
    '/genie-studio-storyboard',
    '/genie-studio-mobile-recording',
    '/genie-settings',
    '/social-oauth-callback',
    '/pricing',
    '/subscribe',
  ],
  
  edgeFunctions: [
    // AI Generation
    'ai-video-generator',
    'ai-image-generator',
    'shorts-generator',
    'quiz-video-generator',
    'gemini-generate-video',
    'gemini-generate-image',
    
    // Voice & Audio
    'voice-clone-processor',
    'elevenlabs-voice',
    'elevenlabs-music',
    'amazon-polly',
    'google-tts',
    'openai-tts',
    'azure-tts',
    'audio-mixer',
    'text-to-speech',
    'voice-to-text',
    'huggingface-speech',
    
    // Social Publishing
    'social-publish',
    'linkedin-oauth',
    'youtube-oauth',
    'viral-score-predictor',
    'og-metadata',
    
    // Content Tools
    'auto-thumbnail-generator',
    'analyze-script',
    'enhance-script',
    'scene-analyzer',
    'script-video-matcher',
    'visual-content-search',
    'extract-video-audio',
    
    // Production Agents
    'music-composer-agent',
    'voice-director-agent',
    'distribution-agent',
    
    // Infrastructure
    'bulk-operations',
    'deployment-manager',
    'template-marketplace',
    'get-ai-credits',
    'use-ai-credits',
    'share-presentation',
    'send-show-invite',
    'send-meeting-minutes',
    'microlearning-generator',
    'export-conversation',
  ],
  
  componentPaths: [
    '@/genie-studio/components',
    '@/components/genie-studio',
    '@/components/genie-vibe',
    '@/components/genie',
    '@/components/genie-analytics',
    '@/components/genie-management',
    '@/components/genie-spark',
    '@/components/configurable-genie',
    '@/components/public-genie',
    '@/components/content',
    '@/components/bulk-processing',
    '@/components/publish',
    '@/components/teleprompter',
    '@/components/video',
    '@/components/voice',
    '@/components/speech',
    '@/components/production',
    '@/components/presentation',
  ],
};

// =============================================================================
// HEALTHCARE - Separate Product
// =============================================================================
export const HEALTHCARE_CONFIG: ProductConfig = {
  id: 'healthcare',
  name: 'Healthcare Platform',
  description: 'Patient enrollment and treatment center management',
  enabled: true,
  commercialLaunch: false, // Not part of commercial launch
  authRequired: true,
  
  routes: [
    '/dashboard',
    '/patients',
    '/facilities',
    '/enrollment',
    '/onboarding',
    '/therapy',
    '/treatment-centers',
    '/document-processing',
    '/admin',
    '/users',
    '/modules',
    '/verification',
  ],
  
  edgeFunctions: [
    // Patient Management
    'create-patient',
    'drug-lookup',
    'verify-npi',
    'verify-npi-credentials',
    'medical-imaging-cnn',
    
    // Healthcare AI
    'healthcare-agentic-orchestrator',
    'healthcare-context-ai',
    'comprehensive-therapy-data-generator',
    'generate-therapy-products',
    
    // Document Processing
    'document-processor',
    'process-documents',
    'execute-document-agent',
    'extract-enrollment-form',
    'generate-enrollment-pdf',
    'patient-enrollment-pdf',
    'onboarding-pdf-generator',
    'onboarding-workflow',
    
    // Communication
    'enhanced-whatsapp-enrollment',
    'whatsapp-consent-agent',
    'fax-processing',
    'fax-voice-processor',
    'hipaa-redaction',
    'legal-review-gate',
    'docusign-integration',
    'docusign-pdf-integration',
    'twilio-notifications',
    'notify-recording-consent',
    'session-reminders',
    'session-update-notify',
    'session-feedback',
    'send-session-invites',
  ],
  
  componentPaths: [
    '@/components/healthcare',
    '@/components/patients',
    '@/components/facilities',
    '@/components/onboarding',
    '@/components/enrollment',
    '@/components/document-processing',
    '@/components/patient-enrollment',
    '@/components/therapy',
    '@/components/treatment-centers',
    '@/components/assessment',
    '@/components/verification',
    '@/components/forms',
    '@/components/signature',
    '@/components/softphone',
    '@/components/users',
    '@/components/admin',
  ],
};

// =============================================================================
// SHARED INFRASTRUCTURE - Used by both products
// =============================================================================
export const SHARED_CONFIG: ProductConfig = {
  id: 'shared',
  name: 'Shared Infrastructure',
  description: 'Core platform services used by all products',
  enabled: true,
  commercialLaunch: true,
  authRequired: false, // Some shared routes may be public
  
  routes: [
    '/auth',
    '/login',
    '/signup',
    '/reset-password',
    '/settings',
    '/profile',
    '/architecture',
  ],
  
  edgeFunctions: [
    // AI Core
    'ai-universal-processor',
    'ai-model-processor',
    'check-ai-provider',
    
    // MCP & Integration
    'mcp-protocol-handler',
    'mcp-api-server',
    'mcp-database-server',
    'mcp-memory-server',
    'mcp-crm-tools',
    'mcp-data-sync',
    
    // RAG & Knowledge
    'rag-knowledge-processor',
    'rag-search',
    'rag-status',
    'vector-store-processor',
    
    // Auth & Billing
    'create-session',
    'check-subscription',
    'create-checkout',
    'customer-portal',
    'purchase-credits',
    'manage-user-profiles',
    'manage-user-roles',
    'user-facility-access',
    
    // System
    'health-check',
    'analytics-dashboard',
    'security-monitor',
    'arize-integration',
    'arize-tracing',
    'langwatch-integration',
    'audit-logs',
    
    // Workflow
    'workflow-executor',
    'workflow-resources',
    'workspace-collaboration',
    
    // Agents Core
    'agent-config-manager',
    'agent-test-runner',
    'generate-agent-from-prompt',
    'label-studio-connector',
    'label-studio-search',
  ],
  
  componentPaths: [
    '@/components/ui',
    '@/components/shared',
    '@/components/layout',
    '@/components/auth',
    '@/components/navigation',
    '@/components/modals',
    '@/components/isolation',
    '@/components/workflow-builder',
    '@/components/templates',
    '@/components/ai',
    '@/components/mcp',
    '@/components/rag',
    '@/components/tracing',
    '@/components/observability',
    '@/components/agent-builder',
    '@/components/agent-management',
    '@/components/agent-deployment',
  ],
};

// =============================================================================
// COMBINED PRODUCT REGISTRY
// =============================================================================
export const PRODUCT_REGISTRY = {
  'genie-studio': GENIE_STUDIO_CONFIG,
  'healthcare': HEALTHCARE_CONFIG,
  'shared': SHARED_CONFIG,
} as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get product for a given route
 */
export function getProductForRoute(route: string): ProductId | null {
  // Check Genie Suite routes first (commercial launch priority)
  if (GENIE_STUDIO_CONFIG.routes.some(r => route.startsWith(r))) {
    return 'genie-studio';
  }
  
  // Check Healthcare routes
  if (HEALTHCARE_CONFIG.routes.some(r => route.startsWith(r))) {
    return 'healthcare';
  }
  
  // Check Shared routes
  if (SHARED_CONFIG.routes.some(r => route.startsWith(r))) {
    return 'shared';
  }
  
  return null;
}

/**
 * Get product for a given edge function
 */
export function getProductForEdgeFunction(functionName: string): ProductId {
  if (GENIE_STUDIO_CONFIG.edgeFunctions.includes(functionName)) {
    return 'genie-studio';
  }
  if (HEALTHCARE_CONFIG.edgeFunctions.includes(functionName)) {
    return 'healthcare';
  }
  return 'shared';
}

/**
 * Check if a product is enabled
 */
export function isProductEnabled(productId: ProductId): boolean {
  return PRODUCT_REGISTRY[productId]?.enabled ?? false;
}

/**
 * Get all enabled products
 */
export function getEnabledProducts(): ProductConfig[] {
  return Object.values(PRODUCT_REGISTRY).filter(p => p.enabled);
}

/**
 * Get commercial launch products only
 */
export function getCommercialProducts(): ProductConfig[] {
  return Object.values(PRODUCT_REGISTRY).filter(p => p.commercialLaunch);
}

/**
 * Validate file placement based on product ownership
 */
export function validateFilePlacement(filePath: string): { valid: boolean; expectedProduct: ProductId | null; message: string } {
  const geniePatterns = ['genie', 'vibe', 'studio', 'production', 'content-tools', 'social-publish'];
  const healthcarePatterns = ['patient', 'facility', 'enrollment', 'medical', 'therapy', 'treatment', 'hipaa', 'fax', 'docusign'];
  
  const isGenieFile = geniePatterns.some(p => filePath.toLowerCase().includes(p));
  const isHealthcareFile = healthcarePatterns.some(p => filePath.toLowerCase().includes(p));
  
  if (isGenieFile && !filePath.includes('genie-studio') && !filePath.includes('supabase/functions/genie')) {
    return {
      valid: false,
      expectedProduct: 'genie-studio',
      message: `Genie file should be in src/genie-studio/ or supabase/functions/genie/: ${filePath}`,
    };
  }
  
  if (isHealthcareFile && !filePath.includes('healthcare') && !filePath.includes('supabase/functions/healthcare')) {
    return {
      valid: false,
      expectedProduct: 'healthcare',
      message: `Healthcare file should be in src/healthcare/ or supabase/functions/healthcare/: ${filePath}`,
    };
  }
  
  return { valid: true, expectedProduct: null, message: 'File placement is valid' };
}
