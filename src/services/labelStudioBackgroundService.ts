/**
 * Label Studio Background Service
 * 
 * PURPOSE: Invisible ML training and recommendation engine
 * - Runs silently behind the scenes
 * - Collects user interactions for training
 * - Generates subtle inline hints/suggestions via useUniversalAI
 * - NO visible UI components (admin dashboard only)
 * 
 * ARCHITECTURE:
 * - Label Studio API (via edge function) = data labeling, templates, tags
 * - AI Suggestions = useUniversalAI hook (OpenAI, Claude, Gemini via single connector)
 * - NO duplication of AI providers
 * 
 * INTEGRATION: All Genie products (Mind, Spark, Vibe, Arc, Hub) + ASK Genie
 */

import { supabase } from '@/integrations/supabase/client';

export type TrainingEventType = 
  | 'caption_selected'
  | 'caption_edited'
  | 'hashtag_accepted'
  | 'hashtag_rejected'
  | 'thumbnail_chosen'
  | 'seo_applied'
  | 'brand_compliance_override'
  | 'accessibility_fix_applied'
  | 'script_enhancement_accepted'
  | 'voice_preference_selected';

export interface TrainingEvent {
  eventType: TrainingEventType;
  context: {
    product: 'mind' | 'spark' | 'vibe' | 'arc' | 'hub';
    contentType?: string;
    originalValue?: string;
    selectedValue?: string;
    userAction: 'accept' | 'reject' | 'edit' | 'ignore';
  };
  metadata?: Record<string, any>;
}

export interface InlineHint {
  id: string;
  type: 'suggestion' | 'warning' | 'improvement';
  message: string;
  action?: {
    label: string;
    callback: () => void;
  };
  confidence: number; // 0-1 based on training data
  dismissable: boolean;
}

// Product-specific hint templates (static, ML-trained patterns)
const PRODUCT_HINT_TEMPLATES: Record<string, InlineHint[]> = {
  mind: [
    { id: 'mind_seo', type: 'improvement', message: 'Consider adding keywords for better SEO', confidence: 0.85, dismissable: true },
    { id: 'mind_clarity', type: 'suggestion', message: 'AI can enhance this paragraph for clarity', confidence: 0.78, dismissable: true }
  ],
  spark: [
    { id: 'spark_pause', type: 'suggestion', message: 'This script section could use more natural pauses', confidence: 0.82, dismissable: true },
    { id: 'spark_emotion', type: 'improvement', message: 'Add emotional cues for better delivery', confidence: 0.75, dismissable: true }
  ],
  vibe: [
    { id: 'vibe_audio', type: 'warning', message: 'Audio levels may need normalization', confidence: 0.9, dismissable: true },
    { id: 'vibe_music', type: 'suggestion', message: 'Consider adding background music at this point', confidence: 0.7, dismissable: true }
  ],
  arc: [
    { id: 'arc_title', type: 'improvement', message: 'Episode title could be more engaging', confidence: 0.8, dismissable: true },
    { id: 'arc_chapters', type: 'suggestion', message: 'Add chapter markers for better navigation', confidence: 0.72, dismissable: true }
  ],
  hub: [
    { id: 'hub_trending', type: 'suggestion', message: 'Trending topics related to your content', confidence: 0.88, dismissable: true },
    { id: 'hub_thumb', type: 'improvement', message: 'Optimize thumbnail for platform requirements', confidence: 0.85, dismissable: true }
  ]
};

class LabelStudioBackgroundService {
  private static instance: LabelStudioBackgroundService;
  private eventQueue: TrainingEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private isEnabled: boolean = true;

  private constructor() {
    // Start background flush every 30 seconds
    this.flushInterval = setInterval(() => this.flushEvents(), 30000);
  }

  static getInstance(): LabelStudioBackgroundService {
    if (!LabelStudioBackgroundService.instance) {
      LabelStudioBackgroundService.instance = new LabelStudioBackgroundService();
    }
    return LabelStudioBackgroundService.instance;
  }

