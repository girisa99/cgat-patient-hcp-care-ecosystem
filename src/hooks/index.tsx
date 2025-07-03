
/**
 * Unified Hooks Export - Single Source of Truth
 * All application hooks consolidated to prevent duplication
 */

// Authentication - Single Source
export { useDatabaseAuth } from './useDatabaseAuth';
export { useAuthContext } from '@/components/auth/DatabaseAuthProvider';

// User Management - Single Source  
export { useMasterUserManagement } from './useMasterUserManagement';

// Dashboard - Single Source
export { useDashboard } from './useDashboard';

// API Services - CONSOLIDATED Single Source (REAL DATA)
export { useApiServices } from './useApiServices';

// Facilities - Single Source
export { useFacilities } from './useFacilities';

// Modules - Single Source  
export { useModules } from './useModules';

// Consolidation Analysis
export { useConsolidationAnalysis } from './useConsolidationAnalysis';

// External APIs - Enhanced functionality
export { useExternalApis } from './useExternalApis';
export { useEnhancedExternalApis } from './useEnhancedExternalApis';
export { usePublishedApiIntegration } from './usePublishedApiIntegration';
export { useExternalApiPublishing } from './useExternalApiPublishing';

// Specialized hooks
// useUserDeactivation removed - use useMasterUserManagement instead
export { usePermissions } from './usePermissions';
export { useUserManagementDialogs } from './useUserManagementDialogs';

// Routing
export { useSimpleRouting } from './useSimpleRouting';
export { useIntelligentRouting } from './useIntelligentRouting';

// UI Hooks
export { useToast } from './use-toast';

/**
 * CONSOLIDATED API SERVICES ARCHITECTURE
 * 
 * PRIMARY SOURCE: useApiServices (uses api_integration_registry table)
 * - Real data from Supabase database
 * - Proper RLS policies applied
 * - CRUD operations with mutations
 * - Statistics and filtering
 * 
 * ENHANCED FEATURES:
 * - useExternalApis: External API publishing and marketplace
 * - usePublishedApiIntegration: Developer portal integration
 * - useExternalApiPublishing: Publishing workflow management
 * 
 * DO NOT:
 * - Create duplicate API hooks
 * - Use mock data - all data comes from database
 * - Import hooks from other index files
 * - Create separate API export files
 * 
 * ALWAYS:
 * - Use useApiServices as primary source
 * - Verify RLS policies are working
 * - Check data comes from real tables
 * - Ensure single source of truth
 */
