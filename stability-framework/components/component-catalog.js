/**
 * Component Catalog - Centralized registry of all components
 * Provides discovery, documentation, and validation for components
 */

export class ComponentCatalog {
  constructor(config = {}) {
    this.config = {
      autoDiscovery: true,
      includeDocumentation: true,
      validateOnRegister: true,
      ...config
    };
    
    this.catalog = new Map();
    this.categories = new Map();
    this.tags = new Map();
    this.versions = new Map();
    
    this.initializeDefaultCategories();
  }

  /**
   * Initialize default component categories
   */
  initializeDefaultCategories() {
    const defaultCategories = [
      {
        name: 'layout',
        description: 'Layout and structural components',
        icon: 'layout'
      },
      {
        name: 'forms',
        description: 'Form inputs and validation components',
        icon: 'form'
      },
      {
        name: 'navigation',
        description: 'Navigation and routing components',
        icon: 'navigation'
      },
      {
        name: 'data-display',
        description: 'Data visualization and display components',
        icon: 'chart'
      },
      {
        name: 'feedback',
        description: 'User feedback and notification components',
        icon: 'bell'
      },
      {
        name: 'ui-elements',
        description: 'Basic UI elements and controls',
        icon: 'square'
      },
      {
        name: 'healthcare',
        description: 'Healthcare-specific components',
        icon: 'heart'
      },
      {
        name: 'utilities',
        description: 'Utility and helper components',
        icon: 'tool'
      }
    ];

    defaultCategories.forEach(category => {
      this.categories.set(category.name, category);
    });
  }

  /**
   * Register component in catalog
   */
  registerComponent(component) {
    const catalogEntry = {
      ...component,
      registeredAt: new Date(),
      version: component.version || '1.0.0',
      category: component.category || 'uncategorized',
      tags: component.tags || [],
      documentation: component.documentation || {},
      examples: component.examples || [],
      dependencies: component.dependencies || [],
      props: component.props || {},
      variants: component.variants || [],
      accessibility: component.accessibility || {}
    };

    // Validate if enabled
    if (this.config.validateOnRegister) {
      this.validateComponent(catalogEntry);
    }

    this.catalog.set(component.name, catalogEntry);
    this.indexComponent(catalogEntry);
    
    console.log(`📚 Component cataloged: ${component.name}`);
  }

  /**
   * Index component for search and filtering
   */
  indexComponent(component) {
    // Index by category
    if (!this.categories.has(component.category)) {
      this.categories.set(component.category, {
        name: component.category,
        description: `Auto-generated category: ${component.category}`,
        components: []
      });
    }
    
    const category = this.categories.get(component.category);
    if (!category.components) category.components = [];
    category.components.push(component.name);

    // Index by tags
    component.tags.forEach(tag => {
      if (!this.tags.has(tag)) {
        this.tags.set(tag, []);
      }
      this.tags.get(tag).push(component.name);
    });

    // Index by version
    if (!this.versions.has(component.version)) {
      this.versions.set(component.version, []);
    }
    this.versions.get(component.version).push(component.name);
  }

  /**
   * Validate component structure
   */
  validateComponent(component) {
    const requiredFields = ['name', 'type', 'file'];
    const issues = [];

    // Check required fields
    requiredFields.forEach(field => {
      if (!component[field]) {
        issues.push(`Missing required field: ${field}`);
      }
    });

    // Validate props structure
    if (component.props && typeof component.props !== 'object') {
      issues.push('Props must be an object');
    }

    // Validate examples
    if (component.examples && !Array.isArray(component.examples)) {
      issues.push('Examples must be an array');
    }

    // Validate accessibility
    if (component.accessibility) {
      const a11yRequired = ['ariaLabel', 'keyboardSupport', 'screenReaderSupport'];
      a11yRequired.forEach(field => {
        if (!(field in component.accessibility)) {
          issues.push(`Missing accessibility field: ${field}`);
        }
      });
    }

    if (issues.length > 0) {
      console.warn(`⚠️ Component validation issues for ${component.name}:`, issues);
    }

    return issues;
  }

  /**
   * Search components
   */
  search(query, filters = {}) {
    const results = [];
    const queryLower = query.toLowerCase();

    for (const [name, component] of this.catalog) {
      let matches = false;

      // Search in name
      if (name.toLowerCase().includes(queryLower)) {
        matches = true;
      }

      // Search in description
      if (component.description && 
          component.description.toLowerCase().includes(queryLower)) {
        matches = true;
      }

      // Search in tags
      if (component.tags.some(tag => 
          tag.toLowerCase().includes(queryLower))) {
        matches = true;
      }

      // Apply filters
      if (matches && this.matchesFilters(component, filters)) {
        results.push({
          ...component,
          relevance: this.calculateRelevance(component, queryLower)
        });
      }
    }

    // Sort by relevance
    return results.sort((a, b) => b.relevance - a.relevance);
  }

  /**
   * Check if component matches filters
   */
  matchesFilters(component, filters) {
    if (filters.category && component.category !== filters.category) {
      return false;
    }

    if (filters.tags && !filters.tags.some(tag => 
        component.tags.includes(tag))) {
      return false;
    }

    if (filters.type && component.type !== filters.type) {
      return false;
    }

    if (filters.version && component.version !== filters.version) {
      return false;
    }

    return true;
  }

