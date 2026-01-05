/**
 * MEDIA PRODUCTION ORCHESTRATOR - Genie Mind
 * End-to-end orchestration for media production pipeline
 * 
 * Flow: [Input] → [Processing] → [Script] → [Media Generation] → [Output]
 * 
 * Coordinates between Genie Mind (intelligence) and Genie Vibe (creative)
 */

import { supabase } from '@/integrations/supabase/client';
import { documentToScriptService, DocumentToScriptRequest, GeneratedScript } from './documentToScriptService';
import { imageToScriptService, ImageToScriptRequest, ImageToScriptResult } from './imageToScriptService';
import { AIMediaService } from './aiMediaService';
import { geminiMediaService } from './geminiMediaService';

export type InputSource = 
  | 'document' 
  | 'image' 
  | 'prompt' 
  | 'url' 
  | 'figma' 
  | 'miro' 
  | 'canva'
  | 'whiteboard';

export type OutputType = 
  | 'video' 
  | 'podcast' 
  | 'presentation' 
  | 'webinar' 
  | 'animation'
  | 'storyboard';

export type PipelineStage = 
  | 'input_processing'
  | 'content_extraction'
  | 'script_generation'
  | 'media_generation'
  | 'post_processing'
  | 'complete'
  | 'failed';

export interface ProductionPipelineConfig {
  // Input configuration
  inputSource: InputSource;
  inputData: {
    content?: string;
    url?: string;
    prompt?: string;
    files?: File[];
  };
  
  // Output configuration
  outputType: OutputType;
  outputOptions?: {
    duration?: number;
    resolution?: '720p' | '1080p' | '4k';
    aspectRatio?: '16:9' | '9:16' | '1:1';
    includeMusic?: boolean;
    voiceOver?: boolean;
    voiceId?: string;
  };
  
  // Processing options
  aiProvider?: 'openai' | 'claude' | 'gemini';
  useKnowledgeBase?: boolean;
  knowledgeBaseId?: string;
  enhanceWithAI?: boolean;
  
  // Style options
  tone?: 'professional' | 'casual' | 'educational' | 'inspirational' | 'dramatic' | 'informative';
  targetAudience?: string;
  branding?: {
    primaryColor?: string;
    logoUrl?: string;
    fontFamily?: string;
  };
}

export interface PipelineProgress {
  stage: PipelineStage;
  progress: number; // 0-100
  message: string;
  startedAt: Date;
  completedAt?: Date;
}

export interface PipelineResult {
  success: boolean;
  pipelineId: string;
  inputSource: InputSource;
  outputType: OutputType;
  
  // Intermediate results
  extractedContent?: any;
  generatedScript?: GeneratedScript;
  
  // Final output
  output?: {
    mediaUrl?: string;
    scriptUrl?: string;
    thumbnailUrl?: string;
    duration?: number;
    metadata?: Record<string, any>;
  };
  
  // Progress tracking
  stages: PipelineProgress[];
  totalDuration: number;
  
  error?: string;
}

class MediaProductionOrchestrator {
  private activePipelines: Map<string, PipelineResult> = new Map();

  /**
   * Execute full production pipeline
   */
  async executePipeline(config: ProductionPipelineConfig): Promise<PipelineResult> {
    const pipelineId = this.generatePipelineId();
    const startTime = Date.now();
    
    const result: PipelineResult = {
      success: false,
      pipelineId,
      inputSource: config.inputSource,
      outputType: config.outputType,
      stages: [],
      totalDuration: 0
    };
    
    this.activePipelines.set(pipelineId, result);
    
    try {
      // Stage 1: Input Processing
      this.updateStage(result, 'input_processing', 0, 'Processing input...');
      
      // Stage 2: Content Extraction
      this.updateStage(result, 'content_extraction', 20, 'Extracting content...');
      const extractedContent = await this.extractContent(config);
      result.extractedContent = extractedContent;
      
      if (!extractedContent) {
        throw new Error('Content extraction failed');
      }
      
      // Stage 3: Script Generation
      this.updateStage(result, 'script_generation', 40, 'Generating script...');
      const script = await this.generateScript(config, extractedContent);
      result.generatedScript = script || undefined;
      
      if (!script) {
        throw new Error('Script generation failed');
      }
      
      // Stage 4: Media Generation
      this.updateStage(result, 'media_generation', 60, 'Generating media...');
      const mediaResult = await this.generateMedia(config, script);
      
      // Stage 5: Post Processing
      this.updateStage(result, 'post_processing', 80, 'Finalizing output...');
      const finalOutput = await this.postProcess(config, script, mediaResult);
      
      result.output = finalOutput;
      result.success = true;
      
      // Complete
      this.updateStage(result, 'complete', 100, 'Pipeline complete!');
      
    } catch (error) {
      console.error('Pipeline execution failed:', error);
      result.error = error instanceof Error ? error.message : 'Pipeline failed';
      this.updateStage(result, 'failed', 0, result.error);
    }
    
    result.totalDuration = Date.now() - startTime;
    return result;
  }

