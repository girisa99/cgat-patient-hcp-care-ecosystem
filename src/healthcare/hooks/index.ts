/**
 * Healthcare Hooks - Barrel Export
 * Consolidated exports for all healthcare-related hooks
 */

// ============================================
// PATIENT & ENROLLMENT HOOKS
// ============================================
export { usePatients } from '@/hooks/usePatients';
export { useEnrollmentPatients } from '@/hooks/useEnrollmentPatients';
export { useEnrollmentAgent } from '@/hooks/useEnrollmentAgent';
export { useEnrollmentAgentConfig } from '@/hooks/useEnrollmentAgentConfig';
export { useEnrollmentMCPBridge } from '@/hooks/useEnrollmentMCPBridge';
export { useEnrollmentRealtime } from '@/hooks/useEnrollmentRealtime';
export { useEnrollmentUniversalAI } from '@/hooks/useEnrollmentUniversalAI';
export { useConversationalEnrollment } from '@/hooks/useConversationalEnrollment';
export { useGlobalConversationalEnrollment } from '@/hooks/useGlobalConversationalEnrollment';
export { useUniversalEnrollment } from '@/hooks/useUniversalEnrollment';
export { usePageAwareEnrollment } from '@/hooks/usePageAwareEnrollment';

// ============================================
// HEALTHCARE AI HOOKS
// ============================================
export { useHealthcareAI } from '@/hooks/useHealthcareAI';
export { useMedicalCoding } from '@/hooks/useMedicalCoding';
export { useMedicationProcessing } from '@/hooks/useMedicationProcessing';
export { useMedicationSearch } from '@/hooks/useMedicationSearch';

// ============================================
// NPI & PROVIDER VERIFICATION
// ============================================
export { useNPIVerification } from '@/hooks/useNPIVerification';

// ============================================
// INSURANCE & FINANCIAL
// ============================================
export { useInsurancePipeline } from '@/hooks/useInsurancePipeline';
export { useFinancialAssessment } from '@/hooks/useFinancialAssessment';

// ============================================
// FACILITIES HOOKS
// ============================================
export { useMasterFacilities } from '@/hooks/useMasterFacilities';
export { useRealFacilities } from '@/hooks/useRealFacilities';

// ============================================
// SECURE DATA HOOKS
// ============================================
export { useSecurePatientData } from '@/hooks/useSecurePatientData';

// ============================================
// ADHERENCE & THERAPY
// ============================================
export { useAdherenceOrchestrator } from '@/hooks/useAdherenceOrchestrator';

// ============================================
// GPO MEMBERSHIPS
// ============================================
export { useGPOMemberships } from '@/hooks/useGPOMemberships';
