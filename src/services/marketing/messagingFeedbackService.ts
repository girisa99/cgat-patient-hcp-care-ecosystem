/**
 * Messaging Feedback & Improvement Service
 * 
 * Bi-weekly analysis of user feedback, usage patterns, and confusion signals
 * to suggest messaging improvements while preserving core positioning.
 */

import { aiMessagingGeneratorService, type GeneratedMessaging } from './aiMessagingGeneratorService';
import { GENIE_PRODUCTS, type GenieProductId } from './productVersionTrackingService';

// ============================================================================
// Types
// ============================================================================

export type FeedbackSource = 
  | 'user_survey'
  | 'support_ticket'
  | 'rlhf_thumbs'
  | 'confusion_signal'
  | 'abandonment'
  | 'competitor_mention'
  | 'feature_request';

export type SentimentScore = -1 | 0 | 1; // Negative, Neutral, Positive

export interface UserFeedback {
  id: string;
  source: FeedbackSource;
  productId: GenieProductId;
  featureId?: string;
  content: string;
  sentiment: SentimentScore;
  keywords: string[];
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  resolved: boolean;
}

export interface ConfusionSignal {
  id: string;
  productId: GenieProductId;
  featureId?: string;
  signalType: 'repeated_help_request' | 'quick_exit' | 'long_dwell' | 'back_navigation' | 'tooltip_hover' | 'video_rewatch';
  frequency: number;
  affectedUsers: number;
  firstDetected: Date;
  lastSeen: Date;
  suggestedClarification?: string;
}

export interface UsagePattern {
  productId: GenieProductId;
  featureId?: string;
  totalSessions: number;
  completionRate: number;
  averageTimeSpent: number;
  dropOffPoints: string[];
  mostClickedElements: string[];
  leastUsedFeatures: string[];
}

export interface MessagingImprovement {
  id: string;
  productId: GenieProductId;
  featureId?: string;
  improvementType: 'hook' | 'cta' | 'value_prop' | 'clarification' | 'differentiation';
  currentMessaging: string;
  suggestedMessaging: string;
  reasoning: string;
  confidenceScore: number;
  basedOnFeedback: string[];
  basedOnSignals: string[];
  status: 'pending' | 'approved' | 'rejected' | 'testing';
  abTestId?: string;
  createdAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
}

export interface ImprovementCycle {
  id: string;
  cycleNumber: number;
  startDate: Date;
  endDate: Date;
  status: 'collecting' | 'analyzing' | 'reviewing' | 'implementing' | 'complete';
  feedbackCount: number;
  signalsDetected: number;
  improvementsGenerated: number;
  improvementsApproved: number;
  products: GenieProductId[];
}

export interface MessagingAnalysis {
  period: { start: Date; end: Date };
  totalFeedback: number;
  sentimentBreakdown: { positive: number; neutral: number; negative: number };
  topKeywords: Array<{ keyword: string; count: number; sentiment: SentimentScore }>;
  confusionAreas: ConfusionSignal[];
  competitorMentions: Array<{ competitor: string; context: string; frequency: number }>;
  suggestedImprovements: MessagingImprovement[];
}

// ============================================================================
// Constants
// ============================================================================

export const IMPROVEMENT_CYCLE_DAYS = 14; // Bi-weekly

export const CONFUSION_SIGNAL_WEIGHTS: Record<ConfusionSignal['signalType'], number> = {
  repeated_help_request: 1.0,
  quick_exit: 0.8,
  back_navigation: 0.6,
  long_dwell: 0.5,
  tooltip_hover: 0.3,
  video_rewatch: 0.4,
};

export const SENTIMENT_KEYWORDS = {
  positive: ['love', 'amazing', 'easy', 'intuitive', 'fast', 'powerful', 'helpful', 'great', 'excellent', 'awesome'],
  negative: ['confusing', 'hard', 'unclear', 'slow', 'broken', 'frustrating', 'difficult', 'complicated', 'lost', 'stuck'],
  neutral: ['okay', 'fine', 'works', 'expected', 'normal', 'standard'],
};

export const COMPETITOR_KEYWORDS = [
  'canva', 'tome', 'beautiful.ai', 'pitch', 'gamma', 'slides.ai', 
  'prezi', 'visme', 'lumen5', 'synthesia', 'heygen', 'descript',
  'runway', 'pika', 'midjourney', 'dalle', 'chatgpt', 'claude',
];

