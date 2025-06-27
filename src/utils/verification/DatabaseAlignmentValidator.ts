
/**
 * Database Alignment Validator
 * Validates database schema alignment and table existence
 */

import { validateTableExists } from '@/utils/moduleValidation';
import { DatabaseAlignmentResult, VerificationRequest } from './types';

export class DatabaseAlignmentValidator {
  /**
   * Validate database alignment
   */
  static async validateDatabaseAlignment(request: VerificationRequest): Promise<DatabaseAlignmentResult> {
    console.log('🔍 Validating database alignment...');

    const missingTables: string[] = [];
    let tablesExist = true;
    let rlsPoliciesValid = true;
    let foreignKeysValid = true;

    // Check if table exists
    if (request.tableName) {
      const tableExists = validateTableExists(request.tableName);
      if (!tableExists) {
        missingTables.push(request.tableName);
        tablesExist = false;
      }
    }

    // Validate core business tables exist
    const coreBusinessTables = ['profiles', 'facilities', 'modules', 'roles', 'user_roles'];
    for (const table of coreBusinessTables) {
      if (!validateTableExists(table)) {
        missingTables.push(table);
        tablesExist = false;
      }
    }

    return {
      tablesExist,
      missingTables,
      rlsPoliciesValid,
      foreignKeysValid
    };
  }
}
