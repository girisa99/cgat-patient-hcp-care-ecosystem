import { toast } from 'sonner';

// Global deduplication map to prevent repeated identical toasts (esp. "Failed to fetch")
const recentMessages = new Map<string, number>();
const DEDUPE_WINDOW_MS = 10000; // 10s

function shouldShow(message: string) {
  const now = Date.now();
  const last = recentMessages.get(message) || 0;
  if (now - last < DEDUPE_WINDOW_MS) return false;
  recentMessages.set(message, now);
  return true;
}

export const useMasterToast = () => {
  const showSuccess = (title: string, description?: string) => {
    toast.success(title, { description });
  };

  const showError = (title: string, description?: string) => {
    const key = `${title}|${description || ''}`;
    if (!shouldShow(key)) return;
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
