
/**
 * Component Registry Scanner
 * Comprehensive scanning system for existing components, hooks, and templates
 */

import { moduleRegistry } from '@/utils/moduleRegistry';

export interface ComponentInventory {
  hooks: HookInventory[];
  components: ComponentInventory[];
  templates: TemplateInventory[];
  utilities: UtilityInventory[];
}

export interface HookInventory {
  name: string;
  tableName?: string;
  functionality: string[];
  reusable: boolean;
  location: string;
}

export interface ComponentInventory {
  name: string;
  type: 'module' | 'dialog' | 'list' | 'form' | 'template';
  functionality: string[];
  reusable: boolean;
  dependencies: string[];
  location: string;
}

export interface TemplateInventory {
  name: string;
  pattern: string;
  applicableTables: string[];
  features: string[];
  location: string;
}

export interface UtilityInventory {
  name: string;
  functionality: string[];
  dependencies: string[];
  location: string;
}

/**
 * Component Registry Scanner Class
 * Scans and catalogs all existing components for reuse analysis
 */
export class ComponentRegistryScanner {
  /**
   * Scan all existing components and create inventory
   */
  static async scanAllComponents(): Promise<ComponentInventory> {
    console.log('🔍 Scanning all existing components for registry...');

    const hooks = this.scanExistingHooks();
    const components = this.scanExistingComponents();
    const templates = this.scanExistingTemplates();
    const utilities = this.scanExistingUtilities();

    console.log('📊 Component inventory complete:', {
      hooks: hooks.length,
      components: components.length,
      templates: templates.length,
      utilities: utilities.length
    });

    return {
      hooks,
      components,
      templates,
      utilities
    };
  }

  /**
   * Scan existing hooks
   */
  private static scanExistingHooks(): HookInventory[] {
    const hooks: HookInventory[] = [];

    // Core unified data hooks
    hooks.push({
      name: 'useUnifiedUserData',
      functionality: ['user data fetching', 'role management', 'profile operations'],
      reusable: true,
      location: 'src/hooks/useUnifiedUserData.tsx'
    });

    hooks.push({
      name: 'useTypeSafeModuleTemplate',
      functionality: ['type-safe database operations', 'CRUD operations', 'validation'],
      reusable: true,
      location: 'src/templates/hooks/useTypeSafeModuleTemplate.tsx'
    });

    // Domain-specific hooks
    const domainHooks = [
      { name: 'useUsers', tableName: 'profiles', functionality: ['user management', 'profile operations'] },
      { name: 'useFacilities', tableName: 'facilities', functionality: ['facility management', 'facility operations'] },
      { name: 'useModules', tableName: 'modules', functionality: ['module management', 'system modules'] },
      { name: 'usePatients', tableName: 'profiles', functionality: ['patient management', 'healthcare data'] },
      { name: 'useAuth', functionality: ['authentication', 'authorization', 'session management'] },
      { name: 'usePermissions', functionality: ['permission management', 'access control'] },
      { name: 'useAuditLogs', tableName: 'audit_logs', functionality: ['audit logging', 'activity tracking'] }
    ];

    hooks.push(...domainHooks.map(hook => ({
      ...hook,
      reusable: true,
      location: `src/hooks/${hook.name}.tsx`
    })));

    // Module registry hooks
    const registeredModules = moduleRegistry.getAll();
    hooks.push(...registeredModules.map(module => ({
      name: `use${module.moduleName}`,
      tableName: module.tableName,
      functionality: ['database operations', 'CRUD operations', 'validation'],
      reusable: true,
      location: `src/hooks/use${module.moduleName}.tsx`
    })));

    return hooks;
  }

  /**
   * Scan existing components
   */
  private static scanExistingComponents(): ComponentInventory[] {
    const components: ComponentInventory[] = [];

    // Template components
    components.push({
      name: 'ExtensibleModuleTemplate',
      type: 'template',
      functionality: ['consistent UI patterns', 'CRUD interface', 'data table', 'form handling'],
      reusable: true,
      dependencies: ['DataTable', 'StatusBadge'],
      location: 'src/templates/components/ExtensibleModuleTemplate.tsx'
    });

    // Admin components
    const adminComponents = [
      { name: 'UserManagementList', type: 'list', functionality: ['user display', 'role management', 'permissions'] },
      { name: 'FacilitiesList', type: 'list', functionality: ['facility display', 'facility management'] },
      { name: 'ModuleList', type: 'list', functionality: ['module display', 'system configuration'] },
      { name: 'AutoModuleManager', type: 'module', functionality: ['automatic module detection', 'code generation'] }
    ];

    components.push(...adminComponents.map(comp => ({
      ...comp,
      reusable: true,
      dependencies: ['DataTable', 'StatusBadge', 'Button'],
      location: `src/components/admin/${comp.name}.tsx`
    })));

    // Dialog components
    const dialogComponents = [
      { name: 'CreateUserDialog', functionality: ['user creation', 'form validation'] },
      { name: 'CreateFacilityDialog', functionality: ['facility creation', 'form validation'] },
      { name: 'CreateModuleDialog', functionality: ['module creation', 'configuration'] }
    ];

    components.push(...dialogComponents.map(comp => ({
      name: comp.name,
      type: 'dialog' as const,
      functionality: comp.functionality,
      reusable: true,
      dependencies: ['Dialog', 'Form', 'Button'],
      location: `src/components/${comp.name.toLowerCase().replace('dialog', '')}/${comp.name}.tsx`
    })));

    return components;
  }

