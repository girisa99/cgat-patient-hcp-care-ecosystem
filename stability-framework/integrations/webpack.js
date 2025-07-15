/**
 * Webpack Integration for Stability Framework
 */

import fs from 'fs';
import path from 'path';

export class WebpackStabilityPlugin {
  constructor(options = {}) {
    this.options = {
      enabled: true,
      failOnViolations: false,
      enableNamingChecks: true,
      enableComplexityChecks: true,
      maxComplexity: 10,
      excludePatterns: [/node_modules/, /\.test\./],
      ...options
    };
    
    this.violations = [];
    this.warnings = [];
  }

  apply(compiler) {
    if (!this.options.enabled) return;

    const pluginName = 'WebpackStabilityPlugin';

    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      this.violations = [];
      this.warnings = [];

      compilation.hooks.buildModule.tap(pluginName, (module) => {
        if (this.shouldProcessModule(module)) {
          this.processModule(module);
        }
      });

      compilation.hooks.seal.tap(pluginName, () => {
        this.reportResults();
        
        if (this.options.failOnViolations && this.violations.length > 0) {
          compilation.errors.push(
            new Error(`Stability Framework: ${this.violations.length} violations detected`)
          );
        }
      });
    });
  }

  shouldProcessModule(module) {
    if (!module.resource) return false;
    if (!/\.(ts|tsx|js|jsx)$/.test(module.resource)) return false;
    
    for (const pattern of this.options.excludePatterns) {
      if (pattern.test(module.resource)) return false;
    }
    
    return true;
  }

  processModule(module) {
    try {
      const source = this.getModuleSource(module);
      if (!source) return;

      const filename = path.basename(module.resource);
      const dirname = path.dirname(module.resource);

      if (this.options.enableNamingChecks) {
        this.checkNaming(module.resource, filename, dirname);
      }

      if (this.options.enableComplexityChecks) {
        this.checkComplexity(module.resource, source);
      }
    } catch (error) {
      console.warn(`⚠️ Error processing module ${module.resource}:`, error.message);
    }
  }

  getModuleSource(module) {
    try {
      if (fs.existsSync(module.resource)) {
        return fs.readFileSync(module.resource, 'utf-8');
      }
    } catch (error) {
      return null;
    }
    return null;
  }

  checkNaming(resourcePath, filename, dirname) {
    const relativePath = path.relative(process.cwd(), resourcePath);
    
    if (dirname.includes('components')) {
      if (!/^[A-Z][a-zA-Z0-9]*\.(tsx?|jsx?)$/.test(filename)) {
        this.violations.push({
          type: 'naming',
          severity: 'error',
          message: `Component "${relativePath}" should follow PascalCase naming`,
          file: relativePath
        });
      }
    }

    if (dirname.includes('hooks')) {
      if (!/^use[A-Z][a-zA-Z0-9]*\.(tsx?|jsx?)$/.test(filename)) {
        this.violations.push({
          type: 'naming',
          severity: 'error',
          message: `Hook "${relativePath}" should start with "use" and follow camelCase`,
          file: relativePath
        });
      }
    }
  }

  checkComplexity(resourcePath, source) {
    const complexity = this.calculateComplexity(source);
    const relativePath = path.relative(process.cwd(), resourcePath);
    
    if (complexity > this.options.maxComplexity) {
      this.warnings.push({
        type: 'complexity',
        severity: 'warning',
        message: `File "${relativePath}" has high complexity: ${complexity}`,
        file: relativePath,
        complexity
      });
    }
  }

  calculateComplexity(source) {
    const patterns = [
      /\bif\s*\(/g, /\belse\s*{/g, /\bwhile\s*\(/g, /\bfor\s*\(/g,
      /\bswitch\s*\(/g, /\bcatch\s*\(/g, /&&/g, /\|\|/g, /\?.*:/g
    ];
    
    return patterns.reduce((total, pattern) => {
      const matches = source.match(pattern);
      return total + (matches ? matches.length : 0);
    }, 1);
  }

  reportResults() {
    const totalIssues = this.violations.length + this.warnings.length;
    
    if (totalIssues > 0) {
      console.log('\n📊 Stability Framework Webpack Report:');
      
      if (this.violations.length > 0) {
        console.log('\n❌ Violations:');
        this.violations.forEach((violation, index) => {
          console.log(`  ${index + 1}. [${violation.severity.toUpperCase()}] ${violation.message}`);
        });
      }

      if (this.warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        this.warnings.forEach((warning, index) => {
          console.log(`  ${index + 1}. [${warning.severity.toUpperCase()}] ${warning.message}`);
        });
      }

      console.log(`\n📈 Summary: ${this.violations.length} violations, ${this.warnings.length} warnings`);
    }
  }
}

export default WebpackStabilityPlugin;