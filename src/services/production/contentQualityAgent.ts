/**
 * Content Quality Agent — Self-Correcting Feedback Loop
 *
 * Wraps the ai-quality-assessment edge function with an autonomous
 * feedback loop. Generates content → assesses quality → if score < threshold
 * → regenerates with improved prompts → reassesses. Up to N iterations.
 *
 * This is Agentic AI Layer 1: single-agent self-correction.
 *
 * Usage:
 *   import { contentQualityAgent } from '@/services/production/contentQualityAgent';
 *
 *   // Auto-refine a script until quality > 85
 *   const result = await contentQualityAgent.refineContent({
 *     content: 'My draft script...',
 *     contentType: 'script',
 *     qualityThreshold: 85,
 *     maxIterations: 3,
 *   });
 */

import { supabase } from '@/integrations/supabase/client';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface QualityMetrics {
  overall: number;
  contentAccuracy: number;
  visualRelevance: number;
  languageQuality: number;
  coherenceScore: number;
  engagementScore: number;
  improvements: string[];
  strengths: string[];
  assessedAt: string;
}

export interface RefinementInput {
  content: string;
  contentType: 'script' | 'slide' | 'title' | 'paragraph' | 'speaker_notes';
  qualityThreshold?: number;
  maxIterations?: number;
  context?: {
    topic?: string;
    targetAudience?: string;
    tone?: string;
    language?: string;
  };
  onIteration?: (iteration: RefinementIteration) => void;
}

export interface RefinementIteration {
  iterationNumber: number;
  content: string;
  score: number;
  feedback: string;
  improvements: string[];
  status: 'below_threshold' | 'meets_threshold' | 'max_iterations_reached';
}

export interface RefinementResult {
  originalContent: string;
  finalContent: string;
  originalScore: number;
  finalScore: number;
  iterations: RefinementIteration[];
  totalIterations: number;
  improved: boolean;
  metrics: QualityMetrics | null;
}

export interface SlideAssessmentInput {
  slide: {
    id: string;
    title?: string;
    content?: { bullets?: string[]; paragraph?: string };
    image?: string;
    speakerNotes?: string;
  };
  context?: {
    presentationTopic?: string;
    targetAudience?: string;
    previousSlide?: string;
    nextSlide?: string;
  };
}

export interface PresentationAssessmentInput {
  slides: SlideAssessmentInput['slide'][];
  metadata?: {
    presentationTopic?: string;
    targetAudience?: string;
    language?: string;
  };
}

// ─── Service ────────────────────────────────────────────────────────────────

