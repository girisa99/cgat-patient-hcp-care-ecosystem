
/**
 * Component Prop Validator
 * Validates component props, types, and usage patterns
 */

export interface PropValidationResult {
  validationScore: number;
  missingPropTypes: MissingPropType[];
  unusedProps: UnusedProp[];
  propMismatches: PropMismatch[];
  optionalityIssues: OptionalityIssue[];
  defaultValueIssues: DefaultValueIssue[];
  recommendations: string[];
}

export interface MissingPropType {
  component: string;
  propName: string;
  filePath: string;
  suggestedType: string;
}

export interface UnusedProp {
  component: string;
  propName: string;
  filePath: string;
  declaredType: string;
}

export interface PropMismatch {
  component: string;
  propName: string;
  expectedType: string;
  actualType: string;
  filePath: string;
}

export interface OptionalityIssue {
  component: string;
  propName: string;
  shouldBeOptional: boolean;
  currentlyOptional: boolean;
  filePath: string;
}

export interface DefaultValueIssue {
  component: string;
  propName: string;
  hasDefaultValue: boolean;
  shouldHaveDefault: boolean;
  suggestedDefault: string;
  filePath: string;
}

export class ComponentPropValidator {
  /**
   * Validate component props across the application
   */
  static async validateComponentProps(): Promise<PropValidationResult> {
    console.log('🔍 Validating component props...');

    // Mock implementation - would analyze actual component files
    const missingPropTypes: MissingPropType[] = [];
    const unusedProps: UnusedProp[] = [];
    const propMismatches: PropMismatch[] = [];
    const optionalityIssues: OptionalityIssue[] = [];
    const defaultValueIssues: DefaultValueIssue[] = [];

    const validationScore = this.calculateValidationScore(
      missingPropTypes, unusedProps, propMismatches, optionalityIssues, defaultValueIssues
    );

    const recommendations = this.generateRecommendations(
      missingPropTypes, unusedProps, propMismatches
    );

    return {
      validationScore,
      missingPropTypes,
      unusedProps,
      propMismatches,
      optionalityIssues,
      defaultValueIssues,
      recommendations
    };
  }

  private static calculateValidationScore(
    missing: MissingPropType[],
    unused: UnusedProp[],
    mismatches: PropMismatch[],
    optionality: OptionalityIssue[],
    defaults: DefaultValueIssue[]
  ): number {
    let score = 100;
    score -= missing.length * 10;
    score -= unused.length * 5;
    score -= mismatches.length * 15;
    score -= optionality.length * 8;
    score -= defaults.length * 3;
    return Math.max(0, score);
  }

  private static generateRecommendations(
    missing: MissingPropType[],
    unused: UnusedProp[],
    mismatches: PropMismatch[]
  ): string[] {
    const recommendations: string[] = [];
    
    if (missing.length > 0) {
      recommendations.push('Add missing prop type definitions');
    }
    if (unused.length > 0) {
      recommendations.push('Remove unused prop declarations');
    }
    if (mismatches.length > 0) {
      recommendations.push('Fix prop type mismatches');
    }
    
    return recommendations;
  }
}

export const componentPropValidator = ComponentPropValidator;
