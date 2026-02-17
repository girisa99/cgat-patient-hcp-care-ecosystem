/**
 * Analytics Integration Service - P3 Cross-Functional
 * 
 * Provides unified analytics across all Genie products.
 * Tracks content performance, user engagement, and AI usage.
 * 
 * Phase: P3 Week 13-14
 * Priority: Cross-Functional (All Products)
 */

import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsEvent {
  event_type: string;
  event_category: 'content' | 'user' | 'ai' | 'engagement' | 'conversion';
  event_data: Record<string, any>;
  user_id?: string;
  session_id?: string;
  product: 'mind' | 'spark' | 'arc' | 'vibe' | 'studio';
  timestamp?: string;
}

export interface ContentPerformanceMetrics {
  content_id: string;
  views: number;
  engagement_rate: number;
  avg_watch_time: number;
  shares: number;
  conversions: number;
  revenue?: number;
}

export interface AIUsageMetrics {
  provider: string;
  model: string;
  tokens_used: number;
  requests_count: number;
  avg_latency_ms: number;
  cost_estimate: number;
  success_rate: number;
}

export interface UserEngagementMetrics {
  user_id: string;
  session_count: number;
  total_time_spent: number;
  features_used: string[];
  content_created: number;
  ai_interactions: number;
}

class AnalyticsIntegrationService {
  private static instance: AnalyticsIntegrationService;
  private eventQueue: AnalyticsEvent[] = [];
  private flushInterval: number = 5000; // 5 seconds
  private flushTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.startFlushTimer();
  }

  static getInstance(): AnalyticsIntegrationService {
    if (!AnalyticsIntegrationService.instance) {
      AnalyticsIntegrationService.instance = new AnalyticsIntegrationService();
    }
    return AnalyticsIntegrationService.instance;
  }

  private startFlushTimer() {
    if (typeof window !== 'undefined') {
      this.flushTimer = setInterval(() => this.flushEvents(), this.flushInterval);
    }
  }

  /**
   * Track an analytics event
   */
  async trackEvent(event: AnalyticsEvent): Promise<void> {
    const enrichedEvent = {
      ...event,
      timestamp: event.timestamp || new Date().toISOString(),
      session_id: event.session_id || this.getSessionId(),
    };
    
    this.eventQueue.push(enrichedEvent);
    
    // Flush immediately for high-priority events
    if (event.event_category === 'conversion') {
      await this.flushEvents();
    }
  }

  /**
   * Track content view
   */
  async trackContentView(contentId: string, product: AnalyticsEvent['product'], metadata?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      event_type: 'content_view',
      event_category: 'content',
      event_data: { content_id: contentId, ...metadata },
      product,
    });
  }

  /**
   * Track AI usage
   */
  async trackAIUsage(
    provider: string,
    model: string,
    tokens: number,
    latencyMs: number,
    success: boolean,
    product: AnalyticsEvent['product']
  ): Promise<void> {
    await this.trackEvent({
      event_type: 'ai_usage',
      event_category: 'ai',
      event_data: { provider, model, tokens, latency_ms: latencyMs, success },
      product,
    });
  }

  /**
   * Track user engagement
   */
  async trackEngagement(
    action: string,
    product: AnalyticsEvent['product'],
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.trackEvent({
      event_type: action,
      event_category: 'engagement',
      event_data: metadata || {},
      product,
    });
  }

  /**
   * Track conversion event
   */
  async trackConversion(
    conversionType: string,
    value: number,
    product: AnalyticsEvent['product'],
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.trackEvent({
      event_type: 'conversion',
      event_category: 'conversion',
      event_data: { conversion_type: conversionType, value, ...metadata },
      product,
    });
  }

  /**
   * Get content performance metrics
   */
  async getContentPerformance(contentId: string): Promise<ContentPerformanceMetrics | null> {
    try {
      // Query from analytics tables when available
      // For now, return computed metrics
      return {
        content_id: contentId,
        views: 0,
        engagement_rate: 0,
        avg_watch_time: 0,
        shares: 0,
        conversions: 0,
      };
    } catch (error) {
      console.error('Failed to get content performance:', error);
      return null;
    }
  }

  /**
   * Get AI usage metrics for a time period
   */
  async getAIUsageMetrics(
    startDate: Date,
    endDate: Date,
    product?: AnalyticsEvent['product']
  ): Promise<AIUsageMetrics[]> {
    try {
      // Query from analytics tables when available
      return [];
    } catch (error) {
      console.error('Failed to get AI usage metrics:', error);
      return [];
    }
  }

  /**
   * Get user engagement metrics
   */
  async getUserEngagementMetrics(userId: string): Promise<UserEngagementMetrics | null> {
    try {
      return {
        user_id: userId,
        session_count: 0,
        total_time_spent: 0,
        features_used: [],
        content_created: 0,
        ai_interactions: 0,
      };
    } catch (error) {
      console.error('Failed to get user engagement metrics:', error);
      return null;
    }
  }

  /**
   * Get cross-product analytics dashboard data
   */
  async getDashboardMetrics(): Promise<{
    totalContent: number;
    totalViews: number;
    totalAIRequests: number;
    activeUsers: number;
    productBreakdown: Record<string, number>;
  }> {
    return {
      totalContent: 0,
      totalViews: 0,
      totalAIRequests: 0,
      activeUsers: 0,
      productBreakdown: {
        mind: 0,
        spark: 0,
        arc: 0,
        vibe: 0,
        studio: 0,
      },
    };
  }

  /**
   * Flush queued events to backend
   */
  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // Batch insert to analytics table when available
      console.log(`[Analytics] Flushing ${events.length} events`);
      
      // For now, log events - replace with actual DB insert when table exists
      events.forEach(event => {
        console.log(`[Analytics] ${event.product}/${event.event_type}:`, event.event_data);
      });
    } catch (error) {
      console.error('Failed to flush analytics events:', error);
      // Re-queue failed events
      this.eventQueue = [...events, ...this.eventQueue];
    }
  }

  /**
   * Get or create session ID
   */
  private getSessionId(): string {
    if (typeof window === 'undefined') return 'server';
    
    let sessionId = sessionStorage.getItem('genie_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      sessionStorage.setItem('genie_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushEvents();
  }
}

export const analyticsIntegrationService = AnalyticsIntegrationService.getInstance();
