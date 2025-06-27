
/**
 * Canonical Source Validator
 * 
 * Validates that components are properly marked as canonical sources
 * and enforces the documentation standards
 */

export interface ValidationRule {
  name: string;
  description: string;
  check: (content: string, filePath: string) => boolean;
  fix?: (content: string) => string;
}

export class CanonicalSourceValidator {
  private validationRules: ValidationRule[] = [
    {
      name: 'has-canonical-header',
      description: 'Component should have canonical source documentation header',
      check: (content) => content.includes('CANONICAL SOURCE OF TRUTH'),
    },
    {
      name: 'has-usage-locations',
      description: 'Component should document its usage locations',
      check: (content) => content.includes('USAGE LOCATIONS:'),
    },
    {
      name: 'has-features-list',
      description: 'Component should list its features',
      check: (content) => content.includes('FEATURES:'),
    },
    {
      name: 'has-modification-guidelines',
      description: 'Component should have modification guidelines',
      check: (content) => content.includes('MODIFICATIONS:'),
    },
    {
      name: 'has-maintainer-info',
      description: 'Component should specify maintainer',
      check: (content) => content.includes('MAINTAINER:'),
    }
  ];

  /**
   * Validate a component file
   */
  validateComponent(content: string, filePath: string): {
    isValid: boolean;
    passedRules: string[];
    failedRules: string[];
    score: number;
  } {
    const passedRules: string[] = [];
    const failedRules: string[] = [];

    for (const rule of this.validationRules) {
      if (rule.check(content, filePath)) {
        passedRules.push(rule.name);
      } else {
        failedRules.push(rule.name);
      }
    }

    const score = (passedRules.length / this.validationRules.length) * 100;
    const isValid = score >= 80; // 80% threshold

    return {
      isValid,
      passedRules,
      failedRules,
      score
    };
  }

  /**
   * Generate validation report
   */
  generateValidationReport(results: Array<{
    filePath: string;
    isValid: boolean;
    score: number;
    failedRules: string[];
  }>): string {
    let report = '🔍 CANONICAL SOURCE VALIDATION REPORT\n';
    report += '=' .repeat(50) + '\n\n';

    const validComponents = results.filter(r => r.isValid);
    const invalidComponents = results.filter(r => !r.isValid);

    report += `✅ Valid Components: ${validComponents.length}\n`;
    report += `❌ Invalid Components: ${invalidComponents.length}\n`;
    report += `📊 Overall Compliance: ${((validComponents.length / results.length) * 100).toFixed(1)}%\n\n`;

    if (invalidComponents.length > 0) {
      report += '❌ COMPONENTS NEEDING ATTENTION:\n';
      report += '-'.repeat(40) + '\n';

      for (const component of invalidComponents) {
        report += `📁 ${component.filePath}\n`;
        report += `📊 Score: ${component.score.toFixed(1)}%\n`;
        report += `⚠️  Missing:\n`;
        component.failedRules.forEach(rule => {
          const ruleInfo = this.validationRules.find(r => r.name === rule);
          report += `   • ${ruleInfo?.description || rule}\n`;
        });
        report += '\n';
      }
    }

    return report;
  }
}

export const validateCanonicalSources = async (filePaths: string[]): Promise<string> => {
  const validator = new CanonicalSourceValidator();
  const results = [];

  // In a real implementation, we would read each file and validate it
  // For now, return a sample report
  return validator.generateValidationReport([]);
};
