
/**
 * MASTER TOAST HOOK - SINGLE SOURCE OF TRUTH
 * Centralized toast notifications with TypeScript alignment
 * Version: master-toast-v1.0.0
 */
import { useToast } from './use-toast';

export interface ToastOptions {
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

export const useMasterToast = () => {
  const { toast } = useToast();
  
  console.log('🔔 Master Toast v1.0 - Single Source Toast System Active');

  const showSuccess = (title: string, description: string, duration = 3000) => {
    toast({
      title,
      description,
      variant: 'default',
      duration
    });
  };

  const showError = (title: string, description: string, duration = 5000) => {
    toast({
      title,
      description,
      variant: 'destructive',
      duration
    });
  };

  const showInfo = (title: string, description: string, duration = 4000) => {
    toast({
      title,
      description,
      variant: 'default',
      duration
    });
  };

  const showToast = (options: ToastOptions) => {
    toast({
      title: options.title,
      description: options.description,
      variant: options.variant || 'default',
      duration: options.duration || 3000
    });
  };

  return {
    showSuccess,
    showError,
    showInfo,
    showToast,
    
    // Meta information
    meta: {
      toastVersion: 'master-toast-v1.0.0',
      singleSourceValidated: true,
      typeScriptAligned: true
    }
  };
};
