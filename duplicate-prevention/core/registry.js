/**
 * Component Registry - Central registry for all application components
 * Prevents duplicates and enforces consistency
 */

export class ComponentRegistry {
  constructor() {
    this.components = new Map();
    this.services = new Map();
    this.hooks = new Map();
    this.types = new Map();
    
    this.watchers = new Set();
    this.locked = false;
  }

  // Component Registration
  registerComponent(name, metadata) {
    if (this.locked) {
      throw new Error('Registry is locked - no new registrations allowed');
    }
    
    this.validateRegistration('component', name, metadata);
    
    const entry = {
      ...metadata,
      type: 'component',
      registeredAt: new Date().toISOString(),
      id: this.generateId(name)
    };
    
    this.components.set(name, entry);
    this.notifyWatchers('component_registered', { name, entry });
    
    console.log(`📝 Registered component: ${name}`);
    return entry;
  }

  // Service Registration
  registerService(name, metadata) {
    if (this.locked) {
      throw new Error('Registry is locked - no new registrations allowed');
    }
    
    this.validateRegistration('service', name, metadata);
    
    const entry = {
      ...metadata,
      type: 'service',
      registeredAt: new Date().toISOString(),
      id: this.generateId(name)
    };
    
    this.services.set(name, entry);
    this.notifyWatchers('service_registered', { name, entry });
    
    console.log(`📝 Registered service: ${name}`);
    return entry;
  }

  // Hook Registration
  registerHook(name, metadata) {
    if (this.locked) {
      throw new Error('Registry is locked - no new registrations allowed');
    }
    
    this.validateRegistration('hook', name, metadata);
    
    const entry = {
      ...metadata,
      type: 'hook',
      registeredAt: new Date().toISOString(),
      id: this.generateId(name)
    };
    
    this.hooks.set(name, entry);
    this.notifyWatchers('hook_registered', { name, entry });
    
    console.log(`📝 Registered hook: ${name}`);
    return entry;
  }

  // Type Registration
  registerType(name, definition) {
    if (this.locked) {
      throw new Error('Registry is locked - no new registrations allowed');
    }
    
    const entry = {
      definition,
      type: 'type',
      registeredAt: new Date().toISOString(),
      id: this.generateId(name)
    };
    
    this.types.set(name, entry);
    this.notifyWatchers('type_registered', { name, entry });
    
    console.log(`📝 Registered type: ${name}`);
    return entry;
  }

  validateRegistration(type, name, metadata) {
    // Check for duplicates
    const registry = this.getRegistry(type);
    if (registry.has(name)) {
      throw new Error(`Duplicate ${type} registration: ${name} already exists`);
    }
    
    // Validate metadata completeness
    this.validateMetadata(type, metadata);
    
    // Check for functional duplicates
    this.checkFunctionalDuplicates(type, name, metadata);
  }

  validateMetadata(type, metadata) {
    const requiredFields = {
      component: ['filePath', 'category'],
      service: ['filePath', 'methods'],
      hook: ['filePath', 'returns'],
      type: ['definition']
    };
    
    const required = requiredFields[type] || [];
    
    for (const field of required) {
      if (!metadata[field]) {
        throw new Error(`Missing required field "${field}" for ${type} registration`);
      }
    }
  }

  checkFunctionalDuplicates(type, name, metadata) {
    const registry = this.getRegistry(type);
    
    for (const [existingName, existingEntry] of registry) {
      const similarity = this.calculateSimilarity(metadata, existingEntry);
      
      if (similarity > 0.9) {
        console.warn(`⚠️ High similarity detected between ${name} and ${existingName} (${Math.round(similarity * 100)}%)`);
        
        throw new Error(
          `Potential duplicate functionality detected. ` +
          `${name} is ${Math.round(similarity * 100)}% similar to existing ${existingName}. ` +
          `Consider extending existing implementation or choosing different approach.`
        );
      }
    }
  }