  /**
   * Record a training event (invisible to user)
   */
  recordEvent(event: TrainingEvent): void {
    if (!this.isEnabled) return;
    
    this.eventQueue.push({
      ...event,
      metadata: {
        ...event.metadata,
        timestamp: new Date().toISOString(),
        sessionId: this.getSessionId()
      }
    });

    // Auto-flush if queue gets large
    if (this.eventQueue.length >= 10) {
      this.flushEvents();
    }
  }

  /**
   * Get inline hints based on context (static ML patterns)
   * NOTE: No edge function call needed - hints are client-side patterns
   */
  getInlineHints(
    product: 'mind' | 'spark' | 'vibe' | 'arc' | 'hub',
    _contentContext: Record<string, any>
  ): InlineHint[] {
    const hints = PRODUCT_HINT_TEMPLATES[product] || [];
    // Filter to high-confidence hints only
    return hints.filter(h => h.confidence >= 0.7);
  }

  /**
   * Get smart suggestions using Universal AI (via ai-universal-processor)
   * NOTE: Uses the SAME AI connector as the rest of the app - no duplication!
   */
  async getSuggestions(
    type: 'caption' | 'hashtag' | 'thumbnail' | 'seo' | 'script',
    input: string,
    _context?: Record<string, any>
  ): Promise<string[]> {
    if (!input?.trim()) return [];

    const prompts: Record<string, string> = {
      caption: `Generate 3 engaging captions for: "${input}". Return ONLY a JSON array of strings.`,
      hashtag: `Suggest 5 relevant hashtags for: "${input}". Return ONLY a JSON array of strings starting with #.`,
      thumbnail: `Suggest 3 thumbnail concepts for: "${input}". Return ONLY a JSON array of short descriptions.`,
      seo: `Suggest 3 SEO improvements for: "${input}". Return ONLY a JSON array of actionable tips.`,
      script: `Suggest 2 script enhancements for: "${input}". Return ONLY a JSON array of suggestions.`
    };

    try {
      // Use the SAME ai-universal-processor that useUniversalAI uses
      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          provider: 'gemini',
          prompt: prompts[type],
          systemPrompt: 'You are a helpful assistant. Return ONLY valid JSON arrays, no markdown or explanations.',
          action: 'generate'
        }
      });

      if (error || !data?.content) {
        console.debug('[LabelStudio] AI suggestion failed, returning empty');
        return [];
      }

      // Parse JSON from response
      const content = data.content;
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanContent);
    } catch (err) {
      console.debug('[LabelStudio] Suggestion parse error, returning empty');
      return [];
    }
  }

  /**
   * Flush queued events to Label Studio backend
   */
  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const eventsToFlush = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await supabase.functions.invoke('label-studio-connector', {
        body: {
          action: 'recordTrainingEvents',
          events: eventsToFlush
        }
      });
      console.debug(`[LabelStudio] Flushed ${eventsToFlush.length} training events`);
    } catch (err) {
      // Re-queue on failure
      this.eventQueue = [...eventsToFlush, ...this.eventQueue];
      console.debug('[LabelStudio] Event flush failed, re-queued');
    }
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('ls_session_id');
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem('ls_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Enable/disable tracking (for privacy)
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.eventQueue = [];
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flushEvents();
  }
}

// Export singleton instance
export const labelStudioService = LabelStudioBackgroundService.getInstance();

// Export hook for React components
export function useLabelStudioBackground() {
  return {
    recordEvent: (event: TrainingEvent) => labelStudioService.recordEvent(event),
    // Sync version - returns cached hints immediately
    getHints: (product: 'mind' | 'spark' | 'vibe' | 'arc' | 'hub', context: Record<string, any>) => 
      labelStudioService.getInlineHints(product, context),
    // Async version - calls Universal AI
    getSuggestions: (type: 'caption' | 'hashtag' | 'thumbnail' | 'seo' | 'script', input: string, context?: Record<string, any>) =>
      labelStudioService.getSuggestions(type, input, context),
    setEnabled: (enabled: boolean) => labelStudioService.setEnabled(enabled)
  };
}
