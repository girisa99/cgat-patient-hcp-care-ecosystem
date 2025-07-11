
/**
 * User Management Hooks - Single Source of Truth
 * All user management functionality consolidated
 */

// Main unified hook - single source of truth
export { useMasterUserManagement } from '../useMasterUserManagement';

// Specialized hooks for specific functionality
// useUserDeactivation removed - use useMasterUserManagement instead
export { usePermissions } from '../usePermissions';
export { useUserManagementDialogs } from '../useUserManagementDialogs';

// Backward compatibility aliases - all point to master hook now
export { useMasterUserManagement as useUsers } from '../useMasterUserManagement';
export { useMasterUserManagement as useConsolidatedUsers } from '../useMasterUserManagement';
export { useMasterUserManagement as useUnifiedUserData } from '../useMasterUserManagement';
// useUnifiedUserManagement removed - use useMasterUserManagement directly
