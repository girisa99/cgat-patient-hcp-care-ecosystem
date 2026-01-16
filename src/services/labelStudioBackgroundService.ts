/**
 * Label Studio Background Service
 * 
 * PURPOSE: Invisible ML training and recommendation engine
 * - Runs silently behind the scenes
 * - Collects user interactions for training
 * - Generates subtle inline hints/suggestions
 * - NO visible UI components (admin dashboard only)
 * 
 * INTEGRATION: All Genie products (Mind, Spark, Vibe, Arc, Hub)
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
   * Get inline hints based on context and ML predictions
   */
  async getInlineHints(
    product: 'mind' | 'spark' | 'vibe' | 'arc' | 'hub',
    contentContext: Record<string, any>
  ): Promise<InlineHint[]> {
    try {
      const { data, error } = await supabase.functions.invoke('label-studio-connector', {
        body: {
          action: 'getHints',
          product,
          context: contentContext
        }
      });

      if (error || !data?.success) {
        console.debug('[LabelStudio] No hints available');
        return [];
      }

      return data.hints || [];
    } catch (err) {
      // Silently fail - this is background functionality
      console.debug('[LabelStudio] Hints fetch failed silently', err);
      return [];
    }
  }

  /**
   * Get smart suggestions based on user patterns
   */
  async getSuggestions(
    type: 'caption' | 'hashtag' | 'thumbnail' | 'seo' | 'script',
    input: string,
    context?: Record<string, any>
  ): Promise<string[]> {
    try {
      const { data, error } = await supabase.functions.invoke('label-studio-connector', {
        body: {
          action: 'getSuggestions',
          suggestionType: type,
          input,
          context
        }
      });

      if (error || !data?.success) return [];
      return data.suggestions || [];
    } catch {
      return [];
    }
  }

  /**
   * Flush queued events to backend
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
    getHints: (product: 'mind' | 'spark' | 'vibe' | 'arc' | 'hub', context: Record<string, any>) => 
      labelStudioService.getInlineHints(product, context),
    getSuggestions: (type: 'caption' | 'hashtag' | 'thumbnail' | 'seo' | 'script', input: string, context?: Record<string, any>) =>
      labelStudioService.getSuggestions(type, input, context),
    setEnabled: (enabled: boolean) => labelStudioService.setEnabled(enabled)
  };
}
