/**
 * Agent-based Presentation Generator Service
 * 
 * Implements a full agent architecture for:
 * - Real-time slide streaming as content generates
 * - Multi-language parallel agent execution
 * - AI content-type decision making (images, infographics, journey maps, tables)
 * - Per-language model selection
 * - Database persistence with language suffix naming
 */

import { supabase } from '@/integrations/supabase/client';
import { GeneratedSlide, PresentationRequest, CollateralType } from './universalPresentationService';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface ContentTypeDecision {
  slideNumber: number;
  contentType: 'image' | 'infographic' | 'journey_map' | 'table' | 'chart' | 'quote' | 'stats' | 'text_only';
  confidence: number;
  reasoning: string;
  alternativeType?: string;
  alternativeConfidence?: number;
}

export interface AgentTask {
  id: string;
  versionId: string;
  agentType: 'slide_generator' | 'image_generator' | 'translator' | 'voiceover' | 'content_analyzer';
  agentName: string;
  taskType: 'content' | 'image' | 'translate' | 'voiceover' | 'analyze';
  slideNumber?: number;
  languageCode: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  progress: number;
  inputData: Record<string, any>;
  outputData: Record<string, any>;
  contentTypeDecision?: ContentTypeDecision;
  modelProvider?: string;
  modelName?: string;
  startedAt?: Date;
  completedAt?: Date;
  durationMs?: number;
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
}

export interface LanguageModelConfig {
  languageCode: string;
  textModel: string;
  imageModel: string;
  voiceModel?: string;
  voiceId?: string;
}

export interface PresentationVersion {
  id: string;
  presentationId: string;
  userId: string;
  languageCode: string;
  isPrimary: boolean;
  slidesData: GeneratedSlide[];
  thumbnails: string[];
  modelConfig: LanguageModelConfig;
  status: 'pending' | 'generating' | 'complete' | 'error';
  generationProgress: number;
  currentSlide: number;
  totalSlides: number;
  contentDecisions: ContentTypeDecision[];
  confidenceScores: {
    overall: number;
    slides: Array<{ slideNumber: number; score: number; issues: string[] }>;
  };
  fileName: string;
  downloadUrl?: string;
  thumbnailUrl?: string;
  voiceoverData?: {
    provider: string;
    voice: string;
    audioUrls: string[];
  };
  errorMessage?: string;
  generationStartedAt?: Date;
  generationCompletedAt?: Date;
}

export interface StreamingSlideUpdate {
  type: 'slide_started' | 'slide_content' | 'slide_image' | 'slide_complete' | 'slide_error';
  slideNumber: number;
  languageCode: string;
  data: Partial<GeneratedSlide>;
  contentDecision?: ContentTypeDecision;
  progress: number;
  timestamp: Date;
}

export interface AgentGenerationConfig {
  presentationId: string;
  userId: string;
  request: PresentationRequest;
  languages: string[];
  primaryLanguage: string;
  modelConfigs: LanguageModelConfig[];
  onSlideUpdate: (update: StreamingSlideUpdate) => void;
  onAgentStatusChange: (agentId: string, status: AgentTask['status'], progress: number) => void;
  onVersionComplete: (languageCode: string, version: PresentationVersion) => void;
  onError: (languageCode: string, error: string) => void;
}

// ============================================
// CONTENT TYPE DECISION ENGINE
// ============================================

const CONTENT_TYPE_RULES = {
  // Keywords that suggest specific content types
  journey_map: ['journey', 'process', 'workflow', 'step by step', 'stages', 'phases', 'lifecycle', 'onboarding', 'patient journey', 'customer journey'],
  infographic: ['statistics', 'data', 'metrics', 'numbers', 'percentage', 'growth', 'comparison', 'analysis', 'report', 'survey'],
  table: ['compare', 'versus', 'vs', 'features', 'pricing', 'options', 'plans', 'specifications', 'matrix'],
  chart: ['trend', 'over time', 'graph', 'performance', 'revenue', 'sales', 'market share', 'forecast'],
  stats: ['roi', 'kpi', 'improvement', 'increase', 'decrease', 'reduction', 'savings', 'efficiency'],
  quote: ['said', 'according to', 'testimonial', 'feedback', 'review', 'expert', 'quote'],
  image: ['visual', 'illustration', 'example', 'showcase', 'demonstrate', 'product', 'team', 'office'],
};

