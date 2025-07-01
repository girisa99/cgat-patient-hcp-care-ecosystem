
/**
 * Component Scanner Utilities
 */

import { ComponentServiceInfo } from '@/utils/moduleRegistry/types';

export const scanForRealComponents = (moduleName: string): ComponentServiceInfo[] => {
  // Mock implementation - in real use this would scan the codebase
  const components: ComponentServiceInfo[] = [
    {
      name: `${moduleName}List`,
      type: 'component',
      filePath: `src/components/${moduleName.toLowerCase()}/${moduleName}List.tsx`,
      isProtected: false,
      permissions: ['read'],
      lastModified: new Date().toISOString()
    },
    {
      name: `Create${moduleName}Dialog`,
      type: 'component',
      filePath: `src/components/${moduleName.toLowerCase()}/Create${moduleName}Dialog.tsx`,
      isProtected: true,
      permissions: ['create'],
      lastModified: new Date().toISOString()
    }
  ];
  
  return components;
};

export const scanForRealHooks = (moduleName: string): ComponentServiceInfo[] => {
  const hooks: ComponentServiceInfo[] = [
    {
      name: `use${moduleName}`,
      type: 'hook',
      filePath: `src/hooks/use${moduleName}.tsx`,
      isProtected: false,
      permissions: ['read'],
      lastModified: new Date().toISOString()
    }
  ];
  
  return hooks;
};

export const scanForRealServices = (moduleName: string): ComponentServiceInfo[] => {
  const services: ComponentServiceInfo[] = [
    {
      name: `${moduleName}Service`,
      type: 'service',
      filePath: `src/services/${moduleName}Service.ts`,
      isProtected: true,
      permissions: ['read', 'write'],
      lastModified: new Date().toISOString()
    }
  ];
  
  return services;
};
