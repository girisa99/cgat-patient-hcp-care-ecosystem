
/**
 * MASTER TOAST MANAGEMENT HOOK - SINGLE SOURCE OF TRUTH
 * Consolidates ALL toast functionality into ONE hook
 * Version: master-toast-v1.0.0
 */
import { useToast as useBaseToast } from '@/hooks/use-toast';

export const useMasterToast = () => {
  const { toast, dismiss, toasts } = useBaseToast();
  
  console.log('🔔 Master Toast - Single Source of Truth Active');

  // Enhanced toast with consistent messaging patterns
  const showToast = (options: {
    title: string;
    description?: string;
    variant?: 'default' | 'destructive';
    duration?: number;
  }) => {
    return toast({
      title: options.title,
      description: options.description,
      variant: options.variant || 'default',
    });
  };

  const showSuccess = (title: string, description?: string) => {
    return showToast({
      title: `✅ ${title}`,
      description,
      variant: 'default'
    });
  };

  const showError = (title: string, description?: string) => {
    return showToast({
      title: `❌ ${title}`,
      description,
      variant: 'destructive'
    });
  };

  const showInfo = (title: string, description?: string) => {
    return showToast({
      title: `ℹ️ ${title}`,
      description,
      variant: 'default'
    });
  };

  return {
    // Core functionality
    toast: showToast,
    dismiss,
    toasts,
    
    // Enhanced methods
    showSuccess,
    showError,
    showInfo,
    
    // Meta information
    meta: {
      totalToasts: toasts.length,
      version: 'master-toast-v1.0.0',
      singleSourceValidated: true,
      architectureType: 'consolidated'
    }
  };
};
