/**
 * AI MEDIA GENERATION SERVICE
 * 
 * Handles image and video generation using various AI providers.
 * Now integrated with unified provider routing for consistent
 * provider selection across the ecosystem.
 */
import { supabase } from '@/integrations/supabase/client';
import { 
  getUnifiedProviderRouting, 
  type ProviderRoute 
} from '@/services/unifiedProviderRoutingAdapter';

// ============================================================================
// TYPES
// ============================================================================

export interface MediaGenerationOptions {
  prompt: string;
  language?: string;
  provider?: string; // Override from central routing
  priorityRendering?: boolean;
  userTier?: string;
}

export interface AvatarGenerationOptions {
  sourceImage: string;
  script?: string;
  audioUrl?: string;
  language?: string;
  provider?: string; // From useRegionalLanguage.avatarProvider
  fullBody?: boolean; // Use full-body avatar (OmniAvatar)
  priorityRendering?: boolean;
}

// ============================================================================
// AI MEDIA SERVICE
// ============================================================================

export class AIMediaService {
  
  /**
   * Get provider routing for current language context
   */
  static getProviderRouting(language: string = 'en') {
    return getUnifiedProviderRouting(language);
  }
  
  // Generate image using OpenAI DALL-E
  static async generateImageWithOpenAI(prompt: string): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-image-generator', {
        body: {
          prompt,
          provider: 'openai',
          model: 'gpt-image-1',
          size: '1024x1024',
          quality: 'high',
          output_format: 'png'
        }
      });

      if (error) throw error;
      return data.imageUrl;
    } catch (error) {
      console.error('Error generating image with OpenAI:', error);
      throw new Error('Failed to generate image with OpenAI');
    }
  }

  // Generate image using HuggingFace
  static async generateImageWithHuggingFace(prompt: string): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-image-generator', {
        body: {
          prompt,
          provider: 'huggingface',
          model: 'black-forest-labs/FLUX.1-schnell'
        }
      });

      if (error) throw error;
      return data.imageUrl;
    } catch (error) {
      console.error('Error generating image with HuggingFace:', error);
      throw new Error('Failed to generate image with HuggingFace');
    }
  }

  // Generate image using Replicate
  static async generateImageWithReplicate(prompt: string): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-image-generator', {
        body: {
          prompt,
          provider: 'replicate',
          model: 'black-forest-labs/flux-schnell'
        }
      });

      if (error) throw error;
      return data.imageUrl;
    } catch (error) {
      console.error('Error generating image with Replicate:', error);
      throw new Error('Failed to generate image with Replicate');
    }
  }

  // Generate video using Replicate
  static async generateVideoWithReplicate(prompt: string): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-video-generator', {
        body: {
          prompt,
          provider: 'replicate',
          model: 'minimax/video-01'
        }
      });

      if (error) throw error;
      return data.videoUrl;
    } catch (error) {
      console.error('Error generating video with Replicate:', error);
      throw new Error('Failed to generate video with Replicate');
    }
  }

  /**
   * Generate video with central routing support
   * Uses provider from useRegionalLanguage or falls back to auto-selection
   */
  static async generateVideoWithRouting(options: MediaGenerationOptions): Promise<string> {
    const { prompt, language = 'en', provider, priorityRendering } = options;
    
    // Get routing for language context
    const routing = this.getProviderRouting(language);
    
    // Determine provider: explicit override > priority rendering > routing
    let selectedProvider = provider;
    if (!selectedProvider) {
      selectedProvider = priorityRendering 
        ? routing.priorityRendering.primary 
        : routing.video.primary;
    }
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-video-generator', {
        body: {
          prompt,
          provider: selectedProvider,
          priorityRendering,
          language,
        }
      });

      if (error) throw error;
      return data.videoUrl;
    } catch (error) {
      console.error(`Error generating video with ${selectedProvider}:`, error);
      
      // Try fallback
      const fallbackProvider = priorityRendering 
        ? routing.priorityRendering.fallback 
        : routing.video.fallback;
        
      if (fallbackProvider && fallbackProvider !== 'none') {
        console.log(`Trying fallback provider: ${fallbackProvider}`);
        return this.generateVideoWithProvider(prompt, fallbackProvider);
      }
      
      throw new Error('Video generation failed');
    }
  }

  /**
   * Generate avatar video with central routing
   * Uses Alibaba Wan2.2 (avatar) or OmniAvatar (full-body)
   */
  static async generateAvatarWithRouting(options: AvatarGenerationOptions): Promise<{
    videoUrl: string;
    provider: string;
    model: string;
  }> {
    const { 
      sourceImage, 
      script, 
      audioUrl, 
      language = 'en', 
      provider,
      fullBody = false,
      priorityRendering = false 
    } = options;
    
    // Get routing
    const routing = this.getProviderRouting(language);
    
    // Select provider based on feature type
    let selectedProvider = provider;
    if (!selectedProvider) {
      if (fullBody) {
        selectedProvider = routing.fullBodyAvatar.primary; // alibaba-omniavatar
      } else {
        selectedProvider = routing.avatar.primary; // alibaba-wan2.2
      }
    }
    
    // Determine model based on provider
    const model = fullBody ? 'omniavatar' : 'wan2.2-s2v';
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-video-generator', {
        body: {
          type: 'avatar',
          sourceImage,
          script,
          audioUrl,
          language,
          provider: selectedProvider,
          model,
          priorityRendering,
          fullBody,
        }
      });

      if (error) throw error;
      
      return {
        videoUrl: data.videoUrl,
        provider: selectedProvider,
        model,
      };
    } catch (error) {
      console.error(`Error generating avatar with ${selectedProvider}:`, error);
      
      // Try fallback (only for regular avatar, not full-body)
      if (!fullBody) {
        const fallbackProvider = routing.avatar.fallback;
        if (fallbackProvider && fallbackProvider !== 'none') {
          console.log(`Trying fallback avatar provider: ${fallbackProvider}`);
          const { data, error: fallbackError } = await supabase.functions.invoke('ai-video-generator', {
            body: {
              type: 'avatar',
              sourceImage,
              script,
              audioUrl,
              language,
              provider: fallbackProvider,
            }
          });
          
          if (!fallbackError) {
            return {
              videoUrl: data.videoUrl,
              provider: fallbackProvider,
              model: 'fallback',
            };
          }
        }
      }
      
      throw new Error(`Avatar generation failed: ${fullBody ? 'Full-body avatar has no fallback' : 'All providers failed'}`);
    }
  }

  // Helper: Generate video with specific provider
  private static async generateVideoWithProvider(prompt: string, provider: string): Promise<string> {
    const { data, error } = await supabase.functions.invoke('ai-video-generator', {
      body: { prompt, provider }
    });
    
    if (error) throw error;
    return data.videoUrl;
  }

  // Fallback: Generate static image when video generation fails
  static async generateImageAsVideoFallback(prompt: string): Promise<string> {
    try {
      console.log('Video generation not available, generating static image instead');
      const imagePrompt = `Static image representation of: ${prompt}. Make it cinematic and dynamic.`;
      return await this.generateImage(imagePrompt);
    } catch (error) {
      console.error('Error generating fallback image:', error);
      throw new Error('Both video and image generation failed');
    }
  }

  // Auto-select best available provider for image generation
  static async generateImage(prompt: string): Promise<string> {
    // Try providers in order of preference
    const providers = [
      () => this.generateImageWithOpenAI(prompt),
      () => this.generateImageWithHuggingFace(prompt),
      () => this.generateImageWithReplicate(prompt)
    ];

    for (const provider of providers) {
      try {
        return await provider();
      } catch (error) {
        console.warn('Provider failed, trying next:', error);
        continue;
      }
    }

    throw new Error('All image generation providers failed');
  }

  // Auto-select best available provider for video generation
  static async generateVideo(prompt: string): Promise<string> {
    try {
      // Try Replicate first for video generation
      return await this.generateVideoWithReplicate(prompt);
    } catch (error) {
      console.warn('Video generation with Replicate failed, falling back to static image:', error);
      // Fallback to generating a static image when video generation fails
      return await this.generateImageAsVideoFallback(prompt);
    }
  }

  // Upload generated media to Supabase Storage
  static async uploadToStorage(
    dataUrl: string, 
    fileName: string, 
    bucket: string = 'generated-media'
  ): Promise<string> {
    try {
      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(`${Date.now()}-${fileName}`, blob, {
          contentType: blob.type,
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading to storage:', error);
      throw new Error('Failed to upload media to storage');
    }
  }

  // Process and store generated content
  static async processGeneratedContent(
    content: string,
    type: 'image' | 'video',
    metadata?: any
  ): Promise<{ url: string; metadata: any }> {
    try {
      let processedUrl = content;
      
      // If it's a data URL, upload to storage
      if (content.startsWith('data:')) {
        const fileName = `generated_${type}_${Date.now()}.${type === 'image' ? 'png' : 'mp4'}`;
        processedUrl = await this.uploadToStorage(content, fileName);
      }

      return {
        url: processedUrl,
        metadata: {
          ...metadata,
          type,
          generatedAt: new Date().toISOString(),
          processed: true
        }
      };
    } catch (error) {
      console.error('Error processing generated content:', error);
      throw error;
    }
  }
}
