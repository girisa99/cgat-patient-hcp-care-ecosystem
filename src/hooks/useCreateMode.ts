/**
 * useCreateMode - Simple/Advanced dual-mode toggle for Genie Cast CREATE tab
 * 
 * Persists user preference to localStorage.
 * Simple mode: Minimal options, smart defaults, 3-click to Produce
 * Advanced mode: Full 434+ templates, messaging matrix, all config options
 */

import { useState, useCallback } from 'react';

export type CreateMode = 'simple' | 'advanced';

const STORAGE_KEY = 'genie-cast-create-mode';

export function useCreateMode() {
  const [mode, setModeState] = useState<CreateMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'simple' || saved === 'advanced') return saved;
    } catch {}
    return 'simple'; // Default to simple for new users
  });

  const setMode = useCallback((newMode: CreateMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
    } catch {}
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === 'simple' ? 'advanced' : 'simple');
  }, [mode, setMode]);

  return {
    mode,
    isSimple: mode === 'simple',
    isAdvanced: mode === 'advanced',
    setMode,
    toggleMode,
  };
}
