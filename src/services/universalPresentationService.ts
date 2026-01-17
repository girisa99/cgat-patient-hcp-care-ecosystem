/**
 * UNIVERSAL PRESENTATION SERVICE - Genie Mind to Media
 * 
 * Comprehensive presentation generator that transforms:
 * - Documents (PDF, DOCX, PPTX, TXT, MD)
 * - Images (analysis + context extraction)
 * - Text/Prompts (direct content generation)
 * 
 * Output formats:
 * - PowerPoint (PPTX) with AI-generated images
 * - Social Media (LinkedIn, Twitter, Instagram)
 * - Infographics (Journey maps, process flows)
 * - White Papers (Long-form content)
 * 
 * Uses: Universal AI Connector + Gemini Image Generation
 */

import { supabase } from '@/integrations/supabase/client';
import pptxgen from 'pptxgenjs';

// ============================================
// TYPES & INTERFACES
// ============================================

export type InputSource = 'document' | 'image' | 'text' | 'prompt' | 'url';
export type OutputFormat = 'pptx' | 'social' | 'infographic' | 'whitepaper' | 'journey-map';
export type SocialPlatform = 'linkedin' | 'twitter' | 'instagram' | 'facebook';
export type PresentationLength = 'short' | 'standard' | 'long'; // 5-8, 10-15, 20+ slides
export type CollateralType = 'presentation' | 'marketing' | 'website' | 'conference' | 'investor' | 'sales' | 'training' | 'product-launch' | 'case-study' | 'whitepaper';
export type ImageSourceType = 'ai-generated' | 'stock-upload' | 'placeholder' | 'mixed';
export type ImageStyleType = 'sketch' | 'ai-realistic' | 'illustration' | 'infographic' | 'workflow' | 'icons' | 'charts' | 'abstract';
export type VoiceProviderType = 'openai' | 'elevenlabs' | 'amazon-polly' | 'google';

// Tone/Style options for presentation
export type PresentationTone = 'professional' | 'humor' | 'empathy' | 'engagement' | 'balanced' | 'scientific' | 'research' | 'inspirational' | 'storytelling' | 'empathetic' | 'conversational' | 'persuasive' | 'educational';

// Content enhancement types
export type ContentEnhancement = 
  | 'data-verification'     // Include verified data points
  | 'architecture-diagrams' // System/process architecture
  | 'workflows'             // Workflow diagrams
  | 'comparison-tables'     // Before/after comparisons
  | 'timeline'              // Historical/future timeline
  | 'case-examples'         // Real-world examples
  | 'statistics'            // Key statistics
  | 'quotes'                // Expert quotes
  | 'research-citations'    // Academic citations
  | 'storytelling'          // Narrative-driven content
  | 'empathy-focus'         // Empathy-centered messaging
  | 'emotional-hooks';      // Emotional engagement points

// Slide count estimation
export interface SlideCountEstimate {
  min: number;
  max: number;
  recommended: number;
  breakdown: {
    title: number;
    content: number;
    infographic: number;
    journey: number;
    conclusion: number;
  };
}

// Smart recommendations based on content analysis
export interface ContentRecommendation {
  tones: { tone: PresentationTone; score: number; reason: string }[];
  enhancements: { type: ContentEnhancement; score: number; reason: string }[];
  suggestedSlideCount: SlideCountEstimate;
  audienceInsight: string;
  keyTopics: string[];
}

export interface AIModelSuggestion {
  textModel: string;
  imageModel: string;
  reason: string;
  confidence: number;
}

export interface PresentationRequest {
  // Input source
  inputSource: InputSource;
  content: string; // URL, base64 image, or text content
  contentType?: string; // MIME type for documents/images
  
  // Collateral type
  collateralType?: CollateralType;
  
  // Presentation configuration
  outputFormat: OutputFormat;
  socialPlatform?: SocialPlatform;
  length: PresentationLength;
  
  // Content structure
  title?: string;
  topics?: string[];
  agenda?: string[];
  targetAudience?: string;
  
  // Image options
  imageSource?: ImageSourceType;
  imageStyles?: ImageStyleType[];
  generateImages: boolean;
  imageStyle?: 'professional' | 'creative' | 'minimal' | 'infographic' | 'healthcare' | 'tech';
  colorScheme?: 'default' | 'dark' | 'light' | 'brand';
  includeJourneyMaps?: boolean;
  includeInfographics?: boolean;
  
  // Voice options
  voiceProvider?: VoiceProviderType;
  
  // AI model selection
  suggestedModel?: AIModelSuggestion;
  useCustomModel?: boolean;
  customTextModel?: string;
  customImageModel?: string;
  
  // Segmentation
  autoSegment?: boolean; // Auto-divide content into logical slides
  segmentBy?: 'topics' | 'agenda' | 'paragraphs' | 'ai-analysis';
  
  // Tone & Style
  tones?: PresentationTone[];
  
  // Content enhancements
  contentEnhancements?: ContentEnhancement[];
  
  // Multi-language support
  languages?: string[]; // Array of language codes for simultaneous generation
  primaryLanguage?: string; // Source/primary language
  generateVoiceoversForAll?: boolean; // Generate TTS for all languages
}

export interface GeneratedSlide {
  id: string;
  slideNumber: number;
  type: 'title' | 'content' | 'section' | 'infographic' | 'journey' | 'stats' | 'conclusion' | 'cta';
  title: string;
  subtitle?: string;
  content: SlideContent;
  image?: GeneratedImage;
  speakerNotes?: string;
  metadata?: {
    topic?: string;
    segment?: string;
    importance?: 'high' | 'medium' | 'low';
    imagePrompt?: string;
  };
}

export interface SlideContent {
  type: 'bullets' | 'paragraphs' | 'stats' | 'journey' | 'comparison' | 'timeline' | 'quote';
  bullets?: string[];
  paragraphs?: string[];
  stats?: { value: string; label: string; icon?: string }[];
  journeySteps?: JourneyStep[];
  comparisonItems?: { left: string; right: string }[];
  timelineEvents?: { date: string; title: string; description: string }[];
  quote?: { text: string; author: string };
}

