/**
 * HEALTHCARE - Product Root Index
 * 
 * Main entry point for Healthcare product.
 * @see src/shared/config/product-config.ts for product boundaries
 */

// =============================================================================
// PRODUCT METADATA
// =============================================================================
export const HEALTHCARE_PRODUCT = {
  id: 'healthcare',
  name: 'Healthcare Platform',
  version: '1.0.0-internal',
  description: 'Patient enrollment and treatment center management',
  commercialLaunch: false,
} as const;

// =============================================================================
// CONSOLIDATED BARREL EXPORTS
// =============================================================================

// Hooks
export * from './hooks';

// Services
export * from './services';

// Types
export * from './types';

// Constants
export * from './constants';

// =============================================================================
// PRODUCT ROUTES
// =============================================================================
export const HEALTHCARE_ROUTES = {
  dashboard: '/dashboard',
  patients: '/patients',
  patientEnrollment: '/patient-enrollment',
  facilities: '/facilities',
  treatmentCenters: '/treatment-centers',
  enrollment: '/enrollment',
  onboarding: '/onboarding',
  therapy: '/therapy',
  documentProcessing: '/document-processing',
  admin: '/admin',
  users: '/users',
  modules: '/modules',
  verification: '/verification',
  compliance: '/compliance',
} as const;

// =============================================================================
// FEATURE FLAGS
// =============================================================================
export const HEALTHCARE_FEATURES = {
  patientManagement: true,
  facilityManagement: true,
  enrollmentWorkflow: true,
  documentProcessing: true,
  aiDocumentExtraction: true,
  npiVerification: true,
  insuranceVerification: true,
  hipaaCompliance: true,
  auditLogging: true,
} as const;
