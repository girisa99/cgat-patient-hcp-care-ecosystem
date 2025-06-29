
/**
 * Consolidated User Management Components
 * Single export point for all user-related UI components
 */

// Core user management components
export { default as UsersList } from './UsersList';
export { default as UserActions } from './UserActions';
export { default as CompactUserManagement } from './CompactUserManagement';
export { default as EnhancedUserFilters } from './EnhancedUserFilters';

// Dialog components
export { default as CreateUserDialog } from './CreateUserDialog';
export { default as EditUserDialog } from './EditUserDialog';
export { default as AssignRoleDialog } from './AssignRoleDialog';
export { default as RemoveRoleDialog } from './RemoveRoleDialog';
export { default as AssignFacilityDialog } from './AssignFacilityDialog';
export { default as PermissionManagementDialog } from './PermissionManagementDialog';

// Bulk operations
export { default as BulkRoleAssignment } from './BulkRoleAssignment';

// Display components
export { default as UserAccessSummary } from './UserAccessSummary';
export { default as UserRolesBadgeGroup } from './UserRolesBadgeGroup';
export { default as UserModuleAccessIndicator } from './UserModuleAccessIndicator';
export { default as UserModuleAccess } from './UserModuleAccess';

// Specialized components
export { default as UserPermissionsBadge } from './UserPermissionsBadge';
export { default as UserPermissionsSummary } from './UserPermissionsSummary';
export { default as RoleAssignmentDebugger } from './RoleAssignmentDebugger';

// Utility components
export { default as DatabaseHealthCheck } from './DatabaseHealthCheck';
