
/**
 * TypeScript Validator
 * Ensures alignment with schema and validates TypeScript conventions
 */

import { validateTableExists } from '@/utils/moduleValidation';
import { TypeScriptValidationResult, VerificationRequest } from './types';

export class TypeScriptValidator {
  /**
   * Validate TypeScript-Database alignment
   */
  static async validateTypeScriptAlignment(request: VerificationRequest): Promise<TypeScriptValidationResult> {
    console.log('🔍 Validating TypeScript-Database alignment...');

    const missingTypes: string[] = [];
    const conflictingTypes: string[] = [];
    let isValid = true;
    let schemaAlignment = true;

    // Check table existence in TypeScript schema
    if (request.tableName) {
      const tableExists = validateTableExists(request.tableName);
      if (!tableExists) {
        missingTypes.push(`Table '${request.tableName}' not found in TypeScript schema`);
        isValid = false;
        schemaAlignment = false;
      }
    }

    // Check module naming conventions
    if (request.moduleName) {
      if (!/^[A-Z][a-zA-Z0-9]*$/.test(request.moduleName)) {
        conflictingTypes.push(`Module name '${request.moduleName}' must be PascalCase`);
        isValid = false;
      }
    }

    return {
      isValid,
      missingTypes,
      conflictingTypes,
      schemaAlignment
    };
  }
}
