/**
 * Duplicate Analyzer - Detects and manages code/component duplicates
 * Identifies patterns, components, hooks, and utilities that are duplicated
 */

import fs from 'fs-extra';
import path from 'path';
import { createHash } from 'crypto';

export class DuplicateAnalyzer {
  constructor(config = {}) {
    this.config = {
      srcPath: './src',
      ignorePaths: ['node_modules', '.git', 'dist', 'build'],
      fileExtensions: ['.js', '.jsx', '.ts', '.tsx'],
      minSimilarity: 0.8,
      minLines: 10,
      ...config
    };
    
    this.duplicates = [];
    this.fileHashes = new Map();
    this.componentPatterns = new Map();
  }

  /**
   * Analyze project for duplicates
   */
  async analyze() {
    console.log('🔍 Starting duplicate analysis...');
    
    this.duplicates = [];
    this.fileHashes.clear();
    this.componentPatterns.clear();
    
    try {
      // Scan all files
      const files = await this.scanFiles(this.config.srcPath);
      
      // Analyze each file
      for (const file of files) {
        await this.analyzeFile(file);
      }
      
      // Find duplicates
      await this.findDuplicatePatterns();
      
      const results = {
        totalFiles: files.length,
        totalDuplicates: this.duplicates.length,
        criticalIssues: this.duplicates.filter(d => d.severity === 'critical').length,
        duplicates: this.duplicates
      };
      
      console.log(`📊 Analysis complete: ${results.totalDuplicates} duplicates found`);
      return results;
    } catch (error) {
      console.error('❌ Duplicate analysis failed:', error);
      throw error;
    }
  }

  /**
   * Recursively scan files in directory
   */
  async scanFiles(dirPath) {
    const files = [];
    
    try {
      const items = await fs.readdir(dirPath);
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        
        // Skip ignored paths
        if (this.config.ignorePaths.some(ignore => fullPath.includes(ignore))) {
          continue;
        }
        
        const stat = await fs.stat(fullPath);
        
        if (stat.isDirectory()) {
          files.push(...await this.scanFiles(fullPath));
        } else if (this.isTargetFile(fullPath)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`⚠️ Could not scan directory: ${dirPath}`);
    }
    
    return files;
  }

  /**
   * Check if file should be analyzed
   */
  isTargetFile(filePath) {
    return this.config.fileExtensions.some(ext => filePath.endsWith(ext));
  }

  /**
   * Analyze individual file for patterns
   */
  async analyzeFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const lines = content.split('\n');
      
      // Generate file hash
      const hash = createHash('md5').update(content).digest('hex');
      
      if (this.fileHashes.has(hash)) {
        this.fileHashes.get(hash).push(filePath);
      } else {
        this.fileHashes.set(hash, [filePath]);
      }
      
      // Analyze components
      this.analyzeComponents(filePath, content);
      
      // Analyze hooks
      this.analyzeHooks(filePath, content);
      