  /**
   * Scan existing templates
   */
  private static scanExistingTemplates(): TemplateInventory[] {
    return [
      {
        name: 'ExtensibleModuleTemplate',
        pattern: 'Universal CRUD interface with consistent UI patterns',
        applicableTables: ['any table with standard CRUD operations'],
        features: ['data table', 'search/filter', 'pagination', 'form handling', 'status management'],
        location: 'src/templates/components/ExtensibleModuleTemplate.tsx'
      },
      {
        name: 'useTypeSafeModuleTemplate',
        pattern: 'Type-safe database operations with validation',
        applicableTables: ['any database table'],
        features: ['CRUD operations', 'TypeScript validation', 'error handling', 'caching'],
        location: 'src/templates/hooks/useTypeSafeModuleTemplate.tsx'
      },
      {
        name: 'ModuleTemplate',
        pattern: 'Generic module structure',
        applicableTables: ['system modules'],
        features: ['basic CRUD', 'simple interface'],
        location: 'src/templates/ModuleTemplate.tsx'
      }
    ];
  }

  /**
   * Scan existing utilities
   */
  private static scanExistingUtilities(): UtilityInventory[] {
    return [
      {
        name: 'moduleValidation',
        functionality: ['table validation', 'TypeScript checking', 'pre-creation checks'],
        dependencies: ['Database types'],
        location: 'src/utils/moduleValidation.ts'
      },
      {
        name: 'moduleRegistry',
        functionality: ['module registration', 'auto-detection', 'batch operations'],
        dependencies: ['moduleValidation'],
        location: 'src/utils/moduleRegistry.ts'
      },
      {
        name: 'DatabaseSchemaAnalyzer',
        functionality: ['schema analysis', 'table structure', 'RLS policies'],
        dependencies: ['supabase client'],
        location: 'src/utils/api/DatabaseSchemaAnalyzer.ts'
      },
      {
        name: 'RealApiScanner',
        functionality: ['API detection', 'endpoint generation', 'business logic'],
        dependencies: ['DatabaseSchemaAnalyzer'],
        location: 'src/utils/api/RealApiScanner.ts'
      }
    ];
  }

  /**
   * Find reuse opportunities for a specific request
   */
  static async findReuseOpportunities(request: {
    tableName?: string;
    functionality: string[];
    componentType: 'hook' | 'component' | 'template';
  }): Promise<string[]> {
    const inventory = await this.scanAllComponents();
    const opportunities: string[] = [];

    // Check hooks for reuse
    if (request.componentType === 'hook') {
      const matchingHooks = inventory.hooks.filter(hook => 
        hook.tableName === request.tableName ||
        hook.functionality.some(func => request.functionality.includes(func))
      );

      opportunities.push(...matchingHooks.map(hook => 
        `Existing hook '${hook.name}' provides: ${hook.functionality.join(', ')}`
      ));

      // Always recommend unified templates
      opportunities.push('Consider using useTypeSafeModuleTemplate for type-safe operations');
    }

    // Check components for reuse
    if (request.componentType === 'component') {
      const matchingComponents = inventory.components.filter(comp =>
        comp.functionality.some(func => request.functionality.includes(func))
      );

      opportunities.push(...matchingComponents.map(comp =>
        `Existing component '${comp.name}' provides: ${comp.functionality.join(', ')}`
      ));

      // Always recommend templates
      opportunities.push('Consider using ExtensibleModuleTemplate for consistent UI patterns');
    }

    // Check templates for reuse
    if (request.componentType === 'template') {
      const matchingTemplates = inventory.templates.filter(template =>
        !request.tableName || template.applicableTables.includes('any table with standard CRUD operations')
      );

      opportunities.push(...matchingTemplates.map(template =>
        `Existing template '${template.name}' supports: ${template.features.join(', ')}`
      ));
    }

    return opportunities;
  }
}
