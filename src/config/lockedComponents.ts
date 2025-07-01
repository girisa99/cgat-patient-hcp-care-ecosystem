
/**
 * LOCKED COMPONENTS CONFIGURATION
 * This file documents components that are locked to prevent breaking changes
 * DO NOT MODIFY without explicit approval
 */

export const LOCKED_COMPONENTS = {
  API_SERVICES: {
    component: 'ApiIntegrationsManager',
    hook: 'useApiServicesPage',
    version: 'locked-v1.0.0',
    lockDate: '2025-01-01',
    reason: 'Stable implementation needed for production use',
    dataSource: 'api_integration_registry',
    dependencies: [
      'useApiServices',
      'useApiServiceDetails',
      'ApiIntegrationsTabs'
    ],
    status: 'LOCKED',
    changePolicy: 'REQUIRE_EXPLICIT_APPROVAL'
  }
} as const;

export const isComponentLocked = (componentName: string): boolean => {
  return Object.values(LOCKED_COMPONENTS).some(
    config => config.component === componentName && config.status === 'LOCKED'
  );
};

export const getComponentLockInfo = (componentName: string) => {
  return Object.values(LOCKED_COMPONENTS).find(
    config => config.component === componentName
  );
};
