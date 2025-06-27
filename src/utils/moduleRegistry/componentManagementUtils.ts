
/**
 * Component Management Utility Functions
 * Handles component/service/hook management within modules
 */

import { ComponentServiceInfo, RegisteredModule } from './types';
import { ModuleRegistry } from './ModuleRegistryClass';

/**
 * Component registration and management utilities
 */
export const registerComponentToModule = (
  registry: ModuleRegistry, 
  moduleName: string, 
  component: ComponentServiceInfo
) => {
  const module = registry.get(moduleName);
  if (!module) {
    console.warn(`❌ Module ${moduleName} not found for component ${component.name}`);
    return false;
  }

  registry.addComponentToModule(moduleName, component);
  console.log(`✅ Added ${component.type} ${component.name} to module ${moduleName}`);
  return true;
};

/**
 * Batch register multiple components to a module
 */
export const registerComponentsToModule = (
  registry: ModuleRegistry,
  moduleName: string,
  components: ComponentServiceInfo[]
) => {
  let successCount = 0;
  
  components.forEach(component => {
    if (registerComponentToModule(registry, moduleName, component)) {
      successCount++;
    }
  });
  
  console.log(`📦 Registered ${successCount}/${components.length} components to ${moduleName}`);
  return successCount;
};

/**
 * Get components by permission across all modules
 */
export const getComponentsByPermission = (
  registry: ModuleRegistry,
  permission: string
): { moduleName: string; component: ComponentServiceInfo }[] => {
  return registry.getComponentsByPermission(permission);
};

/**
 * Get all protected components across modules
 */
export const getProtectedComponents = (
  registry: ModuleRegistry
): { moduleName: string; component: ComponentServiceInfo }[] => {
  return registry.getAllComponents().filter(({ component }) => component.isProtected);
};

/**
 * Get component statistics for a module
 */
export const getModuleComponentStats = (
  registry: ModuleRegistry,
  moduleName: string
) => {
  const components = registry.getModuleComponentsForRBAC(moduleName);
  
  return {
    total: components.length,
    components: components.filter(c => c.type === 'component').length,
    services: components.filter(c => c.type === 'service').length,
    hooks: components.filter(c => c.type === 'hook').length,
    protected: components.filter(c => c.isProtected).length,
    public: components.filter(c => !c.isProtected).length
  };
};

/**
 * Validate component structure
 */
export const validateComponent = (component: ComponentServiceInfo): boolean => {
  const required = ['name', 'type', 'filePath', 'permissions', 'isProtected', 'lastModified'];
  
  for (const field of required) {
    if (!(field in component)) {
      console.error(`❌ Component validation failed: missing ${field}`);
      return false;
    }
  }
  
  if (!['component', 'service', 'hook'].includes(component.type)) {
    console.error(`❌ Component validation failed: invalid type ${component.type}`);
    return false;
  }
  
  return true;
};

/**
 * Clean up orphaned components (components without modules)
 */
export const cleanupOrphanedComponents = (registry: ModuleRegistry) => {
  const allModules = registry.getAll();
  const orphanedComponents: ComponentServiceInfo[] = [];
  
  // This would need to be implemented based on actual component scanning
  // For now, just return empty array
  
  console.log(`🧹 Cleaned up ${orphanedComponents.length} orphaned components`);
  return orphanedComponents;
};
