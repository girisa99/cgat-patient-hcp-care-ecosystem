#!/usr/bin/env node

/**
 * Pre-commit Stability Framework Check
 * Enforces stability framework rules before commits
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

class PreCommitStabilityCheck {
  constructor() {
    this.violations = [];
    this.warnings = [];
    this.config = {
      maxDuplicates: 5,
      maxComplexity: 10,
      requiredPatterns: {
        components: /^[A-Z][a-zA-Z0-9]*\.tsx?$/,
        hooks: /^use[A-Z][a-zA-Z0-9]*\.tsx?$/,
        services: /^[a-z][a-zA-Z0-9]*Service\.ts$/
      }
    };
  }

  async run() {
    console.log('🔍 Running pre-commit stability checks...');
    
    try {
      const stagedFiles = await this.getStagedFiles();
      
      if (stagedFiles.length === 0) {
        console.log('✅ No staged files to check');
        return true;
      }

      console.log(`📁 Checking ${stagedFiles.length} staged files...`);

      await Promise.all([
        this.checkNamingConventions(stagedFiles),
        this.checkDuplicates(stagedFiles),
        this.checkComplexity(stagedFiles),
        this.checkUpdateFirstRule(stagedFiles)
      ]);

      return this.reportResults();
    } catch (error) {
      console.error('❌ Pre-commit check failed:', error.message);
      return false;
    }
  }

  async getStagedFiles() {
    try {
      const { stdout } = await execAsync('git diff --cached --name-only --diff-filter=ACM');
      return stdout.trim().split('\n').filter(file => 
        file && (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx'))
      );
    } catch (error) {
      throw new Error(`Failed to get staged files: ${error.message}`);
    }
  }

  async checkNamingConventions(files) {
    for (const file of files) {
      const fileName = path.basename(file);
      const dir = path.dirname(file);

      // Check component naming
      if (dir.includes('components')) {
        if (!this.config.requiredPatterns.components.test(fileName)) {
          this.violations.push({
            type: 'naming',
            file,
            message: `Component "${fileName}" should follow PascalCase naming convention`
          });
        }
      }

      // Check hook naming
      if (dir.includes('hooks')) {
        if (!this.config.requiredPatterns.hooks.test(fileName)) {
          this.violations.push({
            type: 'naming',
            file,
            message: `Hook "${fileName}" should start with "use" and follow camelCase`
          });
        }
      }

      // Check service naming
      if (dir.includes('services')) {
        if (!this.config.requiredPatterns.services.test(fileName)) {
          this.violations.push({
            type: 'naming',
            file,
            message: `Service "${fileName}" should end with "Service" and follow camelCase`
          });
        }
      }
    }
  }

  async checkDuplicates(files) {
    const duplicateMap = new Map();
    
    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const hash = this.getContentHash(content);
        
        if (duplicateMap.has(hash)) {
          duplicateMap.get(hash).push(file);
        } else {
          duplicateMap.set(hash, [file]);
        }
      } catch (error) {
        this.warnings.push({
          type: 'file-read',
          file,
          message: `Could not read file: ${error.message}`
        });
      }
    }

    for (const [hash, duplicateFiles] of duplicateMap) {
      if (duplicateFiles.length > 1) {
        this.violations.push({
          type: 'duplicate',
          files: duplicateFiles,
          message: `Duplicate content detected in: ${duplicateFiles.join(', ')}`
        });
      }
    }
  }

  async checkComplexity(files) {
    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const complexity = this.calculateComplexity(content);
        
        if (complexity > this.config.maxComplexity) {
          this.violations.push({
            type: 'complexity',
            file,
            message: `File complexity (${complexity}) exceeds maximum (${this.config.maxComplexity})`
          });
        }
      } catch (error) {
        this.warnings.push({
          type: 'complexity-check',
          file,
          message: `Could not check complexity: ${error.message}`
        });
      }
    }
  }

  async checkUpdateFirstRule(files) {
    for (const file of files) {
      const fileName = path.basename(file, path.extname(file));
      
      // Check if similar components/services already exist
      try {
        const existingFiles = await this.findSimilarFiles(fileName, path.dirname(file));
        
        if (existingFiles.length > 0) {
          this.warnings.push({
            type: 'update-first',
            file,
            message: `Similar files exist: ${existingFiles.join(', ')}. Consider updating existing instead of creating new.`
          });
        }
      } catch (error) {
        // Non-critical warning
      }
    }
  }

  async findSimilarFiles(fileName, directory) {
    try {
      const files = await fs.readdir(directory);
      const similar = files.filter(file => {
        const baseName = path.basename(file, path.extname(file));
        return baseName.toLowerCase().includes(fileName.toLowerCase()) && 
               baseName !== fileName;
      });
      return similar;
    } catch (error) {
      return [];
    }
  }

  calculateComplexity(content) {
    // Simple complexity calculation based on control structures
    const patterns = [
      /if\s*\(/g,
      /else\s*{/g,
      /while\s*\(/g,
      /for\s*\(/g,
      /switch\s*\(/g,
      /catch\s*\(/g,
      /&&/g,
      /\|\|/g
    ];
    
    return patterns.reduce((total, pattern) => {
      const matches = content.match(pattern);
      return total + (matches ? matches.length : 0);
    }, 1);
  }

  getContentHash(content) {
    // Simple hash function for duplicate detection
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  reportResults() {
    const totalIssues = this.violations.length + this.warnings.length;
    
    if (this.violations.length > 0) {
      console.log('\n❌ Stability Framework Violations:');
      this.violations.forEach((violation, index) => {
        console.log(`${index + 1}. [${violation.type.toUpperCase()}] ${violation.message}`);
        if (violation.file) console.log(`   File: ${violation.file}`);
        if (violation.files) console.log(`   Files: ${violation.files.join(', ')}`);
      });
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  Stability Framework Warnings:');
      this.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. [${warning.type.toUpperCase()}] ${warning.message}`);
        if (warning.file) console.log(`   File: ${warning.file}`);
      });
    }

    if (totalIssues === 0) {
      console.log('\n✅ All stability checks passed!');
      return true;
    } else {
      console.log(`\n📊 Summary: ${this.violations.length} violations, ${this.warnings.length} warnings`);
      
      if (this.violations.length > 0) {
        console.log('\n🚫 Commit blocked due to stability violations.');
        console.log('Please fix the violations and try again.');
        return false;
      } else {
        console.log('\n⚠️  Commit allowed with warnings.');
        return true;
      }
    }
  }
}

// Run the check
const checker = new PreCommitStabilityCheck();
checker.run().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Pre-commit check failed:', error);
  process.exit(1);
});