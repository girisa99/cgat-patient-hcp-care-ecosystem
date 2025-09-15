/**
 * GEMINI MEDIA SERVICE
 * Handles image and video generation using Google Gemini API
 */
import { supabase } from '@/integrations/supabase/client';

export interface GeminiImageRequest {
  prompt: string;
  aspectRatio?: '1:1' | '16:9' | '9:16';
  style?: 'photographic' | 'digital-art' | 'comic-book' | 'anime' | 'line-art';
  safety?: 'strict' | 'moderate' | 'permissive';
}

export interface GeminiVideoRequest {
  prompt: string;
  duration?: number; // in seconds
  aspectRatio?: '1:1' | '16:9' | '9:16';
  fps?: number;
}

export interface GeminiMediaResponse {
  success: boolean;
  mediaUrl?: string;
  error?: string;
  metadata?: {
    prompt: string;
    model: string;
    timestamp: string;
    processingTime?: number;
  };
}

class GeminiMediaService {
  private async callGeminiEdgeFunction(functionName: string, payload: any): Promise<GeminiMediaResponse> {
    try {
      console.log(`🎨 Calling Gemini ${functionName} with payload:`, payload);
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload
      });

      if (error) {
        console.error(`❌ Gemini ${functionName} error:`, error);
        throw new Error(error.message || `Failed to generate ${functionName.includes('image') ? 'image' : 'video'}`);
      }

      console.log(`✅ Gemini ${functionName} response:`, data);
      
      return {
        success: true,
        mediaUrl: data.mediaUrl || data.imageUrl || data.videoUrl,
        metadata: {
          prompt: payload.prompt,
          model: 'gemini',
          timestamp: new Date().toISOString(),
          processingTime: data.processingTime
        }
      };
    } catch (error: any) {
      console.error(`💥 Gemini ${functionName} failed:`, error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred',
        metadata: {
          prompt: payload.prompt,
          model: 'gemini',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Generate an image using Gemini API
   */
  async generateImage(request: GeminiImageRequest): Promise<GeminiMediaResponse> {
    const payload = {
      prompt: request.prompt,
      aspectRatio: request.aspectRatio || '1:1',
      style: request.style || 'photographic',
      safety: request.safety || 'moderate'
    };

    return this.callGeminiEdgeFunction('gemini-generate-image', payload);
  }

  /**
   * Generate a video using Gemini API
   */
  async generateVideo(request: GeminiVideoRequest): Promise<GeminiMediaResponse> {
    const payload = {
      prompt: request.prompt,
      duration: request.duration || 5,
      aspectRatio: request.aspectRatio || '16:9',
      fps: request.fps || 24
    };

    return this.callGeminiEdgeFunction('gemini-generate-video', payload);
  }

  /**
   * Enhanced image generation with medical/biotech context
   */
  async generateMedicalImage(prompt: string, context?: 'clinical' | 'research' | 'educational'): Promise<GeminiMediaResponse> {
    let enhancedPrompt = prompt;
    
    if (context === 'clinical') {
      enhancedPrompt = `Medical illustration for clinical use: ${prompt}. Professional, accurate, clean medical diagram style.`;
    } else if (context === 'research') {
      enhancedPrompt = `Scientific research visualization: ${prompt}. High-quality scientific illustration with technical accuracy.`;
    } else if (context === 'educational') {
      enhancedPrompt = `Educational medical diagram: ${prompt}. Clear, instructional, anatomically accurate illustration for learning.`;
    }

    return this.generateImage({
      prompt: enhancedPrompt,
      style: 'digital-art',
      aspectRatio: '16:9'
    });
  }

  /**
   * Generate biotech process visualization
   */
  async generateBiotechProcess(processName: string, steps: string[]): Promise<GeminiMediaResponse> {
    const prompt = `Biotech process visualization: ${processName}. Show the following steps in sequence: ${steps.join(', ')}. Scientific diagram style with clear flow arrows and labels.`;
    
    return this.generateImage({
      prompt,
      style: 'digital-art',
      aspectRatio: '16:9'
    });
  }

  /**
   * Generate CAR-T cell therapy visualization
   */
  async generateCARTVisualization(stage: 'collection' | 'modification' | 'expansion' | 'infusion'): Promise<GeminiMediaResponse> {
    const stagePrompts = {
      collection: 'T-cell collection from patient blood via leukapheresis, medical procedure illustration',
      modification: 'Genetic modification of T-cells with CAR in laboratory, scientific process diagram',
      expansion: 'CAR-T cell multiplication and quality control in bioreactor, biotech facility',
      infusion: 'CAR-T cell infusion back to patient, medical treatment illustration'
    };

    return this.generateMedicalImage(stagePrompts[stage], 'clinical');
  }
}

export const geminiMediaService = new GeminiMediaService();
export default geminiMediaService;