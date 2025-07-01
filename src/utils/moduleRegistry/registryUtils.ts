
/**
 * Registry Utility Functions
 */

import { RegisteredModule, ComponentServiceInfo } from './types';
import { ModuleRegistry } from './ModuleRegistryClass';

export const registerNewModule = (
  registry: ModuleRegistry,
  module: RegisteredModule
): boolean => {
  try {
    registry.register(module);
    return true;
  } catch (error) {
    console.error('Failed to register module:', error);
    return false;
  }
};

export const registerComponentToModule = (
  registry: ModuleRegistry,
  moduleName: string,
  component: ComponentServiceInfo
): boolean => {
  try {
    registry.addComponentToModule(moduleName, component);
    return true;
  } catch (error) {
    console.error('Failed to register component:', error);
    return false;
  }
};

export const enableAutoRegistration = (registry: ModuleRegistry): void => {
  registry.updateAutoConfig({ enabled: true });
  console.log('✅ Auto-registration enabled');
};

export const disableAutoRegistration = (registry: ModuleRegistry): void => {
  registry.updateAutoConfig({ enabled: false });
  console.log('❌ Auto-registration disabled');
};

export const initializeDefaultModules = (registry: ModuleRegistry): void => {
  const defaultModules: RegisteredModule[] = [
    {
      moduleName: 'Users',
      tableName: 'profiles',
      requiredFields: ['id', 'email'],
      optionalFields: ['first_name', 'last_name'],
      version: '1.0.0',
      lastUpdated: new Date(),
      status: 'active',
      description: 'User management module'
    },
    {
      moduleName: 'Facilities',
      tableName: 'facilities',
      requiredFields: ['id', 'name'],
      optionalFields: ['address', 'phone'],
      version: '1.0.0',
      lastUpdated: new Date(),
      status: 'active',
      description: 'Facility management module'
    }
  ];

  defaultModules.forEach(module => registry.register(module));
  console.log('✅ Default modules initialized');
};

export const createRegistryBackup = (registry: ModuleRegistry): string => {
  const backup = registry.export();
  return JSON.stringify(backup, null, 2);
};

export const restoreRegistryFromBackup = (
  registry: ModuleRegistry,
  backupData: string
): boolean => {
  try {
    const data = JSON.parse(backupData);
    registry.import(data);
    return true;
  } catch (error) {
    console.error('Failed to restore registry:', error);
    return false;
  }
};