export const IMPROVEMENT_TEMPLATES = {
  hook: {
    clarity: 'Make the value proposition clearer by focusing on {benefit}',
    urgency: 'Add urgency: "{hook}" → "{improved_hook}"',
    specificity: 'Be more specific about the outcome: {outcome}',
  },
  cta: {
    action: 'Use stronger action verb: "{cta}" → "{improved_cta}"',
    benefit: 'Include the benefit in CTA: "{cta}" → "{improved_cta}"',
    friction: 'Reduce perceived friction: "{cta}" → "{improved_cta}"',
  },
  value_prop: {
    differentiation: 'Emphasize what makes us different from {competitor}',
    outcomes: 'Focus on outcomes, not features: {outcome}',
    social_proof: 'Add credibility indicator: {proof}',
  },
  clarification: {
    terminology: 'Simplify terminology: "{term}" → "{simplified}"',
    process: 'Explain the process step-by-step',
    expectation: 'Set clearer expectations about {feature}',
  },
  differentiation: {
    unique: 'Highlight our unique capability: {capability}',
    comparison: 'Position against {competitor}: {positioning}',
    value: 'Emphasize value over {competitor_feature}',
  },
};

// ============================================================================
// In-memory stores (would be database in production)
// ============================================================================

const feedbackStore: UserFeedback[] = [];
const confusionSignals: ConfusionSignal[] = [];
const usagePatterns: Map<string, UsagePattern> = new Map();
const improvements: MessagingImprovement[] = [];
const cycles: ImprovementCycle[] = [];

// ============================================================================
// Service Implementation
// ============================================================================

class MessagingFeedbackService {
  private currentCycle: ImprovementCycle | null = null;
  private analysisListeners: Array<(analysis: MessagingAnalysis) => void> = [];
  private improvementListeners: Array<(improvements: MessagingImprovement[]) => void> = [];

  // =========================================================================
  // Feedback Collection
  // =========================================================================