  /**
   * Calculate search relevance score
   */
  calculateRelevance(component, query) {
    let score = 0;

    // Exact name match gets highest score
    if (component.name.toLowerCase() === query) {
      score += 100;
    } else if (component.name.toLowerCase().includes(query)) {
      score += 50;
    }

    // Description matches
    if (component.description && 
        component.description.toLowerCase().includes(query)) {
      score += 25;
    }

    // Tag matches
    component.tags.forEach(tag => {
      if (tag.toLowerCase().includes(query)) {
        score += 10;
      }
    });

    return score;
  }

  /**
   * Get component by name
   */
  getComponent(name) {
    return this.catalog.get(name);
  }

  /**
   * Get components by category
   */
  getComponentsByCategory(categoryName) {
    const category = this.categories.get(categoryName);
    if (!category || !category.components) return [];

    return category.components.map(name => this.catalog.get(name));
  }

  /**
   * Get components by tag
   */
  getComponentsByTag(tag) {
    const componentNames = this.tags.get(tag) || [];
    return componentNames.map(name => this.catalog.get(name));
  }

  /**
   * Get all categories
   */
  getCategories() {
    return Array.from(this.categories.values());
  }

  /**
   * Get all tags
   */
  getTags() {
    return Array.from(this.tags.keys());
  }

  /**
   * Get component documentation
   */
  getDocumentation(componentName) {
    const component = this.getComponent(componentName);
    if (!component) return null;

    return {
      name: component.name,
      description: component.description,
      props: component.props,
      examples: component.examples,
      variants: component.variants,
      accessibility: component.accessibility,
      dependencies: component.dependencies,
      category: component.category,
      tags: component.tags,
      version: component.version
    };
  }

  /**
   * Generate component usage examples
   */
  generateUsageExamples(componentName) {
    const component = this.getComponent(componentName);
    if (!component) return [];

    const examples = [];

    // Basic usage example
    examples.push({
      title: 'Basic Usage',
      code: this.generateBasicUsage(component),
      description: `Basic implementation of ${component.name}`
    });

    // Props examples
    if (component.props && Object.keys(component.props).length > 0) {
      examples.push({
        title: 'With Props',
        code: this.generatePropsUsage(component),
        description: `${component.name} with common props`
      });
    }

    // Variant examples
    component.variants.forEach(variant => {
      examples.push({
        title: `Variant: ${variant.name}`,
        code: this.generateVariantUsage(component, variant),
        description: variant.description || `${component.name} ${variant.name} variant`
      });
    });

    return examples;
  }

  /**
   * Generate basic usage code
   */
  generateBasicUsage(component) {
    return `<${component.name} />`;
  }

  /**
   * Generate props usage code
   */
  generatePropsUsage(component) {
    const propExamples = Object.entries(component.props)
      .slice(0, 3) // Limit to first 3 props
      .map(([propName, propConfig]) => {
        const exampleValue = this.generatePropExample(propConfig);
        return `${propName}={${exampleValue}}`;
      })
      .join('\n  ');

    return `<${component.name}\n  ${propExamples}\n/>`;
  }

  /**
   * Generate variant usage code
   */
  generateVariantUsage(component, variant) {
    const variantProps = variant.props || {};
    const propStrings = Object.entries(variantProps)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');

    return `<${component.name} ${propStrings} />`;
  }

  /**
   * Generate example value for prop
   */
  generatePropExample(propConfig) {
    switch (propConfig.type) {
      case 'string':
        return `"${propConfig.example || 'example'}"`;
      case 'number':
        return propConfig.example || 42;
      case 'boolean':
        return propConfig.example || true;
      case 'function':
        return '() => {}';
      case 'object':
        return '{}';
      case 'array':
        return '[]';
      default:
        return '"example"';
    }
  }

  /**
   * Get catalog statistics
   */
  getStatistics() {
    const categories = {};
    const types = {};
    let totalComponents = 0;

    for (const component of this.catalog.values()) {
      totalComponents++;
      
      categories[component.category] = (categories[component.category] || 0) + 1;
      types[component.type] = (types[component.type] || 0) + 1;
    }

    return {
      totalComponents,
      totalCategories: this.categories.size,
      totalTags: this.tags.size,
      categories,
      types,
      avgPropsPerComponent: this.calculateAverageProps(),
      mostUsedTags: this.getMostUsedTags(5)
    };
  }

  /**
   * Calculate average props per component
   */
  calculateAverageProps() {
    let totalProps = 0;
    let componentCount = 0;

    for (const component of this.catalog.values()) {
      if (component.props) {
        totalProps += Object.keys(component.props).length;
        componentCount++;
      }
    }

    return componentCount > 0 ? totalProps / componentCount : 0;
  }

  /**
   * Get most used tags
   */
  getMostUsedTags(limit = 10) {
    return Array.from(this.tags.entries())
      .map(([tag, components]) => ({
        tag,
        count: components.length
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Export catalog data
   */
  export() {
    return {
      catalog: Array.from(this.catalog.values()),
      categories: Array.from(this.categories.values()),
      metadata: {
        exportedAt: new Date(),
        version: '1.0.0',
        componentCount: this.catalog.size
      }
    };
  }

  /**
   * Import catalog data
   */
  import(data) {
    this.catalog.clear();
    this.categories.clear();
    this.tags.clear();
    this.versions.clear();

    // Import categories
    if (data.categories) {
      data.categories.forEach(category => {
        this.categories.set(category.name, category);
      });
    }

    // Import components
    if (data.catalog) {
      data.catalog.forEach(component => {
        this.registerComponent(component);
      });
    }

    console.log(`📥 Catalog imported: ${this.catalog.size} components`);
  }
}

export default ComponentCatalog;