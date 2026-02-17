import { useState, useEffect, useCallback, useRef } from 'react';

// Types for unified flow (keeping compatible interface)
export interface FlowEvent {
  id: string;
  type: string;
  sessionId: string;
  userId?: string;
  timestamp: string;
  data: any;
}

export interface TemplateUpdate {
  templateId: string;
  changes: any;
  triggeredBy: string;
}

export interface VisualChange {
  type: string;
  nodeId?: string;
  data: any;
  coordinates?: { x: number; y: number };
}

export interface AnalyticsEvent {
  category: 'visual' | 'flow' | 'ai' | 'template' | 'collaboration';
  action: string;
  label: string;
  metadata?: any;
}

export interface UnifiedFlowState {
  aiPrompts: FlowEvent[];
  templateUpdates: FlowEvent[];
  visualChanges: FlowEvent[];
  analytics: AnalyticsEvent[];
  isConnected: boolean;
  isProcessing: boolean;
}

export interface UnifiedFlowActions {
  processAIPrompt: (prompt: string) => Promise<void>;
  updateTemplate: (templateId: string, changes: any) => Promise<void>;
  broadcastVisualChange: (change: VisualChange) => Promise<void>;
  trackAnalytics: (event: AnalyticsEvent) => void;
  clearEvents: () => void;
}

