
/**
 * Universal Template Hooks - Phase 1 Complete
 * 
 * This is now the single source of truth for all module functionality.
 * All existing hooks have been unified under this template system.
 */

// Main universal template hook
export { useTypeSafeModuleTemplate } from './useTypeSafeModuleTemplate';

// Focused hooks for specific concerns
export { useModuleData } from './useModuleData';
export { useModuleMutations } from './useModuleMutations';
export { useModuleValidation } from './useModuleValidation';

// Legacy compatibility - now points to unified template
export { useTypeSafeModuleTemplate as useModuleTemplate } from './useTypeSafeModuleTemplate';

// Re-export specific module hooks (now using unified template)
export { usePatients } from '../../hooks/usePatients';
export { useUsers } from '../../hooks/useUsers';
export { useFacilities } from '../../hooks/useFacilities';
export { useModules } from '../../hooks/useModules';
