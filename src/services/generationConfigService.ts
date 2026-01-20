/**
 * GENERATION CONFIG SERVICE
 * 
 * Bridges OutputTypeSettings with the generation pipeline.
 * Handles:
 * - Output type → render settings mapping
 * - Content fitting configuration
 * - Visual layer strategy (PNG + SVG overlay)
 * - Export format selection
 * - Slide/Chapter structure generation
 */

import { 
  OutputType, 
  OutputRenderSettings, 
  getOutputSlideTemplate, 
  getAvailableSlideTypes,
  SlideType,
  VisualLayerType,
  ExportFormat,
  OUTPUT_TYPE_CONFIGS
} from '@/components/genie-studio/presentation-generator/types';

// ============================================
// TYPES & INTERFACES
// ============================================

export type StructureMode = 'flat' | 'chapters';

export interface OutputTypeSettings {
  outputType: OutputType;
  structureMode: StructureMode;
  slideCount: number;           // For flat mode
  chapterCount: number;         // For chapter mode
  slidesPerChapter: number;     // For chapter mode
  includeVoiceover: boolean;
  includeMusic: boolean;
  animationIntensity: number;   // 0-100
  resolution: '720p' | '1080p' | '4k';
  aspectRatio: '16:9' | '4:3' | '9:16' | '1:1';
  duration?: number;            // For video (seconds)
}

export interface ContentFittingConfig {
  maxTitleLength: number;
  maxSubtitleLength: number;
  maxBulletsPerSlide: number;
  maxBulletLength: number;
  maxParagraphLength: number;
  autoTruncate: boolean;
  preserveKeyPoints: boolean;
}

export interface VisualRenderConfig {
  useHybridRendering: boolean;     // PNG + SVG overlay strategy
  generateTextFreeImages: boolean;  // Images without AI text artifacts
  svgOverlayEnabled: boolean;       // Editable SVG text layers
  supportedExportFormats: ExportFormat[];
  primaryFormat: ExportFormat;
  imageQuality: 'draft' | 'standard' | 'high' | 'ultra';
}

export interface SlideGenerationConfig {
  slideType: SlideType;
  chapterNumber?: number;
  slideNumber: number;
  role: 'opener' | 'content' | 'transition' | 'closer' | 'chapter';
  duration?: number;             // For video
  animationType?: string;        // For animated
  threeDConfig?: {
    sceneType: string;
    cameraPath: string;
    lighting: string;
    physics?: boolean;
    particleEffects?: boolean;
  };
  interactiveType?: string;      // For interactive
}

export interface ChapterGenerationConfig {
  chapterNumber: number;
  title: string;
  slides: SlideGenerationConfig[];
}

export interface GenerationPipelineConfig {
  outputType: OutputType;
  structureMode: StructureMode;
  
  // Structure
  totalSlides: number;
  chapters: ChapterGenerationConfig[];
  
  // Rendering
  render: OutputRenderSettings;
  visual: VisualRenderConfig;
  contentFitting: ContentFittingConfig;
  
  // Audio
  voiceover: {
    enabled: boolean;
    provider?: string;
    language?: string;
  };
  music: {
    enabled: boolean;
    style?: string;
  };
  
  // Animation
  animation: {
    intensity: number;
    type?: string;
  };
  
  // Available slide types for this output
  availableSlideTypes: SlideType[];
  
  // Provider info
  providers: string[];
  capabilities: string[];
}

// ============================================
// RESOLUTION MAPPING
// ============================================

const RESOLUTION_MAP: Record<string, { width: number; height: number }> = {
  '720p': { width: 1280, height: 720 },
  '1080p': { width: 1920, height: 1080 },
  '4k': { width: 3840, height: 2160 },
};

const ASPECT_RATIO_MAP: Record<string, { widthRatio: number; heightRatio: number }> = {
  '16:9': { widthRatio: 16, heightRatio: 9 },
  '4:3': { widthRatio: 4, heightRatio: 3 },
  '9:16': { widthRatio: 9, heightRatio: 16 },
  '1:1': { widthRatio: 1, heightRatio: 1 },
};