export function analyzeContentTypeForSlide(
  slideContent: string,
  slideType: string,
  collateralType: CollateralType,
  userPreferences: {
    includeInfographics: boolean;
    includeJourneyMaps: boolean;
    imageStyles: string[];
  }
): ContentTypeDecision {
  const content = slideContent.toLowerCase();
  const scores: Record<string, number> = {
    image: 0.5, // Default base score
    infographic: 0,
    journey_map: 0,
    table: 0,
    chart: 0,
    stats: 0,
    quote: 0,
    text_only: 0.3,
  };

  // Score based on keywords
  for (const [type, keywords] of Object.entries(CONTENT_TYPE_RULES)) {
    for (const keyword of keywords) {
      if (content.includes(keyword)) {
        scores[type] += 0.15;
      }
    }
  }

  // Boost based on user preferences
  if (userPreferences.includeInfographics) {
    scores.infographic += 0.2;
    scores.chart += 0.15;
    scores.stats += 0.15;
  }
  
  if (userPreferences.includeJourneyMaps) {
    scores.journey_map += 0.25;
  }

  // Collateral type influences
  const collateralBoosts: Record<CollateralType, Record<string, number>> = {
    'investor': { chart: 0.3, stats: 0.3, table: 0.2 },
    'sales': { stats: 0.25, image: 0.2, table: 0.15 },
    'training': { journey_map: 0.25, infographic: 0.2, table: 0.15 },
    'marketing': { image: 0.3, infographic: 0.2, quote: 0.15 },
    'product-launch': { image: 0.25, stats: 0.2, infographic: 0.2 },
    'case-study': { stats: 0.25, chart: 0.2, quote: 0.2 },
    'whitepaper': { chart: 0.25, table: 0.2, infographic: 0.2 },
    'conference': { image: 0.25, stats: 0.2, quote: 0.15 },
    'presentation': { image: 0.2, stats: 0.15, infographic: 0.15 },
    'website': { image: 0.3, infographic: 0.2, stats: 0.15 },
  };

  const boosts = collateralBoosts[collateralType] || {};
  for (const [type, boost] of Object.entries(boosts)) {
    scores[type] += boost;
  }

  // Slide type influences
  if (slideType === 'stats') {
    scores.stats += 0.4;
    scores.chart += 0.2;
  } else if (slideType === 'journey') {
    scores.journey_map += 0.5;
  } else if (slideType === 'infographic') {
    scores.infographic += 0.4;
  } else if (slideType === 'title' || slideType === 'section') {
    scores.image += 0.3;
  }

  // Find best and alternative
  const sortedTypes = Object.entries(scores).sort(([, a], [, b]) => b - a);
  const [bestType, bestScore] = sortedTypes[0];
  const [altType, altScore] = sortedTypes[1] || [undefined, 0];

  // Normalize confidence (0-1)
  const confidence = Math.min(1, bestScore);

  // Generate reasoning
  const matchedKeywords = [];
  for (const [type, keywords] of Object.entries(CONTENT_TYPE_RULES)) {
    if (type === bestType) {
      for (const kw of keywords) {
        if (content.includes(kw)) matchedKeywords.push(kw);
      }
    }
  }

  let reasoning = `Selected ${bestType} based on`;
  if (matchedKeywords.length > 0) {
    reasoning += ` keywords: ${matchedKeywords.slice(0, 3).join(', ')}`;
  } else {
    reasoning += ` content analysis and ${collateralType} format preferences`;
  }

  return {
    slideNumber: 0, // Will be set by caller
    contentType: bestType as ContentTypeDecision['contentType'],
    confidence,
    reasoning,
    alternativeType: altType,
    alternativeConfidence: Math.min(1, altScore),
  };
}

// ============================================
// AGENT PRESENTATION GENERATOR SERVICE
// ============================================

class AgentPresentationGeneratorService {
  private activeAgents: Map<string, AbortController> = new Map();

