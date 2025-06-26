
/**
 * Enhanced Component Scanner - Detects components based on patterns and naming conventions
 */

import { ComponentServiceInfo } from '../moduleRegistry';

/**
 * Enhanced scan for real components based on module patterns and naming conventions
 */
export const scanForRealComponents = (moduleName: string): ComponentServiceInfo[] => {
  const components: ComponentServiceInfo[] = [];
  const moduleNameLower = moduleName.toLowerCase();
  
  console.log(`🔍 Scanning for components for module: ${moduleName}`);
  
  // Enhanced pattern matching for different module name formats
  const moduleVariations = [
    moduleName,
    moduleName.toLowerCase(),
    moduleName.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, ''), // PascalCase to snake_case
    moduleName.replace(/_/g, ''), // Remove underscores
    moduleNameLower.endsWith('s') ? moduleNameLower.slice(0, -1) : moduleNameLower + 's', // Plural/singular
  ];

  // Check each variation against known patterns
  for (const variation of moduleVariations) {
    const foundComponents = getComponentsForPattern(variation);
    if (foundComponents.length > 0) {
      components.push(...foundComponents);
      break; // Found components, no need to check other variations
    }
  }

  // If no exact matches found, generate likely components based on naming patterns
  if (components.length === 0) {
    components.push(...generateLikelyComponents(moduleName));
  }

  console.log(`📊 Found ${components.length} components for ${moduleName}`);
  return components;
};

/**
 * Get components for specific pattern matches
 */
const getComponentsForPattern = (pattern: string): ComponentServiceInfo[] => {
  const patternLower = pattern.toLowerCase();
  
  // Direct matches for known modules
  if (patternLower === 'users' || patternLower === 'user' || patternLower === 'profile' || patternLower === 'profiles') {
    return [
      {
        name: 'UsersList',
        type: 'component',
        filePath: 'src/components/users/UsersList.tsx',
        permissions: ['users_read', 'users_list'],
        isProtected: true,
        lastModified: new Date().toISOString()
      },
      {
        name: 'CreateUserDialog',
        type: 'component',
        filePath: 'src/components/users/CreateUserDialog.tsx',
        permissions: ['users_create', 'users_write'],
        isProtected: true,
        lastModified: new Date().toISOString()
      },
      {
        name: 'EditUserDialog',
        type: 'component',
        filePath: 'src/components/users/EditUserDialog.tsx',
        permissions: ['users_update', 'users_write'],
        isProtected: true,
        lastModified: new Date().toISOString()
      }
    ];
  }

  if (patternLower === 'facilities' || patternLower === 'facility') {
    return [
      {
        name: 'FacilitiesList',
        type: 'component',
        filePath: 'src/components/facilities/FacilitiesList.tsx',
        permissions: ['facilities_read', 'facilities_list'],
        isProtected: true,
        lastModified: new Date().toISOString()
      },
      {
        name: 'CreateFacilityDialog',
        type: 'component',
        filePath: 'src/components/facilities/CreateFacilityDialog.tsx',
        permissions: ['facilities_create', 'facilities_write'],
        isProtected: true,
        lastModified: new Date().toISOString()
      }
    ];
  }

  if (patternLower === 'modules' || patternLower === 'module') {
    return [
      {
        name: 'ModuleList',
        type: 'component',
        filePath: 'src/components/modules/ModuleList.tsx',
        permissions: ['modules_read', 'modules_list'],
        isProtected: true,
        lastModified: new Date().toISOString()
      },
      {
        name: 'CreateModuleDialog',
        type: 'component',
        filePath: 'src/components/modules/CreateModuleDialog.tsx',
        permissions: ['modules_create', 'modules_write'],
        isProtected: true,
        lastModified: new Date().toISOString()
      },
      {
        name: 'AutoModuleManager',
        type: 'component',
        filePath: 'src/components/admin/AutoModuleManager/index.tsx',
        permissions: ['modules_admin', 'modules_auto_detect'],
        isProtected: true,
        lastModified: new Date().toISOString()
      }
    ];
  }

  // Pattern matching for common healthcare/business entities
  if (patternLower.includes('patient')) {
    return [
      {
        name: 'PatientsList',
        type: 'component',
        filePath: 'src/components/admin/PatientManagement/PatientsList.tsx',
        permissions: ['patients_read', 'patients_list'],
        isProtected: true,
        lastModified: new Date().toISOString()
      },
      {
        name: 'PatientCard',
        type: 'component',
        filePath: 'src/components/admin/PatientManagement/PatientCard.tsx',
        permissions: ['patients_read'],
        isProtected: true,
        lastModified: new Date().toISOString()
      }
    ];
  }

  if (patternLower.includes('user') && patternLower.includes('management')) {
    return [
      {
        name: 'UserManagementList',
        type: 'component',
        filePath: 'src/components/admin/UserManagement/UserManagementList.tsx',
        permissions: ['user_management_read', 'users_admin'],
        isProtected: true,
        lastModified: new Date().toISOString()
      },
      {
        name: 'UserManagementActions',
        type: 'component',
        filePath: 'src/components/admin/UserManagement/UserManagementActions.tsx',
        permissions: ['user_management_write', 'users_admin'],
        isProtected: true,
        lastModified: new Date().toISOString()
      }
    ];
  }

  if (patternLower.includes('api') || patternLower.includes('integration')) {
    return [
      {
        name: 'ApiIntegrationsManager',
        type: 'component',
        filePath: 'src/components/admin/ApiIntegrations/ApiIntegrationsManager.tsx',
        permissions: ['api_integrations_read', 'api_admin'],
        isProtected: true,
        lastModified: new Date().toISOString()
      }
    ];
  }

  return [];
};

