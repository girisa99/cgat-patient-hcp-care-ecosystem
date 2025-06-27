
import { useCallback } from 'react';
import { 
  automatedVerification,
  AutomatedVerificationConfig 
} from '@/utils/verification/AutomatedVerificationOrchestrator';
import { ValidationRequest } from '@/utils/verification/SimplifiedValidator';
import { useToast } from '@/hooks/use-toast';

export const useVerificationActions = () => {
  const { toast } = useToast();

  const verifyBeforeCreation = useCallback(async (request: ValidationRequest) => {
    console.log('🔍 AUTOMATIC VERIFICATION TRIGGERED for:', request);
    
    try {
      const canProceed = await automatedVerification.verifyBeforeCreation(request);
      
      if (!canProceed) {
        console.log('🚫 CREATION AUTOMATICALLY BLOCKED by verification system');
      } else {
        console.log('✅ CREATION AUTOMATICALLY APPROVED by verification system');
      }
      
      return canProceed;
    } catch (error) {
      console.error('❌ AUTOMATIC VERIFICATION ERROR:', error);
      toast({
        title: "❌ Verification Error",
        description: "Automatic verification encountered an error but creation is allowed.",
        variant: "destructive",
      });
      return true;
    }
  }, [toast]);

  const startVerification = useCallback(() => {
    automatedVerification.start();
    toast({
      title: "🚀 Verification Started",
      description: "Automated verification system is now running.",
      variant: "default",
    });
  }, [toast]);

  const stopVerification = useCallback(() => {
    automatedVerification.stop();
    toast({
      title: "⏹️ Verification Stopped",
      description: "Automated verification system has been stopped.",
      variant: "default",
    });
  }, [toast]);

  const updateConfig = useCallback((newConfig: Partial<AutomatedVerificationConfig>) => {
    automatedVerification.updateConfig(newConfig);
    toast({
      title: "⚙️ Configuration Updated",
      description: "Automatic verification settings have been updated.",
      variant: "default",
    });
  }, [toast]);

  const runManualScan = useCallback(async () => {
    toast({
      title: "🔍 Manual Scan Started",
      description: "Running comprehensive verification scan...",
      variant: "default",
    });
    
    try {
      const dummyRequest: ValidationRequest = {
        componentType: 'module',
        description: 'Manual comprehensive scan trigger'
      };
      
      await automatedVerification.verifyBeforeCreation(dummyRequest);
      
      toast({
        title: "📊 Manual Scan Complete",
        description: "Comprehensive verification scan finished.",
        variant: "default",
      });
    } catch (error) {
      console.error('❌ Manual scan failed:', error);
      toast({
        title: "❌ Manual Scan Failed",
        description: "Manual verification scan encountered an error.",
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    verifyBeforeCreation,
    startVerification,
    stopVerification,
    updateConfig,
    runManualScan
  };
};
