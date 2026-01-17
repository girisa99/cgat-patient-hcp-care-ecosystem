/**
 * AI-Based Quality Assessment Service
 * 
 * Replaces heuristic scoring with actual AI semantic analysis for:
 * - Content quality (relevance, accuracy, coherence)
 * - Visual relevance (image-to-content alignment)
 * - Language quality (grammar, clarity, readability)
 * - Overall presentation quality
 */

import { supabase } from '@/integrations/supabase/client';

export interface SlideQualityMetrics {
  overall: number;           // 0-100 overall score
  contentAccuracy: number;   // Content quality/relevance
  visualRelevance: number;   // Image-text alignment
  languageQuality: number;   // Grammar/clarity
  coherenceScore: number;    // Logical flow
  engagementScore: number;   // Audience engagement potential
  model: string;             // Model used for assessment
  suggestedModel?: string;   // Better model if score is low
  improvements: string[];    // Specific improvement suggestions
  strengths: string[];       // Content strengths
  assessedAt: string;        // Timestamp
}

export interface ContentQualityAssessment {
  slideId: string;
  metrics: SlideQualityMetrics;
  rawAnalysis?: string;      // Raw AI analysis text
}

export interface PresentationQualityReport {
  presentationId: string;
  overallScore: number;
  slideScores: ContentQualityAssessment[];
  averages: {
    content: number;
    visual: number;
    language: number;
    coherence: number;
    engagement: number;
  };
  topIssues: string[];
  topStrengths: string[];
  recommendations: string[];
  assessedAt: string;
}

/**
 * AI-based quality assessment - calls edge function for semantic analysis
 */
export async function assessSlideQuality(
  slide: {
    id: string;
    title?: string;
    content?: { bullets?: string[]; paragraph?: string };
    image?: string;
    speakerNotes?: string;
  },
  context?: {
    presentationTopic?: string;
    targetAudience?: string;
    previousSlide?: string;
    nextSlide?: string;
  }
): Promise<ContentQualityAssessment> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-quality-assessment', {
      body: {
        action: 'assess_slide',
        slide,
        context
      }
    });

    if (error) throw error;
    
    return data as ContentQualityAssessment;
  } catch (error) {
    console.error('AI quality assessment failed, using fallback:', error);
    return fallbackSlideAssessment(slide);
  }
}

/**
 * Batch assess multiple slides for efficiency
 */
export async function assessPresentationQuality(
  slides: Array<{
    id: string;
    title?: string;
    content?: { bullets?: string[]; paragraph?: string };
    image?: string;
    speakerNotes?: string;
  }>,
  metadata?: {
    presentationTopic?: string;
    targetAudience?: string;
    language?: string;
  }
): Promise<PresentationQualityReport> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-quality-assessment', {
      body: {
        action: 'assess_presentation',
        slides,
        metadata
      }
    });

    if (error) throw error;
    
    return data as PresentationQualityReport;
  } catch (error) {
    console.error('Presentation quality assessment failed, using fallback:', error);
    return fallbackPresentationAssessment(slides);
  }
}

/**
 * Quick quality check for real-time feedback during generation
 */
export async function quickQualityCheck(
  content: string,
  contentType: 'title' | 'bullet' | 'paragraph' | 'speaker_notes'
): Promise<{ score: number; feedback: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-quality-assessment', {
      body: {
        action: 'quick_check',
        content,
        contentType
      }
    });

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Quick quality check failed:', error);
    // Fallback with basic heuristics
    const score = Math.min(100, 60 + content.length / 10);
    return { 
      score, 
      feedback: score > 80 ? 'Good quality' : 'Consider expanding content' 
    };
  }
}

/**
 * Assess image-content alignment using vision AI
 */
export async function assessImageRelevance(
  imageUrl: string,
  slideTitle: string,
  slideContent: string
): Promise<{ score: number; analysis: string; suggestions: string[] }> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-quality-assessment', {
      body: {
        action: 'assess_image_relevance',
        imageUrl,
        slideTitle,
        slideContent
      }
    });

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Image relevance assessment failed:', error);
    return { 
      score: 75, 
      analysis: 'Unable to analyze image relevance',
      suggestions: ['Consider verifying image matches slide topic']
    };
  }
}

/**
 * Fallback heuristic assessment when AI is unavailable
 */
