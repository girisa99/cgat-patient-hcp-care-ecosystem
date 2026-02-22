/**
 * Zustand Global Store — Genie Studio Shared State
 *
 * Replaces GenieStudioSharedContext with a performant Zustand store.
 * - Selector-based subscriptions prevent unnecessary re-renders
 * - Built-in persist middleware handles localStorage automatically
 * - No Provider wrapper needed — import and use anywhere
 *
 * MIGRATION: Components using useGenieStudioContext() should migrate to
 * this store. The old Context is preserved for backward compatibility
 * but new code should use these hooks.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import { labelStudioService } from '@/services/labelStudioBackgroundService';
import type { FeedbackContext, FeedbackData } from '@/components/genie-studio/InlineTrainAIFeedback';

// ─── Types ──────────────────────────────────────────────────────────────────

export type GenieTool = 'spark' | 'mind' | 'vibe' | 'arc' | 'hub' | 'cast' | 'deck' | null;

export interface SharedContent {
  id: string;
  type: 'script' | 'recording' | 'clip' | 'show' | 'document';
  title: string;
  content: string;
  source: GenieTool;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface P2EnhancementSettings {
  seoOptimization: boolean;
  brandCompliance: boolean;
  accessibilityChecks: boolean;
  multiPlatformAdaptation: boolean;
  trendAnalysis: boolean;
  captionGeneration: boolean;
  thumbnailSuggestions: boolean;
}

export interface AIPreferences {
  preferredTone: 'professional' | 'casual' | 'enthusiastic' | 'neutral';
  targetAudience: string;
  contentLength: 'short' | 'medium' | 'long';
  includeEmojis: boolean;
  includeHashtags: boolean;
}

export interface FeedbackStats {
  totalFeedback: number;
  positiveRatio: number;
  mostRatedContext: FeedbackContext | null;
  lastFeedbackAt: string | null;
}

// ─── Defaults ───────────────────────────────────────────────────────────────

const DEFAULT_P2_SETTINGS: P2EnhancementSettings = {
  seoOptimization: true,
  brandCompliance: true,
  accessibilityChecks: true,
  multiPlatformAdaptation: false,
  trendAnalysis: false,
  captionGeneration: true,
  thumbnailSuggestions: true,
};

const DEFAULT_AI_PREFERENCES: AIPreferences = {
  preferredTone: 'professional',
  targetAudience: 'general',
  contentLength: 'medium',
  includeEmojis: false,
  includeHashtags: true,
};

const DEFAULT_FEEDBACK_STATS: FeedbackStats = {
  totalFeedback: 0,
  positiveRatio: 0,
  mostRatedContext: null,
  lastFeedbackAt: null,
};

// Content type relevance per tool
const TOOL_CONTENT_TYPES: Record<string, SharedContent['type'][]> = {
  spark: ['script'],
  mind: ['script'],
  vibe: ['script', 'recording'],
  arc: ['recording', 'clip', 'show'],
  cast: ['script', 'recording'],
  deck: ['script', 'document'],
  document: ['document', 'script'],
};

// ─── Store Interface ────────────────────────────────────────────────────────

interface GenieStudioState {
  // Shared content between tools
  sharedContent: SharedContent[];
  pipelineContent: string;

  // Preferences (persisted)
  p2Settings: P2EnhancementSettings;
  aiPreferences: AIPreferences;

  // Current tool context
  currentTool: GenieTool;

  // Feedback analytics (not persisted — fetched from DB)
  feedbackStats: FeedbackStats;
}

interface GenieStudioActions {
  // Content actions
  addSharedContent: (content: Omit<SharedContent, 'id' | 'createdAt'>) => void;
  getContentForTool: (tool: string) => SharedContent[];
  clearSharedContent: () => void;
  setPipelineContent: (content: string) => void;

  // Preference actions
  updateP2Settings: (settings: Partial<P2EnhancementSettings>) => void;
  updateAIPreferences: (prefs: Partial<AIPreferences>) => void;

  // Tool context
  setCurrentTool: (tool: GenieTool) => void;

  // Feedback actions
  recordFeedback: (data: FeedbackData, rating: 'positive' | 'negative', text?: string) => Promise<void>;
  refreshFeedbackStats: () => Promise<void>;
}

type GenieStudioStore = GenieStudioState & GenieStudioActions;

// ─── Store ──────────────────────────────────────────────────────────────────

export const useGenieStudioStore = create<GenieStudioStore>()(
  persist(
    (set, get) => ({
      // ── State ──
      sharedContent: [],
      pipelineContent: '',
      p2Settings: DEFAULT_P2_SETTINGS,
      aiPreferences: DEFAULT_AI_PREFERENCES,
      currentTool: null,
      feedbackStats: DEFAULT_FEEDBACK_STATS,

      // ── Content Actions ──
      addSharedContent: (content) => {
        const newContent: SharedContent = {
          ...content,
          id: `content_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          sharedContent: [...state.sharedContent, newContent],
          ...(content.type === 'script' ? { pipelineContent: content.content } : {}),
        }));
      },

      getContentForTool: (tool: string) => {
        const { sharedContent } = get();
        const relevantTypes = TOOL_CONTENT_TYPES[tool];
        if (!relevantTypes) return sharedContent;
        return sharedContent.filter(
          (c) => relevantTypes.includes(c.type) || c.source === tool
        );
      },

      clearSharedContent: () => set({ sharedContent: [], pipelineContent: '' }),

      setPipelineContent: (content) => set({ pipelineContent: content }),

      // ── Preference Actions ──
      updateP2Settings: (settings) =>
        set((state) => ({ p2Settings: { ...state.p2Settings, ...settings } })),

      updateAIPreferences: (prefs) =>
        set((state) => ({ aiPreferences: { ...state.aiPreferences, ...prefs } })),

      // ── Tool Context ──
      setCurrentTool: (tool) => set({ currentTool: tool }),

      // ── Feedback Actions ──
      recordFeedback: async (data, rating, text) => {
        try {
          const { data: user } = await supabase.auth.getUser();

          await supabase.from('knowledge_base_contributions').insert({
            user_id: user.user?.id,
            contribution_type: 'ai_feedback',
            content_summary: JSON.stringify({
              rating,
              context: data.context,
              product: data.product,
              feedbackText: text,
            }),
            rag_enhancement_data: {
              feedback_type: rating,
              context: data.context,
              product: data.product,
              timestamp: new Date().toISOString(),
            },
            relevance_score: rating === 'positive' ? 0.9 : 0.3,
          });

          await supabase.from('conversation_learning_feedback').insert({
            feedback_type: rating,
            feedback_text: text || null,
            domain: data.product,
            feedback_score: rating === 'positive' ? 5 : 1,
            message_index: 0,
            metadata: {
              context: data.context,
              contentId: data.contentId,
              timestamp: new Date().toISOString(),
            },
          });

          labelStudioService.recordEvent({
            eventType: 'script_enhancement_accepted',
            context: {
              product: data.product as any,
              contentType: data.context,
              userAction: rating === 'positive' ? 'accept' : 'reject',
            },
            metadata: { feedbackText: text },
          });
        } catch (error) {
          console.error('Failed to record feedback:', error);
        }
      },

      refreshFeedbackStats: async () => {
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
          const positive = data.filter((f) => f.feedback_type === 'positive').length;

          const contextCounts: Record<string, number> = {};
          data.forEach((f) => {
            const ctx = f.domain || 'unknown';
            contextCounts[ctx] = (contextCounts[ctx] || 0) + 1;
          });

          const mostRated = Object.entries(contextCounts).sort(
            (a, b) => b[1] - a[1]
          )[0];

          set({
            feedbackStats: {
              totalFeedback: total,
              positiveRatio: total > 0 ? positive / total : 0,
              mostRatedContext: (mostRated?.[0] as FeedbackContext) || null,
              lastFeedbackAt: data[0]?.created_at || null,
            },
          });
        } catch (error) {
          console.error('Failed to fetch feedback stats:', error);
        }
      },
    }),
    {
      name: 'genie-studio-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist preferences, not transient state
      partialize: (state) => ({
        p2Settings: state.p2Settings,
        aiPreferences: state.aiPreferences,
        currentTool: state.currentTool,
      }),
    }
  )
);

// ─── Selector Hooks (prevent unnecessary re-renders) ────────────────────────

export const useP2Settings = () => useGenieStudioStore((s) => s.p2Settings);
export const useAIPreferences = () => useGenieStudioStore((s) => s.aiPreferences);
export const useCurrentTool = () => useGenieStudioStore((s) => s.currentTool);
export const usePipelineContent = () => useGenieStudioStore((s) => s.pipelineContent);
export const useFeedbackStats = () => useGenieStudioStore((s) => s.feedbackStats);