export interface JourneyStep {
  id: number;
  title: string;
  description: string;
  icon?: string;
  status?: 'completed' | 'current' | 'upcoming';
}

export interface GeneratedImage {
  url: string;
  base64?: string;
  alt: string;
  type: 'hero' | 'illustration' | 'icon' | 'infographic' | 'chart';
  prompt: string;
}

export interface PresentationResult {
  success: boolean;
  slides: GeneratedSlide[];
  metadata: {
    title: string;
    totalSlides: number;
    estimatedDuration: number; // minutes
    generatedAt: string;
    inputSource: InputSource;
    outputFormat: OutputFormat;
    imagesGenerated: number;
  };
  downloadUrl?: string;
  socialPreview?: SocialPreview;
  error?: string;
}

export interface SocialPreview {
  platform: SocialPlatform;
  title: string;
  description: string;
  hashtags: string[];
  imageUrl?: string;
  characterCount: number;
}

// ============================================
// UNIVERSAL PRESENTATION SERVICE
// ============================================

class UniversalPresentationService {
  private readonly AI_PROVIDER = 'gemini';
  private readonly AI_MODEL = 'gemini-2.0-flash-exp';
  private readonly IMAGE_MODEL = 'google/gemini-2.5-flash-image-preview';
  
  // Model recommendations based on collateral type
  private readonly MODEL_RECOMMENDATIONS: Record<CollateralType, AIModelSuggestion> = {
    'presentation': {
      textModel: 'google/gemini-3-flash-preview',
      imageModel: 'google/gemini-2.5-flash-image-preview',
      reason: 'Best balance of speed and quality for standard presentations',
      confidence: 0.9
    },
    'marketing': {
      textModel: 'google/gemini-2.5-pro',
      imageModel: 'google/gemini-3-pro-image-preview',
      reason: 'Premium quality for marketing materials with creative visuals',
      confidence: 0.95
    },
    'website': {
      textModel: 'google/gemini-3-flash-preview',
      imageModel: 'google/gemini-2.5-flash-image-preview',
      reason: 'Fast generation for web collateral with consistent branding',
      confidence: 0.88
    },
    'conference': {
      textModel: 'google/gemini-2.5-pro',
      imageModel: 'google/gemini-3-pro-image-preview',
      reason: 'High-impact visuals and compelling narratives for conferences',
      confidence: 0.92
    },
    'investor': {
      textModel: 'openai/gpt-5',
      imageModel: 'google/gemini-3-pro-image-preview',
      reason: 'Professional tone with data-driven visuals for investor pitches',
      confidence: 0.94
    },
    'sales': {
      textModel: 'google/gemini-2.5-flash',
      imageModel: 'google/gemini-2.5-flash-image-preview',
      reason: 'Persuasive content with quick turnaround for sales enablement',
      confidence: 0.87
    },
    'training': {
      textModel: 'google/gemini-3-flash-preview',
      imageModel: 'google/gemini-2.5-flash-image-preview',
      reason: 'Clear explanations with instructional diagrams',
      confidence: 0.9
    },
    'product-launch': {
      textModel: 'google/gemini-2.5-pro',
      imageModel: 'google/gemini-3-pro-image-preview',
      reason: 'High-quality visuals and compelling narratives for launches',
      confidence: 0.93
    },
    'case-study': {
      textModel: 'openai/gpt-5-mini',
      imageModel: 'google/gemini-2.5-flash-image-preview',
      reason: 'Analytical content with supporting visuals for case studies',
      confidence: 0.88
    },
    'whitepaper': {
      textModel: 'openai/gpt-5',
      imageModel: 'google/gemini-2.5-flash-image-preview',
      reason: 'In-depth analysis with professional charts and diagrams',
      confidence: 0.91
    }
  };

  /**
   * Get AI model suggestion based on collateral type and content
   */
  suggestAIModels(collateralType: CollateralType, content?: string): AIModelSuggestion {
    const baseRecommendation = this.MODEL_RECOMMENDATIONS[collateralType] || this.MODEL_RECOMMENDATIONS['presentation'];
    
    // Enhance recommendation based on content analysis
    if (content) {
      const contentLength = content.length;
      const hasNumbers = /\d+%|\$\d+|\d+\.\d+/g.test(content);
      const hasTechnicalTerms = /API|SDK|integration|platform|architecture/gi.test(content);
      
      // Adjust confidence based on content characteristics
      let adjustedConfidence = baseRecommendation.confidence;
      
      if (contentLength > 5000 && baseRecommendation.textModel.includes('flash')) {
        adjustedConfidence -= 0.05; // Long content might benefit from pro model
      }
      
      if (hasNumbers || hasTechnicalTerms) {
        adjustedConfidence += 0.02; // Content matches expected type
      }
      
      return {
        ...baseRecommendation,
        confidence: Math.min(1, Math.max(0, adjustedConfidence))
      };
    }
    
    return baseRecommendation;
  }