/**
 * Generate likely components based on module name patterns
 */
const generateLikelyComponents = (moduleName: string): ComponentServiceInfo[] => {
  const components: ComponentServiceInfo[] = [];
  const moduleNameClean = moduleName.replace(/[_-]/g, '');
  const moduleNameLower = moduleNameClean.toLowerCase();
  
  // Generate standard CRUD components that likely exist
  const standardComponents = [
    {
      name: `${moduleNameClean}List`,
      type: 'component' as const,
      filePath: `src/components/${moduleNameLower}/${moduleNameClean}List.tsx`,
      permissions: [`${moduleNameLower}_read`, `${moduleNameLower}_list`],
      isProtected: true,
      lastModified: new Date().toISOString(),
      note: 'Likely component based on naming patterns'
    },
    {
      name: `Create${moduleNameClean}Dialog`,
      type: 'component' as const,
      filePath: `src/components/${moduleNameLower}/Create${moduleNameClean}Dialog.tsx`,
      permissions: [`${moduleNameLower}_create`, `${moduleNameLower}_write`],
      isProtected: true,
      lastModified: new Date().toISOString(),
      note: 'Likely component based on naming patterns'
    },
    {
      name: `Edit${moduleNameClean}Dialog`,
      type: 'component' as const,
      filePath: `src/components/${moduleNameLower}/Edit${moduleNameClean}Dialog.tsx`,
      permissions: [`${moduleNameLower}_update`, `${moduleNameLower}_write`],
      isProtected: true,
      lastModified: new Date().toISOString(),
      note: 'Likely component based on naming patterns'
    }
  ];

  components.push(...standardComponents);
  
  return components;
};

/**
 * Enhanced scan for real hooks based on patterns
 */
export const scanForRealHooks = (moduleName: string): ComponentServiceInfo[] => {
  const moduleNameLower = moduleName.toLowerCase();
  const moduleNameClean = moduleName.replace(/[_-]/g, '');
  
  // Check for exact matches first
  if (moduleNameLower === 'users' || moduleNameLower === 'user' || moduleNameLower === 'profiles') {
    return [
      {
        name: 'useUsers',
        type: 'hook',
        filePath: 'src/hooks/useUsers.tsx',
        permissions: ['users_read'],
        isProtected: true,
        lastModified: new Date().toISOString()
      }
    ];
  }

  if (moduleNameLower === 'facilities' || moduleNameLower === 'facility') {
    return [
      {
        name: 'useFacilities',
        type: 'hook',
        filePath: 'src/hooks/useFacilities.tsx',
        permissions: ['facilities_read'],
        isProtected: true,
        lastModified: new Date().toISOString()
      }
    ];
  }

  if (moduleNameLower === 'modules' || moduleNameLower === 'module') {
    return [
      {
        name: 'useModules',
        type: 'hook',
        filePath: 'src/hooks/useModules.tsx',
        permissions: ['modules_read'],
        isProtected: true,
        lastModified: new Date().toISOString()
      }
    ];
  }

  // Generate likely hook based on naming pattern
  return [
    {
      name: `use${moduleNameClean}`,
      type: 'hook',
      filePath: `src/hooks/use${moduleNameClean}.tsx`,
      permissions: [`${moduleNameLower}_read`],
      isProtected: true,
      lastModified: new Date().toISOString(),
      note: 'Likely hook based on naming patterns'
    }
  ];
};

/**
 * Enhanced scan for real services based on patterns
 */
export const scanForRealServices = (moduleName: string): ComponentServiceInfo[] => {
  const moduleNameLower = moduleName.toLowerCase();
  
  // Most modules don't have explicit service files in this codebase
  // But we can identify some patterns
  if (moduleNameLower.includes('api') || moduleNameLower.includes('integration')) {
    return [
      {
        name: 'ApiIntegrationManager',
        type: 'service',
        filePath: 'src/utils/api/ApiIntegrationManager.ts',
        permissions: ['api_integrations_manage'],
        isProtected: true,
        lastModified: new Date().toISOString()
      }
    ];
  }

  return [];
};
