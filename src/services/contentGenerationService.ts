/**
 * CONTENT GENERATION SERVICE
 * 
 * Connects Composition Studio templates to real AI generation pipelines.
 * Uses ai-universal-processor edge function for actual content generation.
 * 
 * This service:
 * - Converts template chapters to generation requests
 * - Calls appropriate AI providers based on content type
 * - Handles progress tracking and error recovery
 * - Supports multi-language generation with regional TTS routing
 */

import { supabase } from '@/integrations/supabase/client';
import { 
  OUTPUT_FORMAT_PIPELINE_MAPPING, 
  INDUSTRY_TEMPLATES, 
  type OutputFormat,
  type IndustryTemplateConfig 
} from '@/config/content-generation-pipeline';

// Full visual types covering all 21 pipeline categories
export type VisualType = 
  // Core Video (Vibe)
  | 'avatar' | 'video' | 'animation' | 'static' | 'screen_recording'
  // Extended Video
  | 'talking_head' | 'podcast' | 'reel' | 'shorts' | 'story'
  // 3D & Immersive (Deck)
  | '3d' | 'product_showcase' | 'vr' | '360_video' | 'immersive'
  // Presentation (Deck)
  | 'ppt' | 'slides' | 'deck' | 'infographic'
  // Audio (Mind)
  | 'tts' | 'music' | 'sfx' | 'dubbed'
  // Distribution (Cast)
  | 'thumbnail' | 'social' | 'kinetic_text'
  // Custom
  | 'custom';

export interface GenerationRequest {
  templateId: string;
  chapterIndex: number;
  language: string;
  outputFormat: OutputFormat;
  scriptContent?: string;
  visualType: VisualType;
  duration: number;
  userTier?: string;
  // Extended options for specific pipelines
  pipelineCategory?: string;
  regenerationTarget?: string;
  preserveAudio?: boolean;
  preserveVisual?: boolean;
  voiceProvider?: string;
  targetLanguages?: string[];
}

export interface GenerationResult {
  success: boolean;
  previewUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  error?: string;
  scriptContent?: string;
  sceneDescription?: string;
  metadata?: {
    provider: string;
    model: string;
    processingTime: number;
  };
}

export interface GenerationProgress {
  chapterId: string;
  language: string;
  status: 'pending' | 'generating' | 'complete' | 'error';
  progress: number;
  message?: string;
}

type ProgressCallback = (progress: GenerationProgress) => void;

/**
 * Main content generation service class
 */
// ID mapping from TemplatePreviewDialog to INDUSTRY_TEMPLATES
const TEMPLATE_ID_MAP: Record<string, string> = {
  // Original 4 templates map to closest industry templates
  'hero': 'saudi_transformation',
  'product': 'healthcare_ai_diagnostics',
  'tutorial': 'edtech_personalized_learning',
  'testimonial': 'fintech_inclusive_banking',
  // Regional/dialect template
  'dialect_demo_unified': 'india_digital_india',
  // Industry templates - dialog ID → config ID
  'industry_showcase': 'japan_manufacturing_4',
  'success_story': 'uae_smart_city',
  'explore_preview': 'saudi_transformation',
  // Industry-specific - these already match naming pattern
  'industry_saudi_vision': 'saudi_transformation',
  'industry_india_digital': 'india_digital_india',
  'industry_healthcare_ai': 'healthcare_ai_diagnostics',
  'industry_fintech_africa': 'fintech_inclusive_banking',
  'industry_japan_manufacturing': 'japan_manufacturing_4',
  'industry_edtech': 'edtech_personalized_learning',
};

class ContentGenerationService {
  private baseUrl: string;
  
  constructor() {
    // Get Supabase URL from the client config
    this.baseUrl = 'https://ithspbabhmdntioslfqe.supabase.co/functions/v1';
  }

  /**
   * Get the template configuration by ID
   * Supports both TEMPLATE_DEFINITIONS IDs and INDUSTRY_TEMPLATES IDs
   */
  getTemplateConfig(templateId: string): IndustryTemplateConfig | undefined {
    // First try direct match
    let template = INDUSTRY_TEMPLATES.find(t => t.id === templateId);
    if (template) return template;
    
    // Try mapped ID
    const mappedId = TEMPLATE_ID_MAP[templateId];
    if (mappedId) {
      template = INDUSTRY_TEMPLATES.find(t => t.id === mappedId);
      if (template) {
        console.log(`[ContentGeneration] Mapped template ID: ${templateId} → ${mappedId}`);
        return template;
      }
    }
    
    // Fallback: use first template as default for unknown IDs
    console.warn(`[ContentGeneration] Template not found: ${templateId}, using default`);
    return INDUSTRY_TEMPLATES[0];
  }

