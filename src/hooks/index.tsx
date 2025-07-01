
/**
 * Unified Hooks Export - Single Source of Truth
 * All application hooks consolidated to prevent duplication
 */

// Authentication - Single Source
export { useCleanAuth } from './useCleanAuth';
export { useAuthContext } from '@/components/auth/CleanAuthProvider';

// User Management - Single Source  
export { useUnifiedUserManagement } from './useUnifiedUserManagement';

// Dashboard - Single Source
export { useDashboard } from './useDashboard';

// API Services - Single Source
export { useApiServices } from './useApiServices';

// Facilities - Single Source
export { useFacilities } from './useFacilities';

// Modules - Single Source  
export { useModules } from './useModules';

// Consolidation Analysis
export { useConsolidationAnalysis } from './useConsolidationAnalysis';

// Specialized hooks
export { useUserDeactivation } from './mutations/useUserDeactivation';
export { usePermissions } from './usePermissions';
export { useUserManagementDialogs } from './useUserManagementDialogs';

// Routing
export { useSimpleRouting } from './useSimpleRouting';
export { useIntelligentRouting } from './useIntelligentRouting';

// UI Hooks
export { useToast } from './use-toast';

/**
 * IMPORTANT: This is the ONLY hooks export file.
 * All hooks are consolidated here to ensure single source of truth.
 * 
 * DO NOT:
 * - Create duplicate hooks
 * - Import hooks from other index files
 * - Create separate hook export files
 * 
 * ALWAYS:
 * - Import hooks from this central location
 * - Add new hooks to this index
 * - Verify no duplicates exist
 */
