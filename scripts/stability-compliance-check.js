#!/usr/bin/env node

/**
 * STABILITY FRAMEWORK PRE-COMMIT HOOK
 * Automated compliance checking before commits
 * Phase 3: System Hardening Implementation
 */

const fs = require('fs');
const path = require('path');

class StabilityComplianceChecker {
  constructor() {
    this.violations = [];
    this.warnings = [];
  }

  async checkAll() {
    console.log('🔍 Running Stability Framework Compliance Check...\n');
    
    await this.checkNamingConventions();
    await this.checkFileComplexity();
    await this.checkServiceNaming();
    await this.checkHookNaming();
    
    this.generateReport();
    
    return this.violations.length === 0;
  }

  async checkNamingConventions() {
    const componentFiles = this.getFiles('src/components', '.tsx');
    
    componentFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for lowercase exports
      if (content.match(/export\s+const\s+[a-z]/)) {
        this.violations.push(`❌ Lowercase component export in ${file}`);
      }
      
      // Check for PascalCase components
      const componentMatch = content.match(/(?:const|function)\s+([A-Z][a-zA-Z]*)/);
      if (!componentMatch && !file.includes('index.')) {
        this.violations.push(`❌ Component not PascalCase in ${file}`);
      }
    });
  }

  async checkFileComplexity() {
    const files = this.getFiles('src', '.tsx');
    
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const lineCount = content.split('\n').length;
      
      if (lineCount > 300) {
        this.warnings.push(`⚠️ File complexity: ${file} (${lineCount} lines > 300)`);
      }
    });
  }

  async checkServiceNaming() {
    const serviceFiles = this.getFiles('src/services', '.ts');
    
    serviceFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for proper service exports
      if (content.match(/export\s+const\s+[a-z]/)) {
        const serviceName = path.basename(file, '.ts');
        if (!serviceName.endsWith('Service')) {
          this.violations.push(`❌ Service file should end with 'Service': ${file}`);
        }
      }
    });
  }

  async checkHookNaming() {
    const hookFiles = this.getFiles('src/hooks', '.tsx', '.ts');
    
    hookFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for proper hook exports
      const hookExports = content.match(/export\s+(?:const|function)\s+(\w+)/g);
      if (hookExports) {
        hookExports.forEach(exportMatch => {
          const hookName = exportMatch.match(/export\s+(?:const|function)\s+(\w+)/)[1];
          if (!hookName.startsWith('use') && !hookName.includes('Hook')) {
            this.violations.push(`❌ Hook should start with 'use': ${hookName} in ${file}`);
          }
        });
      }
    });
  }

  getFiles(dir, ...extensions) {
    const files = [];
    
    const scan = (currentDir) => {
      if (!fs.existsSync(currentDir)) return;
      
      fs.readdirSync(currentDir).forEach(item => {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scan(fullPath);
        } else if (extensions.some(ext => item.endsWith(ext))) {
          files.push(fullPath);
        }
      });
    };
    
    scan(dir);
    return files;
  }

  generateReport() {
    console.log('📊 STABILITY FRAMEWORK COMPLIANCE REPORT\n');
    console.log('=' .repeat(50));
    
    if (this.violations.length === 0 && this.warnings.length === 0) {
      console.log('✅ ALL CHECKS PASSED - Framework compliant!');
      console.log('🎉 Ready for commit\n');
      return;
    }
    
    if (this.violations.length > 0) {
      console.log('\n❌ VIOLATIONS (must fix):');
      this.violations.forEach(v => console.log(v));
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️ WARNINGS:');
      this.warnings.forEach(w => console.log(w));
    }
    
    console.log('\n' + '=' .repeat(50));
    console.log(`Total Issues: ${this.violations.length + this.warnings.length}`);
    
    if (this.violations.length > 0) {
      console.log('\n🚫 COMMIT BLOCKED - Fix violations first');
      process.exit(1);
    }
  }
}

// Run compliance check
async function main() {
  const checker = new StabilityComplianceChecker();
  const passed = await checker.checkAll();
  
  if (!passed) {
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = StabilityComplianceChecker;