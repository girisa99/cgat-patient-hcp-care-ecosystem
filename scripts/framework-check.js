#!/usr/bin/env node

/**
 * Framework Validation Script - Comprehensive framework validation and analysis
 */

import { StabilityManager } from '../stability-framework/core/stability-manager.js';
import { DuplicateAnalyzer } from '../stability-framework/core/duplicate-analyzer.js';
import { frameworkConfig } from '../stability-framework/config/framework.config.js';
import fs from 'fs/promises';
import path from 'path';

class FrameworkValidator {
  constructor() {
    this.stabilityManager = new StabilityManager();
    this.duplicateAnalyzer = new DuplicateAnalyzer();
    this.issues = [];
    this.warnings = [];
  }

  async run() {
    console.log('🚀 Starting comprehensive framework validation...\n');

    try {
      await this.scanCodebase();
      await this.validateNamingConventions();
      await this.checkDuplicates();
      await this.validateStability();
      await this.generateReport();
      
      this.displayResults();
      
      // Exit with appropriate code
      process.exit(this.issues.length > 0 ? 1 : 0);
    } catch (error) {
      console.error('❌ Framework validation failed:', error);
      process.exit(1);
    }
  }

  async scanCodebase() {
    console.log('📁 Scanning codebase...');
    
    const scanPaths = frameworkConfig.codebase.scanPaths;
    const excludePaths = frameworkConfig.codebase.excludePaths;
    
    for (const scanPath of scanPaths) {
      await this.scanPath(scanPath, excludePaths);
    }
    
    console.log(`✅ Scanned ${this.duplicateAnalyzer.componentRegistry.size} components`);
    console.log(`✅ Scanned ${this.duplicateAnalyzer.serviceRegistry.size} services\n`);
  }

  async scanPath(pattern, excludePatterns) {
    const glob = await import('glob');
    const files = await glob.glob(pattern, { ignore: excludePatterns });
    
    for (const file of files) {
      await this.analyzeFile(file);
    }
  }

  async analyzeFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const fileType = this.determineFileType(filePath);
      
