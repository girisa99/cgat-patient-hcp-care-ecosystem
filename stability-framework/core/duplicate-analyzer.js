/**
 * Duplicate Analyzer - Core component for detecting duplicates
 */

export class DuplicateAnalyzer {
  constructor() {
    this.componentRegistry = new Map();
    this.serviceRegistry = new Map();
    this.typeRegistry = new Map();
  }

  registerComponent(name, metadata) {
    this.componentRegistry.set(name, {
      ...metadata,
      registeredAt: new Date().toISOString()
    });
  }

  registerService(name, metadata) {
    this.serviceRegistry.set(name, {
      ...metadata,
      registeredAt: new Date().toISOString()
    });
  }

  registerType(name, definition) {
    this.typeRegistry.set(name, {
      ...definition,
      registeredAt: new Date().toISOString()
    });
  }

  async analyzeComponent(name, metadata) {
    const similar = this.findSimilarComponents(name, metadata);
    const isDuplicate = this.checkExactDuplicate(name, metadata, 'component');
    
    return {
      isDuplicate,
      type: isDuplicate ? 'exact' : 'none',
      similar,
      recommendation: this.generateRecommendation(name, similar, isDuplicate, 'component')
    };
  }

  async analyzeService(name, metadata) {
    const similar = this.findSimilarServices(name, metadata);
    const isDuplicate = this.checkExactDuplicate(name, metadata, 'service');
    
    return {
      isDuplicate,
      type: isDuplicate ? 'exact' : 'none',
      similar,
      recommendation: this.generateRecommendation(name, similar, isDuplicate, 'service')
    };
  }

  findSimilarComponents(name, metadata) {
    const similar = [];
    
    for (const [existingName, existingMetadata] of this.componentRegistry) {
      if (existingName === name) continue;
      
      const similarity = this.calculateSimilarity(metadata, existingMetadata);
      if (similarity > 0.6) {
        similar.push({
          name: existingName,
          similarity,
          metadata: existingMetadata
        });
      }
    }
    
    return similar.sort((a, b) => b.similarity - a.similarity);
  }

  findSimilarServices(name, metadata) {
    const similar = [];
    
    for (const [existingName, existingMetadata] of this.serviceRegistry) {
      if (existingName === name) continue;
      
      const similarity = this.calculateSimilarity(metadata, existingMetadata);
      if (similarity > 0.7) {
        similar.push({
          name: existingName,
          similarity,
          metadata: existingMetadata
        });
      }
    }
    
    return similar.sort((a, b) => b.similarity - a.similarity);
  }

  calculateSimilarity(metadata1, metadata2) {
    let similarities = [];
    
    // Compare props/methods
    if (metadata1.props && metadata2.props) {
      const propsSimilarity = this.calculateArraySimilarity(metadata1.props, metadata2.props);
      similarities.push(propsSimilarity);
    }
    
    if (metadata1.methods && metadata2.methods) {
      const methodsSimilarity = this.calculateArraySimilarity(metadata1.methods, metadata2.methods);
      similarities.push(methodsSimilarity);
    }
    
    // Compare functionality description
    if (metadata1.functionality && metadata2.functionality) {
      const functionalitySimilarity = this.calculateStringSimilarity(
        metadata1.functionality, 
        metadata2.functionality
      );
      similarities.push(functionalitySimilarity);
    }
    
    // Compare categories
    if (metadata1.category && metadata2.category) {
      similarities.push(metadata1.category === metadata2.category ? 1 : 0);
    }
    
    return similarities.length > 0 ? 
      similarities.reduce((a, b) => a + b) / similarities.length : 
      0;
  }

  calculateArraySimilarity(arr1, arr2) {
    if (!arr1 || !arr2 || arr1.length === 0 || arr2.length === 0) return 0;
    
    const intersection = arr1.filter(item => arr2.includes(item));
    const union = [...new Set([...arr1, ...arr2])];
    
    return intersection.length / union.length;
  }

  calculateStringSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;
    
    const words1 = str1.toLowerCase().split(/\s+/);
    const words2 = str2.toLowerCase().split(/\s+/);
    
    return this.calculateArraySimilarity(words1, words2);
  }

  checkExactDuplicate(name, metadata, type) {
    const registry = type === 'component' ? this.componentRegistry : this.serviceRegistry;
    
    for (const [existingName, existingMetadata] of registry) {
      if (existingName === name) continue;
      
      // Check for exact functionality match
      if (this.calculateSimilarity(metadata, existingMetadata) > 0.95) {
        return true;
      }
    }
    
    return false;
  }

  generateRecommendation(name, similar, isDuplicate, type) {
    if (isDuplicate) {
      return `Remove duplicate ${type} '${name}' and use existing implementation`;
    }
    
    if (similar.length > 0) {
      const mostSimilar = similar[0];
      const percentage = Math.round(mostSimilar.similarity * 100);
      return `Consider extending or composing with '${mostSimilar.name}' (${percentage}% similar)`;
    }
    
    return `${type.charAt(0).toUpperCase() + type.slice(1)} appears unique - no action needed`;
  }

  generateReport() {
    return {
      timestamp: new Date().toISOString(),
      components: {
        total: this.componentRegistry.size,
        details: Array.from(this.componentRegistry.entries()).map(([name, metadata]) => ({
          name,
          category: metadata.category,
          filePath: metadata.filePath
        }))
      },
      services: {
        total: this.serviceRegistry.size,
        details: Array.from(this.serviceRegistry.entries()).map(([name, metadata]) => ({
          name,
          methods: metadata.methods?.length || 0,
          filePath: metadata.filePath
        }))
      },
      types: {
        total: this.typeRegistry.size,
        details: Array.from(this.typeRegistry.entries()).map(([name, definition]) => ({
          name,
          type: definition.type
        }))
      }
    };
  }

  clear() {
    this.componentRegistry.clear();
    this.serviceRegistry.clear();
    this.typeRegistry.clear();
  }

  getStats() {
    return {
      totalDuplicates: this.getTotalDuplicates(),
      components: this.componentRegistry.size,
      services: this.serviceRegistry.size,
      types: this.typeRegistry.size
    };
  }

  getTotalDuplicates() {
    // This would be calculated based on analysis results
    // For now, return a simple count
    return 0;
  }
}