  /**
   * Generate content for a single chapter
   */
  async generateChapter(
    request: GenerationRequest,
    onProgress?: ProgressCallback
  ): Promise<GenerationResult> {
    const template = this.getTemplateConfig(request.templateId);
    if (!template) {
      return { success: false, error: `Template not found: ${request.templateId}` };
    }

    const chapter = template.chapters[request.chapterIndex];
    if (!chapter) {
      return { success: false, error: `Chapter not found at index: ${request.chapterIndex}` };
    }

    const chapterId = `${request.templateId}-${request.chapterIndex}`;
    
    // Report starting
    onProgress?.({
      chapterId,
      language: request.language,
      status: 'generating',
      progress: 0,
      message: `Starting ${chapter.title}...`
    });

    try {
      // Get the pipeline categories for this output format
      const pipelines = OUTPUT_FORMAT_PIPELINE_MAPPING[request.outputFormat] || [];
      
      // Build the generation prompt based on chapter type
      const generationPrompt = this.buildGenerationPrompt(chapter, template, request.language);
      
      // Report progress
      onProgress?.({
        chapterId,
        language: request.language,
        status: 'generating',
        progress: 20,
        message: `Preparing ${chapter.type} content...`
      });

      // Call the appropriate AI processor based on chapter type
      const result = await this.callAIProcessor({
        chapterType: chapter.type,
        prompt: generationPrompt,
        language: request.language,
        duration: chapter.duration,
        pipelines,
        userTier: request.userTier
      });

      if (!result.success) {
        onProgress?.({
          chapterId,
          language: request.language,
          status: 'error',
          progress: 0,
          message: result.error
        });
        return result;
      }

      // Report completion
      onProgress?.({
        chapterId,
        language: request.language,
        status: 'complete',
        progress: 100,
        message: `${chapter.title} generated successfully`
      });

      return {
        success: true,
        previewUrl: result.previewUrl,
        thumbnailUrl: result.thumbnailUrl,
        duration: chapter.duration,
        metadata: result.metadata
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      onProgress?.({
        chapterId,
        language: request.language,
        status: 'error',
        progress: 0,
        message: errorMessage
      });

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Generate all chapters for a template
   */
  async generateTemplate(
    templateId: string,
    languages: string[],
    outputFormat: OutputFormat,
    onProgress?: (overall: number, current: GenerationProgress) => void,
    userTier?: string
  ): Promise<{ success: boolean; results: GenerationResult[]; errors: string[] }> {
    const template = this.getTemplateConfig(templateId);
    if (!template) {
      return { success: false, results: [], errors: [`Template not found: ${templateId}`] };
    }

    const results: GenerationResult[] = [];
    const errors: string[] = [];
    const totalTasks = template.chapters.length * languages.length;
    let completedTasks = 0;

    for (const [chapterIndex, chapter] of template.chapters.entries()) {
      for (const language of languages) {
        const request: GenerationRequest = {
          templateId,
          chapterIndex,
          language,
          outputFormat,
          visualType: chapter.type,
          duration: chapter.duration,
          userTier
        };

        const result = await this.generateChapter(request, (progress) => {
          const overallProgress = Math.round(
            ((completedTasks + (progress.progress / 100)) / totalTasks) * 100
          );
          onProgress?.(overallProgress, progress);
        });

        results.push(result);
        if (!result.success && result.error) {
          errors.push(`${chapter.title} (${language}): ${result.error}`);
        }

        completedTasks++;
      }
    }

    return {
      success: errors.length === 0,
      results,
      errors
    };
  }

  /**
   * Build generation prompt based on chapter configuration
   */
  private buildGenerationPrompt(
    chapter: IndustryTemplateConfig['chapters'][0],
    template: IndustryTemplateConfig,
    language: string
  ): string {
    return `
Generate ${chapter.type} content for: "${chapter.title}"

Context: ${template.narrative}
Industry: ${template.industry}
Region: ${template.region}
Target Language: ${language}

Visual Instructions: ${chapter.scriptPrompt}

Duration: ${chapter.duration} seconds

Requirements:
- Match the ${template.region} regional aesthetic and cultural context
- Optimize for ${language} language narration
- Maintain professional quality suitable for ${template.industry} sector
- Create engaging content that supports the narrative: "${template.narrative}"
    `.trim();
  }

  /**
   * Call the AI processor edge function
   */
  private async callAIProcessor(params: {
    chapterType: string;
    prompt: string;
    language: string;
    duration: number;
    pipelines: string[];
    userTier?: string;
  }): Promise<GenerationResult> {
    try {
      // Determine the best provider based on chapter type
      const provider = this.selectProvider(params.chapterType);
      const model = this.selectModel(params.chapterType, provider);

      console.log(`[ContentGeneration] Calling ai-universal-processor - Type: ${params.chapterType}, Provider: ${provider}, Model: ${model}`);

      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          provider,
          model,
          prompt: params.prompt,
          systemPrompt: `You are a content generation assistant specialized in creating ${params.chapterType} content for professional presentations. Generate detailed, engaging content in ${params.language}.`,
          temperature: 0.7,
          maxTokens: 2000,
          action: 'generate_content',
          context: {
            contentType: params.chapterType,
            duration: params.duration,
            pipelines: params.pipelines,
            language: params.language
          },
          userTier: params.userTier || 'free'
        }
      });

      if (error) {
        console.error('[ContentGeneration] Edge function error:', error);
        return { success: false, error: error.message };
      }

      // Extract script and scene data from response
      const scriptContent = data?.content?.script || data?.script || '';
      const sceneDescription = data?.content?.sceneDescription || data?.sceneDescription || '';
      
      // Generate preview URL - use returned URL or create a rich placeholder with actual content
      const previewUrl = data?.imageUrl || data?.videoUrl || this.generateContentPlaceholder(params.chapterType, params.language, scriptContent);

      console.log(`[ContentGeneration] Generated content for ${params.chapterType}:`, {
        hasScript: !!scriptContent,
        hasScene: !!sceneDescription,
        previewUrl: previewUrl?.substring(0, 50) + '...'
      });

      return {
        success: true,
        previewUrl,
        thumbnailUrl: previewUrl,
        duration: params.duration,
        scriptContent,
        sceneDescription,
        metadata: {
          provider: data?.provider || provider,
          model: data?.model || model,
          processingTime: Date.now()
        }
      };

    } catch (error) {
      console.error('[ContentGeneration] Processing error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process content' 
      };
    }
  }

