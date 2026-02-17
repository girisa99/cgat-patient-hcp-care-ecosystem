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
// =============================================================================
// BANNED BRANDING TERMS (Auto-enforced)
// See docs/BRANDING_GLOSSARY.md for full context
// =============================================================================

interface BannedTerm {
  pattern: RegExp;
  label: string;
  replacement: string;
  /** Paths where this term is allowed (e.g., folder names, DB table refs) */
  allowedContexts?: RegExp[];
}

const BANNED_TERMS: BannedTerm[] = [
  {
    pattern: /\bGenie\s+Arc\b/gi,
    label: 'Genie Arc',
    replacement: 'Genie Hub',
    allowedContexts: [
      /BRANDING_GLOSSARY\.md/,         // The glossary itself documents old names
      /validate-product-structure\.ts/, // This script
    ],
  },
  {
    pattern: /\bCosyVoice\b/gi,
    label: 'CosyVoice',
    replacement: 'Qwen3-TTS',
    allowedContexts: [
      /BRANDING_GLOSSARY\.md/,
      /validate-product-structure\.ts/,
    ],
  },
  {
    pattern: /\bcosyvoice\b/gi,
    label: 'cosyvoice (lowercase)',
    replacement: 'qwen3-tts',
    allowedContexts: [
      /BRANDING_GLOSSARY\.md/,
      /validate-product-structure\.ts/,
    ],
  },
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

interface BrandingViolation {
  file: string;
  line: number;
  term: string;
  replacement: string;
  context: string;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  brandingViolations: BrandingViolation[];
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

function getAllFiles(dir: string, files: string[] = [], extensions = ['.ts', '.tsx']): string[] {
  if (shouldIgnore(dir)) return files;
  
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      if (shouldIgnore(fullPath)) continue;
      
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        getAllFiles(fullPath, files, extensions);
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Ignore permission errors
  }
  
  return files;
}

// =============================================================================
// BRANDING TERM VALIDATION
// =============================================================================

function validateBrandingTerms(filePath: string): BrandingViolation[] {
  const violations: BrandingViolation[] = [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    for (const banned of BANNED_TERMS) {
      // Skip if this file is in allowed contexts
      if (banned.allowedContexts?.some(ctx => ctx.test(filePath))) continue;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (banned.pattern.test(line)) {
          // Reset regex lastIndex since we use /g flag
          banned.pattern.lastIndex = 0;
          violations.push({
            file: filePath,
            line: i + 1,
            term: banned.label,
            replacement: banned.replacement,
            context: line.trim().substring(0, 120),
          });
        }
      }
    }
  } catch (error) {
    // Ignore read errors
  }
  
  return violations;
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
  const brandingViolations: BrandingViolation[] = [];
  const warnings: string[] = [];
  let genieFiles = 0;
  let healthcareFiles = 0;
  let sharedFiles = 0;
  
  // Scan src directory (ts/tsx)
  const srcFiles = getAllFiles('./src');
  
  // Scan supabase functions (ts/tsx)
  const supabaseFiles = getAllFiles('./supabase/functions');
  
  // Scan docs (md files) for branding violations
  const docFiles = getAllFiles('./docs', [], ['.md']);
  
  const codeFiles = [...srcFiles, ...supabaseFiles];
  const allFilesForBranding = [...codeFiles, ...docFiles];
  
  for (const file of codeFiles) {
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
  
  // Validate branding terms across ALL files (code + docs)
  for (const file of allFilesForBranding) {
    const violations = validateBrandingTerms(file);
    brandingViolations.push(...violations);
  }
  
  return {
    valid: errors.length === 0 && brandingViolations.length === 0,
    errors,
    brandingViolations,
    warnings,
    stats: {
      filesScanned: allFilesForBranding.length,
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
  console.log('🔍 Validating product structure & branding...\n');
  
  const result = validateStructure();
  
  console.log('📊 Stats:');
  console.log(`   Files scanned: ${result.stats.filesScanned}`);
  console.log(`   Genie files: ${result.stats.genieFiles}`);
  console.log(`   Healthcare files: ${result.stats.healthcareFiles}`);
  console.log(`   Shared files: ${result.stats.sharedFiles}`);
  console.log('');
  
  let hasFailure = false;
  
  if (result.errors.length > 0) {
    hasFailure = true;
    console.log('❌ Structure Validation FAILED\n');
    console.log('Misplaced files:');
    for (const error of result.errors) {
      console.log(`\n  📁 ${error.file}`);
      console.log(`     Pattern: ${error.pattern}`);
      console.log(`     Product: ${error.product}`);
      console.log(`     Expected: ${error.expectedLocation}`);
    }
  } else {
    console.log('✅ Structure Validation PASSED');
  }
  
  console.log('');
  
  if (result.brandingViolations.length > 0) {
    hasFailure = true;
    console.log(`❌ Branding Validation FAILED — ${result.brandingViolations.length} violation(s)\n`);
    console.log('   See docs/BRANDING_GLOSSARY.md for correct terms.\n');
    for (const v of result.brandingViolations) {
      console.log(`  📛 ${v.file}:${v.line}`);
      console.log(`     Banned: "${v.term}" → Use: "${v.replacement}"`);
      console.log(`     Context: ${v.context}`);
      console.log('');
    }
  } else {
    console.log('✅ Branding Validation PASSED — No banned terms found');
  }
  
  if (hasFailure) {
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { validateStructure, ValidationResult, ValidationError, BrandingViolation };
