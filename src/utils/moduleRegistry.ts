
/**
 * Module Registry - Single Source of Truth for Module Management
 * Centralized registry for all module configurations and metadata
 */

export interface ModuleConfig {
  id: string;
  name: string;
  description?: string;
  tableName: string;
  requiredFields: string[];
  customValidation?: (data: any) => boolean;
  isActive: boolean;
  createdAt: string;
  lastSync?: string;
}

export interface ModuleRegistry {
  modules: Map<string, ModuleConfig>;
  registrationOrder: string[];
}

class ModuleRegistryManager {
  private registry: ModuleRegistry = {
    modules: new Map(),
    registrationOrder: []
  };

  /**
   * Register a new module configuration
   */
  registerModule(config: Omit<ModuleConfig, 'createdAt' | 'isActive'>): void {
    const moduleConfig: ModuleConfig = {
      ...config,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    this.registry.modules.set(config.id, moduleConfig);
    
    if (!this.registry.registrationOrder.includes(config.id)) {
      this.registry.registrationOrder.push(config.id);
    }

    console.log(`📦 Module registered: ${config.name}`);
  }

  /**
   * Get all registered modules
   */
  getAllModules(): ModuleConfig[] {
    return Array.from(this.registry.modules.values())
      .filter(module => module.isActive)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get module by ID
   */
  getModule(id: string): ModuleConfig | undefined {
    return this.registry.modules.get(id);
  }

  /**
   * Check if module exists
   */
  hasModule(id: string): boolean {
    return this.registry.modules.has(id);
  }

  /**
   * Get modules by table name
   */
  getModulesByTable(tableName: string): ModuleConfig[] {
    return this.getAllModules().filter(module => module.tableName === tableName);
  }

  /**
   * Update module sync status
   */
  updateModuleSync(id: string): void {
    const module = this.registry.modules.get(id);
    if (module) {
      module.lastSync = new Date().toISOString();
      this.registry.modules.set(id, module);
    }
  }

  /**
   * Get registry statistics
   */
  getStats() {
    const modules = this.getAllModules();
    return {
      totalModules: modules.length,
      activeModules: modules.filter(m => m.isActive).length,
      tablesUsed: [...new Set(modules.map(m => m.tableName))].length,
      lastRegistration: modules.length > 0 ? 
        Math.max(...modules.map(m => new Date(m.createdAt).getTime())) : null
    };
  }
}

// Create singleton instance
const moduleRegistryManager = new ModuleRegistryManager();

// Pre-register core modules for single source of truth
moduleRegistryManager.registerModule({
  id: 'users',
  name: 'Users Management',
  description: 'Unified user management system',
  tableName: 'profiles',
  requiredFields: ['email', 'first_name']
});

moduleRegistryManager.registerModule({
  id: 'patients',
  name: 'Patients Management', 
  description: 'Patient caregivers filtered from users',
  tableName: 'profiles',
  requiredFields: ['email', 'first_name', 'role']
});

moduleRegistryManager.registerModule({
  id: 'facilities',
  name: 'Facilities Management',
  description: 'Healthcare facilities management',
  tableName: 'facilities',
  requiredFields: ['name', 'facility_type']
});

moduleRegistryManager.registerModule({
  id: 'modules',
  name: 'Modules Management',
  description: 'System modules registry',
  tableName: 'modules',
  requiredFields: ['name']
});

moduleRegistryManager.registerModule({
  id: 'api-services',
  name: 'API Services Management',
  description: 'API integration services',
  tableName: 'api_integration_registry',
  requiredFields: ['name', 'type', 'direction']
});

console.log('🏗️ Module Registry initialized with', moduleRegistryManager.getStats().totalModules, 'core modules');

export const moduleRegistry = moduleRegistryManager;