  /**
   * Generate a content placeholder with actual generated data
   * Extended to cover all 21 pipeline categories
   */
  private generateContentPlaceholder(chapterType: string, language: string, script?: string): string {
    // Full color mapping for all visual types
    const colors: Record<string, { bg: string; fg: string; label: string }> = {
      // Core Video (Vibe)
      avatar: { bg: '6366f1', fg: 'ffffff', label: 'Avatar' },
      video: { bg: 'ec4899', fg: 'ffffff', label: 'Video' },
      animation: { bg: 'f59e0b', fg: '1f2937', label: 'Animation' },
      static: { bg: '10b981', fg: 'ffffff', label: 'Static' },
      screen_recording: { bg: '3b82f6', fg: 'ffffff', label: 'Screen Recording' },
      talking_head: { bg: '8b5cf6', fg: 'ffffff', label: 'Talking Head' },
      podcast: { bg: '14b8a6', fg: 'ffffff', label: 'Podcast' },
      reel: { bg: 'f43f5e', fg: 'ffffff', label: 'Reel' },
      shorts: { bg: 'ef4444', fg: 'ffffff', label: 'Shorts' },
      story: { bg: 'a855f7', fg: 'ffffff', label: 'Story' },
      // 3D & Immersive (Deck)
      '3d': { bg: '8b5cf6', fg: 'ffffff', label: '3D Model' },
      product_showcase: { bg: '7c3aed', fg: 'ffffff', label: '3D Showcase' },
      vr: { bg: '6d28d9', fg: 'ffffff', label: 'VR Scene' },
      '360_video': { bg: '5b21b6', fg: 'ffffff', label: '360° Video' },
      immersive: { bg: '4c1d95', fg: 'ffffff', label: 'Immersive' },
      // Presentation (Deck)
      ppt: { bg: 'ea580c', fg: 'ffffff', label: 'PowerPoint' },
      slides: { bg: 'f97316', fg: 'ffffff', label: 'Slides' },
      deck: { bg: 'fb923c', fg: '1f2937', label: 'Deck' },
      infographic: { bg: '0ea5e9', fg: 'ffffff', label: 'Infographic' },
      // Audio (Mind)
      tts: { bg: '22c55e', fg: 'ffffff', label: 'TTS Audio' },
      music: { bg: '16a34a', fg: 'ffffff', label: 'Music' },
      sfx: { bg: '15803d', fg: 'ffffff', label: 'Sound FX' },
      dubbed: { bg: '166534', fg: 'ffffff', label: 'Dubbed' },
      // Distribution (Cast)
      thumbnail: { bg: '0891b2', fg: 'ffffff', label: 'Thumbnail' },
      social: { bg: '0e7490', fg: 'ffffff', label: 'Social Post' },
      kinetic_text: { bg: 'fbbf24', fg: '1f2937', label: 'Kinetic Text' },
      custom: { bg: '64748b', fg: 'ffffff', label: 'Custom' },
    };
    
    const colorConfig = colors[chapterType] || colors.video;
    const label = `${colorConfig.label} - ${language.toUpperCase()}`;
    const preview = script ? script.substring(0, 40) + '...' : 'Content Generated';
    
    return `https://placehold.co/1920x1080/${colorConfig.bg}/${colorConfig.fg}?text=${encodeURIComponent(label)}%0A${encodeURIComponent(preview)}`;
  }

