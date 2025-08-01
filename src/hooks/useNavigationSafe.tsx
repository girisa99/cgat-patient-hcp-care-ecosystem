/**
 * SPA-Safe Navigation Hook
 * Prevents full page reloads and maintains React Router state
 */
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

export const useNavigationSafe = () => {
  const navigate = useNavigate();

  const navigateSafe = useCallback((path: string, options?: {
    replace?: boolean;
    state?: any;
    external?: boolean;
  }) => {
    // Handle external URLs (should use window.location)
    if (options?.external || path.startsWith('http')) {
      window.location.href = path;
      return;
    }

    // Use React Router for internal navigation
    navigate(path, {
      replace: options?.replace,
      state: options?.state
    });
  }, [navigate]);

  const refreshPage = useCallback(() => {
    // Use React Router to refresh current page without full reload
    window.location.reload();
  }, []);

  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return {
    navigateSafe,
    refreshPage,
    goBack,
    navigate // Direct access to React Router navigate
  };
};