function fallbackSlideAssessment(slide: {
  id: string;
  title?: string;
  content?: { bullets?: string[]; paragraph?: string };
  image?: string;
  speakerNotes?: string;
}): ContentQualityAssessment {
  // Enhanced heuristic scoring
  let contentScore = 50;
  let visualScore = 50;
  let languageScore = 50;
  let coherenceScore = 50;
  let engagementScore = 50;
  const improvements: string[] = [];
  const strengths: string[] = [];

  // Title quality
  if (slide.title) {
    const titleLength = slide.title.length;
    if (titleLength > 5 && titleLength < 80) {
      contentScore += 15;
      strengths.push('Good title length');
    } else if (titleLength >= 80) {
      improvements.push('Title may be too long');
      contentScore += 5;
    } else {
      improvements.push('Title is very short');
    }
  } else {
    improvements.push('Missing slide title');
  }

  // Bullet content quality
  const bullets = slide.content?.bullets || [];
  if (bullets.length > 0) {
    contentScore += Math.min(20, bullets.length * 5);
    if (bullets.length >= 3 && bullets.length <= 6) {
      strengths.push('Optimal number of bullet points');
      engagementScore += 10;
    } else if (bullets.length > 6) {
      improvements.push('Consider reducing bullet points for clarity');
    }
    
    // Check bullet length
    const avgBulletLength = bullets.reduce((sum, b) => sum + b.length, 0) / bullets.length;
    if (avgBulletLength > 20 && avgBulletLength < 100) {
      languageScore += 15;
      strengths.push('Good bullet point length');
    } else if (avgBulletLength >= 100) {
      improvements.push('Bullet points may be too verbose');
    }
  } else if (!slide.content?.paragraph) {
    improvements.push('Missing slide content');
  }

  // Paragraph content
  if (slide.content?.paragraph) {
    const paraLength = slide.content.paragraph.length;
    if (paraLength > 50 && paraLength < 500) {
      contentScore += 15;
      strengths.push('Good content depth');
    } else if (paraLength >= 500) {
      improvements.push('Consider breaking content into multiple slides');
    }
  }

  // Image presence
  if (slide.image) {
    visualScore += 30;
    strengths.push('Includes visual content');
  } else {
    improvements.push('Consider adding a relevant image');
    visualScore -= 10;
  }

  // Speaker notes
  if (slide.speakerNotes) {
    languageScore += 15;
    coherenceScore += 10;
    strengths.push('Includes speaker notes');
    if (slide.speakerNotes.length > 200) {
      strengths.push('Detailed speaker guidance');
    }
  } else {
    improvements.push('Adding speaker notes improves presentation delivery');
  }

  // Calculate overall
  const overall = Math.round(
    (contentScore * 0.3 + visualScore * 0.2 + languageScore * 0.2 + coherenceScore * 0.15 + engagementScore * 0.15)
  );

  return {
    slideId: slide.id,
    metrics: {
      overall: Math.min(100, Math.max(0, overall)),
      contentAccuracy: Math.min(100, Math.max(0, contentScore)),
      visualRelevance: Math.min(100, Math.max(0, visualScore)),
      languageQuality: Math.min(100, Math.max(0, languageScore)),
      coherenceScore: Math.min(100, Math.max(0, coherenceScore)),
      engagementScore: Math.min(100, Math.max(0, engagementScore)),
      model: 'heuristic-fallback',
      suggestedModel: overall < 70 ? 'google/gemini-2.5-pro' : undefined,
      improvements,
      strengths,
      assessedAt: new Date().toISOString()
    }
  };
}

/**
 * Fallback presentation assessment
 */
function fallbackPresentationAssessment(slides: Array<{
  id: string;
  title?: string;
  content?: { bullets?: string[]; paragraph?: string };
  image?: string;
  speakerNotes?: string;
}>): PresentationQualityReport {
  const slideScores = slides.map(slide => fallbackSlideAssessment(slide));
  
  const averages = {
    content: slideScores.reduce((sum, s) => sum + s.metrics.contentAccuracy, 0) / slides.length,
    visual: slideScores.reduce((sum, s) => sum + s.metrics.visualRelevance, 0) / slides.length,
    language: slideScores.reduce((sum, s) => sum + s.metrics.languageQuality, 0) / slides.length,
    coherence: slideScores.reduce((sum, s) => sum + s.metrics.coherenceScore, 0) / slides.length,
    engagement: slideScores.reduce((sum, s) => sum + s.metrics.engagementScore, 0) / slides.length,
  };

  const overallScore = (averages.content + averages.visual + averages.language + averages.coherence + averages.engagement) / 5;

  // Aggregate issues and strengths
  const allImprovements = slideScores.flatMap(s => s.metrics.improvements);
  const allStrengths = slideScores.flatMap(s => s.metrics.strengths);
  
  // Count occurrences for top issues
  const issueCounts = allImprovements.reduce((acc, issue) => {
    acc[issue] = (acc[issue] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const strengthCounts = allStrengths.reduce((acc, strength) => {
    acc[strength] = (acc[strength] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topIssues = Object.entries(issueCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([issue]) => issue);

  const topStrengths = Object.entries(strengthCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([strength]) => strength);

  const recommendations: string[] = [];
  if (averages.visual < 60) recommendations.push('Add more visual content to slides');
  if (averages.content < 60) recommendations.push('Expand slide content for better depth');
  if (averages.language < 60) recommendations.push('Review content for clarity and grammar');
  if (averages.coherence < 60) recommendations.push('Improve logical flow between slides');
  if (averages.engagement < 60) recommendations.push('Add interactive elements or questions');

  return {
    presentationId: `pres-${Date.now()}`,
    overallScore: Math.round(overallScore),
    slideScores,
    averages: {
      content: Math.round(averages.content),
      visual: Math.round(averages.visual),
      language: Math.round(averages.language),
      coherence: Math.round(averages.coherence),
      engagement: Math.round(averages.engagement)
    },
    topIssues,
    topStrengths,
    recommendations,
    assessedAt: new Date().toISOString()
  };
}

/**
 * Get confidence color based on score
 */
export function getQualityColor(score: number): string {
  if (score >= 90) return 'text-green-500 bg-green-500/10';
  if (score >= 75) return 'text-emerald-500 bg-emerald-500/10';
  if (score >= 60) return 'text-yellow-500 bg-yellow-500/10';
  if (score >= 40) return 'text-orange-500 bg-orange-500/10';
  return 'text-red-500 bg-red-500/10';
}

/**
 * Get quality label based on score
 */
export function getQualityLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Needs Improvement';
  return 'Poor';
}

export default {
  assessSlideQuality,
  assessPresentationQuality,
  quickQualityCheck,
  assessImageRelevance,
  getQualityColor,
  getQualityLabel
};
