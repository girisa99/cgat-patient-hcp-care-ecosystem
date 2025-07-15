#!/usr/bin/env node

/**
 * Run Stability Framework Scan on Current Codebase
 * This script will analyze the existing code for compliance with stability framework standards
 */

import { StabilityManager } from './stability-framework/core/stability-manager.js';
import { DuplicateAnalyzer } from './stability-framework/core/duplicate-analyzer.js';
import { frameworkConfig } from './stability-framework/config/framework.config.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class CodebaseScanner {
  constructor() {
    this.stabilityManager = new StabilityManager();
    this.duplicateAnalyzer = new DuplicateAnalyzer();
    this.violations = [];
    this.warnings = [];
    this.stats = {
      totalFiles: 0,
      components: 0,
      hooks: 0,
      services: 0,
      pages: 0
    };
  }

  async scanCodebase() {
    console.log('🔍 Starting codebase scan for stability framework compliance...\n');

    try {
      await this.scanDirectory('src');
      await this.analyzeNamingConventions();
      await this.checkForDuplicates();
      await this.validateComplexity();
      await this.generateReport();
      
      this.displayResults();
      return this.violations.length === 0;
    } catch (error) {
      console.error('❌ Scan failed:', error);
      return false;
    }
  }

  async scanDirectory(dirPath) {
    const fullPath = path.join(__dirname, dirPath);
    
    try {
      const entries = await fs.readdir(fullPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const entryPath = path.join(fullPath, entry.name);
        const relativePath = path.relative(__dirname, entryPath);
        
        if (entry.isDirectory()) {
          // Skip node_modules, dist, build, etc.
          if (!['node_modules', '.git', 'dist', 'build', '.next'].includes(entry.name)) {
            await this.scanDirectory(relativePath);
          }
        } else if (entry.isFile()) {
          await this.analyzeFile(relativePath);
        }
      }
    } catch (error) {
      console.warn(`⚠️ Could not scan directory ${dirPath}:`, error.message);
    }
  }

  async analyzeFile(filePath) {
    // Only analyze TypeScript/JavaScript files
    if (!/\.(ts|tsx|js|jsx)$/.test(filePath)) return;
    
    // Skip test files
    if (/\.(test|spec)\.(ts|tsx|js|jsx)$/.test(filePath)) return;
    
    this.stats.totalFiles++;
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const fileName = path.basename(filePath);
      const dirName = path.dirname(filePath);
      
      // Determine file type and category
      const fileType = this.determineFileType(filePath);
      const componentName = this.extractComponentName(fileName);
      
      // Update stats
      this.updateStats(fileType);
      
      // Check naming conventions
      this.checkNamingConventions(filePath, fileName, dirName, fileType);
      
      // Check complexity
      this.checkFileComplexity(filePath, content);
      
      // Register for duplicate analysis
      if (fileType === 'component') {
        this.registerComponent(componentName, filePath, content);
      } else if (fileType === 'hook') {
        this.registerHook(componentName, filePath, content);
      } else if (fileType === 'service') {
        this.registerService(componentName, filePath, content);
      }
      
    } catch (error) {
      this.warnings.push(`Could not analyze ${filePath}: ${error.message}`);
    }
  }

  determineFileType(filePath) {
    if (filePath.includes('/components/')) return 'component';
    if (filePath.includes('/hooks/')) return 'hook';
    if (filePath.includes('/services/')) return 'service';
    if (filePath.includes('/pages/')) return 'page';
    if (filePath.includes('/utils/')) return 'utility';
    if (filePath.includes('/types/')) return 'type';
    return 'other';
  }

  extractComponentName(fileName) {
    return fileName.replace(/\.(tsx?|jsx?)$/, '');
  }

  updateStats(fileType) {
    if (fileType === 'component') this.stats.components++;
    else if (fileType === 'hook') this.stats.hooks++;
    else if (fileType === 'service') this.stats.services++;
    else if (fileType === 'page') this.stats.pages++;
  }

  checkNamingConventions(filePath, fileName, dirName, fileType) {
    const componentName = this.extractComponentName(fileName);
    
    switch (fileType) {
      case 'component':
        // Components should be PascalCase
        if (!/^[A-Z][a-zA-Z0-9]*$/.test(componentName)) {
          this.violations.push({
            type: 'naming_violation',
            severity: 'error',
            file: filePath,
            issue: `Component "${componentName}" should be PascalCase`,
            current: componentName,
            expected: 'PascalCase (e.g., UserProfile, DataTable)'
          });
        }
        break;
        
      case 'hook':
        // Hooks should start with 'use' and be camelCase
        if (!/^use[A-Z][a-zA-Z0-9]*$/.test(componentName)) {
          this.violations.push({
            type: 'naming_violation',
            severity: 'error',
            file: filePath,
            issue: `Hook "${componentName}" should start with "use" and be camelCase`,
            current: componentName,
            expected: 'useCamelCase (e.g., useAuth, useLocalStorage)'
          });
        }
        break;
        
      case 'service':
        // Services should end with 'Service' and be PascalCase
        if (!/^[A-Z][a-zA-Z0-9]*Service$/.test(componentName)) {
          this.warnings.push({
            type: 'naming_suggestion',
            severity: 'warning',
            file: filePath,
            issue: `Service "${componentName}" should end with "Service" and be PascalCase`,
            current: componentName,
            expected: 'PascalCaseService (e.g., UserService, AuthService)'
          });
        }
        break;
        
      case 'page':
        // Pages should be PascalCase
        if (!/^[A-Z][a-zA-Z0-9]*$/.test(componentName)) {
          this.violations.push({
            type: 'naming_violation',
            severity: 'error',
            file: filePath,
            issue: `Page "${componentName}" should be PascalCase`,
            current: componentName,
            expected: 'PascalCase (e.g., UserDashboard, Settings)'
          });
        }
        break;
    }
  }

  checkFileComplexity(filePath, content) {
    const complexity = this.calculateComplexity(content);
    const lines = content.split('\n').length;
    
    if (complexity > 15) {
      this.violations.push({
        type: 'complexity_violation',
        severity: 'error',
        file: filePath,
        issue: `File has high complexity: ${complexity}`,
        current: complexity,
        expected: 'Below 15'
      });
    } else if (complexity > 10) {
      this.warnings.push({
        type: 'complexity_warning',
        severity: 'warning',
        file: filePath,
        issue: `File has moderate complexity: ${complexity}`,
        current: complexity,
        expected: 'Below 10'
      });
    }
    
    if (lines > 300) {
      this.warnings.push({
        type: 'file_length_warning',
        severity: 'warning',
        file: filePath,
        issue: `File is quite long: ${lines} lines`,
        current: `${lines} lines`,
        expected: 'Below 300 lines'
      });
    }
  }

  calculateComplexity(content) {
    const patterns = [
      /\bif\s*\(/g, /\belse\s+if\s*\(/g, /\belse\s*{/g,
      /\bwhile\s*\(/g, /\bfor\s*\(/g, /\bdo\s*{/g,
      /\bswitch\s*\(/g, /\bcase\s+/g, /\bcatch\s*\(/g,
      /&&/g, /\|\|/g, /\?.*:/g, /\btry\s*{/g
    ];
    
    return patterns.reduce((total, pattern) => {
      const matches = content.match(pattern);
      return total + (matches ? matches.length : 0);
    }, 1);
  }

  registerComponent(name, filePath, content) {
    const props = this.extractProps(content);
    const imports = this.extractImports(content);
    
    this.duplicateAnalyzer.registerComponent(name, {
      filePath,
      props,
      imports,
      category: this.determineCategory(content),
      functionality: this.extractFunctionality(content)
    });
  }

  registerHook(name, filePath, content) {
    const dependencies = this.extractHookDependencies(content);
    
    this.duplicateAnalyzer.registerService(name, {
      filePath,
      methods: dependencies,
      functionality: this.extractFunctionality(content)
    });
  }

  registerService(name, filePath, content) {
    const methods = this.extractMethods(content);
    
    this.duplicateAnalyzer.registerService(name, {
      filePath,
      methods,
      functionality: this.extractFunctionality(content)
    });
  }

  extractProps(content) {
    // Simple regex to extract prop names from interfaces
    const propsMatch = content.match(/interface\s+\w*Props\s*{([^}]+)}/);
    if (propsMatch) {
      return propsMatch[1]
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('//') && !line.startsWith('*'))
        .map(line => line.split(':')[0].trim().replace('?', ''))
        .filter(prop => prop);
    }
    return [];
  }

  extractImports(content) {
    const importMatches = content.match(/import\s+.*\s+from\s+['"][^'"]+['"]/g);
    return importMatches ? importMatches.map(imp => imp.trim()) : [];
  }

  extractMethods(content) {
    const methodMatches = content.match(/(?:async\s+)?(?:function\s+)?(\w+)\s*\(/g);
    return methodMatches ? 
      methodMatches.map(match => match.replace(/(?:async\s+)?(?:function\s+)?(\w+)\s*\(/, '$1')) : 
      [];
  }

  extractHookDependencies(content) {
    const deps = [];
    
    // Look for useEffect, useMemo, useCallback dependencies
    const effectMatches = content.match(/use(?:Effect|Memo|Callback)\s*\([^,]+,\s*\[([^\]]*)\]/g);
    if (effectMatches) {
      effectMatches.forEach(match => {
        const depMatch = match.match(/\[([^\]]*)\]/);
        if (depMatch && depMatch[1].trim()) {
          deps.push(...depMatch[1].split(',').map(d => d.trim()));
        }
      });
    }
    
    return deps;
  }

  determineCategory(content) {
    if (content.includes('form') || content.includes('Form')) return 'forms';
    if (content.includes('layout') || content.includes('Layout')) return 'layout';
    if (content.includes('navigation') || content.includes('Navigation')) return 'navigation';
    if (content.includes('table') || content.includes('Table') || content.includes('DataTable')) return 'data-display';
    return 'ui';
  }

  extractFunctionality(content) {
    // Simple functionality extraction based on common patterns
    if (content.includes('useState') || content.includes('useEffect')) return 'stateful component';
    if (content.includes('supabase') || content.includes('fetch')) return 'data fetching';
    if (content.includes('router') || content.includes('navigate')) return 'navigation';
    if (content.includes('form') || content.includes('Form')) return 'form handling';
    return 'utility';
  }

  async analyzeNamingConventions() {
    console.log('📝 Analyzing naming conventions...');
    // This is already done during file analysis
    console.log('✅ Naming convention analysis complete');
  }

  async checkForDuplicates() {
    console.log('🔍 Checking for duplicates...');
    
    // Analyze components for duplicates
    const componentNames = Array.from(this.duplicateAnalyzer.componentRegistry.keys());
    for (const name of componentNames) {
      const metadata = this.duplicateAnalyzer.componentRegistry.get(name);
      const analysis = await this.duplicateAnalyzer.analyzeComponent(name, metadata);
      
      if (analysis.isDuplicate) {
        this.violations.push({
          type: 'duplicate_component',
          severity: 'error',
          file: metadata.filePath,
          issue: `Exact duplicate component: ${name}`,
          recommendation: analysis.recommendation
        });
      } else if (analysis.similar && analysis.similar.length > 0) {
        const similar = analysis.similar[0];
        if (similar.similarity > 0.8) {
          this.warnings.push({
            type: 'similar_component',
            severity: 'warning',
            file: metadata.filePath,
            issue: `Very similar to ${similar.name} (${Math.round(similar.similarity * 100)}% similar)`,
            recommendation: 'Consider consolidating or extending existing component'
          });
        }
      }
    }
    
    console.log('✅ Duplicate analysis complete');
  }

  async validateComplexity() {
    console.log('🔧 Validating complexity...');
    // This is already done during file analysis
    console.log('✅ Complexity validation complete');
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: this.stats.totalFiles,
        components: this.stats.components,
        hooks: this.stats.hooks,
        services: this.stats.services,
        pages: this.stats.pages,
        violations: this.violations.length,
        warnings: this.warnings.length,
        overallScore: this.calculateOverallScore()
      },
      violations: this.violations,
      warnings: this.warnings,
      recommendations: this.generateRecommendations()
    };

    await fs.writeFile(
      'stability-scan-report.json',
      JSON.stringify(report, null, 2)
    );
  }

  calculateOverallScore() {
    const totalIssues = this.violations.length + (this.warnings.length * 0.5);
    const maxScore = 100;
    const penaltyPerIssue = 2;
    
    return Math.max(0, maxScore - (totalIssues * penaltyPerIssue));
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.violations.some(v => v.type === 'naming_violation')) {
      recommendations.push({
        type: 'naming',
        priority: 'high',
        description: 'Fix naming convention violations to improve code readability and maintainability'
      });
    }
    
    if (this.violations.some(v => v.type === 'complexity_violation')) {
      recommendations.push({
        type: 'complexity',
        priority: 'high',
        description: 'Break down complex files into smaller, more manageable components'
      });
    }
    
    if (this.warnings.some(w => w.type === 'similar_component')) {
      recommendations.push({
        type: 'duplicates',
        priority: 'medium',
        description: 'Consider consolidating similar components to reduce code duplication'
      });
    }
    
    if (this.stats.totalFiles > 200) {
      recommendations.push({
        type: 'architecture',
        priority: 'low',
        description: 'Consider organizing code into feature-based modules for better scalability'
      });
    }
    
    return recommendations;
  }

  displayResults() {
    console.log('\n📊 Stability Framework Compliance Report');
    console.log('=========================================\n');
    
    // Summary
    console.log('📈 Summary:');
    console.log(`   Total Files Analyzed: ${this.stats.totalFiles}`);
    console.log(`   Components: ${this.stats.components}`);
    console.log(`   Hooks: ${this.stats.hooks}`);
    console.log(`   Services: ${this.stats.services}`);
    console.log(`   Pages: ${this.stats.pages}`);
    console.log(`   Overall Score: ${this.calculateOverallScore()}/100\n`);
    
    // Violations
    if (this.violations.length > 0) {
      console.log(`❌ Found ${this.violations.length} violation(s) that need immediate attention:\n`);
      this.violations.forEach((violation, index) => {
        console.log(`${index + 1}. [${violation.severity.toUpperCase()}] ${violation.issue}`);
        console.log(`   File: ${violation.file}`);
        if (violation.current && violation.expected) {
          console.log(`   Current: ${violation.current}`);
          console.log(`   Expected: ${violation.expected}`);
        }
        if (violation.recommendation) {
          console.log(`   Recommendation: ${violation.recommendation}`);
        }
        console.log('');
      });
    } else {
      console.log('✅ No violations found!\n');
    }
    
    // Warnings
    if (this.warnings.length > 0) {
      console.log(`⚠️  Found ${this.warnings.length} warning(s) for improvement:\n`);
      this.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. [${warning.severity.toUpperCase()}] ${warning.issue}`);
        console.log(`   File: ${warning.file}`);
        if (warning.current && warning.expected) {
          console.log(`   Current: ${warning.current}`);
          console.log(`   Expected: ${warning.expected}`);
        }
        console.log('');
      });
    } else {
      console.log('✅ No warnings!\n');
    }
    
    console.log('📄 Detailed report saved to: stability-scan-report.json\n');
    
    // Final assessment
    const score = this.calculateOverallScore();
    if (score >= 90) {
      console.log('🎉 Excellent! Your codebase follows stability framework standards very well.');
    } else if (score >= 75) {
      console.log('👍 Good! Your codebase mostly follows stability framework standards with room for improvement.');
    } else if (score >= 60) {
      console.log('⚠️  Fair. Your codebase needs some work to meet stability framework standards.');
    } else {
      console.log('🚨 Poor. Your codebase requires significant updates to meet stability framework standards.');
    }
  }
}

// Run the scanner
const scanner = new CodebaseScanner();
scanner.scanCodebase().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Scanner failed:', error);
  process.exit(1);
});