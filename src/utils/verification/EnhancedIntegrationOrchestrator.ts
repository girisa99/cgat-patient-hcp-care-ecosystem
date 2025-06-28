
import { AutomatedVerificationOrchestrator } from './AutomatedVerificationOrchestrator';
import { VerificationRequest } from './types';

export interface EnhancedIntegrationResult {
  overallStatus: 'approved' | 'blocked' | 'warning';
  recommendations: string[];
  integrationStatus?: 'critical' | 'warning' | 'approved';
}

export class EnhancedIntegrationOrchestrator {
  static async runIntegratedVerification(request: VerificationRequest): Promise<EnhancedIntegrationResult> {
    console.log('🔄 Running enhanced integrated verification...');
    
    try {
      // Get the orchestrator instance
      const orchestrator = AutomatedVerificationOrchestrator.getInstance();
      
      // Run verification using the static method
      const summary = await AutomatedVerificationOrchestrator.runVerification(request);
      
      console.log('✅ Enhanced integrated verification completed:', summary);
      
      // Convert summary to EnhancedIntegrationResult format
      const result: EnhancedIntegrationResult = {
        overallStatus: summary.criticalIssues > 0 ? 'blocked' : 
                      summary.highIssues > 0 ? 'warning' : 'approved',
        recommendations: summary.recommendations,
        integrationStatus: summary.criticalIssues > 0 ? 'critical' : 
                          summary.highIssues > 0 ? 'warning' : 'approved'
      };
      
      return result;
      
    } catch (error) {
      console.error('❌ Enhanced integrated verification failed:', error);
      throw error;
    }
  }

  async performIntegratedVerification(request: VerificationRequest): Promise<EnhancedIntegrationResult> {
    return EnhancedIntegrationOrchestrator.runIntegratedVerification(request);
  }
}

// Create a singleton instance for export
export const enhancedIntegrationOrchestrator = new EnhancedIntegrationOrchestrator();
