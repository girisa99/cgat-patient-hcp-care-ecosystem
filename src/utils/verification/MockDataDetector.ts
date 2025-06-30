
/**
 * Mock Data Detector
 * Prevents use of mock/dummy data in production code
 * Enforces real database data usage
 */

import * as fs from 'fs';
import * as path from 'path';

export interface MockDataViolation {
  filePath: string;
  lineNumber: number;
  content: string;
  violationType: 'mock_data' | 'dummy_data' | 'placeholder_data' | 'test_data_in_prod';
  severity: 'high' | 'medium' | 'low';
  suggestion: string;
}

export interface MockDataAnalysis {
  violations: MockDataViolation[];
  cleanFiles: string[];
  suspiciousPatterns: string[];
  databaseUsageScore: number; // 0-100, higher = more real database usage
}

export class MockDataDetector {
  private static srcDirectory = 'src';
  
  // Patterns that indicate mock/dummy data usage
  private static mockDataPatterns = [
    // Direct mock data indicators
    /mock(?:ed)?[\s_-]?data/gi,
    /dummy[\s_-]?data/gi,
    /fake[\s_-]?data/gi,
    /test[\s_-]?data/gi,
    /placeholder[\s_-]?data/gi,
    /sample[\s_-]?data/gi,
    
    // Mock objects and arrays
    /const\s+\w*mock\w*/gi,
    /const\s+\w*dummy\w*/gi,
    /const\s+\w*fake\w*/gi,
    /const\s+\w*sample\w*/gi,
    
    // Hardcoded data that looks like mocks
    /\[\s*{\s*id:\s*['"]?\d+['"]?/gi,
    /\[\s*{\s*name:\s*['"](?:John|Jane|Test|Sample|Mock)/gi,
    /email:\s*['"](?:test@|mock@|dummy@|sample@)/gi,
    
    // Lorem ipsum and other placeholder text
    /lorem\s+ipsum/gi,
    /dolor\s+sit\s+amet/gi,
    
    // Common test/mock values
    /['"](?:test|mock|dummy|fake|sample)(?:_|\s|-)?(?:user|data|value)/gi,
    /userId:\s*['"]?(?:test|mock|dummy)/gi,
    
    // Hardcoded arrays with repetitive data
    /\[\s*(?:['"][^'"]*['"],?\s*){5,}/g, // Arrays with 5+ string literals
  ];

  // Patterns that indicate real database usage (positive indicators)
  private static realDataPatterns = [
    /supabase\.from\(/gi,
    /\.select\(/gi,
    /\.insert\(/gi,
    /\.update\(/gi,
    /\.delete\(/gi,
    /useQuery\(/gi,
    /useMutation\(/gi,
    /from\s+auth\.users/gi,
    /from\s+public\./gi,
  ];

  // File patterns to exclude from analysis
  private static excludePatterns = [
    /\.test\./,
    /\.spec\./,
    /\.stories\./,
    /\/tests?\//,
    /\/mocks?\//,
    /\/fixtures?\//,
    /\/storybook/,
    /seed[Dd]ata/,
  ];

  /**
   * Analyze codebase for mock data usage
   */
  static async analyzeMockDataUsage(): Promise<MockDataAnalysis> {
    console.log('🔍 Analyzing codebase for mock data usage...');

    const violations: MockDataViolation[] = [];
    const cleanFiles: string[] = [];
    const suspiciousPatterns: string[] = [];
    let totalFiles = 0;
    let realDatabaseUsageCount = 0;

    try {
      await this.scanDirectory(this.srcDirectory, violations, cleanFiles, suspiciousPatterns);
      
      // Calculate database usage score
      totalFiles = violations.length + cleanFiles.length;
      realDatabaseUsageCount = await this.countRealDatabaseUsage();
      const databaseUsageScore = totalFiles > 0 ? 
        Math.round(((totalFiles - violations.length) / totalFiles) * 100) : 100;

      console.log(`✅ Mock data analysis completed:
        - Violations found: ${violations.length}
        - Clean files: ${cleanFiles.length}
        - Database usage score: ${databaseUsageScore}/100
        - Real database patterns: ${realDatabaseUsageCount}`);

      return {
        violations,
        cleanFiles,
        suspiciousPatterns: [...new Set(suspiciousPatterns)],
        databaseUsageScore
      };

    } catch (error) {
      console.error('❌ Mock data analysis failed:', error);
      return {
        violations: [],
        cleanFiles: [],
        suspiciousPatterns: [],
        databaseUsageScore: 0
      };
    }
  }

  /**
   * Recursively scan directory for mock data violations
   */
  private static async scanDirectory(
    dirPath: string,
    violations: MockDataViolation[],
    cleanFiles: string[],
    suspiciousPatterns: string[]
  ): Promise<void> {
    if (!fs.existsSync(dirPath)) return;

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules and other irrelevant directories
        if (!['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
          await this.scanDirectory(fullPath, violations, cleanFiles, suspiciousPatterns);
        }
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
        // Skip test files and other excluded patterns
        if (this.excludePatterns.some(pattern => pattern.test(fullPath))) {
          continue;
        }

        await this.analyzeFile(fullPath, violations, cleanFiles, suspiciousPatterns);
      }
    }
  }

  /**
   * Analyze individual file for mock data violations
   */
  private static async analyzeFile(
    filePath: string,
    violations: MockDataViolation[],
    cleanFiles: string[],
    suspiciousPatterns: string[]
  ): Promise<void> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      let hasViolations = false;

      // Check each line for mock data patterns
      lines.forEach((line, index) => {
        this.mockDataPatterns.forEach(pattern => {
          const matches = line.match(pattern);
          if (matches) {
            matches.forEach(match => {
              violations.push({
                filePath,
                lineNumber: index + 1,
                content: line.trim(),
                violationType: this.categorizeViolation(match, line),
                severity: this.assessSeverity(match, line),
                suggestion: this.generateSuggestion(match, line)
              });
              
              suspiciousPatterns.push(match);
              hasViolations = true;
            });
          }
        });
      });

      // Check for specific mock data structures
      this.detectMockDataStructures(content, filePath, violations);

      if (!hasViolations) {
        cleanFiles.push(filePath);
      }

    } catch (error) {
      console.warn(`⚠️ Failed to analyze file ${filePath}:`, error);
    }
  }

  /**
   * Detect mock data structures (objects, arrays)
   */
  private static detectMockDataStructures(
    content: string,
    filePath: string,
    violations: MockDataViolation[]
  ): void {
    // Look for suspicious data structures
    const suspiciousStructures = [
      // Arrays of objects with repetitive test data
      /const\s+\w+\s*=\s*\[\s*{\s*id:\s*1[^}]*},\s*{\s*id:\s*2[^}]*}/g,
      
      // Objects with obvious test values
      /{\s*name:\s*['"](?:Test|Sample|Mock|Demo)\s*\w*['"][^}]*}/g,
      
      // Hardcoded user arrays
      /users?\s*=\s*\[\s*{[^}]*name[^}]*}[^;]*;/g,
    ];

    suspiciousStructures.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const lineNumber = content.substring(0, match.index).split('\n').length;
        
        violations.push({
          filePath,
          lineNumber,
          content: match[0].substring(0, 100) + '...',
          violationType: 'mock_data',
          severity: 'high',
          suggestion: 'Replace with real database query or API call'
        });
      }
    });
  }

  /**
   * Categorize the type of violation
   */
  private static categorizeViolation(match: string, line: string): MockDataViolation['violationType'] {
    const lowerMatch = match.toLowerCase();
    
    if (lowerMatch.includes('mock')) {
      return 'mock_data';
    } else if (lowerMatch.includes('dummy') || lowerMatch.includes('fake')) {
      return 'dummy_data';
    } else if (lowerMatch.includes('placeholder') || lowerMatch.includes('lorem')) {
      return 'placeholder_data';
    } else if (lowerMatch.includes('test') && !line.includes('.test.') && !line.includes('.spec.')) {
      return 'test_data_in_prod';
    }
    
    return 'mock_data';
  }

  /**
   * Assess severity of violation
   */
  private static assessSeverity(match: string, line: string): MockDataViolation['severity'] {
    const lowerMatch = match.toLowerCase();
    const lowerLine = line.toLowerCase();
    
    // High severity: Production code with obvious mock data
    if (lowerLine.includes('const') && (lowerMatch.includes('mock') || lowerMatch.includes('dummy'))) {
      return 'high';
    }
    
    // High severity: Hardcoded user data
    if (lowerLine.includes('users') || lowerLine.includes('email') || lowerLine.includes('password')) {
      return 'high';
    }
    
    // Medium severity: Placeholder content
    if (lowerMatch.includes('placeholder') || lowerMatch.includes('lorem')) {
      return 'medium';
    }
    
    // Low severity: Comments or variable names only
    if (lowerLine.includes('//') || lowerLine.includes('/*')) {
      return 'low';
    }
    
    return 'medium';
  }

  /**
   * Generate suggestion for fixing violation
   */
  private static generateSuggestion(match: string, line: string): string {
    const lowerMatch = match.toLowerCase();
    const lowerLine = line.toLowerCase();
    
    if (lowerMatch.includes('mock') || lowerMatch.includes('dummy')) {
      return 'Replace with supabase.from() query to fetch real data from database';
    }
    
    if (lowerMatch.includes('test') && lowerLine.includes('user')) {
      return 'Use auth.users table or profiles table for real user data';
    }
    
    if (lowerMatch.includes('placeholder')) {
      return 'Replace with dynamic content from database or API';
    }
    
    if (lowerLine.includes('email') || lowerLine.includes('password')) {
      return 'CRITICAL: Remove hardcoded credentials, use environment variables or database';
    }
    
    return 'Replace mock data with real database queries using Supabase client';
  }

  /**
   * Count real database usage patterns
   */
  private static async countRealDatabaseUsage(): Promise<number> {
    let count = 0;

    const countInDirectory = async (dirPath: string): Promise<void> => {
      if (!fs.existsSync(dirPath)) return;

      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory() && !['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
          await countInDirectory(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
          try {
            const content = fs.readFileSync(fullPath, 'utf-8');
            this.realDataPatterns.forEach(pattern => {
              const matches = content.match(pattern);
              if (matches) {
                count += matches.length;
              }
            });
          } catch (error) {
            // Skip files that can't be read
          }
        }
      }
    };

    await countInDirectory(this.srcDirectory);
    return count;
  }

  /**
   * Generate comprehensive report
   */
  static generateMockDataReport(analysis: MockDataAnalysis): string {
    const { violations, cleanFiles, suspiciousPatterns, databaseUsageScore } = analysis;

    let report = `
# Mock Data Detection Report
Generated: ${new Date().toISOString()}

## Summary
- **Database Usage Score**: ${databaseUsageScore}/100
- **Total Violations**: ${violations.length}
- **Clean Files**: ${cleanFiles.length}
- **Suspicious Patterns**: ${suspiciousPatterns.length}

## Violations by Severity
- **High**: ${violations.filter(v => v.severity === 'high').length}
- **Medium**: ${violations.filter(v => v.severity === 'medium').length}
- **Low**: ${violations.filter(v => v.severity === 'low').length}

## Violations by Type
- **Mock Data**: ${violations.filter(v => v.violationType === 'mock_data').length}
- **Dummy Data**: ${violations.filter(v => v.violationType === 'dummy_data').length}
- **Placeholder Data**: ${violations.filter(v => v.violationType === 'placeholder_data').length}
- **Test Data in Production**: ${violations.filter(v => v.violationType === 'test_data_in_prod').length}

## Critical Issues
${violations.filter(v => v.severity === 'high').map(v => 
  `- ${v.filePath}:${v.lineNumber} - ${v.suggestion}`
).join('\n')}

## Recommendations
1. Replace all mock data with real Supabase queries
2. Use environment variables for configuration data
3. Implement proper data fetching hooks
4. Remove hardcoded test values from production code
5. Use TypeScript interfaces to ensure data consistency

## Next Steps
1. Fix high-severity violations immediately
2. Implement real database queries
3. Add validation for production data usage
4. Set up automated checks in CI/CD pipeline
`;

    return report;
  }

  /**
   * Quick check if file contains mock data
   */
  static async quickMockDataCheck(filePath: string): Promise<boolean> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      
      return this.mockDataPatterns.some(pattern => pattern.test(content));
    } catch (error) {
      return false;
    }
  }
}
