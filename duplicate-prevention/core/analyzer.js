/**
 * Duplicate Prevention - Core Analyzer
 * Prevents creation of duplicate components, services, and modules
 * Integrates with stability framework for comprehensive protection
 */

import { DuplicateDetector } from '../../src/utils/verification/DuplicateDetector.ts';
import { MockDataDetector } from '../../src/utils/verification/MockDataDetector.ts';

export class DuplicationAnalyzer {
  constructor(config = {}) {
    this.config = {
      enableRealTimeAnalysis: true,
      preventMockData: true,
      enforceDatabaseUsage: true,
      ...config
    };
    
    this.duplicateDetector = new DuplicateDetector();
    this.registeredComponents = new Map();
    this.analysisResults = new Map();
    
    this.initialize();
  }

  async initialize() {
    console.log('🔍 Initializing Duplicate Prevention Analyzer...');
    
    // Register existing components for analysis
    await this.scanExistingComponents();
    
    if (this.config.preventMockData) {
      await this.validateNoMockData();
    }
    
    console.log('✅ Duplicate Prevention Analyzer ready');
  }

  async scanExistingComponents() {
    // Scan for existing components to build registry
    const components = await this.getExistingComponents();
    
    for (const component of components) {
      this.registeredComponents.set(component.name, {
        ...component,
        registeredAt: new Date().toISOString(),
        hash: this.generateComponentHash(component)
      });
    }
    
    console.log(`📊 Registered ${components.length} existing components`);
  }

  async validateNoMockData() {
    console.log('🔍 Validating no mock/test/seed data usage...');
    
    const analysis = await MockDataDetector.analyzeMockDataUsage();
    
    if (analysis.violations.length > 0) {
      console.warn('⚠️ Mock data violations detected:', analysis.violations);
      
      // Store violations for reporting
      this.analysisResults.set('mockData', {
        violations: analysis.violations,
        timestamp: new Date().toISOString(),
        severity: 'high'
      });
    } else {
      console.log('✅ No mock data violations found');
    }
    
    return analysis;
  }

  async analyzeForDuplicates(componentName, metadata) {
    console.log(`🔍 Analyzing component "${componentName}" for duplicates...`);
    
    // Check for exact matches
    const existingComponent = this.registeredComponents.get(componentName);
    if (existingComponent) {
      return {
        isDuplicate: true,
        type: 'exact_name_match',
        existing: existingComponent,
        recommendation: `Component "${componentName}" already exists. Use existing implementation or choose different name.`
      };
    }
    
    // Check for functional duplicates
    const functionalDuplicates = await this.findFunctionalDuplicates(metadata);
    if (functionalDuplicates.length > 0) {
      return {
        isDuplicate: true,
        type: 'functional_duplicate',
        duplicates: functionalDuplicates,
        recommendation: `Similar functionality found in: ${functionalDuplicates.map(d => d.name).join(', ')}. Consider extending existing components.`
      };
    }
    
    // Component is unique
    return {
      isDuplicate: false,
      type: 'unique',
      recommendation: `Component "${componentName}" appears unique. Safe to create.`
    };
  }

  async findFunctionalDuplicates(metadata) {
    const duplicates = [];
    
    for (const [name, component] of this.registeredComponents) {
      const similarity = this.calculateSimilarity(metadata, component);
      
      if (similarity > 0.8) {
        duplicates.push({
          name,
          similarity,
          component
        });
      }
    }
    
    return duplicates.sort((a, b) => b.similarity - a.similarity);
  }

  calculateSimilarity(metadata1, metadata2) {
    let score = 0;
    let factors = 0;
    
    // Compare functionality
    if (metadata1.functionality && metadata2.functionality) {
      const funcSimilarity = this.stringSimilarity(metadata1.functionality, metadata2.functionality);
      score += funcSimilarity;
      factors++;
    }
    
    // Compare props/interface
    if (metadata1.props && metadata2.props) {
      const propSimilarity = this.arrayOverlap(metadata1.props, metadata2.props);
      score += propSimilarity;
      factors++;
    }
    
    // Compare category/type
    if (metadata1.category && metadata2.category) {
      score += metadata1.category === metadata2.category ? 1 : 0;
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
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  generateComponentHash(component) {
    // Generate a simple hash for component comparison
    const content = JSON.stringify({
      name: component.name,
      functionality: component.functionality,
      props: component.props?.sort(),
      category: component.category
    });
    
    return this.simpleHash(content);
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  async getExistingComponents() {
    // In a real implementation, this would scan the filesystem
    // For now, return a basic set based on known components
    return [
      {
        name: 'UserManagement',
        functionality: 'manage users, create, update, delete users',
        category: 'data-management',
        props: ['users', 'onUserCreate', 'onUserUpdate', 'onUserDelete']
      },
      {
        name: 'DataImport',
        functionality: 'import data from various sources',
        category: 'data-processing',
        props: ['onImport', 'acceptedFormats', 'validateData']
      },
      {
        name: 'HealthcareDashboard',
        functionality: 'healthcare data visualization and management',
        category: 'healthcare',
        props: ['patients', 'facilities', 'onPatientSelect']
      }
    ];
  }

  getAnalysisReport() {
    return {
      timestamp: new Date().toISOString(),
      totalComponents: this.registeredComponents.size,
      analysisResults: Object.fromEntries(this.analysisResults),
      recommendations: this.generateRecommendations()
    };
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Check for mock data violations
    if (this.analysisResults.has('mockData')) {
      recommendations.push({
        type: 'mock_data_removal',
        priority: 'high',
        message: 'Remove all mock/test/seed data and use real database connections'
      });
    }
    
    // Add component consolidation recommendations
    if (this.registeredComponents.size > 50) {
      recommendations.push({
        type: 'component_consolidation',
        priority: 'medium',
        message: 'Consider consolidating similar components to reduce complexity'
      });
    }
    
    return recommendations;
  }
}

export default DuplicationAnalyzer;