  /**
   * Get available voice providers with their capabilities
   */
  getVoiceProviders(): Array<{
    id: VoiceProviderType;
    name: string;
    voices: Array<{ id: string; name: string; style: string }>;
    features: string[];
  }> {
    return [
      {
        id: 'openai',
        name: 'OpenAI TTS',
        voices: [
          { id: 'alloy', name: 'Alloy', style: 'Neutral' },
          { id: 'echo', name: 'Echo', style: 'Male' },
          { id: 'fable', name: 'Fable', style: 'Storytelling' },
          { id: 'onyx', name: 'Onyx', style: 'Deep Male' },
          { id: 'nova', name: 'Nova', style: 'Female' },
          { id: 'shimmer', name: 'Shimmer', style: 'Soft Female' },
        ],
        features: ['Fast', 'Natural', 'Multiple voices']
      },
      {
        id: 'elevenlabs',
        name: 'ElevenLabs',
        voices: [
          { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger', style: 'Male Narrator' },
          { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', style: 'Female' },
          { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura', style: 'Female Warm' },
          { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', style: 'British Male' },
          { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', style: 'Deep Male' },
          { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', style: 'Female' },
        ],
        features: ['Ultra-realistic', 'Voice cloning', 'Emotional range']
      },
      {
        id: 'amazon-polly',
        name: 'Amazon Polly',
        voices: [
          { id: 'Matthew', name: 'Matthew', style: 'Male US' },
          { id: 'Joanna', name: 'Joanna', style: 'Female US' },
          { id: 'Amy', name: 'Amy', style: 'Female UK' },
          { id: 'Brian', name: 'Brian', style: 'Male UK' },
        ],
        features: ['Cost-effective', 'SSML support', 'Neural voices']
      },
      {
        id: 'google',
        name: 'Google Cloud TTS',
        voices: [
          { id: 'en-US-Neural2-D', name: 'US Male', style: 'Male' },
          { id: 'en-US-Neural2-F', name: 'US Female', style: 'Female' },
          { id: 'en-GB-Neural2-B', name: 'UK Male', style: 'British Male' },
          { id: 'en-GB-Neural2-A', name: 'UK Female', style: 'British Female' },
        ],
        features: ['WaveNet quality', 'Multi-language', 'Custom tuning']
      }
    ];
  }

  /**
   * Get image style options with descriptions
   */
  getImageStyleOptions(): Array<{
    id: ImageStyleType;
    name: string;
    description: string;
    bestFor: CollateralType[];
  }> {
    return [
      {
        id: 'sketch',
        name: 'Hand-drawn Sketches',
        description: 'Artistic sketches with a personal touch',
        bestFor: ['training', 'presentation', 'conference']
      },
      {
        id: 'ai-realistic',
        name: 'AI Photorealistic',
        description: 'High-quality realistic AI-generated images',
        bestFor: ['marketing', 'investor', 'product-launch']
      },
      {
        id: 'illustration',
        name: 'Illustrations',
        description: 'Clean vector-style illustrations',
        bestFor: ['website', 'sales', 'training']
      },
      {
        id: 'infographic',
        name: 'Infographic Style',
        description: 'Data visualization and info graphics',
        bestFor: ['whitepaper', 'case-study', 'investor']
      },
      {
        id: 'workflow',
        name: 'Workflow Diagrams',
        description: 'Process flows and system diagrams',
        bestFor: ['training', 'case-study', 'product-launch']
      },
      {
        id: 'icons',
        name: 'Icon-based',
        description: 'Clean icons and symbols',
        bestFor: ['presentation', 'website', 'sales']
      },
      {
        id: 'charts',
        name: 'Charts & Graphs',
        description: 'Data charts and statistical visualizations',
        bestFor: ['investor', 'whitepaper', 'case-study']
      },
      {
        id: 'abstract',
        name: 'Abstract Visuals',
        description: 'Creative abstract backgrounds and shapes',
        bestFor: ['marketing', 'conference', 'product-launch']
      }
    ];
  }

  /**
   * Get tone options with descriptions
   */
  getToneOptions(): Array<{
    id: PresentationTone;
    name: string;
    description: string;
    icon: string;
    bestFor: CollateralType[];
  }> {
    return [
      {
        id: 'professional',
        name: 'Professional',
        description: 'Formal and business-focused',
        icon: 'briefcase',
        bestFor: ['investor', 'whitepaper', 'case-study']
      },
      {
        id: 'humor',
        name: 'Humor',
        description: 'Light-hearted with tasteful jokes',
        icon: 'smile',
        bestFor: ['presentation', 'training', 'conference']
      },
      {
        id: 'empathy',
        name: 'Empathy',
        description: 'Understanding and compassionate',
        icon: 'heart',
        bestFor: ['training', 'case-study', 'website']
      },
      {
        id: 'engagement',
        name: 'Engagement',
        description: 'Interactive and attention-grabbing',
        icon: 'zap',
        bestFor: ['marketing', 'conference', 'product-launch']
      },
      {
        id: 'balanced',
        name: 'Balanced',
        description: 'Mix of professional and approachable',
        icon: 'scale',
        bestFor: ['presentation', 'sales', 'website']
      },
      {
        id: 'scientific',
        name: 'Scientific',
        description: 'Data-driven and evidence-based',
        icon: 'flask',
        bestFor: ['whitepaper', 'training', 'case-study']
      },
      {
        id: 'research',
        name: 'Research',
        description: 'Academic with citations',
        icon: 'book-open',
        bestFor: ['whitepaper', 'case-study', 'investor']
      },
      {
        id: 'inspirational',
        name: 'Inspirational',
        description: 'Motivating and uplifting',
        icon: 'star',
        bestFor: ['conference', 'marketing', 'product-launch']
      }
    ];
  }

  /**
   * Get content enhancement options
   */
  getContentEnhancements(): Array<{
    id: ContentEnhancement;
    name: string;
    description: string;
    icon: string;
  }> {
    return [
      {
        id: 'data-verification',
        name: 'Data Verification',
        description: 'Verified data points and sources',
        icon: 'check-circle'
      },
      {
        id: 'architecture-diagrams',
        name: 'Architecture Diagrams',
        description: 'System and process architecture visuals',
        icon: 'layers'
      },
      {
        id: 'workflows',
        name: 'Workflows',
        description: 'Step-by-step process flows',
        icon: 'git-branch'
      },
      {
        id: 'comparison-tables',
        name: 'Comparison Tables',
        description: 'Before/after or feature comparisons',
        icon: 'columns'
      },
      {
        id: 'timeline',
        name: 'Timeline',
        description: 'Historical or future milestones',
        icon: 'clock'
      },
      {
        id: 'case-examples',
        name: 'Case Examples',
        description: 'Real-world use cases',
        icon: 'folder'
      },
      {
        id: 'statistics',
        name: 'Statistics',
        description: 'Key metrics and numbers',
        icon: 'bar-chart-2'
      },
      {
        id: 'quotes',
        name: 'Expert Quotes',
        description: 'Industry expert opinions',
        icon: 'quote'
      },
      {
        id: 'research-citations',
        name: 'Research Citations',
        description: 'Academic and research references',
        icon: 'file-text'
      }
    ];
  }

  /**
   * Estimate slide count based on length and content
   */
  estimateSlideCount(length: PresentationLength, content?: string, enhancements?: ContentEnhancement[]): SlideCountEstimate {
    const baseCounts: Record<PresentationLength, { min: number; max: number; recommended: number }> = {
      'short': { min: 5, max: 8, recommended: 6 },
      'standard': { min: 10, max: 15, recommended: 12 },
      'long': { min: 18, max: 25, recommended: 20 }
    };

    const base = baseCounts[length];
    let adjustedRecommended = base.recommended;

    // Adjust based on content length
    if (content) {
      const wordCount = content.split(/\s+/).length;
      if (wordCount > 2000) adjustedRecommended += 3;
      else if (wordCount > 1000) adjustedRecommended += 2;
      else if (wordCount < 200) adjustedRecommended -= 2;
    }

    // Adjust based on enhancements
    if (enhancements) {
      if (enhancements.includes('architecture-diagrams')) adjustedRecommended += 2;
      if (enhancements.includes('workflows')) adjustedRecommended += 2;
      if (enhancements.includes('timeline')) adjustedRecommended += 1;
      if (enhancements.includes('comparison-tables')) adjustedRecommended += 1;
      if (enhancements.includes('case-examples')) adjustedRecommended += 2;
    }

    // Clamp to min/max based on length
    const finalRecommended = Math.max(base.min, Math.min(base.max + 5, adjustedRecommended));

    // Calculate breakdown
    const breakdown = {
      title: 1,
      content: Math.floor(finalRecommended * 0.6),
      infographic: Math.floor(finalRecommended * 0.15),
      journey: Math.floor(finalRecommended * 0.1),
      conclusion: 1
    };

    return {
      min: base.min,
      max: Math.max(base.max, finalRecommended),
      recommended: finalRecommended,
      breakdown
    };
  }

  /**
   * Analyze content and provide smart recommendations
   */
  analyzeContentForRecommendations(content: string, collateralType?: CollateralType): ContentRecommendation {
    const contentLower = content.toLowerCase();
    const wordCount = content.split(/\s+/).length;

    // Detect tone suitability
    const toneScores: { tone: PresentationTone; score: number; reason: string }[] = [];

    // Professional detection
    const professionalWords = ['strategy', 'enterprise', 'roi', 'stakeholder', 'kpi', 'objectives'];
    const professionalScore = professionalWords.filter(w => contentLower.includes(w)).length / professionalWords.length;
    toneScores.push({ tone: 'professional', score: Math.min(1, professionalScore + 0.3), reason: 'Business terminology detected' });

    // Scientific detection
    const scientificWords = ['research', 'study', 'analysis', 'methodology', 'hypothesis', 'data', 'evidence'];
    const scientificScore = scientificWords.filter(w => contentLower.includes(w)).length / scientificWords.length;
    toneScores.push({ tone: 'scientific', score: Math.min(1, scientificScore + 0.2), reason: 'Research-oriented content' });

    // Empathy detection
    const empathyWords = ['patient', 'care', 'support', 'help', 'understand', 'experience', 'journey'];
    const empathyScore = empathyWords.filter(w => contentLower.includes(w)).length / empathyWords.length;
    toneScores.push({ tone: 'empathy', score: Math.min(1, empathyScore + 0.2), reason: 'Human-centered content' });

    // Engagement detection
    const engagementWords = ['exciting', 'new', 'innovative', 'transform', 'revolutionize', 'breakthrough'];
    const engagementScore = engagementWords.filter(w => contentLower.includes(w)).length / engagementWords.length;
    toneScores.push({ tone: 'engagement', score: Math.min(1, engagementScore + 0.3), reason: 'Exciting language detected' });

    // Inspirational detection
    const inspirationalWords = ['vision', 'future', 'inspire', 'achieve', 'success', 'mission', 'impact'];
    const inspirationalScore = inspirationalWords.filter(w => contentLower.includes(w)).length / inspirationalWords.length;
    toneScores.push({ tone: 'inspirational', score: Math.min(1, inspirationalScore + 0.25), reason: 'Visionary content' });

    // Humor - lower default, only if casual detected
    const humorScore = contentLower.includes('fun') || contentLower.includes('enjoy') ? 0.4 : 0.2;
    toneScores.push({ tone: 'humor', score: humorScore, reason: 'Can lighten the mood' });

    // Balanced is always moderate
    toneScores.push({ tone: 'balanced', score: 0.65, reason: 'Universal appeal' });

    // Research detection
    const researchScore = scientificScore > 0.3 && contentLower.includes('citation') ? 0.8 : scientificScore * 0.7;
    toneScores.push({ tone: 'research', score: researchScore, reason: 'Academic references suggested' });

    // Sort by score
    toneScores.sort((a, b) => b.score - a.score);

    // Detect content enhancements
    const enhancementScores: { type: ContentEnhancement; score: number; reason: string }[] = [];

    // Statistics detection
    const hasNumbers = /\d+%|\$\d+|\d+\.\d+/.test(content);
    enhancementScores.push({ 
      type: 'statistics', 
      score: hasNumbers ? 0.9 : 0.4, 
      reason: hasNumbers ? 'Numerical data found' : 'Could strengthen with data' 
    });

    // Workflow detection
    const workflowWords = ['process', 'step', 'workflow', 'flow', 'procedure', 'sequence'];
    const workflowScore = workflowWords.filter(w => contentLower.includes(w)).length / workflowWords.length;
    enhancementScores.push({ type: 'workflows', score: Math.min(1, workflowScore + 0.3), reason: 'Process-oriented content' });

    // Architecture detection
    const archWords = ['architecture', 'system', 'platform', 'infrastructure', 'integration', 'api'];
    const archScore = archWords.filter(w => contentLower.includes(w)).length / archWords.length;
    enhancementScores.push({ type: 'architecture-diagrams', score: Math.min(1, archScore + 0.2), reason: 'Technical systems mentioned' });

    // Timeline detection
    const timelineWords = ['milestone', 'phase', 'quarter', 'roadmap', 'timeline', 'history'];
    const timelineScore = timelineWords.filter(w => contentLower.includes(w)).length / timelineWords.length;
    enhancementScores.push({ type: 'timeline', score: Math.min(1, timelineScore + 0.25), reason: 'Time-based content' });

    // Case examples
    const caseWords = ['example', 'case', 'scenario', 'real-world', 'implementation'];
    const caseScore = caseWords.filter(w => contentLower.includes(w)).length / caseWords.length;
    enhancementScores.push({ type: 'case-examples', score: Math.min(1, caseScore + 0.35), reason: 'Examples would help illustrate' });

    // Comparison
    const comparisonWords = ['vs', 'versus', 'compared', 'before', 'after', 'difference'];
    const comparisonScore = comparisonWords.filter(w => contentLower.includes(w)).length / comparisonWords.length;
    enhancementScores.push({ type: 'comparison-tables', score: Math.min(1, comparisonScore + 0.25), reason: 'Comparative content' });

    // Data verification
    enhancementScores.push({ type: 'data-verification', score: hasNumbers ? 0.7 : 0.3, reason: 'Adds credibility' });

    // Quotes
    enhancementScores.push({ type: 'quotes', score: 0.5, reason: 'Expert opinions add authority' });

    // Research citations
    enhancementScores.push({ type: 'research-citations', score: scientificScore > 0.3 ? 0.7 : 0.3, reason: 'Academic backing' });

    enhancementScores.sort((a, b) => b.score - a.score);

    // Extract key topics
    const keyTopics = this.extractKeyTopics(content);

    // Audience insight
    let audienceInsight = 'General business audience';
    if (collateralType === 'investor') audienceInsight = 'Investors and stakeholders focused on ROI and growth';
    else if (collateralType === 'training') audienceInsight = 'Learners seeking practical knowledge';
    else if (collateralType === 'marketing') audienceInsight = 'Prospects and potential customers';
    else if (collateralType === 'conference') audienceInsight = 'Industry professionals and thought leaders';
    else if (contentLower.includes('healthcare') || contentLower.includes('patient')) {
      audienceInsight = 'Healthcare professionals and decision-makers';
    }

    // Estimate slide count
    const suggestedSlideCount = this.estimateSlideCount('standard', content, enhancementScores.slice(0, 3).map(e => e.type));

    return {
      tones: toneScores.slice(0, 5),
      enhancements: enhancementScores.slice(0, 6),
      suggestedSlideCount,
      audienceInsight,
      keyTopics
    };
  }

  /**
   * Extract key topics from content
   */
  private extractKeyTopics(content: string): string[] {
    const words = content.toLowerCase().split(/\s+/);
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'it', 'its']);
    
    const wordFreq: Record<string, number> = {};
    words.forEach(word => {
      const cleaned = word.replace(/[^a-z]/g, '');
      if (cleaned.length > 4 && !stopWords.has(cleaned)) {
        wordFreq[cleaned] = (wordFreq[cleaned] || 0) + 1;
      }
    });

    return Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));
  }
  
  async generatePresentation(request: PresentationRequest): Promise<PresentationResult> {
    const startTime = Date.now();
    
    try {
      console.log('[PresentationService] Starting generation:', request.inputSource);
      
      // Step 1: Extract/analyze content based on input source
      const extractedContent = await this.extractContent(request);
      if (!extractedContent) {
        return { success: false, error: 'Content extraction failed', slides: [], metadata: this.getEmptyMetadata(request) };
      }
      
      // Step 2: Generate slide structure with AI
      const slideStructure = await this.generateSlideStructure(extractedContent, request);
      if (!slideStructure || slideStructure.length === 0) {
        return { success: false, error: 'Slide structure generation failed', slides: [], metadata: this.getEmptyMetadata(request) };
      }
      
      // Step 3: Generate images for slides (if enabled)
      let slidesWithImages = slideStructure;
      let imagesGenerated = 0;
      if (request.generateImages) {
        const imageResult = await this.generateSlideImages(slideStructure, request);
        slidesWithImages = imageResult.slides;
        imagesGenerated = imageResult.imagesGenerated;
      }
      
      // Step 4: Generate social preview if social format
      let socialPreview: SocialPreview | undefined;
      if (request.outputFormat === 'social' && request.socialPlatform) {
        socialPreview = await this.generateSocialPreview(slidesWithImages, request.socialPlatform);
      }
      
      const processingTime = Date.now() - startTime;
      console.log(`[PresentationService] Generation complete in ${processingTime}ms`);
      
      return {
        success: true,
        slides: slidesWithImages,
        metadata: {
          title: extractedContent.title || 'Untitled Presentation',
          totalSlides: slidesWithImages.length,
          estimatedDuration: Math.ceil(slidesWithImages.length * 1.5), // ~1.5 min per slide
          generatedAt: new Date().toISOString(),
          inputSource: request.inputSource,
          outputFormat: request.outputFormat,
          imagesGenerated
        },
        socialPreview
      };
    } catch (error) {
      console.error('[PresentationService] Generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Presentation generation failed',
        slides: [],
        metadata: this.getEmptyMetadata(request)
      };
    }
  }
  
  /**
   * Extract content from various input sources
   */
  private async extractContent(request: PresentationRequest): Promise<ExtractedPresentationContent | null> {
    switch (request.inputSource) {
      case 'prompt':
      case 'text':
        return this.extractFromText(request.content, request);
        
      case 'image':
        return this.extractFromImage(request.content, request);
        
      case 'document':
        return this.extractFromDocument(request.content, request.contentType, request);
        
      case 'url':
        return this.extractFromUrl(request.content, request);
        
      default:
        return null;
    }
  }
  
  /**
   * Extract content from text/prompt
   */
  private async extractFromText(text: string, request: PresentationRequest): Promise<ExtractedPresentationContent | null> {
    const systemPrompt = `You are a presentation content architect. Analyze the given text and extract structured content for a ${request.length} presentation.
    
Output format (JSON):
{
  "title": "Main presentation title",
  "subtitle": "Tagline or subtitle",
  "topics": ["Topic 1", "Topic 2", ...],
  "sections": [
    {
      "heading": "Section title",
      "content": "Main content",
      "keyPoints": ["Point 1", "Point 2"],
      "type": "introduction|content|stats|journey|conclusion"
    }
  ],
  "statistics": [
    { "value": "95%", "label": "Accuracy" }
  ],
  "journeySteps": [
    { "title": "Step 1", "description": "..." }
  ],
  "targetAudience": "Identified audience",
  "tone": "professional|casual|inspirational"
}`;
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          provider: this.AI_PROVIDER,
          model: this.AI_MODEL,
          systemPrompt,
          prompt: `Analyze this content for a ${request.length} presentation (${request.outputFormat} format):\n\n${text}\n\nTarget audience: ${request.targetAudience || 'General professional audience'}\nTopics to cover: ${request.topics?.join(', ') || 'Auto-detect'}\nAgenda: ${request.agenda?.join(', ') || 'Auto-generate'}`,
          action: 'presentation_extract'
        }
      });
      
