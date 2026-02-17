/**
 * OUTPUT-AWARE GENERATION SERVICE
 * 
 * Connects outputConfig, visualConfig, contentFittingConfig, and AUDIO CONFIG
 * to the actual generation process for slide rendering decisions.
 * 
 * Audio Integration:
 * - Determines when TTS/voiceover is needed based on output type
 * - Syncs voice provider with language and output requirements
 * - Coordinates background music and SFX generation
 */

import { 
  OutputConfig, 
  VisualConfig, 
  ContentFittingConfig,
  GeneratedSlide,
  PresentationRequest,
} from '@/services/universalPresentationService';
import { 
  GenerationPipelineConfig, 
  generationConfigService 
} from '@/services/generationConfigService';
import { OutputType, SlideType } from '../types';
import { getOutputById, ExpandedOutputConfig } from '../constants/expandedOutputTypes';

// ============================================
// TYPES
// ============================================

export interface OutputAwareSlideContent {
  text: string;
  truncated: boolean;
  originalLength: number;
  fittingApplied: boolean;
}

// Audio Configuration for generation
export interface AudioGenerationConfig {
  enabled: boolean;
  voiceProvider: string;
  voiceId: string;
  voiceSettings: {
    speed: number;
    pitch: number;
    stability: number;
    clarity: number;
  };
  backgroundMusic: {
    enabled: boolean;
    genre?: string;
    mood?: string;
    volume: number;
  };
  sfx: {
    enabled: boolean;
    transitionSounds: boolean;
    ambientSounds: boolean;
  };
  pauseBetweenSlides: number;
  languageCode: string;
}

// Audio output for a slide
export interface SlideAudioOutput {
  voiceoverUrl?: string;
  voiceoverDuration?: number;
  backgroundMusicUrl?: string;
  sfxUrls?: string[];
  script: string;
  language: string;
}

export interface HybridRenderOutput {
  imageLayer: {
    url: string;
    format: 'png' | 'webp';
    textFree: boolean;
  };
  svgLayer?: {
    content: string;
    elements: SvgElement[];
  };
  audioLayer?: SlideAudioOutput;
  combined?: string;
}

export interface SvgElement {
  id: string;
  type: 'text' | 'shape' | 'chart' | 'icon';
  content: string;
  editable: boolean;
  position: { x: number; y: number };
  style: Record<string, string>;
}

export interface ContentFitResult {
  title: OutputAwareSlideContent;
  subtitle?: OutputAwareSlideContent;
  bullets: OutputAwareSlideContent[];
  hasOverflow: boolean;
  suggestions: string[];
}

export interface SlideRenderDecision {
  slideType: SlideType;
  useHybridRendering: boolean;
  generateTextFreeImage: boolean;
  applySvgOverlay: boolean;
  exportFormat: 'png' | 'svg' | 'webp' | 'pdf';
  contentFitting: ContentFitResult;
  // Audio decisions
  audioConfig?: {
    requiresVoiceover: boolean;
    voiceProvider: string;
    voiceId: string;
    generateBackgroundMusic: boolean;
    generateSFX: boolean;
    script: string;
  };
  specialRendering?: {
    type: '3d' | 'video' | 'interactive' | 'animated';
    config: Record<string, any>;
  };
}

// ============================================
// SERVICE CLASS
// ============================================

class OutputAwareGenerationService {
  
  /**
   * Build rendering decisions for a slide based on output config
   * Now includes audio configuration for video/animated outputs
   */
  buildSlideRenderDecision(
    slide: GeneratedSlide,
    pipelineConfig: GenerationPipelineConfig,
    audioConfig?: AudioGenerationConfig
  ): SlideRenderDecision {
    const { visual, contentFitting, outputType } = pipelineConfig;
    
    // Apply content fitting
    const fittedContent = this.applyContentFitting(slide, contentFitting);
    
    // Determine rendering strategy based on output type
    const useHybridRendering = this.shouldUseHybridRendering(outputType, visual);
    const generateTextFreeImage = visual.generateTextFreeImages && useHybridRendering;
    const applySvgOverlay = visual.svgOverlayEnabled && useHybridRendering;
    
    // Determine export format
    const exportFormat = this.determineExportFormat(outputType, visual);
    
    // Check for special rendering needs
    const specialRendering = this.getSpecialRenderingConfig(outputType, slide);
    
    // Build audio config if needed
    const slideAudioConfig = this.buildSlideAudioConfig(slide, outputType, audioConfig);
    
    return {
      slideType: slide.type as SlideType,
      useHybridRendering,
      generateTextFreeImage,
      applySvgOverlay,
      exportFormat,
      contentFitting: fittedContent,
      audioConfig: slideAudioConfig,
      specialRendering,
    };
  }
  