export const contentQualityAgent = {
  /** Quick content quality check (non-iterative) */
  async quickCheck(
    content: string,
    contentType: 'title' | 'bullet' | 'paragraph' | 'speaker_notes' = 'paragraph'
  ): Promise<{ score: number; feedback: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-quality-assessment', {
        body: { action: 'quick_check', content, contentType },
      });
      if (error) throw error;
      return { score: data?.score || 0, feedback: data?.feedback || '' };
    } catch (err) {
      console.error('Quality quick check failed:', err);
      return { score: 70, feedback: 'Quality check unavailable — using default score.' };
    }
  },

  /** Assess a single slide */
  async assessSlide(input: SlideAssessmentInput): Promise<QualityMetrics | null> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-quality-assessment', {
        body: { action: 'assess_slide', slide: input.slide, context: input.context },
      });
      if (error) throw error;
      return data?.metrics || null;
    } catch (err) {
      console.error('Slide assessment failed:', err);
      return null;
    }
  },

  /** Assess a full presentation */
  async assessPresentation(input: PresentationAssessmentInput): Promise<{
    overallScore: number;
    slideScores: Array<{ slideId: string; metrics: QualityMetrics }>;
    topIssues: string[];
    recommendations: string[];
  } | null> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-quality-assessment', {
        body: {
          action: 'assess_presentation',
          slides: input.slides,
          metadata: input.metadata,
        },
      });
      if (error) throw error;
      return data || null;
    } catch (err) {
      console.error('Presentation assessment failed:', err);
      return null;
    }
  },

  /** Assess image relevance to slide content */
  async assessImageRelevance(
    imageUrl: string,
    slideTitle: string,
    slideContent: string
  ): Promise<{ score: number; suggestions: string[] }> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-quality-assessment', {
        body: {
          action: 'assess_image_relevance',
          imageUrl,
          slideTitle,
          slideContent,
        },
      });
      if (error) throw error;
      return {
        score: data?.score || 0,
        suggestions: data?.suggestions || [],
      };
    } catch (err) {
      console.error('Image relevance assessment failed:', err);
      return { score: 50, suggestions: ['Assessment unavailable'] };
    }
  },

  /**
   * Self-correcting refinement loop.
   *
   * Assesses content quality → if below threshold → uses AI to improve →
   * reassesses → repeats up to maxIterations.
   *
   * This is the core agentic pattern: generate → assess → refine → assess.
   */
  async refineContent(input: RefinementInput): Promise<RefinementResult> {
    const threshold = input.qualityThreshold ?? 85;
    const maxIter = input.maxIterations ?? 3;
    const iterations: RefinementIteration[] = [];
    let currentContent = input.content;

    // Step 1: Assess original content
    const initialCheck = await this.quickCheck(currentContent, input.contentType === 'script' ? 'paragraph' : input.contentType as any);
    const originalScore = initialCheck.score;

    if (originalScore >= threshold) {
      return {
        originalContent: input.content,
        finalContent: currentContent,
        originalScore,
        finalScore: originalScore,
        iterations: [{
          iterationNumber: 0,
          content: currentContent,
          score: originalScore,
          feedback: initialCheck.feedback,
          improvements: [],
          status: 'meets_threshold',
        }],
        totalIterations: 0,
        improved: false,
        metrics: null,
      };
    }

    // Step 2: Iterative refinement loop
    let lastScore = originalScore;
    let lastFeedback = initialCheck.feedback;

    for (let i = 1; i <= maxIter; i++) {
      // Generate improved version using enhance-script edge function
      const refinedContent = await this.enhanceWithFeedback(
        currentContent,
        lastFeedback,
        input.context
      );

      // Assess the refined version
      const check = await this.quickCheck(
        refinedContent,
        input.contentType === 'script' ? 'paragraph' : input.contentType as any
      );

      const iteration: RefinementIteration = {
        iterationNumber: i,
        content: refinedContent,
        score: check.score,
        feedback: check.feedback,
        improvements: [lastFeedback],
        status: check.score >= threshold ? 'meets_threshold'
              : i === maxIter ? 'max_iterations_reached'
              : 'below_threshold',
      };

      iterations.push(iteration);
      input.onIteration?.(iteration);

      currentContent = refinedContent;
      lastScore = check.score;
      lastFeedback = check.feedback;

      if (check.score >= threshold) break;
    }

    return {
      originalContent: input.content,
      finalContent: currentContent,
      originalScore,
      finalScore: lastScore,
      iterations,
      totalIterations: iterations.length,
      improved: lastScore > originalScore,
      metrics: null,
    };
  },

  /** Internal: Enhance content using AI with quality feedback */
  async enhanceWithFeedback(
    content: string,
    qualityFeedback: string,
    context?: RefinementInput['context']
  ): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('enhance-script', {
        body: {
          script: content,
          enhancementType: 'quality_improvement',
          instructions: `Improve this content based on quality feedback: ${qualityFeedback}`,
          tone: context?.tone || 'professional',
          targetAudience: context?.targetAudience || 'general',
        },
      });

      if (error) throw error;
      return data?.data?.enhancedScript || data?.data?.cleanScript || content;
    } catch (err) {
      console.error('Enhancement with feedback failed:', err);
      return content; // Return original if enhancement fails
    }
  },
};
