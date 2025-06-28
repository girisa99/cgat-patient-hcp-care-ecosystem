
import { 
  AutomatedVerificationOrchestrator,
  type VerificationSummary,
  type AutomatedVerificationConfig 
} from './AutomatedVerificationOrchestrator';
import { validateTableSchema } from './TypeScriptDatabaseValidator';
import { type VerificationRequest } from './types';

export class ModuleValidationOrchestrator {
  static async validateModuleCreation(request: VerificationRequest): Promise<VerificationSummary> {
    console.log('🔍 Module validation orchestrator - database-first approach');
    
    // Simplified validation for database-first approach
    return AutomatedVerificationOrchestrator.runVerification(request);
  }

  static async preCreationValidation(moduleName: string, tableName?: string): Promise<boolean> {
    console.log('🔍 Pre-creation validation for:', moduleName);
    
    if (tableName) {
      try {
        await validateTableSchema(tableName);
        return true;
      } catch (error) {
        console.error('❌ Table validation failed:', error);
        return false;
      }
    }
    
    return true;
  }
}
