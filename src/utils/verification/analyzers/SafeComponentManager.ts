/**
 * Safe Component Manager
 * Manages component enhancements without breaking existing functionality
 */

export interface ComponentMetadata {
  name: string;
  version: string;
  props?: Record<string, PropConfig>;
  enhancedProps?: Record<string, PropConfig>;
  enhancedFeatures?: string[];
  roleBasedFeatures?: Record<string, string[]>;
  backwardsCompatible: boolean;
  migrationPath?: string;
  category?: string;
  functionality?: string;
  dependencies?: string[];
}

export interface PropConfig {
  type: string;
  required?: boolean;
  default?: any;
  description?: string;
}

export interface EnhancementOptions {
  version?: string;
  features?: string[];
  migrationPath?: string;
  roleBasedFeatures?: Record<string, string[]>;
}

export interface ValidationResult {
  safe: boolean;
  issues: string[];
  warnings?: string[];
}

export interface MigrationStrategy {
  from: string;
  to: string;
  changes: string[];
  automated: boolean;
  estimatedEffort: 'Low' | 'Medium' | 'High';
  rollbackPlan?: string[];
}

export class SafeComponentManager {
  private componentVersions = new Map<string, Map<string, ComponentMetadata>>();
  private migrationStrategies = new Map<string, MigrationStrategy>();
  private componentRegistry = new Map<string, ComponentMetadata>();

  constructor() {
    console.log('🛡️ SafeComponentManager initialized');
  }

  /**
   * Register existing component in the system
   */
  registerComponent(name: string, metadata: ComponentMetadata): void {
    console.log(`📝 Registering component: ${name} v${metadata.version}`);
    
    this.componentRegistry.set(name, metadata);
    
    if (!this.componentVersions.has(name)) {
      this.componentVersions.set(name, new Map());
    }
    
    this.componentVersions.get(name)!.set(metadata.version, metadata);
  }

  /**
   * Safely enhance existing component
   */
  enhanceComponent(componentName: string, enhancement: {
    version: string;
    newProps?: Record<string, PropConfig>;
    features?: string[];
    roleBasedFeatures?: Record<string, string[]>;
    migrationPath?: string;
  }): ComponentMetadata {
    const existingComponent = this.getComponent(componentName);
    if (!existingComponent) {
      throw new Error(`Component ${componentName} not found. Register it first.`);
    }

    console.log(`🔧 Enhancing component: ${componentName} from v${existingComponent.version} to v${enhancement.version}`);

    // Validate enhancement safety
    if (enhancement.newProps) {
      const validation = this.validatePropAddition(componentName, enhancement.newProps);
      if (!validation.safe) {
        throw new Error(`Enhancement would break compatibility: ${validation.issues.join(', ')}`);
      }
    }

    // Create new version
    const newVersion = this.createEnhancedVersion(existingComponent, enhancement);

    // Register new version
    this.registerComponentVersion(componentName, enhancement.version, newVersion);

    // Create migration strategy
    this.createMigrationStrategy(componentName, existingComponent, newVersion);

    return newVersion;
  }

  /**
   * Create enhanced version of component
   */
  private createEnhancedVersion(
    existingComponent: ComponentMetadata, 
    enhancement: {
      version: string;
      newProps?: Record<string, PropConfig>;
      features?: string[];
      roleBasedFeatures?: Record<string, string[]>;
      migrationPath?: string;
    }
  ): ComponentMetadata {
    return {
      ...existingComponent,
      version: enhancement.version,
      enhancedProps: {
        ...existingComponent.props,
        ...enhancement.newProps
      },
      enhancedFeatures: [
        ...(existingComponent.enhancedFeatures || []),
        ...(enhancement.features || [])
      ],
      roleBasedFeatures: {
        ...existingComponent.roleBasedFeatures,
        ...enhancement.roleBasedFeatures
      },
      backwardsCompatible: true,
      migrationPath: enhancement.migrationPath || 'automatic'
    };
  }

