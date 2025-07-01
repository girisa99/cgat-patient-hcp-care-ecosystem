
/**
 * Template System Hooks - Extensible Module Template System
 * Single source of truth for all template-based functionality
 */

// Core template system
export { useTypeSafeModuleTemplate } from './useTypeSafeModuleTemplate';
export { useExtensibleModuleRegistry } from './useExtensibleModuleRegistry';

// Template configurations for existing modules
export { useTemplateUsers } from './useTemplateUsers';
export { useTemplateFacilities } from './useTemplateFacilities';
export { useTemplatePatients } from './useTemplatePatients';
export { useTemplateOnboarding } from './useTemplateOnboarding';

// Module detection and automation
export { useAutomaticModuleDetection } from './useAutomaticModuleDetection';
export { useModuleRegistryManager } from './useModuleRegistryManager';

// Template utilities
export { moduleRegistry } from './moduleRegistry';
export type { 
  ModuleConfig, 
  ModuleTemplate,
  ExtensibleModuleProps,
  TemplateSystemMeta 
} from './types';

// Unified system integration - uses the main unified user management
import { useUnifiedUserManagement } from '@/hooks/useUnifiedUserManagement';

/**
 * Template-compatible wrapper for unified user management
 * Maintains compatibility with template system while using single source of truth
 */
export const useTemplateUnifiedUsers = () => {
  const unifiedData = useUnifiedUserManagement();
  
  return {
    ...unifiedData,
    templateSystemCompatible: true,
    dataSource: 'unified-user-management',
    version: 'template-v1'
  };
};
