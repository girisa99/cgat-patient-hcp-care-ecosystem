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
export { CollaborationStatus } from './CollaborationStatus';
export { PatientDataPrefill } from './PatientDataPrefill';
export { EnrollmentJourneySteps } from './EnrollmentJourneySteps';
export { EnhancedProviderSection } from './EnhancedProviderSection';

// Hooks
export { useOnboardingDataPrefill } from '@/hooks/useOnboardingDataPrefill';