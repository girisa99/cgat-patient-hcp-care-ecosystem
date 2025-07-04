
/**
 * MASTER TOAST SYSTEM - SINGLE SOURCE OF TRUTH
 * Consolidates all toast functionality into one master hook
 * Version: master-toast-v1.0.0
 */
import { useToast } from './use-toast';

export const useMasterToast = () => {
  const { toast } = useToast();
  
  console.log('🎯 Master Toast - Single Source of Truth Active');

  const showSuccess = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'default'
    });
  };

  const showError = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'destructive'
    });
  };

  const showInfo = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'default'
    });
  };

  return {
    // Standardized toast methods
    showSuccess,
    showError,
    showInfo,
    
    // Direct toast access for advanced usage
    toast,
    
    // Meta information
    meta: {
      toastVersion: 'master-toast-v1.0.0',
      singleSourceValidated: true,
      architectureType: 'master-consolidated'
    }
  };
};
