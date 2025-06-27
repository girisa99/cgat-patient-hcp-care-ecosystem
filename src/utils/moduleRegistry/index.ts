
/**
 * Module Registry - Main Export with Refactored Structure
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
  initializeDefaultModules
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
  disableAutoRegistration 
} from './registryUtils';

// Global module registry instance
export const moduleRegistry = new ModuleRegistry();

// Initialize with default modules
initializeDefaultModules(moduleRegistry);
