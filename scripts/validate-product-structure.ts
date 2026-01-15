/**
 * PRODUCT STRUCTURE VALIDATOR
 * 
 * This script validates that files are placed in the correct product folders.
 * Run this as part of CI/CD or pre-commit hooks.
 * 
 * Usage:
 *   npx ts-node scripts/validate-product-structure.ts
 *   npm run validate:structure
 */

import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// CONFIGURATION
// =============================================================================

const GENIE_PATTERNS = [
  'genie', 'vibe', 'studio', 'production-hub', 'content-tools',
  'social-publish', 'bulk-video', 'thumbnail', 'script-video',
  'voice-clone', 'music-composer', 'voice-director', 'distribution-agent'
];

const HEALTHCARE_PATTERNS = [
  'patient', 'facility', 'enrollment', 'medical', 'therapy', 'treatment',
  'hipaa', 'fax', 'docusign', 'npi', 'medication', 'insurance',
  'whatsapp-consent', 'healthcare-agentic'
];

const GENIE_ALLOWED_PATHS = [
  'src/genie-studio/',
  'src/components/genie-studio/',
  'src/components/genie-vibe/',
  'src/components/genie/',
  'src/components/genie-analytics/',
  'src/components/genie-management/',
  'src/components/genie-spark/',
  'src/components/configurable-genie/',
  'src/components/public-genie/',
  'src/components/content/',
  'src/components/bulk-processing/',
  'src/components/publish/',
  'src/components/production/',
  'supabase/functions/genie/',
];

const HEALTHCARE_ALLOWED_PATHS = [
  'src/healthcare/',
  'src/components/healthcare/',
  'src/components/patients/',
  'src/components/facilities/',
  'src/components/onboarding/',
  'src/components/enrollment/',
  'src/components/document-processing/',
  'src/components/patient-enrollment/',
  'src/components/therapy/',
  'src/components/treatment-centers/',
  'supabase/functions/healthcare/',
];

// Files/folders to ignore
const IGNORE_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'coverage',
  '__tests__',
  '.husky',
];

// =============================================================================
// VALIDATION LOGIC
// =============================================================================

interface ValidationError {
  file: string;
  pattern: string;
  expectedLocation: string;
  product: 'genie-studio' | 'healthcare';
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: string[];
  stats: {
    filesScanned: number;
    genieFiles: number;
    healthcareFiles: number;
    sharedFiles: number;
  };
}

function shouldIgnore(filePath: string): boolean {
  return IGNORE_PATTERNS.some(pattern => filePath.includes(pattern));
}

function matchesPatterns(fileName: string, patterns: string[]): string | null {
  const lowerFileName = fileName.toLowerCase();
  for (const pattern of patterns) {
    if (lowerFileName.includes(pattern.toLowerCase())) {
      return pattern;
    }
  }
  return null;
}

function isInAllowedPath(filePath: string, allowedPaths: string[]): boolean {
  return allowedPaths.some(allowed => filePath.includes(allowed));
}

function getAllFiles(dir: string, files: string[] = []): string[] {
  if (shouldIgnore(dir)) return files;
  
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      if (shouldIgnore(fullPath)) continue;
      
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        getAllFiles(fullPath, files);
      } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Ignore permission errors
  }
  
  return files;
}

function validateFile(filePath: string): ValidationError | null {
  const fileName = path.basename(filePath);
  
  // Check for Genie patterns
  const geniePattern = matchesPatterns(fileName, GENIE_PATTERNS);
  if (geniePattern && !isInAllowedPath(filePath, GENIE_ALLOWED_PATHS)) {
    // Also check if it's in shared (allowed)
    if (filePath.includes('src/shared/') || filePath.includes('src/hooks/') || filePath.includes('src/services/')) {
      return null; // Hooks and services can be in current location during transition
    }
    return {
      file: filePath,
      pattern: geniePattern,
      expectedLocation: 'src/genie-studio/ or src/components/genie-*/',
      product: 'genie-studio',
    };
  }
  
  // Check for Healthcare patterns
  const healthcarePattern = matchesPatterns(fileName, HEALTHCARE_PATTERNS);
  if (healthcarePattern && !isInAllowedPath(filePath, HEALTHCARE_ALLOWED_PATHS)) {
    if (filePath.includes('src/shared/') || filePath.includes('src/hooks/') || filePath.includes('src/services/')) {
      return null; // Allow during transition
    }
    return {
      file: filePath,
      pattern: healthcarePattern,
      expectedLocation: 'src/healthcare/ or src/components/healthcare/',
      product: 'healthcare',
    };
  }
  
  return null;
}

function validateStructure(): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];
  let genieFiles = 0;
  let healthcareFiles = 0;
  let sharedFiles = 0;
  
  // Scan src directory
  const srcFiles = getAllFiles('./src');
  
  // Scan supabase functions
  const supabaseFiles = getAllFiles('./supabase/functions');
  
  const allFiles = [...srcFiles, ...supabaseFiles];
  
  for (const file of allFiles) {
    // Count file types
    const fileName = path.basename(file).toLowerCase();
    if (matchesPatterns(fileName, GENIE_PATTERNS)) {
      genieFiles++;
    } else if (matchesPatterns(fileName, HEALTHCARE_PATTERNS)) {
      healthcareFiles++;
    } else {
      sharedFiles++;
    }
    
    // Validate placement
    const error = validateFile(file);
    if (error) {
      errors.push(error);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats: {
      filesScanned: allFiles.length,
      genieFiles,
      healthcareFiles,
      sharedFiles,
    },
  };
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

function main() {
  console.log('🔍 Validating product structure...\n');
  
  const result = validateStructure();
  
  console.log('📊 Stats:');
  console.log(`   Files scanned: ${result.stats.filesScanned}`);
  console.log(`   Genie files: ${result.stats.genieFiles}`);
  console.log(`   Healthcare files: ${result.stats.healthcareFiles}`);
  console.log(`   Shared files: ${result.stats.sharedFiles}`);
  console.log('');
  
  if (result.errors.length > 0) {
    console.log('❌ Validation FAILED\n');
    console.log('Misplaced files:');
    for (const error of result.errors) {
      console.log(`\n  📁 ${error.file}`);
      console.log(`     Pattern: ${error.pattern}`);
      console.log(`     Product: ${error.product}`);
      console.log(`     Expected: ${error.expectedLocation}`);
    }
    process.exit(1);
  } else {
    console.log('✅ Validation PASSED');
    console.log('   All files are in correct product folders.');
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { validateStructure, ValidationResult, ValidationError };
