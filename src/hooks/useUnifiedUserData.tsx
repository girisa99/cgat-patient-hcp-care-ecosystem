
/**
 * Backward compatibility hook for useUnifiedUserData
 * Routes to the consolidated user management system
 */
export { useConsolidatedUsers as useUnifiedUserData } from './users';

// Export patient-specific functionality
export { useConsolidatedPatients as usePatientData } from './patients/useConsolidatedPatients';
