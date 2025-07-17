/**
 * Component Catalog
 * Maintains a searchable catalog of all registered components
 */

import { frameworkConfig } from '../config/framework.config.js';

export class ComponentCatalog {
  constructor() {
    this.config = frameworkConfig;
    this.catalog = new Map();
    this.categories = new Set();
    this.tags = new Set();
  }

  /**
   * Add component to catalog
   */
  addComponent(name, metadata) {
    const catalogEntry = {
      name,
      ...metadata,
      addedAt: new Date(),
      searchTerms: this.generateSearchTerms(name, metadata)
    };

    this.catalog.set(name, catalogEntry);
    
    // Update categories and tags
    if (metadata.category) {
      this.categories.add(metadata.category);
    }
    if (metadata.tags) {
      metadata.tags.forEach(tag => this.tags.add(tag));
    }

    return catalogEntry;
  }

  /**
   * Remove component from catalog
   */
  removeComponent(name) {
    return this.catalog.delete(name);
  }

  /**
   * Get component from catalog
   */
  getComponent(name) {
    return this.catalog.get(name);
  }

  /**
   * Search components by various criteria
   */
  search(query, options = {}) {
    const {
      category = null,
      tags = [],
      type = null,
      fuzzy = true
    } = options;

    const results = [];
    const searchTermLower = query.toLowerCase();

    for (const [name, component] of this.catalog) {
      let matches = true;

      // Category filter
      if (category && component.category !== category) {
        matches = false;
      }

      // Tags filter
      if (tags.length > 0 && component.tags) {
        const hasMatchingTag = tags.some(tag => component.tags.includes(tag));
        if (!hasMatchingTag) {
          matches = false;
        }
      }

      // Type filter
      if (type && component.type !== type) {
        matches = false;
      }

      // Text search
      if (query && matches) {
        const searchIn = [
          component.name,
          component.description || '',
          ...(component.searchTerms || [])
        ].join(' ').toLowerCase();

        if (fuzzy) {
          // Fuzzy search - check if any word in query matches
          const queryWords = searchTermLower.split(' ');
          const hasMatch = queryWords.some(word => 
            searchIn.includes(word) || 
            this.fuzzyMatch(word, searchIn)
          );
          if (!hasMatch) {
            matches = false;
          }
        } else {
          // Exact search
          if (!searchIn.includes(searchTermLower)) {
            matches = false;
          }
        }
      }

      if (matches) {
        results.push({
          ...component,
          relevanceScore: this.calculateRelevance(query, component)
        });
      }
    }

    // Sort by relevance score
    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Get components by category
   */
  getByCategory(category) {
    return Array.from(this.catalog.values()).filter(
      component => component.category === category
    );
  }

  /**
   * Get components by type
   */
  getByType(type) {
    return Array.from(this.catalog.values()).filter(
      component => component.type === type
    );
  }

  /**
   * Get components by tags
   */
  getByTags(tags) {
    return Array.from(this.catalog.values()).filter(
      component => component.tags && tags.some(tag => component.tags.includes(tag))
    );
  }

  /**
   * Get similar components
   */
  getSimilar(componentName, threshold = 0.7) {
    const targetComponent = this.catalog.get(componentName);
    if (!targetComponent) {
      return [];
    }

    const similar = [];

    for (const [name, component] of this.catalog) {
      if (name === componentName) continue;

      const similarity = this.calculateSimilarity(targetComponent, component);
      if (similarity >= threshold) {
        similar.push({
          ...component,
          similarity
        });
      }
    }

    return similar.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Get all categories
   */
  getCategories() {
    return Array.from(this.categories);
  }

  /**
   * Get all tags
   */
  getTags() {
    return Array.from(this.tags);
  }

  /**
   * Get catalog statistics
   */
  getStats() {
    const stats = {
      totalComponents: this.catalog.size,
      categories: this.categories.size,
      tags: this.tags.size,
      byType: {},
      byCategory: {},
      recentlyAdded: []
    };

    // Count by type
    for (const component of this.catalog.values()) {
      const type = component.type || 'unknown';
      stats.byType[type] = (stats.byType[type] || 0) + 1;
    }

    // Count by category
    for (const component of this.catalog.values()) {
      const category = component.category || 'uncategorized';
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
    }

    // Recently added (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    stats.recentlyAdded = Array.from(this.catalog.values())
      .filter(component => component.addedAt > sevenDaysAgo)
      .sort((a, b) => b.addedAt - a.addedAt);

    return stats;
  }

  /**
   * Export catalog
   */
  export() {
    return {
      catalog: Object.fromEntries(this.catalog),
      categories: Array.from(this.categories),
      tags: Array.from(this.tags),
      stats: this.getStats(),
      exportedAt: new Date()
    };
  }

  /**
   * Import catalog
   */
  import(data) {
    if (data.catalog) {
      this.catalog = new Map(Object.entries(data.catalog));
    }
    if (data.categories) {
      this.categories = new Set(data.categories);
    }
    if (data.tags) {
      this.tags = new Set(data.tags);
    }
    
    console.log('📥 Catalog imported successfully');
  }

  /**
   * Clear catalog
   */
  clear() {
    this.catalog.clear();
    this.categories.clear();
    this.tags.clear();
    console.log('🧹 Catalog cleared');
  }

  // Private helper methods

  /**
   * Generate search terms for a component
   */
  generateSearchTerms(name, metadata) {
    const terms = [name];
    
    if (metadata.description) {
      terms.push(...metadata.description.split(' '));
    }
    
    if (metadata.functionality) {
      terms.push(...metadata.functionality);
    }
    
    if (metadata.props) {
      terms.push(...Object.keys(metadata.props));
    }
    
    if (metadata.methods) {
      terms.push(...metadata.methods);
    }

    // Remove duplicates and empty strings
    return [...new Set(terms.filter(term => term && term.length > 0))];
  }

  /**
   * Calculate relevance score for search results
   */
  calculateRelevance(query, component) {
    let score = 0;
    const queryLower = query.toLowerCase();
    
    // Exact name match gets highest score
    if (component.name.toLowerCase() === queryLower) {
      score += 100;
    } else if (component.name.toLowerCase().includes(queryLower)) {
      score += 50;
    }
    
    // Description match
    if (component.description && component.description.toLowerCase().includes(queryLower)) {
      score += 20;
    }
    
    // Search terms match
    if (component.searchTerms) {
      const matchingTerms = component.searchTerms.filter(term => 
        term.toLowerCase().includes(queryLower)
      );
      score += matchingTerms.length * 10;
    }
    
    return score;
  }

  /**
   * Calculate similarity between two components
   */
  calculateSimilarity(comp1, comp2) {
    let similarity = 0;
    let factors = 0;

    // Type similarity
    if (comp1.type === comp2.type) {
      similarity += 0.3;
    }
    factors += 0.3;

    // Category similarity
    if (comp1.category === comp2.category) {
      similarity += 0.2;
    }
    factors += 0.2;

    // Tags similarity
    if (comp1.tags && comp2.tags) {
      const commonTags = comp1.tags.filter(tag => comp2.tags.includes(tag));
      const allTags = [...new Set([...comp1.tags, ...comp2.tags])];
      similarity += (commonTags.length / allTags.length) * 0.2;
    }
    factors += 0.2;

    // Functionality similarity
    if (comp1.functionality && comp2.functionality) {
      const commonFunc = comp1.functionality.filter(func => 
        comp2.functionality.includes(func)
      );
      const allFunc = [...new Set([...comp1.functionality, ...comp2.functionality])];
      similarity += (commonFunc.length / allFunc.length) * 0.3;
    }
    factors += 0.3;

    return factors > 0 ? similarity / factors : 0;
  }

  /**
   * Simple fuzzy matching
   */
  fuzzyMatch(pattern, text) {
    const patternLength = pattern.length;
    const textLength = text.length;
    
    if (patternLength > textLength) {
      return false;
    }
    
    if (patternLength === textLength) {
      return pattern === text;
    }
    
    outer: for (let i = 0, j = 0; i < patternLength; i++) {
      const patternChar = pattern.charCodeAt(i);
      while (j < textLength) {
        if (text.charCodeAt(j++) === patternChar) {
          continue outer;
        }
      }
      return false;
    }
    
    return true;
  }
}