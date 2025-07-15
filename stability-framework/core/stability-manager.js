/**
 * Stability Manager - Core stability framework management
 */

import { DuplicateAnalyzer } from './duplicate-analyzer.js';
import { frameworkConfig } from '../config/framework.config.js';

export class StabilityManager {
  constructor(config = {}) {
    this.config = { ...frameworkConfig, ...config };
    this.duplicateAnalyzer = new DuplicateAnalyzer();
    this.issues = [];
    this.warnings = [];
    this.isInitialized = false;
  }

  async initialize() {
    console.log('🚀 Initializing Stability Framework...');
    
    try {
      await this.validateConfiguration();
      await this.initializeAnalyzers();
      
      this.isInitialized = true;
      console.log('✅ Stability Framework initialized successfully');
      
      return {
        success: true,
        message: 'Framework initialized',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Failed to initialize Stability Framework:', error);
      throw error;
    }
  }

  async validateConfiguration() {
    if (!this.config.componentCategories) {
      throw new Error('Component categories configuration missing');
    }
    
    if (!this.config.servicePatterns) {
      throw new Error('Service patterns configuration missing');
    }
    
    if (!this.config.codebase?.scanPaths) {
      throw new Error('Codebase scan paths configuration missing');
    }
  }

  async initializeAnalyzers() {
    // Initialize duplicate analyzer with config
    this.duplicateAnalyzer.clear();
  }

  async analyzeCodebase(paths = null) {
    if (!this.isInitialized) {
      throw new Error('Stability Manager not initialized');
    }

    const scanPaths = paths || this.config.codebase.scanPaths;
    console.log('📁 Analyzing codebase...');
    
    const analysis = {
      components: [],
      services: [],
      duplicates: [],
      namingViolations: [],
      timestamp: new Date().toISOString()
    };

    try {
      // Scan all specified paths
      for (const scanPath of scanPaths) {
        await this.scanPath(scanPath, analysis);
      }

      // Analyze for duplicates
      await this.performDuplicateAnalysis(analysis);
      
      // Validate naming conventions
      await this.validateNamingConventions(analysis);
      
      return analysis;
    } catch (error) {
      console.error('❌ Codebase analysis failed:', error);
      throw error;
    }
  }

  async scanPath(pattern, analysis) {
    const glob = await import('glob');
    const fs = await import('fs/promises');
    const path = await import('path');
    
    try {
      const files = await glob.glob(pattern, { 
        ignore: this.config.codebase.excludePaths || [] 
      });
      
      for (const file of files) {
        const content = await fs.readFile(file, 'utf-8');
        const fileType = this.determineFileType(file);
        
        switch (fileType) {
          case 'component':
            const component = this.analyzeComponentFile(file, content);
            analysis.components.push(component);
            this.duplicateAnalyzer.registerComponent(component.name, component.metadata);
            break;
            
          case 'service':
            const service = this.analyzeServiceFile(file, content);
            analysis.services.push(service);
            this.duplicateAnalyzer.registerService(service.name, service.metadata);
            break;
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not scan path ${pattern}:`, error.message);
    }
  }

  determineFileType(filePath) {
    if (filePath.includes('/components/') && /\.(tsx?|jsx?)$/.test(filePath)) {
      return 'component';
    }
    if (filePath.includes('/services/') && /\.ts$/.test(filePath)) {
      return 'service';
    }
    if (filePath.includes('/hooks/') && /\.ts$/.test(filePath)) {
      return 'hook';
    }
    if (filePath.includes('/types/') && /\.ts$/.test(filePath)) {
      return 'type';
    }
    return 'unknown';
  }

  analyzeComponentFile(filePath, content) {
    const path = require('path');
    const name = path.basename(filePath).replace(/\.(tsx?|jsx?)$/, '');
    
    const metadata = {
      filePath,
      props: this.extractProps(content),
      category: this.determineComponentCategory(content),
      functionality: this.extractFunctionality(content),
      hasStateManagement: content.includes('useState') || content.includes('useReducer'),
      hasEffects: content.includes('useEffect'),
      complexity: this.calculateComplexity(content)
    };

    return { name, metadata };
  }

  analyzeServiceFile(filePath, content) {
    const path = require('path');
    const name = path.basename(filePath).replace(/\.ts$/, '');
    
    const metadata = {
      filePath,
      methods: this.extractMethods(content),
      dependencies: this.extractDependencies(content),
      isAsync: content.includes('async'),
      hasErrorHandling: content.includes('try') && content.includes('catch'),
      complexity: this.calculateComplexity(content)
    };

    return { name, metadata };
  }

  extractProps(content) {
    const propsMatch = content.match(/interface\s+\w*Props\s*{([^}]+)}/);
    if (propsMatch) {
      return propsMatch[1]
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('//'))
        .map(line => line.split(':')[0].trim().replace('?', ''));
    }
    return [];
  }

  extractMethods(content) {
    const methodMatches = content.match(/(?:public|private|async)?\s*(\w+)\s*\(/g);
    return methodMatches ? 
      methodMatches.map(match => match.replace(/(?:public|private|async)?\s*(\w+)\s*\(/, '$1')) : 
      [];
  }

  extractDependencies(content) {
    const importMatches = content.match(/import\s+{[^}]+}\s+from\s+['"][^'"]+['"]/g);
    return importMatches ? 
      importMatches.map(match => match.match(/from\s+['"]([^'"]+)['"]/)[1]) : 
      [];
  }

  extractFunctionality(content) {
    // Extract JSDoc comments or infer from component structure
    const jsdocMatch = content.match(/\/\*\*\s*\n\s*\*\s*([^\n]+)/);
    if (jsdocMatch) {
      return jsdocMatch[1].trim();
    }
    
    // Infer from component structure
    if (content.includes('form') || content.includes('Form')) {
      return 'Form component for user input';
    }
    if (content.includes('modal') || content.includes('Modal')) {
      return 'Modal component for dialogs';
    }
    if (content.includes('button') || content.includes('Button')) {
      return 'Button component for user actions';
    }
    
    return 'Component functionality to be documented';
  }

  determineComponentCategory(content) {
    if (content.includes('form') || content.includes('Form')) return 'forms';
    if (content.includes('layout') || content.includes('Layout')) return 'layouts';
    if (content.includes('modal') || content.includes('Modal')) return 'ui';
    return 'ui';
  }

  calculateComplexity(content) {
    const lines = content.split('\n').length;
    const conditions = (content.match(/if\s*\(/g) || []).length;
    const loops = (content.match(/for\s*\(|while\s*\(|map\s*\(/g) || []).length;
    
    return Math.min(10, Math.floor((lines + conditions * 2 + loops * 2) / 10));
  }

  async performDuplicateAnalysis(analysis) {
    console.log('🔍 Analyzing for duplicates...');
    
    // Analyze components
    for (const component of analysis.components) {
      const duplicateAnalysis = await this.duplicateAnalyzer.analyzeComponent(
        component.name, 
        component.metadata
      );
      
      if (duplicateAnalysis.isDuplicate) {
        analysis.duplicates.push({
          type: 'component',
          name: component.name,
          analysis: duplicateAnalysis
        });
      }
    }
    
    // Analyze services
    for (const service of analysis.services) {
      const duplicateAnalysis = await this.duplicateAnalyzer.analyzeService(
        service.name, 
        service.metadata
      );
      
      if (duplicateAnalysis.isDuplicate) {
        analysis.duplicates.push({
          type: 'service',
          name: service.name,
          analysis: duplicateAnalysis
        });
      }
    }
  }

  async validateNamingConventions(analysis) {
    console.log('📝 Validating naming conventions...');
    
    // Validate component naming
    for (const component of analysis.components) {
      const category = component.metadata.category || 'ui';
      const pattern = this.config.componentCategories[category]?.namingPattern;
      
      if (pattern && !pattern.test(component.name)) {
        analysis.namingViolations.push({
          type: 'component',
          name: component.name,
          category,
          issue: `Does not match ${category} naming pattern`,
          file: component.metadata.filePath
        });
      }
    }
    
    // Validate service naming
    for (const service of analysis.services) {
      const pattern = this.config.servicePatterns.naming;
      
      if (pattern && !pattern.test(service.name)) {
        analysis.namingViolations.push({
          type: 'service',
          name: service.name,
          issue: 'Does not match service naming pattern',
          file: service.metadata.filePath
        });
      }
    }
  }

  async generateReport() {
    if (!this.isInitialized) {
      throw new Error('Stability Manager not initialized');
    }

    const analysis = await this.analyzeCodebase();
    const duplicateReport = this.duplicateAnalyzer.generateReport();
    
    return {
      timestamp: new Date().toISOString(),
      summary: {
        components: analysis.components.length,
        services: analysis.services.length,
        duplicates: analysis.duplicates.length,
        namingViolations: analysis.namingViolations.length,
        overallHealth: this.calculateOverallHealth(analysis)
      },
      analysis,
      duplicateReport,
      recommendations: this.generateRecommendations(analysis)
    };
  }

  calculateOverallHealth(analysis) {
    const totalItems = analysis.components.length + analysis.services.length;
    const issues = analysis.duplicates.length + analysis.namingViolations.length;
    
    if (totalItems === 0) return 100;
    
    const healthScore = Math.max(0, ((totalItems - issues) / totalItems) * 100);
    return Math.round(healthScore);
  }

  generateRecommendations(analysis) {
    const recommendations = [];
    
    if (analysis.duplicates.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'duplicates',
        message: `Found ${analysis.duplicates.length} duplicate(s). Consider refactoring to reduce code duplication.`
      });
    }
    
    if (analysis.namingViolations.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'naming',
        message: `Found ${analysis.namingViolations.length} naming violation(s). Update to follow framework conventions.`
      });
    }
    
    const componentCount = analysis.components.length;
    if (componentCount > 100) {
      recommendations.push({
        priority: 'low',
        category: 'architecture',
        message: `High component count (${componentCount}). Consider organizing into feature modules.`
      });
    }
    
    return recommendations;
  }

  async healthCheck() {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        checks: {
          initialization: this.isInitialized,
          configuration: true,
          analyzers: true
        }
      };
      
      if (!this.isInitialized) {
        health.status = 'unhealthy';
        health.checks.initialization = false;
      }
      
      return health;
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }

  async stop() {
    console.log('🛑 Stopping Stability Framework...');
    this.duplicateAnalyzer.clear();
    this.isInitialized = false;
    console.log('✅ Stability Framework stopped');
  }
}