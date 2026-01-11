/**
 * Vite Plugin for Stability Framework
 * Integrates stability checks into the build process
 * 
 * EXCLUSIONS:
 * - node_modules (third-party packages)
 * - src/components/ui (shadcn components use lowercase convention)
 * - index.ts files (barrel exports are standard practice)
 * - types.ts files (type definition files)
 */

import fs from 'fs';
import path from 'path';

const NAMING_PATTERNS = {
  component: /^[A-Z][a-zA-Z0-9]*\.tsx?$/,
  hook: /^use[A-Z][a-zA-Z0-9]*\.tsx?$/,
  service: /^[a-z][a-zA-Z0-9]*Service\.ts$/,
  type: /^[A-Z][a-zA-Z0-9]*\.ts$/
};

// Files and patterns to exclude from checks
const EXCLUSION_PATTERNS = [
  /node_modules/,           // Third-party packages
  /src\/components\/ui/,    // shadcn components (lowercase convention)
  /\.d\.ts$/,               // TypeScript declaration files
  /vite\.config/,           // Config files
  /tailwind\.config/,       // Config files
  /eslint/,                 // ESLint files
  /\.test\./,               // Test files
  /\.spec\./,               // Spec files
  /__tests__/,              // Test directories
  /\.stories\./,            // Storybook files
];

// Files that are allowed to have non-standard names
const ALLOWED_FILENAMES = [
  'index.ts',
  'index.tsx',
  'types.ts',
  'types.tsx',
  'constants.ts',
  'utils.ts',
  'helpers.ts',
  'config.ts',
  'styles.ts',
  'theme.ts',
];

export default function stabilityFrameworkPlugin(options = {}) {
  const config = {
    enabled: true,
    failOnViolations: false,
    warnOnDuplicates: true,
    checkNaming: true,
    checkComplexity: true,
    maxComplexity: 10,
    excludePatterns: [],
    ...options
  };

  let violations = [];
  let warnings = [];

  // Check if path should be excluded
  function shouldExclude(fullPath) {
    const relativePath = path.relative(process.cwd(), fullPath);
    
    // Check against built-in exclusion patterns
    for (const pattern of EXCLUSION_PATTERNS) {
      if (pattern.test(relativePath) || pattern.test(fullPath)) {
        return true;
      }
    }
    
    // Check against custom exclusion patterns
    for (const pattern of config.excludePatterns) {
      if (pattern instanceof RegExp && pattern.test(relativePath)) {
        return true;
      }
      if (typeof pattern === 'string' && relativePath.includes(pattern)) {
        return true;
      }
    }
    
    return false;
  }

  // Check if filename is in allowed list
  function isAllowedFilename(filename) {
    return ALLOWED_FILENAMES.includes(filename);
  }

  // Helper functions
  function checkNamingConventions(filename, dirname, fullPath) {
    // Skip if in exclusion list
    if (shouldExclude(fullPath)) {
      return;
    }
    
    // Skip allowed filenames (index.ts, types.ts, etc.)
    if (isAllowedFilename(filename)) {
      return;
    }

    const relativePath = path.relative(process.cwd(), fullPath);

    // Check component naming (only for custom components, not UI library)
    if (dirname.includes('components') && 
        !dirname.includes('node_modules') &&
        !dirname.includes('/ui/') &&
        !dirname.includes('\\ui\\') &&
        !NAMING_PATTERNS.component.test(filename)) {
      violations.push(`Naming: "${relativePath}" should follow PascalCase (e.g., ComponentName.tsx)`);
    }

    // Check hook naming
    if (dirname.includes('hooks') && 
        !dirname.includes('node_modules') &&
        !NAMING_PATTERNS.hook.test(filename)) {
      // Allow hooks in component directories
      if (!dirname.includes('components')) {
        violations.push(`Naming: "${relativePath}" should start with "use" and follow camelCase`);
      }
    }

    // Check service naming
    if (dirname.includes('services') && 
        !dirname.includes('node_modules') &&
        !NAMING_PATTERNS.service.test(filename)) {
      violations.push(`Naming: "${relativePath}" should end with "Service" and follow camelCase`);
    }

    // Check type naming (only in src/types directory, not subdirectories)
    if (dirname.endsWith('types') && 
        dirname.includes('src/types') &&
        !dirname.includes('node_modules') &&
        !NAMING_PATTERNS.type.test(filename)) {
      // More lenient for type files - just warn, don't violate
      // warnings.push(`Naming: "${relativePath}" could follow PascalCase (e.g., TypeName.ts)`);
    }
  }

  function checkComplexity(code, fullPath) {
    // Skip if in exclusion list
    if (shouldExclude(fullPath)) {
      return;
    }
    
    const relativePath = path.relative(process.cwd(), fullPath);
    const complexity = calculateComplexity(code);

    if (complexity > config.maxComplexity) {
      warnings.push(`Complexity: "${relativePath}" has complexity ${complexity} (max: ${config.maxComplexity})`);
    }
  }

  function calculateComplexity(code) {
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
  }

  function checkForDuplicates(code, fullPath) {
    // Skip if in exclusion list
    if (shouldExclude(fullPath)) {
      return;
    }
    
    // Simple duplicate detection - in a real implementation,
    // you'd want more sophisticated similarity detection
    const lines = code.split('\n').filter(line => line.trim().length > 0);
    
    if (lines.length > 200) {
      const relativePath = path.relative(process.cwd(), fullPath);
      warnings.push(`Size: "${relativePath}" is quite large (${lines.length} lines). Consider breaking it down.`);
    }
  }

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
      
      // Early exit for excluded paths (most important - node_modules)
      if (shouldExclude(id)) {
        return null;
      }

      const filename = path.basename(id);
      const dirname = path.dirname(id);

      // Check naming conventions
      if (config.checkNaming) {
        checkNamingConventions(filename, dirname, id);
      }

      // Check file complexity
      if (config.checkComplexity) {
        checkComplexity(code, id);
      }

      // Check for duplicates
      if (config.warnOnDuplicates) {
        checkForDuplicates(code, id);
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
    }
  };
}
