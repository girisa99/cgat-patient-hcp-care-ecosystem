
import { useToast } from '@/hooks/use-toast';

export const useMasterToast = () => {
  const { toast } = useToast();

  const showSuccess = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'default',
    });
  };

  const showError = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'destructive',
    });
  };

  const showInfo = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'default',
    });
  };

  return {
    showSuccess,
    showError,
    showInfo,
    toast,
  };
};
