
import { 
  AutomatedVerificationOrchestrator, 
  VerificationSummary,
  TemplateGenerationRequest,
  TemplateGenerationResult
} from './AutomatedVerificationOrchestrator';

export class ModuleValidationOrchestrator {
  static async validateModuleCreation(request: TemplateGenerationRequest): Promise<TemplateGenerationResult> {
    console.log('🔍 Validating module creation request:', request);
    
    try {
      // Run verification with proper type casting
      const verificationRequest = {
        componentType: request.componentType as 'hook' | 'component' | 'module' | 'template',
        description: request.description
      };
      
      const summary = await AutomatedVerificationOrchestrator.runVerification(verificationRequest);
      
      // Check if creation should be blocked
      if (summary.criticalIssues > 0) {
        return {
          success: false,
          message: `Module creation blocked due to ${summary.criticalIssues} critical issues`
        };
      }
      
      return {
        success: true,
        message: 'Module validation passed',
        templates: []
      };
      
    } catch (error) {
      console.error('❌ Module validation failed:', error);
      return {
        success: false,
        message: 'Module validation encountered an error'
      };
    }
  }
}