      if (error) throw error;
      
      // Parse AI response
      const content = data.content || data;
      const parsed = this.parseAIResponse(content);
      
      return {
        title: parsed.title || request.title || 'Generated Presentation',
        subtitle: parsed.subtitle,
        topics: parsed.topics || request.topics || [],
        sections: parsed.sections || [],
        statistics: parsed.statistics || [],
        journeySteps: parsed.journeySteps || [],
        rawContent: text
      };
    } catch (error) {
      console.error('[PresentationService] Text extraction error:', error);
      return null;
    }
  }
  
  /**
   * Extract content from image using vision AI
   */
  private async extractFromImage(imageData: string, request: PresentationRequest): Promise<ExtractedPresentationContent | null> {
    const systemPrompt = `You are a visual content analyst. Analyze this image and extract content for a presentation.
    
Describe:
1. What the image shows (detailed description)
2. Key themes or concepts
3. Any text visible in the image
4. Suggested presentation topics based on the image
5. Statistics or data if visible

Output as JSON with title, topics, sections, and any extracted data.`;
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          provider: this.AI_PROVIDER,
          model: 'gemini-1.5-pro-latest', // Vision model
          systemPrompt,
          prompt: `Analyze this image for a ${request.length} presentation. Extract all relevant content.`,
          imageUrl: imageData.startsWith('data:') ? imageData : `data:image/png;base64,${imageData}`,
          action: 'vision_analysis'
        }
      });
      
      if (error) throw error;
      
      const parsed = this.parseAIResponse(data.content || data);
      
      return {
        title: parsed.title || 'Visual Analysis Presentation',
        subtitle: parsed.subtitle,
        topics: parsed.topics || [],
        sections: parsed.sections || [],
        statistics: parsed.statistics || [],
        journeySteps: parsed.journeySteps || [],
        rawContent: `Image analysis: ${parsed.description || 'Visual content'}`,
        sourceImage: imageData
      };
    } catch (error) {
      console.error('[PresentationService] Image extraction error:', error);
      return null;
    }
  }
  
  /**
   * Extract content from document
   */
  private async extractFromDocument(documentUrl: string, contentType?: string, request?: PresentationRequest): Promise<ExtractedPresentationContent | null> {
    // Use existing document parsing service via edge function
    try {
      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          provider: this.AI_PROVIDER,
          model: this.AI_MODEL,
          prompt: `Parse this document and extract structured content for a presentation. Document URL: ${documentUrl}`,
          action: 'document_extract',
          context: { documentUrl, contentType }
        }
      });
      
      if (error) throw error;
      
      const parsed = this.parseAIResponse(data.content || data);
      
      return {
        title: parsed.title || 'Document Presentation',
        subtitle: parsed.subtitle,
        topics: parsed.topics || [],
        sections: parsed.sections || [],
        statistics: parsed.statistics || [],
        journeySteps: parsed.journeySteps || [],
        rawContent: parsed.rawContent || documentUrl
      };
    } catch (error) {
      console.error('[PresentationService] Document extraction error:', error);
      return null;
    }
  }
  
  /**
   * Extract content from URL
   */
  private async extractFromUrl(url: string, request: PresentationRequest): Promise<ExtractedPresentationContent | null> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          provider: this.AI_PROVIDER,
          model: this.AI_MODEL,
          prompt: `Fetch and analyze the content from this URL for a presentation: ${url}. Extract key topics, statistics, and create a structured outline.`,
          action: 'url_extract',
          context: { url }
        }
      });
      
      if (error) throw error;
      
      const parsed = this.parseAIResponse(data.content || data);
      
      return {
        title: parsed.title || 'Web Content Presentation',
        subtitle: parsed.subtitle,
        topics: parsed.topics || [],
        sections: parsed.sections || [],
        statistics: parsed.statistics || [],
        journeySteps: parsed.journeySteps || [],
        rawContent: url
      };
    } catch (error) {
      console.error('[PresentationService] URL extraction error:', error);
      return null;
    }
  }
  
  /**
   * Generate slide structure using AI
   */
  private async generateSlideStructure(content: ExtractedPresentationContent, request: PresentationRequest): Promise<GeneratedSlide[]> {
    const slideCount = this.getSlideCount(request.length);
    
    const systemPrompt = `You are a presentation designer creating a ${request.length} presentation with ${slideCount.min}-${slideCount.max} slides.

Output Format (JSON array of slides):
[
  {
    "slideNumber": 1,
    "type": "title|content|section|infographic|journey|stats|conclusion|cta",
    "title": "Slide title",
    "subtitle": "Optional subtitle",
    "content": {
      "type": "bullets|paragraphs|stats|journey|comparison|timeline|quote",
      "bullets": ["Point 1", "Point 2"],
      "stats": [{ "value": "95%", "label": "Accuracy" }],
      "journeySteps": [{ "id": 1, "title": "Step", "description": "..." }]
    },
    "speakerNotes": "Notes for presenter",
    "imagePrompt": "Descriptive prompt for AI image generation",
    "metadata": {
      "topic": "Topic category",
      "importance": "high|medium|low"
    }
  }
]

Include:
- Title slide with compelling hook
- Section dividers for major topics
- Content slides with clear bullets (max 5-6 per slide)
- Statistics/data visualization slides when applicable
- Journey/process slides for workflows
- Strong conclusion and CTA
${request.includeInfographics ? '- Infographic-style slides for data' : ''}
${request.includeJourneyMaps ? '- Customer/user journey map slides' : ''}`;

    try {
      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          provider: this.AI_PROVIDER,
          model: this.AI_MODEL,
          systemPrompt,
          prompt: `Create a ${request.length} presentation (${slideCount.min}-${slideCount.max} slides) from this content:

Title: ${content.title}
Subtitle: ${content.subtitle || 'N/A'}
Topics: ${content.topics.join(', ')}
Target Audience: ${request.targetAudience || 'Professional audience'}
Output Format: ${request.outputFormat}
${request.outputFormat === 'social' ? `Platform: ${request.socialPlatform}` : ''}

Sections:
${content.sections.map(s => `- ${s.heading}: ${s.content}`).join('\n')}

Statistics:
${content.statistics?.map(s => `- ${s.value}: ${s.label}`).join('\n') || 'Extract from content'}

${content.journeySteps?.length ? `Journey Steps:\n${content.journeySteps.map(j => `- ${j.title}: ${j.description}`).join('\n')}` : ''}

Generate a complete slide deck with image prompts for visual slides.`,
          action: 'presentation_structure'
        }
      });
      
      if (error) throw error;
      
      const slides = this.parseSlideStructure(data.content || data);
      return slides;
    } catch (error) {
      console.error('[PresentationService] Slide structure error:', error);
      return [];
    }
  }
  
  /**
   * Generate images for slides using Gemini
   */
  private async generateSlideImages(slides: GeneratedSlide[], request: PresentationRequest): Promise<{ slides: GeneratedSlide[]; imagesGenerated: number }> {
    let imagesGenerated = 0;
    const slidesWithImages: GeneratedSlide[] = [];
    
    // Only generate images for certain slide types
    const imageSlideTypes = ['title', 'section', 'content', 'infographic', 'journey'];
    
    for (const slide of slides) {
      if (!imageSlideTypes.includes(slide.type) || !slide.metadata?.imagePrompt) {
        slidesWithImages.push(slide);
        continue;
      }
      
      try {
        const imagePrompt = this.buildImagePrompt(slide, request);
        
        const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
          body: {
            provider: 'gemini',
            model: this.IMAGE_MODEL,
            prompt: imagePrompt,
            action: 'image_generate',
            modalities: ['image', 'text']
          }
        });
        
        if (!error && data?.images?.[0]?.url) {
          slidesWithImages.push({
            ...slide,
            image: {
              url: data.images[0].url,
              base64: data.images[0].url,
              alt: slide.title,
              type: this.getImageType(slide.type),
              prompt: imagePrompt
            }
          });
          imagesGenerated++;
        } else {
          slidesWithImages.push(slide);
        }
      } catch (error) {
        console.error(`[PresentationService] Image generation failed for slide ${slide.slideNumber}:`, error);
        slidesWithImages.push(slide);
      }
      
      // Rate limiting - small delay between image generations
      if (imagesGenerated > 0 && imagesGenerated % 3 === 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return { slides: slidesWithImages, imagesGenerated };
  }
  
  /**
   * Build optimized image prompt for slide
   */
  private buildImagePrompt(slide: GeneratedSlide, request: PresentationRequest): string {
    const styleMap = {
      professional: 'clean, corporate, modern, minimal design',
      creative: 'vibrant, artistic, dynamic, colorful',
      minimal: 'simple, clean lines, white space, elegant',
      infographic: 'data visualization, charts, icons, informative',
      healthcare: 'medical, clinical, blue and white, trustworthy',
      tech: 'futuristic, digital, neon accents, modern technology'
    };
    
    const style = styleMap[request.imageStyle || 'professional'];
    
    return `Create a ${request.outputFormat === 'social' ? 'social media' : 'presentation'} slide image: ${slide.title}. 
Style: ${style}. 
${slide.metadata?.imagePrompt || ''}
16:9 aspect ratio, high resolution, no text overlays, professional quality.`;
  }
  
  /**
   * Generate social media preview
   */
  private async generateSocialPreview(slides: GeneratedSlide[], platform: SocialPlatform): Promise<SocialPreview> {
    const titleSlide = slides.find(s => s.type === 'title') || slides[0];
    const contentSlides = slides.filter(s => s.type === 'content');
    
    const charLimits = {
      linkedin: 3000,
      twitter: 280,
      instagram: 2200,
      facebook: 63206
    };
    
    const keyPoints = contentSlides
      .flatMap(s => s.content.bullets || [])
      .slice(0, 5)
      .map(b => `✅ ${b}`)
      .join('\n');
    
    const description = platform === 'twitter'
      ? `${titleSlide.title}\n\n${keyPoints.slice(0, 200)}`
      : `${titleSlide.title}\n\n${titleSlide.subtitle || ''}\n\n${keyPoints}`;
    
    const hashtags = this.generateHashtags(slides, platform);
    
    return {
      platform,
      title: titleSlide.title,
      description: description.slice(0, charLimits[platform]),
      hashtags,
      imageUrl: titleSlide.image?.url,
      characterCount: description.length
    };
  }
  
  /**
   * Generate hashtags from content
   */
  private generateHashtags(slides: GeneratedSlide[], platform: SocialPlatform): string[] {
    const topics = slides
      .map(s => s.metadata?.topic)
      .filter(Boolean) as string[];
    
    const baseHashtags = ['AI', 'Innovation', 'Presentation'];
    const topicHashtags = topics
      .slice(0, 5)
      .map(t => t.replace(/\s+/g, ''));
    
    const hashtagCount = platform === 'instagram' ? 15 : platform === 'linkedin' ? 5 : 3;
    
    return [...new Set([...topicHashtags, ...baseHashtags])]
      .slice(0, hashtagCount)
      .map(h => `#${h}`);
  }
  
  /**
   * Download presentation as PPTX
   */
  async downloadAsPPTX(slides: GeneratedSlide[], title: string): Promise<Blob> {
    const pptx = new pptxgen();
    pptx.title = title;
    pptx.author = 'Genie AI';
    pptx.subject = 'AI-Generated Presentation';
    
    // Color scheme
    const colors = {
      primary: '8b5cf6',
      secondary: '3b82f6',
      dark: '1e293b',
      light: 'f8fafc',
      accent: '22c55e'
    };
    
    for (const slide of slides) {
      const pptSlide = pptx.addSlide();
      
      // Background based on slide type
      if (slide.type === 'title' || slide.type === 'section') {
        pptSlide.addShape('rect', {
          x: 0, y: 0, w: '100%', h: '100%',
          fill: { type: 'solid', color: '0f172a' }
        });
      }
      
      // Title
      pptSlide.addText(slide.title, {
        x: 0.5, y: slide.type === 'title' ? 2 : 0.3,
        w: '90%', h: slide.type === 'title' ? 1 : 0.6,
        fontSize: slide.type === 'title' ? 44 : 28,
        bold: true,
        color: slide.type === 'title' || slide.type === 'section' ? 'ffffff' : colors.dark,
        align: 'center'
      });
      
      // Subtitle
      if (slide.subtitle) {
        pptSlide.addText(slide.subtitle, {
          x: 0.5, y: slide.type === 'title' ? 3.2 : 0.9,
          w: '90%', h: 0.5,
          fontSize: slide.type === 'title' ? 22 : 14,
          color: slide.type === 'title' ? colors.primary : '64748b',
          align: 'center'
        });
      }
      
      // Content based on type
      if (slide.content.bullets && slide.content.bullets.length > 0) {
        slide.content.bullets.forEach((bullet, idx) => {
          pptSlide.addText(`• ${bullet}`, {
            x: 0.5, y: 1.4 + (idx * 0.5),
            w: '85%', h: 0.45,
            fontSize: 16,
            color: colors.dark
          });
        });
      }
      
      if (slide.content.stats && slide.content.stats.length > 0) {
        slide.content.stats.forEach((stat, idx) => {
          const xPos = 0.5 + (idx * 3);
          pptSlide.addText(stat.value, {
            x: xPos, y: 2,
            w: 2.5, h: 0.8,
            fontSize: 36, bold: true,
            color: colors.primary,
            align: 'center'
          });
          pptSlide.addText(stat.label, {
            x: xPos, y: 2.8,
            w: 2.5, h: 0.4,
            fontSize: 14,
            color: colors.dark,
            align: 'center'
          });
        });
      }
      
      // Add image if present
      if (slide.image?.base64) {
        try {
          pptSlide.addImage({
            data: slide.image.base64,
            x: 5.5, y: 1.5,
            w: 4, h: 3,
            sizing: { type: 'contain', w: 4, h: 3 }
          });
        } catch (e) {
          console.warn('Failed to add image to slide:', e);
        }
      }
      
      // Speaker notes
      if (slide.speakerNotes) {
        pptSlide.addNotes(slide.speakerNotes);
      }
      
      // Footer
      pptSlide.addText('Generated by Genie AI', {
        x: 0.5, y: 5.2,
        w: 3, h: 0.25,
        fontSize: 9,
        color: '94a3b8'
      });
      
      // Slide number
      pptSlide.addText(`${slide.slideNumber}/${slides.length}`, {
        x: 8.8, y: 0.15,
        w: 0.8, h: 0.35,
        fontSize: 10,
        color: 'ffffff',
        fill: { color: colors.primary },
        align: 'center'
      });
    }
    
    return await pptx.write({ outputType: 'blob' }) as Blob;
  }
  
  // ============================================
  // UTILITY METHODS
  // ============================================
  
  private getSlideCount(length: PresentationLength): { min: number; max: number } {
    switch (length) {
      case 'short': return { min: 5, max: 8 };
      case 'standard': return { min: 10, max: 15 };
      case 'long': return { min: 18, max: 25 };
      default: return { min: 10, max: 15 };
    }
  }
  
  private getImageType(slideType: string): GeneratedImage['type'] {
    switch (slideType) {
      case 'title': return 'hero';
      case 'infographic': return 'infographic';
      case 'stats': return 'chart';
      default: return 'illustration';
    }
  }
  
  private parseAIResponse(response: string): any {
    try {
      if (typeof response === 'object') return response;
      
      // Try to extract JSON from response
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
      return { rawContent: response };
    } catch {
      return { rawContent: response };
    }
  }
  
  private parseSlideStructure(response: string): GeneratedSlide[] {
    try {
      const parsed = this.parseAIResponse(response);
      const slides = Array.isArray(parsed) ? parsed : parsed.slides || [];
      
      return slides.map((s: any, idx: number) => ({
        id: `slide-${idx + 1}`,
        slideNumber: s.slideNumber || idx + 1,
        type: s.type || 'content',
        title: s.title || `Slide ${idx + 1}`,
        subtitle: s.subtitle,
        content: {
          type: s.content?.type || 'bullets',
          bullets: s.content?.bullets || [],
          stats: s.content?.stats || [],
          journeySteps: s.content?.journeySteps || [],
          paragraphs: s.content?.paragraphs || []
        },
        speakerNotes: s.speakerNotes,
        metadata: {
          topic: s.metadata?.topic,
          importance: s.metadata?.importance || 'medium',
          imagePrompt: s.imagePrompt
        }
      }));
    } catch (error) {
      console.error('[PresentationService] Failed to parse slides:', error);
      return [];
    }
  }
  
  private getEmptyMetadata(request: PresentationRequest) {
    return {
      title: 'Untitled',
      totalSlides: 0,
      estimatedDuration: 0,
      generatedAt: new Date().toISOString(),
      inputSource: request.inputSource,
      outputFormat: request.outputFormat,
      imagesGenerated: 0
    };
  }
}

// Helper interface
interface ExtractedPresentationContent {
  title: string;
  subtitle?: string;
  topics: string[];
  sections: {
    heading: string;
    content: string;
    keyPoints?: string[];
    type?: string;
  }[];
  statistics?: { value: string; label: string }[];
  journeySteps?: { title: string; description: string }[];
  rawContent: string;
  sourceImage?: string;
}

// Export singleton instance
export const universalPresentationService = new UniversalPresentationService();
export default universalPresentationService;
