
/**
 * Component Management Utilities
 */

import { ComponentServiceInfo, RegisteredModule } from './types';
import { ModuleRegistry } from './ModuleRegistryClass';

export const registerComponentsToModule = (
  registry: ModuleRegistry,
  moduleName: string,
  components: ComponentServiceInfo[]
): boolean => {
  try {
    components.forEach(component => {
      registry.addComponentToModule(moduleName, component);
    });
    return true;
  } catch (error) {
    console.error('Failed to register components:', error);
    return false;
  }
};

export const getComponentsByPermission = (
  registry: ModuleRegistry,
  permission: string
): ComponentServiceInfo[] => {
  const allComponents = registry.getAllComponents();
  return allComponents
    .map(item => item.component)
    .filter(component => component.permissions?.includes(permission));
};

export const getProtectedComponents = (
  registry: ModuleRegistry
): ComponentServiceInfo[] => {
  const allComponents = registry.getAllComponents();
  return allComponents
    .map(item => item.component)
    .filter(component => component.isProtected === true);
};

export const getModuleComponentStats = (
  registry: ModuleRegistry,
  moduleName: string
): { components: number; services: number; hooks: number; protected: number } => {
  const components = registry.getModuleComponentsForRBAC(moduleName);
  
  return {
    components: components.filter(c => c.type === 'component').length,
    services: components.filter(c => c.type === 'service').length,
    hooks: components.filter(c => c.type === 'hook').length,
    protected: components.filter(c => c.isProtected).length
  };
};

export const validateComponent = (component: ComponentServiceInfo): boolean => {
  return !!(component.name && component.type && (component.path || component.filePath));
};

export const cleanupOrphanedComponents = (registry: ModuleRegistry): number => {
  let cleanedCount = 0;
  const modules = registry.getAll();
  
  modules.forEach(module => {
    const validComponents = (module.components || []).filter(validateComponent);
    const validServices = (module.services || []).filter(validateComponent);
    const validHooks = (module.hooks || []).filter(validateComponent);
    
    const originalCount = (module.components?.length || 0) + 
                         (module.services?.length || 0) + 
                         (module.hooks?.length || 0);
    const newCount = validComponents.length + validServices.length + validHooks.length;
    
    cleanedCount += originalCount - newCount;
    
    // Update module with cleaned components
    module.components = validComponents;
    module.services = validServices;
    module.hooks = validHooks;
    module.lastUpdated = new Date();
  });
  
  return cleanedCount;
};
