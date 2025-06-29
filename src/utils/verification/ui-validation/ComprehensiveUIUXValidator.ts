
/**
 * Comprehensive UI/UX Validator
 * Performs all UI/UX validation operations
 */

import { DesignSystemValidator, DesignSystemValidationResult } from '../DesignSystemValidator';
import { RoleBasedUIValidator, RoleBasedUIValidationResult } from '../RoleBasedUIValidator';
import { AccessibilityComplianceChecker, AccessibilityComplianceResult } from '../AccessibilityComplianceChecker';
import { ComponentPropValidator, PropValidationResult } from '../ComponentPropValidator';

export interface ValidationResults {
  designSystemValidation: DesignSystemValidationResult;
  roleBasedUIValidation: RoleBasedUIValidationResult;
  accessibilityValidation: AccessibilityComplianceResult;
  componentValidation: PropValidationResult;
}

export class ComprehensiveUIUXValidator {
  static async performAllValidations(): Promise<ValidationResults> {
    console.log('🎨 Running comprehensive UI/UX validations...');

    // Perform all validation types in parallel for speed
    const [
      designSystemValidation,
      roleBasedUIValidation,
      accessibilityValidation,
      componentValidation
    ] = await Promise.all([
      DesignSystemValidator.validateDesignSystem(),
      RoleBasedUIValidator.validateRoleBasedUI(),
      AccessibilityComplianceChecker.checkAccessibilityCompliance(),
      ComponentPropValidator.validateComponentProps()
    ]);

    return {
      designSystemValidation,
      roleBasedUIValidation,
      accessibilityValidation,
      componentValidation
    };
  }

  static async performQuickValidation(components: string[]): Promise<Partial<ValidationResults>> {
    console.log('⚡ Running quick UI/UX validation for:', components);

    const designSystemValidation = await DesignSystemValidator.validateDesignSystem(components);
    
    return {
      designSystemValidation
    };
  }
}
