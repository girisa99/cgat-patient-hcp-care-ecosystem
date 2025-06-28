
import { AutomatedVerificationOrchestrator } from './AutomatedVerificationOrchestrator';
import { VerificationRequest } from './types';

export class EnhancedIntegrationOrchestrator {
  static async runIntegratedVerification(request: VerificationRequest) {
    console.log('🔄 Running enhanced integrated verification...');
    
    try {
      // Get the orchestrator instance
      const orchestrator = AutomatedVerificationOrchestrator.getInstance();
      
      // Run verification using the static method
      const summary = await AutomatedVerificationOrchestrator.runVerification(request);
      
      console.log('✅ Enhanced integrated verification completed:', summary);
      return summary;
      
    } catch (error) {
      console.error('❌ Enhanced integrated verification failed:', error);
      throw error;
    }
  }
}
