
/**
 * Component Prop Validation System
 * Validates component props, TypeScript interfaces, and prop usage
 */

export interface PropValidationResult {
  validationScore: number;
  missingPropTypes: MissingPropType[];
  unusedProps: UnusedProp[];
  propMismatches: PropMismatch[];
  optionalityIssues: OptionalityIssue[];
  defaultValueIssues: DefaultValueIssue[];
  validationRecommendations: PropValidationRecommendation[];
}

export interface MissingPropType {
  componentName: string;
  filePath: string;
  propName: string;
  inferredType: string;
  usage: string[];
  confidence: 'high' | 'medium' | 'low';
}

export interface UnusedProp {
  componentName: string;
  filePath: string;
  propName: string;
  declaredType: string;
  lastUsed?: string;
}

export interface PropMismatch {
  componentName: string;
  filePath: string;
  propName: string;
  declaredType: string;
  actualUsage: string;
  usageLocations: string[];
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface OptionalityIssue {
  componentName: string;
  filePath: string;
  propName: string;
  declaredAsOptional: boolean;
  shouldBeOptional: boolean;
  hasDefaultValue: boolean;
  usagePattern: string;
}

export interface DefaultValueIssue {
  componentName: string;
  filePath: string;
  propName: string;
  hasDefaultValue: boolean;
  shouldHaveDefault: boolean;
  suggestedDefault?: any;
  reason: string;
}

export interface PropValidationRecommendation {
  priority: 'critical' | 'high' | 'medium' | 'low';
  type: 'type_safety' | 'prop_usage' | 'interface_design' | 'documentation';
  componentName: string;
  description: string;
  implementation: string;
  benefit: string;
}

export class ComponentPropValidator {
  /**
   * Validate component props across the application
   */
  static async validateComponentProps(): Promise<PropValidationResult> {
    console.log('⚛️ Validating component props and interfaces...');

    const missingPropTypes = this.detectMissingPropTypes();
    const unusedProps = this.detectUnusedProps();
    const propMismatches = this.detectPropMismatches();
    const optionalityIssues = this.detectOptionalityIssues();
    const defaultValueIssues = this.detectDefaultValueIssues();
    
    const validationRecommendations = this.generateValidationRecommendations(
      missingPropTypes, unusedProps, propMismatches, optionalityIssues
    );
    
    const validationScore = this.calculateValidationScore(
      missingPropTypes, unusedProps, propMismatches, optionalityIssues
    );

    const result: PropValidationResult = {
      validationScore,
      missingPropTypes,
      unusedProps,
      propMismatches,
      optionalityIssues,
      defaultValueIssues,
      validationRecommendations
    };

    console.log(`📊 Prop validation complete: ${validationScore}% validation score`);
    return result;
  }

  private static detectMissingPropTypes(): MissingPropType[] {
    // Mock implementation - would analyze actual React components
    return [
      {
        componentName: 'UserCard',
        filePath: 'src/components/users/UserCard.tsx',
        propName: 'user',
        inferredType: 'User',
        usage: ['user.name', 'user.email', 'user.role'],
        confidence: 'high'
      }
    ];
  }

  private static detectUnusedProps(): UnusedProp[] {
    return [
      {
        componentName: 'DataTable',
        filePath: 'src/components/shared/DataTable.tsx',
        propName: 'sortable',
        declaredType: 'boolean',
        lastUsed: '2024-01-15T10:00:00Z'
      }
    ];
  }

  private static detectPropMismatches(): PropMismatch[] {
    return [
      {
        componentName: 'StatusBadge',
        filePath: 'src/components/shared/StatusBadge.tsx',
        propName: 'status',
        declaredType: 'string',
        actualUsage: 'UserStatus | FacilityStatus',
        usageLocations: ['UsersList.tsx', 'FacilitiesList.tsx'],
        severity: 'high'
      }
    ];
  }

  private static detectOptionalityIssues(): OptionalityIssue[] {
    return [
      {
        componentName: 'CreateUserDialog',
        filePath: 'src/components/users/CreateUserDialog.tsx',
        propName: 'initialData',
        declaredAsOptional: false,
        shouldBeOptional: true,
        hasDefaultValue: false,
        usagePattern: 'Often called without this prop'
      }
    ];
  }