// ============================================
// CONTENT FITTING DEFAULTS
// ============================================

const DEFAULT_CONTENT_FITTING: ContentFittingConfig = {
  maxTitleLength: 60,
  maxSubtitleLength: 100,
  maxBulletsPerSlide: 6,
  maxBulletLength: 80,
  maxParagraphLength: 250,
  autoTruncate: true,
  preserveKeyPoints: true,
};

const VIDEO_CONTENT_FITTING: ContentFittingConfig = {
  maxTitleLength: 40,          // Shorter for readability
  maxSubtitleLength: 60,
  maxBulletsPerSlide: 4,        // Less dense for video
  maxBulletLength: 50,
  maxParagraphLength: 150,
  autoTruncate: true,
  preserveKeyPoints: true,
};

const INTERACTIVE_CONTENT_FITTING: ContentFittingConfig = {
  maxTitleLength: 50,
  maxSubtitleLength: 80,
  maxBulletsPerSlide: 5,
  maxBulletLength: 60,
  maxParagraphLength: 200,
  autoTruncate: true,
  preserveKeyPoints: true,
};

// ============================================
// VISUAL RENDER DEFAULTS
// ============================================

function getVisualRenderConfig(outputType: OutputType): VisualRenderConfig {
  const baseConfig: VisualRenderConfig = {
    useHybridRendering: true,
    generateTextFreeImages: true,
    svgOverlayEnabled: true,
    supportedExportFormats: ['png', 'svg', 'webp', 'pdf'],
    primaryFormat: 'png',
    imageQuality: 'high',
  };

  switch (outputType) {
    case '2d-static':
      return {
        ...baseConfig,
        supportedExportFormats: ['png', 'svg', 'webp', 'pdf'],
        primaryFormat: 'png',
      };
    
    case '2d-animated':
      return {
        ...baseConfig,
        supportedExportFormats: ['svg', 'webp', 'png'],
        primaryFormat: 'svg',
      };
    
    case '3d-scene':
    case '3d-animated':
      return {
        ...baseConfig,
        useHybridRendering: false, // 3D uses WebGL rendering
        svgOverlayEnabled: false,
        supportedExportFormats: ['png', 'webp'],
        primaryFormat: 'png',
        imageQuality: 'ultra',
      };
    
    case 'video-intro':
    case 'video-full':
      return {
        ...baseConfig,
        supportedExportFormats: ['png', 'webp'],
        primaryFormat: 'png',
      };
    
    case 'interactive':
      return {
        ...baseConfig,
        svgOverlayEnabled: true,
        supportedExportFormats: ['svg', 'png'],
        primaryFormat: 'svg',
      };
    
    case 'mixed':
      return {
        ...baseConfig,
        supportedExportFormats: ['png', 'svg', 'webp', 'pdf'],
        primaryFormat: 'png',
      };
    
    default:
      return baseConfig;
  }
}

// ============================================
// MAIN SERVICE
// ============================================

class GenerationConfigService {
  
