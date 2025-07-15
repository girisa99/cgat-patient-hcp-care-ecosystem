/**
 * Safe Component Manager - Manages component registration and prevents conflicts
 * Tracks component usage, prevents duplicates, and ensures safe component loading
 */

import { ComponentSchema, TypeValidator, FrameworkError } from '../core/types.js';

export class SafeComponentManager {
  constructor(config = {}) {
    this.config = {
      catalogPath: './src/components',
      autoRegister: true,
      validateProps: true,
      trackUsage: true,
      ...config
    };
    
    this.components = new Map();
    this.usage = new Map();
    this.conflicts = new Map();
    this.isMonitoring = false;
    this.componentWrappers = new Map();
  }

  /**
   * Start component monitoring
   */
  async startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('👁️ Component monitoring started');
    
    if (this.config.autoRegister) {
      await this.scanAndRegisterComponents();
    }
    
    // Set up periodic conflict detection
    this.monitoringInterval = setInterval(() => {
      this.detectConflicts();
    }, 30000);
  }

  /**
   * Stop component monitoring
   */
  stopMonitoring() {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    console.log('⏹️ Component monitoring stopped');
  }

  /**
   * Register a component
   */
  registerComponent(componentData) {
    const validation = TypeValidator.validate(componentData, ComponentSchema);
    if (!validation.valid) {
      throw new FrameworkError(
        `Invalid component data: ${validation.errors.join(', ')}`,
        'INVALID_COMPONENT_DATA',
        'SafeComponentManager'
      );
    }

    // Check for naming conflicts
    if (this.components.has(componentData.name)) {
      const existing = this.components.get(componentData.name);
      if (existing.file !== componentData.file) {
        this.recordConflict(componentData.name, existing, componentData);
        console.warn(`⚠️ Component name conflict detected: ${componentData.name}`);
      }
    }

    const component = {
      ...componentData,
      registeredAt: new Date(),
      id: this.generateComponentId(componentData),
      safeWrapper: null
    };

    this.components.set(componentData.name, component);
    
    // Initialize usage tracking
    if (this.config.trackUsage) {
      this.usage.set(componentData.name, {
        count: 0,
        firstUsed: null,
        lastUsed: null,
        locations: new Set()
      });
    }

    console.log(`📦 Component registered: ${componentData.name}`);
    return component;
  }

  /**
   * Unregister a component
   */
  unregisterComponent(componentName) {
    if (!this.components.has(componentName)) {
      throw new FrameworkError(
        `Component not found: ${componentName}`,
        'COMPONENT_NOT_FOUND',
        'SafeComponentManager'
      );
    }

    this.components.delete(componentName);
    this.usage.delete(componentName);
    this.componentWrappers.delete(componentName);
    
    console.log(`🗑️ Component unregistered: ${componentName}`);
  }

  /**
   * Get component by name
   */
  getComponent(componentName) {
    return this.components.get(componentName);
  }

  /**
   * Get all registered components
   */
  getAllComponents() {
    return Array.from(this.components.values());
  }

  /**
   * Create a safe wrapper for component
   */
  createSafeWrapper(componentName, OriginalComponent) {
    if (this.componentWrappers.has(componentName)) {
      return this.componentWrappers.get(componentName);
    }

    const SafeWrapper = (props) => {
      try {
        // Track usage
        this.trackUsage(componentName, props);
        
        // Validate props if enabled
        if (this.config.validateProps) {
          this.validateProps(componentName, props);
        }
        
        // Render original component
        return OriginalComponent(props);
      } catch (error) {
        console.error(`❌ Component error in ${componentName}:`, error);
        
        // Return error boundary component
        return this.renderErrorBoundary(componentName, error);
      }
    };

    SafeWrapper.displayName = `Safe(${componentName})`;
    this.componentWrappers.set(componentName, SafeWrapper);
    
    return SafeWrapper;
  }

  /**
   * Track component usage
   */
  trackUsage(componentName, props = {}, location = '') {
    if (!this.config.trackUsage) return;

    if (!this.usage.has(componentName)) {
      this.usage.set(componentName, {
        count: 0,
        firstUsed: null,
        lastUsed: null,
        locations: new Set()
      });
    }

    const usage = this.usage.get(componentName);
    usage.count++;
    usage.lastUsed = new Date();
    
    if (!usage.firstUsed) {
      usage.firstUsed = new Date();
    }
    
    if (location) {
      usage.locations.add(location);
    }
  }

  /**
   * Validate component props
   */
  validateProps(componentName, props) {
    const component = this.getComponent(componentName);
    if (!component || !component.propTypes) return;

    // Basic prop validation (simplified)
    for (const [propName, propType] of Object.entries(component.propTypes)) {
      const value = props[propName];
      
      if (propType.required && (value === undefined || value === null)) {
        console.warn(`⚠️ Required prop '${propName}' missing in ${componentName}`);
      }
      
      if (value !== undefined && !this.validatePropType(value, propType.type)) {
        console.warn(`⚠️ Invalid prop type for '${propName}' in ${componentName}`);
      }
    }
  }

  /**
   * Validate individual prop type
   */
  validatePropType(value, expectedType) {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number';
      case 'boolean':
        return typeof value === 'boolean';
      case 'function':
        return typeof value === 'function';
      case 'object':
        return typeof value === 'object' && value !== null;
      case 'array':
        return Array.isArray(value);
      default:
        return true; // Unknown type, allow it
    }
  }

  /**
   * Render error boundary for failed components
   */
  renderErrorBoundary(componentName, error) {
    // This would need to be adapted for the specific React/framework being used
    return {
      type: 'div',
      props: {
        className: 'component-error-boundary',
        children: [
          {
            type: 'h3',
            props: { children: `Component Error: ${componentName}` }
          },
          {
            type: 'p',
            props: { children: error.message }
          },
          {
            type: 'details',
            props: {
              children: [
                { type: 'summary', props: { children: 'Error Details' } },
                { type: 'pre', props: { children: error.stack } }
              ]
            }
          }
        ]
      }
    };
  }

  /**
   * Record component conflict
   */
  recordConflict(componentName, existing, conflicting) {
    if (!this.conflicts.has(componentName)) {
      this.conflicts.set(componentName, []);
    }

    this.conflicts.get(componentName).push({
      existing: existing.file,
      conflicting: conflicting.file,
      detectedAt: new Date(),
      severity: 'high'
    });
  }

  /**
   * Detect component conflicts
   */
  detectConflicts() {
    const duplicateNames = new Map();
    
    for (const [name, component] of this.components) {
      const key = this.generateComponentKey(component);
      
      if (!duplicateNames.has(key)) {
        duplicateNames.set(key, []);
      }
      
      duplicateNames.get(key).push({ name, component });
    }
    
    // Check for duplicates
    for (const [key, components] of duplicateNames) {
      if (components.length > 1) {
        console.warn(`🔍 Potential duplicate components detected:`, 
          components.map(c => c.name));
      }
    }
  }

  /**
   * Generate component key for duplicate detection
   */
  generateComponentKey(component) {
    // Create a key based on component characteristics
    return `${component.type}:${component.complexity}:${JSON.stringify(component.exports)}`;
  }

  /**
   * Generate unique component ID
   */
  generateComponentId(componentData) {
    const hash = this.simpleHash(JSON.stringify(componentData));
    return `${componentData.name}_${hash}`;
  }

  /**
   * Simple hash function
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Scan and register components from file system
   */
  async scanAndRegisterComponents() {
    // This would need filesystem scanning implementation
    console.log('🔍 Scanning for components...');
    
    // Placeholder for component discovery
    // In a real implementation, this would scan the filesystem
    // and register found components
  }

  /**
   * Get component usage statistics
   */
  getUsageStatistics() {
    const stats = {
      totalComponents: this.components.size,
      mostUsed: null,
      leastUsed: null,
      unused: [],
      totalUsage: 0
    };

    let maxUsage = -1;
    let minUsage = Infinity;

    for (const [name, usage] of this.usage) {
      stats.totalUsage += usage.count;
      
      if (usage.count > maxUsage) {
        maxUsage = usage.count;
        stats.mostUsed = { name, usage: usage.count };
      }
      
      if (usage.count < minUsage) {
        minUsage = usage.count;
        stats.leastUsed = { name, usage: usage.count };
      }
      
      if (usage.count === 0) {
        stats.unused.push(name);
      }
    }

    return stats;
  }

  /**
   * Get component conflicts
   */
  getConflicts() {
    return Array.from(this.conflicts.entries()).map(([name, conflicts]) => ({
      componentName: name,
      conflicts,
      severity: this.calculateConflictSeverity(conflicts)
    }));
  }

  /**
   * Calculate conflict severity
   */
  calculateConflictSeverity(conflicts) {
    if (conflicts.length > 3) return 'critical';
    if (conflicts.length > 1) return 'high';
    return 'medium';
  }

  /**
   * Generate component report
   */
  async generateReport() {
    return {
      timestamp: new Date(),
      summary: {
        totalComponents: this.components.size,
        conflicts: this.conflicts.size,
        monitoring: this.isMonitoring
      },
      usage: this.getUsageStatistics(),
      conflicts: this.getConflicts(),
      components: this.getAllComponents().map(comp => ({
        name: comp.name,
        type: comp.type,
        file: comp.file,
        registeredAt: comp.registeredAt,
        usage: this.usage.get(comp.name)
      }))
    };
  }

  /**
   * Health check for component manager
   */
  async healthCheck() {
    const conflicts = this.getConflicts();
    const criticalConflicts = conflicts.filter(c => c.severity === 'critical');
    
    return {
      status: criticalConflicts.length > 0 ? 'error' : 'ok',
      components: this.components.size,
      conflicts: conflicts.length,
      criticalConflicts: criticalConflicts.length,
      monitoring: this.isMonitoring
    };
  }
}

export default SafeComponentManager;