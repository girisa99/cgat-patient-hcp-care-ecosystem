/**
 * Vite Plugin for Stability Framework
 * Integrates stability checks into the build process
 */

import fs from 'fs';
import path from 'path';

const NAMING_PATTERNS = {
  component: /^[A-Z][a-zA-Z0-9]*\.tsx?$/,
  hook: /^use[A-Z][a-zA-Z0-9]*\.tsx?$/,
  service: /^[a-z][a-zA-Z0-9]*Service\.ts$/,
  type: /^[A-Z][a-zA-Z0-9]*\.ts$/
};

export default function stabilityFrameworkPlugin(options = {}) {
  const config = {
    enabled: true,
    failOnViolations: false,
    warnOnDuplicates: true,
    checkNaming: true,
    checkComplexity: true,
    maxComplexity: 10,
    ...options
  };

  let violations = [];
  let warnings = [];

  return {
    name: 'stability-framework',
    
    buildStart() {
      if (!config.enabled) return;
      
      violations = [];
      warnings = [];
      console.log('\n🔧 Stability Framework: Starting build checks...');
    },

    transform(code, id) {
      if (!config.enabled) return;
      if (!/\.(ts|tsx|js|jsx)$/.test(id)) return;

      const filename = path.basename(id);
      const dirname = path.dirname(id);

      // Check naming conventions
      if (config.checkNaming) {
        this.checkNamingConventions(filename, dirname, id);
      }

      // Check file complexity
      if (config.checkComplexity) {
        this.checkComplexity(code, id);
      }

      // Check for duplicates
      if (config.warnOnDuplicates) {
        this.checkForDuplicates(code, id);
      }

      return null;
    },

    buildEnd() {
      if (!config.enabled) return;

      const totalIssues = violations.length + warnings.length;
      
      if (totalIssues > 0) {
        console.log('\n📊 Stability Framework Build Report:');
        
        if (violations.length > 0) {
          console.log('\n❌ Violations:');
          violations.forEach((violation, index) => {
            console.log(`  ${index + 1}. ${violation}`);
          });
        }

        if (warnings.length > 0) {
          console.log('\n⚠️  Warnings:');
          warnings.forEach((warning, index) => {
            console.log(`  ${index + 1}. ${warning}`);
          });
        }

        console.log(`\n📈 Summary: ${violations.length} violations, ${warnings.length} warnings`);

        if (config.failOnViolations && violations.length > 0) {
          throw new Error(`Build failed due to ${violations.length} stability framework violations`);
        }
      } else {
        console.log('\n✅ Stability Framework: All checks passed!');
      }
    },

    checkNamingConventions(filename, dirname, fullPath) {
      const relativePath = path.relative(process.cwd(), fullPath);

      // Check component naming
      if (dirname.includes('components') && !NAMING_PATTERNS.component.test(filename)) {
        violations.push(`Naming: "${relativePath}" should follow PascalCase (e.g., ComponentName.tsx)`);
      }

      // Check hook naming
      if (dirname.includes('hooks') && !NAMING_PATTERNS.hook.test(filename)) {
        violations.push(`Naming: "${relativePath}" should start with "use" and follow camelCase`);
      }

      // Check service naming
      if (dirname.includes('services') && !NAMING_PATTERNS.service.test(filename)) {
        violations.push(`Naming: "${relativePath}" should end with "Service" and follow camelCase`);
      }

      // Check type naming
      if (dirname.includes('types') && !NAMING_PATTERNS.type.test(filename)) {
        violations.push(`Naming: "${relativePath}" should follow PascalCase (e.g., TypeName.ts)`);
      }
    },

    checkComplexity(code, fullPath) {
      const relativePath = path.relative(process.cwd(), fullPath);
      const complexity = this.calculateComplexity(code);

      if (complexity > config.maxComplexity) {
        warnings.push(`Complexity: "${relativePath}" has complexity ${complexity} (max: ${config.maxComplexity})`);
      }
    },

    calculateComplexity(code) {
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
        const matches = code.match(pattern);
        return total + (matches ? matches.length : 0);
      }, 1);
    },

    checkForDuplicates(code, fullPath) {
      // Simple duplicate detection - in a real implementation,
      // you'd want more sophisticated similarity detection
      const lines = code.split('\n').filter(line => line.trim().length > 0);
      
      if (lines.length > 200) {
        const relativePath = path.relative(process.cwd(), fullPath);
        warnings.push(`Size: "${relativePath}" is quite large (${lines.length} lines). Consider breaking it down.`);
      }
    }
  };
};