  /**
   * Add props to component safely
   */
  addPropsToComponent(
    componentName: string, 
    newProps: Record<string, PropConfig>, 
    options: EnhancementOptions = {}
  ): ComponentMetadata {
    const validation = this.validatePropAddition(componentName, newProps);
    if (!validation.safe) {
      throw new Error(`Adding props to ${componentName} would break existing usage: ${validation.issues.join(', ')}`);
    }

    // Add defaults to ensure backwards compatibility
    const propsWithDefaults = this.addDefaultValues(newProps);

    const enhancement = {
      version: options.version || this.generateVersion(),
      newProps: propsWithDefaults,
      features: options.features || [],
      migrationPath: options.migrationPath || 'automatic',
      roleBasedFeatures: options.roleBasedFeatures
    };

    return this.enhanceComponent(componentName, enhancement);
  }

  /**
   * Validate if adding props is safe
   */
  validatePropAddition(componentName: string, newProps: Record<string, PropConfig>): ValidationResult {
    const issues: string[] = [];
    const warnings: string[] = [];
    const existingComponent = this.getComponent(componentName);

    if (!existingComponent) {
      issues.push(`Component ${componentName} not found`);
      return { safe: false, issues, warnings };
    }

    // Check for prop name conflicts
    const existingPropNames = Object.keys(existingComponent.props || {});
    const newPropNames = Object.keys(newProps);
    const conflicts = newPropNames.filter(name => existingPropNames.includes(name));

    if (conflicts.length > 0) {
      issues.push(`Prop name conflicts: ${conflicts.join(', ')}`);
    }

    // Check for required props without defaults
    const requiredWithoutDefaults = Object.entries(newProps)
      .filter(([name, config]) => config.required && config.default === undefined)
      .map(([name]) => name);

    if (requiredWithoutDefaults.length > 0) {
      issues.push(`Required props without defaults: ${requiredWithoutDefaults.join(', ')}`);
    }

    // Check for type compatibility
    for (const [propName, config] of Object.entries(newProps)) {
      if (existingPropNames.includes(propName)) {
        const existingProp = existingComponent.props![propName];
        if (existingProp && existingProp.type !== config.type) {
          issues.push(`Type mismatch for prop ${propName}: ${existingProp.type} vs ${config.type}`);
        }
      }
    }

    // Warnings for best practices
    if (Object.keys(newProps).length > 5) {
      warnings.push('Adding many props at once - consider breaking into smaller enhancements');
    }

    return {
      safe: issues.length === 0,
      issues,
      warnings
    };
  }

  /**
   * Add default values to props for backwards compatibility
   */
  private addDefaultValues(props: Record<string, PropConfig>): Record<string, PropConfig> {
    const propsWithDefaults: Record<string, PropConfig> = {};
    
    for (const [name, config] of Object.entries(props)) {
      propsWithDefaults[name] = {
        ...config,
        default: config.default !== undefined ? config.default : this.getDefaultForType(config.type)
      };
    }
    
    return propsWithDefaults;
  }

  /**
   * Get default value for a given type
   */
  private getDefaultForType(type: string): any {
    const defaults: Record<string, any> = {
      'string': '',
      'number': 0,
      'boolean': false,
      'array': [],
      'object': {},
      'function': () => {},
      'React.ReactNode': null,
      'React.ComponentType': null
    };
    
    return defaults[type] || null;
  }

  /**
   * Get component by name (latest version)
   */
  getComponent(componentName: string): ComponentMetadata | undefined {
    return this.componentRegistry.get(componentName);
  }

  /**
   * Get specific version of component
   */
  getComponentVersion(componentName: string, version: string): ComponentMetadata | undefined {
    const versions = this.componentVersions.get(componentName);
    return versions?.get(version);
  }

  /**
   * Register component version
   */
  private registerComponentVersion(componentName: string, version: string, implementation: ComponentMetadata): void {
    if (!this.componentVersions.has(componentName)) {
      this.componentVersions.set(componentName, new Map());
    }
    
    this.componentVersions.get(componentName)!.set(version, implementation);
    
    // Update latest version in registry
    this.componentRegistry.set(componentName, implementation);
  }

  /**
   * Generate version string
   */
  private generateVersion(): string {
    const timestamp = Date.now();
    return `v${Math.floor(timestamp / 1000)}`;
  }

