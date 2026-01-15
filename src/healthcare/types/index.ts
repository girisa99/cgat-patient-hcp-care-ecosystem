/**
 * Healthcare Types - Barrel Export
 * Consolidated exports for all healthcare-related types
 */

// ============================================
// ENROLLMENT TYPES
// ============================================
export type {
  EnrollmentSectionType,
  DetectedSection,
  FieldType
} from '@/types/enrollmentFormExtraction';

export type {
  EnrollmentField
} from '@/types/patientEnrollmentMapping';

export type {
  CompleteEnrollmentData
} from '@/types/completeEnrollmentMapping';

// ============================================
// FORM STATE TYPES
// ============================================
export type {
  ApiFormState
} from '@/types/formState';

export type {
  MasterUserFormState
} from '@/types/masterFormState';

// ============================================
// THERAPY TYPES
// ============================================
export type {
  Therapy
} from '@/types/therapies';

// ============================================
// DATA ROUTING TYPES
// ============================================
export type {
  DataRoutingConfig,
  RoutingRule
} from '@/types/dataRoutingTypes';

// ============================================
// ONBOARDING TYPES
// ============================================
export type {
  OnboardingStep
} from '@/types/onboarding';

// ============================================
// SERVICE TYPES
// ============================================
// Re-export from services index
