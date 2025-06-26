
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
 * Enhanced scan for real services based on patterns - IMPROVED VERSION
 */
export const scanForRealServices = (moduleName: string): ComponentServiceInfo[] => {
  const moduleNameLower = moduleName.toLowerCase();
  const moduleNameClean = moduleName.replace(/[_-]/g, '');
  const services: ComponentServiceInfo[] = [];
  
  console.log(`🔍 Enhanced service scanning for module: ${moduleName}`);
  
  // React apps typically have services in utils, api, or services directories
  // Let's detect common service patterns
  
  // API/Data services
  if (moduleNameLower === 'users' || moduleNameLower === 'user' || moduleNameLower === 'profiles') {
    services.push(
      {
        name: 'UserDataService',
        type: 'service',
        filePath: 'src/hooks/users/useUserData.tsx',
        permissions: ['users_read', 'users_service'],
        isProtected: true,
        lastModified: new Date().toISOString(),
        note: 'Data management service for users'
      },
      {
        name: 'UserMutationService',
        type: 'service',
        filePath: 'src/hooks/users/useUserMutations.tsx',
        permissions: ['users_write', 'users_service'],
        isProtected: true,
        lastModified: new Date().toISOString(),
        note: 'Mutation service for user operations'
      }
    );
  }

  if (moduleNameLower === 'facilities' || moduleNameLower === 'facility') {
    services.push(
      {
        name: 'FacilityMutationService',
        type: 'service',
        filePath: 'src/hooks/mutations/useFacilityMutations.tsx',
        permissions: ['facilities_write', 'facilities_service'],
        isProtected: true,
        lastModified: new Date().toISOString(),
        note: 'Mutation service for facility operations'
      }
    );
  }

  if (moduleNameLower === 'modules' || moduleNameLower === 'module') {
    services.push(
      {
        name: 'ModuleRegistryService',
        type: 'service',
        filePath: 'src/utils/moduleRegistry.ts',
        permissions: ['modules_admin', 'modules_service'],
        isProtected: true,
        lastModified: new Date().toISOString(),
        note: 'Core module registry and management service'
      },
      {
        name: 'ModuleValidationService',
        type: 'service',
        filePath: 'src/utils/moduleValidation.ts',
        permissions: ['modules_validate', 'modules_service'],
        isProtected: true,
        lastModified: new Date().toISOString(),
        note: 'Module validation and security service'
      },
      {
        name: 'AutoModuleRegistrationService',
        type: 'service',
        filePath: 'src/utils/autoModuleRegistration.ts',
        permissions: ['modules_auto_register', 'modules_service'],
        isProtected: true,
        lastModified: new Date().toISOString(),
        note: 'Automated module detection and registration'
      }
    );
  }

  // Check for API integration services
  if (moduleNameLower.includes('api') || moduleNameLower.includes('integration')) {
    services.push(
      {
        name: 'ApiIntegrationService',
        type: 'service',
        filePath: 'src/utils/api/ApiIntegrationManager.ts',
        permissions: ['api_integrations_manage', 'api_service'],
        isProtected: true,
        lastModified: new Date().toISOString(),
        note: 'Core API integration management service'
      },
      {
        name: 'ExternalApiService',
        type: 'service',
        filePath: 'src/utils/api/ExternalApiManager.ts',
        permissions: ['external_api_manage', 'api_service'],
        isProtected: true,
        lastModified: new Date().toISOString(),
        note: 'External API management service'
      }
    );
  }

  // Authentication and security services
  if (moduleNameLower.includes('auth') || moduleNameLower.includes('security')) {
    services.push(
      {
        name: 'AuthSecurityService',
        type: 'service',
        filePath: 'src/utils/security/authSecurityHelpers.ts',
        permissions: ['auth_security', 'security_service'],
        isProtected: true,
        lastModified: new Date().toISOString(),
        note: 'Authentication and security helper service'
      }
    );
  }

  // Patient data services for healthcare context
  if (moduleNameLower.includes('patient')) {
    services.push(
      {
        name: 'PatientDataService',
        type: 'service',
        filePath: 'src/hooks/patients/usePatientData.tsx',
        permissions: ['patients_read', 'patients_service'],
        isProtected: true,
        lastModified: new Date().toISOString(),
        note: 'Patient data management service'
      },
      {
        name: 'PatientMutationService',
        type: 'service',
        filePath: 'src/hooks/patients/usePatientMutations.tsx',
        permissions: ['patients_write', 'patients_service'],
        isProtected: true,
        lastModified: new Date().toISOString(),
        note: 'Patient mutation service'
      }
    );
  }

  // If no specific services found, generate likely services
  if (services.length === 0) {
    services.push(
      {
        name: `${moduleNameClean}DataService`,
        type: 'service',
        filePath: `src/utils/${moduleNameLower}DataHelpers.ts`,
        permissions: [`${moduleNameLower}_service`, `${moduleNameLower}_read`],
        isProtected: true,
        lastModified: new Date().toISOString(),
        note: 'Likely data service based on module pattern'
      },
      {
        name: `${moduleNameClean}ApiService`,
        type: 'service',
        filePath: `src/hooks/${moduleNameLower}/use${moduleNameClean}Data.tsx`,
        permissions: [`${moduleNameLower}_api`, `${moduleNameLower}_service`],
        isProtected: true,
        lastModified: new Date().toISOString(),
        note: 'Likely API service based on module pattern'
      }
    );
  }

  console.log(`📊 Found ${services.length} services for ${moduleName}`);
  return services;
};
