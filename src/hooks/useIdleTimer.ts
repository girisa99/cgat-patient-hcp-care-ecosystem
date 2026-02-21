/**
 * useIdleTimer — Detects user inactivity and dispatches IDLE_TIMEOUT signal.
 * Used by the Guide Dock to provide contextual help when users are stuck.
 * 
 * Part of the Genie Suite global guide system (Ori + Arc characters).
 */

import { useEffect, useCallback } from 'react';
import type { ContextSignal } from '@/stores/guideStore';

export function useIdleTimer(
  dispatch: (signal: ContextSignal) => void,
  ms = 20000,
  enabled = true,
) {
  const handleIdle = useCallback(() => {
    dispatch({ type: 'IDLE_TIMEOUT' });
  }, [dispatch]);

  useEffect(() => {
    if (!enabled) return;

    let timer: ReturnType<typeof setTimeout>;

    const bump = () => {
      clearTimeout(timer);
      timer = setTimeout(handleIdle, ms);
    };

    window.addEventListener('mousemove', bump);
    window.addEventListener('keydown', bump);
    window.addEventListener('click', bump);

    bump(); // start timer

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', bump);
      window.removeEventListener('keydown', bump);
      window.removeEventListener('click', bump);
    };
  }, [handleIdle, ms, enabled]);
}
