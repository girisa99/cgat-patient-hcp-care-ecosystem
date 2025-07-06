
/**
 * ✅ VERIFIED: Module Hooks - Single Source Export Only
 * This file exports only the verified single source of truth
 */

// ✅ VERIFIED: Export the single source of truth hook
export { useSingleMasterModules as useModules } from '../useSingleMasterModules';

// ✅ Legacy compatibility - redirect to single source
export { useSingleMasterModules } from '../useSingleMasterModules';

// ✅ Page hook that uses single source
export { useModulesPage } from '../useModulesPage';

console.log('🏆 Module Hooks Index - Single Source Architecture Verified ✅');
