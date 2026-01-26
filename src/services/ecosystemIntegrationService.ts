/**
 * Ecosystem Integration Service
 * 
 * Central orchestration layer connecting all Genie ecosystem components:
 * - Beta Awards & Gamification
 * - Confidence Loop & RLHF
 * - Ask Genie Support
 * - Feedback Collection
 * - Generation Pipeline
 * - Wizard Steps
 */

import { betaAwardsService } from './betaAwardsService';
import { confidenceLoopEngine } from './executionEngines/ConfidenceLoopEngine';
import { labelStudioService } from './labelStudioService';
import { askGeniePipelineKnowledgeBase } from './askGeniePipelineKnowledgeBase';
import { audioGenerationConfigService } from './audioGenerationConfigService';
import { frameworkTierFilterService } from './frameworkTierFilterService';
import { multiLanguageAudioOrchestrator } from './multiLanguageAudioOrchestrator';

// ==================== TYPES ====================

export type EcosystemEvent = 
  | 'generation_started'
  | 'generation_completed'
  | 'generation_failed'
  | 'feedback_submitted'
  | 'bug_reported'
  | 'feature_requested'
  | 'tutorial_completed'
  | 'wizard_step_completed'
  | 'editor_action'
  | 'support_ticket_created'
  | 'community_post_created';

export interface EcosystemContext {
  userId: string;
  sessionId?: string;
  product: 'deck' | 'spark' | 'mind' | 'vibe' | 'arc' | 'hub' | 'cast' | 'ask_genie';
  tier: 1 | 2 | 3;
  language?: string;
  industry?: string;
}

export interface GenerationResult {
  success: boolean;
  outputType: string;
  confidenceScore?: number;
  duration?: number;
  creditsUsed?: number;
  error?: string;
}

export interface FeedbackPayload {
  type: 'positive' | 'negative' | 'detailed';
  outputId: string;
  pipelineId?: string;
  issues?: string[];
  comment?: string;
  rating?: number;
}

// ==================== EVENT HANDLERS ====================

class EcosystemIntegrationService {
  private eventQueue: Array<{ event: EcosystemEvent; context: EcosystemContext; data?: any }> = [];
  private isProcessing = false;

  /**
   * Track an ecosystem event across all integrated services
   */
  async trackEvent(
    event: EcosystemEvent,
    context: EcosystemContext,
    data?: any
  ): Promise<void> {
    console.log(`[Ecosystem] Event: ${event}`, { context, data });

    // Queue event for processing
    this.eventQueue.push({ event, context, data });
    
    // Process queue
    if (!this.isProcessing) {
      await this.processEventQueue();
    }
  }

  private async processEventQueue(): Promise<void> {
    this.isProcessing = true;

    while (this.eventQueue.length > 0) {
      const item = this.eventQueue.shift();
      if (!item) continue;

      try {
        await this.handleEvent(item.event, item.context, item.data);
      } catch (error) {
        console.error(`[Ecosystem] Event processing error:`, error);
      }
    }

    this.isProcessing = false;
  }

  private async handleEvent(
    event: EcosystemEvent,
    context: EcosystemContext,
    data?: any
  ): Promise<void> {
    switch (event) {
      case 'generation_completed':
        await this.handleGenerationComplete(context, data as GenerationResult);
        break;
      
      case 'generation_failed':
        await this.handleGenerationFailed(context, data);
        break;
      
      case 'feedback_submitted':
        await this.handleFeedbackSubmitted(context, data as FeedbackPayload);
        break;
      
      case 'bug_reported':
        await betaAwardsService.trackActivity(context.userId, 'bug_report');
        break;
      
      case 'feature_requested':
        await betaAwardsService.trackActivity(context.userId, 'feature_request');
        break;
      
      case 'tutorial_completed':
        await betaAwardsService.trackActivity(context.userId, 'tutorial');
        break;
      
      case 'community_post_created':
        await betaAwardsService.trackActivity(context.userId, 'community');
        break;
      
      case 'wizard_step_completed':
        await this.handleWizardStepComplete(context, data);
        break;
      
      case 'editor_action':
        await this.handleEditorAction(context, data);
        break;
      
      case 'support_ticket_created':
        // Track for support analytics
        console.log('[Ecosystem] Support ticket created:', data);
        break;
    }
  }

  /**
   * Handle successful generation - track for beta awards & RLHF
   */
  private async handleGenerationComplete(
    context: EcosystemContext,
    result: GenerationResult
  ): Promise<void> {
    // 1. Track for beta awards
    await betaAwardsService.trackActivity(context.userId, 'generation');

    // 2. Record for confidence loop learning
    if (result.confidenceScore) {
      await this.recordConfidenceMetric(context, result.confidenceScore);
    }

    // 3. Log generation stats for analytics
    console.log('[Ecosystem] Generation completed:', {
      userId: context.userId,
      product: context.product,
      outputType: result.outputType,
      confidence: result.confidenceScore,
      credits: result.creditsUsed
    });
  }