  /**
   * Build complete generation pipeline config from OutputTypeSettings
   */
  buildPipelineConfig(settings: OutputTypeSettings): GenerationPipelineConfig {
    const template = getOutputSlideTemplate(settings.outputType);
    const outputConfig = OUTPUT_TYPE_CONFIGS.find(c => c.id === settings.outputType);
    
    // Calculate total slides
    const totalSlides = settings.structureMode === 'flat'
      ? settings.slideCount
      : settings.chapterCount * settings.slidesPerChapter;
    
    // Build chapter/slide structure
    const chapters = this.buildChapterStructure(settings, template.defaultStructure);
    
    // Get resolution
    const baseResolution = RESOLUTION_MAP[settings.resolution] || RESOLUTION_MAP['1080p'];
    const aspectRatio = ASPECT_RATIO_MAP[settings.aspectRatio] || ASPECT_RATIO_MAP['16:9'];
    
    // Adjust resolution for aspect ratio
    const resolution = this.adjustResolutionForAspectRatio(baseResolution, aspectRatio);
    
    // Build render settings
    const render: OutputRenderSettings = {
      ...template.renderSettings,
      resolution,
      quality: this.getQualityFromResolution(settings.resolution),
    };
    
    // Get content fitting config
    const contentFitting = this.getContentFittingConfig(settings.outputType);
    
    // Get visual render config
    const visual = getVisualRenderConfig(settings.outputType);
    
    return {
      outputType: settings.outputType,
      structureMode: settings.structureMode,
      totalSlides,
      chapters,
      render,
      visual,
      contentFitting,
      voiceover: {
        enabled: settings.includeVoiceover,
      },
      music: {
        enabled: settings.includeMusic,
      },
      animation: {
        intensity: settings.animationIntensity,
      },
      availableSlideTypes: getAvailableSlideTypes(settings.outputType),
      providers: outputConfig?.providers || [],
      capabilities: outputConfig?.capabilities || [],
    };
  }
  
  /**
   * Build chapter/slide structure from settings
   */
  private buildChapterStructure(
    settings: OutputTypeSettings, 
    defaultStructure: any[]
  ): ChapterGenerationConfig[] {
    const chapters: ChapterGenerationConfig[] = [];
    
    if (settings.structureMode === 'flat') {
      // Single "chapter" with all slides
      const slides = this.generateSlideConfigs(settings.slideCount, defaultStructure, 1);
      chapters.push({
        chapterNumber: 1,
        title: 'Main Content',
        slides,
      });
    } else {
      // Multiple chapters
      for (let c = 1; c <= settings.chapterCount; c++) {
        const slides = this.generateSlideConfigs(
          settings.slidesPerChapter, 
          defaultStructure, 
          c
        );
        chapters.push({
          chapterNumber: c,
          title: `Chapter ${c}`,
          slides,
        });
      }
    }
    
    return chapters;
  }
  
  /**
   * Generate slide configs for a chapter
   */
  private generateSlideConfigs(
    count: number, 
    defaultStructure: any[],
    chapterNumber: number
  ): SlideGenerationConfig[] {
    const slides: SlideGenerationConfig[] = [];
    
    // Use default structure as template, repeat/truncate as needed
    for (let i = 0; i < count; i++) {
      const templateSlide = defaultStructure[i % defaultStructure.length];
      
      slides.push({
        slideType: templateSlide.type as SlideType,
        chapterNumber,
        slideNumber: i + 1,
        role: templateSlide.role,
        duration: templateSlide.duration,
        animationType: templateSlide.animationType,
        threeDConfig: templateSlide.threeD,
        interactiveType: templateSlide.interactiveType,
      });
    }
    
    // Ensure first slide is opener
    if (slides.length > 0) {
      slides[0].role = 'opener';
    }
    
    // Ensure last slide is closer
    if (slides.length > 1) {
      slides[slides.length - 1].role = 'closer';
    }
    
    return slides;
  }
  
  /**
   * Get content fitting config based on output type
   */
  private getContentFittingConfig(outputType: OutputType): ContentFittingConfig {
    if (outputType.includes('video')) {
      return VIDEO_CONTENT_FITTING;
    }
    if (outputType === 'interactive') {
      return INTERACTIVE_CONTENT_FITTING;
    }
    return DEFAULT_CONTENT_FITTING;
  }
  
