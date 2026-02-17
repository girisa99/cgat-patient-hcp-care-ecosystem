
/**
 * Master Components Index - Single Source of Truth
 * All master consolidation components and systems
 */

// MASTER APPLICATION TABLE - SINGLE SOURCE OF TRUTH FOR ALL MANAGEMENT
export { MasterApplicationTable } from './MasterApplicationTable';

// Legacy components (use MasterApplicationTable instead)
export { MasterUserManagementTable } from './MasterUserManagementTable';
export { MasterComplianceValidator } from './MasterComplianceValidator';

// Backward compatibility - all point to consolidated component
export { MasterApplicationTable as EnhancedUserManagementTable } from './MasterApplicationTable';
export { MasterApplicationTable as ConsolidatedUserTable } from './MasterApplicationTable';
export { MasterApplicationTable as UnifiedManagementInterface } from './MasterApplicationTable';