  /**
   * Generate file name with language suffix
   */
  generateFileName(baseName: string, languageCode: string): string {
    const sanitized = baseName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 50);
    
    return `${sanitized}_${languageCode}.pptx`;
  }

  /**
   * Create presentation versions for all languages
   */
  async createVersions(
    presentationId: string,
    userId: string,
    languages: string[],
    primaryLanguage: string,
    modelConfigs: LanguageModelConfig[],
    baseName: string
  ): Promise<PresentationVersion[]> {
    const versions: PresentationVersion[] = [];

    for (const lang of languages) {
      const modelConfig = modelConfigs.find(c => c.languageCode === lang) || {
        languageCode: lang,
        textModel: 'google/gemini-3-flash-preview',
        imageModel: 'google/gemini-2.5-flash-image-preview',
      };

      const fileName = this.generateFileName(baseName, lang);
      const isPrimary = lang === primaryLanguage;

      // For now, create versions in memory since table may not exist yet
      const versionId = crypto.randomUUID();
      
      versions.push({
        id: versionId,
        presentationId,
        userId,
        languageCode: lang,
        isPrimary,
        slidesData: [],
        thumbnails: [],
        modelConfig: modelConfig as LanguageModelConfig,
        status: 'pending',
        generationProgress: 0,
        currentSlide: 0,
        totalSlides: 0,
        contentDecisions: [],
        confidenceScores: { overall: 0, slides: [] },
        fileName,
      });

    }

    return versions;
  }

  /**
   * Create agent task in database
   */
  async createAgentTask(task: Omit<AgentTask, 'id'>): Promise<AgentTask> {
    const { data, error } = await supabase
      .from('agent_generation_tasks')
      .insert({
        version_id: task.versionId,
        agent_type: task.agentType,
        agent_name: task.agentName,
        task_type: task.taskType,
        slide_number: task.slideNumber,
        language_code: task.languageCode,
        status: task.status,
        progress: task.progress,
        input_data: task.inputData,
        output_data: task.outputData,
        content_type_decision: task.contentTypeDecision?.contentType,
        decision_confidence: task.contentTypeDecision?.confidence,
        decision_reasoning: task.contentTypeDecision?.reasoning,
        model_provider: task.modelProvider,
        model_name: task.modelName,
        retry_count: task.retryCount,
        max_retries: task.maxRetries,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      ...task,
      id: data.id,
    };
  }

  /**
   * Update agent task status
   */
  async updateAgentTask(
    taskId: string,
    updates: Partial<AgentTask>
  ): Promise<void> {
    const updateData: Record<string, any> = {};
    
    if (updates.status) updateData.status = updates.status;
    if (updates.progress !== undefined) updateData.progress = updates.progress;
    if (updates.outputData) updateData.output_data = updates.outputData;
    if (updates.errorMessage) updateData.error_message = updates.errorMessage;
    if (updates.startedAt) updateData.started_at = updates.startedAt.toISOString();
    if (updates.completedAt) updateData.completed_at = updates.completedAt.toISOString();
    if (updates.durationMs) updateData.duration_ms = updates.durationMs;

    await supabase
      .from('agent_generation_tasks')
      .update(updateData)
      .eq('id', taskId);
  }

  /**
   * Update presentation version
   */
  async updateVersion(
    versionId: string,
    updates: Partial<PresentationVersion>
  ): Promise<void> {
    const updateData: Record<string, any> = {};
    
    if (updates.status) updateData.status = updates.status;
    if (updates.generationProgress !== undefined) updateData.generation_progress = updates.generationProgress;
    if (updates.currentSlide !== undefined) updateData.current_slide = updates.currentSlide;
    if (updates.totalSlides !== undefined) updateData.total_slides = updates.totalSlides;
    if (updates.slidesData) updateData.slides_data = updates.slidesData;
    if (updates.thumbnails) updateData.thumbnails = updates.thumbnails;
    if (updates.contentDecisions) updateData.content_decisions = updates.contentDecisions;
    if (updates.confidenceScores) updateData.confidence_scores = updates.confidenceScores;
    if (updates.downloadUrl) updateData.download_url = updates.downloadUrl;
    if (updates.errorMessage) updateData.error_message = updates.errorMessage;
    if (updates.generationStartedAt) updateData.generation_started_at = updates.generationStartedAt.toISOString();
    if (updates.generationCompletedAt) updateData.generation_completed_at = updates.generationCompletedAt.toISOString();

    await supabase
      .from('presentation_versions')
      .update(updateData)
      .eq('id', versionId);
  }

  /**
   * Generate slide content with streaming
   */
  async generateSlideWithStreaming(
    slideNumber: number,
    totalSlides: number,
    request: PresentationRequest,
    languageCode: string,
    modelConfig: LanguageModelConfig,
    onUpdate: (update: StreamingSlideUpdate) => void
  ): Promise<{ slide: GeneratedSlide; contentDecision: ContentTypeDecision }> {
    const slideTypes = this.determineSlideTypes(totalSlides);
    const slideType = slideTypes[slideNumber - 1] || 'content';

    // Notify slide started
    onUpdate({
      type: 'slide_started',
      slideNumber,
      languageCode,
      data: { slideNumber, type: slideType as any },
      progress: ((slideNumber - 1) / totalSlides) * 100,
      timestamp: new Date(),
    });

    // Analyze content type decision
    const contentDecision = analyzeContentTypeForSlide(
      request.content,
      slideType,
      request.collateralType || 'presentation',
      {
        includeInfographics: request.includeInfographics || false,
        includeJourneyMaps: request.includeJourneyMaps || false,
        imageStyles: request.imageStyles || [],
      }
    );
    contentDecision.slideNumber = slideNumber;

    // Generate content via AI
    const languageInstruction = languageCode === 'en' 
      ? '' 
      : `Generate content in ${languageCode} language. `;

    const slidePrompt = `${languageInstruction}Create slide ${slideNumber} of ${totalSlides} for a ${request.collateralType} presentation.
Slide type: ${slideType}
Content type decision: ${contentDecision.contentType} (confidence: ${(contentDecision.confidence * 100).toFixed(0)}%)
Reasoning: ${contentDecision.reasoning}

Source content: ${request.content.slice(0, 1000)}

Respond with JSON:
{
  "title": "slide title",
  "subtitle": "optional subtitle",
  "bullets": ["point 1", "point 2", "point 3"],
  "speakerNotes": "notes for presenter",
  "imagePrompt": "prompt for AI image generation based on content type: ${contentDecision.contentType}"
}`;

    try {
      const { data: aiData, error: aiError } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          provider: 'gemini',
          model: modelConfig.textModel,
          systemPrompt: 'You are a presentation content expert. Generate compelling slide content.',
          prompt: slidePrompt,
        },
      });

      if (aiError) throw aiError;

      let slideData;
      try {
        const jsonMatch = aiData.response?.match(/\{[\s\S]*\}/);
        slideData = jsonMatch ? JSON.parse(jsonMatch[0]) : { title: 'Slide ' + slideNumber, bullets: [] };
      } catch {
        slideData = { title: 'Slide ' + slideNumber, bullets: [] };
      }

      // Create the slide
      const slide: GeneratedSlide = {
        id: `slide-${slideNumber}-${languageCode}`,
        slideNumber,
        type: slideType as any,
        title: slideData.title || `Slide ${slideNumber}`,
        subtitle: slideData.subtitle,
        content: {
          type: 'bullets',
          bullets: slideData.bullets || [],
        },
        speakerNotes: slideData.speakerNotes,
        metadata: {
          topic: request.collateralType,
          imagePrompt: slideData.imagePrompt,
        },
      };

      // Notify content ready
      onUpdate({
        type: 'slide_content',
        slideNumber,
        languageCode,
        data: slide,
        contentDecision,
        progress: ((slideNumber - 0.5) / totalSlides) * 100,
        timestamp: new Date(),
      });

      // Generate image if requested and content type supports it
      if (request.generateImages && ['image', 'infographic', 'journey_map'].includes(contentDecision.contentType)) {
        const imagePrompt = slideData.imagePrompt || `Professional ${contentDecision.contentType} for: ${slide.title}`;
        
        try {
          const { data: imageData } = await supabase.functions.invoke('ai-universal-processor', {
            body: {
              provider: 'gemini',
              model: modelConfig.imageModel,
              prompt: imagePrompt,
              task: 'image_generation',
            },
          });

          if (imageData?.imageUrl) {
            slide.image = {
              url: imageData.imageUrl,
              alt: slide.title,
              type: contentDecision.contentType === 'infographic' ? 'infographic' : 'illustration',
              prompt: imagePrompt,
            };

            onUpdate({
              type: 'slide_image',
              slideNumber,
              languageCode,
              data: { image: slide.image },
              progress: ((slideNumber - 0.25) / totalSlides) * 100,
              timestamp: new Date(),
            });
          }
        } catch (imgError) {
          console.warn(`[AgentGenerator] Image generation failed for slide ${slideNumber}:`, imgError);
        }
      }

      // Notify complete
      onUpdate({
        type: 'slide_complete',
        slideNumber,
        languageCode,
        data: slide,
        contentDecision,
        progress: (slideNumber / totalSlides) * 100,
        timestamp: new Date(),
      });

      return { slide, contentDecision };
    } catch (error) {
      onUpdate({
        type: 'slide_error',
        slideNumber,
        languageCode,
        data: {},
        progress: (slideNumber / totalSlides) * 100,
        timestamp: new Date(),
      });
      throw error;
    }
  }

  /**
   * Determine slide types based on total count
   */
  private determineSlideTypes(totalSlides: number): string[] {
    const types: string[] = ['title'];
    
    if (totalSlides <= 5) {
      for (let i = 1; i < totalSlides - 1; i++) types.push('content');
      types.push('conclusion');
    } else if (totalSlides <= 10) {
      types.push('section');
      for (let i = 2; i < totalSlides - 2; i++) {
        types.push(i % 3 === 0 ? 'stats' : 'content');
      }
      types.push('conclusion');
      types.push('cta');
    } else {
      types.push('section');
      for (let i = 2; i < totalSlides - 3; i++) {
        if (i % 5 === 0) types.push('journey');
        else if (i % 4 === 0) types.push('stats');
        else if (i % 3 === 0) types.push('section');
        else types.push('content');
      }
      types.push('infographic');
      types.push('conclusion');
      types.push('cta');
    }
    
    return types.slice(0, totalSlides);
  }

  /**
   * Generate presentation for a single language with real-time streaming
   */
  async generateForLanguage(
    version: PresentationVersion,
    request: PresentationRequest,
    onUpdate: (update: StreamingSlideUpdate) => void,
    onComplete: (languageCode: string, version: PresentationVersion) => void,
    onError: (languageCode: string, error: string) => void
  ): Promise<void> {
    const abortController = new AbortController();
    this.activeAgents.set(version.id, abortController);

    try {
      // Update version to generating
      await this.updateVersion(version.id, {
        status: 'generating',
        generationStartedAt: new Date(),
      });

      // Determine slide count
      const lengthMap = { short: 6, standard: 12, long: 20 };
      const totalSlides = lengthMap[request.length] || 10;

      await this.updateVersion(version.id, { totalSlides });

      const slides: GeneratedSlide[] = [];
      const contentDecisions: ContentTypeDecision[] = [];
      const confidenceSlides: Array<{ slideNumber: number; score: number; issues: string[] }> = [];

      // Generate slides sequentially with streaming updates
      for (let i = 1; i <= totalSlides; i++) {
        if (abortController.signal.aborted) break;

        await this.updateVersion(version.id, {
          currentSlide: i,
          generationProgress: Math.round((i / totalSlides) * 100),
        });

        const { slide, contentDecision } = await this.generateSlideWithStreaming(
          i,
          totalSlides,
          request,
          version.languageCode,
          version.modelConfig,
          onUpdate
        );

        slides.push(slide);
        contentDecisions.push(contentDecision);
        confidenceSlides.push({
          slideNumber: i,
          score: Math.round(contentDecision.confidence * 100),
          issues: contentDecision.confidence < 0.7 ? ['Low confidence - consider reviewing'] : [],
        });

        // Update version with new slide
        await this.updateVersion(version.id, {
          slidesData: slides,
          contentDecisions,
        });
      }

      // Calculate overall confidence
      const overallConfidence = Math.round(
        confidenceSlides.reduce((sum, s) => sum + s.score, 0) / confidenceSlides.length
      );

      // Mark complete
      const completedVersion: PresentationVersion = {
        ...version,
        status: 'complete',
        slidesData: slides,
        contentDecisions,
        confidenceScores: { overall: overallConfidence, slides: confidenceSlides },
        generationProgress: 100,
        generationCompletedAt: new Date(),
      };

      await this.updateVersion(version.id, {
        status: 'complete',
        generationProgress: 100,
        generationCompletedAt: new Date(),
        confidenceScores: completedVersion.confidenceScores,
      });

      onComplete(version.languageCode, completedVersion);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Generation failed';
      
      await this.updateVersion(version.id, {
        status: 'error',
        errorMessage,
      });

      onError(version.languageCode, errorMessage);
    } finally {
      this.activeAgents.delete(version.id);
    }
  }

  /**
   * Generate presentations for multiple languages in parallel
   */
  async generateMultiLanguage(config: AgentGenerationConfig): Promise<void> {
    console.log('[AgentGenerator] Starting multi-language generation:', {
      languages: config.languages,
      primaryLanguage: config.primaryLanguage,
    });

    // Create versions for all languages
    const versions = await this.createVersions(
      config.presentationId,
      config.userId,
      config.languages,
      config.primaryLanguage,
      config.modelConfigs,
      config.request.title || 'presentation'
    );

    // Sort to process primary language first
    const sortedVersions = versions.sort((a, b) => {
      if (a.isPrimary) return -1;
      if (b.isPrimary) return 1;
      return 0;
    });

    // Process primary language first (blocking), then others in parallel
    const primaryVersion = sortedVersions[0];
    const secondaryVersions = sortedVersions.slice(1);

    // Generate primary language with streaming
    await this.generateForLanguage(
      primaryVersion,
      config.request,
      config.onSlideUpdate,
      config.onVersionComplete,
      config.onError
    );

    // Generate secondary languages in parallel (background)
    if (secondaryVersions.length > 0) {
      Promise.all(
        secondaryVersions.map(version =>
          this.generateForLanguage(
            version,
            config.request,
            config.onSlideUpdate,
            config.onVersionComplete,
            config.onError
          )
        )
      ).catch(error => {
        console.error('[AgentGenerator] Background generation error:', error);
      });
    }
  }

  /**
   * Cancel generation for a version
   */
  cancelGeneration(versionId: string): void {
    const controller = this.activeAgents.get(versionId);
    if (controller) {
      controller.abort();
      this.activeAgents.delete(versionId);
    }
  }

  /**
   * Get all versions for a presentation
   */
  async getVersions(presentationId: string): Promise<PresentationVersion[]> {
    const { data, error } = await supabase
      .from('presentation_versions')
      .select('*')
      .eq('presentation_id', presentationId)
      .order('is_primary', { ascending: false });

    if (error) throw error;

    return (data || []).map(row => ({
      id: row.id,
      presentationId: row.presentation_id,
      userId: row.user_id,
      languageCode: row.language_code,
      isPrimary: row.is_primary,
      slidesData: (row.slides_data as any[]) || [],
      thumbnails: (row.thumbnails as string[]) || [],
      modelConfig: row.model_config as unknown as LanguageModelConfig,
      status: row.status as PresentationVersion['status'],
      generationProgress: row.generation_progress,
      currentSlide: row.current_slide,
      totalSlides: row.total_slides,
      contentDecisions: (row.content_decisions as unknown as ContentTypeDecision[]) || [],
      confidenceScores: row.confidence_scores as PresentationVersion['confidenceScores'],
      fileName: row.file_name,
      downloadUrl: row.download_url || undefined,
      thumbnailUrl: row.thumbnail_url || undefined,
      errorMessage: row.error_message || undefined,
      generationStartedAt: row.generation_started_at ? new Date(row.generation_started_at) : undefined,
      generationCompletedAt: row.generation_completed_at ? new Date(row.generation_completed_at) : undefined,
    }));
  }
}

export const agentPresentationGeneratorService = new AgentPresentationGeneratorService();
