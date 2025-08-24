import React, { useEffect, useCallback, useRef } from 'react';
import { useMasterToast } from '@/hooks/useMasterToast';
import { supabase } from '@/integrations/supabase/client';

interface SessionPersistenceManagerProps {
  sessionId?: string;
  onSessionRestore?: (sessionData: any) => void;
  onSessionSync?: (sessionData: any) => void;
  autoSaveInterval?: number; // in milliseconds
  children?: React.ReactNode;
}

interface SessionData {
  id: string;
  canvas?: any;
  currentStep?: string;
  lastActivity: string;
  tabId: string;
  windowId: string;
}

export const SessionPersistenceManager: React.FC<SessionPersistenceManagerProps> = ({
  sessionId,
  onSessionRestore,
  onSessionSync,
  autoSaveInterval = 5000, // 5 seconds default
  children
}) => {
  const { showSuccess, showError } = useMasterToast();
  const tabIdRef = useRef<string>(generateTabId());
  const windowIdRef = useRef<string>(generateWindowId());
  const lastSyncRef = useRef<number>(Date.now());
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const isRestoringRef = useRef<boolean>(false);

  // Generate unique identifiers for tab and window
  function generateTabId(): string {
    return `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  function generateWindowId(): string {
    return `window_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Restore session when component mounts or sessionId changes
  useEffect(() => {
    if (sessionId && !isRestoringRef.current) {
      restoreSession();
    }
  }, [sessionId]);

  // Set up cross-tab communication
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `session_${sessionId}_sync` && e.newValue) {
        try {
          const syncData = JSON.parse(e.newValue);
          if (syncData.tabId !== tabIdRef.current) {
            handleCrossTabSync(syncData);
          }
        } catch (error) {
          console.error('Failed to parse cross-tab sync data:', error);
        }
      }
    };

    // Set up window/tab communication
    const handleBeforeUnload = () => {
      if (sessionId) {
        markTabAsClosed();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && sessionId) {
        checkForUpdatesWhileAway();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [sessionId]);

  // Auto-save functionality
  useEffect(() => {
    if (sessionId && autoSaveInterval > 0) {
      scheduleAutoSave();
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [sessionId, autoSaveInterval]);

  const restoreSession = async () => {
    if (!sessionId || isRestoringRef.current) return;

    isRestoringRef.current = true;
    
    try {
      // Check if session exists in localStorage first (faster)
      const localSession = getLocalSession();
      
      // Check if session exists in Supabase
      const { data: dbSession, error } = await supabase
        .from('agent_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Failed to fetch session from database:', error);
      }

      let sessionToRestore = null;

      // Determine which session data to use
      if (dbSession && localSession) {
        // Compare timestamps and use the most recent
        const dbTimestamp = new Date(dbSession.updated_at).getTime();
        const localTimestamp = new Date(localSession.lastActivity).getTime();
        
        sessionToRestore = dbTimestamp > localTimestamp ? dbSession : localSession;
        
        if (dbTimestamp > localTimestamp) {
          showError('Session was updated in another tab. Restored latest version.');
        }
      } else {
        sessionToRestore = dbSession || localSession;
      }

      if (sessionToRestore) {
        // Mark current tab as active
        markTabAsActive();
        
        // Notify parent component about session restoration
        if (onSessionRestore) {
          onSessionRestore(sessionToRestore);
        }

        showSuccess('Session restored successfully');
      }

    } catch (error) {
      console.error('Failed to restore session:', error);
    } finally {
      isRestoringRef.current = false;
    }
  };

  const getLocalSession = (): SessionData | null => {
    try {
      const sessionKey = `session_${sessionId}`;
      const sessionDataStr = localStorage.getItem(sessionKey);
      
      if (sessionDataStr) {
        return JSON.parse(sessionDataStr);
      }
    } catch (error) {
      console.error('Failed to get local session:', error);
    }
    
    return null;
  };

  const saveSessionLocally = (sessionData: any) => {
    try {
      const sessionKey = `session_${sessionId}`;
      const localSessionData: SessionData = {
        id: sessionId!,
        canvas: sessionData.canvas,
        currentStep: sessionData.currentStep,
        lastActivity: new Date().toISOString(),
        tabId: tabIdRef.current,
        windowId: windowIdRef.current
      };

      localStorage.setItem(sessionKey, JSON.stringify(localSessionData));
      lastSyncRef.current = Date.now();

      // Notify other tabs about the update
      notifyOtherTabs(localSessionData);

    } catch (error) {
      console.error('Failed to save session locally:', error);
    }
  };

  const saveSessionToDatabase = async (sessionData: any) => {
    if (!sessionId) return;

    try {
      const { error } = await supabase
        .from('agent_sessions')
        .update({
          canvas: sessionData.canvas,
          current_step: sessionData.currentStep,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) {
        console.error('Failed to save session to database:', error);
      }

    } catch (error) {
      console.error('Database save error:', error);
    }
  };

  const scheduleAutoSave = () => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      performAutoSave();
      scheduleAutoSave(); // Schedule next auto-save
    }, autoSaveInterval);
  };

  const performAutoSave = () => {
    try {
      // Get current session data from localStorage
      const currentSession = getLocalSession();
      
      if (currentSession && isTabActive()) {
        // Save to database
        saveSessionToDatabase(currentSession);
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const handleCrossTabSync = (syncData: SessionData) => {
    try {
      // Update local storage with synced data
      const sessionKey = `session_${sessionId}`;
      localStorage.setItem(sessionKey, JSON.stringify(syncData));

      // Notify parent component about sync
      if (onSessionSync) {
        onSessionSync(syncData);
      }

    } catch (error) {
      console.error('Failed to handle cross-tab sync:', error);
    }
  };

  const notifyOtherTabs = (sessionData: SessionData) => {
    try {
      const syncKey = `session_${sessionId}_sync`;
      const syncData = {
        ...sessionData,
        syncTimestamp: Date.now(),
        sourceTabId: tabIdRef.current
      };

      localStorage.setItem(syncKey, JSON.stringify(syncData));
      
      // Remove sync data after a short delay to trigger storage event
      setTimeout(() => {
        localStorage.removeItem(syncKey);
      }, 100);

    } catch (error) {
      console.error('Failed to notify other tabs:', error);
    }
  };

  const markTabAsActive = () => {
    try {
      const activeTabsKey = `active_tabs_${sessionId}`;
      const activeTabs = JSON.parse(localStorage.getItem(activeTabsKey) || '{}');
      
      activeTabs[tabIdRef.current] = {
        windowId: windowIdRef.current,
        lastActivity: Date.now(),
        isActive: true
      };

      localStorage.setItem(activeTabsKey, JSON.stringify(activeTabs));
    } catch (error) {
      console.error('Failed to mark tab as active:', error);
    }
  };

  const markTabAsClosed = () => {
    try {
      const activeTabsKey = `active_tabs_${sessionId}`;
      const activeTabs = JSON.parse(localStorage.getItem(activeTabsKey) || '{}');
      
      delete activeTabs[tabIdRef.current];
      localStorage.setItem(activeTabsKey, JSON.stringify(activeTabs));
    } catch (error) {
      console.error('Failed to mark tab as closed:', error);
    }
  };

  const isTabActive = (): boolean => {
    try {
      const activeTabsKey = `active_tabs_${sessionId}`;
      const activeTabs = JSON.parse(localStorage.getItem(activeTabsKey) || '{}');
      
      return activeTabs[tabIdRef.current]?.isActive === true;
    } catch (error) {
      return true; // Assume active if we can't determine
    }
  };

  const checkForUpdatesWhileAway = async () => {
    if (!sessionId) return;

    try {
      const { data: dbSession, error } = await supabase
        .from('agent_sessions')
        .select('updated_at')
        .eq('id', sessionId)
        .single();

      if (!error && dbSession) {
        const dbTimestamp = new Date(dbSession.updated_at).getTime();
        
        if (dbTimestamp > lastSyncRef.current) {
          showError('Session was updated while you were away. Refreshing...');
          await restoreSession();
        }
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  };

  // Public API for manual session operations
  const sessionAPI = {
    saveSession: (sessionData: any) => {
      saveSessionLocally(sessionData);
      saveSessionToDatabase(sessionData);
    },
    
    forceSync: () => {
      restoreSession();
    },
    
    getTabInfo: () => ({
      tabId: tabIdRef.current,
      windowId: windowIdRef.current,
      isActive: isTabActive()
    })
  };

  // Attach API to window for debugging
  useEffect(() => {
    (window as any).sessionAPI = sessionAPI;
    
    return () => {
      delete (window as any).sessionAPI;
    };
  }, []);

  return (
    <>
      {children}
      {/* Hidden indicator for development */}
      {process.env.NODE_ENV === 'development' && sessionId && (
        <div className="fixed bottom-2 left-2 text-xs bg-black/50 text-white px-2 py-1 rounded">
          Session: {sessionId.slice(0, 8)}... | Tab: {tabIdRef.current.slice(-4)}
        </div>
      )}
    </>
  );
};