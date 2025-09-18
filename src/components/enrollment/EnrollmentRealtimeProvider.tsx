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
    const calculatedProgress = Math.round(avgProgress);
    
    // Only update if progress actually changed to prevent infinite loops
    if (calculatedProgress !== overallProgress) {
      setOverallProgress(calculatedProgress);
    }
  }, [tabProgress]);

  // Handle real-time session data updates from ALL enrollment tables
  useEffect(() => {
    if (sessionData && Object.keys(sessionData).length > 0) {
      setActiveSessions(sessionData);
      
      // Update progress based on session data from multiple sources
      Object.entries(sessionData).forEach(([table, data]: [string, any]) => {
        if (data.data) {
          const instanceData = data.data;
          
          // Handle different table types
          let tabId = 'consent_mode';
          let sectionProgress = 0;
          
          if (table === 'patient_enrollments') {
            const currentSection = instanceData.current_section;
            tabId = currentSection?.split('_')[0] || 'consent_mode';
            sectionProgress = instanceData.progress_percentage || 0;
          } else if (table === 'enrollment_consent') {
            tabId = 'consent_mode';
            sectionProgress = calculateFieldProgress(instanceData, ['provider_name', 'provider_npi', 'treatment_center', 'patient_consent_method']);
          } else if (table === 'enrollment_patient_info') {
            tabId = 'patient_info';
            sectionProgress = calculateFieldProgress(instanceData, ['first_name', 'last_name', 'date_of_birth', 'preferred_language', 'email', 'phone']);
          } else if (table === 'enrollment_provider_info') {
            tabId = 'provider_treatment_center';
            sectionProgress = calculateFieldProgress(instanceData, ['referring_provider_npi']);
          } else if (table === 'enrollment_insurance_info') {
            tabId = 'insurance';
            sectionProgress = calculateFieldProgress(instanceData, ['insurance_provider', 'member_id', 'policy_holder']);
          } else if (table === 'enrollment_clinical_info') {
            tabId = 'treatment_clinical';
            sectionProgress = calculateFieldProgress(instanceData, ['primary_diagnosis', 'treatment_goals']);
          }
          
          if (tabProgress[tabId]) {
            updateProgress(tabId, {
              currentSection: `${tabId}_${table}`,
              lastUpdated: data.lastUpdate,
              completion: Math.min(sectionProgress, 100)
            });
          }
        }
      });

      // Sync with dashboards
      syncWithDashboard();
    }
  }, [sessionData]);

  // Enhanced field progress calculation for different data structures
  const calculateFieldProgress = (data: any, requiredFields: string[]): number => {
    if (!data || !requiredFields.length) return 0;
    
    const completedFields = requiredFields.filter(field => {
      const value = data[field];
      return value !== null && value !== undefined && value !== '';
    });
    
    return Math.round((completedFields.length / requiredFields.length) * 100);
  };

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
    setTabProgress(prev => {
      const newProgress = {
        ...prev,
        [tabId]: {
          ...prev[tabId],
          ...progress,
          lastUpdated: new Date().toISOString()
        }
      };
      
      console.log(`📊 Progress updated for ${tabId}:`, newProgress[tabId]);
      return newProgress;
    });

    // Create real-time update for dashboards
    const update = {
      type: 'progress_update',
      tabId,
      progress: progress,
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
  }, [overallProgress, tabProgress, calculateFieldProgress]);

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