  private static detectDefaultValueIssues(): DefaultValueIssue[] {
    return [
      {
        componentName: 'DataTable',
        filePath: 'src/components/shared/DataTable.tsx',
        propName: 'pageSize',
        hasDefaultValue: false,
        shouldHaveDefault: true,
        suggestedDefault: 10,
        reason: 'Pagination component requires default page size'
      }
    ];
  }

  private static generateValidationRecommendations(
    missing: MissingPropType[],
    unused: UnusedProp[],
    mismatches: PropMismatch[],
    optionality: OptionalityIssue[]
  ): PropValidationRecommendation[] {
    const recommendations: PropValidationRecommendation[] = [];

    if (missing.length > 0) {
      recommendations.push({
        priority: 'high',
        type: 'type_safety',
        componentName: 'Multiple components',
        description: `Add proper TypeScript interfaces for ${missing.length} missing prop types`,
        implementation: 'Define interfaces and apply them to component props',
        benefit: 'Improves type safety and developer experience'
      });
    }

    if (mismatches.length > 0) {
      const criticalMismatches = mismatches.filter(m => m.severity === 'critical');
      if (criticalMismatches.length > 0) {
        recommendations.push({
          priority: 'critical',
          type: 'type_safety',
          componentName: 'Multiple components',
          description: `Fix ${criticalMismatches.length} critical prop type mismatches`,
          implementation: 'Update prop types to match actual usage patterns',
          benefit: 'Prevents runtime errors and improves reliability'
        });
      }
    }

    if (unused.length > 0) {
      recommendations.push({
        priority: 'medium',
        type: 'prop_usage',
        componentName: 'Multiple components',
        description: `Remove ${unused.length} unused props to simplify interfaces`,
        implementation: 'Remove unused props and update component interfaces',
        benefit: 'Simplifies component APIs and reduces confusion'
      });
    }

    return recommendations;
  }

  private static calculateValidationScore(
    missing: MissingPropType[],
    unused: UnusedProp[],
    mismatches: PropMismatch[],
    optionality: OptionalityIssue[]
  ): number {
    let score = 100;

    // Deduct for missing prop types
    score -= missing.length * 10;

    // Deduct for prop mismatches
    mismatches.forEach(mismatch => {
      const deduction = { critical: 25, high: 15, medium: 10, low: 5 }[mismatch.severity];
      score -= deduction;
    });

    // Deduct for unused props
    score -= unused.length * 5;

    // Deduct for optionality issues
    score -= optionality.length * 8;

    return Math.max(0, score);
  }

  /**
   * Generate component prop validation report
   */
  static generatePropValidationReport(result: PropValidationResult): string {
    let report = '⚛️ COMPONENT PROP VALIDATION REPORT\n';
    report += '=' .repeat(50) + '\n\n';

    report += `📊 VALIDATION SCORE: ${result.validationScore}%\n\n`;

    report += `📋 SUMMARY:\n`;
    report += `   Missing Prop Types: ${result.missingPropTypes.length}\n`;
    report += `   Unused Props: ${result.unusedProps.length}\n`;
    report += `   Prop Mismatches: ${result.propMismatches.length}\n`;
    report += `   Optionality Issues: ${result.optionalityIssues.length}\n`;
    report += `   Default Value Issues: ${result.defaultValueIssues.length}\n\n`;

    if (result.propMismatches.length > 0) {
      report += '🚨 CRITICAL PROP MISMATCHES:\n';
      result.propMismatches
        .filter(m => m.severity === 'critical')
        .forEach(mismatch => {
          report += `   • ${mismatch.componentName}.${mismatch.propName}\n`;
          report += `     Declared: ${mismatch.declaredType}\n`;
          report += `     Actual: ${mismatch.actualUsage}\n`;
        });
      report += '\n';
    }

    if (result.validationRecommendations.length > 0) {
      report += '💡 PROP VALIDATION RECOMMENDATIONS:\n';
      result.validationRecommendations.forEach(rec => {
        report += `   ${rec.priority.toUpperCase()}: ${rec.description}\n`;
      });
    }

    return report;
  }
}

// Export for global access
export const componentPropValidator = ComponentPropValidator;