  /**
   * Build audio configuration for a slide based on output type requirements
   */
  buildSlideAudioConfig(
    slide: GeneratedSlide,
    outputType: OutputType,
    audioConfig?: AudioGenerationConfig
  ): SlideRenderDecision['audioConfig'] | undefined {
    // Get output config to check if voice is required
    const outputDef = getOutputById(outputType as any);
    
    // Skip audio if not enabled or output doesn't support it
    if (!audioConfig?.enabled) {
      return undefined;
    }
    
    // Check if this output type has voice models
    const hasVoiceSupport = outputDef?.voiceModels && outputDef.voiceModels.length > 0;
    const requiresVoice = outputDef?.requiresVoice || false;
    
    // Generate script from slide content
    const script = this.generateSlideScript(slide);
    
    // Determine if we should generate voiceover
    const shouldGenerateVoice = audioConfig.enabled && (requiresVoice || hasVoiceSupport);
    
    if (!shouldGenerateVoice) {
      return undefined;
    }
    
    return {
      requiresVoiceover: requiresVoice,
      voiceProvider: audioConfig.voiceProvider,
      voiceId: audioConfig.voiceId,
      generateBackgroundMusic: audioConfig.backgroundMusic.enabled,
      generateSFX: audioConfig.sfx.enabled,
      script,
    };
  }
  
  /**
   * Generate narration script from slide content
   */
  generateSlideScript(slide: GeneratedSlide): string {
    const parts: string[] = [];
    
    // Add title with natural pause
    if (slide.title) {
      parts.push(slide.title);
    }
    
    // Add subtitle
    if (slide.subtitle) {
      parts.push(slide.subtitle);
    }
    
    // Add bullet points as narration
    if (slide.content?.bullets && Array.isArray(slide.content.bullets)) {
      slide.content.bullets.forEach((bullet: unknown) => {
        const text = typeof bullet === 'string' ? bullet : (bullet as any)?.text || String(bullet);
        parts.push(text);
      });
    }
    
    // Add speaker notes if available (preferred for narration)
    if (slide.speakerNotes) {
      // Speaker notes often contain the full narration - use them instead
      return slide.speakerNotes;
    }
    
    return parts.join('. ');
  }
  
  /**
   * Get recommended voice models for an output type
   */
  getRecommendedVoiceModels(outputType: OutputType): string[] {
    const outputDef = getOutputById(outputType as any);
    return outputDef?.voiceModels || [];
  }
  
  /**
   * Check if output type requires audio generation
   */
  outputRequiresAudio(outputType: OutputType): boolean {
    const outputDef = getOutputById(outputType as any);
    return outputDef?.requiresVoice || false;
  }
  
  /**
   * Get audio capabilities for an output type
   */
  getAudioCapabilities(outputType: OutputType): {
    supportsVoiceover: boolean;
    supportsBackgroundMusic: boolean;
    supportsSFX: boolean;
    recommendedProviders: string[];
  } {
    const outputDef = getOutputById(outputType as any);
    
    const supportsVoiceover = (outputDef?.voiceModels?.length || 0) > 0;
    const isVideo = outputDef?.category === 'video' || outputDef?.requiresVideo;
    const is3D = outputDef?.category === '3d' || outputDef?.requires3D;
    const isImmersive = outputDef?.category === 'immersive';
    
    return {
      supportsVoiceover,
      supportsBackgroundMusic: isVideo || isImmersive,
      supportsSFX: isVideo || is3D || isImmersive,
      recommendedProviders: outputDef?.voiceModels || [],
    };
  }
  