  /**
   * Record user feedback from various sources
   */
  recordFeedback(feedback: Omit<UserFeedback, 'id' | 'timestamp' | 'resolved' | 'keywords' | 'sentiment'>): UserFeedback {
    const analyzed = this.analyzeFeedbackContent(feedback.content);
    
    const newFeedback: UserFeedback = {
      ...feedback,
      id: `fb_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      timestamp: new Date(),
      resolved: false,
      keywords: analyzed.keywords,
      sentiment: analyzed.sentiment,
    };

    feedbackStore.push(newFeedback);
    console.log('[MessagingFeedback] Recorded feedback:', newFeedback.id);

    // Check if we need to trigger analysis
    this.checkCycleTrigger();

    return newFeedback;
  }

  /**
   * Record confusion signal from user behavior
   */
  recordConfusionSignal(signal: Omit<ConfusionSignal, 'id' | 'firstDetected' | 'lastSeen' | 'frequency'>): void {
    // Check for existing signal
    const existing = confusionSignals.find(
      s => s.productId === signal.productId && 
           s.featureId === signal.featureId && 
           s.signalType === signal.signalType
    );

    if (existing) {
      existing.frequency++;
      existing.lastSeen = new Date();
      existing.affectedUsers = Math.max(existing.affectedUsers, signal.affectedUsers);
    } else {
      confusionSignals.push({
        ...signal,
        id: `cs_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        frequency: 1,
        firstDetected: new Date(),
        lastSeen: new Date(),
      });
    }

    console.log('[MessagingFeedback] Recorded confusion signal:', signal.signalType);
  }

  /**
   * Update usage pattern data
   */
  updateUsagePattern(pattern: UsagePattern): void {
    const key = `${pattern.productId}_${pattern.featureId || 'all'}`;
    usagePatterns.set(key, pattern);
    console.log('[MessagingFeedback] Updated usage pattern for:', key);
  }

  // =========================================================================
  // Analysis
  // =========================================================================

  /**
   * Analyze feedback content for keywords and sentiment
   */
  private analyzeFeedbackContent(content: string): { keywords: string[]; sentiment: SentimentScore } {
    const lowerContent = content.toLowerCase();
    const keywords: string[] = [];
    let sentimentScore = 0;

    // Extract keywords and calculate sentiment
    SENTIMENT_KEYWORDS.positive.forEach(word => {
      if (lowerContent.includes(word)) {
        keywords.push(word);
        sentimentScore += 1;
      }
    });

    SENTIMENT_KEYWORDS.negative.forEach(word => {
      if (lowerContent.includes(word)) {
        keywords.push(word);
        sentimentScore -= 1;
      }
    });

    // Check for competitor mentions
    COMPETITOR_KEYWORDS.forEach(competitor => {
      if (lowerContent.includes(competitor)) {
        keywords.push(`competitor:${competitor}`);
      }
    });

    const sentiment: SentimentScore = sentimentScore > 0 ? 1 : sentimentScore < 0 ? -1 : 0;

    return { keywords, sentiment };
  }

  /**
   * Run bi-weekly analysis
   */
  async runAnalysis(productIds?: GenieProductId[]): Promise<MessagingAnalysis> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - IMPROVEMENT_CYCLE_DAYS * 24 * 60 * 60 * 1000);

    const targetProducts = productIds || Object.keys(GENIE_PRODUCTS) as GenieProductId[];

    // Filter feedback for this period
    const periodFeedback = feedbackStore.filter(
      f => f.timestamp >= startDate && 
           f.timestamp <= endDate &&
           targetProducts.includes(f.productId)
    );

    // Calculate sentiment breakdown
    const sentimentBreakdown = {
      positive: periodFeedback.filter(f => f.sentiment === 1).length,
      neutral: periodFeedback.filter(f => f.sentiment === 0).length,
      negative: periodFeedback.filter(f => f.sentiment === -1).length,
    };

    // Extract top keywords
    const keywordCounts = new Map<string, { count: number; sentiments: SentimentScore[] }>();
    periodFeedback.forEach(f => {
      f.keywords.forEach(kw => {
        const existing = keywordCounts.get(kw) || { count: 0, sentiments: [] };
        existing.count++;
        existing.sentiments.push(f.sentiment);
        keywordCounts.set(kw, existing);
      });
    });

    const topKeywords = Array.from(keywordCounts.entries())
      .map(([keyword, data]) => ({
        keyword,
        count: data.count,
        sentiment: this.averageSentiment(data.sentiments),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    // Get confusion signals for this period
    const confusionAreas = confusionSignals.filter(
      s => s.lastSeen >= startDate && targetProducts.includes(s.productId)
    );

    // Extract competitor mentions
    const competitorMentions = topKeywords
      .filter(k => k.keyword.startsWith('competitor:'))
      .map(k => ({
        competitor: k.keyword.replace('competitor:', ''),
        context: this.getCompetitorContext(k.keyword.replace('competitor:', ''), periodFeedback),
        frequency: k.count,
      }));

    // Generate improvement suggestions
    const suggestedImprovements = await this.generateImprovements(
      periodFeedback,
      confusionAreas,
      competitorMentions,
      targetProducts
    );

    const analysis: MessagingAnalysis = {
      period: { start: startDate, end: endDate },
      totalFeedback: periodFeedback.length,
      sentimentBreakdown,
      topKeywords: topKeywords.filter(k => !k.keyword.startsWith('competitor:')),
      confusionAreas,
      competitorMentions,
      suggestedImprovements,
    };

    // Notify listeners
    this.analysisListeners.forEach(listener => listener(analysis));

    console.log('[MessagingFeedback] Analysis complete:', {
      feedbackCount: periodFeedback.length,
      improvements: suggestedImprovements.length,
    });

    return analysis;
  }

  /**
   * Generate improvement suggestions based on analysis
   */
  private async generateImprovements(
    feedback: UserFeedback[],
    signals: ConfusionSignal[],
    competitors: Array<{ competitor: string; context: string; frequency: number }>,
    products: GenieProductId[]
  ): Promise<MessagingImprovement[]> {
    const newImprovements: MessagingImprovement[] = [];

    for (const productId of products) {
      const productFeedback = feedback.filter(f => f.productId === productId);
      const productSignals = signals.filter(s => s.productId === productId);
      const product = GENIE_PRODUCTS[productId];

      // Get current messaging
      const currentMessaging = aiMessagingGeneratorService.getApprovedMessaging(productId);

      // Generate hook improvement if negative sentiment on value prop
      const valuePropFeedback = productFeedback.filter(
        f => f.sentiment === -1 && f.keywords.some(k => SENTIMENT_KEYWORDS.negative.includes(k))
      );

      if (valuePropFeedback.length >= 2) {
        newImprovements.push({
          id: `imp_${Date.now()}_${productId}_hook`,
          productId,
          improvementType: 'hook',
          currentMessaging: currentMessaging?.hook || product.tagline,
          suggestedMessaging: this.generateImprovedHook(product, valuePropFeedback),
          reasoning: `${valuePropFeedback.length} users expressed confusion or frustration with current positioning. Keywords: ${valuePropFeedback.flatMap(f => f.keywords).slice(0, 5).join(', ')}`,
          confidenceScore: Math.min(0.9, 0.5 + valuePropFeedback.length * 0.1),
          basedOnFeedback: valuePropFeedback.map(f => f.id),
          basedOnSignals: [],
          status: 'pending',
          createdAt: new Date(),
        });
      }

      // Generate clarification if confusion signals detected
      const highPrioritySignals = productSignals.filter(
        s => CONFUSION_SIGNAL_WEIGHTS[s.signalType] >= 0.6 && s.frequency >= 3
      );

      if (highPrioritySignals.length > 0) {
        newImprovements.push({
          id: `imp_${Date.now()}_${productId}_clarity`,
          productId,
          improvementType: 'clarification',
          currentMessaging: currentMessaging?.valueProposition || product.tagline,
          suggestedMessaging: this.generateClarification(product, highPrioritySignals),
          reasoning: `Detected ${highPrioritySignals.length} high-priority confusion signals: ${highPrioritySignals.map(s => s.signalType).join(', ')}`,
          confidenceScore: 0.75,
          basedOnFeedback: [],
          basedOnSignals: highPrioritySignals.map(s => s.id),
          status: 'pending',
          createdAt: new Date(),
        });
      }

      // Generate differentiation if competitor mentioned frequently
      const relevantCompetitors = competitors.filter(c => c.frequency >= 2);
      if (relevantCompetitors.length > 0) {
        const topCompetitor = relevantCompetitors[0];
        newImprovements.push({
          id: `imp_${Date.now()}_${productId}_diff`,
          productId,
          improvementType: 'differentiation',
          currentMessaging: currentMessaging?.differentiators?.join(' | ') || '',
          suggestedMessaging: this.generateDifferentiation(product, topCompetitor),
          reasoning: `Users mentioned ${topCompetitor.competitor} ${topCompetitor.frequency} times. Context suggests comparison shopping.`,
          confidenceScore: 0.7,
          basedOnFeedback: productFeedback.filter(f => 
            f.keywords.includes(`competitor:${topCompetitor.competitor}`)
          ).map(f => f.id),
          basedOnSignals: [],
          status: 'pending',
          createdAt: new Date(),
        });
      }
    }

    // Store improvements
    improvements.push(...newImprovements);

    return newImprovements;
  }

  // =========================================================================
  // Improvement Generators (Template-based, would use AI in production)
  // =========================================================================

  private generateImprovedHook(product: typeof GENIE_PRODUCTS[GenieProductId], feedback: UserFeedback[]): string {
    const negativeKeywords = feedback.flatMap(f => f.keywords.filter(k => SENTIMENT_KEYWORDS.negative.includes(k)));
    
    // Use tagline as the base for messaging (products don't have description)
    const taglineLower = product.tagline.toLowerCase();
    
    // Generate inverse messaging
    if (negativeKeywords.includes('confusing') || negativeKeywords.includes('complicated')) {
      return `${product.name}: Simplicity meets power. ${product.tagline} in minutes, not hours.`;
    }
    
    if (negativeKeywords.includes('slow')) {
      return `${product.name}: Lightning-fast. ${product.tagline} in under 60 seconds.`;
    }

    return `${product.name}: The easiest way to ${taglineLower}. No learning curve, just results.`;
  }

  private generateClarification(product: typeof GENIE_PRODUCTS[GenieProductId], signals: ConfusionSignal[]): string {
    const signalTypes = signals.map(s => s.signalType);
    const taglineLower = product.tagline.toLowerCase();
    
    if (signalTypes.includes('repeated_help_request')) {
      return `${product.name} helps you ${taglineLower}. Here's how: 1) Start with your idea 2) Let AI enhance it 3) Export anywhere. That's it.`;
    }

    if (signalTypes.includes('quick_exit')) {
      return `${product.name}: ${product.tagline}. Try it free—no signup required for your first 3 creations.`;
    }

    return `${product.name}: ${product.tagline}. Perfect for teams who need to ${taglineLower} without the complexity.`;
  }

  private generateDifferentiation(
    product: typeof GENIE_PRODUCTS[GenieProductId], 
    competitor: { competitor: string; context: string; frequency: number }
  ): string {
    const competitorName = competitor.competitor.charAt(0).toUpperCase() + competitor.competitor.slice(1);
    
    return `Unlike ${competitorName}, ${product.name} is built for the complete creative workflow—from ideation to publishing. One platform, zero context-switching.`;
  }

  // =========================================================================
  // Utilities
  // =========================================================================

  private averageSentiment(sentiments: SentimentScore[]): SentimentScore {
    if (sentiments.length === 0) return 0;
    const avg = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
    return avg > 0.3 ? 1 : avg < -0.3 ? -1 : 0;
  }

  private getCompetitorContext(competitor: string, feedback: UserFeedback[]): string {
    const mentions = feedback.filter(f => f.keywords.includes(`competitor:${competitor}`));
    if (mentions.length === 0) return '';
    return mentions[0].content.slice(0, 100);
  }

  private checkCycleTrigger(): void {
    // Auto-start cycle if enough feedback collected
    if (!this.currentCycle && feedbackStore.length >= 10) {
      this.startImprovementCycle();
    }
  }

  // =========================================================================
  // Cycle Management
  // =========================================================================

  /**
   * Start a new improvement cycle
   */
  startImprovementCycle(products?: GenieProductId[]): ImprovementCycle {
    const now = new Date();
    const cycle: ImprovementCycle = {
      id: `cycle_${Date.now()}`,
      cycleNumber: cycles.length + 1,
      startDate: now,
      endDate: new Date(now.getTime() + IMPROVEMENT_CYCLE_DAYS * 24 * 60 * 60 * 1000),
      status: 'collecting',
      feedbackCount: 0,
      signalsDetected: 0,
      improvementsGenerated: 0,
      improvementsApproved: 0,
      products: products || Object.keys(GENIE_PRODUCTS) as GenieProductId[],
    };

    cycles.push(cycle);
    this.currentCycle = cycle;

    console.log('[MessagingFeedback] Started improvement cycle:', cycle.id);

    return cycle;
  }

  /**
   * Get current improvement cycle
   */
  getCurrentCycle(): ImprovementCycle | null {
    return this.currentCycle;
  }

  /**
   * Get all improvement cycles
   */
  getCycles(): ImprovementCycle[] {
    return [...cycles];
  }

  /**
   * Get pending improvements
   */
  getPendingImprovements(productId?: GenieProductId): MessagingImprovement[] {
    return improvements.filter(
      i => i.status === 'pending' && (!productId || i.productId === productId)
    );
  }

  /**
   * Approve an improvement
   */
  approveImprovement(improvementId: string, approvedBy: string): void {
    const improvement = improvements.find(i => i.id === improvementId);
    if (improvement) {
      improvement.status = 'approved';
      improvement.reviewedAt = new Date();
      improvement.reviewedBy = approvedBy;

      // Notify listeners
      this.improvementListeners.forEach(listener => 
        listener(improvements.filter(i => i.status === 'approved'))
      );

      console.log('[MessagingFeedback] Improvement approved:', improvementId);
    }
  }

  /**
   * Reject an improvement
   */
  rejectImprovement(improvementId: string, rejectedBy: string): void {
    const improvement = improvements.find(i => i.id === improvementId);
    if (improvement) {
      improvement.status = 'rejected';
      improvement.reviewedAt = new Date();
      improvement.reviewedBy = rejectedBy;

      console.log('[MessagingFeedback] Improvement rejected:', improvementId);
    }
  }

  // =========================================================================
  // Subscriptions
  // =========================================================================

  /**
   * Subscribe to analysis updates
   */
  onAnalysisComplete(callback: (analysis: MessagingAnalysis) => void): () => void {
    this.analysisListeners.push(callback);
    return () => {
      this.analysisListeners = this.analysisListeners.filter(l => l !== callback);
    };
  }

  /**
   * Subscribe to improvement updates
   */
  onImprovementsGenerated(callback: (improvements: MessagingImprovement[]) => void): () => void {
    this.improvementListeners.push(callback);
    return () => {
      this.improvementListeners = this.improvementListeners.filter(l => l !== callback);
    };
  }

  // =========================================================================
  // Getters
  // =========================================================================

  getAllFeedback(): UserFeedback[] {
    return [...feedbackStore];
  }

  getConfusionSignals(): ConfusionSignal[] {
    return [...confusionSignals];
  }

  getUsagePatterns(): UsagePattern[] {
    return Array.from(usagePatterns.values());
  }

  getAllImprovements(): MessagingImprovement[] {
    return [...improvements];
  }
}

// Singleton instance
export const messagingFeedbackService = new MessagingFeedbackService();

export default messagingFeedbackService;