  /**
   * Extract content based on input source
   */
  private async extractContent(config: ProductionPipelineConfig): Promise<any> {
    switch (config.inputSource) {
      case 'document':
        const docResult = await documentToScriptService.convertDocumentToScript({
          documentContent: config.inputData.content,
          documentUrl: config.inputData.url,
          outputFormat: this.mapOutputToFormat(config.outputType),
          duration: config.outputOptions?.duration,
          tone: config.tone,
          targetAudience: config.targetAudience,
          useKnowledgeBase: config.useKnowledgeBase,
          knowledgeBaseId: config.knowledgeBaseId
        });
        return docResult.extractedContent;
        
      case 'image':
        const imageResult = await imageToScriptService.generateImageAndScript({
          imagePrompt: config.inputData.prompt || '',
          existingImageUrl: config.inputData.url,
          scriptStyle: this.mapOutputToScriptStyle(config.outputType),
          duration: config.outputOptions?.duration,
          tone: config.tone,
          targetAudience: config.targetAudience
        });
        return { imageUrl: imageResult.imageUrl, description: imageResult.imageDescription };
        
      case 'prompt':
        return { content: config.inputData.prompt, type: 'prompt' };
        
      case 'url':
        return await this.scrapeUrl(config.inputData.url || '');
        
      case 'figma':
      case 'miro':
      case 'canva':
      case 'whiteboard':
        // Phase 2 - placeholder for design tool integrations
        return { 
          content: config.inputData.content || config.inputData.prompt,
          source: config.inputSource,
          status: 'design_tool_integration_pending'
        };
        
      default:
        return null;
    }
  }

