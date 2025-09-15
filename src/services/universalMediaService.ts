/**
 * UNIVERSAL MEDIA SERVICE
 * Supports both Gemini and Hugging Face for image/video generation
 */
import { supabase } from '@/integrations/supabase/client';

export interface MediaRequest {
  prompt: string;
  provider?: 'gemini' | 'huggingface';
  aspectRatio?: '1:1' | '16:9' | '9:16';
  style?: 'photographic' | 'digital-art' | 'comic-book' | 'anime' | 'line-art';
  model?: string;
  safety?: 'strict' | 'moderate' | 'permissive';
}

export interface VideoRequest {
  prompt: string;
  provider?: 'gemini' | 'huggingface';
  duration?: number;
  aspectRatio?: '1:1' | '16:9' | '9:16';
  fps?: number;
}

export interface MediaResponse {
  success: boolean;
  mediaUrl?: string;
  error?: string;
  provider: 'gemini' | 'huggingface';
  metadata?: {
    prompt: string;
    model: string;
    timestamp: string;
    processingTime?: number;
  };
}

class UniversalMediaService {
  private async callEdgeFunction(functionName: string, payload: any): Promise<MediaResponse> {
    try {
      console.log(`🎨 Calling ${functionName} with payload:`, payload);
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload
      });

      if (error) {
        console.error(`❌ ${functionName} error:`, error);
        throw new Error(error.message || `Failed to generate media`);
      }

      console.log(`✅ ${functionName} response:`, data);
      
      return {
        success: true,
        mediaUrl: data.mediaUrl || data.imageUrl || data.videoUrl || data.image,
        provider: functionName.includes('gemini') ? 'gemini' : 'huggingface',
        metadata: {
          prompt: payload.prompt,
          model: data.model || (functionName.includes('gemini') ? 'gemini' : 'huggingface'),
          timestamp: new Date().toISOString(),
          processingTime: data.processingTime
        }
      };
    } catch (error: any) {
      console.error(`💥 ${functionName} failed:`, error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred',
        provider: functionName.includes('gemini') ? 'gemini' : 'huggingface',
        metadata: {
          prompt: payload.prompt,
          model: 'unknown',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Generate an image using the specified provider (Gemini or Hugging Face)
   */
  async generateImage(request: MediaRequest): Promise<MediaResponse> {
    const provider = request.provider || 'huggingface'; // Default to Hugging Face since it's faster
    
    if (provider === 'gemini') {
      const payload = {
        prompt: request.prompt,
        aspectRatio: request.aspectRatio || '1:1',
        style: request.style || 'photographic',
        safety: request.safety || 'moderate'
      };
      return this.callEdgeFunction('gemini-generate-image', payload);
    } else {
      // Hugging Face image generation
      const payload = {
        prompt: request.prompt,
        model: request.model || 'black-forest-labs/FLUX.1-schnell'
      };
      return this.callEdgeFunction('ai-image-generator', payload);
    }
  }

  /**
   * Generate a video using the specified provider
   */
  async generateVideo(request: VideoRequest): Promise<MediaResponse> {
    const provider = request.provider || 'gemini';
    
    if (provider === 'gemini') {
      const payload = {
        prompt: request.prompt,
        duration: request.duration || 5,
        aspectRatio: request.aspectRatio || '16:9',
        fps: request.fps || 24
      };
      return this.callEdgeFunction('gemini-generate-video', payload);
    } else {
      // Hugging Face doesn't support video generation yet
      return {
        success: false,
        error: 'Video generation not supported by Hugging Face provider',
        provider: 'huggingface',
        metadata: {
          prompt: request.prompt,
          model: 'huggingface',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Smart image generation - tries Hugging Face first (faster), falls back to Gemini
   */
  async generateImageSmart(prompt: string, options?: Partial<MediaRequest>): Promise<MediaResponse> {
    // Try Hugging Face first (faster)
    let result = await this.generateImage({
      prompt,
      provider: 'huggingface',
      ...options
    });

    // If Hugging Face fails, try Gemini
    if (!result.success) {
      console.log('🔄 Hugging Face failed, trying Gemini...');
      result = await this.generateImage({
        prompt,
        provider: 'gemini',
        ...options
      });
    }

    return result;
  }

  /**
   * Enhanced medical image generation with provider fallback
   */
  async generateMedicalImage(prompt: string, context?: 'clinical' | 'research' | 'educational', preferredProvider?: 'gemini' | 'huggingface'): Promise<MediaResponse> {
    let enhancedPrompt = prompt;
    
    if (context === 'clinical') {
      enhancedPrompt = `Medical illustration for clinical use: ${prompt}. Professional, accurate, clean medical diagram style.`;
    } else if (context === 'research') {
      enhancedPrompt = `Scientific research visualization: ${prompt}. High-quality scientific illustration with technical accuracy.`;
    } else if (context === 'educational') {
      enhancedPrompt = `Educational medical diagram: ${prompt}. Clear, instructional, anatomically accurate illustration for learning.`;
    }

    if (preferredProvider) {
      return this.generateImage({
        prompt: enhancedPrompt,
        provider: preferredProvider,
        style: 'digital-art',
        aspectRatio: '16:9'
      });
    } else {
      return this.generateImageSmart(enhancedPrompt, {
        style: 'digital-art',
        aspectRatio: '16:9'
      });
    }
  }

  /**
   * Generate biotech process visualization with smart provider selection
   */
  async generateBiotechProcess(processName: string, steps: string[], preferredProvider?: 'gemini' | 'huggingface'): Promise<MediaResponse> {
    const prompt = `Biotech process visualization: ${processName}. Show the following steps in sequence: ${steps.join(', ')}. Scientific diagram style with clear flow arrows and labels.`;
    
    if (preferredProvider) {
      return this.generateImage({
        prompt,
        provider: preferredProvider,
        style: 'digital-art',
        aspectRatio: '16:9'
      });
    } else {
      return this.generateImageSmart(prompt, {
        style: 'digital-art',
        aspectRatio: '16:9'
      });
    }
  }

  /**
   * Generate CAR-T cell therapy visualization with smart provider selection
   */
  async generateCARTVisualization(stage: 'collection' | 'modification' | 'expansion' | 'infusion', preferredProvider?: 'gemini' | 'huggingface'): Promise<MediaResponse> {
    const stagePrompts = {
      collection: 'T-cell collection from patient blood via leukapheresis, medical procedure illustration',
      modification: 'Genetic modification of T-cells with CAR in laboratory, scientific process diagram',
      expansion: 'CAR-T cell multiplication and quality control in bioreactor, biotech facility',
      infusion: 'CAR-T cell infusion back to patient, medical treatment illustration'
    };

    return this.generateMedicalImage(stagePrompts[stage], 'clinical', preferredProvider);
  }
}

export const universalMediaService = new UniversalMediaService();
export default universalMediaService;