
/**
 * Module Registry - Main Export with Enhanced Refactored Structure
 * 
 * Maintains a registry of all modules and their configurations,
 * enabling real-time updates, validation, automatic registration, and RBAC tracking.
 */

import { ModuleRegistry } from './ModuleRegistryClass';
import { 
  registerNewModule, 
  registerComponentToModule, 
  enableAutoRegistration, 
  disableAutoRegistration,
  initializeDefaultModules,
  createRegistryBackup,
  restoreRegistryFromBackup
} from './registryUtils';

// Export types
export type { 
  ComponentServiceInfo, 
  RegisteredModule, 
  AutoRegistrationConfig, 
  RegistryStats 
} from './types';

// Export main class
export { ModuleRegistry } from './ModuleRegistryClass';

// Export utility functions
export { 
  registerNewModule, 
  registerComponentToModule, 
  enableAutoRegistration, 
  disableAutoRegistration,
  createRegistryBackup,
  restoreRegistryFromBackup
} from './registryUtils';

// Export auto-registration utilities
export {
  autoScanAndRegister,
  getAutoRegistrationCandidates
} from './autoRegistrationUtils';

// Export component management utilities
export {
  registerComponentsToModule,
  getComponentsByPermission,
  getProtectedComponents,
  getModuleComponentStats,
  validateComponent,
  cleanupOrphanedComponents
} from './componentManagementUtils';

// Global module registry instance
export const moduleRegistry = new ModuleRegistry();

// Initialize with default modules
initializeDefaultModules(moduleRegistry);
