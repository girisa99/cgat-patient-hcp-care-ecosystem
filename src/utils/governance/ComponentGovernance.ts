/**
 * Component Governance System
 * Prevents duplicate component creation and enforces standards
 */

export interface ComponentRegistryEntry {
  name: string;
  path: string;
  type: 'component' | 'hook' | 'service' | 'utility';
  purpose: string;
  lastModified: string;
  dependencies: string[];
}

export interface GovernanceRule {
  id: string;
  name: string;
  description: string;
  type: 'duplicate-prevention' | 'naming-convention' | 'architecture';
  severity: 'error' | 'warning' | 'info';
  check: (component: ComponentRegistryEntry) => boolean;
  message: string;
}

export class ComponentGovernance {
  private static registry: ComponentRegistryEntry[] = [
    // Existing working components
    {
      name: 'UserActionDialogs',
      path: 'src/components/users/UserActionDialogs.tsx',
      type: 'component',
      purpose: 'Handles all user role/facility assignment dialogs',
      lastModified: new Date().toISOString(),
      dependencies: ['useMasterUserManagement', 'useMasterData']
    },
    {
      name: 'CreateUserForm',
      path: 'src/components/forms/CreateUserForm.tsx', 
      type: 'component',
      purpose: 'User creation form with validation',
      lastModified: new Date().toISOString(),
      dependencies: ['useMasterUserManagement']
    },
    {
      name: 'useMasterUserManagement',
      path: 'src/hooks/useMasterUserManagement.tsx',
      type: 'hook',
      purpose: 'Single source of truth for user management',
      lastModified: new Date().toISOString(),
      dependencies: ['useMasterData', 'supabase']
    }
  ];

  private static rules: GovernanceRule[] = [
    {
      id: 'no-duplicate-dialogs',
      name: 'No Duplicate Dialogs',
      description: 'Use UserActionDialogs instead of creating new dialog components',
      type: 'duplicate-prevention',
      severity: 'error',
      check: (component) => {
        const duplicateNames = ['RoleAssignmentDialog', 'EditUserDialog', 'ModuleAssignmentDialog'];
        return !duplicateNames.includes(component.name);
      },
      message: 'Use UserActionDialogs component instead of creating separate dialog components'
    },
    {
      id: 'single-user-hook',
      name: 'Single User Management Hook',
      description: 'Use useMasterUserManagement for all user operations',
      type: 'duplicate-prevention', 
      severity: 'error',
      check: (component) => {
        const forbiddenHooks = ['useUserDeactivation', 'useConsolidatedUsers', 'useUnifiedUserData'];
        return !forbiddenHooks.includes(component.name);
      },
      message: 'Use useMasterUserManagement hook instead of creating separate user hooks'
    },
    {
      id: 'naming-convention',
      name: 'Component Naming Convention',
      description: 'Components should follow PascalCase and be descriptive',
      type: 'naming-convention',
      severity: 'warning',
      check: (component) => {
        return /^[A-Z][a-zA-Z0-9]*$/.test(component.name) && component.name.length > 3;
      },
      message: 'Component names should use PascalCase and be descriptive'
    }
  ];

  /**
   * Register a new component in the governance system
   */
  static registerComponent(component: ComponentRegistryEntry): boolean {
    const violations = this.validateComponent(component);
    
    if (violations.some(v => v.severity === 'error')) {
      console.error('❌ Component registration blocked:', violations);
      return false;
    }

    this.registry.push(component);
    console.log('✅ Component registered:', component.name);
    return true;
  }

  /**
   * Validate a component against governance rules
   */
  static validateComponent(component: ComponentRegistryEntry): Array<GovernanceRule & { violated: boolean }> {
    return this.rules.map(rule => ({
      ...rule,
      violated: !rule.check(component)
    })).filter(result => result.violated);
  }

  /**
   * Check for existing components that serve similar purpose
   */
  static findAlternatives(purpose: string, type: string): ComponentRegistryEntry[] {
    return this.registry.filter(component => 
      component.type === type && 
      component.purpose.toLowerCase().includes(purpose.toLowerCase())
    );
  }

  /**
   * Get all registered components
   */
  static getRegistry(): ComponentRegistryEntry[] {
    return [...this.registry];
  }

  /**
   * Remove duplicate components
   */
  static cleanupDuplicates(): string[] {
    const duplicatesToRemove = [
      'RoleAssignmentDialog',
      'EditUserDialog', 
      'ModuleAssignmentDialog'
    ];

    const removed: string[] = [];
    duplicatesToRemove.forEach(name => {
      const index = this.registry.findIndex(c => c.name === name);
      if (index !== -1) {
        this.registry.splice(index, 1);
        removed.push(name);
      }
    });

    return removed;
  }

  /**
   * Get governance recommendations
   */
  static getRecommendations(): string[] {
    return [
      '✅ Use UserActionDialogs for role/module/facility assignments',
      '✅ Use useMasterUserManagement as single source for user operations',
      '✅ Check component registry before creating new components',
      '✅ Follow naming conventions (PascalCase for components)',
      '✅ Register all new components in governance system',
      '✅ Prefer composition over creating new specialized components',
      '✅ Use existing hooks and services before creating new ones'
    ];
  }
}
