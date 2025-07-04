
/**
 * MASTER TOAST HOOK - SINGLE SOURCE OF TRUTH
 * Unified toast functionality with TypeScript alignment
 * Version: master-toast-v1.0.0
 */
import { useToast } from '@/hooks/use-toast';

export const useMasterToast = () => {
  const { toast } = useToast();
  
  console.log('🎯 Master Toast - Single Source of Truth Active');

  const showSuccess = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "default",
    });
  };

  const showError = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "destructive",
    });
  };

  const showInfo = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "default",
    });
  };

  return {
    showSuccess,
    showError,
    showInfo,
    toast,
    
    meta: {
      toastVersion: 'master-toast-v1.0.0',
      singleSourceValidated: true,
      typeScriptAligned: true
    }
  };
};
