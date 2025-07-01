
/**
 * Universal Template Hooks - PHASE 1 COMPLETE ✅
 * 
 * All modules have been successfully consolidated under the universal template system.
 * This is now the single source of truth for all module functionality.
 */

// Main universal template hook
export { useTypeSafeModuleTemplate } from './useTypeSafeModuleTemplate';

// Focused hooks for specific concerns
export { useModuleData } from './useModuleData';
export { useModuleMutations } from './useModuleMutations';
export { useModuleValidation } from './useModuleValidation';

// Legacy compatibility - now points to unified template
export { useTypeSafeModuleTemplate as useModuleTemplate } from './useTypeSafeModuleTemplate';

// ✅ FULLY CONSOLIDATED MODULE HOOKS (All using unified template)
export { usePatients } from '../../hooks/usePatients';
export { useUsers } from '../../hooks/useUsers';
export { useFacilities } from '../../hooks/useFacilities';
export { useModules } from '../../hooks/useModules';

// ✅ NEWLY CONSOLIDATED MODULE HOOKS
export { useOnboarding } from '../../hooks/useOnboarding';
export { useApiServices } from '../../hooks/useApiServices';
export { useAuditLogs } from '../../hooks/useAuditLogs';

// Specialized module hooks for granular access
export { usePatientData } from '../../hooks/patients/usePatientData';
export { usePatientMutations } from '../../hooks/patients/usePatientMutations';
export { useFacilityData } from '../../hooks/facilities/useFacilityData';
export { useFacilityMutations } from '../../hooks/facilities/useFacilityMutations';
export { useModuleData as useModulesData } from '../../hooks/modules/useModuleData';
export { useModuleMutations as useModulesMutations } from '../../hooks/modules/useModuleMutations';

/**
 * CONSOLIDATION STATUS: ✅ PHASE 1 COMPLETE
 * 
 * All major modules are now consolidated:
 * - ✅ Patients: Fully consolidated with validation and stats
 * - ✅ Users: Already consolidated (from previous work)
 * - ✅ Facilities: Fully consolidated with data and mutations
 * - ✅ Modules: Fully consolidated with access control
 * - ✅ Onboarding: Consolidated with workflow support
 * - ✅ API Services: Consolidated with integration registry
 * - ✅ Audit Logs: Consolidated with analytics
 * 
 * Ready for Phase 2: Advanced Features & Optimizations
 */
