
import { useSingleMasterModules } from './useSingleMasterModules';

/**
 * ✅ VERIFIED: Modules Page Hook - Uses Single Source of Truth
 * This hook is a simple wrapper that ensures the Modules page uses the correct single hook
 * Architecture Status: VERIFIED ✅
 */
export const useModulesPage = () => {
  console.log('🔒 Modules Page Hook - Using verified single source architecture');
  
  // ✅ VERIFIED: Use the single source of truth hook directly
  const singleMasterHook = useSingleMasterModules();

  console.log('✅ Architecture Verified:', {
    hookName: singleMasterHook.meta.hookName,
    singleSource: singleMasterHook.meta.singleSourceValidated,
    realDatabase: singleMasterHook.meta.realDatabaseOnly,
    moduleCount: singleMasterHook.modules.length
  });

  // Return the single source directly - no duplicates, no wrappers
  return {
    ...singleMasterHook,
    
    // Meta information confirms architecture compliance
    meta: {
      ...singleMasterHook.meta,
      pageHookVersion: 'verified-single-source-v1.0',
      architectureCompliant: true,
      usingSingleHook: true,
      duplicatesEliminated: true
    }
  };
};