  /**
   * Handle failed generation - capture for improvement
   */
  private async handleGenerationFailed(
    context: EcosystemContext,
    error: any
  ): Promise<void> {
    // Record failure pattern for Ask Genie knowledge
    console.error('[Ecosystem] Generation failed:', {
      userId: context.userId,
      product: context.product,
      error: error?.message || error
    });

    // Could trigger proactive support suggestion
  }

  /**
   * Handle feedback submission - route to RLHF pipeline
   */
  private async handleFeedbackSubmitted(
    context: EcosystemContext,
    feedback: FeedbackPayload
  ): Promise<void> {
    // 1. Track for beta awards
    await betaAwardsService.trackActivity(context.userId, 'feedback');

    // 2. Send to Label Studio for RLHF
    if (labelStudioService && typeof labelStudioService.recordFeedback === 'function') {
      await labelStudioService.recordFeedback({
        userId: context.userId,
        outputId: feedback.outputId,
        pipelineId: feedback.pipelineId,
        feedbackType: feedback.type,
        issues: feedback.issues,
        comment: feedback.comment,
        rating: feedback.rating
      });
    }

    // 3. Update confidence loop metrics
    if (feedback.type === 'negative' && feedback.issues) {
      await this.recordQualityIssue(context, feedback);
    }

    console.log('[Ecosystem] Feedback recorded:', {
      type: feedback.type,
      outputId: feedback.outputId,
      hasIssues: !!feedback.issues?.length
    });
  }

  /**
   * Handle wizard step completion
   */
  private async handleWizardStepComplete(
    context: EcosystemContext,
    stepData: { step: number; stepName: string; selections?: any }
  ): Promise<void> {
    // Track wizard progression for analytics
    console.log('[Ecosystem] Wizard step completed:', stepData);

    // Could trigger contextual tips via Ask Genie
  }

  /**
   * Handle editor actions for proactive suggestions
   */
  private async handleEditorAction(
    context: EcosystemContext,
    actionData: { action: string; elementId?: string; duration?: number }
  ): Promise<void> {
    // Track editor usage patterns
    console.log('[Ecosystem] Editor action:', actionData);
  }

  /**
   * Record confidence metric for continuous improvement
   */
  private async recordConfidenceMetric(
    context: EcosystemContext,
    score: number
  ): Promise<void> {
    // Store metric for learning
    const storageKey = `confidence_metrics_${context.userId}`;
    const existing = localStorage.getItem(storageKey);
    const metrics = existing ? JSON.parse(existing) : [];
    
    metrics.push({
      score,
      product: context.product,
      tier: context.tier,
      timestamp: new Date().toISOString()
    });

    // Keep last 100 metrics
    if (metrics.length > 100) {
      metrics.shift();
    }

    localStorage.setItem(storageKey, JSON.stringify(metrics));
  }

  /**
   * Record quality issue for model improvement
   */
  private async recordQualityIssue(
    context: EcosystemContext,
    feedback: FeedbackPayload
  ): Promise<void> {
    const storageKey = `quality_issues_${context.product}`;
    const existing = localStorage.getItem(storageKey);
    const issues = existing ? JSON.parse(existing) : [];

    issues.push({
      outputId: feedback.outputId,
      pipelineId: feedback.pipelineId,
      issues: feedback.issues,
      tier: context.tier,
      timestamp: new Date().toISOString()
    });

    // Keep last 50 issues per product
    if (issues.length > 50) {
      issues.shift();
    }

    localStorage.setItem(storageKey, JSON.stringify(issues));
  }

  // ==================== CONVENIENCE METHODS ====================

  /**
   * Get integrated services status
   */
  getServicesStatus(): Record<string, boolean> {
    return {
      betaAwards: !!betaAwardsService,
      confidenceLoop: !!confidenceLoopEngine,
      labelStudio: !!labelStudioService,
      askGenieKnowledge: !!askGeniePipelineKnowledgeBase,
      audioConfig: !!audioGenerationConfigService,
      frameworkFilter: !!frameworkTierFilterService,
      audioOrchestrator: !!multiLanguageAudioOrchestrator
    };
  }

  /**
   * Get Ask Genie context for current state
   */
  getAskGenieContext(context: EcosystemContext): any {
    return {
      pipelines: askGeniePipelineKnowledgeBase.PIPELINE_REGISTRY?.length || 181,
      wizardSteps: 8,
      currentProduct: context.product,
      tier: context.tier,
      capabilities: [
        'Pipeline troubleshooting',
        'Wizard guidance',
        'Editor assistance',
        'Feature recommendations',
        'Upgrade suggestions'
      ]
    };
  }

  /**
   * Get framework recommendations for tier
   */
  getFilteredFrameworks(tier: 1 | 2 | 3, type?: string) {
    return frameworkTierFilterService.getFrameworksForTier(tier, type);
  }

  /**
   * Build audio config for generation
   */
  buildAudioConfig(voiceConfig: any, options: any) {
    return audioGenerationConfigService.buildConfigFromWizard(voiceConfig, options);
  }
}

export const ecosystemIntegrationService = new EcosystemIntegrationService();
export default ecosystemIntegrationService;
