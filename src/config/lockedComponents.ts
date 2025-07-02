
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
    lockDate: '2025-01-02',
    reason: 'Stable implementation needed for production use',
    dataSource: 'api_integration_registry',
    dependencies: [
      'useApiServices',
      'useApiServiceDetails',
      'ApiIntegrationsTabs'
    ],
    status: 'LOCKED',
    changePolicy: 'REQUIRE_EXPLICIT_APPROVAL'
  },
  DASHBOARD: {
    component: 'UnifiedDashboard',
    hook: 'useDashboardPage',
    version: 'locked-v1.0.0',
    lockDate: '2025-01-02',
    reason: 'Critical dashboard functionality must remain stable',
    dataSource: 'consolidated_dashboard_data',
    dependencies: [
      'useDashboard',
      'useModules',
      'useIntelligentRouting'
    ],
    status: 'LOCKED',
    changePolicy: 'REQUIRE_EXPLICIT_APPROVAL'
  },
  USER_MANAGEMENT: {
    component: 'ConsolidatedUserManagement',
    hook: 'useUserManagementPage',
    version: 'locked-v1.0.0',
    lockDate: '2025-01-02',
    reason: 'User management system must be stable for security',
    dataSource: 'auth.users via edge function',
    dependencies: [
      'useUnifiedUserManagement',
      'useUserManagementDialogs',
      'UserManagementTabs'
    ],
    status: 'LOCKED',
    changePolicy: 'REQUIRE_EXPLICIT_APPROVAL'
  },
  PATIENTS: {
    component: 'PatientsManagement',
    hook: 'usePatientsPage',
    version: 'locked-v1.0.0',
    lockDate: '2025-01-02',
    reason: 'Patient data handling requires stable implementation',
    dataSource: 'profiles table via unified system',
    dependencies: [
      'useUnifiedUserManagement',
      'PatientsList',
      'PatientViewDialog',
      'PatientEditDialog'
    ],
    status: 'LOCKED',
    changePolicy: 'REQUIRE_EXPLICIT_APPROVAL'
  },
  FACILITIES: {
    component: 'FacilitiesManagement',
    hook: 'useFacilitiesPage',
    version: 'locked-v1.0.0',
    lockDate: '2025-01-02',
    reason: 'Healthcare facilities data must remain consistent',
    dataSource: 'facilities table',
    dependencies: [
      'useFacilities',
      'useFacilityData',
      'FacilitiesList'
    ],
    status: 'LOCKED',
    changePolicy: 'REQUIRE_EXPLICIT_APPROVAL'
  },
  MODULES: {
    component: 'ModulesManagement',
    hook: 'useModulesPage',
    version: 'locked-v1.0.0',
    lockDate: '2025-01-02',
    reason: 'System modules configuration must be stable',
    dataSource: 'modules table',
    dependencies: [
      'useModules',
      'useModuleData',
      'ModulesList'
    ],
    status: 'LOCKED',
    changePolicy: 'REQUIRE_EXPLICIT_APPROVAL'
  },
  DATA_IMPORT: {
    component: 'DataImportSystem',
    hook: 'useDataImportPage',
    version: 'locked-v1.0.0',
    lockDate: '2025-01-02',
    reason: 'Data import functionality critical for system integrity',
    dataSource: 'consolidated_data_import',
    dependencies: [
      'useConsolidatedDataImport',
      'JsonImportTab',
      'CsvImportTab',
      'ApiEndpointsTab'
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

export const getAllLockedComponents = () => {
  return Object.entries(LOCKED_COMPONENTS).map(([key, config]) => ({
    key,
    ...config
  }));
};
