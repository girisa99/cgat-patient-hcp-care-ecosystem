
/**
 * MASTER TOAST HOOK - UNIFIED NOTIFICATION SYSTEM
 * Single source of truth for all toast notifications with TypeScript alignment
 * Version: master-toast-v1.0.0
 */
import { useToast } from '@/hooks/use-toast';

export const useMasterToast = () => {
  const { toast } = useToast();

  console.log('🎯 Master Toast Hook - Unified notification system active');

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
    showSuccess,
    showError,
    showInfo,
    toast,
    
    meta: {
      hookVersion: 'master-toast-v1.0.0',
      singleSourceValidated: true,
      typeScriptAligned: true
    }
  };
};