      // Analyze utility functions
      this.analyzeUtilities(filePath, content);
      
    } catch (error) {
      console.warn(`⚠️ Could not analyze file: ${filePath}`);
    }
  }

  /**
   * Analyze React components for patterns
   */
  analyzeComponents(filePath, content) {
    // Find component definitions
    const componentRegex = /(?:function|const|class)\s+([A-Z][a-zA-Z0-9]*)/g;
    let match;
    
    while ((match = componentRegex.exec(content)) !== null) {
      const componentName = match[1];
      const pattern = this.extractComponentPattern(content, componentName);
      
      if (pattern) {
        const hash = createHash('md5').update(pattern).digest('hex');
        
        if (!this.componentPatterns.has(hash)) {
          this.componentPatterns.set(hash, []);
        }
        
        this.componentPatterns.get(hash).push({
          name: componentName,
          file: filePath,
          pattern
        });
      }
    }
  }

  /**
   * Analyze custom hooks for patterns
   */
  analyzeHooks(filePath, content) {
    const hookRegex = /(?:function|const)\s+(use[A-Z][a-zA-Z0-9]*)/g;
    let match;
    
    while ((match = hookRegex.exec(content)) !== null) {
      const hookName = match[1];
      const pattern = this.extractHookPattern(content, hookName);
      
      if (pattern) {
        const hash = createHash('md5').update(pattern).digest('hex');
        
        if (!this.componentPatterns.has(hash)) {
          this.componentPatterns.set(hash, []);
        }
        
        this.componentPatterns.get(hash).push({
          name: hookName,
          file: filePath,
          pattern,
          type: 'hook'
        });
      }
    }
  }

  /**
   * Analyze utility functions for patterns
   */
  analyzeUtilities(filePath, content) {
    // Simple utility function detection
    const utilityRegex = /export\s+(?:function|const)\s+([a-z][a-zA-Z0-9]*)/g;
    let match;
    
    while ((match = utilityRegex.exec(content)) !== null) {
      const utilityName = match[1];
      const pattern = this.extractUtilityPattern(content, utilityName);
      
      if (pattern && pattern.length > this.config.minLines) {
        const hash = createHash('md5').update(pattern).digest('hex');
        
        if (!this.componentPatterns.has(hash)) {
          this.componentPatterns.set(hash, []);
        }
        
        this.componentPatterns.get(hash).push({
          name: utilityName,
          file: filePath,
          pattern,
          type: 'utility'
        });
      }
    }
  }

  /**
   * Extract component pattern for comparison
   */
  extractComponentPattern(content, componentName) {
    // Simplified pattern extraction - could be enhanced with AST parsing
    const startIndex = content.indexOf(componentName);
    if (startIndex === -1) return null;
    
    const lines = content.split('\n');
    const startLine = content.substring(0, startIndex).split('\n').length - 1;
    
    // Extract a reasonable block of code
    const endLine = Math.min(startLine + 50, lines.length);
    return lines.slice(startLine, endLine).join('\n');
  }

  /**
   * Extract hook pattern for comparison
   */
  extractHookPattern(content, hookName) {
    return this.extractComponentPattern(content, hookName);
  }

  /**
   * Extract utility pattern for comparison
   */
  extractUtilityPattern(content, utilityName) {
    return this.extractComponentPattern(content, utilityName);
  }

  /**
   * Find duplicate patterns across files
   */
  async findDuplicatePatterns() {
    // Check for exact file duplicates
    for (const [hash, files] of this.fileHashes) {
      if (files.length > 1) {
        this.duplicates.push({
          type: 'exact_file',
          severity: 'high',
          files,
          hash,
          canAutoFix: true,
          description: `Exact duplicate files detected`
        });
      }
    }
    
    // Check for pattern duplicates
    for (const [hash, patterns] of this.componentPatterns) {
      if (patterns.length > 1) {
        this.duplicates.push({
          type: patterns[0].type || 'component',
          severity: this.calculateSeverity(patterns),
          patterns,
          hash,
          canAutoFix: this.canAutoFixPattern(patterns),
          description: `Duplicate ${patterns[0].type || 'component'} pattern detected`
        });
      }
    }
  }

  /**
   * Calculate severity of duplicate
   */
  calculateSeverity(patterns) {
    if (patterns.length > 5) return 'critical';
    if (patterns.length > 3) return 'high';
    if (patterns.length > 1) return 'medium';
    return 'low';
  }

  /**
   * Check if pattern can be auto-fixed
   */
  canAutoFixPattern(patterns) {
    // Conservative approach - only auto-fix simple utilities
    return patterns[0].type === 'utility' && patterns.length <= 3;
  }

  /**
   * Fix a specific duplicate
   */
  async fixDuplicate(duplicate) {
    if (!duplicate.canAutoFix) {
      throw new Error('Duplicate cannot be auto-fixed');
    }
    
    console.log(`🔧 Fixing duplicate: ${duplicate.type}`);
    
    if (duplicate.type === 'exact_file') {
      await this.fixExactFileDuplicate(duplicate);
    } else if (duplicate.type === 'utility') {
      await this.fixUtilityDuplicate(duplicate);
    }
  }

  /**
   * Fix exact file duplicates
   */
  async fixExactFileDuplicate(duplicate) {
    // Keep the first file, remove others and update imports
    const [keepFile, ...removeFiles] = duplicate.files;
    
    for (const removeFile of removeFiles) {
      // This would need more sophisticated import updating
      console.log(`Would remove duplicate file: ${removeFile}`);
      // await fs.remove(removeFile);
    }
  }

  /**
   * Fix utility duplicates by creating shared utility
   */
  async fixUtilityDuplicate(duplicate) {
    const patterns = duplicate.patterns;
    const sharedUtilPath = 'src/utils/shared-utilities.js';
    
    // This would need actual implementation to extract and share utilities
    console.log(`Would create shared utility for: ${patterns.map(p => p.name).join(', ')}`);
  }

  /**
   * Get detailed report
   */
  async getDetailedReport() {
    return {
      summary: {
        totalDuplicates: this.duplicates.length,
        bySeverity: this.groupBySeverity(),
        byType: this.groupByType()
      },
      duplicates: this.duplicates,
      recommendations: this.generateRecommendations()
    };
  }

  /**
   * Group duplicates by severity
   */
  groupBySeverity() {
    return this.duplicates.reduce((acc, dup) => {
      acc[dup.severity] = (acc[dup.severity] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * Group duplicates by type
   */
  groupByType() {
    return this.duplicates.reduce((acc, dup) => {
      acc[dup.type] = (acc[dup.type] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * Generate recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    
    const criticalCount = this.duplicates.filter(d => d.severity === 'critical').length;
    if (criticalCount > 0) {
      recommendations.push(`Address ${criticalCount} critical duplicates immediately`);
    }
    
    const utilityDuplicates = this.duplicates.filter(d => d.type === 'utility').length;
    if (utilityDuplicates > 3) {
      recommendations.push('Consider creating a shared utilities module');
    }
    
    return recommendations;
  }
}

export default DuplicateAnalyzer;
