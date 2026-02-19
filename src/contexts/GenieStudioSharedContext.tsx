/**
 * Genie Suite Shared Context
 *
 * PURPOSE: Provide shared state and P2 enhancements across all Genie Suite tools
 * - Spark, Mind, Vibe, Arc share content context
 * - Enables seamless content flow between tools
 * - Centralizes AI training feedback collection
 * - Integrates with Label Studio and RAG systems
 */

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { labelStudioService } from '@/services/labelStudioBackgroundService';
import type { FeedbackContext, FeedbackData } from '@/components/genie-studio/InlineTrainAIFeedback';

// Content that flows between tools
export interface SharedContent {
  id: string;
  type: 'script' | 'recording' | 'clip' | 'show' | 'document';
  title: string;
  content: string;
  source: 'spark' | 'mind' | 'vibe' | 'arc' | 'document';
  createdAt: string;
  metadata?: Record<string, any>;
}

// P2 Enhancement settings
export interface P2EnhancementSettings {
  seoOptimization: boolean;
  brandCompliance: boolean;
  accessibilityChecks: boolean;
  multiPlatformAdaptation: boolean;
  trendAnalysis: boolean;
  captionGeneration: boolean;
  thumbnailSuggestions: boolean;
}

// User preferences for AI behavior
export interface AIPreferences {
  preferredTone: 'professional' | 'casual' | 'enthusiastic' | 'neutral';
  targetAudience: string;
  contentLength: 'short' | 'medium' | 'long';
  includeEmojis: boolean;
  includeHashtags: boolean;
}

// Feedback analytics
export interface FeedbackStats {
  totalFeedback: number;
  positiveRatio: number;
  mostRatedContext: FeedbackContext | null;
  lastFeedbackAt: string | null;
}

interface GenieStudioContextValue {
  // Shared content between tools
  sharedContent: SharedContent[];
  addSharedContent: (content: Omit<SharedContent, 'id' | 'createdAt'>) => void;
  getContentForTool: (tool: string) => SharedContent[];
  clearSharedContent: () => void;

  // P2 Enhancements
  p2Settings: P2EnhancementSettings;
  updateP2Settings: (settings: Partial<P2EnhancementSettings>) => void;
  
  // AI Preferences
  aiPreferences: AIPreferences;
  updateAIPreferences: (prefs: Partial<AIPreferences>) => void;

  // Current tool context
  currentTool: 'spark' | 'mind' | 'vibe' | 'arc' | 'hub' | null;
  setCurrentTool: (tool: 'spark' | 'mind' | 'vibe' | 'arc' | 'hub' | null) => void;

  // Feedback collection
  recordFeedback: (data: FeedbackData, rating: 'positive' | 'negative', text?: string) => Promise<void>;
  feedbackStats: FeedbackStats;
  refreshFeedbackStats: () => Promise<void>;

  // Content pipeline state
  pipelineContent: string;
  setPipelineContent: (content: string) => void;
}

const defaultP2Settings: P2EnhancementSettings = {
  seoOptimization: true,
  brandCompliance: true,
  accessibilityChecks: true,
  multiPlatformAdaptation: false,
  trendAnalysis: false,
  captionGeneration: true,
  thumbnailSuggestions: true
};

const defaultAIPreferences: AIPreferences = {
  preferredTone: 'professional',
  targetAudience: 'general',
  contentLength: 'medium',
  includeEmojis: false,
  includeHashtags: true
};

const defaultFeedbackStats: FeedbackStats = {
  totalFeedback: 0,
  positiveRatio: 0,
  mostRatedContext: null,
  lastFeedbackAt: null
};

const GenieStudioContext = createContext<GenieStudioContextValue | undefined>(undefined);

