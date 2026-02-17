/**
 * Healthcare Constants - Centralized Constants
 * All healthcare-specific constant values
 */

// ============================================
// ENROLLMENT STAGES
// ============================================
export const ENROLLMENT_STAGES = {
  PATIENT_INFO: 'patient_info',
  INSURANCE: 'insurance',
  PROVIDER: 'provider',
  CLINICAL: 'clinical',
  CONSENT: 'consent',
  REVIEW: 'review',
  SUBMISSION: 'submission'
} as const;

export type EnrollmentStage = typeof ENROLLMENT_STAGES[keyof typeof ENROLLMENT_STAGES];

// ============================================
// PATIENT STATUS
// ============================================
export const PATIENT_STATUS = {
  PENDING: 'pending',
  ENROLLED: 'enrolled',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DISCHARGED: 'discharged'
} as const;

export type PatientStatus = typeof PATIENT_STATUS[keyof typeof PATIENT_STATUS];

// ============================================
// FACILITY TYPES
// ============================================
export const FACILITY_TYPES = {
  HOSPITAL: 'hospital',
  CLINIC: 'clinic',
  TREATMENT_CENTER: 'treatment_center',
  SPECIALTY_CENTER: 'specialty_center',
  PHARMACY: 'pharmacy'
} as const;

export type FacilityType = typeof FACILITY_TYPES[keyof typeof FACILITY_TYPES];

// ============================================
// INSURANCE STATUS
// ============================================
export const INSURANCE_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  DENIED: 'denied',
  PRIOR_AUTH_REQUIRED: 'prior_auth_required',
  APPROVED: 'approved'
} as const;

export type InsuranceStatus = typeof INSURANCE_STATUS[keyof typeof INSURANCE_STATUS];

// ============================================
// NPI VERIFICATION STATUS
// ============================================
export const NPI_STATUS = {
  NOT_VERIFIED: 'not_verified',
  PENDING: 'pending',
  VERIFIED: 'verified',
  INVALID: 'invalid',
  EXPIRED: 'expired'
} as const;

export type NPIStatus = typeof NPI_STATUS[keyof typeof NPI_STATUS];

// ============================================
// CONSENT TYPES
// ============================================
export const CONSENT_TYPES = {
  HIPAA: 'hipaa',
  TREATMENT: 'treatment',
  DATA_SHARING: 'data_sharing',
  MARKETING: 'marketing',
  RESEARCH: 'research'
} as const;

export type ConsentType = typeof CONSENT_TYPES[keyof typeof CONSENT_TYPES];

// ============================================
// MEDICAL CODE TYPES
// ============================================
export const MEDICAL_CODE_TYPES = {
  ICD10: 'ICD-10',
  CPT: 'CPT',
  HCPCS: 'HCPCS',
  NDC: 'NDC',
  LOINC: 'LOINC',
  SNOMED: 'SNOMED'
} as const;

export type MedicalCodeType = typeof MEDICAL_CODE_TYPES[keyof typeof MEDICAL_CODE_TYPES];

// ============================================
// THERAPY STATUSES
// ============================================
export const THERAPY_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  MISSED: 'missed'
} as const;

export type TherapyStatus = typeof THERAPY_STATUS[keyof typeof THERAPY_STATUS];

// ============================================
// DATABASE TABLE NAMES
// ============================================
export const HEALTHCARE_TABLES = {
  PROFILES: 'profiles',
  PATIENTS: 'patients',
  ENROLLMENT_FORMS: 'enrollment_forms',
  FACILITIES: 'facilities',
  TREATMENT_CENTERS: 'treatment_centers',
  INSURANCE_INFO: 'insurance_info',
  PROVIDER_VERIFICATION: 'provider_verification',
  CONSENT_RECORDS: 'consent_records',
  THERAPY_SESSIONS: 'therapy_sessions',
  MEDICAL_RECORDS: 'medical_records'
} as const;

// ============================================
// API ENDPOINTS
// ============================================
export const HEALTHCARE_ENDPOINTS = {
  CREATE_PATIENT: 'healthcare/create-patient',
  VERIFY_NPI: 'verify-npi',
  VERIFY_INSURANCE: 'verify-insurance',
  HIPAA_REDACTION: 'hipaa-redaction',
  HEALTHCARE_ORCHESTRATOR: 'healthcare-agentic-orchestrator'
} as const;

// ============================================
// FORM FIELD LIMITS
// ============================================
export const FIELD_LIMITS = {
  PATIENT_NAME_MAX: 100,
  ADDRESS_MAX: 255,
  PHONE_MAX: 20,
  EMAIL_MAX: 254,
  NPI_LENGTH: 10,
  SSN_LENGTH: 9,
  NOTES_MAX: 5000
} as const;

// ============================================
// VALIDATION PATTERNS
// ============================================
export const VALIDATION_PATTERNS = {
  NPI: /^\d{10}$/,
  PHONE: /^\+?[\d\s\-\(\)]{10,20}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  SSN: /^\d{3}-?\d{2}-?\d{4}$/,
  ZIP_CODE: /^\d{5}(-\d{4})?$/,
  DATE: /^\d{4}-\d{2}-\d{2}$/
} as const;
