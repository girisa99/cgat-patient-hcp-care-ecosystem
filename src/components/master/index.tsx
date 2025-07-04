
/**
 * Master Components Index - Single Source of Truth
 * All master consolidation components and systems
 */

// Main master user management component
export { MasterUserManagementTable } from './MasterUserManagementTable';

// Master compliance validation component  
export { MasterComplianceValidator } from './MasterComplianceValidator';

// Backward compatibility - all point to master components
export { MasterUserManagementTable as EnhancedUserManagementTable } from './MasterUserManagementTable';
export { MasterUserManagementTable as ConsolidatedUserTable } from './MasterUserManagementTable';
