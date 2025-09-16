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

// Export both components for external use
export { PatientInformationDemo } from '../enrollment/PatientInformationDemo';
export { PatientInformationFieldComparison } from '../enrollment/PatientInformationFieldComparison';