  calculateSimilarity(metadata1, metadata2) {
    let score = 0;
    let factors = 0;

    // Compare categories
    if (metadata1.category && metadata2.category) {
      score += metadata1.category === metadata2.category ? 1 : 0;
      factors++;
    }

    // Compare functionality descriptions
    if (metadata1.functionality && metadata2.functionality) {
      const funcSimilarity = this.stringSimilarity(metadata1.functionality, metadata2.functionality);
      score += funcSimilarity;
      factors++;
    }

    // Compare methods/props
    if (metadata1.methods && metadata2.methods) {
      const methodSimilarity = this.arrayOverlap(metadata1.methods, metadata2.methods);
      score += methodSimilarity;
      factors++;
    }

    if (metadata1.props && metadata2.props) {
      const propSimilarity = this.arrayOverlap(metadata1.props, metadata2.props);
      score += propSimilarity;
      factors++;
    }

    return factors > 0 ? score / factors : 0;
  }

  stringSimilarity(str1, str2) {
    const words1 = str1.toLowerCase().split(/\W+/);
    const words2 = str2.toLowerCase().split(/\W+/);
    return this.arrayOverlap(words1, words2);
  }

  arrayOverlap(arr1, arr2) {
    if (!arr1 || !arr2 || arr1.length === 0 || arr2.length === 0) return 0;
    
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  getRegistry(type) {
    switch (type) {
      case 'component': return this.components;
      case 'service': return this.services;
      case 'hook': return this.hooks;
      case 'type': return this.types;
      default: throw new Error(`Unknown registry type: ${type}`);
    }
  }

  generateId(name) {
    return `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Query Methods
  findComponent(name) {
    return this.components.get(name);
  }

  findService(name) {
    return this.services.get(name);
  }

  findHook(name) {
    return this.hooks.get(name);
  }

  findType(name) {
    return this.types.get(name);
  }

  findByCategory(category) {
    const results = [];
    
    for (const [name, entry] of this.components) {
      if (entry.category === category) {
        results.push({ name, ...entry });
      }
    }
    
    return results;
  }

  findSimilar(type, functionality) {
    const registry = this.getRegistry(type);
    const similar = [];
    
    for (const [name, entry] of registry) {
      if (entry.functionality) {
        const similarity = this.stringSimilarity(functionality, entry.functionality);
        if (similarity > 0.5) {
          similar.push({
            name,
            similarity,
            entry
          });
        }
      }
    }
    
    return similar.sort((a, b) => b.similarity - a.similarity);
  }

  // Registry Management
  lock() {
    this.locked = true;
    console.log('🔒 Registry locked - no new registrations allowed');
  }

  unlock() {
    this.locked = false;
    console.log('🔓 Registry unlocked - registrations allowed');
  }

  clear() {
    this.components.clear();
    this.services.clear();
    this.hooks.clear();
    this.types.clear();
    console.log('🗑️ Registry cleared');
  }

  // Watchers
  addWatcher(callback) {
    this.watchers.add(callback);
  }

  removeWatcher(callback) {
    this.watchers.delete(callback);
  }

  notifyWatchers(event, data) {
    for (const watcher of this.watchers) {
      try {
        watcher(event, data);
      } catch (error) {
        console.error('Watcher error:', error);
      }
    }
  }

  // Statistics
  getStats() {
    return {
      components: this.components.size,
      services: this.services.size,
      hooks: this.hooks.size,
      types: this.types.size,
      total: this.components.size + this.services.size + this.hooks.size + this.types.size,
      locked: this.locked
    };
  }

  generateReport() {
    return {
      timestamp: new Date().toISOString(),
      stats: this.getStats(),
      components: Array.from(this.components.entries()).map(([name, entry]) => ({
        name,
        category: entry.category,
        filePath: entry.filePath,
        registeredAt: entry.registeredAt
      })),
      services: Array.from(this.services.entries()).map(([name, entry]) => ({
        name,
        methods: entry.methods?.length || 0,
        filePath: entry.filePath,
        registeredAt: entry.registeredAt
      })),
      hooks: Array.from(this.hooks.entries()).map(([name, entry]) => ({
        name,
        returns: entry.returns,
        filePath: entry.filePath,
        registeredAt: entry.registeredAt
      })),
      types: Array.from(this.types.entries()).map(([name, entry]) => ({
        name,
        registeredAt: entry.registeredAt
      }))
    };
  }
}

export default ComponentRegistry;