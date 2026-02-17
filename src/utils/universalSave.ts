/**
 * Universal Save System
 * Cross-agent session persistence for enrollment data
 */

interface UniversalProgress {
  currentStep: string;
  completedSteps: string[];
  formData: Record<string, any>;
  progress: number;
  lastUpdated: number;
  agent_type?: string;
  module_type?: string;
  enrollment_source?: string;
  [key: string]: any;
}

const STORAGE_PREFIX = 'enrollment_universal_';

/**
 * Save progress data for cross-agent resumption
 */
export const saveUniversalProgress = async (
  agentType: string,
  sessionId: string,
  progressData: UniversalProgress
): Promise<void> => {
  try {
    const storageKey = `${STORAGE_PREFIX}${agentType}_${sessionId}`;
    
    const serializedData = JSON.stringify({
      ...progressData,
      lastUpdated: Date.now(),
      savedAt: new Date().toISOString()
    });
    
    localStorage.setItem(storageKey, serializedData);
    
    console.log('Universal progress saved:', { agentType, sessionId, progress: progressData.progress });
  } catch (error) {
    console.error('Failed to save universal progress:', error);
  }
};

/**
 * Load progress data from universal save system
 */
export const loadUniversalProgress = async (
  agentType: string,
  sessionId: string
): Promise<UniversalProgress | null> => {
  try {
    const storageKey = `${STORAGE_PREFIX}${agentType}_${sessionId}`;
    const savedData = localStorage.getItem(storageKey);
    
    if (!savedData) {
      return null;
    }
    
    const progressData = JSON.parse(savedData) as UniversalProgress;
    
    // Check if data is not too old (7 days)
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    if (Date.now() - progressData.lastUpdated > maxAge) {
      localStorage.removeItem(storageKey);
      return null;
    }
    
    console.log('Universal progress loaded:', { agentType, sessionId, progress: progressData.progress });
    return progressData;
  } catch (error) {
    console.error('Failed to load universal progress:', error);
    return null;
  }
};

/**
 * Clear progress data
 */
export const clearUniversalProgress = async (
  agentType: string,
  sessionId: string
): Promise<void> => {
  try {
    const storageKey = `${STORAGE_PREFIX}${agentType}_${sessionId}`;
    localStorage.removeItem(storageKey);
    console.log('Universal progress cleared:', { agentType, sessionId });
  } catch (error) {
    console.error('Failed to clear universal progress:', error);
  }
};

/**
 * Get all saved sessions for an agent type
 */
export const getAllUniversalSessions = (agentType: string): string[] => {
  try {
    const sessions: string[] = [];
    const prefix = `${STORAGE_PREFIX}${agentType}_`;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        const sessionId = key.replace(prefix, '');
        sessions.push(sessionId);
      }
    }
    
    return sessions;
  } catch (error) {
    console.error('Failed to get universal sessions:', error);
    return [];
  }
};