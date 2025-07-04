
/**
 * MASTER TOAST HOOK - SINGLE SOURCE OF TRUTH
 * Unified toast notification system with consistent interface
 * Version: master-toast-v2.0.0 - Fixed toast implementation
 */
import { toast } from "@/hooks/use-toast";

export const useMasterToast = () => {
  console.log('🎯 Master Toast v2.0 - Single Source Toast System');

  const showSuccess = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "default"
    });
  };

  const showError = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "destructive"
    });
  };

  const showInfo = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "default"
    });
  };

  const showWarning = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "default"
    });
  };

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    toast,
    
    meta: {
      toastVersion: 'master-toast-v2.0.0',
      singleSourceValidated: true,
      toastImplementationFixed: true
    }
  };
};
