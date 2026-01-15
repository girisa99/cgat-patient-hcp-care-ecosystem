/**
 * HEALTHCARE - Product Root Index
 * 
 * This is the main entry point for Healthcare product.
 * All Healthcare-specific components, hooks, services, and types should be
 * exported from here or their respective sub-indexes.
 * 
 * IMPORTANT: This product is NOT part of the commercial Genie Studio launch.
 * Do NOT import genie-studio-specific code into this module.
 * 
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
// NOTE: Component re-exports will be added when index.ts files are created
// in the respective component folders. For now, import directly from folders.
// =============================================================================

// =============================================================================
// HOOKS (Phase 1 - Re-exports from current locations)
// =============================================================================
export { usePatients } from '@/hooks/usePatients';
export { useEnrollmentPatients } from '@/hooks/useEnrollmentPatients';
export { useSecurePatientData } from '@/hooks/useSecurePatientData';
export { useNPIVerification } from '@/hooks/useNPIVerification';
export { useMedicationProcessing } from '@/hooks/useMedicationProcessing';
export { useMedicationSearch } from '@/hooks/useMedicationSearch';
export { useMedicalCoding } from '@/hooks/useMedicalCoding';
export { useHealthcareAI } from '@/hooks/useHealthcareAI';
export { useDocumentProcessing } from '@/hooks/useDocumentProcessing';
export { useDocumentAI } from '@/hooks/useDocumentAI';
export { useEnrollmentAgent } from '@/hooks/useEnrollmentAgent';
export { useEnrollmentAgentConfig } from '@/hooks/useEnrollmentAgentConfig';
export { useEnrollmentMCPBridge } from '@/hooks/useEnrollmentMCPBridge';
export { useEnrollmentRealtime } from '@/hooks/useEnrollmentRealtime';
export { useEnrollmentUniversalAI } from '@/hooks/useEnrollmentUniversalAI';
export { useFinancialAssessment } from '@/hooks/useFinancialAssessment';
export { useInsurancePipeline } from '@/hooks/useInsurancePipeline';
export { useTwilioNotifications } from '@/hooks/useTwilioNotifications';

// =============================================================================
// SERVICES
// =============================================================================
export { complianceCheckService } from '@/services/complianceCheckService';
export { MedicalVisionAIService } from '@/services/medicalVisionAIService';
export { RAGService } from '@/services/ragService';

// =============================================================================
// PRODUCT ROUTES
// =============================================================================
export const HEALTHCARE_ROUTES = {
  dashboard: '/dashboard',
  patients: '/patients',
  facilities: '/facilities',
  enrollment: '/enrollment',
  onboarding: '/onboarding',
  therapy: '/therapy',
  treatmentCenters: '/treatment-centers',
  documentProcessing: '/document-processing',
  admin: '/admin',
  users: '/users',
  modules: '/modules',
  verification: '/verification',
} as const;

// =============================================================================
// FEATURE FLAGS
// =============================================================================
export const HEALTHCARE_FEATURES = {
  // Core Features
  patientManagement: true,
  facilityManagement: true,
  enrollmentWorkflow: true,
  documentProcessing: true,
  
  // Advanced Features
  aiDocumentExtraction: true,
  medicationLookup: true,
  npiVerification: true,
  insuranceVerification: true,
  
  // Compliance
  hipaaCompliance: true,
  auditLogging: true,
  
  // Integration
  docusignIntegration: true,
  faxIntegration: true,
  whatsappIntegration: true,
} as const;
