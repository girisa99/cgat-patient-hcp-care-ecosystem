
/**
 * Unified Hooks Export - Single Source of Truth
 * All application hooks consolidated to prevent duplication
 */

// Authentication - Single Source
export { useMasterAuth } from './useMasterAuth';

// User Management - Single Source  
export { useMasterUserManagement } from './useMasterUserManagement';

// Dashboard - Single Source
export { useDashboard } from './useDashboard';

// API Services - CONSOLIDATED Single Source (REAL DATA)
export { useApiServices } from './useApiServices';

// Facilities - Single Source
export { useFacilities } from './useFacilities';

// Modules - Single Source (Fixed export)
export { useSingleMasterModules as useModules } from './useSingleMasterModules';

// Consolidation Analysis
export { useConsolidationAnalysis } from './useConsolidationAnalysis';

// External APIs - Enhanced functionality
export { useExternalApis } from './useExternalApis';
export { useEnhancedExternalApis } from './useEnhancedExternalApis';
export { usePublishedApiIntegration } from './usePublishedApiIntegration';
export { useExternalApiPublishing } from './useExternalApiPublishing';

// Specialized hooks
export { usePermissions } from './usePermissions';
export { useUserManagementDialogs } from './useUserManagementDialogs';

// Routing
export { useSimpleRouting } from './useSimpleRouting';
export { useIntelligentRouting } from './useIntelligentRouting';

// UI Hooks
export { useToast } from './use-toast';

// Ngrok Integration
export { useNgrokIntegration } from './useNgrokIntegration';

/**
 * CONSOLIDATED SINGLE SOURCE OF TRUTH ARCHITECTURE
 * 
 * ✅ VERIFIED MODULES:
 * - Modules: useSingleMasterModules (REAL DATA ONLY)
 * - User Management: useMasterUserManagement 
 * - Authentication: useMasterAuth
 * - API Services: useApiServices (REAL DATA)
 * 
 * 🔄 PENDING VERIFICATION:
 * - Dashboard components
 * - Patients management
 * - Facilities management
 * - Onboarding workflow
 * - Security components
 * - Reports & analytics
 * - Testing service suite
 * - Data import functionality
 * 
 * DO NOT:
 * - Create duplicate hooks for same functionality
 * - Use mock data - all data comes from database
 * - Import hooks from other index files
 * - Create separate export files for same domain
 * 
 * ALWAYS:
 * - Use single source of truth hooks
 * - Verify RLS policies are working
 * - Check data comes from real tables
 * - Ensure consistent naming conventions
 */
