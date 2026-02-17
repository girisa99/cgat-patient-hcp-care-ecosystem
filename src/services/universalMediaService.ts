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
   * Enhanced medical image generation with context-aware accuracy
   */
  async generateMedicalImage(prompt: string, context?: 'clinical' | 'research' | 'educational', preferredProvider?: 'gemini' | 'huggingface', userMessage?: string): Promise<MediaResponse> {
    let enhancedPrompt = prompt;
    
    // Extract relevant context from user message for better accuracy
    if (userMessage) {
      const medicalKeywords = this.extractMedicalContext(userMessage);
      if (medicalKeywords.length > 0) {
        enhancedPrompt = `${prompt} showing ${medicalKeywords.join(', ')}`;
      }
    }
    
    if (context === 'clinical') {
      enhancedPrompt = `CLINICAL MEDICAL ILLUSTRATION: ${enhancedPrompt}. Ultra-realistic medical photography style, hospital clinical setting, precise anatomical accuracy, professional medical documentation quality, high-resolution clinical image, medical textbook standard, sterile clinical environment, accurate medical representation`;
    } else if (context === 'research') {
      enhancedPrompt = `SCIENTIFIC RESEARCH VISUALIZATION: ${enhancedPrompt}. Peer-reviewed journal figure quality, technical scientific precision, modern research laboratory, detailed scientific methodology illustration, professional biomedical research diagram, anatomically precise, research-grade visualization`;
    } else if (context === 'educational') {
      enhancedPrompt = `EDUCATIONAL MEDICAL DIAGRAM: ${enhancedPrompt}. Medical school textbook illustration style, clear anatomical labeling, instructional medical diagram, educational healthcare presentation, learning-focused medical visualization, clear and medically accurate`;
    } else {
      enhancedPrompt = `ACCURATE MEDICAL VISUALIZATION: ${enhancedPrompt}. Professional healthcare illustration, medically accurate representation, clear clinical details, healthcare professional quality`;
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
    const prompt = `BIOTECH PROCESS DIAGRAM: ${processName}. Sequential workflow showing: ${steps.join(' → ')}. Ultra-detailed scientific equipment, precise laboratory instrumentation, professional biotech facility, technical accuracy, clear process flow arrows, step-by-step scientific methodology, modern biotechnology laboratory setting, professional scientific illustration style.`;
    
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

  /**
   * Extract medical context from user message for more accurate image generation
   */
  private extractMedicalContext(message: string): string[] {
    const medicalTerms = [
      'CAR-T', 'immunotherapy', 'cell therapy', 'clinical trial', 'FDA approval',
      'cancer treatment', 'biotech', 'pharmaceutical', 'drug development',
      'personalized medicine', 'gene therapy', 'molecular biology', 'oncology',
      'T-cells', 'lymphocytes', 'tumor', 'metastasis', 'chemotherapy',
      'radiation therapy', 'surgical', 'biopsy', 'pathology', 'diagnosis'
    ];
    
    const lowerMessage = message.toLowerCase();
    return medicalTerms.filter(term => lowerMessage.includes(term.toLowerCase()));
  }

  /**
   * Generate context-aware video with improved prompt accuracy
   */
  async generateContextVideo(prompt: string, userMessage: string, context?: 'clinical' | 'research' | 'educational'): Promise<MediaResponse> {
    const medicalContext = this.extractMedicalContext(userMessage);
    let enhancedPrompt = prompt;
    
    if (medicalContext.length > 0) {
      enhancedPrompt = `${prompt} demonstrating ${medicalContext.slice(0, 3).join(', ')}`;
    }
    
    if (context === 'clinical') {
      enhancedPrompt = `CLINICAL PROCEDURE VIDEO: ${enhancedPrompt}. Professional medical procedure demonstration, clinical setting, healthcare professional performing, step-by-step medical process, educational clinical video, accurate medical techniques`;
    } else if (context === 'research') {
      enhancedPrompt = `RESEARCH PROCESS VIDEO: ${enhancedPrompt}. Scientific laboratory procedure, research methodology demonstration, professional laboratory techniques, biotech research process, scientific accuracy`;
    } else {
      enhancedPrompt = `MEDICAL EDUCATIONAL VIDEO: ${enhancedPrompt}. Healthcare education demonstration, clear instructional content, medical learning video, professional healthcare presentation`;
    }
    
    return this.generateVideo({
      prompt: enhancedPrompt,
      provider: 'gemini',
      duration: 15,
      aspectRatio: '16:9'
    });
  }
}

export const universalMediaService = new UniversalMediaService();
export default universalMediaService;