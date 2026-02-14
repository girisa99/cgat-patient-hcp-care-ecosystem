/**
 * Audience Relevance Service
 * 
 * Tracks and learns product-audience affinities from user feedback.
 * Integrates with Label Studio background service for RLHF.
 * Stores scores in product_audience_relevance table.
 */

import { supabase } from '@/integrations/supabase/client';
import { labelStudioService } from '@/services/labelStudioBackgroundService';

export interface AudienceRelevanceScore {
  product_id: string;
  audience_id: string;
  relevance_score: number;
  feedback_count: number;
  positive_feedback: number;
  negative_feedback: number;
}

class AudienceRelevanceService {
  private static instance: AudienceRelevanceService;
  private cache: Map<string, AudienceRelevanceScore[]> = new Map();

  static getInstance(): AudienceRelevanceService {
    if (!AudienceRelevanceService.instance) {
      AudienceRelevanceService.instance = new AudienceRelevanceService();
    }
    return AudienceRelevanceService.instance;
  }

  /**
   * Record feedback (like/dislike) for a product-audience pairing
   */
  async recordFeedback(
    productId: string,
    audienceId: string,
    isPositive: boolean
  ): Promise<void> {
    try {
      // Upsert into product_audience_relevance
      const { data: existing } = await supabase
        .from('product_audience_relevance')
        .select('id, relevance_score, feedback_count, positive_feedback, negative_feedback')
        .eq('product_id', productId)
        .eq('audience_id', audienceId)
        .single();

      if (existing) {
        const newPositive = existing.positive_feedback + (isPositive ? 1 : 0);
        const newNegative = existing.negative_feedback + (isPositive ? 0 : 1);
        const newCount = existing.feedback_count + 1;
        // Calculate score as ratio of positive feedback (0.1 floor, 0.99 ceiling)
        const newScore = Math.min(0.99, Math.max(0.1, newPositive / newCount));

        await supabase
          .from('product_audience_relevance')
          .update({
            relevance_score: newScore,
            feedback_count: newCount,
            positive_feedback: newPositive,
            negative_feedback: newNegative,
            last_feedback_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('product_audience_relevance')
          .insert({
            product_id: productId,
            audience_id: audienceId,
            relevance_score: isPositive ? 0.7 : 0.3,
            feedback_count: 1,
            positive_feedback: isPositive ? 1 : 0,
            negative_feedback: isPositive ? 0 : 1,
            last_feedback_at: new Date().toISOString(),
          });
      }

      // Clear cache for this product
      this.cache.delete(productId);

      // Record training event in Label Studio
      labelStudioService.recordEvent({
        eventType: isPositive ? 'caption_selected' : 'hashtag_rejected',
        context: {
          product: this.mapProductId(productId),
          contentType: 'audience_relevance',
          originalValue: audienceId,
          selectedValue: isPositive ? 'like' : 'dislike',
          userAction: isPositive ? 'accept' : 'reject',
        },
        metadata: { productId, audienceId, isPositive },
      });

      console.debug(`[AudienceRelevance] Recorded ${isPositive ? 'positive' : 'negative'} feedback for ${productId}:${audienceId}`);
    } catch (err) {
      console.error('[AudienceRelevance] Failed to record feedback:', err);
    }
  }

  /**
   * Get learned relevance scores for a product (used to enrich AI prompt)
   */
  async getRelevanceScores(productId: string): Promise<AudienceRelevanceScore[]> {
    if (this.cache.has(productId)) {
      return this.cache.get(productId)!;
    }

    try {
      const { data } = await supabase
        .from('product_audience_relevance')
        .select('product_id, audience_id, relevance_score, feedback_count, positive_feedback, negative_feedback')
        .eq('product_id', productId)
        .order('relevance_score', { ascending: false });

      const scores = (data || []) as AudienceRelevanceScore[];
      this.cache.set(productId, scores);
      return scores;
    } catch {
      return [];
    }
  }

  /**
   * Build a relevance context string for the AI prompt
   */
  async getRelevanceContext(productId: string): Promise<string> {
    const scores = await this.getRelevanceScores(productId);
    if (scores.length === 0) return '';

    const highRelevance = scores.filter(s => s.relevance_score >= 0.6 && s.feedback_count >= 2);
    const lowRelevance = scores.filter(s => s.relevance_score < 0.4 && s.feedback_count >= 2);

    let context = '\nLearned Audience Preferences (from user feedback):\n';
    if (highRelevance.length > 0) {
      context += `- Preferred audiences: ${highRelevance.map(s => `${s.audience_id} (${Math.round(s.relevance_score * 100)}% match)`).join(', ')}\n`;
    }
    if (lowRelevance.length > 0) {
      context += `- Less relevant audiences: ${lowRelevance.map(s => s.audience_id).join(', ')}\n`;
    }
    return context;
  }

  private mapProductId(productId: string): 'mind' | 'spark' | 'vibe' | 'arc' | 'hub' {
    const map: Record<string, 'mind' | 'spark' | 'vibe' | 'arc' | 'hub'> = {
      mind: 'mind', spark: 'spark', vibe: 'vibe', arc: 'arc',
      hub: 'hub', deck: 'mind', cast: 'spark', ask_genie: 'hub', studio: 'hub',
    };
    return map[productId] || 'hub';
  }
}

export const audienceRelevanceService = AudienceRelevanceService.getInstance();
