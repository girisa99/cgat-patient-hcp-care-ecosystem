
/**
 * User Management Hooks - Single Source of Truth
 * All user management functionality consolidated
 */

// Main unified hook - single source of truth
export { useUnifiedUserManagement } from '../useUnifiedUserManagement';

// Specialized hooks for specific functionality
export { useUserDeactivation } from '../mutations/useUserDeactivation';
export { usePermissions } from '../usePermissions';
export { useUserManagementDialogs } from '../useUserManagementDialogs';

// Backward compatibility aliases
export { useUnifiedUserManagement as useUsers } from '../useUnifiedUserManagement';
export { useUnifiedUserManagement as useConsolidatedUsers } from '../useUnifiedUserManagement';
export { useUnifiedUserManagement as useUnifiedUserData } from '../useUnifiedUserManagement';
