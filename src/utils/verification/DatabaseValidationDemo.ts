
/**
 * Database Validation Demo
 * Shows how the enhanced verification system works with database guidelines
 */

import { DatabaseGuidelinesValidator } from './DatabaseGuidelinesValidator';
import { automatedVerification } from './AutomatedVerificationOrchestrator';

export class DatabaseValidationDemo {
  /**
   * Demo: Validate a new module with database guidelines
   */
  static async demoModuleValidation(moduleName: string, tableName: string) {
    console.log(`🎯 DEMO: Validating module '${moduleName}' with database guidelines...`);
    
    // This will automatically include database validation
    const canProceed = await automatedVerification.verifyBeforeCreation({
      moduleName,
      tableName,
      componentType: 'module',
      description: `Demo validation for ${moduleName} module`
    });
    
    console.log(`📊 Module validation result: ${canProceed ? 'APPROVED ✅' : 'BLOCKED ❌'}`);
    return canProceed;
  }

  /**
   * Demo: Run standalone database validation
   */
  static async demoDatabaseValidation(tableNames: string[] = []) {
    console.log('🎯 DEMO: Running standalone database validation...');
    
    const result = await DatabaseGuidelinesValidator.validateDatabase(tableNames);
    const report = DatabaseGuidelinesValidator.generateGuidelinesReport(result);
    
    console.log(report);
    return result;
  }

  /**
   * Demo: Show SQL auto-fixes
   */
  static async demoSQLAutoFixes(tableNames: string[] = []) {
    console.log('🎯 DEMO: Generating SQL auto-fixes...');
    
    const result = await DatabaseGuidelinesValidator.validateDatabase(tableNames);
    const sqlFixes = DatabaseGuidelinesValidator.generateAutoFixSQL(result.violations);
    
    if (sqlFixes.length > 0) {
      console.log('💾 Generated SQL Auto-fixes:');
      sqlFixes.forEach((sql, index) => {
        console.log(`${index + 1}. ${sql}`);
      });
    } else {
      console.log('✅ No SQL fixes needed - database follows all guidelines!');
    }
    
    return sqlFixes;
  }

  /**
   * Demo: Show workflow suggestions
   */
  static async demoWorkflowSuggestions(tableNames: string[] = []) {
    console.log('🎯 DEMO: Generating workflow suggestions...');
    
    const result = await DatabaseGuidelinesValidator.validateDatabase(tableNames);
    
    if (result.workflowSuggestions.length > 0) {
      console.log('🔄 Workflow Suggestions:');
      result.workflowSuggestions.forEach((suggestion, index) => {
        console.log(`${index + 1}. ${suggestion.description}`);
        console.log(`   Type: ${suggestion.type}`);
        console.log(`   Priority: ${suggestion.priority}`);
        console.log(`   Implementation: ${suggestion.implementation}`);
        console.log(`   Triggers: ${suggestion.triggers.join(', ')}`);
        console.log('');
      });
    } else {
      console.log('✅ No workflow suggestions needed!');
    }
    
    return result.workflowSuggestions;
  }
}

// Global demo functions for easy testing
if (typeof window !== 'undefined') {
  (window as any).databaseValidationDemo = {
    validateModule: DatabaseValidationDemo.demoModuleValidation,
    validateDatabase: DatabaseValidationDemo.demoDatabaseValidation,
    showSQLFixes: DatabaseValidationDemo.demoSQLAutoFixes,
    showWorkflowSuggestions: DatabaseValidationDemo.demoWorkflowSuggestions
  };
  
  console.log('🎮 Database Validation Demo available:');
  console.log('   - window.databaseValidationDemo.validateModule(name, table)');
  console.log('   - window.databaseValidationDemo.validateDatabase([tables])');
  console.log('   - window.databaseValidationDemo.showSQLFixes([tables])');
  console.log('   - window.databaseValidationDemo.showWorkflowSuggestions([tables])');
}