  /**
   * Adjust resolution for aspect ratio
   */
  private adjustResolutionForAspectRatio(
    baseRes: { width: number; height: number },
    aspectRatio: { widthRatio: number; heightRatio: number }
  ): { width: number; height: number } {
    const targetRatio = aspectRatio.widthRatio / aspectRatio.heightRatio;
    const baseRatio = baseRes.width / baseRes.height;
    
    if (Math.abs(targetRatio - baseRatio) < 0.01) {
      return baseRes;
    }
    
    // Adjust based on target ratio
    if (targetRatio > 1) {
      // Landscape
      return {
        width: baseRes.width,
        height: Math.round(baseRes.width / targetRatio),
      };
    } else {
      // Portrait or square
      return {
        width: Math.round(baseRes.height * targetRatio),
        height: baseRes.height,
      };
    }
  }
  
  /**
   * Get quality setting from resolution
   */
  private getQualityFromResolution(resolution: string): 'draft' | 'standard' | 'high' | 'ultra' {
    switch (resolution) {
      case '720p': return 'standard';
      case '1080p': return 'high';
      case '4k': return 'ultra';
      default: return 'high';
    }
  }
  
  /**
   * Get estimated generation time in seconds
   */
  getEstimatedGenerationTime(config: GenerationPipelineConfig): number {
    const baseTimePerSlide = this.getBaseTimePerSlide(config.outputType);
    let total = config.totalSlides * baseTimePerSlide;
    
    // Add time for voiceover
    if (config.voiceover.enabled) {
      total += config.totalSlides * 5; // ~5s per slide for TTS
    }
    
    // Add time for music
    if (config.music.enabled) {
      total += 30; // ~30s for music generation
    }
    
    // Add time for higher quality
    if (config.render.quality === 'ultra') {
      total *= 1.5;
    }
    
    return Math.ceil(total);
  }
  
  /**
   * Get base generation time per slide based on output type
   */
  private getBaseTimePerSlide(outputType: OutputType): number {
    switch (outputType) {
      case '2d-static': return 8;
      case '2d-animated': return 12;
      case '3d-scene': return 20;
      case '3d-animated': return 30;
      case 'video-intro': return 25;
      case 'video-full': return 30;
      case 'interactive': return 15;
      case 'mixed': return 20;
      default: return 10;
    }
  }
  
  /**
   * Validate output settings
   */
  validateSettings(settings: OutputTypeSettings): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validate slide count
    const totalSlides = settings.structureMode === 'flat'
      ? settings.slideCount
      : settings.chapterCount * settings.slidesPerChapter;
    
    if (totalSlides < 1) {
      errors.push('At least 1 slide is required');
    }
    
    if (totalSlides > 50) {
      errors.push('Maximum 50 slides allowed per generation');
    }
    
    // Validate chapter mode
    if (settings.structureMode === 'chapters') {
      if (settings.chapterCount < 1) {
        errors.push('At least 1 chapter is required');
      }
      if (settings.slidesPerChapter < 1) {
        errors.push('At least 1 slide per chapter is required');
      }
    }
    
    // Validate animation intensity
    if (settings.animationIntensity < 0 || settings.animationIntensity > 100) {
      errors.push('Animation intensity must be between 0 and 100');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }
  
  /**
   * Get default output settings
   */
  getDefaultSettings(suggestedSlideCount: number = 10): OutputTypeSettings {
    return {
      outputType: '2d-static',
      structureMode: 'flat',
      slideCount: suggestedSlideCount,
      chapterCount: 3,
      slidesPerChapter: 4,
      includeVoiceover: false,
      includeMusic: false,
      animationIntensity: 30,
      resolution: '1080p',
      aspectRatio: '16:9',
    };
  }
  
  /**
   * Get max slides allowed for output type
   */
  getMaxSlides(outputType: OutputType): number {
    switch (outputType) {
      case '2d-static': return 50;
      case '2d-animated': return 40;
      case '3d-scene': return 20;
      case '3d-animated': return 15;
      case 'video-intro': return 5;
      case 'video-full': return 30;
      case 'interactive': return 25;
      case 'mixed': return 30;
      default: return 30;
    }
  }
}

export const generationConfigService = new GenerationConfigService();
export default generationConfigService;