export const useUnifiedFlow = (sessionId: string, userId?: string) => {
  const [state, setState] = useState<UnifiedFlowState>({
    aiPrompts: [],
    templateUpdates: [],
    visualChanges: [],
    analytics: [],
    isConnected: false,
    isProcessing: false
  });

  const unsubscribersRef = useRef<(() => void)[]>([]);

  // Initialize unified flow integration (mock implementation)
  useEffect(() => {
    setState(prev => ({ ...prev, isConnected: true }));
    
    // Cleanup function
    return () => {
      setState(prev => ({ ...prev, isConnected: false }));
    };
  }, [sessionId]);

  const handleAIPromptEvent = useCallback((event: FlowEvent) => {
    if (event.sessionId === sessionId || event.sessionId === 'global') {
      setState(prev => ({
        ...prev,
        aiPrompts: [event, ...prev.aiPrompts].slice(0, 50) // Keep last 50
      }));
    }
  }, [sessionId]);

  const handleTemplateUpdateEvent = useCallback((event: FlowEvent) => {
    if (event.sessionId === sessionId || event.sessionId === 'global') {
      setState(prev => ({
        ...prev,
        templateUpdates: [event, ...prev.templateUpdates].slice(0, 50)
      }));
    }
  }, [sessionId]);

  const handleVisualChangeEvent = useCallback((event: FlowEvent) => {
    if (event.sessionId === sessionId || event.sessionId === 'global') {
      setState(prev => ({
        ...prev,
        visualChanges: [event, ...prev.visualChanges].slice(0, 100)
      }));
    }
  }, [sessionId]);

  const handleAnalyticsEvent = useCallback((event: FlowEvent) => {
    setState(prev => ({
      ...prev,
      analytics: [event.data, ...prev.analytics].slice(0, 200)
    }));
  }, []);

  const processAIPrompt = useCallback(async (prompt: string) => {
    setState(prev => ({ ...prev, isProcessing: true }));
    
    try {
      // Mock AI prompt processing - integrate with your existing AI systems
      console.log('Processing AI prompt:', prompt);
      
      // Simulate processing and add to state
      const event: FlowEvent = {
        id: crypto.randomUUID(),
        type: 'ai_prompt',
        sessionId,
        userId,
        timestamp: new Date().toISOString(),
        data: { prompt }
      };
      
      setState(prev => ({
        ...prev,
        aiPrompts: [event, ...prev.aiPrompts].slice(0, 50)
      }));
    } catch (error) {
      console.error('Error processing AI prompt:', error);
      throw error;
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [sessionId, userId]);

  const updateTemplate = useCallback(async (templateId: string, changes: any) => {
    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      // Mock template update - integrate with your existing template systems
      console.log('Updating template:', templateId, changes);
      
      const event: FlowEvent = {
        id: crypto.randomUUID(),
        type: 'template_update',
        sessionId,
        userId,
        timestamp: new Date().toISOString(),
        data: { templateId, changes }
      };
      
      setState(prev => ({
        ...prev,
        templateUpdates: [event, ...prev.templateUpdates].slice(0, 50)
      }));
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [sessionId, userId]);

  const broadcastVisualChange = useCallback(async (change: VisualChange) => {
    try {
      // Mock visual change broadcast - integrate with your existing visual systems
      console.log('Broadcasting visual change:', change);
      
      const event: FlowEvent = {
        id: crypto.randomUUID(),
        type: 'visual_change',
        sessionId,
        userId,
        timestamp: new Date().toISOString(),
        data: change
      };
      
      setState(prev => ({
        ...prev,
        visualChanges: [event, ...prev.visualChanges].slice(0, 100)
      }));
    } catch (error) {
      console.error('Error broadcasting visual change:', error);
      throw error;
    }
  }, [sessionId, userId]);

  const trackAnalytics = useCallback((event: AnalyticsEvent) => {
    // Mock analytics tracking - integrate with your existing analytics systems
    console.log('Tracking analytics:', event);
    
    setState(prev => ({
      ...prev,
      analytics: [event, ...prev.analytics].slice(0, 200)
    }));
  }, []);

  const clearEvents = useCallback(() => {
    setState(prev => ({
      ...prev,
      aiPrompts: [],
      templateUpdates: [],
      visualChanges: [],
      analytics: []
    }));
  }, []);

  // Advanced flow analysis
  const getFlowMetrics = useCallback(() => {
    const totalEvents = state.aiPrompts.length + state.templateUpdates.length + state.visualChanges.length;
    const recentEvents = [...state.aiPrompts, ...state.templateUpdates, ...state.visualChanges]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    return {
      totalEvents,
      aiPrompts: state.aiPrompts.length,
      templateUpdates: state.templateUpdates.length,
      visualChanges: state.visualChanges.length,
      recentEvents,
      averageProcessingTime: calculateAverageProcessingTime(),
      flowCompletionRate: calculateFlowCompletionRate()
    };
  }, [state]);

  const calculateAverageProcessingTime = useCallback(() => {
    // Calculate average time between AI prompt and template update
    let totalTime = 0;
    let pairCount = 0;

    state.aiPrompts.forEach(aiEvent => {
      const matchingTemplate = state.templateUpdates.find(templateEvent => 
        Math.abs(new Date(templateEvent.timestamp).getTime() - new Date(aiEvent.timestamp).getTime()) < 30000 // Within 30 seconds
      );

      if (matchingTemplate) {
        const timeDiff = new Date(matchingTemplate.timestamp).getTime() - new Date(aiEvent.timestamp).getTime();
        totalTime += timeDiff;
        pairCount++;
      }
    });

    return pairCount > 0 ? Math.round(totalTime / pairCount / 1000 * 100) / 100 : 0; // Convert to seconds
  }, [state.aiPrompts, state.templateUpdates]);

  const calculateFlowCompletionRate = useCallback(() => {
    // Calculate percentage of AI prompts that resulted in template updates
    if (state.aiPrompts.length === 0) return 0;

    const completedFlows = state.aiPrompts.filter(aiEvent => 
      state.templateUpdates.some(templateEvent => 
        Math.abs(new Date(templateEvent.timestamp).getTime() - new Date(aiEvent.timestamp).getTime()) < 60000 // Within 1 minute
      )
    ).length;

    return Math.round((completedFlows / state.aiPrompts.length) * 100);
  }, [state.aiPrompts, state.templateUpdates]);

  const getFlowInsights = useCallback(() => {
    const metrics = getFlowMetrics();
    const insights = [];

    if (metrics.averageProcessingTime > 5) {
      insights.push({
        type: 'performance',
        severity: 'warning',
        message: `Average processing time is ${metrics.averageProcessingTime}s, consider optimizing AI prompts`
      });
    }

    if (metrics.flowCompletionRate < 80) {
      insights.push({
        type: 'completion',
        severity: 'error',
        message: `Flow completion rate is ${metrics.flowCompletionRate}%, check for integration issues`
      });
    }

    if (metrics.visualChanges > metrics.aiPrompts * 3) {
      insights.push({
        type: 'usage',
        severity: 'info',
        message: 'High visual activity detected, users are actively collaborating'
      });
    }

    return insights;
  }, [getFlowMetrics]);

  const actions: UnifiedFlowActions = {
    processAIPrompt,
    updateTemplate,
    broadcastVisualChange,
    trackAnalytics,
    clearEvents
  };

  return {
    state,
    actions,
    metrics: getFlowMetrics(),
    insights: getFlowInsights(),
    isConnected: state.isConnected
  };
};

export default useUnifiedFlow;