  /**
   * Apply content fitting rules to prevent overflow
   */
  applyContentFitting(
    slide: GeneratedSlide,
    config: ContentFittingConfig
  ): ContentFitResult {
    const title = this.fitText(slide.title, config.maxTitleLength, config.autoTruncate);
    const subtitle = slide.subtitle 
      ? this.fitText(slide.subtitle, config.maxSubtitleLength, config.autoTruncate)
      : undefined;
    
    let bullets: OutputAwareSlideContent[] = [];
    let hasOverflow = false;
    const suggestions: string[] = [];
    
    if (slide.content?.bullets) {
      // Limit bullet count
      const bulletArray = slide.content.bullets.slice(0, config.maxBulletsPerSlide);
      
      if (slide.content.bullets.length > config.maxBulletsPerSlide) {
        hasOverflow = true;
        suggestions.push(
          `Content was reduced from ${slide.content.bullets.length} to ${config.maxBulletsPerSlide} bullet points`
        );
      }
      
      bullets = bulletArray.map(bullet => {
        const text = typeof bullet === 'string' ? bullet : (bullet as any)?.text || String(bullet);
        return this.fitText(text, config.maxBulletLength, config.autoTruncate);
      });
    }
    
    // Check title overflow
    if (title.truncated) {
      hasOverflow = true;
      suggestions.push('Title was truncated for better display');
    }
    
    return {
      title,
      subtitle,
      bullets,
      hasOverflow,
      suggestions,
    };
  }
  
  /**
   * Fit text to max length
   */
  private fitText(text: string, maxLength: number, autoTruncate: boolean): OutputAwareSlideContent {
    const originalLength = text.length;
    
    if (text.length <= maxLength) {
      return {
        text,
        truncated: false,
        originalLength,
        fittingApplied: false,
      };
    }
    
    if (!autoTruncate) {
      return {
        text,
        truncated: false,
        originalLength,
        fittingApplied: false,
      };
    }
    
    // Smart truncation - try to end at word boundary
    let truncated = text.slice(0, maxLength - 3);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > maxLength * 0.7) {
      truncated = truncated.slice(0, lastSpace);
    }
    
