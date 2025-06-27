/**
 * Template Hooks - Centralized Export
 * 
 * Focused hooks for better maintainability:
 */

// Main template hook (refactored)
export { useTypeSafeModuleTemplate } from './useTypeSafeModuleTemplate';

// Focused hooks for specific concerns
export { useModuleData } from './useModuleData';
export { useModuleMutations } from './useModuleMutations';
export { useModuleValidation } from './useModuleValidation';

// Legacy template (keep for backward compatibility)
export { useModuleTemplate } from './useModuleTemplate';