  /**
   * Select the best AI provider for the content type
   * Extended routing for all 21 pipeline categories
   */
  private selectProvider(chapterType: string): 'openai' | 'claude' | 'gemini' | 'modelslab' | 'elevenlabs' {
    // Map content types to optimal providers
    const providerMap: Record<string, 'openai' | 'claude' | 'gemini' | 'modelslab' | 'elevenlabs'> = {
      // Avatar & Video - Gemini for prompts, execution via dedicated services
      avatar: 'gemini',
      talking_head: 'gemini',
      video: 'gemini',
      animation: 'gemini',
      reel: 'gemini',
      shorts: 'gemini',
      story: 'gemini',
      screen_recording: 'gemini',
      // 3D & Immersive - ModelsLab
      '3d': 'modelslab',
      product_showcase: 'modelslab',
      vr: 'modelslab',
      '360_video': 'modelslab',
      immersive: 'modelslab',
      // Static Images - OpenAI DALL-E
      static: 'openai',
      thumbnail: 'openai',
      infographic: 'openai',
      // Audio - ElevenLabs
      tts: 'elevenlabs',
      music: 'gemini', // Prompt generation, execution via Suno
      sfx: 'gemini',
      dubbed: 'elevenlabs',
      podcast: 'elevenlabs',
      // Presentation - Gemini for content, Claude for structured
      ppt: 'gemini',
      slides: 'gemini',
      deck: 'gemini',
      // Social & Text
      social: 'gemini',
      kinetic_text: 'gemini',
      // Default
      custom: 'gemini',
    };
    
    return providerMap[chapterType] || 'gemini';
  }

  /**
   * Select the best model for the content type and provider
   * Extended for all pipeline categories
   */
  private selectModel(chapterType: string, provider: string): string {
    const modelMap: Record<string, Record<string, string>> = {
      gemini: {
        avatar: 'gemini-2.0-flash',
        video: 'gemini-2.0-flash',
        animation: 'gemini-2.0-flash',
        '3d': 'gemini-2.0-flash',
        ppt: 'gemini-2.0-flash',
        music: 'gemini-2.0-flash',
        default: 'gemini-2.0-flash'
      },
      openai: {
        static: 'dall-e-3',
        thumbnail: 'dall-e-3',
        infographic: 'dall-e-3',
        avatar: 'gpt-4o',
        video: 'gpt-4o',
        default: 'gpt-4o'
      },
      claude: {
        ppt: 'claude-3-5-sonnet-20241022',
        slides: 'claude-3-5-sonnet-20241022',
        default: 'claude-3-5-sonnet-20241022'
      },
      modelslab: {
        '3d': 'text-to-3d',
        product_showcase: 'text-to-3d',
        vr: 'text-to-3d',
        video: 'text-to-video',
        default: 'text-to-3d'
      },
      elevenlabs: {
        tts: 'eleven_multilingual_v2',
        dubbed: 'eleven_multilingual_v2',
        podcast: 'eleven_multilingual_v2',
        default: 'eleven_multilingual_v2'
      }
    };

    return modelMap[provider]?.[chapterType] || modelMap[provider]?.default || 'gemini-2.0-flash';
  }

