/**
 * Session State Recovery Hook - P4-REC-08
 * Restore wizard state after crash or unexpected termination
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

export interface SessionState {
  id: string;
  wizardStep: number;
  formData: Record<string, any>;
  selections: string[];
  timestamp: Date;
  version: string;
  isComplete: boolean;
}

interface SessionRecoveryOptions {
  sessionKey: string;
  autoSaveInterval?: number; // ms
  maxAge?: number; // ms - max age before session is considered stale
  onRecover?: (state: SessionState) => void;
  version?: string;
}

const STORAGE_PREFIX = 'genie_session_';
const DEFAULT_AUTO_SAVE_INTERVAL = 5000; // 5 seconds
const DEFAULT_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

export const useSessionRecovery = (options: SessionRecoveryOptions) => {
  const {
    sessionKey,
    autoSaveInterval = DEFAULT_AUTO_SAVE_INTERVAL,
    maxAge = DEFAULT_MAX_AGE,
    onRecover,
    version = '1.0.0'
  } = options;

  const storageKey = `${STORAGE_PREFIX}${sessionKey}`;
  const [hasRecoverableSession, setHasRecoverableSession] = useState(false);
  const [recoveredState, setRecoveredState] = useState<SessionState | null>(null);
  const [currentState, setCurrentState] = useState<Partial<SessionState>>({});
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef<Date | null>(null);

  // Check for recoverable session on mount
  useEffect(() => {
    const checkForRecoverableSession = () => {
      try {
        const stored = localStorage.getItem(storageKey);
        if (!stored) {
          setHasRecoverableSession(false);
          return;
        }

        const session: SessionState = JSON.parse(stored);
        const sessionAge = Date.now() - new Date(session.timestamp).getTime();

        // Check if session is not too old and not completed
        if (sessionAge < maxAge && !session.isComplete) {
          setHasRecoverableSession(true);
          setRecoveredState(session);
          console.log('📦 Recoverable session found:', session.id);
        } else {
          // Clear stale or completed session
          localStorage.removeItem(storageKey);
          setHasRecoverableSession(false);
        }
      } catch (error) {
        console.error('Error checking for recoverable session:', error);
        setHasRecoverableSession(false);
      }
    };

    checkForRecoverableSession();
  }, [storageKey, maxAge]);

  // Save current state
  const saveState = useCallback((state: Partial<SessionState>) => {
    try {
      const fullState: SessionState = {
        id: state.id || `session_${Date.now()}`,
        wizardStep: state.wizardStep || 0,
        formData: state.formData || {},
        selections: state.selections || [],
        timestamp: new Date(),
        version,
        isComplete: state.isComplete || false
      };

      localStorage.setItem(storageKey, JSON.stringify(fullState));
      lastSaveRef.current = new Date();
      setCurrentState(fullState);
      
      console.log('💾 Session state saved:', fullState.id);
    } catch (error) {
      console.error('Error saving session state:', error);
    }
  }, [storageKey, version]);

  // Update partial state
  const updateState = useCallback((updates: Partial<SessionState>) => {
    setCurrentState(prev => {
      const newState = { ...prev, ...updates };
      return newState;
    });
  }, []);

  // Auto-save effect
  useEffect(() => {
    if (autoSaveInterval > 0 && Object.keys(currentState).length > 0) {
      autoSaveRef.current = setInterval(() => {
        if (Object.keys(currentState).length > 0 && !currentState.isComplete) {
          saveState(currentState);
        }
      }, autoSaveInterval);
    }

    return () => {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
    };
  }, [autoSaveInterval, currentState, saveState]);

  // Recover session
  const recoverSession = useCallback(() => {
    if (!recoveredState) {
      toast.error('No session to recover');
      return null;
    }

    try {
      setCurrentState(recoveredState);
      setHasRecoverableSession(false);
      
      if (onRecover) {
        onRecover(recoveredState);
      }

      toast.success(`Session recovered! Resuming from step ${recoveredState.wizardStep + 1}`);
      console.log('✅ Session recovered:', recoveredState.id);
      
      return recoveredState;
    } catch (error) {
      console.error('Error recovering session:', error);
      toast.error('Failed to recover session');
      return null;
    }
  }, [recoveredState, onRecover]);

  // Dismiss recovery prompt
  const dismissRecovery = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setHasRecoverableSession(false);
      setRecoveredState(null);
      toast.info('Previous session discarded');
      console.log('🗑️ Session discarded');
    } catch (error) {
      console.error('Error dismissing recovery:', error);
    }
  }, [storageKey]);

  // Mark session as complete
  const completeSession = useCallback(() => {
    try {
      const completedState = { ...currentState, isComplete: true };
      saveState(completedState);
      console.log('✅ Session marked as complete');
    } catch (error) {
      console.error('Error completing session:', error);
    }
  }, [currentState, saveState]);

  // Clear session
  const clearSession = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setCurrentState({});
      setHasRecoverableSession(false);
      setRecoveredState(null);
      console.log('🧹 Session cleared');
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  }, [storageKey]);

  // Force save now
  const forceSave = useCallback(() => {
    saveState(currentState);
    toast.success('Session saved');
  }, [currentState, saveState]);

  return {
    // State
    hasRecoverableSession,
    recoveredState,
    currentState,
    lastSave: lastSaveRef.current,

    // Actions
    updateState,
    saveState,
    recoverSession,
    dismissRecovery,
    completeSession,
    clearSession,
    forceSave
  };
};

export default useSessionRecovery;
