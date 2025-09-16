/**
 * PATIENT ENROLLMENT MODULE EXPORTS
 * Centralized exports for all patient enrollment components
 */

// Main integration component
export { PatientEnrollmentIntegration } from './PatientEnrollmentIntegration';

// Core form component
export { PatientEnrollmentForm, type PatientEnrollmentData } from './PatientEnrollmentForm';

// Sub-components
export { ConsentManagement, type ConsentData } from './ConsentManagement';
export { WhatsAppConsentAgent } from './WhatsAppConsentAgent';
export { AutomatedWhatsAppConsent } from './AutomatedWhatsAppConsent';
export { EnhancedWhatsAppEnrollment } from './EnhancedWhatsAppEnrollment';
export { PatientEnrollmentWithWhatsApp } from './PatientEnrollmentWithWhatsApp';
export { CollaborationStatus } from './CollaborationStatus';
export { PatientDataPrefill } from './PatientDataPrefill';
export { EnrollmentJourneySteps } from './EnrollmentJourneySteps';
export { ComprehensiveProviderSection } from './ComprehensiveProviderSection';
export { ComprehensiveInsuranceSection, type ComprehensiveInsuranceData } from './ComprehensiveInsuranceSection';
export { ComprehensiveTreatmentAssessment, type ComprehensiveTreatmentAssessmentData } from './ComprehensiveTreatmentAssessment';

// Dashboard and workflow components
export { EnrollmentStatusDashboard, type EnrollmentStatus, type CriticalIssue } from './EnrollmentStatusDashboard';
export { PatientEnrollmentTemplateManager } from './PatientEnrollmentTemplateManager';

// Export field comparison components for all sections
export { PatientInformationDemo } from '../enrollment/PatientInformationDemo';
export { PatientInformationFieldComparison } from '../enrollment/PatientInformationFieldComparison';
export { ProviderTreatmentCenterFieldComparison } from '../enrollment/ProviderTreatmentCenterFieldComparison';
export { InsuranceInformationFieldComparison } from '../enrollment/InsuranceInformationFieldComparison';
export { ClinicalTreatmentFieldComparison } from '../enrollment/ClinicalTreatmentFieldComparison';
export { FinalSubmissionFieldComparison } from '../enrollment/FinalSubmissionFieldComparison';
export { SectionFieldSummary } from '../enrollment/SectionFieldSummary';

// Export complete form components with ALL fields mapped
export { CompleteProviderForm, createEmptyCompleteProviderData } from '../enrollment/CompleteProviderForm';
export { CompleteInsuranceForm, createEmptyCompleteInsuranceData } from '../enrollment/CompleteInsuranceForm';
export { CompleteClinicalForm, createEmptyCompleteClinicalData } from '../enrollment/CompleteClinicalForm';
export { CompleteFinalSubmissionForm, createEmptyCompleteFinalSubmissionData } from '../enrollment/CompleteFinalSubmissionForm';

// Export enhanced dynamic forms for complex scenarios
export { EnhancedInsuranceForm, createEmptyEnhancedInsuranceData } from '../enrollment/EnhancedInsuranceForm';
export { InsurancePermutationAnalysis } from '../enrollment/InsurancePermutationAnalysis';
export { InsuranceCardUpload } from '../enrollment/InsuranceCardUpload';
export { DynamicInsuranceDemo } from '../enrollment/DynamicInsuranceDemo';
export { ComprehensiveInsuranceFieldMapping } from '../enrollment/ComprehensiveInsuranceFieldMapping';

// Provider enrollment components
export { EnhancedProviderForm } from '../enrollment/EnhancedProviderForm';
export { NPIVerificationComponent } from '../enrollment/NPIVerificationComponent';
export { ProviderPermutationAnalysis } from '../enrollment/ProviderPermutationAnalysis';

// Export complete data types
export type { 
  CompletePatientInformation,
  CompleteProviderTreatmentCenter,
  CompleteInsuranceInformation,
  CompleteClinicalTreatmentAssessment,
  CompleteFinalSubmission,
  CompleteEnrollmentData
} from '@/types/completeEnrollmentMapping';