  /**
   * Generate script from extracted content
   */
  private async generateScript(
    config: ProductionPipelineConfig,
    extractedContent: any
  ): Promise<GeneratedScript | null> {
    // If content already includes a script (from document processing)
    if (extractedContent?.script) {
      return extractedContent.script;
    }
    
    // Generate script from content using AI
    const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
      body: {
        provider: config.aiProvider || 'gemini',
        model: 'gemini-2.0-flash-exp',
        prompt: `Generate a ${config.outputType} script from this content:

CONTENT:
${JSON.stringify(extractedContent, null, 2)}

REQUIREMENTS:
- Output type: ${config.outputType}
- Duration: ${config.outputOptions?.duration || 60} seconds
- Tone: ${config.tone || 'professional'}
- Target audience: ${config.targetAudience || 'general'}
- Include voice-over: ${config.outputOptions?.voiceOver !== false}
- Include music: ${config.outputOptions?.includeMusic !== false}

Return a production-ready script in JSON format with scenes, narration, and visual directions.`,
        systemPrompt: 'You are a media production specialist. Generate professional scripts optimized for the specified output format.',
        action: 'generate_script',
        temperature: 0.7,
        maxTokens: 3000
      }
    });
    
    if (error) {
      console.error('Script generation error:', error);
      return null;
    }
    
    try {
      const jsonMatch = data.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as GeneratedScript;
      }
    } catch {
      console.error('Failed to parse script JSON');
    }
    
    return null;
  }

  /**
   * Generate media based on output type
   */
  private async generateMedia(
    config: ProductionPipelineConfig,
    script: GeneratedScript
  ): Promise<any> {
    // Safely extract scenes with null checks
    const scenes = script?.scenes || [];
    if (scenes.length === 0) {
      console.warn('No scenes in script, returning empty media result');
      return { status: 'no_scenes', error: 'Script has no scenes to generate media from' };
    }

    switch (config.outputType) {
      case 'video':
      case 'animation':
        // Generate video frames or animation
        const videoPrompt = scenes
          .map(s => s.visualDirection || s.narration || '')
          .filter(Boolean)
          .join('. ');
        
        if (!videoPrompt) {
          return { status: 'no_content', error: 'No visual content to generate' };
        }
        
        try {
          // Map aspect ratio to supported format
          const aspectRatio = config.outputOptions?.aspectRatio === '9:16' ? '9:16' : 
                             config.outputOptions?.aspectRatio === '1:1' ? '1:1' : '16:9';
          
          const videoResult = await geminiMediaService.generateVideo({
            prompt: videoPrompt.slice(0, 500),
            duration: Math.min(config.outputOptions?.duration || 10, 30), // Cap at 30 seconds
            aspectRatio
          });
          
          if (videoResult.success && videoResult.mediaUrl) {
            return { videoUrl: videoResult.mediaUrl, status: 'video_generated' };
          }
          throw new Error(videoResult.error || 'Video generation failed');
        } catch (videoError) {
          console.warn('Video generation failed, falling back to image:', videoError);
          // Fallback to image generation
          try {
            const imageUrl = await AIMediaService.generateImage(videoPrompt.slice(0, 500));
            return { thumbnailUrl: imageUrl, status: 'image_fallback' };
          } catch {
            return { status: 'generation_failed', error: 'Both video and image generation failed' };
          }
        }
        
      case 'podcast':
        // Audio generation would happen here
        return { 
          status: 'audio_ready_for_tts', 
          scriptPrepared: true,
          totalDuration: script.totalDuration,
          sceneCount: scenes.length
        };
        
      case 'presentation':
        // Generate slides/images for each scene (limit to 5)
        const slidePromises = scenes.slice(0, 5).map(async (scene) => {
          const prompt = scene.visualDirection || `Slide: ${(scene.narration || '').slice(0, 100)}`;
          if (!prompt || prompt === 'Slide: ') return null;
          
          try {
            return await AIMediaService.generateImage(prompt);
          } catch {
            return null;
          }
        });
        
        const slideImages = await Promise.all(slidePromises);
        return { slides: slideImages.filter(Boolean), status: 'slides_generated' };
        
      case 'webinar':
        return { 
          status: 'webinar_script_ready', 
          slides: null,
          segments: scenes.length,
          totalDuration: script.totalDuration
        };
        
      case 'storyboard':
        // Generate storyboard frames (limit to 8)
        const framePromises = scenes.slice(0, 8).map(async (scene, index) => {
          const prompt = `Storyboard frame: ${scene.visualDirection || (scene.narration || '').slice(0, 100)}`;
          
          try {
            const imageUrl = await AIMediaService.generateImage(prompt);
            return { 
              scene: scene.sceneNumber || index + 1, 
              imageUrl, 
              narration: scene.narration || '' 
            };
          } catch {
            return { 
              scene: scene.sceneNumber || index + 1, 
              narration: scene.narration || '',
              error: 'Image generation failed'
            };
          }
        });
        
        const frames = await Promise.all(framePromises);
        return { storyboardFrames: frames, status: 'storyboard_generated' };
        
      default:
        console.warn(`Unknown output type: ${config.outputType}`);
        return { status: 'unknown_output_type', error: `Unsupported output type: ${config.outputType}` };
    }
  }

  /**
   * Post-process and finalize output
   */
  private async postProcess(
    config: ProductionPipelineConfig,
    script: GeneratedScript,
    mediaResult: any
  ): Promise<PipelineResult['output']> {
    return {
      mediaUrl: mediaResult?.videoUrl || mediaResult?.slides?.[0],
      thumbnailUrl: mediaResult?.thumbnailUrl || mediaResult?.slides?.[0],
      duration: script.totalDuration,
      metadata: {
        scenes: script.scenes.length,
        wordCount: script.metadata.wordCount,
        outputType: config.outputType,
        inputSource: config.inputSource,
        generatedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Scrape URL for content
   */
  private async scrapeUrl(url: string): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          provider: 'gemini',
          prompt: `Analyze and summarize the content from this URL for video production: ${url}`,
          systemPrompt: 'Extract key information, main points, and suggested visuals from web content.',
          action: 'analyze_url',
          context: { url }
        }
      });
      
      if (error) throw error;
      return { url, content: data.content, type: 'url_content' };
    } catch (error) {
      console.error('URL scraping failed:', error);
      return { url, content: null, error: 'scraping_failed' };
    }
  }

  /**
   * Update pipeline stage
   */
  private updateStage(
    result: PipelineResult,
    stage: PipelineStage,
    progress: number,
    message: string
  ): void {
    const stageProgress: PipelineProgress = {
      stage,
      progress,
      message,
      startedAt: new Date()
    };
    
    // Complete previous stage
    if (result.stages.length > 0) {
      result.stages[result.stages.length - 1].completedAt = new Date();
    }
    
    result.stages.push(stageProgress);
  }

  /**
   * Map output type to document format
   */
  private mapOutputToFormat(outputType: OutputType) {
    const mapping: Record<OutputType, any> = {
      video: 'video_script',
      podcast: 'podcast_script',
      presentation: 'presentation_script',
      webinar: 'webinar_script',
      animation: 'video_script',
      storyboard: 'video_script'
    };
    return mapping[outputType];
  }

  /**
   * Map output type to script style
   */
  private mapOutputToScriptStyle(outputType: OutputType) {
    const mapping: Record<OutputType, any> = {
      video: 'narration',
      podcast: 'narration',
      presentation: 'presentation',
      webinar: 'educational',
      animation: 'narration',
      storyboard: 'documentary'
    };
    return mapping[outputType];
  }

  /**
   * Generate unique pipeline ID
   */
  private generatePipelineId(): string {
    return `pipeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get pipeline status
   */
  getPipelineStatus(pipelineId: string): PipelineResult | null {
    return this.activePipelines.get(pipelineId) || null;
  }

  /**
   * Get all active pipelines
   */
  getActivePipelines(): PipelineResult[] {
    return Array.from(this.activePipelines.values());
  }

  /**
   * Cancel pipeline
   */
  cancelPipeline(pipelineId: string): boolean {
    const pipeline = this.activePipelines.get(pipelineId);
    if (pipeline && pipeline.stages[pipeline.stages.length - 1]?.stage !== 'complete') {
      this.updateStage(pipeline, 'failed', 0, 'Pipeline cancelled by user');
      return true;
    }
    return false;
  }
}

export const mediaProductionOrchestrator = new MediaProductionOrchestrator();
