/**
 * ENROLLMENT REAL-TIME PROVIDER
 * Provides real-time enrollment updates and progress tracking across all components
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useEnrollmentRealtime } from '@/hooks/useEnrollmentRealtime';
import { useToast } from '@/hooks/use-toast';

interface EnrollmentProgress {
  tabId: string;
  completion: number;
  lastUpdated: string;
  activeAITypes: ('mcp' | 'conversational' | 'structured')[];
  currentSection: string;
  nextSection?: string;
}

interface EnrollmentRealtimeContextType {
  // Real-time connection state
  isConnected: boolean;
  connectionStatus: string;
  lastUpdate: string;
  
  // Progress tracking
  tabProgress: Record<string, EnrollmentProgress>;
  overallProgress: number;
  
  // Active sessions
  activeSessions: Record<string, any>;
  
  // Actions
  updateProgress: (tabId: string, progress: Partial<EnrollmentProgress>) => void;
  transitionToNextSection: (currentTab: string, nextTab: string) => void;
  syncWithDashboard: () => void;
  
  // Dashboard integration
  dashboardUpdates: any[];
  patientPageUpdates: any[];
}

const EnrollmentRealtimeContext = createContext<EnrollmentRealtimeContextType | undefined>(undefined);

export const EnrollmentRealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tabProgress, setTabProgress] = useState<Record<string, EnrollmentProgress>>({});
  const [overallProgress, setOverallProgress] = useState(0);
  const [activeSessions, setActiveSessions] = useState<Record<string, any>>({});
  const [dashboardUpdates, setDashboardUpdates] = useState<any[]>([]);
  const [patientPageUpdates, setPatientPageUpdates] = useState<any[]>([]);

  const { toast } = useToast();
  
  // Initialize real-time connection
  const {
    isConnected,
    connectionStatus,
    lastUpdate,
    sessionData,
    connect,
    disconnect,
    trackPresence,
    updateEnrollmentData,
    createConversationEntry
  } = useEnrollmentRealtime('global_enrollment_tracking');

  // Initialize default tab progress
  useEffect(() => {
    const defaultTabs = [
      'consent_mode',
      'patient_info', 
      'provider_treatment_center',
      'insurance',
      'treatment_clinical',
      'submit'
    ];

    const initialProgress: Record<string, EnrollmentProgress> = {};
    defaultTabs.forEach(tabId => {
      initialProgress[tabId] = {
        tabId,
        completion: 0,
        lastUpdated: new Date().toISOString(),
        activeAITypes: ['mcp', 'conversational', 'structured'],
        currentSection: `${tabId}_start`,
        nextSection: undefined
      };
    });

    setTabProgress(initialProgress);
  }, []);

  // Calculate overall progress when tab progress changes
  useEffect(() => {
    const totalProgress = Object.values(tabProgress).reduce((acc, tab) => acc + tab.completion, 0);
    const avgProgress = totalProgress / Math.max(Object.keys(tabProgress).length, 1);
    setOverallProgress(Math.round(avgProgress));
  }, [tabProgress]);

  // Handle real-time session data updates
  useEffect(() => {
    if (sessionData && Object.keys(sessionData).length > 0) {
      setActiveSessions(sessionData);
      
      // Update progress based on session data
      Object.entries(sessionData).forEach(([table, data]: [string, any]) => {
        if (table === 'enrollment_instances' && data.data) {
          const instanceData = data.data;
          const currentSection = instanceData.current_section;
          const tabId = currentSection?.split('_')[0] || 'consent_mode';
          
          if (tabProgress[tabId]) {
            updateProgress(tabId, {
              currentSection,
              lastUpdated: data.lastUpdate,
              completion: calculateCompletionFromData(instanceData)
            });
          }
        }
      });

      // Sync with dashboards
      syncWithDashboard();
    }
  }, [sessionData]);

  const calculateCompletionFromData = (data: any): number => {
    if (!data.form_data) return 0;
    
    const formFields = Object.keys(data.form_data);
    const completedFields = formFields.filter(field => {
      const value = data.form_data[field];
      return value !== null && value !== undefined && value !== '';
    });
    
    return Math.round((completedFields.length / Math.max(formFields.length, 1)) * 100);
  };

  const updateProgress = (tabId: string, progress: Partial<EnrollmentProgress>) => {
    setTabProgress(prev => ({
      ...prev,
      [tabId]: {
        ...prev[tabId],
        ...progress,
        lastUpdated: new Date().toISOString()
      }
    }));

    // Create real-time update for dashboards
    const update = {
      type: 'progress_update',
      tabId,
      progress: { ...tabProgress[tabId], ...progress },
      timestamp: new Date().toISOString()
    };

    setDashboardUpdates(prev => [update, ...prev.slice(0, 99)]); // Keep last 100 updates
    setPatientPageUpdates(prev => [update, ...prev.slice(0, 99)]);

    toast({
      title: "Progress Updated",
      description: `${tabId.replace('_', ' ')} section updated - ${progress.completion || 0}% complete`
    });
  };

  const transitionToNextSection = (currentTab: string, nextTab: string) => {
    // Update current tab as completed
    updateProgress(currentTab, {
      completion: 100,
      nextSection: nextTab
    });

    // Initialize next tab if it exists
    if (tabProgress[nextTab]) {
      updateProgress(nextTab, {
        currentSection: `${nextTab}_start`,
        completion: Math.max(tabProgress[nextTab].completion, 10) // Minimum 10% when starting
      });
    }

    // Track the transition in real-time
    const transitionData = {
      from: currentTab,
      to: nextTab,
      timestamp: new Date().toISOString(),
      userId: 'current_user' // Would be actual user ID in real implementation
    };

    createConversationEntry({
      sessionId: 'enrollment_transition',
      agentId: 'section_transition_agent',
      data: transitionData,
      metadata: {
        type: 'section_transition',
        progress: overallProgress
      }
    });

    toast({
      title: "Section Transition",
      description: `Moved from ${currentTab.replace('_', ' ')} to ${nextTab.replace('_', ' ')}`
    });
  };

  const syncWithDashboard = () => {
    // Prepare dashboard sync data
    const syncData = {
      timestamp: new Date().toISOString(),
      overallProgress,
      tabProgress,
      activeSessions: Object.keys(activeSessions).length,
      connectionStatus,
      lastUpdate
    };

    // Update dashboard data
    setDashboardUpdates(prev => [{
      type: 'dashboard_sync',
      data: syncData,
      timestamp: new Date().toISOString()
    }, ...prev.slice(0, 99)]);

    // Update patient page data
    setPatientPageUpdates(prev => [{
      type: 'patient_page_sync',
      data: syncData,
      timestamp: new Date().toISOString()
    }, ...prev.slice(0, 99)]);

    console.log('🔄 Dashboard sync completed:', syncData);
  };

  // Auto-sync every 30 seconds
  useEffect(() => {
    const interval = setInterval(syncWithDashboard, 30000);
    return () => clearInterval(interval);
  }, [overallProgress, tabProgress]);

  const contextValue: EnrollmentRealtimeContextType = {
    // Real-time connection state
    isConnected,
    connectionStatus,
    lastUpdate,
    
    // Progress tracking
    tabProgress,
    overallProgress,
    
    // Active sessions
    activeSessions,
    
    // Actions
    updateProgress,
    transitionToNextSection,
    syncWithDashboard,
    
    // Dashboard integration
    dashboardUpdates,
    patientPageUpdates
  };

  return (
    <EnrollmentRealtimeContext.Provider value={contextValue}>
      {children}
    </EnrollmentRealtimeContext.Provider>
  );
};

export const useEnrollmentRealtimeContext = () => {
  const context = useContext(EnrollmentRealtimeContext);
  if (context === undefined) {
    throw new Error('useEnrollmentRealtimeContext must be used within an EnrollmentRealtimeProvider');
  }
  return context;
};