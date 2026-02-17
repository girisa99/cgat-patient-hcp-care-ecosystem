/**
 * Unified Agent Builder Context Provider
 * Eliminates duplication between SuperAdmin and Unified builders
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AgentSession, AgentSessionUpdate } from '@/types/agent-session';
import { useAgentSession } from '@/hooks/useAgentSession';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { AgentAction } from '@/components/agentic/AgentActionsManager';

interface AgentBuilderContextType {
  // Session Management
  currentSessionId: string | null;
  setCurrentSessionId: (id: string | null) => void;
  currentSession: AgentSession | null;
  userSessions: AgentSession[];
  
  // Step Management
  currentStep: AgentSession['current_step'];
  setCurrentStep: (step: AgentSession['current_step']) => void;
  
  // UI State
  showNewSessionDialog: boolean;
  setShowNewSessionDialog: (show: boolean) => void;
  showSessionList: boolean;
  setShowSessionList: (show: boolean) => void;
  
  // Actions
  actions: AgentAction[];
  setActions: (actions: AgentAction[]) => void;
  
  // Session Operations
  createSession: any;
  updateSession: any;
  manualSave: any;
  deleteSession: any;
  deployAgent: any;
  isLoading: boolean;
  
  // User Context
  user: any;
  userRoles: string[];
  
  // Build Mode
  mode: 'prompt' | 'visual' | 'manual';
  setMode: (mode: 'prompt' | 'visual' | 'manual') => void;
}

const AgentBuilderContext = createContext<AgentBuilderContextType | undefined>(undefined);

interface AgentBuilderProviderProps {
  children: ReactNode;
  initialStep?: AgentSession['current_step'];
  sessionId?: string;
}

export const AgentBuilderProvider: React.FC<AgentBuilderProviderProps> = ({
  children,
  initialStep = 'basic_info',
  sessionId
}) => {
  // Always call hooks in the same order - CRITICAL for React hook rules
  const { user, userRoles } = useMasterAuth();
  
  // STABLE state initialization - these must always be declared in the same order
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionId || null);
  const [currentStep, setCurrentStep] = useState<AgentSession['current_step']>(initialStep);
  const [showNewSessionDialog, setShowNewSessionDialog] = useState(false);
  const [showSessionList, setShowSessionList] = useState(false);
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [mode, setMode] = useState<'prompt' | 'visual' | 'manual'>(() => {
    try {
      return (localStorage.getItem('agentBuilder_mode') as any) || 'prompt';
    } catch {
      return 'prompt';
    }
  });
  
  // STABLE sessionId for hook consistency
  const stableSessionId = currentSessionId || '';
  
  // Always call hook with consistent parameters
  const {
    currentSession,
    userSessions,
    createSession,
    updateSession,
    manualSave,
    deleteSession,
    deployAgent,
    isLoading,
  } = useAgentSession(stableSessionId || undefined);

  // Client-side initialization effect with cross-tab sync
  useEffect(() => {
    try {
      // Initialize from localStorage only on client side
      const savedSessionId = localStorage.getItem('agentBuilder_currentSessionId');
      const savedStep = localStorage.getItem('agentBuilder_currentStep') as AgentSession['current_step'];
      
      if (savedSessionId && !sessionId) {
        setCurrentSessionId(savedSessionId);
      }
      
      if (savedStep && !initialStep) {
        setCurrentStep(savedStep);
      }

      // Set up cross-tab synchronization
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'agentBuilder_currentSessionId' && e.newValue) {
          setCurrentSessionId(e.newValue);
        }
        if (e.key === 'agentBuilder_currentStep' && e.newValue) {
          setCurrentStep(e.newValue as AgentSession['current_step']);
        }
        if (e.key === 'agentBuilder_mode' && e.newValue) {
          setMode(e.newValue as 'prompt' | 'visual' | 'manual');
        }
      };

      window.addEventListener('storage', handleStorageChange);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
  }, [initialStep, sessionId]);

  // Persist current session ID to localStorage
  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem('agentBuilder_currentSessionId', currentSessionId);
    } else {
      localStorage.removeItem('agentBuilder_currentSessionId');
    }
  }, [currentSessionId]);

  // Persist current step to localStorage
  useEffect(() => {
    if (currentStep) {
      localStorage.setItem('agentBuilder_currentStep', currentStep);
    }
  }, [currentStep]);

  // Persist build mode to localStorage
  useEffect(() => {
    if (mode) {
      localStorage.setItem('agentBuilder_mode', mode);
    }
  }, [mode]);

  // Ensure session isolation: filter strictly by current user_id as extra safety
  const filteredUserSessions = (userSessions || []).filter((s: any) => s?.user_id === user?.id);
  if ((userSessions?.length || 0) !== (filteredUserSessions.length || 0)) {
    console.log('🔒 AgentBuilderProvider: filtered sessions for current user', {
      before: userSessions?.length || 0,
      after: filteredUserSessions.length,
      uniqueUserIds: Array.from(new Set((userSessions || []).map((s: any) => s?.user_id))).slice(0, 5),
    });
  }

  const contextValue: AgentBuilderContextType = {
    // Session Management
    currentSessionId,
    setCurrentSessionId,
    currentSession,
    userSessions: filteredUserSessions,
    
    // Step Management
    currentStep,
    setCurrentStep,
    
    // UI State
    showNewSessionDialog,
    setShowNewSessionDialog,
    showSessionList,
    setShowSessionList,
    
    // Actions
    actions,
    setActions,
    
    // Session Operations
    createSession,
    updateSession,
    manualSave,
    deleteSession,
    deployAgent,
    isLoading,
    
    // Build Mode
    mode,
    setMode,
    
    // User Context
    user,
    userRoles: userRoles || []
  };

  return (
    <AgentBuilderContext.Provider value={contextValue}>
      {children}
    </AgentBuilderContext.Provider>
  );
};

export const useAgentBuilder = () => {
  const context = useContext(AgentBuilderContext);
  if (context === undefined) {
    throw new Error('useAgentBuilder must be used within an AgentBuilderProvider');
  }
  return context;
};