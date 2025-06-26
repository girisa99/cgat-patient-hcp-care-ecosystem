
/**
 * Module Registry System
 * 
 * This system maintains a registry of all modules and their configurations,
 * enabling real-time updates and validation across the application.
 */

import { ModuleConfig } from './moduleValidation';

export interface RegisteredModule extends ModuleConfig {
  version: string;
  lastUpdated: string;
  dependencies: string[];
  status: 'active' | 'deprecated' | 'development';
}

class ModuleRegistry {
  private modules: Map<string, RegisteredModule> = new Map();
  private listeners: Set<(modules: RegisteredModule[]) => void> = new Set();

  /**
   * Register a new module or update existing one
   */
  register(module: RegisteredModule) {
    console.log(`📝 Registering module: ${module.moduleName}`);
    
    const existing = this.modules.get(module.moduleName);
    if (existing) {
      console.log(`🔄 Updating existing module: ${module.moduleName}`);
    }

    this.modules.set(module.moduleName, {
      ...module,
      lastUpdated: new Date().toISOString()
    });

    this.notifyListeners();
  }

  /**
   * Get all registered modules
   */
  getAll(): RegisteredModule[] {
    return Array.from(this.modules.values());
  }

  /**
   * Get a specific module by name
   */
  get(moduleName: string): RegisteredModule | undefined {
    return this.modules.get(moduleName);
  }

  /**
   * Check if a module exists
   */
  exists(moduleName: string): boolean {
    return this.modules.has(moduleName);
  }

  /**
   * Subscribe to module changes
   */
  subscribe(listener: (modules: RegisteredModule[]) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Validate all modules
   */
  validateAll() {
    const results = Array.from(this.modules.entries()).map(([name, module]) => ({
      name,
      isValid: this.validateModule(module),
      module
    }));

    const invalid = results.filter(r => !r.isValid);
    if (invalid.length > 0) {
      console.warn('⚠️ Invalid modules found:', invalid.map(r => r.name));
    }

    return results;
  }

  private validateModule(module: RegisteredModule): boolean {
    // Add validation logic here
    return true;
  }

  private notifyListeners() {
    const modules = this.getAll();
    this.listeners.forEach(listener => listener(modules));
  }
}

// Global module registry instance
export const moduleRegistry = new ModuleRegistry();

// Pre-register existing modules
moduleRegistry.register({
  moduleName: 'Users',
  tableName: 'profiles',
  requiredFields: ['email', 'first_name'],
  optionalFields: ['last_name', 'phone'],
  version: '1.0.0',
  lastUpdated: new Date().toISOString(),
  dependencies: ['auth'],
  status: 'active'
});

moduleRegistry.register({
  moduleName: 'Facilities',
  tableName: 'facilities',
  requiredFields: ['name', 'facility_type'],
  optionalFields: ['address', 'phone'],
  version: '1.0.0',
  lastUpdated: new Date().toISOString(),
  dependencies: [],
  status: 'active'
});

// Future modules can be registered here as they're created
export const registerNewModule = (module: Omit<RegisteredModule, 'lastUpdated'>) => {
  moduleRegistry.register({
    ...module,
    lastUpdated: new Date().toISOString()
  });
};