  /**
   * Create migration strategy
   */
  private createMigrationStrategy(
    componentName: string, 
    oldVersion: ComponentMetadata, 
    newVersion: ComponentMetadata
  ): void {
    const strategy: MigrationStrategy = {
      from: oldVersion.version,
      to: newVersion.version,
      changes: this.calculateChanges(oldVersion, newVersion),
      automated: true,
      estimatedEffort: 'Low',
      rollbackPlan: [
        'Remove new feature flags',
        'Restore previous component version',
        'Update version references',
        'Run regression tests'
      ]
    };

    this.migrationStrategies.set(componentName, strategy);
    console.log(`📋 Migration strategy created for ${componentName}: ${strategy.from} → ${strategy.to}`);
  }

  /**
   * Calculate changes between component versions
   */
  private calculateChanges(oldVersion: ComponentMetadata, newVersion: ComponentMetadata): string[] {
    const changes: string[] = [];
    
    // Compare props
    const oldProps = Object.keys(oldVersion.props || {});
    const newProps = Object.keys(newVersion.enhancedProps || {});
    const addedProps = newProps.filter(prop => !oldProps.includes(prop));
    
    if (addedProps.length > 0) {
      changes.push(`Added props: ${addedProps.join(', ')}`);
    }

    // Compare features
    const oldFeatures = oldVersion.enhancedFeatures || [];
    const newFeatures = newVersion.enhancedFeatures || [];
    const addedFeatures = newFeatures.filter(feature => !oldFeatures.includes(feature));
    
    if (addedFeatures.length > 0) {
      changes.push(`Added features: ${addedFeatures.join(', ')}`);
    }

    // Compare role-based features
    const oldRoleFeatures = Object.keys(oldVersion.roleBasedFeatures || {});
    const newRoleFeatures = Object.keys(newVersion.roleBasedFeatures || {});
    const addedRoleFeatures = newRoleFeatures.filter(feature => !oldRoleFeatures.includes(feature));
    
    if (addedRoleFeatures.length > 0) {
      changes.push(`Added role-based features: ${addedRoleFeatures.join(', ')}`);
    }

    return changes;
  }

  /**
   * Get migration plan for component
   */
  getMigrationPlan(componentName: string): MigrationStrategy | null {
    return this.migrationStrategies.get(componentName) || null;
  }

  /**
   * Get all versions of a component
   */
  getComponentVersions(componentName: string): ComponentMetadata[] {
    const versions = this.componentVersions.get(componentName);
    return versions ? Array.from(versions.values()) : [];
  }

  /**
   * Get component enhancement suggestions
   */
  getEnhancementSuggestions(componentName: string): string[] {
    const component = this.getComponent(componentName);
    if (!component) {
      return ['Component not found'];
    }

    const suggestions: string[] = [];

    // Analyze props
    const propCount = Object.keys(component.props || {}).length;
    if (propCount > 8) {
      suggestions.push('Consider breaking component into smaller, focused components');
    }

    // Analyze functionality
    if (component.functionality?.includes('and')) {
      suggestions.push('Component seems to have multiple responsibilities - consider composition');
    }

    // Check for role-based features
    if (!component.roleBasedFeatures || Object.keys(component.roleBasedFeatures).length === 0) {
      suggestions.push('Consider adding role-based feature controls');
    }

    // Check versioning
    const versions = this.getComponentVersions(componentName);
    if (versions.length === 1) {
      suggestions.push('Component has only one version - consider implementing versioning strategy');
    }

    return suggestions.length > 0 ? suggestions : ['Component is well-structured'];
  }

  /**
   * Validate component creation
   */
  validateComponentCreation(metadata: ComponentMetadata): ValidationResult {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Check if component already exists
    if (this.componentRegistry.has(metadata.name)) {
      issues.push(`Component ${metadata.name} already exists`);
    }

    // Validate required fields
    if (!metadata.name || !metadata.version) {
      issues.push('Component name and version are required');
    }

    // Validate props
    if (metadata.props) {
      for (const [propName, config] of Object.entries(metadata.props)) {
        if (config.required && config.default === undefined) {
          warnings.push(`Required prop ${propName} has no default value`);
        }
      }
    }

    return {
      safe: issues.length === 0,
      issues,
      warnings
    };
  }
}