      switch (fileType) {
        case 'component':
          await this.analyzeComponentFile(filePath, content);
          break;
        case 'service':
          await this.analyzeServiceFile(filePath, content);
          break;
        case 'type':
          await this.analyzeTypeFile(filePath, content);
          break;
      }
    } catch (error) {
      this.warnings.push(`Could not analyze ${filePath}: ${error.message}`);
    }
  }

  determineFileType(filePath) {
    if (filePath.includes('/components/')) return 'component';
    if (filePath.includes('/services/')) return 'service';
    if (filePath.includes('/types/')) return 'type';
    if (filePath.includes('/hooks/')) return 'hook';
    return 'unknown';
  }

  async analyzeComponentFile(filePath, content) {
    const componentName = this.extractComponentName(filePath);
    const metadata = this.extractComponentMetadata(content);
    
    this.duplicateAnalyzer.registerComponent(componentName, {
      ...metadata,
      filePath
    });
  }

  async analyzeServiceFile(filePath, content) {
    const serviceName = this.extractServiceName(filePath);
    const metadata = this.extractServiceMetadata(content);
    
    this.duplicateAnalyzer.registerService(serviceName, {
      ...metadata,
      filePath
    });
  }

  async analyzeTypeFile(filePath, content) {
    const types = this.extractTypeDefinitions(content);
    
    for (const [typeName, definition] of Object.entries(types)) {
      this.duplicateAnalyzer.registerType(typeName, definition);
    }
  }

  extractComponentName(filePath) {
    return path.basename(filePath).replace(/\.(tsx?|jsx?)$/, '');
  }

  extractServiceName(filePath) {
    return path.basename(filePath).replace(/\.ts$/, '');
  }

  extractComponentMetadata(content) {
    // Simple extraction - in reality this would parse AST
    const props = this.extractPropsFromContent(content);
    const category = this.determineComponentCategory(content);
    
    return {
      props,
      category,
      functionality: 'Extracted from component analysis'
    };
  }

  extractServiceMetadata(content) {
    // Simple extraction - in reality this would parse AST
    const methods = this.extractMethodsFromContent(content);
    const dependencies = this.extractDependenciesFromContent(content);
    
    return {
      methods,
      dependencies
    };
  }

  extractPropsFromContent(content) {
    // Simple regex extraction - in reality use proper AST parsing
    const propsMatch = content.match(/interface\s+\w+Props\s*{([^}]+)}/);
    if (propsMatch) {
      return propsMatch[1]
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('//'))
        .map(line => line.split(':')[0].trim().replace('?', ''));
    }
    return [];
  }

  extractMethodsFromContent(content) {
    // Simple regex extraction
    const methodMatches = content.match(/(?:public|private|async)?\s*(\w+)\s*\(/g);
    return methodMatches ? 
      methodMatches.map(match => match.replace(/(?:public|private|async)?\s*(\w+)\s*\(/, '$1')) : 
      [];
  }

  extractDependenciesFromContent(content) {
    // Extract constructor dependencies
    const constructorMatch = content.match(/constructor\s*\([^)]*\)/);
    if (constructorMatch) {
      const params = constructorMatch[0].match(/(\w+):\s*(\w+)/g);
      return params ? params.map(param => param.split(':')[1].trim()) : [];
    }
    return [];
  }

  extractTypeDefinitions(content) {
    // Simple type extraction - in reality use TypeScript compiler API
    const types = {};
    const interfaceMatches = content.match(/(?:export\s+)?interface\s+(\w+)/g);
    
    if (interfaceMatches) {
      interfaceMatches.forEach(match => {
        const typeName = match.replace(/(?:export\s+)?interface\s+/, '');
        types[typeName] = { type: 'interface' };
      });
    }
    
    return types;
  }

  determineComponentCategory(content) {
    if (content.includes('form') || content.includes('Form')) return 'forms';
    if (content.includes('layout') || content.includes('Layout')) return 'layouts';
    return 'ui';
  }

  async validateNamingConventions() {
    console.log('📝 Validating naming conventions...');
    
    // Validate component names
    for (const [name, metadata] of this.duplicateAnalyzer.componentRegistry) {
      const category = metadata.category || 'ui';
      const pattern = frameworkConfig.componentCategories[category]?.namingPattern;
      
      if (pattern && !pattern.test(name)) {
        this.issues.push({
          type: 'naming_violation',
          item: `Component: ${name}`,
          issue: `Does not match ${category} naming pattern`,
          file: metadata.filePath
        });
      }
    }

    // Validate service names
    for (const [name, metadata] of this.duplicateAnalyzer.serviceRegistry) {
      const pattern = frameworkConfig.servicePatterns.naming;
      
      if (!pattern.test(name)) {
        this.issues.push({
          type: 'naming_violation',
          item: `Service: ${name}`,
          issue: 'Does not match service naming pattern',
          file: metadata.filePath
        });
      }
    }
    
    console.log('✅ Naming convention validation complete\n');
  }

  async checkDuplicates() {
    console.log('🔍 Checking for duplicates...');
    
    // Check component duplicates
    const componentNames = Array.from(this.duplicateAnalyzer.componentRegistry.keys());
    for (const name of componentNames) {
      const metadata = this.duplicateAnalyzer.componentRegistry.get(name);
      const analysis = await this.duplicateAnalyzer.analyzeComponent(name, metadata);
      
      if (analysis.isDuplicate && analysis.type === 'exact') {
        this.issues.push({
          type: 'exact_duplicate',
          item: `Component: ${name}`,
          issue: 'Exact duplicate found',
          recommendation: analysis.recommendation
        });
      } else if (analysis.similar && analysis.similar.length > 0) {
        const similar = analysis.similar[0];
        if (similar.similarity > frameworkConfig.similarity.component.functionality) {
          this.warnings.push({
            type: 'similar_component',
            item: `Component: ${name}`,
            issue: `Very similar to ${similar.name} (${Math.round(similar.similarity * 100)}% similar)`,
            recommendation: 'Consider extending existing component'
          });
        }
      }
    }

    // Check service duplicates
    const serviceNames = Array.from(this.duplicateAnalyzer.serviceRegistry.keys());
    for (const name of serviceNames) {
      const metadata = this.duplicateAnalyzer.serviceRegistry.get(name);
      const analysis = await this.duplicateAnalyzer.analyzeService(name, metadata);
      
      if (analysis.isDuplicate) {
        this.issues.push({
          type: 'service_duplicate',
          item: `Service: ${name}`,
          issue: 'Duplicate service functionality',
          recommendation: analysis.recommendation
        });
      }
    }
    
    console.log('✅ Duplicate check complete\n');
  }

  async validateStability() {
    console.log('🔒 Validating stability requirements...');
    
    // This would check for potential breaking changes
    // For now, just validate basic stability requirements
    
    const report = this.duplicateAnalyzer.generateReport();
    
    if (report.components.total > 100) {
      this.warnings.push({
        type: 'architecture_warning',
        item: 'Component count',
        issue: `High component count (${report.components.total})`,
        recommendation: 'Consider component library organization'
      });
    }
    
    console.log('✅ Stability validation complete\n');
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        issues: this.issues.length,
        warnings: this.warnings.length,
        components: this.duplicateAnalyzer.componentRegistry.size,
        services: this.duplicateAnalyzer.serviceRegistry.size,
        types: this.duplicateAnalyzer.typeRegistry.size
      },
      issues: this.issues,
      warnings: this.warnings,
      codebaseAnalysis: this.duplicateAnalyzer.generateReport()
    };

    await fs.writeFile(
      'framework-validation-report.json',
      JSON.stringify(report, null, 2)
    );
  }

  displayResults() {
    console.log('📊 Framework Validation Results');
    console.log('================================\n');
    
    if (this.issues.length === 0 && this.warnings.length === 0) {
      console.log('🎉 All checks passed! Your codebase follows framework guidelines.\n');
    } else {
      if (this.issues.length > 0) {
        console.log(`❌ Found ${this.issues.length} issue(s) that need attention:\n`);
        this.issues.forEach((issue, index) => {
          console.log(`${index + 1}. ${issue.item}`);
          console.log(`   Issue: ${issue.issue}`);
          if (issue.recommendation) {
            console.log(`   Recommendation: ${issue.recommendation}`);
          }
          if (issue.file) {
            console.log(`   File: ${issue.file}`);
          }
          console.log('');
        });
      }
      
      if (this.warnings.length > 0) {
        console.log(`⚠️  Found ${this.warnings.length} warning(s):\n`);
        this.warnings.forEach((warning, index) => {
          console.log(`${index + 1}. ${warning.item || warning}`);
          if (typeof warning === 'object') {
            console.log(`   Warning: ${warning.issue}`);
            if (warning.recommendation) {
              console.log(`   Suggestion: ${warning.recommendation}`);
            }
          }
          console.log('');
        });
      }
    }
    
    console.log('📋 Summary:');
    console.log(`   Components: ${this.duplicateAnalyzer.componentRegistry.size}`);
    console.log(`   Services: ${this.duplicateAnalyzer.serviceRegistry.size}`);
    console.log(`   Types: ${this.duplicateAnalyzer.typeRegistry.size}`);
    console.log(`   Issues: ${this.issues.length}`);
    console.log(`   Warnings: ${this.warnings.length}`);
    console.log('\n📄 Detailed report saved to: framework-validation-report.json');
  }
}

// Run the validator
const validator = new FrameworkValidator();
validator.run();