  /**
   * Get edge function for specific pipeline category
   */
  private getEdgeFunctionForPipeline(pipelineCategory: string): string {
    const edgeFunctionMap: Record<string, string> = {
      // SPARK Categories
      'input-processing': 'document-processor',
      'script-generation': 'ai-universal-processor',
      'content-extraction': 'azure-form-recognizer',
      // MIND Categories
      'script-enhancement': 'enhance-script',
      'tts-generation': 'elevenlabs-voice',
      'music-generation': 'multi-provider-music',
      'translation': 'translation-service',
      // VIBE Categories
      'video-generation': 'ai-video-generator',
      'video-editing': 'pipeline-editor-processor',
      'audio-production': 'audio-mixer',
      'podcast-webcast': 'extract-video-audio',
      'avatar-lipsync': 'ai-video-generator',
      'dubbing': 'multi-language-audio-orchestrator',
      // DECK Categories
      'presentation': 'share-presentation',
      'visual-design': 'ai-image-generator',
      '3d-immersive': 'modelslab-media',
      // ARC Categories
      'scheduling': 'calendar-sync',
      'collaboration': 'workspace-collaboration',
      // CAST Categories
      'distribution': 'social-publish',
      'marketing': 'marketing-auto-scheduler',
      'analytics': 'analytics-dashboard',
    };
    return edgeFunctionMap[pipelineCategory] || 'ai-universal-processor';
  }

  /**
   * Generate a placeholder URL for development/testing
   */
  private generatePlaceholderUrl(chapterType: string): string {
    const baseUrl = 'https://placehold.co';
    const sizes: Record<string, string> = {
      avatar: '1920x1080/6366f1/ffffff?text=Avatar+Preview',
      '3d': '1920x1080/8b5cf6/ffffff?text=3D+Showcase',
      video: '1920x1080/ec4899/ffffff?text=Video+Preview',
      animation: '1920x1080/f59e0b/ffffff?text=Animation',
      static: '1920x1080/10b981/ffffff?text=Static+Content',
      screen_recording: '1920x1080/3b82f6/ffffff?text=Screen+Recording',
      ppt: '1920x1080/ea580c/ffffff?text=PowerPoint',
      podcast: '1920x1080/14b8a6/ffffff?text=Podcast',
      reel: '1920x1080/f43f5e/ffffff?text=Reel',
      vr: '1920x1080/6d28d9/ffffff?text=VR+Scene',
      tts: '1920x1080/22c55e/ffffff?text=TTS+Audio',
      music: '1920x1080/16a34a/ffffff?text=Music',
      thumbnail: '1920x1080/0891b2/ffffff?text=Thumbnail',
    };
    return `${baseUrl}/${sizes[chapterType] || sizes.video}`;
  }

  /**
   * Check if the generation service is available
   */
  async healthCheck(): Promise<{ available: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: { action: 'health_check' }
      });

      if (error) {
        return { available: false, error: error.message };
      }

      return { available: data?.ok || data?.available || false };
    } catch (error) {
      return { 
        available: false, 
        error: error instanceof Error ? error.message : 'Health check failed' 
      };
    }
  }
}

// Export singleton instance
export const contentGenerationService = new ContentGenerationService();

// Export utility functions
export const generateChapter = (
  request: GenerationRequest, 
  onProgress?: ProgressCallback
) => contentGenerationService.generateChapter(request, onProgress);

export const generateTemplate = (
  templateId: string,
  languages: string[],
  outputFormat: OutputFormat,
  onProgress?: (overall: number, current: GenerationProgress) => void,
  userTier?: string
) => contentGenerationService.generateTemplate(templateId, languages, outputFormat, onProgress, userTier);

export const checkGenerationHealth = () => contentGenerationService.healthCheck();
