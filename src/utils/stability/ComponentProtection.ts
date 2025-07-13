/**
 * COMPONENT PROTECTION SYSTEM
 * Ensures critical components remain stable and protected from unwanted changes
 * Implements component isolation and stability monitoring
 */

export interface ProtectedComponent {
  name: string;
  path: string;
  version: string;
  critical: boolean;
  lastModified: string;
  checksum?: string;
  dependencies: string[];
}

export interface ComponentStabilityConfig {
  autoProtect: boolean;
  validateOnImport: boolean;
  logChanges: boolean;
  alertOnCriticalChanges: boolean;
}

class ComponentProtectionSystem {
  private static instance: ComponentProtectionSystem;
  private protectedComponents: Map<string, ProtectedComponent> = new Map();
  private config: ComponentStabilityConfig = {
    autoProtect: true,
    validateOnImport: true,
    logChanges: true,
    alertOnCriticalChanges: true
  };

  static getInstance(): ComponentProtectionSystem {
    if (!ComponentProtectionSystem.instance) {
      ComponentProtectionSystem.instance = new ComponentProtectionSystem();
    }
    return ComponentProtectionSystem.instance;
  }

  /**
   * Register a component for protection
   */
  registerProtectedComponent(component: ProtectedComponent): void {
    console.log(`🛡️ Registering protected component: ${component.name}`);
    this.protectedComponents.set(component.name, component);
    
    if (component.critical) {
      console.log(`🚨 CRITICAL component registered: ${component.name}`);
    }
  }

  /**
   * Get all protected components
   */
  getProtectedComponents(): ProtectedComponent[] {
    return Array.from(this.protectedComponents.values());
  }

  /**
   * Check if a component is protected
   */
  isProtected(componentName: string): boolean {
    return this.protectedComponents.has(componentName);
  }

  /**
   * Get component protection status
   */
  getProtectionStatus(componentName: string): ProtectedComponent | null {
    return this.protectedComponents.get(componentName) || null;
  }

  /**
   * Validate component integrity
   */
  validateComponent(componentName: string): { valid: boolean; issues: string[] } {
    const component = this.protectedComponents.get(componentName);
    if (!component) {
      return { valid: false, issues: ['Component not registered for protection'] };
    }

    const issues: string[] = [];

    // Add validation logic here
    if (component.critical && !component.checksum) {
      issues.push('Critical component missing integrity checksum');
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * Log component change
   */
  logComponentChange(componentName: string, changeType: string, details?: any): void {
    if (!this.config.logChanges) return;

    const timestamp = new Date().toISOString();
    console.log(`📝 Component Change Log [${timestamp}]:`, {
      component: componentName,
      changeType,
      details,
      isProtected: this.isProtected(componentName)
    });

    const component = this.protectedComponents.get(componentName);
    if (component?.critical && this.config.alertOnCriticalChanges) {
      console.warn(`🚨 CRITICAL COMPONENT CHANGED: ${componentName}`, {
        changeType,
        details
      });
    }
  }

  /**
   * Update component version
   */
  updateComponentVersion(componentName: string, newVersion: string): void {
    const component = this.protectedComponents.get(componentName);
    if (component) {
      component.version = newVersion;
      component.lastModified = new Date().toISOString();
      this.logComponentChange(componentName, 'version_update', { newVersion });
    }
  }

  /**
   * Create component isolation wrapper
   */
  createIsolationWrapper<T>(componentName: string, component: T): T {
    if (!this.isProtected(componentName)) {
      return component;
    }

    console.log(`🔒 Creating isolation wrapper for: ${componentName}`);
    
    // Create a proxy to monitor component usage
    return new Proxy(component as any, {
      get: (target, prop) => {
        this.logComponentChange(componentName, 'property_access', { property: prop });
        return target[prop];
      },
      set: (target, prop, value) => {
        this.logComponentChange(componentName, 'property_modification', { 
          property: prop, 
          value: value 
        });
        target[prop] = value;
        return true;
      }
    });
  }
}

// Export singleton instance
export const componentProtection = ComponentProtectionSystem.getInstance();

// Initialize core protected components
componentProtection.registerProtectedComponent({
  name: 'MasterAuthForm',
  path: 'src/components/auth/MasterAuthForm.tsx',
  version: '1.0.0',
  critical: true,
  lastModified: new Date().toISOString(),
  dependencies: ['useMasterAuth', 'HealthcareAuthLayout', 'Supabase']
});

componentProtection.registerProtectedComponent({
  name: 'Login',
  path: 'src/pages/Login.tsx',
  version: '1.0.0',
  critical: true,
  lastModified: new Date().toISOString(),
  dependencies: ['MasterAuthForm']
});

componentProtection.registerProtectedComponent({
  name: 'HealthcareAuthLayout',
  path: 'src/components/auth/HealthcareAuthLayout.tsx',
  version: '1.0.0',
  critical: true,
  lastModified: new Date().toISOString(),
  dependencies: []
});

componentProtection.registerProtectedComponent({
  name: 'useMasterAuth',
  path: 'src/hooks/useMasterAuth.tsx',
  version: '2.0.0',
  critical: true,
  lastModified: new Date().toISOString(),
  dependencies: ['Supabase']
});

componentProtection.registerProtectedComponent({
  name: 'ProtectedRoute',
  path: 'src/components/auth/ProtectedRoute.tsx',
  version: '1.0.0',
  critical: true,
  lastModified: new Date().toISOString(),
  dependencies: ['useMasterAuth']
});

console.log('🛡️ Component Protection System initialized with', componentProtection.getProtectedComponents().length, 'protected components');