    return {
      text: truncated + '...',
      truncated: true,
      originalLength,
      fittingApplied: true,
    };
  }
  
  /**
   * Determine if hybrid rendering should be used
   */
  private shouldUseHybridRendering(outputType: OutputType, visual: VisualConfig): boolean {
    // 3D outputs don't use hybrid rendering
    if (outputType === '3d-scene' || outputType === '3d-animated') {
      return false;
    }
    
    return visual.useHybridRendering;
  }
  
  /**
   * Determine export format based on output type
   */
  private determineExportFormat(
    outputType: OutputType, 
    visual: VisualConfig
  ): 'png' | 'svg' | 'webp' | 'pdf' {
    // For interactive, prefer SVG for editability
    if (outputType === 'interactive') {
      return 'svg';
    }
    
    // For animated, prefer WebP for animation support
    if (outputType === '2d-animated') {
      return 'webp';
    }
    
    // For video, use PNG for frame quality
    if (outputType === 'video-intro' || outputType === 'video-full') {
      return 'png';
    }
    
    return visual.primaryFormat as 'png' | 'svg' | 'webp' | 'pdf';
  }
  
  /**
   * Get special rendering configuration for 3D, video, interactive
   */
  private getSpecialRenderingConfig(
    outputType: OutputType,
    slide: GeneratedSlide
  ): SlideRenderDecision['specialRendering'] | undefined {
    switch (outputType) {
      case '3d-scene':
        return {
          type: '3d',
          config: {
            sceneType: 'static',
            cameraPath: 'orbit',
            lighting: 'studio',
            physics: false,
          },
        };
        
      case '3d-animated':
        return {
          type: '3d',
          config: {
            sceneType: 'animated',
            cameraPath: 'dynamic',
            lighting: 'studio',
            physics: true,
            particleEffects: true,
          },
        };
        
      case 'video-intro':
      case 'video-full':
        return {
          type: 'video',
          config: {
            fps: 30,
            codec: 'h264',
            transitionType: 'fade',
            includeAudio: true,
          },
        };
        
      case 'interactive':
        return {
          type: 'interactive',
          config: {
            clickable: true,
            hoverEffects: true,
            navigationEnabled: true,
          },
        };
        
      case '2d-animated':
        return {
          type: 'animated',
          config: {
            animationType: 'entrance',
            duration: 500,
            easing: 'ease-out',
          },
        };
        
      default:
        return undefined;
    }
  }
  
  /**
   * Generate hybrid PNG + SVG + Audio output
   */
  async generateHybridOutput(
    slide: GeneratedSlide,
    renderDecision: SlideRenderDecision,
    imageUrl: string,
    audioOutput?: SlideAudioOutput
  ): Promise<HybridRenderOutput> {
    const output: HybridRenderOutput = {
      imageLayer: {
        url: imageUrl,
        format: renderDecision.exportFormat === 'webp' ? 'webp' : 'png',
        textFree: renderDecision.generateTextFreeImage,
      },
    };
    
    // Generate SVG overlay if enabled
    if (renderDecision.applySvgOverlay) {
      output.svgLayer = this.generateSvgOverlay(slide, renderDecision);
    }
    
    // Add audio layer if provided
    if (audioOutput) {
      output.audioLayer = audioOutput;
    }
    
    return output;
  }
  
  /**
   * Generate SVG overlay with editable text elements
   */
  private generateSvgOverlay(
    slide: GeneratedSlide,
    renderDecision: SlideRenderDecision
  ): HybridRenderOutput['svgLayer'] {
    const elements: SvgElement[] = [];
    const { contentFitting } = renderDecision;
    
    // Title element
    elements.push({
      id: `${slide.id}-title`,
      type: 'text',
      content: contentFitting.title.text,
      editable: true,
      position: { x: 50, y: 50 },
      style: {
        fontSize: '32px',
        fontWeight: 'bold',
        fill: '#ffffff',
        textAnchor: 'middle',
      },
    });
    
    // Subtitle element
    if (contentFitting.subtitle) {
      elements.push({
        id: `${slide.id}-subtitle`,
        type: 'text',
        content: contentFitting.subtitle.text,
        editable: true,
        position: { x: 50, y: 80 },
        style: {
          fontSize: '18px',
          fill: '#cccccc',
          textAnchor: 'middle',
        },
      });
    }
    
    // Bullet elements
    contentFitting.bullets.forEach((bullet, index) => {
      elements.push({
        id: `${slide.id}-bullet-${index}`,
        type: 'text',
        content: `• ${bullet.text}`,
        editable: true,
        position: { x: 50, y: 150 + (index * 40) },
        style: {
          fontSize: '16px',
          fill: '#ffffff',
          textAnchor: 'start',
        },
      });
    });
    
    // Generate SVG content
    const svgContent = this.buildSvgContent(elements);
    
    return {
      content: svgContent,
      elements,
    };
  }
  
  /**
   * Build SVG string from elements
   */
  private buildSvgContent(elements: SvgElement[]): string {
    const elementsSvg = elements.map(el => {
      const styleStr = Object.entries(el.style)
        .map(([k, v]) => `${this.camelToKebab(k)}: ${v}`)
        .join('; ');
      
      return `<text 
        id="${el.id}" 
        x="${el.position.x}%" 
        y="${el.position.y}" 
        style="${styleStr}"
        data-editable="${el.editable}"
      >${el.content}</text>`;
    }).join('\n');
    
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080">
      ${elementsSvg}
    </svg>`;
  }
  
  /**
   * Convert camelCase to kebab-case
   */
  private camelToKebab(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }
  
  /**
   * Validate content against fitting rules
   */
  validateContentFitting(
    slide: GeneratedSlide,
    config: ContentFittingConfig
  ): { valid: boolean; violations: string[] } {
    const violations: string[] = [];
    
    if (slide.title.length > config.maxTitleLength) {
      violations.push(`Title exceeds ${config.maxTitleLength} characters`);
    }
    
    if (slide.subtitle && slide.subtitle.length > config.maxSubtitleLength) {
      violations.push(`Subtitle exceeds ${config.maxSubtitleLength} characters`);
    }
    
    if (slide.content?.bullets) {
      if (slide.content.bullets.length > config.maxBulletsPerSlide) {
        violations.push(`Too many bullets (${slide.content.bullets.length} > ${config.maxBulletsPerSlide})`);
      }
      
      slide.content.bullets.forEach((bullet: unknown, i: number) => {
        const text = typeof bullet === 'string' ? bullet : (bullet as any)?.text || String(bullet);
        if (text.length > config.maxBulletLength) {
          violations.push(`Bullet ${i + 1} exceeds ${config.maxBulletLength} characters`);
        }
      });
    }
    
    return {
      valid: violations.length === 0,
      violations,
    };
  }
}

export const outputAwareGenerationService = new OutputAwareGenerationService();
export default outputAwareGenerationService;
