
import { toast } from 'sonner';

export const useMasterToast = () => {
  const showSuccess = (title: string, description?: string) => {
    toast.success(title, { description });
  };

  const showError = (title: string, description?: string) => {
    toast.error(title, { description });
  };

  const showInfo = (title: string, description?: string) => {
    toast.info(title, { description });
  };

  return {
    showSuccess,
    showError,
    showInfo,
    toast,
  };
};