export const GenieStudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sharedContent, setSharedContent] = useState<SharedContent[]>([]);
  const [p2Settings, setP2Settings] = useState<P2EnhancementSettings>(defaultP2Settings);
  const [aiPreferences, setAIPreferences] = useState<AIPreferences>(defaultAIPreferences);
  const [currentTool, setCurrentTool] = useState<'spark' | 'mind' | 'vibe' | 'arc' | 'hub' | null>(null);
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats>(defaultFeedbackStats);
  const [pipelineContent, setPipelineContent] = useState('');
  
  const feedbackCountRef = useRef(0);

  // Load saved preferences from localStorage
  useEffect(() => {
    const savedP2 = localStorage.getItem('genie_p2_settings');
    const savedAI = localStorage.getItem('genie_ai_preferences');
    
    if (savedP2) {
      try {
        setP2Settings({ ...defaultP2Settings, ...JSON.parse(savedP2) });
      } catch (e) {
        console.warn('Failed to parse P2 settings');
      }
    }
    
    if (savedAI) {
      try {
        setAIPreferences({ ...defaultAIPreferences, ...JSON.parse(savedAI) });
      } catch (e) {
        console.warn('Failed to parse AI preferences');
      }
    }
  }, []);

  // Fetch feedback stats on mount
  const refreshFeedbackStats = useCallback(async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('conversation_learning_feedback')
        .select('feedback_type, domain, created_at')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error || !data) return;

      const total = data.length;
      const positive = data.filter(f => f.feedback_type === 'positive').length;
      
      // Find most rated context
      const contextCounts: Record<string, number> = {};
      data.forEach(f => {
        const ctx = f.domain || 'unknown';
        contextCounts[ctx] = (contextCounts[ctx] || 0) + 1;
      });
      
      const mostRated = Object.entries(contextCounts)
        .sort((a, b) => b[1] - a[1])[0];

      setFeedbackStats({
        totalFeedback: total,
        positiveRatio: total > 0 ? positive / total : 0,
        mostRatedContext: (mostRated?.[0] as FeedbackContext) || null,
        lastFeedbackAt: data[0]?.created_at || null
      });
    } catch (error) {
      console.error('Failed to fetch feedback stats:', error);
    }
  }, []);

  useEffect(() => {
    refreshFeedbackStats();
  }, [refreshFeedbackStats]);

  const addSharedContent = useCallback((content: Omit<SharedContent, 'id' | 'createdAt'>) => {
    const newContent: SharedContent = {
      ...content,
      id: `content_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      createdAt: new Date().toISOString()
    };
    
    setSharedContent(prev => [...prev, newContent]);
    
    // Also set as pipeline content for cross-tool flow
    if (content.type === 'script') {
      setPipelineContent(content.content);
    }
  }, []);

  const getContentForTool = useCallback((tool: string): SharedContent[] => {
    // Filter content relevant to each tool
    const relevantTypes: Record<string, SharedContent['type'][]> = {
      spark: ['script'],
      mind: ['script'],
      vibe: ['script', 'recording'],
      arc: ['recording', 'clip', 'show'],
      document: ['document', 'script']
    };
    
    return sharedContent.filter(c => 
      relevantTypes[tool]?.includes(c.type) || c.source === tool
    );
  }, [sharedContent]);

  const clearSharedContent = useCallback(() => {
    setSharedContent([]);
    setPipelineContent('');
  }, []);

  const updateP2Settings = useCallback((settings: Partial<P2EnhancementSettings>) => {
    setP2Settings(prev => {
      const updated = { ...prev, ...settings };
      localStorage.setItem('genie_p2_settings', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateAIPreferences = useCallback((prefs: Partial<AIPreferences>) => {
    setAIPreferences(prev => {
      const updated = { ...prev, ...prefs };
      localStorage.setItem('genie_ai_preferences', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const recordFeedback = useCallback(async (
    data: FeedbackData,
    rating: 'positive' | 'negative',
    text?: string
  ) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      // Store to RAG for learning
      await supabase
        .from('knowledge_base_contributions')
        .insert({
          user_id: user.user?.id,
          contribution_type: 'ai_feedback',
          content_summary: JSON.stringify({
            rating,
            context: data.context,
            product: data.product,
            feedbackText: text
          }),
          rag_enhancement_data: {
            feedback_type: rating,
            context: data.context,
            product: data.product,
            timestamp: new Date().toISOString()
          },
          relevance_score: rating === 'positive' ? 0.9 : 0.3
        });

      // Store detailed feedback
      await supabase
        .from('conversation_learning_feedback')
        .insert({
          feedback_type: rating,
          feedback_text: text || null,
          domain: data.product,
          feedback_score: rating === 'positive' ? 5 : 1,
          message_index: 0,
          metadata: {
            context: data.context,
            contentId: data.contentId,
            timestamp: new Date().toISOString()
          }
        });

      // Record to Label Studio
      labelStudioService.recordEvent({
        eventType: 'script_enhancement_accepted',
        context: {
          product: data.product as any,
          contentType: data.context,
          userAction: rating === 'positive' ? 'accept' : 'reject'
        },
        metadata: { feedbackText: text }
      });

      feedbackCountRef.current += 1;
      
      // Refresh stats periodically
      if (feedbackCountRef.current % 5 === 0) {
        refreshFeedbackStats();
      }
    } catch (error) {
      console.error('Failed to record feedback:', error);
    }
  }, [refreshFeedbackStats]);

  const value: GenieStudioContextValue = {
    sharedContent,
    addSharedContent,
    getContentForTool,
    clearSharedContent,
    p2Settings,
    updateP2Settings,
    aiPreferences,
    updateAIPreferences,
    currentTool,
    setCurrentTool,
    recordFeedback,
    feedbackStats,
    refreshFeedbackStats,
    pipelineContent,
    setPipelineContent
  };

  return (
    <GenieStudioContext.Provider value={value}>
      {children}
    </GenieStudioContext.Provider>
  );
};

export const useGenieStudioContext = () => {
  const context = useContext(GenieStudioContext);
  if (!context) {
    throw new Error('useGenieStudioContext must be used within GenieStudioProvider');
  }
  return context;
};

// Hook for P2 enhancements only
export const useP2Enhancements = () => {
  const { p2Settings, updateP2Settings, aiPreferences, updateAIPreferences } = useGenieStudioContext();
  return { p2Settings, updateP2Settings, aiPreferences, updateAIPreferences };
};

// Hook for feedback only
export const useFeedbackContext = () => {
  const { recordFeedback, feedbackStats, refreshFeedbackStats } = useGenieStudioContext();
  return { recordFeedback, feedbackStats, refreshFeedbackStats };
};

// Hook for content pipeline
export const useContentPipeline = () => {
  const { sharedContent, addSharedContent, getContentForTool, pipelineContent, setPipelineContent } = useGenieStudioContext();
  return { sharedContent, addSharedContent, getContentForTool, pipelineContent, setPipelineContent };
};

export default GenieStudioContext;
