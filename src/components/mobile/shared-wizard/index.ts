/**
 * Shared Mobile Components for Genie Ecosystem
 * 
 * Reusable mobile UI patterns used across Deck, Vibe, Spark, etc.
 */

// Re-export from presentation generator
export { MobileWizardLayout } from '@/components/genie-studio/presentation-generator/components/MobileWizardLayout';
export { useWizardSteps } from '@/components/genie-studio/presentation-generator/hooks/useWizardSteps';

// Re-export step components
export { 
  UnifiedInputStep,
  VoiceMusicStep,
  PublishingPanel,
  DEFAULT_STEP_STATES,
  type WizardStepStates,
  type PublishingState,
} from '@/components/genie-studio/presentation-generator/steps';

// Re-export registry
export {
  getStep,
  getAllSteps,
  getVisibleSteps,
  getMobileLiteSteps,
  MOBILE_LITE_STEPS,
  type StepId,
  type StepConfig,
} from '@/components/genie-studio/presentation-generator/registry/stepRegistry';

// ==========================================
// PUBLISHING MOBILE SUPPORT (Synced with Capability Matrix)
// ==========================================

export const PUBLISHING_MOBILE_SUPPORT = {
  // Export (offline capable)
  pdf_export: { mobile: true, offline: true, priority: 'P1' as const },
  pptx_export: { mobile: true, offline: false, priority: 'P2' as const },
  mp4_export: { mobile: false, offline: false, priority: 'P3' as const },
  docx_export: { mobile: true, offline: true, priority: 'P2' as const },
  
  // Cloud (online only)
  web_publish: { mobile: true, offline: false, priority: 'P1' as const },
  cloud_hosting: { mobile: true, offline: false, priority: 'P1' as const },
  embed_code: { mobile: true, offline: false, priority: 'P2' as const },
  embed_website: { mobile: true, offline: false, priority: 'P2' as const },
  
  // Platform (online only)
  youtube_upload: { mobile: true, offline: false, priority: 'P2' as const },
  linkedin_post: { mobile: true, offline: false, priority: 'P2' as const },
  vimeo_upload: { mobile: true, offline: false, priority: 'P3' as const },
  social_schedule: { mobile: true, offline: false, priority: 'P3' as const },
  
  // Sharing
  qr_code_share: { mobile: true, offline: true, priority: 'P1' as const },
  email_distribution: { mobile: true, offline: false, priority: 'P2' as const },
  password_protection: { mobile: true, offline: false, priority: 'P2' as const },
  analytics_embed: { mobile: true, offline: false, priority: 'P3' as const },
  
  // Integration
  gdrive_integration: { mobile: true, offline: false, priority: 'P2' as const },
  api_access: { mobile: false, offline: false, priority: 'P3' as const },
  custom_domain: { mobile: false, offline: false, priority: 'P3' as const },
} as const;

// Type for mobile support config
export type PublishingMobileSupportKey = keyof typeof PUBLISHING_MOBILE_SUPPORT;

// Helper to check if feature supports mobile/offline
export function getPublishingMobileSupport(featureId: string): { mobile: boolean; offline: boolean; priority: string } | undefined {
  return PUBLISHING_MOBILE_SUPPORT[featureId as PublishingMobileSupportKey];
}

// Features available in mobile lite mode (P1 priority only)
export function getMobileLitePublishingFeatures(): string[] {
  return Object.entries(PUBLISHING_MOBILE_SUPPORT)
    .filter(([_, config]) => config.priority === 'P1' && config.mobile)
    .map(([id]) => id);
}

// Features that work offline
export function getOfflinePublishingFeatures(): string[] {
  return Object.entries(PUBLISHING_MOBILE_SUPPORT)
    .filter(([_, config]) => config.offline)
    .map(([id]) => id);
}
